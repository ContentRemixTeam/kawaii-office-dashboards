import React, { useState, useEffect } from "react";
import { getTrophyStats, getTrophyCountsByType } from "@/lib/trophySystem";
import { onChanged } from "@/lib/bus";
import { isFeatureVisible } from "@/lib/theme";

export default function TrophyCounter() {
  const [stats, setStats] = useState(getTrophyStats());
  const [counts, setCounts] = useState(getTrophyCountsByType());
  const [showBreakdown, setShowBreakdown] = useState(false);

  useEffect(() => {
    const refresh = () => {
      setStats(getTrophyStats());
      setCounts(getTrophyCountsByType());
    };

    refresh();
    
    return onChanged(keys => {
      if (keys.includes("fm_trophies_v1") || keys.includes("fm_trophy_stats_v1")) {
        refresh();
      }
    });
  }, []);

  if (!isFeatureVisible('topBarTrophies') || stats.totalTrophies === 0) return null;

  return (
    <div 
      className="relative inline-flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-yellow-100 to-orange-100 border border-yellow-300/30 rounded-full cursor-pointer hover:shadow-lg transition-all duration-200"
      onClick={() => setShowBreakdown(!showBreakdown)}
    >
      <span className="text-sm animate-pulse">🏆</span>
      <span className="text-xs font-medium text-yellow-800">
        {stats.totalTrophies}
      </span>
      
      {stats.currentStreak > 1 && (
        <>
          <span className="text-xs text-yellow-600">|</span>
          <span className="text-xs font-medium text-orange-700">
            🔥{stats.currentStreak}
          </span>
        </>
      )}

      {/* Sparkle effect on hover */}
      <div className="absolute -top-1 -right-1 text-xs opacity-0 hover:opacity-100 transition-opacity animate-pulse">
        ✨
      </div>

      {/* Breakdown tooltip */}
      {showBreakdown && (
        <div className="absolute top-full left-0 mt-2 p-3 bg-white border border-border rounded-lg shadow-lg z-10 min-w-40">
          <div className="text-xs font-medium text-foreground mb-2">Trophy Collection</div>
          <div className="space-y-1 text-xs">
            {counts.diamond > 0 && (
              <div className="flex justify-between">
                <span>👑💎 Diamond</span>
                <span>{counts.diamond}</span>
              </div>
            )}
            {counts.gold > 0 && (
              <div className="flex justify-between">
                <span>🏆✨ Gold</span>
                <span>{counts.gold}</span>
              </div>
            )}
            {counts.silver > 0 && (
              <div className="flex justify-between">
                <span>🥈 Silver</span>
                <span>{counts.silver}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>🏆 Basic</span>
              <span>{counts.basic}</span>
            </div>
          </div>
          <div className="border-t border-border mt-2 pt-2 text-xs text-muted-foreground">
            <div>Today: {stats.todayTrophies}</div>
            <div>Best streak: {stats.bestStreak}</div>
          </div>
        </div>
      )}
    </div>
  );
}