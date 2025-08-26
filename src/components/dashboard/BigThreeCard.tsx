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
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-card-title flex items-center gap-3">
          <span className="text-2xl">⭐</span>
          The Big Three
        </h2>
        <div className="status-indicator status-success">
          <Calendar className="w-4 h-4" />
          <span>
            {streakData.streak} day streak
          </span>
        </div>
      </div>
      <BigThreeTasksSection />
    </div>
  );
}