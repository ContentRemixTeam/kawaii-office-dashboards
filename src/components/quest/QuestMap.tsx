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
  Home
} from 'lucide-react';
import { Character } from './CharacterCreation';

interface MapRegion {
  id: string;
  name: string;
  minLevel: number;
  maxLevel: number;
  description: string;
  icon: React.ReactNode;
  color: string;
  position: { x: number; y: number };
  questCount: number;
  completedQuests?: number;
}

interface QuestMapProps {
  character: Character;
  onRegionSelect: (regionId: string) => void;
  selectedRegion?: string;
}

const MAP_REGIONS: MapRegion[] = [
  {
    id: 'starting-village',
    name: 'Starting Village',
    minLevel: 1,
    maxLevel: 5,
    description: 'A peaceful place to begin your productivity adventure',
    icon: <Home className="w-4 h-4" />,
    color: '#10b981',
    position: { x: 100, y: 350 },
    questCount: 8,
    completedQuests: 0
  },
  {
    id: 'enchanted-forest',
    name: 'Enchanted Forest',
    minLevel: 6,
    maxLevel: 10,
    description: 'Mystical woods where focus magic grows stronger',
    icon: <TreePine className="w-4 h-4" />,
    color: '#059669',
    position: { x: 250, y: 280 },
    questCount: 12,
    completedQuests: 0
  },
  {
    id: 'mountain-peak',
    name: 'Mountain Peak',
    minLevel: 11,
    maxLevel: 15,
    description: 'Scale great heights of productivity mastery',
    icon: <Mountain className="w-4 h-4" />,
    color: '#7c3aed',
    position: { x: 400, y: 200 },
    questCount: 15,
    completedQuests: 0
  },
  {
    id: 'crystal-caves',
    name: 'Crystal Caves',
    minLevel: 16,
    maxLevel: 20,
    description: 'Deep caverns of concentrated wisdom and power',
    icon: <Gem className="w-4 h-4" />,
    color: '#0ea5e9',
    position: { x: 520, y: 300 },
    questCount: 18,
    completedQuests: 0
  },
  {
    id: 'sky-castle',
    name: 'Sky Castle',
    minLevel: 21,
    maxLevel: 99,
    description: 'The ultimate realm of productivity legends',
    icon: <Castle className="w-4 h-4" />,
    color: '#f59e0b',
    position: { x: 650, y: 150 },
    questCount: 25,
    completedQuests: 0
  }
];

