import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Heart, 
  Sparkles, 
  Calendar, 
  ExternalLink, 
  Trash2, 
  Plus,
  RotateCw,
  Star,
  Gift,
  MessageCircle,
  Trophy,
  Target,
  Upload,
  Link2,
  X
} from "lucide-react";
import ToolShell from "@/components/ToolShell";
import OfficeHero from "@/components/OfficeHero";
import VisionPreviewOverlay from "@/components/VisionPreviewOverlay";
import { HOTSPOTS, OFFICE_ALT, OFFICE_IMAGE_SRC } from "@/data/hotspots";
import { FeatureErrorBoundary } from "@/components/ErrorBoundary";
import { safeGet, safeSet, generateId, getTodayISO } from "@/lib/storage";
import { getDailyData, setDailyData } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";
import { emitChanged } from "@/lib/bus";
import { K_AFFIRM, K_ENERGY } from "@/lib/topbar.readers";

import VisionBoardSection from "@/components/VisionBoardSection";

// Affirmations data
const AFFIRMATIONS = [
  "I am worthy of love and happiness",
  "I choose peace over perfection today",
  "My potential is limitless",
  "I trust in my ability to overcome challenges",
  "I am grateful for this moment",
  "I radiate positivity and attract abundance",
  "I am exactly where I need to be",
  "My dreams are valid and achievable",
  "I choose to see beauty in small moments",
  "I am strong, capable, and resilient",
  "I deserve all the good things coming my way",
  "I trust the process of my life",
  "I am open to new possibilities",
  "My inner wisdom guides me",
  "I celebrate my progress, no matter how small",
  "I am enough, just as I am",
  "I choose love over fear",
  "I am creating a life I love",
  "My heart is open to giving and receiving",
  "I find strength in my vulnerability",
  "I am aligned with my highest purpose",
  "I trust my intuition",
  "I am grateful for my unique journey",
  "I choose joy in this moment",
  "I am constantly growing and evolving"
];

// Type definitions
interface FutureNote {
  id: string;
  text: string;
  date: string;
}

interface CabinetNote {
  id: string;
  title: string;
  text: string;
  link?: string;
  category: string;
  createdAt: string;
}

interface MicroWin {
  id: string;
  text: string;
  date: string;
  week: string;
  source?: string;
}

interface GratitudeEntry {
  id: string;
  text: string;
  date: string;
}

interface DailyCard {
  date: string;
  cardIndex: number;
  text: string;
}

interface EnergyWordData {
  word: string;
  isCustom: boolean;
  pinned?: boolean;
}

