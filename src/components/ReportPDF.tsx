import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer';
import { ProgressData, MIND_QUIZZES, ORAL_QUIZZES, ACADEMIC_QUIZZES, LEARNING_QUIZZES } from '../utils/progressTracker';
import { getQuizResultLabel } from '../utils/quizResultDisplay';

Font.registerHyphenationCallback((word) => [word]);

const C = {
  navy:    '#1e3a5f',
  accent:  '#2563eb',
  ink:     '#111827',
  sub:     '#374151',
  muted:   '#6b7280',
  light:   '#9ca3af',
  divider: '#e5e7eb',
  bg:      '#f9fafb',
  white:   '#ffffff',
};

const s = StyleSheet.create({
  page:       { backgroundColor: C.white, paddingTop: 48, paddingBottom: 48, paddingHorizontal: 50, fontFamily: 'Helvetica' },
  topRule:    { position: 'absolute', top: 0, left: 0, right: 0, height: 3, backgroundColor: C.navy },
  footer:     { position: 'absolute', bottom: 20, left: 50, right: 50, fontSize: 7, color: C.light, textAlign: 'center' },

  // Cover
  brand:      { fontSize: 8, color: C.light, letterSpacing: 1.5, textAlign: 'right', marginBottom: 36 },
  titleMain:  { fontSize: 24, fontWeight: 'bold', color: C.navy, textAlign: 'center', marginBottom: 4 },
  titleSub:   { fontSize: 24, fontWeight: 'bold', color: C.navy, textAlign: 'center', marginBottom: 24 },
  rule:       { height: 1, backgroundColor: C.divider, marginBottom: 20 },
  ruleAccent: { height: 2, width: 80, backgroundColor: C.accent, alignSelf: 'center', marginBottom: 28 },
  studentName:{ fontSize: 18, fontWeight: 'bold', color: C.ink, textAlign: 'center', marginBottom: 4 },
  dateLine:   { fontSize: 10, color: C.muted, textAlign: 'center', marginBottom: 24 },
  statsRow:   { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20 },
  statItem:   { alignItems: 'center' },
  statVal:    { fontSize: 18, fontWeight: 'bold', color: C.navy, marginBottom: 2 },
  statLbl:    { fontSize: 8, color: C.light },
  introText:  { fontSize: 9.5, color: C.sub, lineHeight: 1.6, marginBottom: 24 },
  checkRow:   { flexDirection: 'row', marginBottom: 4 },
  checkMark:  { fontSize: 8.5, color: C.accent, width: 14 },
  checkPend:  { fontSize: 8.5, color: C.light, width: 14 },
  checkLabel: { fontSize: 8.5, color: C.sub, flex: 1 },
  checkScore: { fontSize: 8.5, color: C.muted },
  sectionGap: { marginBottom: 24 },

  // Section
  sectionTitle:   { fontSize: 12, fontWeight: 'bold', color: C.navy, letterSpacing: 0.5, marginBottom: 6, marginTop: 20 },
  sectionUnderline:{ height: 1, backgroundColor: C.navy, marginBottom: 14, width: 200 },
  subTitle:       { fontSize: 10, fontWeight: 'bold', color: C.ink, marginBottom: 2, marginTop: 8 },
  subRule:        { height: 0.5, backgroundColor: C.divider, marginBottom: 8 },
  quizRow:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 },
  quizName:       { fontSize: 9, color: C.sub, flex: 1 },
  quizRight:      { flexDirection: 'row', alignItems: 'center' },
  barTrack:       { width: 80, height: 4, backgroundColor: C.divider, borderRadius: 2, marginRight: 8 },
  barFill:        { height: 4, borderRadius: 2, backgroundColor: C.accent },
  quizPct:        { fontSize: 9, fontWeight: 'bold', color: C.ink, width: 30, textAlign: 'right' },
  quizLabel:      { fontSize: 9, color: C.sub, fontWeight: 'bold' },

  // Advice
  adviceTitle:    { fontSize: 11, fontWeight: 'bold', color: C.navy, marginBottom: 6, marginTop: 20 },
  adviceUnderline:{ height: 1, backgroundColor: C.navy, marginBottom: 14, width: 200 },
  adviceBlock:    { marginBottom: 14 },
  adviceQuizName: { fontSize: 9.5, fontWeight: 'bold', color: C.ink, marginBottom: 3 },
  adviceText:     { fontSize: 9, color: C.sub, lineHeight: 1.55 },
  adviceDivider:  { height: 0.5, backgroundColor: C.divider, marginTop: 10 },
});

