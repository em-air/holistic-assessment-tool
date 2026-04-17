import { motion } from 'framer-motion';
import { forwardRef, ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
}

const variantStyles = {
    primary: 'bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-700 hover:to-purple-700 shadow-lg hover:shadow-xl hover:shadow-violet-500/25',
    secondary: 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 shadow-sm',
    danger: 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-lg',
    ghost: 'text-slate-600 hover:text-slate-800 hover:bg-white/50',
};

const sizeStyles = {
    sm: 'px-4 py-2 text-sm rounded-lg',
    md: 'px-6 py-3 text-base rounded-xl',
    lg: 'px-8 py-4 text-lg rounded-xl',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            variant = 'primary',
            size = 'md',
            isLoading = false,
            leftIcon,
            rightIcon,
            children,
            disabled,
            className = '',
            ...props
        },
        ref
    ) => {
        return (
            <motion.button
                ref={ref}
                disabled={disabled || isLoading}
                className={`
          relative font-medium transition-all duration-300 ease-out
          disabled:opacity-70 disabled:cursor-not-allowed
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${className}
        `}
                whileHover={!disabled && !isLoading ? { scale: 1.02 } : {}}
                whileTap={!disabled && !isLoading ? { scale: 0.98 } : {}}
                {...props}
            >
                <span className="flex items-center justify-center gap-2">
                    {isLoading ? (
                        <>
                            <motion.div
                                className="w-5 h-5 border-2 border-current/30 border-t-current rounded-full"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            />
                            <span>Loading...</span>
                        </>
                    ) : (
                        <>
                            {leftIcon}
                            {children}
                            {rightIcon}
                        </>
                    )}
                </span>
            </motion.button>
        );
    }
);

Button.displayName = 'Button';

export default Button;
