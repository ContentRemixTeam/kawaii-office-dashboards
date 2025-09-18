import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Gamepad2, Target, Puzzle, Star, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SnakeGame from '@/components/arcade/games/SnakeGame';
import PetAdventureMaze from '@/components/arcade/games/PetAdventureMaze';
import PetProductivityQuest from '@/components/arcade/games/PetProductivityQuest';
import OutOfTokensModal from '@/components/arcade/OutOfTokensModal';
import PremiumGameCard from '@/components/arcade/PremiumGameCard';
import TokenCounter from '@/components/arcade/TokenCounter';
import GameStats from '@/components/arcade/GameStats';

export default function Arcade() {
  const navigate = useNavigate();
  const [currentGame, setCurrentGame] = useState<string | null>(null);
  const [currentTokens, setCurrentTokens] = useState(150); // Demo value
  const [showOutOfTokensModal, setShowOutOfTokensModal] = useState(false);

  // Demo gaming statistics
  const gameStats = {
    totalGamesPlayed: 47,
    favoriteGame: "Unicorn's Dream Quest",
    totalPlayTime: 180, // minutes
    achievementsEarned: 8,
    weeklyBalance: {
      gaming: 60,
      productivity: 420
    },
    currentStreak: 5
  };

  const handlePlayGame = (gameName: string, tokenCost: number) => {
    console.log('handlePlayGame called with:', gameName);
    
    if (currentTokens < tokenCost) {
      setShowOutOfTokensModal(true);
      return;
    }
    
    setCurrentGame(gameName);
  };

  const handleTokenSpent = () => {
    setCurrentTokens(prev => prev - 30);
  };

  const handleExitGame = () => {
    setCurrentGame(null);
  };

  const handleEarnMoreTokens = () => {
    navigate('/tasks');
  };

  // Floating animation particles
  const FloatingParticles = () => (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {Array.from({ length: 20 }, (_, i) => (
        <div
          key={i}
          className="absolute animate-bounce opacity-30"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 4}s`,
            animationDuration: `${3 + Math.random() * 4}s`
          }}
        >
          {['🎮', '⭐', '🏆', '💎', '🌟', '✨'][Math.floor(Math.random() * 6)]}
        </div>
      ))}
    </div>
  );

  // Game configurations
  const games = [
    {
      id: 'productivity-quest',
      title: "Unicorn's Dream Quest",
      description: "Journey through magical dreamscapes collecting positive energy and avoiding negativity to restore magic to the world.",
      difficulty: 'Medium' as const,
      tokenCost: 30,
      bestScore: 2450,
      isUnlocked: true,
      icon: '🦄',
      theme: 'adventure' as const
    },
    {
      id: 'pet-maze',
      title: "Pet Adventure Maze",
      description: "Navigate your cute pet through challenging mazes, avoiding enemies and collecting treats in this kawaii adventure.",
      difficulty: 'Easy' as const,
      tokenCost: 20,
      bestScore: 1200,
      isUnlocked: true,
      icon: '🐾',
      theme: 'maze' as const
    },
    {
      id: 'snake',
      title: "Classic Snake",
      description: "The timeless arcade classic with a modern twist. Grow your snake and achieve the highest score possible.",
      difficulty: 'Hard' as const,
      tokenCost: 25,
      bestScore: 850,
      isUnlocked: currentTokens >= 25,
      icon: '🐍',
      theme: 'productivity' as const
    }
  ];

  // If playing a game, render the game component
  if (currentGame === 'productivity-quest') {
    return (
      <PetProductivityQuest 
        onExit={handleExitGame}
        onTokenSpent={handleTokenSpent}
        currentTokens={currentTokens}
      />
    );
  }

  if (currentGame === 'pet-maze') {
    return (
      <PetAdventureMaze 
        onExit={handleExitGame}
        onTokenSpent={handleTokenSpent}
        currentTokens={currentTokens}
      />
    );
  }

  if (currentGame === 'snake') {
    return (
      <SnakeGame 
        onExit={handleExitGame}
        onTokenSpent={handleTokenSpent}
        currentTokens={currentTokens}
      />
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <FloatingParticles />
      
      {/* Premium gradient background */}
      <div className="fixed inset-0 bg-gradient-to-br from-background via-background/95 to-background/90 z-0" />
      <div className="fixed inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-secondary/5 z-0" />
      
      <div className="relative z-10 px-4 py-8 max-w-7xl mx-auto">
        {/* Premium Hero Section */}
        <div className="text-center mb-12 relative">
          {/* Back button */}
          <div className="absolute left-0 top-0">
            <Button 
              onClick={() => navigate('/dashboard')} 
              variant="outline"
              className="backdrop-blur-sm border-primary/20 hover:border-primary/40 transition-all duration-300"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>

          {/* Main title with animations */}
          <div className="space-y-4">
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 backdrop-blur-sm">
              <Gamepad2 className="w-6 h-6 text-primary animate-pulse" />
              <span className="text-sm font-medium text-muted-foreground tracking-wide">PREMIUM GAMING EXPERIENCE</span>
            </div>
            
            <h1 className="text-6xl font-bold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent animate-fade-in">
              Task Arcade
            </h1>
            
            <div className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Transform your earned tokens into epic gaming adventures. 
              <br />
              <span className="text-primary font-semibold">Earn tokens → Play games → Have fun!</span>
            </div>
          </div>

          {/* Animated banner */}
          <div className="mt-8 p-4 rounded-2xl bg-gradient-to-r from-green-500/10 via-blue-500/10 to-purple-500/10 border border-green-500/20 backdrop-blur-sm animate-scale-in">
            <div className="flex items-center justify-center gap-4 text-sm font-medium">
              <div className="flex items-center gap-2 text-green-600">
                <Star className="w-4 h-4" />
                Complete Tasks
              </div>
              <div className="text-muted-foreground">→</div>
              <div className="flex items-center gap-2 text-blue-600">
                <Target className="w-4 h-4" />
                Earn Tokens
              </div>
              <div className="text-muted-foreground">→</div>
              <div className="flex items-center gap-2 text-purple-600">
                <Sparkles className="w-4 h-4" />
                Play Games
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Main gaming area */}
          <div className="xl:col-span-3 space-y-8">
            {/* Token Counter */}
            <TokenCounter
              currentTokens={currentTokens}
              todayEarned={45}
              totalEarned={1250}
              onEarnMore={handleEarnMoreTokens}
            />

            {/* Premium Games Grid */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20">
                  <Puzzle className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">Premium Games</h2>
                <div className="flex-1 h-px bg-gradient-to-r from-primary/20 to-transparent" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {games.map((game) => (
                  <PremiumGameCard
                    key={game.id}
                    title={game.title}
                    description={game.description}
                    difficulty={game.difficulty}
                    tokenCost={game.tokenCost}
                    bestScore={game.bestScore}
                    isUnlocked={game.isUnlocked}
                    onPlay={() => handlePlayGame(game.id, game.tokenCost)}
                    icon={game.icon}
                    theme={game.theme}
                  />
                ))}
              </div>
            </div>

            {/* Coming Soon Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-muted/20 to-muted/30">
                  <Star className="w-6 h-6 text-muted-foreground" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">Coming Soon</h2>
                <div className="flex-1 h-px bg-gradient-to-r from-muted/20 to-transparent" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { title: "Productivity Tetris", icon: "🧩", difficulty: "Medium" },
                  { title: "Focus Fighter", icon: "⚔️", difficulty: "Hard" },
                  { title: "Task Tower Defense", icon: "🏰", difficulty: "Expert" }
                ].map((game, index) => (
                  <div 
                    key={index}
                    className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-muted/10 to-muted/20 border border-muted/30 p-6 opacity-60"
                  >
                    <div className="absolute top-4 right-4 px-2 py-1 bg-orange-500/20 text-orange-600 text-xs rounded-full font-medium">
                      Coming Soon
                    </div>
                    <div className="text-3xl mb-3">{game.icon}</div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">{game.title}</h3>
                    <div className="text-sm text-muted-foreground">New gaming experience in development</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar with stats */}
          <div className="xl:col-span-1">
            <GameStats
              totalGamesPlayed={gameStats.totalGamesPlayed}
              favoriteGame={gameStats.favoriteGame}
              totalPlayTime={gameStats.totalPlayTime}
              achievementsEarned={gameStats.achievementsEarned}
              weeklyBalance={gameStats.weeklyBalance}
              currentStreak={gameStats.currentStreak}
            />
          </div>
        </div>
      </div>

      {/* Out of tokens modal */}
      <OutOfTokensModal
        isOpen={showOutOfTokensModal}
        onClose={() => setShowOutOfTokensModal(false)}
        currentTokens={currentTokens}
        tokensNeeded={30}
        gameName="Game"
      />
    </div>
  );
}