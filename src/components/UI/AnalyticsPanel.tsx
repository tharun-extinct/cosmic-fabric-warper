import React from 'react';
import { useSimulationStore } from '../../store/simulationStore';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { BarChart3, Activity, Zap } from 'lucide-react';

export const AnalyticsPanel: React.FC = () => {
  const {
    bodies,
    analytics,
    totalEnergy,
    totalAngularMomentum,
    simulationTime,
    settings,
    selectedBodyId,
  } = useSimulationStore();

  const selectedBody = bodies.find(body => body.id === selectedBodyId);

  const formatNumber = (num: number) => {
    if (Math.abs(num) > 1000000) {
      return num.toExponential(2);
    }
    return num.toFixed(3);
  };

  const formatTime = (time: number) => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed bottom-4 left-4 w-80 bg-black/80 backdrop-blur-sm rounded-lg border border-emerald-500/30 z-40">
      <Card className="bg-transparent border-none text-emerald-400">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Live Analytics
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* System Overview */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-emerald-500/10 rounded-lg p-3">
              <div className="text-emerald-300 text-sm font-semibold">Bodies</div>
              <div className="text-2xl font-bold text-emerald-100">{bodies.length}</div>
            </div>
            <div className="bg-emerald-500/10 rounded-lg p-3">
              <div className="text-emerald-300 text-sm font-semibold">Time</div>
              <div className="text-sm font-mono text-emerald-100">{formatTime(simulationTime)}</div>
            </div>
          </div>

          {/* Energy Conservation */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-400" />
              <span className="text-emerald-300 text-sm font-semibold">Energy Conservation</span>
            </div>
            <div className="bg-black/30 rounded-lg p-3 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-emerald-400">Kinetic:</span>
                <span className="text-emerald-100 font-mono">{formatNumber(analytics.kineticEnergy)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-emerald-400">Potential:</span>
                <span className="text-emerald-100 font-mono">{formatNumber(analytics.potentialEnergy)}</span>
              </div>
              <div className="flex justify-between text-xs border-t border-emerald-500/30 pt-2">
                <span className="text-emerald-300 font-semibold">Total:</span>
                <span className="text-emerald-100 font-mono font-semibold">{formatNumber(totalEnergy)}</span>
              </div>
            </div>
          </div>

          {/* Angular Momentum */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-400" />
              <span className="text-emerald-300 text-sm font-semibold">Angular Momentum</span>
            </div>
            <div className="bg-black/30 rounded-lg p-3">
              <div className="text-emerald-100 font-mono text-sm">{formatNumber(totalAngularMomentum)}</div>
            </div>
          </div>

          {/* Selected Body Info */}
          {selectedBody && (
            <div className="space-y-2">
              <div className="text-emerald-300 text-sm font-semibold">
                Selected: {selectedBody.name}
              </div>
              <div className="bg-black/30 rounded-lg p-3 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-emerald-400">Speed:</span>
                  <span className="text-emerald-100 font-mono">
                    {formatNumber(Math.sqrt(
                      selectedBody.velocity[0] ** 2 + 
                      selectedBody.velocity[1] ** 2 + 
                      selectedBody.velocity[2] ** 2
                    ))}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-emerald-400">Distance from center:</span>
                  <span className="text-emerald-100 font-mono">
                    {formatNumber(Math.sqrt(
                      selectedBody.position[0] ** 2 + 
                      selectedBody.position[1] ** 2 + 
                      selectedBody.position[2] ** 2
                    ))}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-emerald-400">Force magnitude:</span>
                  <span className="text-emerald-100 font-mono">
                    {formatNumber(Math.sqrt(
                      selectedBody.forces[0] ** 2 + 
                      selectedBody.forces[1] ** 2 + 
                      selectedBody.forces[2] ** 2
                    ))}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Physics Parameters */}
          <div className="space-y-2">
            <div className="text-emerald-300 text-sm font-semibold">Physics Parameters</div>
            <div className="bg-black/30 rounded-lg p-3 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-emerald-400">G-constant:</span>
                <span className="text-emerald-100 font-mono">{settings.gravitationalConstant.toExponential(2)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-emerald-400">Time multiplier:</span>
                <span className="text-emerald-100 font-mono">{settings.timeMultiplier}x</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-emerald-400">Simulation mode:</span>
                <span className="text-emerald-100 font-mono capitalize">{settings.simulationMode}</span>
              </div>
            </div>
          </div>

          {/* Conservation Laws Info */}
          <div className="bg-blue-500/10 rounded-lg p-3">
            <div className="text-blue-300 text-xs font-semibold mb-1">Conservation Laws</div>
            <div className="text-blue-200 text-xs">
              In an isolated system, energy and angular momentum remain constant. 
              Watch these values - they should stay nearly the same for stable orbits!
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};