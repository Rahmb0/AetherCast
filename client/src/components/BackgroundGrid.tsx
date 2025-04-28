import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function BackgroundGrid() {
  const gridRef = useRef<THREE.Group>(null);
  
  // Create a grid pattern
  useFrame(({ clock }) => {
    if (gridRef.current) {
      // Subtle rotation and pulsing
      const time = clock.getElapsedTime();
      gridRef.current.rotation.z = Math.sin(time * 0.1) * 0.03;
      
      // Scale slightly based on time
      const scale = 1 + Math.sin(time * 0.2) * 0.02;
      gridRef.current.scale.set(scale, scale, 1);
    }
  });
  
  // Create a hexagonal grid for a more arcane feel
  const hexGrid = [];
  const gridSize = 20;
  const hexRadius = 1.5;
  
  for (let q = -gridSize; q <= gridSize; q++) {
    for (let r = -gridSize; r <= gridSize; r++) {
      // Calculate s-coordinate based on q and r in a hex grid
      const s = -q - r;
      
      // Skip if the hex is too far from center
      if (Math.abs(q) + Math.abs(r) + Math.abs(s) > gridSize * 2) continue;
      
      // Calculate pixel coordinates
      const x = hexRadius * 3/2 * q;
      const y = hexRadius * Math.sqrt(3) * (r + q/2);
      
      // Calculate distance from center for coloring
      const distFromCenter = Math.sqrt(x*x + y*y) / (gridSize * hexRadius);
      const opacity = Math.max(0, 1 - distFromCenter * 1.5);
      
      // Add hexagon
      hexGrid.push(
        <mesh key={`${q},${r}`} position={[x, y, 0]}>
          <circleGeometry args={[hexRadius * 0.1, 6]} />
          <meshBasicMaterial 
            color={new THREE.Color(0.3, 0.4, 0.8)} 
            transparent 
            opacity={opacity * 0.3}
          />
        </mesh>
      );
      
      // Add connecting lines to nearest neighbors only if close enough to center
      if (opacity > 0.1) {
        // Neighbors in hex grid
        const neighbors = [
          [q+1, r], [q, r+1], [q-1, r+1],
          [q-1, r], [q, r-1], [q+1, r-1]
        ];
        
        for (const [nq, nr] of neighbors) {
          // Skip connections to hexes that are too far
          if (Math.abs(nq) + Math.abs(nr) + Math.abs(-nq-nr) > gridSize * 2) continue;
          
          // Calculate neighbor position
          const nx = hexRadius * 3/2 * nq;
          const ny = hexRadius * Math.sqrt(3) * (nr + nq/2);
          
          // Points for line
          const linePoints = [];
          linePoints.push(new THREE.Vector3(x, y, 0));
          linePoints.push(new THREE.Vector3(nx, ny, 0));
          
          hexGrid.push(
            <group key={`line-${q},${r}-${nq},${nr}`}>
              <line>
                <bufferGeometry attach="geometry">
                  <bufferAttribute
                    attach="attributes-position"
                    count={2}
                    array={new Float32Array([x, y, 0, nx, ny, 0])}
                    itemSize={3}
                  />
                </bufferGeometry>
                <lineBasicMaterial 
                  attach="material"
                  color={new THREE.Color(0.2, 0.3, 0.7)} 
                  transparent 
                  opacity={opacity * 0.15}
                />
              </line>
            </group>
          );
        }
      }
    }
  }
  
  // Add symbols at key points
  const symbols = [
    // Energy
    <mesh key="energySymbol" position={[0, -12, 0]}>
      <circleGeometry args={[0.8, 32]} />
      <meshBasicMaterial color={new THREE.Color(1, 0.65, 0)} transparent opacity={0.7} />
    </mesh>,
    // Probability
    <mesh key="probSymbol" position={[12, 0, 0]}>
      <circleGeometry args={[0.8, 32]} />
      <meshBasicMaterial color={new THREE.Color(0.58, 0.44, 0.86)} transparent opacity={0.7} />
    </mesh>,
    // Entropy
    <mesh key="entropySymbol" position={[0, 12, 0]}>
      <circleGeometry args={[0.8, 32]} />
      <meshBasicMaterial color={new THREE.Color(1, 0.27, 0)} transparent opacity={0.7} />
    </mesh>,
    // Time
    <mesh key="timeSymbol" position={[-12, 0, 0]}>
      <circleGeometry args={[0.8, 32]} />
      <meshBasicMaterial color={new THREE.Color(0.29, 0.61, 0.83)} transparent opacity={0.7} />
    </mesh>
  ];
  
  return (
    <group ref={gridRef}>
      {hexGrid}
      {symbols}
    </group>
  );
}