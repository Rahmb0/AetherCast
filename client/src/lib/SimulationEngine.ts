import { ParsedSpell } from "./SpellParser";

// Simulation parameters
export interface SimulationState {
  energyLevel: number;
  probabilityShift: number;
  entropyLevel: number;
  timeSpeed: number;
  activeEffects: SimulationEffect[];
  lastSpellFocus: string;
  dimensions: {
    width: number;
    height: number;
  };
}

// Effect of a spell on the simulation
export interface SimulationEffect {
  id: string;
  focus: string;
  anchorType: string;
  anchorParams: Record<string, any>;
  shiftAmount: number;
  duration: number;
  startTime: number;
  intensity: number;
}

// Result of applying a spell
export interface SpellResult {
  success: boolean;
  message: string;
  feedback?: FeedbackType;
}

// Types of feedback when spells go wrong
export type FeedbackType = 
  "energy_overload" | 
  "reality_fracture" | 
  "time_loop" | 
  "energy_insufficient" | 
  "paradox";

export class SimulationEngine {
  private state: SimulationState;
  
  constructor() {
    // Initialize simulation with default values
    this.state = {
      energyLevel: 100,
      probabilityShift: 0,
      entropyLevel: 20,
      timeSpeed: 1,
      activeEffects: [],
      lastSpellFocus: "",
      dimensions: {
        width: 800,
        height: 600
      }
    };
  }
  
  /**
   * Get the current simulation state
   */
  getState(): SimulationState {
    return { ...this.state };
  }
  
  /**
   * Update simulation dimensions
   */
  setDimensions(width: number, height: number): void {
    this.state.dimensions = { width, height };
  }
  
  /**
   * Apply effects of a spell to the simulation
   */
  applySpell(spells: ParsedSpell[]): SpellResult {
    // For multi-spells, apply each one in sequence
    for (const spell of spells) {
      const result = this.applySingleSpell(spell);
      if (!result.success) {
        return result; // Stop if any spell fails
      }
    }
    
    // All spells applied successfully
    return {
      success: true,
      message: "Spell cast successfully! Reality shifts to your will."
    };
  }
  
  /**
   * Apply a single spell to the simulation
   */
  private applySingleSpell(spell: ParsedSpell): SpellResult {
    // Set last focus for visualization purposes
    this.state.lastSpellFocus = spell.focus;
    
    // Check if the effect is too extreme
    const shiftAmount = spell.shift.direction === "+" 
      ? spell.shift.amount 
      : -spell.shift.amount;
    
    // Check for potential violations or extreme effects
    if (Math.abs(shiftAmount) > 200 && !spell.usesHiddenProtocol) {
      return {
        success: false,
        message: "Spell exceeds safe reality manipulation limits.",
        feedback: "reality_fracture"
      };
    }
    
    // Special case for hidden protocols
    if (spell.usesHiddenProtocol) {
      return this.applyHiddenProtocolSpell(spell);
    }
    
    // Apply effect based on focus
    switch (spell.focus) {
      case "Energy":
        return this.applyEnergyEffect(spell, shiftAmount);
      
      case "Probability":
        return this.applyProbabilityEffect(spell, shiftAmount);
      
      case "Entropy":
        return this.applyEntropyEffect(spell, shiftAmount);
      
      case "Time":
        return this.applyTimeEffect(spell, shiftAmount);
      
      default:
        return {
          success: false,
          message: `Unknown focus: ${spell.focus}`
        };
    }
  }
  
