import { useState, useEffect } from "react";
import { useAudio } from "./lib/stores/useAudio";
import { useIntro } from "./lib/stores/useIntro";
import Layout from "./components/Layout";
import AetherCastIntro from "./components/intro/AetherCastIntro";
import "@fontsource/inter";

function App() {
  const [loaded, setLoaded] = useState(false);
  const [forceShowMain, setForceShowMain] = useState(false);
  const { setBackgroundMusic, setHitSound, setSuccessSound } = useAudio();
  const { stage, hasShownIntro, completeIntro } = useIntro();
  
  // Debug effect to track intro completion state
  useEffect(() => {
    console.log("Current App state:", { stage, hasShownIntro });
  }, [stage, hasShownIntro]);
  
  // Listen for forced intro completion as a backup
  useEffect(() => {
    const forceCompleteListener = () => {
      console.log("Force intro complete event received");
      completeIntro();
      setForceShowMain(true);
    };
    
    window.addEventListener('force-intro-complete', forceCompleteListener);
    
    // Multiple backup mechanisms to ensure the UI transition happens
    
    // Backup #1: Force transition after a timeout if we're on portal stage
    const portalBackupTimer = setTimeout(() => {
      if (stage === 'portal') {
        console.log("Portal backup timer - forcing main UI to show");
        completeIntro();
        setForceShowMain(true);
      }
    }, 7000);
    
    // Backup #2: Global safety timeout to ensure we don't get stuck in any intro stage
    const globalBackupTimer = setTimeout(() => {
      if (!hasShownIntro) {
        console.log("Global backup timer - forcing intro completion");
        completeIntro();
        setForceShowMain(true);
      }
    }, 60000); // 60 seconds max for entire intro
    
    // Backup #3: Specific stage handling for whisper stage
    const whisperBackupTimer = setTimeout(() => {
      if (stage === 'whisper') {
        console.log("Whisper backup timer - advancing to portal");
        completeIntro();
        setForceShowMain(true);
      }
    }, 10000);
    
    return () => {
      window.removeEventListener('force-intro-complete', forceCompleteListener);
      clearTimeout(portalBackupTimer);
      clearTimeout(globalBackupTimer);
      clearTimeout(whisperBackupTimer);
    };
  }, [completeIntro, stage, hasShownIntro]);
  
  // Initialize audio
  useEffect(() => {
    // Load background music
    const bgMusic = new Audio("/sounds/background.mp3");
    bgMusic.loop = true;
    bgMusic.volume = 0.3;
    setBackgroundMusic(bgMusic);
    
    // Load sound effects
    const hitSfx = new Audio("/sounds/hit.mp3");
    hitSfx.volume = 0.5;
    setHitSound(hitSfx);
    
    const successSfx = new Audio("/sounds/success.mp3");
    successSfx.volume = 0.5;
    setSuccessSound(successSfx);
    
    setLoaded(true);
  }, [setBackgroundMusic, setHitSound, setSuccessSound]);
  
  // Handler when intro complete
  const handleIntroComplete = () => {
    console.log("Intro complete handler called - TRANSITION TO MAIN UI NOW");
    
    // Use multiple mechanisms to ensure the transition happens
    
    // 1. Call store action to update global state
    completeIntro();
    
    // 2. Update local state for additional safety
    setForceShowMain(true);
    
    // 3. Dispatch event for components listening for it
    window.dispatchEvent(new CustomEvent('force-intro-complete'));
    
    // 4. Set a timeout to double-check the transition happened
    setTimeout(() => {
      if (!hasShownIntro) {
        console.log("Emergency transition backup - forcibly updating state");
        completeIntro();
        setForceShowMain(true);
      }
    }, 100);
  };
  
  if (!loaded) {
    return (
      <div className="flex items-center justify-center h-screen w-screen bg-black">
        <div className="text-2xl text-primary shimmer p-4 rounded">
          Initializing AetherCast...
        </div>
      </div>
    );
  }
  
  // Show main UI if we've shown the intro OR if the stage is complete OR forceShowMain is true
  if (hasShownIntro || stage === 'complete' || forceShowMain) {
    console.log("Rendering main application");
  } else {
    console.log("Rendering intro cinematic");
    return <AetherCastIntro onComplete={handleIntroComplete} />;
  }
  
  // Main application rendering - always render the Layout once intro is complete
  return (
    <div className="relative w-full h-full overflow-hidden bg-gradient-to-b from-[#050510] to-[#07071a]">
      {/* Main application layout */}
      <div className="w-full h-full">
        <Layout />
      </div>
    </div>
  );
}

export default App;
