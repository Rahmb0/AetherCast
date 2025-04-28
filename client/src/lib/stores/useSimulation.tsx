import { create } from "zustand";
import { ParsedSpell } from "../SpellParser";
import { SimulationEngine, SpellResult, SimulationState, FeedbackType } from "../SimulationEngine";

interface SimulationStore {
  simulationEngine: SimulationEngine;
  simulationState: SimulationState;
  
  // Actions
  applySpellEffect: (spell: ParsedSpell[]) => SpellResult;
  setSimulationDimensions: (width: number, height: number) => void;
  triggerFeedback: (type: FeedbackType) => void;
  updateSimulationState: () => void;
  setSimulationState: (updates: Partial<SimulationState>) => void;
}

// Create the simulation engine instance
const simulationEngine = new SimulationEngine();

export const useSimulation = create<SimulationStore>((set, get) => ({
  simulationEngine,
  simulationState: simulationEngine.getState(),
  
  applySpellEffect: (spell) => {
    const result = get().simulationEngine.applySpell(spell);
    
    // Update the state after applying the spell
    get().updateSimulationState();
    
    return result;
  },
  
  setSimulationDimensions: (width, height) => {
    get().simulationEngine.setDimensions(width, height);
    get().updateSimulationState();
  },
  
  triggerFeedback: (type) => {
    // Implement different feedback effects based on type
    const engine = get().simulationEngine;
    
    switch (type) {
      case "energy_overload":
        // Energy particles explode outward
        // Implementation would use particle system
        get().updateSimulationState();
        break;
        
      case "reality_fracture":
        // Entropy increases dramatically
        // Simulation looks glitchy
        get().updateSimulationState();
        break;
        
      case "time_loop":
        // Time speed fluctuates wildly then resets
        // Implementation would use time speed setting
        get().updateSimulationState();
        break;
        
      case "energy_insufficient":
        // Energy particles dim temporarily
        // Implementation would use particle system
        get().updateSimulationState();
        break;
        
      case "paradox":
        // Reality appears to fold in on itself
        // Implementation would use visual effects
        get().updateSimulationState();
        break;
    }
    
    // Always update state after feedback
    get().updateSimulationState();
  },
  
  updateSimulationState: () => {
    // Clean up expired effects
    get().simulationEngine.cleanupExpiredEffects();
    
    // Get fresh state
    const state = get().simulationEngine.getState();
    
    set({ simulationState: state });
  },
  
  setSimulationState: (updates) => {
    // This allows direct modification of the simulation state for terminal commands
    const currentState = get().simulationState;
    
    // Create new state with updates merged in
    const newState = { 
      ...currentState,
      ...updates
    };
    
    // Update the state - this will trigger re-renders
    set({ simulationState: newState });
  }
}));

// Set up an interval to periodically update the simulation state
// This ensures that time-based effects continue to work
if (typeof window !== "undefined") {
  setInterval(() => {
    const { updateSimulationState } = useSimulation.getState();
    updateSimulationState();
  }, 1000); // Update every second
}
