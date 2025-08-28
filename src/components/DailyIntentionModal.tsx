import React from "react";
import { writeTodayIntention } from "@/lib/dailyFlow";
import { emitChanged } from "@/lib/bus";
import { addFutureNote } from "@/lib/futureNotes";
import { setBigThreeTasks } from "@/lib/unifiedTasks";
import { log } from "@/lib/log";

export default function DailyIntentionModal({ open, onClose }:{
  open:boolean; onClose: ()=>void;
}){
  const [feel, setFeel]   = React.useState("");
  const [focus, setFocus] = React.useState("");
  const [top1, setTop1]   = React.useState("");
  const [top2, setTop2]   = React.useState("");
  const [top3, setTop3]   = React.useState("");
  const [notes,setNotes]  = React.useState("");
  const [futureNote, setFutureNote] = React.useState("");

  // Add logging to track modal state
  React.useEffect(() => {
    log.info(`DailyIntentionModal open state changed: ${open}`);
  }, [open]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm flex items-center justify-center p-4" style={{ zIndex: 9999 }}>
      <div className="w-full max-w-2xl rounded-2xl bg-card shadow-xl border">
        <div className="p-5 border-b border-border">
          <h2 className="text-lg font-semibold text-card-foreground">✨ Set today's intention</h2>
          <p className="text-sm text-muted-foreground">Two minutes to align your day.</p>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="text-sm text-muted-foreground block mb-1">How do I want to feel?</label>
            <input 
              value={feel} 
              onChange={e=>setFeel(e.target.value)} 
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" 
              placeholder="Calm, bold, focused…" 
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground block mb-1">What will I focus on?</label>
            <input 
              value={focus} 
              onChange={e=>setFocus(e.target.value)} 
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" 
              placeholder="One theme or outcome" 
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-sm text-muted-foreground block mb-1">Top task 1</label>
              <input 
                value={top1} 
                onChange={e=>setTop1(e.target.value)} 
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" 
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground block mb-1">Top task 2</label>
              <input 
                value={top2} 
                onChange={e=>setTop2(e.target.value)} 
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" 
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground block mb-1">Top task 3</label>
              <input 
                value={top3} 
                onChange={e=>setTop3(e.target.value)} 
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" 
              />
            </div>
          </div>
          <div>
            <label className="text-sm text-muted-foreground block mb-1">Write a kind note to Future You (optional)</label>
            <textarea 
              value={futureNote}
              onChange={e => setFutureNote(e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              rows={2}
              placeholder="What do you want Future You to remember later today?"
              maxLength={200}
            />
            <div className="mt-1 text-xs text-muted-foreground">{futureNote.length}/200</div>
          </div>
          <div>
            <label className="text-sm text-muted-foreground block mb-1">Notes (optional)</label>
            <textarea 
              value={notes} 
              onChange={e=>setNotes(e.target.value)} 
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" 
              rows={3} 
            />
          </div>
        </div>
        <div className="p-5 border-t border-border flex items-center justify-end gap-2">
          <button 
            onClick={onClose} 
            className="px-4 py-2 rounded-lg border border-input bg-background hover:bg-accent hover:text-accent-foreground"
          >
            Skip
          </button>
          <button
            onClick={()=>{
              try {
                log.info("Saving daily intention", { feel, focus, top1, top2, top3 });
                const payload = { feel, focus, top3:[top1,top2,top3].filter(Boolean), notes };
                writeTodayIntention(payload);
                
                // Save Big Three tasks to unified system
                setBigThreeTasks(top1, top2, top3);
                
                if (futureNote.trim()) { 
                  addFutureNote(futureNote.trim()); 
                }
                emitChanged(["fm_daily_intention_v1", "fm_future_notes_v1", "fm_unified_tasks_v1"]);
                log.info("Daily intention saved successfully");
                onClose();
              } catch (error) {
                log.error("Error saving daily intention:", error);
              }
            }}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            disabled={!feel && !focus && !top1}
          >
            Save & start day
          </button>
        </div>
      </div>
    </div>
  );
}