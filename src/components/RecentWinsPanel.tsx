import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getRecentWins, getTodayWins } from '@/lib/winsStorage';
import { getTrophyStats } from '@/lib/trophySystem';
import type { Win } from '@/lib/winsStorage';

export function RecentWinsPanel() {
  const [recentWins, setRecentWins] = useState<Win[]>([]);
  const [todayWins, setTodayWins] = useState<Win[]>([]);
  const [todayTrophies, setTodayTrophies] = useState(0);

  useEffect(() => {
    const loadData = () => {
      setRecentWins(getRecentWins(3));
      setTodayWins(getTodayWins());
      setTodayTrophies(getTrophyStats().todayTrophies);
    };

    loadData();

    // Listen for changes
    const handleWinsChange = () => loadData();
    const handleTrophyChange = () => loadData();

    window.addEventListener('winsChanged', handleWinsChange);
    window.addEventListener('fm:data-changed', handleTrophyChange);

    return () => {
      window.removeEventListener('winsChanged', handleWinsChange);
      window.removeEventListener('fm:data-changed', handleTrophyChange);
    };
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-card-title flex items-center gap-3">
          🎉 Daily Wins
        </h2>
        {todayTrophies > 0 && (
          <div className="status-indicator status-success">
            🏆 {todayTrophies} {todayTrophies === 1 ? 'trophy' : 'trophies'}
          </div>
        )}
      </div>
      <div className="space-y-4">
        {recentWins.length === 0 ? (
          <div className="text-center py-8 rounded-xl bg-gradient-to-br from-muted/10 to-muted/5 border border-muted/20">
            <div className="text-4xl mb-3">✨</div>
            <p className="text-subtle">Complete a task to start celebrating wins!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recentWins.map((win) => (
              <div key={win.id} className="p-4 rounded-xl bg-muted/5 border border-muted/10 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-body flex-1">{win.text}</p>
                  <div className="status-indicator status-muted">
                    {formatDate(win.date)}
                  </div>
                </div>
                {win.source === 'task' && (
                  <div className="status-indicator status-success">
                    ⭐ Task completion
                  </div>
                )}
              </div>
            ))}
            {todayWins.length > 0 && (
              <div className="pt-4 mt-4 border-t border-border/20">
                <div className="status-indicator status-progress w-full justify-center">
                  🎯 {todayWins.length} {todayWins.length === 1 ? 'win' : 'wins'} today
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}