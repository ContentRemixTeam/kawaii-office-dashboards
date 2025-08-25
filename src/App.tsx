import React, { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import useDailyFlow from "./hooks/useDailyFlow";
import DailyIntentionModal from "./components/DailyIntentionModal";
import DebriefModal from "./components/DebriefModal";
import PomodoroWinModal from "./components/PomodoroWinModal";
import focusTimer from "@/lib/focusTimer";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import Tasks from "./pages/tools/Tasks";
import Vision from "./pages/tools/Vision";
import Sounds from "./pages/tools/Sounds";
import Energy from "./pages/tools/Energy";
import Habits from "./pages/tools/Habits";
import Theme from "./pages/tools/Theme";
import Focus from "./pages/tools/Focus";
import BeatClock from "./pages/tools/BeatClock";
import PositivityCabinet from "./pages/tools/PositivityCabinet";

const queryClient = new QueryClient();

const App = () => {
  const flow = useDailyFlow();
  const [showPomodoroWin, setShowPomodoroWin] = useState(false);
  const [sessionDuration, setSessionDuration] = useState(25);

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
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppLayout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/tools/tasks" element={<Tasks />} />
              <Route path="/tools/positivity-cabinet" element={<PositivityCabinet />} />
              <Route path="/tools/vision" element={<Vision />} />
              <Route path="/tools/sounds" element={<Sounds />} />
              <Route path="/tools/energy" element={<Energy />} />
              <Route path="/tools/habits" element={<Habits />} />
              <Route path="/tools/theme" element={<Theme />} />
              <Route path="/tools/focus" element={<Focus />} />
              <Route path="/tools/beat-clock" element={<BeatClock />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AppLayout>
          
          {/* Daily Flow Modals */}
          <DailyIntentionModal open={flow.showIntention} onClose={()=> flow.setShowIntention(false)} />
          <DebriefModal open={flow.showDebrief} onClose={()=> flow.setShowDebrief(false)} />
          <PomodoroWinModal 
            open={showPomodoroWin} 
            onClose={() => setShowPomodoroWin(false)}
            sessionDuration={sessionDuration}
          />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
