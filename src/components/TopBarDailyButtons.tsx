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
      <div className="hidden md:flex items-center gap-1 text-xs text-muted-foreground ml-2">
        <label>Sign-off</label>
        <input 
          defaultValue={f.prefs.signoffTime} 
          onBlur={e=>f.setSignoffTime(e.currentTarget.value)}
          className="w-20 rounded-md border border-input bg-background px-2 py-1 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" 
          type="time" 
        />
        <label className="flex items-center gap-1 ml-2">
          <input 
            type="checkbox" 
            defaultChecked={f.prefs.autoPrompt} 
            onChange={e=>f.setAutoPrompt(e.currentTarget.checked)}
            className="rounded border-input"
          />
          Auto
        </label>
      </div>
    </div>
  );
}