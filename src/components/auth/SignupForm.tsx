import { motion, AnimatePresence } from 'framer-motion';
import { Input, PasswordInput, Select } from '../common';

const gradeOptions = [
    { value: 'Grade 1', label: 'Grade 1' },
    { value: 'Grade 2', label: 'Grade 2' },
    { value: 'Grade 3', label: 'Grade 3' },
    { value: 'Grade 4', label: 'Grade 4' },
    { value: 'Grade 5', label: 'Grade 5' },
    { value: 'Grade 6', label: 'Grade 6' },
    { value: 'Grade 7', label: 'Grade 7' },
    { value: 'Grade 8', label: 'Grade 8' },
];

const ageOptions = [5, 6, 7, 8, 9, 10, 11, 12].map((age) => ({
    value: age,
    label: age.toString(),
}));

interface SignupFormData {
    studentName: string;
    age: number;
    grade: string;
    parentEmail: string;
    studentEmail: string;
    password: string;
    confirmPassword: string;
}

interface SignupFormProps {
    formData: SignupFormData;
    errors: Record<string, string>;
    isLoading: boolean;
    onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    onSubmit: (e: React.FormEvent) => void;
}

/**
 * Signup form component with student registration fields
 */
export const SignupForm = ({
    formData,
    errors,
    isLoading,
    onInputChange,
    onSubmit,
}: SignupFormProps) => {
    return (
        <motion.form
            onSubmit={onSubmit}
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="space-y-6"
        >
            {/* Student Name */}
            <Input
                type="text"
                name="studentName"
                label="Student Name"
                placeholder="Enter student's full name"
                value={formData.studentName}
                onChange={onInputChange}
                error={errors.studentName}
            />

            {/* Age and Grade Row */}
            <div className="grid grid-cols-2 gap-4">
                <Select
                    name="age"
                    label="Age"
                    value={formData.age}
                    onChange={onInputChange}
                    options={ageOptions}
                    error={errors.age}
                />
                <Select
                    name="grade"
                    label="Grade"
                    value={formData.grade}
                    onChange={onInputChange}
                    options={gradeOptions}
                />
            </div>

            {/* Parent Email */}
            <Input
                type="email"
                name="parentEmail"
                label="Parent's Email"
                placeholder="Enter parent's email"
                value={formData.parentEmail}
                onChange={onInputChange}
                error={errors.parentEmail}
            />

            {/* Student Email (Optional) */}
            <Input
                type="email"
                name="studentEmail"
                label="Student's Email"
                placeholder="Enter student's email (optional)"
                value={formData.studentEmail}
                onChange={onInputChange}
                error={errors.studentEmail}
                optional
            />

            {/* Password */}
            <PasswordInput
                name="password"
                label="Password"
                placeholder="Enter password"
                value={formData.password}
                onChange={onInputChange}
                error={errors.password}
            />

            {/* Confirm Password */}
            <Input
                type="password"
                name="confirmPassword"
                label="Confirm Password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={onInputChange}
                error={errors.confirmPassword}
            />

            {/* General error */}
            <AnimatePresence>
                {errors.general && (
                    <motion.div
                        className="bg-red-50 border border-red-200 rounded-xl p-3"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                    >
                        <p className="text-red-600 text-sm">{errors.general}</p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Submit button */}
            <motion.button
                type="submit"
                disabled={isLoading}
                className="w-full px-8 py-4 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                whileTap={!isLoading ? { scale: 0.98 } : {}}
            >
                <div className="relative flex items-center justify-center space-x-2">
                    {isLoading ? (
                        <>
                            <motion.div
                                className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            />
                            <span>Processing...</span>
                        </>
                    ) : (
                        <>
                            <span>Create Account</span>
                            <svg
                                className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={2}
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </>
                    )}
                </div>
            </motion.button>
        </motion.form>
    );
};

export default SignupForm;
