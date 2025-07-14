import React, { useState, useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useSimulationStore } from '../../store/simulationStore';
import * as THREE from 'three';

interface CreationToolProps {
  isActive: boolean;
  onComplete: () => void;
}

export const CreationTool: React.FC<CreationToolProps> = ({ isActive, onComplete }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [startPosition, setStartPosition] = useState<THREE.Vector3 | null>(null);
  const [currentPosition, setCurrentPosition] = useState<THREE.Vector3 | null>(null);
  const [holdTime, setHoldTime] = useState(0);
  const [dragVector, setDragVector] = useState<THREE.Vector3 | null>(null);
  
  const { camera, raycaster, gl } = useThree();
  const { addBody, setCreatingObject } = useSimulationStore();
  const holdStartTime = useRef<number>(0);
  const animationFrameRef = useRef<number>();

  // Update hold time continuously while creating
  useFrame(() => {
    if (isCreating && holdStartTime.current > 0) {
      const currentTime = performance.now() / 1000;
      const newHoldTime = currentTime - holdStartTime.current;
      setHoldTime(newHoldTime);
    }
  });

  const getWorldPosition = (event: MouseEvent): THREE.Vector3 => {
    const rect = gl.domElement.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    
    raycaster.setFromCamera({ x, y }, camera);
    
    // Intersect with the 2D plane at y = 0
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const intersection = new THREE.Vector3();
    raycaster.ray.intersectPlane(plane, intersection);
    
    return intersection || new THREE.Vector3(0, 0, 0);
  };

  const handleMouseDown = (event: MouseEvent) => {
    if (!isActive) return;
    
    event.preventDefault();
    event.stopPropagation();
    
    const worldPos = getWorldPosition(event);
    
    setIsCreating(true);
    setStartPosition(worldPos);
    setCurrentPosition(worldPos);
    setHoldTime(0);
    holdStartTime.current = performance.now() / 1000;
    setCreatingObject(true); // Show fabric
  };

  const handleMouseMove = (event: MouseEvent) => {
    if (!isCreating || !startPosition) return;
    
    const worldPos = getWorldPosition(event);
    setCurrentPosition(worldPos);
    
    // Calculate drag vector for velocity (2D)
    const dragVec = worldPos.clone().sub(startPosition);
    dragVec.y = 0; // Keep it 2D
    setDragVector(dragVec);
  };

  const handleMouseUp = (event: MouseEvent) => {
    if (!isCreating || !startPosition) return;
    
    event.preventDefault();
    event.stopPropagation();
    
    // Calculate final properties based on hold time
    const finalHoldTime = Math.max(0.1, holdTime); // Minimum hold time
    const mass = Math.max(1, Math.min(50, finalHoldTime * 15 + 2)); // Scale: 2-50 based on hold time
    const radius = Math.max(0.2, Math.min(2.0, Math.sqrt(mass) * 0.3)); // Radius scales with square root of mass
    
    // Convert drag vector to velocity (2D) - scale for realistic physics
    const velocity: [number, number, number] = dragVector 
      ? [dragVector.x * 0.5, 0, dragVector.z * 0.5] // Velocity scaling
      : [0, 0, 0];
    
    // Generate random color with good contrast
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
      '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
    ];
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    // Create the body (2D position)
    addBody({
      name: `Body ${Date.now().toString().slice(-4)}`,
      position: [startPosition.x, 0, startPosition.z],
      velocity,
      mass,
      radius,
      color,
      hasRings: Math.random() > 0.85, // 15% chance of rings
    });
    
    // Reset state
    setIsCreating(false);
    setStartPosition(null);
    setCurrentPosition(null);
    setDragVector(null);
    setHoldTime(0);
    holdStartTime.current = 0;
    
    // Hide fabric after a delay
    setTimeout(() => {
      setCreatingObject(false);
    }, 2000);
    
    onComplete();
  };

  // Add event listeners
  useEffect(() => {
    if (!isActive) return;
    
    const canvas = gl.domElement;
    if (!canvas) return;
    
    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isActive, isCreating, startPosition]);

  if (!isCreating || !startPosition) return null;

  // Calculate current mass and radius based on hold time - NSTMF style scaling
  const currentMass = Math.max(1, Math.min(50, holdTime * 15 + 2));
  const currentRadius = Math.max(0.2, Math.min(2.0, Math.sqrt(currentMass) * 0.3));

  return (
    <group>
      {/* Preview sphere (2D) with pulsing effect */}
      <mesh position={[startPosition.x, 0, startPosition.z]}>
        <sphereGeometry args={[currentRadius, 32, 32]} />
        <meshBasicMaterial 
          color="#ffffff" 
          transparent 
          opacity={0.7 + Math.sin(holdTime * 10) * 0.3} // Faster pulsing effect
          wireframe={false}
        />
      </mesh>
      
      {/* Mass indicator ring that grows with mass */}
      <mesh position={[startPosition.x, 0, startPosition.z]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[currentRadius * 1.1, currentRadius * 1.2, 32]} />
        <meshBasicMaterial 
          color="#00ff00" 
          transparent 
          opacity={0.8}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Velocity vector preview (2D) */}
      {dragVector && dragVector.length() > 0.1 && (
        <group>
          {/* Arrow shaft */}
          <mesh 
            position={[
              startPosition.x + dragVector.x * 0.5,
              0.1,
              startPosition.z + dragVector.z * 0.5
            ]}
            rotation={[0, Math.atan2(dragVector.x, dragVector.z), 0]}
          >
            <cylinderGeometry args={[0.03, 0.03, dragVector.length(), 8]} />
            <meshBasicMaterial color="#00ff00" />
          </mesh>
          
          {/* Arrow head */}
          <mesh 
            position={[
              startPosition.x + dragVector.x,
              0.1,
              startPosition.z + dragVector.z
            ]}
            rotation={[0, Math.atan2(dragVector.x, dragVector.z), 0]}
          >
            <coneGeometry args={[0.08, 0.2, 8]} />
            <meshBasicMaterial color="#00ff00" />
          </mesh>
        </group>
      )}
    </group>
  );
};