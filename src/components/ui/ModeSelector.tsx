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
              <CardContent className="p-2">
                <div className="text-center space-y-3">
                  {/* Mode graphic image */}
                  <div className={`
                    w-24 h-24 mx-auto rounded-xl overflow-hidden transition-all duration-300
                    ${isSelected ? 'ring-3 ring-primary shadow-xl scale-105' : 'hover:scale-105'}
                  `}>
                    <img 
                      src={mode.image} 
                      alt={mode.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Mode name */}
                  <h3 className={`
                    font-semibold text-sm transition-colors
                    ${isSelected ? 'text-primary' : 'text-foreground'}
                  `}>
                    {mode.name}
                  </h3>
                  
                  {/* Selected indicator */}
                  {isSelected && (
                    <Badge variant="default" className="bg-primary/10 text-primary border-primary/20 text-xs">
                      Active
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