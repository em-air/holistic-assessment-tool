import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer';
import { ProgressData, MIND_QUIZZES, ORAL_QUIZZES, ACADEMIC_QUIZZES } from '../utils/progressTracker';
import {
  getSubcategoryNameBilingual,
  getSkillDescriptionBilingual,
} from '../i18n/reportTranslations';

/* ═══════════════════════════════════════════════════════
   Font registration — local files served from public/
   ═══════════════════════════════════════════════════════ */

// Note: English pages use built-in 'Helvetica' — no CDN font needed

// Arabic font — served locally from public/fonts/ to avoid CDN failures
Font.register({
  family: 'NotoSansArabic',
  fonts: [
    { src: '/fonts/NotoSansArabic-Regular.woff', fontWeight: 400 },
    { src: '/fonts/NotoSansArabic-Bold.woff', fontWeight: 700 },
  ],
});

// Disable hyphenation (prevents word-breaking issues in Arabic)
Font.registerHyphenationCallback((word) => [word]);

/**
 * Reverse word order so an LTR PDF engine renders Arabic text
 * in the correct right-to-left visual order.
 * Only acts on strings that contain Arabic characters; pure
 * Latin / numbers pass through unchanged.
 */
function rtl(text: string): string {
  if (!text || typeof text !== 'string') return text;
  // Skip if no Arabic code-points present
  if (!/[\u0600-\u06FF\uFE70-\uFEFF]/.test(text)) return text;
  return text
    .split('\n')
    .map(line => line.split(' ').reverse().join(' '))
    .join('\n');
}

/* ═══════════════════════════════════════════════════════
   Styles
   ═══════════════════════════════════════════════════════ */

