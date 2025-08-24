import React from "react";
import { useNavigate } from "react-router-dom";
import { readEnergy, readAffirmation, readPetStage, readVisionThumbs, readEarnedAnimals } from "../lib/topbarState";
import { onChanged } from "../lib/bus";
import { isFeatureVisible } from "../lib/theme";
import TrophyCounter from "./TrophyCounter";
import TopBarPetChip from "./TopBarPetChip";
import TopBarDailyButtons from "./TopBarDailyButtons";

function DailyInfoPill({ icon, label, value, onClick }: {
  icon: React.ReactNode; 
  label: string; 
  value?: string | null; 
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group inline-flex items-center gap-2 rounded-full border border-border/20 bg-card/60 backdrop-blur-sm px-3 py-1.5 shadow-sm hover:shadow-md hover:bg-card/80 transition-all duration-200"
    >
      <span className="text-sm">{icon}</span>
      <div className="min-w-0">
        <div className="text-xs text-muted-foreground/80">{label}</div>
        <div className="truncate text-xs font-medium text-foreground max-w-24" title={value ?? ""}>
          {value ?? "Set up"}
        </div>
      </div>
    </button>
  );
}

export default function TopControlBar() {
  const navigate = useNavigate();
  const [energy, setEnergy] = React.useState<string | null>(null);
  const [affirm, setAffirm] = React.useState<{text: string | null; title: string | null}>({ text: null, title: null });
  const [pet, setPet] = React.useState<{animal: string | null; stage: number}>({ animal: null, stage: 0 });
  const [thumbs, setThumbs] = React.useState<string[]>([]);
  const [earnedAnimals, setEarnedAnimals] = React.useState<{id: string; emoji: string}[]>([]);

  const refresh = React.useCallback(() => {
    console.log('TopBar refreshing...');
    const energyData = readEnergy();
    const affirmData = readAffirmation();
    const petData = readPetStage();
    const thumbsData = readVisionThumbs(3);
    const earnedData = readEarnedAnimals();
    
    console.log('TopBar data:', { energyData, affirmData, petData, thumbsData, earnedData });
    
    setEnergy(energyData);
    setAffirm(affirmData);
    setPet(petData);
    setThumbs(thumbsData);
    setEarnedAnimals(earnedData);
  }, []);

  React.useEffect(() => {
    refresh();
    const unsubscribe = onChanged(keys => {
      if (keys.includes("fm_energy_v1") || 
          keys.includes("fm_affirmations_v1") || 
          keys.includes("fm_tasks_v1") || 
          keys.includes("fm_vision_v1") ||
          keys.includes("fm_daily_intention_v1") ||
          keys.includes("fm_daily_debrief_v1") ||
          keys.includes("fm_earned_animals_v1") ||
          keys.includes("fm_trophies_v1") ||
          keys.includes("fm_trophy_stats_v1")) {
        refresh();
      }
    });
    return unsubscribe;
  }, [refresh]);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/10">
      <div className="flex items-center justify-between pl-12 pr-4 py-2">
        {/* Daily Info Pills */}
        <div className="flex items-center gap-2 overflow-x-auto">{/* Leave space for sidebar trigger */}
          {isFeatureVisible('topBarEnergyWord') && energy && (
            <DailyInfoPill 
              icon="⚡" 
              label="Power" 
              value={energy} 
              onClick={() => navigate("/tools/energy")}
            />
          )}
          
          {isFeatureVisible('topBarAffirmations') && affirm.text && (
            <DailyInfoPill 
              icon="🃏" 
              label="Affirmation" 
              value={affirm.text} 
              onClick={() => navigate("/tools/affirmations")}
            />
          )}
          
          {isFeatureVisible('topBarTaskPet') && pet.animal && (
            <button
              onClick={() => navigate("/tools/tasks")}
              className="inline-flex items-center gap-2 rounded-full border border-border/20 bg-card/60 backdrop-blur-sm px-3 py-1.5 shadow-sm hover:shadow-md hover:bg-card/80 transition-all duration-200"
            >
              <span className="text-sm">⭐</span>
              <div className="min-w-0">
                <div className="text-xs text-muted-foreground/80">Big Three</div>
                <div className="text-xs font-medium text-foreground">
                  {pet.stage}/3
                </div>
              </div>
            </button>
          )}
          
          {/* Trophy Counter */}
          <TrophyCounter />
          
          {/* Earned Animals Row */}
          {isFeatureVisible('topBarEarnedAnimals') && earnedAnimals.length > 0 && (
            <div className="inline-flex items-center gap-1 rounded-full border border-border/20 bg-gradient-to-r from-primary/10 to-primary/5 backdrop-blur-sm px-3 py-1.5 shadow-sm">
              <span className="text-xs text-muted-foreground/80">Earned:</span>
              {earnedAnimals.slice(0, 3).map((animal, i) => (
                <span key={animal.id} className="text-sm animate-bounce" style={{animationDelay: `${i * 0.2}s`}}>
                  {animal.emoji}
                </span>
              ))}
              {earnedAnimals.length > 3 && (
                <span className="text-xs text-muted-foreground">+{earnedAnimals.length - 3}</span>
              )}
            </div>
          )}
        </div>
        
        <TopBarDailyButtons />
      </div>
    </div>
  );
}