export default function QuestMap({ character, onRegionSelect, selectedRegion }: QuestMapProps) {
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const mapRef = useRef<SVGSVGElement>(null);

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
    setScale(prev => Math.min(prev + 0.2, 2));
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
    const points = MAP_REGIONS.map(region => `${region.position.x},${region.position.y}`).join(' ');
    return `M ${points}`;
  };

  const getCharacterPosition = () => {
    const currentRegion = getCurrentRegion();
    const nextRegion = MAP_REGIONS[MAP_REGIONS.findIndex(r => r.id === currentRegion.id) + 1];
    
    if (!nextRegion || character.level <= currentRegion.maxLevel) {
      const progress = getCharacterProgress();
      return {
        x: currentRegion.position.x + (progress * 20),
        y: currentRegion.position.y - (progress * 10)
      };
    }
    
    return currentRegion.position;
  };

  const characterPosition = getCharacterPosition();

  return (
    <Card className="bg-black/40 border-purple-500/30 backdrop-blur-sm">
      <CardContent className="p-0 relative overflow-hidden">
        {/* Map Controls */}
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
          <Button
            onClick={handleZoomIn}
            size="sm"
            className="bg-black/50 backdrop-blur-sm border-white/20 text-white hover:bg-black/70"
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button
            onClick={handleZoomOut}
            size="sm"
            className="bg-black/50 backdrop-blur-sm border-white/20 text-white hover:bg-black/70"
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
        </div>

        {/* Character Info Overlay */}
        <div className="absolute top-4 left-4 z-10">
          <Badge className="bg-black/70 backdrop-blur-sm text-white border-white/20">
            <Crown className="w-3 h-3 mr-1" />
            Level {character.level} • {getCurrentRegion().name}
          </Badge>
        </div>

        {/* Interactive Map */}
        <div className="h-96 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-indigo-900/20 relative">
          <svg
            ref={mapRef}
            width="100%"
            height="100%"
            viewBox="0 0 800 400"
            className="cursor-move"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{
              transform: `scale(${scale}) translate(${offset.x}px, ${offset.y}px)`
            }}
          >
            {/* Background Elements */}
            <defs>
              <radialGradient id="mapBg" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#1e1b4b" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#312e81" stopOpacity="0.1" />
              </radialGradient>
              
              {/* Glow effects for unlocked regions */}
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge> 
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            
            <rect width="100%" height="100%" fill="url(#mapBg)" />
            
            {/* Adventure Path */}
            <path
              d={generatePath()}
              stroke="url(#pathGradient)"
              strokeWidth="4"
              fill="none"
              strokeDasharray="8,4"
              className="animate-pulse"
            />
            
            <defs>
              <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="25%" stopColor="#059669" />
                <stop offset="50%" stopColor="#7c3aed" />
                <stop offset="75%" stopColor="#0ea5e9" />
                <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>
            </defs>

            {/* Map Regions */}
            {MAP_REGIONS.map((region, index) => {
              const isUnlocked = isRegionUnlocked(region);
              const isSelected = selectedRegion === region.id;
              const isCurrent = getCurrentRegion().id === region.id;
              
              return (
                <g key={region.id}>
                  {/* Region Circle */}
                  <circle
                    cx={region.position.x}
                    cy={region.position.y}
                    r={isSelected ? 25 : 20}
                    fill={isUnlocked ? region.color : '#374151'}
                    stroke={isCurrent ? '#fbbf24' : isUnlocked ? '#ffffff' : '#6b7280'}
                    strokeWidth={isCurrent ? 3 : 2}
                    className={`transition-all duration-300 cursor-pointer ${
                      isUnlocked ? 'hover:scale-110' : 'opacity-50'
                    } ${isUnlocked ? 'filter: drop-shadow(0 0 6px ' + region.color + ')' : ''}`}
                    onClick={() => isUnlocked && onRegionSelect(region.id)}
                    filter={isUnlocked ? "url(#glow)" : undefined}
                  />
                  
                  {/* Region Icon */}
                  <foreignObject
                    x={region.position.x - 8}
                    y={region.position.y - 8}
                    width="16"
                    height="16"
                    className="pointer-events-none"
                  >
                    <div className="flex items-center justify-center text-white">
                      {isUnlocked ? region.icon : <Lock className="w-3 h-3" />}
                    </div>
                  </foreignObject>

                  {/* Region Label */}
                  <text
                    x={region.position.x}
                    y={region.position.y + 35}
                    textAnchor="middle"
                    className="fill-white text-xs font-medium pointer-events-none"
                    style={{ filter: 'drop-shadow(1px 1px 1px rgba(0,0,0,0.8))' }}
                  >
                    {region.name}
                  </text>
                  
                  {/* Level Range */}
                  <text
                    x={region.position.x}
                    y={region.position.y + 48}
                    textAnchor="middle"
                    className="fill-gray-300 text-xs pointer-events-none"
                    style={{ filter: 'drop-shadow(1px 1px 1px rgba(0,0,0,0.8))' }}
                  >
                    Lv. {region.minLevel}-{region.maxLevel}
                  </text>
                </g>
              );
            })}

            {/* Character Avatar */}
            <g>
              <circle
                cx={characterPosition.x}
                cy={characterPosition.y}
                r="12"
                fill={character.avatar.color}
                stroke="#fbbf24"
                strokeWidth="3"
                className="animate-bounce"
                style={{ filter: 'drop-shadow(0 0 8px #fbbf24)' }}
              />
              
              {/* Character Class Emoji */}
              <foreignObject
                x={characterPosition.x - 8}
                y={characterPosition.y - 8}
                width="16"
                height="16"
                className="pointer-events-none"
              >
                <div className="flex items-center justify-center text-sm">
                  {character.class === 'warrior' ? '⚔️' :
                   character.class === 'mage' ? '🔮' :
                   character.class === 'rogue' ? '🎯' : '🛡️'}
                </div>
              </foreignObject>

              {/* Character Name */}
              <text
                x={characterPosition.x}
                y={characterPosition.y - 20}
                textAnchor="middle"
                className="fill-yellow-300 text-xs font-bold pointer-events-none"
                style={{ filter: 'drop-shadow(1px 1px 1px rgba(0,0,0,0.8))' }}
              >
                {character.name}
              </text>
            </g>

            {/* Progress Indicators */}
            {MAP_REGIONS.map((region, index) => {
              const isUnlocked = isRegionUnlocked(region);
              const nextRegion = MAP_REGIONS[index + 1];
              
              if (!nextRegion || !isUnlocked) return null;

              const isNextUnlocked = isRegionUnlocked(nextRegion);
              
              return (
                <line
                  key={`progress-${region.id}`}
                  x1={region.position.x}
                  y1={region.position.y}
                  x2={nextRegion.position.x}
                  y2={nextRegion.position.y}
                  stroke={isNextUnlocked ? '#10b981' : '#374151'}
                  strokeWidth="3"
                  strokeDasharray={isNextUnlocked ? '0' : '5,5'}
                  opacity={isNextUnlocked ? 1 : 0.5}
                />
              );
            })}
          </svg>
        </div>

        {/* Region Details Panel */}
        {selectedRegion && (
          <div className="absolute bottom-4 left-4 right-4 bg-black/80 backdrop-blur-sm rounded-lg p-4 border border-white/20">
            {(() => {
              const region = MAP_REGIONS.find(r => r.id === selectedRegion);
              if (!region) return null;
              
              const isUnlocked = isRegionUnlocked(region);
              
              return (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                      style={{ backgroundColor: isUnlocked ? region.color : '#374151' }}
                    >
                      {isUnlocked ? region.icon : <Lock className="w-4 h-4" />}
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-sm">{region.name}</h4>
                      <p className="text-gray-300 text-xs">{region.description}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-white text-sm font-medium">
                      {isUnlocked ? `${region.questCount} Quests Available` : 'Locked'}
                    </div>
                    <div className="text-gray-400 text-xs">
                      Level {region.minLevel}-{region.maxLevel} Required
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* Mobile Instructions */}
        <div className="absolute bottom-2 right-2 text-xs text-gray-400 md:hidden">
          Pinch to zoom • Tap regions to explore
        </div>
      </CardContent>
    </Card>
  );
}