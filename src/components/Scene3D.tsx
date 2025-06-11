
import React, { useState, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import SpaceTimeFabric from './SpaceTimeFabric';
import PhysicsObject from './PhysicsObject';
import { Slider } from './ui/slider';

interface PhysicsObjectData {
  id: string;
  position: [number, number, number];
  mass: number;
  velocity: [number, number, number];
}

const Scene3D: React.FC = () => {
  const [objects, setObjects] = useState<PhysicsObjectData[]>([]);
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);

  const selectedObject = objects.find(obj => obj.id === selectedObjectId);

  const addRandomObject = useCallback(() => {
    const newObject: PhysicsObjectData = {
      id: Math.random().toString(36).substr(2, 9),
      position: [
        (Math.random() - 0.5) * 8,
        -1.8,
        (Math.random() - 0.5) * 8
      ],
      mass: Math.random() * 3 + 0.5,
      velocity: [
        (Math.random() - 0.5) * 2,
        0,
        (Math.random() - 0.5) * 2
      ]
    };

    setObjects(prev => [...prev, newObject]);
  }, []);

  const clearObjects = useCallback(() => {
    setObjects([]);
    setSelectedObjectId(null);
  }, []);

  const updateObjectPosition = useCallback((id: string, newPosition: [number, number, number], newVelocity: [number, number, number]) => {
    setObjects(prev => prev.map(obj => 
      obj.id === id 
        ? { ...obj, position: newPosition, velocity: newVelocity }
        : obj
    ));
  }, []);

  const handleObjectSelect = useCallback((id: string) => {
    setSelectedObjectId(id);
  }, []);

  const handleMassChange = useCallback((id: string, newMass: number) => {
    setObjects(prev => prev.map(obj => 
      obj.id === id 
        ? { ...obj, mass: newMass }
        : obj
    ));
  }, []);

  const handleCanvasClick = useCallback(() => {
    setSelectedObjectId(null);
  }, []);

  return (
    <div className="relative w-full h-screen bg-black">
      <Canvas camera={{ position: [0, 8, 12], fov: 75 }} onClick={handleCanvasClick}>
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={0.3} />
        
        <Stars 
          radius={100} 
          depth={50} 
          count={5000} 
          factor={4} 
          saturation={0.5} 
          fade={true}
          speed={1}
        />
        
        <SpaceTimeFabric objects={objects} />
        
        {objects.map(obj => (
          <PhysicsObject
            key={obj.id}
            id={obj.id}
            position={obj.position}
            mass={obj.mass}
            velocity={obj.velocity}
            onPositionUpdate={updateObjectPosition}
            otherObjects={objects}
            isSelected={obj.id === selectedObjectId}
            onSelect={handleObjectSelect}
            onMassChange={handleMassChange}
          />
        ))}
        
        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          maxDistance={30}
          minDistance={5}
        />
      </Canvas>
      
      <div className="absolute top-6 left-6 space-y-4">
        <button
          onClick={addRandomObject}
          className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-lg shadow-lg hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 transform hover:scale-105"
        >
          Add Object
        </button>
        <button
          onClick={clearObjects}
          className="block px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold rounded-lg shadow-lg hover:from-red-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105"
        >
          Clear All
        </button>
      </div>

      {selectedObject && (
        <div className="absolute top-6 right-6 bg-black/70 backdrop-blur-sm rounded-lg p-4 text-emerald-400 border border-emerald-500/30 w-64">
          <h3 className="text-lg font-bold mb-3">Object Controls</h3>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-emerald-300 block mb-2">
                Mass: {selectedObject.mass.toFixed(2)}
              </label>
              <Slider
                value={[selectedObject.mass]}
                onValueChange={([value]) => handleMassChange(selectedObject.id, value)}
                min={0.1}
                max={5}
                step={0.1}
                className="w-full"
              />
            </div>
            <p className="text-xs text-emerald-300">
              Click and drag to move the object around the fabric
            </p>
          </div>
        </div>
      )}
      
      <div className="absolute bottom-6 left-6 right-6">
        <div className="bg-black/70 backdrop-blur-sm rounded-lg p-4 text-emerald-400 border border-emerald-500/30">
          <h2 className="text-lg font-bold mb-2">Space-Time Fabric Simulation</h2>
          <p className="text-sm">
            Click "Add Object" to spawn celestial bodies that warp the fabric of spacetime. 
            Click on objects to select them, then drag to move or adjust their mass with the slider.
          </p>
          <p className="text-xs mt-2 text-emerald-300">
            Objects: {objects.length} | Selected: {selectedObject ? 'Yes' : 'None'} | Use mouse to orbit, zoom, and pan the view
          </p>
        </div>
      </div>
    </div>
  );
};

export default Scene3D;
