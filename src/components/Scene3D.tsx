import React, { useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Line } from '@react-three/drei';
import { useSimulationStore } from '../store/simulationStore';
import { PhysicsEngine } from './Physics/PhysicsEngine';
import SpaceTimeFabric from './SpaceTimeFabric';
import PhysicsObject from './PhysicsObject';
import { PropertiesPanel } from './UI/PropertiesPanel';
import { SettingsPanel } from './UI/SettingsPanel';
import { AnalyticsPanel } from './UI/AnalyticsPanel';
import { ExperimentsPanel } from './UI/ExperimentsPanel';
import { ExportTools } from './UI/ExportTools';
import { Toolbar } from './UI/Toolbar';
import * as THREE from 'three';

const PhysicsSimulation: React.FC = () => {
  const {
    bodies,
    selectedBodyId,
    settings,
    isRunning,
    updatePhysics,
    updateAnalytics,
    selectBody,
    setPanel,
    addBody,
  } = useSimulationStore();

  const physicsEngine = useRef(new PhysicsEngine());

  useEffect(() => {
    physicsEngine.current.setGravitationalConstant(settings.gravitationalConstant);
    physicsEngine.current.setTimeMultiplier(settings.timeMultiplier);
  }, [settings.gravitationalConstant, settings.timeMultiplier]);

  useFrame(() => {
    if (isRunning && bodies.length > 0) {
      const updatedBodies = physicsEngine.current.updateBodies(bodies, settings.simulationMode);
      updatePhysics(updatedBodies);
      updateAnalytics();
    }
  });

  return null;
};

const TrailRenderer: React.FC<{ body: any }> = ({ body }) => {
  if (!body.trail || body.trail.length < 2) return null;

  const points = body.trail.map(point => new THREE.Vector3(...point));
  
  return (
    <Line
      points={points}
      color={body.color}
      lineWidth={2}
      transparent
      opacity={0.6}
    />
  );
};

const Scene3D: React.FC = () => {
  const {
    bodies,
    selectedBodyId,
    settings,
    selectBody,
    setPanel,
    addBody,
  } = useSimulationStore();

  const handleCanvasClick = (event: any) => {
    if (event.intersections.length === 0) {
      selectBody(null);
      setPanel('properties', false);
    }
  };

  const handleAddBodyAtPosition = (event: any) => {
    if (event.shiftKey && event.intersections.length === 0) {
      const point = event.point;
      addBody({
        name: `Planet ${Date.now().toString().slice(-4)}`,
        position: [point.x, -1.8, point.z],
        velocity: [0, 0, 0],
        mass: 2 + Math.random() * 3,
        radius: 0.3 + Math.random() * 0.4,
        color: `hsl(${Math.random() * 360}, 70%, 60%)`,
        hasRings: Math.random() > 0.9,
      });
    }
  };

  return (
    <div className="relative w-full h-screen bg-black">
      <Canvas 
        camera={{ position: [0, 8, 12], fov: 75 }} 
        onClick={handleCanvasClick}
        onPointerMissed={handleAddBodyAtPosition}
      >
        <PhysicsSimulation />
        
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={0.4} />
        
        <Stars 
          radius={100} 
          depth={50} 
          count={5000} 
          factor={4} 
          saturation={0.5} 
          fade={true}
          speed={1}
        />
        
        <SpaceTimeFabric objects={bodies} />
        
        {bodies.map(body => (
          <group key={body.id}>
            <PhysicsObject
              id={body.id}
              position={body.position}
              mass={body.mass}
              velocity={body.velocity}
              radius={body.radius}
              color={body.color}
              name={body.name}
              hasRings={body.hasRings}
              isSelected={body.id === selectedBodyId}
              onSelect={selectBody}
            />
            
            {settings.showTrails && <TrailRenderer body={body} />}
          </group>
        ))}
        
        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          maxDistance={30}
          minDistance={5}
        />
      </Canvas>
      
      <Toolbar />
      <PropertiesPanel />
      <SettingsPanel />
      <AnalyticsPanel />
      <ExperimentsPanel />
      {useSimulationStore.getState().showExportPanel && (
        <div className="fixed top-4 right-4 z-50">
          <ExportTools />
        </div>
      )}
      
      <div className="absolute bottom-6 right-6">
        <div className="bg-black/70 backdrop-blur-sm rounded-lg p-4 text-emerald-400 border border-emerald-500/30 max-w-sm">
          <h2 className="text-lg font-bold mb-2">Space-Time Physics Simulator</h2>
          <p className="text-sm">
            Use the toolbar to enter creation mode. Click and hold to create bodies, drag to set velocity.
            Explore guided experiments and unlock achievements!
          </p>
          <p className="text-xs mt-2 text-emerald-300">
            Bodies: {bodies.length} | Physics: {settings.simulationMode} | G: {settings.gravitationalConstant.toExponential(1)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Scene3D;
