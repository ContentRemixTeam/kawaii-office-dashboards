import React, { useState, useEffect } from "react";
import { getTodaySessionLog } from "@/lib/trophySystem";
import { onChanged } from "@/lib/bus";

export default function SessionHistory() {
  const [sessions, setSessions] = useState(getTodaySessionLog());

  useEffect(() => {
    const refresh = () => {
      setSessions(getTodaySessionLog());
    };

    refresh();
    
    return onChanged(keys => {
      if (keys.includes("fm_session_log_v1")) {
        refresh();
      }
    });
  }, []);

  if (sessions.length === 0) return null;

  return (
    <div className="bg-card/50 border border-border/20 rounded-xl p-4">
      <h3 className="font-medium text-sm text-foreground mb-3 flex items-center gap-2">
        📝 Today's Sessions
      </h3>
      
      <div className="space-y-2 max-h-40 overflow-y-auto">
        {sessions.map((session) => {
          const time = new Date(session.completedAt).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          });
          
          return (
            <div 
              key={session.id}
              className="flex items-center justify-between text-xs p-2 bg-background/50 rounded-lg"
            >
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">{time}</span>
                <span className="text-foreground">→</span>
                <span className="text-muted-foreground">
                  Completed {session.duration}m
                </span>
              </div>
              
              <div className="flex items-center gap-1">
                <span>→</span>
                <span className="font-medium">Earned</span>
                <span className="text-sm">{session.trophy.emoji}</span>
                {session.streak > 1 && (
                  <span className="text-orange-600 font-medium">
                    🔥{session.streak}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {sessions.length > 3 && (
        <div className="text-xs text-muted-foreground text-center mt-2">
          {sessions.length} sessions completed today
        </div>
      )}
    </div>
  );
}