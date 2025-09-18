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
  Star,
  Coffee,
  BookOpen,
  CheckSquare,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

// Game configuration
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 400;
const GRAVITY = 0.4;
const JUMP_FORCE = -15;
const MOVE_SPEED = 4;

interface Position {
  x: number;
  y: number;
}

interface Player extends Position {
  vx: number;
  vy: number;
  width: number;
  height: number;
  grounded: boolean;
  direction: 1 | -1;
}

interface Platform {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'desk' | 'book' | 'shelf';
}

interface Collectible {
  x: number;
  y: number;
  type: 'coffee' | 'notebook' | 'task';
  points: number;
  collected: boolean;
  emoji: string;
}

interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'notification' | 'distraction' | 'lazy';
  emoji: string;
}

interface Level {
  id: number;
  name: string;
  platforms: Platform[];
  collectibles: Collectible[];
  obstacles: Obstacle[];
  background: string;
  goalX: number;
}

interface PetProductivityQuestProps {
  onExit: () => void;
  onTokenSpent: () => void;
  currentTokens: number;
}

// Pet configurations with abilities
const PET_CONFIG = {
  cat: { 
    emoji: '🐱', 
    name: 'Kitty',
    ability: 'Extra Jump Height',
    jumpForce: -17,
    specialAbility: 'safe-landing'
  },
  dog: { 
    emoji: '🐕', 
    name: 'Puppy',
    ability: 'Dig Under Obstacles',
    jumpForce: -15,
    specialAbility: 'dig'
  },
  dragon: { 
    emoji: '🐉', 
    name: 'Dragon',
    ability: 'Hover Glide',
    jumpForce: -15,
    specialAbility: 'hover'
  },
  unicorn: { 
    emoji: '🦄', 
    name: 'Unicorn',
    ability: 'Double Jump',
    jumpForce: -15,
    specialAbility: 'double-jump'
  },
  bunny: { 
    emoji: '🐰', 
    name: 'Bunny',
    ability: 'Super Jump',
    jumpForce: -18,
    specialAbility: 'super-jump'
  }
};

