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

// ── Mind quiz IDs in display order ──
const MIND_QUIZ_IDS = [
  'attention-assessment', 'picture-sequence', 'flash-word-quiz',
  'learning-styles', 'analogy-quiz', 'category-quiz',
  'sentence-difference-quiz', 'logical-sequencing-quiz', 'missing-object-quiz',
];

const mindQuizDisplayName: Record<string, string> = {
  'attention-assessment': 'Attention Questionnaire',
  'picture-sequence': 'Picture Sequence',
  'flash-word-quiz': 'Flash Word Quiz',
  'learning-styles': 'Learning Style Quiz',
  'analogy-quiz': 'Analogy Quiz',
  'category-quiz': 'Category Quiz',
  'sentence-difference-quiz': 'Find Sentence Differences',
  'logical-sequencing-quiz': 'Logical Sequencing',
  'missing-object-quiz': 'Missing Object',
};

function buildAttentionParagraphEnBackend(result: QuizResult): string {
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
    parts.push(`Both focusing${focusPct != null ? ` (${focusPct}%)` : ''} and shifting${shiftPct != null ? ` (${shiftPct}%)` : ''} abilities are strong. The student can sustain concentration on activities and transition smoothly between tasks. This is a positive indicator for classroom learning, as it supports engagement in lessons and the ability to follow complex, multi-step instructions.`);
  } else if (isStrongFocus && isWeakShift) {
    parts.push(`While the student's focusing ability is strong${focusPct != null ? ` (${focusPct}%)` : ''}, they have difficulty with shifting attention${shiftPct != null ? ` (${shiftPct}%)` : ''}. This means the student can concentrate well on a single task but may struggle when asked to switch between activities or transition to a new topic. Consider providing clear transition warnings (e.g., "in 2 minutes we will switch to math"), using visual schedules, and allowing extra time during transitions between activities.`);
  } else if (isWeakFocus && isStrongShift) {
    parts.push(`The student shows difficulty with sustained focusing${focusPct != null ? ` (${focusPct}%)` : ''} but has good shifting ability${shiftPct != null ? ` (${shiftPct}%)` : ''}. They can switch between tasks effectively but may struggle to maintain concentration on a single activity for extended periods. Consider breaking tasks into shorter segments, using timers to create structured focus intervals, and providing frequent check-ins to help the student stay engaged.`);
  } else if (isWeakFocus && isWeakShift) {
    parts.push(`Both focusing${focusPct != null ? ` (${focusPct}%)` : ''} and shifting${shiftPct != null ? ` (${shiftPct}%)` : ''} abilities need support. The student may have difficulty maintaining concentration on tasks and also struggle when transitioning between activities. Consider seating the student away from distractions, using visual cues and timers, breaking tasks into small steps, providing transition warnings, and checking in frequently to help the student stay on track.`);
  } else {
    parts.push(`Focusing was rated as "${focusingLevel}"${focusPct != null ? ` (${focusPct}%)` : ''} and shifting was rated as "${shiftingLevel}"${shiftPct != null ? ` (${shiftPct}%)` : ''}. The student may benefit from structured activities with clear instructions, periodic check-ins, and visual schedules to support both sustained attention and smooth transitions between tasks.`);
  }

  return parts.join(' ');
}

