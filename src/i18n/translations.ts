// Global translation dictionary for English ↔ Arabic
// All UI text strings used throughout the application

export type Language = 'en' | 'ar';

export interface TranslationKeys {
  // ===== Navigation =====
  'nav.home': string;
  'nav.about': string;
  'nav.contact': string;
  'nav.categories': string;
  'nav.profile': string;
  'nav.admin': string;
  'nav.register': string;
  'nav.registerSignIn': string;
  'nav.signOut': string;
  'nav.logOut': string;
  'nav.help': string;
  'nav.courses': string;
  'nav.back': string;

  // ===== Homepage =====
  'home.title': string;
  'home.subtitle': string;
  'home.startAssessment': string;
  'home.takesDuration': string;
  'home.adminDashboard': string;
  'home.stats.categories': string;
  'home.stats.skillAreas': string;
  'home.stats.minutes': string;
  'home.stats.ageRange': string;
  'home.features.quickEasy': string;
  'home.features.quickEasyDesc': string;
  'home.features.kidFriendly': string;
  'home.features.kidFriendlyDesc': string;
  'home.features.detailedResults': string;
  'home.features.detailedResultsDesc': string;
  'home.badges.educatorApproved': string;
  'home.badges.safeSecure': string;
  'home.badges.researchBased': string;

  // ===== Categories Page =====
  'categories.title': string;
  'categories.subtitle': string;
  'categories.statsCategories': string;
  'categories.statsCompleted': string;
  'categories.progressTracking': string;
  'categories.progressTrackingDesc': string;
  'categories.personalizedLearning': string;
  'categories.personalizedLearningDesc': string;

  // ===== Category Cards =====
  'category.mind.title': string;
  'category.mind.description': string;
  'category.oral.title': string;
  'category.oral.description': string;
  'category.academic.title': string;
  'category.academic.description': string;
  'category.startCognition': string;
  'category.startOral': string;
  'category.beginAssessment': string;
  'category.notAvailable': string;

  // ===== Subcategories =====
  'subcategory.attention': string;
  'subcategory.learningStyle': string;
  'subcategory.criticalThinking': string;
  'subcategory.perception': string;
  'subcategory.oralLanguage': string;
  'subcategory.reading': string;
  'subcategory.phonicsAwareness': string;
  'subcategory.blending': string;
  'subcategory.writing': string;
  'subcategory.vocabulary': string;
  'subcategory.spelling': string;
  'subcategory.aiAssessment': string;

  // ===== Category Page =====
  'categoryPage.notFound': string;
  'categoryPage.chooseAssessment': string;
  'categoryPage.available': string;
  'categoryPage.comingSoon': string;

  // ===== Quiz Common =====
  'quiz.questionOf': string;
  'quiz.question': string;
  'quiz.of': string;
  'quiz.complete': string;
  'quiz.previous': string;
  'quiz.next': string;
  'quiz.finish': string;
  'quiz.submit': string;
  'quiz.tryAgain': string;
  'quiz.tryAnotherGrade': string;
  'quiz.backToCategories': string;
  'quiz.backToHome': string;
  'quiz.backToDashboard': string;
  'quiz.takeAnother': string;
  'quiz.notFound': string;
  'quiz.loading': string;

  // ===== Quiz Results =====
  'results.title': string;
  'results.outstanding': string;
  'results.greatJob': string;
  'results.goodEffort': string;
  'results.keepPracticing': string;
  'results.youGot': string;
  'results.outOf': string;
  'results.correct': string;
  'results.thats': string;

  // ===== Assessment Specific =====
  'assessment.complete': string;
  'assessment.results': string;
  'assessment.focusingScore': string;
  'assessment.shiftingScore': string;
  'assessment.totalScore': string;
  'assessment.needsDevelopment': string;
  'assessment.strongSkills': string;

  // ===== Progress =====
  'progress.title': string;
  'progress.loading': string;
  'progress.signInTitle': string;
  'progress.signInDesc': string;
  'progress.signInButton': string;
  'progress.quizzesCompleted': string;
  'progress.hideDetails': string;
  'progress.showDetails': string;
  'progress.clearProgress': string;
  'progress.confirmClear': string;
  'progress.cancel': string;
  'progress.overallProgress': string;
  'progress.cleared': string;
  'progress.savingGenerating': string;
  'progress.savedComplete': string;
  'progress.savedProgress': string;
  'progress.generateComplete': string;
  'progress.generateProgress': string;
  'progress.performance': string;
  'progress.lastUpdated': string;
  'progress.excellent': string;
  'progress.good': string;
  'progress.developing': string;
  'progress.needsSupport': string;

