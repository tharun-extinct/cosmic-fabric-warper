import * as THREE from 'three';
import { CelestialBody } from '../../store/simulationStore';

export class PhysicsEngine {
  private gravitationalConstant: number;
  private timeStep: number;
  private timeMultiplier: number;

  constructor(gravitationalConstant = 6.67430e-11, timeStep = 0.016) {
    this.gravitationalConstant = gravitationalConstant;
    this.timeStep = timeStep;
    this.timeMultiplier = 1;
  }

  setGravitationalConstant(value: number) {
    this.gravitationalConstant = value;
  }

  setTimeMultiplier(value: number) {
    this.timeMultiplier = value;
  }

  // N-body gravitational simulation using exact method
  computeGravitationalForces(bodies: CelestialBody[]): CelestialBody[] {
    const updatedBodies = bodies.map(body => ({ 
      ...body, 
      forces: [0, 0, 0] as [number, number, number] 
    }));

    // Calculate gravitational forces between all pairs
    for (let i = 0; i < updatedBodies.length; i++) {
      for (let j = i + 1; j < updatedBodies.length; j++) {
        const body1 = updatedBodies[i];
        const body2 = updatedBodies[j];

        // Calculate distance vector
        const dx = body2.position[0] - body1.position[0];
        const dy = body2.position[1] - body1.position[1];
        const dz = body2.position[2] - body1.position[2];
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

        // Avoid division by zero and extreme forces
        if (distance < 0.1) continue;

        // Calculate gravitational force magnitude
        const forceMagnitude = (this.gravitationalConstant * body1.mass * body2.mass) / (distance * distance);

        // Calculate force components (normalized direction vector * magnitude)
        const forceX = (dx / distance) * forceMagnitude;
        const forceY = (dy / distance) * forceMagnitude;
        const forceZ = (dz / distance) * forceMagnitude;

        // Apply forces (Newton's third law: equal and opposite)
        body1.forces[0] += forceX;
        body1.forces[1] += forceY;
        body1.forces[2] += forceZ;

        body2.forces[0] -= forceX;
        body2.forces[1] -= forceY;
        body2.forces[2] -= forceZ;
      }
    }

    return updatedBodies;
  }

  // Barnes-Hut algorithm for approximate N-body simulation (O(N log N))
  computeGravitationalForcesApproximate(bodies: CelestialBody[]): CelestialBody[] {
    // For now, implement a simplified version
    // In a full implementation, this would use an octree
    const updatedBodies = this.computeGravitationalForces(bodies);
    return updatedBodies;
  }

  // Update positions and velocities using Verlet integration
  updateBodies(bodies: CelestialBody[], simulationMode: 'exact' | 'approximate' = 'exact'): CelestialBody[] {
    // First compute forces
    const bodiesWithForces = simulationMode === 'exact' 
      ? this.computeGravitationalForces(bodies)
      : this.computeGravitationalForcesApproximate(bodies);

    // Update velocities and positions
    const updatedBodies = bodiesWithForces.map(body => {
      // Calculate acceleration from forces (F = ma, so a = F/m)
      const acceleration: [number, number, number] = [
        body.forces[0] / body.mass,
        body.forces[1] / body.mass,
        body.forces[2] / body.mass,
      ];

      // Update velocity using acceleration
      const newVelocity: [number, number, number] = [
        body.velocity[0] + acceleration[0] * this.timeStep * this.timeMultiplier,
        body.velocity[1] + acceleration[1] * this.timeStep * this.timeMultiplier,
        body.velocity[2] + acceleration[2] * this.timeStep * this.timeMultiplier,
      ];

      // Update position using velocity
      const newPosition: [number, number, number] = [
        body.position[0] + newVelocity[0] * this.timeStep * this.timeMultiplier,
        Math.max(-1.8, body.position[1] + newVelocity[1] * this.timeStep * this.timeMultiplier), // Lock Y to fabric
        body.position[2] + newVelocity[2] * this.timeStep * this.timeMultiplier,
      ];

      // Update trail
      const newTrail = [...body.trail];
      newTrail.push([...newPosition]);
      
      // Limit trail length
      const maxTrailLength = 1000;
      if (newTrail.length > maxTrailLength) {
        newTrail.shift();
      }

      return {
        ...body,
        position: newPosition,
        velocity: newVelocity,
        trail: newTrail,
      };
    });

    // Handle collisions
    return this.handleCollisions(updatedBodies);
  }

