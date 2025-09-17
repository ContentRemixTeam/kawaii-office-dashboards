import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getTodaysWins, formatWinTime } from "@/lib/dailyWins";
import { Trophy, Star, Heart } from "lucide-react";
import { useState, useEffect } from "react";

export function CelebrationNotesCard() {
  const [wins, setWins] = useState(getTodaysWins());

  useEffect(() => {
    const updateWins = () => {
      setWins(getTodaysWins());
    };

    // Listen for wins updates
    window.addEventListener('winsUpdated', updateWins);
    window.addEventListener('storage', updateWins);

    return () => {
      window.removeEventListener('winsUpdated', updateWins);
      window.removeEventListener('storage', updateWins);
    };
  }, []);

  // Filter wins that have celebration notes
  const winsWithNotes = wins.filter(win => win.celebrationNote && win.celebrationNote.trim());

  if (winsWithNotes.length === 0) {
    return (
      <div className="h-full flex flex-col">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Trophy className="w-5 h-5 text-primary" />
              <Star className="w-4 h-4 text-yellow-500" />
            </div>
            <h3 className="font-semibold text-card-title">
              🎉 Today's Celebrations
            </h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Victory notes appear here when you complete tasks
          </p>
        </CardHeader>
        
        <CardContent className="flex-1 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <div className="text-4xl mb-3">🏆</div>
            <p className="text-sm">Complete tasks and write celebration notes to see them here!</p>
          </div>
        </CardContent>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Trophy className="w-5 h-5 text-primary" />
            <Star className="w-4 h-4 text-yellow-500" />
          </div>
          <h3 className="font-semibold text-card-title">
            🎉 Today's Celebrations
          </h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Your victory notes and achievements
        </p>
      </CardHeader>
      
      <CardContent className="flex-1 space-y-3 overflow-y-auto">
        {winsWithNotes.map((win) => (
          <div 
            key={win.id}
            className="p-3 rounded-xl bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Heart className="w-3 h-3 text-red-500 fill-current flex-shrink-0" />
                <span className="font-medium text-xs text-foreground truncate">
                  {win.taskTitle}
                </span>
              </div>
              <span className="text-xs text-muted-foreground flex-shrink-0">
                {formatWinTime(win.completedAt)}
              </span>
            </div>
            
            <div className="bg-background/50 rounded-lg p-2 border border-border/20">
              <p className="text-xs text-foreground italic leading-relaxed">
                "{win.celebrationNote}"
              </p>
            </div>
          </div>
        ))}
        
        <div className="text-center pt-2">
          <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
            <Trophy className="w-3 h-3" />
            {winsWithNotes.length} celebration{winsWithNotes.length === 1 ? '' : 's'}
          </div>
        </div>
      </CardContent>
    </div>
  );
}