import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RotateCcw, Move } from 'lucide-react';
import { AccessoryPosition } from '@/types/character';
import { DEFAULT_POSITIONS } from '@/lib/assetManager';

interface AccessoryPositionerProps {
  position: AccessoryPosition;
  onPositionChange: (position: AccessoryPosition) => void;
  category?: string;
  assetName?: string;
}

const PRESETS = [
  { name: "Default", x: 0, y: -15, scale: 0.85, rotation: 0 },
  { name: "Higher", x: 0, y: -25, scale: 0.8, rotation: 0 },
  { name: "Lower", x: 0, y: -5, scale: 0.9, rotation: 0 },
  { name: "Smaller", x: 0, y: -15, scale: 0.7, rotation: 0 },
  { name: "Larger", x: 0, y: -15, scale: 1.0, rotation: 0 },
  { name: "Left", x: -20, y: -15, scale: 0.85, rotation: 0 },
  { name: "Right", x: 20, y: -15, scale: 0.85, rotation: 0 }
];

export default function AccessoryPositioner({ 
  position, 
  onPositionChange, 
  category,
  assetName 
}: AccessoryPositionerProps) {
  
  const updatePosition = (updates: Partial<AccessoryPosition>) => {
    onPositionChange({ ...position, ...updates });
  };

  const resetToDefault = () => {
    const defaultPos = category ? DEFAULT_POSITIONS[category] : DEFAULT_POSITIONS.glasses;
    onPositionChange(defaultPos);
  };

  const applyPreset = (preset: typeof PRESETS[0]) => {
    onPositionChange({
      x: preset.x,
      y: preset.y,
      scale: preset.scale,
      rotation: preset.rotation,
      opacity: position.opacity || 1
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Move className="w-5 h-5" />
          Position {assetName}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Position Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Horizontal: {position.x}px
            </label>
            <Slider
              value={[position.x]}
              onValueChange={(value) => updatePosition({ x: value[0] })}
              min={-100}
              max={100}
              step={1}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Vertical: {position.y}px
            </label>
            <Slider
              value={[position.y]}
              onValueChange={(value) => updatePosition({ y: value[0] })}
              min={-100}
              max={100}
              step={1}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Scale: {Math.round(position.scale * 100)}%
            </label>
            <Slider
              value={[position.scale]}
              onValueChange={(value) => updatePosition({ scale: value[0] })}
              min={0.3}
              max={1.5}
              step={0.05}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Rotation: {position.rotation || 0}°
            </label>
            <Slider
              value={[position.rotation || 0]}
              onValueChange={(value) => updatePosition({ rotation: value[0] })}
              min={-180}
              max={180}
              step={5}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Opacity: {Math.round((position.opacity || 1) * 100)}%
            </label>
            <Slider
              value={[position.opacity || 1]}
              onValueChange={(value) => updatePosition({ opacity: value[0] })}
              min={0.1}
              max={1}
              step={0.1}
              className="w-full"
            />
          </div>

          <div className="flex items-end">
            <Button 
              onClick={resetToDefault}
              variant="outline" 
              size="sm"
              className="w-full"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset to Default
            </Button>
          </div>
        </div>

        {/* Current Transform Display */}
        <div className="bg-muted/50 rounded-lg p-3">
          <h4 className="text-sm font-medium mb-2">CSS Transform:</h4>
          <code className="text-xs text-muted-foreground break-all">
            transform: translate({position.x}px, {position.y}px) scale({position.scale}) rotate({position.rotation || 0}deg); opacity: {position.opacity || 1};
          </code>
        </div>

        {/* Quick Presets */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Quick Presets:</h4>
          <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
            {PRESETS.map((preset) => (
              <Button
                key={preset.name}
                onClick={() => applyPreset(preset)}
                variant="outline"
                size="sm"
                className="text-xs"
              >
                {preset.name}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}