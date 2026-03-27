import logger from '../lib/logger.js';
import PDFDocument from 'pdfkit';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import type { Profile, QuizResult } from '../types/database.js';

// @ts-ignore — arabic-reshaper has no type declarations
import ArabicReshaper from 'arabic-reshaper';

// ── Arabic font cache ──
let _arabicFontCache: Buffer | null = null;

/**
 * Reshape Arabic text for PDFKit rendering.
 * 1. Converts regular Arabic (U+0600-U+06FF) → Presentation Forms B (U+FE70-U+FEFF)
 *    so PDFKit renders connected glyphs correctly.
 * 2. Reverses the character sequence so PDFKit's left-to-right renderer
 *    produces the correct right-to-left visual order.
 */
function reshapeArabic(text: string): string {
  if (!text) return text;
  try {
    const reshaped = ArabicReshaper.convertArabic(text);
    return reshaped
      .split('\n')
      .map((line: string) => line.split(' ').reverse().join(' '))
      .join('\n');
  }
  catch { return text; }
}

function getLocalFontPath(): string {
  if (typeof __dirname !== 'undefined') {
    return join(__dirname, 'fonts', 'NotoSansArabic-Regular.ttf');
  }
  return join(process.cwd(), 'dist', 'fonts', 'NotoSansArabic-Regular.ttf');
}

async function getArabicFontBuffer(): Promise<Buffer | null> {
  if (_arabicFontCache) return _arabicFontCache;
  try {
    const localPath = getLocalFontPath();
    if (existsSync(localPath)) {
      _arabicFontCache = readFileSync(localPath);
      logger.info('Arabic font loaded from local file: %s', localPath);
      return _arabicFontCache;
    }
  } catch (err) {
    logger.warn({ err: err as Error }, 'Failed to load local Arabic font');
  }
  const urls = [
    'https://raw.githubusercontent.com/google/fonts/main/ofl/notosansarabic/NotoSansArabic%5Bwdth%2Cwght%5D.ttf',
    'https://github.com/googlefonts/noto-fonts/raw/main/hinted/ttf/NotoSansArabic/NotoSansArabic-Regular.ttf',
  ];
  for (const url of urls) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      _arabicFontCache = Buffer.from(await res.arrayBuffer());
      logger.info('Arabic font downloaded: %s', url);
      return _arabicFontCache;
    } catch (err) {
      logger.warn({ err: err as Error }, `CDN font fetch failed (${url})`);
    }
  }
  logger.error('All Arabic font sources failed');
  return null;
}

// ── Public types ──
export interface ReportData {
  profile: Profile;
  mindResults: QuizResult[];
  oralResults: QuizResult[];
  academicResults: QuizResult[];
  generatedAt: Date;
}

// ── Color palette ──
const C = {
  primary:     '#4f46e5',
  primaryLt:   '#eef2ff',
  secondary:   '#7c3aed',
  secondaryLt: '#f5f3ff',
  emerald:     '#059669',
  emeraldLt:   '#ecfdf5',
  success:     '#16a34a',
  successLt:   '#f0fdf4',
  warning:     '#d97706',
  warningLt:   '#fffbeb',
  danger:      '#dc2626',
  dangerLt:    '#fef2f2',
  blue:        '#2563eb',
  blueLt:      '#eff6ff',
  gray50:      '#f9fafb',
  gray100:     '#f3f4f6',
  gray200:     '#e5e7eb',
  gray400:     '#9ca3af',
  gray500:     '#6b7280',
  gray700:     '#374151',
  gray900:     '#111827',
  white:       '#ffffff',
};

function perfLevel(pct: number) {
  if (pct >= 90) return { label: 'Excellent',        labelAr: reshapeArabic('ممتاز'),       color: C.success, bg: C.successLt };
  if (pct >= 75) return { label: 'Good',             labelAr: reshapeArabic('جيد'),         color: C.blue,    bg: C.blueLt };
  if (pct >= 60) return { label: 'Satisfactory',     labelAr: reshapeArabic('مرضي'),       color: C.warning, bg: C.warningLt };
  return               { label: 'Needs Improvement', labelAr: reshapeArabic('يحتاج تحسين'), color: C.danger,  bg: C.dangerLt };
}

function parseAdditionalData(data: any): Record<string, any> | null {
  if (!data) return null;
  if (typeof data === 'string') { try { return JSON.parse(data); } catch { return null; } }
  return data;
}

function attnLabelEn(pct: number) {
  if (pct >= 75) return 'Strong Focus';
  if (pct >= 60) return 'Moderate Focus';
  return 'Developing Focus';
}
function attnLabelAr(pct: number) {
  if (pct >= 75) return reshapeArabic('تركيز قوي');
  if (pct >= 60) return reshapeArabic('تركيز متوسط');
  return reshapeArabic('تركيز قيد التطوير');
}

