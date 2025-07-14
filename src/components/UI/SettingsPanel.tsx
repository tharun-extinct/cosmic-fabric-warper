import React from 'react';
import { useSimulationStore } from '../../store/simulationStore';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Slider } from '../ui/slider';
import { Switch } from '../ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Separator } from '../ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { X, RotateCcw, Play, Pause, Settings2 } from 'lucide-react';

export const SettingsPanel: React.FC = () => {
  const {
    settings,
    showSettingsPanel,
    isRunning,
    setPanel,
    updateSettings,
    toggleSimulation,
    resetSimulation,
    loadPreset,
  } = useSimulationStore();

  if (!showSettingsPanel) return null;

  const handleClose = () => {
    setPanel('settings', false);
  };

  const presets = [
    { value: 'solar-system', label: 'Solar System' },
    { value: 'binary-star', label: 'Binary Star System' },
    { value: 'planetary-ring', label: 'Planetary Ring System' },
  ];

  return (
    <div className="fixed top-4 left-4 w-80 bg-black/80 backdrop-blur-sm rounded-lg border border-emerald-500/30 z-50">
      <Card className="bg-transparent border-none text-emerald-400">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Settings2 className="h-5 w-5" />
              Simulation Settings
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="text-emerald-400 hover:text-emerald-300"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Simulation Controls */}
          <div className="space-y-4">
            <Label className="text-emerald-300 text-sm font-semibold">Controls</Label>
            <div className="flex gap-2">
              <Button
                onClick={toggleSimulation}
                className={`flex-1 ${
                  isRunning 
                    ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
                    : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                }`}
                variant="ghost"
              >
                {isRunning ? (
                  <>
                    <Pause className="h-4 w-4 mr-2" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Start
                  </>
                )}
              </Button>
              <Button
                onClick={resetSimulation}
                variant="ghost"
                className="bg-orange-500/20 text-orange-400 hover:bg-orange-500/30"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Separator className="bg-emerald-500/30" />

          {/* Physics Settings */}
          <div className="space-y-4">
            <Label className="text-emerald-300 text-sm font-semibold">Physics</Label>
            
            <div>
              <Label className="text-emerald-300 text-sm">
                Gravitational Constant: {settings.gravitationalConstant.toExponential(2)}
              </Label>
              <Slider
                value={[Math.log10(settings.gravitationalConstant) + 15]}
                onValueChange={([value]) => 
                  updateSettings({ gravitationalConstant: Math.pow(10, value - 15) })
                }
                min={4}
                max={8}
                step={0.1}
                className="mt-2"
              />
            </div>

            <div>
              <Label className="text-emerald-300 text-sm">
                Time Multiplier: {settings.timeMultiplier.toFixed(1)}x
              </Label>
              <Slider
                value={[settings.timeMultiplier]}
                onValueChange={([value]) => updateSettings({ timeMultiplier: value })}
                min={0.1}
                max={10}
                step={0.1}
                className="mt-2"
              />
            </div>

            <div>
              <Label className="text-emerald-300 text-sm">Simulation Mode</Label>
              <Select
                value={settings.simulationMode}
                onValueChange={(value: 'exact' | 'approximate') => 
                  updateSettings({ simulationMode: value })
                }
              >
                <SelectTrigger className="mt-1 bg-black/50 border-emerald-500/30 text-emerald-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-black border-emerald-500/30">
                  <SelectItem value="exact" className="text-emerald-100">
                    Exact (GPU Compute)
                  </SelectItem>
                  <SelectItem value="approximate" className="text-emerald-100">
                    Approximate (Barnes-Hut)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-emerald-300 text-sm">Collision Mode</Label>
              <Select
                value={settings.collisionMode}
                onValueChange={(value: 'merge' | 'bounce') => 
                  updateSettings({ collisionMode: value })
                }
              >
                <SelectTrigger className="mt-1 bg-black/50 border-emerald-500/30 text-emerald-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-black border-emerald-500/30">
                  <SelectItem value="merge" className="text-emerald-100">
                    Inelastic Merge
                  </SelectItem>
                  <SelectItem value="bounce" className="text-emerald-100">
                    Elastic Bounce
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator className="bg-emerald-500/30" />

          {/* Visual Settings */}
          <div className="space-y-4">
            <Label className="text-emerald-300 text-sm font-semibold">Visualization</Label>
            
            <div className="flex items-center justify-between">
              <Label className="text-emerald-300 text-sm">Show Trails</Label>
              <Switch
                checked={settings.showTrails}
                onCheckedChange={(checked) => updateSettings({ showTrails: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-emerald-300 text-sm">Show Force Vectors</Label>
              <Switch
                checked={settings.showVectors}
                onCheckedChange={(checked) => updateSettings({ showVectors: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-emerald-300 text-sm">Show Grid</Label>
              <Switch
                checked={settings.showGrid}
                onCheckedChange={(checked) => updateSettings({ showGrid: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-emerald-300 text-sm">Show Stars</Label>
              <Switch
                checked={settings.showStars}
                onCheckedChange={(checked) => updateSettings({ showStars: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-emerald-300 text-sm">Fabric Transparency</Label>
              <Switch
                checked={settings.fabricTransparent}
                onCheckedChange={(checked) => updateSettings({ fabricTransparent: checked })}
              />
            </div>

            <div>
              <Label className="text-emerald-300 text-sm">
                Max Trail Length: {settings.maxTrailLength}
              </Label>
              <Slider
                value={[settings.maxTrailLength]}
                onValueChange={([value]) => updateSettings({ maxTrailLength: value })}
                min={50}
                max={2000}
                step={50}
                className="mt-2"
              />
            </div>
          </div>

          <Separator className="bg-emerald-500/30" />

          {/* Presets */}
          <div className="space-y-4">
            <Label className="text-emerald-300 text-sm font-semibold">Presets</Label>
            <div className="space-y-2">
              {presets.map((preset) => (
                <Button
                  key={preset.value}
                  onClick={() => loadPreset(preset.value)}
                  variant="outline"
                  className="w-full justify-start bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20"
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <p className="text-xs text-emerald-300/70">
              Tip: Adjust the gravitational constant to see extreme effects, or use different simulation modes based on the number of bodies.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};