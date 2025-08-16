import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { signUp, signIn } from '../supabase-client';
import FloatingBackground from '../components/FloatingBackground';

interface FormData {
  email: string;
  password: string;
  studentName: string;
  age: number;
  grade: string;
  parentEmail: string;
  studentEmail: string;
  confirmPassword: string;
}

const gradeOptions = [
  'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4',
  'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8'
];

const ageOptions = [5, 6, 7, 8, 9, 10, 11, 12];

const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    studentName: '',
    age: 6,
    grade: 'Grade 1',
    parentEmail: '',
    studentEmail: '',
    confirmPassword: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'age' ? parseInt(value) : value
    }));

    // clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (isLogin) {
      // login validation
      if (!formData.email) {
        newErrors.email = 'Email is required';
      } else if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Please enter a valid email';
      }

      if (!formData.password) {
        newErrors.password = 'Password is required';
      }
    } else {
      // signup validation
      if (!formData.studentName.trim()) {
        newErrors.studentName = 'Student name is required';
      }

      if (formData.age < 5 || formData.age > 12) {
        newErrors.age = 'Age must be between 5 and 12';
      }

      if (!formData.parentEmail) {
        newErrors.parentEmail = 'Parent email is required';
      } else if (!emailRegex.test(formData.parentEmail)) {
        newErrors.parentEmail = 'Please enter a valid parent email';
      }

      if (formData.studentEmail && !emailRegex.test(formData.studentEmail)) {
        newErrors.studentEmail = 'Please enter a valid student email';
      }

      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      let result;
      if (isLogin) {
        result = await signIn(formData.email, formData.password);
      } else {
        const studentProfile = {
          studentName: formData.studentName,
          age: formData.age,
          grade: formData.grade,
          parentEmail: formData.parentEmail,
          studentEmail: formData.studentEmail || null
        };

        result = await signUp(formData.parentEmail, formData.password, studentProfile);
      }

      if (result.error) {
        setErrors({ general: result.error.message });
        setIsLoading(false);
      } else {
        setShowSuccess(true);
        setTimeout(() => navigate('/'), 2500);
      }
    } catch (error) {
      setErrors({ general: 'An unexpected error occurred' });
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({
      email: '',
      password: '',
      studentName: '',
      age: 6,
      grade: 'Grade 1',
      parentEmail: '',
      studentEmail: '',
      confirmPassword: ''
    });
    setErrors({});
  };

  const SuccessAnimation = () => (
    <motion.div
      className="fixed inset-0 bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-100 z-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* floating celebration elements */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-4 h-4 bg-gradient-to-r from-violet-400 to-purple-400 rounded-full"
          initial={{ x: 0, y: 0, scale: 0, opacity: 0 }}
          animate={{
            x: Math.cos(i * 30 * Math.PI / 180) * 200,
            y: Math.sin(i * 30 * Math.PI / 180) * 200,
            scale: [0, 1, 0],
            opacity: [0, 1, 0]
          }}
          transition={{ duration: 2, delay: 0.5, ease: "easeOut" }}
        />
      ))}

      <div className="text-center space-y-6">
        {/* success icon */}
        <motion.div
          className="mx-auto w-24 h-24 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full flex items-center justify-center shadow-xl"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: [0, 1.2, 1], rotate: [-180, 0, 0] }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.svg
            className="w-12 h-12 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <motion.path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
            />
          </motion.svg>
        </motion.div>

        {/* success message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-3xl font-bold text-slate-800 mb-3">
            {isLogin ? 'Welcome Back!' : 'Account Created!'}
          </h2>
          <p className="text-lg text-slate-600 max-w-md mx-auto">
            {isLogin
              ? `Welcome back! Let's continue your learning journey! 🎉`
              : `Welcome ${formData.studentName}! Your learning adventure begins now! 🚀`
            }
          </p>
        </motion.div>

        {/* loading indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="flex items-center justify-center space-x-2"
        >
          {[0, 0.2, 0.4].map((delay, index) => (
            <motion.div
              key={index}
              className={`w-2 h-2 ${index === 0 ? 'bg-violet-500' : index === 1 ? 'bg-purple-500' : 'bg-indigo-500'} rounded-full`}
              animate={{ scale: [1, 1.5, 1] }}
              transition={{ duration: 0.8, repeat: Infinity, delay }}
            />
          ))}
          <span className="ml-3 text-slate-600 font-medium">Taking you to your dashboard...</span>
        </motion.div>
      </div>
    </motion.div>
  );

  const InputField = ({ type = 'text', name, label, placeholder, required = true, optional = false }: {
    type?: string;
    name: keyof FormData;
    label: string;
    placeholder: string;
    required?: boolean;
    optional?: boolean;
  }) => (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-2">
        {label} {optional && <span className="text-slate-400 text-xs">(optional)</span>}
      </label>
      <motion.input
        type={type}
        name={name}
        value={formData[name]}
        onChange={handleInputChange}
        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all duration-300 text-slate-800 placeholder-slate-400 ${
          errors[name] ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white/50'
        }`}
        placeholder={placeholder}
        whileFocus={{ scale: 1.02 }}
      />
      {errors[name] && (
        <motion.p
          className="text-red-500 text-sm mt-1"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {errors[name]}
        </motion.p>
      )}
    </div>
  );

  const PasswordField = ({ name, label, placeholder }: {
    name: keyof FormData;
    label: string;
    placeholder: string;
  }) => (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-2">{label}</label>
      <div className="relative">
        <motion.input
          type={showPassword ? "text" : "password"}
          name={name}
          value={formData[name]}
          onChange={handleInputChange}
          className={`w-full px-4 py-3 pr-12 border rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all duration-300 text-slate-800 placeholder-slate-400 ${
            errors[name] ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white/50'
          }`}
          placeholder={placeholder}
          whileFocus={{ scale: 1.02 }}
        />
        <motion.button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={showPassword ? "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464M14.12 14.12l1.415 1.415M14.12 14.12L9.878 9.878m4.242 4.242L16.535 16.535" : "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"} />
          </svg>
        </motion.button>
      </div>
      {errors[name] && (
        <motion.p
          className="text-red-500 text-sm mt-1"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {errors[name]}
        </motion.p>
      )}
    </div>
  );

  return (
    <>
      <AnimatePresence>
        {showSuccess && <SuccessAnimation />}
      </AnimatePresence>

      <motion.div
        className="min-h-screen bg-gradient-to-br from-green-300 via-emerald-400 to-lime-500 relative overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        {/* animated background elements */}
        <FloatingBackground />

        {/* back button */}
        <div className="absolute top-6 left-6 z-50">
          <motion.button
            onClick={() => navigate('/')}
            className="group flex items-center space-x-2 px-4 py-2 text-slate-700 rounded-lg transition-all duration-300 ease-out hover:text-slate-800 hover:bg-white/50 hover:shadow-md transform hover:scale-105 hover:-translate-y-0.5 backdrop-blur-sm border border-violet-200/30"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-medium">Back</span>
          </motion.button>
        </div>

        {/* main content */}
        <div className="flex items-center justify-center min-h-screen px-4 py-8 relative z-10">
          <motion.div className="w-full max-w-md" layout>
            {/* header */}
            <motion.div
              className="text-center mb-8"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <motion.div
                className="flex justify-center mb-4"
                whileHover={{ scale: 1.1, rotate: 12 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <div className="w-12 h-12 bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <div className="w-6 h-6 bg-white rounded"></div>
                </div>
              </motion.div>
              <h1 className="text-3xl font-bold text-slate-800 mb-2">
                Welcome to Holistic Assessment
              </h1>
              <p className="text-slate-600">
                {isLogin ? 'Sign in to continue your learning journey' : 'Create your student account to get started'}
              </p>
            </motion.div>

            {/* form container */}
            <motion.div
              className="bg-white/70 backdrop-blur-md rounded-2xl p-8 shadow-xl border border-violet-200/40"
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              {/* toggle buttons */}
              <div className="flex mb-8 bg-violet-100/50 rounded-xl p-1">
                <motion.button
                  onClick={() => !isLogin && toggleMode()}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-300 ${
                    isLogin
                      ? 'bg-white text-violet-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-800'
                  }`}
                  whileHover={!isLogin ? { scale: 1.02 } : {}}
                  whileTap={{ scale: 0.98 }}
                >
                  Sign In
                </motion.button>
                <motion.button
                  onClick={() => isLogin && toggleMode()}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-300 ${
                    !isLogin
                      ? 'bg-white text-violet-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-800'
                  }`}
                  whileHover={isLogin ? { scale: 1.02 } : {}}
                  whileTap={{ scale: 0.98 }}
                >
                  Sign Up
                </motion.button>
              </div>

              {/* form */}
              <AnimatePresence mode="wait">
                <motion.form
                  key={isLogin ? 'login' : 'signup'}
                  onSubmit={handleSubmit}
                  initial={{ x: isLogin ? -300 : 300, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: isLogin ? 300 : -300, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="space-y-6"
                >
                  {isLogin ? (
                    // LOGIN FORM
                    <>
                      {/* Email */}
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Email Address
                        </label>
                        <motion.input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all duration-300 text-slate-800 placeholder-slate-400 ${
                            errors.email ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white/50'
                          }`}
                          placeholder="Enter your email"
                          whileFocus={{ scale: 1.02 }}
                        />
                        {errors.email && (
                          <motion.p
                            className="text-red-500 text-sm mt-1"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                          >
                            {errors.email}
                          </motion.p>
                        )}
                      </div>

                      {/* Password */}
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Password
                        </label>
                        <div className="relative">
                          <motion.input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-3 pr-12 border rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all duration-300 text-slate-800 placeholder-slate-400 ${
                              errors.password ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white/50'
                            }`}
                            placeholder="Enter your password"
                            whileFocus={{ scale: 1.02 }}
                          />
                          <motion.button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            {showPassword ? (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464M14.12 14.12l1.415 1.415M14.12 14.12L9.878 9.878m4.242 4.242L16.535 16.535" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            )}
                          </motion.button>
                        </div>
                        {errors.password && (
                          <motion.p
                            className="text-red-500 text-sm mt-1"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                          >
                            {errors.password}
                          </motion.p>
                        )}
                      </div>
                    </>
                  ) : (
                    // SIGNUP FORM
                    <>
                      {/* Student Name */}
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Student Name
                        </label>
                        <motion.input
                          type="text"
                          name="studentName"
                          value={formData.studentName}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all duration-300 text-slate-800 placeholder-slate-400 ${
                            errors.studentName ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white/50'
                          }`}
                          placeholder="Enter student's full name"
                          whileFocus={{ scale: 1.02 }}
                        />
                        {errors.studentName && (
                          <motion.p
                            className="text-red-500 text-sm mt-1"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                          >
                            {errors.studentName}
                          </motion.p>
                        )}
                      </div>

                      {/* Age and Grade Row */}
                      <div className="grid grid-cols-2 gap-4">
                        {/* Age */}
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Age
                          </label>
                          <motion.select
                            name="age"
                            value={formData.age}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all duration-300 text-slate-800 ${
                              errors.age ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white/50'
                            }`}
                            whileFocus={{ scale: 1.02 }}
                          >
                            {ageOptions.map(age => (
                              <option key={age} value={age}>{age}</option>
                            ))}
                          </motion.select>
                          {errors.age && (
                            <motion.p
                              className="text-red-500 text-sm mt-1"
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                            >
                              {errors.age}
                            </motion.p>
                          )}
                        </div>

                        {/* Grade */}
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Grade
                          </label>
                          <motion.select
                            name="grade"
                            value={formData.grade}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-slate-200 bg-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all duration-300 text-slate-800"
                            whileFocus={{ scale: 1.02 }}
                          >
                            {gradeOptions.map(grade => (
                              <option key={grade} value={grade}>{grade}</option>
                            ))}
                          </motion.select>
                        </div>
                      </div>

                      {/* Parent Email */}
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Parent's Email
                        </label>
                        <motion.input
                          type="email"
                          name="parentEmail"
                          value={formData.parentEmail}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all duration-300 text-slate-800 placeholder-slate-400 ${
                            errors.parentEmail ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white/50'
                          }`}
                          placeholder="Enter parent's email"
                          whileFocus={{ scale: 1.02 }}
                        />
                        {errors.parentEmail && (
                          <motion.p
                            className="text-red-500 text-sm mt-1"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                          >
                            {errors.parentEmail}
                          </motion.p>
                        )}
                      </div>

                      {/* Student Email (Optional) */}
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Student's Email <span className="text-slate-400 text-xs">(optional)</span>
                        </label>
                        <motion.input
                          type="email"
                          name="studentEmail"
                          value={formData.studentEmail}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all duration-300 text-slate-800 placeholder-slate-400 ${
                            errors.studentEmail ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white/50'
                          }`}
                          placeholder="Enter student's email (optional)"
                          whileFocus={{ scale: 1.02 }}
                        />
                        {errors.studentEmail && (
                          <motion.p
                            className="text-red-500 text-sm mt-1"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                          >
                            {errors.studentEmail}
                          </motion.p>
                        )}
                      </div>

                      {/* Password */}
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Password
                        </label>
                        <div className="relative">
                          <motion.input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-3 pr-12 border rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all duration-300 text-slate-800 placeholder-slate-400 ${
                              errors.password ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white/50'
                            }`}
                            placeholder="Enter password"
                            whileFocus={{ scale: 1.02 }}
                          />
                          <motion.button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            {showPassword ? (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464M14.12 14.12l1.415 1.415M14.12 14.12L9.878 9.878m4.242 4.242L16.535 16.535" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            )}
                          </motion.button>
                        </div>
                        {errors.password && (
                          <motion.p
                            className="text-red-500 text-sm mt-1"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                          >
                            {errors.password}
                          </motion.p>
                        )}
                      </div>

                      {/* Confirm Password */}
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Confirm Password
                        </label>
                        <motion.input
                          type="password"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all duration-300 text-slate-800 placeholder-slate-400 ${
                            errors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white/50'
                          }`}
                          placeholder="Confirm your password"
                          whileFocus={{ scale: 1.02 }}
                        />
                        {errors.confirmPassword && (
                          <motion.p
                            className="text-red-500 text-sm mt-1"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                          >
                            {errors.confirmPassword}
                          </motion.p>
                        )}
                      </div>
                    </>
                  )}

                  {/* General error */}
                  {errors.general && (
                    <motion.div
                      className="bg-red-50 border border-red-200 rounded-xl p-3"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <p className="text-red-600 text-sm">{errors.general}</p>
                    </motion.div>
                  )}

                  {/* Submit button */}
                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    className="group relative w-full px-8 py-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-medium shadow-lg overflow-hidden transition-all duration-300 ease-out hover:shadow-xl hover:shadow-violet-500/25 transform hover:scale-105 hover:-translate-y-1 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                    whileHover={!isLoading ? { scale: 1.02 } : {}}
                    whileTap={!isLoading ? { scale: 0.98 } : {}}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-violet-700 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative flex items-center justify-center space-x-2">
                      {isLoading ? (
                        <>
                          <motion.div
                            className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          />
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                          <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </>
                      )}
                    </div>
                  </motion.button>
                </motion.form>
              </AnimatePresence>

              {/* footer */}
              <motion.div
                className="mt-6 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <p className="text-sm text-slate-600">
                  {isLogin ? "Don't have an account? " : "Already have an account? "}
                  <motion.button
                    onClick={toggleMode}
                    className="text-violet-600 hover:text-violet-700 font-medium transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {isLogin ? 'Sign up' : 'Sign in'}
                  </motion.button>
                </p>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </>
  );
};

export default AuthPage;