  /**
   * Apply energy manipulation effect
   */
  private applyEnergyEffect(spell: ParsedSpell, shiftAmount: number): SpellResult {
    // Prevent energy from going negative
    if (this.state.energyLevel + shiftAmount < 0) {
      return {
        success: false,
        message: "Cannot reduce energy below zero.",
        feedback: "energy_insufficient"
      };
    }
    
    // Add effect to active effects
    this.addEffect({
      id: this.generateId(),
      focus: "Energy",
      anchorType: spell.anchor.type,
      anchorParams: spell.anchor.params,
      shiftAmount,
      duration: 8000, // 8 seconds
      startTime: Date.now(),
      intensity: Math.abs(shiftAmount) / 100
    });
    
    // Update energy level
    this.state.energyLevel = Math.min(200, this.state.energyLevel + shiftAmount);
    
    return {
      success: true,
      message: `Energy level ${shiftAmount > 0 ? "increased" : "decreased"} by ${Math.abs(shiftAmount)}%.`
    };
  }
  
  /**
   * Apply probability manipulation effect
   */
  private applyProbabilityEffect(spell: ParsedSpell, shiftAmount: number): SpellResult {
    // Probability shifts accumulate
    this.state.probabilityShift += shiftAmount;
    
    // Add effect to active effects
    this.addEffect({
      id: this.generateId(),
      focus: "Probability",
      anchorType: spell.anchor.type,
      anchorParams: spell.anchor.params,
      shiftAmount,
      duration: 12000, // 12 seconds
      startTime: Date.now(),
      intensity: Math.abs(shiftAmount) / 100
    });
    
    // If the probability shift gets too extreme, trigger reality glitches
    if (Math.abs(this.state.probabilityShift) > 100) {
      // Self-correcting mechanism
      setTimeout(() => {
        this.state.probabilityShift = this.state.probabilityShift / 2;
      }, 5000);
      
      return {
        success: true,
        message: "Probability shifted drastically. Reality struggles to compensate."
      };
    }
    
    return {
      success: true,
      message: `Probability ${shiftAmount > 0 ? "increased" : "decreased"} by ${Math.abs(shiftAmount)}%.`
    };
  }
  
  /**
   * Apply entropy manipulation effect
   */
  private applyEntropyEffect(spell: ParsedSpell, shiftAmount: number): SpellResult {
    // Calculate new entropy level
    const newEntropyLevel = this.state.entropyLevel + shiftAmount;
    
    // Check for extreme conditions
    if (newEntropyLevel < 0) {
      // Can't have negative entropy
      return {
        success: false,
        message: "Cannot reduce entropy below zero.",
        feedback: "paradox"
      };
    }
    
    if (newEntropyLevel > 200 && !spell.usesHiddenProtocol) {
      // Too much entropy causes chaos
      return {
        success: false,
        message: "Entropy too high. Reality becoming unstable.",
        feedback: "reality_fracture"
      };
    }
    
    // Add effect to active effects
    this.addEffect({
      id: this.generateId(),
      focus: "Entropy",
      anchorType: spell.anchor.type,
      anchorParams: spell.anchor.params,
      shiftAmount,
      duration: 10000, // 10 seconds
      startTime: Date.now(),
      intensity: Math.abs(shiftAmount) / 100
    });
    
    // Update entropy level
    this.state.entropyLevel = newEntropyLevel;
    
    return {
      success: true,
      message: `Entropy level ${shiftAmount > 0 ? "increased" : "decreased"} by ${Math.abs(shiftAmount)}%.`
    };
  }
  
  /**
   * Apply time manipulation effect
   */
  private applyTimeEffect(spell: ParsedSpell, shiftAmount: number): SpellResult {
    // Calculate new time speed as a multiplier
    const speedMultiplier = 1 + (shiftAmount / 100);
    
    // Check for extreme time shifts
    if (speedMultiplier <= 0 && !spell.usesHiddenProtocol) {
      return {
        success: false,
        message: "Cannot halt or reverse time flow.",
        feedback: "time_loop"
      };
    }
    
    if (speedMultiplier > 5 && !spell.usesHiddenProtocol) {
      return {
        success: false,
        message: "Time acceleration too extreme.",
        feedback: "time_loop"
      };
    }
    
    // Add effect to active effects
    this.addEffect({
      id: this.generateId(),
      focus: "Time",
      anchorType: spell.anchor.type,
      anchorParams: spell.anchor.params,
      shiftAmount,
      duration: 15000, // 15 seconds
      startTime: Date.now(),
      intensity: Math.abs(shiftAmount) / 100
    });
    
    // Update time speed
    this.state.timeSpeed = speedMultiplier;
    
    // Schedule time normalization
    setTimeout(() => {
      this.state.timeSpeed = Math.max(0.5, Math.min(2, this.state.timeSpeed));
    }, 15000);
    
    return {
      success: true,
      message: `Time flow ${shiftAmount > 0 ? "accelerated" : "decelerated"} by ${Math.abs(shiftAmount)}%.`
    };
  }
  
