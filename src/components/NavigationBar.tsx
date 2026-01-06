import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, BookOpen, User, LogOut, LogIn } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const NavigationBar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut: authSignOut } = useAuth();
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);

  const handleSignOut = async () => {
    try {
      await authSignOut();
      setShowSignOutConfirm(false);
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const NavButton = ({ icon: Icon, label, onClick, isActiveBtn = false }: {
    icon: any;
    label: string;
    onClick: () => void;
    isActiveBtn?: boolean;
  }) => (
    <motion.button
      onClick={onClick}
      className={`flex flex-col items-center justify-center py-3 px-4 rounded-2xl transition-all duration-300 group relative ${
        isActiveBtn 
          ? 'text-primary-600 bg-primary-50' 
          : 'text-gray-500 hover:text-primary-600 hover:bg-primary-50'
      }`}
      whileTap={{ scale: 0.95 }}
      whileHover={{ y: -2 }}
    >
      {isActiveBtn && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl opacity-10"
          layoutId="activeBackground"
        />
      )}
      <Icon size={22} className={`mb-1 transition-all duration-300 ${isActiveBtn ? 'scale-110' : 'group-hover:scale-110'}`} />
      <span className="text-xs font-semibold">{label}</span>
    </motion.button>
  );

  // Sign Out Confirmation Modal
  const SignOutModal = () => (
    <motion.div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
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
          <p className="text-gray-600">Are you sure you want to sign out of your account?</p>
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
  );

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden">
        <div className="bg-white/90 backdrop-blur-lg border-t border-gray-200/50 px-6 py-4">
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-6 bg-white rounded-3xl px-6 py-2 shadow-lg border border-gray-100">
              <NavButton
                icon={Home}
                label="Home"
                onClick={() => navigate('/')}
                isActiveBtn={isActive('/')}
              />
              <NavButton
                icon={BookOpen}
                label="Courses"
                onClick={() => navigate('/categories')}
                isActiveBtn={isActive('/categories') || isActive('/category') || isActive('/quiz')}
              />
              {user ? (
                <NavButton
                  icon={LogOut}
                  label="Log Out"
                  onClick={() => setShowSignOutConfirm(true)}
                />
              ) : (
                <NavButton
                  icon={LogIn}
                  label="Register"
                  onClick={() => navigate('/auth')}
                  isActiveBtn={isActive('/auth')}
                />
              )}
              <NavButton
                icon={User}
                label="Profile"
                onClick={() => {
                  if (user) {
                    navigate('/profile');
                  } else {
                    navigate('/auth');
                  }
                }}
                isActiveBtn={isActive('/profile')}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Sign Out Confirmation Modal */}
      {showSignOutConfirm && <SignOutModal />}
    </>
  );
};

export default NavigationBar;