// Level data
const LEVELS: Level[] = [
  {
    id: 1,
    name: "Morning Rush",
    background: "🌅",
    goalX: 750,
    platforms: [
      { x: 0, y: 350, width: 150, height: 50, type: 'desk' },
      { x: 200, y: 300, width: 100, height: 20, type: 'book' },
      { x: 350, y: 250, width: 120, height: 20, type: 'shelf' },
      { x: 520, y: 320, width: 100, height: 20, type: 'book' },
      { x: 670, y: 270, width: 130, height: 50, type: 'desk' }
    ],
    collectibles: [
      { x: 230, y: 270, type: 'coffee', points: 10, collected: false, emoji: '☕' },
      { x: 380, y: 220, type: 'notebook', points: 15, collected: false, emoji: '📓' },
      { x: 550, y: 290, type: 'task', points: 25, collected: false, emoji: '✅' },
      { x: 700, y: 240, type: 'coffee', points: 10, collected: false, emoji: '☕' }
    ],
    obstacles: [
      { x: 160, y: 320, width: 30, height: 30, type: 'notification', emoji: '📱' },
      { x: 320, y: 220, width: 25, height: 25, type: 'distraction', emoji: '💭' },
      { x: 480, y: 290, width: 35, height: 35, type: 'lazy', emoji: '😴' }
    ]
  },
  {
    id: 2,
    name: "Afternoon Focus",
    background: "☀️",
    goalX: 750,
    platforms: [
      { x: 0, y: 350, width: 120, height: 50, type: 'desk' },
      { x: 180, y: 280, width: 80, height: 20, type: 'book' },
      { x: 320, y: 200, width: 100, height: 20, type: 'shelf' },
      { x: 480, y: 260, width: 90, height: 20, type: 'book' },
      { x: 620, y: 180, width: 100, height: 20, type: 'shelf' },
      { x: 720, y: 320, width: 80, height: 50, type: 'desk' }
    ],
    collectibles: [
      { x: 210, y: 250, type: 'notebook', points: 15, collected: false, emoji: '📓' },
      { x: 350, y: 170, type: 'task', points: 25, collected: false, emoji: '✅' },
      { x: 510, y: 230, type: 'coffee', points: 10, collected: false, emoji: '☕' },
      { x: 650, y: 150, type: 'task', points: 25, collected: false, emoji: '✅' }
    ],
    obstacles: [
      { x: 140, y: 320, width: 30, height: 30, type: 'notification', emoji: '📱' },
      { x: 280, y: 170, width: 25, height: 25, type: 'distraction', emoji: '💭' },
      { x: 440, y: 230, width: 35, height: 35, type: 'lazy', emoji: '😴' },
      { x: 580, y: 150, width: 30, height: 30, type: 'notification', emoji: '📱' }
    ]
  },
  {
    id: 3,
    name: "Evening Wrap-up",
    background: "🌆",
    goalX: 750,
    platforms: [
      { x: 0, y: 350, width: 100, height: 50, type: 'desk' },
      { x: 150, y: 300, width: 70, height: 20, type: 'book' },
      { x: 270, y: 250, width: 80, height: 20, type: 'shelf' },
      { x: 400, y: 180, width: 90, height: 20, type: 'book' },
      { x: 540, y: 220, width: 80, height: 20, type: 'shelf' },
      { x: 670, y: 150, width: 70, height: 20, type: 'book' },
      { x: 720, y: 300, width: 80, height: 50, type: 'desk' }
    ],
    collectibles: [
      { x: 180, y: 270, type: 'coffee', points: 10, collected: false, emoji: '☕' },
      { x: 300, y: 220, type: 'notebook', points: 15, collected: false, emoji: '📓' },
      { x: 430, y: 150, type: 'task', points: 25, collected: false, emoji: '✅' },
      { x: 570, y: 190, type: 'task', points: 25, collected: false, emoji: '✅' },
      { x: 700, y: 120, type: 'notebook', points: 15, collected: false, emoji: '📓' }
    ],
    obstacles: [
      { x: 120, y: 320, width: 25, height: 25, type: 'distraction', emoji: '💭' },
      { x: 240, y: 220, width: 30, height: 30, type: 'notification', emoji: '📱' },
      { x: 360, y: 150, width: 35, height: 35, type: 'lazy', emoji: '😴' },
      { x: 500, y: 190, width: 30, height: 30, type: 'notification', emoji: '📱' },
      { x: 640, y: 120, width: 25, height: 25, type: 'distraction', emoji: '💭' }
    ]
  }
];

// Get user's selected pet
const getUserSelectedPet = (): keyof typeof PET_CONFIG => {
  try {
    const petData = localStorage.getItem('fm_pet_v1:2025-09-18');
    if (petData) {
      const parsed = JSON.parse(petData);
      return parsed.animal in PET_CONFIG ? parsed.animal : 'unicorn';
    }
  } catch {
    // Fall back to unicorn
  }
  return 'unicorn';
};

