import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Play, 
  Trophy, 
  Coins, 
  Star,
  Gamepad2,
  Target,
  Zap
} from 'lucide-react';

interface PremiumGameCardProps {
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  tokenCost: number;
  bestScore: number;
  isUnlocked: boolean;
  onPlay: () => void;
  icon: React.ReactNode;
  theme: 'productivity' | 'adventure' | 'maze';
}

const difficultyConfig = {
  Easy: { color: 'bg-green-500', icon: Star },
  Medium: { color: 'bg-yellow-500', icon: Target },
  Hard: { color: 'bg-red-500', icon: Zap }
};

const themeGradients = {
  productivity: 'from-blue-500/20 via-purple-500/20 to-pink-500/20',
  adventure: 'from-purple-500/20 via-pink-500/20 to-orange-500/20',
  maze: 'from-green-500/20 via-blue-500/20 to-purple-500/20'
};

export default function PremiumGameCard({
  title,
  description,
  difficulty,
  tokenCost,
  bestScore,
  isUnlocked,
  onPlay,
  icon,
  theme
}: PremiumGameCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const DifficultyIcon = difficultyConfig[difficulty].icon;

  return (
    <Card 
      className={`
        group relative overflow-hidden border-0 bg-gradient-to-br ${themeGradients[theme]}
        backdrop-blur-sm transition-all duration-500 ease-out cursor-pointer
        hover:scale-105 hover:shadow-2xl hover:shadow-primary/25
        ${isHovered ? 'transform-gpu' : ''}
        ${!isUnlocked ? 'opacity-60 grayscale' : ''}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Animated background glow */}
      <div className={`
        absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/10
        transition-opacity duration-500 ${isHovered ? 'opacity-100' : 'opacity-0'}
      `} />
      
      {/* Gaming pattern overlay */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-4 left-4 text-4xl">🎮</div>
        <div className="absolute bottom-4 right-4 text-2xl">⭐</div>
        <div className="absolute top-4 right-4 text-3xl">🏆</div>
      </div>

      <CardContent className="relative p-6 h-full flex flex-col">
        {/* Header with icon and difficulty */}
        <div className="flex items-start justify-between mb-4">
          <div className={`
            p-3 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/40 
            transition-transform duration-300 group-hover:scale-110
            shadow-lg
          `}>
            <div className="text-2xl">{icon}</div>
          </div>
          
          <Badge 
            className={`
              ${difficultyConfig[difficulty].color} text-white border-0
              px-3 py-1 font-semibold shadow-lg
              transition-transform duration-300 group-hover:scale-110
            `}
          >
            <DifficultyIcon className="w-3 h-3 mr-1" />
            {difficulty}
          </Badge>
        </div>

        {/* Game title and description */}
        <div className="flex-1 mb-4">
          <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
            {title}
          </h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {description}
          </p>
        </div>

        {/* Stats row */}
        <div className="flex items-center justify-between mb-4 text-sm">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Trophy className="w-4 h-4 text-yellow-500" />
            <span>Best: {bestScore.toLocaleString()}</span>
          </div>
          
          <div className="flex items-center gap-1 font-semibold text-foreground">
            <Coins className="w-4 h-4 text-yellow-500" />
            <span>{tokenCost}</span>
          </div>
        </div>

        {/* Play button */}
        <Button
          onClick={onPlay}
          disabled={!isUnlocked}
          className={`
            w-full relative overflow-hidden transition-all duration-300
            ${isUnlocked 
              ? 'bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl' 
              : 'bg-muted'
            }
            group-hover:scale-105
          `}
          size="lg"
        >
          {/* Button glow effect */}
          {isUnlocked && (
            <div className={`
              absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent
              transform translate-x-[-100%] group-hover:translate-x-[100%] 
              transition-transform duration-700 ease-out
            `} />
          )}
          
          <div className="relative flex items-center justify-center gap-2">
            {isUnlocked ? (
              <>
                <Play className="w-4 h-4" />
                <span className="font-semibold">Play Game</span>
              </>
            ) : (
              <>
                <Gamepad2 className="w-4 h-4" />
                <span>Locked</span>
              </>
            )}
          </div>
        </Button>

        {/* Hover shine effect */}
        <div className={`
          absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent
          transform rotate-12 translate-x-[-100%] group-hover:translate-x-[100%]
          transition-transform duration-1000 ease-out pointer-events-none
        `} />
      </CardContent>
    </Card>
  );
}