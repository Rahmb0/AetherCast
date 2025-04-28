import { create } from "zustand";
import { ParsedSpell } from "../SpellParser";

interface SpellState {
  spellCode: string;
  energy: number;
  currentCost: number;
  
  // Actions
  setSpellCode: (code: string) => void;
  calculateCost: (spell: ParsedSpell[]) => number;
  spendEnergy: (amount: number) => void;
  refreshEnergy: () => void;
  setCurrentCost: (cost: number) => void;
}

// Default spell template to help users get started
const DEFAULT_SPELL = `focus: Probability
anchor: Self
shift: +15%
cost: 30E
intent: "Increase odds of favorable outcome"
seal`;

export const useSpell = create<SpellState>((set, get) => ({
  spellCode: DEFAULT_SPELL,
  energy: 100,
  currentCost: 30,
  
  setSpellCode: (code) => set({ spellCode: code }),
  
  calculateCost: (spells) => {
    // Base calculation of spell cost
    let totalCost = 0;
    
    for (const spell of spells) {
      // Get the absolute shift amount
      const shiftAmount = Math.abs(spell.shift.amount);
      
      // Base cost based on the specific focus
      let baseCost = 0;
      
      switch (spell.focus) {
        case "Energy":
          baseCost = shiftAmount * 0.5; // Energy manipulation is relatively cheaper
          break;
        case "Probability":
          baseCost = shiftAmount * 0.8; // Probability changes are moderate cost
          break;
        case "Entropy":
          baseCost = shiftAmount * 1.0; // Entropy changes are standard cost
          break;
        case "Time":
          baseCost = shiftAmount * 1.2; // Time manipulation is expensive
          break;
        default:
          baseCost = shiftAmount; // Default cost
      }
      
      // Multiply by anchor type factor
      let anchorFactor = 1.0;
      
      switch (spell.anchor.type) {
        case "Self":
          anchorFactor = 1.0; // Self is standard cost
          break;
        case "Object":
          anchorFactor = 1.2; // Objects cost a bit more
          break;
        case "Zone":
          // Zones cost more based on radius
          const radius = spell.anchor.params.radius || 1;
          anchorFactor = 1.0 + (radius * 0.1);
          break;
      }
      
      // Calculate final cost for this spell
      const spellCost = Math.ceil(baseCost * anchorFactor);
      
      // Add to total
      totalCost += spellCost;
      
      // Check for hidden protocols - they offer discounts or increases
      if (spell.usesHiddenProtocol) {
        // Discovered protocols can reduce costs or increase them
        if (spell.protocolKeywords.includes("void.manifest")) {
          // Void manifest reduces energy cost by 30%
          totalCost = Math.ceil(totalCost * 0.7);
        } else if (spell.protocolKeywords.includes("paradox.engine")) {
          // Paradox engine increases cost by 50% due to reality strain
          totalCost = Math.ceil(totalCost * 1.5);
        }
      }
    }
    
    // Ensure minimum cost of 1
    return Math.max(1, totalCost);
  },
  
  spendEnergy: (amount) => {
    set((state) => ({
      energy: Math.max(0, state.energy - amount)
    }));
  },
  
  refreshEnergy: () => {
    set((state) => ({
      energy: Math.min(100, state.energy + 10)
    }));
  },
  
  setCurrentCost: (cost) => {
    set({ currentCost: cost });
  }
}));
