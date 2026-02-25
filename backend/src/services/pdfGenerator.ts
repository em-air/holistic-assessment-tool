import PDFDocument from 'pdfkit';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import type { Profile, QuizResult } from '../types/database.js';

// @ts-ignore — arabic-reshaper has no type declarations
import ArabicReshaper from 'arabic-reshaper';

// ── Arabic font cache (loaded once from local file, fallback to CDN) ──
let _arabicFontCache: Buffer | null = null;

/**
 * Reshape Arabic text so that PDFKit can render connected glyphs correctly.
 * Converts Unicode Arabic (U+0600-U+06FF) to Arabic Presentation Forms B
 * (U+FE70-U+FEFF) which embed the correct initial/medial/final/isolated shapes.
 * Non-Arabic characters (Latin, numbers, punctuation) pass through unchanged.
 */
function reshapeArabic(text: string): string {
  if (!text) return text;
  try {
    return ArabicReshaper.convertArabic(text);
  } catch {
    return text; // Fallback to original text if reshaping fails
  }
}

function getLocalFontPath(): string {
  // CJS: __dirname is available
  if (typeof __dirname !== 'undefined') {
    return join(__dirname, 'fonts', 'NotoSansArabic-Regular.ttf');
  }
  // Fallback: use process.cwd() (Railway/Docker)
  return join(process.cwd(), 'dist', 'fonts', 'NotoSansArabic-Regular.ttf');
}

async function getArabicFontBuffer(): Promise<Buffer | null> {
  if (_arabicFontCache) return _arabicFontCache;

  // 1. Try local font file first (bundled with backend)
  try {
    const localPath = getLocalFontPath();
    if (existsSync(localPath)) {
      _arabicFontCache = readFileSync(localPath);
      console.log('Arabic font loaded from local file:', localPath);
      return _arabicFontCache;
    }
  } catch (err) {
    console.warn('Failed to load local Arabic font:', err);
  }

  // 2. Fallback: download from CDN
  const urls = [
    'https://raw.githubusercontent.com/google/fonts/main/ofl/notosansarabic/NotoSansArabic%5Bwdth%2Cwght%5D.ttf',
    'https://github.com/googlefonts/noto-fonts/raw/main/hinted/ttf/NotoSansArabic/NotoSansArabic-Regular.ttf',
    'https://cdn.jsdelivr.net/gh/googlefonts/noto-fonts@main/hinted/ttf/NotoSansArabic/NotoSansArabic-Regular.ttf',
  ];
  for (const url of urls) {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const arrayBuffer = await response.arrayBuffer();
      _arabicFontCache = Buffer.from(arrayBuffer);
      console.log('Arabic font downloaded from CDN:', url);
      return _arabicFontCache;
    } catch (err) {
      console.warn(`Failed to download Arabic font from ${url}:`, err);
    }
  }

  console.error('All Arabic font sources failed — Arabic PDF section will be skipped');
  return null;
}

export interface ReportData {
  profile: Profile;
  mindResults: QuizResult[];
  oralResults: QuizResult[];
  academicResults: QuizResult[];
  generatedAt: Date;
}

interface CategorySummary {
  completed: number;
  total: number;
  averageScore: number;
  subcategories: Record<string, { quizzes: QuizResult[]; averageScore: number }>;
}

// Color palette
const colors = {
  primary: '#6366f1',
  secondary: '#8b5cf6',
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
  gray: '#6b7280',
  lightGray: '#f3f4f6',
  dark: '#1f2937',
  white: '#ffffff',
};

/**
 * Get performance level based on percentage
 */
function getPerformanceLevel(percentage: number): { level: string; color: string } {
  if (percentage >= 90) return { level: 'Excellent', color: colors.success };
  if (percentage >= 75) return { level: 'Good', color: '#3b82f6' };
  if (percentage >= 60) return { level: 'Satisfactory', color: colors.warning };
  return { level: 'Needs Improvement', color: colors.danger };
}

function getPerformanceLevelAr(percentage: number): { level: string; color: string } {
  if (percentage >= 90) return { level: reshapeArabic('ممتاز'), color: colors.success };
  if (percentage >= 75) return { level: reshapeArabic('جيد'), color: '#3b82f6' };
  if (percentage >= 60) return { level: reshapeArabic('مُرضٍ'), color: colors.warning };
  return { level: reshapeArabic('يحتاج تحسين'), color: colors.danger };
}

/**
 * Generate recommendations based on results
 */
