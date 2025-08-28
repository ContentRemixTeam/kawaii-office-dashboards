import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { getTodaysWins, formatWinTime } from '@/lib/dailyWins';
import { getCompletionStats } from '@/lib/unifiedTasks';
import { writeTodayDebrief } from "@/lib/dailyFlow";
import { emitChanged } from "@/lib/bus";
import { clearEarnedAnimals } from "@/lib/topbarState";
import { getTodaysNote } from "@/lib/futureNotes";
import { getBigThreeTasks } from "@/lib/unifiedTasks";
import DailySummary from "@/components/DailySummary";
import { log } from "@/lib/log";
import { CheckCircle, Star, Trophy } from "lucide-react";

interface DebriefModalProps {
  open: boolean;
  onClose: () => void;
  selectedAnimal: string;
}

const ANIMAL_CELEBRATION_GIFS = {
  unicorn: "🦄✨🌈",
  dragon: "🐲🔥💥", 
  cat: "🐱🌟💕",
  dog: "🐶❤️🌟",
  bunny: "🐰🌸💖",
  fox: "🦊🍂✨",
  panda: "🐼🎋💚",
  penguin: "🐧❄️💎",
  owl: "🦉🌙📚",
  hamster: "🐹🌻💫"
};

const JOURNAL_PROMPTS = [
  "What went really well today?",
  "What would you do differently tomorrow?", 
  "What are you most proud of accomplishing?"
];