export default function PetProductivityQuest({ onExit, onTokenSpent, currentTokens }: PetProductivityQuestProps) {
  // Game state
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'paused' | 'levelComplete' | 'gameComplete'>('menu');
  const [currentLevel, setCurrentLevel] = useState(0);
  const [score, setScore] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [camera, setCamera] = useState({ x: 0, y: 0 });
  const [tokenSpent, setTokenSpent] = useState(false);
  const [selectedPet] = useState(() => getUserSelectedPet());
  const [doubleJumpUsed, setDoubleJumpUsed] = useState(false);
  const [hovering, setHovering] = useState(false);
  
  // Player state
  const [player, setPlayer] = useState<Player>({
    x: 50,
    y: 300,
    vx: 0,
    vy: 0,
    width: 30,
    height: 30,
    grounded: false,
    direction: 1
  });
  
  const [level, setLevel] = useState<Level>(LEVELS[0]);
  const [keys, setKeys] = useState<{ [key: string]: boolean }>({});
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<number>();
  const petConfig = PET_CONFIG[selectedPet];

  // Start game
  const startGame = useCallback(() => {
    // Token system temporarily disabled for testing
    setTokenSpent(true);
    
    setGameState('playing');
    setCurrentLevel(0);
    setScore(0);
    setTotalScore(0);
    setLives(3);
    setLevel({ ...LEVELS[0] });
    setPlayer({
      x: 50,
      y: 300,
      vx: 0,
      vy: 0,
      width: 30,
      height: 30,
      grounded: false,
      direction: 1
    });
    setCamera({ x: 0, y: 0 });
  }, [currentTokens, tokenSpent, onTokenSpent]);

  // Collision detection
  const checkCollision = useCallback((rect1: any, rect2: any) => {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
  }, []);

  // Game loop
  const gameLoop = useCallback(() => {
    if (gameState !== 'playing') return;

    setPlayer(currentPlayer => {
      const newPlayer = { ...currentPlayer };
      
      // Handle input
      if (keys['ArrowLeft'] || keys['KeyA']) {
        newPlayer.vx = -MOVE_SPEED;
        newPlayer.direction = -1;
      } else if (keys['ArrowRight'] || keys['KeyD']) {
        newPlayer.vx = MOVE_SPEED;
        newPlayer.direction = 1;
      } else {
        newPlayer.vx *= 0.8; // Friction
      }
      
      // Jumping
      if ((keys['Space'] || keys['ArrowUp'] || keys['KeyW']) && newPlayer.grounded) {
        newPlayer.vy = petConfig.jumpForce;
        newPlayer.grounded = false;
        setDoubleJumpUsed(false);
      }
      
      // Special abilities
      if (selectedPet === 'unicorn' && (keys['Space'] || keys['ArrowUp'] || keys['KeyW']) && !newPlayer.grounded && !doubleJumpUsed) {
        newPlayer.vy = petConfig.jumpForce * 0.8;
        setDoubleJumpUsed(true);
      }
      
      if (selectedPet === 'dragon' && (keys['Space'] || keys['ArrowUp'] || keys['KeyW']) && !newPlayer.grounded) {
        if (newPlayer.vy > -2) {
          newPlayer.vy = -2; // Hover
          setHovering(true);
        }
      } else {
        setHovering(false);
      }
      
      // Apply gravity
      if (!newPlayer.grounded) {
        newPlayer.vy += GRAVITY;
      }
      
      // Update position
      newPlayer.x += newPlayer.vx;
      newPlayer.y += newPlayer.vy;
      
      // Platform collision
      newPlayer.grounded = false;
      level.platforms.forEach(platform => {
        if (checkCollision(newPlayer, platform)) {
          // Top collision (landing on platform)
          if (currentPlayer.y + currentPlayer.height <= platform.y + 5 && newPlayer.vy >= 0) {
            newPlayer.y = platform.y - newPlayer.height;
            newPlayer.vy = 0;
            newPlayer.grounded = true;
            setDoubleJumpUsed(false);
          }
        }
      });
      
      // Ground collision
      if (newPlayer.y + newPlayer.height >= CANVAS_HEIGHT - 50) {
        newPlayer.y = CANVAS_HEIGHT - 50 - newPlayer.height;
        newPlayer.vy = 0;
        newPlayer.grounded = true;
        setDoubleJumpUsed(false);
      }
      
      // Bounds
      if (newPlayer.x < 0) newPlayer.x = 0;
      if (newPlayer.y > CANVAS_HEIGHT) {
        // Player fell - lose life
        setLives(current => current - 1);
        if (lives <= 1) {
          setGameState('menu');
        } else {
          // Reset player position
          newPlayer.x = 50;
          newPlayer.y = 300;
          newPlayer.vx = 0;
          newPlayer.vy = 0;
        }
      }
      
      return newPlayer;
    });
    
    // Check collectibles
    setLevel(currentLevel => {
      const newLevel = { ...currentLevel };
      newLevel.collectibles = newLevel.collectibles.map(item => {
        if (!item.collected && checkCollision(player, { ...item, width: 20, height: 20 })) {
          setScore(prev => prev + item.points);
          return { ...item, collected: true };
        }
        return item;
      });
      return newLevel;
    });
    
    // Check obstacles
    level.obstacles.forEach(obstacle => {
      if (checkCollision(player, obstacle)) {
        setLives(current => current - 1);
        if (lives <= 1) {
          setGameState('menu');
        } else {
          // Reset player position
          setPlayer(current => ({
            ...current,
            x: 50,
            y: 300,
            vx: 0,
            vy: 0
          }));
        }
      }
    });
    
    // Check level completion
    if (player.x >= level.goalX) {
      setTotalScore(prev => prev + score);
      if (currentLevel < LEVELS.length - 1) {
        setGameState('levelComplete');
      } else {
        setGameState('gameComplete');
      }
    }
    
    // Update camera
    setCamera(current => ({
      x: Math.max(0, Math.min(player.x - CANVAS_WIDTH / 2, 800 - CANVAS_WIDTH)),
      y: 0
    }));
    
  }, [gameState, keys, player, level, currentLevel, lives, petConfig, selectedPet, doubleJumpUsed, checkCollision, score]);

  // Next level
  const nextLevel = useCallback(() => {
    const nextLevelIndex = currentLevel + 1;
    setCurrentLevel(nextLevelIndex);
    setLevel({ ...LEVELS[nextLevelIndex] });
    setPlayer({
      x: 50,
      y: 300,
      vx: 0,
      vy: 0,
      width: 30,
      height: 30,
      grounded: false,
      direction: 1
    });
    setCamera({ x: 0, y: 0 });
    setGameState('playing');
  }, [currentLevel]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setKeys(current => ({ ...current, [e.code]: true }));
      if (e.code === 'Space') e.preventDefault();
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      setKeys(current => ({ ...current, [e.code]: false }));
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Game loop
  useEffect(() => {
    if (gameState === 'playing') {
      const loop = () => {
        gameLoop();
        gameLoopRef.current = requestAnimationFrame(loop);
      };
      gameLoopRef.current = requestAnimationFrame(loop);
    }
    
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameState, gameLoop]);

  // Draw game
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas with kawaii gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    gradient.addColorStop(0, '#fef3ff'); // Soft pink top
    gradient.addColorStop(0.5, '#ede9fe'); // Lavender middle  
    gradient.addColorStop(1, '#ecfdf5'); // Mint bottom
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Add kawaii clouds
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(147, 51, 234, 0.1)';
    ctx.shadowBlur = 10;
    for (let i = 0; i < 3; i++) {
      const cloudX = (i * 300) + 100 - (camera.x * 0.3);
      const cloudY = 50 + (i * 20);
      // Cloud shape
      ctx.beginPath();
      ctx.arc(cloudX, cloudY, 20, 0, Math.PI * 2);
      ctx.arc(cloudX + 25, cloudY, 25, 0, Math.PI * 2);
      ctx.arc(cloudX + 50, cloudY, 20, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
    
    // Save context for camera
    ctx.save();
    ctx.translate(-camera.x, -camera.y);
    
    // Draw platforms with kawaii rounded corners and gradients
    level.platforms.forEach(platform => {
      const platformGradient = ctx.createLinearGradient(platform.x, platform.y, platform.x, platform.y + platform.height);
      if (platform.type === 'desk') {
        platformGradient.addColorStop(0, '#fbbf24'); // Warm yellow
        platformGradient.addColorStop(1, '#f59e0b'); // Deeper yellow
      } else if (platform.type === 'book') {
        platformGradient.addColorStop(0, '#a78bfa'); // Soft purple
        platformGradient.addColorStop(1, '#8b5cf6'); // Deeper purple
      } else {
        platformGradient.addColorStop(0, '#6ee7b7'); // Mint green
        platformGradient.addColorStop(1, '#10b981'); // Deeper mint
      }
      ctx.fillStyle = platformGradient;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetY = 4;
      
      // Rounded rectangle
      const radius = 8;
      ctx.beginPath();
      ctx.roundRect(platform.x, platform.y, platform.width, platform.height, radius);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;
    });
    
    // Draw collectibles with kawaii glow effect
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    level.collectibles.forEach(item => {
      if (!item.collected) {
        // Glow effect
        ctx.shadowColor = '#fbbf24';
        ctx.shadowBlur = 15;
        ctx.fillText(item.emoji, item.x + 10, item.y + 15);
        ctx.shadowBlur = 0;
      }
    });
    
    // Draw obstacles with soft bounce animation
    const time = Date.now() * 0.003;
    level.obstacles.forEach((obstacle, index) => {
      const bounce = Math.sin(time + index) * 2;
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 10;
      ctx.fillText(obstacle.emoji, obstacle.x + obstacle.width/2, obstacle.y + obstacle.height/2 + 5 + bounce);
      ctx.shadowBlur = 0;
    });
    
    // Draw goal with kawaii rainbow effect
    const goalGradient = ctx.createLinearGradient(level.goalX, CANVAS_HEIGHT - 100, level.goalX + 50, CANVAS_HEIGHT);
    goalGradient.addColorStop(0, '#f472b6'); // Pink
    goalGradient.addColorStop(0.5, '#a78bfa'); // Purple
    goalGradient.addColorStop(1, '#60a5fa'); // Blue
    ctx.fillStyle = goalGradient;
    ctx.shadowColor = 'rgba(244, 114, 182, 0.5)';
    ctx.shadowBlur = 20;
    const radius = 25;
    ctx.beginPath();
    ctx.roundRect(level.goalX, CANVAS_HEIGHT - 100, 50, 100, radius);
    ctx.fill();
    ctx.shadowBlur = 0;
    
    // Goal flag with sparkles
    ctx.font = '32px Arial';
    ctx.fillText('🏁', level.goalX + 25, CANVAS_HEIGHT - 50);
    ctx.font = '16px Arial';
    ctx.fillText('✨', level.goalX + 10, CANVAS_HEIGHT - 70);
    ctx.fillText('✨', level.goalX + 40, CANVAS_HEIGHT - 65);
    
    // Draw player with kawaii bounce
    const playerBounce = player.grounded ? 0 : Math.sin(time * 2) * 1;
    ctx.font = '32px Arial';
    ctx.shadowColor = '#fbbf24';
    ctx.shadowBlur = 15;
    ctx.fillText(petConfig.emoji, player.x + player.width/2, player.y + player.height/2 + 5 + playerBounce);
    ctx.shadowBlur = 0;
    
    // Special ability effects
    if (hovering && selectedPet === 'dragon') {
      ctx.font = '16px Arial';
      ctx.fillText('✨', player.x + 5, player.y - 5);
      ctx.fillText('✨', player.x + 20, player.y - 8);
    }
    
    // Draw ground with kawaii grass pattern
    const groundGradient = ctx.createLinearGradient(0, CANVAS_HEIGHT - 50, 0, CANVAS_HEIGHT);
    groundGradient.addColorStop(0, '#86efac'); // Light green
    groundGradient.addColorStop(1, '#22c55e'); // Deeper green
    ctx.fillStyle = groundGradient;
    ctx.fillRect(0, CANVAS_HEIGHT - 50, 1000, 50);
    
    // Add cute grass details
    ctx.font = '16px Arial';
    for (let i = 0; i < 20; i++) {
      const grassX = i * 50 + (camera.x * 0.1) % 50;
      ctx.fillText('🌱', grassX, CANVAS_HEIGHT - 20);
    }
    
    ctx.restore();
  }, [camera, level, player, petConfig]);

  // Draw effect
  useEffect(() => {
    draw();
  }, [draw]);

  const canPlay = true; // Temporarily disabled token check

  return (
    <div className="min-h-screen bg-background py-4 px-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="text-3xl">{petConfig.emoji}</div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Pet's Productivity Quest</h1>
              <p className="text-muted-foreground">
                Guide {petConfig.name} through productivity challenges!
              </p>
            </div>
          </div>
          <Button onClick={onExit} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Arcade
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Game Canvas */}
          <div className="lg:col-span-3">
            <Card>
              <CardContent className="p-4">
                <div className="relative mx-auto w-fit bg-white rounded-lg p-2">
                  <canvas
                    ref={canvasRef}
                    width={CANVAS_WIDTH}
                    height={CANVAS_HEIGHT}
                    className="border-2 border-border rounded-lg block"
                  />
                  
                  {/* Game State Overlays */}
                  {gameState === 'menu' && (
                    <div className="absolute inset-0 bg-primary/20 backdrop-blur-sm flex items-center justify-center rounded-lg">
                      <div className="text-center text-foreground">
                        <h2 className="text-2xl font-bold mb-4">Ready for Productivity Quest?</h2>
                        <p className="mb-4">{petConfig.name} needs to complete daily tasks!</p>
                        <Button 
                          onClick={startGame} 
                          disabled={!canPlay}
                          size="lg"
                        >
                          <Play className="w-4 h-4 mr-2" />
                          {canPlay ? 'Start Quest' : `Need ${30 - currentTokens} more tokens`}
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {gameState === 'levelComplete' && (
                    <div className="absolute inset-0 bg-green-500/20 backdrop-blur-sm flex items-center justify-center rounded-lg">
                      <div className="text-center text-foreground">
                        <h2 className="text-2xl font-bold mb-4">Level Complete! 🎉</h2>
                        <p className="text-lg mb-4">Score: {score}</p>
                        <Button onClick={nextLevel} size="lg">
                          <Star className="w-4 h-4 mr-2" />
                          Next Level
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {gameState === 'gameComplete' && (
                    <div className="absolute inset-0 bg-yellow-500/20 backdrop-blur-sm flex items-center justify-center rounded-lg">
                      <div className="text-center text-foreground">
                        <h2 className="text-2xl font-bold mb-4">Quest Complete! 🏆</h2>
                        <p className="text-lg mb-4">Total Score: {totalScore + score}</p>
                        <div className="flex gap-2 justify-center">
                          <Button onClick={startGame}>
                            <Play className="w-4 h-4 mr-2" />
                            Play Again
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
                  Quest Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Level:</span>
                  <span className="font-bold">{currentLevel + 1}/3</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Score:</span>
                  <span className="font-bold">{score}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total:</span>
                  <span className="font-bold">{totalScore + score}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Lives:</span>
                  <div className="flex gap-1">
                    {Array.from({ length: 3 }, (_, i) => (
                      <span key={i} className={i < lives ? 'text-red-500' : 'text-gray-300'}>❤️</span>
                    ))}
                  </div>
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
                  <CardTitle>Mobile Controls</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-2">
                    <Button 
                      variant="outline" 
                      className="aspect-square"
                      onTouchStart={() => setKeys(k => ({ ...k, KeyA: true }))}
                      onTouchEnd={() => setKeys(k => ({ ...k, KeyA: false }))}
                      onMouseDown={() => setKeys(k => ({ ...k, KeyA: true }))}
                      onMouseUp={() => setKeys(k => ({ ...k, KeyA: false }))}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      className="aspect-square"
                      onTouchStart={() => setKeys(k => ({ ...k, Space: true }))}
                      onTouchEnd={() => setKeys(k => ({ ...k, Space: false }))}
                      onMouseDown={() => setKeys(k => ({ ...k, Space: true }))}
                      onMouseUp={() => setKeys(k => ({ ...k, Space: false }))}
                    >
                      ⬆️
                    </Button>
                    <Button 
                      variant="outline" 
                      className="aspect-square"
                      onTouchStart={() => setKeys(k => ({ ...k, KeyD: true }))}
                      onTouchEnd={() => setKeys(k => ({ ...k, KeyD: false }))}
                      onMouseDown={() => setKeys(k => ({ ...k, KeyD: true }))}
                      onMouseUp={() => setKeys(k => ({ ...k, KeyD: false }))}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Instructions */}
            <Card>
              <CardHeader>
                <CardTitle>How to Play</CardTitle>
              </CardHeader>
              <CardContent className="text-base space-y-3 text-muted-foreground">
                <p>• Move: Arrow keys or A/D</p>
                <p>• Jump: Spacebar or Up arrow</p>
                <p>• Collect: ☕ (10) 📓 (15) ✅ (25)</p>
                <p>• Avoid: 📱 💭 😴 obstacles</p>
                <p>• {petConfig.name} Special: {petConfig.ability}</p>
                <p>• Reach the 🏁 flag to win!</p>
                <p>• Costs 30 tokens per game</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}