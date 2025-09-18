import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Play, 
  Pause, 
  RotateCcw, 
  Trophy,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

// Game configuration
const GRID_SIZE = 20;
const CELL_SIZE = 20;
const GAME_SPEED = 150; // milliseconds

const DIRECTIONS = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 }
} as const;

type Direction = typeof DIRECTIONS[keyof typeof DIRECTIONS];

interface Position {
  x: number;
  y: number;
}

interface SnakeGameProps {
  onExit: () => void;
  onTokenSpent: () => void;
  currentTokens: number;
}

// Generate random food position avoiding snake body
const generateFood = (snake: Position[]): Position => {
  let food: Position;
  do {
    food = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE)
    };
  } while (snake.some(segment => segment.x === food.x && segment.y === food.y));
  return food;
};

// Load high score from localStorage
const loadHighScore = (): number => {
  try {
    return parseInt(localStorage.getItem('snake_high_score') || '0');
  } catch {
    return 0;
  }
};

// Save high score to localStorage
const saveHighScore = (score: number): void => {
  try {
    localStorage.setItem('snake_high_score', score.toString());
  } catch {
    // Fail silently
  }
};

export default function SnakeGame({ onExit, onTokenSpent, currentTokens }: SnakeGameProps) {
  // Game state
  const [gameState, setGameState] = useState<'waiting' | 'playing' | 'paused' | 'gameOver'>('waiting');
  const [snake, setSnake] = useState<Position[]>([{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }]);
  const [food, setFood] = useState<Position>(() => generateFood([{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }]));
  const [direction, setDirection] = useState<Direction>(DIRECTIONS.RIGHT);
  const [nextDirection, setNextDirection] = useState<Direction>(DIRECTIONS.RIGHT);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(loadHighScore);
  const [tokenSpent, setTokenSpent] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<NodeJS.Timeout>();

  // Reset game to initial state
  const resetGame = useCallback(() => {
    console.log('🔄 resetGame called');
    setGameState('waiting');
    const initialSnake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
    setSnake(initialSnake);
    setFood(generateFood(initialSnake));
    setDirection(DIRECTIONS.RIGHT);
    setNextDirection(DIRECTIONS.RIGHT);
    setScore(0);
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
    }
    console.log('✅ resetGame completed');
  }, []);

  // Start new game
  const startGame = useCallback(() => {
    console.log('🎮 startGame called', { currentTokens, tokenSpent, canPlay });
    
    // TEMPORARILY DISABLED FOR TESTING
    // if (currentTokens < 15 && !tokenSpent) {
    //   console.log('❌ Not enough tokens');
    //   return; // Not enough tokens
    // }
    
    if (!tokenSpent) {
      console.log('💰 Spending token');
      // onTokenSpent(); // Temporarily disabled for testing
      setTokenSpent(true);
    }
    
    console.log('🔄 Resetting game and starting');
    resetGame();
    
    // Wait 1 second before starting (like the working debug version)
    setTimeout(() => {
      console.log('🚀 Starting game after delay');
      setGameState('playing');
    }, 1000);
    console.log('✅ Game setup complete, will start in 1 second');
  }, [currentTokens, tokenSpent, onTokenSpent, resetGame]);

  // Toggle pause
  const togglePause = useCallback(() => {
    if (gameState === 'playing') {
      setGameState('paused');
    } else if (gameState === 'paused') {
      setGameState('playing');
    }
  }, [gameState]);

  // Change direction (with collision prevention)
  const changeDirection = useCallback((newDirection: Direction) => {
    if (gameState !== 'playing') return;
    
    // Prevent immediate reversal
    if (
      (direction === DIRECTIONS.UP && newDirection === DIRECTIONS.DOWN) ||
      (direction === DIRECTIONS.DOWN && newDirection === DIRECTIONS.UP) ||
      (direction === DIRECTIONS.LEFT && newDirection === DIRECTIONS.RIGHT) ||
      (direction === DIRECTIONS.RIGHT && newDirection === DIRECTIONS.LEFT)
    ) {
      return;
    }
    
    setNextDirection(newDirection);
  }, [gameState, direction]);

  // Game loop
  const moveSnake = useCallback(() => {
    console.log('🏃 moveSnake called');
    setDirection(nextDirection);
    
    setSnake(currentSnake => {
      console.log('🐍 Current snake state:', currentSnake);
      const newSnake = [...currentSnake];
      const head = { ...newSnake[0] };
      
      // Move head in current direction
      head.x += nextDirection.x;
      head.y += nextDirection.y;
      console.log('👆 New head position:', head, 'Direction:', nextDirection);
      
      // Check wall collision
      if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
        console.log('💥 Wall collision at:', head);
        setGameState('gameOver');
        return currentSnake;
      }
      
      // Check self collision
      if (newSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
        console.log('💥 Self collision at:', head);
        setGameState('gameOver');
        return currentSnake;
      }
      
      // Add new head
      newSnake.unshift(head);
      
      // Check food collision
      if (head.x === food.x && head.y === food.y) {
        console.log('🍎 Food eaten!');
        setScore(prev => prev + 10);
        setFood(generateFood(newSnake));
      } else {
        // Remove tail if no food eaten
        newSnake.pop();
      }
      
      console.log('✅ Snake updated, new length:', newSnake.length);
      return newSnake;
    });
  }, [nextDirection, food]);

  // Draw game on canvas
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Get CSS custom property values
    const computedStyle = getComputedStyle(document.documentElement);
    const bgColor = computedStyle.getPropertyValue('--background').trim();
    const borderColor = computedStyle.getPropertyValue('--border').trim();
    const primaryColor = computedStyle.getPropertyValue('--primary').trim();
    const destructiveColor = computedStyle.getPropertyValue('--destructive').trim();
    
    // Clear canvas with proper background
    ctx.fillStyle = bgColor ? `hsl(${bgColor})` : '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid
    ctx.strokeStyle = borderColor ? `hsl(${borderColor})` : '#e0e0e0';
    ctx.lineWidth = 1;
    for (let i = 0; i <= GRID_SIZE; i++) {
      ctx.beginPath();
      ctx.moveTo(i * CELL_SIZE, 0);
      ctx.lineTo(i * CELL_SIZE, GRID_SIZE * CELL_SIZE);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(0, i * CELL_SIZE);
      ctx.lineTo(GRID_SIZE * CELL_SIZE, i * CELL_SIZE);
      ctx.stroke();
    }
    
    // Draw snake
    snake.forEach((segment, index) => {
      if (index === 0) {
        ctx.fillStyle = primaryColor ? `hsl(${primaryColor})` : '#22c55e';
      } else {
        ctx.fillStyle = primaryColor ? `hsl(${primaryColor} / 0.8)` : '#16a34a';
      }
      ctx.fillRect(
        segment.x * CELL_SIZE + 1,
        segment.y * CELL_SIZE + 1,
        CELL_SIZE - 2,
        CELL_SIZE - 2
      );
    });
    
    // Draw food
    ctx.fillStyle = destructiveColor ? `hsl(${destructiveColor})` : '#ef4444';
    ctx.fillRect(
      food.x * CELL_SIZE + 1,
      food.y * CELL_SIZE + 1,
      CELL_SIZE - 2,
      CELL_SIZE - 2
    );
  }, [snake, food]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      e.preventDefault();
      
      switch (e.code) {
        case 'ArrowUp':
        case 'KeyW':
          changeDirection(DIRECTIONS.UP);
          break;
        case 'ArrowDown':
        case 'KeyS':
          changeDirection(DIRECTIONS.DOWN);
          break;
        case 'ArrowLeft':
        case 'KeyA':
          changeDirection(DIRECTIONS.LEFT);
          break;
        case 'ArrowRight':
        case 'KeyD':
          changeDirection(DIRECTIONS.RIGHT);
          break;
        case 'Space':
          if (gameState === 'waiting') {
            startGame();
          } else {
            togglePause();
          }
          break;
        case 'KeyR':
          if (gameState === 'gameOver') {
            resetGame();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState, changeDirection, startGame, togglePause, resetGame]);

  // Game loop effect
  useEffect(() => {
    console.log('🔄 Game loop effect triggered', { gameState });
    if (gameState === 'playing') {
      console.log('▶️ Starting game loop interval');
      gameLoopRef.current = setInterval(moveSnake, GAME_SPEED);
    } else {
      console.log('⏹️ Stopping game loop interval');
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    }

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [gameState, moveSnake]);

  // Drawing effect
  useEffect(() => {
    draw();
  }, [draw]);

  // Update high score
  useEffect(() => {
    if (gameState === 'gameOver' && score > highScore) {
      setHighScore(score);
      saveHighScore(score);
    }
  }, [gameState, score, highScore]);

  // Reset token spent when exiting
  useEffect(() => {
    return () => {
      setTokenSpent(false);
    };
  }, []);

  const canPlay = true; // Temporarily disabled for testing

  return (
    <div className="min-h-screen bg-background py-4 px-4">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="text-3xl">🐍</div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Snake Game</h1>
              <p className="text-muted-foreground">
                Score: {score} • High Score: {highScore} • Length: {snake.length}
              </p>
            </div>
          </div>
          <Button onClick={onExit} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Return to Arcade
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Game Canvas */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6">
                <div className="relative mx-auto w-fit">
                  <canvas
                    ref={canvasRef}
                    width={GRID_SIZE * CELL_SIZE}
                    height={GRID_SIZE * CELL_SIZE}
                    className="border-2 border-border rounded-lg"
                  />
                  
                  {/* Game State Overlays */}
                  {gameState === 'waiting' && (
                    <div className="absolute inset-0 bg-primary/20 backdrop-blur-sm flex items-center justify-center rounded-lg">
                      <div className="text-center text-foreground">
                        <h2 className="text-2xl font-bold mb-4">Ready to Play?</h2>
                        {!canPlay && (
                          <p className="text-muted-foreground mb-4">
                            Need 15 tokens to play. You have {currentTokens}.
                          </p>
                        )}
                        <Button 
                          onClick={() => {
                            console.log('🖱️ Start Game button clicked!', { gameState, canPlay, tokenSpent });
                            startGame();
                          }} 
                          disabled={!canPlay}
                          size="lg"
                        >
                          <Play className="w-4 h-4 mr-2" />
                          {canPlay ? 'Start Game' : `Need ${15 - currentTokens} more tokens`}
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {gameState === 'paused' && (
                    <div className="absolute inset-0 bg-secondary/20 backdrop-blur-sm flex items-center justify-center rounded-lg">
                      <div className="text-center text-foreground">
                        <h2 className="text-2xl font-bold mb-4">Paused</h2>
                        <Button onClick={togglePause} size="lg">
                          <Play className="w-4 h-4 mr-2" />
                          Resume
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {gameState === 'gameOver' && (
                    <div className="absolute inset-0 bg-destructive/20 backdrop-blur-sm flex items-center justify-center rounded-lg">
                      <div className="text-center text-foreground">
                        <h2 className="text-2xl font-bold mb-4">Game Over!</h2>
                        <p className="text-lg mb-4">Final Score: {score}</p>
                        {score === highScore && score > 0 && (
                          <Badge className="mb-4 bg-yellow-500 text-black">
                            <Trophy className="w-4 h-4 mr-1" />
                            New High Score!
                          </Badge>
                        )}
                        <div className="flex gap-2 justify-center">
                          <Button onClick={startGame} disabled={!canPlay}>
                            <Play className="w-4 h-4 mr-2" />
                            Play Again
                          </Button>
                          <Button onClick={resetGame} variant="outline">
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Menu
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Controls & Info */}
          <div className="space-y-6">
            
            {/* Game Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Score:</span>
                  <span className="font-bold">{score}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">High Score:</span>
                  <span className="font-bold text-primary">{highScore}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Length:</span>
                  <span className="font-bold">{snake.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tokens:</span>
                  <span className="font-bold">{currentTokens}</span>
                </div>
              </CardContent>
            </Card>

            {/* Game Controls */}
            {gameState === 'playing' && (
              <Card>
                <CardHeader>
                  <CardTitle>Controls</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button onClick={togglePause} className="w-full">
                    <Pause className="w-4 h-4 mr-2" />
                    Pause Game
                  </Button>
                  
                  {/* Touch Controls */}
                  <div className="grid grid-cols-3 gap-2">
                    <div></div>
                    <Button 
                      variant="outline" 
                      className="aspect-square"
                      onClick={() => changeDirection(DIRECTIONS.UP)}
                    >
                      <ChevronUp className="w-4 h-4" />
                    </Button>
                    <div></div>
                    
                    <Button 
                      variant="outline" 
                      className="aspect-square"
                      onClick={() => changeDirection(DIRECTIONS.LEFT)}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <div></div>
                    <Button 
                      variant="outline" 
                      className="aspect-square"
                      onClick={() => changeDirection(DIRECTIONS.RIGHT)}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                    
                    <div></div>
                    <Button 
                      variant="outline" 
                      className="aspect-square"
                      onClick={() => changeDirection(DIRECTIONS.DOWN)}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                    <div></div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Instructions */}
            <Card>
              <CardHeader>
                <CardTitle>How to Play</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2 text-muted-foreground">
                <p>• Arrow keys or WASD to move</p>
                <p>• Eat red food to grow and score</p>
                <p>• Avoid walls and your tail</p>
                <p>• Spacebar to pause/start</p>
                <p>• Touch buttons for mobile</p>
                <p>• Costs 15 tokens per game</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
