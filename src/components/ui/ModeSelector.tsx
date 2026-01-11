import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ModeSelectorProps {
  selectedMode: 'pet-store' | 'task-arcade';
  onModeChange: (mode: 'pet-store' | 'task-arcade') => void;
}

// Note: Design Studio mode files are preserved for future use
// To re-enable, add back: { id: 'design-studio', name: 'Design Studio', image: '/assets/mode-buttons/design-studio.png', description: 'Customize your character' }
const MODES = [
  {
    id: 'pet-store' as const,
    name: 'Pet Store',
    image: '/assets/mode-buttons/pet-store.png',
    description: 'Grow your pets'
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
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
              {/* Rectangular button graphic */}
              <div className={`
                transition-all duration-300 rounded-2xl overflow-hidden
                ${isSelected ? 'ring-3 ring-primary/60 shadow-lg shadow-primary/25' : ''}
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
                  <Badge variant="default" className="bg-primary text-primary-foreground shadow-lg text-xs px-2 py-1">
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