function getTeacherParagraphEn(result: QuizResult): string {
  const pct = result.percentage;
  const ad = parseAdditionalData(result.additional_data);
  switch (result.quiz_id) {
    case 'attention-assessment':
      return buildAttentionParagraphEnBackend(result);
    case 'picture-sequence':
      if (pct >= 75) return 'The student demonstrates strong visual memory and sequencing skills. They can effectively recall and arrange visual information in the correct order, which is important for understanding stories, following procedures, and organizing thoughts logically.';
      if (pct >= 60) return 'The student shows developing visual memory and sequencing abilities. They can sometimes recall and order visual information but may need additional support. Practice with picture stories and step-by-step visual activities can help strengthen these skills.';
      return 'The student has difficulty with visual memory and sequencing tasks. They struggle to remember and arrange images in the correct order. This may affect their ability to follow story sequences or multi-step procedures. Consider using visual aids, graphic organizers, and repeated practice with sequencing activities to build this skill.';
    case 'flash-word-quiz':
      if (pct >= 75) return 'The student has strong rapid word recognition skills. They can quickly identify and remember words that are briefly displayed, indicating good visual processing speed and word memory. This is a positive sign for reading fluency development.';
      if (pct >= 60) return 'The student shows moderate rapid word recognition abilities. They can recognize some flashed words but may need more time or repetition. Continued practice with sight words and flash card activities can help improve speed and accuracy.';
      return 'The student has difficulty remembering words that were briefly flashed and needs additional work in this area. This suggests challenges with rapid visual word processing and sight word memory, which can affect reading fluency. Consider using repeated exposure to high-frequency words, flash card drills at a gradually increasing pace, and multisensory word recognition activities.';
    case 'learning-styles': {
      const style = ad?.dominantStyle;
      if (style === 'visual') return 'The student has been identified as a visual learner. They learn best through seeing information presented in diagrams, charts, pictures, and written text. To support this student, use visual aids such as graphic organizers, color-coded notes, videos, and demonstrations. Allow them to draw or map out concepts when possible.';
      if (style === 'auditory') return 'The student has been identified as an auditory learner. They learn best through listening, discussions, and verbal explanations. To support this student, incorporate group discussions, oral instructions, read-alouds, and audio resources. Allow them to talk through problems and explain their thinking verbally.';
      if (style === 'kinesthetic') return 'The student has been identified as a kinesthetic learner. They learn best through hands-on activities, movement, and physical engagement. To support this student, incorporate manipulatives, role-playing, experiments, and movement breaks into lessons. Allow them to build models or act out concepts when possible.';
      if (style === 'reading-writing') return 'The student has been identified as a reading/writing learner. They learn best through reading text and writing notes. To support this student, provide written instructions, encourage note-taking, and use reading-based assignments. Allow them to express understanding through written responses and journaling.';
      return 'The learning style assessment has been completed. Understanding the student\'s preferred learning style can help tailor instruction to their strengths.';
    }
    case 'analogy-quiz':
      if (pct >= 75) return 'The student demonstrates strong analogical reasoning skills. They can identify relationships between concepts and apply that understanding to new situations. This is an important foundation for critical thinking, problem-solving, and understanding complex academic content.';
      if (pct >= 60) return 'The student shows developing analogical reasoning abilities. They can sometimes identify relationships between concepts but may struggle with more complex analogies. Practice with word relationship games and guided analogy exercises can help strengthen this skill.';
      return 'The student has difficulty with analogical reasoning and struggles to identify relationships between concepts. This may affect their ability to make connections across subjects and solve problems that require relational thinking. Consider using concrete examples, visual analogy cards, and guided practice to help the student recognize patterns and relationships.';
    case 'category-quiz':
      if (pct >= 75) return 'The student demonstrates strong categorization and classification skills. They can effectively group items based on shared characteristics, which supports organizational thinking, vocabulary development, and the ability to identify patterns in information.';
      if (pct >= 60) return 'The student shows developing categorization skills. They can group some items correctly but may have difficulty with less obvious groupings. Sorting activities, classification games, and discussions about how things are alike and different can help improve this skill.';
      return 'The student struggles with categorization and classification tasks. They have difficulty grouping items by shared characteristics, which may impact their ability to organize information and see patterns. Consider using hands-on sorting activities, visual grouping exercises, and explicit instruction on identifying common features among items.';
    case 'sentence-difference-quiz':
      if (pct >= 75) return 'The student shows strong attention to detail and comparison skills. They can effectively identify differences between sentences, which is important for reading comprehension, editing, and careful analysis of written information.';
      if (pct >= 60) return 'The student shows developing skills in identifying differences between sentences. They can spot some changes but may miss subtle differences. Practice with spot-the-difference exercises and careful reading activities can help sharpen this skill.';
      return 'The student has difficulty finding differences between sentences, suggesting challenges with attention to detail and careful comparison of written information. This may affect proofreading and reading comprehension. Consider using side-by-side comparison exercises, highlighting activities, and guided practice in identifying small changes in text.';
    case 'logical-sequencing-quiz':
      if (pct >= 75) return 'The student demonstrates strong logical sequencing abilities. They can arrange information in a logical order, which is essential for understanding cause and effect, following procedures, and constructing well-organized written and verbal responses.';
      if (pct >= 60) return 'The student shows developing logical sequencing skills. They can sometimes order events or steps correctly but may struggle with more complex sequences. Practice with timeline activities, process ordering, and sequential storytelling can help strengthen this ability.';
      return 'The student has difficulty with logical sequencing tasks and struggles to arrange information in a meaningful order. This may affect their ability to understand cause and effect, follow multi-step directions, and organize their thoughts for writing. Consider using visual timelines, step-by-step guides, and sequencing card activities to build this skill.';
    case 'missing-object-quiz':
      if (pct >= 75) return 'The student demonstrates strong visual perception and observation skills. They can quickly identify missing elements in visual scenes, which supports attention to detail, visual analysis, and spatial awareness in the classroom.';
      if (pct >= 60) return 'The student shows developing visual perception skills. They can identify some missing objects but may miss others. Practice with visual puzzles, spot-the-difference games, and observation activities can help strengthen this ability.';
      return 'The student has difficulty identifying missing objects in visual scenes, suggesting challenges with visual perception and observation. This may affect their ability to notice important details in visual materials and classroom activities. Consider using visual scanning exercises, I-spy games, and guided observation activities to develop these skills.';
    default: return '';
  }
}

