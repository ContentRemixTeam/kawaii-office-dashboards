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
  Heart,
  Star,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

// Game configuration
const MAZE_SIZE = 15;
const CELL_SIZE = 32; // Even bigger for better visibility
const GAME_SPEED = 300;

// Directions
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

interface Treat extends Position {
  type: 'normal' | 'power';
  collected: boolean;
}

interface Enemy extends Position {
  direction: Direction;
  speed: number;
  type: string; // emoji for the enemy type
}

interface PetAdventureMazeProps {
  onExit: () => void;
  onTokenSpent: () => void;
  currentTokens: number;
}

// Pet configurations with appropriate enemies
const PET_CONFIG = {
  cat: { 
    emoji: '🐱', 
    treat: '🐟', 
    powerTreat: '💝',
    color: '#f59e0b',
    name: 'Kitty',
    enemies: ['🐕', '👨‍⚕️', '🪣', '💧'] // dogs, vets, vacuum, water
  },
  dog: { 
    emoji: '🐕', 
    treat: '🦴', 
    powerTreat: '💝',
    color: '#8b5cf6',
    name: 'Puppy',
    enemies: ['🐱', '🛁', '💉', '🧹'] // cats, bath, shots, broom
  },
  dragon: { 
    emoji: '🐉', 
    treat: '💎', 
    powerTreat: '💝',
    color: '#ef4444',
    name: 'Dragon',
    enemies: ['🏰', '⚔️', '🛡️', '❄️'] // knights, swords, shields, ice
  },
  unicorn: { 
    emoji: '🦄', 
    treat: '🌟', 
    powerTreat: '💝',
    color: '#a855f7',
    name: 'Unicorn',
    enemies: ['🌑', '⚡', '🕳️', '🌪️'] // darkness, lightning, holes, storms
  },
  bunny: { 
    emoji: '🐰', 
    treat: '🥕', 
    powerTreat: '💝',
    color: '#ec4899',
    name: 'Bunny',
    enemies: ['🦊', '🪤', '🕳️', '🌨️'] // foxes, traps, holes, snow
  }
};

// Simple maze generation
const generateMaze = (): boolean[][] => {
  const maze = Array(MAZE_SIZE).fill(null).map(() => Array(MAZE_SIZE).fill(true));
  
  // Create paths
  for (let y = 1; y < MAZE_SIZE - 1; y += 2) {
    for (let x = 1; x < MAZE_SIZE - 1; x += 2) {
      maze[y][x] = false; // Path
      
      // Randomly create connections
      if (Math.random() > 0.3 && x < MAZE_SIZE - 2) {
        maze[y][x + 1] = false; // Right
      }
      if (Math.random() > 0.3 && y < MAZE_SIZE - 2) {
        maze[y + 1][x] = false; // Down
      }
    }
  }
  
  // Ensure start and end are open
  maze[1][1] = false; // Start
  maze[MAZE_SIZE - 2][MAZE_SIZE - 2] = false; // End area
  
  return maze;
};

// Generate treats
const generateTreats = (maze: boolean[][]): Treat[] => {
  const treats: Treat[] = [];
  
  for (let y = 0; y < MAZE_SIZE; y++) {
    for (let x = 0; x < MAZE_SIZE; x++) {
      if (!maze[y][x] && Math.random() > 0.7) {
        treats.push({
          x,
          y,
          type: Math.random() > 0.9 ? 'power' : 'normal',
          collected: false
        });
      }
    }
  }
  
  return treats;
};

// Generate enemies with pet-specific types
const generateEnemies = (maze: boolean[][], petType: keyof typeof PET_CONFIG): Enemy[] => {
  const enemies: Enemy[] = [];
  const possiblePositions: Position[] = [];
  
  // Find valid positions
  for (let y = 0; y < MAZE_SIZE; y++) {
    for (let x = 0; x < MAZE_SIZE; x++) {
      if (!maze[y][x] && !(x === 1 && y === 1)) { // Not on start position
        possiblePositions.push({ x, y });
      }
    }
  }
  
  // Place 3-4 enemies with pet-specific types
  for (let i = 0; i < Math.min(4, Math.floor(possiblePositions.length / 8)); i++) {
    const pos = possiblePositions[Math.floor(Math.random() * possiblePositions.length)];
    enemies.push({
      ...pos,
      direction: Object.values(DIRECTIONS)[Math.floor(Math.random() * 4)],
      speed: 1,
      type: PET_CONFIG[petType].enemies[i % PET_CONFIG[petType].enemies.length]
    });
  }
  
  return enemies;
};

