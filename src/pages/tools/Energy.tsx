import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Shuffle, Pin, PinOff } from "lucide-react";
import ToolShell from "@/components/ToolShell";
import { getDailyData, setDailyData, safeGet, safeSet } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";
import { emitChanged } from "@/lib/bus";
import { K_ENERGY } from "@/lib/topbar.readers";

interface EnergyWordData {
  word: string;
  isCustom: boolean;
  pinned?: boolean;
  position?: { x: number; y: number };
}

const PRESET_WORDS = {
  inspiring: ["Radiant", "Brilliant", "Luminous", "Vibrant", "Magnificent", "Sparkling", "Glowing", "Dazzling"],
  calming: ["Serene", "Peaceful", "Tranquil", "Gentle", "Flowing", "Soft", "Harmonious", "Balanced"],
  empowering: ["Fierce", "Unstoppable", "Confident", "Powerful", "Bold", "Courageous", "Strong", "Determined"]
};

const WordBadge = ({ word, isSelected }: { word: string; isSelected: boolean }) => (
  <div className={`
    px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer
    ${isSelected 
      ? 'bg-primary text-primary-foreground scale-105 shadow-glow' 
      : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground hover:scale-105'
    }
  `}>
    {word}
  </div>
);

const CurrentWordDisplay = ({ word }: { word: string }) => (
  <div className="fixed top-4 right-4 z-40 bg-gradient-kawaii text-primary-foreground px-4 py-2 rounded-full shadow-cute text-sm font-medium animate-pulse">
    ⚡ {word}
  </div>
);

export default function Energy() {
  const { toast } = useToast();
  const [todayWord, setTodayWord] = useState<EnergyWordData | null>(null);
  const [customWord, setCustomWord] = useState("");
  const [isPinned, setIsPinned] = useState(true);
  const [history, setHistory] = useState<Array<EnergyWordData & { date: string }>>([]);

  useEffect(() => {
    // Load today's word
    const wordData = getDailyData("fm_energy_v1", null);
    setTodayWord(wordData);
    setIsPinned(wordData?.pinned !== false);

    // Load history (last 7 days)
    const allHistory = safeGet<Array<EnergyWordData & { date: string }>>("fm_energy_history_v1", []);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentHistory = allHistory.filter(entry => 
      new Date(entry.date) >= sevenDaysAgo
    ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    setHistory(recentHistory);
  }, []);

  const selectWord = (word: string, isCustom = false) => {
    const today = new Date().toISOString().slice(0, 10);
    const wordData = { 
      date: today,
      word, 
      isCustom, 
      pinned: isPinned
    };
    setTodayWord(wordData);
    setDailyData("fm_energy_v1", wordData);
    
    // Add to history first
    const historyEntry = { ...wordData, date: new Date().toISOString().split('T')[0] };
    const updatedHistory = [historyEntry, ...history.filter(h => h.date !== historyEntry.date)];
    setHistory(updatedHistory);
    safeSet("fm_energy_history_v1", updatedHistory);

    // Emit change for TopBar updates after data is saved
    emitChanged([K_ENERGY]);
    
    console.log('Energy word selected, emitting events for:', K_ENERGY);

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
      const today = new Date().toISOString().slice(0, 10);
      const updatedData = { 
        date: today,
        word: todayWord.word, 
        isCustom: todayWord.isCustom,
        pinned: newPinned 
      };
      setTodayWord({ ...todayWord, pinned: newPinned });
      setDailyData("fm_energy_v1", updatedData);
      emitChanged([K_ENERGY]);
      
      console.log('Energy word pin toggled, emitting events for:', K_ENERGY);
    }
  };

  return (
    <ToolShell title="Energy Word Selector">
      <div className="space-y-6">
        {todayWord && <CurrentWordDisplay word={todayWord.word} />}
        
        <div className="bg-gradient-mint rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-white mb-3">⚡ Daily Energy Word</h2>
          <p className="text-white/90">
            Choose a powerful word that embodies the energy you want to carry throughout your day. Let it guide your actions and mindset.
          </p>
        </div>

        {todayWord ? (
          <>
            <div className="bg-gradient-kawaii rounded-2xl p-6 text-center">
              <h3 className="text-2xl font-bold text-primary-foreground mb-2">Today's Energy Word</h3>
              <div className="text-4xl font-bold text-primary-foreground mb-3">"{todayWord.word}"</div>
              <p className="text-primary-foreground/80">
                {todayWord.isCustom ? "Your personal power word" : "Let this word energize your day!"}
              </p>
              <p className="text-primary-foreground/60 text-sm mt-4">
                Come back tomorrow to choose a new word
              </p>
            </div>

            <div className="bg-card rounded-xl p-6 border border-border/20">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="pin-toggle" className="text-sm font-medium">
                    📌 Pin today's word to screen
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
            </div>
          </>
        ) : (
          <>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-card rounded-xl p-6 border border-border/20">
                <h3 className="font-semibold text-card-foreground mb-4 flex items-center gap-2">
                  🌟 Inspiring
                </h3>
                <div className="flex flex-wrap gap-2">
                  {PRESET_WORDS.inspiring.map((word) => (
                    <button
                      key={word}
                      onClick={() => selectWord(word)}
                      className="transition-transform hover:scale-105"
                    >
                      <WordBadge word={word} isSelected={false} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-card rounded-xl p-6 border border-border/20">
                <h3 className="font-semibold text-card-foreground mb-4 flex items-center gap-2">
                  🧘 Calming
                </h3>
                <div className="flex flex-wrap gap-2">
                  {PRESET_WORDS.calming.map((word) => (
                    <button
                      key={word}
                      onClick={() => selectWord(word)}
                      className="transition-transform hover:scale-105"
                    >
                      <WordBadge word={word} isSelected={false} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-card rounded-xl p-6 border border-border/20">
                <h3 className="font-semibold text-card-foreground mb-4 flex items-center gap-2">
                  💪 Empowering
                </h3>
                <div className="flex flex-wrap gap-2">
                  {PRESET_WORDS.empowering.map((word) => (
                    <button
                      key={word}
                      onClick={() => selectWord(word)}
                      className="transition-transform hover:scale-105"
                    >
                      <WordBadge word={word} isSelected={false} />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-card rounded-xl p-6 border border-border/20">
              <h3 className="font-semibold text-card-foreground mb-4">✨ Create Your Own</h3>
              <div className="flex gap-3">
                <div className="flex-1">
                  <Label className="text-sm text-muted-foreground">Your personal energy word</Label>
                  <Input
                    value={customWord}
                    onChange={(e) => setCustomWord(e.target.value)}
                    placeholder="Enter your word..."
                    className="mt-1"
                    onKeyDown={(e) => e.key === 'Enter' && selectCustomWord()}
                  />
                </div>
                <Button 
                  onClick={selectCustomWord}
                  disabled={!customWord.trim()}
                  className="btn btn-primary self-end"
                >
                  Choose
                </Button>
              </div>
            </div>
          </>
        )}

        {history.length > 0 && (
          <div className="bg-muted/30 rounded-xl p-6">
            <h3 className="font-semibold text-foreground mb-4">📅 Recent Energy Words</h3>
            <div className="flex flex-wrap gap-2">
              {history.map((entry, index) => (
                <div key={index} className="text-center">
                  <WordBadge word={entry.word} isSelected={false} />
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ToolShell>
  );
}