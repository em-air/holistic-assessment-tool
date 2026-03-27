import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { LogOut, Shield, User } from 'lucide-react';
import CategoryCard from '../components/CategoryCard';
import { assessmentCategories } from '../data/assessmentData';
import FloatingBackground from '../components/FloatingBackground';
import { useAuth } from '../contexts/AuthContext';
import { ROUTES } from '../routes';

const CategoriesPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, signOut, isAdmin, studentName } = useAuth();
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    if (isSigningOut) return;
    setIsSigningOut(true);
    try {
      await signOut();
      // Wait a moment to ensure Supabase has cleared sessionStorage
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      // signOut already handles errors internally, but guard just in case
    } finally {
      setShowSignOutConfirm(false);
      setIsSigningOut(false);
    }
    // Navigate to home after sign out completes (outside finally to ensure signOut finished)
    navigate(ROUTES.HOME);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-300 via-emerald-400 to-lime-500 relative overflow-hidden">
      {/* Animated Background Elements */}
      <FloatingBackground />

      {/* Top Navigation Bar */}
      <nav className="relative z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="text-xl font-bold text-black">
                Bloom°
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              <button
                onClick={() => navigate(ROUTES.HOME)}
                className="text-black hover:text-gray-600 font-medium px-3 py-2 transition-colors duration-200"
              >
                Home
              </button>
              <button
                onClick={() => navigate('/about')}
                className="text-black hover:text-gray-600 font-medium px-3 py-2 transition-colors duration-200"
              >
                About
              </button>
              <button
                onClick={() => navigate('/contact')}
                className="text-black hover:text-gray-600 font-medium px-3 py-2 transition-colors duration-200"
              >
                Contact
              </button>
              {isAdmin && (
                <button
                  onClick={() => navigate(ROUTES.ADMIN_REPORTS)}
                  className="bg-purple-600 text-white px-4 py-2 rounded-md font-medium hover:bg-purple-700 transition-colors duration-200 flex items-center gap-2"
                >
                  <Shield size={18} />
                  Admin
                </button>
              )}
              {user ? (
                <>
                  <button
                    onClick={() => navigate('/profile')}
                    className="bg-emerald-600 text-white px-4 py-2 rounded-md font-medium hover:bg-emerald-700 transition-colors duration-200 flex items-center gap-2"
                  >
                    <User size={18} />
                    {studentName || 'Profile'}
                  </button>
                  <button
                    onClick={() => setShowSignOutConfirm(true)}
                    className="bg-red-600 text-white px-4 py-2 rounded-md font-medium hover:bg-red-700 transition-colors duration-200 flex items-center gap-2"
                  >
                    <LogOut size={18} />
                    Sign Out
                  </button>
                </>
              ) : (
                <button
                  onClick={() => navigate(ROUTES.AUTH)}
                  className="bg-black text-white px-6 py-2 rounded-md font-medium hover:bg-gray-800 transition-colors duration-200"
                >
                  Register/Sign In
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

              {/* Home Button */}
              <button
                onClick={() => navigate(ROUTES.HOME)}
                className="text-gray-600 hover:text-gray-800 p-2 transition-colors duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </button>

              {/* Profile/User Button */}
              <button
                onClick={() => navigate(ROUTES.AUTH)}
                className="text-gray-600 hover:text-gray-800 p-2 transition-colors duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating background shapes */}
        <motion.div
          className="absolute top-10 left-10 w-64 h-64 bg-gradient-to-br from-yellow-300 to-lime-400 rounded-full opacity-30"
          animate={{ x: [0, 50, 0], y: [0, -30, 0], rotate: [0, 180, 360] }}
          transition={{ duration: 20, repeat: Infinity }}
        />
        <motion.div
          className="absolute top-1/3 right-20 w-48 h-48 bg-gradient-to-br from-white to-emerald-200 rounded-full opacity-25"
          animate={{ x: [0, -40, 0], y: [0, 40, 0], rotate: [360, 180, 0] }}
          transition={{ duration: 15, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 left-1/4 w-32 h-32 bg-gradient-to-br from-cyan-300 to-teal-400 rounded-full opacity-35"
          animate={{ scale: [1, 1.2, 1], rotate: [0, -90, 0] }}
          transition={{ duration: 12, repeat: Infinity }}
        />
      </div>

      {/* Main Content */}
      <div className="p-6 pb-24">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-4xl font-medium text-white drop-shadow-lg mb-2">
                  Choose Your Learning Path
                </h1>
                <p className="text-white/90 drop-shadow-md font-normal">Select an assessment category to begin your holistic learning journey</p>
              </div>

              {/* Stats Cards */}
              <div className="hidden md:flex space-x-4">
                <div className="bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/50 text-center min-w-[100px]">
                  <div className="text-2xl font-medium text-emerald-600">{assessmentCategories.length}</div>
                  <div className="text-xs text-gray-600">Categories</div>
                </div>
                <div className="bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/50 text-center min-w-[100px]">
                  <div className="text-2xl font-medium text-green-600">12</div>
                  <div className="text-xs text-gray-600">Completed</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Subject Categories Grid */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            {assessmentCategories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="group"
              >
                <CategoryCard category={category} />
              </motion.div>
            ))}
          </motion.div>

          {/* Additional Features Section */}
          <motion.div
            className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
          >
            <div className="bg-white rounded-2xl p-6 shadow-soft border border-gray-100">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-success-400 to-success-600 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Progress Tracking</h3>
              </div>
              <p className="text-gray-600 text-sm">Monitor your learning journey with detailed analytics and progress reports.</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-soft border border-gray-100">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-secondary-400 to-secondary-600 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Personalized Learning</h3>
              </div>
              <p className="text-gray-600 text-sm">Get customized recommendations based on your unique learning style and preferences.</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
        <div className="grid grid-cols-4 h-16">
          {/* Home Button */}
          <button
            onClick={() => navigate(ROUTES.HOME)}
            className="flex flex-col items-center justify-center py-2 px-1 text-gray-500 hover:text-emerald-600 transition-colors duration-200"
          >
            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-xs font-medium">Home</span>
          </button>

          {/* Categories Button */}
          <button
            onClick={() => navigate(ROUTES.CATEGORIES)}
            className="flex flex-col items-center justify-center py-2 px-1 text-emerald-600 transition-colors duration-200"
          >
            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <span className="text-xs font-medium">Categories</span>
          </button>

          {/* Profile/Auth Button */}
          {user ? (
            <button
              onClick={() => setShowSignOutConfirm(true)}
              className="flex flex-col items-center justify-center py-2 px-1 text-red-500 hover:text-red-600 transition-colors duration-200"
            >
              <LogOut className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium">Log Out</span>
            </button>
          ) : (
            <button
              onClick={() => navigate(ROUTES.AUTH)}
              className="flex flex-col items-center justify-center py-2 px-1 text-gray-500 hover:text-emerald-600 transition-colors duration-200"
            >
              <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-xs font-medium">Register</span>
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
            <span className="text-xs font-medium">Help</span>
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
            className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-gray-100"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-red-400 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <LogOut className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Sign Out</h3>
              <p className="text-gray-600">Are you sure you want to sign out?</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowSignOutConfirm(false)}
                disabled={isSigningOut}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-2xl text-gray-700 hover:bg-gray-50 transition-all duration-300 font-semibold disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-2xl hover:from-red-600 hover:to-red-700 transition-all duration-300 font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSigningOut ? 'Signing Out...' : 'Sign Out'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default CategoriesPage;