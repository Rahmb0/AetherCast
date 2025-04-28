import { useEffect } from "react";
import { useSpell } from "@/lib/stores/useSpell";
import { Progress } from "@/components/ui/progress";
import { SpellParser } from "@/lib/SpellParser";

export default function EnergyCost() {
  const { spellCode, calculateCost, setCurrentCost, energy, currentCost } = useSpell();
  
  // Recalculate cost on spell code change
  useEffect(() => {
    try {
      const parser = new SpellParser();
      const parsedSpell = parser.parse(spellCode);
      const cost = calculateCost(parsedSpell);
      setCurrentCost(cost);
    } catch (error) {
      // Invalid spell, don't update cost
    }
  }, [spellCode, calculateCost, setCurrentCost]);
  
  // Calculate percentage of energy used
  const energyPercentage = Math.min(100, (currentCost / energy) * 100);
  
  // Determine energy level classification
  let energyClass = "text-green-400";
  if (energyPercentage > 80) {
    energyClass = "text-red-400";
  } else if (energyPercentage > 50) {
    energyClass = "text-yellow-400";
  }
  
  return (
    <div className="flex flex-col gap-2 bg-black/40 p-3 rounded-lg border border-primary/20">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-primary">Energy Consumption</span>
        <span className={`text-sm font-bold ${energyClass}`}>
          {currentCost}E / {energy}E
        </span>
      </div>
      
      <div className="h-3 w-full overflow-hidden rounded-full bg-primary/10 border border-primary/10">
        <div
          className={`h-full transition-all ${
            energyPercentage > 80 
              ? "bg-gradient-to-r from-red-700 to-red-500" 
              : energyPercentage > 50 
                ? "bg-gradient-to-r from-yellow-600 to-yellow-400" 
                : "bg-gradient-to-r from-green-600 to-green-400"
          }`}
          style={{ width: `${energyPercentage}%` }}
        />
      </div>
      
      {/* Warning message if cost is too high */}
      {currentCost > energy && (
        <div className="flex items-center gap-2 text-xs text-red-400 mt-1 bg-red-900/20 p-2 rounded border border-red-800/30">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
          </svg>
          <span>Cast will fail due to insufficient energy</span>
        </div>
      )}
      
      <div className="flex justify-between text-xs text-muted-foreground mt-1">
        <span>Safe</span>
        <span>Moderate</span>
        <span>High Risk</span>
      </div>
    </div>
  );
}