function perf(pct: number): string {
  if (pct >= 90) return 'Excellent';
  if (pct >= 75) return 'Good';
  if (pct >= 60) return 'Developing';
  return 'Needs Support';
}

function qualLabel(result: any): string | null {
  const cat = result.subcategory;
  if (cat === 'learning-style' || result.quizId === 'learning-styles') {
    const style = result.additionalData?.dominantStyle
      ?? (result.additionalData?.primaryDimension === 'reading' ? 'reading-writing' : result.additionalData?.primaryDimension);
    if (!style) return null;
    const d: Record<string, string> = {
      visual: 'Visual Learner', auditory: 'Auditory Learner',
      'reading-writing': 'Reading/Writing Learner', kinesthetic: 'Kinesthetic Learner',
    };
    return d[style] || `${style} Learner`;
  }
  if (cat === 'social-emotional' || result.quizId === 'social-emotional') {
    if (result.additionalData?.primaryTitle) return result.additionalData.primaryTitle;
    const labels: Record<string, string> = { EA: 'Emotional Awareness', PS: 'Prosocial Skills', SR: 'Self-Regulation' };
    return labels[result.additionalData?.primaryStrength] || 'SEL Assessment';
  }
  if (cat === 'attention' || result.quizId === 'attention-assessment') {
    const ad = result.additionalData || {};
    return ad.attentionLevel || (result.percentage >= 75 ? 'Strong Focus' : result.percentage >= 60 ? 'Moderate Focus' : 'Developing Focus');
  }
  if (result.quizId === 'oral-language-reading') {
    const wcpm = result.additionalData?.wcpm ?? result.score;
    return `${wcpm} words / min`;
  }
  return null;
}

function getAnalysis(result: any): string {
  const cat = result.subcategory;
  const pct = result.percentage;
  if (cat === 'attention') return pct >= 75 ? 'Strong attention and focus capabilities.' : 'Developing attention skills — short focused sessions and regular movement breaks are recommended.';
  if (cat === 'memory') return pct >= 75 ? 'Strong memory and recall abilities.' : 'Developing memory skills — practice with sequencing activities and memory games.';
  if (cat === 'learning-style') return 'Learning preference identified — tailor activities and study environment accordingly.';
  if (cat === 'social-emotional') return result.additionalData?.description || 'Social-emotional strengths assessed.';
  if (cat === 'critical-thinking') return pct >= 75 ? 'Solid critical thinking and reasoning abilities.' : 'Developing reasoning skills — encourage problem-solving games and "why" questions.';
  if (cat === 'perception') return pct >= 75 ? 'Good visual perception and spatial awareness.' : 'Developing visual processing — I-spy games and puzzles are helpful.';
  if (cat === 'oral-language') return pct >= 75 ? 'Strong oral language and communication skills.' : 'Developing oral language — encourage storytelling and conversation.';
  if (cat === 'spelling') return pct >= 75 ? 'Strong spelling skills.' : 'Developing spelling — regular practice with word patterns is recommended.';
  if (cat === 'writing') return pct >= 75 ? 'Solid writing skills.' : 'Developing writing — regular journaling and guided writing practice encouraged.';
  if (cat === 'vocabulary') return pct >= 75 ? 'Strong vocabulary knowledge.' : 'Developing vocabulary — encourage daily reading and word games.';
  return 'Assessment completed successfully.';
}