export default function DebriefModal({ open, onClose, selectedAnimal }: DebriefModalProps) {
  const [w1, setW1] = React.useState("");
  const [w2, setW2] = React.useState("");
  const [w3, setW3] = React.useState("");
  const [reflect, setReflect] = React.useState("");
  const [n1, setN1] = React.useState("");
  const [n2, setN2] = React.useState("");
  const [n3, setN3] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  const todays = getTodaysNote();
  const tasks = getBigThreeTasks();
  const stats = getCompletionStats();
  const wins = getTodaysWins();
  const animalGif = ANIMAL_CELEBRATION_GIFS[selectedAnimal as keyof typeof ANIMAL_CELEBRATION_GIFS] || "🌟✨💫";

  // Add logging to track modal state
  React.useEffect(() => {
    log.info(`DebriefModal open state changed: ${open}`);
  }, [open]);

  const getCompletionMessage = () => {
    switch (stats.completedCount) {
      case 0:
        return "Every journey starts with a single step! 🌱";
      case 1:
        return "Good start! You're building momentum! 🚀";
      case 2:
        return "Great momentum! You're crushing it! 💪";
      case 3:
        return "Perfect day! You achieved everything you set out to do! 🎉";
      default:
        return "Incredible productivity! You went above and beyond! 🌟";
    }
  };

  const getEncouragingMessage = () => {
    if (stats.completedCount === 0) {
      return "Tomorrow is a fresh start with new possibilities!";
    }
    if (stats.completedCount === 1) {
      return "You showed up and made progress - that's what matters!";
    }
    if (stats.completedCount === 2) {
      return "Two tasks down - you're developing great habits!";
    }
    return "You're absolutely crushing your goals! Keep this energy!";
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      log.info("Saving daily debrief", { w1, w2, w3, reflect, n1, n2, n3 });
      
      // Combine all responses into wins array for storage
      const winsArray = [w1, w2, w3].filter(Boolean);
      const nextTop3 = [n1, n2, n3].filter(Boolean);
      
      // Save reflection data
      const reflectionData = {
        date: new Date().toISOString(),
        responses: [w1, w2, w3].filter(r => r.trim()),
        reflection: reflect,
        completionStats: stats,
        winsCount: wins.length
      };
      
      localStorage.setItem('fm_daily_reflection_v1', JSON.stringify(reflectionData));
      
      // Save debrief using existing system
      writeTodayDebrief({ wins: winsArray, reflect, nextTop3 });
      clearEarnedAnimals();
      emitChanged(["fm_daily_debrief_v1"]);
      
      log.info("Daily debrief saved successfully");
      
      toast({
        title: "🌟 Daily Reflection Saved!",
        description: "Your insights have been recorded. Great work today!",
        duration: 3000,
      });
      
      // Reset form
      setW1("");
      setW2("");
      setW3("");
      setReflect("");
      setN1("");
      setN2("");
      setN3("");
      onClose();
    } catch (error) {
      log.error("Error saving daily debrief:", error);
      toast({
        title: "Error",
        description: "Failed to save reflection. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    toast({
      title: "Day Complete!",
      description: "Rest well and get ready for tomorrow's victories!",
      duration: 2000,
    });
    onClose();
  };

  if (!open) return null;
  
  return (
    <div className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm flex items-center justify-center p-4" style={{ zIndex: 9999 }}>
      <div className="w-full max-w-2xl rounded-2xl bg-card shadow-xl border max-h-[90vh] overflow-y-auto">
        {/* Celebration Header */}
        <div className="p-6 border-b border-border bg-gradient-to-r from-primary/10 to-primary/5 rounded-t-2xl">
          <div className="text-center mb-4">
            <div className="text-6xl mb-2 animate-bounce">{animalGif}</div>
            <h2 className="text-xl font-bold text-primary mb-1">
              Here's what you accomplished today!
            </h2>
            <p className="text-sm text-muted-foreground">Time to celebrate and reflect on your amazing progress.</p>
          </div>
          
          {/* Completion Stats */}
          <div className="text-center mb-4">
            <p className="text-2xl font-bold text-primary mb-1">
              {stats.completedCount}/{stats.totalCount} Tasks
            </p>
            <p className="text-muted-foreground text-sm">
              {getCompletionMessage()}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              {getEncouragingMessage()}
            </p>
          </div>

          {/* Show completed tasks and celebration notes */}
          {wins.length > 0 && (
            <div className="bg-background/80 rounded-xl p-4 border">
              <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-primary" />
                Your completed tasks:
              </h3>
              <div className="space-y-2">
                {wins.map((win) => (
                  <div key={win.id} className="flex items-center gap-2 text-sm">
                    <span className="text-primary">✅</span>
                    <span className="font-medium">{win.taskTitle}</span>
                    <span className="text-muted-foreground text-xs">
                      - {formatWinTime(win.completedAt)}
                    </span>
                  </div>
                ))}
                
                {/* Show celebration notes */}
                {wins.some(win => win.celebrationNote) && (
                  <div className="mt-3 pt-3 border-t border-border/20">
                    <h4 className="font-medium text-sm text-muted-foreground mb-2">
                      Your celebration notes:
                    </h4>
                    {wins.filter(win => win.celebrationNote).map((win) => (
                      <div key={`note-${win.id}`} className="text-xs text-muted-foreground italic mb-1">
                        🏆 "{win.celebrationNote}"
                      </div>
                    ))}
                  </div>
                )}
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
          
          <Separator />
          
          {/* Enhanced Journal Prompts */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-center">
              📝 Reflect on Your Day
            </h3>
            <p className="text-sm text-muted-foreground text-center">
              Take a moment to reflect on your progress and insights
            </p>
            
            <div>
              <label className="text-sm text-muted-foreground block mb-1">🌟 What went really well today?</label>
              <textarea 
                value={w1} 
                onChange={e => setW1(e.target.value)} 
                rows={2}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" 
                placeholder="I completed my presentation, stayed focused during deep work, connected with my team..." 
                maxLength={300}
              />
              <p className="text-xs text-muted-foreground text-right mt-1">
                {w1.length}/300 characters
              </p>
            </div>
            
            <div>
              <label className="text-sm text-muted-foreground block mb-1">🔄 What would you do differently tomorrow?</label>
              <textarea 
                value={w2} 
                onChange={e => setW2(e.target.value)} 
                rows={2}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" 
                placeholder="Start earlier, take more breaks, eliminate distractions..." 
                maxLength={300}
              />
              <p className="text-xs text-muted-foreground text-right mt-1">
                {w2.length}/300 characters
              </p>
            </div>
            
            <div>
              <label className="text-sm text-muted-foreground block mb-1">🏆 What are you most proud of accomplishing?</label>
              <textarea 
                value={w3} 
                onChange={e => setW3(e.target.value)} 
                rows={2}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" 
                placeholder="Pushed through a challenging task, maintained consistent energy, helped a colleague..." 
                maxLength={300}
              />
              <p className="text-xs text-muted-foreground text-right mt-1">
                {w3.length}/300 characters
              </p>
            </div>
          </div>
          
          <div>
            <label className="text-sm text-muted-foreground block mb-1">💭 Additional reflection (optional)</label>
            <textarea 
              value={reflect} 
              onChange={e => setReflect(e.target.value)} 
              rows={2} 
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" 
              placeholder="Any other thoughts, lessons learned, or insights from today..." 
              maxLength={400}
            />
            <p className="text-xs text-muted-foreground text-right mt-1">
              {reflect.length}/400 characters
            </p>
          </div>
          
          <div>
            <label className="text-sm text-muted-foreground block mb-1">Top 3 for tomorrow (optional)</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input 
                value={n1} 
                onChange={e => setN1(e.target.value)} 
                className="rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" 
                placeholder="Tomorrow's task 1"
                maxLength={100}
              />
              <input 
                value={n2} 
                onChange={e => setN2(e.target.value)} 
                className="rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" 
                placeholder="Tomorrow's task 2"
                maxLength={100}
              />
              <input 
                value={n3} 
                onChange={e => setN3(e.target.value)} 
                className="rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" 
                placeholder="Tomorrow's task 3"
                maxLength={100}
              />
            </div>
          </div>
        </div>
        
        <div className="p-5 border-t border-border flex items-center justify-end gap-2">
          <button 
            onClick={handleSkip} 
            className="px-4 py-2 rounded-lg border border-input bg-background hover:bg-accent hover:text-accent-foreground"
            disabled={isSubmitting}
          >
            Skip Reflection
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : '🌟 Complete Day'}
          </button>
        </div>
        
        <p className="text-xs text-center text-muted-foreground pb-4">
          💡 Daily reflection helps you grow and improve continuously!
        </p>
      </div>
    </div>
  );
}