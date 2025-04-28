import { useRef, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useSimulation } from "@/lib/stores/useSimulation";
import Particles from "./Particles";
import SpellEffects from "./SpellEffects";
import * as THREE from "three";

// Simulation grid component
function SimulationGrid() {
  const { simulationState, setSimulationDimensions } = useSimulation();
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Update simulation dimensions when container size changes
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setSimulationDimensions(rect.width, rect.height);
      }
    };
    
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, [setSimulationDimensions]);
  
  return (
    <div 
      ref={containerRef} 
      className="w-full h-full rounded-lg overflow-hidden border border-primary/20 relative"
    >
      {/* Standard 2D Grid View */}
      <Canvas camera={{ position: [0, 0, 100], fov: 50 }}>
        <color attach="background" args={["#050510"]} />
        <GridLines />
        <Particles />
        <SpellEffects />
      </Canvas>
    </div>
  );
}

// Grid lines component with reduced complexity
function GridLines() {
  const gridRef = useRef<THREE.Group>(null);
  const { viewport } = useThree();
  const { simulationState: { timeSpeed, entropyLevel } } = useSimulation();
  const frameCounter = useRef(0);
  
  // Even less frequent animation updates
  useFrame(({ clock }) => {
    if (!gridRef.current) return;
    
    // Only update every 10th frame to reduce CPU/GPU load and make the grid more stable
    frameCounter.current += 1;
    if (frameCounter.current % 10 !== 0) return;
    
    // Apply time distortion effect with greatly reduced intensity
    const pulseIntensity = Math.sin(clock.elapsedTime * timeSpeed * 0.1) * 0.01;
    
    // Simplified entropy effect using sin instead of random for stability, with reduced frequency
    const entropyFactor = entropyLevel / 200; // Reduced factor
    const entropyOffset = Math.sin(clock.elapsedTime * 0.2) * entropyFactor * 0.01;
    
    gridRef.current.rotation.z = pulseIntensity + entropyOffset;
    
    // Scale with reduced intensity for more stability
    const scale = 1 + pulseIntensity * 0.2;
    gridRef.current.scale.set(scale, scale, 1);
  });
  
  // Calculate grid size based on viewport
  const gridSize = Math.max(viewport.width, viewport.height) * 1.5;
  // Further reduced line count for better performance
  const lineCount = 8;
  const lineSpacing = gridSize / lineCount;
  
  const lines = [];
  
  // Create horizontal and vertical grid lines with fewer segments
  for (let i = -lineCount / 2; i <= lineCount / 2; i++) {
    // Skip the center line for an even more minimal grid
    if (i === 0) continue;
    
    const position = i * lineSpacing;
    
    // Horizontal lines
    lines.push(
      <line key={`h-${i}`}>
        <bufferGeometry attach="geometry">
          <bufferAttribute
            attach="attributes-position"
            count={2}
            array={new Float32Array([-gridSize/2, position, 0, gridSize/2, position, 0])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial 
          attach="material" 
          color="#334155" 
          opacity={0.25} // Reduced opacity
          transparent
        />
      </line>
    );
    
    // Vertical lines
    lines.push(
      <line key={`v-${i}`}>
        <bufferGeometry attach="geometry">
          <bufferAttribute
            attach="attributes-position"
            count={2}
            array={new Float32Array([position, -gridSize/2, 0, position, gridSize/2, 0])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial 
          attach="material" 
          color="#334155" 
          opacity={0.25} // Reduced opacity
          transparent
        />
      </line>
    );
  }
  
  return (
    <group ref={gridRef}>
      {lines}
    </group>
  );
}

export default SimulationGrid;
