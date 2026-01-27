import { motion } from 'framer-motion';
import { forwardRef, SelectHTMLAttributes } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    options: { value: string | number; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
    ({ label, error, options, className = '', ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        {label}
                    </label>
                )}
                <motion.select
                    ref={ref}
                    className={`
            w-full px-4 py-3 border rounded-xl 
            focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 
            transition-all duration-300 text-slate-800
            ${error ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white/50'}
            ${className}
          `}
                    whileFocus={{ scale: 1.02 }}
                    {...props}
                >
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </motion.select>
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

Select.displayName = 'Select';

export default Select;
