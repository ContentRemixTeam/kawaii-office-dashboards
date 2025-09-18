import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Gamepad2, 
  Zap, 
  Trophy,
  Target,
  ArrowRight,
  Coins,
  Star,
  Play
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TaskArcadeModeContentProps {
  tokens: number;
  todayEarned: number;
  totalEarned: number;
}

export default function TaskArcadeModeContent({ tokens, todayEarned, totalEarned }: TaskArcadeModeContentProps) {
  const navigate = useNavigate();

  // Mock game data - in real app would come from arcade system
  const availableGames = [
    { 
      name: 'Pet Adventure Maze', 
      cost: 20, 
      difficulty: 'Easy', 
      emoji: '🏰',
      description: 'Guide your pet through magical mazes',
      canPlay: tokens >= 20
    },
    { 
      name: 'Productivity Quest', 
      cost: 30, 
      difficulty: 'Medium', 
      emoji: '⚔️',
      description: 'Epic RPG adventure with your tasks',
      canPlay: tokens >= 30
    },
    { 
      name: 'Snake Challenge', 
      cost: 15, 
      difficulty: 'Easy', 
      emoji: '🐍',
      description: 'Classic snake game with bonuses',
      canPlay: tokens >= 15
    }
  ];

  const recentStats = {
    gamesPlayed: 3,
    highScore: 1250,
    streak: 2,
    achievements: 5
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-700 border-green-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Hard': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Token Balance */}
      <Card className="bg-gradient-to-br from-purple-500/10 to-violet-500/10 border-purple-500/20">
        <CardHeader>
          <CardTitle className="text-purple-700 flex items-center gap-2">
            <Coins className="w-5 h-5" />
            Gaming Tokens
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            {/* Token display */}
            <div className="p-6 bg-gradient-to-br from-yellow-400/20 to-orange-400/20 rounded-xl">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="p-3 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full">
                  <Coins className="w-6 h-6 text-white" />
                </div>
                <span className="text-3xl font-bold text-purple-700">{tokens}</span>
              </div>
              <p className="text-sm text-purple-600">Available for gaming</p>
            </div>

            {/* Token stats */}
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-3 bg-white/50 rounded-lg">
                <div className="text-lg font-bold text-green-600">+{todayEarned}</div>
                <div className="text-xs text-muted-foreground">Today</div>
              </div>
              <div className="p-3 bg-white/50 rounded-lg">
                <div className="text-lg font-bold text-purple-600">{totalEarned}</div>
                <div className="text-xs text-muted-foreground">Total</div>
              </div>
            </div>

            {/* Quick earn button */}
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100"
              onClick={() => navigate('/tools/tasks')}
            >
              <Zap className="w-4 h-4 mr-1" />
              Earn More Tokens
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Available Games */}
      <Card className="bg-white/50 border-purple-200">
        <CardHeader>
          <CardTitle className="text-purple-700 flex items-center gap-2">
            <Gamepad2 className="w-5 h-5" />
            Available Games
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {availableGames.map((game, index) => (
              <div 
                key={index}
                className={`
                  p-4 rounded-lg border transition-all duration-200
                  ${game.canPlay 
                    ? 'bg-gradient-to-r from-purple-50 to-violet-50 border-purple-200 hover:shadow-md' 
                    : 'bg-gray-50 border-gray-200 opacity-60'
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{game.emoji}</div>
                    <div>
                      <h4 className="font-medium text-purple-700">{game.name}</h4>
                      <p className="text-xs text-purple-600">{game.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge 
                          variant="secondary" 
                          className={`text-xs ${getDifficultyColor(game.difficulty)}`}
                        >
                          {game.difficulty}
                        </Badge>
                        <span className="text-xs text-purple-600 flex items-center gap-1">
                          <Coins className="w-3 h-3" />
                          {game.cost} tokens
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    disabled={!game.canPlay}
                    onClick={() => navigate('/arcade')}
                    className={game.canPlay ? 'bg-purple-500 hover:bg-purple-600' : ''}
                  >
                    <Play className="w-4 h-4 mr-1" />
                    {game.canPlay ? 'Play' : 'Locked'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Game Stats */}
      <Card className="bg-white/50 border-purple-200">
        <CardHeader>
          <CardTitle className="text-purple-700 flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Your Gaming Stats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-3 bg-gradient-to-br from-purple-50 to-violet-50 rounded-lg">
              <div className="text-xl font-bold text-purple-700">{recentStats.gamesPlayed}</div>
              <div className="text-xs text-purple-600">Games Played</div>
            </div>
            <div className="p-3 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg">
              <div className="text-xl font-bold text-yellow-700">{recentStats.highScore}</div>
              <div className="text-xs text-yellow-600">High Score</div>
            </div>
            <div className="p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
              <div className="text-xl font-bold text-green-700">{recentStats.streak}</div>
              <div className="text-xs text-green-600">Win Streak</div>
            </div>
            <div className="p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
              <div className="text-xl font-bold text-blue-700">{recentStats.achievements}</div>
              <div className="text-xs text-blue-600">Achievements</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Arcade Navigation */}
      <Card className="bg-gradient-to-r from-purple-400/20 to-violet-400/20 border-purple-300/30">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-purple-700">Full Arcade</h3>
              <p className="text-sm text-purple-600">Access all games, leaderboards, and achievements</p>
            </div>
            <Button 
              onClick={() => navigate('/arcade')}
              className="bg-purple-500 hover:bg-purple-600"
            >
              Enter Arcade
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}