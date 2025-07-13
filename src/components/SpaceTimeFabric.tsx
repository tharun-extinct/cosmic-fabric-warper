import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useSimulationStore } from '../store/simulationStore';
import * as THREE from 'three';

interface SpaceTimeFabricProps {
  objects: Array<{ position: [number, number, number]; mass: number; id: string }>;
}

const SpaceTimeFabric: React.FC<SpaceTimeFabricProps> = ({ objects }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const originalPositions = useRef<Float32Array>();
  const { settings, fabricVisible, creatingObject } = useSimulationStore();
  const fadeTimeoutRef = useRef<NodeJS.Timeout>();

  // Create the fabric grid with higher resolution for better deformation
  const { geometry, material } = useMemo(() => {
    const size = 20;
    const segments = 100;
    const geometry = new THREE.PlaneGeometry(size, size, segments, segments);
    
    // Store original positions for deformation calculation
    originalPositions.current = geometry.attributes.position.array.slice() as Float32Array;
    
    // Create gradient material - white at center, fading to transparent
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    
    // Create radial gradient
    const gradient = ctx.createRadialGradient(256, 256, 0, 256, 256, 256);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
    gradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.6)');
    gradient.addColorStop(0.6, 'rgba(255, 255, 255, 0.3)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 512, 512);
    
    const texture = new THREE.CanvasTexture(canvas);
    
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      wireframe: false,
    });

    return { geometry, material };
  }, []);

  // Handle fabric visibility during creation
  useEffect(() => {
    if (!meshRef.current) return;
    
    const mat = meshRef.current.material as THREE.MeshBasicMaterial;
    
    if (creatingObject) {
      // Show fabric during creation
      mat.opacity = 1;
      
      // Clear any existing timeout
      if (fadeTimeoutRef.current) {
        clearTimeout(fadeTimeoutRef.current);
      }
    } else if (mat.opacity > 0) {
      // Fade out after creation
      fadeTimeoutRef.current = setTimeout(() => {
        if (meshRef.current) {
          const material = meshRef.current.material as THREE.MeshBasicMaterial;
          material.opacity = 0;
        }
      }, 2000); // 2 seconds delay
    }
    
    return () => {
      if (fadeTimeoutRef.current) {
        clearTimeout(fadeTimeoutRef.current);
      }
    };
  }, [creatingObject]);

  // Enhanced deformation algorithm for 2D view
  useFrame(() => {
    if (!meshRef.current || !originalPositions.current) return;

    const positions = meshRef.current.geometry.attributes.position.array as Float32Array;
    const original = originalPositions.current;

    // Reset to original positions
    for (let i = 0; i < positions.length; i++) {
      positions[i] = original[i];
    }

    // Apply deformation for each object
    objects.forEach(obj => {
      const objX = obj.position[0];
      const objZ = obj.position[2];
      const mass = obj.mass;

      for (let i = 0; i < positions.length; i += 3) {
        const x = positions[i];
        const z = positions[i + 2];
        
        // Calculate distance from object (2D)
        const distance = Math.sqrt((x - objX) ** 2 + (z - objZ) ** 2);
        
        // Enhanced gravitational well formula
        const baseDeformation = mass * 0.8;
        const falloffFactor = 0.3;
        const minimumInfluence = 0.05;
        
        // Create smooth deformation - negative Y for wells
        const deformation = -(baseDeformation / (1 + distance * falloffFactor)) - (mass * minimumInfluence * Math.exp(-distance * 0.1));
        
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
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -0.1, 0]}
    />
  );
};

export default SpaceTimeFabric;