function buildAttentionParagraphArBackend(result: QuizResult): string {
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
  parts.push(reshapeArabic(`قيّم اختبار التحكم في الانتباه الطالب عبر مقياسين فرعيين: التركيز (الحفاظ على الانتباه لمهمة واحدة) والتحويل (الانتقال بين المهام). تم تقييم مستوى الانتباه العام للطالب بـ "${overallLevel}".`));

  if (isStrongFocus && isStrongShift) {
    parts.push(reshapeArabic(`كلتا قدرتي التركيز${focusPct != null ? ` (${focusPct}%)` : ''} والتحويل${shiftPct != null ? ` (${shiftPct}%)` : ''} قوية. يستطيع الطالب الحفاظ على التركيز في الأنشطة والانتقال بسلاسة بين المهام. هذا مؤشر إيجابي للتعلم في الفصل الدراسي، حيث يدعم المشاركة في الدروس والقدرة على اتباع التعليمات المعقدة المتعددة الخطوات.`));
  } else if (isStrongFocus && isWeakShift) {
    parts.push(reshapeArabic(`بينما قدرة الطالب على التركيز قوية${focusPct != null ? ` (${focusPct}%)` : ''}، إلا أنه يواجه صعوبة في تحويل الانتباه${shiftPct != null ? ` (${shiftPct}%)` : ''}. هذا يعني أن الطالب يستطيع التركيز جيداً على مهمة واحدة لكنه قد يجد صعوبة عند المطالبة بالانتقال بين الأنشطة أو التحول إلى موضوع جديد. يُنصح بتقديم تنبيهات واضحة قبل الانتقال واستخدام الجداول المرئية والسماح بوقت إضافي أثناء التحولات بين الأنشطة.`));
  } else if (isWeakFocus && isStrongShift) {
    parts.push(reshapeArabic(`يُظهر الطالب صعوبة في التركيز المستمر${focusPct != null ? ` (${focusPct}%)` : ''} لكن لديه قدرة جيدة على التحويل${shiftPct != null ? ` (${shiftPct}%)` : ''}. يمكنه الانتقال بين المهام بفعالية لكنه قد يجد صعوبة في الحفاظ على التركيز على نشاط واحد لفترات طويلة. يُنصح بتقسيم المهام إلى أجزاء أقصر واستخدام المؤقتات لإنشاء فترات تركيز منظمة وتوفير متابعة متكررة لمساعدة الطالب على البقاء منخرطاً.`));
  } else if (isWeakFocus && isWeakShift) {
    parts.push(reshapeArabic(`كلتا قدرتي التركيز${focusPct != null ? ` (${focusPct}%)` : ''} والتحويل${shiftPct != null ? ` (${shiftPct}%)` : ''} تحتاجان إلى دعم. قد يواجه الطالب صعوبة في الحفاظ على التركيز على المهام وأيضاً يجد صعوبة عند الانتقال بين الأنشطة. يُنصح بإجلاس الطالب بعيداً عن المشتتات واستخدام الإشارات البصرية والمؤقتات وتقسيم المهام إلى خطوات صغيرة وتقديم تنبيهات الانتقال والتحقق بشكل متكرر لمساعدة الطالب على البقاء في المسار الصحيح.`));
  } else {
    parts.push(reshapeArabic(`تم تقييم التركيز بـ "${focusingLevel}"${focusPct != null ? ` (${focusPct}%)` : ''} والتحويل بـ "${shiftingLevel}"${shiftPct != null ? ` (${shiftPct}%)` : ''}. قد يستفيد الطالب من أنشطة منظمة مع تعليمات واضحة ومتابعة دورية وجداول مرئية لدعم كل من الانتباه المستمر والانتقالات السلسة بين المهام.`));
  }

  return parts.join(' ');
}

