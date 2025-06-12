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
  const positionRef = useRef<[number, number, number]>(position);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);

  // Remove physics simulation - objects only move when dragged
  useFrame(() => {
    if (!meshRef.current || isDragging) return;
    
    // Keep objects locked to fabric level (Y = -1.8)
    const currentPos = positionRef.current;
    if (currentPos[1] !== -1.8) {
      const lockedPos: [number, number, number] = [currentPos[0], -1.8, currentPos[2]];
      positionRef.current = lockedPos;
      meshRef.current.position.set(lockedPos[0], lockedPos[1], lockedPos[2]);
      onPositionUpdate(id, lockedPos, [0, 0, 0]);
    }
  });

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    onSelect(id);
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (isDragging && dragStart) {
      e.stopPropagation();
      
      // Convert screen movement to world coordinates with better sensitivity
      const deltaX = (e.clientX - dragStart.x) * 0.01;
      const deltaZ = (e.clientY - dragStart.y) * 0.01;
      
      const newPos: [number, number, number] = [
        positionRef.current[0] + deltaX,
        -1.8, // Lock Y-axis to fabric level
        positionRef.current[2] + deltaZ
      ];
      
      // Apply boundary constraints
      const boundary = 9;
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

  // Size based on mass - more visible scaling
  const radius = Math.cbrt(mass) * 0.4;
  const color = mass > 10 ? '#ff6b35' : mass > 5 ? '#ffaa35' : '#4ecdc4';

  return (
    <mesh 
      ref={meshRef} 
      position={position}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      scale={isSelected ? 1.2 : 1}
    >
      <sphereGeometry args={[radius, 32, 32]} />
      <meshStandardMaterial 
        color={color} 
        emissive={isSelected ? color : '#000000'}
        emissiveIntensity={isSelected ? 0.3 : 0.1}
        metalness={0.2}
        roughness={0.4}
      />
      {isSelected && (
        <mesh>
          <sphereGeometry args={[radius * 1.3, 32, 32]} />
          <meshBasicMaterial 
            color={color}
            transparent
            opacity={0.3}
            wireframe
          />
        </mesh>
      )}
    </mesh>
  );
};

export default PhysicsObject;
