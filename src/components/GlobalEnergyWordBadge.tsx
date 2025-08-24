import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";

interface EnergyData {
  date: string;
  word: string;
  pinned?: boolean;
  position?: { x: number; y: number };
}

const STORAGE_KEY = "fm_energy_v1";

const isToday = (dateISO: string): boolean => {
  const today = new Date().toISOString().slice(0, 10);
  return dateISO === today;
};

export default function GlobalEnergyWordBadge() {
  const [energyData, setEnergyData] = useState<EnergyData | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const loadEnergyData = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;

      const data = JSON.parse(raw) as EnergyData;
      if (data.date && data.word && isToday(data.date) && data.pinned !== false) {
        setEnergyData(data);
        setPosition(data.position || null);
      } else {
        setEnergyData(null);
      }
    } catch (error) {
      console.error('Error loading energy data:', error);
      setEnergyData(null);
    }
  };

  useEffect(() => {
    loadEnergyData();

    // Listen for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        loadEnergyData();
      }
    };

    // Listen for custom events from Energy page
    const handleEnergyUpdate = () => {
      loadEnergyData();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('energyWordUpdated', handleEnergyUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('energyWordUpdated', handleEnergyUpdate);
    };
  }, []);

  const savePosition = (newPosition: { x: number; y: number }) => {
    if (!energyData) return;

    try {
      const updatedData = { ...energyData, position: newPosition };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
      setPosition(newPosition);
    } catch (error) {
      console.error('Error saving position:', error);
    }
  };

  const hideForToday = () => {
    if (!energyData) return;

    try {
      const updatedData = { ...energyData, pinned: false };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
      setEnergyData(null);
      window.dispatchEvent(new CustomEvent('energyWordUpdated'));
    } catch (error) {
      console.error('Error hiding energy word:', error);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!badgeRef.current) return;
    
    const rect = badgeRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    setIsDragging(true);
    e.preventDefault();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !badgeRef.current) return;

    const newX = Math.max(0, Math.min(window.innerWidth - badgeRef.current.offsetWidth, e.clientX - dragOffset.x));
    const newY = Math.max(0, Math.min(window.innerHeight - badgeRef.current.offsetHeight, e.clientY - dragOffset.y));

    setPosition({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    if (isDragging && position) {
      savePosition(position);
    }
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset, position]);

  const handleClick = (e: React.MouseEvent) => {
    if (!isDragging) {
      navigate('/tools/energy');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      navigate('/tools/energy');
    }
  };

  if (!energyData) return null;

  const defaultStyle = position 
    ? { left: `${position.x}px`, top: `${position.y}px` }
    : { right: '16px', bottom: '16px' };

  return (
    <div
      ref={badgeRef}
      className={`fixed z-50 cursor-move select-none ${
        isDragging ? 'cursor-grabbing' : 'cursor-grab hover:cursor-pointer'
      }`}
      style={defaultStyle}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label="Today's Energy Word - Click to open Energy tool"
    >
      <div className="flex items-center gap-2 px-3 py-2 rounded-full shadow-lg backdrop-blur bg-gradient-to-r from-pink-200/90 to-emerald-200/90 dark:from-pink-300/90 dark:to-emerald-300/90 text-pink-900 dark:text-pink-800 border border-pink-300/50 dark:border-pink-400/50">
        <span className="text-sm animate-pulse">✨</span>
        <span className="font-semibold text-sm">{energyData.word}</span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            hideForToday();
          }}
          className="ml-1 w-4 h-4 rounded-full bg-pink-400/50 hover:bg-pink-500/70 dark:bg-pink-500/50 dark:hover:bg-pink-600/70 flex items-center justify-center transition-colors"
          aria-label="Hide energy word for today"
        >
          <X className="w-2.5 h-2.5 text-pink-800 dark:text-pink-900" />
        </button>
      </div>
    </div>
  );
}