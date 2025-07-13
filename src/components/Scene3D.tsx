import React, { useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, Line } from '@react-three/drei';
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
import { CreationTool } from './UI/CreationTool';
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
  if (!body.trail || body.trail.length < 2 || !useSimulationStore.getState().settings.showTrails) return null;

  const points = body.trail.map(point => new THREE.Vector3(point[0], 0, point[2]));
  
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
  
  const [creationMode, setCreationMode] = React.useState(false);

  const handleCanvasClick = (event: any) => {
    if (!event.intersections || event.intersections.length === 0) {
      selectBody(null);
      setPanel('properties', false);
    }
  };

  return (
    <div className="relative w-full h-screen bg-black">
      <Canvas 
        camera={{ position: [0, 15, 0], fov: 75 }}
        onClick={handleCanvasClick}
      >
        <PhysicsSimulation />
        
        <ambientLight intensity={0.5} />
        <directionalLight position={[0, 10, 0]} intensity={0.8} />
        
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
            
            <TrailRenderer body={body} />
          </group>
        ))}
        
        <CreationTool 
          isActive={creationMode} 
          onComplete={() => setCreationMode(false)} 
        />
      </Canvas>
      
      <Toolbar 
        creationMode={creationMode}
        onToggleCreation={() => setCreationMode(!creationMode)}
      />
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
          <h2 className="text-lg font-bold mb-2">2D Space-Time Physics Simulator</h2>
          <p className="text-sm">
            Click the + button to enter creation mode. Press and hold to create bodies, flick to set velocity.
            Watch the space-time fabric curve during creation!
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