  // Simple collision detection and response
  private handleCollisions(bodies: CelestialBody[]): CelestialBody[] {
    const result = [...bodies];
    
    for (let i = 0; i < result.length; i++) {
      for (let j = i + 1; j < result.length; j++) {
        const body1 = result[i];
        const body2 = result[j];

        const dx = body2.position[0] - body1.position[0];
        const dy = body2.position[1] - body1.position[1];
        const dz = body2.position[2] - body1.position[2];
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

        // Check for collision
        if (distance < (body1.radius + body2.radius)) {
          // Merge smaller body into larger one
          const largerBody = body1.mass >= body2.mass ? body1 : body2;
          const smallerBody = body1.mass < body2.mass ? body1 : body2;

          // Conservation of momentum
          const totalMass = largerBody.mass + smallerBody.mass;
          const newVelocity: [number, number, number] = [
            (largerBody.mass * largerBody.velocity[0] + smallerBody.mass * smallerBody.velocity[0]) / totalMass,
            (largerBody.mass * largerBody.velocity[1] + smallerBody.mass * smallerBody.velocity[1]) / totalMass,
            (largerBody.mass * largerBody.velocity[2] + smallerBody.mass * smallerBody.velocity[2]) / totalMass,
          ];

          // Update the larger body
          const mergedBody = {
            ...largerBody,
            mass: totalMass,
            radius: Math.cbrt(Math.pow(largerBody.radius, 3) + Math.pow(smallerBody.radius, 3)),
            velocity: newVelocity,
          };

          // Replace bodies
          if (body1.mass >= body2.mass) {
            result[i] = mergedBody;
            result.splice(j, 1);
          } else {
            result[j] = mergedBody;
            result.splice(i, 1);
          }

          // Adjust indices after removal
          j--;
          if (body1.mass < body2.mass) i--;
        }
      }
    }

    return result;
  }

  // Calculate orbital period for two-body system
  calculateOrbitalPeriod(body1: CelestialBody, body2: CelestialBody): number {
    const dx = body2.position[0] - body1.position[0];
    const dy = body2.position[1] - body1.position[1];
    const dz = body2.position[2] - body1.position[2];
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

    const totalMass = body1.mass + body2.mass;
    const period = 2 * Math.PI * Math.sqrt((distance * distance * distance) / (this.gravitationalConstant * totalMass));
    
    return period;
  }

  // Calculate escape velocity
  calculateEscapeVelocity(centralBody: CelestialBody, distance: number): number {
    return Math.sqrt((2 * this.gravitationalConstant * centralBody.mass) / distance);
  }

  // Calculate total system energy
  calculateTotalEnergy(bodies: CelestialBody[]): { kinetic: number; potential: number; total: number } {
    let kineticEnergy = 0;
    let potentialEnergy = 0;

    // Calculate kinetic energy
    bodies.forEach(body => {
      const vSquared = body.velocity[0] ** 2 + body.velocity[1] ** 2 + body.velocity[2] ** 2;
      kineticEnergy += 0.5 * body.mass * vSquared;
    });

    // Calculate potential energy
    for (let i = 0; i < bodies.length; i++) {
      for (let j = i + 1; j < bodies.length; j++) {
        const body1 = bodies[i];
        const body2 = bodies[j];
        
        const dx = body2.position[0] - body1.position[0];
        const dy = body2.position[1] - body1.position[1];
        const dz = body2.position[2] - body1.position[2];
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
        
        potentialEnergy -= (this.gravitationalConstant * body1.mass * body2.mass) / distance;
      }
    }

    return {
      kinetic: kineticEnergy,
      potential: potentialEnergy,
      total: kineticEnergy + potentialEnergy,
    };
  }

  // Calculate angular momentum
  calculateAngularMomentum(bodies: CelestialBody[]): number {
    let totalAngularMomentum = 0;

    bodies.forEach(body => {
      // L = r × mv
      const position = new THREE.Vector3(...body.position);
      const velocity = new THREE.Vector3(...body.velocity);
      const momentum = velocity.multiplyScalar(body.mass);
      const angularMomentum = position.cross(momentum);
      totalAngularMomentum += angularMomentum.length();
    });

    return totalAngularMomentum;
  }
}