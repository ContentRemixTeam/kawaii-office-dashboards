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

// Keep the EXACT same configuration as the working debug version
const GRID_SIZE = 20;
const CELL_SIZE = 20;

const DIRECTIONS = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 }
};

interface SnakeGameProps {
  onExit: () => void;
  onTokenSpent: () => void;
  currentTokens: number;
}

export default function SnakeGame({ onExit }: SnakeGameProps) {
  // Keep EXACT same state as working debug version
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [snake, setSnake] = useState([{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }]);
  const [food, setFood] = useState({ x: 15, y: 15 });
  const [direction, setDirection] = useState(DIRECTIONS.RIGHT);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    try {
      return parseInt(localStorage.getItem('snake_high_score') || '0');
    } catch {
      return 0;
    }
  });
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const intervalRef = useRef<NodeJS.Timeout>();

  // Keep EXACT same draw function
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas with white background (same as debug version)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid (same as debug version)
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    for (let i = 0; i <= GRID_SIZE; i++) {
      // Vertical lines
      ctx.beginPath();
      ctx.moveTo(i * CELL_SIZE, 0);
      ctx.lineTo(i * CELL_SIZE, GRID_SIZE * CELL_SIZE);
      ctx.stroke();
      
      // Horizontal lines
      ctx.beginPath();
      ctx.moveTo(0, i * CELL_SIZE);
      ctx.lineTo(GRID_SIZE * CELL_SIZE, i * CELL_SIZE);
      ctx.stroke();
    }

    // Draw snake (same colors as debug version)
    snake.forEach((segment, index) => {
      ctx.fillStyle = index === 0 ? '#22c55e' : '#16a34a'; // Same green colors
      ctx.fillRect(
        segment.x * CELL_SIZE + 1,
        segment.y * CELL_SIZE + 1,
        CELL_SIZE - 2,
        CELL_SIZE - 2
      );
    });

    // Draw food (same color as debug version)
    ctx.fillStyle = '#ef4444'; // Same red color
    ctx.fillRect(
      food.x * CELL_SIZE + 1,
      food.y * CELL_SIZE + 1,
      CELL_SIZE - 2,
      CELL_SIZE - 2
    );
  }, [snake, food]);

  // Keep EXACT same game loop as working debug version
  const gameLoop = useCallback(() => {
    if (!gameStarted || gameOver) return;

    setSnake(currentSnake => {
      if (currentSnake.length === 0) {
        setGameOver(true);
        return currentSnake;
      }

      const newSnake = [...currentSnake];
      const head = { ...newSnake[0] };
      
      // Move head
      head.x += direction.x;
      head.y += direction.y;

      // Check wall collision
      if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
        setGameOver(true);
        return currentSnake;
      }

      // Check self collision
      const selfCollision = newSnake.some(segment => segment.x === head.x && segment.y === head.y);
      if (selfCollision) {
        setGameOver(true);
        return currentSnake;
      }

      // Add new head
      newSnake.unshift(head);

      // Check food
      if (head.x === food.x && head.y === food.y) {
        setScore(prev => prev + 10);
        // Generate new food
        setFood({
          x: Math.floor(Math.random() * GRID_SIZE),
          y: Math.floor(Math.random() * GRID_SIZE)
        });
      } else {
        // Remove tail
        newSnake.pop();
      }

      return newSnake;
    });
  }, [gameStarted, gameOver, snake, direction, food]);

  // Touch controls
  const handleDirectionChange = (newDirection: typeof DIRECTIONS.UP) => {
    if (!gameStarted || gameOver) return;
    
    if (newDirection === DIRECTIONS.UP && direction !== DIRECTIONS.DOWN) setDirection(DIRECTIONS.UP);
    if (newDirection === DIRECTIONS.DOWN && direction !== DIRECTIONS.UP) setDirection(DIRECTIONS.DOWN);
    if (newDirection === DIRECTIONS.LEFT && direction !== DIRECTIONS.RIGHT) setDirection(DIRECTIONS.LEFT);
    if (newDirection === DIRECTIONS.RIGHT && direction !== DIRECTIONS.LEFT) setDirection(DIRECTIONS.RIGHT);
  };

  // Keep EXACT same start game function as working debug version
  const startGame = () => {
    setGameStarted(false); // Stop any existing game
    setGameOver(false);
    setScore(0);
    
    // Reset to safe initial state
    const initialSnake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
    setSnake(initialSnake);
    setDirection(DIRECTIONS.RIGHT);
    setFood({ x: 15, y: 15 });
    
    // Wait a moment then start (same as debug version)
    setTimeout(() => {
      setGameStarted(true);
    }, 1000);
  };

  const togglePause = () => {
    setGameStarted(prev => !prev);
  };

  // Reset game
  const resetGame = () => {
    setGameStarted(false);
    setGameOver(false);
    setScore(0);
    setSnake([{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }]);
    setDirection(DIRECTIONS.RIGHT);
    setFood({ x: 15, y: 15 });
  };

  // Keep EXACT same keyboard controls as debug version
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!gameStarted || gameOver) return;
      
      switch (e.code) {
        case 'ArrowUp':
          if (direction !== DIRECTIONS.DOWN) {
            setDirection(DIRECTIONS.UP);
          }
          break;
        case 'ArrowDown':
          if (direction !== DIRECTIONS.UP) {
            setDirection(DIRECTIONS.DOWN);
          }
          break;
        case 'ArrowLeft':
          if (direction !== DIRECTIONS.RIGHT) {
            setDirection(DIRECTIONS.LEFT);
          }
          break;
        case 'ArrowRight':
          if (direction !== DIRECTIONS.LEFT) {
            setDirection(DIRECTIONS.RIGHT);
          }
          break;
        case 'Space':
          e.preventDefault();
          togglePause();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameStarted, gameOver, direction]);

  // Keep EXACT same game loop effect as debug version
  useEffect(() => {
    if (gameStarted && !gameOver) {
      intervalRef.current = setInterval(gameLoop, 300); // Same slow speed as debug
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [gameStarted, gameOver, gameLoop]);

  // Draw effect (same as debug version)
  useEffect(() => {
    draw();
  }, [draw]);

  // Update high score
  useEffect(() => {
    if (gameOver && score > highScore) {
      setHighScore(score);
      try {
        localStorage.setItem('snake_high_score', score.toString());
      } catch {
        // Fail silently
      }
    }
  }, [gameOver, score, highScore]);

  // Calculate game status for display
  const gameStatus = gameStarted ? (gameOver ? 'Game Over' : 'Playing') : 'Ready';
  const isPaused = !gameStarted && !gameOver && score > 0;

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="text-3xl">🐍</div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Snake Game</h1>
              <p className="text-sm text-muted-foreground">
                Score: {score} | Status: {gameStatus} | High Score: {highScore}
              </p>
            </div>
          </div>
          <Button onClick={onExit} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Arcade
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Game Canvas */}
          <div>
            <Card>
              <CardContent className="p-6">
                <div className="relative">
                  <canvas
                    ref={canvasRef}
                    width={GRID_SIZE * CELL_SIZE}
                    height={GRID_SIZE * CELL_SIZE}
                    className="border-2 border-gray-400 mx-auto block"
                  />
                  
                  {/* Game Over Overlay */}
                  {gameOver && (
                    <div className="absolute inset-0 bg-red-500/80 flex items-center justify-center rounded-lg">
                      <div className="text-center text-white">
                        <h2 className="text-xl font-bold mb-4">Game Over!</h2>
                        <p className="mb-4">Score: {score}</p>
                        {score === highScore && score > 0 && (
                          <Badge className="mb-4 bg-yellow-500 text-black">New High Score! 🏆</Badge>
                        )}
                        <div className="flex gap-2 justify-center">
                          <Button onClick={startGame} variant="secondary">
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
                  
                  {/* Start Screen */}
                  {!gameStarted && !gameOver && (
                    <div className="absolute inset-0 bg-blue-500/80 flex items-center justify-center rounded-lg">
                      <div className="text-center text-white">
                        <h2 className="text-xl font-bold mb-4">Ready to Play?</h2>
                        <p className="mb-4">FREE TESTING MODE</p>
                        <Button onClick={startGame} variant="secondary">
                          <Play className="w-4 h-4 mr-2" />
                          Start Game
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Pause Screen */}
                  {isPaused && (
                    <div className="absolute inset-0 bg-yellow-500/80 flex items-center justify-center rounded-lg">
                      <div className="text-center text-white">
                        <h2 className="text-xl font-bold mb-4">Paused</h2>
                        <Button onClick={() => setGameStarted(true)} variant="secondary">
                          <Play className="w-4 h-4 mr-2" />
                          Resume
                        </Button>
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
                  Game Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Current Score:</span>
                  <span className="font-bold">{score}</span>
                </div>
                <div className="flex justify-between">
                  <span>High Score:</span>
                  <span className="font-bold text-primary">{highScore}</span>
                </div>
                <div className="flex justify-between">
                  <span>Snake Length:</span>
                  <span className="font-bold">{snake.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className="font-bold">{gameStatus}</span>
                </div>
              </CardContent>
            </Card>

            {/* Game Controls */}
            {gameStarted && !gameOver && (
              <Card>
                <CardHeader>
                  <CardTitle>Game Controls</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button onClick={togglePause} className="w-full mb-4">
                    <Pause className="w-4 h-4 mr-2" />
                    Pause Game
                  </Button>
                  
                  {/* Touch Controls */}
                  <div className="grid grid-cols-3 gap-2">
                    <div></div>
                    <Button 
                      variant="outline" 
                      className="aspect-square"
                      onClick={() => handleDirectionChange(DIRECTIONS.UP)}
                    >
                      <ChevronUp className="w-4 h-4" />
                    </Button>
                    <div></div>
                    
                    <Button 
                      variant="outline" 
                      className="aspect-square"
                      onClick={() => handleDirectionChange(DIRECTIONS.LEFT)}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <div></div>
                    <Button 
                      variant="outline" 
                      className="aspect-square"
                      onClick={() => handleDirectionChange(DIRECTIONS.RIGHT)}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                    
                    <div></div>
                    <Button 
                      variant="outline" 
                      className="aspect-square"
                      onClick={() => handleDirectionChange(DIRECTIONS.DOWN)}
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
              <CardContent className="text-sm space-y-2">
                <p>• Use arrow keys to control the snake</p>
                <p>• Eat red food to grow and score points</p>
                <p>• Don't hit walls or your own tail!</p>
                <p>• Press Spacebar to pause/resume</p>
                <p>• Use touch buttons on mobile</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
