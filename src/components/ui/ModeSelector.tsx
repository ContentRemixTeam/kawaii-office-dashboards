import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ModeSelectorProps {
  selectedMode: 'pet-store' | 'design-studio' | 'task-arcade';
  onModeChange: (mode: 'pet-store' | 'design-studio' | 'task-arcade') => void;
}

const MODES = [
  {
    id: 'pet-store' as const,
    name: 'Pet Store',
    icon: '🐾',
    description: 'Grow your pets',
    gradient: 'from-green-400 to-emerald-500'
  },
  {
    id: 'design-studio' as const,
    name: 'Design Studio',
    icon: '💖',
    description: 'Customize your character',
    gradient: 'from-pink-400 to-rose-500'
  },
  {
    id: 'task-arcade' as const,
    name: 'Task Arcade',
    icon: '🎮',
    description: 'Play productivity games',
    gradient: 'from-purple-400 to-violet-500'
  }
];

export default function ModeSelector({ selectedMode, onModeChange }: ModeSelectorProps) {
  return (
    <div className="w-full mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {MODES.map((mode) => {
          const isSelected = selectedMode === mode.id;
          
          return (
            <Card
              key={mode.id}
              className={`
                cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg
                ${isSelected 
                  ? 'ring-2 ring-primary shadow-xl scale-105' 
                  : 'hover:shadow-md opacity-80 hover:opacity-100'
                }
              `}
              onClick={() => onModeChange(mode.id)}
            >
              <CardContent className="p-4">
                <div className="text-center space-y-2">
                  {/* Mode icon with gradient background */}
                  <div className={`
                    w-16 h-16 mx-auto rounded-full bg-gradient-to-br ${mode.gradient}
                    flex items-center justify-center text-2xl shadow-lg
                    ${isSelected ? 'animate-pulse' : ''}
                  `}>
                    {mode.icon}
                  </div>
                  
                  {/* Mode name */}
                  <h3 className={`
                    font-semibold text-lg transition-colors
                    ${isSelected ? 'text-primary' : 'text-foreground'}
                  `}>
                    {mode.name}
                  </h3>
                  
                  {/* Mode description */}
                  <p className="text-sm text-muted-foreground">
                    {mode.description}
                  </p>
                  
                  {/* Selected indicator */}
                  {isSelected && (
                    <Badge variant="default" className="bg-primary/10 text-primary border-primary/20">
                      Active Mode
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}