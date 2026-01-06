import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { LogOut, Shield } from 'lucide-react';
import FloatingBackground from '../components/FloatingBackground';
import { useAuth } from '../contexts/AuthContext';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, signOut, isAdmin } = useAuth();
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    setShowSignOutConfirm(false);
    // Force page reload to clear all state
    window.location.href = window.location.pathname;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-300 via-emerald-400 to-lime-500 relative overflow-hidden">
      {/* Animated Background Elements */}
      <FloatingBackground />

      {/* Navigation Bar */}
      <nav className="relative z-20 bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <motion.span 
                className="text-xl font-semibold text-black cursor-pointer"
                whileHover={{ 
                  scale: 1.05,
                  color: "#10b981",
                  textShadow: "0px 0px 8px rgba(16, 185, 129, 0.3)"
                }}
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
              {user ? (
                <button
                  onClick={() => setShowSignOutConfirm(true)}
                  className="bg-red-600 text-white px-6 py-2 rounded-md font-medium hover:bg-red-700 transition-colors duration-200 flex items-center gap-2"
                >
                  <LogOut size={18} />
                  Log Out
                </button>
              ) : (
                <button
                  onClick={() => navigate('/auth')}
                  className="bg-black text-white px-6 py-2 rounded-md font-medium hover:bg-gray-800 transition-colors duration-200"
                >
                  Register
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
                onClick={() => navigate('/categories')}
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
            className="bg-white/98 backdrop-blur-lg rounded-3xl shadow-2xl p-8 md:p-12 mb-8 border border-white/30"
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
                    className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg"
                    animate={{ y: [-3, 3, -3] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    style={{ willChange: 'transform' }}
                  >
                    <span className="text-white text-2xl">⭐</span>
                  </motion.div>
                  <motion.div
                    className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center shadow-lg"
                    animate={{ y: [3, -3, 3] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.2, ease: "linear" }}
                    style={{ willChange: 'transform' }}
                  >
                    <span className="text-white text-2xl">📚</span>
                  </motion.div>
                  <motion.div
                    className="w-16 h-16 bg-gradient-to-br from-pink-400 to-red-500 rounded-full flex items-center justify-center shadow-lg"
                    animate={{ y: [-3, 3, -3] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.4, ease: "linear" }}
                    style={{ willChange: 'transform' }}
                  >
                    <span className="text-white text-2xl">🧠</span>
                  </motion.div>
                </motion.div>
              </div>

              <motion.h1
                className="text-4xl md:text-6xl font-semibold bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent mb-6 drop-shadow-lg"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
                whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
              >
                Discover Your Learning Strengths
              </motion.h1>
              
              <motion.p
                className="text-lg md:text-xl text-white drop-shadow-md max-w-4xl mx-auto mb-8 font-normal"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3, ease: "easeOut" }}
                whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
              >
                Simple, engaging tools to explore your abilities in reading, memory, attention, and more. Perfect for students aged 6-12
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4, ease: "easeOut" }}
                className="flex flex-col items-center space-y-4"
              >
                <motion.button
                  onClick={() => navigate('/categories')}
                  className="group relative bg-white/20 backdrop-blur-md text-white px-8 py-4 rounded-full text-lg font-medium border border-white/40 shadow-lg hover:shadow-xl transition-all duration-300"
                  whileHover={{ 
                    scale: 1.02,
                    backgroundColor: "rgba(255,255,255,0.25)",
                    borderColor: "rgba(255,255,255,0.6)",
                    transition: { duration: 0.2 }
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="flex items-center space-x-2">
                    <span>Start Assessment</span>
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
                  Takes about 45 minutes
                </motion.p>

                {/* Admin Dashboard Button - visible to logged in users */}
                {user && (
                  <motion.button
                    onClick={() => navigate('/admin/reports')}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.6, ease: "easeOut" }}
                    className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-full text-base font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Shield size={20} />
                    <span>Admin Dashboard</span>
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
                { number: "3", label: "Categories", icon: "📊", color: "from-blue-500 to-purple-600" },
                { number: "12", label: "Skill Areas", icon: "🎯", color: "from-emerald-500 to-teal-600" },
                { number: "45", label: "Minutes", icon: "⏱️", color: "from-pink-500 to-red-600" },
                { number: "6-12", label: "Age Range", icon: "👦", color: "from-yellow-500 to-orange-600" }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  className="bg-gradient-to-br from-white/95 via-white/98 to-white/95 backdrop-blur-sm rounded-2xl p-4 md:p-6 text-center border border-white/50 shadow-lg"
                  whileHover={{ 
                    scale: 1.03,
                    background: "linear-gradient(135deg, rgba(255,255,255,0.98), rgba(255,255,255,1))",
                    borderColor: "#0891b2",
                    boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
                    transition: { duration: 0.2, ease: "easeOut" }
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <div className={`w-10 h-10 mx-auto mb-3 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-md`}>
                    <span className="text-white text-lg">{stat.icon}</span>
                  </div>
                  <motion.div
                    className={`text-2xl md:text-3xl font-medium bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-1`}
                    whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
                  >
                    {stat.number}
                  </motion.div>
                  <motion.div
                    className="text-sm md:text-base text-gray-700 drop-shadow-sm font-normal"
                    whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                  >
                    {stat.label}
                  </motion.div>
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
                  title: "Quick & Easy", 
                  desc: "Complete in 45 minutes",
                  gradient: "from-yellow-400 to-orange-500",
                  bgGradient: "from-yellow-50 to-orange-50"
                },
                { 
                  icon: "👶", 
                  title: "Kid-Friendly", 
                  desc: "Designed for ages 6-12",
                  gradient: "from-pink-400 to-purple-500",
                  bgGradient: "from-pink-50 to-purple-50"
                },
                { 
                  icon: "📊", 
                  title: "Detailed Results", 
                  desc: "Get insights into strengths",
                  gradient: "from-blue-400 to-cyan-500",
                  bgGradient: "from-blue-50 to-cyan-50"
                }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  className={`bg-gradient-to-br ${feature.bgGradient} backdrop-blur-sm rounded-2xl p-6 border border-white/60 text-center shadow-lg`}
                  whileHover={{ 
                    scale: 1.02,
                    boxShadow: "0 25px 50px rgba(0,0,0,0.15)",
                    borderColor: "#0891b2",
                    background: "linear-gradient(135deg, rgba(255,255,255,0.95), rgba(255,255,255,1))",
                    transition: { duration: 0.2, ease: "easeOut" }
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <motion.div
                    className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center shadow-lg`}
                    whileHover={{ scale: 1.05, rotate: 3, transition: { duration: 0.2 } }}
                    transition={{ duration: 0.2 }}
                  >
                    <span className="text-white text-2xl">{feature.icon}</span>
                  </motion.div>
                  <motion.h3
                    className={`text-lg font-medium bg-gradient-to-r ${feature.gradient} bg-clip-text text-transparent mb-2`}
                    whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                  >
                    {feature.title}
                  </motion.h3>
                  <motion.p
                    className="text-gray-700 drop-shadow-sm font-normal"
                    whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
                  >
                    {feature.desc}
                  </motion.p>
                </motion.div>
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
                { text: "Educator Approved", icon: "✅", gradient: "from-emerald-500 to-green-600" },
                { text: "Safe & Secure", icon: "🔒", gradient: "from-blue-500 to-cyan-600" },
                { text: "Research-Based", icon: "📚", gradient: "from-purple-500 to-pink-600" }
              ].map((badge, index) => (
                <motion.div
                  key={index}
                  className="bg-gradient-to-r from-white/95 via-white/98 to-white/95 backdrop-blur-sm px-6 py-3 rounded-full border border-white/60 shadow-lg"
                  whileHover={{ 
                    scale: 1.05,
                    background: "linear-gradient(to right, rgba(255,255,255,0.98), rgba(255,255,255,1))",
                    borderColor: "#0891b2",
                    boxShadow: "0 15px 30px rgba(0,0,0,0.12)"
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.span
                    className={`bg-gradient-to-r ${badge.gradient} bg-clip-text text-transparent font-medium text-sm md:text-base flex items-center gap-2`}
                    whileHover={{ scale: 1.02 }}
                  >
                    <span className="text-lg">{badge.icon}</span>
                    {badge.text}
                  </motion.span>
                </motion.div>
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
            onClick={() => navigate('/')}
            className="flex flex-col items-center justify-center py-2 px-1 text-emerald-600 transition-colors duration-200"
          >
            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-xs font-medium">Home</span>
          </button>

          {/* Categories Button */}
          <button
            onClick={() => navigate('/categories')}
            className="flex flex-col items-center justify-center py-2 px-1 text-gray-500 hover:text-emerald-600 transition-colors duration-200"
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
              onClick={() => navigate('/auth')}
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
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-gray-100"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
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
                className="flex-1 px-6 py-3 border border-gray-300 rounded-2xl text-gray-700 hover:bg-gray-50 transition-all duration-300 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSignOut}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-2xl hover:from-red-600 hover:to-red-700 transition-all duration-300 font-semibold shadow-lg"
              >
                Sign Out
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default HomePage;