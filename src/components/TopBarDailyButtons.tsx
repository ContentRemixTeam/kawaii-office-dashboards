import React, { useCallback } from "react";
import useDailyFlow from "@/hooks/useDailyFlow";

export default function TopBarDailyButtons() {
  const flow = useDailyFlow();
  
  // Use useCallback to create stable event handlers
  const handleIntentionClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('=== INTENTION BUTTON CLICKED ===');
    console.log('Flow object:', flow);
    console.log('Current showIntention:', flow.showIntention);
    flow.setShowIntention(true);
    console.log('After setShowIntention(true)');
  }, [flow]);

  const handleDebriefClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('=== DEBRIEF BUTTON CLICKED ===');
    flow.setShowDebrief(true);
  }, [flow]);

  return (
    <div className="flex items-center gap-2">
      <button 
        type="button"
        onClick={handleIntentionClick}
        onMouseDown={() => console.log('INTENTION MOUSE DOWN')}
        onMouseUp={() => console.log('INTENTION MOUSE UP')}
        className="rounded-xl border border-border bg-card/80 backdrop-blur px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
      >
        ✨ Intention
      </button>
      
      <button 
        type="button"
        onClick={handleDebriefClick}
        className="rounded-xl border border-border bg-card/80 backdrop-blur px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
      >
        🌙 Debrief
      </button>
    </div>
  );
}