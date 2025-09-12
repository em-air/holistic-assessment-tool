import React from 'react';
import { motion } from 'framer-motion';

const FloatingBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Bright organic shapes with gradients - Optimized animations */}
      <motion.div
        className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-yellow-300 to-lime-400 rounded-full opacity-40"
        animate={{ scale: [1, 1.1, 1], rotateZ: [0, 180, 360] }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        style={{ willChange: 'transform' }}
      />
      <motion.div
        className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-br from-pink-300 to-rose-400 rounded-full opacity-35"
        animate={{ scale: [1.1, 1, 1.1], rotateZ: [360, 180, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        style={{ willChange: 'transform' }}
      />
      <motion.div
        className="absolute top-1/3 right-1/4 w-64 h-64 bg-gradient-to-br from-blue-300 to-cyan-400 rounded-full opacity-30"
        animate={{ scale: [1, 1.2, 1], x: [0, 30, 0], y: [0, -20, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        style={{ willChange: 'transform' }}
      />
      <motion.div
        className="absolute top-1/2 left-1/3 w-48 h-48 bg-gradient-to-br from-purple-300 to-indigo-400 rounded-full opacity-25"
        animate={{ scale: [1.05, 0.95, 1.05], rotateZ: [0, 180, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
        style={{ willChange: 'transform' }}
      />

      {/* Educational SVG Graphics - Optimized animations */}
      <motion.div
        className="absolute top-20 left-20 text-white opacity-30"
        animate={{ y: [-5, 5, -5], rotateZ: [0, 3, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
        style={{ willChange: 'transform' }}
      >
        <svg width="80" height="80" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
        </svg>
      </motion.div>
      
      <motion.div
        className="absolute top-32 right-32 text-white opacity-25"
        animate={{ y: [5, -5, 5], rotateZ: [0, -3, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
        style={{ willChange: 'transform' }}
      >
        <svg width="70" height="70" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3z"/>
          <path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/>
        </svg>
      </motion.div>
      
      <motion.div
        className="absolute bottom-40 left-32 text-white opacity-30"
        animate={{ y: [-4, 4, -4], rotateZ: [0, 2, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        style={{ willChange: 'transform' }}
      >
        <svg width="75" height="75" viewBox="0 0 24 24" fill="currentColor">
          <path d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z"/>
        </svg>
      </motion.div>
      
      <motion.div
        className="absolute bottom-20 right-20 text-white opacity-25"
        animate={{ y: [4, -4, 4], rotateZ: [0, -2, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
        style={{ willChange: 'transform' }}
      >
        <svg width="85" height="85" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12,2A3,3 0 0,1 15,5V11A3,3 0 0,1 12,14A3,3 0 0,1 9,11V5A3,3 0 0,1 12,2M19,11C19,14.53 16.39,17.44 13,17.93V21H11V17.93C7.61,17.44 5,14.53 5,11H7A5,5 0 0,0 12,16A5,5 0 0,0 17,11H19Z"/>
        </svg>
      </motion.div>

      {/* Decorative geometric shapes */}
      <motion.div
        className="absolute top-1/4 left-10 text-white opacity-20"
        animate={{ rotateZ: [0, 5, -5, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        style={{ willChange: 'transform' }}
      >
        <svg width="90" height="90" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12,2L2,7L12,12L22,7L12,2M2,17L12,22L22,17L12,12L2,17Z"/>
        </svg>
      </motion.div>
      
      <motion.div
        className="absolute bottom-1/3 right-16 text-white opacity-25"
        animate={{ rotateZ: [0, -8, 8, 0], scale: [1, 1.05, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        style={{ willChange: 'transform' }}
      >
        <svg width="100" height="100" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8Z"/>
        </svg>
      </motion.div>
    </div>
  );
};

export default FloatingBackground;
