import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { RotateCcw, Volume2, VolumeX, Bell, Smartphone, Target, Calendar, TrendingUp } from "lucide-react";
import ToolShell from "@/components/ToolShell";
import focusTimer, { FocusConfig, WorkflowType, SoundType } from "@/lib/focusTimer";
import { useToast } from "@/hooks/use-toast";
import { toLocalISODate } from "@/lib/localDate";

const WORKFLOW_PRESETS = {
  classic: { name: "Classic Pomodoro", focusMin: 25, shortMin: 5, longMin: 15, longEvery: 4, description: "Traditional 25/5/15 technique" },
  deep: { name: "Deep Work", focusMin: 50, shortMin: 10, longMin: 20, longEvery: 2, description: "Longer focus for complex tasks" },
  sprint: { name: "Sprint", focusMin: 15, shortMin: 3, longMin: 9, longEvery: 5, description: "Quick bursts for energy" },
  custom: { name: "Custom", focusMin: 25, shortMin: 5, longMin: 15, longEvery: 4, description: "Your personalized settings" }
};

export default function Focus() {
  const [config, setConfig] = useState<FocusConfig>(focusTimer.getConfig());
  const [dailyGoal, setDailyGoal] = useState(4);
  const [history, setHistory] = useState<Record<string, { focusBlocks: number; minutesFocused: number }>>({});
  const [timerState, setTimerState] = useState(focusTimer.getState());
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribeTick = focusTimer.on("tick", setTimerState);
    const unsubscribePhase = focusTimer.on("phase", () => {
      setTimerState(focusTimer.getState());
      loadData();
    });

    loadData();

    return () => {
      unsubscribeTick();
      unsubscribePhase();
    };
  }, []);

  const loadData = () => {
    setConfig(focusTimer.getConfig());
    setTimerState(focusTimer.getState());
    setHistory(focusTimer.getHistory());
    setDailyGoal(timerState.dailyGoal);
  };

  const updateConfig = (updates: Partial<FocusConfig>) => {
    const newConfig = { ...config, ...updates };
    setConfig(newConfig);
    focusTimer.updateConfig(updates);

    toast({
      title: "⚙️ Settings updated",
      description: "Your focus timer preferences have been saved"
    });
  };

  const selectWorkflow = (workflow: WorkflowType) => {
    const preset = WORKFLOW_PRESETS[workflow];
    updateConfig({
      workflow,
      ...(workflow !== "custom" && {
        focusMin: preset.focusMin,
        shortMin: preset.shortMin,
        longMin: preset.longMin,
        longEvery: preset.longEvery
      })
    });
  };

  const updateDailyGoal = (goal: number) => {
    setDailyGoal(goal);
    focusTimer.setDailyGoal(goal);
    
    toast({
      title: "🎯 Daily goal updated",
      description: `Target: ${goal} focus sessions per day`
    });
  };

  const resetToday = () => {
    focusTimer.resetToday();
    loadData();
    
    toast({
      title: "🔄 Today reset",
      description: "Daily progress and timer have been cleared"
    });
  };

  const handleNotificationToggle = async (enabled: boolean) => {
    if (enabled) {
      const granted = await focusTimer.requestNotificationPermission();
      if (!granted) {
        toast({
          title: "🔔 Notifications blocked",
          description: "Please enable notifications in your browser settings",
          variant: "destructive"
        });
        return;
      }
    }
    updateConfig({ notify: enabled });
  };

  const enableAudio = async () => {
    const success = await focusTimer.enableAudio();
    if (success) {
      toast({
        title: "🔊 Audio enabled",
        description: "Focus timer sounds are now active"
      });
    }
  };

  // Calculate stats
  const today = toLocalISODate();
  const todayStats = history[today] || { focusBlocks: 0, minutesFocused: 0 };
  const goalMet = todayStats.focusBlocks >= dailyGoal;
  
  // Calculate streak
  const sortedDates = Object.keys(history).sort().reverse();
  let streak = 0;
  for (const date of sortedDates) {
    if (history[date].focusBlocks >= dailyGoal) {
      streak++;
    } else {
      break;
    }
  }

  return (
    <ToolShell title="Focus Timer Settings">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-primary rounded-2xl p-6 text-white">
          <h2 className="text-2xl font-bold mb-2">🎯 Focus Timer</h2>
          <p className="text-white/90">
            Configure your Pomodoro technique for maximum productivity and focus
          </p>
        </div>

        {/* Current Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Today's Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{todayStats.focusBlocks}</div>
                <div className="text-sm text-muted">Focus Sessions</div>
                {goalMet && <Badge className="mt-1">Goal Met! 🎉</Badge>}
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{todayStats.minutesFocused}</div>
                <div className="text-sm text-muted">Minutes Focused</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{streak}</div>
                <div className="text-sm text-muted">Day Streak</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="presets" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="presets">Presets</TabsTrigger>
            <TabsTrigger value="timing">Timing</TabsTrigger>
            <TabsTrigger value="audio">Audio</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          {/* Workflow Presets */}
          <TabsContent value="presets" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Workflow Presets</CardTitle>
                <CardDescription>
                  Choose a pre-configured focus workflow or customize your own
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(WORKFLOW_PRESETS).map(([key, preset]) => (
                    <div
                      key={key}
                      className={`cursor-pointer border-2 rounded-lg p-4 transition-all ${
                        config.workflow === key 
                          ? "border-primary bg-primary/5" 
                          : "border-border hover:border-primary/50"
                      }`}
                      onClick={() => selectWorkflow(key as WorkflowType)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{preset.name}</h3>
                        {config.workflow === key && <Badge>Active</Badge>}
                      </div>
                      <p className="text-sm text-muted mb-2">{preset.description}</p>
                      <div className="text-xs text-muted">
                        {preset.focusMin}m focus • {preset.shortMin}m short • {preset.longMin}m long
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Timing Settings */}
          <TabsContent value="timing" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Duration Settings</CardTitle>
                <CardDescription>
                  Customize your focus and break durations (1-120 minutes)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label>Focus Duration</Label>
                    <Input
                      type="number"
                      min="1"
                      max="120"
                      value={config.focusMin}
                      onChange={(e) => updateConfig({ focusMin: Math.max(1, Math.min(120, parseInt(e.target.value) || 1)) })}
                    />
                    <div className="text-xs text-muted">{config.focusMin} minutes</div>
                  </div>

                  <div className="space-y-2">
                    <Label>Short Break</Label>
                    <Input
                      type="number"
                      min="1"
                      max="120"
                      value={config.shortMin}
                      onChange={(e) => updateConfig({ shortMin: Math.max(1, Math.min(120, parseInt(e.target.value) || 1)) })}
                    />
                    <div className="text-xs text-muted">{config.shortMin} minutes</div>
                  </div>

                  <div className="space-y-2">
                    <Label>Long Break</Label>
                    <Input
                      type="number"
                      min="1"
                      max="120"
                      value={config.longMin}
                      onChange={(e) => updateConfig({ longMin: Math.max(1, Math.min(120, parseInt(e.target.value) || 1)) })}
                    />
                    <div className="text-xs text-muted">{config.longMin} minutes</div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Long Break Frequency</Label>
                    <div className="flex items-center space-x-4">
                      <Slider
                        value={[config.longEvery]}
                        onValueChange={(value) => updateConfig({ longEvery: value[0] })}
                        min={2}
                        max={10}
                        step={1}
                        className="flex-1"
                      />
                      <span className="text-sm w-20">Every {config.longEvery} cycles</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Daily Goal</Label>
                    <div className="flex items-center space-x-4">
                      <Slider
                        value={[dailyGoal]}
                        onValueChange={(value) => updateDailyGoal(value[0])}
                        min={1}
                        max={20}
                        step={1}
                        className="flex-1"
                      />
                      <span className="text-sm w-20">{dailyGoal} sessions</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Audio Settings */}
          <TabsContent value="audio" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Volume2 className="w-5 h-5" />
                  Audio & Notifications
                </CardTitle>
                <CardDescription>
                  Configure sounds and notifications for phase transitions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Phase Transition Sound</Label>
                      <p className="text-xs text-muted">Play sound when phases complete</p>
                    </div>
                    <Select value={config.sound} onValueChange={(value: SoundType) => updateConfig({ sound: value })}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="chime">Chime</SelectItem>
                        <SelectItem value="bell">Bell</SelectItem>
                        <SelectItem value="off">Off</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Tick Sound</Label>
                      <p className="text-xs text-muted">Subtle tick every second</p>
                    </div>
                    <Switch
                      checked={config.tickSound}
                      onCheckedChange={(checked) => updateConfig({ tickSound: checked })}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="flex items-center gap-2">
                        <Bell className="w-4 h-4" />
                        Browser Notifications
                      </Label>
                      <p className="text-xs text-muted">Show notifications when phases complete</p>
                    </div>
                    <Switch
                      checked={config.notify}
                      onCheckedChange={handleNotificationToggle}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="flex items-center gap-2">
                        <Smartphone className="w-4 h-4" />
                        Vibration (Mobile)
                      </Label>
                      <p className="text-xs text-muted">Vibrate device on phase transitions</p>
                    </div>
                    <Switch
                      checked={config.vibrate}
                      onCheckedChange={(checked) => updateConfig({ vibrate: checked })}
                    />
                  </div>
                </div>

                {config.sound !== "off" && (
                  <div className="bg-muted/30 rounded-lg p-4">
                    <p className="text-sm text-muted mb-2">
                      ⚠️ Browsers require user interaction to play audio
                    </p>
                    <Button size="sm" onClick={enableAudio}>
                      Enable Audio
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Advanced Settings */}
          <TabsContent value="advanced" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Advanced Settings</CardTitle>
                <CardDescription>
                  Auto-start options and quiet mode settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Auto-start Breaks</Label>
                      <p className="text-xs text-muted">Automatically start break when focus ends</p>
                    </div>
                    <Switch
                      checked={config.autoStartBreak}
                      onCheckedChange={(checked) => updateConfig({ autoStartBreak: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Auto-start Focus</Label>
                      <p className="text-xs text-muted">Automatically start focus when break ends</p>
                    </div>
                    <Switch
                      checked={config.autoStartFocus}
                      onCheckedChange={(checked) => updateConfig({ autoStartFocus: checked })}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Quiet Mode</Label>
                      <p className="text-xs text-muted">Suppress encouragement popups during focus</p>
                    </div>
                    <Switch
                      checked={focusTimer.getState().phase === "focus" ? true : config.autoStartBreak}
                      onCheckedChange={(checked) => updateConfig({ autoStartBreak: checked })}
                      disabled
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-destructive">Reset Today</Label>
                      <p className="text-xs text-muted">Clear today's progress and stop timer</p>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          <RotateCcw className="w-4 h-4 mr-2" />
                          Reset
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Reset Today's Progress?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will clear all focus sessions and minutes for today, and stop the current timer. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={resetToday}>
                            Reset Today
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(history)
                    .sort(([a], [b]) => b.localeCompare(a))
                    .slice(0, 7)
                    .map(([date, stats]) => (
                      <div key={date} className="flex items-center justify-between py-2 border-b border-border/20 last:border-0">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted" />
                          <span className="text-sm">{new Date(date).toLocaleDateString()}</span>
                          {stats.focusBlocks >= dailyGoal && <Badge variant="secondary" className="text-xs">Goal ✓</Badge>}
                        </div>
                        <div className="text-sm text-muted">
                          {stats.focusBlocks} sessions • {stats.minutesFocused}m
                        </div>
                      </div>
                    ))}
                  {Object.keys(history).length === 0 && (
                    <p className="text-sm text-muted text-center py-4">
                      No focus sessions yet. Start your first timer to see stats here!
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ToolShell>
  );
}