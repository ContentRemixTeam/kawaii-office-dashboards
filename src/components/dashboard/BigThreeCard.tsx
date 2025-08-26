import { Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";
import BigThreeTasksSection from "@/components/BigThreeTasksSection";
import { getDailyData } from "@/lib/storage";
import { useState, useEffect } from "react";
import { onChanged } from "@/lib/bus";

interface DashboardData {
  streak: number;
  lastCompletedDate: string;
}

export function BigThreeCard() {
  const [streakData, setStreakData] = useState<DashboardData>({ streak: 0, lastCompletedDate: "" });

  useEffect(() => {
    const dashData = getDailyData("fm_dashboard_v1", { streak: 0, lastCompletedDate: "" });
    setStreakData(dashData);

    const unsubscribe = onChanged(keys => {
      if (keys.includes("fm_dashboard_v1")) {
        const newDashData = getDailyData("fm_dashboard_v1", { streak: 0, lastCompletedDate: "" });
        setStreakData(newDashData);
      }
    });

    return unsubscribe;
  }, []);

  return (
    <Card className="p-4 md:p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <span className="text-2xl">⭐</span>
          The Big Three
        </h2>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            Streak: {streakData.streak} days
          </span>
        </div>
      </div>
      <BigThreeTasksSection />
    </Card>
  );
}