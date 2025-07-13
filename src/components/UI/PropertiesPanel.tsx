import React from 'react';
import { useSimulationStore } from '../../store/simulationStore';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Slider } from '../ui/slider';
import { Switch } from '../ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Separator } from '../ui/separator';
import { X, Trash2, Eye, EyeOff } from 'lucide-react';

export const PropertiesPanel: React.FC = () => {
  const {
    bodies,
    selectedBodyId,
    showPropertiesPanel,
    setPanel,
    updateBody,
    removeBody,
    selectBody,
  } = useSimulationStore();

  const selectedBody = bodies.find(body => body.id === selectedBodyId);

  if (!showPropertiesPanel || !selectedBody) return null;

  const handleClose = () => {
    setPanel('properties', false);
    selectBody(null);
  };

  const handleUpdateBody = (field: string, value: any) => {
    if (selectedBody) {
      updateBody(selectedBody.id, { [field]: value });
    }
  };

  const handlePositionChange = (index: number, value: string) => {
    if (selectedBody) {
      const newPosition = [...selectedBody.position] as [number, number, number];
      newPosition[index] = parseFloat(value) || 0;
      if (index === 1) newPosition[1] = -1.8; // Lock Y to fabric
      updateBody(selectedBody.id, { position: newPosition });
    }
  };

  const handleVelocityChange = (index: number, value: string) => {
    if (selectedBody) {
      const newVelocity = [...selectedBody.velocity] as [number, number, number];
      newVelocity[index] = parseFloat(value) || 0;
      updateBody(selectedBody.id, { velocity: newVelocity });
    }
  };

  const handleDelete = () => {
    if (selectedBody) {
      removeBody(selectedBody.id);
      handleClose();
    }
  };

  return (
    <div className="fixed top-4 right-4 w-80 bg-black/80 backdrop-blur-sm rounded-lg border border-emerald-500/30 z-50">
      <Card className="bg-transparent border-none text-emerald-400">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold">
              {selectedBody.name || 'Celestial Body'}
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="text-emerald-400 hover:text-emerald-300"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Basic Properties */}
          <div className="space-y-4">
            <div>
              <Label className="text-emerald-300">Name</Label>
              <Input
                value={selectedBody.name}
                onChange={(e) => handleUpdateBody('name', e.target.value)}
                className="mt-1 bg-black/50 border-emerald-500/30 text-emerald-100"
              />
            </div>

            <div>
              <Label className="text-emerald-300">
                Mass: {selectedBody.mass.toFixed(1)}
              </Label>
              <Slider
                value={[selectedBody.mass]}
                onValueChange={([value]) => handleUpdateBody('mass', value)}
                min={0.1}
                max={50}
                step={0.1}
                className="mt-2"
              />
            </div>

            <div>
              <Label className="text-emerald-300">
                Radius: {selectedBody.radius.toFixed(2)}
              </Label>
              <Slider
                value={[selectedBody.radius]}
                onValueChange={([value]) => handleUpdateBody('radius', value)}
                min={0.1}
                max={3}
                step={0.05}
                className="mt-2"
              />
            </div>

            <div>
              <Label className="text-emerald-300">Color</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  type="color"
                  value={selectedBody.color}
                  onChange={(e) => handleUpdateBody('color', e.target.value)}
                  className="w-16 h-10 p-1 bg-black/50 border-emerald-500/30"
                />
                <Input
                  value={selectedBody.color}
                  onChange={(e) => handleUpdateBody('color', e.target.value)}
                  className="flex-1 bg-black/50 border-emerald-500/30 text-emerald-100"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-emerald-300">Has Rings</Label>
              <Switch
                checked={selectedBody.hasRings}
                onCheckedChange={(checked) => handleUpdateBody('hasRings', checked)}
              />
            </div>
          </div>

          <Separator className="bg-emerald-500/30" />

          {/* Position */}
          <div>
            <Label className="text-emerald-300 text-sm font-semibold">Position</Label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              <div>
                <Label className="text-xs text-emerald-400">X</Label>
                <Input
                  type="number"
                  value={selectedBody.position[0].toFixed(2)}
                  onChange={(e) => handlePositionChange(0, e.target.value)}
                  className="bg-black/50 border-emerald-500/30 text-emerald-100 text-sm"
                  step="0.1"
                />
              </div>
              <div>
                <Label className="text-xs text-emerald-400">Y (Locked)</Label>
                <Input
                  type="number"
                  value={selectedBody.position[1].toFixed(2)}
                  disabled
                  className="bg-black/50 border-emerald-500/30 text-emerald-100 text-sm opacity-50"
                />
              </div>
              <div>
                <Label className="text-xs text-emerald-400">Z</Label>
                <Input
                  type="number"
                  value={selectedBody.position[2].toFixed(2)}
                  onChange={(e) => handlePositionChange(2, e.target.value)}
                  className="bg-black/50 border-emerald-500/30 text-emerald-100 text-sm"
                  step="0.1"
                />
              </div>
            </div>
          </div>

          {/* Velocity */}
          <div>
            <Label className="text-emerald-300 text-sm font-semibold">Velocity</Label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              <div>
                <Label className="text-xs text-emerald-400">VX</Label>
                <Input
                  type="number"
                  value={selectedBody.velocity[0].toFixed(3)}
                  onChange={(e) => handleVelocityChange(0, e.target.value)}
                  className="bg-black/50 border-emerald-500/30 text-emerald-100 text-sm"
                  step="0.01"
                />
              </div>
              <div>
                <Label className="text-xs text-emerald-400">VY</Label>
                <Input
                  type="number"
                  value={selectedBody.velocity[1].toFixed(3)}
                  onChange={(e) => handleVelocityChange(1, e.target.value)}
                  className="bg-black/50 border-emerald-500/30 text-emerald-100 text-sm"
                  step="0.01"
                />
              </div>
              <div>
                <Label className="text-xs text-emerald-400">VZ</Label>
                <Input
                  type="number"
                  value={selectedBody.velocity[2].toFixed(3)}
                  onChange={(e) => handleVelocityChange(2, e.target.value)}
                  className="bg-black/50 border-emerald-500/30 text-emerald-100 text-sm"
                  step="0.01"
                />
              </div>
            </div>
          </div>

          <Separator className="bg-emerald-500/30" />

          {/* Physics Info */}
          <div className="space-y-2">
            <Label className="text-emerald-300 text-sm font-semibold">Physics Data</Label>
            <div className="text-xs text-emerald-400 space-y-1">
              <div className="flex justify-between">
                <span>Forces:</span>
                <span>
                  ({selectedBody.forces[0].toFixed(2)}, {selectedBody.forces[1].toFixed(2)}, {selectedBody.forces[2].toFixed(2)})
                </span>
              </div>
              <div className="flex justify-between">
                <span>Speed:</span>
                <span>
                  {Math.sqrt(
                    selectedBody.velocity[0] ** 2 + 
                    selectedBody.velocity[1] ** 2 + 
                    selectedBody.velocity[2] ** 2
                  ).toFixed(3)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Trail Points:</span>
                <span>{selectedBody.trail.length}</span>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <p className="text-xs text-emerald-300/70">
              Tip: Click and drag the object in the 3D view to reposition it, or use the position controls above.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};