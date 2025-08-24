import React from "react";
import useDailyFlow from "@/hooks/useDailyFlow";

export default function TopBarDailyButtons(){
  const f = useDailyFlow();
  return (
    <div className="flex items-center gap-2">
      <button 
        onClick={()=> f.setShowIntention(true)} 
        className="rounded-xl border border-border bg-card/80 backdrop-blur px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
      >
        ✨ Intention
      </button>
      <button 
        onClick={()=> f.setShowDebrief(true)} 
        className="rounded-xl border border-border bg-card/80 backdrop-blur px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
      >
        🌙 Debrief
      </button>
    </div>
  );
}