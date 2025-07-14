import { create } from 'zustand';
import * as THREE from 'three';

export interface CelestialBody {
  id: string;
  name: string;
  position: [number, number, number];
  velocity: [number, number, number];
  mass: number;
  radius: number;
  color: string;
  texture?: string;
  hasRings: boolean;
  trail: [number, number, number][];
  forces: [number, number, number];
}

export interface SimulationSettings {
  gravitationalConstant: number;
  timeMultiplier: number;
  collisionMode: 'merge' | 'bounce';
  showTrails: boolean;
  showVectors: boolean;
  showGrid: boolean;
  showStars: boolean;
  fabricTransparent: boolean;
  maxTrailLength: number;
  simulationMode: 'exact' | 'approximate';
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: Date;
}

export interface Experiment {
  id: string;
  title: string;
  description: string;
  instructions: string[];
  completed: boolean;
  hints: string[];
}

interface SimulationState {
  // Bodies
  bodies: CelestialBody[];
  selectedBodyId: string | null;
  
  // Settings
  settings: SimulationSettings;
  
  // Physics
  isRunning: boolean;
  totalEnergy: number;
  totalAngularMomentum: number;
  simulationTime: number;
  
  // UI
  showPropertiesPanel: boolean;
  showSettingsPanel: boolean;
  showExperimentsPanel: boolean;
  showExportPanel: boolean;
  showAchievements: boolean;
  fabricVisible: boolean;
  creatingObject: boolean;
  
  // Analytics
  analytics: {
    distanceBetweenSelected: number;
    orbitalPeriod: number;
    kineticEnergy: number;
    potentialEnergy: number;
  };
  
  // Gamification
  achievements: Achievement[];
  experiments: Experiment[];
  score: number;
  
  // Actions
  addBody: (body: Omit<CelestialBody, 'id' | 'trail' | 'forces'>) => void;
  removeBody: (id: string) => void;
  updateBody: (id: string, updates: Partial<CelestialBody>) => void;
  selectBody: (id: string | null) => void;
  updateSettings: (settings: Partial<SimulationSettings>) => void;
  toggleSimulation: () => void;
  resetSimulation: () => void;
  loadPreset: (preset: string) => void;
  updatePhysics: (bodies: CelestialBody[]) => void;
  updateAnalytics: () => void;
  unlockAchievement: (id: string) => void;
  completeExperiment: (id: string) => void;
  setPanel: (panel: string, show: boolean) => void;
  setCreatingObject: (creating: boolean) => void;
}

const defaultSettings: SimulationSettings = {
  gravitationalConstant: 2.0, // Increased for stronger NSTMF-like interactions
  timeMultiplier: 1,
  collisionMode: 'merge',
  showTrails: true,
  showVectors: false,
  showGrid: true,
  showStars: true,
  fabricTransparent: true,
  maxTrailLength: 1000,
  simulationMode: 'exact',
};

const defaultAchievements: Achievement[] = [
  {
    id: 'first-body',
    name: 'First Contact',
    description: 'Add your first celestial body',
    icon: '🌟',
    unlocked: false,
  },
  {
    id: 'stable-orbit',
    name: 'Orbital Master',
    description: 'Create a stable circular orbit',
    icon: '🪐',
    unlocked: false,
  },
  {
    id: 'binary-system',
    name: 'Binary Pioneer',
    description: 'Create a binary star system',
    icon: '⭐',
    unlocked: false,
  },
  {
    id: 'collision-master',
    name: 'Collision Expert',
    description: 'Orchestrate a collision between two bodies',
    icon: '💥',
    unlocked: false,
  },
  {
    id: 'system-builder',
    name: 'System Builder',
    description: 'Create a system with 5 or more bodies',
    icon: '🌌',
    unlocked: false,
  },
];

