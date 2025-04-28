import { useRef, useEffect } from 'react';

interface RippleProps {
  x: number;
  y: number;
  color?: string;
  duration?: number;
  onComplete?: () => void;
}

export default function RippleEffect({ 
  x, 
  y, 
  color = 'rgba(124, 58, 237, 0.5)', 
  duration = 800,
  onComplete 
}: RippleProps) {
  const rippleRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const ripple = rippleRef.current;
    if (!ripple) return;
    
    // Position ripple at click coordinates
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    
    // Start animation
    ripple.style.opacity = '1';
    ripple.style.transform = 'scale(0)';
    
    // Trigger animation
    requestAnimationFrame(() => {
      ripple.style.transform = 'scale(4)';
      ripple.style.opacity = '0';
      
      // Clean up after animation
      setTimeout(() => {
        if (onComplete) onComplete();
      }, duration);
    });
  }, [x, y, duration, onComplete]);
  
  return (
    <div
      ref={rippleRef}
      className="absolute w-8 h-8 rounded-full pointer-events-none transition-all ease-out"
      style={{
        backgroundColor: color,
        transform: 'translate(-50%, -50%) scale(0)',
        opacity: 0,
        transitionDuration: `${duration}ms`,
        transitionProperty: 'transform, opacity',
      }}
    />
  );
}