import { useState } from "react";
import { useGame } from "../lib/stores/useGame";
import { useSpell } from "../lib/stores/useSpell";
import { useSimulation } from "../lib/stores/useSimulation";
import SimulationGrid from "./SimulationGrid";
import EnergyCost from "./EnergyCost";
import CameraCapture from "./CameraCapture";
import Terminal from "./Terminal";

export default function Layout() {
  const [showHelp, setShowHelp] = useState(false);
  const [activeTab, setActiveTab] = useState<'spell' | 'camera'>('spell');
  const { phase } = useGame();
  const { energy } = useSpell();
  const { simulationState } = useSimulation();
  
  return (
    <div className="w-full h-full p-2 md:p-4 text-white">
      {/* Mobile view tabs - Only visible on small screens */}
      <div className="md:hidden flex w-full mb-2">
        <button 
          className={`mobile-tab-button ${activeTab === 'spell' ? 'active' : ''}`}
          onClick={() => setActiveTab('spell')}
        >
          Spell Interface
        </button>
        <button 
          className={`mobile-tab-button ${activeTab === 'camera' ? 'active' : ''}`}
          onClick={() => setActiveTab('camera')}
        >
          Camera
        </button>
      </div>
      
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 md:gap-3">
          <img src="/logo.svg" alt="AetherCast Logo" className="w-8 h-8 md:w-12 md:h-12 aethercast-glow" />
          <h1 className="text-xl md:text-3xl font-bold text-primary aethercast-glow">AetherCast</h1>
        </div>
        <button 
          onClick={() => setShowHelp(!showHelp)}
          className="px-2 py-1 md:px-4 md:py-2 text-xs md:text-sm rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
        >
          {showHelp ? "Hide Help" : "Show Help"}
        </button>
      </div>
      
      {showHelp && (
        <div className="bg-black/60 border border-primary/30 p-3 rounded-md text-sm mb-4 max-h-[60vh] overflow-y-auto">
          <h3 className="font-bold text-primary mb-2">AetherCast Guide</h3>
          
          {/* Basic Syntax Section */}
          <div className="mb-4">
            <h4 className="text-primary-light font-semibold mb-1">Basic Syntax</h4>
            <pre className="text-xs overflow-auto bg-black/40 p-2 rounded">
{`focus: [Energy|Probability|Entropy|Time]
anchor: [Self|Object|Zone(radius:n)]
shift: [+|-]n%
cost: nE
intent: "Your intention here"
seal`}
            </pre>
          </div>
          
          {/* Example Stitched Spell Section */}
          <div className="mb-4">
            <h4 className="text-primary-light font-semibold mb-1">Example Stitched Spell</h4>
            <pre className="text-xs overflow-auto bg-black/40 p-2 rounded text-cyan-300">
{`↯ weave focus: Time anchor: Zone(radius:10) shift: Flow+150%
↯ bind focus: Probability anchor: Self shift: +25%
↯ bind focus: Entropy anchor: Object(ID:4231) shift: -50%
↯ intent: "Accelerate time, increase odds, stabilize artifact."
↯ seal`}
            </pre>
          </div>
          
          {/* Explanation Section */}
          <div className="mb-4">
            <h4 className="text-primary-light font-semibold mb-1">Explanation</h4>
            <ul className="text-xs list-disc pl-4 space-y-1">
              <li><span className="text-cyan-300">focus:</span> Choose which fundamental force to manipulate</li>
              <li><span className="text-cyan-300">anchor:</span> Determine where the spell takes effect</li>
              <li><span className="text-cyan-300">shift:</span> Define how much to alter the force</li>
              <li><span className="text-cyan-300">intent:</span> Add narrative willpower, increasing success odds</li>
              <li><span className="text-cyan-300">seal:</span> Finalize and cast the spell</li>
            </ul>
          </div>
          
          {/* Interface Reactions Section */}
          <div className="mb-4">
            <h4 className="text-primary-light font-semibold mb-1">Interface Reactions Upon Seal</h4>
            <ul className="text-xs list-disc pl-4 space-y-1">
              <li>Reality parameter monitors will react visually to your spell</li>
              <li>Background grid effects change based on targeted forces</li>
              <li>Ripple effects and glyphs appear to reflect the manipulation</li>
              <li>Energy expenditure occurs based on spell complexity</li>
            </ul>
          </div>
          
          {/* Advanced Tips */}
          <div>
            <h4 className="text-primary-light font-semibold mb-1">Advanced Tips</h4>
            <ul className="text-xs list-disc pl-4 space-y-1">
              <li>Stitched spells can combine multiple forces for powerful effects</li>
              <li>More complex spells cost more energy but have stronger impacts</li>
              <li>Use <span className="text-cyan-300">scry</span> command to view current reality parameters</li>
              <li>Discover hidden "true names" to bypass limitations</li>
            </ul>
          </div>
          
          <p className="mt-4 pt-2 border-t border-primary/30 text-xs text-muted-foreground italic">Mastering stitched spells is the first step toward bending the Aether to your command.</p>
        </div>
      )}
      
      {/* Main interface - Full screen background with terminal overlay */}
      <div className="relative w-full h-[80vh] md:h-[85vh] rounded-xl overflow-hidden shadow-lg border border-primary/20">
        {activeTab === 'spell' || !activeTab ? (
          <>
            {/* Background 3D visualization */}
            <div className="absolute inset-0 w-full h-full">
              <SimulationGrid />
            </div>
            
            {/* Reality parameters panel was removed as it's redundant with the one in Terminal */}
            
            {/* Terminal overlay - centered with transparency */}
            <div className="absolute inset-0 flex items-center justify-center z-50">
              <div className="w-full max-w-6xl h-full flex items-center justify-center p-6">
                <div className="w-full h-[350px]">
                  <Terminal />
                </div>
              </div>
            </div>
            
            {/* Available Energy panel was removed as requested */}
          </>
        ) : (
          // Camera View
          <div className="w-full h-full">
            <CameraCapture />
          </div>
        )}
      </div>
    </div>
  );
}
