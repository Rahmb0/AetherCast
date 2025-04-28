import * as THREE from "three";

// Particle types for different simulation aspects
export enum ParticleType {
  Energy = "energy",
  Probability = "probability",
  Entropy = "entropy",
  Time = "time",
  Feedback = "feedback"
}

// Particle system configuration
export interface ParticleSystemConfig {
  maxParticles: number;
  particleSize: number;
  lifespan: number;  // in milliseconds
}

// Individual particle properties
export interface Particle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  acceleration: THREE.Vector3;
  color: THREE.Color;
  size: number;
  type: ParticleType;
  life: number;  // Current life value
  maxLife: number;  // Maximum life value
  rotation: number;
  rotationSpeed: number;
}

export class ParticleSystem {
  private particles: Particle[] = [];
  private config: ParticleSystemConfig;
  
  constructor(config: ParticleSystemConfig) {
    this.config = config;
  }
  
  /**
   * Emit a burst of particles of a specific type
   */
  emitBurst(
    position: THREE.Vector3,
    type: ParticleType,
    count: number,
    spread: number = 1.0,
    speed: number = 1.0
  ): void {
    for (let i = 0; i < count; i++) {
      // Calculate random direction with spread
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * spread;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      const z = (Math.random() - 0.5) * spread;
      
      // Create velocity vector
      const velocity = new THREE.Vector3(x, y, z).normalize().multiplyScalar(speed);
      
      // Add random spin
      const rotationSpeed = (Math.random() - 0.5) * 0.1;
      
      // Determine color based on type
      const color = this.getColorForType(type);
      
      // Create particle
      const particle: Particle = {
        position: position.clone(),
        velocity,
        acceleration: new THREE.Vector3(0, 0, 0),
        color,
        size: this.config.particleSize * (0.5 + Math.random() * 0.5),
        type,
        life: this.config.lifespan,
        maxLife: this.config.lifespan,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed
      };
      
      this.particles.push(particle);
      
      // Limit total particles
      if (this.particles.length > this.config.maxParticles) {
        this.particles.shift(); // Remove oldest particle
      }
    }
  }
  
  /**
   * Emit particles in a specific pattern (circle, line, etc.)
   */
  emitPattern(
    center: THREE.Vector3,
    type: ParticleType,
    pattern: "circle" | "spiral" | "explosion",
    count: number,
    size: number = 5.0,
    speed: number = 0.5
  ): void {
    switch (pattern) {
      case "circle":
        for (let i = 0; i < count; i++) {
          const angle = (i / count) * Math.PI * 2;
          const x = Math.cos(angle) * size;
          const y = Math.sin(angle) * size;
          
          const position = center.clone().add(new THREE.Vector3(x, y, 0));
          const velocity = new THREE.Vector3(x, y, 0)
            .normalize()
            .multiplyScalar(speed);
          
          const color = this.getColorForType(type);
          
          const particle: Particle = {
            position,
            velocity,
            acceleration: new THREE.Vector3(0, -0.01, 0),
            color,
            size: this.config.particleSize,
            type,
            life: this.config.lifespan,
            maxLife: this.config.lifespan,
            rotation: angle,
            rotationSpeed: 0.01
          };
          
          this.particles.push(particle);
        }
        break;
        
      case "spiral":
        for (let i = 0; i < count; i++) {
          const t = i / count;
          const angle = t * Math.PI * 10;
          const radius = t * size;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          
          const position = center.clone().add(new THREE.Vector3(x, y, 0));
          const velocity = new THREE.Vector3(
            Math.cos(angle + Math.PI/2),
            Math.sin(angle + Math.PI/2),
            0
          ).multiplyScalar(speed);
          
          const color = this.getColorForType(type);
          
          const particle: Particle = {
            position,
            velocity,
            acceleration: new THREE.Vector3(0, 0, 0),
            color,
            size: this.config.particleSize * (0.5 + t * 0.5),
            type,
            life: this.config.lifespan,
            maxLife: this.config.lifespan,
            rotation: angle,
            rotationSpeed: 0.02
          };
          
          this.particles.push(particle);
        }
        break;
        
      case "explosion":
        for (let i = 0; i < count; i++) {
          const direction = new THREE.Vector3(
            Math.random() * 2 - 1,
            Math.random() * 2 - 1,
            Math.random() * 2 - 1
          ).normalize();
          
          const position = center.clone();
          const velocity = direction.clone().multiplyScalar(
            speed * (0.5 + Math.random() * 0.5)
          );
          
          const color = this.getColorForType(type);
          
          const particle: Particle = {
            position,
            velocity,
            acceleration: direction.clone().multiplyScalar(-0.01),
            color,
            size: this.config.particleSize * (0.5 + Math.random() * 0.5),
            type,
            life: this.config.lifespan * (0.5 + Math.random() * 0.5),
            maxLife: this.config.lifespan * (0.5 + Math.random() * 0.5),
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.1
          };
          
          this.particles.push(particle);
        }
        break;
    }
    
    // Limit total particles
    while (this.particles.length > this.config.maxParticles) {
      this.particles.shift();
    }
  }
  
