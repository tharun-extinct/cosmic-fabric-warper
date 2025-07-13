# 2D Space-Time Physics Simulator

An interactive educational tool that visualizes gravitational physics in a 2D plane using React and Three.js.

## Features

### Core Physics
- **2D N-Body Simulation**: Real-time gravitational interactions between celestial bodies
- **Dynamic Space-Time Fabric**: Visual representation of gravitational wells with white gradient
- **Collision Detection**: Bodies merge when they collide, conserving momentum
- **Energy Conservation**: Real-time tracking of kinetic and potential energy

### User Interaction
- **Press & Hold Creation**: Hold mouse button to create objects with increasing mass
- **Flick Velocity**: Drag while holding to set initial velocity vector
- **Real-time Feedback**: Visual indicators during object creation
- **Fabric Animation**: Space-time fabric appears during creation and fades after 2 seconds

### Educational Tools
- **Live Analytics**: Energy conservation, angular momentum, and physics metrics
- **Guided Experiments**: Structured tutorials for learning physics concepts
- **Achievement System**: Gamified learning with unlockable badges
- **Preset Scenarios**: Solar system, binary stars, and planetary rings

### Visualization
- **2D Top-Down View**: Clear perspective for understanding orbital mechanics
- **Orbital Trails**: Visual history of object paths
- **Velocity Vectors**: Green arrows showing object motion on hover
- **Selection Indicators**: Highlight and inspect individual objects

## Technical Implementation

### Architecture
- **React 18** with TypeScript for type safety
- **Three.js** via react-three-fiber for 3D rendering
- **Zustand** for efficient state management
- **Custom Physics Engine** for N-body calculations

### Key Components
- `Scene3D.tsx` - Main 3D scene and camera setup
- `PhysicsObject.tsx` - Individual celestial body rendering
- `SpaceTimeFabric.tsx` - Dynamic gravitational well visualization
- `CreationTool.tsx` - Interactive object creation system
- `PhysicsEngine.ts` - N-body physics calculations

### Physics Features
- Exact N-body gravitational simulation
- Collision detection and inelastic merging
- Energy and momentum conservation
- Adjustable gravitational constant and time scaling

## Usage

1. **Enter Creation Mode**: Click the "+" button in the toolbar
2. **Create Objects**: Press and hold on the canvas (longer hold = larger mass)
3. **Set Velocity**: Drag while holding to define initial velocity
4. **Observe Physics**: Watch gravitational interactions in real-time
5. **Analyze Results**: Use panels to study energy conservation and orbital mechanics

## Educational Value

This simulator helps users understand:
- Gravitational force and inverse square law
- Orbital mechanics and Kepler's laws
- Energy and momentum conservation
- Lagrange points and stable orbits
- Escape velocity concepts

Perfect for students, educators, and physics enthusiasts exploring celestial mechanics through interactive visualization.