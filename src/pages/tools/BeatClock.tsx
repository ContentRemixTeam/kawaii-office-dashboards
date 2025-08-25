import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Play, Square, Trophy, Clock, Star } from "lucide-react";
import ToolShell from "@/components/ToolShell";
import { useToast } from "@/hooks/use-toast";
import { safeGet, safeSet, getTodayISO } from "@/lib/storage";
import confetti from "canvas-confetti";

interface BeatClockEntry {
  id: string;
  task: string;
  duration: number;
  completed: boolean;
  date: string;
}

type TimerState = "setup" | "running" | "victory" | "oops";

const TIMER_OPTIONS = [
  { value: 5, label: "5 minutes" },
  { value: 10, label: "10 minutes" },
  { value: 15, label: "15 minutes" },
  { value: 20, label: "20 minutes" },
  { value: 30, label: "30 minutes" },
];

const ENCOURAGEMENTS = [
  "Keep going! 💪",
  "Future You is cheering for you 💌",
  "You're doing amazing! ✨",
  "Stay focused, you've got this! 🌟",
  "Almost there! 🚀",
  "You're unstoppable! ⭐",
  "Your focus is incredible! 🎯",
  "Crushing it! 💥",
  "Future You will thank you! 🙏"
];

export default function BeatClock() {
  const { toast } = useToast();
  const [task, setTask] = useState("");
  const [selectedDuration, setSelectedDuration] = useState<number>(15);
  const [timerState, setTimerState] = useState<TimerState>("setup");
  const [timeLeft, setTimeLeft] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [entries, setEntries] = useState<BeatClockEntry[]>([]);
  
  const intervalRef = useRef<NodeJS.Timeout>();
  const encouragementRef = useRef<NodeJS.Timeout>();

  // Load entries from localStorage
  useEffect(() => {
    const saved = safeGet("fm_beatclock_v1", []);
    setEntries(saved);
  }, []);

  // Save entries to localStorage
  const saveEntries = (newEntries: BeatClockEntry[]) => {
    setEntries(newEntries);
    safeSet("fm_beatclock_v1", newEntries);
  };

  // Start timer
  const startTimer = () => {
    if (!task.trim()) {
      toast({
        title: "Add a task first! 📝",
        description: "What are you planning to tackle?",
      });
      return;
    }

    const totalSeconds = selectedDuration * 60;
    setTimeLeft(totalSeconds);
    setStartTime(totalSeconds);
    setTimerState("running");

    // Start countdown
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          clearTimeout(encouragementRef.current);
          setTimerState("oops");
          // Save incomplete entry
          const entry: BeatClockEntry = {
            id: Date.now().toString(),
            task: task.trim(),
            duration: selectedDuration,
            completed: false,
            date: getTodayISO(),
          };
          const newEntries = [...entries, entry];
          saveEntries(newEntries);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Schedule random encouragements
    const scheduleEncouragement = () => {
      const delay = Math.random() * 60000 + 60000; // 1-2 minutes
      encouragementRef.current = setTimeout(() => {
        if (timerState === "running") {
          const randomEncouragement = ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)];
          toast({
            title: randomEncouragement,
            duration: 2000,
          });
          scheduleEncouragement();
        }
      }, delay);
    };
    scheduleEncouragement();
  };

  // Mark task as done
  const markDone = () => {
    if (timerState === "running") {
      clearInterval(intervalRef.current);
      clearTimeout(encouragementRef.current);
      setTimerState("victory");
      
      // Trigger confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      // Save completed entry
      const entry: BeatClockEntry = {
        id: Date.now().toString(),
        task: task.trim(),
        duration: selectedDuration,
        completed: true,
        date: getTodayISO(),
      };
      const newEntries = [...entries, entry];
      saveEntries(newEntries);

      toast({
        title: "🎉 You beat the clock!",
        description: "Amazing work! Future You is so proud ✨",
      });
    }
  };

  // Reset to setup
  const reset = () => {
    clearInterval(intervalRef.current);
    clearTimeout(encouragementRef.current);
    setTimerState("setup");
    setTask("");
    setTimeLeft(0);
  };

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Calculate progress percentage
  const progressPercentage = startTime > 0 ? ((startTime - timeLeft) / startTime) * 100 : 0;

  // Get today's stats
  const todayEntries = entries.filter(e => e.date === getTodayISO());
  const todayCompletions = todayEntries.filter(e => e.completed).length;
  const thisWeekStart = new Date();
  thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay());
  const weekEntries = entries.filter(e => {
    const entryDate = new Date(e.date);
    return entryDate >= thisWeekStart && e.completed;
  });

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearInterval(intervalRef.current);
      clearTimeout(encouragementRef.current);
    };
  }, []);

  return (
    <ToolShell title="Beat the Clock ⏰">
      <div className="space-y-6">
        {/* Stats Header */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <Badge variant="secondary" className="px-4 py-2">
            <Trophy className="w-4 h-4 mr-2" />
            Today: {todayCompletions}
          </Badge>
          <Badge variant="secondary" className="px-4 py-2">
            <Star className="w-4 h-4 mr-2" />
            This Week: {weekEntries.length}
          </Badge>
        </div>

        {/* Setup State */}
        {timerState === "setup" && (
          <Card className="max-w-md mx-auto border-2 border-primary/20 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
              <CardTitle className="text-center flex items-center justify-center gap-2">
                <Clock className="w-5 h-5" />
                Ready to Beat the Clock?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">What task are you tackling?</label>
                <Input
                  value={task}
                  onChange={(e) => setTask(e.target.value)}
                  placeholder="Write an email, review docs, sketch ideas..."
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Timer Duration</label>
                <Select value={selectedDuration.toString()} onValueChange={(value) => setSelectedDuration(Number(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIMER_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value.toString()}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={startTimer} className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70" size="lg">
                <Play className="w-4 h-4 mr-2" />
                Start Timer 🚀
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Running State */}
        {timerState === "running" && (
          <Card className="max-w-md mx-auto border-2 border-primary/30 shadow-xl bg-gradient-to-br from-background to-primary/5">
            <CardHeader className="border-b border-primary/20">
              <CardTitle className="text-center text-lg flex items-center justify-center gap-2">
                <div className="animate-pulse">🎯</div>
                {task}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="text-6xl md:text-7xl font-bold text-primary mb-4 font-mono">
                  {formatTime(timeLeft)}
                </div>
                
                {/* Enhanced progress bar with rocket animation */}
                <div className="relative mb-4">
                  <Progress value={progressPercentage} className="h-4" />
                  <div 
                    className="absolute -top-1 transition-all duration-1000 ease-linear"
                    style={{ left: `calc(${progressPercentage}% - 12px)` }}
                  >
                    <div className="text-2xl animate-bounce">🚀</div>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground mb-2">
                  {Math.round(progressPercentage)}% complete
                </p>
                <p className="text-xs text-muted-foreground/80">
                  Beat the clock to earn a trophy! 🏆
                </p>
              </div>

              <div className="flex gap-3">
                <Button onClick={markDone} className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700" size="lg">
                  <Trophy className="w-4 h-4 mr-2" />
                  Done! 🎉
                </Button>
                <Button onClick={reset} variant="outline" size="lg" className="hover:bg-red-50 hover:border-red-200">
                  <Square className="w-4 h-4 mr-2" />
                  Stop
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Victory State */}
        {timerState === "victory" && (
          <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
            <Card className="max-w-md mx-auto bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 animate-scale-in">
              <CardContent className="text-center py-8">
                <div className="text-6xl mb-4 animate-bounce">🎉</div>
                <h3 className="text-2xl font-bold text-green-800 mb-2">
                  You Beat the Clock!
                </h3>
                <p className="text-green-700 mb-2 font-medium">"{task}"</p>
                <p className="text-sm text-green-600 mb-2">
                  Amazing work! Future You is so proud ✨
                </p>
                <div className="flex items-center justify-center gap-2 mb-6">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  <span className="text-sm font-semibold text-green-700">+1 Victory Trophy!</span>
                </div>
                <Button onClick={reset} className="w-full bg-gradient-to-r from-green-500 to-green-600">
                  Go Again! 🚀
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Oops State */}
        {timerState === "oops" && (
          <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
            <Card className="max-w-md mx-auto bg-gradient-to-br from-orange-50 to-yellow-50 border-orange-200 animate-scale-in">
              <CardContent className="text-center py-8">
                <div className="text-6xl mb-4 animate-pulse">😴</div>
                <h3 className="text-2xl font-bold text-orange-800 mb-2">
                  Time's Up!
                </h3>
                <p className="text-orange-700 mb-2 font-medium">"{task}"</p>
                <p className="text-sm text-orange-600 mb-6">
                  That's okay, try again later 💖<br />
                  Every attempt makes you stronger!
                </p>
                <Button onClick={reset} className="w-full bg-gradient-to-r from-orange-400 to-yellow-500">
                  Try Again! 💪
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Recent Sessions */}
        {entries.length > 0 && (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-center">📊 Recent Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {entries.slice(-10).reverse().map((entry) => (
                  <div
                    key={entry.id}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      entry.completed
                        ? "bg-green-50 border border-green-200"
                        : "bg-orange-50 border border-orange-200"
                    }`}
                  >
                    <div className="flex-1">
                      <p className="font-medium text-sm">{entry.task}</p>
                      <p className="text-xs text-muted-foreground">
                        {entry.duration} min • {entry.date}
                      </p>
                    </div>
                    <div className="text-lg">
                      {entry.completed ? "🏆" : "😴"}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </ToolShell>
  );
}