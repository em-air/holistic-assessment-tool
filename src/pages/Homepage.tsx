import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { LogOut, Shield, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { createHomepageT } from '../i18n/homepage';
import LanguageToggle from '../components/LanguageToggle';
import { ROUTES } from '../routes';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, signOut, isAdmin, studentName } = useAuth();
  const { language, isRTL } = useLanguage();
  const t = createHomepageT(language);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    if (isSigningOut) return;
    setIsSigningOut(true);
    try {
      await signOut();
    } catch (error) {
      // signOut already handles errors internally, but guard just in case
    } finally {
      setShowSignOutConfirm(false);
      setIsSigningOut(false);
      // Force page reload to clear all state
      window.location.href = window.location.pathname;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-500 via-teal-500 to-emerald-600 relative overflow-hidden">
      {/* Floating Background Shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-16 w-96 h-96 bg-teal-300/15 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-1/4 w-64 h-64 bg-emerald-300/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-white/5 rounded-full blur-2xl" />
      </div>

      {/* Navigation Bar */}
      <nav className="relative z-20 bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <motion.span
                className="text-xl font-semibold text-black cursor-pointer"
                whileTap={{ scale: 0.95 }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 17
                }}
              >
                Bloom&deg;
              </motion.span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {/* Language Toggle — inline, non-floating */}
              <LanguageToggle compact />
              <button
                onClick={() => navigate('/about')}
                className="text-black hover:text-gray-600 font-medium px-3 py-2 transition-colors duration-200"
              >
                {t('nav.about')}
              </button>
              <button
                onClick={() => navigate('/contact')}
                className="text-black hover:text-gray-600 font-medium px-3 py-2 transition-colors duration-200"
              >
                {t('nav.contact')}
              </button>
              {user ? (
                <>
                  <button
                    onClick={() => navigate(ROUTES.PROFILE)}
                    className="bg-emerald-600 text-white px-6 py-2 rounded-md font-medium hover:bg-emerald-700 transition-colors duration-200 flex items-center gap-2"
                  >
                    <User size={18} />
                    {studentName || t('nav.profile')}
                  </button>
                  <button
                    onClick={() => setShowSignOutConfirm(true)}
                    className="bg-red-600 text-white px-6 py-2 rounded-md font-medium hover:bg-red-700 transition-colors duration-200 flex items-center gap-2"
                  >
                    <LogOut size={18} />
                    {t('nav.signOut')}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => navigate(ROUTES.AUTH)}
                  className="bg-black text-white px-6 py-2 rounded-md font-medium hover:bg-gray-800 transition-colors duration-200"
                >
                  {t('nav.register')}
                </button>
              )}
            </div>

            {/* Mobile Right Side Buttons */}
            <div className="md:hidden flex items-center space-x-3">
              {/* Notifications Button */}
              <button className="relative text-gray-600 hover:text-gray-800 p-2 transition-colors duration-200">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19c-5 0-8-3-8-7s3-7 8-7 8 3 8 7-3 7-8 7" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9a3 3 0 0 1 6 0c0 2-3 3-3 3s-3-1-3-3" />
                </svg>
                {/* Notification dot */}
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
              </button>

              {/* Search Button */}
              <button
                onClick={() => navigate(ROUTES.CATEGORIES)}
                className="text-gray-600 hover:text-gray-800 p-2 transition-colors duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>

              {/* Quick Access Menu */}
              <button className="text-gray-600 hover:text-gray-800 p-2 transition-colors duration-200">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 pb-20 md:pb-0">
        <div className="max-w-6xl mx-auto">
          {/* Hero Card */}
          <motion.div
            className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-elevated p-8 md:p-12 mb-8 border border-white/40"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            {/* Title Section */}
            <div className="text-center mb-12">
              <div className="flex justify-center mb-6">
                <motion.div
                  className="flex space-x-4 text-4xl"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.1, ease: "easeOut" }}
                >
                  <motion.div
                    className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center shadow-sm"
                    style={{ willChange: 'transform' }}
                  >
                    <span className="text-white text-2xl">⭐</span>
                  </motion.div>
                  <motion.div
                    className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center shadow-sm"
                    style={{ willChange: 'transform' }}
                  >
                    <span className="text-white text-2xl">📚</span>
                  </motion.div>
                  <motion.div
                    className="w-16 h-16 bg-pink-500 rounded-full flex items-center justify-center shadow-sm"
                    style={{ willChange: 'transform' }}
                  >
                    <span className="text-white text-2xl">🧠</span>
                  </motion.div>
                </motion.div>
              </div>

              <motion.h1
                className={`text-4xl md:text-6xl font-semibold text-slate-800 mb-6 ${isRTL ? 'font-arabic' : ''}`}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
              >
                {t('hero.title')}
              </motion.h1>

              <motion.p
                className={`text-lg md:text-xl text-slate-600 max-w-4xl mx-auto mb-8 font-normal ${isRTL ? 'font-arabic' : ''}`}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3, ease: "easeOut" }}
              >
                {t('hero.subtitle')}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4, ease: "easeOut" }}
                className="flex flex-col items-center space-y-4"
              >
                <motion.button
                  onClick={() => navigate(ROUTES.CATEGORIES)}
                  className="group relative bg-emerald-600 text-white px-8 py-4 rounded-xl text-lg font-semibold shadow-lg hover:bg-emerald-700 hover:shadow-xl transition-all duration-200"
                  whileHover={{}}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className={`flex items-center space-x-2 ${isRTL ? 'font-arabic' : ''}`}>
                    <span>{t('hero.startAssessment')}</span>
                    <motion.div
                      className="w-5 h-5 text-white"
                      initial={{ x: 0 }}
                      whileHover={{ x: 3 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                    >
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </motion.div>
                  </span>
                </motion.button>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.5, ease: "easeOut" }}
                  className="text-white/80 text-sm font-light"
                >
                  {t('hero.timeNote')}
                </motion.p>

                {/* Admin Dashboard Button - visible to logged in users */}
                {user && (
                  <motion.button
                    onClick={() => navigate(ROUTES.ADMIN_REPORTS)}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.6, ease: "easeOut" }}
                    className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl text-base font-medium shadow-sm hover:shadow-md transition-all duration-200"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Shield size={20} />
                    <span>{t('hero.adminDashboard')}</span>
                  </motion.button>
                )}
              </motion.div>
            </div>

            {/* Stats Grid */}
            <motion.div
              className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.5, ease: "easeOut" }}
            >
              {[
                { number: "3", label: t('stats.categories'), icon: "📊", color: "bg-blue-500" },
                { number: "12", label: t('stats.skillAreas'), icon: "🎯", color: "bg-emerald-500" },
                { number: "45", label: t('stats.minutes'), icon: "⏱️", color: "bg-pink-500" },
                { number: "6-12", label: t('stats.ageRange'), icon: "👦", color: "bg-yellow-500" }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  className="bg-white/70 backdrop-blur-sm rounded-xl p-4 md:p-6 text-center border border-white/40 shadow-card hover:shadow-card-hover transition-shadow duration-200"
                >
                  <div className={`w-10 h-10 mx-auto mb-3 ${stat.color} rounded-xl flex items-center justify-center`}>
                    <span className="text-white text-lg">{stat.icon}</span>
                  </div>
                  <div
                    className="text-2xl md:text-3xl font-medium text-slate-800 mb-1"
                  >
                    {stat.number}
                  </div>
                  <div
                    className="text-sm md:text-base text-slate-600 font-normal"
                  >
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Features Grid */}
            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.6, ease: "easeOut" }}
            >
              {[
                {
                  icon: "⚡",
                  title: t('features.quickEasy'),
                  desc: t('features.quickEasyDesc'),
                  iconBg: "bg-yellow-500",
                  bg: "bg-yellow-50"
                },
                {
                  icon: "👶",
                  title: t('features.kidFriendly'),
                  desc: t('features.kidFriendlyDesc'),
                  iconBg: "bg-pink-500",
                  bg: "bg-pink-50"
                },
                {
                  icon: "📊",
                  title: t('features.detailedResults'),
                  desc: t('features.detailedResultsDesc'),
                  iconBg: "bg-blue-500",
                  bg: "bg-blue-50"
                }
              ].map((feature, index) => (
                <div
                  key={index}
                  className={`${feature.bg}/70 backdrop-blur-sm rounded-xl p-6 border border-white/40 text-center shadow-card hover:shadow-card-hover transition-shadow duration-200`}
                >
                  <div
                    className={`w-16 h-16 mx-auto mb-4 ${feature.iconBg} rounded-xl flex items-center justify-center`}
                  >
                    <span className="text-white text-2xl">{feature.icon}</span>
                  </div>
                  <h3
                    className="text-lg font-medium text-slate-800 mb-2"
                  >
                    {feature.title}
                  </h3>
                  <p
                    className="text-slate-600 font-normal"
                  >
                    {feature.desc}
                  </p>
                </div>
              ))}
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              className="flex flex-wrap justify-center gap-4 md:gap-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.7, ease: "easeOut" }}
            >
              {[
                { text: t('trust.educatorApproved'), icon: "✅", color: "text-emerald-600" },
                { text: t('trust.safeSecure'), icon: "🔒", color: "text-blue-600" },
                { text: t('trust.researchBased'), icon: "📚", color: "text-purple-600" }
              ].map((badge, index) => (
                <div
                  key={index}
                  className="bg-white/70 backdrop-blur-sm px-6 py-3 rounded-full border border-white/40 shadow-card"
                >
                  <span
                    className={`${badge.color} font-medium text-sm md:text-base flex items-center gap-2`}
                  >
                    <span className="text-lg">{badge.icon}</span>
                    {badge.text}
                  </span>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
        <div className="grid grid-cols-4 h-16">
          {/* Home Button */}
          <button
            onClick={() => navigate(ROUTES.HOME)}
            className="flex flex-col items-center justify-center py-2 px-1 text-emerald-600 transition-colors duration-200"
          >
            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-xs font-medium">{t('mobileNav.home')}</span>
          </button>

          {/* Categories Button */}
          <button
            onClick={() => navigate(ROUTES.CATEGORIES)}
            className="flex flex-col items-center justify-center py-2 px-1 text-gray-500 hover:text-emerald-600 transition-colors duration-200"
          >
            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <span className="text-xs font-medium">{t('mobileNav.categories')}</span>
          </button>

          {/* Profile/Auth Button */}
          {user ? (
            <button
              onClick={() => setShowSignOutConfirm(true)}
              className="flex flex-col items-center justify-center py-2 px-1 text-red-500 hover:text-red-600 transition-colors duration-200"
            >
              <LogOut className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium">{t('mobileNav.logOut')}</span>
            </button>
          ) : (
            <button
              onClick={() => navigate(ROUTES.AUTH)}
              className="flex flex-col items-center justify-center py-2 px-1 text-gray-500 hover:text-emerald-600 transition-colors duration-200"
            >
              <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-xs font-medium">{t('mobileNav.register')}</span>
            </button>
          )}

          {/* Help Button */}
          <button
            onClick={() => navigate('/contact')}
            className="flex flex-col items-center justify-center py-2 px-1 text-gray-500 hover:text-emerald-600 transition-colors duration-200"
          >
            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs font-medium">{t('mobileNav.help')}</span>
          </button>
        </div>
      </div>

      {/* Sign Out Confirmation Modal */}
      {showSignOutConfirm && (
        <motion.div
          className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => { if (!isSigningOut) setShowSignOutConfirm(false); }}
        >
          <motion.div
            className="bg-white rounded-xl p-8 max-w-sm w-full shadow-elevated border border-slate-100"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <LogOut className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">{t('signOut.title')}</h3>
              <p className="text-gray-600">{t('signOut.message')}</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowSignOutConfirm(false)}
                disabled={isSigningOut}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors duration-200 font-semibold disabled:opacity-50"
              >
                {t('signOut.cancel')}
              </button>
              <button
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors duration-200 font-semibold shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSigningOut ? 'Signing Out...' : t('signOut.confirm')}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default HomePage;