const defaultExperiments: Experiment[] = [
  {
    id: 'double-mass',
    title: 'Mass Effects',
    description: 'Observe how doubling a planets mass affects its gravitational influence',
    instructions: [
      'Add a planet to the simulation',
      'Note its gravitational effect on the space-time fabric',
      'Double the planets mass using the properties panel',
      'Observe the increased curvature',
    ],
    completed: false,
    hints: ['Mass directly affects gravitational field strength', 'Larger masses create deeper wells in space-time'],
  },
  {
    id: 'escape-velocity',
    title: 'Escape Velocity',
    description: 'Launch an object fast enough to escape a planets gravity',
    instructions: [
      'Create a large planet (mass > 10)',
      'Add a smaller object nearby',
      'Gradually increase the smaller objects velocity',
      'Find the velocity needed for escape',
    ],
    completed: false,
    hints: ['Escape velocity depends on the planets mass and radius', 'Try different starting distances'],
  },
  {
    id: 'lagrange-point',
    title: 'Lagrange Points',
    description: 'Find a stable point between two massive bodies',
    instructions: [
      'Create two large bodies in a binary system',
      'Add a small test mass between them',
      'Adjust its position to find stability',
      'The object should remain stationary relative to the two large bodies',
    ],
    completed: false,
    hints: ['Lagrange points exist where gravitational forces balance', 'Try positioning at L1, L2, or L3 points'],
  },
];

