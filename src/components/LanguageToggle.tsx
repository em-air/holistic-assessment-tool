import React from 'react';
import { motion } from 'framer-motion';

interface LanguageToggleProps {
  language: 'en' | 'ar';
  onLanguageChange: (language: 'en' | 'ar') => void;
}

const LanguageToggle: React.FC<LanguageToggleProps> = ({
  language,
  onLanguageChange
}) => {
  return (
    <div className="flex items-center space-x-4">
      <span className="text-sm font-medium text-gray-600">Language:</span>
      
      <div className="relative bg-gray-200 rounded-full p-1 flex items-center">
        {/* Background Slider */}
        <motion.div
          className="absolute bg-white rounded-full shadow-md"
          layout
          transition={{
            type: "spring",
            stiffness: 700,
            damping: 30
          }}
          style={{
            width: '50%',
            height: '80%',
            left: language === 'en' ? '4%' : '46%',
            top: '10%'
          }}
        />
        
        {/* English Button */}
        <button
          onClick={() => onLanguageChange('en')}
          className={`
            relative z-10 px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200
            ${language === 'en' 
              ? 'text-blue-600' 
              : 'text-gray-600 hover:text-gray-800'
            }
          `}
        >
          <span className="flex items-center space-x-2">
            <span>🇺🇸</span>
            <span>English</span>
          </span>
        </button>
        
        {/* Arabic Button */}
        <button
          onClick={() => onLanguageChange('ar')}
          className={`
            relative z-10 px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200
            ${language === 'ar' 
              ? 'text-blue-600' 
              : 'text-gray-600 hover:text-gray-800'
            }
          `}
        >
          <span className="flex items-center space-x-2">
            <span>🇸🇦</span>
            <span>العربية</span>
          </span>
        </button>
      </div>
      
      {/* Language Info */}
      <div className="text-xs text-gray-500">
        {language === 'ar' ? (
          <div className="text-right">
            <div>Arabic translation</div>
            <div>in development</div>
          </div>
        ) : (
          <div>
            <div>Full content</div>
            <div>available</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LanguageToggle;