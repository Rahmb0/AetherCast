import { useEffect } from 'react';
import { motion } from 'framer-motion';

interface ForceRevealProps {
  force: 'energy' | 'probability' | 'entropy' | 'time';
  onComplete: () => void;
}

const ForceReveal = ({ force, onComplete }: ForceRevealProps) => {
  // Force-specific configurations
  const forceConfig = {
    energy: {
      color: '#FF5733', // Red-Gold Fire
      title: 'Energy',
      subtitle: 'The Blood of Reality',
      description: 'It fuels every act and sustains every breath.',
    },
    probability: {
      color: '#8D6EFF', // Indigo-Silver Shift
      title: 'Probability',
      subtitle: 'The Shape of Destiny',
      description: 'Every action tilts the world unseen.',
    },
    entropy: {
      color: '#00CED1', // Pale Teal Storm
      title: 'Entropy',
      subtitle: 'The Whisper of Collapse',
      description: 'All creation leans toward the storm.',
    },
    time: {
      color: '#9370DB', // Muted Violet Drift
      title: 'Time',
      subtitle: 'The Silent River',
      description: "It flows for all — until it doesn't.",
    },
  };

  // Current force data
  const currentForce = forceConfig[force];
  
  useEffect(() => {
    // Advance to next stage after 7 seconds
    const timer = setTimeout(() => {
      onComplete();
    }, 7000);
    
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      {/* Ripple effect */}
      <motion.div
        className="absolute rounded-full"
        style={{ 
          backgroundColor: currentForce.color,
          width: '10px',
          height: '10px',
        }}
        initial={{ scale: 0, opacity: 0.8 }}
        animate={{ 
          scale: 30,
          opacity: 0 
        }}
        transition={{ 
          duration: 3.5,
        }}
      />
      
      {/* Star nodes that flash based on the force type */}
      <div className="absolute inset-0 flex items-center justify-center">
        <svg className="w-full h-full" viewBox="0 0 300 300" preserveAspectRatio="xMidYMid meet">
          <motion.g
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
          >
            {/* Generate pattern based on force type */}
            {Array.from({ length: 8 }, (_, i) => {
              const angle = (i / 8) * Math.PI * 2;
              const radius = 120;
              
              // Calculate position in circular pattern
              const x = Math.cos(angle) * radius + 150;
              const y = Math.sin(angle) * radius + 150;
              
              return (
                <motion.circle
                  key={`node-${i}`}
                  cx={x}
                  cy={y}
                  r={5}
                  fill={currentForce.color}
                  initial={{ opacity: 0 }}
                  animate={{ 
                    opacity: [0, 0.9, 0.3, 0.7],
                    scale: [0, 1.2, 0.8, 1]
                  }}
                  transition={{ 
                    delay: 1 + i * 0.1,
                    duration: 2,
                    times: [0, 0.3, 0.6, 1]
                  }}
                />
              );
            })}
            
            {/* Connect the nodes with lines */}
            {Array.from({ length: 8 }, (_, i) => {
              const angle1 = (i / 8) * Math.PI * 2;
              const angle2 = ((i + 1) / 8) * Math.PI * 2;
              const radius = 120;
              
              const x1 = Math.cos(angle1) * radius + 150;
              const y1 = Math.sin(angle1) * radius + 150;
              const x2 = Math.cos(angle2) * radius + 150;
              const y2 = Math.sin(angle2) * radius + 150;
              
              return (
                <motion.line
                  key={`connection-${i}`}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={currentForce.color}
                  strokeWidth={2}
                  strokeOpacity={0.6}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ 
                    delay: 1.5 + i * 0.1,
                    duration: 1.5
                  }}
                />
              );
            })}
          </motion.g>
        </svg>
      </div>
      
      {/* Force text reveal */}
      <div className="absolute bottom-1/4 w-full px-4 text-center">
        <motion.div
          className="flex flex-col items-center gap-2"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-wider" style={{ color: currentForce.color }}>
            {currentForce.title}
          </h2>
          <h3 className="text-lg sm:text-xl md:text-2xl text-white/90 font-mono">
            {currentForce.subtitle}
          </h3>
          <p className="text-sm sm:text-lg md:text-xl text-white/70 mt-2 max-w-md">
            {currentForce.description}
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default ForceReveal;