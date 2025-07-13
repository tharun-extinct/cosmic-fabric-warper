import React, { useState, useRef } from 'react';
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
  
  const { camera, raycaster } = useThree();
  const { addBody, setCreatingObject } = useSimulationStore();
  const holdStartTime = useRef<number>(0);

  useFrame((state, delta) => {
    if (isCreating && holdStartTime.current > 0) {
      setHoldTime(state.clock.elapsedTime - holdStartTime.current);
    }
  });

  const getWorldPosition = (event: MouseEvent): THREE.Vector3 => {
    const rect = (event.target as HTMLElement).getBoundingClientRect();
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
    
    // Calculate final properties
    const mass = Math.max(0.5, Math.min(20, holdTime * 3 + 1));
    const radius = Math.max(0.1, Math.min(2, Math.cbrt(mass) * 0.3));
    
    // Convert drag vector to velocity (2D)
    const velocity: [number, number, number] = dragVector 
      ? [dragVector.x * 0.5, 0, dragVector.z * 0.5]
      : [0, 0, 0];
    
    // Generate random color
    const hue = Math.random() * 360;
    const color = `hsl(${hue}, 70%, 60%)`;
    
    // Create the body (2D position)
    addBody({
      name: `Planet ${Date.now().toString().slice(-4)}`,
      position: [startPosition.x, 0, startPosition.z],
      velocity,
      mass,
      radius,
      color,
      hasRings: Math.random() > 0.9,
    });
    
    // Reset state
    setIsCreating(false);
    setStartPosition(null);
    setCurrentPosition(null);
    setDragVector(null);
    setHoldTime(0);
    holdStartTime.current = 0;
    setCreatingObject(false); // Hide fabric
    onComplete();
  };

  // Add event listeners
  React.useEffect(() => {
    if (!isActive) return;
    
    const canvas = document.querySelector('canvas');
    if (!canvas) return;
    
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isActive, isCreating, startPosition]);

  if (!isCreating || !startPosition) return null;

  const mass = Math.max(0.5, Math.min(20, holdTime * 3 + 1));
  const radius = Math.max(0.1, Math.min(2, Math.cbrt(mass) * 0.3));

  return (
    <group>
      {/* Preview sphere (2D) */}
      <mesh position={[startPosition.x, 0, startPosition.z]}>
        <sphereGeometry args={[radius, 16, 16]} />
        <meshBasicMaterial 
          color="#ffffff" 
          transparent 
          opacity={0.7}
          wireframe
        />
      </mesh>
      
      {/* Velocity vector preview (2D) */}
      {dragVector && dragVector.length() > 0.1 && (
        <group>
          {/* Arrow shaft */}
          <mesh 
            position={[
              startPosition.x + dragVector.x * 0.5,
              0,
              startPosition.z + dragVector.z * 0.5
            ]}
            rotation={[0, Math.atan2(dragVector.x, dragVector.z), 0]}
          >
            <cylinderGeometry args={[0.02, 0.02, dragVector.length(), 8]} />
            <meshBasicMaterial color="#00ff00" />
          </mesh>
          
          {/* Arrow head */}
          <mesh 
            position={[
              startPosition.x + dragVector.x,
              0,
              startPosition.z + dragVector.z
            ]}
            rotation={[0, Math.atan2(dragVector.x, dragVector.z), 0]}
          >
            <coneGeometry args={[0.05, 0.15, 8]} />
            <meshBasicMaterial color="#00ff00" />
          </mesh>
        </group>
      )}
      
      {/* Mass indicator */}
      <mesh position={[startPosition.x, radius + 0.5, startPosition.z]}>
        <planeGeometry args={[1, 0.2]} />
        <meshBasicMaterial 
          color="#ffffff" 
          transparent 
          opacity={0.8}
        />
      </mesh>
    </group>
  );
};