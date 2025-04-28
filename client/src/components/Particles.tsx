import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useSimulation } from "@/lib/stores/useSimulation";
import * as THREE from "three";

// Reduced particle count to improve performance
const PARTICLE_COUNT = 200;

function Particles() {
  const { viewport } = useThree();
  const pointsRef = useRef<THREE.Points>(null);
  const { simulationState } = useSimulation();
  
  // Create particles with positions, sizes, and colors
  const particlesPosition = new Float32Array(PARTICLE_COUNT * 3);
  const particlesSizes = new Float32Array(PARTICLE_COUNT);
  const particlesColor = new Float32Array(PARTICLE_COUNT * 3);
  
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    // Spread particles across the viewport with some depth
    const i3 = i * 3;
    particlesPosition[i3] = (Math.random() - 0.5) * viewport.width * 2;
    particlesPosition[i3 + 1] = (Math.random() - 0.5) * viewport.height * 2;
    particlesPosition[i3 + 2] = (Math.random() - 0.5) * 50;
    
    // Vary particle sizes
    particlesSizes[i] = Math.random() * 2 + 0.5;
    
    // Base colors - different particle types have different hues
    if (i % 4 === 0) { // Energy particles (gold)
      particlesColor[i3] = 1.0;
      particlesColor[i3 + 1] = 0.7;
      particlesColor[i3 + 2] = 0.0;
    } else if (i % 4 === 1) { // Probability particles (purple)
      particlesColor[i3] = 0.6;
      particlesColor[i3 + 1] = 0.4;
      particlesColor[i3 + 2] = 1.0;
    } else if (i % 4 === 2) { // Entropy particles (red)
      particlesColor[i3] = 1.0;
      particlesColor[i3 + 1] = 0.3;
      particlesColor[i3 + 2] = 0.2;
    } else { // Time particles (blue)
      particlesColor[i3] = 0.3;
      particlesColor[i3 + 1] = 0.6;
      particlesColor[i3 + 2] = 1.0;
    }
  }
  
  // Frame counter for throttling updates
  const frameCounter = useRef(0);
  
  // Animate particles based on simulation state with reduced update frequency
  useFrame(({ clock }) => {
    if (pointsRef.current) {
      // Only update every 2nd frame to reduce CPU/GPU load
      frameCounter.current += 1;
      if (frameCounter.current % 2 !== 0) return;
      
      const positions = (pointsRef.current.geometry.attributes.position as THREE.BufferAttribute).array as Float32Array;
      const sizes = (pointsRef.current.geometry.attributes.size as THREE.BufferAttribute).array as Float32Array;
      
      const time = clock.getElapsedTime();
      const timeSpeed = simulationState.timeSpeed;
      const entropyLevel = simulationState.entropyLevel;
      const probabilityShift = simulationState.probabilityShift;
      
      // Using a step size to process fewer particles per frame
      const stepSize = 2; // Process half the particles
      
      for (let i = 0; i < PARTICLE_COUNT; i += stepSize) {
        const i3 = i * 3;
        
        // Apply time-based movement
        const timeOffset = time * timeSpeed * 0.2; // Reduced animation speed
        
        // Movement pattern depends on particle type
        if (i % 4 === 0) { // Energy particles
          positions[i3] += Math.sin(timeOffset + i) * 0.02;
          positions[i3 + 1] += Math.cos(timeOffset + i) * 0.02;
        } else if (i % 4 === 1) { // Probability particles
          positions[i3] += Math.sin(timeOffset + i * 0.5) * 0.03 * (probabilityShift / 100 + 1);
          positions[i3 + 1] += Math.cos(timeOffset + i * 0.5) * 0.03 * (probabilityShift / 100 + 1);
        } else if (i % 4 === 2) { // Entropy particles
          // Simplified entropy particles movement
          positions[i3] += (Math.sin(i + time) * 0.05) * (entropyLevel / 100);
          positions[i3 + 1] += (Math.cos(i + time) * 0.05) * (entropyLevel / 100);
        } else { // Time particles
          positions[i3] += Math.sin(timeOffset * 2 + i * 0.3) * 0.015;
          positions[i3 + 1] += Math.cos(timeOffset * 2 + i * 0.3) * 0.015;
        }
        
        // Wrap particles if they go off-screen
        const halfWidth = viewport.width;
        const halfHeight = viewport.height;
        
        if (positions[i3] < -halfWidth) positions[i3] = halfWidth;
        if (positions[i3] > halfWidth) positions[i3] = -halfWidth;
        if (positions[i3 + 1] < -halfHeight) positions[i3 + 1] = halfHeight;
        if (positions[i3 + 1] > halfHeight) positions[i3 + 1] = -halfHeight;
        
        // Simplified size pulsing with less frequent updates
        sizes[i] = particlesSizes[i] * (1 + Math.sin(time * 0.5 + i * 0.1) * 0.2);
      }
      
      // Update the geometries
      (pointsRef.current.geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;
      (pointsRef.current.geometry.attributes.size as THREE.BufferAttribute).needsUpdate = true;
    }
  });
  
  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={PARTICLE_COUNT}
          array={particlesPosition}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={PARTICLE_COUNT}
          array={particlesColor}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={PARTICLE_COUNT}
          array={particlesSizes}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        size={2}
        sizeAttenuation
        vertexColors
        transparent
        alphaTest={0.01}
        depthWrite={false}
      />
    </points>
  );
}

export default Particles;