const s = StyleSheet.create({
  page: { flexDirection: 'column', backgroundColor: '#ffffff', padding: 30, fontFamily: 'Helvetica' },
  pageAr: { flexDirection: 'column', backgroundColor: '#ffffff', padding: 30, fontFamily: 'NotoSansArabic' },

  /* header */
  header: { marginBottom: 20, textAlign: 'center', borderBottom: 2, borderColor: '#6366f1', paddingBottom: 10 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1f2937', marginBottom: 5 },
  subtitle: { fontSize: 11, color: '#6b7280', marginBottom: 2 },

  /* section */
  section: { marginBottom: 18 },
  sectionTitle: { fontSize: 15, fontWeight: 'bold', color: '#374151', marginBottom: 10, borderBottom: 1, borderColor: '#e5e7eb', paddingBottom: 5 },

  /* summary cards */
  summaryGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
  summaryCard: { backgroundColor: '#f3f4f6', padding: 10, borderRadius: 5, width: '22%', textAlign: 'center' },
  summaryNum: { fontSize: 17, fontWeight: 'bold', color: '#3b82f6', marginBottom: 2 },
  summaryLabel: { fontSize: 8, color: '#6b7280' },

  /* parent note */
  parentNote: { backgroundColor: '#f0f9ff', padding: 12, borderRadius: 5, marginBottom: 14, borderLeft: 3, borderColor: '#3b82f6' },
  parentNoteAr: { backgroundColor: '#f0f9ff', padding: 12, borderRadius: 5, marginBottom: 14, borderRight: 3, borderColor: '#3b82f6', borderLeft: 0 },

  /* category block */
  catBlock: { marginBottom: 14, backgroundColor: '#fafafa', padding: 11, borderRadius: 5 },
  catTitle: { fontSize: 13, fontWeight: 'bold', marginBottom: 6 },
  catDesc: { fontSize: 9, color: '#6b7280', marginBottom: 9, lineHeight: 1.4 },

  /* quiz result card */
  quizCard: { marginBottom: 8, padding: 7, backgroundColor: '#ffffff', borderRadius: 3, borderLeft: 2, borderColor: '#e5e7eb' },
  quizCardAr: { marginBottom: 8, padding: 7, backgroundColor: '#ffffff', borderRadius: 3, borderRight: 2, borderColor: '#e5e7eb', borderLeft: 0 },
  quizName: { fontSize: 11, fontWeight: 'bold', color: '#374151', marginBottom: 3 },
  quizRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  quizRowAr: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  analysis: { fontSize: 9, color: '#4b5563', lineHeight: 1.3, marginTop: 4 },

  /* checklist */
  checklistSection: { marginBottom: 16, padding: 12, borderRadius: 5 },
  checkItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  checkItemAr: { flexDirection: 'row-reverse', alignItems: 'center', marginBottom: 4 },
  checkIcon: { width: 14, fontSize: 11, marginRight: 5 },
  checkIconAr: { width: 14, fontSize: 11, marginLeft: 5 },
  checkTextDone: { fontSize: 9, color: '#166534' },
  checkTextPending: { fontSize: 9, color: '#92400e' },

  /* recommendations */
  recSection: { backgroundColor: '#f0fdf4', padding: 12, borderRadius: 5, marginTop: 8 },
  recTitle: { fontSize: 13, fontWeight: 'bold', color: '#166534', marginBottom: 7 },
  recItem: { fontSize: 9, color: '#166534', marginBottom: 3, paddingLeft: 8 },
  recItemAr: { fontSize: 9, color: '#166534', marginBottom: 3, paddingRight: 8, textAlign: 'right' },

  /* footer */
  footer: { position: 'absolute', bottom: 28, left: 30, right: 30, fontSize: 7, color: '#9ca3af', textAlign: 'center', borderTop: 1, borderColor: '#e5e7eb', paddingTop: 8 },
});

/* ═══════════════════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════════════════ */

const subName: Record<string, string> = {
  attention: 'Attention', memory: 'Memory', 'learning-style': 'Learning Style',
  'critical-thinking': 'Critical Thinking', perception: 'Perception',
  'oral-language': 'Oral Language',
  spelling: 'Spelling', writing: 'Writing Skills', vocabulary: 'Vocabulary',
};

const catColor: Record<string, string> = {
  attention: '#eab308', memory: '#f97316', 'learning-style': '#22c55e',
  'critical-thinking': '#a855f7', perception: '#6366f1',
  'oral-language': '#0ea5e9',
  spelling: '#7c3aed', writing: '#d97706', vocabulary: '#e11d48',
};

const perfLabel = (pct: number) =>
  pct >= 90 ? 'Excellent' : pct >= 75 ? 'Good' : pct >= 60 ? 'Developing' : 'Needs Support';
const perfLabelAr = (pct: number) =>
  rtl(pct >= 90 ? 'ممتاز' : pct >= 75 ? 'جيد' : pct >= 60 ? 'قيد التطوير' : 'يحتاج دعم');

const getAnalysis = (result: any): string => {
  const cat = result.subcategory;
  const pct = result.percentage;
  if (cat === 'attention')
    return pct >= 75
      ? 'Shows strong attention and focus capabilities.'
      : 'Developing attention skills — practice with focus exercises recommended.';
  if (cat === 'memory')
    return pct >= 75
      ? 'Shows strong memory and recall abilities.'
      : 'Developing memory skills — memory games and exercises recommended.';
  if (cat === 'learning-style') {
    if (result.additionalData?.dominantStyle) {
      const d: Record<string, string> = {
        visual: 'Visual Learner — learns best through seeing, diagrams, charts.',
        auditory: 'Auditory Learner — learns best through listening and discussion.',
        'reading-writing': 'Reading/Writing Learner — learns best through written words.',
        kinesthetic: 'Kinesthetic Learner — learns best through hands-on activities.',
      };
      return d[result.additionalData.dominantStyle] || 'Adapt teaching methods to match this preference.';
    }
    return 'Still discovering optimal learning style — try different approaches.';
  }
  if (cat === 'critical-thinking')
    return pct >= 75 ? 'Demonstrates solid critical thinking abilities.' : 'Developing reasoning and problem-solving skills.';
  if (cat === 'perception')
    return pct >= 75 ? 'Shows good visual perception abilities.' : 'Developing visual processing skills.';
  if (cat === 'oral-language')
    return pct >= 75 ? 'Shows strong oral language and communication skills.' : 'Developing oral language abilities — encourage storytelling and conversation.';
  if (cat === 'spelling')
    return pct >= 75 ? 'Shows strong spelling skills and orthographic awareness.' : 'Developing spelling skills — practice with word patterns and spelling exercises.';
  if (cat === 'writing')
    return pct >= 75 ? 'Demonstrates solid writing skills with good structure and expression.' : 'Developing writing skills — encourage regular writing practice.';
  if (cat === 'vocabulary')
    return pct >= 75 ? 'Shows strong vocabulary knowledge and word understanding.' : 'Developing vocabulary — encourage reading and word-matching activities.';
  return 'Assessment completed successfully.';
};

const getAnalysisAr = (result: any): string => {
  const cat = result.subcategory;
  const pct = result.percentage;
  if (cat === 'attention')
    return rtl(pct >= 75 ? 'يُظهر قدرات قوية في الانتباه والتركيز.' : 'مهارات الانتباه قيد التطوير — يُوصى بتمارين التركيز.');
  if (cat === 'memory')
    return rtl(pct >= 75 ? 'يُظهر قدرات قوية في الذاكرة والاسترجاع.' : 'مهارات الذاكرة قيد التطوير — يُوصى بألعاب الذاكرة.');
  if (cat === 'learning-style') {
    if (result.additionalData?.dominantStyle) {
      const d: Record<string, string> = {
        visual: rtl('متعلم بصري — يتعلم بشكل أفضل من خلال الرؤية والرسوم البيانية.'),
        auditory: rtl('متعلم سمعي — يتعلم بشكل أفضل من خلال الاستماع والمناقشة.'),
        'reading-writing': rtl('متعلم قرائي/كتابي — يتعلم بشكل أفضل من خلال القراءة والكتابة.'),
        kinesthetic: rtl('متعلم حركي — يتعلم بشكل أفضل من خلال الأنشطة العملية.'),
      };
      return d[result.additionalData.dominantStyle] || rtl('قم بتكييف طرق التدريس لتتناسب مع أسلوب التعلم.');
    }
    return rtl('لا يزال يكتشف أسلوب التعلم الأمثل — جرب أساليب مختلفة.');
  }
  if (cat === 'critical-thinking')
    return rtl(pct >= 75 ? 'يُظهر قدرات قوية في التفكير النقدي.' : 'مهارات الاستدلال وحل المشكلات قيد التطوير.');
  if (cat === 'perception')
    return rtl(pct >= 75 ? 'يُظهر قدرات جيدة في الإدراك البصري.' : 'مهارات المعالجة البصرية قيد التطوير.');
  if (cat === 'oral-language')
    return rtl(pct >= 75 ? 'يُظهر مهارات قوية في اللغة الشفهية والتواصل.' : 'مهارات اللغة الشفهية قيد التطوير — شجع على السرد والمحادثة.');
  if (cat === 'spelling')
    return rtl(pct >= 75 ? 'يُظهر مهارات إملائية قوية ووعياً إملائياً.' : 'مهارات الإملاء قيد التطوير — تدرب على أنماط الكلمات.');
  if (cat === 'writing')
    return rtl(pct >= 75 ? 'يُظهر مهارات كتابة جيدة مع بنية وتعبير جيدين.' : 'مهارات الكتابة قيد التطوير — شجع على ممارسة الكتابة.');
  if (cat === 'vocabulary')
    return rtl(pct >= 75 ? 'يُظهر معرفة قوية بالمفردات وفهم الكلمات.' : 'المفردات قيد التطوير — شجع على القراءة وأنشطة مطابقة الكلمات.');
  return rtl('تم إكمال التقييم بنجاح.');
};

/* ═══════════════════════════════════════════════════════
   Component
   ═══════════════════════════════════════════════════════ */

interface ReportPDFProps {
  progress: ProgressData;
  studentName?: string;
  showWatermark?: boolean;
  watermarkText?: string;
  watermarkOpacity?: number;
}

const ReportPDF: React.FC<ReportPDFProps> = ({
  progress,
  studentName,
  showWatermark = true,
  watermarkText = 'Bloom Tutoring',
  watermarkOpacity = 0.08,
}) => {
  const mindResults = progress.mindSectionResults ?? [];
  const oralResults = progress.oralSectionResults ?? [];
  const academicResults = progress.academicSectionResults ?? [];
  const allResults = [...mindResults, ...oralResults, ...academicResults];

  const totalQuizzes = MIND_QUIZZES.length + ORAL_QUIZZES.length + ACADEMIC_QUIZZES.length;
  const completedCount = allResults.length;
  const avgScore =
    allResults.length > 0
      ? Math.round(allResults.reduce((sum, r) => sum + r.percentage, 0) / allResults.length)
      : 0;
  const isComplete = completedCount >= totalQuizzes;

  const categories = [
    'attention', 'memory', 'learning-style', 'critical-thinking', 'perception',
    'oral-language',
    'spelling', 'writing', 'vocabulary',
  ];

  /* Watermark node reused on each page */
  const Watermark = showWatermark ? (
    <View fixed style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: watermarkOpacity, justifyContent: 'center', alignItems: 'center', transform: 'rotate(-45deg)', zIndex: -1 }}>
      <Text style={{ fontSize: 110, color: '#000000', letterSpacing: 5, fontWeight: 'bold' }}>{watermarkText}</Text>
    </View>
  ) : null;

  /* ───────────────────────── ENGLISH PAGE(S) ───────────────────────── */
  const EnglishPages = (
    <Page size="A4" style={s.page} wrap>
      {Watermark}

      {/* Header */}
      <View style={s.header}>
        <Text style={s.title}>Holistic Skills Assessment Report{!isComplete && ' (Partial)'}</Text>
        {studentName && <Text style={s.subtitle}>Student: {studentName}</Text>}
        <Text style={s.subtitle}>Generated: {new Date().toLocaleDateString()}</Text>
        <Text style={s.subtitle}>{isComplete ? 'Complete' : 'Progress'} assessment overview</Text>
      </View>

      {/* Summary cards */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>ASSESSMENT SUMMARY</Text>
        <View style={s.summaryGrid}>
          <View style={s.summaryCard}>
            <Text style={s.summaryNum}>{completedCount}/{totalQuizzes}</Text>
            <Text style={s.summaryLabel}>Quizzes Completed</Text>
          </View>
          <View style={s.summaryCard}>
            <Text style={s.summaryNum}>{avgScore}%</Text>
            <Text style={s.summaryLabel}>Overall Average</Text>
          </View>
          <View style={s.summaryCard}>
            <Text style={s.summaryNum}>{mindResults.length}/{MIND_QUIZZES.length}</Text>
            <Text style={s.summaryLabel}>Mind Section</Text>
          </View>
          <View style={s.summaryCard}>
            <Text style={s.summaryNum}>{oralResults.length}/{ORAL_QUIZZES.length}</Text>
            <Text style={s.summaryLabel}>Oral Section</Text>
          </View>
          <View style={s.summaryCard}>
            <Text style={s.summaryNum}>{academicResults.length}/{ACADEMIC_QUIZZES.length}</Text>
            <Text style={s.summaryLabel}>Academic Section</Text>
          </View>
        </View>

        <View style={s.parentNote}>
          <Text style={{ fontSize: 11, color: '#1e40af', marginBottom: 5, fontWeight: 'bold' }}>Dear Parent,</Text>
          <Text style={{ fontSize: 10, color: '#1e40af', lineHeight: 1.4 }}>
            This {isComplete ? 'comprehensive' : 'partial'} report provides an overview of your child's
            performance across key cognitive, oral, and academic skill areas.{' '}
            {isComplete
              ? 'Each section explains what skills were tested and how your child performed.'
              : 'Your child has completed some assessments so far. Additional assessments can be taken for a more complete evaluation.'}
          </Text>
        </View>
      </View>

      {/* ── Progress Checklist ── */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>PROGRESS CHECKLIST</Text>

        {/* Mind quizzes */}
        <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#4338ca', marginBottom: 6 }}>Mind Section ({mindResults.length}/{MIND_QUIZZES.length} completed)</Text>
        <View style={{ ...s.checklistSection, backgroundColor: '#eef2ff' }}>
          {MIND_QUIZZES.map((q) => {
            const done = allResults.some((r) => r.quizId === q.id);
            const result = allResults.find((r) => r.quizId === q.id);
            const qualLabel = done && result
              ? result.quizId === 'learning-styles' && result.additionalData?.dominantStyle
                ? ` — ${result.additionalData.dominantStyle === 'visual' ? 'Visual Learner' : result.additionalData.dominantStyle === 'auditory' ? 'Auditory Learner' : result.additionalData.dominantStyle === 'kinesthetic' ? 'Kinesthetic Learner' : 'Reading/Writing Learner'}`
                : result.quizId === 'attention-assessment'
                  ? ` — ${result.additionalData?.attentionLevel || (result.percentage >= 75 ? 'Strong Focus' : result.percentage >= 60 ? 'Moderate Focus' : 'Developing Focus')}`
                  : ` — ${result.percentage}%`
              : ' — not yet completed';
            return (
              <View key={q.id} style={s.checkItem}>
                <Text style={s.checkIcon}>{done ? '✓' : '○'}</Text>
                <Text style={done ? s.checkTextDone : s.checkTextPending}>
                  {q.name} ({subName[q.subcategory] || q.subcategory})
                  {qualLabel}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Oral quizzes */}
        <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#0369a1', marginBottom: 6, marginTop: 4 }}>Oral Language Section ({oralResults.length}/{ORAL_QUIZZES.length} completed)</Text>
        <View style={{ ...s.checklistSection, backgroundColor: '#f0f9ff' }}>
          {ORAL_QUIZZES.map((q) => {
            const done = allResults.some((r) => r.quizId === q.id);
            const result = allResults.find((r) => r.quizId === q.id);
            return (
              <View key={q.id} style={s.checkItem}>
                <Text style={s.checkIcon}>{done ? '✓' : '○'}</Text>
                <Text style={done ? s.checkTextDone : s.checkTextPending}>
                  {q.name} ({subName[q.subcategory] || q.subcategory})
                  {done && result ? ` — ${result.percentage}%` : ' — not yet completed'}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Academic quizzes */}
        <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#059669', marginBottom: 6, marginTop: 4 }}>Academic Skills Section ({academicResults.length}/{ACADEMIC_QUIZZES.length} completed)</Text>
        <View style={{ ...s.checklistSection, backgroundColor: '#ecfdf5' }}>
          {ACADEMIC_QUIZZES.map((q) => {
            const done = allResults.some((r) => r.quizId === q.id);
            const result = allResults.find((r) => r.quizId === q.id);
            return (
              <View key={q.id} style={s.checkItem}>
                <Text style={s.checkIcon}>{done ? '✓' : '○'}</Text>
                <Text style={done ? s.checkTextDone : s.checkTextPending}>
                  {q.name} ({subName[q.subcategory] || q.subcategory})
                  {done && result ? ` — ${result.percentage}%` : ' — not yet completed'}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* ── Detailed Skill Analysis ── */}
      <View style={s.section} wrap>
        <Text style={s.sectionTitle}>DETAILED SKILL ANALYSIS</Text>

        {categories.map((cat) => {
          const catResults = allResults.filter((r) => r.subcategory === cat);
          if (catResults.length === 0) return null;
          const avg = Math.round(catResults.reduce((a, r) => a + r.percentage, 0) / catResults.length);
          const color = catColor[cat] || '#6b7280';

          return (
            <View key={cat} style={s.catBlock} wrap={false}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <Text style={{ ...s.catTitle, color }}>{subName[cat] || cat}</Text>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color }}>{avg}%</Text>
              </View>
              <Text style={s.catDesc}>{getSkillDescriptionBilingual(cat, 'en') || `Measures important ${subName[cat] || cat} abilities.`}</Text>

              {catResults.map((r) => {
                const isLS = r.quizId === 'learning-styles' && r.additionalData?.dominantStyle;
                const isAttn = r.quizId === 'attention-assessment';
                const attnLevel = isAttn
                  ? (r.additionalData?.attentionLevel || (r.percentage >= 75 ? 'Strong Focus' : r.percentage >= 60 ? 'Moderate Focus' : 'Developing Focus'))
                  : '';
                return (
                  <View key={r.quizId} style={s.quizCard}>
                    <Text style={s.quizName}>{r.quizName}</Text>
                    <View style={s.quizRow}>
                      {isLS ? (
                        <Text style={{ fontSize: 9, color: '#6b7280' }}>Learning Style Identified</Text>
                      ) : isAttn ? (
                        <Text style={{ fontSize: 9, color: '#6b7280' }}>Attention Level Assessment</Text>
                      ) : (
                        <Text style={{ fontSize: 9, color: '#6b7280' }}>Performance: {perfLabel(r.percentage)}</Text>
                      )}
                      {isLS ? (
                        <Text style={{ fontSize: 12, fontWeight: 'bold', color }}>
                          {r.additionalData.dominantStyle === 'visual' ? 'Visual Learner'
                            : r.additionalData.dominantStyle === 'auditory' ? 'Auditory Learner'
                            : r.additionalData.dominantStyle === 'kinesthetic' ? 'Kinesthetic Learner'
                            : 'Reading/Writing Learner'}
                        </Text>
                      ) : isAttn ? (
                        <Text style={{ fontSize: 12, fontWeight: 'bold', color }}>{attnLevel}</Text>
                      ) : (
                        <Text style={{ fontSize: 14, fontWeight: 'bold', color }}>{r.percentage}%</Text>
                      )}
                    </View>
                    <Text style={s.analysis}>{getAnalysis(r)}</Text>
                  </View>
                );
              })}
            </View>
          );
        })}
      </View>

      {/* ── Recommendations ── */}
      <View style={s.recSection} wrap={false}>
        <Text style={s.recTitle}>RECOMMENDATIONS FOR PARENTS</Text>
        <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#166534', marginBottom: 4 }}>STRENGTHS TO CELEBRATE:</Text>
        {allResults.filter((r) => r.percentage >= 85).length > 0 ? (
          allResults
            .filter((r) => r.percentage >= 85)
            .map((r) => (
              <Text key={r.quizId} style={s.recItem}>• {r.quizName}: Excellent performance showing mastery</Text>
            ))
        ) : (
          <Text style={s.recItem}>• Your child is developing skills across all assessed areas</Text>
        )}
        <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#166534', marginTop: 6, marginBottom: 4 }}>GENERAL RECOMMENDATIONS:</Text>
        <Text style={s.recItem}>• Encourage regular practice in areas where scores were below 75%</Text>
        <Text style={s.recItem}>• Celebrate successes and maintain motivation for continued learning</Text>
        <Text style={s.recItem}>• Consider educational games that target specific skill areas</Text>
        <Text style={s.recItem}>• Discuss results with your child's teacher for classroom support</Text>
      </View>

      {/* Footer */}
      <View style={s.footer} fixed>
        <Text>This assessment provides insights into your child's cognitive and oral abilities. Results should be considered alongside classroom performance, motivation, and individual learning style.</Text>
        <Text style={{ marginTop: 4 }}>Report generated by Holistic Assessment Tool • {new Date().toLocaleDateString()}</Text>
      </View>
    </Page>
  );

  /* ───────────────────────── ARABIC PAGE(S) ───────────────────────── */
  const ArabicPages = (
    <Page size="A4" style={s.pageAr} wrap>
      {Watermark}

      {/* Arabic section divider */}
      <View style={{ textAlign: 'center', marginBottom: 8, borderBottom: 2, borderColor: '#6366f1', paddingBottom: 6 }}>
        <Text style={{ fontSize: 13, color: '#6366f1', fontWeight: 700 }}>{rtl('النسخة العربية')}</Text>
      </View>

      {/* Header */}
      <View style={{ ...s.header, textAlign: 'right' }}>
        <Text style={{ ...s.title, fontWeight: 700 }}>{rtl('تقرير تقييم المهارات الشامل')}{!isComplete ? rtl(' (جزئي)') : ''}</Text>
          {studentName && <Text style={s.subtitle}>{rtl('الطالب:')} {rtl(studentName)}</Text>}
        <Text style={s.subtitle}>{rtl('تاريخ الإصدار:')} {new Date().toLocaleDateString('ar-SA')}</Text>
        <Text style={s.subtitle}>{isComplete ? rtl('نظرة عامة كاملة على التقييم') : rtl('نظرة عامة على مستوى التقدم')}</Text>
      </View>

      {/* Summary */}
      <View style={s.section}>
        <Text style={{ ...s.sectionTitle, textAlign: 'right' }}>{rtl('ملخص التقييم')}</Text>
        <View style={{ ...s.summaryGrid, flexDirection: 'row-reverse' }}>
          <View style={s.summaryCard}><Text style={s.summaryNum}>{completedCount}/{totalQuizzes}</Text><Text style={s.summaryLabel}>{rtl('الاختبارات المكتملة')}</Text></View>
          <View style={s.summaryCard}><Text style={s.summaryNum}>{avgScore}%</Text><Text style={s.summaryLabel}>{rtl('المعدل العام')}</Text></View>
          <View style={s.summaryCard}><Text style={s.summaryNum}>{mindResults.length}/{MIND_QUIZZES.length}</Text><Text style={s.summaryLabel}>{rtl('قسم العقل')}</Text></View>
          <View style={s.summaryCard}><Text style={s.summaryNum}>{oralResults.length}/{ORAL_QUIZZES.length}</Text><Text style={s.summaryLabel}>{rtl('قسم اللغة الشفهية')}</Text></View>
          <View style={s.summaryCard}><Text style={s.summaryNum}>{academicResults.length}/{ACADEMIC_QUIZZES.length}</Text><Text style={s.summaryLabel}>{rtl('القسم الأكاديمي')}</Text></View>
        </View>

        <View style={s.parentNoteAr}>
          <Text style={{ fontSize: 11, color: '#1e40af', marginBottom: 5, fontWeight: 700, textAlign: 'right' }}>{rtl('عزيزي ولي الأمر،')}</Text>
          <Text style={{ fontSize: 10, color: '#1e40af', lineHeight: 1.6, textAlign: 'right' }}>
            {isComplete
              ? rtl('يقدم هذا التقرير الشامل نظرة عامة على أداء طفلك في مجالات المهارات الإدراكية واللغوية الرئيسية. يشرح كل قسم المهارات التي تم اختبارها وكيف كان أداء طفلك.')
              : rtl('يقدم هذا التقرير الجزئي نظرة عامة على أداء طفلك. أكمل طفلك بعض التقييمات حتى الآن. يمكن إجراء تقييمات إضافية للحصول على تقييم أكثر شمولاً.')}
          </Text>
        </View>
      </View>

      {/* ── Progress Checklist (Arabic) ── */}
      <View style={s.section}>
        <Text style={{ ...s.sectionTitle, textAlign: 'right' }}>{rtl('قائمة التقدم')}</Text>

        <Text style={{ fontSize: 11, fontWeight: 700, color: '#4338ca', marginBottom: 6, textAlign: 'right' }}>{rtl('قسم العقل')} ({mindResults.length}/{MIND_QUIZZES.length} {rtl('مكتمل')})</Text>
        <View style={{ ...s.checklistSection, backgroundColor: '#eef2ff' }}>
          {MIND_QUIZZES.map((q) => {
            const done = allResults.some((r) => r.quizId === q.id);
            const result = allResults.find((r) => r.quizId === q.id);
            const qualLabelAr = done && result
              ? result.quizId === 'learning-styles' && result.additionalData?.dominantStyle
                ? ` \u2014 ${rtl(result.additionalData.dominantStyle === 'visual' ? '\u0645\u062A\u0639\u0644\u0645 \u0628\u0635\u0631\u064A' : result.additionalData.dominantStyle === 'auditory' ? '\u0645\u062A\u0639\u0644\u0645 \u0633\u0645\u0639\u064A' : result.additionalData.dominantStyle === 'kinesthetic' ? '\u0645\u062A\u0639\u0644\u0645 \u062D\u0631\u0643\u064A' : '\u0645\u062A\u0639\u0644\u0645 \u0642\u0631\u0627\u0626\u064A/\u0643\u062A\u0627\u0628\u064A')}`
                : result.quizId === 'attention-assessment'
                  ? ` \u2014 ${rtl(result.additionalData?.attentionLevel || (result.percentage >= 75 ? '\u062A\u0631\u0643\u064A\u0632 \u0642\u0648\u064A' : result.percentage >= 60 ? '\u062A\u0631\u0643\u064A\u0632 \u0645\u062A\u0648\u0633\u0637' : '\u062A\u0631\u0643\u064A\u0632 \u0642\u064A\u062F \u0627\u0644\u062A\u0637\u0648\u064A\u0631'))}`
                  : ` \u2014 ${result.percentage}%`
              : ' \u2014 ' + rtl('\u0644\u0645 \u064A\u0643\u062A\u0645\u0644 \u0628\u0639\u062F');
            return (
              <View key={q.id} style={s.checkItemAr}>
                <Text style={s.checkIconAr}>{done ? '\u2713' : '\u25CB'}</Text>
                <Text style={done ? s.checkTextDone : s.checkTextPending}>
                  {q.name} ({rtl(getSubcategoryNameBilingual(q.subcategory, 'ar'))})
                  {qualLabelAr}
                </Text>
              </View>
            );
          })}
        </View>

        <Text style={{ fontSize: 11, fontWeight: 700, color: '#0369a1', marginBottom: 6, marginTop: 4, textAlign: 'right' }}>{rtl('قسم اللغة الشفهية')} ({oralResults.length}/{ORAL_QUIZZES.length} {rtl('مكتمل')})</Text>
        <View style={{ ...s.checklistSection, backgroundColor: '#f0f9ff' }}>
          {ORAL_QUIZZES.map((q) => {
            const done = allResults.some((r) => r.quizId === q.id);
            const result = allResults.find((r) => r.quizId === q.id);
            return (
              <View key={q.id} style={s.checkItemAr}>
                <Text style={s.checkIconAr}>{done ? '✓' : '○'}</Text>
                <Text style={done ? s.checkTextDone : s.checkTextPending}>
                  {q.name} ({rtl(getSubcategoryNameBilingual(q.subcategory, 'ar'))})
                  {done && result ? ` — ${result.percentage}%` : ' — ' + rtl('لم يكتمل بعد')}
                </Text>
              </View>
            );
          })}
        </View>

        <Text style={{ fontSize: 11, fontWeight: 700, color: '#059669', marginBottom: 6, marginTop: 4, textAlign: 'right' }}>{rtl('القسم الأكاديمي')} ({academicResults.length}/{ACADEMIC_QUIZZES.length} {rtl('مكتمل')})</Text>
        <View style={{ ...s.checklistSection, backgroundColor: '#ecfdf5' }}>
          {ACADEMIC_QUIZZES.map((q) => {
            const done = allResults.some((r) => r.quizId === q.id);
            const result = allResults.find((r) => r.quizId === q.id);
            return (
              <View key={q.id} style={s.checkItemAr}>
                <Text style={s.checkIconAr}>{done ? '✓' : '○'}</Text>
                <Text style={done ? s.checkTextDone : s.checkTextPending}>
                  {q.name} ({rtl(getSubcategoryNameBilingual(q.subcategory, 'ar'))})
                  {done && result ? ` — ${result.percentage}%` : ' — ' + rtl('لم يكتمل بعد')}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* ── Detailed Skill Analysis (Arabic) ── */}
      <View style={s.section} wrap>
        <Text style={{ ...s.sectionTitle, textAlign: 'right' }}>{rtl('تحليل المهارات التفصيلي')}</Text>

        {categories.map((cat) => {
          const catResults = allResults.filter((r) => r.subcategory === cat);
          if (catResults.length === 0) return null;
          const avg = Math.round(catResults.reduce((a, r) => a + r.percentage, 0) / catResults.length);
          const color = catColor[cat] || '#6b7280';
          const arSubName = rtl(getSubcategoryNameBilingual(cat, 'ar'));
          const arSkillDesc = rtl(getSkillDescriptionBilingual(cat, 'ar'));

          return (
            <View key={cat} style={s.catBlock} wrap={false}>
              <View style={{ flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <Text style={{ ...s.catTitle, color }}>{arSubName}</Text>
                <Text style={{ fontSize: 16, fontWeight: 700, color }}>{avg}%</Text>
              </View>
              <Text style={{ ...s.catDesc, textAlign: 'right' }}>{arSkillDesc || rtl(`يقيس قدرات ${getSubcategoryNameBilingual(cat, 'ar')} المهمة.`)}</Text>

              {catResults.map((r) => {
                const isLS = r.quizId === 'learning-styles' && r.additionalData?.dominantStyle;
                const isAttn = r.quizId === 'attention-assessment';
                const attnLevelAr = isAttn
                  ? rtl(r.additionalData?.attentionLevel || (r.percentage >= 75 ? 'تركيز قوي' : r.percentage >= 60 ? 'تركيز متوسط' : 'تركيز قيد التطوير'))
                  : '';
                return (
                  <View key={r.quizId} style={s.quizCardAr}>
                    <Text style={{ ...s.quizName, textAlign: 'right' }}>{r.quizName} ({arSubName})</Text>
                    <View style={s.quizRowAr}>
                      {isLS ? (
                        <Text style={{ fontSize: 9, color: '#6b7280' }}>{rtl('أسلوب التعلم المحدد')}</Text>
                      ) : isAttn ? (
                        <Text style={{ fontSize: 9, color: '#6b7280' }}>{rtl('تقييم مستوى الانتباه')}</Text>
                      ) : (
                        <Text style={{ fontSize: 9, color: '#6b7280' }}>{rtl('الأداء:')} {perfLabelAr(r.percentage)}</Text>
                      )}
                      {isLS ? (
                        <Text style={{ fontSize: 10, fontWeight: 700, color }}>
                          {rtl(r.additionalData.dominantStyle === 'visual' ? 'متعلم بصري'
                            : r.additionalData.dominantStyle === 'auditory' ? 'متعلم سمعي'
                            : r.additionalData.dominantStyle === 'kinesthetic' ? 'متعلم حركي'
                            : 'متعلم قرائي/كتابي')}
                        </Text>
                      ) : isAttn ? (
                        <Text style={{ fontSize: 12, fontWeight: 700, color }}>{attnLevelAr}</Text>
                      ) : (
                        <Text style={{ fontSize: 14, fontWeight: 700, color }}>{r.percentage}%</Text>
                      )}
                    </View>
                    <Text style={{ ...s.analysis, textAlign: 'right' }}>{getAnalysisAr(r)}</Text>
                  </View>
                );
              })}
            </View>
          );
        })}
      </View>

      {/* ── Recommendations (Arabic) ── */}
      <View style={s.recSection} wrap={false}>
        <Text style={{ ...s.recTitle, textAlign: 'right' }}>{rtl('توصيات لأولياء الأمور')}</Text>
        <Text style={{ fontSize: 11, fontWeight: 700, color: '#166534', marginBottom: 4, textAlign: 'right' }}>{rtl('نقاط القوة التي يجب الاحتفاء بها:')}</Text>
        {allResults.filter((r) => r.percentage >= 85).length > 0 ? (
          allResults.filter((r) => r.percentage >= 85).map((r) => (
            <Text key={r.quizId} style={s.recItemAr}>• {r.quizName}: {rtl('أداء ممتاز يُظهر إتقاناً')}</Text>
          ))
        ) : (
          <Text style={s.recItemAr}>• {rtl('طفلك يطور مهاراته في جميع المجالات التي تم تقييمها')}</Text>
        )}
        <Text style={{ fontSize: 11, fontWeight: 700, color: '#166534', marginTop: 6, marginBottom: 4, textAlign: 'right' }}>{rtl('توصيات عامة:')}</Text>
        <Text style={s.recItemAr}>• {rtl('شجع على الممارسة المنتظمة في المجالات التي كانت الدرجات فيها أقل من 75٪')}</Text>
        <Text style={s.recItemAr}>• {rtl('احتفل بالنجاحات وحافظ على الدافع لمواصلة التعلم')}</Text>
        <Text style={s.recItemAr}>• {rtl('فكر في الألعاب التعليمية التي تستهدف مجالات مهارات محددة')}</Text>
        <Text style={s.recItemAr}>• {rtl('ناقش النتائج مع معلم طفلك للحصول على دعم في الفصل الدراسي')}</Text>
      </View>

      {/* Footer */}
      <View style={s.footer} fixed>
        <Text style={{ textAlign: 'right' }}>{rtl('يوفر هذا التقييم رؤى حول قدرات طفلك الإدراكية واللغوية. يجب مراعاة النتائج جنباً إلى جنب مع الأداء في الفصل الدراسي.')}</Text>
        <Text style={{ marginTop: 4, textAlign: 'right' }}>{rtl('تقرير صادر من أداة التقييم الشامل')} • {new Date().toLocaleDateString('ar-SA')}</Text>
      </View>
    </Page>
  );

  return (
    <Document>
      {EnglishPages}
      {ArabicPages}
    </Document>
  );
};

/** English-only report PDF document */
export const ReportPDFEnglish: React.FC<ReportPDFProps> = (props) => {
  const {
    progress,
    studentName,
    showWatermark = true,
    watermarkText = 'Bloom Tutoring',
    watermarkOpacity = 0.08,
  } = props;
  const mindResults = progress.mindSectionResults ?? [];
  const oralResults = progress.oralSectionResults ?? [];
  const academicResults = progress.academicSectionResults ?? [];
  const allResults = [...mindResults, ...oralResults, ...academicResults];
  const totalQuizzes = MIND_QUIZZES.length + ORAL_QUIZZES.length + ACADEMIC_QUIZZES.length;
  const completedCount = allResults.length;
  const avgScore = allResults.length > 0
    ? Math.round(allResults.reduce((sum, r) => sum + r.percentage, 0) / allResults.length) : 0;
  const isComplete = completedCount >= totalQuizzes;
  const categories = ['attention','memory','learning-style','critical-thinking','perception','oral-language','phonics','blending-segmenting','spelling','writing','vocabulary'];
  const Watermark = showWatermark ? (
    <View fixed style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: watermarkOpacity, justifyContent: 'center', alignItems: 'center', transform: 'rotate(-45deg)', zIndex: -1 }}>
      <Text style={{ fontSize: 110, color: '#000000', letterSpacing: 5, fontWeight: 'bold' }}>{watermarkText}</Text>
    </View>
  ) : null;

  return (
    <Document>
      <Page size="A4" style={s.page} wrap>
        {Watermark}
        <View style={s.header}>
          <Text style={s.title}>Holistic Skills Assessment Report{!isComplete && ' (Partial)'}</Text>
          {studentName && <Text style={s.subtitle}>Student: {studentName}</Text>}
          <Text style={s.subtitle}>Generated: {new Date().toLocaleDateString()}</Text>
          <Text style={s.subtitle}>{isComplete ? 'Complete' : 'Progress'} assessment overview</Text>
        </View>
        <View style={s.section}>
          <Text style={s.sectionTitle}>ASSESSMENT SUMMARY</Text>
          <View style={s.summaryGrid}>
            <View style={s.summaryCard}><Text style={s.summaryNum}>{completedCount}/{totalQuizzes}</Text><Text style={s.summaryLabel}>Quizzes Completed</Text></View>
            <View style={s.summaryCard}><Text style={s.summaryNum}>{avgScore}%</Text><Text style={s.summaryLabel}>Overall Average</Text></View>
            <View style={s.summaryCard}><Text style={s.summaryNum}>{mindResults.length}/{MIND_QUIZZES.length}</Text><Text style={s.summaryLabel}>Mind Section</Text></View>
            <View style={s.summaryCard}><Text style={s.summaryNum}>{oralResults.length}/{ORAL_QUIZZES.length}</Text><Text style={s.summaryLabel}>Oral Section</Text></View>
            <View style={s.summaryCard}><Text style={s.summaryNum}>{academicResults.length}/{ACADEMIC_QUIZZES.length}</Text><Text style={s.summaryLabel}>Academic Section</Text></View>
          </View>
          <View style={s.parentNote}>
            <Text style={{ fontSize: 11, color: '#1e40af', marginBottom: 5, fontWeight: 'bold' }}>Dear Parent,</Text>
            <Text style={{ fontSize: 10, color: '#1e40af', lineHeight: 1.4 }}>
              This {isComplete ? 'comprehensive' : 'partial'} report provides an overview of your child's
              performance across key cognitive and oral skill areas.{' '}
              {isComplete ? 'Each section explains what skills were tested and how your child performed.' : 'Your child has completed some assessments so far. Additional assessments can be taken for a more complete evaluation.'}
            </Text>
          </View>
        </View>
        <View style={s.section}>
          <Text style={s.sectionTitle}>PROGRESS CHECKLIST</Text>
          <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#4338ca', marginBottom: 6 }}>Mind Section ({mindResults.length}/{MIND_QUIZZES.length} completed)</Text>
          <View style={{ ...s.checklistSection, backgroundColor: '#eef2ff' }}>
            {MIND_QUIZZES.map((q) => {
              const done = allResults.some((r) => r.quizId === q.id);
              const result = allResults.find((r) => r.quizId === q.id);
              const qualLabel = done && result
                ? result.quizId === 'learning-styles' && result.additionalData?.dominantStyle
                  ? ` — ${result.additionalData.dominantStyle === 'visual' ? 'Visual Learner' : result.additionalData.dominantStyle === 'auditory' ? 'Auditory Learner' : result.additionalData.dominantStyle === 'kinesthetic' ? 'Kinesthetic Learner' : 'Reading/Writing Learner'}`
                  : result.quizId === 'attention-assessment'
                    ? ` — ${result.additionalData?.attentionLevel || (result.percentage >= 75 ? 'Strong Focus' : result.percentage >= 60 ? 'Moderate Focus' : 'Developing Focus')}`
                    : ` — ${result.percentage}%`
                : ' — not yet completed';
              return (
                <View key={q.id} style={s.checkItem}>
                  <Text style={s.checkIcon}>{done ? '✓' : '○'}</Text>
                  <Text style={done ? s.checkTextDone : s.checkTextPending}>{q.name} ({subName[q.subcategory] || q.subcategory}){qualLabel}</Text>
                </View>
              );
            })}
          </View>
          <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#0369a1', marginBottom: 6, marginTop: 4 }}>Oral Language Section ({oralResults.length}/{ORAL_QUIZZES.length} completed)</Text>
          <View style={{ ...s.checklistSection, backgroundColor: '#f0f9ff' }}>
            {ORAL_QUIZZES.map((q) => {
              const done = allResults.some((r) => r.quizId === q.id);
              const result = allResults.find((r) => r.quizId === q.id);
              return (
                <View key={q.id} style={s.checkItem}>
                  <Text style={s.checkIcon}>{done ? '✓' : '○'}</Text>
                  <Text style={done ? s.checkTextDone : s.checkTextPending}>{q.name} ({subName[q.subcategory] || q.subcategory}){done && result ? ` — ${result.percentage}%` : ' — not yet completed'}</Text>
                </View>
              );
            })}
          </View>
          <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#059669', marginBottom: 6, marginTop: 4 }}>Academic Skills Section ({academicResults.length}/{ACADEMIC_QUIZZES.length} completed)</Text>
          <View style={{ ...s.checklistSection, backgroundColor: '#ecfdf5' }}>
            {ACADEMIC_QUIZZES.map((q) => {
              const done = allResults.some((r) => r.quizId === q.id);
              const result = allResults.find((r) => r.quizId === q.id);
              return (
                <View key={q.id} style={s.checkItem}>
                  <Text style={s.checkIcon}>{done ? '✓' : '○'}</Text>
                  <Text style={done ? s.checkTextDone : s.checkTextPending}>{q.name} ({subName[q.subcategory] || q.subcategory}){done && result ? ` — ${result.percentage}%` : ' — not yet completed'}</Text>
                </View>
              );
            })}
          </View>
        </View>
        <View style={s.section} wrap>
          <Text style={s.sectionTitle}>DETAILED SKILL ANALYSIS</Text>
          {categories.map((cat) => {
            const catResults = allResults.filter((r) => r.subcategory === cat);
            if (catResults.length === 0) return null;
            const avg = Math.round(catResults.reduce((a, r) => a + r.percentage, 0) / catResults.length);
            const color = catColor[cat] || '#6b7280';
            return (
              <View key={cat} style={s.catBlock} wrap={false}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <Text style={{ ...s.catTitle, color }}>{subName[cat] || cat}</Text>
                  <Text style={{ fontSize: 16, fontWeight: 'bold', color }}>{avg}%</Text>
                </View>
                <Text style={s.catDesc}>{getSkillDescriptionBilingual(cat, 'en') || `Measures important ${subName[cat] || cat} abilities.`}</Text>
                {catResults.map((r) => {
                  const isLS = r.quizId === 'learning-styles' && r.additionalData?.dominantStyle;
                  const isAttn = r.quizId === 'attention-assessment';
                  const attnLevel = isAttn ? (r.additionalData?.attentionLevel || (r.percentage >= 75 ? 'Strong Focus' : r.percentage >= 60 ? 'Moderate Focus' : 'Developing Focus')) : '';
                  return (
                    <View key={r.quizId} style={s.quizCard}>
                      <Text style={s.quizName}>{r.quizName}</Text>
                      <View style={s.quizRow}>
                        {isLS ? <Text style={{ fontSize: 9, color: '#6b7280' }}>Learning Style Identified</Text> : isAttn ? <Text style={{ fontSize: 9, color: '#6b7280' }}>Attention Level Assessment</Text> : <Text style={{ fontSize: 9, color: '#6b7280' }}>Performance: {perfLabel(r.percentage)}</Text>}
                        {isLS ? <Text style={{ fontSize: 12, fontWeight: 'bold', color }}>{r.additionalData.dominantStyle === 'visual' ? 'Visual Learner' : r.additionalData.dominantStyle === 'auditory' ? 'Auditory Learner' : r.additionalData.dominantStyle === 'kinesthetic' ? 'Kinesthetic Learner' : 'Reading/Writing Learner'}</Text> : isAttn ? <Text style={{ fontSize: 12, fontWeight: 'bold', color }}>{attnLevel}</Text> : <Text style={{ fontSize: 14, fontWeight: 'bold', color }}>{r.percentage}%</Text>}
                      </View>
                      <Text style={s.analysis}>{getAnalysis(r)}</Text>
                    </View>
                  );
                })}
              </View>
            );
          })}
        </View>
        <View style={s.recSection} wrap={false}>
          <Text style={s.recTitle}>RECOMMENDATIONS FOR PARENTS</Text>
          <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#166534', marginBottom: 4 }}>STRENGTHS TO CELEBRATE:</Text>
          {allResults.filter((r) => r.percentage >= 85).length > 0 ? allResults.filter((r) => r.percentage >= 85).map((r) => <Text key={r.quizId} style={s.recItem}>• {r.quizName}: Excellent performance showing mastery</Text>) : <Text style={s.recItem}>• Your child is developing skills across all assessed areas</Text>}
          <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#166534', marginTop: 6, marginBottom: 4 }}>GENERAL RECOMMENDATIONS:</Text>
          <Text style={s.recItem}>• Encourage regular practice in areas where scores were below 75%</Text>
          <Text style={s.recItem}>• Celebrate successes and maintain motivation for continued learning</Text>
          <Text style={s.recItem}>• Consider educational games that target specific skill areas</Text>
          <Text style={s.recItem}>• Discuss results with your child's teacher for classroom support</Text>
        </View>
        <View style={s.footer} fixed>
          <Text>This assessment provides insights into your child's cognitive and oral abilities. Results should be considered alongside classroom performance, motivation, and individual learning style.</Text>
          <Text style={{ marginTop: 4 }}>Report generated by Holistic Assessment Tool • {new Date().toLocaleDateString()}</Text>
        </View>
      </Page>
    </Document>
  );
};

/** Arabic-only report PDF document */
export const ReportPDFArabic: React.FC<ReportPDFProps> = (props) => {
  const {
    progress,
    studentName,
    showWatermark = true,
    watermarkText = 'Bloom Tutoring',
    watermarkOpacity = 0.08,
  } = props;
  const mindResults = progress.mindSectionResults ?? [];
  const oralResults = progress.oralSectionResults ?? [];
  const academicResults = progress.academicSectionResults ?? [];
  const allResults = [...mindResults, ...oralResults, ...academicResults];
  const totalQuizzes = MIND_QUIZZES.length + ORAL_QUIZZES.length + ACADEMIC_QUIZZES.length;
  const completedCount = allResults.length;
  const avgScore = allResults.length > 0
    ? Math.round(allResults.reduce((sum, r) => sum + r.percentage, 0) / allResults.length) : 0;
  const isComplete = completedCount >= totalQuizzes;
  const categories = ['attention','memory','learning-style','critical-thinking','perception','oral-language','phonics','blending-segmenting','spelling','writing','vocabulary'];
  const Watermark = showWatermark ? (
    <View fixed style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: watermarkOpacity, justifyContent: 'center', alignItems: 'center', transform: 'rotate(-45deg)', zIndex: -1 }}>
      <Text style={{ fontSize: 110, color: '#000000', letterSpacing: 5, fontWeight: 'bold' }}>{watermarkText}</Text>
    </View>
  ) : null;

  return (
    <Document>
      <Page size="A4" style={s.pageAr} wrap>
        {Watermark}
        <View style={{ textAlign: 'center', marginBottom: 8, borderBottom: 2, borderColor: '#6366f1', paddingBottom: 6 }}>
          <Text style={{ fontSize: 13, color: '#6366f1', fontWeight: 700 }}>{rtl('النسخة العربية')}</Text>
        </View>
        <View style={{ ...s.header, textAlign: 'right' }}>
          <Text style={{ ...s.title, fontWeight: 700 }}>{rtl('تقرير تقييم المهارات الشامل')}{!isComplete ? rtl(' (جزئي)') : ''}</Text>
          {studentName && <Text style={s.subtitle}>{rtl('الطالب:')} {rtl(studentName)}</Text>}
          <Text style={s.subtitle}>{rtl('تاريخ الإصدار:')} {new Date().toLocaleDateString('ar-SA')}</Text>
          <Text style={s.subtitle}>{isComplete ? rtl('نظرة عامة كاملة على التقييم') : rtl('نظرة عامة على مستوى التقدم')}</Text>
        </View>
        <View style={s.section}>
          <Text style={{ ...s.sectionTitle, textAlign: 'right' }}>{rtl('ملخص التقييم')}</Text>
          <View style={{ ...s.summaryGrid, flexDirection: 'row-reverse' }}>
            <View style={s.summaryCard}><Text style={s.summaryNum}>{completedCount}/{totalQuizzes}</Text><Text style={s.summaryLabel}>{rtl('الاختبارات المكتملة')}</Text></View>
            <View style={s.summaryCard}><Text style={s.summaryNum}>{avgScore}%</Text><Text style={s.summaryLabel}>{rtl('المعدل العام')}</Text></View>
            <View style={s.summaryCard}><Text style={s.summaryNum}>{mindResults.length}/{MIND_QUIZZES.length}</Text><Text style={s.summaryLabel}>{rtl('قسم العقل')}</Text></View>
            <View style={s.summaryCard}><Text style={s.summaryNum}>{oralResults.length}/{ORAL_QUIZZES.length}</Text><Text style={s.summaryLabel}>{rtl('قسم اللغة الشفهية')}</Text></View>
            <View style={s.summaryCard}><Text style={s.summaryNum}>{academicResults.length}/{ACADEMIC_QUIZZES.length}</Text><Text style={s.summaryLabel}>{rtl('القسم الأكاديمي')}</Text></View>
          </View>
          <View style={s.parentNoteAr}>
            <Text style={{ fontSize: 11, color: '#1e40af', marginBottom: 5, fontWeight: 700, textAlign: 'right' }}>{rtl('عزيزي ولي الأمر،')}</Text>
            <Text style={{ fontSize: 10, color: '#1e40af', lineHeight: 1.6, textAlign: 'right' }}>
              {isComplete ? rtl('يقدم هذا التقرير الشامل نظرة عامة على أداء طفلك في مجالات المهارات الإدراكية واللغوية الرئيسية. يشرح كل قسم المهارات التي تم اختبارها وكيف كان أداء طفلك.') : rtl('يقدم هذا التقرير الجزئي نظرة عامة على أداء طفلك. أكمل طفلك بعض التقييمات حتى الآن. يمكن إجراء تقييمات إضافية للحصول على تقييم أكثر شمولاً.')}
            </Text>
          </View>
        </View>
        <View style={s.section}>
          <Text style={{ ...s.sectionTitle, textAlign: 'right' }}>{rtl('قائمة التقدم')}</Text>
          <Text style={{ fontSize: 11, fontWeight: 700, color: '#4338ca', marginBottom: 6, textAlign: 'right' }}>{rtl('قسم العقل')} ({mindResults.length}/{MIND_QUIZZES.length} {rtl('مكتمل')})</Text>
          <View style={{ ...s.checklistSection, backgroundColor: '#eef2ff' }}>
            {MIND_QUIZZES.map((q) => {
              const done = allResults.some((r) => r.quizId === q.id);
              const result = allResults.find((r) => r.quizId === q.id);
              const qualLabelAr = done && result
                ? result.quizId === 'learning-styles' && result.additionalData?.dominantStyle
                  ? ` \u2014 ${rtl(result.additionalData.dominantStyle === 'visual' ? '\u0645\u062A\u0639\u0644\u0645 \u0628\u0635\u0631\u064A' : result.additionalData.dominantStyle === 'auditory' ? '\u0645\u062A\u0639\u0644\u0645 \u0633\u0645\u0639\u064A' : result.additionalData.dominantStyle === 'kinesthetic' ? '\u0645\u062A\u0639\u0644\u0645 \u062D\u0631\u0643\u064A' : '\u0645\u062A\u0639\u0644\u0645 \u0642\u0631\u0627\u0626\u064A/\u0643\u062A\u0627\u0628\u064A')}`
                  : result.quizId === 'attention-assessment'
                    ? ` \u2014 ${rtl(result.additionalData?.attentionLevel || (result.percentage >= 75 ? '\u062A\u0631\u0643\u064A\u0632 \u0642\u0648\u064A' : result.percentage >= 60 ? '\u062A\u0631\u0643\u064A\u0632 \u0645\u062A\u0648\u0633\u0637' : '\u062A\u0631\u0643\u064A\u0632 \u0642\u064A\u062F \u0627\u0644\u062A\u0637\u0648\u064A\u0631'))}`
                  : ` \u2014 ${result.percentage}%`
                : ' \u2014 ' + rtl('\u0644\u0645 \u064A\u0643\u062A\u0645\u0644 \u0628\u0639\u062F');
              return (
                <View key={q.id} style={s.checkItemAr}>
                  <Text style={s.checkIconAr}>{done ? '\u2713' : '\u25CB'}</Text>
                  <Text style={done ? s.checkTextDone : s.checkTextPending}>{q.name} ({rtl(getSubcategoryNameBilingual(q.subcategory, 'ar'))}){qualLabelAr}</Text>
                </View>
              );
            })}
          </View>
          <Text style={{ fontSize: 11, fontWeight: 700, color: '#0369a1', marginBottom: 6, marginTop: 4, textAlign: 'right' }}>{rtl('قسم اللغة الشفهية')} ({oralResults.length}/{ORAL_QUIZZES.length} {rtl('مكتمل')})</Text>
          <View style={{ ...s.checklistSection, backgroundColor: '#f0f9ff' }}>
            {ORAL_QUIZZES.map((q) => {
              const done = allResults.some((r) => r.quizId === q.id);
              const result = allResults.find((r) => r.quizId === q.id);
              return (
                <View key={q.id} style={s.checkItemAr}>
                  <Text style={s.checkIconAr}>{done ? '✓' : '○'}</Text>
                  <Text style={done ? s.checkTextDone : s.checkTextPending}>{q.name} ({rtl(getSubcategoryNameBilingual(q.subcategory, 'ar'))}){done && result ? ` — ${result.percentage}%` : ' — ' + rtl('لم يكتمل بعد')}</Text>
                </View>
              );
            })}
          </View>
          <Text style={{ fontSize: 11, fontWeight: 700, color: '#059669', marginBottom: 6, marginTop: 4, textAlign: 'right' }}>{rtl('القسم الأكاديمي')} ({academicResults.length}/{ACADEMIC_QUIZZES.length} {rtl('مكتمل')})</Text>
          <View style={{ ...s.checklistSection, backgroundColor: '#ecfdf5' }}>
            {ACADEMIC_QUIZZES.map((q) => {
              const done = allResults.some((r) => r.quizId === q.id);
              const result = allResults.find((r) => r.quizId === q.id);
              return (
                <View key={q.id} style={s.checkItemAr}>
                  <Text style={s.checkIconAr}>{done ? '✓' : '○'}</Text>
                  <Text style={done ? s.checkTextDone : s.checkTextPending}>{q.name} ({rtl(getSubcategoryNameBilingual(q.subcategory, 'ar'))}){done && result ? ` — ${result.percentage}%` : ' — ' + rtl('لم يكتمل بعد')}</Text>
                </View>
              );
            })}
          </View>
        </View>
        <View style={s.section} wrap>
          <Text style={{ ...s.sectionTitle, textAlign: 'right' }}>{rtl('تحليل المهارات التفصيلي')}</Text>
          {categories.map((cat) => {
            const catResults = allResults.filter((r) => r.subcategory === cat);
            if (catResults.length === 0) return null;
            const avg = Math.round(catResults.reduce((a, r) => a + r.percentage, 0) / catResults.length);
            const color = catColor[cat] || '#6b7280';
            const arSubName = rtl(getSubcategoryNameBilingual(cat, 'ar'));
            const arSkillDesc = rtl(getSkillDescriptionBilingual(cat, 'ar'));
            return (
              <View key={cat} style={s.catBlock} wrap={false}>
                <View style={{ flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <Text style={{ ...s.catTitle, color }}>{arSubName}</Text>
                  <Text style={{ fontSize: 16, fontWeight: 700, color }}>{avg}%</Text>
                </View>
                <Text style={{ ...s.catDesc, textAlign: 'right' }}>{arSkillDesc || rtl(`يقيس قدرات ${getSubcategoryNameBilingual(cat, 'ar')} المهمة.`)}</Text>
                {catResults.map((r) => {
                  const isLS = r.quizId === 'learning-styles' && r.additionalData?.dominantStyle;
                  const isAttn = r.quizId === 'attention-assessment';
                  const attnLevelAr = isAttn ? rtl(r.additionalData?.attentionLevel || (r.percentage >= 75 ? 'تركيز قوي' : r.percentage >= 60 ? 'تركيز متوسط' : 'تركيز قيد التطوير')) : '';
                  return (
                    <View key={r.quizId} style={s.quizCardAr}>
                      <Text style={{ ...s.quizName, textAlign: 'right' }}>{r.quizName} ({arSubName})</Text>
                      <View style={s.quizRowAr}>
                        {isLS ? <Text style={{ fontSize: 9, color: '#6b7280' }}>{rtl('أسلوب التعلم المحدد')}</Text> : isAttn ? <Text style={{ fontSize: 9, color: '#6b7280' }}>{rtl('تقييم مستوى الانتباه')}</Text> : <Text style={{ fontSize: 9, color: '#6b7280' }}>{rtl('الأداء:')} {perfLabelAr(r.percentage)}</Text>}
                        {isLS ? <Text style={{ fontSize: 10, fontWeight: 700, color }}>{rtl(r.additionalData.dominantStyle === 'visual' ? 'متعلم بصري' : r.additionalData.dominantStyle === 'auditory' ? 'متعلم سمعي' : r.additionalData.dominantStyle === 'kinesthetic' ? 'متعلم حركي' : 'متعلم قرائي/كتابي')}</Text> : isAttn ? <Text style={{ fontSize: 12, fontWeight: 700, color }}>{attnLevelAr}</Text> : <Text style={{ fontSize: 14, fontWeight: 700, color }}>{r.percentage}%</Text>}
                      </View>
                      <Text style={{ ...s.analysis, textAlign: 'right' }}>{getAnalysisAr(r)}</Text>
                    </View>
                  );
                })}
              </View>
            );
          })}
        </View>
        <View style={s.recSection} wrap={false}>
          <Text style={{ ...s.recTitle, textAlign: 'right' }}>{rtl('توصيات لأولياء الأمور')}</Text>
          <Text style={{ fontSize: 11, fontWeight: 700, color: '#166534', marginBottom: 4, textAlign: 'right' }}>{rtl('نقاط القوة التي يجب الاحتفاء بها:')}</Text>
          {allResults.filter((r) => r.percentage >= 85).length > 0 ? allResults.filter((r) => r.percentage >= 85).map((r) => <Text key={r.quizId} style={s.recItemAr}>• {r.quizName}: {rtl('أداء ممتاز يُظهر إتقاناً')}</Text>) : <Text style={s.recItemAr}>• {rtl('طفلك يطور مهاراته في جميع المجالات التي تم تقييمها')}</Text>}
          <Text style={{ fontSize: 11, fontWeight: 700, color: '#166534', marginTop: 6, marginBottom: 4, textAlign: 'right' }}>{rtl('توصيات عامة:')}</Text>
          <Text style={s.recItemAr}>• {rtl('شجع على الممارسة المنتظمة في المجالات التي كانت الدرجات فيها أقل من 75٪')}</Text>
          <Text style={s.recItemAr}>• {rtl('احتفل بالنجاحات وحافظ على الدافع لمواصلة التعلم')}</Text>
          <Text style={s.recItemAr}>• {rtl('فكر في الألعاب التعليمية التي تستهدف مجالات مهارات محددة')}</Text>
          <Text style={s.recItemAr}>• {rtl('ناقش النتائج مع معلم طفلك للحصول على دعم في الفصل الدراسي')}</Text>
        </View>
        <View style={s.footer} fixed>
          <Text style={{ textAlign: 'right' }}>{rtl('يوفر هذا التقييم رؤى حول قدرات طفلك الإدراكية واللغوية. يجب مراعاة النتائج جنباً إلى جنب مع الأداء في الفصل الدراسي.')}</Text>
          <Text style={{ marginTop: 4, textAlign: 'right' }}>{rtl('تقرير صادر من أداة التقييم الشامل')} • {new Date().toLocaleDateString('ar-SA')}</Text>
        </View>
      </Page>
    </Document>
  );
};

export default ReportPDF;