  /**
   * Apply a spell that uses hidden protocols
   */
  private applyHiddenProtocolSpell(spell: ParsedSpell): SpellResult {
    // Implement advanced/hidden features that bypass normal restrictions
    const shiftAmount = spell.shift.direction === "+" 
      ? spell.shift.amount 
      : -spell.shift.amount;
    
    // Check which hidden protocols are used
    const protocolKeywords = spell.protocolKeywords;
    
    // For each discovered protocol, grant special abilities
    if (protocolKeywords.includes("kernel.space")) {
      // Allow extreme spatial manipulations
      this.addEffect({
        id: this.generateId(),
        focus: "KernelSpace",
        anchorType: spell.anchor.type,
        anchorParams: spell.anchor.params,
        shiftAmount: shiftAmount * 2, // Double effect
        duration: 20000,
        startTime: Date.now(),
        intensity: Math.abs(shiftAmount) / 50 // Higher intensity
      });
      
      return {
        success: true,
        message: "KERNEL ACCESS GRANTED: Spatial parameters reconfigured beyond normal limits."
      };
    }
    
    if (protocolKeywords.includes("root.entropy")) {
      // Allow direct entropy manipulation
      this.state.entropyLevel = Math.max(0, Math.min(500, this.state.entropyLevel + shiftAmount));
      
      return {
        success: true,
        message: "ROOT ACCESS: Fundamental entropic constants modified."
      };
    }
    
    if (protocolKeywords.includes("void.manifest")) {
      // Create something from nothing
      this.state.energyLevel += Math.abs(shiftAmount);
      this.state.probabilityShift += shiftAmount * 2;
      
      return {
        success: true,
        message: "VOID MANIFESTATION: Energy created from quantum fluctuations."
      };
    }
    
    if (protocolKeywords.includes("quantum.superposition")) {
      // Allow probability manipulation beyond limits
      this.state.probabilityShift = shiftAmount * 3;
      
      return {
        success: true,
        message: "QUANTUM STATE ALIGNED: Probability wave functions collapsed to desired outcome."
      };
    }
    
    if (protocolKeywords.includes("paradox.engine")) {
      // Allows contradictory effects to coexist
      this.state.timeSpeed = shiftAmount > 0 ? 10 : 0.1; // Extreme time shifts
      
      return {
        success: true,
        message: "PARADOX ENGINE ENGAGED: Contradictory states now coexisting."
      };
    }
    
    // If we reach here, the hidden protocol was recognized but not implemented
    return {
      success: true,
      message: "Hidden protocol recognized, but effect is subtle."
    };
  }
  
  /**
   * Add a new effect to the active effects list
   */
  private addEffect(effect: SimulationEffect): void {
    this.state.activeEffects.push(effect);
    
    // Clean up effect after duration
    setTimeout(() => {
      this.state.activeEffects = this.state.activeEffects.filter(e => e.id !== effect.id);
    }, effect.duration);
  }
  
  /**
   * Generate a unique ID for effects
   */
  private generateId(): string {
    return Math.random().toString(36).substring(2, 15);
  }
  
  /**
   * Clean up expired effects
   */
  cleanupExpiredEffects(): void {
    const now = Date.now();
    this.state.activeEffects = this.state.activeEffects.filter(effect => {
      return now - effect.startTime < effect.duration;
    });
  }
}