// Get user's selected pet
const getUserSelectedPet = (): keyof typeof PET_CONFIG => {
  try {
    const petData = localStorage.getItem('fm_pet_v1:2025-09-18');
    if (petData) {
      const parsed = JSON.parse(petData);
      return parsed.animal in PET_CONFIG ? parsed.animal : 'cat';
    }
  } catch {
    // Fall back to cat
  }
  return 'cat';
};

export default function PetAdventureMaze({ onExit, onTokenSpent, currentTokens }: PetAdventureMazeProps) {
  // Game state
  const [gameState, setGameState] = useState<'waiting' | 'playing' | 'paused' | 'gameOver' | 'victory'>('waiting');
  const [playerPos, setPlayerPos] = useState<Position>({ x: 1, y: 1 });
  const [maze, setMaze] = useState<boolean[][]>(() => generateMaze());
  const [treats, setTreats] = useState<Treat[]>(() => generateTreats(maze));
  const [enemies, setEnemies] = useState<Enemy[]>(() => generateEnemies(maze, selectedPet));
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [invulnerable, setInvulnerable] = useState(false);
  const [selectedPet] = useState(() => getUserSelectedPet());
  const [tokenSpent, setTokenSpent] = useState(false);
  const [highScore, setHighScore] = useState(() => {
    try {
      return parseInt(localStorage.getItem('pet_maze_high_score') || '0');
    } catch {
      return 0;
    }
  });
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<NodeJS.Timeout>();
  const petConfig = PET_CONFIG[selectedPet];

  // Reset game
  const resetGame = useCallback(() => {
    const newMaze = generateMaze();
    setMaze(newMaze);
    setPlayerPos({ x: 1, y: 1 });
    setTreats(generateTreats(newMaze));
    setEnemies(generateEnemies(newMaze, selectedPet));
    setScore(0);
    setLives(3);
    setInvulnerable(false);
    setGameState('waiting');
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
    }
  }, []);

  // Start game
  const startGame = useCallback(() => {
    // TEMPORARILY DISABLED FOR TESTING
    // if (currentTokens < 20 && !tokenSpent) {
    //   return;
    // }
    
    if (!tokenSpent) {
      // onTokenSpent(); // Temporarily disabled for testing
      setTokenSpent(true);
    }
    
    setGameState('playing');
  }, [currentTokens, tokenSpent, onTokenSpent]);

  // Move player
  const movePlayer = useCallback((direction: Direction) => {
    if (gameState !== 'playing') return;
    
    setPlayerPos(current => {
      const newPos = {
        x: current.x + direction.x,
        y: current.y + direction.y
      };
      
      // Check bounds and walls
      if (newPos.x < 0 || newPos.x >= MAZE_SIZE || 
          newPos.y < 0 || newPos.y >= MAZE_SIZE || 
          maze[newPos.y][newPos.x]) {
        return current;
      }
      
      return newPos;
    });
  }, [gameState, maze]);

  // Game loop
  const gameLoop = useCallback(() => {
    if (gameState !== 'playing') return;
    
    try {
      // Move enemies
      setEnemies(currentEnemies => {
        return currentEnemies.map(enemy => {
          const newPos = {
            x: enemy.x + enemy.direction.x,
            y: enemy.y + enemy.direction.y
          };
          
          // Check if enemy hits wall or bounds
          if (newPos.x < 0 || newPos.x >= MAZE_SIZE || 
              newPos.y < 0 || newPos.y >= MAZE_SIZE || 
              maze[newPos.y][newPos.x]) {
            // Change direction randomly
            const directions = Object.values(DIRECTIONS);
            return {
              ...enemy,
              direction: directions[Math.floor(Math.random() * directions.length)]
            };
          }
          
          return { ...enemy, ...newPos };
        });
      });
      
      // Check collisions with treats - fix the visual bug
      let treatCollected = false;
      setTreats(currentTreats => {
        return currentTreats.map(treat => {
          if (!treat.collected && treat.x === playerPos.x && treat.y === playerPos.y) {
            treatCollected = true;
            if (treat.type === 'power') {
              setScore(prev => prev + 50);
              setInvulnerable(true);
              setTimeout(() => setInvulnerable(false), 3000);
            } else {
              setScore(prev => prev + 10);
            }
            return { ...treat, collected: true };
          }
          return treat;
        });
      });
      
      // Check collision with enemies
      if (!invulnerable) {
        const hitEnemy = enemies.some(enemy => 
          enemy.x === playerPos.x && enemy.y === playerPos.y
        );
        
        if (hitEnemy) {
          setLives(current => {
            const newLives = current - 1;
            if (newLives <= 0) {
              setGameState('gameOver');
            } else {
              setInvulnerable(true);
              setTimeout(() => setInvulnerable(false), 2000);
            }
            return newLives;
          });
        }
      }
      
      // Check victory condition
      const allTreatsCollected = treats.every(treat => treat.collected);
      if (allTreatsCollected && treats.length > 0) {
        setGameState('victory');
      }
    } catch (error) {
      console.error('Game loop error:', error);
      setGameState('gameOver');
    }
  }, [gameState, maze, playerPos, enemies, treats, invulnerable]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      e.preventDefault();
      
      switch (e.code) {
        case 'ArrowUp':
        case 'KeyW':
          movePlayer(DIRECTIONS.UP);
          break;
        case 'ArrowDown':
        case 'KeyS':
          movePlayer(DIRECTIONS.DOWN);
          break;
        case 'ArrowLeft':
        case 'KeyA':
          movePlayer(DIRECTIONS.LEFT);
          break;
        case 'ArrowRight':
        case 'KeyD':
          movePlayer(DIRECTIONS.RIGHT);
          break;
        case 'Space':
          if (gameState === 'waiting') {
            startGame();
          } else if (gameState === 'playing') {
            setGameState('paused');
          } else if (gameState === 'paused') {
            setGameState('playing');
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState, movePlayer, startGame]);

  // Game loop effect
  useEffect(() => {
    if (gameState === 'playing') {
      gameLoopRef.current = setInterval(gameLoop, GAME_SPEED);
    } else {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    }

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [gameState, gameLoop]);

  // Update high score
  useEffect(() => {
    if ((gameState === 'gameOver' || gameState === 'victory') && score > highScore) {
      setHighScore(score);
      try {
        localStorage.setItem('pet_maze_high_score', score.toString());
      } catch {
        // Fail silently
      }
    }
  }, [gameState, score, highScore]);

  // Draw game
  const draw = useCallback(() => {
    try {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      // Clear canvas
      ctx.fillStyle = '#f0f9ff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw maze
      for (let y = 0; y < MAZE_SIZE; y++) {
        for (let x = 0; x < MAZE_SIZE; x++) {
          if (maze[y][x]) {
            ctx.fillStyle = '#3b82f6';
            ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
          }
        }
      }
      
      // Draw treats - ensure proper rendering
      ctx.font = `${Math.floor(CELL_SIZE * 0.7)}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      treats.forEach(treat => {
        if (!treat.collected) {
          // Clear the cell first to prevent ghosting
          ctx.fillStyle = '#f0f9ff';
          ctx.fillRect(treat.x * CELL_SIZE, treat.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
          
          // Draw the treat
          ctx.fillText(
            treat.type === 'power' ? petConfig.powerTreat : petConfig.treat,
            treat.x * CELL_SIZE + CELL_SIZE / 2,
            treat.y * CELL_SIZE + CELL_SIZE / 2
          );
        } else {
          // Clear collected treat area completely
          ctx.fillStyle = '#f0f9ff';
          ctx.fillRect(treat.x * CELL_SIZE, treat.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        }
      });
      
      // Draw enemies with pet-specific types
      enemies.forEach(enemy => {
        ctx.fillText(
          enemy.type, // Use the specific enemy type emoji
          enemy.x * CELL_SIZE + CELL_SIZE / 2,
          enemy.y * CELL_SIZE + CELL_SIZE / 2
        );
      });
      
      // Draw player with better positioning and effects
      if (invulnerable) {
        // Invulnerability flash effect
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fillRect(
          playerPos.x * CELL_SIZE + 2,
          playerPos.y * CELL_SIZE + 2,
          CELL_SIZE - 4,
          CELL_SIZE - 4
        );
      }
      
      ctx.fillText(
        petConfig.emoji,
        playerPos.x * CELL_SIZE + CELL_SIZE / 2,
        playerPos.y * CELL_SIZE + CELL_SIZE / 2
      );
    } catch (error) {
      console.error('Draw error:', error);
    }
  }, [maze, treats, enemies, playerPos, invulnerable, petConfig]);

  // Draw effect
  useEffect(() => {
    draw();
  }, [draw]);

  const canPlay = true; // Temporarily disabled for testing
  const treatsRemaining = treats.filter(t => !t.collected).length;

  return (
    <div className="min-h-screen bg-background py-4 px-4">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="text-3xl">{petConfig.emoji}</div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Pet Adventure Maze</h1>
              <p className="text-muted-foreground">
                Help {petConfig.name} collect all the {petConfig.treat} treats!
              </p>
            </div>
          </div>
          <Button onClick={onExit} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Arcade
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Game Canvas */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-4">
                <div className="relative mx-auto w-fit bg-white rounded-lg p-2">
                  <canvas
                    ref={canvasRef}
                    width={MAZE_SIZE * CELL_SIZE}
                    height={MAZE_SIZE * CELL_SIZE}
                    className="border-2 border-border rounded-lg block"
                    style={{ maxWidth: '100%', height: 'auto' }}
                  />
                  
                  {/* Game State Overlays */}
                  {gameState === 'waiting' && (
                    <div className="absolute inset-0 bg-primary/20 backdrop-blur-sm flex items-center justify-center rounded-lg">
                      <div className="text-center text-foreground">
                        <h2 className="text-2xl font-bold mb-4">Ready for Adventure?</h2>
                        <p className="mb-4">Help {petConfig.name} collect all the treats!</p>
                        <Button 
                          onClick={startGame} 
                          disabled={!canPlay}
                          size="lg"
                        >
                          <Play className="w-4 h-4 mr-2" />
                          {canPlay ? 'Start Adventure' : `Need ${20 - currentTokens} more tokens`}
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {gameState === 'paused' && (
                    <div className="absolute inset-0 bg-secondary/20 backdrop-blur-sm flex items-center justify-center rounded-lg">
                      <div className="text-center text-foreground">
                        <h2 className="text-2xl font-bold mb-4">Paused</h2>
                        <Button onClick={() => setGameState('playing')} size="lg">
                          <Play className="w-4 h-4 mr-2" />
                          Resume Adventure
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {gameState === 'gameOver' && (
                    <div className="absolute inset-0 bg-destructive/20 backdrop-blur-sm flex items-center justify-center rounded-lg">
                      <div className="text-center text-foreground">
                        <h2 className="text-2xl font-bold mb-4">Adventure Over!</h2>
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
                            Try Again
                          </Button>
                          <Button onClick={resetGame} variant="outline">
                            <RotateCcw className="w-4 h-4 mr-2" />
                            New Maze
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {gameState === 'victory' && (
                    <div className="absolute inset-0 bg-green-500/20 backdrop-blur-sm flex items-center justify-center rounded-lg">
                      <div className="text-center text-foreground">
                        <h2 className="text-2xl font-bold mb-4">🎉 Victory! 🎉</h2>
                        <p className="text-lg mb-4">{petConfig.name} collected all treats!</p>
                        <p className="text-lg mb-4">Final Score: {score}</p>
                        {score === highScore && (
                          <Badge className="mb-4 bg-yellow-500 text-black">
                            <Trophy className="w-4 h-4 mr-1" />
                            New High Score!
                          </Badge>
                        )}
                        <div className="flex gap-2 justify-center">
                          <Button onClick={resetGame}>
                            <Star className="w-4 h-4 mr-2" />
                            New Adventure
                          </Button>
                          <Button onClick={onExit} variant="outline">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Arcade
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Game Info */}
          <div className="space-y-6">
            
            {/* Game Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  Adventure Stats
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
                  <span className="text-muted-foreground">Lives:</span>
                  <div className="flex gap-1">
                    {Array.from({ length: 3 }, (_, i) => (
                      <Heart 
                        key={i} 
                        className={`w-4 h-4 ${i < lives ? 'text-red-500 fill-red-500' : 'text-gray-300'}`} 
                      />
                    ))}
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Treats Left:</span>
                  <span className="font-bold">{treatsRemaining}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pet:</span>
                  <span className="font-bold">{petConfig.name} {petConfig.emoji}</span>
                </div>
              </CardContent>
            </Card>

            {/* Touch Controls */}
            {gameState === 'playing' && (
              <Card>
                <CardHeader>
                  <CardTitle>Controls</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    onClick={() => setGameState('paused')} 
                    className="w-full"
                  >
                    <Pause className="w-4 h-4 mr-2" />
                    Pause Adventure
                  </Button>
                  
                  {/* Touch Controls */}
                  <div className="grid grid-cols-3 gap-2">
                    <div></div>
                    <Button 
                      variant="outline" 
                      className="aspect-square"
                      onClick={() => movePlayer(DIRECTIONS.UP)}
                    >
                      <ChevronUp className="w-4 h-4" />
                    </Button>
                    <div></div>
                    
                    <Button 
                      variant="outline" 
                      className="aspect-square"
                      onClick={() => movePlayer(DIRECTIONS.LEFT)}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <div></div>
                    <Button 
                      variant="outline" 
                      className="aspect-square"
                      onClick={() => movePlayer(DIRECTIONS.RIGHT)}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                    
                    <div></div>
                    <Button 
                      variant="outline" 
                      className="aspect-square"
                      onClick={() => movePlayer(DIRECTIONS.DOWN)}
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
                <p>• Move with arrow keys or WASD</p>
                <p>• Collect all {petConfig.treat} treats to win</p>
                <p>• Avoid the {petConfig.enemies.join(' ')} obstacles</p>
                <p>• {petConfig.powerTreat} Power treats give invincibility</p>
                <p>• You have 3 lives per adventure</p>
                <p>• Touch buttons work on mobile</p>
                <p>• Costs 20 tokens per game</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}