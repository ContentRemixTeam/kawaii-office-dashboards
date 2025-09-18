import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Crown, 
  MapPin, 
  Star, 
  Lock, 
  TreePine, 
  Mountain, 
  Gem, 
  Castle,
  ZoomIn,
  ZoomOut,
  Home,
  Sparkles,
  Eye
} from 'lucide-react';
import { Character } from './CharacterCreation';

interface MapRegion {
  id: string;
  name: string;
  minLevel: number;
  maxLevel: number;
  description: string;
  lore: string;
  icon: React.ReactNode;
  color: string;
  bgGradient: string;
  position: { x: number; y: number };
  questCount: number;
  completedQuests?: number;
  environment: 'village' | 'forest' | 'mountain' | 'cave' | 'castle';
}

interface QuestMapProps {
  character: Character;
  onRegionSelect: (regionId: string) => void;
  selectedRegion?: string;
}

const MAP_REGIONS: MapRegion[] = [
  {
    id: 'starting-village',
    name: 'Peaceful Meadows',
    minLevel: 1,
    maxLevel: 5,
    description: 'A tranquil village where your productivity journey begins',
    lore: 'Cozy cottages dot the landscape as morning mist rises from flower-filled gardens. The gentle sound of a babbling brook carries the promise of adventure ahead.',
    icon: <Home className="w-4 h-4" />,
    color: '#22c55e',
    bgGradient: 'from-green-400 to-emerald-500',
    position: { x: 120, y: 320 },
    questCount: 8,
    environment: 'village'
  },
  {
    id: 'enchanted-forest',
    name: 'Whispering Woods',
    minLevel: 6,
    maxLevel: 10,
    description: 'Ancient trees hold secrets of focus and wisdom',
    lore: 'Towering oaks draped in silver moss create a cathedral of green. Fireflies dance between the branches while mystical creatures watch from shadowed groves.',
    icon: <TreePine className="w-4 h-4" />,
    color: '#16a34a',
    bgGradient: 'from-green-600 to-emerald-700',
    position: { x: 280, y: 250 },
    questCount: 12,
    environment: 'forest'
  },
  {
    id: 'mountain-peak',
    name: 'Skyward Peaks',
    minLevel: 11,
    maxLevel: 15,
    description: 'Scale the heights of productivity mastery',
    lore: 'Snow-crowned summits pierce the clouds where eagles soar on thermal winds. Each step upward reveals vast vistas of possibility stretching to the horizon.',
    icon: <Mountain className="w-4 h-4" />,
    color: '#8b5cf6',
    bgGradient: 'from-purple-500 to-violet-600',
    position: { x: 450, y: 180 },
    questCount: 15,
    environment: 'mountain'
  },
  {
    id: 'crystal-caves',
    name: 'Luminous Depths',
    minLevel: 16,
    maxLevel: 20,
    description: 'Underground chambers where wisdom crystallizes',
    lore: 'Glowing crystals illuminate vast caverns where underground rivers sing ancient melodies. The very walls pulse with accumulated knowledge and power.',
    icon: <Gem className="w-4 h-4" />,
    color: '#0ea5e9',
    bgGradient: 'from-blue-500 to-cyan-600',
    position: { x: 580, y: 280 },
    questCount: 18,
    environment: 'cave'
  },
  {
    id: 'sky-castle',
    name: 'Celestial Citadel',
    minLevel: 21,
    maxLevel: 99,
    description: 'The legendary realm of ultimate productivity',
    lore: 'Floating spires connected by rainbow bridges drift among the clouds. Here, the greatest productivity legends are born, their achievements echoing through eternity.',
    icon: <Castle className="w-4 h-4" />,
    color: '#f59e0b',
    bgGradient: 'from-yellow-500 to-orange-500',
    position: { x: 700, y: 120 },
    questCount: 25,
    environment: 'castle'
  }
];

