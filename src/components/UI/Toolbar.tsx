import React from 'react';
import { useSimulationStore } from '../../store/simulationStore';
import { Button } from '../ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { 
  Plus, 
  Settings, 
  BarChart3, 
  Trophy, 
  Play, 
  Pause, 
  RotateCcw,
  Download,
  Camera,
  Eye,
  EyeOff
} from 'lucide-react';

export const Toolbar: React.FC = () => {
  const {
    isRunning,
    settings,
    showPropertiesPanel,
    showSettingsPanel,
    showExperimentsPanel,
    setPanel,
    toggleSimulation,
    resetSimulation,
    addBody,
    updateSettings,
  } = useSimulationStore();

  const handleAddBody = () => {
    const angle = Math.random() * Math.PI * 2;
    const radius = 2 + Math.random() * 4;
    
    addBody({
      name: `Planet ${Date.now().toString().slice(-4)}`,
      position: [
        Math.cos(angle) * radius,
        -1.8,
        Math.sin(angle) * radius,
      ],
      velocity: [
        -Math.sin(angle) * 0.1 * Math.random(),
        0,
        Math.cos(angle) * 0.1 * Math.random(),
      ],
      mass: 1 + Math.random() * 5,
      radius: 0.2 + Math.random() * 0.5,
      color: `hsl(${Math.random() * 360}, 70%, 60%)`,
      hasRings: Math.random() > 0.8,
    });
  };

  const handleScreenshot = () => {
    // This would be implemented with canvas.toDataURL()
    console.log('Screenshot feature - would capture canvas');
  };

  const handleExport = () => {
    // This would be implemented with data export
    console.log('Export feature - would export simulation data');
  };

  return (
    <TooltipProvider>
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-black/80 backdrop-blur-sm rounded-lg border border-emerald-500/30 z-50">
        <div className="flex items-center gap-2 p-2">
          {/* Add Body */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={handleAddBody}
                className="bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30"
                variant="ghost"
                size="sm"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Add celestial body</p>
            </TooltipContent>
          </Tooltip>

          {/* Simulation Controls */}
          <div className="flex items-center gap-1 border-l border-emerald-500/30 pl-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={toggleSimulation}
                  className={`${
                    isRunning 
                      ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
                      : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                  }`}
                  variant="ghost"
                  size="sm"
                >
                  {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isRunning ? 'Pause simulation' : 'Start simulation'}</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={resetSimulation}
                  className="bg-orange-500/20 text-orange-400 hover:bg-orange-500/30"
                  variant="ghost"
                  size="sm"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Reset simulation</p>
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Visual Toggles */}
          <div className="flex items-center gap-1 border-l border-emerald-500/30 pl-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => updateSettings({ showTrails: !settings.showTrails })}
                  className={`${
                    settings.showTrails
                      ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
                      : 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30'
                  }`}
                  variant="ghost"
                  size="sm"
                >
                  {settings.showTrails ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Toggle orbital trails</p>
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Panel Toggles */}
          <div className="flex items-center gap-1 border-l border-emerald-500/30 pl-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => setPanel('settings', !showSettingsPanel)}
                  className={`${
                    showSettingsPanel
                      ? 'bg-emerald-500/30 text-emerald-300'
                      : 'text-emerald-400 hover:bg-emerald-500/20'
                  }`}
                  variant="ghost"
                  size="sm"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Settings panel</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => setPanel('experiments', !showExperimentsPanel)}
                  className={`${
                    showExperimentsPanel
                      ? 'bg-yellow-500/30 text-yellow-300'
                      : 'text-yellow-400 hover:bg-yellow-500/20'
                  }`}
                  variant="ghost"
                  size="sm"
                >
                  <Trophy className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Experiments & achievements</p>
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Export Tools */}
          <div className="flex items-center gap-1 border-l border-emerald-500/30 pl-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={handleScreenshot}
                  className="text-purple-400 hover:bg-purple-500/20"
                  variant="ghost"
                  size="sm"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Take screenshot</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={handleExport}
                  className="text-cyan-400 hover:bg-cyan-500/20"
                  variant="ghost"
                  size="sm"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Export data</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};