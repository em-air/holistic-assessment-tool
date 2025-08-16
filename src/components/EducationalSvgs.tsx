import React from 'react';
import { motion } from 'framer-motion';

export const EducationalSvgs: React.FC = () => {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none select-none overflow-hidden">
      {/* Animated Books SVG - Top Right */}
      <motion.svg 
        className="absolute top-16 right-8 w-24 h-24 opacity-20 text-purple-300 hidden sm:block" 
        viewBox="0 0 100 100" 
        fill="currentColor"
        animate={{ y: [-5, 5, -5] }}
        transition={{ duration: 4, repeat: Infinity }}
      >
        <path d="M20,20 L20,80 L45,70 L45,10 Z" />
        <path d="M50,10 L50,70 L75,80 L75,20 Z" />
        <path d="M15,80 L85,80 L85,85 L15,85 Z" />
      </motion.svg>

      {/* Animated Pencil SVG - Bottom Left */}
      <motion.svg 
        className="absolute bottom-48 left-8 w-16 h-16 opacity-25 hidden sm:block" 
        viewBox="0 0 100 100" 
        fill="none" 
        stroke="#f97316" 
        strokeWidth="3"
        animate={{ rotate: [-5, 5, -5] }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        <path d="M30,80 L70,20 L80,30 L40,90 Z" />
        <path d="M30,80 L20,90 L10,80 L20,70 Z" />
        <path d="M75,25 L85,35" />
      </motion.svg>

      {/* Animated Graduation Cap - Top Left */}
      <motion.svg 
        className="absolute top-32 left-8 w-24 h-24 opacity-20 hidden sm:block" 
        viewBox="0 0 100 100" 
        fill="none" 
        stroke="#8b5cf6" 
        strokeWidth="3"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 5, repeat: Infinity }}
      >
        <path d="M10,40 L50,20 L90,40 L50,60 Z" />
        <path d="M30,50 L30,70 L50,80 L70,70 L70,50" />
        <path d="M50,60 L50,80" />
        <path d="M90,40 L90,60" />
        <circle cx="90" cy="65" r="5" />
      </motion.svg>

      {/* Animated Globe/World - Mobile Responsive */}
      <motion.div 
        className="absolute bottom-24 right-4 w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 opacity-15 md:opacity-20 md:bottom-16 md:right-16"
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle cx="50" cy="50" r="45" fill="none" stroke="#ec4899" strokeWidth="2" />
          <path d="M10 50 Q30 30 50 50 Q70 70 90 50" stroke="#ec4899" strokeWidth="2" fill="none" />
          <path d="M50 5 Q30 25 50 50 Q70 25 50 5" stroke="#ec4899" strokeWidth="2" fill="none" />
          <line x1="50" y1="5" x2="50" y2="95" stroke="#ec4899" strokeWidth="2" />
          <line x1="5" y1="50" x2="95" y2="50" stroke="#ec4899" strokeWidth="2" />
        </svg>
      </motion.div>

      {/* Animated Lightbulb (Idea) - Bottom Right for larger screens */}
      <motion.svg 
        className="absolute bottom-16 right-16 w-20 h-20 opacity-25 hidden md:block" 
        viewBox="0 0 100 100" 
        fill="none" 
        stroke="#fbbf24" 
        strokeWidth="3"
        animate={{ opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <path d="M50,10 C30,10 20,30 20,45 C20,60 35,65 40,70 L40,80 L60,80 L60,70 C65,65 80,60 80,45 C80,30 70,10 50,10 Z" />
        <path d="M40,85 L60,85" />
        <path d="M45,90 L55,90" />
      </motion.svg>

      {/* New Elements - Calculator */}
      <motion.svg 
        className="absolute top-60 right-20 w-16 h-16 opacity-20 hidden lg:block" 
        viewBox="0 0 100 100" 
        fill="#10b981" 
        animate={{ x: [-3, 3, -3] }}
        transition={{ duration: 6, repeat: Infinity }}
      >
        <rect x="20" y="10" width="60" height="80" rx="5" />
        <rect x="25" y="20" width="50" height="15" fill="white" />
        <circle cx="35" cy="50" r="5" fill="white" />
        <circle cx="50" cy="50" r="5" fill="white" />
        <circle cx="65" cy="50" r="5" fill="white" />
        <circle cx="35" cy="65" r="5" fill="white" />
        <circle cx="50" cy="65" r="5" fill="white" />
        <circle cx="65" cy="65" r="5" fill="white" />
      </motion.svg>

      {/* New Elements - Art Palette */}
      <motion.svg 
        className="absolute bottom-60 left-40 w-18 h-18 opacity-20 hidden lg:block" 
        viewBox="0 0 100 100" 
        fill="#f59e0b"
        animate={{ rotate: [-10, 10, -10] }}
        transition={{ duration: 4, repeat: Infinity }}
      >
        <path d="M20,60 Q10,40 20,20 Q40,10 60,20 Q80,30 85,50 Q90,70 70,80 Q50,85 30,75 L20,60 Z" />
        <circle cx="35" cy="35" r="4" fill="#ef4444" />
        <circle cx="50" cy="30" r="4" fill="#3b82f6" />
        <circle cx="65" cy="40" r="4" fill="#22c55e" />
        <circle cx="40" cy="55" r="4" fill="#8b5cf6" />
        <circle cx="60" cy="60" r="4" fill="#f97316" />
      </motion.svg>
    </div>
  );
};

export default EducationalSvgs;