const styleEn: Record<string, string> = {
  visual: 'Visual Learner', auditory: 'Auditory Learner',
  'reading-writing': 'Reading/Writing Learner', kinesthetic: 'Kinesthetic Learner',
};
const styleAr: Record<string, string> = {
  visual: reshapeArabic('متعلم بصري'), auditory: reshapeArabic('متعلم سمعي'),
  'reading-writing': reshapeArabic('متعلم قرائي/كتابي'), kinesthetic: reshapeArabic('متعلم حركي'),
};

const subNameEn: Record<string, string> = {
  attention: 'Attention & Focus', memory: 'Memory & Recall',
  'learning-style': 'Learning Style', 'critical-thinking': 'Critical Thinking',
  perception: 'Visual Perception', 'oral-language': 'Oral Language',
  reading: 'Reading Skills', phonics: 'Beginning and Ending Sounds',
  'phonics-awareness': 'Beginning and Ending Sounds', 'blending-segmenting': 'Blending & Segmenting',
  writing: 'Writing Skills', vocabulary: 'Vocabulary', spelling: 'Spelling',
};
const subNameAr: Record<string, string> = {
  attention: reshapeArabic('الانتباه والتركيز'), memory: reshapeArabic('الذاكرة والاسترجاع'),
  'learning-style': reshapeArabic('أسلوب التعلم'), 'critical-thinking': reshapeArabic('التفكير النقدي'),
  perception: reshapeArabic('الإدراك البصري'), 'oral-language': reshapeArabic('اللغة الشفهية'),
  reading: reshapeArabic('مهارات القراءة'), phonics: reshapeArabic('أصوات البداية والنهاية'),
  'phonics-awareness': reshapeArabic('أصوات البداية والنهاية'), 'blending-segmenting': reshapeArabic('الدمج والتقسيم'),
  writing: reshapeArabic('مهارات الكتابة'), vocabulary: reshapeArabic('المفردات'), spelling: reshapeArabic('الإملاء'),
};

// ═════ Helpers ═════

function groupBySub(results: QuizResult[]) {
  const map: Record<string, QuizResult[]> = {};
  for (const r of results) {
    (map[r.subcategory] ??= []).push(r);
  }
  return map;
}

function scoreStr(r: QuizResult) {
  return `${r.score}/${r.total_questions} (${r.percentage}%)`;
}

function qualitativeEn(sub: string, result: QuizResult): string | null {
  if (sub === 'learning-style') {
    const ad = parseAdditionalData(result.additional_data);
    if (ad?.dominantStyle) return styleEn[ad.dominantStyle] ?? `${ad.dominantStyle} Learner`;
  }
  if (sub === 'attention' || result.quiz_id === 'attention-assessment') {
    const ad = parseAdditionalData(result.additional_data);
    return ad?.attentionLevel ?? attnLabelEn(result.percentage);
  }
  return null;
}

function qualitativeAr(sub: string, result: QuizResult): string | null {
  if (sub === 'learning-style') {
    const ad = parseAdditionalData(result.additional_data);
    if (ad?.dominantStyle) return styleAr[ad.dominantStyle] ?? ad.dominantStyle;
  }
  if (sub === 'attention' || result.quiz_id === 'attention-assessment') {
    return attnLabelAr(result.percentage);
  }
  return null;
}

// ═══════════════════════════════════════════════════════════════════
//  Shared doc creation + drawing helpers
// ═══════════════════════════════════════════════════════════════════
interface DocSetup {
  doc: InstanceType<typeof PDFDocument>;
  pageW: number;
  W: number;
  L: number;
  R: number;
  PAGE_BOTTOM: number;
  resetCursor: () => void;
  pageFooter: (isArabic?: boolean) => void;
  card: (y: number, h: number, bgColor: string) => number;
  progressBar: (x: number, y: number, w: number, pct: number, fgColor: string) => void;
  divider: (y: number, color?: string) => number;
  ensureSpace: (y: number, need: number, isArabic?: boolean) => number;
  drawScoreHelvetica: (score: string, x: number, y: number, width: number, color: string, align?: 'left' | 'right') => void;
  renderSectionEn: (y: number, sectionTitle: string, sectionColor: string, results: QuizResult[], nameMap: Record<string, string>) => number;
  renderSectionAr: (y: number, sectionTitle: string, sectionColor: string, results: QuizResult[], nameMap: Record<string, string>) => number;
}

