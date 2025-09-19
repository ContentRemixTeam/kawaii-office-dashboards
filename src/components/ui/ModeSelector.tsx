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
    image: '/assets/mode-buttons/pet-store.png',
    description: 'Grow your pets'
  },
  {
    id: 'design-studio' as const,
    name: 'Design Studio',
    image: '/assets/mode-buttons/design-studio.png',
    description: 'Customize your character'
  },
  {
    id: 'task-arcade' as const,
    name: 'Task Arcade',
    image: '/assets/mode-buttons/task-arcade.png',
    description: 'Play productivity games'
  }
];

export default function ModeSelector({ selectedMode, onModeChange }: ModeSelectorProps) {
  return (
    <div className="w-full mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {MODES.map((mode) => {
          const isSelected = selectedMode === mode.id;
          
          return (
            <div
              key={mode.id}
              className={`
                relative cursor-pointer transition-all duration-300 hover:scale-105
                ${isSelected 
                  ? 'scale-105 drop-shadow-xl' 
                  : 'hover:drop-shadow-lg opacity-90 hover:opacity-100'
                }
              `}
              onClick={() => onModeChange(mode.id)}
            >
              {/* Full graphic button */}
              <div className={`
                transition-all duration-300 rounded-xl overflow-hidden
                ${isSelected ? 'ring-2 ring-primary/50 shadow-lg shadow-primary/20' : ''}
              `}>
                <img 
                  src={mode.image} 
                  alt={mode.description}
                  className="w-full h-auto object-contain hover:brightness-110 transition-all duration-300"
                />
              </div>
              
              {/* Selected indicator overlay */}
              {isSelected && (
                <div className="absolute -top-2 -right-2">
                  <Badge variant="default" className="bg-primary text-primary-foreground shadow-lg">
                    Active
                  </Badge>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}