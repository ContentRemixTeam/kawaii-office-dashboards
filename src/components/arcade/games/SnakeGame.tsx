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
const INITIAL_SPEED = 200;
const SPEED_INCREASE = 10;
const POINTS_PER_FOOD = 10;

const DIRECTIONS = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 }
};

const GAME_STATES = {
  MENU: 'menu',
  PLAYING: 'playing',
  PAUSED: 'paused',
  GAME_OVER: 'gameOver'
};

interface SnakeGameProps {
  onExit: () => void;
  onTokenSpent: () => void;
  currentTokens: number;
}

export default function SnakeGame({ onExit }: SnakeGameProps) {
  // Game state
  const [gameState, setGameState] = useState(GAME_STATES.MENU);
  const [snake, setSnake] = useState([{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }]);
  const [food, setFood] = useState({ x: 15, y: 15 });
  const [direction, setDirection] = useState(DIRECTIONS.RIGHT);
  const [score, setScore] = useState(0);
  const [gameSpeed, setGameSpeed] = useState(INITIAL_SPEED);
  const [highScore, setHighScore] = useState(() => {
    try {
      return parseInt(localStorage.getItem('snake_high_score') || '0');
    } catch {
      return 0;
    }
  });
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const intervalRef = useRef<NodeJS.Timeout>();

  // Generate random food position
  const generateFood = useCallback((currentSnake = snake) => {
    let newFood;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE)
      };
    } while (currentSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    return newFood;
  }, [snake]);

  // Draw function
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = 'hsl(var(--background))';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = 'hsl(var(--border))';
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

    // Draw snake
    snake.forEach((segment, index) => {
      ctx.fillStyle = index === 0 ? 'hsl(var(--primary))' : 'hsl(var(--primary) / 0.8)';
      ctx.fillRect(
        segment.x * CELL_SIZE + 1,
        segment.y * CELL_SIZE + 1,
        CELL_SIZE - 2,
        CELL_SIZE - 2
      );
    });

    // Draw food
    ctx.fillStyle = 'hsl(var(--destructive))';
    ctx.fillRect(
      food.x * CELL_SIZE + 1,
      food.y * CELL_SIZE + 1,
      CELL_SIZE - 2,
      CELL_SIZE - 2
    );
  }, [snake, food]);

  // Game loop
  const gameLoop = useCallback(() => {
    if (gameState !== GAME_STATES.PLAYING) return;

    setSnake(currentSnake => {
      if (currentSnake.length === 0) return currentSnake;

      const newSnake = [...currentSnake];
      const head = { ...newSnake[0] };
      
      // Move head
      head.x += direction.x;
      head.y += direction.y;

      // Check wall collision
      if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
        setGameState(GAME_STATES.GAME_OVER);
        return currentSnake;
      }

      // Check self collision
      if (newSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
        setGameState(GAME_STATES.GAME_OVER);
        return currentSnake;
      }

      // Add new head
      newSnake.unshift(head);

      // Check food collision
      if (head.x === food.x && head.y === food.y) {
        const newScore = score + POINTS_PER_FOOD;
        setScore(newScore);
        setFood(generateFood(newSnake));
        
        // Increase speed slightly
        setGameSpeed(prevSpeed => Math.max(50, prevSpeed - SPEED_INCREASE));
      } else {
        // Remove tail if no food eaten
        newSnake.pop();
      }

      return newSnake;
    });
  }, [gameState, direction, food, score, generateFood]);

  // Touch controls
  const handleDirectionChange = (newDirection: typeof DIRECTIONS.UP) => {
    if (gameState !== GAME_STATES.PLAYING) return;
    
    if (newDirection === DIRECTIONS.UP && direction !== DIRECTIONS.DOWN) setDirection(DIRECTIONS.UP);
    if (newDirection === DIRECTIONS.DOWN && direction !== DIRECTIONS.UP) setDirection(DIRECTIONS.DOWN);
    if (newDirection === DIRECTIONS.LEFT && direction !== DIRECTIONS.RIGHT) setDirection(DIRECTIONS.LEFT);
    if (newDirection === DIRECTIONS.RIGHT && direction !== DIRECTIONS.LEFT) setDirection(DIRECTIONS.RIGHT);
  };

  // Game actions
  const startGame = () => {
    // Reset to initial state
    const initialSnake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
    setSnake(initialSnake);
    setDirection(DIRECTIONS.RIGHT);
    setScore(0);
    setFood({ x: 15, y: 15 });
    setGameSpeed(INITIAL_SPEED);
    
    // Start game after a brief delay
    setTimeout(() => {
      setGameState(GAME_STATES.PLAYING);
    }, 500);
  };

  const togglePause = () => {
    setGameState(prevState => 
      prevState === GAME_STATES.PLAYING ? GAME_STATES.PAUSED : GAME_STATES.PLAYING
    );
  };

  const resetGame = () => {
    setGameState(GAME_STATES.MENU);
    setSnake([{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }]);
    setDirection(DIRECTIONS.RIGHT);
    setScore(0);
    setFood({ x: 15, y: 15 });
    setGameSpeed(INITIAL_SPEED);
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameState === GAME_STATES.MENU && (e.code === 'Space' || e.code === 'Enter')) {
        startGame();
        return;
      }

      if (gameState === GAME_STATES.PLAYING) {
        switch (e.code) {
          case 'ArrowUp':
          case 'KeyW':
            if (direction !== DIRECTIONS.DOWN) setDirection(DIRECTIONS.UP);
            break;
          case 'ArrowDown':
          case 'KeyS':
            if (direction !== DIRECTIONS.UP) setDirection(DIRECTIONS.DOWN);
            break;
          case 'ArrowLeft':
          case 'KeyA':
            if (direction !== DIRECTIONS.RIGHT) setDirection(DIRECTIONS.LEFT);
            break;
          case 'ArrowRight':
          case 'KeyD':
            if (direction !== DIRECTIONS.LEFT) setDirection(DIRECTIONS.RIGHT);
            break;
          case 'Space':
            e.preventDefault();
            togglePause();
            break;
        }
      }

      if (gameState === GAME_STATES.PAUSED && e.code === 'Space') {
        togglePause();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState, direction]);

  // Game loop effect
  useEffect(() => {
    if (gameState === GAME_STATES.PLAYING) {
      intervalRef.current = setInterval(gameLoop, gameSpeed);
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
  }, [gameState, gameLoop, gameSpeed]);

  // Draw effect
  useEffect(() => {
    draw();
  }, [draw]);

  // Update high score
  useEffect(() => {
    if (gameState === GAME_STATES.GAME_OVER && score > highScore) {
      setHighScore(score);
      try {
        localStorage.setItem('snake_high_score', score.toString());
      } catch {
        // Fail silently
      }
    }
  }, [gameState, score, highScore]);

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
                FREE TESTING MODE • High Score: {highScore}
              </p>
            </div>
          </div>
          <Button onClick={onExit} variant="outline" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Arcade
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Game Area */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6">
                <div className="relative">
                  <canvas
                    ref={canvasRef}
                    width={GRID_SIZE * CELL_SIZE}
                    height={GRID_SIZE * CELL_SIZE}
                    className="border border-border rounded-lg mx-auto block"
                    style={{ 
                      maxWidth: '100%',
                      height: 'auto',
                      aspectRatio: '1'
                    }}
                  />

                  {/* Game State Overlays */}
                  {gameState === GAME_STATES.MENU && (
                    <div className="absolute inset-0 bg-background/90 flex items-center justify-center rounded-lg">
                      <div className="text-center">
                        <h2 className="text-xl font-bold mb-4">Ready to Play?</h2>
                        <p className="text-muted-foreground mb-4">
                          FREE TESTING MODE - No tokens required!
                        </p>
                        <Button onClick={startGame}>
                          <Play className="w-4 h-4 mr-2" />
                          Start Game (Free)
                        </Button>
                      </div>
                    </div>
                  )}

                  {gameState === GAME_STATES.PAUSED && (
                    <div className="absolute inset-0 bg-background/90 flex items-center justify-center rounded-lg">
                      <div className="text-center">
                        <h2 className="text-xl font-bold mb-4">Paused</h2>
                        <Button onClick={togglePause}>
                          <Play className="w-4 h-4 mr-2" />
                          Resume
                        </Button>
                      </div>
                    </div>
                  )}

                  {gameState === GAME_STATES.GAME_OVER && (
                    <div className="absolute inset-0 bg-background/90 flex items-center justify-center rounded-lg">
                      <div className="text-center">
                        <h2 className="text-xl font-bold mb-2">Game Over!</h2>
                        <p className="text-lg mb-2">Score: {score}</p>
                        {score === highScore && score > 0 && (
                          <Badge className="mb-4">New High Score! 🏆</Badge>
                        )}
                        <div className="flex gap-2 justify-center">
                          <Button onClick={startGame}>
                            <Play className="w-4 h-4 mr-2" />
                            Play Again (Free)
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

          {/* Game Info & Controls */}
          <div className="space-y-6">
            
            {/* Score & Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  Game Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Score:</span>
                  <span className="font-bold">{score}</span>
                </div>
                <div className="flex justify-between">
                  <span>High Score:</span>
                  <span className="font-bold text-primary">{highScore}</span>
                </div>
                <div className="flex justify-between">
                  <span>Length:</span>
                  <span className="font-bold">{snake.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Speed:</span>
                  <span className="font-bold">{Math.round((300 - gameSpeed) / 10)}/10</span>
                </div>
              </CardContent>
            </Card>

            {/* Game Controls */}
            <Card>
              <CardHeader>
                <CardTitle>Controls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {gameState === GAME_STATES.PLAYING && (
                  <Button onClick={togglePause} className="w-full">
                    <Pause className="w-4 h-4 mr-2" />
                    Pause Game
                  </Button>
                )}
                
                {/* Touch Controls */}
                <div className="grid grid-cols-3 gap-2 mt-4">
                  <div></div>
                  <Button 
                    variant="outline" 
                    className="aspect-square"
                    onClick={() => handleDirectionChange(DIRECTIONS.UP)}
                    disabled={gameState !== GAME_STATES.PLAYING}
                  >
                    <ChevronUp className="w-4 h-4" />
                  </Button>
                  <div></div>
                  
                  <Button 
                    variant="outline" 
                    className="aspect-square"
                    onClick={() => handleDirectionChange(DIRECTIONS.LEFT)}
                    disabled={gameState !== GAME_STATES.PLAYING}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <div></div>
                  <Button 
                    variant="outline" 
                    className="aspect-square"
                    onClick={() => handleDirectionChange(DIRECTIONS.RIGHT)}
                    disabled={gameState !== GAME_STATES.PLAYING}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                  
                  <div></div>
                  <Button 
                    variant="outline" 
                    className="aspect-square"
                    onClick={() => handleDirectionChange(DIRECTIONS.DOWN)}
                    disabled={gameState !== GAME_STATES.PLAYING}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                  <div></div>
                </div>

                <div className="text-xs text-muted-foreground space-y-1">
                  <p>• Arrow Keys or WASD to move</p>
                  <p>• Spacebar to pause/resume</p>
                  <p>• Touch buttons above for mobile</p>
                </div>
              </CardContent>
            </Card>

            {/* Instructions */}
            <Card>
              <CardHeader>
                <CardTitle>How to Play</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>• Control the snake to eat red food squares</p>
                <p>• Each food gives you {POINTS_PER_FOOD} points</p>
                <p>• Snake grows longer with each food eaten</p>
                <p>• Don't hit walls or your own tail!</p>
                <p>• Game speeds up as you score more points</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}