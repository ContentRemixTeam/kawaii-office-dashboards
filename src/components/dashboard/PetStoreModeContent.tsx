import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Heart, 
  Star, 
  Crown,
  Target,
  ArrowRight,
  Sparkles 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTodayPet } from '@/hooks/useTodayPet';

interface PetStoreModeContentProps {
  earnedAnimals: string[];
  petStage: number;
}

export default function PetStoreModeContent({ earnedAnimals, petStage }: PetStoreModeContentProps) {
  const navigate = useNavigate();
  const todayPet = useTodayPet();

  const getStageProgress = () => {
    // Simulate pet growth stages (0-100%)
    const stageProgressMap = {
      0: 0,   // Egg
      1: 25,  // Baby
      2: 50,  // Child  
      3: 75,  // Teen
      4: 100  // Adult
    };
    return stageProgressMap[petStage as keyof typeof stageProgressMap] || 0;
  };

  const getStageInfo = () => {
    const stages = [
      { name: 'Egg', emoji: '🥚', description: 'Ready to hatch!' },
      { name: 'Baby', emoji: '🐣', description: 'Growing strong' },
      { name: 'Child', emoji: '🐤', description: 'Learning fast' },
      { name: 'Teen', emoji: '🐦', description: 'Almost ready' },
      { name: 'Adult', emoji: '🦅', description: 'Fully grown!' }
    ];
    return stages[petStage] || stages[0];
  };

  const stageInfo = getStageInfo();
  const progress = getStageProgress();

  return (
    <div className="space-y-6">
      {/* Today's Pet Growth */}
      <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
        <CardHeader>
          <CardTitle className="text-green-700 flex items-center gap-2">
            <Heart className="w-5 h-5" />
            Today's Pet Growth
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Current pet display */}
            <div className="text-center p-6 bg-white/50 rounded-xl">
              <div className="text-6xl mb-2">{stageInfo.emoji}</div>
              <h3 className="text-xl font-bold text-green-700 mb-1 capitalize">{todayPet}</h3>
              <p className="text-sm text-green-600">{stageInfo.name} - {stageInfo.description}</p>
            </div>

            {/* Growth progress */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-green-700">Growth Progress</span>
                <span className="text-sm text-green-600">{progress}%</span>
              </div>
              <Progress value={progress} className="bg-green-100" />
              <p className="text-xs text-green-600 text-center">
                Complete tasks to help your pet grow!
              </p>
            </div>

            {/* Quick actions */}
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                onClick={() => navigate('/tools/tasks')}
              >
                <Target className="w-4 h-4 mr-1" />
                Feed Pet
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                onClick={() => navigate('/tools/tasks')}
              >
                <Sparkles className="w-4 h-4 mr-1" />
                Pet Care
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pet Collection */}
      <Card className="bg-white/50 border-green-200">
        <CardHeader>
          <CardTitle className="text-green-700 flex items-center gap-2">
            <Crown className="w-5 h-5" />
            Your Pet Collection
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              {earnedAnimals.length} pets
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {earnedAnimals.length > 0 ? (
            <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
              {earnedAnimals.slice(0, 8).map((animal, index) => (
                <div 
                  key={index}
                  className="text-center p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200"
                >
                  <div className="text-2xl mb-1">
                    {animal === 'bee' ? '🐝' : 
                     animal === 'cat' ? '🐱' : 
                     animal === 'dog' ? '🐶' : 
                     animal === 'bunny' ? '🐰' : '🐾'}
                  </div>
                  <p className="text-xs text-green-600 capitalize">{animal}</p>
                </div>
              ))}
              {earnedAnimals.length > 8 && (
                <div className="text-center p-3 bg-green-100 rounded-lg border border-green-200">
                  <div className="text-lg text-green-600">+{earnedAnimals.length - 8}</div>
                  <p className="text-xs text-green-600">more</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-6">
              <div className="text-4xl mb-2">🥚</div>
              <p className="text-muted-foreground">Complete tasks to earn your first pet!</p>
              <Button 
                className="mt-3"
                onClick={() => navigate('/tools/tasks')}
              >
                Start Growing Pets
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pet Store Navigation */}
      <Card className="bg-gradient-to-r from-green-400/20 to-emerald-400/20 border-green-300/30">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-green-700">Full Pet Store</h3>
              <p className="text-sm text-green-600">Manage all your pets and growth progress</p>
            </div>
            <Button 
              onClick={() => navigate('/tools/tasks')}
              className="bg-green-500 hover:bg-green-600"
            >
              Visit Store
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}