export const useSimulationStore = create<SimulationState>((set, get) => ({
  // Initial state
  bodies: [],
  selectedBodyId: null,
  settings: defaultSettings,
  isRunning: false,
  totalEnergy: 0,
  totalAngularMomentum: 0,
  simulationTime: 0,
  showPropertiesPanel: false,
  showSettingsPanel: false,
  showExperimentsPanel: false,
  showExportPanel: false,
  showAchievements: false,
  fabricVisible: false,
  creatingObject: false,
  analytics: {
    distanceBetweenSelected: 0,
    orbitalPeriod: 0,
    kineticEnergy: 0,
    potentialEnergy: 0,
  },
  achievements: defaultAchievements,
  experiments: defaultExperiments,
  score: 0,

  // Actions
  addBody: (bodyData) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newBody: CelestialBody = {
      ...bodyData,
      id,
      trail: [],
      forces: [0, 0, 0],
    };
    
    set((state) => ({
      bodies: [...state.bodies, newBody],
    }));
    
    // Check for achievements
    const { bodies, unlockAchievement } = get();
    if (bodies.length === 1) {
      unlockAchievement('first-body');
    }
    if (bodies.length >= 5) {
      unlockAchievement('system-builder');
    }
  },

  removeBody: (id) => set((state) => ({
    bodies: state.bodies.filter((body) => body.id !== id),
    selectedBodyId: state.selectedBodyId === id ? null : state.selectedBodyId,
  })),

  updateBody: (id, updates) => set((state) => ({
    bodies: state.bodies.map((body) =>
      body.id === id ? { ...body, ...updates } : body
    ),
  })),

  selectBody: (id) => set({ selectedBodyId: id }),

  updateSettings: (newSettings) => set((state) => ({
    settings: { ...state.settings, ...newSettings },
  })),

  toggleSimulation: () => set((state) => ({
    isRunning: !state.isRunning,
  })),

  resetSimulation: () => set({
    bodies: [],
    selectedBodyId: null,
    isRunning: false,
    simulationTime: 0,
    totalEnergy: 0,
    totalAngularMomentum: 0,
  }),

  loadPreset: (preset) => {
    const presets = {
      'solar-system': [
        {
          name: 'Sun',
          position: [0, 0, 0] as [number, number, number],
          velocity: [0, 0, 0] as [number, number, number],
          mass: 20,
          radius: 1.5,
          color: '#FDB813',
          hasRings: false,
        },
        {
          name: 'Earth',
          position: [5, 0, 0] as [number, number, number],
          velocity: [0, 0, 0.3] as [number, number, number],
          mass: 3,
          radius: 0.4,
          color: '#6B93D6',
          hasRings: false,
        },
        {
          name: 'Mars',
          position: [8, 0, 0] as [number, number, number],
          velocity: [0, 0, 0.25] as [number, number, number],
          mass: 2,
          radius: 0.3,
          color: '#CD5C5C',
          hasRings: false,
        },
      ],
      'binary-star': [
        {
          name: 'Star A',
          position: [-3, 0, 0] as [number, number, number],
          velocity: [0, 0, 0.2] as [number, number, number],
          mass: 15,
          radius: 1.2,
          color: '#FFD700',
          hasRings: false,
        },
        {
          name: 'Star B',
          position: [3, 0, 0] as [number, number, number],
          velocity: [0, 0, -0.2] as [number, number, number],
          mass: 12,
          radius: 1.0,
          color: '#FF6B35',
          hasRings: false,
        },
      ],
      'planetary-ring': [
        {
          name: 'Central Planet',
          position: [0, 0, 0] as [number, number, number],
          velocity: [0, 0, 0] as [number, number, number],
          mass: 15,
          radius: 1.0,
          color: '#8A2BE2',
          hasRings: true,
        },
        // Add ring particles
        ...Array.from({ length: 20 }, (_, i) => {
          const angle = (i / 20) * Math.PI * 2;
          const radius = 3 + Math.random() * 2;
          return {
            name: `Ring Particle ${i + 1}`,
            position: [
              Math.cos(angle) * radius,
              0,
              Math.sin(angle) * radius,
            ] as [number, number, number],
            velocity: [
              -Math.sin(angle) * 0.15,
              0,
              Math.cos(angle) * 0.15,
            ] as [number, number, number],
            mass: 0.5,
            radius: 0.1,
            color: '#C0C0C0',
            hasRings: false,
          };
        }),
      ],
    };

    const bodies = presets[preset as keyof typeof presets] || [];
    set({
      bodies: bodies.map((bodyData, index) => ({
        ...bodyData,
        id: `preset-${preset}-${index}`,
        trail: [],
        forces: [0, 0, 0],
      })),
      selectedBodyId: null,
      isRunning: false,
      simulationTime: 0,
    });
  },

  updatePhysics: (updatedBodies) => set({
    bodies: updatedBodies,
  }),

  updateAnalytics: () => {
    const { bodies, selectedBodyId } = get();
    const selectedBodies = bodies.filter((body) => body.id === selectedBodyId);
    
    let distanceBetweenSelected = 0;
    if (selectedBodies.length >= 2) {
      const [body1, body2] = selectedBodies;
      const dx = body1.position[0] - body2.position[0];
      const dy = body1.position[1] - body2.position[1];
      const dz = body1.position[2] - body2.position[2];
      distanceBetweenSelected = Math.sqrt(dx * dx + dy * dy + dz * dz);
    }

    // Calculate total energies
    let kineticEnergy = 0;
    let potentialEnergy = 0;
    
    bodies.forEach((body, i) => {
      // Kinetic energy
      const vSquared = body.velocity[0] ** 2 + body.velocity[1] ** 2 + body.velocity[2] ** 2;
      kineticEnergy += 0.5 * body.mass * vSquared;
      
      // Potential energy (pairwise)
      for (let j = i + 1; j < bodies.length; j++) {
        const other = bodies[j];
        const dx = body.position[0] - other.position[0];
        const dy = body.position[1] - other.position[1];
        const dz = body.position[2] - other.position[2];
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
        potentialEnergy -= (get().settings.gravitationalConstant * body.mass * other.mass) / distance;
      }
    });

    set((state) => ({
      analytics: {
        ...state.analytics,
        distanceBetweenSelected,
        kineticEnergy,
        potentialEnergy,
      },
      totalEnergy: kineticEnergy + potentialEnergy,
    }));
  },

  unlockAchievement: (id) => set((state) => ({
    achievements: state.achievements.map((achievement) =>
      achievement.id === id
        ? { ...achievement, unlocked: true, unlockedAt: new Date() }
        : achievement
    ),
    score: state.score + 100,
  })),

  completeExperiment: (id) => set((state) => ({
    experiments: state.experiments.map((experiment) =>
      experiment.id === id ? { ...experiment, completed: true } : experiment
    ),
    score: state.score + 500,
  })),

  setPanel: (panel, show) => set((state) => ({
    [`show${panel.charAt(0).toUpperCase() + panel.slice(1)}Panel`]: show,
  } as any)),

  setCreatingObject: (creating) => set({ creatingObject: creating }),
}));