function generateRecommendations(
  mindResults: QuizResult[],
  oralResults: QuizResult[],
  academicResults: QuizResult[]
): { strengths: string[]; improvements: string[]; activities: string[] } {
  const strengths: string[] = [];
  const improvements: string[] = [];
  const activities: string[] = [];

  const allResults = [...mindResults, ...oralResults, ...academicResults];

  // Strengths: Results with >= 85%
  const highPerformers = allResults.filter(r => r.percentage >= 85);
  for (const result of highPerformers) {
    strengths.push(`${result.quiz_name}: Excellent performance showing mastery in this area`);
  }

  if (highPerformers.length === 0 && allResults.length > 0) {
    strengths.push('Your child is developing their skills across all areas assessed');
  }

  // Areas for Improvement: Results with < 75%
  const needsSupport = allResults.filter(r => r.percentage < 75);
  for (const result of needsSupport) {
    const subcategoryName = getSubcategoryDisplayName(result.subcategory);
    improvements.push(`${subcategoryName}: Consider additional practice and support`);
  }

  if (needsSupport.length === 0 && allResults.length > 0) {
    improvements.push('Your child shows consistent performance across all assessed areas');
  }

  // General Recommendations (matching frontend)
  activities.push('Encourage regular practice in areas where scores were below 75%');
  activities.push('Celebrate successes and maintain motivation for continued learning');
  activities.push('Consider educational games and activities that target specific skill areas');
  activities.push("Discuss results with your child's teacher for additional classroom support");
  activities.push('Re-assess periodically to track improvement over time');

  return { strengths, improvements, activities };
}

/**
 * Safely parse additional_data (could be string or object)
 */
function parseAdditionalData(data: any): Record<string, any> | null {
  if (!data) return null;
  if (typeof data === 'string') {
    try { return JSON.parse(data); } catch { return null; }
  }
  return data;
}

/**
 * Get English attention level label from percentage
 */
function getAttentionLevelEn(pct: number): string {
  if (pct >= 75) return 'Strong Focus';
  if (pct >= 60) return 'Moderate Focus';
  return 'Developing Focus';
}

/**
 * Get Arabic attention level label from percentage
 */
function getAttentionLevelAr(pct: number): string {
  if (pct >= 75) return reshapeArabic('\u062A\u0631\u0643\u064A\u0632 \u0642\u0648\u064A');
  if (pct >= 60) return reshapeArabic('\u062A\u0631\u0643\u064A\u0632 \u0645\u062A\u0648\u0633\u0637');
  return reshapeArabic('\u062A\u0631\u0643\u064A\u0632 \u0642\u064A\u062F \u0627\u0644\u062A\u0637\u0648\u064A\u0631');
}

/** Shared style name maps */
const enStyleNames: Record<string, string> = {
  'visual': 'Visual Learner',
  'auditory': 'Auditory Learner',
  'reading-writing': 'Reading/Writing Learner',
  'kinesthetic': 'Kinesthetic Learner',
};
const arStyleNames: Record<string, string> = {
  'visual': reshapeArabic('\u0645\u062A\u0639\u0644\u0645 \u0628\u0635\u0631\u064A'),
  'auditory': reshapeArabic('\u0645\u062A\u0639\u0644\u0645 \u0633\u0645\u0639\u064A'),
  'reading-writing': reshapeArabic('\u0645\u062A\u0639\u0644\u0645 \u0642\u0631\u0627\u0626\u064A/\u0643\u062A\u0627\u0628\u064A'),
  'kinesthetic': reshapeArabic('\u0645\u062A\u0639\u0644\u0645 \u062D\u0631\u0643\u064A'),
};

/**
 * Get display name for subcategory
 */
function getSubcategoryDisplayName(subcategory: string): string {
  const names: Record<string, string> = {
    'attention': 'Attention & Focus',
    'memory': 'Memory & Recall',
    'learning-style': 'Learning Style',
    'critical-thinking': 'Critical Thinking',
    'perception': 'Visual Perception',
    'oral-language': 'Oral Language',
    'reading': 'Reading Skills',
    'phonics': 'Phonics Awareness',
    'phonics-awareness': 'Phonics Awareness',
    'blending-segmenting': 'Blending & Segmenting',
    'writing': 'Writing Skills',
    'vocabulary': 'Vocabulary',
    'spelling': 'Spelling',
  };
  return names[subcategory] || subcategory;
}

/**
 * Generate PDF report buffer
 */
