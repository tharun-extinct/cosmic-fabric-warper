import React from 'react';
import { CreationTool } from './CreationTool';
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
  EyeOff,
  MousePointer
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
    updateSettings,
  } = useSimulationStore();
  
  const [creationMode, setCreationMode] = React.useState(false);

  const handleToggleCreation = () => {
    setCreationMode(!creationMode);
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
                onClick={handleToggleCreation}
                className={`${
                  creationMode 
                    ? 'bg-emerald-500/30 text-emerald-300 border-emerald-400' 
                    : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                } border border-emerald-500/30`}
                variant="ghost"
                size="sm"
              >
                {creationMode ? (
                  <MousePointer className="h-4 w-4" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                {creationMode 
                  ? 'Exit creation mode' 
                  : 'Enter creation mode (Click & hold to create)'
                }
              </p>
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
                  onClick={() => setPanel('export', true)}
                  className="text-cyan-400 hover:bg-cyan-500/20"
                  variant="ghost"
                  size="sm"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Export tools</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
      
      <CreationTool 
        isActive={creationMode} 
        onComplete={() => setCreationMode(false)} 
      />
    </TooltipProvider>
  );
};