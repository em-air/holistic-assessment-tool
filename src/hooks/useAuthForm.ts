import { useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { signUp, signIn } from '../supabase-client';

export interface AuthFormData {
  email: string;
  password: string;
  studentName: string;
  age: number;
  grade: string;
  parentEmail: string;
  studentEmail: string;
  confirmPassword: string;
}

const initialFormData: AuthFormData = {
  email: '',
  password: '',
  studentName: '',
  age: 6,
  grade: 'Grade 1',
  parentEmail: '',
  studentEmail: '',
  confirmPassword: '',
};

/**
 * Custom hook for authentication form logic
 * Handles form state, validation, and submission for both login and signup
 */
export function useAuthForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<AuthFormData>(initialFormData);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: name === 'age' ? parseInt(value) : value,
      }));

      // Clear error when user starts typing
      if (errors[name]) {
        setErrors((prev) => ({ ...prev, [name]: '' }));
      }
    },
    [errors]
  );

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (isLogin) {
      // Login validation
      if (!formData.email) {
        newErrors.email = 'Email is required';
      } else if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Please enter a valid email';
      }

      if (!formData.password) {
        newErrors.password = 'Password is required';
      }
    } else {
      // Signup validation
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
      } else {
        const password = formData.password;
        const passwordErrors: string[] = [];
        
        if (password.length < 8) {
          passwordErrors.push('at least 8 characters');
        }
        if (!/[0-9]/.test(password)) {
          passwordErrors.push('one number');
        }
        if (!/[!@#$%^&*(),.?":{}|<>_\-+=[\]\\;'/`~]/.test(password)) {
          passwordErrors.push('one special character');
        }
        
        if (passwordErrors.length > 0) {
          newErrors.password = `Password must contain ${passwordErrors.join(', ')}`;
        }
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [isLogin, formData]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
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
            studentEmail: formData.studentEmail || null,
          };

          result = await signUp(formData.parentEmail, formData.password, studentProfile);
        }

        if (result.error) {
          setErrors({ general: result.error.message });
          setIsLoading(false);
        } else {
          setShowSuccess(true);
          setTimeout(() => navigate(from, { replace: true }), 2500);
        }
      } catch (error) {
        setErrors({ general: 'An unexpected error occurred' });
        setIsLoading(false);
      }
    },
    [isLogin, formData, validateForm, navigate]
  );

  const toggleMode = useCallback(() => {
    setIsLogin(!isLogin);
    setFormData(initialFormData);
    setErrors({});
  }, [isLogin]);

  return {
    // State
    isLogin,
    isLoading,
    showSuccess,
    errors,
    formData,
    // Actions
    handleInputChange,
    handleSubmit,
    toggleMode,
  };
}

export default useAuthForm;
