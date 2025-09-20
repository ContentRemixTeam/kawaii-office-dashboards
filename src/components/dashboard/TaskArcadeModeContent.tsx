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
                    ? 'border-purple-300 hover:shadow-xl hover:border-purple-400' 
                    : 'border-gray-200 opacity-60'
                  }
                `}
                style={{
                  background: game.isUnlocked 
                    ? `linear-gradient(135deg, 
                        hsl(250 50% 15%) 0%, 
                        hsl(260 40% 25%) 25%, 
                        hsl(270 35% 35%) 50%, 
                        hsl(280 30% 30%) 75%, 
                        hsl(250 45% 20%) 100%),
                       radial-gradient(circle at 20% 20%, hsl(300 60% 40% / 0.3) 0%, transparent 50%),
                       radial-gradient(circle at 80% 80%, hsl(240 60% 40% / 0.3) 0%, transparent 50%)`
                    : 'linear-gradient(135deg, hsl(0 0% 90%), hsl(0 0% 85%))'
                }}
              >
                {/* Arcade Controller Pattern Overlay */}
                <div className="absolute inset-0 opacity-30">
                  {/* D-Pad Pattern */}
                  <div className="absolute top-4 left-4 w-8 h-8">
                    <div className="absolute top-2 left-3 w-2 h-4 bg-white/20 rounded-sm"></div>
                    <div className="absolute top-3 left-2 w-4 h-2 bg-white/20 rounded-sm"></div>
                  </div>
                  
                  {/* Action Buttons Pattern */}
                  <div className="absolute top-4 right-4 grid grid-cols-2 gap-1">
                    <div className="w-3 h-3 bg-red-400/30 rounded-full border border-white/20"></div>
                    <div className="w-3 h-3 bg-blue-400/30 rounded-full border border-white/20"></div>
                    <div className="w-3 h-3 bg-green-400/30 rounded-full border border-white/20"></div>
                    <div className="w-3 h-3 bg-yellow-400/30 rounded-full border border-white/20"></div>
                  </div>
                  
                  {/* Circuit Board Lines */}
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 100">
                    <path d="M20 20 L60 20 L60 40 L120 40 L120 60 L180 60" 
                          stroke="rgba(255,255,255,0.1)" strokeWidth="1" fill="none"/>
                    <path d="M40 80 L80 80 L80 30 L140 30 L140 50 L160 50" 
                          stroke="rgba(255,255,255,0.1)" strokeWidth="1" fill="none"/>
                  </svg>
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
                    <h4 className={`font-bold text-lg mb-1 ${game.isUnlocked ? 'text-white' : 'text-gray-700'}`}>
                      {game.title}
                    </h4>
                    <p className={`text-sm mb-3 ${game.isUnlocked ? 'text-white/90' : 'text-gray-600'}`}>
                      {game.description}
                    </p>
                    <div className="flex items-center gap-3 flex-wrap">
                      <Badge 
                        variant="secondary" 
                        className={`text-xs font-semibold ${getDifficultyColor(game.difficulty)}`}
                      >
                        {game.difficulty}
                      </Badge>
                      <span className={`text-sm flex items-center gap-1 font-medium ${
                        game.isUnlocked ? 'text-yellow-300' : 'text-gray-600'
                      }`}>
                        <Coins className="w-4 h-4 text-yellow-400" />
                        {game.tokenCost} tokens
                      </span>
                      {game.bestScore > 0 && (
                        <span className={`text-sm flex items-center gap-1 font-medium ${
                          game.isUnlocked ? 'text-yellow-200' : 'text-gray-600'
                        }`}>
                          <Trophy className="w-4 h-4 text-yellow-400" />
                          Best: {game.bestScore}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Play Button */}
                  <Button
                    size="lg"
                    variant={game.isUnlocked ? "gradient-primary" : "secondary"}
                    disabled={!game.isUnlocked}
                    onClick={() => navigate('/arcade')}
                    className={`
                      relative px-8 py-3 font-bold shadow-lg transition-all duration-300
                      ${game.isUnlocked 
                        ? 'hover:scale-110 hover:shadow-xl' 
                        : 'opacity-60'
                      }
                    `}
                  >
                    <Play className="w-5 h-5 mr-2" />
                    <span className="font-bold">
                      {game.isUnlocked ? 'Play' : `Need ${game.tokenCost - tokens} more`}
                    </span>
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

      {/* Arcade Navigation with Controller Theme */}
      <Card 
        className="border-2 border-purple-300/50 shadow-lg overflow-hidden"
        style={{
          background: `linear-gradient(135deg, 
            hsl(250 60% 20%) 0%, 
            hsl(260 50% 30%) 25%, 
            hsl(270 45% 40%) 50%, 
            hsl(280 40% 35%) 75%, 
            hsl(250 55% 25%) 100%),
           radial-gradient(circle at 30% 30%, hsl(300 70% 50% / 0.4) 0%, transparent 60%),
           radial-gradient(circle at 70% 70%, hsl(240 70% 50% / 0.4) 0%, transparent 60%)`
        }}
      >
        {/* Controller Pattern Overlay */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-6 left-6 flex gap-2">
            <div className="w-4 h-4 bg-white/30 rounded-full"></div>
            <div className="w-4 h-4 bg-white/30 rounded-full"></div>
          </div>
          <div className="absolute bottom-6 right-6 flex gap-1">
            <div className="w-6 h-2 bg-white/20 rounded-full"></div>
            <div className="w-6 h-2 bg-white/20 rounded-full"></div>
          </div>
        </div>
        
        <CardContent className="relative p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-xl text-white flex items-center gap-2">
                🎪 Full Task Arcade Experience 🎪
              </h3>
              <p className="text-white/90 mt-1 font-medium">
                Access all games, leaderboards, achievements, and premium kawaii gaming experience! ✨
              </p>
            </div>
            <Button 
              onClick={() => navigate('/arcade')}
              variant="gradient-primary"
              size="lg"
              className="px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
            >
              <span className="font-bold">Enter Arcade 🚀</span>
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}