  // Mind subcategories for progress
  'progress.attention': string;
  'progress.memory': string;
  'progress.learningStyle': string;
  'progress.criticalThinking': string;
  'progress.perception': string;

  // ===== Result Screen (Learning Styles) =====
  'resultScreen.title': string;
  'resultScreen.subtitle': string;
  'resultScreen.dominantStyle': string;
  'resultScreen.chartTitle': string;
  'resultScreen.points': string;
  'resultScreen.outOf': string;
  'resultScreen.studyTips': string;
  'resultScreen.retakeQuiz': string;
  'resultScreen.viewMore': string;

  // Learning style tips
  'tips.visual.useAids': string;
  'tips.visual.useAidsDesc': string;
  'tips.visual.colorCoding': string;
  'tips.visual.colorCodingDesc': string;
  'tips.visual.watchVideos': string;
  'tips.visual.watchVideosDesc': string;
  'tips.auditory.discuss': string;
  'tips.auditory.discussDesc': string;
  'tips.auditory.useAudio': string;
  'tips.auditory.useAudioDesc': string;
  'tips.auditory.studyGroups': string;
  'tips.auditory.studyGroupsDesc': string;
  'tips.readingWriting.takeNotes': string;
  'tips.readingWriting.takeNotesDesc': string;
  'tips.readingWriting.readExtensively': string;
  'tips.readingWriting.readExtensivelyDesc': string;
  'tips.readingWriting.writeToLearn': string;
  'tips.readingWriting.writeToLearnDesc': string;

  // ===== Auth =====
  'auth.signOut': string;
  'auth.signOutConfirm': string;
  'auth.cancel': string;

  // ===== Spelling Test =====
  'spelling.title': string;
  'spelling.listenAndSpell': string;
  'spelling.typeWord': string;
  'spelling.playAgain': string;
  'spelling.grade': string;

  // ===== Writing Test =====
  'writing.title': string;
  'writing.grade': string;

  // ===== Reading =====
  'reading.title': string;
  'reading.assessment': string;

  // ===== Phonics =====
  'phonics.title': string;
  'phonics.selection': string;

  // ===== Blending & Segmenting =====
  'blending.title': string;
  'blending.selection': string;

  // ===== Language Toggle =====
  'language.label': string;
  'language.english': string;
  'language.arabic': string;
  'language.switchTo': string;

  // ===== Common =====
  'common.cancel': string;
  'common.confirm': string;
  'common.save': string;
  'common.delete': string;
  'common.edit': string;
  'common.close': string;
  'common.yes': string;
  'common.no': string;
  'common.ok': string;
  'common.error': string;
  'common.success': string;
  'common.select': string;
  'common.start': string;
  'common.continue': string;
  'common.score': string;
}

