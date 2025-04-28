import { create } from "zustand";

type IntroStage = 
  'pulse' | 
  'threads' | 
  'energy' | 
  'probability' | 
  'entropy' | 
  'time' | 
  'stitch' | 
  'whisper' | 
  'portal' | 
  'complete';

interface IntroState {
  // State
  stage: IntroStage;
  hasShownIntro: boolean;
  showHiddenGlyph: boolean;
  
  // Actions
  setStage: (stage: IntroStage) => void;
  advanceStage: () => void;
  skipIntro: () => void;
  completeIntro: () => void;
  setShowHiddenGlyph: (show: boolean) => void;
}

export const useIntro = create<IntroState>((set) => ({
  // Initial state - enable intro animation
  stage: 'pulse',
  hasShownIntro: false,  // Enable intro animation
  showHiddenGlyph: false,
  
  // Actions
  setStage: (stage) => set({ stage }),
  
  advanceStage: () => set((state) => {
    console.log("Advancing from stage:", state.stage);
    
    const stageOrder: IntroStage[] = [
      'pulse', 
      'threads', 
      'energy', 
      'probability', 
      'entropy', 
      'time', 
      'stitch', 
      'whisper', 
      'portal', 
      'complete'
    ];
    
    const currentIndex = stageOrder.indexOf(state.stage);
    
    // If portal stage, go directly to complete with hasShownIntro flag
    if (state.stage === 'portal') {
      console.log("Portal stage detected - going directly to complete");
      return { 
        stage: 'complete', 
        hasShownIntro: true 
      };
    }
    
    if (currentIndex >= 0 && currentIndex < stageOrder.length - 1) {
      const nextStage = stageOrder[currentIndex + 1];
      console.log("Advancing to next stage:", nextStage);
      return { stage: nextStage };
    }
    
    console.log("Completing intro from advance stage");
    return { 
      stage: 'complete', 
      hasShownIntro: true 
    };
  }),
  
  skipIntro: () => {
    console.log("skipIntro called in store");
    set({ 
      stage: 'complete', 
      hasShownIntro: true 
    });
  },
  
  completeIntro: () => {
    console.log("completeIntro called in store");
    set({ 
      stage: 'complete', 
      hasShownIntro: true 
    });
  },
  
  setShowHiddenGlyph: (show) => set({ 
    showHiddenGlyph: show 
  })
}));