import { useState, useEffect, useRef } from 'react';
import { useIntro } from '@/lib/stores/useIntro';
import { motion } from 'framer-motion';
import { Button } from '../ui/button';
import PulseEffect from './PulseEffect';
import StarThreads from './StarThreads';
import ForceReveal from './ForceReveal';
import StitchEffect from './StitchEffect';
import HiddenGlyph from './HiddenGlyph';
import PortalEntry from './PortalEntry';

interface AetherCastIntroProps {
  onComplete: () => void;
}

const AetherCastIntro = ({ onComplete }: AetherCastIntroProps) => {
  const { 
    stage, 
    advanceStage, 
    skipIntro, 
    completeIntro,
    showHiddenGlyph,
    setShowHiddenGlyph
  } = useIntro();
  
  const [idleTimerId, setIdleTimerId] = useState<number | null>(null);
  const idleTimerIdRef = useRef<number | null>(null);
  
  // Set up idle timer for revealing hidden glyph
  useEffect(() => {
    if (stage === 'stitch') {
      // Start a timer to show hidden glyph after 10 seconds of no interaction
      const timerId = window.setTimeout(() => {
        setShowHiddenGlyph(true);
        // Move to whisper stage
        advanceStage();
      }, 10000);
      
      // Store timer ID in both state and ref
      const numericTimerId = Number(timerId);
      setIdleTimerId(numericTimerId);
      idleTimerIdRef.current = numericTimerId;
      
      return () => {
        if (idleTimerIdRef.current) {
          window.clearTimeout(idleTimerIdRef.current);
          idleTimerIdRef.current = null;
        }
      };
    }
  }, [stage, setShowHiddenGlyph, advanceStage]);
  
  // Handle any user interaction to potentially skip hidden whisper
  useEffect(() => {
    const handleUserInteraction = () => {
      if (stage === 'stitch' && idleTimerIdRef.current) {
        window.clearTimeout(idleTimerIdRef.current);
        idleTimerIdRef.current = null;
        setIdleTimerId(null);
        advanceStage(); // Skip to portal directly
      }
    };
    
    window.addEventListener('click', handleUserInteraction);
    window.addEventListener('keydown', handleUserInteraction);
    
    return () => {
      window.removeEventListener('click', handleUserInteraction);
      window.removeEventListener('keydown', handleUserInteraction);
    };
  }, [stage, advanceStage]);
  
  // Handle enter button click
  const handleEnter = () => {
    console.log("Enter button clicked - completing intro");
    // First mark as complete in the intro store
    completeIntro();
    // Then call the parent callback to ensure App.tsx knows
    onComplete();
  };
  
  // Handle skip button click
  const handleSkip = () => {
    console.log("Skip button clicked");
    // First mark as complete in the intro store
    skipIntro();
    // Then call the parent callback to ensure App.tsx knows
    onComplete();
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B0C10] overflow-hidden">
      {/* Skip button as a pure HTML element with inline styles for maximum compatibility */}
      <div 
        style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          zIndex: 100
        }}
      >
        <button
          onClick={handleSkip}
          style={{
            padding: '8px 16px',
            borderRadius: '4px', 
            backgroundColor: 'rgba(0,0,0,0.5)',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'inherit',
            fontSize: '14px'
          }}
        >
          Skip Intro
        </button>
      </div>
      
      {/* Stage components rendered in a centered container */}
      <div className="w-full h-full flex items-center justify-center">
        <div className="w-full h-full max-w-screen-lg"> {/* Constrain width on larger screens */}
          {stage === 'pulse' && (
            <PulseEffect onComplete={advanceStage} />
          )}
          
          {stage === 'threads' && (
            <StarThreads onComplete={advanceStage} />
          )}
          
          {stage === 'energy' && (
            <ForceReveal force="energy" onComplete={advanceStage} />
          )}
          
          {stage === 'probability' && (
            <ForceReveal force="probability" onComplete={advanceStage} />
          )}
          
          {stage === 'entropy' && (
            <ForceReveal force="entropy" onComplete={advanceStage} />
          )}
          
          {stage === 'time' && (
            <ForceReveal force="time" onComplete={advanceStage} />
          )}
          
          {stage === 'stitch' && (
            <StitchEffect onComplete={advanceStage} />
          )}
          
          {stage === 'whisper' && showHiddenGlyph && (
            <>
              <HiddenGlyph />
              <div className="absolute opacity-0">
                {/* Hidden div to automatically advance after glyph is shown */}
                <PulseEffect onComplete={advanceStage} />
              </div>
            </>
          )}
          
          {stage === 'portal' && (
            <PortalEntry onEnter={handleEnter} />
          )}
        </div>
      </div>
    </div>
  );
};

export default AetherCastIntro;