function getTeacherParagraphAr(result: QuizResult): string {
  const pct = result.percentage;
  const ad = parseAdditionalData(result.additional_data);
  switch (result.quiz_id) {
    case 'attention-assessment':
      return buildAttentionParagraphArBackend(result);
    case 'picture-sequence':
      if (pct >= 75) return reshapeArabic('يُظهر الطالب مهارات قوية في الذاكرة البصرية والتسلسل. يمكنه استرجاع وترتيب المعلومات البصرية بالترتيب الصحيح بفعالية، وهو أمر مهم لفهم القصص واتباع الإجراءات وتنظيم الأفكار بشكل منطقي.');
      if (pct >= 60) return reshapeArabic('يُظهر الطالب قدرات متطورة في الذاكرة البصرية والتسلسل. يمكنه أحياناً استرجاع وترتيب المعلومات البصرية لكنه قد يحتاج إلى دعم إضافي. يمكن أن تساعد الممارسة مع القصص المصورة والأنشطة البصرية المتسلسلة في تعزيز هذه المهارات.');
      return reshapeArabic('يواجه الطالب صعوبة في مهام الذاكرة البصرية والتسلسل. يجد صعوبة في تذكر وترتيب الصور بالترتيب الصحيح. قد يؤثر ذلك على قدرته على متابعة تسلسل القصص أو الإجراءات المتعددة الخطوات. يُنصح باستخدام الوسائل البصرية والمنظمات الرسومية والممارسة المتكررة مع أنشطة التسلسل لبناء هذه المهارة.');
    case 'flash-word-quiz':
      if (pct >= 75) return reshapeArabic('يتمتع الطالب بمهارات قوية في التعرف السريع على الكلمات. يمكنه تحديد وتذكر الكلمات التي تُعرض بسرعة، مما يشير إلى سرعة معالجة بصرية جيدة وذاكرة كلمات قوية. هذا مؤشر إيجابي لتطوير الطلاقة في القراءة.');
      if (pct >= 60) return reshapeArabic('يُظهر الطالب قدرات متوسطة في التعرف السريع على الكلمات. يمكنه التعرف على بعض الكلمات المعروضة لكنه قد يحتاج إلى مزيد من الوقت أو التكرار. يمكن أن تساعد الممارسة المستمرة مع الكلمات الشائعة وأنشطة البطاقات التعليمية في تحسين السرعة والدقة.');
      return reshapeArabic('يواجه الطالب صعوبة في تذكر الكلمات التي تُعرض بسرعة ويحتاج إلى عمل إضافي في هذا المجال. يشير ذلك إلى تحديات في المعالجة البصرية السريعة للكلمات وذاكرة الكلمات البصرية، مما قد يؤثر على طلاقة القراءة. يُنصح بالتعرض المتكرر للكلمات عالية التردد وتمارين البطاقات التعليمية بوتيرة متزايدة تدريجياً وأنشطة التعرف على الكلمات متعددة الحواس.');
    case 'learning-styles': {
      const style = ad?.dominantStyle;
      if (style === 'visual') return reshapeArabic('تم تحديد الطالب كمتعلم بصري. يتعلم بشكل أفضل من خلال رؤية المعلومات المقدمة في الرسوم البيانية والمخططات والصور والنصوص المكتوبة. لدعم هذا الطالب، استخدم الوسائل البصرية مثل المنظمات الرسومية والملاحظات الملونة ومقاطع الفيديو والعروض التوضيحية. اسمح له بالرسم أو رسم الخرائط المفاهيمية عندما يكون ذلك ممكناً.');
      if (style === 'auditory') return reshapeArabic('تم تحديد الطالب كمتعلم سمعي. يتعلم بشكل أفضل من خلال الاستماع والمناقشات والشروحات اللفظية. لدعم هذا الطالب، أدخل المناقشات الجماعية والتعليمات الشفهية والقراءة بصوت عالٍ والموارد الصوتية. اسمح له بالتحدث عن المشكلات وشرح تفكيره شفهياً.');
      if (style === 'kinesthetic') return reshapeArabic('تم تحديد الطالب كمتعلم حركي. يتعلم بشكل أفضل من خلال الأنشطة العملية والحركة والمشاركة البدنية. لدعم هذا الطالب، أدخل الأدوات التعليمية الملموسة ولعب الأدوار والتجارب وفترات الراحة الحركية في الدروس. اسمح له ببناء النماذج أو تمثيل المفاهيم عندما يكون ذلك ممكناً.');
      if (style === 'reading-writing') return reshapeArabic('تم تحديد الطالب كمتعلم قرائي/كتابي. يتعلم بشكل أفضل من خلال قراءة النصوص وكتابة الملاحظات. لدعم هذا الطالب، قدم تعليمات مكتوبة وشجع على تدوين الملاحظات واستخدم المهام المبنية على القراءة. اسمح له بالتعبير عن فهمه من خلال الاستجابات المكتوبة والتدوين.');
      return reshapeArabic('تم إكمال تقييم أسلوب التعلم للطالب. يمكن أن يساعد فهم أسلوب التعلم المفضل للطالب في تخصيص التعليم بما يتناسب مع نقاط قوته.');
    }
    case 'analogy-quiz':
      if (pct >= 75) return reshapeArabic('يُظهر الطالب مهارات قوية في التفكير القياسي. يمكنه تحديد العلاقات بين المفاهيم وتطبيق هذا الفهم على مواقف جديدة. هذا أساس مهم للتفكير النقدي وحل المشكلات وفهم المحتوى الأكاديمي المعقد.');
      if (pct >= 60) return reshapeArabic('يُظهر الطالب قدرات متطورة في التفكير القياسي. يمكنه أحياناً تحديد العلاقات بين المفاهيم لكنه قد يواجه صعوبة مع القياسات الأكثر تعقيداً. يمكن أن تساعد الممارسة مع ألعاب علاقات الكلمات وتمارين القياس الموجهة في تعزيز هذه المهارة.');
      return reshapeArabic('يواجه الطالب صعوبة في التفكير القياسي ويجد صعوبة في تحديد العلاقات بين المفاهيم. قد يؤثر ذلك على قدرته على إجراء الروابط بين المواد الدراسية وحل المشكلات التي تتطلب التفكير العلائقي. يُنصح باستخدام أمثلة ملموسة وبطاقات القياس البصرية والممارسة الموجهة لمساعدة الطالب على التعرف على الأنماط والعلاقات.');
    case 'category-quiz':
      if (pct >= 75) return reshapeArabic('يُظهر الطالب مهارات قوية في التصنيف والتبويب. يمكنه تجميع العناصر بفعالية بناءً على الخصائص المشتركة، مما يدعم التفكير التنظيمي وتطوير المفردات والقدرة على تحديد الأنماط في المعلومات.');
      if (pct >= 60) return reshapeArabic('يُظهر الطالب مهارات متطورة في التصنيف. يمكنه تجميع بعض العناصر بشكل صحيح لكنه قد يواجه صعوبة مع التجميعات الأقل وضوحاً. يمكن أن تساعد أنشطة الفرز وألعاب التصنيف والمناقشات حول أوجه التشابه والاختلاف في تحسين هذه المهارة.');
      return reshapeArabic('يواجه الطالب صعوبة في مهام التصنيف والتبويب. يجد صعوبة في تجميع العناصر حسب الخصائص المشتركة، مما قد يؤثر على قدرته على تنظيم المعلومات ورؤية الأنماط. يُنصح باستخدام أنشطة الفرز العملية وتمارين التجميع البصري والتعليم المباشر لتحديد السمات المشتركة بين العناصر.');
    case 'sentence-difference-quiz':
      if (pct >= 75) return reshapeArabic('يُظهر الطالب اهتماماً قوياً بالتفاصيل ومهارات المقارنة. يمكنه تحديد الاختلافات بين الجمل بفعالية، وهو أمر مهم للفهم القرائي والتحرير والتحليل الدقيق للمعلومات المكتوبة.');
      if (pct >= 60) return reshapeArabic('يُظهر الطالب مهارات متطورة في تحديد الاختلافات بين الجمل. يمكنه اكتشاف بعض التغييرات لكنه قد يفوت الاختلافات الدقيقة. يمكن أن تساعد الممارسة مع تمارين اكتشاف الاختلافات وأنشطة القراءة المتأنية في صقل هذه المهارة.');
      return reshapeArabic('يواجه الطالب صعوبة في إيجاد الاختلافات بين الجمل، مما يشير إلى تحديات في الاهتمام بالتفاصيل والمقارنة الدقيقة للمعلومات المكتوبة. قد يؤثر ذلك على التدقيق اللغوي والفهم القرائي. يُنصح باستخدام تمارين المقارنة جنباً إلى جنب وأنشطة التظليل والممارسة الموجهة في تحديد التغييرات الصغيرة في النص.');
    case 'logical-sequencing-quiz':
      if (pct >= 75) return reshapeArabic('يُظهر الطالب قدرات قوية في التسلسل المنطقي. يمكنه ترتيب المعلومات بترتيب منطقي، وهو أمر أساسي لفهم السبب والنتيجة واتباع الإجراءات وبناء استجابات مكتوبة وشفهية منظمة.');
      if (pct >= 60) return reshapeArabic('يُظهر الطالب مهارات متطورة في التسلسل المنطقي. يمكنه أحياناً ترتيب الأحداث أو الخطوات بشكل صحيح لكنه قد يواجه صعوبة مع التسلسلات الأكثر تعقيداً. يمكن أن تساعد الممارسة مع أنشطة الجدول الزمني وترتيب العمليات والسرد المتسلسل في تعزيز هذه القدرة.');
      return reshapeArabic('يواجه الطالب صعوبة في مهام التسلسل المنطقي ويجد صعوبة في ترتيب المعلومات بشكل ذي معنى. قد يؤثر ذلك على قدرته على فهم السبب والنتيجة واتباع التوجيهات المتعددة الخطوات وتنظيم أفكاره للكتابة. يُنصح باستخدام الجداول الزمنية البصرية والأدلة خطوة بخطوة وأنشطة بطاقات التسلسل لبناء هذه المهارة.');
    case 'missing-object-quiz':
      if (pct >= 75) return reshapeArabic('يُظهر الطالب مهارات قوية في الإدراك البصري والملاحظة. يمكنه تحديد العناصر المفقودة في المشاهد البصرية بسرعة، مما يدعم الاهتمام بالتفاصيل والتحليل البصري والوعي المكاني في الفصل الدراسي.');
      if (pct >= 60) return reshapeArabic('يُظهر الطالب مهارات متطورة في الإدراك البصري. يمكنه تحديد بعض الأشياء المفقودة لكنه قد يفوت أخرى. يمكن أن تساعد الممارسة مع الألغاز البصرية وألعاب اكتشاف الاختلافات وأنشطة الملاحظة في تعزيز هذه القدرة.');
      return reshapeArabic('يواجه الطالب صعوبة في تحديد الأشياء المفقودة في المشاهد البصرية، مما يشير إلى تحديات في الإدراك البصري والملاحظة. قد يؤثر ذلك على قدرته على ملاحظة التفاصيل المهمة في المواد البصرية والأنشطة الصفية. يُنصح باستخدام تمارين المسح البصري وألعاب البحث عن الأشياء وأنشطة الملاحظة الموجهة لتطوير هذه المهارات.');
    default: return '';
  }
}

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

      // ── For Teachers: Cognition Assessment Details ──
      if (data.mindResults.length > 0) {
        doc.addPage(); doc.save(); doc.rect(0, 0, pageW, 4).fill(C.warning); doc.restore();
        y = 50;
        doc.font('Helvetica-Bold').fontSize(18).fillColor(C.warning).text('For Teachers: Cognition Assessment Details', L, y, { lineBreak: false });
        y += 8; doc.moveTo(L, y + 18).lineTo(L + 280, y + 18).lineWidth(2.5).strokeColor(C.warning).stroke(); y += 30;

        doc.font('Helvetica').fontSize(10).fillColor(C.gray700)
          .text('This section provides detailed, quiz-by-quiz analysis of the student\u2019s performance on all Mind (cognition) assessments. Each paragraph describes what the quiz measures and what the student\u2019s score indicates for classroom instruction.', L, y, { width: W });
        y += doc.heightOfString('This section provides detailed, quiz-by-quiz analysis...', { width: W }) + 20;

        for (const qId of MIND_QUIZ_IDS) {
          const result = data.mindResults.find(r => r.quiz_id === qId);
          if (!result) continue;
          const paragraph = getTeacherParagraphEn(result);
          if (!paragraph) continue;

          const nameLabel = mindQuizDisplayName[qId] || result.quiz_name;
          const subLabel = subNameEn[result.subcategory] || result.subcategory;
          let scoreLabel = '';
          if (qId === 'attention-assessment') {
            const adH = parseAdditionalData(result.additional_data);
            scoreLabel = adH?.attentionLevel ? ` — ${adH.attentionLevel}` : '';
          } else if (qId !== 'learning-styles') {
            scoreLabel = ` — ${result.percentage}%`;
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

      // ── For Teachers: Cognition Assessment Details (Arabic) ──
      if (data.mindResults.length > 0) {
        doc.addPage(); doc.save(); doc.rect(0, 0, pageW, 4).fill(C.warning); doc.restore();
        y = 50;
        doc.font('Arabic').fontSize(18).fillColor(C.warning).text(reshapeArabic('للمعلمين: تفاصيل تقييم الإدراك'), L, y, { width: W, align: 'right', lineBreak: false });
        y += 8; doc.moveTo(R, y + 18).lineTo(R - 280, y + 18).lineWidth(2.5).strokeColor(C.warning).stroke(); y += 30;

        const introAr = reshapeArabic('يوفر هذا القسم تحليلاً تفصيلياً لأداء الطالب في جميع تقييمات العقل (الإدراك). تصف كل فقرة ما يقيسه الاختبار وما تشير إليه درجة الطالب للتعليم في الفصل الدراسي.');
        doc.font('Arabic').fontSize(10).fillColor(C.gray700).text(introAr, L, y, { width: W, align: 'right' });
        y += doc.heightOfString(introAr, { width: W, align: 'right' }) + 20;

        for (const qId of MIND_QUIZ_IDS) {
          const result = data.mindResults.find(r => r.quiz_id === qId);
          if (!result) continue;
          const paragraph = getTeacherParagraphAr(result);
          if (!paragraph) continue;

          const nameLabel = mindQuizDisplayName[qId] || result.quiz_name;
          const subLabel = subNameAr[result.subcategory] || result.subcategory;
          let scoreLabel = '';
          if (qId === 'attention-assessment') {
            const adH = parseAdditionalData(result.additional_data);
            scoreLabel = adH?.attentionLevel ? ` — ${adH.attentionLevel}` : '';
          } else if (qId !== 'learning-styles') {
            scoreLabel = ` — ${result.percentage}%`;
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
        pageFooter(true);
      }

      doc.end();
    } catch (error) { reject(error); }
  });
}

/** Alias kept for backward compatibility (admin routes use this name). */
export const generateReportPDF = generateEnglishPDF;
