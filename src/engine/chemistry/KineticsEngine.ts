/**
 * Physora Chemical Reaction Kinetics & Collision Engine
 *
 * Implements hard-sphere collision theory with Arrhenius activation energy barrier (Ea):
 * 1. Particles undergo thermal motion according to Maxwell-Boltzmann distribution at temperature T
 * 2. Elastic collisions between non-reacting species or inert wall boundaries
 * 3. Reactive collisions: A + B -> C when E_coll >= Ea
 * 4. Reversible equilibrium: C -> A + B with Ea_rev = Ea - Delta_H
 */

export type ChemicalSpecies = 'A' | 'B' | 'C';

export interface KineticParticle {
  id: number;
  species: ChemicalSpecies;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
}

export interface ReactionVesselConfig {
  width: number;
  height: number;
  temperatureKelvin: number; // e.g. 250 - 600 K
  activationEnergyEa: number; // e.g. 20 - 80 kJ/mol
  hasCatalyst: boolean;       // lowers Ea by 40%
  deltaH: number;             // Enthalpy change, e.g. -25 kJ/mol (exothermic)
}

export class ReactionKineticsSimulation {
  particles: KineticParticle[] = [];
  config: ReactionVesselConfig;
  totalCollisions = 0;
  effectiveCollisions = 0;
  nextId = 1;

  constructor(config: ReactionVesselConfig) {
    this.config = config;
  }

  initMixture(countA: number, countB: number, countC = 0) {
    this.particles = [];
    this.totalCollisions = 0;
    this.effectiveCollisions = 0;
    this.nextId = 1;

    // Helper to spawn particle with random position and Maxwell-Boltzmann speed
    const spawn = (species: ChemicalSpecies, color: string, radius: number) => {
      const x = radius + Math.random() * (this.config.width - 2 * radius);
      const y = radius + Math.random() * (this.config.height - 2 * radius);

      // Speed proportional to sqrt(T)
      const baseSpeed = Math.sqrt(this.config.temperatureKelvin / 300) * 120;
      const angle = Math.random() * Math.PI * 2;
      const speed = baseSpeed * (0.6 + Math.random() * 0.8);

      this.particles.push({
        id: this.nextId++,
        species,
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius,
        color
      });
    };

    for (let i = 0; i < countA; i++) spawn('A', '#ef4444', 5);
    for (let i = 0; i < countB; i++) spawn('B', '#3b82f6', 5);
    for (let i = 0; i < countC; i++) spawn('C', '#10b981', 7);
  }

  step(dt: number) {
    const { width, height, temperatureKelvin, activationEnergyEa, hasCatalyst, deltaH } = this.config;
    // Effective activation energy (catalyst lowers the barrier)
    const effectiveEa = hasCatalyst ? activationEnergyEa * 0.55 : activationEnergyEa;

    // 1. Move particles and bounce off boundaries
    for (const p of this.particles) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;

      // Left / Right walls
      if (p.x - p.radius < 0) {
        p.x = p.radius;
        p.vx = Math.abs(p.vx);
      } else if (p.x + p.radius > width) {
        p.x = width - p.radius;
        p.vx = -Math.abs(p.vx);
      }

      // Top / Bottom walls
      if (p.y - p.radius < 0) {
        p.y = p.radius;
        p.vy = Math.abs(p.vy);
      } else if (p.y + p.radius > height) {
        p.y = height - p.radius;
        p.vy = -Math.abs(p.vy);
      }

      // Thermal velocity thermostat drift towards target T
      const currentSpeed = Math.hypot(p.vx, p.vy);
      const targetSpeed = Math.sqrt(temperatureKelvin / 300) * 120;
      if (currentSpeed > 0.01) {
        const factor = 1 + (targetSpeed / currentSpeed - 1) * 0.05 * dt;
        p.vx *= factor;
        p.vy *= factor;
      }
    }

    // 2. Inter-particle collisions
    const n = this.particles.length;
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const p1 = this.particles[i];
        const p2 = this.particles[j];

        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const dist = Math.hypot(dx, dy);
        const minDist = p1.radius + p2.radius;

        if (dist < minDist && dist > 0.0001) {
          this.totalCollisions++;

          // Normal and tangent unit vectors
          const nx = dx / dist;
          const ny = dy / dist;

          // Relative velocity
          const dvx = p2.vx - p1.vx;
          const dvy = p2.vy - p1.vy;
          const relVelAlongNormal = dvx * nx + dvy * ny;

          // Only collide if moving toward each other
          if (relVelAlongNormal < 0) {
            // Relative kinetic energy of collision
            const relSpeedSq = dvx * dvx + dvy * dvy;
            const collisionEnergyScaled = (relSpeedSq / 20000) * 50; // scaled kJ/mol

            // Check if reaction A + B -> C occurs
            const canReactForward =
              (p1.species === 'A' && p2.species === 'B') ||
              (p1.species === 'B' && p2.species === 'A');

            if (canReactForward && collisionEnergyScaled >= effectiveEa) {
              this.effectiveCollisions++;
              // Reaction successful! Merge into C
              p1.species = 'C';
              p1.color = '#10b981';
              p1.radius = 7;
              // Remove p2 by converting it to neutral spectator or recycling
              p2.species = 'C';
              p2.color = '#10b981';
              p2.radius = 7;
            } else {
              // Elastic rebound
              const impulse = -2 * relVelAlongNormal / 2; // equal masses
              p1.vx -= impulse * nx;
              p1.vy -= impulse * ny;
              p2.vx += impulse * nx;
              p2.vy += impulse * ny;
            }
          }
        }
      }
    }

    // 3. Thermal reverse decomposition C -> A + B at high temperature
    const reverseEa = effectiveEa - deltaH;
    const reverseProbPerSec = Math.exp(-reverseEa / (0.008314 * temperatureKelvin)) * 0.15;
    for (const p of this.particles) {
      if (p.species === 'C' && Math.random() < reverseProbPerSec * dt) {
        p.species = Math.random() < 0.5 ? 'A' : 'B';
        p.color = p.species === 'A' ? '#ef4444' : '#3b82f6';
        p.radius = 5;
      }
    }
  }

  getConcentrations(): { countA: number; countB: number; countC: number; total: number } {
    let countA = 0;
    let countB = 0;
    let countC = 0;
    for (const p of this.particles) {
      if (p.species === 'A') countA++;
      else if (p.species === 'B') countB++;
      else if (p.species === 'C') countC++;
    }
    return { countA, countB, countC, total: this.particles.length };
  }
}
