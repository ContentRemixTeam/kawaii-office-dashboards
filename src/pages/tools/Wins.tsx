import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import ToolShell from "@/components/ToolShell";
import { getDailyData, setDailyData, safeGet, safeSet, generateId, getTodayISO } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";
import { notifyDataChanged } from "@/lib/bus";

interface Win {
  id: string;
  text: string;
  date: string;
  week: string;
}

const getWeekKey = (date: Date) => {
  const year = date.getFullYear();
  const week = Math.ceil((date.getTime() - new Date(year, 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000));
  return `${year}-W${week}`;
};

const WinCard = ({ win, showSparkles }: { win: Win; showSparkles: boolean }) => (
  <div className={`bg-gradient-peach rounded-xl p-4 border border-border/20 relative ${showSparkles ? 'animate-pulse' : ''}`}>
    {showSparkles && (
      <div className="absolute -top-2 -right-2 text-2xl animate-bounce">✨</div>
    )}
    <div className="flex items-start gap-3">
      <div className="text-2xl">🏆</div>
      <div className="flex-1">
        <p className="text-accent-foreground">{win.text}</p>
        <p className="text-accent-foreground/60 text-xs mt-2">
          {new Date(win.date).toLocaleDateString('en-US', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric' 
          })}
        </p>
      </div>
    </div>
  </div>
);

export default function Wins() {
  const { toast } = useToast();
  const [todayWin, setTodayWin] = useState("");
  const [hasWinToday, setHasWinToday] = useState(false);
  const [allWins, setAllWins] = useState<Win[]>([]);
  const [showSparkles, setShowSparkles] = useState(false);

  useEffect(() => {
    // Load today's win
    const todayData = getDailyData("fm_wins_today_v1", { text: "", saved: false });
    setTodayWin(todayData.text);
    setHasWinToday(todayData.saved);

    // Load all wins
    const wins = safeGet<Win[]>("fm_wins_v1", []);
    setAllWins(wins.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  }, []);

  const saveWin = () => {
    if (!todayWin.trim()) return;

    const today = getTodayISO();
    const newWin: Win = {
      id: generateId(),
      text: todayWin.trim(),
      date: today,
      week: getWeekKey(new Date())
    };

    const updatedWins = [newWin, ...allWins];
    setAllWins(updatedWins);
    safeSet("fm_wins_v1", updatedWins);
    
    // Mark today as saved
    setDailyData("fm_wins_today_v1", { text: todayWin, saved: true });
    setHasWinToday(true);

    // Show sparkles animation
    setShowSparkles(true);
    setTimeout(() => setShowSparkles(false), 2000);

    // Dispatch events for real-time updates
    window.dispatchEvent(new CustomEvent('winsUpdated'));
    window.dispatchEvent(new Event('storage'));
    notifyDataChanged(["fm_wins_v1"]);

    toast({
      title: "✨ Win captured!",
      description: "Your achievement has been added to your trophy collection!"
    });
  };

  const updateTodayWin = (value: string) => {
    setTodayWin(value);
    if (!hasWinToday) {
      setDailyData("fm_wins_today_v1", { text: value, saved: false });
    }
  };

  const thisWeek = getWeekKey(new Date());
  const thisWeekWins = allWins.filter(win => win.week === thisWeek);
  const pastWins = allWins.filter(win => win.week !== thisWeek);

  return (
    <ToolShell title="Daily Wins Feed">
      <div className="space-y-6">
        <div className="bg-gradient-kawaii rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-white mb-3">🏆 Celebrate Your Wins</h2>
          <p className="text-white/90">
            End each day by capturing what went well. Build a beautiful collection of your achievements and proud moments!
          </p>
        </div>

        {!hasWinToday && (
          <div className="bg-card rounded-xl p-6 border border-border/20">
            <h3 className="font-semibold text-card-foreground mb-4">✨ What went well today?</h3>
            <div className="space-y-4">
              <div>
                <Label className="text-sm text-muted-foreground">Share your win, big or small!</Label>
                <Textarea
                  value={todayWin}
                  onChange={(e) => updateTodayWin(e.target.value)}
                  placeholder="Maybe you finished a project, had a great conversation, tried something new, or simply made it through a tough day..."
                  className="mt-2 min-h-[100px]"
                />
              </div>
              <Button 
                onClick={saveWin}
                disabled={!todayWin.trim()}
                className="w-full"
              >
                🏆 Save Today's Win
              </Button>
            </div>
          </div>
        )}

        {hasWinToday && (
          <div className="bg-gradient-peach rounded-xl p-6 border border-border/20">
            <h3 className="font-semibold text-accent-foreground mb-3">✅ Today's win captured!</h3>
            <p className="text-accent-foreground/80">Come back tomorrow to add another win to your collection.</p>
          </div>
        )}

        {thisWeekWins.length > 0 && (
          <div>
            <h3 className="font-semibold text-foreground mb-4">📅 This Week's Wins</h3>
            <div className="grid gap-3">
              {thisWeekWins.map((win, index) => (
                <WinCard 
                  key={win.id} 
                  win={win} 
                  showSparkles={showSparkles && index === 0}
                />
              ))}
            </div>
          </div>
        )}

        {pastWins.length > 0 && (
          <div>
            <h3 className="font-semibold text-foreground mb-4">📚 Previous Wins</h3>
            <div className="grid gap-3 max-h-96 overflow-y-auto">
              {pastWins.slice(0, 20).map((win) => (
                <WinCard key={win.id} win={win} showSparkles={false} />
              ))}
            </div>
          </div>
        )}

        {allWins.length === 0 && hasWinToday && (
          <div className="text-center py-8 text-muted-foreground">
            <div className="text-4xl mb-3">🏆</div>
            <p>Your first win has been saved!</p>
            <p className="text-sm">Keep coming back to build your trophy collection.</p>
          </div>
        )}
      </div>
    </ToolShell>
  );
}