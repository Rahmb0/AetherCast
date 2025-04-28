import React, { useEffect, useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { useSimulation } from '@/lib/stores/useSimulation';
import { FeedbackType, SimulationEffect } from '@/lib/SimulationEngine';
import { MeshProps } from '@react-three/fiber';

// Define types for scene objects
interface SceneObject {
  type: string;
  position: [number, number, number];
  scale: [number, number, number];
  color: string;
  rotation?: [number, number, number];
}

interface SceneData {
  type: string;
  timestamp: number;
}

type SceneModelCollection = {
  [key: string]: SceneObject[];
};

// Scene types for randomization
const SCENE_TYPES = [
  'forest',
  'desert',
  'ocean',
  'mountains',
  'urban',
  'abstract'
];

// Models for each scene type
const SCENE_MODELS: SceneModelCollection = {
  forest: [
    { type: 'terrain', scale: [20, 1, 20] as [number, number, number], position: [0, -1, 0] as [number, number, number], color: '#2d5f3c' },
    { type: 'cylinder', scale: [0.5, 5, 0.5] as [number, number, number], position: [-3, 1.5, -2] as [number, number, number], color: '#654321' }, // tree
    { type: 'cylinder', scale: [0.4, 4, 0.4] as [number, number, number], position: [2, 1, -3] as [number, number, number], color: '#5d4037' }, // tree
    { type: 'sphere', scale: [2, 2, 2] as [number, number, number], position: [-3, 4, -2] as [number, number, number], color: '#2e7d32' }, // tree top
    { type: 'sphere', scale: [1.5, 1.5, 1.5] as [number, number, number], position: [2, 3, -3] as [number, number, number], color: '#1b5e20' }, // tree top
    { type: 'box', scale: [1, 0.5, 1] as [number, number, number], position: [0, -0.5, 0] as [number, number, number], color: '#795548' } // stump
  ],
  desert: [
    { type: 'terrain', scale: [20, 1, 20] as [number, number, number], position: [0, -1, 0] as [number, number, number], color: '#d2b48c' },
    { type: 'box', scale: [1, 2, 1] as [number, number, number], position: [-2, 0, -3] as [number, number, number], color: '#cddc39' }, // cactus
    { type: 'sphere', scale: [3, 0.5, 3] as [number, number, number], position: [3, -0.5, 0] as [number, number, number], color: '#ffd54f' }, // sand dune
    { type: 'box', scale: [0.8, 0.8, 0.8] as [number, number, number], position: [0, -0.5, -2] as [number, number, number], color: '#fff59d' } // rock
  ],
  ocean: [
    { type: 'terrain', scale: [20, 1, 20] as [number, number, number], position: [0, -5, 0] as [number, number, number], color: '#039be5' },
    { type: 'sphere', scale: [1, 0.5, 1] as [number, number, number], position: [-3, -4.5, 0] as [number, number, number], color: '#4fc3f7' }, // wave
    { type: 'sphere', scale: [0.8, 0.4, 0.8] as [number, number, number], position: [2, -4.6, -2] as [number, number, number], color: '#4fc3f7' }, // wave
    { type: 'box', scale: [0.5, 0.5, 0.5] as [number, number, number], position: [0, -4.5, -3] as [number, number, number], color: '#0097a7' }, // coral
  ],
  mountains: [
    { type: 'terrain', scale: [20, 1, 20] as [number, number, number], position: [0, -1, 0] as [number, number, number], color: '#4e342e' },
    { type: 'cone', scale: [3, 4, 3] as [number, number, number], position: [-4, 1, -4] as [number, number, number], color: '#757575' }, // mountain
    { type: 'cone', scale: [2, 3, 2] as [number, number, number], position: [3, 0.5, -3] as [number, number, number], color: '#616161' }, // mountain
    { type: 'sphere', scale: [1, 0.2, 1] as [number, number, number], position: [-4, 3, -4] as [number, number, number], color: '#eeeeee' }, // snow cap
    { type: 'sphere', scale: [0.6, 0.1, 0.6] as [number, number, number], position: [3, 2, -3] as [number, number, number], color: '#eeeeee' }, // snow cap
  ],
  urban: [
    { type: 'terrain', scale: [20, 1, 20] as [number, number, number], position: [0, -1, 0] as [number, number, number], color: '#546e7a' },
    { type: 'box', scale: [2, 5, 2] as [number, number, number], position: [-3, 1.5, -3] as [number, number, number], color: '#bdbdbd' }, // building
    { type: 'box', scale: [1.5, 3, 1.5] as [number, number, number], position: [2, 0.5, -2] as [number, number, number], color: '#90a4ae' }, // building
    { type: 'box', scale: [1, 2, 1] as [number, number, number], position: [0, 0, 0] as [number, number, number], color: '#78909c' }, // building
    { type: 'box', scale: [6, 0.1, 1] as [number, number, number], position: [0, -0.9, 2] as [number, number, number], color: '#455a64' }, // road
  ],
  abstract: [
    { type: 'terrain', scale: [20, 1, 20] as [number, number, number], position: [0, -1, 0] as [number, number, number], color: '#000000' },
    { type: 'sphere', scale: [1, 1, 1] as [number, number, number], position: [-2, 0, -2] as [number, number, number], color: '#e91e63' },
    { type: 'box', scale: [1, 1, 1] as [number, number, number], position: [2, 0, -1] as [number, number, number], color: '#2196f3' },
    { type: 'cylinder', scale: [0.5, 3, 0.5] as [number, number, number], position: [0, 0.5, -3] as [number, number, number], color: '#ffeb3b' },
    { type: 'torus', scale: [1, 0.3, 1] as [number, number, number], position: [0, 2, 0] as [number, number, number], color: '#4caf50' },
  ]
};

// Define particle type for 3D effects
interface Particle {
  position: [number, number, number];
  size: number;
  color: string;
  velocity: [number, number, number];
  life: number;
}

// Scene object generation
function SceneObject({ 
  type, 
  position, 
  scale, 
  color, 
  rotation = [0, 0, 0] as [number, number, number], 
  sceneData 
}: {
  type: string;
  position: [number, number, number];
  scale: [number, number, number];
  color: string;
  rotation?: [number, number, number];
  sceneData: SceneData;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { simulationState } = useSimulation();
  const [meshRotation, setMeshRotation] = useState<[number, number, number]>(rotation);
  const [meshPosition, setMeshPosition] = useState<[number, number, number]>(position);
  const [meshScale, setMeshScale] = useState<[number, number, number]>(scale);
  
  // Apply transformations based on spell effects
  useEffect(() => {
    if (simulationState.activeEffects.length > 0) {
      // Apply effects based on focus type
      simulationState.activeEffects.forEach(effect => {
        if (effect.focus === 'Energy') {
          // Energy affects scale
          const newScale: [number, number, number] = [
            scale[0] * (1 + effect.shiftAmount / 200),
            scale[1] * (1 + effect.shiftAmount / 200),
            scale[2] * (1 + effect.shiftAmount / 200)
          ];
          setMeshScale(newScale);
        } else if (effect.focus === 'Probability') {
          // Probability affects position slightly
          const newPosition: [number, number, number] = [
            position[0] + (Math.random() - 0.5) * effect.shiftAmount / 20,
            position[1] + (Math.random() - 0.5) * effect.shiftAmount / 20,
            position[2] + (Math.random() - 0.5) * effect.shiftAmount / 20
          ];
          setMeshPosition(newPosition);
        } else if (effect.focus === 'Entropy') {
          // Entropy affects rotation
          const newRotation: [number, number, number] = [
            rotation[0] + Math.sin(Date.now() / 1000) * effect.shiftAmount / 100,
            rotation[1] + Math.cos(Date.now() / 1000) * effect.shiftAmount / 100,
            rotation[2] + Math.sin(Date.now() / 1500) * effect.shiftAmount / 100
          ];
          setMeshRotation(newRotation);
        }
      });
    } else {
      // Reset to default
      setMeshRotation(rotation);
      setMeshPosition(position);
      setMeshScale(scale);
    }
  }, [simulationState.activeEffects, position, rotation, scale]);
  
  // Animation loop
  useFrame((state, delta) => {
    if (meshRef.current) {
      // Apply time effects if any
      const timeEffect = simulationState.activeEffects.find(effect => effect.focus === 'Time');
      
      if (timeEffect) {
        // Time affects continuous rotation
        meshRef.current.rotation.y += delta * timeEffect.shiftAmount / 50;
      } else {
        // Slight ambient movement
        meshRef.current.rotation.y += delta * 0.05;
      }
    }
  });
  
  // Generate the appropriate geometry based on type
  let geometry;
  switch(type) {
    case 'box':
      geometry = <boxGeometry args={[1, 1, 1]} />;
      break;
    case 'sphere':
      geometry = <sphereGeometry args={[0.5, 32, 32]} />;
      break;
    case 'cylinder':
      geometry = <cylinderGeometry args={[0.5, 0.5, 1, 32]} />;
      break;
    case 'cone':
      geometry = <coneGeometry args={[0.5, 1, 32]} />;
      break;
    case 'torus':
      geometry = <torusGeometry args={[0.5, 0.2, 16, 32]} />;
      break;
    case 'terrain':
      // Fix the plane geometry by not using rotation in props
      geometry = <planeGeometry args={[1, 1, 32, 32]} />;
      break;
    default:
      geometry = <boxGeometry args={[1, 1, 1]} />;
  }
  
  return (
    <mesh
      ref={meshRef}
      position={meshPosition}
      scale={meshScale}
      rotation={meshRotation}
    >
      {geometry}
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

// Scene container
function SceneContainer({ sceneType }: { sceneType: string }) {
  const models = SCENE_MODELS[sceneType as keyof typeof SCENE_MODELS] || SCENE_MODELS.abstract;
  const sceneData: SceneData = {
    type: sceneType,
    timestamp: Date.now()
  };
  
  return (
    <group>
      {models.map((model: SceneObject, index: number) => (
        <SceneObject 
          key={`${sceneType}-${index}`} 
          {...model} 
          sceneData={sceneData}
        />
      ))}
    </group>
  );
}

// Particles for visualization of spell effects
function SpellEffects() {
  const { simulationState } = useSimulation();
  const particlesRef = useRef<THREE.Group>(null);
  const [particles, setParticles] = useState<Particle[]>([]);
  
  // Generate particles when new effects are applied
  useEffect(() => {
    if (simulationState.activeEffects.length > 0) {
      // Generate new particles based on effect type
      const newParticles = simulationState.activeEffects.flatMap(effect => {
        // Determine particle color based on focus
        let color;
        switch(effect.focus) {
          case 'Energy': color = '#FFA500'; break;
          case 'Probability': color = '#9370DB'; break;
          case 'Entropy': color = '#FF4500'; break;
          case 'Time': color = '#4682B4'; break;
          default: color = '#FFFFFF';
        }
        
        // Create 10 particles per effect
        return Array.from({ length: 10 }, () => {
          // Create properly typed position and velocity
          const position: [number, number, number] = [
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 5,
            (Math.random() - 0.5) * 10
          ];
          
          const velocity: [number, number, number] = [
            (Math.random() - 0.5) * 0.1,
            (Math.random() - 0.5) * 0.1,
            (Math.random() - 0.5) * 0.1
          ];
          
          // Return properly typed particle
          return {
            position,
            size: Math.random() * 0.3 + 0.1,
            color,
            velocity,
            life: Math.random() * 2 + 3
          } as Particle;
        });
      });
      
      setParticles(prev => [...prev, ...newParticles]);
    }
  }, [simulationState.activeEffects]);
  
  // Update particle positions and lifecycles
  useFrame((state, delta) => {
    if (particles.length > 0) {
      setParticles(prev => 
        prev
          .map(particle => {
            // Create properly typed position
            const newPosition: [number, number, number] = [
              particle.position[0] + particle.velocity[0],
              particle.position[1] + particle.velocity[1],
              particle.position[2] + particle.velocity[2]
            ];
            
            // Return updated particle with correct types
            return {
              ...particle,
              position: newPosition,
              life: particle.life - delta
            } as Particle;
          })
          .filter(particle => particle.life > 0)
      );
    }
  });
  
  return (
    <group ref={particlesRef}>
      {particles.map((particle, i) => (
        <mesh key={`particle-${i}`} position={particle.position}>
          <sphereGeometry args={[particle.size, 8, 8]} />
          <meshBasicMaterial color={particle.color} transparent opacity={particle.life / 5} />
        </mesh>
      ))}
    </group>
  );
}

// Main component
export default function AetherScene() {
  const [currentScene, setCurrentScene] = useState(SCENE_TYPES[0]);
  const { simulationState, triggerFeedback } = useSimulation();
  
  // Randomly change scenes based on entropy level, but much less frequently
  useEffect(() => {
    if (simulationState.entropyLevel > 0.5) {
      const entropyTimer = setInterval(() => {
        const randomSceneIndex = Math.floor(Math.random() * SCENE_TYPES.length);
        setCurrentScene(SCENE_TYPES[randomSceneIndex]);
      }, 60000); // Change every 60 seconds when entropy is high, instead of 10 seconds
      
      return () => clearInterval(entropyTimer);
    }
  }, [simulationState.entropyLevel]);
  
  return (
    <Canvas 
      camera={{ position: [0, 5, 10], fov: 50 }}
      style={{ background: 'linear-gradient(to bottom, #000000, #0a0a2c)' }}
    >
      <ambientLight intensity={0.3} />
      <directionalLight 
        position={[5, 5, 5]} 
        intensity={0.5} 
        castShadow 
      />
      <pointLight 
        position={[-5, 5, -5]} 
        intensity={0.3} 
        color="#8080ff" 
      />
      
      {/* Scene elements */}
      <SceneContainer sceneType={currentScene} />
      
      {/* Particle effects */}
      <SpellEffects />
      
      {/* Controls for interactivity */}
      <OrbitControls 
        enableZoom={true} 
        enablePan={true} 
        enableRotate={true}
        minDistance={3}
        maxDistance={20}
      />
    </Canvas>
  );
}