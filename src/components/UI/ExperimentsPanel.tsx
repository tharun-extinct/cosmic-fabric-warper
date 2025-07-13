import React from 'react';
import { useSimulationStore } from '../../store/simulationStore';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { X, CheckCircle, Circle, Lightbulb, Trophy } from 'lucide-react';

export const ExperimentsPanel: React.FC = () => {
  const {
    experiments,
    achievements,
    showExperimentsPanel,
    setPanel,
    completeExperiment,
    score,
  } = useSimulationStore();

  if (!showExperimentsPanel) return null;

  const handleClose = () => {
    setPanel('experiments', false);
  };

  const completedExperiments = experiments.filter(exp => exp.completed).length;
  const unlockedAchievements = achievements.filter(ach => ach.unlocked).length;
  const progressPercentage = (completedExperiments / experiments.length) * 100;

  return (
    <div className="fixed top-4 right-96 w-96 bg-black/80 backdrop-blur-sm rounded-lg border border-emerald-500/30 z-50 max-h-[80vh] overflow-y-auto">
      <Card className="bg-transparent border-none text-emerald-400">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-400" />
              Guided Experiments
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
          
          {/* Progress Overview */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-emerald-300">Overall Progress</span>
              <span className="text-sm text-emerald-300">{completedExperiments}/{experiments.length}</span>
            </div>
            <Progress value={progressPercentage} className="w-full" />
            
            <div className="flex justify-between text-xs text-emerald-400">
              <span>Score: {score}</span>
              <span>Achievements: {unlockedAchievements}/{achievements.length}</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Experiments */}
          <div className="space-y-4">
            {experiments.map((experiment) => (
              <Card key={experiment.id} className="bg-black/30 border-emerald-500/20">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {experiment.completed ? (
                        <CheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
                      ) : (
                        <Circle className="h-5 w-5 text-emerald-400 mt-0.5" />
                      )}
                      <div>
                        <CardTitle className="text-sm text-emerald-300">
                          {experiment.title}
                        </CardTitle>
                        <p className="text-xs text-emerald-400 mt-1">
                          {experiment.description}
                        </p>
                      </div>
                    </div>
                    {experiment.completed && (
                      <Badge variant="secondary" className="bg-green-500/20 text-green-300">
                        Complete
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {/* Instructions */}
                    <div>
                      <div className="text-xs text-emerald-300 font-semibold mb-2">Instructions:</div>
                      <ol className="text-xs text-emerald-400 space-y-1">
                        {experiment.instructions.map((instruction, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-emerald-500 font-bold">{index + 1}.</span>
                            <span>{instruction}</span>
                          </li>
                        ))}
                      </ol>
                    </div>

                    {/* Hints */}
                    <div className="bg-blue-500/10 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Lightbulb className="h-4 w-4 text-yellow-400" />
                        <span className="text-xs text-blue-300 font-semibold">Hints:</span>
                      </div>
                      <ul className="text-xs text-blue-200 space-y-1">
                        {experiment.hints.map((hint, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-blue-400">•</span>
                            <span>{hint}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Complete Button */}
                    {!experiment.completed && (
                      <Button
                        onClick={() => completeExperiment(experiment.id)}
                        className="w-full bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/30"
                        variant="outline"
                      >
                        Mark as Complete (+500 points)
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Achievements */}
          <div className="space-y-4">
            <div className="text-emerald-300 text-sm font-semibold">Achievements</div>
            <div className="grid grid-cols-1 gap-2">
              {achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border ${
                    achievement.unlocked
                      ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-300'
                      : 'bg-gray-500/10 border-gray-500/30 text-gray-400'
                  }`}
                >
                  <span className="text-2xl">{achievement.icon}</span>
                  <div className="flex-1">
                    <div className="font-semibold text-sm">{achievement.name}</div>
                    <div className="text-xs opacity-80">{achievement.description}</div>
                    {achievement.unlocked && achievement.unlockedAt && (
                      <div className="text-xs mt-1 opacity-60">
                        Unlocked: {achievement.unlockedAt.toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  {achievement.unlocked && (
                    <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-300">
                      +100
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <p className="text-xs text-emerald-300/70">
              Complete experiments to unlock achievements and learn physics concepts through hands-on exploration!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};