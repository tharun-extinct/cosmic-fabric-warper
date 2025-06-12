
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface SpaceTimeFabricProps {
  objects: Array<{ position: [number, number, number]; mass: number; id: string }>;
}

const SpaceTimeFabric: React.FC<SpaceTimeFabricProps> = ({ objects }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const originalPositions = useRef<Float32Array>();

  // Create the fabric grid with higher resolution for better deformation
  const { geometry, material } = useMemo(() => {
    const size = 20;
    const segments = 100; // Higher resolution for smoother curves
    const geometry = new THREE.PlaneGeometry(size, size, segments, segments);
    
    // Store original positions for deformation calculation
    originalPositions.current = geometry.attributes.position.array.slice() as Float32Array;
    
    const material = new THREE.MeshBasicMaterial({
      color: '#00ff88',
      wireframe: true,
      transparent: true,
      opacity: 0.7,
    });

    return { geometry, material };
  }, []);

  // Enhanced deformation algorithm that affects the entire plane
  useFrame(() => {
    if (!meshRef.current || !originalPositions.current) return;

    const positions = meshRef.current.geometry.attributes.position.array as Float32Array;
    const original = originalPositions.current;

    // Reset to original positions
    for (let i = 0; i < positions.length; i++) {
      positions[i] = original[i];
    }

    // Apply deformation for each object across the entire fabric
    objects.forEach(obj => {
      const objX = obj.position[0];
      const objZ = obj.position[2];
      const mass = obj.mass;

      for (let i = 0; i < positions.length; i += 3) {
        const x = positions[i];
        const z = positions[i + 2];
        
        // Calculate distance from object
        const distance = Math.sqrt((x - objX) ** 2 + (z - objZ) ** 2);
        
        // Enhanced gravitational well formula that affects entire plane
        // The deformation decreases with distance but never goes to zero
        const baseDeformation = mass * 1.5;
        const falloffFactor = 0.2;
        const minimumInfluence = 0.1;
        
        // Create smooth deformation across entire fabric
        const deformation = -(baseDeformation / (1 + distance * falloffFactor)) - (mass * minimumInfluence * Math.exp(-distance * 0.05));
        
        positions[i + 1] += deformation;
      }
    });

    meshRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <mesh 
      ref={meshRef} 
      geometry={geometry} 
      material={material}
      rotation={[-Math.PI / 4, 0, 0]}
      position={[0, -2, 0]}
    />
  );
};

export default SpaceTimeFabric;