  /**
   * Update all particles (call this in animation loop)
   */
  update(deltaTime: number): void {
    // Loop through particles backwards for safe removal
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];
      
      // Update life
      particle.life -= deltaTime * 1000; // Convert to milliseconds
      
      if (particle.life <= 0) {
        // Remove dead particles
        this.particles.splice(i, 1);
        continue;
      }
      
      // Update velocity with acceleration
      particle.velocity.add(
        particle.acceleration.clone().multiplyScalar(deltaTime)
      );
      
      // Update position with velocity
      particle.position.add(
        particle.velocity.clone().multiplyScalar(deltaTime)
      );
      
      // Update rotation
      particle.rotation += particle.rotationSpeed * deltaTime;
      
      // Type-specific behavior
      switch (particle.type) {
        case ParticleType.Energy:
          // Energy particles pulse
          particle.size = this.config.particleSize * 
            (0.8 + 0.2 * Math.sin(particle.life / 100));
          break;
          
        case ParticleType.Probability:
          // Probability particles randomly change direction
          if (Math.random() < 0.05) {
            const angle = Math.random() * Math.PI * 2;
            particle.velocity.x += Math.cos(angle) * 0.1;
            particle.velocity.y += Math.sin(angle) * 0.1;
          }
          break;
          
        case ParticleType.Entropy:
          // Entropy particles become more chaotic as they age
          if (Math.random() < 0.1) {
            const lifeRatio = 1 - particle.life / particle.maxLife;
            particle.velocity.add(
              new THREE.Vector3(
                (Math.random() - 0.5) * lifeRatio,
                (Math.random() - 0.5) * lifeRatio,
                (Math.random() - 0.5) * lifeRatio
              )
            );
          }
          break;
          
        case ParticleType.Time:
          // Time particles move in circular patterns
          const t = particle.life / particle.maxLife;
          particle.velocity.x = Math.cos(t * 10) * 0.2;
          particle.velocity.y = Math.sin(t * 10) * 0.2;
          break;
          
        case ParticleType.Feedback:
          // Feedback particles flicker
          particle.size = this.config.particleSize * 
            (0.5 + Math.random() * 0.5);
          break;
      }
    }
  }
  
  /**
   * Get all active particles
   */
  getParticles(): Particle[] {
    return this.particles;
  }
  
  /**
   * Get appropriate color for particle type
   */
  private getColorForType(type: ParticleType): THREE.Color {
    switch (type) {
      case ParticleType.Energy:
        return new THREE.Color(0xFFA500); // Gold
      case ParticleType.Probability:
        return new THREE.Color(0x9370DB); // Purple
      case ParticleType.Entropy:
        return new THREE.Color(0xFF4500); // Red-orange
      case ParticleType.Time:
        return new THREE.Color(0x4B9CD3); // Light blue
      case ParticleType.Feedback:
        return new THREE.Color(0xFF0000); // Bright red
      default:
        return new THREE.Color(0xFFFFFF); // White
    }
  }
  
  /**
   * Clear all particles
   */
  clear(): void {
    this.particles = [];
  }
}
