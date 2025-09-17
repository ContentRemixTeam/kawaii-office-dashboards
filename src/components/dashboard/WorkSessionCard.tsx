import { Clock, Target, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { readTodayIntention } from "@/lib/dailyFlow";
import { useState, useEffect } from "react";
import { onChanged } from "@/lib/bus";

export function WorkSessionCard() {
  const [todayIntention, setTodayIntention] = useState(readTodayIntention());

  useEffect(() => {
    const unsubscribe = onChanged(keys => {
      if (keys.includes("fm_daily_intention_v1")) {
        setTodayIntention(readTodayIntention());
      }
    });
    
    return unsubscribe;
  }, []);

  const workPlan = todayIntention?.workSessionPlan;
  
  if (!workPlan) {
    return null;
  }

  const focusHours = Math.round((workPlan.pomodoroBlocks * workPlan.pomodoroLength) / 60 * 10) / 10;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-500" />
          Today's Plan
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Total Hours</span>
            </div>
            <Badge variant="outline" className="text-lg font-semibold px-3 py-1">
              {workPlan.totalHours}h
            </Badge>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Target className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Focus Blocks</span>
            </div>
            <Badge variant="outline" className="text-lg font-semibold px-3 py-1">
              {workPlan.pomodoroBlocks}
            </Badge>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Session</span>
            </div>
            <Badge variant="outline" className="text-lg font-semibold px-3 py-1">
              {workPlan.pomodoroLength}m
            </Badge>
          </div>
        </div>
        
        <div className="bg-muted/20 rounded-lg p-3 text-center">
          <p className="text-sm text-muted-foreground">
            Planned: <span className="font-medium text-foreground">{focusHours}h</span> of focused work
          </p>
        </div>
      </CardContent>
    </Card>
  );
}