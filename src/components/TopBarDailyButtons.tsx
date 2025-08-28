import React from "react";
import useDailyFlow from "@/hooks/useDailyFlow";
import { log } from "@/lib/log";

export default function TopBarDailyButtons(){
  const f = useDailyFlow();
  
  const handleIntentionClick = () => {
    log.info("Intention button clicked, setting showIntention to true");
    console.log("Current flow state:", f);
    f.setShowIntention(true);
  };
  
  const handleDebriefClick = () => {
    log.info("Debrief button clicked, setting showDebrief to true");
    console.log("Current flow state:", f);
    f.setShowDebrief(true);
  };
  
  return (
    <div className="flex items-center gap-2">
      <button 
        onClick={handleIntentionClick}
        className="rounded-xl border border-border bg-card/80 backdrop-blur px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
      >
        ✨ Intention
      </button>
      <button 
        onClick={handleDebriefClick}
        className="rounded-xl border border-border bg-card/80 backdrop-blur px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
      >
        🌙 Debrief
      </button>
    </div>
  );
}