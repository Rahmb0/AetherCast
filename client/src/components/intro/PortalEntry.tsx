import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/button';
import { useIntro } from '@/lib/stores/useIntro';

interface PortalEntryProps {
  onEnter: () => void;
}

const PortalEntry = ({ onEnter }: PortalEntryProps) => {
  const { completeIntro } = useIntro();

  // Set up a timer to automatically transition after the portal is shown
  useEffect(() => {
    console.log("PortalEntry mounted, setting up auto-enter timer");
    
    // Show portal content for 3 seconds, then automatically enter 
    const autoEnterTimer = setTimeout(() => {
      console.log("Auto-enter timer triggered, calling onEnter callback");
      try {
        // Call store state update first
        completeIntro();
        
        // Then call the parent callback to notify App.tsx
        onEnter();
        
        // Also dispatch an event as a backup mechanism
        window.dispatchEvent(new CustomEvent('force-intro-complete'));
      } catch (error) {
        console.error("Error during auto-enter:", error);
      }
    }, 5000);
    
    return () => {
      clearTimeout(autoEnterTimer);
    };
  }, [onEnter, completeIntro]);
  
  return (
    <motion.div 
      className="absolute inset-0 w-full h-full flex flex-col items-center justify-center overflow-hidden px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5 }}
    >
      <motion.div
        className="max-w-lg text-center mb-6 sm:mb-10"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 1 }}
      >
        <h2 className="text-xl sm:text-2xl md:text-4xl text-white font-mono tracking-widest mb-4 sm:mb-6">
          Reality is a script.<br/>
          Will you learn to cast it?
        </h2>
      </motion.div>
      
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.8 }}
        whileHover={{ scale: 1.05 }}
      >
        <Button 
          onClick={() => {
            console.log("Enter button clicked");
            completeIntro();
            onEnter();
          }}
          className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-lg sm:text-xl px-6 sm:px-8 py-4 sm:py-6 rounded-lg shadow-lg pulse-effect"
        >
          ENTER AETHERCAST
        </Button>
      </motion.div>
      
      {/* This helper text will be displayed after a delay */}
      <motion.div
        className="text-white/70 mt-6 text-sm sm:text-base"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3, duration: 1 }}
      >
        Automatically entering in a moment...
      </motion.div>
    </motion.div>
  );
};

export default PortalEntry;