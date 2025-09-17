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
    return null;
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
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
      
      <CardContent className="space-y-4">
        {winsWithNotes.map((win) => (
          <div 
            key={win.id}
            className="p-4 rounded-2xl bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-red-500 fill-current" />
                <span className="font-medium text-sm text-foreground">
                  {win.taskTitle}
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                {formatWinTime(win.completedAt)}
              </span>
            </div>
            
            <div className="bg-background/50 rounded-xl p-3 border border-border/20">
              <p className="text-sm text-foreground italic leading-relaxed">
                "{win.celebrationNote}"
              </p>
            </div>
          </div>
        ))}
        
        {winsWithNotes.length > 0 && (
          <div className="text-center pt-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
              <Trophy className="w-3 h-3" />
              {winsWithNotes.length} celebration{winsWithNotes.length === 1 ? '' : 's'} today
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}