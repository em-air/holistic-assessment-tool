/**
 * Homepage translations — English ↔ Arabic
 *
 * This file contains all user-visible strings that appear on the Homepage.
 * The `t()` helper resolves the active language at runtime.
 */

import { Language } from '../contexts/LanguageContext';

const homepageTranslations = {
  // ── Navigation ────────────────────────────────────────────
  'nav.about': { en: 'About', ar: 'حول' },
  'nav.contact': { en: 'Contact', ar: 'تواصل معنا' },
  'nav.profile': { en: 'Profile', ar: 'الملف الشخصي' },
  'nav.signOut': { en: 'Sign Out', ar: 'تسجيل الخروج' },
  'nav.register': { en: 'Register/Sign In', ar: 'تسجيل / دخول' },

  // ── Hero ──────────────────────────────────────────────────
  'hero.title': {
    en: 'Discover Your Learning Strengths',
    ar: 'اكتشف نقاط قوتك في التعلم',
  },
  'hero.subtitle': {
    en: 'Simple, engaging tools to explore your abilities in reading, memory, attention, and more. Perfect for students aged 6-12',
    ar: 'أدوات بسيطة وممتعة لاستكشاف قدراتك في القراءة والذاكرة والانتباه وأكثر. مناسبة للطلاب من 6 إلى 12 سنة',
  },
  'hero.startAssessment': { en: 'Start Assessment', ar: 'ابدأ التقييم' },
  'hero.timeNote': { en: 'Takes about 45 minutes', ar: 'يستغرق حوالي 45 دقيقة' },
  'hero.adminDashboard': { en: 'Admin Dashboard', ar: 'لوحة الإدارة' },

  // ── Stats ─────────────────────────────────────────────────
  'stats.categories': { en: 'Categories', ar: 'فئات' },
  'stats.skillAreas': { en: 'Skill Areas', ar: 'مجالات المهارات' },
  'stats.minutes': { en: 'Minutes', ar: 'دقيقة' },
  'stats.ageRange': { en: 'Age Range', ar: 'الفئة العمرية' },

  // ── Features ──────────────────────────────────────────────
  'features.quickEasy': { en: 'Quick & Easy', ar: 'سريع وسهل' },
  'features.quickEasyDesc': { en: 'Complete in 45 minutes', ar: 'أكمل في 45 دقيقة' },
  'features.kidFriendly': { en: 'Kid-Friendly', ar: 'مناسب للأطفال' },
  'features.kidFriendlyDesc': { en: 'Designed for ages 6-12', ar: 'مصمم للأعمار من 6 إلى 12' },
  'features.detailedResults': { en: 'Detailed Results', ar: 'نتائج مفصّلة' },
  'features.detailedResultsDesc': { en: 'Get insights into strengths', ar: 'احصل على رؤى حول نقاط القوة' },

  // ── Trust badges ──────────────────────────────────────────
  'trust.educatorApproved': { en: 'Educator Approved', ar: 'معتمد من المعلمين' },
  'trust.safeSecure': { en: 'Safe & Secure', ar: 'آمن ومحمي' },
  'trust.researchBased': { en: 'Research-Based', ar: 'مبني على الأبحاث' },

  // ── Mobile bottom nav ────────────────────────────────────
  'mobileNav.home': { en: 'Home', ar: 'الرئيسية' },
  'mobileNav.categories': { en: 'Categories', ar: 'الفئات' },
  'mobileNav.logOut': { en: 'Log Out', ar: 'خروج' },
  'mobileNav.register': { en: 'Register', ar: 'تسجيل' },
  'mobileNav.help': { en: 'Help', ar: 'مساعدة' },

  // ── Sign-out modal ────────────────────────────────────────
  'signOut.title': { en: 'Sign Out', ar: 'تسجيل الخروج' },
  'signOut.message': { en: 'Are you sure you want to sign out?', ar: 'هل أنت متأكد أنك تريد تسجيل الخروج؟' },
  'signOut.cancel': { en: 'Cancel', ar: 'إلغاء' },
  'signOut.confirm': { en: 'Sign Out', ar: 'تسجيل الخروج' },
} as const;

export type HomepageTranslationKey = keyof typeof homepageTranslations;

/**
 * Create a translator bound to a specific language.
 *
 * ```tsx
 * const t = createHomepageT('ar');
 * t('hero.title') // → 'اكتشف نقاط قوتك في التعلم'
 * ```
 */
export function createHomepageT(language: Language) {
  return (key: HomepageTranslationKey): string => {
    const entry = homepageTranslations[key];
    if (!entry) return key;
    return entry[language] ?? entry.en;
  };
}

export default homepageTranslations;