export const translations: Record<Language, TranslationKeys> = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.about': 'About',
    'nav.contact': 'Contact',
    'nav.categories': 'Categories',
    'nav.profile': 'Profile',
    'nav.admin': 'Admin',
    'nav.register': 'Register',
    'nav.registerSignIn': 'Register/Sign In',
    'nav.signOut': 'Sign Out',
    'nav.logOut': 'Log Out',
    'nav.help': 'Help',
    'nav.courses': 'Courses',
    'nav.back': 'Back',

    // Homepage
    'home.title': 'Discover Your Learning Strengths',
    'home.subtitle': 'Simple, engaging tools to explore your abilities in reading, memory, attention, and more. Perfect for students aged 6-12',
    'home.startAssessment': 'Start Assessment',
    'home.takesDuration': 'Takes about 45 minutes',
    'home.adminDashboard': 'Admin Dashboard',
    'home.stats.categories': 'Categories',
    'home.stats.skillAreas': 'Skill Areas',
    'home.stats.minutes': 'Minutes',
    'home.stats.ageRange': 'Age Range',
    'home.features.quickEasy': 'Quick & Easy',
    'home.features.quickEasyDesc': 'Complete in 45 minutes',
    'home.features.kidFriendly': 'Kid-Friendly',
    'home.features.kidFriendlyDesc': 'Designed for ages 6-12',
    'home.features.detailedResults': 'Detailed Results',
    'home.features.detailedResultsDesc': 'Get insights into strengths',
    'home.badges.educatorApproved': 'Educator Approved',
    'home.badges.safeSecure': 'Safe & Secure',
    'home.badges.researchBased': 'Research-Based',

    // Categories Page
    'categories.title': 'Choose Your Learning Path',
    'categories.subtitle': 'Select an assessment category to begin your holistic learning journey',
    'categories.statsCategories': 'Categories',
    'categories.statsCompleted': 'Completed',
    'categories.progressTracking': 'Progress Tracking',
    'categories.progressTrackingDesc': 'Monitor your learning journey with detailed analytics and progress reports.',
    'categories.personalizedLearning': 'Personalized Learning',
    'categories.personalizedLearningDesc': 'Get customized recommendations based on your unique learning style and preferences.',

    // Category Cards
    'category.mind.title': 'Cognition',
    'category.mind.description': 'Assess memory, focus, comprehension, and critical thinking.',
    'category.oral.title': 'Oral Skills',
    'category.oral.description': 'Evaluate oral language, reading, beginning and ending sounds, and blending.',
    'category.academic.title': 'Academic Skills',
    'category.academic.description': 'Evaluate writing, sentence formation, spelling, and math skills.',
    'category.startCognition': 'Start Cognition Assessment',
    'category.startOral': 'Start Oral Skills',
    'category.beginAssessment': 'Begin Assessment',
    'category.notAvailable': 'Not Available',

    // Subcategories
    'subcategory.attention': 'Attention/Memory',
    'subcategory.learningStyle': 'Learning Style',
    'subcategory.criticalThinking': 'Critical Thinking',
    'subcategory.perception': 'Perception',
    'subcategory.oralLanguage': 'Oral Language',
    'subcategory.reading': 'Reading',
    'subcategory.phonicsAwareness': 'Beginning and Ending Sounds',
    'subcategory.blending': 'Blending and Segmenting',
    'subcategory.writing': 'Writing',
    'subcategory.vocabulary': 'Vocabulary',
    'subcategory.spelling': 'Spelling',
    'subcategory.aiAssessment': 'AI Assessment Generator',

    // Category Page
    'categoryPage.notFound': 'Category Not Found',
    'categoryPage.chooseAssessment': 'Choose an Assessment',
    'categoryPage.available': 'Available',
    'categoryPage.comingSoon': 'Coming Soon',

    // Quiz Common
    'quiz.questionOf': 'Question {current} of {total}',
    'quiz.question': 'Question',
    'quiz.of': 'of',
    'quiz.complete': 'Complete',
    'quiz.previous': 'Previous',
    'quiz.next': 'Next',
    'quiz.finish': 'Finish',
    'quiz.submit': 'Submit',
    'quiz.tryAgain': '🔄 Try Again',
    'quiz.tryAnotherGrade': '📚 Try Another Grade',
    'quiz.backToCategories': '🏠 Back to Categories',
    'quiz.backToHome': 'Back to Home',
    'quiz.backToDashboard': 'Back to Dashboard',
    'quiz.takeAnother': 'Take Another Assessment',
    'quiz.notFound': 'Quiz not found',
    'quiz.loading': 'Loading...',

    // Quiz Results
    'results.title': 'Assessment Complete!',
    'results.outstanding': 'Outstanding!',
    'results.greatJob': 'Great job!',
    'results.goodEffort': 'Good effort!',
    'results.keepPracticing': 'Keep practicing!',
    'results.youGot': 'You got',
    'results.outOf': 'out of',
    'results.correct': 'correct',
    'results.thats': "That's",

    // Assessment Specific
    'assessment.complete': 'Assessment Complete!',
    'assessment.results': 'Results',
    'assessment.focusingScore': 'Focusing Score:',
    'assessment.shiftingScore': 'Shifting Score:',
    'assessment.totalScore': 'Total Score:',
    'assessment.needsDevelopment': 'Some areas need development.',
    'assessment.strongSkills': 'Great job! Your attention skills are strong.',

    // Progress
    'progress.title': 'Cognition Section Progress',
    'progress.loading': 'Loading progress...',
    'progress.signInTitle': 'Sign In to Track Progress',
    'progress.signInDesc': 'Your quiz progress is saved to your account. Sign in to view and save your progress.',
    'progress.signInButton': 'Sign In / Register',
    'progress.quizzesCompleted': '{completed} of {total} quizzes completed',
    'progress.hideDetails': 'Hide Details',
    'progress.showDetails': 'Show Details',
    'progress.clearProgress': 'Clear Progress',
    'progress.confirmClear': 'Confirm Clear',
    'progress.cancel': 'Cancel',
    'progress.overallProgress': 'Overall Progress',
    'progress.cleared': '✅ Progress cleared successfully!',
    'progress.savingGenerating': 'Saving & Generating...',
    'progress.savedComplete': 'Saved! Complete Report',
    'progress.savedProgress': 'Saved! Progress Report',
    'progress.generateComplete': 'Generate Complete Report',
    'progress.generateProgress': 'Generate Progress Report',
    'progress.performance': 'Performance:',
    'progress.lastUpdated': 'Last updated:',
    'progress.excellent': 'Excellent',
    'progress.good': 'Good',
    'progress.developing': 'Developing',
    'progress.needsSupport': 'Needs Support',

    'progress.attention': 'Attention',
    'progress.memory': 'Memory',
    'progress.learningStyle': 'Learning Style',
    'progress.criticalThinking': 'Critical Thinking',
    'progress.perception': 'Perception',

    // Result Screen
    'resultScreen.title': 'Your Learning Style Results',
    'resultScreen.subtitle': 'Discover how you learn best and optimize your study methods!',
    'resultScreen.dominantStyle': 'Your dominant learning style is:',
    'resultScreen.chartTitle': 'Your Learning Style Profile',
    'resultScreen.points': 'points',
    'resultScreen.outOf': 'out of',
    'resultScreen.studyTips': '💡 Study Tips for',
    'resultScreen.retakeQuiz': '🔄 Retake Quiz',
    'resultScreen.viewMore': '📊 View More Assessments',

    // Learning style tips
    'tips.visual.useAids': 'Use Visual Aids',
    'tips.visual.useAidsDesc': 'Create charts, diagrams, and mind maps to organize information',
    'tips.visual.colorCoding': 'Color Coding',
    'tips.visual.colorCodingDesc': 'Use different colors to highlight and categorize information',
    'tips.visual.watchVideos': 'Watch Videos',
    'tips.visual.watchVideosDesc': 'Use educational videos and visual demonstrations',
    'tips.auditory.discuss': 'Discuss & Explain',
    'tips.auditory.discussDesc': 'Talk through concepts with others or explain them out loud',
    'tips.auditory.useAudio': 'Use Audio Resources',
    'tips.auditory.useAudioDesc': 'Listen to podcasts, audiobooks, and recorded lectures',
    'tips.auditory.studyGroups': 'Study Groups',
    'tips.auditory.studyGroupsDesc': 'Join study groups and participate in discussions',
    'tips.readingWriting.takeNotes': 'Take Detailed Notes',
    'tips.readingWriting.takeNotesDesc': 'Write comprehensive notes and summaries',
    'tips.readingWriting.readExtensively': 'Read Extensively',
    'tips.readingWriting.readExtensivelyDesc': 'Use textbooks, articles, and written materials',
    'tips.readingWriting.writeToLearn': 'Write to Learn',
    'tips.readingWriting.writeToLearnDesc': 'Use writing exercises and essay practice',

    // Auth
    'auth.signOut': 'Sign Out',
    'auth.signOutConfirm': 'Are you sure you want to sign out?',
    'auth.cancel': 'Cancel',

    // Spelling
    'spelling.title': 'Spelling Test',
    'spelling.listenAndSpell': 'Listen and spell the word',
    'spelling.typeWord': 'Type the word here...',
    'spelling.playAgain': 'Play Again',
    'spelling.grade': 'Grade',

    // Writing
    'writing.title': 'Writing Test',
    'writing.grade': 'Grade',

    // Reading
    'reading.title': 'Reading Assessment',
    'reading.assessment': 'Assessment',

    // Phonics
    'phonics.title': 'Beginning and Ending Sounds',
    'phonics.selection': 'Select a Quiz',

    // Blending
    'blending.title': 'Blending & Segmenting',
    'blending.selection': 'Select a Quiz',

    // Language Toggle
    'language.label': 'Language',
    'language.english': 'English',
    'language.arabic': 'العربية',
    'language.switchTo': 'Switch to Arabic',

    // Common
    'common.cancel': 'Cancel',
    'common.confirm': 'Confirm',
    'common.save': 'Save',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.close': 'Close',
    'common.yes': 'Yes',
    'common.no': 'No',
    'common.ok': 'OK',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.select': 'Select',
    'common.start': 'Start',
    'common.continue': 'Continue',
    'common.score': 'Score',
  },

  ar: {
    // Navigation
    'nav.home': 'الرئيسية',
    'nav.about': 'حول',
    'nav.contact': 'اتصل بنا',
    'nav.categories': 'الفئات',
    'nav.profile': 'الملف الشخصي',
    'nav.admin': 'المشرف',
    'nav.register': 'تسجيل',
    'nav.registerSignIn': 'تسجيل / دخول',
    'nav.signOut': 'تسجيل الخروج',
    'nav.logOut': 'تسجيل الخروج',
    'nav.help': 'مساعدة',
    'nav.courses': 'الدورات',
    'nav.back': 'رجوع',

    // Homepage
    'home.title': 'اكتشف نقاط قوتك في التعلم',
    'home.subtitle': 'أدوات بسيطة وممتعة لاستكشاف قدراتك في القراءة والذاكرة والانتباه والمزيد. مثالية للطلاب من سن ٦ إلى ١٢',
    'home.startAssessment': 'ابدأ التقييم',
    'home.takesDuration': 'يستغرق حوالي ٤٥ دقيقة',
    'home.adminDashboard': 'لوحة المشرف',
    'home.stats.categories': 'الفئات',
    'home.stats.skillAreas': 'مجالات المهارات',
    'home.stats.minutes': 'دقيقة',
    'home.stats.ageRange': 'الفئة العمرية',
    'home.features.quickEasy': 'سريع وسهل',
    'home.features.quickEasyDesc': 'أكمل في ٤٥ دقيقة',
    'home.features.kidFriendly': 'مناسب للأطفال',
    'home.features.kidFriendlyDesc': 'مصمم للأعمار ٦-١٢',
    'home.features.detailedResults': 'نتائج مفصلة',
    'home.features.detailedResultsDesc': 'احصل على رؤى حول نقاط القوة',
    'home.badges.educatorApproved': 'معتمد من المعلمين',
    'home.badges.safeSecure': 'آمن ومحمي',
    'home.badges.researchBased': 'قائم على الأبحاث',

    // Categories Page
    'categories.title': 'اختر مسار التعلم الخاص بك',
    'categories.subtitle': 'اختر فئة تقييم لبدء رحلة التعلم الشاملة',
    'categories.statsCategories': 'الفئات',
    'categories.statsCompleted': 'مكتمل',
    'categories.progressTracking': 'تتبع التقدم',
    'categories.progressTrackingDesc': 'راقب رحلة تعلمك مع تحليلات مفصلة وتقارير التقدم.',
    'categories.personalizedLearning': 'تعلم مخصص',
    'categories.personalizedLearningDesc': 'احصل على توصيات مخصصة بناءً على أسلوب تعلمك الفريد وتفضيلاتك.',

    // Category Cards
    'category.mind.title': 'الإدراك',
    'category.mind.description': 'تقييم الذاكرة والتركيز والفهم والتفكير النقدي.',
    'category.oral.title': 'المهارات الشفوية',
    'category.oral.description': 'تقييم اللغة الشفوية والقراءة وأصوات البداية والنهاية والمزج.',
    'category.academic.title': 'المهارات الأكاديمية',
    'category.academic.description': 'تقييم الكتابة وتكوين الجمل والإملاء ومهارات الرياضيات.',
    'category.startCognition': 'ابدأ تقييم الإدراك',
    'category.startOral': 'ابدأ المهارات الشفوية',
    'category.beginAssessment': 'ابدأ التقييم',
    'category.notAvailable': 'غير متاح',

    // Subcategories
    'subcategory.attention': 'الانتباه/الذاكرة',
    'subcategory.learningStyle': 'أسلوب التعلم',
    'subcategory.criticalThinking': 'التفكير النقدي',
    'subcategory.perception': 'الإدراك الحسي',
    'subcategory.oralLanguage': 'اللغة الشفوية',
    'subcategory.reading': 'القراءة',
    'subcategory.phonicsAwareness': 'أصوات البداية والنهاية',
    'subcategory.blending': 'المزج والتقسيم',
    'subcategory.writing': 'الكتابة',
    'subcategory.vocabulary': 'المفردات',
    'subcategory.spelling': 'الإملاء',
    'subcategory.aiAssessment': 'مولد التقييم الذكي',

    // Category Page
    'categoryPage.notFound': 'الفئة غير موجودة',
    'categoryPage.chooseAssessment': 'اختر تقييمًا',
    'categoryPage.available': 'متاح',
    'categoryPage.comingSoon': 'قريبًا',

    // Quiz Common
    'quiz.questionOf': 'السؤال {current} من {total}',
    'quiz.question': 'السؤال',
    'quiz.of': 'من',
    'quiz.complete': 'مكتمل',
    'quiz.previous': 'السابق',
    'quiz.next': 'التالي',
    'quiz.finish': 'إنهاء',
    'quiz.submit': 'إرسال',
    'quiz.tryAgain': '🔄 حاول مرة أخرى',
    'quiz.tryAnotherGrade': '📚 جرب مستوى آخر',
    'quiz.backToCategories': '🏠 العودة للفئات',
    'quiz.backToHome': 'العودة للرئيسية',
    'quiz.backToDashboard': 'العودة للوحة التحكم',
    'quiz.takeAnother': 'خذ تقييمًا آخر',
    'quiz.notFound': 'الاختبار غير موجود',
    'quiz.loading': 'جاري التحميل...',

    // Quiz Results
    'results.title': 'اكتمل التقييم!',
    'results.outstanding': 'ممتاز!',
    'results.greatJob': 'عمل رائع!',
    'results.goodEffort': 'جهد جيد!',
    'results.keepPracticing': 'واصل التدريب!',
    'results.youGot': 'حصلت على',
    'results.outOf': 'من',
    'results.correct': 'صحيح',
    'results.thats': 'هذا',

    // Assessment Specific
    'assessment.complete': 'اكتمل التقييم!',
    'assessment.results': 'النتائج',
    'assessment.focusingScore': 'درجة التركيز:',
    'assessment.shiftingScore': 'درجة التحول:',
    'assessment.totalScore': 'الدرجة الكلية:',
    'assessment.needsDevelopment': 'بعض المجالات تحتاج تطوير.',
    'assessment.strongSkills': 'عمل رائع! مهارات الانتباه لديك قوية.',

    // Progress
    'progress.title': 'تقدم قسم الإدراك',
    'progress.loading': 'جاري تحميل التقدم...',
    'progress.signInTitle': 'سجل الدخول لتتبع التقدم',
    'progress.signInDesc': 'يتم حفظ تقدمك في الاختبارات في حسابك. سجل الدخول لعرض وحفظ تقدمك.',
    'progress.signInButton': 'تسجيل الدخول / التسجيل',
    'progress.quizzesCompleted': '{completed} من {total} اختبارات مكتملة',
    'progress.hideDetails': 'إخفاء التفاصيل',
    'progress.showDetails': 'عرض التفاصيل',
    'progress.clearProgress': 'مسح التقدم',
    'progress.confirmClear': 'تأكيد المسح',
    'progress.cancel': 'إلغاء',
    'progress.overallProgress': 'التقدم العام',
    'progress.cleared': '✅ تم مسح التقدم بنجاح!',
    'progress.savingGenerating': 'جاري الحفظ والإنشاء...',
    'progress.savedComplete': 'تم الحفظ! تقرير كامل',
    'progress.savedProgress': 'تم الحفظ! تقرير التقدم',
    'progress.generateComplete': 'إنشاء تقرير كامل',
    'progress.generateProgress': 'إنشاء تقرير التقدم',
    'progress.performance': 'الأداء:',
    'progress.lastUpdated': 'آخر تحديث:',
    'progress.excellent': 'ممتاز',
    'progress.good': 'جيد',
    'progress.developing': 'في تطور',
    'progress.needsSupport': 'يحتاج دعم',

    'progress.attention': 'الانتباه',
    'progress.memory': 'الذاكرة',
    'progress.learningStyle': 'أسلوب التعلم',
    'progress.criticalThinking': 'التفكير النقدي',
    'progress.perception': 'الإدراك الحسي',

    // Result Screen
    'resultScreen.title': 'نتائج أسلوب التعلم الخاص بك',
    'resultScreen.subtitle': 'اكتشف كيف تتعلم بشكل أفضل وحسّن طرق دراستك!',
    'resultScreen.dominantStyle': 'أسلوب التعلم السائد لديك هو:',
    'resultScreen.chartTitle': 'ملف أسلوب التعلم الخاص بك',
    'resultScreen.points': 'نقاط',
    'resultScreen.outOf': 'من',
    'resultScreen.studyTips': '💡 نصائح الدراسة لـ',
    'resultScreen.retakeQuiz': '🔄 إعادة الاختبار',
    'resultScreen.viewMore': '📊 عرض المزيد من التقييمات',

    // Learning style tips
    'tips.visual.useAids': 'استخدم الوسائل البصرية',
    'tips.visual.useAidsDesc': 'أنشئ مخططات ورسوم بيانية وخرائط ذهنية لتنظيم المعلومات',
    'tips.visual.colorCoding': 'الترميز اللوني',
    'tips.visual.colorCodingDesc': 'استخدم ألوانًا مختلفة لتمييز وتصنيف المعلومات',
    'tips.visual.watchVideos': 'شاهد الفيديوهات',
    'tips.visual.watchVideosDesc': 'استخدم الفيديوهات التعليمية والعروض البصرية',
    'tips.auditory.discuss': 'ناقش واشرح',
    'tips.auditory.discussDesc': 'تحدث عن المفاهيم مع الآخرين أو اشرحها بصوت عالٍ',
    'tips.auditory.useAudio': 'استخدم مصادر صوتية',
    'tips.auditory.useAudioDesc': 'استمع للبودكاست والكتب الصوتية والمحاضرات المسجلة',
    'tips.auditory.studyGroups': 'مجموعات الدراسة',
    'tips.auditory.studyGroupsDesc': 'انضم لمجموعات الدراسة وشارك في النقاشات',
    'tips.readingWriting.takeNotes': 'دوّن ملاحظات مفصلة',
    'tips.readingWriting.takeNotesDesc': 'اكتب ملاحظات وملخصات شاملة',
    'tips.readingWriting.readExtensively': 'اقرأ بكثافة',
    'tips.readingWriting.readExtensivelyDesc': 'استخدم الكتب المدرسية والمقالات والمواد المكتوبة',
    'tips.readingWriting.writeToLearn': 'اكتب لتتعلم',
    'tips.readingWriting.writeToLearnDesc': 'استخدم تمارين الكتابة وممارسة المقالات',

    // Auth
    'auth.signOut': 'تسجيل الخروج',
    'auth.signOutConfirm': 'هل أنت متأكد أنك تريد تسجيل الخروج؟',
    'auth.cancel': 'إلغاء',

    // Spelling
    'spelling.title': 'اختبار الإملاء',
    'spelling.listenAndSpell': 'استمع وتهجى الكلمة',
    'spelling.typeWord': 'اكتب الكلمة هنا...',
    'spelling.playAgain': 'استمع مرة أخرى',
    'spelling.grade': 'الصف',

    // Writing
    'writing.title': 'اختبار الكتابة',
    'writing.grade': 'الصف',

    // Reading
    'reading.title': 'تقييم القراءة',
    'reading.assessment': 'تقييم',

    // Phonics
    'phonics.title': 'أصوات البداية والنهاية',
    'phonics.selection': 'اختر اختبارًا',

    // Blending
    'blending.title': 'المزج والتقسيم',
    'blending.selection': 'اختر اختبارًا',

    // Language Toggle
    'language.label': 'اللغة',
    'language.english': 'English',
    'language.arabic': 'العربية',
    'language.switchTo': 'التبديل إلى الإنجليزية',

    // Common
    'common.cancel': 'إلغاء',
    'common.confirm': 'تأكيد',
    'common.save': 'حفظ',
    'common.delete': 'حذف',
    'common.edit': 'تعديل',
    'common.close': 'إغلاق',
    'common.yes': 'نعم',
    'common.no': 'لا',
    'common.ok': 'حسنًا',
    'common.error': 'خطأ',
    'common.success': 'نجاح',
    'common.select': 'اختر',
    'common.start': 'ابدأ',
    'common.continue': 'متابعة',
    'common.score': 'الدرجة',
  },
};
