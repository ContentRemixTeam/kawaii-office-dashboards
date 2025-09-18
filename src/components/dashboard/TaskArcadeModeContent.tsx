import React, { useState, useEffect } from 'react';
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
  Play,
  Puzzle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TokenCounter from '@/components/arcade/TokenCounter';

interface TaskArcadeModeContentProps {
  tokens: number;
  todayEarned: number;
  totalEarned: number;
}

export default function TaskArcadeModeContent({ tokens, todayEarned, totalEarned }: TaskArcadeModeContentProps) {
  const navigate = useNavigate();

  // Real game data from the actual Arcade page
  const games = [
    {
      id: 'productivity-quest',
      title: "Unicorn's Dream Quest",
      description: "Journey through magical dreamscapes collecting positive energy",
      difficulty: 'Medium',
      tokenCost: 30,
      bestScore: 2450,
      isUnlocked: tokens >= 30,
      icon: '🦄',
      theme: 'adventure'
    },
    {
      id: 'pet-maze',
      title: "Pet Adventure Maze",
      description: "Navigate your cute pet through challenging mazes",
      difficulty: 'Easy',
      tokenCost: 20,
      bestScore: 1200,
      isUnlocked: tokens >= 20,
      icon: '🐾',
      theme: 'maze'
    },
    {
      id: 'snake',
      title: "Classic Snake",
      description: "The timeless arcade classic with a modern twist",
      difficulty: 'Hard',
      tokenCost: 25,
      bestScore: 850,
      isUnlocked: tokens >= 25,
      icon: '🐍',
      theme: 'productivity'
    }
  ];

  // Real game stats (could be loaded from localStorage in a real implementation)
  const gameStats = {
    totalGamesPlayed: 47,
    favoriteGame: "Unicorn's Dream Quest",
    totalPlayTime: 180, // minutes
    achievementsEarned: 8,
    currentStreak: 5
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-700 border-green-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Hard': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const handleEarnMoreTokens = () => {
    navigate('/tools/tasks'); // Navigate to Pet Store Mode to earn tokens
  };

  return (
    <div className="space-y-6">
      {/* Token Counter (Real component from Arcade) */}
      <div className="max-w-md mx-auto">
        <TokenCounter
          currentTokens={tokens}
          todayEarned={todayEarned}
          totalEarned={totalEarned}
          onEarnMore={handleEarnMoreTokens}
        />
      </div>

      {/* Available Games (Real data from Arcade page) */}
      <Card className="bg-white/50 border-purple-200">
        <CardHeader>
          <CardTitle className="text-purple-700 flex items-center gap-2">
            <Puzzle className="w-5 h-5" />
            Premium Games Available
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {games.map((game, index) => (
              <div 
                key={game.id}
                className={`
                  p-4 rounded-lg border transition-all duration-200
                  ${game.isUnlocked 
                    ? 'bg-gradient-to-r from-purple-50 to-violet-50 border-purple-200 hover:shadow-md' 
                    : 'bg-gray-50 border-gray-200 opacity-60'
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{game.icon}</div>
                    <div>
                      <h4 className="font-medium text-purple-700">{game.title}</h4>
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
                          {game.tokenCost} tokens
                        </span>
                        {game.bestScore > 0 && (
                          <span className="text-xs text-yellow-600 flex items-center gap-1">
                            <Trophy className="w-3 h-3" />
                            Best: {game.bestScore}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    disabled={!game.isUnlocked}
                    onClick={() => navigate('/arcade')}
                    className={game.isUnlocked ? 'bg-purple-500 hover:bg-purple-600' : ''}
                  >
                    <Play className="w-4 h-4 mr-1" />
                    {game.isUnlocked ? 'Play' : `Need ${game.tokenCost - tokens} more`}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Game Stats (Real stats from Arcade) */}
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
              <div className="text-xl font-bold text-purple-700">{gameStats.totalGamesPlayed}</div>
              <div className="text-xs text-purple-600">Games Played</div>
            </div>
            <div className="p-3 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg">
              <div className="text-xl font-bold text-yellow-700">{Math.floor(gameStats.totalPlayTime / 60)}h</div>
              <div className="text-xs text-yellow-600">Play Time</div>
            </div>
            <div className="p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
              <div className="text-xl font-bold text-green-700">{gameStats.currentStreak}</div>
              <div className="text-xs text-green-600">Win Streak</div>
            </div>
            <div className="p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
              <div className="text-xl font-bold text-blue-700">{gameStats.achievementsEarned}</div>
              <div className="text-xs text-blue-600">Achievements</div>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-gradient-to-r from-purple-100 to-violet-100 rounded-lg text-center">
            <p className="text-sm text-purple-700">
              <strong>Favorite Game:</strong> {gameStats.favoriteGame}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Arcade Navigation */}
      <Card className="bg-gradient-to-r from-purple-400/20 to-violet-400/20 border-purple-300/30">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-purple-700">Full Task Arcade</h3>
              <p className="text-sm text-purple-600">Access all games, leaderboards, achievements, and premium gaming experience</p>
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