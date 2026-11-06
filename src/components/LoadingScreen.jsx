import React from 'react';
import { motion } from 'framer-motion';
import { FaFire } from 'react-icons/fa';

const LoadingScreen = ({ message = 'INITIALIZING ARENA...' }) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95 backdrop-blur-md">
      <div className="relative flex items-center justify-center">
        {/* Outer glowing spinning ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          className="w-28 h-28 rounded-full border-2 border-dashed border-primary/40 border-t-primary border-r-secondary shadow-[0_0_30px_rgba(255,45,45,0.4)]"
        />

        {/* Inner pulsing ring */}
        <motion.div
          animate={{ scale: [0.9, 1.1, 0.9], opacity: [0.5, 0.9, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute w-20 h-20 rounded-full border border-primary/60 bg-gradient-to-tr from-primary/10 to-secondary/10 flex items-center justify-center"
        >
          <motion.div
            animate={{ scale: [1, 1.25, 1], rotate: [-5, 5, -5] }}
            transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
          >
            <FaFire className="text-primary text-4xl drop-shadow-[0_0_15px_#ff2d2d]" />
          </motion.div>
        </motion.div>
      </div>

      {/* Brand Name */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-6 text-center"
      >
        <h1 className="text-2xl font-black font-heading tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-accent drop-shadow-[0_0_12px_rgba(255,45,45,0.7)]">
          FF ESPORTS
        </h1>
        <p className="mt-2 text-xs font-mono uppercase tracking-widest text-gray-400 animate-pulse">
          {message}
        </p>
      </motion.div>
    </div>
  );
};

export default LoadingScreen;
