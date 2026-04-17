import { motion } from 'framer-motion';
import { forwardRef, InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    optional?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, optional, className = '', ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        {label}{' '}
                        {optional && (
                            <span className="text-slate-400 text-xs">(optional)</span>
                        )}
                    </label>
                )}
                <motion.input
                    ref={ref}
                    className={`
            w-full px-4 py-3 border rounded-xl 
            focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 
            transition-all duration-300 text-slate-800 placeholder-slate-400
            ${error ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white/50'}
            ${className}
          `}
                    whileFocus={{ scale: 1.02 }}
                    {...props}
                />
                {error && (
                    <motion.p
                        className="text-red-500 text-sm mt-1"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        {error}
                    </motion.p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';

export default Input;
