import React from "react";
import { useNavigate } from "react-router-dom";
import { readEnergy, readAffirmation, readPetStage, readVisionThumbs, readEarnedAnimals } from "../lib/topbarState";
import { onChanged } from "../lib/bus";
import TopBarPetChip from "./TopBarPetChip";
import TopBarDailyButtons from "./TopBarDailyButtons";

function Chip({ icon, label, value, onClick }: {
  icon: React.ReactNode; 
  label: string; 
  value?: string | null; 
  onClick: () => void;
}) {
  
  return (
    <button
      onClick={onClick}
      className="group inline-flex min-w-[10rem] max-w-[16rem] items-center gap-2 rounded-2xl border bg-card/80 px-3 py-2 backdrop-blur shadow-sm hover:shadow-md transition-all"
    >
      <span className="text-lg">{icon}</span>
      <div className="min-w-0">
        <div className="text-[12px] text-muted-foreground">{label}</div>
        <div className="truncate text-sm text-foreground" title={value ?? ""}>
          {value ?? <span className="text-muted-foreground">Set up</span>}
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
          keys.includes("fm_earned_animals_v1")) {
        refresh();
      }
    });
    return unsubscribe;
  }, [refresh]);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          {/* Energy Word */}
          {energy && (
            <Chip 
              icon="⚡" 
              label="Power Word" 
              value={energy} 
              onClick={() => navigate("/tools/energy")}
            />
          )}
          
          {/* Affirmation */}
          {affirm.text && (
            <Chip 
              icon="💫" 
              label="Affirmation" 
              value={affirm.text} 
              onClick={() => navigate("/tools/affirmations")}
            />
          )}
          
          {/* Pet */}
          <TopBarPetChip animal={pet.animal} stage={pet.stage} />
          
          {/* Earned Animals */}
          {earnedAnimals.length > 0 && (
            <div className="inline-flex items-center gap-1 rounded-2xl border bg-card/80 px-3 py-2 backdrop-blur shadow-sm">
              <span className="text-xs text-muted-foreground">Earned:</span>
              {earnedAnimals.map((animal, i) => (
                <span key={animal.id} className="text-lg animate-bounce" style={{animationDelay: `${i * 0.2}s`}}>
                  {animal.emoji}
                </span>
              ))}
            </div>
          )}
          
          {/* Vision Board Thumbnails */}
          {thumbs.length > 0 && (
            <button
              onClick={() => navigate("/tools/vision")}
              className="inline-flex items-center gap-2 rounded-2xl border bg-card/80 px-3 py-2 backdrop-blur shadow-sm hover:shadow-md transition-all"
            >
              <span className="text-sm text-foreground">Vision</span>
              <div className="flex -space-x-1">
                {thumbs.slice(0, 3).map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt=""
                    className="w-6 h-6 rounded-full border-2 border-background object-cover"
                  />
                ))}
              </div>
            </button>
          )}
        </div>
        
        <TopBarDailyButtons />
      </div>
      
      {/* Spacer to prevent content from hiding behind fixed bar */}
      <div className="h-16" />
    </div>
  );
}