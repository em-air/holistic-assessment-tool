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
  learningResults: QuizResult[];
  generatedAt: Date;
  audience?: 'parent' | 'teacher';
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
  'learning-style': 'Learning Style', 'social-emotional': 'Social-Emotional Learning',
  'critical-thinking': 'Critical Thinking',
  perception: 'Visual Perception', 'oral-language': 'Oral Language',
  reading: 'Reading Skills', phonics: 'Beginning and Ending Sounds',
  'phonics-awareness': 'Beginning and Ending Sounds',
  writing: 'Writing Skills', vocabulary: 'Vocabulary', spelling: 'Spelling',
};
const subNameAr: Record<string, string> = {
  attention: reshapeArabic('الانتباه والتركيز'), memory: reshapeArabic('الذاكرة والاسترجاع'),
  'learning-style': reshapeArabic('أسلوب التعلم'), 'social-emotional': reshapeArabic('التعلم الاجتماعي العاطفي'),
  'critical-thinking': reshapeArabic('التفكير النقدي'),
  perception: reshapeArabic('الإدراك البصري'), 'oral-language': reshapeArabic('اللغة الشفهية'),
  reading: reshapeArabic('مهارات القراءة'), phonics: reshapeArabic('أصوات البداية والنهاية'),
  'phonics-awareness': reshapeArabic('أصوات البداية والنهاية'),
  writing: reshapeArabic('مهارات الكتابة'), vocabulary: reshapeArabic('المفردات'), spelling: reshapeArabic('الإملاء'),
};

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
  if (sub === 'learning-style' || result.quiz_id === 'learning-styles') {
    const ad = parseAdditionalData(result.additional_data);
    const style = ad?.dominantStyle ?? (ad?.primaryDimension === 'reading' ? 'reading-writing' : ad?.primaryDimension);
    if (style) return styleEn[style] ?? `${style} Learner`;
  }
  if (sub === 'social-emotional' || result.quiz_id === 'social-emotional') {
    const ad = parseAdditionalData(result.additional_data);
    if (ad?.primaryTitle) return ad.primaryTitle;
    const labels: Record<string, string> = {
      EA: 'Emotional Awareness Strength',
      PS: 'Prosocial Strength',
      SR: 'Self-Regulation Strength',
    };
    if (ad?.primaryStrength) return labels[ad.primaryStrength] ?? ad.primaryStrength;
  }
  if (sub === 'attention' || result.quiz_id === 'attention-assessment') {
    const ad = parseAdditionalData(result.additional_data);
    return ad?.attentionLevel ?? attnLabelEn(result.percentage);
  }
  return null;
}

