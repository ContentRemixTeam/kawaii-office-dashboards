import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const KEY = "fm_energy_v1";
const todayISO = () => new Date().toISOString().slice(0,10);

type ObjShape = { date?: string; word?: string; pinned?: boolean; recent?: {date:string; word:string}[] };

export default function GlobalEnergyWordBadge() {
  const [state, setState] = useState<{word?:string; pinned?:boolean; date?:string}>({});
  const navigate = useNavigate();

  const load = () => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return;
      const data = JSON.parse(raw) as ObjShape;
      
      // Try object first
      let date = data.date;
      let word = data.word;
      
      // or most recent from history array
      if ((!date || !word) && Array.isArray(data.recent) && data.recent.length) {
        const latest = data.recent[0];
        date = latest?.date;
        word = latest?.word;
      }
      
      setState({ word, date, pinned: data.pinned });
    } catch (error) {
      console.debug('Error loading energy word:', error);
    }
  };

  useEffect(() => {
    load();
    
    const onStorage = (e: StorageEvent) => { 
      if (e.key === KEY) load(); 
    };
    
    // Listen for custom events for same-tab updates
    const onEnergyUpdate = () => load();
    
    window.addEventListener("storage", onStorage);
    window.addEventListener("energyWordUpdated", onEnergyUpdate);
    
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("energyWordUpdated", onEnergyUpdate);
    };
  }, []);

  const isToday = state.date === todayISO();
  const pinned = state.pinned !== false; // default true
  const show = Boolean(state.word) && isToday && pinned;
  
  if (!show) return null;

  const handleHide = (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const raw = localStorage.getItem(KEY);
      const data = raw ? JSON.parse(raw) as ObjShape : {};
      (data as any).pinned = false;
      localStorage.setItem(KEY, JSON.stringify(data));
      
      // Dispatch custom event for same-tab updates
      window.dispatchEvent(new CustomEvent('energyWordUpdated'));
    } catch (error) {
      console.debug('Error hiding energy word:', error);
    }
    setState(s => ({ ...s, pinned: false }));
  };

  const handleClick = () => {
    navigate("/tools/energy");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      navigate("/tools/energy");
    }
  };

  return (
    <div
      className="fixed z-50 right-4 bottom-4 max-w-[80vw] cursor-pointer select-none"
      role="button"
      aria-label={`Today's energy word is ${state.word}. Click to open Energy tool.`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div className="relative flex items-center gap-2 rounded-full px-3 py-2 shadow-lg backdrop-blur bg-gradient-to-r from-pink-200/90 to-emerald-200/90 dark:from-pink-300/90 dark:to-emerald-300/90 text-pink-900 dark:text-pink-800 border border-pink-300/50 dark:border-pink-400/50">
        <span aria-hidden className="text-sm animate-pulse">✨</span>
        <span className="font-semibold text-sm">{state.word}</span>
        <button
          aria-label="Hide today's energy word"
          className="ml-1 w-4 h-4 rounded-full bg-pink-400/50 hover:bg-pink-500/70 dark:bg-pink-500/50 dark:hover:bg-pink-600/70 flex items-center justify-center transition-colors text-pink-800 dark:text-pink-900 text-xs font-bold"
          onClick={handleHide}
        >
          ×
        </button>
      </div>
    </div>
  );
}