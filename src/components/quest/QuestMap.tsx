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
  Eye,
  Compass
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
    position: { x: 150, y: 320 },
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
    position: { x: 320, y: 280 },
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
    position: { x: 490, y: 200 },
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
    position: { x: 620, y: 300 },
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
    position: { x: 750, y: 150 },
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
  const [timeOfDay, setTimeOfDay] = useState(0); // 0-1 cycle for day/night
  const mapRef = useRef<SVGSVGElement>(null);

  // Animation cycle for environmental effects
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationPhase(prev => (prev + 1) % 360);
      setTimeOfDay(prev => (prev + 0.002) % 1); // Slow day/night cycle
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

  const generateAdventurePath = () => {
    const pathPoints = [];
    
    for (let i = 0; i < MAP_REGIONS.length; i++) {
      const region = MAP_REGIONS[i];
      pathPoints.push({ x: region.position.x, y: region.position.y });
      
      // Add curve control points for natural path
      if (i < MAP_REGIONS.length - 1) {
        const nextRegion = MAP_REGIONS[i + 1];
        const midX = (region.position.x + nextRegion.position.x) / 2;
        const midY = (region.position.y + nextRegion.position.y) / 2;
        
        // Add some curve variation
        const curveOffset = i % 2 === 0 ? -20 : 20;
        pathPoints.push({ 
          x: midX + curveOffset, 
          y: midY + curveOffset 
        });
      }
    }
    
    let path = `M ${pathPoints[0].x},${pathPoints[0].y}`;
    for (let i = 1; i < pathPoints.length; i++) {
      if (i % 2 === 1) {
        // Control point
        path += ` Q ${pathPoints[i].x},${pathPoints[i].y}`;
      } else {
        // End point
        path += ` ${pathPoints[i].x},${pathPoints[i].y}`;
      }
    }
    
    return path;
  };

  const renderEnvironmentalDetails = (region: MapRegion) => {
    const isUnlocked = isRegionUnlocked(region);
    const details = [];
    
    if (!isUnlocked) {
      // Locked regions show silhouettes
      return (
        <g key={`locked-${region.id}`} opacity="0.3">
          <circle
            cx={region.position.x}
            cy={region.position.y}
            r="40"
            fill="url(#lockedGradient)"
            opacity="0.5"
          />
        </g>
      );
    }

    switch (region.environment) {
      case 'village':
        // Cottages and gardens
        details.push(
          <g key={`village-${region.id}`}>
            {/* Rolling hills background */}
            <path
              d={`M ${region.position.x - 60} ${region.position.y + 20} Q ${region.position.x - 30} ${region.position.y + 10} ${region.position.x} ${region.position.y + 20} Q ${region.position.x + 30} ${region.position.y + 30} ${region.position.x + 60} ${region.position.y + 20}`}
              fill="#4ade80"
              opacity="0.6"
            />
            
            {/* Cottage silhouettes */}
            <rect
              x={region.position.x - 45}
              y={region.position.y + 5}
              width="12"
              height="10"
              fill="#8b4513"
              rx="2"
            />
            <polygon
              points={`${region.position.x - 45},${region.position.y + 5} ${region.position.x - 39},${region.position.y - 2} ${region.position.x - 33},${region.position.y + 5}`}
              fill="#dc2626"
            />
            
            {/* Flowers */}
            {Array.from({ length: 8 }, (_, i) => (
              <circle
                key={`flower-${i}`}
                cx={region.position.x - 30 + (i * 8)}
                cy={region.position.y + 15 + Math.sin(animationPhase * 0.1 + i) * 2}
                r="2"
                fill={['#fbbf24', '#f87171', '#a78bfa', '#34d399'][i % 4]}
                opacity="0.8"
              />
            ))}
            
            {/* Butterflies */}
            <g transform={`translate(${region.position.x + Math.sin(animationPhase * 0.05) * 25}, ${region.position.y - 10 + Math.cos(animationPhase * 0.03) * 15})`}>
              <circle cx="0" cy="0" r="1" fill="#fbbf24" />
              <ellipse cx="-2" cy="-1" rx="2" ry="1" fill="#a78bfa" opacity="0.7" />
              <ellipse cx="2" cy="-1" rx="2" ry="1" fill="#a78bfa" opacity="0.7" />
            </g>
          </g>
        );
        break;
        
      case 'forest':
        // Dense tree canopy and forest creatures
        details.push(
          <g key={`forest-${region.id}`}>
            {/* Tree canopy */}
            <circle cx={region.position.x - 30} cy={region.position.y - 15} r="25" fill="#166534" opacity="0.7" />
            <circle cx={region.position.x + 20} cy={region.position.y - 10} r="20" fill="#15803d" opacity="0.6" />
            <circle cx={region.position.x} cy={region.position.y - 20} r="30" fill="#16a34a" opacity="0.8" />
            
            {/* Tree trunks */}
            <rect x={region.position.x - 3} y={region.position.y + 10} width="6" height="20" fill="#8b4513" />
            <rect x={region.position.x - 33} y={region.position.y + 15} width="4" height="15" fill="#8b4513" />
            
            {/* Fireflies */}
            {Array.from({ length: 12 }, (_, i) => (
              <circle
                key={`firefly-${i}`}
                cx={region.position.x + Math.sin(animationPhase * 0.03 + i) * 35}
                cy={region.position.y + Math.cos(animationPhase * 0.02 + i) * 25}
                r={1.5}
                fill="#facc15"
                opacity={0.6 + Math.sin(animationPhase * 0.1 + i) * 0.4}
              />
            ))}
            
            {/* Forest creatures (owl eyes) */}
            <g opacity="0.7">
              <circle cx={region.position.x - 20} cy={region.position.y - 25} r="2" fill="#fbbf24" />
              <circle cx={region.position.x - 15} cy={region.position.y - 25} r="2" fill="#fbbf24" />
            </g>
            
            {/* Dappled sunlight */}
            <ellipse
              cx={region.position.x + 10}
              cy={region.position.y + 5}
              rx="8"
              ry="4"
              fill="#fbbf24"
              opacity={0.3 + Math.sin(animationPhase * 0.05) * 0.2}
            />
          </g>
        );
        break;
        
      case 'mountain':
        // Rocky peaks and snow
        details.push(
          <g key={`mountain-${region.id}`}>
            {/* Mountain silhouette */}
            <polygon
              points={`${region.position.x - 50},${region.position.y + 30} ${region.position.x - 20},${region.position.y - 40} ${region.position.x},${region.position.y - 50} ${region.position.x + 25},${region.position.y - 35} ${region.position.x + 50},${region.position.y + 30}`}
              fill="#6b7280"
            />
            
            {/* Snow caps */}
            <polygon
              points={`${region.position.x - 15},${region.position.y - 35} ${region.position.x},${region.position.y - 50} ${region.position.x + 15},${region.position.y - 30}`}
              fill="white"
              opacity="0.9"
            />
            
            {/* Rocky details */}
            <circle cx={region.position.x - 25} cy={region.position.y - 10} r="3" fill="#4b5563" />
            <circle cx={region.position.x + 15} cy={region.position.y - 5} r="4" fill="#4b5563" />
            
            {/* Clouds */}
            <ellipse
              cx={region.position.x + Math.sin(animationPhase * 0.01) * 10}
              cy={region.position.y - 60}
              rx="15"
              ry="8"
              fill="white"
              opacity="0.7"
            />
            
            {/* Snow particles */}
            {Array.from({ length: 6 }, (_, i) => (
              <circle
                key={`snow-${i}`}
                cx={region.position.x + Math.sin(animationPhase * 0.02 + i) * 20}
                cy={region.position.y - 30 + (animationPhase + i * 30) % 40}
                r="1"
                fill="white"
                opacity="0.7"
              />
            ))}
            
            {/* Eagle */}
            <g transform={`translate(${region.position.x + Math.sin(animationPhase * 0.01) * 40}, ${region.position.y - 70})`}>
              <path d="M-2,0 L0,-1 L2,0 L0,1 Z" fill="#8b4513" />
              <path d="M-4,-1 L-2,0 L-4,1" fill="none" stroke="#8b4513" strokeWidth="0.5" />
              <path d="M4,-1 L2,0 L4,1" fill="none" stroke="#8b4513" strokeWidth="0.5" />
            </g>
          </g>
        );
        break;
        
      case 'cave':
        // Crystal formations and cave entrance
        details.push(
          <g key={`cave-${region.id}`}>
            {/* Cave entrance */}
            <ellipse
              cx={region.position.x}
              cy={region.position.y + 20}
              rx="25"
              ry="15"
              fill="#1f2937"
            />
            <ellipse
              cx={region.position.x}
              cy={region.position.y + 20}
              rx="20"
              ry="12"
              fill="#111827"
            />
            
            {/* Crystal formations */}
            {Array.from({ length: 8 }, (_, i) => {
              const angle = (i * 45) * Math.PI / 180;
              const distance = 30 + Math.sin(animationPhase * 0.1 + i) * 5;
              return (
                <g key={`crystal-${i}`}>
                  <polygon
                    points={`${region.position.x + Math.cos(angle) * distance},${region.position.y + Math.sin(angle) * distance - 5} ${region.position.x + Math.cos(angle) * distance - 2},${region.position.y + Math.sin(angle) * distance + 5} ${region.position.x + Math.cos(angle) * distance + 2},${region.position.y + Math.sin(angle) * distance + 5}`}
                    fill="#06b6d4"
                    opacity={0.7 + Math.sin(animationPhase * 0.1 + i) * 0.3}
                  />
                  <circle
                    cx={region.position.x + Math.cos(angle) * distance}
                    cy={region.position.y + Math.sin(angle) * distance}
                    r={2 + Math.sin(animationPhase * 0.1 + i) * 1}
                    fill="#67e8f9"
                    opacity={0.8}
                  />
                </g>
              );
            })}
            
            {/* Underground glow */}
            <ellipse
              cx={region.position.x}
              cy={region.position.y + 10}
              rx="35"
              ry="20"
              fill="#0ea5e9"
              opacity={0.2 + Math.sin(animationPhase * 0.05) * 0.1}
            />
            
            {/* Water drops */}
            {Array.from({ length: 3 }, (_, i) => (
              <circle
                key={`drop-${i}`}
                cx={region.position.x - 10 + i * 10}
                cy={region.position.y + 25 + (animationPhase + i * 60) % 20}
                r="0.5"
                fill="#67e8f9"
                opacity="0.6"
              />
            ))}
          </g>
        );
        break;
        
      case 'castle':
        // Floating platforms and celestial elements
        details.push(
          <g key={`castle-${region.id}`}>
            {/* Floating platforms */}
            <ellipse
              cx={region.position.x}
              cy={region.position.y + 20}
              rx="30"
              ry="8"
              fill="#e5e7eb"
              opacity="0.8"
            />
            <ellipse
              cx={region.position.x - 20}
              cy={region.position.y}
              rx="15"
              ry="5"
              fill="#e5e7eb"
              opacity="0.6"
            />
            
            {/* Castle towers */}
            <rect x={region.position.x - 8} y={region.position.y - 25} width="16" height="30" fill="#9ca3af" />
            <rect x={region.position.x - 15} y={region.position.y - 15} width="8" height="20" fill="#9ca3af" />
            <rect x={region.position.x + 7} y={region.position.y - 18} width="8" height="23" fill="#9ca3af" />
            
            {/* Tower tops */}
            <polygon points={`${region.position.x - 8},${region.position.y - 25} ${region.position.x},${region.position.y - 35} ${region.position.x + 8},${region.position.y - 25}`} fill="#fbbf24" />
            
            {/* Star field */}
            {Array.from({ length: 15 }, (_, i) => (
              <g key={`star-${i}`}>
                <circle
                  cx={region.position.x + Math.sin(animationPhase * 0.01 + i) * 60}
                  cy={region.position.y + Math.cos(animationPhase * 0.015 + i) * 40 - 30}
                  r="1"
                  fill="#fbbf24"
                  opacity={0.7 + Math.sin(animationPhase * 0.1 + i) * 0.3}
                />
                <path
                  d={`M ${region.position.x + Math.sin(animationPhase * 0.01 + i) * 60 - 2} ${region.position.y + Math.cos(animationPhase * 0.015 + i) * 40 - 30} L ${region.position.x + Math.sin(animationPhase * 0.01 + i) * 60 + 2} ${region.position.y + Math.cos(animationPhase * 0.015 + i) * 40 - 30} M ${region.position.x + Math.sin(animationPhase * 0.01 + i) * 60} ${region.position.y + Math.cos(animationPhase * 0.015 + i) * 40 - 32} L ${region.position.x + Math.sin(animationPhase * 0.01 + i) * 60} ${region.position.y + Math.cos(animationPhase * 0.015 + i) * 40 - 28}`}
                  stroke="#fbbf24"
                  strokeWidth="0.5"
                  opacity="0.5"
                />
              </g>
            ))}
            
            {/* Aurora effect */}
            <path
              d={`M ${region.position.x - 70} ${region.position.y - 60} Q ${region.position.x - 35} ${region.position.y - 80 + Math.sin(animationPhase * 0.02) * 10} ${region.position.x} ${region.position.y - 60} Q ${region.position.x + 35} ${region.position.y - 80 + Math.sin(animationPhase * 0.02 + Math.PI) * 10} ${region.position.x + 70} ${region.position.y - 60}`}
              stroke="url(#auroraGradient)"
              strokeWidth="3"
              fill="none"
              opacity="0.6"
            />
            
            {/* Rainbow bridge */}
            <path
              d={`M ${region.position.x - 40} ${region.position.y + 15} Q ${region.position.x - 20} ${region.position.y + 5} ${region.position.x} ${region.position.y + 15}`}
              stroke="url(#rainbowGradient)"
              strokeWidth="2"
              fill="none"
              opacity="0.8"
            />
          </g>
        );
        break;
    }
    
    return details;
  };

  const getCharacterPosition = () => {
    const currentRegion = getCurrentRegion();
    const currentIndex = MAP_REGIONS.findIndex(r => r.id === currentRegion.id);
    const nextRegion = MAP_REGIONS[currentIndex + 1];
    
    if (!nextRegion || character.level <= currentRegion.maxLevel) {
      const progress = getCharacterProgress();
      if (nextRegion) {
        // Interpolate between current and next region
        return {
          x: currentRegion.position.x + (nextRegion.position.x - currentRegion.position.x) * progress,
          y: currentRegion.position.y + (nextRegion.position.y - currentRegion.position.y) * progress
        };
      }
      return currentRegion.position;
    }
    
    return currentRegion.position;
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
          <div className="bg-black/70 backdrop-blur-sm border border-white/20 rounded-md p-2">
            <Compass className="w-4 h-4 text-yellow-400" />
          </div>
        </div>

        {/* Character Info Overlay */}
        <div className="absolute top-4 left-4 z-10">
          <Badge className="bg-black/80 backdrop-blur-sm text-white border-white/30 shadow-lg font-cinzel">
            <Crown className="w-3 h-3 mr-1 text-yellow-400" />
            Level {character.level} • {getCurrentRegion().name}
          </Badge>
        </div>

        {/* Interactive Map */}
        <div className="h-[500px] relative overflow-hidden" style={{
          background: `linear-gradient(to bottom, 
            hsl(${220 + timeOfDay * 40}, ${60 + timeOfDay * 20}%, ${20 + timeOfDay * 30}%), 
            hsl(${240 + timeOfDay * 30}, ${50 + timeOfDay * 25}%, ${15 + timeOfDay * 25}%)
          )`
        }}>
          {/* Animated Background Layers - Parallax Effect */}
          <div className="absolute inset-0 opacity-30" style={{
            transform: `translateX(${offset.x * 0.1}px) translateY(${offset.y * 0.1}px)`
          }}>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/10 to-transparent animate-pulse" />
          </div>
          
          <div className="absolute inset-0 opacity-20" style={{
            transform: `translateX(${offset.x * 0.2}px) translateY(${offset.y * 0.2}px)`
          }}>
            {/* Background stars */}
            {Array.from({ length: 50 }, (_, i) => (
              <div
                key={`bg-star-${i}`}
                className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  opacity: 0.3 + Math.random() * 0.4
                }}
              />
            ))}
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
            {/* Enhanced Gradients and Effects */}
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
              
              <linearGradient id="lockedGradient" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#374151" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#1f2937" stopOpacity="0.3" />
              </linearGradient>
              
              <linearGradient id="auroraGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#a78bfa" />
                <stop offset="50%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#fbbf24" />
              </linearGradient>
              
              <linearGradient id="rainbowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ef4444" />
                <stop offset="20%" stopColor="#f97316" />
                <stop offset="40%" stopColor="#eab308" />
                <stop offset="60%" stopColor="#22c55e" />
                <stop offset="80%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
              
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                <feMerge> 
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
              
              <filter id="characterGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
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

            {/* Environmental Details for each region */}
            {MAP_REGIONS.map(region => renderEnvironmentalDetails(region))}

            {/* Enhanced Adventure Path with stepping stones */}
            <path
              d={generateAdventurePath()}
              stroke="url(#pathGradient)"
              strokeWidth="8"
              fill="none"
              opacity="0.8"
              filter="url(#glow)"
            />
            
            {/* Animated path overlay */}
            <path
              d={generateAdventurePath()}
              stroke="white"
              strokeWidth="3"
              fill="none"
              strokeDasharray="15,15"
              strokeDashoffset={animationPhase * 1.5}
              opacity="0.5"
            />

            {/* Path markers and waypoints */}
            {MAP_REGIONS.map((region, index) => {
              if (index === MAP_REGIONS.length - 1) return null;
              const nextRegion = MAP_REGIONS[index + 1];
              const midX = (region.position.x + nextRegion.position.x) / 2;
              const midY = (region.position.y + nextRegion.position.y) / 2;
              
              return (
                <g key={`waypoint-${index}`}>
                  <circle
                    cx={midX}
                    cy={midY}
                    r="4"
                    fill="#fbbf24"
                    stroke="#ffffff"
                    strokeWidth="2"
                    opacity="0.8"
                  />
                  <text
                    x={midX}
                    y={midY - 12}
                    textAnchor="middle"
                    className="fill-white text-xs font-medieval"
                    style={{ filter: 'drop-shadow(1px 1px 1px rgba(0,0,0,0.8))' }}
                  >
                    ⚡
                  </text>
                </g>
              );
            })}

            {/* Enhanced Map Regions */}
            {MAP_REGIONS.map((region, index) => {
              const isUnlocked = isRegionUnlocked(region);
              const isSelected = selectedRegion === region.id;
              const isCurrent = getCurrentRegion().id === region.id;
              const isHovered = hoveredRegion === region.id;
              
              return (
                <g key={region.id}>
                  {/* Region activation circle */}
                  <circle
                    cx={region.position.x}
                    cy={region.position.y}
                    r={isSelected || isHovered ? 35 : isCurrent ? 32 : 28}
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
                    opacity={isUnlocked ? 0.9 : 0.4}
                  />
                  
                  {/* Region Icon */}
                  <foreignObject
                    x={region.position.x - 12}
                    y={region.position.y - 12}
                    width="24"
                    height="24"
                    className="pointer-events-none"
                  >
                    <div className="flex items-center justify-center text-white text-lg">
                      {isUnlocked ? region.icon : <Lock className="w-5 h-5" />}
                    </div>
                  </foreignObject>

                  {/* Enhanced Region Label with background */}
                  <rect
                    x={region.position.x - 40}
                    y={region.position.y + 45}
                    width="80"
                    height="16"
                    fill="rgba(0,0,0,0.7)"
                    rx="8"
                    stroke={region.color}
                    strokeWidth="1"
                    opacity={isHovered ? 1 : 0.8}
                  />
                  <text
                    x={region.position.x}
                    y={region.position.y + 55}
                    textAnchor="middle"
                    className="fill-white text-sm font-bold font-cinzel pointer-events-none"
                  >
                    {region.name}
                  </text>
                  
                  {/* Level Range */}
                  <text
                    x={region.position.x}
                    y={region.position.y + 70}
                    textAnchor="middle"
                    className="fill-gray-300 text-xs font-medieval pointer-events-none"
                  >
                    Lv. {region.minLevel}-{region.maxLevel}
                  </text>

                  {/* Quest Count Badge */}
                  {isUnlocked && (
                    <g>
                      <circle
                        cx={region.position.x + 25}
                        cy={region.position.y - 25}
                        r="10"
                        fill="#1f2937"
                        stroke="#fbbf24"
                        strokeWidth="2"
                      />
                      <text
                        x={region.position.x + 25}
                        y={region.position.y - 20}
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
              {/* Character trail with footprints */}
              <path
                d={generateAdventurePath()}
                stroke={character.avatar.color}
                strokeWidth="4"
                fill="none"
                strokeDasharray="3,8"
                opacity="0.4"
                pathLength="1"
                strokeDashoffset="1"
              />
              
              {/* Character shadow */}
              <ellipse
                cx={characterPosition.x}
                cy={characterPosition.y + 12}
                rx="12"
                ry="6"
                fill="rgba(0,0,0,0.4)"
              />
              
              {/* Character glow aura */}
              <circle
                cx={characterPosition.x}
                cy={characterPosition.y}
                r="25"
                fill={character.avatar.color}
                opacity="0.2"
                filter="url(#characterGlow)"
                className="animate-pulse"
              />
              
              {/* Character base */}
              <circle
                cx={characterPosition.x}
                cy={characterPosition.y}
                r="18"
                fill={character.avatar.color}
                stroke="#fbbf24"
                strokeWidth="4"
                className="animate-bounce"
                style={{ animationDuration: '2s' }}
              />
              
              {/* Character accessories */}
              {character.avatar.accessory === 'crown' && (
                <foreignObject
                  x={characterPosition.x - 8}
                  y={characterPosition.y - 25}
                  width="16"
                  height="16"
                  className="pointer-events-none"
                >
                  <div className="text-yellow-400 text-lg">👑</div>
                </foreignObject>
              )}
              
              {/* Character Class Emoji */}
              <foreignObject
                x={characterPosition.x - 14}
                y={characterPosition.y - 14}
                width="28"
                height="28"
                className="pointer-events-none"
              >
                <div className="flex items-center justify-center text-xl">
                  {character.class === 'warrior' ? '⚔️' :
                   character.class === 'mage' ? '🔮' :
                   character.class === 'rogue' ? '🎯' : '🛡️'}
                </div>
              </foreignObject>

              {/* Character Name Banner */}
              <rect
                x={characterPosition.x - 35}
                y={characterPosition.y - 45}
                width="70"
                height="16"
                fill="rgba(0,0,0,0.9)"
                rx="8"
                stroke="#fbbf24"
                strokeWidth="2"
              />
              <text
                x={characterPosition.x}
                y={characterPosition.y - 32}
                textAnchor="middle"
                className="fill-yellow-300 text-sm font-bold font-cinzel pointer-events-none"
              >
                {character.name}
              </text>

              {/* Level indicator */}
              <circle
                cx={characterPosition.x + 20}
                cy={characterPosition.y - 20}
                r="8"
                fill="#1f2937"
                stroke="#fbbf24"
                strokeWidth="2"
              />
              <text
                x={characterPosition.x + 20}
                y={characterPosition.y - 15}
                textAnchor="middle"
                className="fill-yellow-300 text-xs font-bold pointer-events-none"
              >
                {character.level}
              </text>
            </g>
          </svg>
        </div>

        {/* Enhanced Region Lore Panel with atmospheric styling */}
        {hoveredRegion && (
          <div className="absolute bottom-4 left-4 right-4 bg-gradient-to-r from-black/95 to-black/85 backdrop-blur-md rounded-xl p-6 border-2 border-white/30 shadow-2xl">
            {(() => {
              const region = MAP_REGIONS.find(r => r.id === hoveredRegion);
              if (!region) return null;
              
              const isUnlocked = isRegionUnlocked(region);
              
              return (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div 
                        className={`w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg bg-gradient-to-br ${region.bgGradient} border-2 border-white/30`}
                      >
                        {isUnlocked ? region.icon : <Lock className="w-6 h-6" />}
                      </div>
                      <div>
                        <h4 className="text-white font-bold text-xl font-cinzel tracking-wide">{region.name}</h4>
                        <p className="text-gray-300 text-sm">{region.description}</p>
                      </div>
                    </div>
                    
                    <div className="text-right space-y-2">
                      {isUnlocked ? (
                        <Badge className="bg-green-600/20 text-green-200 border-green-500/30 font-medieval">
                          <Eye className="w-3 h-3 mr-1" />
                          {region.questCount} Quests Available
                        </Badge>
                      ) : (
                        <Badge className="bg-red-600/20 text-red-200 border-red-500/30 font-medieval">
                          <Lock className="w-3 h-3 mr-1" />
                          Requires Level {region.minLevel}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {isUnlocked && (
                    <div className="pt-3 border-t border-white/20">
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
          Tap & drag to explore • Pinch to zoom
        </div>
      </CardContent>
    </Card>
  );
}