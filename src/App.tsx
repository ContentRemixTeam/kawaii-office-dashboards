import React, { useEffect, useState, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import { AppErrorBoundary } from "@/components/ErrorBoundary";
import useDailyFlow from "./hooks/useDailyFlow";
import DailyIntentionModal from "./components/DailyIntentionModal";
import DebriefModal from "./components/DebriefModal";
import { useTodayPet } from "./hooks/useTodayPet";
import PomodoroWinModal from "./components/PomodoroWinModal";
import focusTimer from "@/lib/focusTimer";
import { initializeYouTubeAPI } from "@/lib/youtubeInit";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import Tasks from "./pages/tools/Tasks";
import Vision from "./pages/tools/Vision";
import Sounds from "./pages/tools/Sounds";
import Energy from "./pages/tools/Energy";

import Theme from "./pages/tools/Theme";
import Focus from "./pages/tools/Focus";

import PositivityCabinet from "./pages/tools/PositivityCabinet";
import BreakRoom from "./pages/tools/BreakRoom";
import Testing from "./pages/Testing";
import Arcade from "./pages/Arcade";

const queryClient = new QueryClient();

const App = () => {
  const flow = useDailyFlow();
  const selectedAnimal = useTodayPet();
  const [showPomodoroWin, setShowPomodoroWin] = useState(false);
  const [sessionDuration, setSessionDuration] = useState(25);
  
  // Initialize YouTube API early for better Break Room performance
  useEffect(() => {
    initializeYouTubeAPI().catch(error => {
      console.warn('App: YouTube API preload failed:', error);
    });
  }, []);

  useEffect(() => {
    const unsubscribe = focusTimer.on("complete", (phase) => {
      if (phase === "focus") {
        const config = focusTimer.getConfig();
        setSessionDuration(config.focusMin);
        setShowPomodoroWin(true);
      }
    });

    return unsubscribe;
  }, []);

  
  return (
    <AppErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Suspense fallback={
              <div className="min-h-screen flex items-center justify-center">
                <div className="text-lg">Loading your productivity dashboard...</div>
              </div>
            }>
              <AppLayout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/tools/tasks" element={<Tasks />} />
                  <Route path="/tools/positivity-cabinet" element={<PositivityCabinet />} />
                  <Route path="/tools/vision" element={<Vision />} />
                  <Route path="/tools/sounds" element={<Sounds />} />
                  <Route path="/tools/energy" element={<Energy />} />
                  
                  <Route path="/tools/theme" element={<Theme />} />
                  <Route path="/tools/focus" element={<Focus />} />
                  
                  <Route path="/tools/break-room" element={<BreakRoom />} />
                  <Route path="/arcade" element={<Arcade />} />
                  <Route path="/testing" element={<Testing />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </AppLayout>
            </Suspense>
            
            {/* Daily Flow Modals */}
            <DailyIntentionModal open={flow.showIntention} onClose={()=> flow.setShowIntention(false)} />
            <DebriefModal open={flow.showDebrief} onClose={()=> flow.setShowDebrief(false)} selectedAnimal={selectedAnimal} />
            <PomodoroWinModal 
              open={showPomodoroWin} 
              onClose={() => setShowPomodoroWin(false)}
              sessionDuration={sessionDuration}
            />
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </AppErrorBoundary>
  );
};

export default App;