// Helper functions
const getWeekKey = (date: Date) => {
  const year = date.getFullYear();
  const week = Math.ceil((date.getTime() - new Date(year, 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000));
  return `${year}-W${week}`;
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};

const categories = [
  { value: "kind-words", label: "Kind Words", icon: "💌" },
  { value: "testimonials", label: "Testimonials", icon: "⭐" },
  { value: "wins", label: "Big Wins", icon: "🏆" },
  { value: "memories", label: "Good Memories", icon: "📸" }
];

// Energy Word presets
const PRESET_WORDS = {
  inspiring: ["Radiant", "Brilliant", "Luminous", "Vibrant", "Magnificent", "Sparkling", "Glowing", "Dazzling"],
  calming: ["Serene", "Peaceful", "Tranquil", "Gentle", "Flowing", "Soft", "Harmonious", "Balanced"],
  empowering: ["Fierce", "Unstoppable", "Confident", "Powerful", "Bold", "Courageous", "Strong", "Determined"]
};

export default function PositivityCabinet() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'wins';
  const { toast } = useToast();
  
  const boardHotspot = HOTSPOTS.find(h => h.id === 'board')!;
  
  // Future Notes state
  const [futureNotes, setFutureNotes] = useState<FutureNote[]>([]);
  const [newFutureNote, setNewFutureNote] = useState("");
  
  // Cabinet state
  const [cabinetNotes, setCabinetNotes] = useState<CabinetNote[]>([]);
  const [newCabinetNote, setNewCabinetNote] = useState({
    title: "",
    text: "",
    link: "",
    category: "kind-words"
  });
  
  // Micro Wins state
  const [microWins, setMicroWins] = useState<MicroWin[]>([]);
  const [newMicroWin, setNewMicroWin] = useState("");
  
  // Gratitude state
  const [gratitudeEntries, setGratitudeEntries] = useState<GratitudeEntry[]>([]);
  const [newGratitude, setNewGratitude] = useState("");
  
  // Affirmations state
  const [todaysCard, setTodaysCard] = useState<DailyCard | null>(null);
  const [isFlipping, setIsFlipping] = useState(false);
  const [hasDrawnToday, setHasDrawnToday] = useState(false);
  const [cardHistory, setCardHistory] = useState<{ [date: string]: DailyCard }>({});

  // Energy Word state
  const [todayWord, setTodayWord] = useState<EnergyWordData | null>(null);
  const [customWord, setCustomWord] = useState("");
  const [isPinned, setIsPinned] = useState(true);

  // Load data on mount
  useEffect(() => {
    // Load Future Notes
    const notes = safeGet<FutureNote[]>("fm_future_notes_v1", []);
    setFutureNotes(notes);
    
    // Load Cabinet Notes
    const cabinet = safeGet<CabinetNote[]>("fm_cabinet_v1", []);
    setCabinetNotes(cabinet);
    
    // Load Micro Wins
    const wins = safeGet<MicroWin[]>("fm_wins_v1", []);
    setMicroWins(wins);
    
    // Load Gratitude
    const gratitude = safeGet<GratitudeEntry[]>("fm_gratitude_v1", []);
    setGratitudeEntries(gratitude);
    
    // Load today's affirmation card
    const existingCard = getDailyData("fm_affirmations_v1", null as DailyCard | null);
    if (existingCard) {
      setTodaysCard(existingCard);
      setHasDrawnToday(true);
    }
    
    // Load affirmation history
    const history = safeGet<{ [date: string]: DailyCard }>("fm_affirmation_history_v1", {});
    setCardHistory(history);

    // Load today's energy word
    const wordData = getDailyData("fm_energy_v1", null);
    setTodayWord(wordData);
    setIsPinned(wordData?.pinned !== false);
  }, []);

  // Future Notes functions
  const addFutureNote = () => {
    if (!newFutureNote.trim()) return;
    
    const note: FutureNote = {
      id: generateId(),
      text: newFutureNote.trim(),
      date: getTodayISO()
    };
    
    const updatedNotes = [note, ...futureNotes];
    setFutureNotes(updatedNotes);
    safeSet("fm_future_notes_v1", updatedNotes);
    setNewFutureNote("");
    
    toast({
      title: "Note Added",
      description: "Your future self will appreciate this encouragement!"
    });
  };

  const removeFutureNote = (id: string) => {
    const updatedNotes = futureNotes.filter(note => note.id !== id);
    setFutureNotes(updatedNotes);
    safeSet("fm_future_notes_v1", updatedNotes);
  };

  // Cabinet functions
  const addCabinetNote = () => {
    if (!newCabinetNote.title.trim() || !newCabinetNote.text.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in both title and content.",
        variant: "destructive"
      });
      return;
    }

    const note: CabinetNote = {
      id: generateId(),
      title: newCabinetNote.title.trim(),
      text: newCabinetNote.text.trim(),
      link: newCabinetNote.link.trim() || undefined,
      category: newCabinetNote.category,
      createdAt: new Date().toISOString()
    };

    const updatedNotes = [note, ...cabinetNotes];
    setCabinetNotes(updatedNotes);
    safeSet("fm_cabinet_v1", updatedNotes);
    setNewCabinetNote({ title: "", text: "", link: "", category: "kind-words" });

    toast({
      title: "Note Filed Away",
      description: "Added to your positivity cabinet!"
    });
  };

  const deleteCabinetNote = (id: string) => {
    const updatedNotes = cabinetNotes.filter(note => note.id !== id);
    setCabinetNotes(updatedNotes);
    safeSet("fm_cabinet_v1", updatedNotes);
    
    toast({
      title: "Note Removed",
      description: "Note has been deleted from your cabinet."
    });
  };

  const getCategoryNotes = (category: string) => {
    return cabinetNotes.filter(note => note.category === category);
  };

  // Micro Wins functions
  const addMicroWin = () => {
    if (!newMicroWin.trim()) return;

    const today = getTodayISO();
    const win: MicroWin = {
      id: generateId(),
      text: newMicroWin.trim(),
      date: today,
      week: getWeekKey(new Date())
    };

    const updatedWins = [win, ...microWins];
    setMicroWins(updatedWins);
    safeSet("fm_wins_v1", updatedWins);
    setNewMicroWin("");

    // Award a trophy for the micro win
    try {
      // Import trophy system dynamically to avoid circular deps
      import("@/lib/trophySystem").then(({ awardTrophy }) => {
        const { trophy, message } = awardTrophy(1); // 1 minute placeholder for micro win
        console.log('Trophy awarded for micro win:', trophy, message);
      });
    } catch (error) {
      console.log('Error awarding trophy for micro win:', error);
    }

    // Dispatch events for real-time updates
    window.dispatchEvent(new CustomEvent('winsUpdated'));
    window.dispatchEvent(new Event('storage'));

    toast({
      title: "Micro Win Added! 🎉",
      description: "Celebrating your progress!"
    });
  };

  const deleteMicroWin = (id: string) => {
    const updatedWins = microWins.filter(win => win.id !== id);
    setMicroWins(updatedWins);
    safeSet("fm_wins_v1", updatedWins);
    
    // Dispatch events for real-time updates
    window.dispatchEvent(new CustomEvent('winsUpdated'));
    window.dispatchEvent(new Event('storage'));
  };

  // Gratitude functions
  const addGratitude = () => {
    if (!newGratitude.trim()) return;
    
    const entry: GratitudeEntry = {
      id: generateId(),
      text: newGratitude.trim(),
      date: getTodayISO()
    };
    
    const updatedEntries = [entry, ...gratitudeEntries];
    setGratitudeEntries(updatedEntries);
    safeSet("fm_gratitude_v1", updatedEntries);
    setNewGratitude("");
    
    toast({
      title: "Gratitude Logged 🙏",
      description: "Your appreciation has been saved!"
    });
  };

  const deleteGratitude = (id: string) => {
    const updatedEntries = gratitudeEntries.filter(entry => entry.id !== id);
    setGratitudeEntries(updatedEntries);
    safeSet("fm_gratitude_v1", updatedEntries);
  };

  // Affirmation functions
  const drawDailyCard = () => {
    if (hasDrawnToday) return;

    setIsFlipping(true);
    
    const randomIndex = Math.floor(Math.random() * AFFIRMATIONS.length);
    const today = new Date().toISOString().split('T')[0];
    const newCard: DailyCard = {
      date: today,
      cardIndex: randomIndex,
      text: AFFIRMATIONS[randomIndex]
    };

    setTimeout(() => {
      setTodaysCard(newCard);
      setDailyData("fm_affirmations_v1", newCard);
      
      const updatedHistory = { ...cardHistory, [today]: newCard };
      setCardHistory(updatedHistory);
      safeSet("fm_affirmation_history_v1", updatedHistory);
      
      setHasDrawnToday(true);
      setIsFlipping(false);

      emitChanged([K_AFFIRM]);
    }, 1000);
  };

  // Energy Word functions
  const selectWord = (word: string, isCustom = false) => {
    const today = new Date().toISOString().slice(0, 10);
    const wordData = { 
      word, 
      isCustom, 
      pinned: isPinned
    };
    setTodayWord(wordData);
    setDailyData("fm_energy_v1", wordData);
    
    emitChanged([K_ENERGY]);
    
    toast({
      title: "✨ Energy word selected!",
      description: `"${word}" will guide your day with positive energy.`
    });
  };

  const selectCustomWord = () => {
    if (!customWord.trim()) return;
    selectWord(customWord.trim(), true);
    setCustomWord("");
  };

  const togglePin = (newPinned: boolean) => {
    setIsPinned(newPinned);
    if (todayWord) {
      const updatedData = { 
        word: todayWord.word, 
        isCustom: todayWord.isCustom,
        pinned: newPinned 
      };
      setTodayWord({ ...todayWord, pinned: newPinned });
      setDailyData("fm_energy_v1", updatedData);
      emitChanged([K_ENERGY]);
    }
  };

  // Get recent wins for this week
  const thisWeekWins = microWins.filter(win => win.week === getWeekKey(new Date()));
  const todaysGratitude = gratitudeEntries.filter(entry => entry.date === getTodayISO());

  return (
    <ToolShell title="Positivity Corner">
      <div className="space-y-6">
        {/* Header with Perfect Contrast */}
        <div className="bg-gradient-primary rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-3 text-brand-readable">✨ Your Personal Vault of Positivity</h2>
          <p className="text-brand-readable opacity-90">
            Store encouragement, celebrate wins, practice gratitude, and draw daily inspiration. 
            Everything you need to stay motivated and positive.
          </p>
        </div>

        {/* Professional Clean Menu Design */}
        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="w-full h-auto p-1 bg-card border border-border rounded-xl grid grid-cols-7 gap-1">
            <TabsTrigger 
              value="wins" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm text-sm font-medium px-3 py-2.5 rounded-lg transition-all duration-200 hover:bg-muted/80"
            >
              <Trophy className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Micro Wins</span>
              <span className="sm:hidden">Wins</span>
            </TabsTrigger>
            <TabsTrigger 
              value="gratitude" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm text-sm font-medium px-3 py-2.5 rounded-lg transition-all duration-200 hover:bg-muted/80"
            >
              <Heart className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Gratitude</span>
              <span className="sm:hidden">Thanks</span>
            </TabsTrigger>
            <TabsTrigger 
              value="affirmations" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm text-sm font-medium px-3 py-2.5 rounded-lg transition-all duration-200 hover:bg-muted/80"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Affirmations</span>
              <span className="sm:hidden">Cards</span>
            </TabsTrigger>
            <TabsTrigger 
              value="energy" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm text-sm font-medium px-3 py-2.5 rounded-lg transition-all duration-200 hover:bg-muted/80"
            >
              <Star className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Energy</span>
              <span className="sm:hidden">Word</span>
            </TabsTrigger>
            <TabsTrigger 
              value="future" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm text-sm font-medium px-3 py-2.5 rounded-lg transition-all duration-200 hover:bg-muted/80"
            >
              <Calendar className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Future Notes</span>
              <span className="sm:hidden">Future</span>
            </TabsTrigger>
            <TabsTrigger 
              value="cabinet" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm text-sm font-medium px-3 py-2.5 rounded-lg transition-all duration-200 hover:bg-muted/80"
            >
              <Gift className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Cabinet</span>
              <span className="sm:hidden">Store</span>
            </TabsTrigger>
            <TabsTrigger 
              value="vision" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm text-sm font-medium px-3 py-2.5 rounded-lg transition-all duration-200 hover:bg-muted/80"
            >
              <Target className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Vision</span>
              <span className="sm:hidden">Goals</span>
            </TabsTrigger>
          </TabsList>

          {/* Micro Wins Tab */}
          <TabsContent value="wins" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  Log a Micro Win
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="What small win would you like to celebrate?"
                    value={newMicroWin}
                    onChange={(e) => setNewMicroWin(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addMicroWin()}
                  />
                  <Button onClick={addMicroWin} disabled={!newMicroWin.trim()}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* This Week's Wins */}
            <Card>
              <CardHeader>
                <CardTitle>This Week's Wins ({thisWeekWins.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {thisWeekWins.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    No wins recorded this week yet. Add your first win above!
                  </p>
                ) : (
                  <div className="space-y-3">
                    {thisWeekWins.slice(0, 10).map((win, index) => (
                      <div key={win.id} className={`flex items-start gap-3 p-3 rounded-lg border ${index === 0 ? 'bg-primary/5 border-primary/20' : 'bg-muted/50'}`}>
                        <div className="flex-shrink-0">
                          {index === 0 && <Sparkles className="w-5 h-5 text-primary animate-pulse" />}
                          {index > 0 && <span className="text-lg">🎉</span>}
                        </div>
                        <div className="flex-1">
                          <p className="text-foreground">{win.text}</p>
                          <p className="text-xs text-muted-foreground">{new Date(win.date).toLocaleDateString()}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteMicroWin(win.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Gratitude Tab */}
          <TabsContent value="gratitude" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5" />
                  What are you grateful for today?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="I'm grateful for..."
                    value={newGratitude}
                    onChange={(e) => setNewGratitude(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addGratitude()}
                  />
                  <Button onClick={addGratitude} disabled={!newGratitude.trim()}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Today's Gratitude */}
            {todaysGratitude.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Today's Gratitude</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {todaysGratitude.map(entry => (
                      <div key={entry.id} className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
                        <span className="text-lg">🙏</span>
                        <div className="flex-1">
                          <p className="text-foreground">{entry.text}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteGratitude(entry.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recent Gratitude */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Gratitude</CardTitle>
              </CardHeader>
              <CardContent>
                {gratitudeEntries.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    Start your gratitude practice by adding what you're thankful for above.
                  </p>
                ) : (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {gratitudeEntries.filter(entry => entry.date !== getTodayISO()).slice(0, 10).map(entry => (
                      <div key={entry.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                        <span className="text-lg">💝</span>
                        <div className="flex-1">
                          <p className="text-foreground">{entry.text}</p>
                          <p className="text-xs text-muted-foreground">{new Date(entry.date).toLocaleDateString()}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteGratitude(entry.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Affirmations Tab */}
          <TabsContent value="affirmations" className="space-y-6">
            <div className="flex flex-col items-center space-y-6">
              {!hasDrawnToday ? (
                <div className="text-center space-y-6">
                  <div className="w-80 h-[420px] mx-auto perspective-1000">
                    <div 
                      className={`relative w-full h-full transition-transform duration-1000 transform-style-preserve-3d ${
                        isFlipping ? 'rotate-y-180' : ''
                      }`}
                    >
                      <Card className="absolute inset-0 w-full h-full backface-hidden bg-gradient-to-br from-pink-100 via-purple-50 to-blue-100 border-3 border-white/60 shadow-[0_12px_40px_rgba(0,0,0,0.15)] backdrop-blur-sm rounded-3xl overflow-hidden">
                        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMiIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjMpIi8+CjxjaXJjbGUgY3g9IjEwIiBjeT0iMTAiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4yKSIvPgo8Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIxLjUiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4yNSkiLz4KPC9zdmc+')] opacity-40"></div>
                        <CardContent className="relative flex items-center justify-center h-full p-8">
                          <div className="text-center">
                            <div className="relative mb-6">
                              <Sparkles className="w-20 h-20 text-purple-400 mx-auto animate-pulse" />
                              <div className="absolute -top-2 -right-2 w-6 h-6 bg-pink-200 rounded-full flex items-center justify-center">
                                <span className="text-xs">✨</span>
                              </div>
                              <div className="absolute -bottom-1 -left-1 w-4 h-4 bg-blue-200 rounded-full flex items-center justify-center">
                                <span className="text-xs">💫</span>
                              </div>
                            </div>
                            <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
                              Your Daily Affirmation
                            </h3>
                            <p className="text-gray-600 text-sm leading-relaxed">
                              Ready to discover today's magical inspiration?
                            </p>
                            <div className="flex justify-center space-x-2 mt-4">
                              <span className="w-2 h-2 bg-pink-300 rounded-full animate-bounce"></span>
                              <span className="w-2 h-2 bg-purple-300 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></span>
                              <span className="w-2 h-2 bg-blue-300 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={drawDailyCard}
                    disabled={isFlipping}
                    size="lg"
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 rounded-2xl px-8 py-4 text-lg font-semibold"
                  >
                    {isFlipping ? (
                      <>
                        <RotateCw className="w-5 h-5 mr-3 animate-spin" />
                        ✨ Drawing Your Magic Card...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 mr-3" />
                        🎴 Draw Daily Card
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                todaysCard && (
                  <div className="text-center space-y-6">
                    <Badge variant="secondary" className="mb-4 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border-purple-200 px-4 py-2 rounded-full">
                      <Calendar className="w-4 h-4 mr-2" />
                      Today's Magical Card ✨
                    </Badge>
                    
                    <Card className="w-80 h-[420px] mx-auto bg-gradient-to-br from-yellow-100 via-orange-50 to-pink-100 border-3 border-white/60 shadow-[0_12px_40px_rgba(0,0,0,0.15)] backdrop-blur-sm rounded-3xl overflow-hidden transform hover:scale-[1.02] transition-all duration-300">
                      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMiIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjMpIi8+CjxjaXJjbGUgY3g9IjEwIiBjeT0iMTAiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4yKSIvPgo8Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIxLjUiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4yNSkiLz4KPC9zdmc+')] opacity-40"></div>
                      <CardContent className="relative flex items-center justify-center h-full p-8">
                        <div className="text-center">
                          <div className="relative mb-8">
                            <Heart className="w-16 h-16 text-orange-400 mx-auto animate-pulse" />
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-pink-200 rounded-full flex items-center justify-center">
                              <span className="text-xs">💝</span>
                            </div>
                            <div className="absolute -bottom-1 -left-1 w-4 h-4 bg-yellow-200 rounded-full flex items-center justify-center">
                              <span className="text-xs">⭐</span>
                            </div>
                            <div className="absolute top-2 left-2 w-3 h-3 bg-orange-200 rounded-full flex items-center justify-center">
                              <span className="text-xs">✨</span>
                            </div>
                          </div>
                          <blockquote className="text-xl font-semibold text-gray-700 leading-relaxed px-4">
                            "{todaysCard.text}"
                          </blockquote>
                          <div className="flex justify-center space-x-1 mt-6">
                            <span className="w-1.5 h-1.5 bg-orange-300 rounded-full"></span>
                            <span className="w-1.5 h-1.5 bg-pink-300 rounded-full"></span>
                            <span className="w-1.5 h-1.5 bg-yellow-300 rounded-full"></span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <p className="text-muted-foreground text-sm bg-gradient-to-r from-purple-100 to-pink-100 px-4 py-2 rounded-full inline-block">
                      🌸 Come back tomorrow for new inspiration 🌸
                    </p>
                  </div>
                )
              )}
            </div>
          </TabsContent>

          {/* Energy Word Tab */}
          <TabsContent value="energy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Daily Energy Word
                </CardTitle>
                <CardDescription>
                  Choose a powerful word that embodies the energy you want to carry throughout your day.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {todayWord ? (
                  <div className="space-y-4">
                    <div className="bg-gradient-primary rounded-xl p-6 text-center">
                      <h3 className="text-xl font-bold text-white mb-2">Today's Energy Word</h3>
                      <div className="text-3xl font-bold text-white mb-2">"{todayWord.word}"</div>
                      <p className="text-white/80 text-sm">
                        {todayWord.isCustom ? "Your personal power word" : "Let this word energize your day!"}
                      </p>
                    </div>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="pin-toggle" className="text-sm font-medium">
                              📌 Pin word to screen
                            </Label>
                            <p className="text-xs text-muted-foreground mt-1">
                              Show a floating badge on all pages
                            </p>
                          </div>
                          <Switch
                            id="pin-toggle"
                            checked={isPinned}
                            onCheckedChange={togglePin}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="space-y-3">
                        <h4 className="font-medium text-sm flex items-center gap-2">
                          🌟 Inspiring
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {PRESET_WORDS.inspiring.map((word) => (
                            <Button
                              key={word}
                              variant="outline"
                              size="sm"
                              onClick={() => selectWord(word)}
                              className="text-xs"
                            >
                              {word}
                            </Button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h4 className="font-medium text-sm flex items-center gap-2">
                          🧘 Calming
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {PRESET_WORDS.calming.map((word) => (
                            <Button
                              key={word}
                              variant="outline"
                              size="sm"
                              onClick={() => selectWord(word)}
                              className="text-xs"
                            >
                              {word}
                            </Button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h4 className="font-medium text-sm flex items-center gap-2">
                          💪 Empowering
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {PRESET_WORDS.empowering.map((word) => (
                            <Button
                              key={word}
                              variant="outline"
                              size="sm"
                              onClick={() => selectWord(word)}
                              className="text-xs"
                            >
                              {word}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-medium text-sm">✨ Create Your Own</h4>
                      <div className="flex gap-2">
                        <Input
                          value={customWord}
                          onChange={(e) => setCustomWord(e.target.value)}
                          placeholder="Enter your word..."
                          onKeyDown={(e) => e.key === 'Enter' && selectCustomWord()}
                        />
                        <Button 
                          onClick={selectCustomWord}
                          disabled={!customWord.trim()}
                        >
                          Choose
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Future Notes Tab */}
          <TabsContent value="future" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Write to Your Future Self
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Dear Future Me, remember that you are..."
                  value={newFutureNote}
                  onChange={(e) => setNewFutureNote(e.target.value)}
                  className="min-h-[100px]"
                />
                <Button onClick={addFutureNote} disabled={!newFutureNote.trim()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Save Note
                </Button>
              </CardContent>
            </Card>

            {/* Notes List */}
            <div className="space-y-4">
              {futureNotes.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">No notes yet</h3>
                    <p className="text-muted-foreground text-sm">
                      Write your first encouraging note to your future self above
                    </p>
                  </CardContent>
                </Card>
              ) : (
                futureNotes.map(note => (
                  <Card key={note.id} className="p-4">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">💌</span>
                      <div className="flex-1">
                        <p className="text-foreground leading-relaxed">{note.text}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Written on {new Date(note.date).toLocaleDateString()}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFutureNote(note.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Cabinet Tab */}
          <TabsContent value="cabinet" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="w-5 h-5" />
                  Add New Encouragement
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Category</Label>
                  <Select
                    value={newCabinetNote.category}
                    onValueChange={(value) => setNewCabinetNote({...newCabinetNote, category: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.icon} {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Title</Label>
                  <Input
                    placeholder="Give this encouragement a title..."
                    value={newCabinetNote.title}
                    onChange={(e) => setNewCabinetNote({...newCabinetNote, title: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label>Content</Label>
                  <Textarea
                    placeholder="The encouraging words, testimonial, or memory..."
                    value={newCabinetNote.text}
                    onChange={(e) => setNewCabinetNote({...newCabinetNote, text: e.target.value})}
                    className="min-h-[100px]"
                  />
                </div>
                
                <div>
                  <Label>Link (optional)</Label>
                  <Input
                    placeholder="https://... (optional reference link)"
                    value={newCabinetNote.link}
                    onChange={(e) => setNewCabinetNote({...newCabinetNote, link: e.target.value})}
                  />
                </div>
                
                <Button 
                  onClick={addCabinetNote} 
                  disabled={!newCabinetNote.title.trim() || !newCabinetNote.text.trim()}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  File Away
                </Button>
              </CardContent>
            </Card>

            {/* Categories */}
            <Tabs defaultValue="kind-words" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                {categories.map(cat => (
                  <TabsTrigger key={cat.value} value={cat.value}>
                    {cat.icon} {cat.label}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              {categories.map(cat => (
                <TabsContent key={cat.value} value={cat.value} className="space-y-4">
                  {getCategoryNotes(cat.value).length === 0 ? (
                    <Card>
                      <CardContent className="p-8 text-center">
                        <div className="text-4xl mb-4">{cat.icon}</div>
                        <h3 className="text-lg font-semibold text-foreground mb-2">No {cat.label.toLowerCase()} yet</h3>
                        <p className="text-muted-foreground text-sm">
                          Add your first {cat.label.toLowerCase()} using the form above
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    getCategoryNotes(cat.value).map(note => (
                      <Card key={note.id} className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="text-2xl">{cat.icon}</div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-foreground mb-2">{note.title}</h4>
                            <p className="text-foreground leading-relaxed mb-2">{note.text}</p>
                            {note.link && (
                              <a 
                                href={note.link} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-primary text-sm hover:underline"
                              >
                                <ExternalLink className="w-3 h-3" />
                                View Link
                              </a>
                            )}
                            <p className="text-xs text-muted-foreground mt-2">
                              {formatDate(note.createdAt.split('T')[0])}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteCabinetNote(note.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </Card>
                    ))
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </TabsContent>

          {/* Vision Board Tab */}
          <TabsContent value="vision" className="space-y-6">
            <VisionBoardSection />
          </TabsContent>
        </Tabs>
      </div>
    </ToolShell>
  );
}