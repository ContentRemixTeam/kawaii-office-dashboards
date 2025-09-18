import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Gamepad2, 
  Trophy, 
  Coins,
  Play,
  Star,
  Zap,
  Target
} from 'lucide-react';

// Separate arcade token state (completely independent from existing systems)
const ARCADE_STORAGE_KEY = 'arcade_tokens_standalone_v1';

// Mock games data
const ARCADE_GAMES = [
  {
    id: 'snake',
    name: 'Snake',
    description: 'Classic snake game - grow longer without hitting walls',
    cost: 15,
    icon: '🐍',
    difficulty: 'Easy',
    color: 'from-green-500 to-emerald-600'
  },
  {
    id: '2048',
    name: '2048',
    description: 'Number puzzle game - combine tiles to reach 2048',
    cost: 10,
    icon: '🧮',
    difficulty: 'Medium',
    color: 'from-blue-500 to-cyan-600'
  },
  {
    id: 'breakout',
    name: 'Breakout',
    description: 'Break the blocks - bounce ball with paddle',
    cost: 20,
    icon: '🏓',
    difficulty: 'Hard',
    color: 'from-purple-500 to-indigo-600'
  },
  {
    id: 'tetris',
    name: 'Tetris',
    description: 'Arrange falling blocks to clear lines',
    cost: 25,
    icon: '🔲',
    difficulty: 'Hard',
    color: 'from-orange-500 to-red-600'
  },
  {
    id: 'memory',
    name: 'Memory Match',
    description: 'Match pairs of cards to test your memory',
    cost: 8,
    icon: '🃏',
    difficulty: 'Easy',
    color: 'from-pink-500 to-rose-600'
  },
  {
    id: 'puzzle',
    name: 'Slide Puzzle',
    description: 'Arrange numbered tiles in correct order',
    cost: 12,
    icon: '🧩',
    difficulty: 'Medium',
    color: 'from-teal-500 to-cyan-600'
  }
];

function getArcadeTokens(): number {
  try {
    const stored = localStorage.getItem(ARCADE_STORAGE_KEY);
    return stored ? parseInt(stored, 10) : 50; // Default 50 tokens for testing
  } catch {
    return 50;
  }
}

function setArcadeTokens(tokens: number): void {
  try {
    localStorage.setItem(ARCADE_STORAGE_KEY, tokens.toString());
  } catch {
    // Fail silently
  }
}

export default function Arcade() {
  const [tokens, setTokens] = useState(getArcadeTokens);

  const handlePlayGame = (game: typeof ARCADE_GAMES[0]) => {
    if (tokens >= game.cost) {
      const newTokens = tokens - game.cost;
      setTokens(newTokens);
      setArcadeTokens(newTokens);
      
      // Placeholder for actual game launch
      alert(`Launching ${game.name}! (Game implementation coming soon)\nTokens remaining: ${newTokens}`);
    } else {
      alert(`Not enough tokens! You need ${game.cost} tokens but only have ${tokens}.`);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800 border-green-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Hard': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <main className="min-h-screen bg-background py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-card border border-border rounded-3xl shadow-lg p-8">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Gamepad2 className="w-8 h-8 text-primary" />
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground">Task Arcade</h1>
                <p className="text-muted-foreground mt-1">Reward yourself with fun games</p>
              </div>
            </div>
            <Link 
              to="/" 
              className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Office
            </Link>
          </div>

          {/* Token Display */}
          <Card className="mb-8 bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/20 rounded-full">
                    <Coins className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                      {tokens} 
                      <span className="text-lg text-muted-foreground">Tokens</span>
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Earn more by completing tasks and achievements
                    </p>
                  </div>
                </div>
                <Trophy className="w-8 h-8 text-primary/60" />
              </div>
            </CardContent>
          </Card>

          {/* Game Selection Grid */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <Star className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-semibold text-foreground">Available Games</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ARCADE_GAMES.map((game) => {
                const canAfford = tokens >= game.cost;
                
                return (
                  <Card 
                    key={game.id} 
                    className={`group transition-all duration-200 hover:shadow-lg ${
                      canAfford ? 'hover:scale-[1.02] cursor-pointer' : 'opacity-60'
                    }`}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="text-3xl">{game.icon}</div>
                          <div>
                            <CardTitle className="text-lg">{game.name}</CardTitle>
                            <Badge 
                              variant="outline" 
                              className={`text-xs mt-1 ${getDifficultyColor(game.difficulty)}`}
                            >
                              {game.difficulty}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-primary font-semibold">
                          <Coins className="w-4 h-4" />
                          <span>{game.cost}</span>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      <CardDescription className="mb-4 text-sm leading-relaxed">
                        {game.description}
                      </CardDescription>
                      
                      <Button 
                        onClick={() => handlePlayGame(game)}
                        disabled={!canAfford}
                        className={`w-full ${canAfford ? 'bg-primary hover:bg-primary/90' : ''}`}
                        variant={canAfford ? "default" : "secondary"}
                      >
                        {canAfford ? (
                          <>
                            <Play className="w-4 h-4 mr-2" />
                            Play Game
                          </>
                        ) : (
                          <>
                            <Coins className="w-4 h-4 mr-2" />
                            Need {game.cost - tokens} more tokens
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Info Section */}
          <Card className="mt-8 bg-card border border-border">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Zap className="w-6 h-6 text-primary mt-1" />
                <div>
                  <h3 className="font-semibold text-foreground mb-2">How to Earn More Tokens</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Complete daily tasks to earn tokens</li>
                    <li>• Finish pomodoro focus sessions for bonus tokens</li>
                    <li>• Achieve weekly goals for token rewards</li>
                    <li>• Log daily wins and gratitude entries</li>
                  </ul>
                  <p className="text-xs text-muted-foreground mt-3 italic">
                    Token earning integration coming soon!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </main>
  );
}