function createDocSetup(data: ReportData, arabicFont: Buffer | null): DocSetup {
  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: 50, bottom: 60, left: 50, right: 50 },
    autoFirstPage: true,
    info: {
      Title: `Assessment Report — ${data.profile.student_name || 'Student'}`,
      Author: 'Holistic Assessment Tool — Bloom Tutoring',
      Subject: 'Cognitive & Language Skills Assessment',
    },
  });

  if (arabicFont) doc.registerFont('Arabic', arabicFont);

  const pageW = doc.page.width;
  const W = pageW - 100;
  const L = 50;
  const R = L + W;
  const PAGE_BOTTOM = doc.page.height - 80;

  function resetCursor() { doc.x = L; doc.y = 50; }

  function pageFooter(isArabic = false) {
    const savedMargin = doc.page.margins.bottom;
    doc.page.margins.bottom = 0;
    const txt = isArabic && arabicFont
      ? reshapeArabic('صادر من أداة التقييم الشامل | بلوم للتعليم')
      : 'Generated by Holistic Assessment Tool  |  Bloom Tutoring';
    if (isArabic && arabicFont) doc.font('Arabic');
    else doc.font('Helvetica');
    doc.fontSize(8).fillColor(C.gray400)
      .text(txt, L, doc.page.height - 40, { width: W, align: 'center', lineBreak: false });
    doc.font('Helvetica');
    doc.page.margins.bottom = savedMargin;
    resetCursor();
  }

  function card(y: number, h: number, bgColor: string): number {
    doc.save(); doc.roundedRect(L, y, W, h, 6).fill(bgColor); doc.restore();
    return y + 12;
  }

  function progressBar(x: number, y: number, w: number, pct: number, fgColor: string) {
    const h = 8, r = 4;
    doc.save(); doc.roundedRect(x, y, w, h, r).fill(C.gray200); doc.restore();
    if (pct > 0) {
      const fillW = Math.max(r * 2, (pct / 100) * w);
      doc.save(); doc.roundedRect(x, y, fillW, h, r).fill(fgColor); doc.restore();
    }
  }

  function divider(y: number, color = C.gray200): number {
    doc.moveTo(L, y).lineTo(R, y).lineWidth(0.5).strokeColor(color).stroke();
    return y + 15;
  }

  function ensureSpace(y: number, need: number, isArabic = false): number {
    if (y + need > PAGE_BOTTOM) { doc.addPage(); pageFooter(isArabic); return 50; }
    return y;
  }

  function drawScoreHelvetica(score: string, x: number, y: number, width: number, color: string, align: 'left' | 'right' = 'left') {
    doc.font('Helvetica').fontSize(10).fillColor(color)
      .text(score, x, y, { width, align, lineBreak: false });
  }

  function renderSectionEn(y: number, sectionTitle: string, sectionColor: string, results: QuizResult[], nameMap: Record<string, string>): number {
    doc.font('Helvetica-Bold').fontSize(18).fillColor(sectionColor).text(sectionTitle, L, y, { lineBreak: false });
    y += 8;
    doc.moveTo(L, y + 18).lineTo(L + 180, y + 18).lineWidth(2.5).strokeColor(sectionColor).stroke();
    y += 30;
    const groups = groupBySub(results);
    for (const [sub, items] of Object.entries(groups)) {
      y = ensureSpace(y, 80);
      const avg = Math.round(items.reduce((s, r) => s + r.percentage, 0) / items.length);
      const pl = perfLevel(avg);
      doc.save(); doc.roundedRect(L, y, W, 32, 4).fill(C.gray100); doc.restore();
      doc.font('Helvetica-Bold').fontSize(11).fillColor(C.gray900).text(nameMap[sub] || sub, L + 12, y + 9, { width: W - 180, lineBreak: false });
      const headerQual = items.length > 0 ? qualitativeEn(sub, items[0]) : null;
      const headerLabel = headerQual ?? `${avg}%`;
      doc.font('Helvetica-Bold').fontSize(11).fillColor(pl.color).text(headerLabel, L + 12, y + 9, { width: W - 24, align: 'right', lineBreak: false });
      y += 40;
      for (const result of items) {
        y = ensureSpace(y, 28);
        const qp = perfLevel(result.percentage);
        const qual = qualitativeEn(sub, result);
        doc.font('Helvetica').fontSize(10).fillColor(C.gray700).text(result.quiz_name, L + 20, y, { width: W - 280, lineBreak: false });
        if (qual) {
          doc.font('Helvetica').fontSize(10).fillColor(qp.color).text(qual, L + 20, y, { width: W - 40, align: 'right', lineBreak: false });
        } else {
          const barW = 100; const barX = R - barW; const scoreX = barX - 110;
          doc.font('Helvetica').fontSize(10).fillColor(qp.color).text(scoreStr(result), scoreX, y, { width: 100, align: 'right', lineBreak: false });
          progressBar(barX, y + 2, barW, result.percentage, qp.color);
        }
        y += 22;
      }
      y += 12;
    }
    return y;
  }

  function renderSectionAr(y: number, sectionTitle: string, sectionColor: string, results: QuizResult[], nameMap: Record<string, string>): number {
    doc.font('Arabic').fontSize(18).fillColor(sectionColor).text(sectionTitle, L, y, { width: W, align: 'right', lineBreak: false });
    y += 8;
    doc.moveTo(R, y + 18).lineTo(R - 180, y + 18).lineWidth(2.5).strokeColor(sectionColor).stroke();
    y += 30;
    const groups = groupBySub(results);
    for (const [sub, items] of Object.entries(groups)) {
      y = ensureSpace(y, 80, true);
      const avg = Math.round(items.reduce((s, r) => s + r.percentage, 0) / items.length);
      const pl = perfLevel(avg);
      doc.save(); doc.roundedRect(L, y, W, 32, 4).fill(C.gray100); doc.restore();
      doc.font('Arabic').fontSize(11).fillColor(C.gray900).text(nameMap[sub] || sub, L + 12, y + 9, { width: W - 24, align: 'right', lineBreak: false });
      const headerQual = items.length > 0 ? qualitativeAr(sub, items[0]) : null;
      if (headerQual) {
        doc.font('Arabic').fontSize(11).fillColor(pl.color).text(headerQual, L + 12, y + 9, { width: W / 3, lineBreak: false });
      } else {
        drawScoreHelvetica(`${avg}%`, L + 12, y + 9, W / 3, pl.color, 'left');
      }
      y += 40;
      for (const result of items) {
        y = ensureSpace(y, 28, true);
        const qp = perfLevel(result.percentage);
        const qual = qualitativeAr(sub, result);
        doc.font('Arabic').fontSize(10).fillColor(C.gray700).text(result.quiz_name, L + 20, y, { width: W - 40, align: 'right', lineBreak: false });
        if (qual) {
          doc.font('Arabic').fontSize(10).fillColor(qp.color).text(qual, L + 20, y, { width: W / 2 - 20, lineBreak: false });
        } else {
          const barW = 100; const barX = L + 20;
          drawScoreHelvetica(scoreStr(result), barX + barW + 8, y, 120, qp.color, 'left');
          progressBar(barX, y + 2, barW, result.percentage, qp.color);
        }
        y += 22;
      }
      y += 12;
    }
    doc.font('Helvetica');
    return y;
  }

  return { doc, pageW, W, L, R, PAGE_BOTTOM, resetCursor, pageFooter, card, progressBar, divider, ensureSpace, drawScoreHelvetica, renderSectionEn, renderSectionAr };
}

