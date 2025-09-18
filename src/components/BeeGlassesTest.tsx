import React, { useState } from 'react';
import { GlassesBackgroundRemover } from './GlassesBackgroundRemover';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function BeeGlassesTest() {
  const [glassesX, setGlassesX] = useState([0]);
  const [glassesY, setGlassesY] = useState([-15]);
  const [glassesScale, setGlassesScale] = useState([0.85]);

  return (
    <div className="min-h-screen bg-background p-8">
      <h1 className="text-3xl font-bold mb-8 text-center text-foreground">
        Your Bee + Glasses Customization
      </h1>
      
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Interactive Positioning Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Interactive Glasses Positioning</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Live Preview */}
              <div className="text-center">
                <div className="relative inline-block bg-muted/20 p-8 rounded-lg">
                  <img 
                    src="/characters/bases/bee/bee-base.png" 
                    alt="Your bee character"
                    className="block relative z-10"
                    style={{ 
                      width: '300px',
                      height: '300px',
                      objectFit: 'contain'
                    }}
                    onError={(e) => {
                      console.error('Failed to load your bee image');
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <img 
                    src="/characters/customization/accessories/glasses-round.png" 
                    alt=""
                    className="absolute top-8 left-8 z-20 pointer-events-none"
                    style={{ 
                      width: '300px',
                      height: '300px',
                      objectFit: 'contain',
                      transform: `translate(${glassesX[0]}px, ${glassesY[0]}px) scale(${glassesScale[0]})`
                    }}
                    onError={(e) => {
                      console.error('Failed to load glasses image');
                    }}
                  />
                </div>
              </div>

              {/* Controls */}
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Horizontal Position: {glassesX[0]}px
                  </label>
                  <Slider
                    value={glassesX}
                    onValueChange={setGlassesX}
                    min={-50}
                    max={50}
                    step={1}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Vertical Position: {glassesY[0]}px
                  </label>
                  <Slider
                    value={glassesY}
                    onValueChange={setGlassesY}
                    min={-50}
                    max={50}
                    step={1}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Scale: {Math.round(glassesScale[0] * 100)}%
                  </label>
                  <Slider
                    value={glassesScale}
                    onValueChange={setGlassesScale}
                    min={0.5}
                    max={1.2}
                    step={0.05}
                  />
                </div>

                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-medium mb-2">Current Settings:</h4>
                  <code className="text-sm">
                    transform: translate({glassesX[0]}px, {glassesY[0]}px) scale({glassesScale[0]})
                  </code>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Presets */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Position Presets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { name: "Default", x: 0, y: -15, scale: 0.85 },
                { name: "Higher", x: 0, y: -25, scale: 0.8 },
                { name: "Lower", x: 0, y: -5, scale: 0.9 },
                { name: "Smaller", x: 0, y: -15, scale: 0.7 }
              ].map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => {
                    setGlassesX([preset.x]);
                    setGlassesY([preset.y]);
                    setGlassesScale([preset.scale]);
                  }}
                  className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="relative inline-block mb-2">
                    <img 
                      src="/characters/bases/bee/bee-base.png" 
                      alt="Bee"
                      className="block relative z-10"
                      style={{ width: '60px', height: '60px', objectFit: 'contain' }}
                    />
                    <img 
                      src="/characters/customization/accessories/glasses-round.png" 
                      alt=""
                      className="absolute top-0 left-0 z-20 pointer-events-none"
                      style={{ 
                        width: '60px', 
                        height: '60px', 
                        objectFit: 'contain',
                        transform: `translate(${preset.x}px, ${preset.y}px) scale(${preset.scale})`
                      }}
                    />
                  </div>
                  <div className="text-sm font-medium">{preset.name}</div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Your Images */}
        <Card>
          <CardHeader>
            <CardTitle>Your Character Assets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="text-center">
                <h3 className="text-lg font-medium mb-4">Your Bee Character</h3>
                <div className="relative inline-block border-2 border-dashed border-muted-foreground p-4">
                  <img 
                    src="/characters/bases/bee/bee-base.png" 
                    alt="Your bee character"
                    className="block"
                    style={{ 
                      width: 'auto',
                      height: 'auto',
                      maxWidth: '250px',
                      maxHeight: '250px'
                    }}
                    onError={(e) => {
                      console.error('Failed to load your bee image');
                      e.currentTarget.style.display = 'none';
                    }}
                    onLoad={(e) => {
                      console.log('Your bee loaded:', e.currentTarget.naturalWidth, 'x', e.currentTarget.naturalHeight);
                    }}
                  />
                </div>
              </div>
              
              <div className="text-center">
                <h3 className="text-lg font-medium mb-4">Your Glasses</h3>
                <div className="relative inline-block border-2 border-dashed border-muted-foreground p-4 bg-muted/20">
                  <img 
                    src="/characters/customization/accessories/glasses-round.png" 
                    alt="Your round glasses"
                    className="block"
                    style={{ 
                      width: 'auto',
                      height: 'auto',
                      maxWidth: '200px',
                      maxHeight: '200px'
                    }}
                    onError={(e) => {
                      console.error('Failed to load your glasses');
                      e.currentTarget.style.display = 'none';
                    }}
                    onLoad={(e) => {
                      console.log('Your glasses loaded:', e.currentTarget.naturalWidth, 'x', e.currentTarget.naturalHeight);
                    }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Background Remover Tool */}
        <Card>
          <CardHeader>
            <CardTitle>Glasses Background Remover</CardTitle>
          </CardHeader>
          <CardContent>
            <GlassesBackgroundRemover />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}