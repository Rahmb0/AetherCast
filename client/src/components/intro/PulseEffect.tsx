import { useEffect } from 'react';
import { motion } from 'framer-motion';

interface PulseEffectProps {
  onComplete: () => void;
}

const PulseEffect = ({ onComplete }: PulseEffectProps) => {
  useEffect(() => {
    // Advance to next stage after 5 seconds
    const timer = setTimeout(() => {
      onComplete();
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      {/* First pulse beat */}
      <motion.div
        className="absolute w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-white/70"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ 
          scale: [0, 1.2, 0.8, 1.5, 0.9], 
          opacity: [0, 0.7, 0.4, 0.8, 0.3] 
        }}
        transition={{ 
          duration: 4, 
          times: [0, 0.2, 0.4, 0.6, 0.8] 
        }}
      />
      
      {/* Text fade in */}
      <motion.div 
        className="absolute text-base sm:text-xl md:text-2xl text-white/80 font-mono tracking-wider text-center px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1.5 }}
      >
        Before code. Before words. Before time.
      </motion.div>
    </div>
  );
};

export default PulseEffect;