function qualitativeAr(sub: string, result: QuizResult): string | null {
  if (sub === 'learning-style' || result.quiz_id === 'learning-styles') {
    const ad = parseAdditionalData(result.additional_data);
    const style = ad?.dominantStyle ?? (ad?.primaryDimension === 'reading' ? 'reading-writing' : ad?.primaryDimension);
    if (style) return styleAr[style] ?? style;
  }
  if (sub === 'social-emotional' || result.quiz_id === 'social-emotional') {
    const ad = parseAdditionalData(result.additional_data);
    const labels: Record<string, string> = {
      EA: reshapeArabic('قوة الوعي العاطفي'),
      PS: reshapeArabic('قوة المهارات الاجتماعية'),
      SR: reshapeArabic('قوة التنظيم الذاتي'),
    };
    if (ad?.primaryStrength) return labels[ad.primaryStrength] ?? ad.primaryStrength;
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
//  AUDIENCE-SPECIFIC PARAGRAPH GENERATORS (Teacher / Parent)
// ═══════════════════════════════════════════════════════════════════

const MIND_QUIZ_IDS = [
  'attention-assessment', 'picture-sequence',
  'analogy-quiz', 'category-quiz',
  'sentence-difference-quiz', 'logical-sequencing-quiz', 'missing-object-quiz',
];

const LEARNING_QUIZ_IDS = ['learning-styles', 'social-emotional'];

const mindQuizDisplayName: Record<string, string> = {
  'attention-assessment': 'Attention Control Assessment',
  'picture-sequence': 'Picture Sequence Memory',
  'analogy-quiz': 'Analogy Reasoning',
  'category-quiz': 'Category Classification',
  'sentence-difference-quiz': 'Sentence Difference Detection',
  'logical-sequencing-quiz': 'Logical Sequencing',
  'missing-object-quiz': 'Missing Object Identification',
};

const learningQuizDisplayName: Record<string, string> = {
  'learning-styles': 'Learning Preferences Quiz',
  'social-emotional': 'Social-Emotional Learning Quiz',
};

/* ── English teacher paragraphs ── */

function buildAttentionTeacherEn(result: QuizResult): string {
  const ad = parseAdditionalData(result.additional_data) || {};
  const overallLevel = ad.attentionLevel || (result.percentage >= 75 ? 'Strong' : result.percentage >= 60 ? 'Moderate' : 'Developing');
  const focusingLevel = ad.focusingLevel || overallLevel;
  const shiftingLevel = ad.shiftingLevel || overallLevel;
  const focusPct = ad.focusingPercentage;
  const shiftPct = ad.shiftingPercentage;
  const isStrongFocus = /strong|good|high/i.test(focusingLevel);
  const isStrongShift = /strong|good|high/i.test(shiftingLevel);
  const isWeakFocus = /developing|low|weak|needs/i.test(focusingLevel);
  const isWeakShift = /developing|low|weak|needs/i.test(shiftingLevel);

  const parts: string[] = [];
  parts.push(`The Attention Control Assessment evaluated the student across two subscales: Focusing (sustaining attention on a task) and Shifting (switching attention between tasks). The student's overall attention level was rated as "${overallLevel}".`);

  if (isStrongFocus && isStrongShift) {
    parts.push(`Both focusing${focusPct != null ? ` (${focusPct}%)` : ''} and shifting${shiftPct != null ? ` (${shiftPct}%)` : ''} abilities are strong. The student can sustain concentration on activities and transition smoothly between tasks.`);
  } else if (isStrongFocus && isWeakShift) {
    parts.push(`While focusing ability is strong${focusPct != null ? ` (${focusPct}%)` : ''}, they have difficulty with shifting attention${shiftPct != null ? ` (${shiftPct}%)` : ''}. Consider providing clear transition warnings and visual schedules.`);
  } else if (isWeakFocus && isStrongShift) {
    parts.push(`The student shows difficulty with sustained focusing${focusPct != null ? ` (${focusPct}%)` : ''} but has good shifting ability${shiftPct != null ? ` (${shiftPct}%)` : ''}. Consider breaking tasks into shorter segments and using timers.`);
  } else if (isWeakFocus && isWeakShift) {
    parts.push(`Both focusing${focusPct != null ? ` (${focusPct}%)` : ''} and shifting${shiftPct != null ? ` (${shiftPct}%)` : ''} abilities need support. Consider seating the student away from distractions, using visual cues and timers, and breaking tasks into small steps.`);
  } else {
    parts.push(`Focusing was rated as "${focusingLevel}"${focusPct != null ? ` (${focusPct}%)` : ''} and shifting as "${shiftingLevel}"${shiftPct != null ? ` (${shiftPct}%)` : ''}. Structured activities with clear instructions and periodic check-ins may help.`);
  }
  return parts.join(' ');
}

function getTeacherParagraphEn(result: QuizResult): string {
  const pct = result.percentage;
  const ad = parseAdditionalData(result.additional_data);
  switch (result.quiz_id) {
    case 'attention-assessment':
      return buildAttentionTeacherEn(result);
    case 'picture-sequence':
      if (pct >= 75) return 'The student demonstrates strong sequential memory and the ability to organise events in logical order. This skill supports reading comprehension, following multi-step classroom instructions, and understanding cause-and-effect relationships in subjects like science and history.';
      if (pct >= 60) return 'The student shows developing sequential memory. They can order familiar events but may need visual supports for complex sequences. Consider using graphic organisers, story maps, and numbered step-by-step instructions.';
      return 'The student finds it challenging to arrange events in order. They may benefit from daily sequencing practice such as retelling a story in order, arranging picture cards, and using visual timelines alongside verbal instructions.';
    case 'learning-styles': {
      const style = ad?.dominantStyle;
      if (style === 'visual') return 'The student is a visual learner who learns best through diagrams, charts, colour-coding, and written instructions. Provide written task outlines, use highlighters for key information, and incorporate visual aids such as mind maps or infographics.';
      if (style === 'auditory') return 'The student is an auditory learner who learns best through listening and discussion. Encourage verbal explanations, use audio recordings of lessons, allow the student to talk through problems, and incorporate songs or rhymes for memorisation.';
      if (style === 'reading-writing') return 'The student is a reading/writing learner who benefits most from text-based input and output. Provide written instructions, encourage note-taking and journaling, assign reading activities, and let the student express understanding through writing.';
      if (style === 'kinesthetic') return 'The student is a kinesthetic learner who learns best through hands-on activities and movement. Incorporate manipulatives, role-play, experiments, and movement breaks. Allow the student to stand or move while learning when possible.';
      return 'The student\'s learning style was assessed. Adapt teaching methods to match their preference for best results.';
    }
    case 'analogy-quiz':
      if (pct >= 75) return 'The student demonstrates strong analogical reasoning, meaning they can identify relationships between concepts and apply patterns to new situations. This skill supports vocabulary development, reading comprehension, and mathematical reasoning.';
      if (pct >= 60) return 'The student shows developing analogical reasoning. They can identify some relationships but struggle with more abstract patterns. Practice with word pairs, "A is to B as C is to ?" exercises, and comparing/contrasting activities will strengthen this skill.';
      return 'The student needs support with analogical reasoning. They may have difficulty seeing how concepts relate to one another. Use concrete, familiar examples before moving to abstract ones. Sorting and classification activities may also help build this skill.';
    case 'category-quiz':
      if (pct >= 75) return 'The student shows strong categorisation skills, demonstrating the ability to group items by shared attributes. This supports vocabulary organisation, scientific classification, and the ability to see overarching themes in texts.';
      if (pct >= 60) return 'The student shows developing categorisation abilities. They can sort familiar items but may struggle with less obvious groupings. Use sorting games, Venn diagrams, and "odd one out" activities to strengthen conceptual grouping.';
      return 'The student finds categorisation challenging. They may benefit from hands-on sorting activities, starting with very concrete categories (colour, shape) before moving to abstract ones (function, meaning).';
    case 'sentence-difference-quiz':
      if (pct >= 75) return 'The student is highly attentive to detail in language, successfully detecting subtle differences between sentences. This supports proof-reading, reading accuracy, and attention to grammatical structures.';
      if (pct >= 60) return 'The student can detect some differences between sentences but may miss subtle changes. Practice comparison exercises, spot-the-difference reading tasks, and proof-reading activities to sharpen this skill.';
      return 'The student struggles to notice differences in sentence structure or wording. Consider activities where the student compares side-by-side sentences, highlights changes, and discusses why the meaning differs.';
    case 'logical-sequencing-quiz':
      if (pct >= 75) return 'The student excels at logical sequencing, identifying patterns, and predicting the next step in a series. This is essential for mathematics, scientific reasoning, and understanding narrative structure in reading.';
      if (pct >= 60) return 'The student shows moderate ability in logical sequencing. They handle simple patterns but may struggle with multi-step or abstract sequences. Number patterns, shape sequences, and "what comes next?" activities will help.';
      return 'The student needs support with logical sequencing. They may find it difficult to identify patterns or predict what comes next. Start with very simple, visual patterns and gradually increase complexity. Use manipulatives and interactive games.';
    case 'missing-object-quiz':
      if (pct >= 75) return 'The student demonstrates strong visual perception and the ability to identify missing elements in a scene. This supports attention to detail in reading, mathematics, and real-world problem solving.';
      if (pct >= 60) return 'The student shows developing visual perception. They can find missing elements in simpler scenes but may miss details in complex images. Use "spot the missing item" games and observational drawing exercises.';
      return 'The student needs support with visual perception and identifying missing elements. Consider I-spy activities, hidden-picture puzzles, and guided observation exercises to strengthen visual scanning and analysis.';
    default: return '';
  }
}

/* ── English parent advice paragraphs ── */

function buildAttentionParentEn(result: QuizResult): string {
  const ad = parseAdditionalData(result.additional_data) || {};
  const overallLevel = ad.attentionLevel || (result.percentage >= 75 ? 'Strong' : result.percentage >= 60 ? 'Moderate' : 'Developing');
  const focusingLevel = ad.focusingLevel || overallLevel;
  const shiftingLevel = ad.shiftingLevel || overallLevel;
  const isStrongFocus = /strong|good|high/i.test(focusingLevel);
  const isStrongShift = /strong|good|high/i.test(shiftingLevel);
  const isWeakFocus = /developing|low|weak|needs/i.test(focusingLevel);
  const isWeakShift = /developing|low|weak|needs/i.test(shiftingLevel);

  const parts: string[] = [];
  parts.push(`This assessment looked at your child's ability to focus on tasks and switch between activities. Their overall attention was rated "${overallLevel}".`);

  if (isStrongFocus && isStrongShift) {
    parts.push('Your child can concentrate well and switch smoothly between activities. Keep encouraging this by providing a calm study environment and praising their focus during homework.');
  } else if (isStrongFocus && isWeakShift) {
    parts.push('Your child can focus well on a single task but finds it hard to switch between activities. At home, give them a gentle warning a few minutes before it\'s time to change activities (e.g., "In 5 minutes we\'ll start dinner"). A visual schedule on the fridge can also help.');
  } else if (isWeakFocus && isStrongShift) {
    parts.push('Your child switches between activities easily but has some difficulty staying focused for long periods. Try breaking homework into shorter chunks with small movement breaks in between. A quiet, clutter-free workspace can also help.');
  } else if (isWeakFocus && isWeakShift) {
    parts.push('Your child needs support with both concentrating and switching between tasks. Create a quiet, distraction-free area for homework, use a timer to set short focus periods (10–15 minutes), and give clear advance notice before changing activities.');
  } else {
    parts.push('Your child is still building their attention skills. A consistent daily routine, a quiet workspace, and short, focused activity sessions can support their development at home.');
  }
  return parts.join(' ');
}

function getParentAdviceEn(result: QuizResult): string {
  const pct = result.percentage;
  const ad = parseAdditionalData(result.additional_data);
  switch (result.quiz_id) {
    case 'attention-assessment':
      return buildAttentionParentEn(result);
    case 'picture-sequence':
      if (pct >= 75) return 'Your child is great at remembering things in order! You can keep building this by asking them to retell their day in sequence ("What happened first? Then what?") and by reading stories together and discussing the order of events.';
      if (pct >= 60) return 'Your child is developing their ability to put events in order. At home, try letting them help with step-by-step tasks like following a simple recipe or arranging family photos by date. This everyday practice strengthens sequencing skills.';
      return 'Your child finds it a bit tricky to arrange things in order. You can help by doing simple sequencing activities together—like sorting picture cards of a story, describing what you did today step by step, or numbering instructions before starting a task.';
    case 'learning-styles': {
      const style = ad?.dominantStyle;
      if (style === 'visual') return 'Your child learns best by seeing. When helping with homework, use colours, drawings, and diagrams. Watch educational videos together and hang visual reminders (charts or checklists) in their study area.';
      if (style === 'auditory') return 'Your child learns best by listening. Read aloud together, discuss what they\'re learning, and let them explain concepts back to you. Audiobooks and educational podcasts are also great tools for them.';
      if (style === 'reading-writing') return 'Your child learns best through reading and writing. Encourage them to keep a journal, write lists, and read for pleasure. When studying, writing notes or summaries in their own words helps information stick.';
      if (style === 'kinesthetic') return 'Your child learns best through hands-on activities. Let them build models, act things out, or use objects to count and sort. Incorporate movement into study time—for example, spelling words while bouncing a ball.';
      return 'Understanding how your child prefers to learn helps you support them better. Try different approaches—visual (charts), auditory (discussion), reading/writing (notes), and hands-on (building)—and see which they enjoy most.';
    }
    case 'analogy-quiz':
      if (pct >= 75) return 'Your child is strong at seeing how things relate to each other. Encourage this at home by playing "how are these alike?" games, doing simple riddles, and discussing comparisons in everyday life ("A glove is to a hand as a sock is to a…").';
      if (pct >= 60) return 'Your child is developing their ability to spot relationships between ideas. Play comparison games at home—"How is a cat like a dog? How are they different?" Board games that involve matching and sorting are also helpful.';
      return 'Your child needs some extra practice seeing how things connect. Use everyday moments: "A key opens a door—what opens a can?" Start with concrete, familiar examples and gradually make them more challenging. Matching and sorting games help too.';
    case 'category-quiz':
      if (pct >= 75) return 'Your child is great at grouping things by what they have in common. Reinforce this by sorting laundry by colour, organising toys by type, or playing "name 5 things that are…" games during car rides.';
      if (pct >= 60) return 'Your child can group familiar things together but needs more practice with trickier categories. At home, try sorting groceries by food group, organising a messy drawer together, or playing card games that involve matching.';
      return 'Your child finds it challenging to sort things into groups. Start with simple, visual sorting (colours, shapes, sizes) and work up to more abstract categories. Involve them in real-life sorting—putting away dishes, organising books by topic.';
    case 'sentence-difference-quiz':
      if (pct >= 75) return 'Your child has a great eye for detail in language! Keep this sharp by doing spot-the-difference puzzles, proof-reading fun notes together, and playing word games that require careful reading.';
      if (pct >= 60) return 'Your child can sometimes spot differences but misses subtle changes. Try reading two similar sentences and asking what changed, playing spot-the-difference games, and encouraging them to re-read their own written work carefully.';
      return 'Your child needs help noticing small differences in sentences. At home, do comparison activities—read two very similar sentences and ask what\'s different. Spot-the-difference picture puzzles also help train this kind of attention to detail.';
    case 'logical-sequencing-quiz':
      if (pct >= 75) return 'Your child is excellent at recognising patterns and predicting what comes next. Nurture this with pattern games, puzzles, and asking "what do you think will happen next?" when reading stories or watching shows together.';
      if (pct >= 60) return 'Your child is building their pattern-finding skills. Practice with simple patterns at home—bead stringing in a colour pattern, number sequences, and asking "what comes next?" during everyday activities like setting the table.';
      return 'Your child needs support with finding patterns. Start with very simple visual patterns (red-blue-red-blue, what\'s next?) and gradually increase difficulty. Puzzles, building-block patterns, and rhythm games all help develop this skill.';
    case 'missing-object-quiz':
      if (pct >= 75) return 'Your child is very good at noticing what\'s missing or different in a picture. This is a great sign for visual awareness! I-spy games, picture puzzles, and observation walks ("What\'s new on this street?") keep this skill sharp.';
      if (pct >= 60) return 'Your child can find some missing items but may overlook details in busy scenes. Play "what\'s different?" and "what\'s missing?" games at home. Try placing a few objects on a tray, covering them, and removing one—can they guess which one is gone?';
      return 'Your child needs practice noticing missing things in pictures. Play the "tray game" (display objects, cover and remove one, can they guess?). I-spy books and hidden-picture puzzles are fun ways to build this skill.';
    default: return '';
  }
}

/* ── Arabic teacher paragraphs ── */

function buildAttentionTeacherAr(result: QuizResult): string {
  const ad = parseAdditionalData(result.additional_data) || {};
  const overallLevel = ad.attentionLevel || (result.percentage >= 75 ? 'Strong' : result.percentage >= 60 ? 'Moderate' : 'Developing');
  const focusingLevel = ad.focusingLevel || overallLevel;
  const shiftingLevel = ad.shiftingLevel || overallLevel;
  const isStrongFocus = /strong|good|high/i.test(focusingLevel);
  const isStrongShift = /strong|good|high/i.test(shiftingLevel);
  const isWeakFocus = /developing|low|weak|needs/i.test(focusingLevel);
  const isWeakShift = /developing|low|weak|needs/i.test(shiftingLevel);

  const parts: string[] = [];
  parts.push(reshapeArabic(`قيّم اختبار التحكم في الانتباه الطالب عبر مقياسين فرعيين: التركيز والتحويل. تم تقييم مستوى الانتباه العام بـ "${overallLevel}".`));

  if (isStrongFocus && isStrongShift) {
    parts.push(reshapeArabic('كلتا قدرتي التركيز والتحويل قوية. يستطيع الطالب الحفاظ على التركيز في الأنشطة والانتقال بسلاسة بين المهام.'));
  } else if (isStrongFocus && isWeakShift) {
    parts.push(reshapeArabic('بينما قدرة الطالب على التركيز قوية، إلا أنه يواجه صعوبة في تحويل الانتباه. يُنصح بتقديم تنبيهات واضحة قبل الانتقال واستخدام الجداول المرئية.'));
  } else if (isWeakFocus && isStrongShift) {
    parts.push(reshapeArabic('يُظهر الطالب صعوبة في التركيز المستمر لكن لديه قدرة جيدة على التحويل. يُنصح بتقسيم المهام إلى أجزاء أقصر واستخدام المؤقتات.'));
  } else if (isWeakFocus && isWeakShift) {
    parts.push(reshapeArabic('كلتا قدرتي التركيز والتحويل تحتاجان إلى دعم. يُنصح بإجلاس الطالب بعيداً عن المشتتات واستخدام الإشارات البصرية والمؤقتات وتقسيم المهام إلى خطوات صغيرة.'));
  } else {
    parts.push(reshapeArabic(`تم تقييم التركيز بـ "${focusingLevel}" والتحويل بـ "${shiftingLevel}". قد يستفيد الطالب من أنشطة منظمة مع تعليمات واضحة ومتابعة دورية.`));
  }
  return parts.join(' ');
}

function getTeacherParagraphAr(result: QuizResult): string {
  const pct = result.percentage;
  switch (result.quiz_id) {
    case 'attention-assessment':
      return buildAttentionTeacherAr(result);
    case 'picture-sequence':
      if (pct >= 75) return reshapeArabic('يُظهر الطالب ذاكرة تسلسلية قوية وقدرة على ترتيب الأحداث بشكل منطقي. تدعم هذه المهارة فهم القراءة واتباع التعليمات متعددة الخطوات.');
      if (pct >= 60) return reshapeArabic('يُظهر الطالب ذاكرة تسلسلية متطورة. يمكنه ترتيب الأحداث المألوفة لكنه قد يحتاج دعمًا بصريًا للتسلسلات المعقدة. يُنصح باستخدام المنظمات البيانية وخرائط القصص.');
      return reshapeArabic('يجد الطالب صعوبة في ترتيب الأحداث. قد يستفيد من ممارسة التسلسل اليومية مثل إعادة سرد القصص بالترتيب واستخدام بطاقات الصور والجداول الزمنية المرئية.');
    case 'learning-styles': {
      const ad = parseAdditionalData(result.additional_data);
      const style = ad?.dominantStyle;
      if (style === 'visual') return reshapeArabic('الطالب متعلم بصري يتعلم بشكل أفضل من خلال الرسوم البيانية والمخططات والتعليمات المكتوبة. قدم مخططات المهام واستخدم أقلام التحديد والخرائط الذهنية.');
      if (style === 'auditory') return reshapeArabic('الطالب متعلم سمعي يتعلم بشكل أفضل من خلال الاستماع والمناقشة. شجع التفسيرات اللفظية واسمح للطالب بالتحدث عن المشكلات.');
      if (style === 'reading-writing') return reshapeArabic('الطالب متعلم قرائي/كتابي يستفيد من التعليمات المكتوبة وتدوين الملاحظات وأنشطة القراءة والتعبير الكتابي.');
      if (style === 'kinesthetic') return reshapeArabic('الطالب متعلم حركي يتعلم بشكل أفضل من خلال الأنشطة العملية والحركة. أدمج الوسائل التعليمية الملموسة ولعب الأدوار والتجارب.');
      return reshapeArabic('تم تقييم أسلوب تعلم الطالب. كيّف طرق التدريس لتتناسب مع تفضيلاته.');
    }
    case 'analogy-quiz':
      if (pct >= 75) return reshapeArabic('يُظهر الطالب قدرة قوية على التفكير القياسي وتحديد العلاقات بين المفاهيم. تدعم هذه المهارة تطوير المفردات وفهم القراءة والتفكير الرياضي.');
      if (pct >= 60) return reshapeArabic('يُظهر الطالب قدرة متطورة على التفكير القياسي. يمكنه تحديد بعض العلاقات لكنه يواجه صعوبة مع الأنماط الأكثر تجريدًا. يُنصح بتمارين أزواج الكلمات والمقارنة.');
      return reshapeArabic('يحتاج الطالب دعمًا في التفكير القياسي. استخدم أمثلة ملموسة ومألوفة قبل الانتقال إلى أمثلة مجردة. أنشطة الفرز والتصنيف قد تساعد أيضًا.');
    case 'category-quiz':
      if (pct >= 75) return reshapeArabic('يُظهر الطالب مهارات تصنيف قوية وقدرة على تجميع العناصر حسب سمات مشتركة. يدعم ذلك تنظيم المفردات والتصنيف العلمي.');
      if (pct >= 60) return reshapeArabic('يُظهر الطالب قدرات تصنيف متطورة. يمكنه فرز العناصر المألوفة لكنه قد يواجه صعوبة مع التجميعات الأقل وضوحًا. يُنصح بألعاب الفرز ومخططات فن.');
      return reshapeArabic('يجد الطالب التصنيف صعبًا. قد يستفيد من أنشطة الفرز العملية بدءًا من فئات ملموسة مثل اللون والشكل قبل الانتقال إلى فئات مجردة.');
    case 'sentence-difference-quiz':
      if (pct >= 75) return reshapeArabic('الطالب يهتم بالتفاصيل اللغوية ويكتشف الاختلافات الدقيقة بين الجمل بنجاح. يدعم ذلك التدقيق اللغوي ودقة القراءة.');
      if (pct >= 60) return reshapeArabic('يمكن للطالب اكتشاف بعض الاختلافات لكنه قد يفوت التغييرات الدقيقة. يُنصح بتمارين المقارنة ومهام التدقيق اللغوي.');
      return reshapeArabic('يواجه الطالب صعوبة في ملاحظة الاختلافات في بنية الجمل. فكر في أنشطة مقارنة الجمل جنبًا إلى جنب وتمييز التغييرات ومناقشة اختلاف المعنى.');
    case 'logical-sequencing-quiz':
      if (pct >= 75) return reshapeArabic('يتفوق الطالب في التسلسل المنطقي وتحديد الأنماط والتنبؤ بالخطوة التالية. هذا ضروري للرياضيات والتفكير العلمي وفهم بنية السرد.');
      if (pct >= 60) return reshapeArabic('يُظهر الطالب قدرة معتدلة في التسلسل المنطقي. يتعامل مع الأنماط البسيطة لكنه قد يواجه صعوبة مع التسلسلات المعقدة. يُنصح بأنماط الأرقام والأشكال.');
      return reshapeArabic('يحتاج الطالب دعمًا في التسلسل المنطقي. ابدأ بأنماط بصرية بسيطة جدًا وزد التعقيد تدريجيًا. استخدم الوسائل الملموسة والألعاب التفاعلية.');
    case 'missing-object-quiz':
      if (pct >= 75) return reshapeArabic('يُظهر الطالب إدراكًا بصريًا قويًا وقدرة على تحديد العناصر المفقودة. يدعم ذلك الانتباه للتفاصيل في القراءة والرياضيات وحل المشكلات.');
      if (pct >= 60) return reshapeArabic('يُظهر الطالب إدراكًا بصريًا متطورًا. يمكنه إيجاد العناصر المفقودة في المشاهد البسيطة لكنه قد يفوت التفاصيل في الصور المعقدة. يُنصح بألعاب البحث عن العنصر المفقود.');
      return reshapeArabic('يحتاج الطالب دعمًا في الإدراك البصري. فكر في أنشطة البحث والصور المخفية والتمارين التوجيهية لتعزيز المسح البصري والتحليل.');
    default: return '';
  }
}

/* ── Arabic parent advice paragraphs ── */

function buildAttentionParentAr(result: QuizResult): string {
  const ad = parseAdditionalData(result.additional_data) || {};
  const overallLevel = ad.attentionLevel || (result.percentage >= 75 ? 'Strong' : result.percentage >= 60 ? 'Moderate' : 'Developing');
  const focusingLevel = ad.focusingLevel || overallLevel;
  const shiftingLevel = ad.shiftingLevel || overallLevel;
  const isStrongFocus = /strong|good|high/i.test(focusingLevel);
  const isStrongShift = /strong|good|high/i.test(shiftingLevel);
  const isWeakFocus = /developing|low|weak|needs/i.test(focusingLevel);
  const isWeakShift = /developing|low|weak|needs/i.test(shiftingLevel);

  const parts: string[] = [];
  parts.push(reshapeArabic(`قيّم هذا الاختبار قدرة طفلك على التركيز على المهام والتبديل بين الأنشطة. تم تقييم مستوى الانتباه العام بـ "${overallLevel}".`));

  if (isStrongFocus && isStrongShift) {
    parts.push(reshapeArabic('يستطيع طفلك التركيز جيدًا والانتقال بسلاسة بين الأنشطة. استمر في تشجيعه من خلال توفير بيئة دراسة هادئة والثناء على تركيزه أثناء الواجبات المنزلية.'));
  } else if (isStrongFocus && isWeakShift) {
    parts.push(reshapeArabic('يستطيع طفلك التركيز جيدًا لكنه يجد صعوبة في الانتقال بين الأنشطة. أعطه تنبيهًا قبل تغيير النشاط بدقائق. جدول مرئي على الثلاجة يمكن أن يساعد أيضًا.'));
  } else if (isWeakFocus && isStrongShift) {
    parts.push(reshapeArabic('ينتقل طفلك بين الأنشطة بسهولة لكنه يواجه صعوبة في التركيز لفترات طويلة. جرب تقسيم الواجبات إلى أجزاء أقصر مع فترات راحة حركية بينها. مكان عمل هادئ ومرتب يمكن أن يساعد.'));
  } else if (isWeakFocus && isWeakShift) {
    parts.push(reshapeArabic('يحتاج طفلك دعمًا في التركيز والانتقال بين المهام. أنشئ مكانًا هادئًا للواجبات بعيدًا عن المشتتات واستخدم مؤقتًا لفترات تركيز قصيرة وأعطِ إشعارًا مسبقًا قبل تغيير الأنشطة.'));
  } else {
    parts.push(reshapeArabic('طفلك يبني مهارات الانتباه. روتين يومي ثابت ومكان عمل هادئ وجلسات نشاط قصيرة ومركزة يمكن أن تدعم تطوره في المنزل.'));
  }
  return parts.join(' ');
}

function getParentAdviceAr(result: QuizResult): string {
  const pct = result.percentage;
  switch (result.quiz_id) {
    case 'attention-assessment':
      return buildAttentionParentAr(result);
    case 'picture-sequence':
      if (pct >= 75) return reshapeArabic('طفلك رائع في تذكر الأشياء بالترتيب! يمكنك تعزيز ذلك بسؤاله عن إعادة سرد يومه بالتسلسل وقراءة القصص معًا ومناقشة ترتيب الأحداث.');
      if (pct >= 60) return reshapeArabic('طفلك يطور قدرته على ترتيب الأحداث. جرب إشراكه في مهام تتبع خطوات مثل اتباع وصفة بسيطة أو ترتيب صور العائلة حسب التاريخ.');
      return reshapeArabic('يجد طفلك صعوبة في ترتيب الأشياء. يمكنك المساعدة بأنشطة تسلسل بسيطة مثل فرز بطاقات الصور لقصة أو وصف ما فعلتم اليوم خطوة بخطوة.');
    case 'learning-styles': {
      const ad = parseAdditionalData(result.additional_data);
      const style = ad?.dominantStyle;
      if (style === 'visual') return reshapeArabic('طفلك يتعلم بشكل أفضل عن طريق الرؤية. عند المساعدة في الواجبات استخدم الألوان والرسومات والمخططات. شاهدوا فيديوهات تعليمية معًا.');
      if (style === 'auditory') return reshapeArabic('طفلك يتعلم بشكل أفضل عن طريق الاستماع. اقرأوا بصوت عالٍ معًا وناقشوا ما يتعلمه ودعه يشرح المفاهيم لك. الكتب المسموعة أداة رائعة أيضًا.');
      if (style === 'reading-writing') return reshapeArabic('طفلك يتعلم بشكل أفضل من خلال القراءة والكتابة. شجعه على كتابة مذكرات وقوائم والقراءة للمتعة. كتابة الملاحظات بكلماته الخاصة تساعد المعلومات على الثبات.');
      if (style === 'kinesthetic') return reshapeArabic('طفلك يتعلم بشكل أفضل من خلال الأنشطة العملية. دعه يبني نماذج ويمثل الأشياء أو يستخدم أدوات للعد والفرز. أدمج الحركة في وقت الدراسة.');
      return reshapeArabic('فهم كيف يفضل طفلك التعلم يساعدك على دعمه بشكل أفضل. جرب طرقًا مختلفة وانظر أيها يستمتع به أكثر.');
    }
    case 'analogy-quiz':
      if (pct >= 75) return reshapeArabic('طفلك قوي في رؤية كيف ترتبط الأشياء ببعضها. شجع ذلك بألعاب "كيف يتشابه هذان؟" وألغاز بسيطة ومناقشة المقارنات في الحياة اليومية.');
      if (pct >= 60) return reshapeArabic('طفلك يطور قدرته على اكتشاف العلاقات بين الأفكار. العب ألعاب المقارنة في المنزل. ألعاب الطاولة التي تتضمن المطابقة والفرز مفيدة أيضًا.');
      return reshapeArabic('يحتاج طفلك لممارسة إضافية في رؤية كيف ترتبط الأشياء. استخدم لحظات يومية وابدأ بأمثلة ملموسة ومألوفة ثم اجعلها أكثر تحديًا تدريجيًا.');
    case 'category-quiz':
      if (pct >= 75) return reshapeArabic('طفلك رائع في تجميع الأشياء حسب القواسم المشتركة! عزز ذلك بفرز الملابس حسب اللون أو تنظيم الألعاب حسب النوع أو لعب "اذكر 5 أشياء..."');
      if (pct >= 60) return reshapeArabic('طفلك يستطيع تجميع الأشياء المألوفة لكنه يحتاج مزيدًا من الممارسة. جرب فرز المواد الغذائية حسب المجموعة أو تنظيم درج فوضوي معًا.');
      return reshapeArabic('يجد طفلك صعوبة في فرز الأشياء. ابدأ بالفرز البصري البسيط مثل الألوان والأشكال ثم انتقل لفئات أكثر تجريدًا. أشركه في الفرز واقعيًا مثل ترتيب الأطباق.');
    case 'sentence-difference-quiz':
      if (pct >= 75) return reshapeArabic('طفلك لديه عين رائعة للتفاصيل اللغوية! حافظ على ذلك بألغاز اكتشاف الاختلافات ومراجعة الملاحظات معًا وألعاب الكلمات.');
      if (pct >= 60) return reshapeArabic('طفلك يمكنه أحيانًا اكتشاف الاختلافات لكنه يفوت التغييرات الدقيقة. جرب قراءة جملتين متشابهتين وسؤاله عما تغير وشجعه على إعادة قراءة كتاباته بعناية.');
      return reshapeArabic('يحتاج طفلك مساعدة في ملاحظة الاختلافات الصغيرة. قم بأنشطة المقارنة واقرأ جملتين متشابهتين واسأل عن الاختلاف. ألغاز الصور المتشابهة تساعد أيضًا.');
    case 'logical-sequencing-quiz':
      if (pct >= 75) return reshapeArabic('طفلك ممتاز في التعرف على الأنماط والتنبؤ. عزز ذلك بألعاب الأنماط والألغاز وسؤال "ما الذي سيحدث بعد ذلك؟" عند قراءة القصص.');
      if (pct >= 60) return reshapeArabic('طفلك يبني مهارات إيجاد الأنماط. تدرب بأنماط بسيطة في المنزل مثل خرز بنمط لوني وتسلسلات أرقام وسؤال "ما التالي؟" في الأنشطة اليومية.');
      return reshapeArabic('يحتاج طفلك دعمًا في إيجاد الأنماط. ابدأ بأنماط بصرية بسيطة جدًا وزد الصعوبة تدريجيًا. الألغاز والمكعبات وألعاب الإيقاع تساعد في تطوير هذه المهارة.');
    case 'missing-object-quiz':
      if (pct >= 75) return reshapeArabic('طفلك جيد جدًا في ملاحظة ما هو مفقود! ألعاب البحث وألغاز الصور ونزهات الملاحظة تحافظ على هذه المهارة قوية.');
      if (pct >= 60) return reshapeArabic('طفلك يجد بعض العناصر المفقودة لكنه قد يتجاهل التفاصيل. العب ألعاب "ما المختلف؟" و"ما المفقود؟". جرب وضع أشياء على صينية ثم إزالة واحد.');
      return reshapeArabic('يحتاج طفلك ممارسة في ملاحظة الأشياء المفقودة. العب لعبة الصينية وكتب البحث وألغاز الصور المخفية هي طرق ممتعة لبناء هذه المهارة.');
    default: return '';
  }
}

function getLearningStyleFromResult(result: QuizResult): string | null {
  const ad = parseAdditionalData(result.additional_data);
  if (!ad) return null;
  return ad.dominantStyle ?? (ad.primaryDimension === 'reading' ? 'reading-writing' : ad.primaryDimension) ?? null;
}

function formatSelScores(ad: Record<string, any> | null): string {
  const scores = ad?.dimensionScores;
  if (!scores) return '';
  return ` Emotional Awareness: ${scores.EA ?? 0}, Prosocial Skills: ${scores.PS ?? 0}, Self-Regulation: ${scores.SR ?? 0}.`;
}

function getLearningTeacherParagraphEn(result: QuizResult): string {
  if (result.quiz_id === 'learning-styles') {
    const style = getLearningStyleFromResult(result);
    if (style === 'visual') return 'The Learning Preferences assessment indicates a visual learning preference. The student learns best through diagrams, charts, colour-coding, and written instructions. Provide written task outlines, use highlighters for key information, and incorporate visual aids such as mind maps or infographics.';
    if (style === 'auditory') return 'The Learning Preferences assessment indicates an auditory learning preference. The student learns best through listening and discussion. Encourage verbal explanations, use audio recordings of lessons, allow the student to talk through problems, and incorporate songs or rhymes for memorisation.';
    if (style === 'reading-writing') return 'The Learning Preferences assessment indicates a reading/writing learning preference. The student benefits most from text-based input and output. Provide written instructions, encourage note-taking and journaling, assign reading activities, and let the student express understanding through writing.';
    if (style === 'kinesthetic') return 'The Learning Preferences assessment indicates a kinesthetic learning preference. The student learns best through hands-on activities and movement. Incorporate manipulatives, role-play, experiments, and movement breaks. Allow the student to stand or move while learning when possible.';
    return 'The student\'s learning preferences were assessed. Adapt teaching methods to match their preferred style for best results.';
  }

  const ad = parseAdditionalData(result.additional_data);
  const key = ad?.primaryStrength as string | undefined;
  const scoreText = formatSelScores(ad);
  const description = ad?.description as string | undefined;

  switch (key) {
    case 'EA':
      return `The Social-Emotional Learning assessment identified Emotional Awareness as the student's current strength.${scoreText} ${description || 'They seem good at noticing and understanding feelings, which supports communication and problem solving.'} Continue building this through reflective discussions and emotion vocabulary in the classroom.`;
    case 'PS':
      return `The Social-Emotional Learning assessment identified Prosocial Skills as the student's current strength.${scoreText} ${description || 'They seem good at helping others, cooperating, and being a supportive peer.'} Provide cooperative learning opportunities and recognise acts of kindness to reinforce this strength.`;
    case 'SR':
      return `The Social-Emotional Learning assessment identified Self-Regulation as the student's current strength.${scoreText} ${description || 'They seem good at staying calm, handling challenges, and trying again when things are difficult.'} Offer appropriately challenging tasks and praise persistence to continue developing this skill.`;
    default:
      return description || 'The student completed the Social-Emotional Learning assessment. Use the results to support their emotional and social development in the classroom.';
  }
}

function getLearningParentAdviceEn(result: QuizResult): string {
  if (result.quiz_id === 'learning-styles') {
    const style = getLearningStyleFromResult(result);
    if (style === 'visual') return 'Your child learns best by seeing. When helping with homework, use colours, drawings, and diagrams. Watch educational videos together and hang visual reminders (charts or checklists) in their study area.';
    if (style === 'auditory') return 'Your child learns best by listening. Read aloud together, discuss what they\'re learning, and let them explain concepts back to you. Audiobooks and educational podcasts are also great tools for them.';
    if (style === 'reading-writing') return 'Your child learns best through reading and writing. Encourage them to keep a journal, write lists, and read for pleasure. When studying, writing notes or summaries in their own words helps information stick.';
    if (style === 'kinesthetic') return 'Your child learns best through hands-on activities. Let them build models, act things out, or use objects to count and sort. Incorporate movement into study time—for example, spelling words while bouncing a ball.';
    return 'Understanding how your child prefers to learn helps you support them better. Try different approaches—visual (charts), auditory (discussion), reading/writing (notes), and hands-on (building)—and see which they enjoy most.';
  }

  const ad = parseAdditionalData(result.additional_data);
  const description = ad?.description as string | undefined;
  const suggestions = Array.isArray(ad?.suggestions) ? ad.suggestions as string[] : [];
  const suggestionText = suggestions.length > 0
    ? ` At home, you can support this by: ${suggestions.join('; ')}.`
    : '';
  return `${description || 'This assessment highlights one of your child\'s current social-emotional strengths.'}${suggestionText}`;
}

function getLearningTeacherParagraphAr(result: QuizResult): string {
  if (result.quiz_id === 'learning-styles') {
    const style = getLearningStyleFromResult(result);
    if (style === 'visual') return reshapeArabic('يشير تقييم تفضيلات التعلم إلى تفضيل بصري. يتعلم الطالب بشكل أفضل من خلال الرسوم البيانية والمخططات والتعليمات المكتوبة.');
    if (style === 'auditory') return reshapeArabic('يشير تقييم تفضيلات التعلم إلى تفضيل سمعي. يتعلم الطالب بشكل أفضل من خلال الاستماع والمناقشة.');
    if (style === 'reading-writing') return reshapeArabic('يشير تقييم تفضيلات التعلم إلى تفضيل قرائي/كتابي. يستفيد الطالب من التعليمات المكتوبة وتدوين الملاحظات.');
    if (style === 'kinesthetic') return reshapeArabic('يشير تقييم تفضيلات التعلم إلى تفضيل حركي. يتعلم الطالب بشكل أفضل من خلال الأنشطة العملية والحركة.');
    return reshapeArabic('تم تقييم تفضيلات تعلم الطالب. كيّف طرق التدريس لتتناسب مع أسلوبه.');
  }

  const ad = parseAdditionalData(result.additional_data);
  const key = ad?.primaryStrength as string | undefined;
  switch (key) {
    case 'EA':
      return reshapeArabic('حدد تقييم التعلم الاجتماعي العاطفي أن الوعي العاطفي هو نقطة القوة الحالية للطالب. يبدو أنه جيد في ملاحظة المشاعر وفهمها، مما يدعم التواصل وحل المشكلات.');
    case 'PS':
      return reshapeArabic('حدد تقييم التعلم الاجتماعي العاطفي أن المهارات الاجتماعية الإيجابية هي نقطة القوة الحالية للطالب. يبدو أنه جيد في مساعدة الآخرين والتعاون.');
    case 'SR':
      return reshapeArabic('حدد تقييم التعلم الاجتماعي العاطفي أن التنظيم الذاتي هو نقطة القوة الحالية للطالب. يبدو أنه جيد في البقاء هادئًا والتعامل مع التحديات.');
    default:
      return reshapeArabic('أكمل الطالب تقييم التعلم الاجتماعي العاطفي. استخدم النتائج لدعم نموه العاطفي والاجتماعي.');
  }
}

function getLearningParentAdviceAr(result: QuizResult): string {
  if (result.quiz_id === 'learning-styles') {
    const style = getLearningStyleFromResult(result);
    if (style === 'visual') return reshapeArabic('يتعلم طفلك بشكل أفضل عن طريق الرؤية. استخدم الألوان والرسومات والمخططات عند المساعدة في الواجبات.');
    if (style === 'auditory') return reshapeArabic('يتعلم طفلك بشكل أفضل عن طريق الاستماع. اقرأوا بصوت عالٍ معًا وناقشوا ما يتعلمه.');
    if (style === 'reading-writing') return reshapeArabic('يتعلم طفلك بشكل أفضل من خلال القراءة والكتابة. شجعه على كتابة الملاحظات والقراءة للمتعة.');
    if (style === 'kinesthetic') return reshapeArabic('يتعلم طفلك بشكل أفضل من خلال الأنشطة العملية. دعه يبني نماذج ويستخدم أدوات ملموسة.');
    return reshapeArabic('فهم كيف يفضل طفلك التعلم يساعدك على دعمه بشكل أفضل.');
  }

  const ad = parseAdditionalData(result.additional_data);
  const key = ad?.primaryStrength as string | undefined;
  switch (key) {
    case 'EA':
      return reshapeArabic('يبدو أن طفلك جيد في ملاحظة المشاعر وفهمها. تحدثوا معًا عن المشاعر وسمّواها عندما يلاحظها.');
    case 'PS':
      return reshapeArabic('يبدو أن طفلك جيد في مساعدة الآخرين والتعاون. شجعه على تضمين الآخرين وممارسة العمل الجماعي.');
    case 'SR':
      return reshapeArabic('يبدو أن طفلك جيد في البقاء هادئًا والمحاولة مرة أخرى. ساعده على استخدام استراتيجيات الهدوء وتقسيم المهام الصعبة.');
    default:
      return reshapeArabic('يُظهر هذا التقييم أحد نقاط القوة الاجتماعية العاطفية الحالية لطفلك.');
  }
}

// ═══════════════════════════════════════════════════════════════════
//  TEACHER SUMMARY HELPERS
// ═══════════════════════════════════════════════════════════════════

interface TeacherSummary {
  cognitiveProfile: string;
  observations: string[];
  strategies: string[];
  accommodations: string[];
  goals: string[];
  quickTip: string;
}

function buildTeacherSummaryEn(
  mindResults: QuizResult[],
  oralResults: QuizResult[],
  academicResults: QuizResult[],
  learningResults: QuizResult[] = [],
): TeacherSummary {
  const allResults = [...mindResults, ...oralResults, ...academicResults];
  const avg = allResults.length > 0 ? Math.round(allResults.reduce((s, r) => s + r.percentage, 0) / allResults.length) : 0;

  const lsResult = learningResults.find(r => r.quiz_id === 'learning-styles');
  const style: string | null = lsResult ? (getLearningStyleFromResult(lsResult) ?? null) : null;

  const attnResult = mindResults.find(r => r.quiz_id === 'attention-assessment');
  const attnAd = attnResult ? parseAdditionalData(attnResult.additional_data) : null;
  const attnLevel: string | null = attnAd?.attentionLevel
    ?? (attnResult ? (attnResult.percentage >= 75 ? 'Strong' : attnResult.percentage >= 60 ? 'Moderate' : 'Developing') : null);

  const strengths = [...allResults].sort((a, b) => b.percentage - a.percentage).filter(r => r.percentage >= 80).slice(0, 3);
  const weaknesses = [...allResults].sort((a, b) => a.percentage - b.percentage).filter(r => r.percentage < 70).slice(0, 3);

  // Cognitive Profile
  let cognitiveProfile = avg >= 85
    ? `This student demonstrates strong overall cognitive abilities with an average score of ${avg}%.`
    : avg >= 70
    ? `This student shows a developing cognitive profile with an overall average of ${avg}%.`
    : `This student requires additional cognitive support, with an overall average of ${avg}%.`;
  if (strengths.length > 0) cognitiveProfile += ` Notable strengths include ${strengths.map(r => mindQuizDisplayName[r.quiz_id] || r.quiz_name).join(', ')}.`;
  if (weaknesses.length > 0) cognitiveProfile += ` Priority support areas: ${weaknesses.map(r => subNameEn[r.subcategory] || r.subcategory).join(' and ')}.`;
  if (style) cognitiveProfile += ` Preferred learning style: ${styleEn[style] || style}.`;
  if (attnLevel) cognitiveProfile += ` Attention level: ${attnLevel}.`;

  // Classroom Observations
  const observations: string[] = [];
  if (attnLevel && /developing|low|weak/i.test(attnLevel)) observations.push('May show off-task behavior or restlessness during independent work.');
  else if (attnLevel && /moderate/i.test(attnLevel)) observations.push('Attention may fluctuate; may need gentle redirection during longer tasks.');
  else if (attnLevel) observations.push('Generally sustains focus well during structured tasks.');

  const seqResult = mindResults.find(r => r.quiz_id === 'logical-sequencing-quiz');
  if (seqResult && seqResult.percentage < 70) observations.push('May struggle to follow multi-step directions without visual or written support.');

  const memResult = mindResults.find(r => r.quiz_id === 'picture-sequence');
  if (memResult && memResult.percentage < 70) observations.push('May not reliably retain visual instructions; check comprehension after giving directions.');

  const analogyResult = mindResults.find(r => r.quiz_id === 'analogy-quiz');
  if (analogyResult && analogyResult.percentage >= 80) observations.push('Shows strong relational thinking; can handle higher-order and abstract questioning.');

  if (observations.length === 0) observations.push('Student demonstrates balanced performance; monitor engagement and participation regularly.');

  // Teaching Strategies (3–4)
  const strategies: string[] = [];
  if (style === 'visual') strategies.push('Use diagrams, charts, and color-coded notes to introduce new concepts.');
  else if (style === 'auditory') strategies.push('Incorporate discussions, verbal explanations, and read-aloud tasks.');
  else if (style === 'kinesthetic') strategies.push('Include hands-on activities, manipulatives, and movement-based learning.');
  else if (style === 'reading-writing') strategies.push('Provide written instructions; encourage note-taking and written summaries.');
  else strategies.push('Vary instructional formats — visual, verbal, and hands-on — to support engagement.');

  if (weaknesses.some(r => ['logical-sequencing-quiz', 'picture-sequence'].includes(r.quiz_id))) strategies.push('Break tasks into numbered steps; use graphic organizers for sequencing work.');
  if (weaknesses.some(r => ['analogy-quiz', 'category-quiz'].includes(r.quiz_id))) strategies.push('Anchor abstract concepts with concrete, real-world examples before moving to the abstract.');
  if (attnLevel && /developing|low|weak/i.test(attnLevel)) strategies.push('Use brief, chunked tasks with built-in movement or sensory breaks between segments.');
  else strategies.push('Provide specific, timely feedback to reinforce effort and sustain motivation.');

  while (strategies.length > 4) strategies.pop();
  if (strategies.length < 3) strategies.push('Use quick checks for understanding (e.g., mini-whiteboards, exit tickets).');

  // Accommodations
  const accommodations: string[] = [];
  if (attnLevel && /developing|low|weak/i.test(attnLevel)) { accommodations.push('Preferential seating away from distractions.'); accommodations.push('Extended time on timed assessments.'); }
  if (weaknesses.length > 0) accommodations.push('Scaffolded task instructions with reduced complexity where needed.');
  if (style === 'visual') accommodations.push('Allow graphic organizers and visual reference materials.');
  else if (style === 'kinesthetic') accommodations.push('Permit use of manipulatives during tasks.');
  if (accommodations.length === 0) accommodations.push('No major accommodations indicated; continue with standard differentiation.');

  // Goals (exactly 2)
  const goals: string[] = [];
  const bottomTwo = [...allResults].sort((a, b) => a.percentage - b.percentage).slice(0, 2);
  for (const r of bottomTwo) goals.push(`Improve ${subNameEn[r.subcategory] || r.subcategory} from ${r.percentage}% to above 75% within 6 weeks through targeted practice and guided support.`);
  if (goals.length === 0) { goals.push('Maintain strong performance by introducing challenging extension tasks across all skill areas.'); goals.push('Develop independent problem-solving strategies for complex, multi-step activities.'); }
  while (goals.length < 2) goals.push('Build confidence and engagement by celebrating incremental progress in identified growth areas.');
  goals.splice(2);

  // Quick Tip
  let quickTip = '';
  if (attnLevel && /developing|low|weak/i.test(attnLevel)) quickTip = "A short movement break between tasks can significantly reset this student's focus and readiness to learn.";
  else if (style === 'visual') quickTip = "A quick sketch or diagram at the start of each new topic can noticeably boost this student's engagement.";
  else if (style === 'auditory') quickTip = "Let this student verbalize their thinking — it's often their fastest route to understanding.";
  else if (style === 'kinesthetic') quickTip = 'Give this student something to manipulate while listening — it improves focus and retention.';
  else if (weaknesses.length > 0) quickTip = `A daily 5-minute review targeting ${subNameEn[weaknesses[0].subcategory] || weaknesses[0].quiz_name} can make a measurable difference over time.`;
  else quickTip = 'This student is performing well — consider enrichment activities to keep them challenged and motivated.';

  return { cognitiveProfile, observations, strategies, accommodations, goals, quickTip };
}

function buildTeacherSummaryAr(
  mindResults: QuizResult[],
  oralResults: QuizResult[],
  academicResults: QuizResult[],
  learningResults: QuizResult[] = [],
): TeacherSummary {
  const allResults = [...mindResults, ...oralResults, ...academicResults];
  const avg = allResults.length > 0 ? Math.round(allResults.reduce((s, r) => s + r.percentage, 0) / allResults.length) : 0;

  const lsResult = learningResults.find(r => r.quiz_id === 'learning-styles');
  const style: string | null = lsResult ? (getLearningStyleFromResult(lsResult) ?? null) : null;

  const attnResult = mindResults.find(r => r.quiz_id === 'attention-assessment');
  const attnAd = attnResult ? parseAdditionalData(attnResult.additional_data) : null;
  const attnLevel: string | null = attnAd?.attentionLevel
    ?? (attnResult ? (attnResult.percentage >= 75 ? 'Strong' : attnResult.percentage >= 60 ? 'Moderate' : 'Developing') : null);

  const strengths = [...allResults].sort((a, b) => b.percentage - a.percentage).filter(r => r.percentage >= 80).slice(0, 3);
  const weaknesses = [...allResults].sort((a, b) => a.percentage - b.percentage).filter(r => r.percentage < 70).slice(0, 3);
  const attnLevelAr = attnLevel ? (attnLevel === 'Strong' ? 'قوي' : attnLevel === 'Moderate' ? 'متوسط' : 'يحتاج تطويراً') : null;

  // Cognitive Profile (Arabic)
  let cognitiveProfile = avg >= 85
    ? reshapeArabic(`يُظهر الطالب قدرات معرفية قوية بمتوسط ${avg}%.`)
    : avg >= 70
    ? reshapeArabic(`يُظهر الطالب ملفاً معرفياً في طور النمو بمتوسط ${avg}%.`)
    : reshapeArabic(`يحتاج الطالب دعماً معرفياً إضافياً بمتوسط إجمالي ${avg}%.`);
  if (strengths.length > 0) cognitiveProfile += ' ' + reshapeArabic(`نقاط القوة البارزة: ${strengths.map(r => mindQuizDisplayName[r.quiz_id] || r.quiz_name).join('، ')}.`);
  if (weaknesses.length > 0) cognitiveProfile += ' ' + reshapeArabic(`مجالات الأولوية: ${weaknesses.map(r => subNameAr[r.subcategory] || r.subcategory).join(' و')}.`);
  if (style) cognitiveProfile += ' ' + reshapeArabic(`أسلوب التعلم المفضل: ${styleAr[style] || style}.`);
  if (attnLevelAr) cognitiveProfile += ' ' + reshapeArabic(`مستوى الانتباه: ${attnLevelAr}.`);

  // Classroom Observations (Arabic)
  const observations: string[] = [];
  if (attnLevel && /developing|low|weak/i.test(attnLevel)) observations.push(reshapeArabic('قد يُظهر سلوكاً خارج المهمة أو توتراً أثناء العمل المستقل.'));
  else if (attnLevel && /moderate/i.test(attnLevel)) observations.push(reshapeArabic('قد يتذبذب الانتباه؛ يحتاج إعادة توجيه خلال المهام الطويلة.'));
  else if (attnLevel) observations.push(reshapeArabic('يحافظ على التركيز بشكل عام خلال المهام المنظمة.'));

  const seqResultAr = mindResults.find(r => r.quiz_id === 'logical-sequencing-quiz');
  if (seqResultAr && seqResultAr.percentage < 70) observations.push(reshapeArabic('قد يجد صعوبة في اتباع التوجيهات متعددة الخطوات دون دعم بصري أو مكتوب.'));

  const memResultAr = mindResults.find(r => r.quiz_id === 'picture-sequence');
  if (memResultAr && memResultAr.percentage < 70) observations.push(reshapeArabic('قد لا يحتفظ بالتعليمات البصرية بشكل موثوق؛ تحقق من الفهم بعد إعطاء التوجيهات.'));

  const analogyResultAr = mindResults.find(r => r.quiz_id === 'analogy-quiz');
  if (analogyResultAr && analogyResultAr.percentage >= 80) observations.push(reshapeArabic('يُظهر تفكيراً علائقياً قوياً؛ يمكنه التعامل مع الأسئلة المجردة والعليا.'));

  if (observations.length === 0) observations.push(reshapeArabic('يُظهر الطالب أداءً متوازناً؛ راقب المشاركة والتفاعل بانتظام.'));

  // Teaching Strategies (Arabic, 3–4)
  const strategies: string[] = [];
  if (style === 'visual') strategies.push(reshapeArabic('استخدم المخططات والرسوم البيانية والملاحظات الملونة لتقديم المفاهيم الجديدة.'));
  else if (style === 'auditory') strategies.push(reshapeArabic('أدرج المناقشات والشروحات الشفهية ونشاطات القراءة بصوت عالٍ.'));
  else if (style === 'kinesthetic') strategies.push(reshapeArabic('أدرج الأنشطة العملية والأدوات الملموسة والتعلم القائم على الحركة.'));
  else if (style === 'reading-writing') strategies.push(reshapeArabic('قدم تعليمات مكتوبة وشجع على تدوين الملاحظات والملخصات المكتوبة.'));
  else strategies.push(reshapeArabic('نوّع في أساليب التدريس: البصري والشفهي والعملي لدعم التفاعل.'));

  if (weaknesses.some(r => ['logical-sequencing-quiz', 'picture-sequence'].includes(r.quiz_id))) strategies.push(reshapeArabic('قسّم المهام إلى خطوات مرقمة واستخدم المنظمات الرسومية للعمل المتسلسل.'));
  if (weaknesses.some(r => ['analogy-quiz', 'category-quiz'].includes(r.quiz_id))) strategies.push(reshapeArabic('ربط المفاهيم المجردة بأمثلة واقعية ملموسة قبل الانتقال للمستوى المجرد.'));
  if (attnLevel && /developing|low|weak/i.test(attnLevel)) strategies.push(reshapeArabic('استخدم مهام قصيرة مجزأة مع فترات راحة حركية بين الأجزاء.'));
  else strategies.push(reshapeArabic('قدم تغذية راجعة فورية ومحددة لتعزيز الجهد والحفاظ على الدافعية.'));

  while (strategies.length > 4) strategies.pop();
  if (strategies.length < 3) strategies.push(reshapeArabic('استخدم فحوصات سريعة للفهم مثل بطاقات الخروج أو السبورات الصغيرة.'));

  // Accommodations (Arabic)
  const accommodations: string[] = [];
  if (attnLevel && /developing|low|weak/i.test(attnLevel)) { accommodations.push(reshapeArabic('الجلوس المفضل بعيداً عن المشتتات.')); accommodations.push(reshapeArabic('وقت ممتد في التقييمات الزمنية.')); }
  if (weaknesses.length > 0) accommodations.push(reshapeArabic('تعليمات مدرّجة مع تبسيط في التعقيد عند الحاجة.'));
  if (style === 'visual') accommodations.push(reshapeArabic('السماح باستخدام المنظمات الرسومية والمواد المرجعية البصرية.'));
  else if (style === 'kinesthetic') accommodations.push(reshapeArabic('السماح باستخدام الأدوات الملموسة أثناء الأنشطة.'));
  if (accommodations.length === 0) accommodations.push(reshapeArabic('لا توجد تسهيلات رئيسية مطلوبة في الوقت الحالي.'));

  // Goals (exactly 2, Arabic)
  const goals: string[] = [];
  const bottomTwo = [...allResults].sort((a, b) => a.percentage - b.percentage).slice(0, 2);
  for (const r of bottomTwo) goals.push(reshapeArabic(`تحسين ${subNameAr[r.subcategory] || r.subcategory} من ${r.percentage}% إلى أعلى من 75% خلال 6 أسابيع من خلال الممارسة الموجهة.`));
  if (goals.length === 0) { goals.push(reshapeArabic('الحفاظ على الأداء القوي من خلال تقديم مهام إثرائية في جميع المجالات.')); goals.push(reshapeArabic('تطوير استراتيجيات حل مستقلة للأنشطة المعقدة متعددة الخطوات.')); }
  while (goals.length < 2) goals.push(reshapeArabic('بناء الثقة والتفاعل من خلال الاحتفاء بالتقدم التدريجي.'));
  goals.splice(2);

  // Quick Tip (Arabic)
  let quickTip = '';
  if (attnLevel && /developing|low|weak/i.test(attnLevel)) quickTip = reshapeArabic('استراحة حركية قصيرة بين المهام يمكن أن تُعيد تركيز الطالب وجاهزيته للتعلم بشكل ملحوظ.');
  else if (style === 'visual') quickTip = reshapeArabic('رسم سريع أو مخطط في بداية كل موضوع جديد يمكن أن يعزز تفاعل هذا الطالب بشكل ملحوظ.');
  else if (style === 'auditory') quickTip = reshapeArabic('دع الطالب يعبر عن تفكيره بصوت عالٍ — فهو غالباً أسرع طريق لفهمه.');
  else if (style === 'kinesthetic') quickTip = reshapeArabic('أعطِ الطالب شيئاً يتلاعب به أثناء الاستماع — يحسن التركيز والاستيعاب.');
  else if (weaknesses.length > 0) quickTip = reshapeArabic(`مراجعة يومية لمدة 5 دقائق في ${subNameAr[weaknesses[0].subcategory] || weaknesses[0].quiz_name} يمكن أن تُحدث فرقاً قابلاً للقياس مع الوقت.`);
  else quickTip = reshapeArabic('يؤدي هذا الطالب بشكل جيد — فكر في مهام إثرائية للحفاظ على تحفيزه وتحديه.');

  return { cognitiveProfile, observations, strategies, accommodations, goals, quickTip };
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

      const allResults = [
        ...data.mindResults,
        ...data.oralResults,
        ...data.academicResults,
        ...(data.learningResults ?? []),
      ];
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

      const parentNoteEn = data.audience === 'teacher'
        ? 'Dear Teacher,\n\nThis report provides a detailed overview of the student\'s cognitive skills assessment. The scores reflect performance across various areas including attention, memory, critical thinking, and language skills.'
        : 'Dear Parent/Guardian,\n\nThis report provides an overview of your child\'s cognitive skills assessment. The scores reflect performance across various areas including attention, memory, critical thinking, and language skills.';
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
      // Learning & Social-Emotional
      if ((data.learningResults ?? []).length > 0) {
        doc.addPage(); doc.save(); doc.rect(0, 0, pageW, 4).fill('#e11d48'); doc.restore();
        y = 50; y = renderSectionEn(y, 'Learning & Social-Emotional Assessment', '#e11d48', data.learningResults, subNameEn); pageFooter();
      }

      // ── Audience-specific section ──
      const audience = data.audience || 'parent';
      const allMindResults = data.mindResults;
      if (allMindResults.length > 0) {
        doc.addPage(); y = 50;

        const sectionTitle = audience === 'teacher'
          ? 'FOR TEACHERS: COGNITION ASSESSMENT DETAILS'
          : 'FOR PARENTS: ADVICE & GUIDANCE';
        const sectionIntro = audience === 'teacher'
          ? 'This section provides detailed, quiz-by-quiz analysis of the student\'s performance on all Mind (cognition) assessments. Each paragraph describes what the quiz measures and what the student\'s score indicates for classroom instruction.'
          : 'This section provides personalised advice for each cognitive assessment your child completed. Each paragraph explains the skill in everyday language and suggests activities you can do at home to support your child.';

        doc.save(); doc.roundedRect(L, y, W, 28, 4).fill(C.warningLt); doc.restore();
        doc.font('Helvetica-Bold').fontSize(12).fillColor('#78350f').text(sectionTitle, L + 14, y + 7, { width: W - 28 });
        y += 36;
        doc.font('Helvetica').fontSize(9).fillColor('#78350f').text(sectionIntro, L + 14, y, { width: W - 28, lineGap: 2 });
        y += doc.heightOfString(sectionIntro, { width: W - 28 }) + 14;

        for (const qId of MIND_QUIZ_IDS) {
          const result = allMindResults.find(r => r.quiz_id === qId);
          if (!result) continue;
          const paragraph = audience === 'teacher'
            ? getTeacherParagraphEn(result)
            : getParentAdviceEn(result);
          if (!paragraph) continue;

          const nameLabel = mindQuizDisplayName[qId] || result.quiz_name;
          const subLabel = subNameEn[result.subcategory] || result.subcategory;
          let scoreLabel = '';
          if (qId === 'attention-assessment') {
            const adH = parseAdditionalData(result.additional_data);
            scoreLabel = adH?.attentionLevel ? ` \u2014 ${adH.attentionLevel}` : '';
          } else if (qId !== 'learning-styles') {
            scoreLabel = ` \u2014 ${result.percentage}%`;
          }
          const heading = `${nameLabel} (${subLabel}${scoreLabel})`;

          doc.font('Helvetica').fontSize(9);
          const paraH = doc.heightOfString(paragraph, { width: W - 28 });
          y = ensureSpace(y, paraH + 30);

          doc.save(); doc.roundedRect(L, y, W, paraH + 28, 4).fill(C.warningLt); doc.restore();
          doc.font('Helvetica-Bold').fontSize(10).fillColor('#78350f').text(heading, L + 12, y + 6, { width: W - 24 });
          y += 20;
          doc.font('Helvetica').fontSize(9).fillColor('#451a03').text(paragraph, L + 12, y, { width: W - 28, lineGap: 2 });
          y += paraH + 16;
        }
      }

      const allLearningResults = data.learningResults ?? [];
      if (allLearningResults.length > 0) {
        doc.addPage(); y = 50;

        const learningSectionTitle = audience === 'teacher'
          ? 'FOR TEACHERS: LEARNING & SOCIAL-EMOTIONAL DETAILS'
          : 'FOR PARENTS: LEARNING & SOCIAL-EMOTIONAL GUIDANCE';
        const learningSectionIntro = audience === 'teacher'
          ? 'This section summarises the student\'s learning preferences and social-emotional strengths based on their quiz results.'
          : 'This section explains your child\'s learning preferences and social-emotional strengths, with ideas to support them at home.';

        doc.save(); doc.roundedRect(L, y, W, 28, 4).fill('#ffe4e6'); doc.restore();
        doc.font('Helvetica-Bold').fontSize(12).fillColor('#9f1239').text(learningSectionTitle, L + 14, y + 7, { width: W - 28 });
        y += 36;
        doc.font('Helvetica').fontSize(9).fillColor('#9f1239').text(learningSectionIntro, L + 14, y, { width: W - 28, lineGap: 2 });
        y += doc.heightOfString(learningSectionIntro, { width: W - 28 }) + 14;

        for (const qId of LEARNING_QUIZ_IDS) {
          const result = allLearningResults.find(r => r.quiz_id === qId);
          if (!result) continue;
          const paragraph = audience === 'teacher'
            ? getLearningTeacherParagraphEn(result)
            : getLearningParentAdviceEn(result);
          if (!paragraph) continue;

          const nameLabel = learningQuizDisplayName[qId] || result.quiz_name;
          const subLabel = subNameEn[result.subcategory] || result.subcategory;
          let resultLabel = '';
          if (qId === 'learning-styles') {
            const style = getLearningStyleFromResult(result);
            if (style) resultLabel = ` — ${styleEn[style] || style}`;
          } else if (qId === 'social-emotional') {
            const ad = parseAdditionalData(result.additional_data);
            if (ad?.primaryTitle) resultLabel = ` — ${ad.primaryTitle}`;
          }
          const heading = `${nameLabel} (${subLabel}${resultLabel})`;

          doc.font('Helvetica').fontSize(9);
          const paraH = doc.heightOfString(paragraph, { width: W - 28 });
          y = ensureSpace(y, paraH + 30);

          doc.save(); doc.roundedRect(L, y, W, paraH + 28, 4).fill('#ffe4e6'); doc.restore();
          doc.font('Helvetica-Bold').fontSize(10).fillColor('#9f1239').text(heading, L + 12, y + 6, { width: W - 24 });
          y += 20;
          doc.font('Helvetica').fontSize(9).fillColor('#881337').text(paragraph, L + 12, y, { width: W - 28, lineGap: 2 });
          y += paraH + 16;
        }
      }

      pageFooter();

      // ── Teacher Summary Page (teacher audience only) ──
      if (audience === 'teacher' && (allMindResults.length > 0 || allLearningResults.length > 0)) {
        const summary = buildTeacherSummaryEn(allMindResults, data.oralResults, data.academicResults, allLearningResults);
        doc.addPage(); doc.save(); doc.rect(0, 0, pageW, 4).fill(C.blue); doc.restore();
        y = 50;

        doc.font('Helvetica-Bold').fontSize(18).fillColor(C.blue).text('Teacher Summary', L, y, { lineBreak: false });
        y += 8; doc.moveTo(L, y + 18).lineTo(L + 200, y + 18).lineWidth(2.5).strokeColor(C.blue).stroke(); y += 30;

        // 1. Cognitive Profile
        y = ensureSpace(y, 80);
        doc.save(); doc.roundedRect(L, y, W, 24, 4).fill(C.primaryLt); doc.restore();
        doc.font('Helvetica-Bold').fontSize(11).fillColor(C.primary).text('Cognitive Profile', L + 12, y + 6, { lineBreak: false });
        y += 30;
        doc.font('Helvetica').fontSize(9);
        const profileH = doc.heightOfString(summary.cognitiveProfile, { width: W - 24 });
        y = ensureSpace(y, profileH + 10);
        doc.font('Helvetica').fontSize(9).fillColor(C.gray700).text(summary.cognitiveProfile, L + 12, y, { width: W - 24, lineGap: 2 });
        y += profileH + 16;

        // 2. Classroom Observations
        y = ensureSpace(y, 60);
        doc.save(); doc.roundedRect(L, y, W, 24, 4).fill(C.emeraldLt); doc.restore();
        doc.font('Helvetica-Bold').fontSize(11).fillColor(C.emerald).text('Classroom Observations', L + 12, y + 6, { lineBreak: false });
        y += 30;
        for (const obs of summary.observations) {
          doc.font('Helvetica').fontSize(9);
          const obsH = doc.heightOfString(`\u2022  ${obs}`, { width: W - 24 });
          y = ensureSpace(y, obsH + 8);
          doc.font('Helvetica').fontSize(9).fillColor(C.gray700).text(`\u2022  ${obs}`, L + 12, y, { width: W - 24, lineGap: 2 });
          y += obsH + 8;
        }
        y += 6;

        // 3. Teaching Strategies
        y = ensureSpace(y, 60);
        doc.save(); doc.roundedRect(L, y, W, 24, 4).fill(C.secondaryLt); doc.restore();
        doc.font('Helvetica-Bold').fontSize(11).fillColor(C.secondary).text('Teaching Strategies', L + 12, y + 6, { lineBreak: false });
        y += 30;
        for (const strat of summary.strategies) {
          doc.font('Helvetica').fontSize(9);
          const stratH = doc.heightOfString(`\u2022  ${strat}`, { width: W - 24 });
          y = ensureSpace(y, stratH + 8);
          doc.font('Helvetica').fontSize(9).fillColor(C.gray700).text(`\u2022  ${strat}`, L + 12, y, { width: W - 24, lineGap: 2 });
          y += stratH + 8;
        }
        y += 6;

        // 4. Accommodations
        y = ensureSpace(y, 60);
        doc.save(); doc.roundedRect(L, y, W, 24, 4).fill(C.warningLt); doc.restore();
        doc.font('Helvetica-Bold').fontSize(11).fillColor(C.warning).text('Accommodations', L + 12, y + 6, { lineBreak: false });
        y += 30;
        for (const acc of summary.accommodations) {
          doc.font('Helvetica').fontSize(9);
          const accH = doc.heightOfString(`\u2022  ${acc}`, { width: W - 24 });
          y = ensureSpace(y, accH + 8);
          doc.font('Helvetica').fontSize(9).fillColor(C.gray700).text(`\u2022  ${acc}`, L + 12, y, { width: W - 24, lineGap: 2 });
          y += accH + 8;
        }
        y += 6;

        // 5. Goals (2)
        y = ensureSpace(y, 70);
        doc.save(); doc.roundedRect(L, y, W, 24, 4).fill(C.successLt); doc.restore();
        doc.font('Helvetica-Bold').fontSize(11).fillColor(C.success).text('Goals', L + 12, y + 6, { lineBreak: false });
        y += 30;
        summary.goals.forEach((goal, i) => {
          const goalText = `Goal ${i + 1}: ${goal}`;
          doc.font('Helvetica').fontSize(9);
          const goalH = doc.heightOfString(goalText, { width: W - 24 });
          y = ensureSpace(y, goalH + 10);
          doc.font('Helvetica').fontSize(9).fillColor(C.gray700).text(goalText, L + 12, y, { width: W - 24, lineGap: 2 });
          y += goalH + 10;
        });
        y += 6;

        // 6. Quick Tip
        doc.font('Helvetica').fontSize(9);
        const tipH = doc.heightOfString(summary.quickTip, { width: W - 36 });
        const tipBoxH = Math.max(44, tipH + 30);
        y = ensureSpace(y, tipBoxH + 10);
        doc.save(); doc.roundedRect(L, y, W, tipBoxH, 6).fill(C.blueLt); doc.roundedRect(L, y, 4, tipBoxH, 2).fill(C.blue); doc.restore();
        doc.font('Helvetica-Bold').fontSize(10).fillColor(C.blue).text('Quick Tip', L + 16, y + 8, { lineBreak: false });
        doc.font('Helvetica').fontSize(9).fillColor(C.gray700).text(summary.quickTip, L + 16, y + 22, { width: W - 32, lineGap: 2 });
        y += tipBoxH + 10;

        pageFooter();
      }

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

      const allResults = [
        ...data.mindResults,
        ...data.oralResults,
        ...data.academicResults,
        ...(data.learningResults ?? []),
      ];
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

      const parentNoteAr1 = data.audience === 'teacher'
        ? reshapeArabic('عزيزي المعلم،')
        : reshapeArabic('عزيزي ولي الأمر،');
      const parentNoteAr2 = data.audience === 'teacher'
        ? reshapeArabic('يقدم هذا التقرير نظرة تفصيلية على تقييم المهارات الإدراكية للطالب.')
        : reshapeArabic('يقدم هذا التقرير نظرة عامة على تقييم المهارات الإدراكية لطفلك.');
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
      // Learning & Social-Emotional (Arabic)
      if ((data.learningResults ?? []).length > 0) {
        doc.addPage(); doc.save(); doc.rect(0, 0, pageW, 4).fill('#e11d48'); doc.restore();
        y = 50; y = renderSectionAr(y, reshapeArabic('تقييم التعلم والاجتماعي العاطفي'), '#e11d48', data.learningResults, subNameAr); pageFooter(true);
      }

      // ── Audience-specific section (Arabic) ──
      const audience = data.audience || 'parent';
      const allMindResults = data.mindResults;
      if (allMindResults.length > 0) {
        doc.addPage(); y = 50;

        const sectionTitle = audience === 'teacher'
          ? reshapeArabic('للمعلمين: تفاصيل تقييم الإدراك')
          : reshapeArabic('لأولياء الأمور: نصائح وإرشادات');
        const sectionIntro = audience === 'teacher'
          ? reshapeArabic('يوفر هذا القسم تحليلاً تفصيلياً لأداء الطالب في جميع تقييمات العقل. تصف كل فقرة ما يقيسه الاختبار وما تشير إليه درجة الطالب للتعليم في الفصل الدراسي.')
          : reshapeArabic('يقدم هذا القسم نصائح مخصصة لكل تقييم إدراكي أكمله طفلك. تشرح كل فقرة المهارة بلغة يومية وتقترح أنشطة يمكنكم القيام بها في المنزل لدعم طفلك.');

        doc.save(); doc.roundedRect(L, y, W, 28, 4).fill(C.warningLt); doc.restore();
        doc.font('Arabic').fontSize(12).fillColor('#78350f').text(sectionTitle, L + 14, y + 7, { width: W - 28, align: 'right' });
        y += 36;
        doc.font('Arabic').fontSize(9).fillColor('#78350f').text(sectionIntro, L + 14, y, { width: W - 28, align: 'right', lineGap: 2 });
        y += doc.heightOfString(sectionIntro, { width: W - 28 }) + 14;

        for (const qId of MIND_QUIZ_IDS) {
          const result = allMindResults.find(r => r.quiz_id === qId);
          if (!result) continue;
          const paragraph = audience === 'teacher'
            ? getTeacherParagraphAr(result)
            : getParentAdviceAr(result);
          if (!paragraph) continue;

          const nameLabel = mindQuizDisplayName[qId] || result.quiz_name;
          const subLabel = subNameAr[result.subcategory] || result.subcategory;
          let scoreLabel = '';
          if (qId === 'attention-assessment') {
            const adH = parseAdditionalData(result.additional_data);
            scoreLabel = adH?.attentionLevel ? ` \u2014 ${adH.attentionLevel}` : '';
          } else if (qId !== 'learning-styles') {
            scoreLabel = ` \u2014 ${result.percentage}%`;
          }
          const heading = `(${scoreLabel}${subLabel}) ${nameLabel}`;

          doc.font('Arabic').fontSize(9);
          const paraH = doc.heightOfString(paragraph, { width: W - 28, align: 'right' });
          y = ensureSpace(y, paraH + 30, true);

          doc.save(); doc.roundedRect(L, y, W, paraH + 28, 4).fill(C.warningLt); doc.restore();
          doc.font('Arabic').fontSize(10).fillColor('#78350f').text(heading, L + 12, y + 6, { width: W - 24, align: 'right' });
          y += 20;
          doc.font('Arabic').fontSize(9).fillColor('#451a03').text(paragraph, L + 12, y, { width: W - 28, align: 'right', lineGap: 2 });
          y += paraH + 16;
        }
      }

      const allLearningResultsAr = data.learningResults ?? [];
      if (allLearningResultsAr.length > 0) {
        doc.addPage(); y = 50;

        const learningSectionTitleAr = audience === 'teacher'
          ? reshapeArabic('للمعلمين: تفاصيل التعلم والاجتماعي العاطفي')
          : reshapeArabic('لأولياء الأمور: إرشادات التعلم والاجتماعي العاطفي');
        const learningSectionIntroAr = audience === 'teacher'
          ? reshapeArabic('يلخص هذا القسم تفضيلات التعلم ونقاط القوة الاجتماعية العاطفية للطالب بناءً على نتائج الاختبارات.')
          : reshapeArabic('يشرح هذا القسم تفضيلات تعلم طفلك ونقاط قوته الاجتماعية العاطفية مع أفكار لدعمه في المنزل.');

        doc.save(); doc.roundedRect(L, y, W, 28, 4).fill('#ffe4e6'); doc.restore();
        doc.font('Arabic').fontSize(12).fillColor('#9f1239').text(learningSectionTitleAr, L + 14, y + 7, { width: W - 28, align: 'right' });
        y += 36;
        doc.font('Arabic').fontSize(9).fillColor('#9f1239').text(learningSectionIntroAr, L + 14, y, { width: W - 28, align: 'right', lineGap: 2 });
        y += doc.heightOfString(learningSectionIntroAr, { width: W - 28 }) + 14;

        for (const qId of LEARNING_QUIZ_IDS) {
          const result = allLearningResultsAr.find(r => r.quiz_id === qId);
          if (!result) continue;
          const paragraph = audience === 'teacher'
            ? getLearningTeacherParagraphAr(result)
            : getLearningParentAdviceAr(result);
          if (!paragraph) continue;

          const nameLabel = learningQuizDisplayName[qId] || result.quiz_name;
          const subLabel = subNameAr[result.subcategory] || result.subcategory;
          const heading = `(${subLabel}) ${nameLabel}`;

          doc.font('Arabic').fontSize(9);
          const paraH = doc.heightOfString(paragraph, { width: W - 28, align: 'right' });
          y = ensureSpace(y, paraH + 30, true);

          doc.save(); doc.roundedRect(L, y, W, paraH + 28, 4).fill('#ffe4e6'); doc.restore();
          doc.font('Arabic').fontSize(10).fillColor('#9f1239').text(heading, L + 12, y + 6, { width: W - 24, align: 'right' });
          y += 20;
          doc.font('Arabic').fontSize(9).fillColor('#881337').text(paragraph, L + 12, y, { width: W - 28, align: 'right', lineGap: 2 });
          y += paraH + 16;
        }
      }

      pageFooter(true);

      // ── Teacher Summary Page — Arabic (teacher audience only) ──
      if (audience === 'teacher' && (allMindResults.length > 0 || allLearningResultsAr.length > 0)) {
        const summaryAr = buildTeacherSummaryAr(allMindResults, data.oralResults, data.academicResults, allLearningResultsAr);
        doc.addPage(); doc.save(); doc.rect(0, 0, pageW, 4).fill(C.blue); doc.restore();
        y = 50;

        doc.font('Arabic').fontSize(18).fillColor(C.blue).text(reshapeArabic('ملخص للمعلم'), L, y, { width: W, align: 'right', lineBreak: false });
        y += 8; doc.moveTo(R, y + 18).lineTo(R - 200, y + 18).lineWidth(2.5).strokeColor(C.blue).stroke(); y += 30;

        // 1. Cognitive Profile
        y = ensureSpace(y, 80, true);
        doc.save(); doc.roundedRect(L, y, W, 24, 4).fill(C.primaryLt); doc.restore();
        doc.font('Arabic').fontSize(11).fillColor(C.primary).text(reshapeArabic('الملف المعرفي'), L + 12, y + 6, { width: W - 24, align: 'right', lineBreak: false });
        y += 30;
        doc.font('Arabic').fontSize(9);
        const profileArH = doc.heightOfString(summaryAr.cognitiveProfile, { width: W - 24, align: 'right' });
        y = ensureSpace(y, profileArH + 10, true);
        doc.font('Arabic').fontSize(9).fillColor(C.gray700).text(summaryAr.cognitiveProfile, L + 12, y, { width: W - 24, align: 'right', lineGap: 2 });
        y += profileArH + 16;

        // 2. Classroom Observations
        y = ensureSpace(y, 60, true);
        doc.save(); doc.roundedRect(L, y, W, 24, 4).fill(C.emeraldLt); doc.restore();
        doc.font('Arabic').fontSize(11).fillColor(C.emerald).text(reshapeArabic('ملاحظات الفصل الدراسي'), L + 12, y + 6, { width: W - 24, align: 'right', lineBreak: false });
        y += 30;
        for (const obs of summaryAr.observations) {
          doc.font('Arabic').fontSize(9);
          const obsArH = doc.heightOfString(obs + '  \u2022', { width: W - 24, align: 'right' });
          y = ensureSpace(y, obsArH + 8, true);
          doc.font('Arabic').fontSize(9).fillColor(C.gray700).text(obs + '  \u2022', L + 12, y, { width: W - 24, align: 'right', lineGap: 2 });
          y += obsArH + 8;
        }
        y += 6;

        // 3. Teaching Strategies
        y = ensureSpace(y, 60, true);
        doc.save(); doc.roundedRect(L, y, W, 24, 4).fill(C.secondaryLt); doc.restore();
        doc.font('Arabic').fontSize(11).fillColor(C.secondary).text(reshapeArabic('استراتيجيات التدريس'), L + 12, y + 6, { width: W - 24, align: 'right', lineBreak: false });
        y += 30;
        for (const strat of summaryAr.strategies) {
          doc.font('Arabic').fontSize(9);
          const stratArH = doc.heightOfString(strat + '  \u2022', { width: W - 24, align: 'right' });
          y = ensureSpace(y, stratArH + 8, true);
          doc.font('Arabic').fontSize(9).fillColor(C.gray700).text(strat + '  \u2022', L + 12, y, { width: W - 24, align: 'right', lineGap: 2 });
          y += stratArH + 8;
        }
        y += 6;

        // 4. Accommodations
        y = ensureSpace(y, 60, true);
        doc.save(); doc.roundedRect(L, y, W, 24, 4).fill(C.warningLt); doc.restore();
        doc.font('Arabic').fontSize(11).fillColor(C.warning).text(reshapeArabic('التسهيلات'), L + 12, y + 6, { width: W - 24, align: 'right', lineBreak: false });
        y += 30;
        for (const acc of summaryAr.accommodations) {
          doc.font('Arabic').fontSize(9);
          const accArH = doc.heightOfString(acc + '  \u2022', { width: W - 24, align: 'right' });
          y = ensureSpace(y, accArH + 8, true);
          doc.font('Arabic').fontSize(9).fillColor(C.gray700).text(acc + '  \u2022', L + 12, y, { width: W - 24, align: 'right', lineGap: 2 });
          y += accArH + 8;
        }
        y += 6;

        // 5. Goals (2)
        y = ensureSpace(y, 70, true);
        doc.save(); doc.roundedRect(L, y, W, 24, 4).fill(C.successLt); doc.restore();
        doc.font('Arabic').fontSize(11).fillColor(C.success).text(reshapeArabic('الأهداف'), L + 12, y + 6, { width: W - 24, align: 'right', lineBreak: false });
        y += 30;
        summaryAr.goals.forEach((goal, i) => {
          const label = reshapeArabic(`الهدف ${i + 1}: `) + goal;
          doc.font('Arabic').fontSize(9);
          const goalArH = doc.heightOfString(label, { width: W - 24, align: 'right' });
          y = ensureSpace(y, goalArH + 10, true);
          doc.font('Arabic').fontSize(9).fillColor(C.gray700).text(label, L + 12, y, { width: W - 24, align: 'right', lineGap: 2 });
          y += goalArH + 10;
        });
        y += 6;

        // 6. Quick Tip
        doc.font('Arabic').fontSize(9);
        const tipArH = doc.heightOfString(summaryAr.quickTip, { width: W - 36, align: 'right' });
        const tipBoxArH = Math.max(44, tipArH + 30);
        y = ensureSpace(y, tipBoxArH + 10, true);
        doc.save(); doc.roundedRect(L, y, W, tipBoxArH, 6).fill(C.blueLt); doc.roundedRect(R - 4, y, 4, tipBoxArH, 2).fill(C.blue); doc.restore();
        doc.font('Arabic').fontSize(10).fillColor(C.blue).text(reshapeArabic('نصيحة سريعة'), L + 12, y + 8, { width: W - 28, align: 'right', lineBreak: false });
        doc.font('Arabic').fontSize(9).fillColor(C.gray700).text(summaryAr.quickTip, L + 12, y + 22, { width: W - 32, align: 'right', lineGap: 2 });
        y += tipBoxArH + 10;

        pageFooter(true);
      }

      doc.end();
    } catch (error) { reject(error); }
  });
}

/** Alias kept for backward compatibility (admin routes use this name). */
export const generateReportPDF = generateEnglishPDF;