export async function generateReportPDF(data: ReportData): Promise<Buffer> {
  // Pre-load Arabic font for bilingual report
  const arabicFontBuffer = await getArabicFontBuffer();

  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 50, bottom: 50, left: 50, right: 50 },
        info: {
          Title: `Assessment Report - ${data.profile.student_name || 'Student'}`,
          Author: 'Holistic Assessment Tool',
          Subject: 'Cognitive Skills Assessment Report',
        },
      });

      const chunks: Buffer[] = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Register Arabic font if available
      if (arabicFontBuffer) {
        doc.registerFont('NotoSansArabic', arabicFontBuffer);
      }

      const pageWidth = doc.page.width - 100;
      let yPos = 50;

      // ============= PAGE 1: Cover & Summary =============
      
      // Header
      doc.fontSize(28).fillColor(colors.primary).text('Assessment Report', 50, yPos, { align: 'center' });
      yPos += 40;

      // Student info
      doc.fontSize(18).fillColor(colors.dark).text(data.profile.student_name || 'Student', 50, yPos, { align: 'center' });
      yPos += 25;
      
      if (data.profile.grade) {
        doc.fontSize(14).fillColor(colors.gray).text(data.profile.grade, 50, yPos, { align: 'center' });
        yPos += 20;
      }

      doc.fontSize(12).fillColor(colors.gray).text(
        `Generated: ${data.generatedAt.toLocaleDateString('en-US', { 
          year: 'numeric', month: 'long', day: 'numeric' 
        })}`,
        50, yPos, { align: 'center' }
      );
      yPos += 50;

      // Divider
      doc.moveTo(50, yPos).lineTo(pageWidth + 50, yPos).strokeColor(colors.lightGray).stroke();
      yPos += 30;

      // Summary Section
      doc.fontSize(16).fillColor(colors.dark).text('Assessment Summary', 50, yPos);
      yPos += 30;

      // Calculate overall stats
      const allResults = [...data.mindResults, ...data.oralResults, ...data.academicResults];
      const totalCompleted = allResults.length;
      const overallAverage = totalCompleted > 0
        ? Math.round(allResults.reduce((sum, r) => sum + r.percentage, 0) / totalCompleted)
        : 0;
      const totalTime = allResults.reduce((sum, r) => sum + (r.time_spent || 0), 0);

      // Summary boxes
      const boxWidth = (pageWidth - 30) / 4;
      const summaryItems = [
        { label: 'Quizzes Completed', value: totalCompleted.toString() },
        { label: 'Overall Score', value: `${overallAverage}%` },
        { label: 'Mind Skills', value: `${data.mindResults.length} completed` },
        { label: 'Time Invested', value: `${Math.round(totalTime / 60)} min` },
      ];

      summaryItems.forEach((item, index) => {
        const x = 50 + (index * (boxWidth + 10));
        doc.rect(x, yPos, boxWidth, 60).fillColor(colors.lightGray).fill();
        doc.fontSize(18).fillColor(colors.primary).text(item.value, x, yPos + 12, { width: boxWidth, align: 'center' });
        doc.fontSize(9).fillColor(colors.gray).text(item.label, x, yPos + 38, { width: boxWidth, align: 'center' });
      });
      yPos += 90;

      // Parent Note
      doc.rect(50, yPos, pageWidth, 80).fillColor('#f0f9ff').fill();
      doc.rect(50, yPos, 4, 80).fillColor(colors.primary).fill();
      doc.fontSize(11).fillColor(colors.dark).text(
        'Dear Parent/Guardian,\n\nThis report provides an overview of your child\'s cognitive skills assessment. ' +
        'The scores reflect performance across various cognitive areas including attention, memory, critical thinking, ' +
        'and language skills. Please review the recommendations section for suggested activities.',
        60, yPos + 12, { width: pageWidth - 20 }
      );
      yPos += 100;

      // Performance level indicator
      const performance = getPerformanceLevel(overallAverage);
      doc.fontSize(14).fillColor(colors.dark).text('Overall Performance: ', 50, yPos);
      doc.fontSize(14).fillColor(performance.color).text(performance.level, 180, yPos);
      yPos += 40;

      // ============= PAGE 2: Mind Skills =============
      doc.addPage();
      yPos = 50;

      doc.fontSize(20).fillColor(colors.primary).text('Mind Skills Assessment', 50, yPos);
      yPos += 35;

      const mindSubcategories: Record<string, QuizResult[]> = {};
      data.mindResults.forEach(r => {
        if (!mindSubcategories[r.subcategory]) {
          mindSubcategories[r.subcategory] = [];
        }
        mindSubcategories[r.subcategory].push(r);
      });

      const subcategoryNames: Record<string, string> = {
        'attention': 'Attention & Focus',
        'memory': 'Memory & Recall',
        'learning-style': 'Learning Style',
        'critical-thinking': 'Critical Thinking',
        'perception': 'Visual Perception',
      };

      for (const [subcategory, results] of Object.entries(mindSubcategories)) {
        if (yPos > 700) {
          doc.addPage();
          yPos = 50;
        }

        const avgScore = Math.round(results.reduce((sum, r) => sum + r.percentage, 0) / results.length);
        const perfLevel = getPerformanceLevel(avgScore);

        // Subcategory header
        doc.rect(50, yPos, pageWidth, 30).fillColor(colors.lightGray).fill();
        doc.fontSize(14).fillColor(colors.dark).text(
          subcategoryNames[subcategory] || subcategory, 
          60, yPos + 8
        );
        
        // For qualitative subcategories, show labels instead of percentage
        if (subcategory === 'learning-style' && results.length > 0) {
          const learningResult = results[0];
          const additionalData = parseAdditionalData(learningResult.additional_data);
          if (additionalData?.dominantStyle) {
            const styleName = enStyleNames[additionalData.dominantStyle] || 
              `${additionalData.dominantStyle.charAt(0).toUpperCase() + additionalData.dominantStyle.slice(1)} Learner`;
            doc.fontSize(14).fillColor(perfLevel.color).text(styleName, pageWidth - 20, yPos + 8, { align: 'right' });
          } else {
            doc.fontSize(14).fillColor(perfLevel.color).text(`${avgScore}%`, pageWidth - 20, yPos + 8, { align: 'right' });
          }
        } else if (subcategory === 'attention' && results.length > 0) {
          const attnResult = results[0];
          const additionalData = parseAdditionalData(attnResult.additional_data);
          const attnLevel = additionalData?.attentionLevel || getAttentionLevelEn(attnResult.percentage);
          doc.fontSize(14).fillColor(perfLevel.color).text(attnLevel, pageWidth - 20, yPos + 8, { align: 'right' });
        } else {
          doc.fontSize(14).fillColor(perfLevel.color).text(`${avgScore}%`, pageWidth - 20, yPos + 8, { align: 'right' });
        }
        yPos += 40;

        // Individual quiz results
        for (const result of results) {
          const quizPerf = getPerformanceLevel(result.percentage);
          const categoryLabel = subcategoryNames[subcategory] || subcategory;
          doc.fontSize(11).fillColor(colors.dark).text(`• ${result.quiz_name} (${categoryLabel})`, 70, yPos);
          
          // Special handling for qualitative quizzes
          if (subcategory === 'learning-style') {
            const additionalData = parseAdditionalData(result.additional_data);
            if (additionalData?.dominantStyle) {
              const styleName = enStyleNames[additionalData.dominantStyle] || 
                `${additionalData.dominantStyle.charAt(0).toUpperCase() + additionalData.dominantStyle.slice(1)} Learner`;
              doc.fontSize(11).fillColor(quizPerf.color).text(
                styleName,
                pageWidth - 50, yPos, { align: 'right' }
              );
            } else {
              doc.fontSize(11).fillColor(quizPerf.color).text(
                `${result.score}/${result.total_questions} (${result.percentage}%)`,
                pageWidth - 50, yPos, { align: 'right' }
              );
            }
          } else if (result.quiz_id === 'attention-assessment' || subcategory === 'attention') {
            const additionalData = parseAdditionalData(result.additional_data);
            const attnLevel = additionalData?.attentionLevel || getAttentionLevelEn(result.percentage);
            doc.fontSize(11).fillColor(quizPerf.color).text(
              attnLevel,
              pageWidth - 50, yPos, { align: 'right' }
            );
          } else {
            doc.fontSize(11).fillColor(quizPerf.color).text(
              `${result.score}/${result.total_questions} (${result.percentage}%)`,
              pageWidth - 50, yPos, { align: 'right' }
            );
          }
          yPos += 20;
        }
        yPos += 15;
      }

      // ============= PAGE 3: Oral Skills =============
      if (data.oralResults.length > 0) {
        doc.addPage();
        yPos = 50;

        doc.fontSize(20).fillColor(colors.secondary).text('Oral Skills Assessment', 50, yPos);
        yPos += 35;

        const oralSubcategories: Record<string, QuizResult[]> = {};
        data.oralResults.forEach(r => {
          if (!oralSubcategories[r.subcategory]) {
            oralSubcategories[r.subcategory] = [];
          }
          oralSubcategories[r.subcategory].push(r);
        });

        const oralNames: Record<string, string> = {
          'oral-language': 'Oral Language',
          'reading': 'Reading Skills',
          'phonics': 'Phonics Awareness',
          'blending-segmenting': 'Blending & Segmenting',
        };

        for (const [subcategory, results] of Object.entries(oralSubcategories)) {
          if (yPos > 700) {
            doc.addPage();
            yPos = 50;
          }

          const avgScore = Math.round(results.reduce((sum, r) => sum + r.percentage, 0) / results.length);
          const perfLevel = getPerformanceLevel(avgScore);

          doc.rect(50, yPos, pageWidth, 30).fillColor(colors.lightGray).fill();
          doc.fontSize(14).fillColor(colors.dark).text(oralNames[subcategory] || subcategory, 60, yPos + 8);
          doc.fontSize(14).fillColor(perfLevel.color).text(`${avgScore}%`, pageWidth - 20, yPos + 8, { align: 'right' });
          yPos += 40;

          for (const result of results) {
            const quizPerf = getPerformanceLevel(result.percentage);
            const categoryLabel = oralNames[subcategory] || subcategory;
            doc.fontSize(11).fillColor(colors.dark).text(`• ${result.quiz_name} (${categoryLabel})`, 70, yPos);
            doc.fontSize(11).fillColor(quizPerf.color).text(
              `${result.score}/${result.total_questions} (${result.percentage}%)`,
              pageWidth - 50, yPos, { align: 'right' }
            );
            yPos += 20;
          }
          yPos += 15;
        }
      }

      // ============= PAGE 4: Academic Skills =============
      if (data.academicResults.length > 0) {
        doc.addPage();
        yPos = 50;

        doc.fontSize(20).fillColor('#059669').text('Academic Skills Assessment', 50, yPos);
        yPos += 35;

        const academicSubcategories: Record<string, QuizResult[]> = {};
        data.academicResults.forEach(r => {
          if (!academicSubcategories[r.subcategory]) {
            academicSubcategories[r.subcategory] = [];
          }
          academicSubcategories[r.subcategory].push(r);
        });

        const academicNames: Record<string, string> = {
          'writing': 'Writing Skills',
          'vocabulary': 'Vocabulary',
          'spelling': 'Spelling',
        };

        for (const [subcategory, results] of Object.entries(academicSubcategories)) {
          if (yPos > 700) {
            doc.addPage();
            yPos = 50;
          }

          const avgScore = Math.round(results.reduce((sum, r) => sum + r.percentage, 0) / results.length);
          const perfLevel = getPerformanceLevel(avgScore);

          doc.rect(50, yPos, pageWidth, 30).fillColor(colors.lightGray).fill();
          doc.fontSize(14).fillColor(colors.dark).text(academicNames[subcategory] || subcategory, 60, yPos + 8);
          doc.fontSize(14).fillColor(perfLevel.color).text(`${avgScore}%`, pageWidth - 20, yPos + 8, { align: 'right' });
          yPos += 40;

          for (const result of results) {
            const quizPerf = getPerformanceLevel(result.percentage);
            const categoryLabel = academicNames[subcategory] || subcategory;
            doc.fontSize(11).fillColor(colors.dark).text(`• ${result.quiz_name} (${categoryLabel})`, 70, yPos);
            doc.fontSize(11).fillColor(quizPerf.color).text(
              `${result.score}/${result.total_questions} (${result.percentage}%)`,
              pageWidth - 50, yPos, { align: 'right' }
            );
            yPos += 20;
          }
          yPos += 15;
        }
      }

      // ============= FINAL PAGE: Recommendations =============
      doc.addPage();
      yPos = 50;

      doc.fontSize(20).fillColor(colors.success).text('Recommendations', 50, yPos);
      yPos += 35;

      const recommendations = generateRecommendations(
        data.mindResults,
        data.oralResults,
        data.academicResults
      );

      // Strengths
      doc.rect(50, yPos, pageWidth, 25).fillColor('#f0fdf4').fill();
      doc.fontSize(14).fillColor('#166534').text('💪 Strengths Identified', 60, yPos + 6);
      yPos += 35;

      for (const strength of recommendations.strengths) {
        doc.fontSize(11).fillColor(colors.dark).text(`• ${strength}`, 70, yPos);
        yPos += 20;
      }
      yPos += 15;

      // Areas for Improvement
      doc.rect(50, yPos, pageWidth, 25).fillColor('#fef3c7').fill();
      doc.fontSize(14).fillColor('#92400e').text('📈 Areas for Growth', 60, yPos + 6);
      yPos += 35;

      for (const improvement of recommendations.improvements) {
        doc.fontSize(11).fillColor(colors.dark).text(`• ${improvement}`, 70, yPos);
        yPos += 20;
      }
      yPos += 15;

      // Suggested Activities
      doc.rect(50, yPos, pageWidth, 25).fillColor('#dbeafe').fill();
      doc.fontSize(14).fillColor('#1e40af').text('🎯 Suggested Activities', 60, yPos + 6);
      yPos += 35;

      for (const activity of recommendations.activities) {
        doc.fontSize(11).fillColor(colors.dark).text(`• ${activity}`, 70, yPos);
        yPos += 20;
      }
      yPos += 30;

      // Footer with watermark
      doc.fontSize(10).fillColor(colors.gray).text(
        'Generated by Holistic Assessment Tool | Bloom Tutoring',
        50, doc.page.height - 50, { align: 'center', width: pageWidth }
      );

      // ============= ARABIC SECTION — النسخة العربية =============
      if (arabicFontBuffer) {
        try {
          // --- Arabic Cover & Summary ---
          doc.addPage();
          yPos = 50;
          doc.font('NotoSansArabic');

          // Section divider
          doc.fontSize(14).fillColor(colors.primary).text(
            reshapeArabic('النسخة العربية') + ' — Arabic Version', 50, yPos, { align: 'center', width: pageWidth }
          );
          yPos += 30;

          // Title
          doc.fontSize(28).fillColor(colors.primary).text(reshapeArabic('تقرير التقييم'), 50, yPos, { align: 'center', width: pageWidth });
          yPos += 40;

          // Student name
          doc.fontSize(18).fillColor(colors.dark).text(
            data.profile.student_name || reshapeArabic('الطالب'), 50, yPos, { align: 'center', width: pageWidth }
          );
          yPos += 25;

          if (data.profile.grade) {
            doc.fontSize(14).fillColor(colors.gray).text(data.profile.grade, 50, yPos, { align: 'center', width: pageWidth });
            yPos += 20;
          }

          doc.fontSize(12).fillColor(colors.gray).text(
            reshapeArabic(`تاريخ الإصدار: ${data.generatedAt.toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' })}`),
            50, yPos, { align: 'center', width: pageWidth }
          );
          yPos += 50;

          // Divider
          doc.moveTo(50, yPos).lineTo(pageWidth + 50, yPos).strokeColor(colors.lightGray).stroke();
          yPos += 30;

          // Summary heading
          doc.fontSize(16).fillColor(colors.dark).text(reshapeArabic('ملخص التقييم'), 50, yPos, { align: 'right', width: pageWidth });
          yPos += 30;

          // Summary boxes
          const arSummaryItems = [
            { label: reshapeArabic('الاختبارات المكتملة'), value: totalCompleted.toString() },
            { label: reshapeArabic('الدرجة الكلية'), value: `%${overallAverage}` },
            { label: reshapeArabic('المهارات الذهنية'), value: reshapeArabic(`${data.mindResults.length} مكتمل`) },
            { label: reshapeArabic('الوقت المستغرق'), value: reshapeArabic(`${Math.round(totalTime / 60)} دقيقة`) },
          ];

          arSummaryItems.forEach((item, index) => {
            const x = 50 + (index * (boxWidth + 10));
            doc.rect(x, yPos, boxWidth, 60).fillColor(colors.lightGray).fill();
            doc.font('NotoSansArabic').fontSize(18).fillColor(colors.primary).text(item.value, x, yPos + 12, { width: boxWidth, align: 'center' });
            doc.font('NotoSansArabic').fontSize(9).fillColor(colors.gray).text(item.label, x, yPos + 38, { width: boxWidth, align: 'center' });
          });
          yPos += 90;

          // Parent Note
          doc.rect(50, yPos, pageWidth, 80).fillColor('#f0f9ff').fill();
          doc.rect(pageWidth + 50 - 4, yPos, 4, 80).fillColor(colors.primary).fill();
          doc.font('NotoSansArabic').fontSize(11).fillColor(colors.dark).text(
            reshapeArabic('عزيزي ولي الأمر،') + '\n\n' + reshapeArabic('يقدم هذا التقرير نظرة عامة على تقييم المهارات الإدراكية لطفلك. تعكس الدرجات الأداء في مختلف المجالات الإدراكية بما في ذلك الانتباه والذاكرة والتفكير النقدي والمهارات اللغوية.'),
            60, yPos + 12, { width: pageWidth - 20, align: 'right' }
          );
          yPos += 100;

          // Performance level
          const arPerf = getPerformanceLevelAr(overallAverage);
          doc.font('NotoSansArabic').fontSize(14).fillColor(arPerf.color).text(
            reshapeArabic('الأداء العام: ') + arPerf.level, 50, yPos, { align: 'right', width: pageWidth }
          );
          yPos += 40;

          // --- Arabic subcategory name maps ---
          const arSubNames: Record<string, string> = {
            'attention': reshapeArabic('الانتباه والتركيز'),
            'memory': reshapeArabic('الذاكرة والاسترجاع'),
            'learning-style': reshapeArabic('أسلوب التعلم'),
            'critical-thinking': reshapeArabic('التفكير النقدي'),
            'perception': reshapeArabic('الإدراك البصري'),
          };
          const arOralNames: Record<string, string> = {
            'oral-language': reshapeArabic('اللغة الشفهية'),
            'reading': reshapeArabic('مهارات القراءة'),
            'phonics': reshapeArabic('الوعي الصوتي'),
            'blending-segmenting': reshapeArabic('الدمج والتقسيم'),
          };
          const arAcadNames: Record<string, string> = {
            'writing': reshapeArabic('مهارات الكتابة'),
            'vocabulary': reshapeArabic('المفردات'),
            'spelling': reshapeArabic('الإملاء'),
          };

          // --- Arabic Mind Skills ---
          if (data.mindResults.length > 0) {
            doc.addPage();
            yPos = 50;
            doc.font('NotoSansArabic');
            doc.fontSize(20).fillColor(colors.primary).text(reshapeArabic('تقييم المهارات الذهنية'), 50, yPos, { align: 'right', width: pageWidth });
            yPos += 35;

            const arMindSubs: Record<string, QuizResult[]> = {};
            data.mindResults.forEach(r => {
              if (!arMindSubs[r.subcategory]) arMindSubs[r.subcategory] = [];
              arMindSubs[r.subcategory].push(r);
            });

            for (const [sub, subResults] of Object.entries(arMindSubs)) {
              if (yPos > 700) { doc.addPage(); yPos = 50; doc.font('NotoSansArabic'); }
              const avg = Math.round(subResults.reduce((s, r) => s + r.percentage, 0) / subResults.length);
              const pLvl = getPerformanceLevel(avg);

              doc.rect(50, yPos, pageWidth, 30).fillColor(colors.lightGray).fill();
              doc.font('NotoSansArabic').fontSize(14).fillColor(colors.dark).text(
                arSubNames[sub] || sub, 60, yPos + 8, { width: pageWidth - 80, align: 'right' }
              );

              if (sub === 'learning-style' && subResults.length > 0) {
                const ad = parseAdditionalData(subResults[0].additional_data);
                if (ad?.dominantStyle) {
                  doc.font('NotoSansArabic').fontSize(14).fillColor(pLvl.color).text(
                    arStyleNames[ad.dominantStyle] || ad.dominantStyle, 60, yPos + 8
                  );
                } else {
                  doc.font('NotoSansArabic').fontSize(14).fillColor(pLvl.color).text(`%${avg}`, 60, yPos + 8);
                }
              } else if (sub === 'attention' && subResults.length > 0) {
                const ad = parseAdditionalData(subResults[0].additional_data);
                const attnLvl = ad?.attentionLevel ? getAttentionLevelAr(subResults[0].percentage) : getAttentionLevelAr(subResults[0].percentage);
                doc.font('NotoSansArabic').fontSize(14).fillColor(pLvl.color).text(attnLvl, 60, yPos + 8);
              } else {
                doc.font('NotoSansArabic').fontSize(14).fillColor(pLvl.color).text(`%${avg}`, 60, yPos + 8);
              }
              yPos += 40;

              for (const result of subResults) {
                const qp = getPerformanceLevel(result.percentage);
                doc.font('NotoSansArabic').fontSize(11).fillColor(colors.dark).text(
                  `• ${result.quiz_name} (${arSubNames[sub] || sub})`, 70, yPos, { width: pageWidth - 90, align: 'right' }
                );
                if (sub === 'learning-style') {
                  const ad = parseAdditionalData(result.additional_data);
                  if (ad?.dominantStyle) {
                    doc.font('NotoSansArabic').fontSize(11).fillColor(qp.color).text(
                      arStyleNames[ad.dominantStyle] || ad.dominantStyle, 60, yPos
                    );
                  } else {
                    doc.font('NotoSansArabic').fontSize(11).fillColor(qp.color).text(
                      `%${result.percentage} (${result.total_questions}/${result.score})`, 60, yPos
                    );
                  }
                } else if (result.quiz_id === 'attention-assessment' || sub === 'attention') {
                  const attnLvl = getAttentionLevelAr(result.percentage);
                  doc.font('NotoSansArabic').fontSize(11).fillColor(qp.color).text(attnLvl, 60, yPos);
                } else {
                  doc.font('NotoSansArabic').fontSize(11).fillColor(qp.color).text(
                    `%${result.percentage} (${result.total_questions}/${result.score})`, 60, yPos
                  );
                }
                yPos += 20;
              }
              yPos += 15;
            }
          }

          // --- Arabic Oral Skills ---
          if (data.oralResults.length > 0) {
            doc.addPage();
            yPos = 50;
            doc.font('NotoSansArabic');
            doc.fontSize(20).fillColor(colors.secondary).text(reshapeArabic('تقييم المهارات الشفهية'), 50, yPos, { align: 'right', width: pageWidth });
            yPos += 35;

            const arOralSubs: Record<string, QuizResult[]> = {};
            data.oralResults.forEach(r => {
              if (!arOralSubs[r.subcategory]) arOralSubs[r.subcategory] = [];
              arOralSubs[r.subcategory].push(r);
            });

            for (const [sub, subResults] of Object.entries(arOralSubs)) {
              if (yPos > 700) { doc.addPage(); yPos = 50; doc.font('NotoSansArabic'); }
              const avg = Math.round(subResults.reduce((s, r) => s + r.percentage, 0) / subResults.length);
              const pLvl = getPerformanceLevel(avg);

              doc.rect(50, yPos, pageWidth, 30).fillColor(colors.lightGray).fill();
              doc.font('NotoSansArabic').fontSize(14).fillColor(colors.dark).text(arOralNames[sub] || sub, 60, yPos + 8, { width: pageWidth - 80, align: 'right' });
              doc.font('NotoSansArabic').fontSize(14).fillColor(pLvl.color).text(`%${avg}`, 60, yPos + 8);
              yPos += 40;

              for (const result of subResults) {
                const qp = getPerformanceLevel(result.percentage);
                doc.font('NotoSansArabic').fontSize(11).fillColor(colors.dark).text(
                  `• ${result.quiz_name} (${arOralNames[sub] || sub})`, 70, yPos, { width: pageWidth - 90, align: 'right' }
                );
                doc.font('NotoSansArabic').fontSize(11).fillColor(qp.color).text(
                  `%${result.percentage} (${result.total_questions}/${result.score})`, 60, yPos
                );
                yPos += 20;
              }
              yPos += 15;
            }
          }

          // --- Arabic Academic Skills ---
          if (data.academicResults.length > 0) {
            doc.addPage();
            yPos = 50;
            doc.font('NotoSansArabic');
            doc.fontSize(20).fillColor('#059669').text(reshapeArabic('تقييم المهارات الأكاديمية'), 50, yPos, { align: 'right', width: pageWidth });
            yPos += 35;

            const arAcadSubs: Record<string, QuizResult[]> = {};
            data.academicResults.forEach(r => {
              if (!arAcadSubs[r.subcategory]) arAcadSubs[r.subcategory] = [];
              arAcadSubs[r.subcategory].push(r);
            });

            for (const [sub, subResults] of Object.entries(arAcadSubs)) {
              if (yPos > 700) { doc.addPage(); yPos = 50; doc.font('NotoSansArabic'); }
              const avg = Math.round(subResults.reduce((s, r) => s + r.percentage, 0) / subResults.length);
              const pLvl = getPerformanceLevel(avg);

              doc.rect(50, yPos, pageWidth, 30).fillColor(colors.lightGray).fill();
              doc.font('NotoSansArabic').fontSize(14).fillColor(colors.dark).text(arAcadNames[sub] || sub, 60, yPos + 8, { width: pageWidth - 80, align: 'right' });
              doc.font('NotoSansArabic').fontSize(14).fillColor(pLvl.color).text(`%${avg}`, 60, yPos + 8);
              yPos += 40;

              for (const result of subResults) {
                const qp = getPerformanceLevel(result.percentage);
                doc.font('NotoSansArabic').fontSize(11).fillColor(colors.dark).text(
                  `• ${result.quiz_name} (${arAcadNames[sub] || sub})`, 70, yPos, { width: pageWidth - 90, align: 'right' }
                );
                doc.font('NotoSansArabic').fontSize(11).fillColor(qp.color).text(
                  `%${result.percentage} (${result.total_questions}/${result.score})`, 60, yPos
                );
                yPos += 20;
              }
              yPos += 15;
            }
          }

          // --- Arabic Recommendations ---
          doc.addPage();
          yPos = 50;
          doc.font('NotoSansArabic');
          doc.fontSize(20).fillColor(colors.success).text(reshapeArabic('التوصيات'), 50, yPos, { align: 'right', width: pageWidth });
          yPos += 35;

          // Strengths
          doc.rect(50, yPos, pageWidth, 25).fillColor('#f0fdf4').fill();
          doc.font('NotoSansArabic').fontSize(14).fillColor('#166534').text(reshapeArabic('نقاط القوة المحددة'), 60, yPos + 6, { width: pageWidth - 20, align: 'right' });
          yPos += 35;

          const arHighPerf = allResults.filter(r => r.percentage >= 85);
          if (arHighPerf.length > 0) {
            for (const r of arHighPerf) {
              doc.font('NotoSansArabic').fontSize(11).fillColor(colors.dark).text(
                reshapeArabic(`• ${r.quiz_name}: أداء ممتاز يظهر إتقاناً في هذا المجال`), 70, yPos, { width: pageWidth - 40, align: 'right' }
              );
              yPos += 20;
            }
          } else {
            doc.font('NotoSansArabic').fontSize(11).fillColor(colors.dark).text(
              reshapeArabic('• طفلك يطور مهاراته في جميع المجالات التي تم تقييمها'), 70, yPos, { width: pageWidth - 40, align: 'right' }
            );
            yPos += 20;
          }
          yPos += 15;

          // Areas for Growth
          doc.rect(50, yPos, pageWidth, 25).fillColor('#fef3c7').fill();
          doc.font('NotoSansArabic').fontSize(14).fillColor('#92400e').text(reshapeArabic('مجالات النمو'), 60, yPos + 6, { width: pageWidth - 20, align: 'right' });
          yPos += 35;

          const arLowPerf = allResults.filter(r => r.percentage < 75);
          if (arLowPerf.length > 0) {
            for (const r of arLowPerf) {
              const arName = arSubNames[r.subcategory] || arOralNames[r.subcategory] || arAcadNames[r.subcategory] || r.subcategory;
              doc.font('NotoSansArabic').fontSize(11).fillColor(colors.dark).text(
                reshapeArabic(`• ${arName}: يحتاج مزيداً من الممارسة والدعم`), 70, yPos, { width: pageWidth - 40, align: 'right' }
              );
              yPos += 20;
            }
          } else if (allResults.length > 0) {
            doc.font('NotoSansArabic').fontSize(11).fillColor(colors.dark).text(
              reshapeArabic('• يظهر طفلك أداءً متسقاً في جميع المجالات التي تم تقييمها'), 70, yPos, { width: pageWidth - 40, align: 'right' }
            );
            yPos += 20;
          }
          yPos += 15;

          // Suggested Activities
          doc.rect(50, yPos, pageWidth, 25).fillColor('#dbeafe').fill();
          doc.font('NotoSansArabic').fontSize(14).fillColor('#1e40af').text(reshapeArabic('الأنشطة المقترحة'), 60, yPos + 6, { width: pageWidth - 20, align: 'right' });
          yPos += 35;

          const arActivities = [
            reshapeArabic('شجع على الممارسة المنتظمة في المجالات التي كانت الدرجات فيها أقل من 75٪'),
            reshapeArabic('احتفل بالنجاحات وحافظ على الدافع لمواصلة التعلم'),
            reshapeArabic('فكر في الألعاب التعليمية التي تستهدف مجالات مهارات محددة'),
            reshapeArabic('ناقش النتائج مع معلم طفلك للحصول على دعم إضافي في الفصل'),
            reshapeArabic('أعد التقييم بشكل دوري لتتبع التحسن مع مرور الوقت'),
          ];

          for (const act of arActivities) {
            doc.font('NotoSansArabic').fontSize(11).fillColor(colors.dark).text(`• ${act}`, 70, yPos, { width: pageWidth - 40, align: 'right' });
            yPos += 20;
          }
          yPos += 30;

          // Arabic Footer
          doc.font('NotoSansArabic').fontSize(10).fillColor(colors.gray).text(
            reshapeArabic('صادر من أداة التقييم الشامل | بلوم للتعليم'),
            50, doc.page.height - 50, { align: 'center', width: pageWidth }
          );
        } catch (arabicErr) {
          console.warn('Failed to render Arabic PDF section:', arabicErr);
        }
      }

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
