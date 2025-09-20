import React from "react";
import useDailyFlow from "@/hooks/useDailyFlow";
import { log } from "@/lib/log";

export default function TopBarDailyButtons(){
  const f = useDailyFlow();
  
  const handleIntentionClick = () => {
    console.log('[BUTTON CLICK] TopBar Intention button clicked at', new Date().toISOString());
    log.info("Intention button clicked, setting showIntention to true");
    console.log("Current flow state BEFORE:", f);
    console.log("showIntention BEFORE:", f.showIntention);
    f.setShowIntention(true);
    console.log("showIntention AFTER call:", f.showIntention);
    
    // Force state verification after a delay
    setTimeout(() => {
      console.log("showIntention state after timeout:", f.showIntention);
    }, 100);
  };
  
  const handleDebriefClick = () => {
    console.log('[BUTTON CLICK] TopBar Debrief button clicked at', new Date().toISOString());
    log.info("Debrief button clicked, setting showDebrief to true");
    console.log("Current flow state:", f);
    console.log("Available functions:", Object.keys(f));
    f.setShowDebrief(true);
  };
  
  return (
    <div className="flex items-center gap-2">
      <button 
        onClick={handleIntentionClick}
        onMouseDown={() => console.log('INTENTION BUTTON MOUSE DOWN')}
        onMouseUp={() => console.log('INTENTION BUTTON MOUSE UP')}
        className="rounded-xl border border-border bg-card/80 backdrop-blur px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer"
        style={{ 
          pointerEvents: 'auto',
          position: 'relative',
          zIndex: 10,
          backgroundColor: 'hsl(var(--background))',
          border: '1px solid hsl(var(--border))',
          color: 'hsl(var(--foreground))'
        }}
      >
        ✨ Intention
      </button>
      <button 
        onClick={handleDebriefClick}
        onMouseDown={() => console.log('DEBRIEF BUTTON MOUSE DOWN')}
        onMouseUp={() => console.log('DEBRIEF BUTTON MOUSE UP')}
        className="rounded-xl border border-border bg-card/80 backdrop-blur px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer"
        style={{ 
          pointerEvents: 'auto',
          position: 'relative',
          zIndex: 10,
          backgroundColor: 'hsl(var(--background))',
          border: '1px solid hsl(var(--border))',
          color: 'hsl(var(--foreground))'
        }}
      >
        🌙 Debrief
      </button>
    </div>
  );
}