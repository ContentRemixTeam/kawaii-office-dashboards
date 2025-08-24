import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import TopControlBar from "@/components/TopControlBar";
import NavigationDrawer from "@/components/NavigationDrawer";
import useDailyFlow from "./hooks/useDailyFlow";
import DailyIntentionModal from "./components/DailyIntentionModal";
import DebriefModal from "./components/DebriefModal";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import Tasks from "./pages/tools/Tasks";
import Cabinet from "./pages/tools/Cabinet";
import Vision from "./pages/tools/Vision";
import Sounds from "./pages/tools/Sounds";
import Affirmations from "./pages/tools/Affirmations";
import Money from "./pages/tools/Money";
import Energy from "./pages/tools/Energy";
import Breaks from "./pages/tools/Breaks";
import Habits from "./pages/tools/Habits";
import Wins from "./pages/tools/Wins";
import Theme from "./pages/tools/Theme";
import Focus from "./pages/tools/Focus";

const queryClient = new QueryClient();

const App = () => {
  const flow = useDailyFlow();
  
  return (
    <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <TopControlBar />
        <NavigationDrawer />
        <main className="pt-16 min-h-screen w-full">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/tools/tasks" element={<Tasks />} />
            <Route path="/tools/cabinet" element={<Cabinet />} />
            <Route path="/tools/vision" element={<Vision />} />
            <Route path="/tools/sounds" element={<Sounds />} />
            <Route path="/tools/affirmations" element={<Affirmations />} />
            <Route path="/tools/money" element={<Money />} />
            <Route path="/tools/energy" element={<Energy />} />
            <Route path="/tools/breaks" element={<Breaks />} />
            <Route path="/tools/habits" element={<Habits />} />
            <Route path="/tools/wins" element={<Wins />} />
            <Route path="/tools/theme" element={<Theme />} />
            <Route path="/tools/focus" element={<Focus />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        
        {/* Daily Flow Modals */}
        <DailyIntentionModal open={flow.showIntention} onClose={()=> flow.setShowIntention(false)} />
        <DebriefModal open={flow.showDebrief} onClose={()=> flow.setShowDebrief(false)} />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  );
};

export default App;
