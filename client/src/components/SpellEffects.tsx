import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useSimulation } from "@/lib/stores/useSimulation";
import * as THREE from "three";

export default function SpellEffects() {
  const { simulationState } = useSimulation();
  const ringRef = useRef<THREE.Mesh>(null);
  const frameCounter = useRef(0);
  const colorRef = useRef("#FFFFFF");
  const sigils = useRef<THREE.Group>(new THREE.Group());
  
  // Initialize sigils group
  useEffect(() => {
    if (!sigils.current.parent) {
      // Add sigils to the scene
      const scene = ringRef.current?.parent;
      if (scene) {
        scene.add(sigils.current);
      }
    }
    
    return () => {
      // Clean up on unmount
      sigils.current.parent?.remove(sigils.current);
    };
  }, []);
  
  // Create a spell sigil effect
  const createSigil = (focus: string, position: [number, number, number] = [0, 0, 0]) => {
    // Get color based on focus
    let color: string;
    switch (focus) {
      case "Energy": color = "#F59E0B"; break;
      case "Probability": color = "#7C3AED"; break;
      case "Entropy": color = "#EF4444"; break;
      case "Time": color = "#0EA5E9"; break;
      default: color = "#FFFFFF";
    }
    
    // Create sigil geometry
    const geometry = new THREE.RingGeometry(3, 3.5, 32);
    const material = new THREE.MeshBasicMaterial({ 
      color: new THREE.Color(color),
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide
    });
    
    const ring = new THREE.Mesh(geometry, material);
    ring.position.set(...position);
    
    // Create inner symbols based on focus
    const innerGeom = new THREE.CircleGeometry(2.5, 32);
    const innerMat = new THREE.MeshBasicMaterial({ 
      color: new THREE.Color(color),
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide
    });
    
    const innerCircle = new THREE.Mesh(innerGeom, innerMat);
    innerCircle.position.set(...position);
    
    // Create a group for this sigil
    const sigilGroup = new THREE.Group();
    sigilGroup.add(ring);
    sigilGroup.add(innerCircle);
    
    // Add lines specific to each focus type
    const lineMat = new THREE.LineBasicMaterial({ color: new THREE.Color(color) });
    
    switch (focus) {
      case "Energy": {
        // Energy: radial lines
        for (let i = 0; i < 8; i++) {
          const lineGeom = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(Math.cos(i * Math.PI/4) * 2, Math.sin(i * Math.PI/4) * 2, 0)
          ]);
          const line = new THREE.Line(lineGeom, lineMat);
          line.position.set(...position);
          sigilGroup.add(line);
        }
        break;
      }
      case "Probability": {
        // Probability: branching paths
        const points = [
          new THREE.Vector3(-2, 0, 0),
          new THREE.Vector3(0, 0, 0),
          new THREE.Vector3(1, 1, 0),
          new THREE.Vector3(2, 0, 0)
        ];
        const lineGeom = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(lineGeom, lineMat);
        line.position.set(...position);
        sigilGroup.add(line);
        
        const points2 = [
          new THREE.Vector3(0, 0, 0),
          new THREE.Vector3(1, -1, 0),
          new THREE.Vector3(2, 0, 0)
        ];
        const lineGeom2 = new THREE.BufferGeometry().setFromPoints(points2);
        const line2 = new THREE.Line(lineGeom2, lineMat);
        line2.position.set(...position);
        sigilGroup.add(line2);
        break;
      }
      case "Entropy": {
        // Entropy: chaotic pattern
        const points = [];
        for (let i = 0; i < 10; i++) {
          points.push(new THREE.Vector3(
            (Math.random() - 0.5) * 4,
            (Math.random() - 0.5) * 4,
            0
          ));
        }
        const lineGeom = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(lineGeom, lineMat);
        line.position.set(...position);
        sigilGroup.add(line);
        break;
      }
      case "Time": {
        // Time: spiral pattern
        const points = [];
        for (let i = 0; i < 50; i++) {
          const t = i / 10;
          points.push(new THREE.Vector3(
            t * Math.cos(t * 2),
            t * Math.sin(t * 2),
            0
          ));
        }
        const lineGeom = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(lineGeom, lineMat);
        line.position.set(...position);
        sigilGroup.add(line);
        break;
      }
    }
    
    // Animation properties
    sigilGroup.userData = {
      focus,
      createTime: Date.now(),
      lifetime: 3000, // ms
      scale: 0,
      rotation: 0
    };
    
    // Add to sigils group
    sigils.current.add(sigilGroup);
  };
  
  // Update and animate all sigils
  useFrame(({ clock }) => {
    // Process ring effect (larger stationary ring)
    if (!ringRef.current) return;
    
    // Only update every 3rd frame to reduce CPU/GPU load
    frameCounter.current += 1;
    if (frameCounter.current % 3 !== 0) return;
    
    // Update color based on latest spell focus
    if (ringRef.current.material) {
      let newColor;
      switch (simulationState.lastSpellFocus) {
        case "Energy": newColor = "#F59E0B"; break;
        case "Probability": newColor = "#7C3AED"; break;
        case "Entropy": newColor = "#EF4444"; break;
        case "Time": newColor = "#0EA5E9"; break;
        default: newColor = "#FFFFFF";
      }
      
      if (colorRef.current !== newColor) {
        colorRef.current = newColor;
        (ringRef.current.material as THREE.MeshBasicMaterial).color.set(newColor);
      }
    }
    
    const time = clock.getElapsedTime();
    
    // Simplified pulsating with less amplitude
    const scale = 1 + Math.sin(time) * 0.1;
    ringRef.current.scale.set(scale, scale, 1);
    
    // Reduced rotation speed
    ringRef.current.rotation.z += 0.002 * simulationState.timeSpeed;
    
    // Process individual sigils
    const now = Date.now();
    for (let i = sigils.current.children.length - 1; i >= 0; i--) {
      const sigil = sigils.current.children[i];
      const data = sigil.userData;
      
      // Calculate age
      const age = now - data.createTime;
      
      if (age > data.lifetime) {
        // Remove expired sigil
        sigils.current.remove(sigil);
      } else {
        // Animate sigil
        const progress = age / data.lifetime;
        
        // Scale up then fade out
        let scale = 0;
        if (progress < 0.3) {
          // Scale up
          scale = progress / 0.3;
        } else {
          // Hold then scale down
          scale = 1 - ((progress - 0.3) / 0.7);
        }
        
        sigil.scale.set(scale, scale, 1);
        
        // Rotate
        sigil.rotation.z += 0.02;
        
        // Fade out
        sigil.children.forEach(child => {
          if ((child as THREE.Mesh).material) {
            ((child as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity = 
              Math.max(0, 1 - (progress * 1.2));
          }
        });
      }
    }
    
    // Create new sigils based on active effects
    simulationState.activeEffects.forEach(effect => {
      if (Math.random() < 0.005) { // Occasionally create new sigils 
        const x = (Math.random() - 0.5) * 60;
        const y = (Math.random() - 0.5) * 60;
        createSigil(effect.focus, [x, y, 0]);
      }
    });
  });
  
  // Only render when there are active effects
  if (simulationState.activeEffects.length === 0) {
    return null;
  }
  
  return (
    <mesh ref={ringRef} rotation={[0, 0, 0]} position={[0, 0, 0]}>
      <ringGeometry args={[25, 26, 64]} />
      <meshBasicMaterial 
        color={colorRef.current} 
        transparent={true} 
        opacity={0.2} 
        side={THREE.DoubleSide} 
      />
    </mesh>
  );
}