// ═══════════════════════════════════════════════════════════════════
//  ENGLISH PDF GENERATION
// ═══════════════════════════════════════════════════════════════════
export async function generateEnglishPDF(data: ReportData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const { doc, pageW, W, L, R, PAGE_BOTTOM, resetCursor, pageFooter, card, progressBar, divider, ensureSpace, drawScoreHelvetica, renderSectionEn } = createDocSetup(data, null);
      const chunks: Buffer[] = [];
      doc.on('data', (c: Buffer) => chunks.push(c));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const allResults = [...data.mindResults, ...data.oralResults, ...data.academicResults];
      const totalCount = allResults.length;
      const overallAvg = totalCount > 0 ? Math.round(allResults.reduce((s, r) => s + r.percentage, 0) / totalCount) : 0;
      const totalTime = allResults.reduce((s, r) => s + (r.time_spent || 0), 0);

      // ═══ ENGLISH COVER ═══
      let y = 80;
      doc.save(); doc.rect(0, 0, pageW, 6).fill(C.primary); doc.restore();
      doc.font('Helvetica').fontSize(9).fillColor(C.gray400).text('BLOOM TUTORING', L, 20, { width: W, align: 'right', characterSpacing: 2, lineBreak: false });
      doc.font('Helvetica-Bold').fontSize(30).fillColor(C.primary).text('Assessment Report', L, y, { align: 'center', width: W, lineBreak: false });
      y += 50;

      const nameCardH = data.profile.grade ? 70 : 50;
      const nameY = card(y, nameCardH, C.primaryLt);
      doc.font('Helvetica-Bold').fontSize(20).fillColor(C.gray900).text(data.profile.student_name || 'Student', L, nameY, { width: W, align: 'center', lineBreak: false });
      if (data.profile.grade) {
        doc.font('Helvetica').fontSize(13).fillColor(C.gray500).text(data.profile.grade, L, nameY + 28, { width: W, align: 'center', lineBreak: false });
      }
      y += nameCardH + 12;

      doc.font('Helvetica').fontSize(11).fillColor(C.gray500)
        .text(`Generated: ${data.generatedAt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, L, y, { width: W, align: 'center', lineBreak: false });
      y += 35;
      y = divider(y);

      // Summary stats
      doc.font('Helvetica-Bold').fontSize(14).fillColor(C.gray900).text('Assessment Summary', L, y, { lineBreak: false });
      y += 28;
      const boxW = (W - 30) / 4;
      const statItems = [
        { val: String(totalCount), lbl: 'Quizzes Completed', accent: C.primary },
        { val: `${overallAvg}%`, lbl: 'Overall Score', accent: C.primary },
        { val: `${data.mindResults.length}`, lbl: 'Mind Skills', accent: C.secondary },
        { val: `${Math.round(totalTime / 60)} min`, lbl: 'Time Invested', accent: C.emerald },
      ];
      for (let i = 0; i < statItems.length; i++) {
        const x = L + i * (boxW + 10);
        doc.save(); doc.roundedRect(x, y, boxW, 62, 6).fill(C.gray50); doc.roundedRect(x, y, boxW, 3, 1.5).fill(statItems[i].accent); doc.restore();
        doc.font('Helvetica-Bold').fontSize(20).fillColor(statItems[i].accent).text(statItems[i].val, x, y + 14, { width: boxW, align: 'center', lineBreak: false });
        doc.font('Helvetica').fontSize(8).fillColor(C.gray500).text(statItems[i].lbl, x, y + 42, { width: boxW, align: 'center', lineBreak: false });
      }
      y += 82;

      const overallPl = perfLevel(overallAvg);
      doc.save(); doc.roundedRect(L, y, W, 36, 6).fill(overallPl.bg); doc.restore();
      doc.font('Helvetica').fontSize(12).fillColor(C.gray700).text('Overall Performance:', L + 14, y + 10, { lineBreak: false });
      doc.font('Helvetica-Bold').fontSize(13).fillColor(overallPl.color).text(overallPl.label, L + 170, y + 10, { lineBreak: false });
      progressBar(R - 160, y + 14, 140, overallAvg, overallPl.color);
      y += 50;

      const parentNoteEn = 'Dear Parent/Guardian,\n\nThis report provides an overview of your child\'s cognitive skills assessment. The scores reflect performance across various areas including attention, memory, critical thinking, and language skills. Please review the recommendations section.';
      doc.font('Helvetica').fontSize(10);
      const parentNoteEnH = doc.heightOfString(parentNoteEn, { width: W - 32 });
      const parentBoxEnH = Math.max(60, parentNoteEnH + 20);
      doc.save(); doc.roundedRect(L, y, W, parentBoxEnH, 6).fill(C.blueLt); doc.roundedRect(L, y, 4, parentBoxEnH, 2).fill(C.primary); doc.restore();
      doc.font('Helvetica').fontSize(10).fillColor(C.gray700).text(parentNoteEn, L + 16, y + 10, { width: W - 32 });
      y += parentBoxEnH + 14;
      pageFooter();

      // Mind Skills
      if (data.mindResults.length > 0) {
        doc.addPage(); doc.save(); doc.rect(0, 0, pageW, 4).fill(C.primary); doc.restore();
        y = 50; y = renderSectionEn(y, 'Mind Skills Assessment', C.primary, data.mindResults, subNameEn); pageFooter();
      }
      // Oral Skills
      if (data.oralResults.length > 0) {
        doc.addPage(); doc.save(); doc.rect(0, 0, pageW, 4).fill(C.secondary); doc.restore();
        y = 50; y = renderSectionEn(y, 'Oral Skills Assessment', C.secondary, data.oralResults, subNameEn); pageFooter();
      }
      // Academic Skills
      if (data.academicResults.length > 0) {
        doc.addPage(); doc.save(); doc.rect(0, 0, pageW, 4).fill(C.emerald); doc.restore();
        y = 50; y = renderSectionEn(y, 'Academic Skills Assessment', C.emerald, data.academicResults, subNameEn); pageFooter();
      }

      // Recommendations
      doc.addPage(); doc.save(); doc.rect(0, 0, pageW, 4).fill(C.success); doc.restore();
      y = 50;
      doc.font('Helvetica-Bold').fontSize(18).fillColor(C.success).text('Recommendations', L, y, { lineBreak: false });
      y += 8; doc.moveTo(L, y + 18).lineTo(L + 160, y + 18).lineWidth(2.5).strokeColor(C.success).stroke(); y += 30;

      y = ensureSpace(y, 60);
      doc.save(); doc.roundedRect(L, y, W, 28, 4).fill(C.successLt); doc.restore();
      doc.font('Helvetica-Bold').fontSize(12).fillColor(C.success).text('Strengths Identified', L + 14, y + 7, { lineBreak: false });
      y += 36;
      const highPerf = allResults.filter(r => r.percentage >= 85);
      if (highPerf.length > 0) {
        for (const r of highPerf) { y = ensureSpace(y, 20); doc.font('Helvetica').fontSize(10).fillColor(C.gray700).text(`\u2022  ${r.quiz_name}: Excellent performance`, L + 14, y, { width: W - 28, lineBreak: false }); y += 18; }
      } else if (allResults.length > 0) {
        doc.font('Helvetica').fontSize(10).fillColor(C.gray700).text('\u2022  Your child is developing skills across all assessed areas.', L + 14, y, { width: W - 28, lineBreak: false }); y += 18;
      }
      y += 10;

      y = ensureSpace(y, 60);
      doc.save(); doc.roundedRect(L, y, W, 28, 4).fill(C.warningLt); doc.restore();
      doc.font('Helvetica-Bold').fontSize(12).fillColor(C.warning).text('Areas for Growth', L + 14, y + 7, { lineBreak: false });
      y += 36;
      const lowPerf = allResults.filter(r => r.percentage < 75);
      if (lowPerf.length > 0) {
        for (const r of lowPerf) { y = ensureSpace(y, 20); const sub = subNameEn[r.subcategory] || r.subcategory; doc.font('Helvetica').fontSize(10).fillColor(C.gray700).text(`\u2022  ${sub}: Consider additional practice and support`, L + 14, y, { width: W - 28, lineBreak: false }); y += 18; }
      } else if (allResults.length > 0) {
        doc.font('Helvetica').fontSize(10).fillColor(C.gray700).text('\u2022  Consistent performance across all areas \u2014 great job!', L + 14, y, { width: W - 28, lineBreak: false }); y += 18;
      }
      y += 10;

      y = ensureSpace(y, 120);
      doc.save(); doc.roundedRect(L, y, W, 28, 4).fill(C.blueLt); doc.restore();
      doc.font('Helvetica-Bold').fontSize(12).fillColor(C.blue).text('Suggested Activities', L + 14, y + 7, { lineBreak: false });
      y += 36;
      const activities = [
        'Encourage regular practice in areas where scores were below 75%.',
        'Celebrate successes and maintain motivation for continued learning.',
        'Explore educational games that target specific skill areas.',
        "Discuss results with your child's teacher for additional support.",
        'Re-assess periodically to track improvement over time.',
      ];
      for (const act of activities) { y = ensureSpace(y, 20); doc.font('Helvetica').fontSize(10).fillColor(C.gray700).text(`\u2022  ${act}`, L + 14, y, { width: W - 28, lineBreak: false }); y += 18; }
      pageFooter();

      doc.end();
    } catch (error) { reject(error); }
  });
}

// ═══════════════════════════════════════════════════════════════════
//  ARABIC PDF GENERATION
// ═══════════════════════════════════════════════════════════════════
export async function generateArabicPDF(data: ReportData): Promise<Buffer> {
  const arabicFont = await getArabicFontBuffer();
  if (!arabicFont) throw new Error('Arabic font not available');

  return new Promise((resolve, reject) => {
    try {
      const { doc, pageW, W, L, R, PAGE_BOTTOM, resetCursor, pageFooter, card, progressBar, divider, ensureSpace, drawScoreHelvetica, renderSectionAr } = createDocSetup(data, arabicFont);
      const chunks: Buffer[] = [];
      doc.on('data', (c: Buffer) => chunks.push(c));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const allResults = [...data.mindResults, ...data.oralResults, ...data.academicResults];
      const totalCount = allResults.length;
      const overallAvg = totalCount > 0 ? Math.round(allResults.reduce((s, r) => s + r.percentage, 0) / totalCount) : 0;
      const totalTime = allResults.reduce((s, r) => s + (r.time_spent || 0), 0);
      const boxW = (W - 30) / 4;

      // ═══ ARABIC COVER ═══
      doc.save(); doc.rect(0, 0, pageW, 6).fill(C.primary); doc.restore();
      let y = 80;

      doc.font('Arabic').fontSize(9).fillColor(C.gray400).text(reshapeArabic('بلوم للتعليم'), L, 20, { width: W, align: 'left', lineBreak: false });
      doc.font('Arabic').fontSize(30).fillColor(C.primary).text(reshapeArabic('تقرير التقييم'), L, y, { width: W, align: 'center', lineBreak: false });
      y += 55;

      const arNameH = data.profile.grade ? 70 : 50;
      const arNameY = card(y, arNameH, C.primaryLt);
      doc.font('Arabic').fontSize(20).fillColor(C.gray900).text(data.profile.student_name || reshapeArabic('الطالب'), L, arNameY, { width: W, align: 'center', lineBreak: false });
      if (data.profile.grade) {
        doc.font('Arabic').fontSize(13).fillColor(C.gray500).text(data.profile.grade, L, arNameY + 28, { width: W, align: 'center', lineBreak: false });
      }
      y += arNameH + 12;

      const dateStr = data.generatedAt.toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' });
      doc.font('Arabic').fontSize(11).fillColor(C.gray500).text(reshapeArabic('تاريخ الإصدار') + ':  ' + dateStr, L, y, { width: W, align: 'center', lineBreak: false });
      y += 35;
      y = divider(y);

      doc.font('Arabic').fontSize(14).fillColor(C.gray900).text(reshapeArabic('ملخص التقييم'), L, y, { width: W, align: 'right', lineBreak: false });
      y += 28;

      const arStatLabels = [
        { val: String(totalCount), lbl: reshapeArabic('الاختبارات المكتملة'), accent: C.primary },
        { val: `${overallAvg}%`, lbl: reshapeArabic('الدرجة الكلية'), accent: C.primary },
        { val: String(data.mindResults.length), lbl: reshapeArabic('المهارات الذهنية'), accent: C.secondary },
        { val: `${Math.round(totalTime / 60)}`, lbl: reshapeArabic('الوقت المستغرق'), accent: C.emerald },
      ];
      for (let i = 0; i < arStatLabels.length; i++) {
        const x = L + i * (boxW + 10);
        doc.save(); doc.roundedRect(x, y, boxW, 62, 6).fill(C.gray50); doc.roundedRect(x, y, boxW, 3, 1.5).fill(arStatLabels[i].accent); doc.restore();
        doc.font('Helvetica-Bold').fontSize(18).fillColor(arStatLabels[i].accent).text(arStatLabels[i].val, x, y + 14, { width: boxW, align: 'center', lineBreak: false });
        doc.font('Arabic').fontSize(8).fillColor(C.gray500).text(arStatLabels[i].lbl, x, y + 42, { width: boxW, align: 'center', lineBreak: false });
      }
      y += 82;

      const arPl = perfLevel(overallAvg);
      doc.save(); doc.roundedRect(L, y, W, 44, 6).fill(arPl.bg); doc.restore();
      doc.font('Arabic').fontSize(12).fillColor(C.gray700).text(reshapeArabic('الأداء العام'), L + 14, y + 8, { width: W - 28, align: 'right', lineBreak: false });
      doc.font('Arabic').fontSize(12).fillColor(arPl.color).text(arPl.labelAr, L + 14, y + 8, { width: W / 2, lineBreak: false });
      progressBar(L + 14, y + 30, 140, overallAvg, arPl.color);
      y += 58;

      const parentNoteAr1 = reshapeArabic('عزيزي ولي الأمر،');
      const parentNoteAr2 = reshapeArabic('يقدم هذا التقرير نظرة عامة على تقييم المهارات الإدراكية لطفلك.');
      const parentNoteAr3 = reshapeArabic('تعكس الدرجات الأداء في مختلف المجالات بما في ذلك الانتباه والذاكرة والتفكير النقدي والمهارات اللغوية.');
      const fullParentAr = parentNoteAr1 + '\n\n' + parentNoteAr2 + ' ' + parentNoteAr3;
      doc.font('Arabic').fontSize(10);
      const parentNoteArH = doc.heightOfString(fullParentAr, { width: W - 32, align: 'right' });
      const parentBoxArH = Math.max(60, parentNoteArH + 24);
      doc.save(); doc.roundedRect(L, y, W, parentBoxArH, 6).fill(C.blueLt); doc.roundedRect(R - 4, y, 4, parentBoxArH, 2).fill(C.primary); doc.restore();
      doc.font('Arabic').fontSize(10).fillColor(C.gray700).text(fullParentAr, L + 12, y + 12, { width: W - 32, align: 'right' });
      resetCursor();
      y += parentBoxArH + 14;
      pageFooter(true);

      // Mind Skills (Arabic)
      if (data.mindResults.length > 0) {
        doc.addPage(); doc.save(); doc.rect(0, 0, pageW, 4).fill(C.primary); doc.restore();
        y = 50; y = renderSectionAr(y, reshapeArabic('تقييم المهارات الذهنية'), C.primary, data.mindResults, subNameAr); pageFooter(true);
      }
      // Oral Skills (Arabic)
      if (data.oralResults.length > 0) {
        doc.addPage(); doc.save(); doc.rect(0, 0, pageW, 4).fill(C.secondary); doc.restore();
        y = 50; y = renderSectionAr(y, reshapeArabic('تقييم المهارات الشفهية'), C.secondary, data.oralResults, subNameAr); pageFooter(true);
      }
      // Academic Skills (Arabic)
      if (data.academicResults.length > 0) {
        doc.addPage(); doc.save(); doc.rect(0, 0, pageW, 4).fill(C.emerald); doc.restore();
        y = 50; y = renderSectionAr(y, reshapeArabic('تقييم المهارات الأكاديمية'), C.emerald, data.academicResults, subNameAr); pageFooter(true);
      }

      // Recommendations (Arabic)
      doc.addPage(); doc.save(); doc.rect(0, 0, pageW, 4).fill(C.success); doc.restore();
      y = 50;
      doc.font('Arabic').fontSize(18).fillColor(C.success).text(reshapeArabic('التوصيات'), L, y, { width: W, align: 'right', lineBreak: false });
      y += 8; doc.moveTo(R, y + 18).lineTo(R - 160, y + 18).lineWidth(2.5).strokeColor(C.success).stroke(); y += 30;

      y = ensureSpace(y, 60, true);
      doc.save(); doc.roundedRect(L, y, W, 28, 4).fill(C.successLt); doc.restore();
      doc.font('Arabic').fontSize(12).fillColor(C.success).text(reshapeArabic('نقاط القوة المحددة'), L + 14, y + 7, { width: W - 28, align: 'right', lineBreak: false });
      y += 36;
      const highPerfAr = allResults.filter(r => r.percentage >= 85);
      if (highPerfAr.length > 0) {
        for (const r of highPerfAr) { y = ensureSpace(y, 20, true); doc.font('Arabic').fontSize(10).fillColor(C.gray700).text(reshapeArabic('أداء ممتاز') + ': ' + r.quiz_name + '  \u2022', L + 14, y, { width: W - 28, align: 'right', lineBreak: false }); y += 18; }
      } else if (allResults.length > 0) {
        doc.font('Arabic').fontSize(10).fillColor(C.gray700).text(reshapeArabic('طفلك يطور مهاراته في جميع المجالات التي تم تقييمها') + '  \u2022', L + 14, y, { width: W - 28, align: 'right', lineBreak: false }); y += 18;
      }
      y += 10;

      y = ensureSpace(y, 60, true);
      doc.save(); doc.roundedRect(L, y, W, 28, 4).fill(C.warningLt); doc.restore();
      doc.font('Arabic').fontSize(12).fillColor(C.warning).text(reshapeArabic('مجالات النمو'), L + 14, y + 7, { width: W - 28, align: 'right', lineBreak: false });
      y += 36;
      const lowPerfAr = allResults.filter(r => r.percentage < 75);
      if (lowPerfAr.length > 0) {
        for (const r of lowPerfAr) { y = ensureSpace(y, 20, true); const sub = subNameAr[r.subcategory] || r.subcategory; doc.font('Arabic').fontSize(10).fillColor(C.gray700).text(reshapeArabic('يحتاج مزيداً من الممارسة') + ': ' + sub + '  \u2022', L + 14, y, { width: W - 28, align: 'right', lineBreak: false }); y += 18; }
      } else if (allResults.length > 0) {
        doc.font('Arabic').fontSize(10).fillColor(C.gray700).text(reshapeArabic('أداء متسق في جميع المجالات') + '  \u2022', L + 14, y, { width: W - 28, align: 'right', lineBreak: false }); y += 18;
      }
      y += 10;

      y = ensureSpace(y, 120, true);
      doc.save(); doc.roundedRect(L, y, W, 28, 4).fill(C.blueLt); doc.restore();
      doc.font('Arabic').fontSize(12).fillColor(C.blue).text(reshapeArabic('الأنشطة المقترحة'), L + 14, y + 7, { width: W - 28, align: 'right', lineBreak: false });
      y += 36;
      const activitiesAr = [
        'شجع على الممارسة المنتظمة في المجالات الضعيفة',
        'احتفل بالنجاحات وحافظ على الدافع للتعلم',
        'استخدم الألعاب التعليمية لتطوير المهارات',
        'ناقش النتائج مع معلم طفلك للدعم الإضافي',
        'أعد التقييم بشكل دوري لتتبع التحسن',
      ];
      for (const act of activitiesAr) { y = ensureSpace(y, 20, true); doc.font('Arabic').fontSize(10).fillColor(C.gray700).text(reshapeArabic(act) + '  \u2022', L + 14, y, { width: W - 28, align: 'right', lineBreak: false }); y += 18; }
      pageFooter(true);

      doc.end();
    } catch (error) { reject(error); }
  });
}

/** Alias kept for backward compatibility (admin routes use this name). */
export const generateReportPDF = generateEnglishPDF;
