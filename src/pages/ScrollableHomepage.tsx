import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, signOut } from '../supabase-client';
import CategoryCard from '../components/CategoryCard';
import { assessmentCategories } from '../data/assessmentData';

const useAuth = () => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const userResponse = await getCurrentUser();
    setUser(userResponse?.data?.user ?? null);
  };

  const handleSignOut = async () => {
    await signOut();
    setUser(null);
  };

  return {
    user,
    signOut: handleSignOut,
  };
};

const ScrollableHomepage: React.FC = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const handleNextStep = () => {
    setCurrentStep(1);
  };

  const handlePrevStep = () => {
    setCurrentStep(0);
  };

  const handleCategoryClick = (categoryId: string) => {
    navigate(`/category/${categoryId}`);
  };

  const handleSignOut = async () => {
    await signOut();
    setShowDropdown(false);
    navigate('/auth');
  };

  const getUserName = () => {
    if (!user) return '';
    const fullName = user.user_metadata?.student_name || user.user_metadata?.full_name || user.email;
    return fullName.split(' ')[0] || fullName;
  };

  return (
    <div className="h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-100 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-violet-200/30 to-purple-200/30 rounded-full blur-3xl"
          animate={{ 
            x: [0, 50, 0],
            y: [0, -30, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-indigo-200/30 to-violet-200/30 rounded-full blur-3xl"
          animate={{ 
            x: [0, -30, 0],
            y: [0, 40, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{ 
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-purple-100/20 to-violet-100/20 rounded-full blur-3xl"></div>
      </div>

      {/* Desktop Navbar - Only show on desktop and step 0 */}
      {currentStep === 0 && (
        <div className="fixed top-0 left-0 right-0 z-50 hidden md:block">
          <nav className="bg-white/60 backdrop-blur-md border-b border-violet-200/40 px-4 py-3 shadow-sm shadow-violet-100/20">   
            <div className="max-w-6xl mx-auto flex items-center justify-between">
              {/* Logo */}
              <motion.button 
                onClick={() => navigate('/')}
                className="group flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-300 ease-out text-slate-800 hover:text-violet-600 hover:bg-violet-100/30 relative overflow-hidden"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-violet-100/20 to-purple-100/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="w-5 h-5 bg-violet-600 rounded transition-all duration-300 group-hover:rotate-12 group-hover:shadow-lg group-hover:shadow-violet-500/25 relative z-10"></div>
                <span className="font-medium relative z-10">Holistic Assessment</span>
              </motion.button>
              
              {/* Navigation */}
              <div className="flex items-center space-x-2">
                <motion.button 
                  onClick={() => navigate('/about')} 
                  className="group relative px-4 py-2 text-slate-700 rounded-lg text-sm font-medium overflow-hidden transition-all duration-300 ease-out hover:text-slate-800 hover:bg-slate-100/30"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-100/30 to-slate-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative">About</span>
                </motion.button>

                {user ? (
                  /* Profile Dropdown */
                  <div className="relative">
                    <motion.button
                      onClick={() => setShowDropdown(!showDropdown)}
                      className="group flex items-center space-x-2 px-4 py-2 text-slate-700 rounded-lg text-sm font-medium overflow-hidden transition-all duration-300 ease-out hover:text-violet-700 hover:bg-violet-100/30"
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-violet-100/30 to-violet-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative flex items-center space-x-2">
                        <div className="w-6 h-6 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                          {getUserName().charAt(0).toUpperCase()}
                        </div>
                        <span>Hi, {getUserName()}!</span>
                        <motion.svg 
                          className="w-3 h-3" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth={2} 
                          viewBox="0 0 24 24"
                          animate={{ rotate: showDropdown ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </motion.svg>
                      </div>
                    </motion.button>

                    {/* Desktop Dropdown Menu */}
                    <AnimatePresence>
                      {showDropdown && (
                        <motion.div
                          className="absolute right-0 mt-2 w-48 bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-violet-200/40 py-2 z-50"
                          initial={{ opacity: 0, scale: 0.9, y: -10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9, y: -10 }}
                          transition={{ duration: 0.2, ease: "easeOut" }}
                        >
                          <div className="px-4 py-2 border-b border-violet-200/40">
                            <p className="text-sm font-medium text-slate-800">
                              {user.user_metadata?.student_name || user.user_metadata?.full_name || 'Student'}
                            </p>
                            <p className="text-xs text-slate-600 truncate">{user.email}</p>
                          </div>
                          
                          <motion.button
                            onClick={() => {
                              setShowDropdown(false);
                              navigate('/profile');
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-violet-100/50 transition-colors flex items-center space-x-2"
                            whileHover={{ x: 4 }}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span>My Profile</span>
                          </motion.button>

                          <motion.button
                            onClick={() => {
                              setShowDropdown(false);
                              navigate('/results');
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-violet-100/50 transition-colors flex items-center space-x-2"
                            whileHover={{ x: 4 }}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            <span>My Results</span>
                          </motion.button>

                          <div className="border-t border-violet-200/40 mt-2 pt-2">
                            <motion.button
                              onClick={handleSignOut}
                              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center space-x-2"
                              whileHover={{ x: 4 }}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                              </svg>
                              <span>Sign Out</span>
                            </motion.button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Backdrop */}
                    {showDropdown && (
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setShowDropdown(false)}
                      />
                    )}
                  </div>
                ) : (
                  /* Desktop Sign In/Register Buttons */
                  <>
                    <motion.button 
                      onClick={() => navigate('/auth')} 
                      className="group relative px-4 py-2 text-slate-700 rounded-lg text-sm font-medium overflow-hidden transition-all duration-300 ease-out hover:text-emerald-700 hover:bg-emerald-100/30"
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-100/30 to-emerald-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <span className="relative">Register</span>
                    </motion.button>

                    <motion.button 
                      onClick={() => navigate('/contact')} 
                      className="group relative px-4 py-2 text-slate-700 rounded-lg text-sm font-medium overflow-hidden transition-all duration-300 ease-out hover:text-violet-700 hover:bg-violet-100/30"
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-violet-100/30 to-violet-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <span className="relative flex items-center space-x-1">
                        <span>Contact</span>
                        <svg className="w-3 h-3 transform group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-3 2v10a2 2 0 003 2z" />
                        </svg>
                      </span>
                    </motion.button>
                  </>
                )}
              </div>
            </div>
          </nav>
        </div>
      )}

      {/* Mobile Bottom Navigation - Only show on mobile */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
        <motion.nav 
          className="bg-white/85 backdrop-blur-lg border-t border-violet-200/50 px-4 py-2 shadow-lg"
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <div className="flex items-center justify-around">
            {/* Home */}
            <motion.button
              onClick={() => {
                setCurrentStep(0);
                navigate('/');
              }}
              className="group flex flex-col items-center space-y-0.5 px-3 py-1.5 rounded-xl transition-all duration-300 ease-out hover:bg-violet-100/40"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-violet-100/20 to-purple-100/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="w-6 h-6 flex items-center justify-center relative z-10">
                <svg className="w-5 h-5 text-slate-600 group-hover:text-violet-600 transition-colors duration-300" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <span className="text-xs font-medium text-slate-600 group-hover:text-violet-600 transition-colors duration-300 relative z-10">Home</span>
            </motion.button>

            {/* Tests/Categories */}
            <motion.button
              onClick={handleNextStep}
              className="group flex flex-col items-center space-y-0.5 px-3 py-1.5 rounded-xl transition-all duration-300 ease-out hover:bg-emerald-100/40"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-100/20 to-teal-100/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="w-6 h-6 flex items-center justify-center relative z-10">
                <svg className="w-5 h-5 text-slate-600 group-hover:text-emerald-600 transition-colors duration-300" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="text-xs font-medium text-slate-600 group-hover:text-emerald-600 transition-colors duration-300 relative z-10">Tests</span>
            </motion.button>

            {/* Register/Profile */}
            {user ? (
              <motion.button
                onClick={() => setShowDropdown(!showDropdown)}
                className="group flex flex-col items-center space-y-0.5 px-3 py-1.5 rounded-xl transition-all duration-300 ease-out hover:bg-purple-100/40"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-100/20 to-pink-100/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="w-6 h-6 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-medium relative z-10">
                  {getUserName().charAt(0).toUpperCase()}
                </div>
                <span className="text-xs font-medium text-slate-600 group-hover:text-purple-600 transition-colors duration-300 relative z-10 truncate max-w-[50px]">
                  {getUserName()}
                </span>
              </motion.button>
            ) : (
              <motion.button
                onClick={() => navigate('/auth')}
                className="group flex flex-col items-center space-y-0.5 px-3 py-1.5 rounded-xl transition-all duration-300 ease-out hover:bg-purple-100/40"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-100/20 to-pink-100/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="w-6 h-6 flex items-center justify-center relative z-10">
                  <svg className="w-5 h-5 text-slate-600 group-hover:text-purple-600 transition-colors duration-300" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </div>
                <span className="text-xs font-medium text-slate-600 group-hover:text-purple-600 transition-colors duration-300 relative z-10">Register</span>
              </motion.button>
            )}

            {/* Contact */}
            <motion.button
              onClick={() => navigate('/contact')}
              className="group flex flex-col items-center space-y-0.5 px-3 py-1.5 rounded-xl transition-all duration-300 ease-out hover:bg-orange-100/40"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-orange-100/20 to-yellow-100/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="w-6 h-6 flex items-center justify-center relative z-10">
                <svg className="w-5 h-5 text-slate-600 group-hover:text-orange-600 transition-colors duration-300" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-3 2v10a2 2 0 003 2z" />
                </svg>
              </div>
              <span className="text-xs font-medium text-slate-600 group-hover:text-orange-600 transition-colors duration-300 relative z-10">Contact</span>
            </motion.button>
          </div>
        </motion.nav>

        {/* Mobile Profile Dropdown */}
        <AnimatePresence>
          {showDropdown && user && (
            <motion.div
              className="absolute bottom-full right-4 mb-2 w-48 bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-violet-200/50 py-2 z-50"
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <div className="px-4 py-2 border-b border-violet-200/40">
                <p className="text-sm font-medium text-slate-800">
                  {user.user_metadata?.student_name || user.user_metadata?.full_name || 'Student'}
                </p>
                <p className="text-xs text-slate-600 truncate">{user.email}</p>
              </div>
              
              <motion.button
                onClick={() => {
                  setShowDropdown(false);
                  navigate('/profile');
                }}
                className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-violet-100/50 transition-colors flex items-center space-x-2"
                whileHover={{ x: 4 }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>My Profile</span>
              </motion.button>

              <motion.button
                onClick={() => {
                  setShowDropdown(false);
                  navigate('/results');
                }}
                className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-violet-100/50 transition-colors flex items-center space-x-2"
                whileHover={{ x: 4 }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span>My Results</span>
              </motion.button>

              <div className="border-t border-violet-200/40 mt-2 pt-2">
                <motion.button
                  onClick={handleSignOut}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center space-x-2"
                  whileHover={{ x: 4 }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Sign Out</span>
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Backdrop */}
        {showDropdown && (
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowDropdown(false)}
          />
        )}
      </div>

      {/* Main Content - Reduced bottom padding for shorter navbar */}
      <div className="pb-20 md:pb-0">
        {/* Hero Section - Step 0 */}
        <motion.div 
          className={`transition-all duration-300 ease-out ${
            currentStep === 0 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 -translate-y-4 pointer-events-none absolute inset-0'
          }`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: currentStep === 0 ? 1 : 0, y: currentStep === 0 ? 0 : -20 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <section className="h-screen flex items-center justify-center px-6 pt-16 md:pt-16 relative z-10">
            <div className="max-w-4xl mx-auto text-center space-y-6">
              {/* Main Hero Content */}
              <motion.div 
                className="space-y-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-normal text-slate-800 leading-tight">
                  Discover Your
                  <br />
                  <span className="text-violet-600 font-medium">Learning Strengths</span>
                </h1>
                
                <p className="text-base text-slate-700 font-light max-w-xl mx-auto leading-relaxed">
                  Simple, engaging tools to explore your abilities in reading, memory, attention, and more. 
                  Perfect for students aged 6-12.
                </p>
              </motion.div>

              {/* Action Buttons */}
              <motion.div 
                className="flex flex-col sm:flex-row items-center justify-center gap-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <motion.button
                  onClick={handleNextStep}
                  className="group relative px-8 py-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-medium shadow-lg overflow-hidden transition-all duration-300 ease-out hover:shadow-xl hover:shadow-violet-500/25"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-700 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative flex items-center space-x-2">
                    <span>Start Assessment</span>
                    <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                </motion.button>
                
                <motion.button
                  onClick={() => navigate('/about')}
                  className="group relative px-8 py-4 bg-white/70 backdrop-blur-sm text-slate-700 rounded-xl font-medium border border-violet-200/50 overflow-hidden transition-all duration-300 ease-out hover:bg-white/90 hover:shadow-lg hover:shadow-violet-200/50 hover:border-violet-300/50"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-50/50 to-white/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative flex items-center space-x-2">
                    <span>Learn More</span>
                    <svg className="w-4 h-4 transform group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </motion.button>
              </motion.div>

              {/* Features Grid */}
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <div className="text-center space-y-2">
                  <div className="w-10 h-10 bg-violet-200/60 backdrop-blur-sm rounded-lg flex items-center justify-center mx-auto border border-violet-300/30">
                    <svg className="w-5 h-5 text-violet-700" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="font-medium text-slate-800 text-sm">Quick & Easy</h3>
                  <p className="text-xs text-slate-700">Complete in 45 minutes</p>
                </div>

                <div className="text-center space-y-2">
                  <div className="w-10 h-10 bg-emerald-200/60 backdrop-blur-sm rounded-lg flex items-center justify-center mx-auto border border-emerald-300/30">
                    <svg className="w-5 h-5 text-emerald-700" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="font-medium text-slate-800 text-sm">Kid-Friendly</h3>
                  <p className="text-xs text-slate-700">Designed for ages 6-12</p>
                </div>

                <div className="text-center space-y-2">
                  <div className="w-10 h-10 bg-indigo-200/60 backdrop-blur-sm rounded-lg flex items-center justify-center mx-auto border border-indigo-300/30">
                    <svg className="w-5 h-5 text-indigo-700" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="font-medium text-slate-800 text-sm">Detailed Results</h3>
                  <p className="text-xs text-slate-700">Get insights into strengths</p>
                </div>
              </motion.div>

              {/* Stats Section */}
              <motion.div 
                className="bg-white/40 backdrop-blur-md rounded-xl p-4 mt-6 border border-violet-200/40 shadow-lg shadow-violet-100/50"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-violet-700">{assessmentCategories.length}</div>
                    <div className="text-xs text-slate-700">Categories</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-violet-700">
                      {assessmentCategories.reduce((total, cat) => total + cat.subcategories.length, 0)}
                    </div>
                    <div className="text-xs text-slate-700">Skill Areas</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-violet-700">45</div>
                    <div className="text-xs text-slate-700">Minutes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-violet-700">6-12</div>
                    <div className="text-xs text-slate-700">Age Range</div>
                  </div>
                </div>
              </motion.div>

              {/* Trust Indicators */}
              <motion.div 
                className="flex flex-wrap items-center justify-center gap-6 opacity-70"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.7 }}
                transition={{ delay: 1 }}
              >
                <div className="flex items-center space-x-1 text-slate-600">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-xs">Educator Approved</span>
                </div>
                <div className="flex items-center space-x-1 text-slate-600">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-xs">Safe & Secure</span>
                </div>
                <div className="flex items-center space-x-1 text-slate-600">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-xs">Research-Based</span>
                </div>
              </motion.div>
            </div>
          </section>
        </motion.div>

        {/* Categories Section - Step 1 */}
        <motion.div 
          className={`transition-all duration-300 ease-out ${
            currentStep === 1 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-4 pointer-events-none absolute inset-0'
          }`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: currentStep === 1 ? 1 : 0, y: currentStep === 1 ? 0 : 20 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <section className="h-screen flex flex-col relative z-10">
            {/* Back Button */}
            <div className="flex-shrink-0 p-4">
              <motion.button
                onClick={handlePrevStep}
                className="group flex items-center space-x-2 px-4 py-2 text-slate-700 rounded-lg transition-all duration-300 ease-out hover:text-slate-800 hover:bg-white/50 hover:shadow-md backdrop-blur-sm border border-violet-200/30"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                <span className="font-medium">Back</span>
              </motion.button>
            </div>

            {/* Header */}
            <motion.div 
              className="text-center mb-6 px-6 flex-shrink-0"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-3">
                Choose Your Assessment
              </h2>
              <p className="text-slate-600 max-w-2xl mx-auto text-sm md:text-base">
                Select a category to begin exploring your learning strengths and abilities
              </p>
            </motion.div>
            
            {/* Scrollable Cards Container */}
            <div className="flex-1 overflow-hidden">
              {/* Mobile: Vertical Carousel Scroll with proper spacing */}
              <div className="md:hidden h-full">
                <div className="h-full overflow-y-auto px-4 pb-20 pt-2" style={{ scrollBehavior: 'smooth' }}>
                  <div className="space-y-6">
                    {assessmentCategories.map((category, index) => (
                      <motion.div 
                        key={category.id} 
                        className="transform transition-all duration-300 ease-out"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * index, duration: 0.5 }}
                        whileInView={{ 
                          scale: [0.95, 1],
                          transition: { duration: 0.3 }
                        }}
                        viewport={{ once: true, margin: "-50px" }}
                      >
                        <div className="min-h-[280px] flex items-center">
                          <CategoryCard 
                            category={category}
                          />
                        </div>
                      </motion.div>
                    ))}
                    {/* Extra spacing at bottom for navbar clearance */}
                    <div className="h-8"></div>
                  </div>
                </div>
              </div>
              
              {/* Desktop grid - unchanged */}
              <div className="hidden md:flex md:items-center md:justify-center h-full px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 w-full max-w-7xl">
                  {assessmentCategories.map((category, index) => (
                    <motion.div 
                      key={category.id} 
                      className="transform transition-all duration-300 ease-out hover:scale-105 hover:-translate-y-2 hover:shadow-xl"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                    >
                      <CategoryCard 
                        category={category}
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </motion.div>
      </div>
    </div>
  );
};

export default ScrollableHomepage;