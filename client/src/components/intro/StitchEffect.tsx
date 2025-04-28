import { useEffect } from 'react';
import { motion } from 'framer-motion';

interface StitchEffectProps {
  onComplete: () => void;
}

const StitchEffect = ({ onComplete }: StitchEffectProps) => {
  useEffect(() => {
    // Advance to next stage after 5 seconds
    const timer = setTimeout(() => {
      onComplete();
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [onComplete]);

  // Generate random star points in a constellation pattern
  const centerX = 50;
  const centerY = 50;
  const starCount = 15;
  
  const starPoints = Array.from({ length: starCount }, (_, i) => {
    const angle = (i / starCount) * Math.PI * 2;
    const distance = 20 + Math.random() * 15;
    
    return {
      id: i,
      x: centerX + Math.cos(angle) * distance,
      y: centerY + Math.sin(angle) * distance,
      size: Math.random() * 2 + 1,
      delay: Math.random() * 0.5
    };
  });
  
  // Create connections between stars to form constellation
  const connections = [];
  for (let i = 0; i < starCount; i++) {
    const nextIndex = (i + 1) % starCount;
    connections.push({
      id: i,
      x1: starPoints[i].x,
      y1: starPoints[i].y,
      x2: starPoints[nextIndex].x,
      y2: starPoints[nextIndex].y,
      delay: 0.5 + Math.random() * 0.5
    });
    
    // Add some cross connections for more complex web
    if (i % 3 === 0 && i > 0) {
      const crossIndex = (i + Math.floor(starCount / 2)) % starCount;
      connections.push({
        id: `cross-${i}`,
        x1: starPoints[i].x,
        y1: starPoints[i].y,
        x2: starPoints[crossIndex].x,
        y2: starPoints[crossIndex].y,
        delay: 0.8 + Math.random() * 0.5
      });
    }
  }

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      {/* Logo that forms at the center */}
      <motion.div
        className="absolute z-20"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 3, duration: 1.5 }}
      >
        <img 
          src="/logo.svg" 
          alt="AetherCast Logo" 
          className="w-16 h-16 sm:w-24 sm:h-24 md:w-32 md:h-32 aethercast-glow" 
        />
      </motion.div>
      
      {/* Star constellation */}
      <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid meet">
        <g>
          {/* Connections between stars */}
          {connections.map((connection) => (
            <motion.line
              key={`connection-${connection.id}`}
              x1={`${connection.x1}%`}
              y1={`${connection.y1}%`}
              x2={`${connection.x2}%`}
              y2={`${connection.y2}%`}
              stroke="white"
              strokeWidth="1"
              strokeOpacity="0.6"
              initial={{ 
                pathLength: 0,
                opacity: 0,
                x1: `${centerX}%`,
                y1: `${centerY}%`,
                x2: `${centerX}%`,
                y2: `${centerY}%`,
              }}
              animate={{ 
                pathLength: 1,
                opacity: 0.6,
                x1: `${connection.x1}%`,
                y1: `${connection.y1}%`,
                x2: `${connection.x2}%`,
                y2: `${connection.y2}%`,
              }}
              transition={{ 
                delay: connection.delay,
                duration: 1.5, 
                ease: "easeInOut" 
              }}
            />
          ))}
        </g>
      </svg>
      
      {/* Stars in the constellation */}
      {starPoints.map((point) => (
        <motion.div
          key={`star-${point.id}`}
          className="absolute rounded-full bg-white"
          style={{ 
            width: `${point.size * 2}px`, 
            height: `${point.size * 2}px`,
          }}
          initial={{ 
            opacity: 0,
            scale: 0,
            x: `calc(${centerX}% - ${point.size}px)`,
            y: `calc(${centerY}% - ${point.size}px)`,
          }}
          animate={{ 
            opacity: 0.9,
            scale: 1,
            x: `calc(${point.x}% - ${point.size}px)`,
            y: `calc(${point.y}% - ${point.size}px)`,
          }}
          transition={{ 
            delay: point.delay,
            duration: 2,
            ease: "easeOut" 
          }}
        />
      ))}
      
      {/* Pulse that grows and then contracts toward center */}
      <motion.div 
        className="absolute rounded-full border-2 border-white/30"
        initial={{ width: 0, height: 0, opacity: 0 }}
        animate={{ 
          width: ['0px', '60vmin', '0px'],
          height: ['0px', '60vmin', '0px'],
          opacity: [0, 0.3, 0],
        }}
        transition={{ 
          duration: 3, 
          times: [0, 0.7, 1] 
        }}
      />
    </div>
  );
};

export default StitchEffect;