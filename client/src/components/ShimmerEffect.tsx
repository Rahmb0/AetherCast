import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export default function ShimmerEffect() {
  const shimmerRef = useRef<THREE.ShaderMaterial>(null);
  
  // Simple vertex shader
  const vertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;
  
  // Fragment shader for the shimmer effect
  const fragmentShader = `
    uniform float uTime;
    varying vec2 vUv;
    
    // Noise function
    float random(vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
    }
    
    // 2D Noise based on Morgan McGuire
    float noise(vec2 st) {
      vec2 i = floor(st);
      vec2 f = fract(st);
      
      // Four corners in 2D of a tile
      float a = random(i);
      float b = random(i + vec2(1.0, 0.0));
      float c = random(i + vec2(0.0, 1.0));
      float d = random(i + vec2(1.0, 1.0));
      
      // Smooth interpolation
      vec2 u = f * f * (3.0 - 2.0 * f);
      
      // Mix 4 corners
      return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
    }
    
    void main() {
      // Create a grid effect
      vec2 st = vUv * 40.0;
      
      // Time-based animation
      float t = uTime * 0.2;
      
      // Generate noise patterns
      float n1 = noise(st + t);
      float n2 = noise(st * 2.0 - t);
      
      // Create shimmer effect with noise and sine waves
      float shimmer = n1 * abs(sin(vUv.y * 10.0 + uTime)) * abs(sin(vUv.x * 5.0 - uTime * 0.5));
      shimmer += n2 * 0.2;
      
      // Create grid lines
      float gridX = step(0.98, fract(vUv.x * 20.0));
      float gridY = step(0.98, fract(vUv.y * 20.0));
      float grid = max(gridX, gridY) * 0.1;
      
      // Combine effects
      vec3 color = vec3(0.05, 0.05, 0.1); // Dark blue base
      
      // Add shimmer as purple/blue highlights
      color += vec3(0.2, 0.1, 0.4) * shimmer;
      
      // Add grid
      color += vec3(0.1, 0.1, 0.3) * grid;
      
      gl_FragColor = vec4(color, 1.0);
    }
  `;
  
  // Animate shimmer effect
  useFrame(({ clock }) => {
    if (shimmerRef.current) {
      shimmerRef.current.uniforms.uTime.value = clock.getElapsedTime();
    }
  });
  
  return (
    <mesh position={[0, 0, -5]}>
      <planeGeometry args={[100, 100]} />
      <shaderMaterial
        ref={shimmerRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={{
          uTime: { value: 0 }
        }}
      />
    </mesh>
  );
}
