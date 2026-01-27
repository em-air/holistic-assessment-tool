interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    message?: string;
    fullScreen?: boolean;
}

/**
 * LoadingSpinner Component
 * 
 * A reusable loading spinner with optional message.
 * Used for Suspense fallbacks and async loading states.
 */
const LoadingSpinner = ({
    size = 'md',
    message = 'Loading...',
    fullScreen = true
}: LoadingSpinnerProps) => {
    const sizeClasses = {
        sm: 'w-8 h-8 border-2',
        md: 'w-12 h-12 border-4',
        lg: 'w-16 h-16 border-4',
    };

    const spinner = (
        <div className="flex flex-col items-center gap-4">
            <div
                className={`${sizeClasses[size]} border-purple-500 border-t-transparent rounded-full animate-spin`}
            />
            {message && (
                <p className="text-gray-600 text-lg font-medium">{message}</p>
            )}
        </div>
    );

    if (fullScreen) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
                {spinner}
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center p-8">
            {spinner}
        </div>
    );
};

export default LoadingSpinner;
