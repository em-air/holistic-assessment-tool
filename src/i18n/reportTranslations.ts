/**
 * Report translations — bilingual labels used in PDF reports.
 *
 * Both the client-side (@react-pdf/renderer → ReportPDF.tsx)
 * and server-side (PDFKit → backend pdfGenerator.ts) reference
 * identical keys so the Arabic section mirrors the English one.
 */

export const reportTranslations = {
  // ── Document-level ────────────────────────────────────────
  reportTitle: {
    en: 'Cognitive Skills Assessment Report',
    ar: 'تقرير تقييم المهارات الإدراكية',
  },
  partialTag: {
    en: '(Partial)',
    ar: '(جزئي)',
  },
  studentLabel: {
    en: 'Student',
    ar: 'الطالب',
  },
  generatedLabel: {
    en: 'Generated',
    ar: 'تاريخ الإصدار',
  },
  completeOverview: {
    en: 'Complete assessment overview',
    ar: 'نظرة عامة كاملة على التقييم',
  },
  progressOverview: {
    en: 'Progress assessment overview',
    ar: 'نظرة عامة على مستوى التقدم',
  },

  // ── Summary ───────────────────────────────────────────────
  assessmentSummary: {
    en: 'ASSESSMENT SUMMARY',
    ar: 'ملخص التقييم',
  },
  assessmentsCompleted: {
    en: 'Assessments Completed',
    ar: 'التقييمات المكتملة',
  },
  overallAverage: {
    en: 'Overall Average',
    ar: 'المعدل العام',
  },
  skillAreasTested: {
    en: 'Skills Areas Assessed',
    ar: 'المجالات التي تم تقييمها',
  },
  timeInvested: {
    en: 'Time Invested',
    ar: 'الوقت المستغرق',
  },

  // ── Parent note ───────────────────────────────────────────
  dearParent: {
    en: 'Dear Parent,',
    ar: 'عزيزي ولي الأمر،',
  },
  parentNoteComplete: {
    en: 'This comprehensive report provides an overview of your child\'s performance across key cognitive skill areas. Each section explains what skills were tested and how your child performed.',
    ar: 'يقدم هذا التقرير الشامل نظرة عامة على أداء طفلك في مجالات المهارات الإدراكية الرئيسية. يشرح كل قسم المهارات التي تم اختبارها وكيف كان أداء طفلك.',
  },
  parentNotePartial: {
    en: 'This partial report provides an overview of your child\'s performance across key cognitive skill areas. Your child has completed some assessments so far. Additional assessments can be taken for a more complete evaluation.',
    ar: 'يقدم هذا التقرير الجزئي نظرة عامة على أداء طفلك في مجالات المهارات الإدراكية الرئيسية. أكمل طفلك بعض التقييمات حتى الآن. يمكن إجراء تقييمات إضافية للحصول على تقييم أكثر شمولاً.',
  },

  // ── Skill analysis ────────────────────────────────────────
  detailedSkillAnalysis: {
    en: 'DETAILED SKILL ANALYSIS',
    ar: 'تحليل المهارات التفصيلي',
  },
  performanceLabel: {
    en: 'Performance',
    ar: 'الأداء',
  },

  // ── Performance levels ────────────────────────────────────
  excellent: { en: 'Excellent', ar: 'ممتاز' },
  good: { en: 'Good', ar: 'جيد' },
  developing: { en: 'Developing', ar: 'قيد التطوير' },
  needsSupport: { en: 'Needs Support', ar: 'يحتاج دعم' },

  // ── Subcategory names ─────────────────────────────────────
  'sub.attention': { en: 'Attention', ar: 'الانتباه' },
  'sub.memory': { en: 'Memory', ar: 'الذاكرة' },
  'sub.learning-style': { en: 'Learning Style', ar: 'أسلوب التعلم' },
  'sub.critical-thinking': { en: 'Critical Thinking', ar: 'التفكير النقدي' },
  'sub.perception': { en: 'Perception', ar: 'الإدراك' },
  'sub.oral-language': { en: 'Oral Language', ar: 'اللغة الشفهية' },
  'sub.reading': { en: 'Reading Skills', ar: 'مهارات القراءة' },
  'sub.phonics': { en: 'Beginning and Ending Sounds', ar: 'أصوات البداية والنهاية' },
  'sub.blending-segmenting': { en: 'Blending & Segmenting', ar: 'الدمج والتقسيم' },
  'sub.writing': { en: 'Writing Skills', ar: 'مهارات الكتابة' },
  'sub.vocabulary': { en: 'Vocabulary', ar: 'المفردات' },
  'sub.spelling': { en: 'Spelling', ar: 'الإملاء' },

  // ── Skill descriptions ────────────────────────────────────
  'desc.attention': {
    en: 'Attention skills involve the ability to focus on tasks and filter out distractions effectively.',
    ar: 'تشمل مهارات الانتباه القدرة على التركيز على المهام وتصفية المشتتات بشكل فعال.',
  },
  'desc.memory': {
    en: 'Memory skills encompass the ability to retain, recall, and work with information over different time periods.',
    ar: 'تشمل مهارات الذاكرة القدرة على الاحتفاظ بالمعلومات واسترجاعها والعمل بها عبر فترات زمنية مختلفة.',
  },
  'desc.learning-style': {
    en: 'Learning Styles refer to how your child best receives, processes, and retains information.',
    ar: 'تشير أساليب التعلم إلى الطريقة المثلى التي يستقبل بها طفلك المعلومات ويعالجها ويحتفظ بها.',
  },
  'desc.critical-thinking': {
    en: 'Critical Thinking encompasses reasoning, problem-solving, and analytical skills.',
    ar: 'يشمل التفكير النقدي مهارات الاستدلال وحل المشكلات والتحليل.',
  },
  'desc.perception': {
    en: 'Perception involves how your child interprets and understands visual and spatial information.',
    ar: 'يتعلق الإدراك بكيفية تفسير طفلك وفهمه للمعلومات البصرية والمكانية.',
  },

  // ── Remaining assessments ─────────────────────────────────
  remainingAssessments: {
    en: 'REMAINING ASSESSMENTS',
    ar: 'التقييمات المتبقية',
  },
  remainingNote: {
    en: 'To get a complete picture, consider completing these additional assessments:',
    ar: 'للحصول على صورة كاملة، يرجى التفكير في إكمال هذه التقييمات الإضافية:',
  },

  // ── Recommendations ───────────────────────────────────────
  recommendationsTitle: {
    en: 'RECOMMENDATIONS FOR PARENTS',
    ar: 'توصيات لأولياء الأمور',
  },
  strengthsTitle: {
    en: 'STRENGTHS TO CELEBRATE:',
    ar: 'نقاط القوة التي يجب الاحتفاء بها:',
  },
  strengthDefault: {
    en: 'Your child is developing skills across all assessed areas',
    ar: 'طفلك يطور مهاراته في جميع المجالات التي تم تقييمها',
  },
  excellentPerformance: {
    en: 'Excellent performance showing mastery',
    ar: 'أداء ممتاز يظهر إتقاناً',
  },
  generalRecommendationsTitle: {
    en: 'GENERAL RECOMMENDATIONS:',
    ar: 'توصيات عامة:',
  },
  'rec.practice': {
    en: 'Encourage regular practice in areas where scores were below 75%',
    ar: 'شجع على الممارسة المنتظمة في المجالات التي كانت الدرجات فيها أقل من 75٪',
  },
  'rec.celebrate': {
    en: 'Celebrate successes and maintain motivation for continued learning',
    ar: 'احتفل بالنجاحات وحافظ على الدافع لمواصلة التعلم',
  },
  'rec.games': {
    en: 'Consider educational games that target specific skill areas',
    ar: 'فكر في الألعاب التعليمية التي تستهدف مجالات مهارات محددة',
  },
  'rec.teacher': {
    en: 'Discuss results with your child\'s teacher for classroom support',
    ar: 'ناقش النتائج مع معلم طفلك للحصول على دعم في الفصل الدراسي',
  },

  // ── Footer ────────────────────────────────────────────────
  footerNote: {
    en: 'This assessment provides insights into your child\'s cognitive abilities at this point in time. Results should be considered alongside classroom performance, motivation, and individual learning style.',
    ar: 'يوفر هذا التقييم رؤى حول قدرات طفلك الإدراكية في هذه المرحلة. يجب مراعاة النتائج جنباً إلى جنب مع الأداء في الفصل الدراسي والدافعية وأسلوب التعلم الفردي.',
  },
  footerGenerated: {
    en: 'Report generated by Holistic Assessment Tool',
    ar: 'تقرير صادر من أداة التقييم الشامل',
  },

  // ── Arabic section header (appears only once, before the AR pages) ──
  arabicSectionHeader: {
    en: '',
    ar: 'القسم العربي — النسخة العربية من التقرير',
  },

  // ── Backend-specific section titles ───────────────────────
  assessmentReport: { en: 'Assessment Report', ar: 'تقرير التقييم' },
  mindSkills: { en: 'Mind Skills Assessment', ar: 'تقييم المهارات الذهنية' },
  oralSkills: { en: 'Oral Skills Assessment', ar: 'تقييم المهارات الشفهية' },
  academicSkills: { en: 'Academic Skills Assessment', ar: 'تقييم المهارات الأكاديمية' },
  recommendations: { en: 'Recommendations', ar: 'التوصيات' },
  strengthsIdentified: { en: 'Strengths Identified', ar: 'نقاط القوة المحددة' },
  areasForGrowth: { en: 'Areas for Growth', ar: 'مجالات النمو' },
  suggestedActivities: { en: 'Suggested Activities', ar: 'الأنشطات المقترحة' },
  quizzesCompleted: { en: 'Quizzes Completed', ar: 'الاختبارات المكتملة' },
  overallScore: { en: 'Overall Score', ar: 'الدرجة الكلية' },
  parentGuardian: {
    en: 'Dear Parent/Guardian,\n\nThis report provides an overview of your child\'s cognitive skills assessment. The scores reflect performance across various cognitive areas including attention, memory, critical thinking, and language skills. Please review the recommendations section for suggested activities.',
    ar: 'عزيزي ولي الأمر،\n\nيقدم هذا التقرير نظرة عامة على تقييم المهارات الإدراكية لطفلك. تعكس الدرجات الأداء في مختلف المجالات الإدراكية بما في ذلك الانتباه والذاكرة والتفكير النقدي والمهارات اللغوية. يرجى مراجعة قسم التوصيات للأنشطة المقترحة.',
  },
  overallPerformance: { en: 'Overall Performance: ', ar: 'الأداء العام: ' },
  satisfactory: { en: 'Satisfactory', ar: 'مُرضٍ' },
  needsImprovement: { en: 'Needs Improvement', ar: 'يحتاج تحسين' },
  completed: { en: 'completed', ar: 'مكتمل' },
  timeInvestedMin: { en: 'min', ar: 'دقيقة' },
  generatedBy: {
    en: 'Generated by Holistic Assessment Tool | Bloom Tutoring',
    ar: 'صادر من أداة التقييم الشامل | بلوم للتعليم',
  },

  // ── Learning style names ──────────────────────────────────
  'style.visual': { en: 'Visual Learner', ar: 'متعلم بصري' },
  'style.auditory': { en: 'Auditory Learner', ar: 'متعلم سمعي' },
  'style.reading-writing': { en: 'Reading/Writing Learner', ar: 'متعلم قرائي/كتابي' },
  'style.kinesthetic': { en: 'Kinesthetic Learner', ar: 'متعلم حركي' },
} as const;

export type ReportTranslationKey = keyof typeof reportTranslations;

/**
 * Create a translator bound to a specific language.
 */
export function createReportT(language: 'en' | 'ar') {
  return (key: ReportTranslationKey): string => {
    const entry = reportTranslations[key];
    if (!entry) return key;
    return entry[language] ?? entry.en;
  };
}

/**
 * Get subcategory name in the given language.
 */
export function getSubcategoryNameBilingual(subcategory: string, language: 'en' | 'ar'): string {
  const key = `sub.${subcategory}` as ReportTranslationKey;
  const entry = reportTranslations[key];
  return entry ? entry[language] : subcategory;
}

/**
 * Get skill description in the given language.
 */
export function getSkillDescriptionBilingual(subcategory: string, language: 'en' | 'ar'): string {
  const key = `desc.${subcategory}` as ReportTranslationKey;
  const entry = reportTranslations[key];
  return entry ? entry[language] : '';
}
