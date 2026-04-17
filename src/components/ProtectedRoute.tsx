import React, { ReactNode } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
    children: ReactNode;
    allowedRoles: ('admin' | 'teacher' | 'student')[];
}

/**
 * ProtectedRoute Component
 * 
 * Wraps routes that require authentication or specific roles.
 * - Redirects unauthenticated users to /auth
 * - Shows "Access Denied" message for users without the required role
 * - Supports multiple allowed roles (e.g., ['admin'] or ['admin', 'teacher'])
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
    const { user, profile, loading } = useAuth();

    // Show loading spinner while checking auth state
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-600 text-lg">Loading...</p>
                </div>
            </div>
        );
    }

    // Redirect to auth page if not logged in
    if (!user) {
        return <Navigate to="/auth" replace />;
    }

    // Get user role (default to 'student' if no role set)
    const userRole = profile?.role || 'student';

    // Check if user has one of the allowed roles
    if (!allowedRoles.includes(userRole)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
                    <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
                        <svg
                            className="w-10 h-10 text-red-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800 mb-3">Access Denied</h1>
                    <p className="text-gray-600 mb-6">
                        You don't have permission to access this page. This area is restricted to{' '}
                        {allowedRoles.length === 1
                            ? `${allowedRoles[0]}s`
                            : allowedRoles.map(r => `${r}s`).join(' and ')
                        } only.
                    </p>
                    <Link
                        to="/"
                        className="inline-block px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                        Return to Home
                    </Link>
                </div>
            </div>
        );
    }

    // User is authenticated and has the required role, render children
    return <>{children}</>;
};

export default ProtectedRoute;
