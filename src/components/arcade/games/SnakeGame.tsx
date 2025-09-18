import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Play } from 'lucide-react';

// Simple game configuration
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
  // Simple state
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [snake, setSnake] = useState([{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }]);
  const [food, setFood] = useState({ x: 15, y: 15 });
  const [direction, setDirection] = useState(DIRECTIONS.RIGHT);
  const [score, setScore] = useState(0);
  const [debugLog, setDebugLog] = useState<string[]>([]);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const intervalRef = useRef<NodeJS.Timeout>();

  // Add debug message
  const addDebug = (message: string) => {
    setDebugLog(prev => [...prev.slice(-5), `${new Date().getSeconds()}s: ${message}`]);
  };

  // Draw function
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas with white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
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

    // Draw snake
    snake.forEach((segment, index) => {
      ctx.fillStyle = index === 0 ? '#22c55e' : '#16a34a'; // Green colors
      ctx.fillRect(
        segment.x * CELL_SIZE + 1,
        segment.y * CELL_SIZE + 1,
        CELL_SIZE - 2,
        CELL_SIZE - 2
      );
    });

    // Draw food
    ctx.fillStyle = '#ef4444'; // Red color
    ctx.fillRect(
      food.x * CELL_SIZE + 1,
      food.y * CELL_SIZE + 1,
      CELL_SIZE - 2,
      CELL_SIZE - 2
    );
  }, [snake, food]);

  // Game loop - very simple
  const gameLoop = useCallback(() => {
    if (!gameStarted || gameOver) return;

    addDebug(`Loop running, snake head at ${snake[0]?.x}, ${snake[0]?.y}`);

    setSnake(currentSnake => {
      if (currentSnake.length === 0) {
        addDebug('ERROR: Snake is empty!');
        setGameOver(true);
        return currentSnake;
      }

      const newSnake = [...currentSnake];
      const head = { ...newSnake[0] };
      
      // Move head
      head.x += direction.x;
      head.y += direction.y;

      addDebug(`New head position: ${head.x}, ${head.y}`);

      // Check wall collision
      if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
        addDebug(`WALL COLLISION! Head at ${head.x}, ${head.y}`);
        setGameOver(true);
        return currentSnake;
      }

      // Check self collision
      const selfCollision = newSnake.some(segment => segment.x === head.x && segment.y === head.y);
      if (selfCollision) {
        addDebug(`SELF COLLISION! Head at ${head.x}, ${head.y}`);
        setGameOver(true);
        return currentSnake;
      }

      // Add new head
      newSnake.unshift(head);

      // Check food
      if (head.x === food.x && head.y === food.y) {
        addDebug('Food eaten!');
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

  // Start game
  const startGame = () => {
    addDebug('Starting game...');
    setGameStarted(false); // Stop any existing game
    setGameOver(false);
    setScore(0);
    
    // Reset to safe initial state
    const initialSnake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
    setSnake(initialSnake);
    setDirection(DIRECTIONS.RIGHT);
    setFood({ x: 15, y: 15 });
    
    addDebug(`Snake reset to: ${JSON.stringify(initialSnake)}`);
    addDebug('Starting in 1 second...');
    
    // Wait a moment then start
    setTimeout(() => {
      addDebug('Game starting NOW!');
      setGameStarted(true);
    }, 1000);
  };

  // Reset game
  const resetGame = () => {
    addDebug('Resetting game...');
    setGameStarted(false);
    setGameOver(false);
    setScore(0);
    setSnake([{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }]);
    setDirection(DIRECTIONS.RIGHT);
    setFood({ x: 15, y: 15 });
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!gameStarted || gameOver) return;
      
      switch (e.code) {
        case 'ArrowUp':
          if (direction !== DIRECTIONS.DOWN) {
            setDirection(DIRECTIONS.UP);
            addDebug('Direction: UP');
          }
          break;
        case 'ArrowDown':
          if (direction !== DIRECTIONS.UP) {
            setDirection(DIRECTIONS.DOWN);
            addDebug('Direction: DOWN');
          }
          break;
        case 'ArrowLeft':
          if (direction !== DIRECTIONS.RIGHT) {
            setDirection(DIRECTIONS.LEFT);
            addDebug('Direction: LEFT');
          }
          break;
        case 'ArrowRight':
          if (direction !== DIRECTIONS.LEFT) {
            setDirection(DIRECTIONS.RIGHT);
            addDebug('Direction: RIGHT');
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameStarted, gameOver, direction]);

  // Game loop effect
  useEffect(() => {
    if (gameStarted && !gameOver) {
      addDebug('Starting interval...');
      intervalRef.current = setInterval(gameLoop, 300); // Slow speed for debugging
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        addDebug('Interval cleared');
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [gameStarted, gameOver, gameLoop]);

  // Draw effect
  useEffect(() => {
    draw();
  }, [draw]);

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="text-3xl">🐍</div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Snake Game (Debug Version)</h1>
              <p className="text-sm text-muted-foreground">
                Score: {score} | Status: {gameStarted ? (gameOver ? 'Game Over' : 'Playing') : 'Ready'}
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
                    <div className="absolute inset-0 bg-red-500/80 flex items-center justify-center">
                      <div className="text-center text-white">
                        <h2 className="text-xl font-bold mb-4">Game Over!</h2>
                        <p className="mb-4">Score: {score}</p>
                        <div className="flex gap-2">
                          <Button onClick={startGame} variant="secondary">
                            <Play className="w-4 h-4 mr-2" />
                            Play Again
                          </Button>
                          <Button onClick={resetGame} variant="outline">
                            Reset
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Start Screen */}
                  {!gameStarted && !gameOver && (
                    <div className="absolute inset-0 bg-blue-500/80 flex items-center justify-center">
                      <div className="text-center text-white">
                        <h2 className="text-xl font-bold mb-4">Ready to Play?</h2>
                        <Button onClick={startGame} variant="secondary">
                          <Play className="w-4 h-4 mr-2" />
                          Start Game
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Debug Panel */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Debug Info</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div>Game Started: <span className="font-mono">{gameStarted ? 'Yes' : 'No'}</span></div>
                  <div>Game Over: <span className="font-mono">{gameOver ? 'Yes' : 'No'}</span></div>
                  <div>Snake Length: <span className="font-mono">{snake.length}</span></div>
                  <div>Snake Head: <span className="font-mono">{snake[0] ? `(${snake[0].x}, ${snake[0].y})` : 'None'}</span></div>
                  <div>Direction: <span className="font-mono">
                    {direction === DIRECTIONS.UP ? 'UP' : 
                     direction === DIRECTIONS.DOWN ? 'DOWN' : 
                     direction === DIRECTIONS.LEFT ? 'LEFT' : 'RIGHT'}
                  </span></div>
                  <div>Food: <span className="font-mono">({food.x}, {food.y})</span></div>
                </div>
                
                <div className="mt-4">
                  <h4 className="font-semibold mb-2">Debug Log:</h4>
                  <div className="bg-gray-100 p-3 rounded text-xs space-y-1 max-h-40 overflow-y-auto">
                    {debugLog.map((log, i) => (
                      <div key={i} className="font-mono">{log}</div>
                    ))}
                  </div>
                </div>

                <div className="mt-4">
                  <h4 className="font-semibold mb-2">Controls:</h4>
                  <div className="text-sm space-y-1">
                    <p>• Arrow keys to move</p>
                    <p>• Game speed is slow for debugging</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}