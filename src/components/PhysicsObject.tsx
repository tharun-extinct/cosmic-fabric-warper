import React, { useRef, useState } from 'react';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';

interface PhysicsObjectProps {
  id: string;
  position: [number, number, number];
  mass: number;
  velocity: [number, number, number];
  onPositionUpdate: (id: string, newPosition: [number, number, number], newVelocity: [number, number, number]) => void;
  otherObjects: Array<{ position: [number, number, number]; mass: number; id: string }>;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onMassChange: (id: string, newMass: number) => void;
}

const PhysicsObject: React.FC<PhysicsObjectProps> = ({ 
  id, 
  position, 
  mass, 
  velocity, 
  onPositionUpdate, 
  otherObjects,
  isSelected,
  onSelect,
  onMassChange
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const velocityRef = useRef<[number, number, number]>(velocity);
  const positionRef = useRef<[number, number, number]>(position);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);

  useFrame((state, delta) => {
    if (!meshRef.current || isDragging) return;

    const currentPos = positionRef.current;
    const currentVel = velocityRef.current;
    
    // Apply gravitational forces from other objects
    const acceleration: [number, number, number] = [0, 0, 0];
    
    otherObjects.forEach(other => {
      if (other.id === id) return;
      
      const dx = other.position[0] - currentPos[0];
      const dy = other.position[1] - currentPos[1];
      const dz = other.position[2] - currentPos[2];
      
      const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
      
      if (distance > 0.5) { // Avoid singularity
        const force = (other.mass * 0.1) / (distance * distance);
        const dirX = dx / distance;
        const dirY = dy / distance;
        const dirZ = dz / distance;
        
        acceleration[0] += force * dirX;
        acceleration[1] += force * dirY;
        acceleration[2] += force * dirZ;
      }
    });

    // Update velocity
    currentVel[0] += acceleration[0] * delta;
    currentVel[1] += acceleration[1] * delta;
    currentVel[2] += acceleration[2] * delta;

    // Update position
    const newPos: [number, number, number] = [
      currentPos[0] + currentVel[0] * delta,
      Math.max(-1.8, currentPos[1] + currentVel[1] * delta), // Lock Y to fabric level
      currentPos[2] + currentVel[2] * delta
    ];

    // Boundary checks
    const boundary = 8;
    if (Math.abs(newPos[0]) > boundary || Math.abs(newPos[2]) > boundary) {
      // Bounce off boundaries
      if (Math.abs(newPos[0]) > boundary) currentVel[0] *= -0.8;
      if (Math.abs(newPos[2]) > boundary) currentVel[2] *= -0.8;
      newPos[0] = Math.max(-boundary, Math.min(boundary, newPos[0]));
      newPos[2] = Math.max(-boundary, Math.min(boundary, newPos[2]));
    }

    // Apply damping
    currentVel[0] *= 0.999;
    currentVel[1] *= 0.999;
    currentVel[2] *= 0.999;

    // Keep Y position locked to fabric
    if (newPos[1] <= -1.8) {
      newPos[1] = -1.8;
      currentVel[1] = 0;
    }

    positionRef.current = newPos;
    velocityRef.current = currentVel;

    meshRef.current.position.set(newPos[0], newPos[1], newPos[2]);
    onPositionUpdate(id, newPos, currentVel);
  });

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    onSelect(id);
    if (isSelected) {
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
      velocityRef.current = [0, 0, 0]; // Stop velocity when starting drag
    }
  };

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (isDragging && isSelected && dragStart) {
      e.stopPropagation();
      
      // Convert screen movement to world coordinates
      const deltaX = (e.clientX - dragStart.x) * 0.02;
      const deltaZ = (e.clientY - dragStart.y) * 0.02;
      
      const newPos: [number, number, number] = [
        positionRef.current[0] + deltaX,
        -1.8, // Keep on fabric level
        positionRef.current[2] + deltaZ
      ];
      
      // Apply boundary constraints
      const boundary = 8;
      newPos[0] = Math.max(-boundary, Math.min(boundary, newPos[0]));
      newPos[2] = Math.max(-boundary, Math.min(boundary, newPos[2]));
      
      positionRef.current = newPos;
      if (meshRef.current) {
        meshRef.current.position.set(newPos[0], newPos[1], newPos[2]);
      }
      onPositionUpdate(id, newPos, [0, 0, 0]);
      
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handlePointerUp = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setIsDragging(false);
    setDragStart(null);
  };

  const radius = Math.cbrt(mass) * 0.3;
  const color = mass > 2 ? '#ff6b35' : '#4ecdc4';

  return (
    <mesh 
      ref={meshRef} 
      position={position}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      scale={isSelected ? 1.1 : 1}
    >
      <sphereGeometry args={[radius, 16, 16]} />
      <meshStandardMaterial 
        color={color} 
        emissive={isSelected ? color : '#000000'}
        emissiveIntensity={isSelected ? 0.4 : 0.2}
      />
      {isSelected && (
        <mesh>
          <sphereGeometry args={[radius * 1.2, 16, 16]} />
          <meshBasicMaterial 
            color={color}
            transparent
            opacity={0.2}
            wireframe
          />
        </mesh>
      )}
    </mesh>
  );
};

export default PhysicsObject;
