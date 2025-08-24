import React from "react";
import { useNavigate } from "react-router-dom";
import { onChanged } from "@/lib/bus";
import {
  readEnergy, readAffirmation, readPetStage, readVisionThumbs,
  KEY_ENERGY, KEY_AFFIRM, KEY_TASKS, KEY_VISION
} from "@/lib/topbarState";
import TopBarPetChip from "@/components/TopBarPetChip";

function Chip({ icon, label, value, href, title }: {
  icon: React.ReactNode; 
  label: string; 
  value?: string | null; 
  href: string; 
  title?: string;
}) {
  const navigate = useNavigate();
  
  return (
    <button
      onClick={() => navigate(href)}
      className="group inline-flex min-w-[10rem] max-w-[16rem] items-center gap-2 rounded-2xl border bg-card/80 px-3 py-2 backdrop-blur shadow-sm hover:shadow-md transition-all"
    >
      <span className="text-lg">{icon}</span>
      <div className="min-w-0">
        <div className="text-[12px] text-muted-foreground">{label}</div>
        <div className="truncate text-sm text-foreground" title={title ?? value ?? ""}>
          {value ?? <span className="text-muted-foreground">Set up</span>}
        </div>
      </div>
    </button>
  );
}

export default function TopControlBar() {
  const navigate = useNavigate();
  const [energy, setEnergy] = React.useState<string | null>(null);
  const [affirm, setAffirm] = React.useState<{ text: string | null; title: string | null }>({ text: null, title: null });
  const [pet, setPet] = React.useState<{ animal: string | null; stage: number }>({ animal: null, stage: 0 });
  const [thumbs, setThumbs] = React.useState<string[]>([]);

  const refresh = React.useCallback(() => {
    setEnergy(readEnergy());
    setAffirm(readAffirmation());
    setPet(readPetStage());
    setThumbs(readVisionThumbs(3));
  }, []);

  React.useEffect(() => {
    refresh();
    const unsubscribe = onChanged(keys => {
      if (keys.some(k => [KEY_ENERGY, KEY_AFFIRM, KEY_TASKS, KEY_VISION].includes(k))) {
        refresh();
      }
    });
    return unsubscribe;
  }, [refresh]);

  return (
    <div className="fixed top-0 inset-x-0 z-40">
      <div className="mx-auto max-w-6xl px-3 pt-3">
        <div className="rounded-3xl border bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5 backdrop-blur shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 p-2">
            {/* Left: Power Word + Affirmation */}
            <div className="flex flex-wrap items-center gap-2">
              <Chip 
                icon="✨" 
                label="Power Word" 
                value={energy || "Choose your word"} 
                href="/tools/energy" 
              />
              <Chip 
                icon="🃏" 
                label="Affirmation"
                value={affirm.text || "Draw your card"}
                title={affirm.text || undefined}
                href="/tools/affirmations" 
              />
            </div>

            {/* Right: Vision thumbs + Pet */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => navigate("/tools/vision")}
                className="group inline-flex items-center gap-2 rounded-2xl border bg-card/80 px-3 py-2 backdrop-blur shadow-sm hover:shadow-md transition-all"
              >
                <span className="text-lg">🖼️</span>
                <div className="text-[12px] text-muted-foreground">Vision</div>
                <div className="flex -space-x-2">
                  {thumbs.length ? thumbs.map((src, i) => (
                    <img 
                      key={i} 
                      src={src} 
                      alt="Vision" 
                      className="h-6 w-6 rounded-md border object-cover" 
                    />
                  )) : <span className="text-sm text-muted-foreground ml-1">Add images</span>}
                </div>
              </button>

              <TopBarPetChip animal={pet.animal} stage={pet.stage} />
            </div>
          </div>
        </div>
      </div>
      {/* Spacer so content doesn't slide under bar */}
      <div className="h-[92px]" />
    </div>
  );
}