export default function QuestMap({ character, onRegionSelect, selectedRegion }: QuestMapProps) {
  const [scale, setScale] = useState(0.8);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const [animationPhase, setAnimationPhase] = useState(0);
  const mapRef = useRef<SVGSVGElement>(null);

  // Animation cycle for environmental effects
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationPhase(prev => (prev + 1) % 360);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const getCurrentRegion = () => {
    return MAP_REGIONS.find(region => 
      character.level >= region.minLevel && character.level <= region.maxLevel
    ) || MAP_REGIONS[0];
  };

  const isRegionUnlocked = (region: MapRegion) => {
    return character.level >= region.minLevel;
  };

  const getCharacterProgress = () => {
    const currentRegion = getCurrentRegion();
    const progressInRegion = (character.level - currentRegion.minLevel) / (currentRegion.maxLevel - currentRegion.minLevel);
    return Math.min(progressInRegion, 1);
  };

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.2, 1.5));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.2, 0.5));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const generatePath = () => {
    const points = MAP_REGIONS.map(region => `${region.position.x},${region.position.y}`);
    let path = `M ${points[0]}`;
    
    // Create smooth curves between points
    for (let i = 1; i < points.length; i++) {
      const [x, y] = points[i].split(',').map(Number);
      const [prevX, prevY] = points[i-1].split(',').map(Number);
      const controlX = prevX + (x - prevX) * 0.5;
      const controlY = prevY + (y - prevY) * 0.3;
      path += ` Q ${controlX},${controlY} ${x},${y}`;
    }
    
    return path;
  };

  const getCharacterPosition = () => {
    const currentRegion = getCurrentRegion();
    const nextRegion = MAP_REGIONS[MAP_REGIONS.findIndex(r => r.id === currentRegion.id) + 1];
    
    if (!nextRegion || character.level <= currentRegion.maxLevel) {
      const progress = getCharacterProgress();
      return {
        x: currentRegion.position.x + (progress * 30),
        y: currentRegion.position.y - (progress * 15)
      };
    }
    
    return currentRegion.position;
  };

  const renderEnvironmentalEffects = (region: MapRegion) => {
    const effects = [];
    const isUnlocked = isRegionUnlocked(region);
    
    if (!isUnlocked) return null;

    switch (region.environment) {
      case 'village':
        // Smoke from chimneys
        for (let i = 0; i < 3; i++) {
          effects.push(
            <circle
              key={`smoke-${i}`}
              cx={region.position.x - 10 + i * 8}
              cy={region.position.y - 30 + Math.sin(animationPhase * 0.1 + i) * 3}
              r={2}
              fill="rgba(255,255,255,0.3)"
              className="animate-pulse"
            />
          );
        }
        break;
        
      case 'forest':
        // Fireflies
        for (let i = 0; i < 5; i++) {
          effects.push(
            <circle
              key={`firefly-${i}`}
              cx={region.position.x + Math.sin(animationPhase * 0.05 + i) * 25}
              cy={region.position.y + Math.cos(animationPhase * 0.03 + i) * 20}
              r={1.5}
              fill="#facc15"
              opacity={0.7 + Math.sin(animationPhase * 0.1 + i) * 0.3}
            />
          );
        }
        break;
        
      case 'mountain':
        // Snow particles
        for (let i = 0; i < 4; i++) {
          effects.push(
            <circle
              key={`snow-${i}`}
              cx={region.position.x + Math.sin(animationPhase * 0.02 + i) * 15}
              cy={region.position.y - 40 + (animationPhase + i * 50) % 60}
              r={1}
              fill="white"
              opacity={0.6}
            />
          );
        }
        break;
        
      case 'cave':
        // Crystal glows
        for (let i = 0; i < 6; i++) {
          const angle = (animationPhase + i * 60) * Math.PI / 180;
          effects.push(
            <circle
              key={`crystal-${i}`}
              cx={region.position.x + Math.cos(angle) * 20}
              cy={region.position.y + Math.sin(angle) * 15}
              r={2 + Math.sin(animationPhase * 0.1 + i) * 1}
              fill="#06b6d4"
              opacity={0.5 + Math.sin(animationPhase * 0.1 + i) * 0.3}
            />
          );
        }
        break;
        
      case 'castle':
        // Floating sparkles
        for (let i = 0; i < 8; i++) {
          effects.push(
            <g key={`sparkle-${i}`}>
              <circle
                cx={region.position.x + Math.sin(animationPhase * 0.03 + i) * 30}
                cy={region.position.y + Math.cos(animationPhase * 0.04 + i) * 25}
                r={1.5}
                fill="#fbbf24"
                opacity={0.8}
              />
              <circle
                cx={region.position.x + Math.sin(animationPhase * 0.03 + i) * 30}
                cy={region.position.y + Math.cos(animationPhase * 0.04 + i) * 25}
                r={3}
                fill="none"
                stroke="#fbbf24"
                strokeWidth="0.5"
                opacity={0.4}
              />
            </g>
          );
        }
        break;
    }
    
    return <g key={region.id}>{effects}</g>;
  };

  const characterPosition = getCharacterPosition();

  return (
    <Card className="bg-black/40 border-purple-500/30 backdrop-blur-sm overflow-hidden">
      <CardContent className="p-0 relative">
        {/* Map Controls */}
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
          <Button
            onClick={handleZoomIn}
            size="sm"
            className="bg-black/70 backdrop-blur-sm border-white/20 text-white hover:bg-black/80 shadow-lg"
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button
            onClick={handleZoomOut}
            size="sm"
            className="bg-black/70 backdrop-blur-sm border-white/20 text-white hover:bg-black/80 shadow-lg"
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
        </div>

        {/* Character Info Overlay */}
        <div className="absolute top-4 left-4 z-10">
          <Badge className="bg-black/80 backdrop-blur-sm text-white border-white/30 shadow-lg font-cinzel">
            <Crown className="w-3 h-3 mr-1 text-yellow-400" />
            Level {character.level} • {getCurrentRegion().name}
          </Badge>
        </div>

        {/* Interactive Map */}
        <div className="h-[500px] bg-gradient-to-br from-indigo-900/40 via-purple-900/30 to-blue-900/40 relative overflow-hidden">
          {/* Animated Background Layers */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/10 to-transparent animate-pulse" />
            <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent" />
          </div>
          
          <svg
            ref={mapRef}
            width="100%"
            height="100%"
            viewBox="0 0 900 450"
            className="cursor-move relative z-10"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{
              transform: `scale(${scale}) translate(${offset.x}px, ${offset.y}px)`
            }}
          >
            {/* Enhanced Background with Parallax Layers */}
            <defs>
              <radialGradient id="mapBg" cx="50%" cy="30%" r="70%">
                <stop offset="0%" stopColor="#1e1b4b" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#312e81" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0.2" />
              </radialGradient>
              
              <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#22c55e" />
                <stop offset="25%" stopColor="#16a34a" />
                <stop offset="50%" stopColor="#8b5cf6" />
                <stop offset="75%" stopColor="#0ea5e9" />
                <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>
              
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                <feMerge> 
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
              
              <filter id="characterGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge> 
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>

              {/* Region-specific gradients */}
              {MAP_REGIONS.map(region => (
                <radialGradient key={`gradient-${region.id}`} id={`regionGradient-${region.id}`} cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor={region.color} stopOpacity="0.8" />
                  <stop offset="70%" stopColor={region.color} stopOpacity="0.4" />
                  <stop offset="100%" stopColor={region.color} stopOpacity="0.1" />
                </radialGradient>
              ))}
            </defs>
            
            <rect width="100%" height="100%" fill="url(#mapBg)" />
            
            {/* Atmospheric Background Elements */}
            <g opacity="0.3">
              <circle cx="100" cy="100" r="20" fill="#1e40af" opacity="0.2" className="animate-pulse" />
              <circle cx="700" cy="80" r="15" fill="#7c3aed" opacity="0.3" className="animate-pulse" style={{animationDelay: '1s'}} />
              <circle cx="500" cy="350" r="25" fill="#059669" opacity="0.2" className="animate-pulse" style={{animationDelay: '2s'}} />
            </g>

            {/* Enhanced Adventure Path */}
            <path
              d={generatePath()}
              stroke="url(#pathGradient)"
              strokeWidth="6"
              fill="none"
              strokeDasharray="12,8"
              opacity="0.8"
              filter="url(#glow)"
            />
            
            {/* Animated path overlay */}
            <path
              d={generatePath()}
              stroke="white"
              strokeWidth="2"
              fill="none"
              strokeDasharray="20,20"
              strokeDashoffset={animationPhase * 2}
              opacity="0.4"
            />

            {/* Environmental Effects for each region */}
            {MAP_REGIONS.map(region => renderEnvironmentalEffects(region))}

            {/* Enhanced Map Regions */}
            {MAP_REGIONS.map((region, index) => {
              const isUnlocked = isRegionUnlocked(region);
              const isSelected = selectedRegion === region.id;
              const isCurrent = getCurrentRegion().id === region.id;
              const isHovered = hoveredRegion === region.id;
              
              return (
                <g key={region.id}>
                  {/* Region Background Glow */}
                  {isUnlocked && (
                    <circle
                      cx={region.position.x}
                      cy={region.position.y}
                      r="40"
                      fill={`url(#regionGradient-${region.id})`}
                      opacity={isHovered ? 0.7 : 0.4}
                      className="transition-all duration-300"
                    />
                  )}
                  
                  {/* Main Region Circle */}
                  <circle
                    cx={region.position.x}
                    cy={region.position.y}
                    r={isSelected || isHovered ? 28 : isCurrent ? 25 : 22}
                    fill={isUnlocked ? region.color : '#374151'}
                    stroke={isCurrent ? '#fbbf24' : isUnlocked ? '#ffffff' : '#6b7280'}
                    strokeWidth={isCurrent ? 4 : 3}
                    className={`transition-all duration-300 cursor-pointer ${
                      isUnlocked ? 'hover:scale-110' : 'opacity-60'
                    }`}
                    onClick={() => isUnlocked && onRegionSelect(region.id)}
                    onMouseEnter={() => setHoveredRegion(region.id)}
                    onMouseLeave={() => setHoveredRegion(null)}
                    filter={isUnlocked ? "url(#glow)" : undefined}
                  />
                  
                  {/* Region Icon */}
                  <foreignObject
                    x={region.position.x - 10}
                    y={region.position.y - 10}
                    width="20"
                    height="20"
                    className="pointer-events-none"
                  >
                    <div className="flex items-center justify-center text-white">
                      {isUnlocked ? region.icon : <Lock className="w-4 h-4" />}
                    </div>
                  </foreignObject>

                  {/* Enhanced Region Label */}
                  <text
                    x={region.position.x}
                    y={region.position.y + 45}
                    textAnchor="middle"
                    className="fill-white text-sm font-bold font-cinzel pointer-events-none"
                    style={{ 
                      filter: 'drop-shadow(2px 2px 2px rgba(0,0,0,0.8))',
                      letterSpacing: '0.5px'
                    }}
                  >
                    {region.name}
                  </text>
                  
                  {/* Level Range with styling */}
                  <text
                    x={region.position.x}
                    y={region.position.y + 60}
                    textAnchor="middle"
                    className="fill-gray-200 text-xs font-medieval pointer-events-none"
                    style={{ filter: 'drop-shadow(1px 1px 1px rgba(0,0,0,0.8))' }}
                  >
                    Level {region.minLevel}-{region.maxLevel}
                  </text>

                  {/* Quest Count Indicator */}
                  {isUnlocked && (
                    <g>
                      <circle
                        cx={region.position.x + 20}
                        cy={region.position.y - 20}
                        r="8"
                        fill="#1f2937"
                        stroke="#fbbf24"
                        strokeWidth="2"
                      />
                      <text
                        x={region.position.x + 20}
                        y={region.position.y - 16}
                        textAnchor="middle"
                        className="fill-yellow-300 text-xs font-bold pointer-events-none"
                      >
                        {region.questCount}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}

            {/* Enhanced Character Avatar */}
            <g>
              {/* Character Trail/Footprints */}
              <path
                d={generatePath()}
                stroke={character.avatar.color}
                strokeWidth="3"
                fill="none"
                strokeDasharray="5,10"
                opacity="0.3"
                pathLength="1"
                strokeDashoffset="1"
                className="animate-pulse"
              />
              
              {/* Character Shadow */}
              <ellipse
                cx={characterPosition.x}
                cy={characterPosition.y + 8}
                rx="8"
                ry="4"
                fill="rgba(0,0,0,0.3)"
              />
              
              {/* Character Base */}
              <circle
                cx={characterPosition.x}
                cy={characterPosition.y}
                r="15"
                fill={character.avatar.color}
                stroke="#fbbf24"
                strokeWidth="4"
                className="animate-bounce"
                filter="url(#characterGlow)"
                style={{ animationDuration: '2s' }}
              />
              
              {/* Character Class Emoji */}
              <foreignObject
                x={characterPosition.x - 12}
                y={characterPosition.y - 12}
                width="24"
                height="24"
                className="pointer-events-none"
              >
                <div className="flex items-center justify-center text-lg">
                  {character.class === 'warrior' ? '⚔️' :
                   character.class === 'mage' ? '🔮' :
                   character.class === 'rogue' ? '🎯' : '🛡️'}
                </div>
              </foreignObject>

              {/* Character Name Banner */}
              <rect
                x={characterPosition.x - 25}
                y={characterPosition.y - 35}
                width="50"
                height="12"
                fill="rgba(0,0,0,0.8)"
                rx="6"
                stroke="#fbbf24"
                strokeWidth="1"
              />
              <text
                x={characterPosition.x}
                y={characterPosition.y - 27}
                textAnchor="middle"
                className="fill-yellow-300 text-xs font-bold font-cinzel pointer-events-none"
              >
                {character.name}
              </text>

              {/* Level Crown */}
              <foreignObject
                x={characterPosition.x - 6}
                y={characterPosition.y - 45}
                width="12"
                height="12"
                className="pointer-events-none"
              >
                <div className="flex items-center justify-center text-yellow-400">
                  <Crown className="w-3 h-3" />
                </div>
              </foreignObject>
            </g>
          </svg>
        </div>

        {/* Enhanced Region Lore Panel */}
        {hoveredRegion && (
          <div className="absolute bottom-4 left-4 right-4 bg-gradient-to-r from-black/90 to-black/80 backdrop-blur-sm rounded-xl p-4 border border-white/30 shadow-2xl">
            {(() => {
              const region = MAP_REGIONS.find(r => r.id === hoveredRegion);
              if (!region) return null;
              
              const isUnlocked = isRegionUnlocked(region);
              
              return (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-white shadow-lg bg-gradient-to-br ${region.bgGradient}`}
                      >
                        {isUnlocked ? region.icon : <Lock className="w-5 h-5" />}
                      </div>
                      <div>
                        <h4 className="text-white font-bold text-lg font-cinzel">{region.name}</h4>
                        <p className="text-gray-300 text-sm">{region.description}</p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-white text-sm font-medium">
                        {isUnlocked ? (
                          <Badge className="bg-green-600/20 text-green-200 border-green-500/30">
                            <Eye className="w-3 h-3 mr-1" />
                            {region.questCount} Quests
                          </Badge>
                        ) : (
                          <Badge className="bg-red-600/20 text-red-200 border-red-500/30">
                            <Lock className="w-3 h-3 mr-1" />
                            Locked
                          </Badge>
                        )}
                      </div>
                      <div className="text-gray-400 text-xs mt-1 font-medieval">
                        Requires Level {region.minLevel}+
                      </div>
                    </div>
                  </div>
                  
                  {isUnlocked && (
                    <div className="pt-2 border-t border-white/20">
                      <p className="text-blue-200 text-sm italic font-medieval leading-relaxed">
                        "{region.lore}"
                      </p>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}

        {/* Mobile Instructions */}
        <div className="absolute bottom-2 right-2 text-xs text-gray-400 md:hidden">
          <Sparkles className="w-3 h-3 inline mr-1" />
          Pinch to zoom • Tap regions to explore
        </div>
      </CardContent>
    </Card>
  );
}