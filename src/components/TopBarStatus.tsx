import React from "react";
import { onChanged } from "@/lib/bus";
import { readPowerWord, readAffirmation, readPet, readTrophies,
         K_ENERGY, K_AFFIRM, K_TASKS, K_TROPHIES } from "@/lib/topbar.readers";

export default function TopBarStatus(){
  const [word, setWord] = React.useState("");
  const [affirm, setAffirm] = React.useState("");
  const [pet, setPet] = React.useState<{animal:string;stage:number}>({animal:"",stage:0});
  const [trophies, setTrophies] = React.useState(0);

  const refresh = React.useCallback(()=>{
    setWord(readPowerWord());
    setAffirm(readAffirmation());
    setPet(readPet());
    setTrophies(readTrophies());
  },[]);

  React.useEffect(()=>{
    refresh();
    return onChanged(keys=>{
      if (keys.some(k => [K_ENERGY,K_AFFIRM,K_TASKS,K_TROPHIES].includes(k))) refresh();
    });
  },[refresh]);

  // stage badge
  const stageLabel = pet.stage>=3?"Max":String(pet.stage);
  const petLabel = pet.animal ? `${pet.animal} · S${stageLabel}` : "No pet";

  return (
    <div className="flex items-center gap-2 overflow-x-auto max-w-full">
      <Pill icon="🏆" label="Trophies" value={String(trophies)} title="Pomodoro trophies today" />
      <Pill icon="🐾" label="Pet" value={petLabel} title="Today's task pet & stage" />
      <Pill icon="⚡" label="Word" value={word || "—"} title="Today's power word" clamp />
      <Pill icon="🃏" label="Affirmation" value={affirm || "—"} title={affirm || "No card drawn"} clamp wide />
    </div>
  );
}

function Pill({icon,label,value,title,clamp=false,wide=false}:{icon:string;label:string;value:string;title?:string;clamp?:boolean;wide?:boolean}){
  const maxWidthClass = wide ? "max-w-[22rem]" : "max-w-[14rem]";
  
  return (
    <div className={`shrink-0 group rounded-2xl border border-border/20 bg-card/80 backdrop-blur-sm px-3 py-2 shadow-sm hover:shadow-md transition-all duration-200
                     flex items-center gap-2 ${maxWidthClass}`} title={title}>
      <span className="text-base">{icon}</span>
      <span className="text-xs text-muted-foreground/70">{label}</span>
      <span className={`text-sm font-medium text-foreground ${clamp?'truncate':''}`}>{value}</span>
    </div>
  );
}