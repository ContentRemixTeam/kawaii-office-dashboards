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
  Puzzle,
  Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TokenCounter from '@/components/arcade/TokenCounter';

// Import kawaii game graphics
import unicornDreamQuest from '@/assets/arcade/unicorn-dream-quest.png';
import petAdventureMaze from '@/assets/arcade/pet-adventure-maze.png';
import classicSnake from '@/assets/arcade/classic-snake.png';
import arcadeHeader from '@/assets/arcade/arcade-header.png';

interface TaskArcadeModeContentProps {
  tokens: number;
  todayEarned: number;
  totalEarned: number;
}

export default function TaskArcadeModeContent({ tokens, todayEarned, totalEarned }: TaskArcadeModeContentProps) {
  const navigate = useNavigate();

  // Real game data from the actual Arcade page with kawaii graphics
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
      theme: 'adventure',
      image: unicornDreamQuest
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
      theme: 'maze',
      image: petAdventureMaze
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
      theme: 'productivity',
      image: classicSnake
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
      {/* Kawaii Arcade Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-pink-100 via-purple-100 to-blue-100 p-8 text-center">
        <div 
          className="absolute inset-0 opacity-30 bg-cover bg-center"
          style={{ backgroundImage: `url(${arcadeHeader})` }}
        />
        <div className="relative z-10">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-2">
            🎮 Kawaii Task Arcade 🎮
          </h1>
          <p className="text-purple-700 text-lg font-medium">
            Complete tasks to earn tokens and unlock cute games! ✨
          </p>
        </div>
        <div className="absolute top-4 left-4 text-3xl animate-bounce">🌟</div>
        <div className="absolute top-4 right-4 text-3xl animate-pulse">💖</div>
        <div className="absolute bottom-4 left-8 text-2xl animate-bounce delay-200">🎀</div>
        <div className="absolute bottom-4 right-8 text-2xl animate-pulse delay-300">🌈</div>
      </div>

      {/* Token Counter (Real component from Arcade) */}
      <div className="max-w-md mx-auto">
        <TokenCounter
          currentTokens={tokens}
          todayEarned={todayEarned}
          totalEarned={totalEarned}
          onEarnMore={handleEarnMoreTokens}
        />
      </div>

      {/* Available Games with Kawaii Graphics */}
      <Card className="bg-white/50 border-purple-200 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
          <CardTitle className="text-purple-700 flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Premium Games Available
            <Sparkles className="w-5 h-5" />
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {games.map((game, index) => (
              <div 
                key={game.id}
                className={`
                  relative overflow-hidden rounded-2xl border-2 transition-all duration-300 hover:scale-105
                  ${game.isUnlocked 
                    ? 'bg-gradient-to-r from-purple-50 via-pink-50 to-blue-50 border-purple-200 hover:shadow-xl hover:border-purple-300' 
                    : 'bg-gray-50 border-gray-200 opacity-60'
                  }
                `}
              >
                {/* Game Image Background */}
                <div className="absolute inset-0">
                  <img 
                    src={game.image}
                    alt={game.title}
                    className="w-full h-full object-cover opacity-20"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-white/80 to-white/60" />
                </div>
                
                <div className="relative z-10 p-6 flex items-center gap-4">
                  {/* Game Icon/Preview */}
                  <div className={`
                    relative flex-shrink-0 w-20 h-20 rounded-2xl overflow-hidden border-3 shadow-lg
                    ${game.isUnlocked ? 'border-purple-300' : 'border-gray-300'}
                  `}>
                    <img 
                      src={game.image}
                      alt={game.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-2xl drop-shadow-lg">{game.icon}</div>
                    </div>
                  </div>
                  
                  {/* Game Info */}
                  <div className="flex-1">
                    <h4 className="font-bold text-lg text-purple-700 mb-1">{game.title}</h4>
                    <p className="text-sm text-purple-600 mb-3">{game.description}</p>
                    <div className="flex items-center gap-3 flex-wrap">
                      <Badge 
                        variant="secondary" 
                        className={`text-xs font-semibold ${getDifficultyColor(game.difficulty)}`}
                      >
                        {game.difficulty}
                      </Badge>
                      <span className="text-sm text-purple-700 flex items-center gap-1 font-medium">
                        <Coins className="w-4 h-4 text-yellow-500" />
                        {game.tokenCost} tokens
                      </span>
                      {game.bestScore > 0 && (
                        <span className="text-sm text-yellow-700 flex items-center gap-1 font-medium">
                          <Trophy className="w-4 h-4 text-yellow-500" />
                          Best: {game.bestScore}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Play Button */}
                  <Button
                    size="lg"
                    disabled={!game.isUnlocked}
                    onClick={() => navigate('/arcade')}
                    className={`
                      relative px-8 py-3 font-bold text-white shadow-lg transition-all duration-300
                      ${game.isUnlocked 
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 hover:scale-110 hover:shadow-xl' 
                        : 'bg-gray-400'
                      }
                    `}
                  >
                    <Play className="w-5 h-5 mr-2" />
                    {game.isUnlocked ? 'Play' : `Need ${game.tokenCost - tokens} more`}
                    {game.isUnlocked && (
                      <div className="absolute inset-0 bg-white/20 rounded opacity-0 hover:opacity-100 transition-opacity duration-300" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Game Stats with Kawaii Design */}
      <Card className="bg-white/50 border-purple-200 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
          <CardTitle className="text-purple-700 flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Your Gaming Stats
            <Trophy className="w-5 h-5" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-4 bg-gradient-to-br from-purple-100 to-violet-100 rounded-2xl border border-purple-200 shadow-sm">
              <div className="text-2xl font-bold text-purple-700">{gameStats.totalGamesPlayed}</div>
              <div className="text-xs text-purple-600 font-medium">Games Played 🎮</div>
            </div>
            <div className="p-4 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-2xl border border-yellow-200 shadow-sm">
              <div className="text-2xl font-bold text-yellow-700">{Math.floor(gameStats.totalPlayTime / 60)}h</div>
              <div className="text-xs text-yellow-600 font-medium">Play Time ⏰</div>
            </div>
            <div className="p-4 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl border border-green-200 shadow-sm">
              <div className="text-2xl font-bold text-green-700">{gameStats.currentStreak}</div>
              <div className="text-xs text-green-600 font-medium">Win Streak 🔥</div>
            </div>
            <div className="p-4 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl border border-blue-200 shadow-sm">
              <div className="text-2xl font-bold text-blue-700">{gameStats.achievementsEarned}</div>
              <div className="text-xs text-blue-600 font-medium">Achievements 🏆</div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-gradient-to-r from-pink-100 via-purple-100 to-blue-100 rounded-2xl text-center border border-purple-200">
            <p className="text-sm text-purple-700 font-medium">
              ⭐ <strong>Favorite Game:</strong> {gameStats.favoriteGame} ⭐
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Arcade Navigation with Kawaii Style */}
      <Card className="bg-gradient-to-r from-purple-400/20 via-pink-400/20 to-blue-400/20 border-2 border-purple-300/50 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-xl text-purple-700 flex items-center gap-2">
                🎪 Full Task Arcade Experience 🎪
              </h3>
              <p className="text-sm text-purple-600 mt-1">
                Access all games, leaderboards, achievements, and premium kawaii gaming experience! ✨
              </p>
            </div>
            <Button 
              onClick={() => navigate('/arcade')}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 font-bold px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
              size="lg"
            >
              Enter Arcade 🚀
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}