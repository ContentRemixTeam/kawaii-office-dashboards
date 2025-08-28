import { Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";
import BigThreeTasksSection from "@/components/BigThreeTasksSection";
import { safeStorage } from "@/lib/safeStorage";
import { useState, useEffect } from "react";
import { onChanged } from "@/lib/bus";

// TypeScript interfaces for task data structure
interface DashboardData {
  streak: number;
  lastCompletedDate: string;
}

export function BigThreeCard() {
  const [streakData, setStreakData] = useState<DashboardData>({ streak: 0, lastCompletedDate: "" });

  useEffect(() => {
    // Load initial dashboard data using safeStorage
    const defaultDashData: DashboardData = { streak: 0, lastCompletedDate: "" };
    const dashData = safeStorage.get<DashboardData>("fm_dashboard_v1", defaultDashData);
    setStreakData(dashData || defaultDashData);

    // Subscribe to storage changes using the existing bus system
    const unsubscribe = onChanged(keys => {
      if (keys.includes("fm_dashboard_v1")) {
        const newDashData = safeStorage.get<DashboardData>("fm_dashboard_v1", defaultDashData);
        setStreakData(newDashData || defaultDashData);
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