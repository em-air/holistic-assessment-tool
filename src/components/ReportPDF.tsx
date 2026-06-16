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
import {
  getSubcategoryNameBilingual,
  getSkillDescriptionBilingual,
} from '../i18n/reportTranslations';

/* ═══════════════════════════════════════════════════════
   Font registration — local files served from public/
   ═══════════════════════════════════════════════════════ */

// Note: English pages use built-in 'Helvetica' — no CDN font needed

// Arabic font — TTF served from public/fonts/ (WOFF files were too small / incomplete)
Font.register({
  family: 'NotoSansArabic',
  src: '/fonts/NotoSansArabic-Regular.ttf',
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

  /* teacher section */
  teacherSection: { backgroundColor: '#fef3c7', padding: 12, borderRadius: 5, marginTop: 8 },
  teacherTitle: { fontSize: 15, fontWeight: 'bold', color: '#92400e', marginBottom: 10, borderBottom: 1, borderColor: '#fbbf24', paddingBottom: 5 },
  teacherQuizTitle: { fontSize: 11, fontWeight: 'bold', color: '#78350f', marginBottom: 4 },
  teacherParagraph: { fontSize: 9, color: '#451a03', lineHeight: 1.4, marginBottom: 10 },

  /* footer */
  footer: { position: 'absolute', bottom: 28, left: 30, right: 30, fontSize: 7, color: '#9ca3af', textAlign: 'center', borderTop: 1, borderColor: '#e5e7eb', paddingTop: 8 },
});

/* ═══════════════════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════════════════ */

const subName: Record<string, string> = {
  attention: 'Attention', memory: 'Memory', 'learning-style': 'Learning Style',
  'social-emotional': 'Social-Emotional',
  'critical-thinking': 'Critical Thinking', perception: 'Perception',
  'oral-language': 'Oral Language',
  spelling: 'Spelling', writing: 'Writing Skills', vocabulary: 'Vocabulary',
};