const subNames: Record<string, string> = {
  attention: 'Attention & Focus', memory: 'Memory & Recall',
  'learning-style': 'Learning Style', 'social-emotional': 'Social-Emotional',
  'critical-thinking': 'Critical Thinking', perception: 'Visual Perception',
  'oral-language': 'Oral Language', spelling: 'Spelling',
  writing: 'Writing Skills', vocabulary: 'Vocabulary',
};

const FooterText = () => (
  <Text style={s.footer} fixed>
    Holistic Skills Assessment Report  ·  Bloom Tutoring  ·  {new Date().toLocaleDateString('en-AU', { year: 'numeric', month: 'long', day: 'numeric' })}
  </Text>
);

const BarFill: React.FC<{ pct: number }> = ({ pct }) => (
  <View style={s.barTrack}>
    <View style={[s.barFill, { width: `${Math.max(2, pct)}%` }]} />
  </View>
);

const SectionBlock: React.FC<{ title: string; results: any[] }> = ({ title, results }) => {
  if (results.length === 0) return null;
  const groups: Record<string, any[]> = {};
  for (const r of results) { (groups[r.subcategory] ??= []).push(r); }

  return (
    <View style={s.sectionGap}>
      <Text style={s.sectionTitle}>{title.toUpperCase()}</Text>
      <View style={s.sectionUnderline} />
      {Object.entries(groups).map(([sub, items]) => (
        <View key={sub}>
          <Text style={s.subTitle}>{subNames[sub] || sub}</Text>
          <View style={s.subRule} />
          {items.map((r: any) => {
            const ql = qualLabel(r);
            return (
              <View key={r.quizId} style={s.quizRow} wrap={false}>
                <Text style={s.quizName}>{r.quizName}</Text>
                <View style={s.quizRight}>
                  {ql ? (
                    <Text style={s.quizLabel}>{ql}</Text>
                  ) : (
                    <>
                      <BarFill pct={r.percentage} />
                      <Text style={s.quizPct}>{r.percentage}%</Text>
                    </>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
};

export interface ReportPDFProps {
  progress: ProgressData;
  studentName?: string;
  showWatermark?: boolean;
  watermarkText?: string;
  watermarkOpacity?: number;
}

const ReportPDF: React.FC<ReportPDFProps> = ({ progress, studentName }) => {
  const mindResults = (progress.mindSectionResults ?? []).filter(
    r => !LEARNING_QUIZZES.some(q => q.id === r.quizId),
  );
  const oralResults     = progress.oralSectionResults ?? [];
  const academicResults = progress.academicSectionResults ?? [];
  const learningResults = [
    ...(progress.learningSectionResults ?? []),
    ...(progress.mindSectionResults ?? []).filter(r => LEARNING_QUIZZES.some(q => q.id === r.quizId)),
  ];
  const allResults = [...mindResults, ...oralResults, ...academicResults, ...learningResults];

  const totalQuizzes = MIND_QUIZZES.length + ORAL_QUIZZES.length + ACADEMIC_QUIZZES.length + LEARNING_QUIZZES.length;
  const completedCount = allResults.length;
  const avgScore = allResults.length > 0
    ? Math.round(allResults.reduce((s, r) => s + r.percentage, 0) / allResults.length)
    : 0;
  const isComplete = completedCount >= totalQuizzes;

  return (
    <Document>
      {/* COVER PAGE */}
      <Page size="A4" style={s.page}>
        <View style={s.topRule} fixed />
        <Text style={s.brand}>BLOOM TUTORING</Text>

        <Text style={s.titleMain}>HOLISTIC SKILLS</Text>
        <Text style={s.titleSub}>ASSESSMENT REPORT</Text>
        <View style={s.ruleAccent} />

        <Text style={s.studentName}>{studentName || 'Student'}</Text>
        <Text style={s.dateLine}>
          {new Date().toLocaleDateString('en-AU', { year: 'numeric', month: 'long', day: 'numeric' })}
          {!isComplete ? '  ·  Partial Assessment' : ''}
        </Text>

        <View style={s.rule} />

        <View style={s.statsRow}>
          {[
            { val: `${completedCount}/${totalQuizzes}`, lbl: 'Quizzes Completed' },
            { val: `${avgScore}%`,                      lbl: 'Overall Average' },
            { val: perf(avgScore),                      lbl: 'Performance Level' },
          ].map(({ val, lbl }) => (
            <View key={lbl} style={s.statItem}>
              <Text style={s.statVal}>{val}</Text>
              <Text style={s.statLbl}>{lbl}</Text>
            </View>
          ))}
        </View>

        <View style={s.rule} />

        <Text style={s.introText}>
          Dear Parent / Guardian,{'\n\n'}
          This {isComplete ? 'comprehensive' : 'partial'} report provides an overview of your child's performance across cognitive, language, and academic skill areas. Each section explains what was assessed and provides guidance on how you can support your child's learning at home.
          {!isComplete ? '\n\nYour child has completed some assessments — additional sections can be completed at any time for a full evaluation.' : ''}
        </Text>

        <View style={s.rule} />

        {/* Checklist */}
        {[
          { label: 'Mind Skills', quizzes: MIND_QUIZZES, done: mindResults },
          { label: 'Oral Language', quizzes: ORAL_QUIZZES, done: oralResults },
          { label: 'Academic Skills', quizzes: ACADEMIC_QUIZZES, done: academicResults },
          { label: 'Learning & SEL', quizzes: LEARNING_QUIZZES, done: learningResults },
        ].map(({ label, quizzes, done }) => (
          <View key={label} style={{ marginBottom: 10 }}>
            <Text style={{ fontSize: 9, fontWeight: 'bold', color: C.navy, marginBottom: 5 }}>{label.toUpperCase()}</Text>
            {quizzes.map((q) => {
              const result = done.find(r => r.quizId === q.id);
              const scoreText = result ? (getQuizResultLabel(result)?.value ?? `${result.percentage}%`) : 'not completed';
              return (
                <View key={q.id} style={s.checkRow}>
                  <Text style={result ? s.checkMark : s.checkPend}>{result ? '✓' : '○'}</Text>
                  <Text style={s.checkLabel}>{q.name}</Text>
                  <Text style={s.checkScore}>{scoreText}</Text>
                </View>
              );
            })}
          </View>
        ))}

        <FooterText />
      </Page>

      {/* RESULTS PAGE — all sections flow together */}
      {allResults.length > 0 && (
        <Page size="A4" style={s.page} wrap>
          <View style={s.topRule} fixed />
          <SectionBlock title="Mind Skills" results={mindResults} />
          <SectionBlock title="Oral Language" results={oralResults} />
          <SectionBlock title="Academic Skills" results={academicResults} />
          <SectionBlock title="Learning & Social-Emotional" results={learningResults} />
          <FooterText />
        </Page>
      )}

      {/* ANALYSIS PAGE — all advice flows together */}
      {allResults.length > 0 && (
        <Page size="A4" style={s.page} wrap>
          <View style={s.topRule} fixed />
          <Text style={s.adviceTitle}>SKILL ANALYSIS & GUIDANCE</Text>
          <View style={s.adviceUnderline} />

          {allResults.map((r, i) => {
            const ql = qualLabel(r);
            const scoreDisplay = ql || `${r.percentage}% — ${perf(r.percentage)}`;
            return (
              <View key={r.quizId} style={s.adviceBlock} wrap={false}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <Text style={s.adviceQuizName}>{r.quizName}</Text>
                  <Text style={{ fontSize: 8.5, color: C.muted }}>{scoreDisplay}</Text>
                </View>
                <Text style={s.adviceText}>{getAnalysis(r)}</Text>
                {i < allResults.length - 1 && <View style={s.adviceDivider} />}
              </View>
            );
          })}

          <FooterText />
        </Page>
      )}
    </Document>
  );
};

export const ReportPDFEnglish = ReportPDF;
export default ReportPDF;
