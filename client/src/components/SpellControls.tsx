import { useState } from "react";
import { useSpell } from "../lib/stores/useSpell";
import { useSimulation } from "../lib/stores/useSimulation";
import { useAudio } from "../lib/stores/useAudio";
import { Button } from "./ui/button";
import { SpellParser } from "../lib/SpellParser";

export default function SpellControls() {
  const { spellCode, calculateCost, energy, spendEnergy, 
          refreshEnergy, currentCost } = useSpell();
  const { applySpellEffect, triggerFeedback } = useSimulation();
  const { playHit, playSuccess } = useAudio();
  const [compileStatus, setCompileStatus] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  
  // Compile the spell and check for errors
  const compileSpell = () => {
    if (!spellCode.trim()) {
      setCompileStatus({
        success: false,
        message: "Empty spell code. Write a spell first."
      });
      return;
    }
    
    try {
      const parser = new SpellParser();
      const parsedSpell = parser.parse(spellCode);
      
      // Calculate energy cost
      const cost = calculateCost(parsedSpell);
      
      setCompileStatus({
        success: true,
        message: `Spell compiled successfully. Energy cost: ${cost}E`
      });
      
      // Play sound effect
      playHit();
      
      return parsedSpell;
    } catch (error) {
      setCompileStatus({
        success: false,
        message: `Spell error: ${(error as Error).message}`
      });
      return null;
    }
  };
  
  // Cast the spell
  const castSpell = () => {
    const parsedSpell = compileSpell();
    
    if (!parsedSpell) {
      return; // Compilation failed
    }
    
    // Check if user has enough energy
    if (currentCost > energy) {
      setCompileStatus({
        success: false,
        message: `Not enough energy. Need ${currentCost}E, have ${energy}E.`
      });
      triggerFeedback("energy_insufficient");
      return;
    }
    
    // Apply the spell effect to the simulation
    const spellEffect = applySpellEffect(parsedSpell);
    
    if (spellEffect.success) {
      // Deduct energy cost
      spendEnergy(currentCost);
      
      // Update status
      setCompileStatus({
        success: true,
        message: spellEffect.message
      });
      
      // Play success sound
      playSuccess();
    } else {
      // Spell failed to apply
      setCompileStatus({
        success: false,
        message: spellEffect.message
      });
      
      // Apply feedback/consequences if needed
      if (spellEffect.feedback) {
        triggerFeedback(spellEffect.feedback);
      }
    }
  };
  
  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-3">
        <Button 
          variant="outline" 
          onClick={compileSpell}
          className="flex-1 text-sm border-primary/50 hover:border-primary py-6 rounded-lg"
        >
          <div className="flex flex-col items-center gap-1">
            <span className="text-xs opacity-70">VERIFY</span>
            <span className="font-bold">Compile</span>
          </div>
        </Button>
        <Button 
          variant="default"
          onClick={castSpell}
          className="flex-1 text-sm bg-primary hover:bg-primary/80 py-6 rounded-lg shadow-lg"
        >
          <div className="flex flex-col items-center gap-1">
            <span className="text-xs opacity-70">EXECUTE</span>
            <span className="font-bold">Cast Spell</span>
          </div>
        </Button>
      </div>
      
      {/* Status message */}
      {compileStatus && (
        <div 
          className={`text-sm p-4 rounded-lg shadow-md ${
            compileStatus.success 
              ? "bg-green-900/40 text-green-300 border border-green-800/50" 
              : "bg-red-900/40 text-red-300 border border-red-800/50"
          }`}
        >
          {compileStatus.message}
        </div>
      )}
      
      {/* Energy controls */}
      <Button
        variant="ghost" 
        onClick={refreshEnergy}
        className="text-xs text-muted-foreground hover:text-primary hover:bg-primary/10 mt-2 py-3 rounded-lg border border-primary/10"
      >
        <div className="flex items-center gap-2">
          <span className="text-primary opacity-70">✦</span>
          <span>Meditate to regenerate energy</span>
        </div>
      </Button>
    </div>
  );
}
