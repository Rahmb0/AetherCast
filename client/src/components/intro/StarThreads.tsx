import { useEffect } from 'react';
import { motion } from 'framer-motion';

interface StarThreadsProps {
  onComplete: () => void;
}

const StarThreads = ({ onComplete }: StarThreadsProps) => {
  useEffect(() => {
    // Advance to next stage after 5 seconds
    const timer = setTimeout(() => {
      onComplete();
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [onComplete]);

  // Generate random star points
  const starPoints = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: 50 + (Math.random() - 0.5) * 70, // centered around 50% with spread
    y: 50 + (Math.random() - 0.5) * 70, // centered around 50% with spread
    delay: Math.random() * 0.8,
    size: Math.random() * 2 + 1,
  }));

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      {/* Center pulse */}
      <motion.div
        className="absolute w-4 sm:w-5 md:w-6 h-4 sm:h-5 md:h-6 rounded-full bg-white/60 z-10"
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.6, 0.8, 0.6],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      />
      
      {/* Star threads */}
      <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid meet">
        <g>
          {starPoints.map((point) => (
            <motion.line
              key={`thread-${point.id}`}
              x1="50%"
              y1="50%"
              x2={`${point.x}%`}
              y2={`${point.y}%`}
              stroke="white"
              strokeWidth={point.size}
              strokeOpacity={0.6}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.6 }}
              transition={{ 
                delay: point.delay, 
                duration: 2.5, 
                ease: "easeOut" 
              }}
            />
          ))}
        </g>
      </svg>
      
      {/* Star points */}
      {starPoints.map((point) => (
        <motion.div
          key={`star-${point.id}`}
          className="absolute rounded-full bg-white"
          style={{ 
            left: `${point.x}%`, 
            top: `${point.y}%`, 
            width: `${point.size * 2}px`, 
            height: `${point.size * 2}px`,
            marginLeft: `-${point.size}px`,
            marginTop: `-${point.size}px`,
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.8 }}
          transition={{ 
            delay: point.delay + 1.5, 
            duration: 1,
            ease: "easeOut" 
          }}
        />
      ))}
      
      {/* Text fade in */}
      <motion.div 
        className="absolute text-sm sm:text-xl md:text-2xl text-white/80 font-mono tracking-wider text-center px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1.5 }}
      >
        The Threads were woven.<br/>
        Four Forces bound them together.
      </motion.div>
    </div>
  );
};

export default StarThreads;