const catColor: Record<string, string> = {
  attention: '#eab308', memory: '#f97316', 'learning-style': '#22c55e',
  'social-emotional': '#ec4899',
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
    const style = result.additionalData?.dominantStyle
      ?? (result.additionalData?.primaryDimension === 'reading'
        ? 'reading-writing'
        : result.additionalData?.primaryDimension);
    if (style) {
      const d: Record<string, string> = {
        visual: 'Visual Learner — learns best through seeing, diagrams, charts.',
        auditory: 'Auditory Learner — learns best through listening and discussion.',
        'reading-writing': 'Reading/Writing Learner — learns best through written words.',
        kinesthetic: 'Kinesthetic Learner — learns best through hands-on activities.',
      };
      return d[style] || 'Adapt teaching methods to match this preference.';
    }
    return 'Still discovering optimal learning style — try different approaches.';
  }
  if (cat === 'social-emotional') {
    if (result.additionalData?.description) return result.additionalData.description;
    const labels: Record<string, string> = {
      EA: 'Emotional Awareness Strength — good at noticing and understanding feelings.',
      PS: 'Prosocial Strength — good at helping others and cooperating.',
      SR: 'Self-Regulation Strength — good at staying calm and trying again.',
    };
    return labels[result.additionalData?.primaryStrength] || 'Social-emotional strengths identified through the SEL assessment.';
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
  if (cat === 'social-emotional') {
    const ad = result.additionalData || {};
    const scoreNote = rtl(pct >= 75
      ? 'نتيجة قوية تعكس مهارات اجتماعية-عاطفية متطورة.'
      : pct >= 60
      ? 'نتيجة تشير إلى مهارات قيد التطور — مع التشجيع والممارسة ستستمر هذه المهارات في النمو.'
      : 'يستفيد هذا المجال من دعم إضافي وممارسة موجهة لتعزيز المهارات الاجتماعية-العاطفية.');
    const strengthNote = rtl(
      ad.primaryStrength === 'EA' ? 'يُظهر الطالب قوة في الوعي العاطفي وفهم المشاعر.' :
      ad.primaryStrength === 'PS' ? 'يُظهر الطالب قوة اجتماعية في مساعدة الآخرين والتعاون مع الأقران.' :
      ad.primaryStrength === 'SR' ? 'يُظهر الطالب قوة في ضبط النفس والهدوء والمثابرة في مواجهة التحديات.' :
      'أكمل الطالب تقييم التعلم الاجتماعي-العاطفي.'
    );
    return `${strengthNote} ${scoreNote}`;
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
   Teacher paragraph helpers — one paragraph per Mind quiz
   ═══════════════════════════════════════════════════════ */

const buildAttentionParagraphEn = (result: any): string => {
  const ad = result.additionalData || {};
  const overallLevel = ad.attentionLevel || (result.percentage >= 75 ? 'Strong' : result.percentage >= 60 ? 'Moderate' : 'Developing');
  const focusingLevel = ad.focusingLevel || overallLevel;
  const shiftingLevel = ad.shiftingLevel || overallLevel;
  const focusPct = ad.focusingPercentage;
  const shiftPct = ad.shiftingPercentage;

  const isStrongFocus = /strong|good|high/i.test(focusingLevel);
  const isStrongShift = /strong|good|high/i.test(shiftingLevel);
  const isWeakFocus = /developing|low|weak|needs/i.test(focusingLevel);
  const isWeakShift = /developing|low|weak|needs/i.test(shiftingLevel);

  let parts: string[] = [];
  parts.push(`The Attention Control Assessment evaluated the student across two subscales: Focusing (sustaining attention on a task) and Shifting (switching attention between tasks). The student's overall attention level was rated as "${overallLevel}".`);

  if (isStrongFocus && isStrongShift) {
    parts.push(`Both focusing${focusPct != null ? ` (${focusPct}%)` : ''} and shifting${shiftPct != null ? ` (${shiftPct}%)` : ''} abilities are strong. The student can sustain concentration on activities and transition smoothly between tasks. This is a positive indicator for classroom learning, as it supports engagement in lessons and the ability to follow complex, multi-step instructions.`);
  } else if (isStrongFocus && isWeakShift) {
    parts.push(`While the student's focusing ability is strong${focusPct != null ? ` (${focusPct}%)` : ''}, they have difficulty with shifting attention${shiftPct != null ? ` (${shiftPct}%)` : ''}. This means the student can concentrate well on a single task but may struggle when asked to switch between activities or transition to a new topic. Consider providing clear transition warnings (e.g., "in 2 minutes we will switch to math"), using visual schedules, and allowing extra time during transitions between activities.`);
  } else if (isWeakFocus && isStrongShift) {
    parts.push(`The student shows difficulty with sustained focusing${focusPct != null ? ` (${focusPct}%)` : ''} but has good shifting ability${shiftPct != null ? ` (${shiftPct}%)` : ''}. They can switch between tasks effectively but may struggle to maintain concentration on a single activity for extended periods. Consider breaking tasks into shorter segments, using timers to create structured focus intervals, and providing frequent check-ins to help the student stay engaged.`);
  } else if (isWeakFocus && isWeakShift) {
    parts.push(`Both focusing${focusPct != null ? ` (${focusPct}%)` : ''} and shifting${shiftPct != null ? ` (${shiftPct}%)` : ''} abilities need support. The student may have difficulty maintaining concentration on tasks and also struggle when transitioning between activities. Consider seating the student away from distractions, using visual cues and timers, breaking tasks into small steps, providing transition warnings, and checking in frequently to help the student stay on track.`);
  } else {
    // Mixed moderate levels
    parts.push(`Focusing was rated as "${focusingLevel}"${focusPct != null ? ` (${focusPct}%)` : ''} and shifting was rated as "${shiftingLevel}"${shiftPct != null ? ` (${shiftPct}%)` : ''}. The student may benefit from structured activities with clear instructions, periodic check-ins, and visual schedules to support both sustained attention and smooth transitions between tasks.`);
  }

  return parts.join(' ');
};

const getTeacherParagraph = (result: any): string => {
  const pct = result.percentage;
  switch (result.quizId) {
    case 'attention-assessment':
      return buildAttentionParagraphEn(result);
    case 'picture-sequence':
      if (pct >= 75) return 'The student demonstrates strong visual memory and sequencing skills. They can effectively recall and arrange visual information in the correct order, which is important for understanding stories, following procedures, and organizing thoughts logically.';
      if (pct >= 60) return 'The student shows developing visual memory and sequencing abilities. They can sometimes recall and order visual information but may need additional support. Practice with picture stories and step-by-step visual activities can help strengthen these skills.';
      return 'The student has difficulty with visual memory and sequencing tasks. They struggle to remember and arrange images in the correct order. This may affect their ability to follow story sequences or multi-step procedures. Consider using visual aids, graphic organizers, and repeated practice with sequencing activities to build this skill.';
    case 'flash-word-quiz':
      if (pct >= 75) return 'The student has strong rapid word recognition skills. They can quickly identify and remember words that are briefly displayed, indicating good visual processing speed and word memory. This is a positive sign for reading fluency development.';
      if (pct >= 60) return 'The student shows moderate rapid word recognition abilities. They can recognize some flashed words but may need more time or repetition. Continued practice with sight words and flash card activities can help improve speed and accuracy.';
      return 'The student has difficulty remembering words that were briefly flashed and needs additional work in this area. This suggests challenges with rapid visual word processing and sight word memory, which can affect reading fluency. Consider using repeated exposure to high-frequency words, flash card drills at a gradually increasing pace, and multisensory word recognition activities.';
    case 'learning-styles': {
      const style = result.additionalData?.dominantStyle;
      if (style === 'visual') return 'The student has been identified as a visual learner. They learn best through seeing information presented in diagrams, charts, pictures, and written text. To support this student, use visual aids such as graphic organizers, color-coded notes, videos, and demonstrations. Allow them to draw or map out concepts when possible.';
      if (style === 'auditory') return 'The student has been identified as an auditory learner. They learn best through listening, discussions, and verbal explanations. To support this student, incorporate group discussions, oral instructions, read-alouds, and audio resources. Allow them to talk through problems and explain their thinking verbally.';
      if (style === 'kinesthetic') return 'The student has been identified as a kinesthetic learner. They learn best through hands-on activities, movement, and physical engagement. To support this student, incorporate manipulatives, role-playing, experiments, and movement breaks into lessons. Allow them to build models or act out concepts when possible.';
      if (style === 'reading-writing') return 'The student has been identified as a reading/writing learner. They learn best through reading text and writing notes. To support this student, provide written instructions, encourage note-taking, and use reading-based assignments. Allow them to express understanding through written responses and journaling.';
      return 'The learning style assessment has been completed. Understanding the student\'s preferred learning style can help tailor instruction to their strengths.';
    }
    case 'critical-thinking-quiz':
      if (pct >= 75) return 'The student demonstrates strong critical thinking skills across both analogical reasoning and classification tasks. They can identify relationships between concepts and effectively group items by shared characteristics, which supports problem-solving, organisational thinking, and academic reasoning.';
      if (pct >= 60) return 'The student shows developing critical thinking abilities. They can sometimes identify relationships and classify items correctly but may struggle with more complex reasoning tasks. Practice with analogy exercises, sorting games, and guided classification activities can help strengthen these skills.';
      return 'The student has difficulty with critical thinking tasks involving analogical reasoning and classification. Consider using concrete examples, visual analogy cards, and hands-on sorting activities to build these foundational reasoning skills.';
    case 'analogy-quiz':
      if (pct >= 75) return 'The student demonstrates strong analogical reasoning skills. They can identify relationships between concepts and apply that understanding to new situations. This is an important foundation for critical thinking, problem-solving, and understanding complex academic content.';
      if (pct >= 60) return 'The student shows developing analogical reasoning abilities. They can sometimes identify relationships between concepts but may struggle with more complex analogies. Practice with word relationship games and guided analogy exercises can help strengthen this skill.';
      return 'The student has difficulty with analogical reasoning and struggles to identify relationships between concepts. This may affect their ability to make connections across subjects and solve problems that require relational thinking. Consider using concrete examples, visual analogy cards, and guided practice to help the student recognize patterns and relationships.';
    case 'category-quiz':
      if (pct >= 75) return 'The student demonstrates strong categorization and classification skills. They can effectively group items based on shared characteristics, which supports organizational thinking, vocabulary development, and the ability to identify patterns in information.';
      if (pct >= 60) return 'The student shows developing categorization skills. They can group some items correctly but may have difficulty with less obvious groupings. Sorting activities, classification games, and discussions about how things are alike and different can help improve this skill.';
      return 'The student struggles with categorization and classification tasks. They have difficulty grouping items by shared characteristics, which may impact their ability to organize information and see patterns. Consider using hands-on sorting activities, visual grouping exercises, and explicit instruction on identifying common features among items.';
    case 'picture-difference-quiz':
      if (pct >= 75) return 'The student demonstrates strong visual attention to detail. They can accurately detect whether two images are the same or subtly different, which reflects well-developed visual discrimination and perceptual acuity.';
      if (pct >= 60) return 'The student shows developing visual attention skills. They can identify some image differences but may miss subtle variations. Practice with visual comparison activities and spot-the-difference puzzles can help sharpen this skill.';
      return 'The student has difficulty detecting subtle differences between images, suggesting challenges with visual attention to detail. Consider using guided visual comparison exercises and spot-the-difference activities to build perceptual awareness.';
    case 'logical-sequencing-quiz':
      if (pct >= 75) return 'The student demonstrates strong logical sequencing abilities. They can arrange information in a logical order, which is essential for understanding cause and effect, following procedures, and constructing well-organized written and verbal responses.';
      if (pct >= 60) return 'The student shows developing logical sequencing skills. They can sometimes order events or steps correctly but may struggle with more complex sequences. Practice with timeline activities, process ordering, and sequential storytelling can help strengthen this ability.';
      return 'The student has difficulty with logical sequencing tasks and struggles to arrange information in a meaningful order. This may affect their ability to understand cause and effect, follow multi-step directions, and organize their thoughts for writing. Consider using visual timelines, step-by-step guides, and sequencing card activities to build this skill.';
    case 'missing-object-quiz':
      if (pct >= 75) return 'The student demonstrates strong visual perception and observation skills. They can quickly identify missing elements in visual scenes, which supports attention to detail, visual analysis, and spatial awareness in the classroom.';
      if (pct >= 60) return 'The student shows developing visual perception skills. They can identify some missing objects but may miss others. Practice with visual puzzles, spot-the-difference games, and observation activities can help strengthen this ability.';
      return 'The student has difficulty identifying missing objects in visual scenes, suggesting challenges with visual perception and observation. This may affect their ability to notice important details in visual materials and classroom activities. Consider using visual scanning exercises, I-spy games, and guided observation activities to develop these skills.';
    case 'social-emotional': {
      const ad = result.additionalData || {};
      const description = ad.description || (
        ad.primaryStrength === 'EA' ? 'The student shows strength in emotional awareness and understanding feelings.' :
        ad.primaryStrength === 'PS' ? 'The student shows prosocial strengths in helping others and cooperating with peers.' :
        ad.primaryStrength === 'SR' ? 'The student shows self-regulation strengths in staying calm and persevering through challenges.' :
        'The student completed the Social-Emotional Learning assessment.'
      );
      const suggestions: string[] = Array.isArray(ad.suggestions) ? ad.suggestions : [];
      const scoreNote = pct >= 75
        ? 'This is a strong result that reflects well-developed social-emotional skills.'
        : pct >= 60
        ? 'This is a developing result — with encouragement and practice, these skills will continue to grow.'
        : 'This area would benefit from additional support and guided practice to strengthen social-emotional skills.';
      const suggestionText = suggestions.length > 0
        ? ` Suggested activities: ${suggestions.join('; ')}.`
        : '';
      return `${description} ${scoreNote}${suggestionText}`;
    }
    default:
      return '';
  }
};

const buildAttentionParagraphAr = (result: any): string => {
  const ad = result.additionalData || {};
  const overallLevel = ad.attentionLevel || (result.percentage >= 75 ? 'Strong' : result.percentage >= 60 ? 'Moderate' : 'Developing');
  const focusingLevel = ad.focusingLevel || overallLevel;
  const shiftingLevel = ad.shiftingLevel || overallLevel;
  const focusPct = ad.focusingPercentage;
  const shiftPct = ad.shiftingPercentage;

  const isStrongFocus = /strong|good|high/i.test(focusingLevel);
  const isStrongShift = /strong|good|high/i.test(shiftingLevel);
  const isWeakFocus = /developing|low|weak|needs/i.test(focusingLevel);
  const isWeakShift = /developing|low|weak|needs/i.test(shiftingLevel);

  let parts: string[] = [];
  parts.push(rtl(`قيّم اختبار التحكم في الانتباه الطالب عبر مقياسين فرعيين: التركيز (الحفاظ على الانتباه لمهمة واحدة) والتحويل (الانتقال بين المهام). تم تقييم مستوى الانتباه العام للطالب بـ "${overallLevel}".`));

  if (isStrongFocus && isStrongShift) {
    parts.push(rtl(`كلتا قدرتي التركيز${focusPct != null ? ` (${focusPct}%)` : ''} والتحويل${shiftPct != null ? ` (${shiftPct}%)` : ''} قوية. يستطيع الطالب الحفاظ على التركيز في الأنشطة والانتقال بسلاسة بين المهام. هذا مؤشر إيجابي للتعلم في الفصل الدراسي، حيث يدعم المشاركة في الدروس والقدرة على اتباع التعليمات المعقدة المتعددة الخطوات.`));
  } else if (isStrongFocus && isWeakShift) {
    parts.push(rtl(`بينما قدرة الطالب على التركيز قوية${focusPct != null ? ` (${focusPct}%)` : ''}، إلا أنه يواجه صعوبة في تحويل الانتباه${shiftPct != null ? ` (${shiftPct}%)` : ''}. هذا يعني أن الطالب يستطيع التركيز جيداً على مهمة واحدة لكنه قد يجد صعوبة عند المطالبة بالانتقال بين الأنشطة أو التحول إلى موضوع جديد. يُنصح بتقديم تنبيهات واضحة قبل الانتقال واستخدام الجداول المرئية والسماح بوقت إضافي أثناء التحولات بين الأنشطة.`));
  } else if (isWeakFocus && isStrongShift) {
    parts.push(rtl(`يُظهر الطالب صعوبة في التركيز المستمر${focusPct != null ? ` (${focusPct}%)` : ''} لكن لديه قدرة جيدة على التحويل${shiftPct != null ? ` (${shiftPct}%)` : ''}. يمكنه الانتقال بين المهام بفعالية لكنه قد يجد صعوبة في الحفاظ على التركيز على نشاط واحد لفترات طويلة. يُنصح بتقسيم المهام إلى أجزاء أقصر واستخدام المؤقتات لإنشاء فترات تركيز منظمة وتوفير متابعة متكررة لمساعدة الطالب على البقاء منخرطاً.`));
  } else if (isWeakFocus && isWeakShift) {
    parts.push(rtl(`كلتا قدرتي التركيز${focusPct != null ? ` (${focusPct}%)` : ''} والتحويل${shiftPct != null ? ` (${shiftPct}%)` : ''} تحتاجان إلى دعم. قد يواجه الطالب صعوبة في الحفاظ على التركيز على المهام وأيضاً يجد صعوبة عند الانتقال بين الأنشطة. يُنصح بإجلاس الطالب بعيداً عن المشتتات واستخدام الإشارات البصرية والمؤقتات وتقسيم المهام إلى خطوات صغيرة وتقديم تنبيهات الانتقال والتحقق بشكل متكرر لمساعدة الطالب على البقاء في المسار الصحيح.`));
  } else {
    parts.push(rtl(`تم تقييم التركيز بـ "${focusingLevel}"${focusPct != null ? ` (${focusPct}%)` : ''} والتحويل بـ "${shiftingLevel}"${shiftPct != null ? ` (${shiftPct}%)` : ''}. قد يستفيد الطالب من أنشطة منظمة مع تعليمات واضحة ومتابعة دورية وجداول مرئية لدعم كل من الانتباه المستمر والانتقالات السلسة بين المهام.`));
  }

  return parts.join(' ');
};

const getTeacherParagraphAr = (result: any): string => {
  const pct = result.percentage;
  switch (result.quizId) {
    case 'attention-assessment':
      return buildAttentionParagraphAr(result);
    case 'picture-sequence':
      if (pct >= 75) return rtl('يُظهر الطالب مهارات قوية في الذاكرة البصرية والتسلسل. يمكنه استرجاع وترتيب المعلومات البصرية بالترتيب الصحيح بفعالية، وهو أمر مهم لفهم القصص واتباع الإجراءات وتنظيم الأفكار بشكل منطقي.');
      if (pct >= 60) return rtl('يُظهر الطالب قدرات متطورة في الذاكرة البصرية والتسلسل. يمكنه أحياناً استرجاع وترتيب المعلومات البصرية لكنه قد يحتاج إلى دعم إضافي. يمكن أن تساعد الممارسة مع القصص المصورة والأنشطة البصرية المتسلسلة في تعزيز هذه المهارات.');
      return rtl('يواجه الطالب صعوبة في مهام الذاكرة البصرية والتسلسل. يجد صعوبة في تذكر وترتيب الصور بالترتيب الصحيح. قد يؤثر ذلك على قدرته على متابعة تسلسل القصص أو الإجراءات المتعددة الخطوات. يُنصح باستخدام الوسائل البصرية والمنظمات الرسومية والممارسة المتكررة مع أنشطة التسلسل لبناء هذه المهارة.');
    case 'flash-word-quiz':
      if (pct >= 75) return rtl('يتمتع الطالب بمهارات قوية في التعرف السريع على الكلمات. يمكنه تحديد وتذكر الكلمات التي تُعرض بسرعة، مما يشير إلى سرعة معالجة بصرية جيدة وذاكرة كلمات قوية. هذا مؤشر إيجابي لتطوير الطلاقة في القراءة.');
      if (pct >= 60) return rtl('يُظهر الطالب قدرات متوسطة في التعرف السريع على الكلمات. يمكنه التعرف على بعض الكلمات المعروضة لكنه قد يحتاج إلى مزيد من الوقت أو التكرار. يمكن أن تساعد الممارسة المستمرة مع الكلمات الشائعة وأنشطة البطاقات التعليمية في تحسين السرعة والدقة.');
      return rtl('يواجه الطالب صعوبة في تذكر الكلمات التي تُعرض بسرعة ويحتاج إلى عمل إضافي في هذا المجال. يشير ذلك إلى تحديات في المعالجة البصرية السريعة للكلمات وذاكرة الكلمات البصرية، مما قد يؤثر على طلاقة القراءة. يُنصح بالتعرض المتكرر للكلمات عالية التردد وتمارين البطاقات التعليمية بوتيرة متزايدة تدريجياً وأنشطة التعرف على الكلمات متعددة الحواس.');
    case 'learning-styles': {
      const style = result.additionalData?.dominantStyle;
      if (style === 'visual') return rtl('تم تحديد الطالب كمتعلم بصري. يتعلم بشكل أفضل من خلال رؤية المعلومات المقدمة في الرسوم البيانية والمخططات والصور والنصوص المكتوبة. لدعم هذا الطالب، استخدم الوسائل البصرية مثل المنظمات الرسومية والملاحظات الملونة ومقاطع الفيديو والعروض التوضيحية. اسمح له بالرسم أو رسم الخرائط المفاهيمية عندما يكون ذلك ممكناً.');
      if (style === 'auditory') return rtl('تم تحديد الطالب كمتعلم سمعي. يتعلم بشكل أفضل من خلال الاستماع والمناقشات والشروحات اللفظية. لدعم هذا الطالب، أدخل المناقشات الجماعية والتعليمات الشفهية والقراءة بصوت عالٍ والموارد الصوتية. اسمح له بالتحدث عن المشكلات وشرح تفكيره شفهياً.');
      if (style === 'kinesthetic') return rtl('تم تحديد الطالب كمتعلم حركي. يتعلم بشكل أفضل من خلال الأنشطة العملية والحركة والمشاركة البدنية. لدعم هذا الطالب، أدخل الأدوات التعليمية الملموسة ولعب الأدوار والتجارب وفترات الراحة الحركية في الدروس. اسمح له ببناء النماذج أو تمثيل المفاهيم عندما يكون ذلك ممكناً.');
      if (style === 'reading-writing') return rtl('تم تحديد الطالب كمتعلم قرائي/كتابي. يتعلم بشكل أفضل من خلال قراءة النصوص وكتابة الملاحظات. لدعم هذا الطالب، قدم تعليمات مكتوبة وشجع على تدوين الملاحظات واستخدم المهام المبنية على القراءة. اسمح له بالتعبير عن فهمه من خلال الاستجابات المكتوبة والتدوين.');
      return rtl('تم إكمال تقييم أسلوب التعلم للطالب. يمكن أن يساعد فهم أسلوب التعلم المفضل للطالب في تخصيص التعليم بما يتناسب مع نقاط قوته.');
    }
    case 'social-emotional': {
      const ad = result.additionalData || {};
      const profileDesc = rtl(
        ad.primaryStrength === 'EA'
          ? 'يبدو أن الطالب جيد في ملاحظة المشاعر وفهمها، مما يساعده على التواصل وحل المشكلات.'
          : ad.primaryStrength === 'PS'
          ? 'يبدو أن الطالب جيد في مساعدة الآخرين والتعاون معهم وكونه صديقاً داعماً.'
          : ad.primaryStrength === 'SR'
          ? 'يبدو أن الطالب جيد في الحفاظ على الهدوء والتعامل مع التحديات والمحاولة مرة أخرى عند مواجهة الصعوبات.'
          : 'أكمل الطالب تقييم التعلم الاجتماعي-العاطفي.'
      );
      const scoreAdvice = rtl(pct >= 75
        ? 'هذه نتيجة قوية. لمواصلة الدعم، شجّع الطالب على مناقشة المشاعر ولعب الأدوار في المواقف الاجتماعية وممارسة الاستراتيجيات التي اكتشفها.'
        : pct >= 60
        ? 'هذه نتيجة متطورة. يُنصح بتوفير فرص منتظمة لممارسة المهارات الاجتماعية-العاطفية مثل العمل الجماعي والحوارات حول المشاعر وتقنيات الاسترخاء.'
        : 'يستفيد هذا الطالب من دعم إضافي في المجال الاجتماعي-العاطفي. يُنصح بتوفير تدريب منظم على مهارات الوعي العاطفي والتنظيم الذاتي والتعاون من خلال أنشطة تفاعلية وموجهة.');
      const suggestions: string[] = Array.isArray(ad.suggestions) ? ad.suggestions : [];
      const suggestionText = suggestions.length > 0
        ? ' ' + rtl(`أنشطة مقترحة: ${suggestions.join('؛ ')}.`)
        : '';
      return `${profileDesc} ${scoreAdvice}${suggestionText}`;
    }
    case 'critical-thinking-quiz':
      if (pct >= 75) return rtl('يُظهر الطالب مهارات قوية في التفكير النقدي في كل من التفكير القياسي ومهام التصنيف. يمكنه تحديد العلاقات بين المفاهيم وتجميع العناصر بفعالية بناءً على الخصائص المشتركة، مما يدعم حل المشكلات والتفكير التنظيمي والتفكير الأكاديمي.');
      if (pct >= 60) return rtl('يُظهر الطالب قدرات متطورة في التفكير النقدي. يمكنه أحياناً تحديد العلاقات وتصنيف العناصر بشكل صحيح لكنه قد يواجه صعوبة في مهام التفكير الأكثر تعقيداً. يمكن أن تساعد تمارين القياس وألعاب الفرز وأنشطة التصنيف الموجهة في تعزيز هذه المهارات.');
      return rtl('يواجه الطالب صعوبة في مهام التفكير النقدي المتعلقة بالتفكير القياسي والتصنيف. يُنصح باستخدام أمثلة ملموسة وبطاقات القياس البصرية وأنشطة الفرز العملية لبناء مهارات التفكير الأساسية هذه.');
    case 'analogy-quiz':
      if (pct >= 75) return rtl('يُظهر الطالب مهارات قوية في التفكير القياسي. يمكنه تحديد العلاقات بين المفاهيم وتطبيق هذا الفهم على مواقف جديدة. هذا أساس مهم للتفكير النقدي وحل المشكلات وفهم المحتوى الأكاديمي المعقد.');
      if (pct >= 60) return rtl('يُظهر الطالب قدرات متطورة في التفكير القياسي. يمكنه أحياناً تحديد العلاقات بين المفاهيم لكنه قد يواجه صعوبة مع القياسات الأكثر تعقيداً. يمكن أن تساعد الممارسة مع ألعاب علاقات الكلمات وتمارين القياس الموجهة في تعزيز هذه المهارة.');
      return rtl('يواجه الطالب صعوبة في التفكير القياسي ويجد صعوبة في تحديد العلاقات بين المفاهيم. قد يؤثر ذلك على قدرته على إجراء الروابط بين المواد الدراسية وحل المشكلات التي تتطلب التفكير العلائقي. يُنصح باستخدام أمثلة ملموسة وبطاقات القياس البصرية والممارسة الموجهة لمساعدة الطالب على التعرف على الأنماط والعلاقات.');
    case 'category-quiz':
      if (pct >= 75) return rtl('يُظهر الطالب مهارات قوية في التصنيف والتبويب. يمكنه تجميع العناصر بفعالية بناءً على الخصائص المشتركة، مما يدعم التفكير التنظيمي وتطوير المفردات والقدرة على تحديد الأنماط في المعلومات.');
      if (pct >= 60) return rtl('يُظهر الطالب مهارات متطورة في التصنيف. يمكنه تجميع بعض العناصر بشكل صحيح لكنه قد يواجه صعوبة مع التجميعات الأقل وضوحاً. يمكن أن تساعد أنشطة الفرز وألعاب التصنيف والمناقشات حول أوجه التشابه والاختلاف في تحسين هذه المهارة.');
      return rtl('يواجه الطالب صعوبة في مهام التصنيف والتبويب. يجد صعوبة في تجميع العناصر حسب الخصائص المشتركة، مما قد يؤثر على قدرته على تنظيم المعلومات ورؤية الأنماط. يُنصح باستخدام أنشطة الفرز العملية وتمارين التجميع البصري والتعليم المباشر لتحديد السمات المشتركة بين العناصر.');
    case 'picture-difference-quiz':
      if (pct >= 75) return rtl('يُظهر الطالب انتباهاً بصرياً قوياً للتفاصيل. يمكنه تحديد ما إذا كانت الصورتان متطابقتين أم مختلفتين بدقة، مما يعكس مهارات تمييز بصري متطورة وقدرة إدراكية عالية.');
      if (pct >= 60) return rtl('يُظهر الطالب مهارات انتباه بصري في طور التطور. يمكنه اكتشاف بعض الاختلافات بين الصور لكنه قد يفوت الفروق الدقيقة. يمكن أن تساعد أنشطة المقارنة البصرية وألعاب اكتشاف الاختلافات في صقل هذه المهارة.');
      return rtl('يواجه الطالب صعوبة في اكتشاف الاختلافات الدقيقة بين الصور، مما يشير إلى تحديات في الانتباه البصري للتفاصيل. يُنصح باستخدام تمارين المقارنة البصرية الموجهة وأنشطة اكتشاف الاختلافات لتنمية الوعي الإدراكي.');
    case 'logical-sequencing-quiz':
      if (pct >= 75) return rtl('يُظهر الطالب قدرات قوية في التسلسل المنطقي. يمكنه ترتيب المعلومات بترتيب منطقي، وهو أمر أساسي لفهم السبب والنتيجة واتباع الإجراءات وبناء استجابات مكتوبة وشفهية منظمة.');
      if (pct >= 60) return rtl('يُظهر الطالب مهارات متطورة في التسلسل المنطقي. يمكنه أحياناً ترتيب الأحداث أو الخطوات بشكل صحيح لكنه قد يواجه صعوبة مع التسلسلات الأكثر تعقيداً. يمكن أن تساعد الممارسة مع أنشطة الجدول الزمني وترتيب العمليات والسرد المتسلسل في تعزيز هذه القدرة.');
      return rtl('يواجه الطالب صعوبة في مهام التسلسل المنطقي ويجد صعوبة في ترتيب المعلومات بشكل ذي معنى. قد يؤثر ذلك على قدرته على فهم السبب والنتيجة واتباع التوجيهات المتعددة الخطوات وتنظيم أفكاره للكتابة. يُنصح باستخدام الجداول الزمنية البصرية والأدلة خطوة بخطوة وأنشطة بطاقات التسلسل لبناء هذه المهارة.');
    case 'missing-object-quiz':
      if (pct >= 75) return rtl('يُظهر الطالب مهارات قوية في الإدراك البصري والملاحظة. يمكنه تحديد العناصر المفقودة في المشاهد البصرية بسرعة، مما يدعم الاهتمام بالتفاصيل والتحليل البصري والوعي المكاني في الفصل الدراسي.');
      if (pct >= 60) return rtl('يُظهر الطالب مهارات متطورة في الإدراك البصري. يمكنه تحديد بعض الأشياء المفقودة لكنه قد يفوت أخرى. يمكن أن تساعد الممارسة مع الألغاز البصرية وألعاب اكتشاف الاختلافات وأنشطة الملاحظة في تعزيز هذه القدرة.');
      return rtl('يواجه الطالب صعوبة في تحديد الأشياء المفقودة في المشاهد البصرية، مما يشير إلى تحديات في الإدراك البصري والملاحظة. قد يؤثر ذلك على قدرته على ملاحظة التفاصيل المهمة في المواد البصرية والأنشطة الصفية. يُنصح باستخدام تمارين المسح البصري وألعاب البحث عن الأشياء وأنشطة الملاحظة الموجهة لتطوير هذه المهارات.');
    default:
      return '';
  }
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
  const mindResults = (progress.mindSectionResults ?? []).filter(
    r => !LEARNING_QUIZZES.some(q => q.id === r.quizId),
  );
  const oralResults = progress.oralSectionResults ?? [];
  const academicResults = progress.academicSectionResults ?? [];
  const learningResults = [
    ...(progress.learningSectionResults ?? []),
    ...(progress.mindSectionResults ?? []).filter(r => LEARNING_QUIZZES.some(q => q.id === r.quizId)),
  ];
  const allResults = [...mindResults, ...oralResults, ...academicResults, ...learningResults];

  const totalQuizzes =
    MIND_QUIZZES.length +
    ORAL_QUIZZES.length +
    ACADEMIC_QUIZZES.length +
    LEARNING_QUIZZES.length;
  const completedCount = allResults.length;
  const avgScore =
    allResults.length > 0
      ? Math.round(allResults.reduce((sum, r) => sum + r.percentage, 0) / allResults.length)
      : 0;
  const isComplete = completedCount >= totalQuizzes;

  const categories = [
    'attention', 'memory', 'learning-style', 'social-emotional', 'critical-thinking', 'perception',
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

        {/* Learning quizzes */}
        <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#e11d48', marginBottom: 6, marginTop: 4 }}>Learning & SEL Section ({learningResults.length}/{LEARNING_QUIZZES.length} completed)</Text>
        <View style={{ ...s.checklistSection, backgroundColor: '#fff1f2' }}>
          {LEARNING_QUIZZES.map((q) => {
            const done = allResults.some((r) => r.quizId === q.id);
            const result = allResults.find((r) => r.quizId === q.id);
            const label = done && result ? getQuizResultLabel(result) : null;
            return (
              <View key={q.id} style={s.checkItem}>
                <Text style={s.checkIcon}>{done ? '✓' : '○'}</Text>
                <Text style={done ? s.checkTextDone : s.checkTextPending}>
                  {q.name} ({subName[q.subcategory] || q.subcategory})
                  {label ? ` — ${label.value}` : done ? '' : ' — not yet completed'}
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

      {/* ── For Teachers: Cognition Assessment Details ── */}
      {mindResults.length > 0 && (
        <View style={s.section} wrap>
          <Text style={s.teacherTitle}>FOR TEACHERS: COGNITION ASSESSMENT DETAILS</Text>
          <Text style={{ fontSize: 9, color: '#78350f', marginBottom: 10, lineHeight: 1.4 }}>
            This section provides detailed, quiz-by-quiz analysis of the student's performance on all Mind (cognition) assessments. Each paragraph describes what the quiz measures and what the student's score indicates for classroom instruction.
          </Text>
          {MIND_QUIZZES.map((q) => {
            const result = mindResults.find((r) => r.quizId === q.id);
            if (!result) return null;
            const paragraph = getTeacherParagraph(result);
            if (!paragraph) return null;
            return (
              <View key={q.id} wrap={false} style={{ marginBottom: 8 }}>
                <Text style={s.teacherQuizTitle}>{q.name} ({subName[q.subcategory] || q.subcategory}{result.quizId === 'learning-styles' || result.quizId === 'attention-assessment' ? ` — ${result.additionalData?.attentionLevel || result.additionalData?.dominantStyle || ''}` : ` — ${result.percentage}%`})</Text>
                <Text style={s.teacherParagraph}>{paragraph}</Text>
              </View>
            );
          })}
        </View>
      )}

      {/* Footer */}
      <View style={s.footer} fixed>
        <Text>This assessment provides insights into your child's cognitive and oral abilities. Results should be considered alongside classroom performance, motivation, and individual learning style.</Text>
        <Text style={{ marginTop: 4 }}>Report generated by Holistic Assessment Tool • {new Date().toLocaleDateString()}</Text>
      </View>
    </Page>
  );

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

      {/* ── For Teachers: Cognition Assessment Details (Arabic) ── */}
      {mindResults.length > 0 && (
        <View style={s.section} wrap>
          <Text style={{ ...s.teacherTitle, textAlign: 'right' }}>{rtl('للمعلمين: تفاصيل تقييم الإدراك')}</Text>
          <Text style={{ fontSize: 9, color: '#78350f', marginBottom: 10, lineHeight: 1.6, textAlign: 'right' }}>
            {rtl('يوفر هذا القسم تحليلاً تفصيلياً لأداء الطالب في جميع تقييمات العقل (الإدراك). تصف كل فقرة ما يقيسه الاختبار وما تشير إليه درجة الطالب للتعليم في الفصل الدراسي.')}
          </Text>
          {MIND_QUIZZES.map((q) => {
            const result = mindResults.find((r) => r.quizId === q.id);
            if (!result) return null;
            const paragraph = getTeacherParagraphAr(result);
            if (!paragraph) return null;
            return (
              <View key={q.id} wrap={false} style={{ marginBottom: 8 }}>
                <Text style={{ ...s.teacherQuizTitle, textAlign: 'right' }}>{q.name} ({rtl(getSubcategoryNameBilingual(q.subcategory, 'ar'))}{result.quizId === 'learning-styles' || result.quizId === 'attention-assessment' ? '' : ` — ${result.percentage}%`})</Text>
                <Text style={{ ...s.teacherParagraph, textAlign: 'right' }}>{paragraph}</Text>
              </View>
            );
          })}
        </View>
      )}

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
  const mindResults = (progress.mindSectionResults ?? []).filter(
    r => !LEARNING_QUIZZES.some(q => q.id === r.quizId),
  );
  const oralResults = progress.oralSectionResults ?? [];
  const academicResults = progress.academicSectionResults ?? [];
  const learningResults = [
    ...(progress.learningSectionResults ?? []),
    ...(progress.mindSectionResults ?? []).filter(r => LEARNING_QUIZZES.some(q => q.id === r.quizId)),
  ];
  const allResults = [...mindResults, ...oralResults, ...academicResults, ...learningResults];
  const totalQuizzes =
    MIND_QUIZZES.length + ORAL_QUIZZES.length + ACADEMIC_QUIZZES.length + LEARNING_QUIZZES.length;
  const completedCount = allResults.length;
  const avgScore = allResults.length > 0
    ? Math.round(allResults.reduce((sum, r) => sum + r.percentage, 0) / allResults.length) : 0;
  const isComplete = completedCount >= totalQuizzes;
  const categories = ['attention','memory','learning-style','critical-thinking','perception','oral-language','phonics','spelling','writing','vocabulary'];
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
        {/* ── For Teachers: Cognition Assessment Details ── */}
        {mindResults.length > 0 && (
          <View style={s.section} wrap>
            <Text style={s.teacherTitle}>FOR TEACHERS: COGNITION ASSESSMENT DETAILS</Text>
            <Text style={{ fontSize: 9, color: '#78350f', marginBottom: 10, lineHeight: 1.4 }}>
              This section provides detailed, quiz-by-quiz analysis of the student's performance on all Mind (cognition) assessments. Each paragraph describes what the quiz measures and what the student's score indicates for classroom instruction.
            </Text>
            {MIND_QUIZZES.map((q) => {
              const result = mindResults.find((r) => r.quizId === q.id);
              if (!result) return null;
              const paragraph = getTeacherParagraph(result);
              if (!paragraph) return null;
              return (
                <View key={q.id} wrap={false} style={{ marginBottom: 8 }}>
                  <Text style={s.teacherQuizTitle}>{q.name} ({subName[q.subcategory] || q.subcategory}{result.quizId === 'learning-styles' || result.quizId === 'attention-assessment' ? ` — ${result.additionalData?.attentionLevel || result.additionalData?.dominantStyle || ''}` : ` — ${result.percentage}%`})</Text>
                  <Text style={s.teacherParagraph}>{paragraph}</Text>
                </View>
              );
            })}
          </View>
        )}
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
  const mindResults = (progress.mindSectionResults ?? []).filter(
    r => !LEARNING_QUIZZES.some(q => q.id === r.quizId),
  );
  const oralResults = progress.oralSectionResults ?? [];
  const academicResults = progress.academicSectionResults ?? [];
  const learningResults = [
    ...(progress.learningSectionResults ?? []),
    ...(progress.mindSectionResults ?? []).filter(r => LEARNING_QUIZZES.some(q => q.id === r.quizId)),
  ];
  const allResults = [...mindResults, ...oralResults, ...academicResults, ...learningResults];
  const totalQuizzes =
    MIND_QUIZZES.length + ORAL_QUIZZES.length + ACADEMIC_QUIZZES.length + LEARNING_QUIZZES.length;
  const completedCount = allResults.length;
  const avgScore = allResults.length > 0
    ? Math.round(allResults.reduce((sum, r) => sum + r.percentage, 0) / allResults.length) : 0;
  const isComplete = completedCount >= totalQuizzes;
  const categories = ['attention','memory','learning-style','critical-thinking','perception','oral-language','phonics','spelling','writing','vocabulary'];
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
        {/* ── For Teachers: Cognition Assessment Details (Arabic) ── */}
        {mindResults.length > 0 && (
          <View style={s.section} wrap>
            <Text style={{ ...s.teacherTitle, textAlign: 'right' }}>{rtl('للمعلمين: تفاصيل تقييم الإدراك')}</Text>
            <Text style={{ fontSize: 9, color: '#78350f', marginBottom: 10, lineHeight: 1.6, textAlign: 'right' }}>
              {rtl('يوفر هذا القسم تحليلاً تفصيلياً لأداء الطالب في جميع تقييمات العقل (الإدراك). تصف كل فقرة ما يقيسه الاختبار وما تشير إليه درجة الطالب للتعليم في الفصل الدراسي.')}
            </Text>
            {MIND_QUIZZES.map((q) => {
              const result = mindResults.find((r) => r.quizId === q.id);
              if (!result) return null;
              const paragraph = getTeacherParagraphAr(result);
              if (!paragraph) return null;
              return (
                <View key={q.id} wrap={false} style={{ marginBottom: 8 }}>
                  <Text style={{ ...s.teacherQuizTitle, textAlign: 'right' }}>{q.name} ({rtl(getSubcategoryNameBilingual(q.subcategory, 'ar'))}{result.quizId === 'learning-styles' || result.quizId === 'attention-assessment' ? '' : ` — ${result.percentage}%`})</Text>
                  <Text style={{ ...s.teacherParagraph, textAlign: 'right' }}>{paragraph}</Text>
                </View>
              );
            })}
          </View>
        )}
        <View style={s.footer} fixed>
          <Text style={{ textAlign: 'right' }}>{rtl('يوفر هذا التقييم رؤى حول قدرات طفلك الإدراكية واللغوية. يجب مراعاة النتائج جنباً إلى جنب مع الأداء في الفصل الدراسي.')}</Text>
          <Text style={{ marginTop: 4, textAlign: 'right' }}>{rtl('تقرير صادر من أداة التقييم الشامل')} • {new Date().toLocaleDateString('ar-SA')}</Text>
        </View>
      </Page>
    </Document>
  );
};

export default ReportPDF;