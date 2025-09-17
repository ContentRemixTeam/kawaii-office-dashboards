import React from "react";
import { writeTodayIntention, readTodayIntention } from "@/lib/dailyFlow";
import { emitChanged } from "@/lib/bus";
import { addFutureNote } from "@/lib/futureNotes";
import { setBigThreeTasks, getBigThreeTasks } from "@/lib/bigThreeTasks";
import { setPetTasks, getPetTasks } from "@/lib/petTasks";
import focusTimer from "@/lib/focusTimer";
import { log } from "@/lib/log";

export default function DailyIntentionModal({ open, onClose }:{
  open:boolean; onClose: ()=>void;
}){
  const [feel, setFeel]   = React.useState("");
  const [focus, setFocus] = React.useState("");
  const [top1, setTop1]   = React.useState("");
  const [top2, setTop2]   = React.useState("");
  const [top3, setTop3]   = React.useState("");
  const [first1, setFirst1] = React.useState("");
  const [first2, setFirst2] = React.useState("");
  const [first3, setFirst3] = React.useState("");
  const [notes,setNotes]  = React.useState("");
  const [futureNote, setFutureNote] = React.useState("");
  const [totalHours, setTotalHours] = React.useState(8);
  const [pomodoroBlocks, setPomodoroBlocks] = React.useState(4);
  const [pomodoroLength, setPomodoroLength] = React.useState(25);

  // Load existing intention data when modal opens
  React.useEffect(() => {
    if (open) {
      log.info(`DailyIntentionModal opened, loading existing data`);
      
      // Load existing intention if it exists
      const existingIntention = readTodayIntention();
      if (existingIntention) {
        setFeel(existingIntention.feel || "");
        setFocus(existingIntention.focus || "");
        setTop1(existingIntention.top3?.[0] || "");
        setTop2(existingIntention.top3?.[1] || "");
        setTop3(existingIntention.top3?.[2] || "");
        setFirst1(existingIntention.first3?.[0] || "");
        setFirst2(existingIntention.first3?.[1] || "");
        setFirst3(existingIntention.first3?.[2] || "");
        setNotes(existingIntention.notes || "");
        setTotalHours(existingIntention.workSessionPlan?.totalHours || 8);
        setPomodoroBlocks(existingIntention.workSessionPlan?.pomodoroBlocks || 4);
        setPomodoroLength(existingIntention.workSessionPlan?.pomodoroLength || 25);
      } else {
        // Load from current tasks if no intention exists
        const currentBigThree = getBigThreeTasks();
        setTop1(currentBigThree[0]?.title || "");
        setTop2(currentBigThree[1]?.title || "");
        setTop3(currentBigThree[2]?.title || "");
        
        const currentPetTasks = getPetTasks();
        setFirst1(currentPetTasks[0]?.title || "");
        setFirst2(currentPetTasks[1]?.title || "");
        setFirst3(currentPetTasks[2]?.title || "");
      }
    } else {
      // Reset form when modal closes
      setFeel("");
      setFocus("");
      setTop1("");
      setTop2("");
      setTop3("");
      setFirst1("");
      setFirst2("");
      setFirst3("");
      setNotes("");
      setFutureNote("");
      setTotalHours(8);
      setPomodoroBlocks(4);
      setPomodoroLength(25);
    }
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
          <div>
            <label className="text-sm text-muted-foreground block mb-2">⭐ The Big Three (most important)</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <input 
                  value={top1} 
                  onChange={e=>setTop1(e.target.value)} 
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" 
                  placeholder="Important task 1"
                />
              </div>
              <div>
                <input 
                  value={top2} 
                  onChange={e=>setTop2(e.target.value)} 
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" 
                  placeholder="Important task 2"
                />
              </div>
              <div>
                <input 
                  value={top3} 
                  onChange={e=>setTop3(e.target.value)} 
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" 
                  placeholder="Important task 3"
                />
              </div>
            </div>
          </div>
          <div>
            <label className="text-sm text-muted-foreground block mb-2">🎯 First Three Tasks (to tackle first)</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <input 
                  value={first1} 
                  onChange={e=>setFirst1(e.target.value)} 
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" 
                  placeholder="First task"
                />
              </div>
              <div>
                <input 
                  value={first2} 
                  onChange={e=>setFirst2(e.target.value)} 
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" 
                  placeholder="Second task"
                />
              </div>
              <div>
                <input 
                  value={first3} 
                  onChange={e=>setFirst3(e.target.value)} 
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" 
                  placeholder="Third task"
                />
              </div>
            </div>
          </div>
          
          {/* Work Session Planning Section */}
          <div className="bg-muted/20 rounded-xl p-4 border border-border/10">
            <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
              ⏰ Today's Work Session Plan
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Total work hours</label>
                <input 
                  type="number"
                  min="1"
                  max="16"
                  value={totalHours} 
                  onChange={e=>setTotalHours(parseInt(e.target.value) || 8)} 
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" 
                  placeholder="8" 
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Pomodoro blocks</label>
                <input 
                  type="number"
                  min="1"
                  max="20"
                  value={pomodoroBlocks} 
                  onChange={e=>setPomodoroBlocks(parseInt(e.target.value) || 4)} 
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" 
                  placeholder="4" 
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Session length (min)</label>
                <input 
                  type="number"
                  min="10"
                  max="90"
                  step="5"
                  value={pomodoroLength} 
                  onChange={e=>setPomodoroLength(parseInt(e.target.value) || 25)} 
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" 
                  placeholder="25" 
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Plan: {pomodoroBlocks} sessions × {pomodoroLength} min = {Math.round(pomodoroBlocks * pomodoroLength / 60 * 10) / 10}h focused work
            </p>
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
                log.info("Saving daily intention", { feel, focus, top1, top2, top3, first1, first2, first3, totalHours, pomodoroBlocks, pomodoroLength });
                const payload = { 
                  feel, 
                  focus, 
                  top3: [top1, top2, top3].filter(Boolean), 
                  first3: [first1, first2, first3].filter(Boolean),
                  notes,
                  workSessionPlan: {
                    totalHours,
                    pomodoroBlocks,
                    pomodoroLength
                  }
                };
                writeTodayIntention(payload);
                
                // Save Big Three tasks to separate system
                setBigThreeTasks(top1, top2, top3);
                
                // Save Pet tasks to separate system
                setPetTasks(first1, first2, first3);
                
                // Apply work session plan to focus timer
                if (pomodoroBlocks > 0) {
                  focusTimer.setDailyGoal(pomodoroBlocks);
                }
                if (pomodoroLength >= 10 && pomodoroLength <= 90) {
                  focusTimer.updateConfig({ focusMin: pomodoroLength });
                }
                
                if (futureNote.trim()) { 
                  addFutureNote(futureNote.trim()); 
                }
                emitChanged(["fm_daily_intention_v1", "fm_future_notes_v1", "fm_big_three_v1", "fm_pet_tasks_v1"]);
                log.info("Daily intention saved successfully");
                onClose();
              } catch (error) {
                log.error("Error saving daily intention:", error);
              }
            }}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            disabled={!feel && !focus && !top1 && !first1}
          >
            Save & start day
          </button>
        </div>
      </div>
    </div>
  );
}