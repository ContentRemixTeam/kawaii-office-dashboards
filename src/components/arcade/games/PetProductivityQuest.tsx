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
  type: 'star' | 'rainbow' | 'crystal';
  points: number;
  collected: boolean;
  emoji: string;
}

interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'storm' | 'void' | 'lightning';
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
    ability: 'Rainbow Double Jump',
    jumpForce: -15,
    specialAbility: 'rainbow-jump'
  },
  bunny: { 
    emoji: '🐰', 
    name: 'Bunny',
    ability: 'Super Jump',
    jumpForce: -18,
    specialAbility: 'super-jump'
  }
};

// Level data with progressive difficulty and themed backgrounds
const LEVELS: Level[] = [
  {
    id: 1,
    name: "Enchanted Forest",
    background: "🌲",
    goalX: 750,
    // Level 1: Very Easy - Forest theme
    platforms: [
      { x: 0, y: 350, width: 200, height: 50, type: 'desk' },
      { x: 180, y: 320, width: 120, height: 20, type: 'book' },
      { x: 280, y: 290, width: 150, height: 20, type: 'shelf' },
      { x: 410, y: 330, width: 130, height: 20, type: 'book' },
      { x: 520, y: 300, width: 140, height: 20, type: 'shelf' },
      { x: 640, y: 320, width: 160, height: 50, type: 'desk' }
    ],
    collectibles: [
      { x: 220, y: 290, type: 'star', points: 10, collected: false, emoji: '⭐' },
      { x: 340, y: 260, type: 'rainbow', points: 15, collected: false, emoji: '🌈' },
      { x: 470, y: 300, type: 'star', points: 10, collected: false, emoji: '⭐' },
      { x: 580, y: 270, type: 'crystal', points: 25, collected: false, emoji: '💎' },
      { x: 700, y: 290, type: 'star', points: 10, collected: false, emoji: '⭐' }
    ],
    obstacles: [
      { x: 250, y: 360, width: 25, height: 25, type: 'storm', emoji: '☁️' },
      { x: 600, y: 270, width: 25, height: 25, type: 'void', emoji: '🌑' }
    ]
  },
  {
    id: 2,
    name: "Underwater Depths",
    background: "🌊",
    goalX: 750,
    // Level 2: Medium - Underwater theme
    platforms: [
      { x: 0, y: 350, width: 120, height: 50, type: 'desk' },
      { x: 150, y: 290, width: 90, height: 20, type: 'book' },
      { x: 280, y: 220, width: 100, height: 20, type: 'shelf' },
      { x: 420, y: 280, width: 80, height: 20, type: 'book' },
      { x: 540, y: 200, width: 90, height: 20, type: 'shelf' },
      { x: 670, y: 260, width: 100, height: 20, type: 'book' },
      { x: 720, y: 320, width: 80, height: 50, type: 'desk' }
    ],
    collectibles: [
      { x: 190, y: 260, type: 'star', points: 10, collected: false, emoji: '⭐' },
      { x: 320, y: 190, type: 'rainbow', points: 15, collected: false, emoji: '🌈' },
      { x: 460, y: 250, type: 'crystal', points: 25, collected: false, emoji: '💎' },
      { x: 580, y: 170, type: 'crystal', points: 25, collected: false, emoji: '💎' },
      { x: 710, y: 230, type: 'rainbow', points: 15, collected: false, emoji: '🌈' }
    ],
    obstacles: [
      { x: 120, y: 320, width: 25, height: 25, type: 'storm', emoji: '☁️' },
      { x: 250, y: 190, width: 25, height: 25, type: 'void', emoji: '🌑' },
      { x: 390, y: 250, width: 25, height: 25, type: 'lightning', emoji: '⚡' },
      { x: 510, y: 170, width: 25, height: 25, type: 'storm', emoji: '☁️' }
    ]
  },
  {
    id: 3,
    name: "Cosmic Void",
    background: "🌌",
    goalX: 750,
    // Level 3: Hard - Space theme
    platforms: [
      { x: 0, y: 350, width: 80, height: 50, type: 'desk' },
      { x: 120, y: 280, width: 60, height: 20, type: 'book' },
      { x: 220, y: 200, width: 70, height: 20, type: 'shelf' },
      { x: 330, y: 160, width: 80, height: 20, type: 'book' },
      { x: 450, y: 240, width: 70, height: 20, type: 'shelf' },
      { x: 560, y: 180, width: 60, height: 20, type: 'book' },
      { x: 660, y: 140, width: 70, height: 20, type: 'shelf' },
      { x: 740, y: 300, width: 60, height: 50, type: 'desk' }
    ],
    collectibles: [
      { x: 150, y: 250, type: 'star', points: 10, collected: false, emoji: '⭐' },
      { x: 250, y: 170, type: 'rainbow', points: 15, collected: false, emoji: '🌈' },
      { x: 360, y: 130, type: 'crystal', points: 25, collected: false, emoji: '💎' },
      { x: 480, y: 210, type: 'crystal', points: 25, collected: false, emoji: '💎' },
      { x: 590, y: 150, type: 'star', points: 10, collected: false, emoji: '⭐' },
      { x: 690, y: 110, type: 'rainbow', points: 15, collected: false, emoji: '🌈' }
    ],
    obstacles: [
      { x: 90, y: 320, width: 25, height: 25, type: 'void', emoji: '🌑' },
      { x: 190, y: 170, width: 25, height: 25, type: 'storm', emoji: '☁️' },
      { x: 300, y: 130, width: 25, height: 25, type: 'lightning', emoji: '⚡' },
      { x: 420, y: 210, width: 25, height: 25, type: 'void', emoji: '🌑' },
      { x: 530, y: 150, width: 25, height: 25, type: 'storm', emoji: '☁️' },
      { x: 630, y: 110, width: 25, height: 25, type: 'lightning', emoji: '⚡' }
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
    
    // Different themed backgrounds based on level
    if (currentLevel === 0) {
      // Level 1: Enchanted Forest Theme
      const forestGradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
      forestGradient.addColorStop(0, '#87ceeb'); // Sky blue
      forestGradient.addColorStop(0.6, '#98fb98'); // Pale green
      forestGradient.addColorStop(1, '#228b22'); // Forest green
      ctx.fillStyle = forestGradient;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      
      // Forest elements
      ctx.font = '40px Arial';
      for (let i = 0; i < 5; i++) {
        const treeX = (i * 180) + 50 - (camera.x * 0.2);
        ctx.fillText('🌲', treeX, CANVAS_HEIGHT - 80);
        if (i % 2 === 0) ctx.fillText('🌳', treeX + 90, CANVAS_HEIGHT - 60);
      }
      
      // Floating leaves
      ctx.font = '20px Arial';
      for (let i = 0; i < 8; i++) {
        const leafX = (i * 100) + 30 - (camera.x * 0.4);
        const leafY = 60 + Math.sin(Date.now() * 0.001 + i) * 10;
        ctx.fillText(['🍃', '🍂'][i % 2], leafX, leafY);
      }
      
    } else if (currentLevel === 1) {
      // Level 2: Underwater Theme
      const underwaterGradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
      underwaterGradient.addColorStop(0, '#4682b4'); // Steel blue
      underwaterGradient.addColorStop(0.3, '#5f9ea0'); // Cadet blue
      underwaterGradient.addColorStop(0.7, '#008b8b'); // Dark cyan
      underwaterGradient.addColorStop(1, '#006400'); // Dark green
      ctx.fillStyle = underwaterGradient;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      
      // Bubbles
      ctx.fillStyle = 'rgba(173, 216, 230, 0.6)';
      for (let i = 0; i < 15; i++) {
        const bubbleX = (i * 60) + 20 - (camera.x * 0.1);
        const bubbleY = 50 + Math.sin(Date.now() * 0.002 + i) * 50;
        const size = 5 + (i % 3) * 3;
        ctx.beginPath();
        ctx.arc(bubbleX, bubbleY, size, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Sea life
      ctx.font = '30px Arial';
      for (let i = 0; i < 4; i++) {
        const fishX = (i * 200) + 60 - (camera.x * 0.3);
        const fishY = 100 + (i * 50);
        ctx.fillText(['🐠', '🐟', '🦈', '🐙'][i % 4], fishX, fishY);
      }
      
      // Seaweed
      ctx.font = '50px Arial';
      for (let i = 0; i < 6; i++) {
        const seaweedX = (i * 140) + 20 - (camera.x * 0.1);
        ctx.fillText('🌿', seaweedX, CANVAS_HEIGHT - 30);
      }
      
    } else {
      // Level 3: Cosmic Space Theme
      const spaceGradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
      spaceGradient.addColorStop(0, '#000428'); // Deep space blue
      spaceGradient.addColorStop(0.5, '#004e92'); // Space blue
      spaceGradient.addColorStop(1, '#191970'); // Midnight blue
      ctx.fillStyle = spaceGradient;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      
      // Stars
      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < 50; i++) {
        const starX = (i * 16) + 10 - (camera.x * 0.05);
        const starY = 20 + (i * 7) % (CANVAS_HEIGHT - 100);
        const twinkle = Math.sin(Date.now() * 0.003 + i) * 0.5 + 0.5;
        ctx.globalAlpha = twinkle;
        ctx.fillRect(starX, starY, 2, 2);
      }
      ctx.globalAlpha = 1;
      
      // Planets and space objects
      ctx.font = '40px Arial';
      for (let i = 0; i < 3; i++) {
        const planetX = (i * 300) + 100 - (camera.x * 0.1);
        const planetY = 80 + (i * 60);
        ctx.fillText(['🪐', '🌍', '🌙'][i], planetX, planetY);
      }
      
      // Floating space debris
      ctx.font = '25px Arial';
      for (let i = 0; i < 6; i++) {
        const debrisX = (i * 120) + 50 - (camera.x * 0.2);
        const debrisY = 120 + Math.sin(Date.now() * 0.001 + i) * 15;
        ctx.fillText(['☄️', '🛸', '💫'][i % 3], debrisX, debrisY);
      }
    }
    
    // Save context for camera
    ctx.save();
    ctx.translate(-camera.x, -camera.y);
    
    // Draw platforms with theme-appropriate colors
    level.platforms.forEach(platform => {
      const platformGradient = ctx.createLinearGradient(platform.x, platform.y, platform.x, platform.y + platform.height);
      
      if (currentLevel === 0) {
        // Forest theme - Wood and natural colors
        if (platform.type === 'desk') {
          platformGradient.addColorStop(0, '#deb887'); // Burlywood
          platformGradient.addColorStop(1, '#8b7355'); // Dark khaki
        } else {
          platformGradient.addColorStop(0, '#90ee90'); // Light green
          platformGradient.addColorStop(1, '#228b22'); // Forest green
        }
      } else if (currentLevel === 1) {
        // Underwater theme - Coral and sea colors
        if (platform.type === 'desk') {
          platformGradient.addColorStop(0, '#ff7f50'); // Coral
          platformGradient.addColorStop(1, '#cd5c5c'); // Indian red
        } else {
          platformGradient.addColorStop(0, '#40e0d0'); // Turquoise
          platformGradient.addColorStop(1, '#008b8b'); // Dark cyan
        }
      } else {
        // Space theme - Metallic and cosmic colors
        if (platform.type === 'desk') {
          platformGradient.addColorStop(0, '#c0c0c0'); // Silver
          platformGradient.addColorStop(1, '#708090'); // Slate gray
        } else {
          platformGradient.addColorStop(0, '#9370db'); // Medium purple
          platformGradient.addColorStop(1, '#4b0082'); // Indigo
        }
      }
      
      ctx.fillStyle = platformGradient;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetY = 4;
      
      const radius = 8;
      ctx.beginPath();
      ctx.roundRect(platform.x, platform.y, platform.width, platform.height, radius);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;
    });
    
    // Draw collectibles with themed glow
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    level.collectibles.forEach(item => {
      if (!item.collected) {
        // Theme-specific glow colors
        if (currentLevel === 0) ctx.shadowColor = '#32cd32'; // Lime green
        else if (currentLevel === 1) ctx.shadowColor = '#00ced1'; // Dark turquoise
        else ctx.shadowColor = '#9370db'; // Medium purple
        
        ctx.shadowBlur = 15;
        ctx.fillText(item.emoji, item.x + 10, item.y + 15);
        ctx.shadowBlur = 0;
      }
    });
    
    // Draw obstacles with themed bounce
    const time = Date.now() * 0.003;
    level.obstacles.forEach((obstacle, index) => {
      const bounce = Math.sin(time + index) * 2;
      
      // Theme-specific danger colors
      if (currentLevel === 0) ctx.shadowColor = '#8b0000'; // Dark red
      else if (currentLevel === 1) ctx.shadowColor = '#000080'; // Navy
      else ctx.shadowColor = '#800080'; // Purple
      
      ctx.shadowBlur = 10;
      ctx.fillText(obstacle.emoji, obstacle.x + obstacle.width/2, obstacle.y + obstacle.height/2 + 5 + bounce);
      ctx.shadowBlur = 0;
    });
    
    // Draw goal with rainbow effect
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
    
    // Draw themed ground
    const groundGradient = ctx.createLinearGradient(0, CANVAS_HEIGHT - 50, 0, CANVAS_HEIGHT);
    if (currentLevel === 0) {
      groundGradient.addColorStop(0, '#9acd32'); // Yellow green
      groundGradient.addColorStop(1, '#556b2f'); // Dark olive green
    } else if (currentLevel === 1) {
      groundGradient.addColorStop(0, '#f4a460'); // Sandy brown
      groundGradient.addColorStop(1, '#8b4513'); // Saddle brown
    } else {
      groundGradient.addColorStop(0, '#696969'); // Dim gray
      groundGradient.addColorStop(1, '#2f4f4f'); // Dark slate gray
    }
    ctx.fillStyle = groundGradient;
    ctx.fillRect(0, CANVAS_HEIGHT - 50, 1000, 50);
    
    // Add themed ground details
    ctx.font = '16px Arial';
    for (let i = 0; i < 20; i++) {
      const detailX = i * 50 + (camera.x * 0.1) % 50;
      if (currentLevel === 0) {
        ctx.fillText(['🌱', '🌿', '🍄'][i % 3], detailX, CANVAS_HEIGHT - 20);
      } else if (currentLevel === 1) {
        ctx.fillText(['🐚', '⭐', '🪨'][i % 3], detailX, CANVAS_HEIGHT - 20);
      } else {
        ctx.fillText(['🌟', '💫', '🛸'][i % 3], detailX, CANVAS_HEIGHT - 20);
      }
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
              <h1 className="text-3xl font-bold text-foreground">Unicorn's Dream Quest</h1>
              <p className="text-muted-foreground">
                Journey through magical dreamscapes and restore the world's magic!
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
                      <div className="text-center text-foreground max-w-md mx-auto p-6">
                        <h2 className="text-3xl font-bold mb-3 text-purple-700">🦄 Ready for Dream Quest? 🌟</h2>
                        <p className="mb-4 text-lg leading-relaxed text-gray-700">
                          {petConfig.name} must collect magical energy to restore the world! 
                          <br />
                          <span className="text-purple-600 font-semibold">Explore 3 enchanted realms and gather cosmic power!</span>
                        </p>
                        
                        {/* Clear Instructions */}
                        <div className="bg-white/80 rounded-lg p-4 mb-4 text-left">
                          <h3 className="font-bold text-purple-700 mb-2">🎮 How to Play:</h3>
                          <ul className="text-sm space-y-1 text-gray-700">
                            <li>• <strong>Move:</strong> Arrow Keys or A/D</li>
                            <li>• <strong>Jump:</strong> Spacebar or Arrow Up</li>
                            <li>• <strong>Special:</strong> {petConfig.ability}</li>
                            <li>• <strong>Goal:</strong> Collect stars & reach the portal!</li>
                            <li>• <strong>Play Time:</strong> Complete multiple levels with 3 lives</li>
                          </ul>
                        </div>
                        
                        <Button 
                          onClick={startGame} 
                          disabled={!canPlay}
                          size="lg"
                          variant="gradient-primary"
                          className="px-8 py-3 text-lg font-bold shadow-lg hover:scale-105 transition-all"
                        >
                          <Play className="w-5 h-5 mr-2" />
                          {canPlay ? '🚀 Start Dream Quest' : `Need ${30 - currentTokens} more tokens`}
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {gameState === 'levelComplete' && (
                    <div className="absolute inset-0 bg-green-500/20 backdrop-blur-sm flex items-center justify-center rounded-lg">
                      <div className="text-center text-foreground">
                        <h2 className="text-2xl font-bold mb-4">Dreamscape Complete! ✨</h2>
                        <p className="text-lg mb-4">Score: {score}</p>
                        <Button onClick={nextLevel} size="lg">
                          <Star className="w-4 h-4 mr-2" />
                          Next Dreamscape
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {gameState === 'gameComplete' && (
                    <div className="absolute inset-0 bg-yellow-500/20 backdrop-blur-sm flex items-center justify-center rounded-lg">
                      <div className="text-center text-foreground">
                        <h2 className="text-2xl font-bold mb-4">Magic Restored! 🌟</h2>
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
                  Dream Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Dreamscape:</span>
                  <span className="font-bold">{currentLevel + 1}/3</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Magic:</span>
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

            {/* Instructions & Game Guide */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  🦄 Dream Quest Guide
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-sm mb-2 text-purple-700">🎯 Your Epic Mission:</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Journey through 3 magical realms to collect cosmic energy and restore the world's magic! You have <strong>3 lives</strong> and <strong>extended play time</strong> to complete your quest.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-sm mb-2 text-green-700">⚡ Magical Powers & Controls:</h4>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div>• <strong>Move:</strong> ← → Arrow keys or A/D keys</div>
                    <div>• <strong>Jump:</strong> ↑ Arrow, Spacebar, or W key</div>
                    <div>• <strong>{petConfig.name}'s Special:</strong> {petConfig.ability}</div>
                    <div>• <strong>Mobile:</strong> Use touch controls above</div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-sm mb-2 text-blue-700">💎 Magical Energy to Collect:</h4>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div>⭐ <strong>Star Energy:</strong> +10 magic points</div>
                    <div>🌈 <strong>Rainbow Power:</strong> +15 magic points</div>
                    <div>💎 <strong>Cosmic Crystals:</strong> +25 magic points</div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-sm mb-2 text-red-700">⚠️ Dangers to Avoid:</h4>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div>☁️ <strong>Storm Clouds</strong> - Lose a life</div>
                    <div>🌑 <strong>Void Holes</strong> - Instant danger</div>
                    <div>⚡ <strong>Lightning</strong> - Shocking obstacles</div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 p-3 rounded-lg border border-purple-200">
                  <h4 className="font-semibold text-sm mb-2 text-purple-700">🎮 Gaming Energy System:</h4>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div>• <strong>Extended Play:</strong> Generous time to complete all 3 realms</div>
                    <div>• <strong>Energy Cost:</strong> 30 tokens per gaming session</div>
                    <div>• <strong>Earn More:</strong> Complete tasks to unlock more gaming time!</div>
                    <div>• <strong>Bonus:</strong> Higher scores = more energy rewards!</div>
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