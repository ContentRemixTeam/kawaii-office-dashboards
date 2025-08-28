import React from "react";
import { writeTodayDebrief } from "@/lib/dailyFlow";
import { emitChanged } from "@/lib/bus";
import { clearEarnedAnimals } from "@/lib/topbarState";
import { getTodaysNote } from "@/lib/futureNotes";
import { getBigThreeTasks, getCompletionStats } from "@/lib/unifiedTasks";
import DailySummary from "@/components/DailySummary";
import { log } from "@/lib/log";
import { CheckCircle, Star, Trophy } from "lucide-react";

export default function DebriefModal({ open, onClose }:{ open:boolean; onClose:()=>void; }){
  const [w1,setW1]=React.useState("");
  const [w2,setW2]=React.useState("");
  const [w3,setW3]=React.useState("");
  const [reflect,setReflect]=React.useState("");
  const [n1,setN1]=React.useState("");
  const [n2,setN2]=React.useState("");
  const [n3,setN3]=React.useState("");
  
  const todays = getTodaysNote();
  const tasks = getBigThreeTasks();
  const stats = getCompletionStats();

  // Add logging to track modal state
  React.useEffect(() => {
    log.info(`DebriefModal open state changed: ${open}`);
  }, [open]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm flex items-center justify-center p-4" style={{ zIndex: 9999 }}>
      <div className="w-full max-w-2xl rounded-2xl bg-card shadow-xl border">
        {/* Celebration Header */}
        <div className="p-6 border-b border-border bg-gradient-to-r from-primary/10 to-primary/5 rounded-t-2xl">
          <div className="text-center mb-4">
            <div className="text-6xl mb-2 animate-bounce">🎉</div>
            {stats.allCompleted ? (
              <h2 className="text-xl font-bold text-primary mb-1">Amazing! All Tasks Complete!</h2>
            ) : stats.completedCount > 0 ? (
              <h2 className="text-xl font-bold text-primary mb-1">Great Progress Today!</h2>
            ) : (
              <h2 className="text-xl font-bold text-card-foreground mb-1">Time to Reflect</h2>
            )}
            <p className="text-sm text-muted-foreground">Let's celebrate what you accomplished and plan ahead.</p>
          </div>
          
          {/* Task Completion Display */}
          {tasks.some(task => task?.title) && (
            <div className="bg-background/80 rounded-xl p-4 border">
              <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-primary" />
                Today's Big Three
              </h3>
              <div className="space-y-2">
                {tasks.map((task, index) => (
                  task?.title ? (
                    <div key={index} className="flex items-center gap-3">
                      <CheckCircle 
                        className={`w-5 h-5 ${task.completed ? 'text-primary' : 'text-muted-foreground'}`}
                      />
                      <span className={`text-sm ${task.completed ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                        {task.title}
                      </span>
                      {task.completed && <Star className="w-4 h-4 text-primary animate-pulse" />}
                    </div>
                  ) : null
                ))}
              </div>
              <div className="mt-3 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full">
                  <span className="text-sm font-medium text-primary">
                    {stats.completedCount} of {stats.totalCount} completed
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="p-5 space-y-4">
          {/* Today's Future Note */}
          {todays?.text && (
            <div className="rounded-xl border bg-accent/20 px-4 py-3 text-foreground">
              <div className="text-sm font-semibold">💌 Encouragement for You</div>
              <div className="text-sm mt-1">{todays.text}</div>
            </div>
          )}
          
          {/* Daily Summary */}
          <DailySummary />
          
          {/* Enhanced Journal Prompts */}
          <div className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground block mb-1">🌟 What went really well today?</label>
              <textarea 
                value={w1} 
                onChange={e=>setW1(e.target.value)} 
                rows={2}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" 
                placeholder="I completed my presentation, stayed focused during deep work, connected with my team..." 
              />
            </div>
            
            <div>
              <label className="text-sm text-muted-foreground block mb-1">🔄 What would you do differently tomorrow?</label>
              <textarea 
                value={w2} 
                onChange={e=>setW2(e.target.value)} 
                rows={2}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" 
                placeholder="Start earlier, take more breaks, eliminate distractions..." 
              />
            </div>
            
            <div>
              <label className="text-sm text-muted-foreground block mb-1">🏆 What are you most proud of accomplishing?</label>
              <textarea 
                value={w3} 
                onChange={e=>setW3(e.target.value)} 
                rows={2}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" 
                placeholder="Pushed through a challenging task, maintained consistent energy, helped a colleague..." 
              />
            </div>
          </div>
          
          <div>
            <label className="text-sm text-muted-foreground block mb-1">💭 Additional reflection (optional)</label>
            <textarea 
              value={reflect} 
              onChange={e=>setReflect(e.target.value)} 
              rows={2} 
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" 
              placeholder="Any other thoughts, lessons learned, or insights from today..." 
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground block mb-1">Top 3 for tomorrow (optional)</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input 
                value={n1} 
                onChange={e=>setN1(e.target.value)} 
                className="rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" 
              />
              <input 
                value={n2} 
                onChange={e=>setN2(e.target.value)} 
                className="rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" 
              />
              <input 
                value={n3} 
                onChange={e=>setN3(e.target.value)} 
                className="rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" 
              />
            </div>
          </div>
        </div>
        <div className="p-5 border-t border-border flex items-center justify-end gap-2">
          <button 
            onClick={onClose} 
            className="px-4 py-2 rounded-lg border border-input bg-background hover:bg-accent hover:text-accent-foreground"
          >
            Later
          </button>
          <button
            onClick={()=>{
              try {
                log.info("Saving daily debrief", { w1, w2, w3, reflect, n1, n2, n3 });
                // Combine all responses into wins array for storage
                const wins=[w1,w2,w3].filter(Boolean);
                const nextTop3=[n1,n2,n3].filter(Boolean);
                writeTodayDebrief({ wins, reflect, nextTop3 });
                clearEarnedAnimals(); // Clear earned animals on sign-off
                emitChanged(["fm_daily_debrief_v1"]);
                log.info("Daily debrief saved successfully");
                onClose();
              } catch (error) {
                log.error("Error saving daily debrief:", error);
              }
            }}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Save & sign off
          </button>
        </div>
      </div>
    </div>
  );
}