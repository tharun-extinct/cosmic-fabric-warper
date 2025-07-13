import React, { useRef, useState } from 'react';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { useSimulationStore } from '../store/simulationStore';

interface PhysicsObjectProps {
  id: string;
  position: [number, number, number];
  mass: number;
  velocity: [number, number, number];
  radius: number;
  color: string;
  name: string;
  hasRings: boolean;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

const PhysicsObject: React.FC<PhysicsObjectProps> = ({ 
  id, 
  position, 
  mass, 
  velocity, 
  radius,
  color,
  name,
  hasRings,
  isSelected,
  onSelect,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [showVectors, setShowVectors] = useState(false);
  const { updateBody, settings } = useSimulationStore();

  useFrame(() => {
    if (!meshRef.current) return;
    
    // Update mesh position to match physics state
    meshRef.current.position.set(position[0], position[1], position[2]);
  });

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    onSelect(id);
    
    // Only allow dragging if simulation is paused
    if (!useSimulationStore.getState().isRunning) {
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (isDragging && dragStart && !useSimulationStore.getState().isRunning) {
      e.stopPropagation();
      
      // Convert screen movement to world coordinates
      const deltaX = (e.clientX - dragStart.x) * 0.01;
      const deltaZ = (e.clientY - dragStart.y) * 0.01;
      
      const newPos: [number, number, number] = [
        position[0] + deltaX,
        -1.8, // Lock Y-axis to fabric level
        position[2] + deltaZ
      ];
      
      // Apply boundary constraints
      const boundary = 9;
      newPos[0] = Math.max(-boundary, Math.min(boundary, newPos[0]));
      newPos[2] = Math.max(-boundary, Math.min(boundary, newPos[2]));
      
      updateBody(id, { position: newPos });
      
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handlePointerUp = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setIsDragging(false);
    setDragStart(null);
  };

  const handlePointerEnter = () => {
    if (settings.showVectors) {
      setShowVectors(true);
    }
  };

  const handlePointerLeave = () => {
    setShowVectors(false);
  };

  return (
    <group>
      <mesh 
        ref={meshRef} 
        position={position}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
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
        
        {/* Selection indicator */}
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
        
        {/* Rings */}
        {hasRings && (
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[radius * 1.5, radius * 2.5, 64]} />
            <meshBasicMaterial 
              color="#888888"
              transparent
              opacity={0.6}
              side={THREE.DoubleSide}
            />
          </mesh>
        )}
      </mesh>
      
      {/* Velocity vector (green arrow) */}
      {showVectors && (
        <mesh>
          <coneGeometry args={[0.05, Math.sqrt(velocity[0]**2 + velocity[2]**2) * 2, 8]} />
          <meshBasicMaterial 
            color="#00ff00"
          />
        </mesh>
      )}
    </group>
  );
};

export default PhysicsObject;
