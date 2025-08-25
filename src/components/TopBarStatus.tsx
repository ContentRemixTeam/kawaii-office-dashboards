import React from "react";
import { useNavigate } from "react-router-dom";
import { onChanged } from "@/lib/bus";
import { readPowerWord, readAffirmation, readPet, readTrophies,
         K_ENERGY, K_AFFIRM, K_TASKS, K_TROPHIES } from "@/lib/topbar.readers";

export default function TopBarStatus(){
  const navigate = useNavigate();
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

  // Context-aware display values
  const stageLabel = pet.stage>=3?"Max":String(pet.stage);
  const petDisplay = pet.animal ? `${pet.animal} · S${stageLabel}` : "No pet";
  const wordDisplay = word || "Choose Word";
  const affirmDisplay = affirm || "Draw Card";

  return (
    <div className="flex items-center gap-2 overflow-x-auto max-w-full">
      <Pill 
        icon="🏆" 
        label="Trophies" 
        value={String(trophies)} 
        title="Go to Wins" 
        onClick={() => navigate('/tools/wins')}
      />
      <Pill 
        icon="🐾" 
        label="Pet" 
        value={petDisplay} 
        title="Go to Task Pets" 
        onClick={() => navigate('/tools/tasks')}
        isEmpty={!pet.animal}
      />
      <Pill 
        icon="⚡" 
        label="Word" 
        value={wordDisplay} 
        title="Go to Energy Word" 
        onClick={() => navigate('/tools/energy')}
        clamp 
        isEmpty={!word}
      />
      <Pill 
        icon="🃏" 
        label="Affirmation" 
        value={affirmDisplay} 
        title="Go to Affirmations" 
        onClick={() => navigate('/tools/affirmations')}
        clamp 
        wide 
        isEmpty={!affirm}
      />
    </div>
  );
}

function Pill({icon,label,value,title,clamp=false,wide=false,onClick,isEmpty=false}:{
  icon:string;
  label:string;
  value:string;
  title?:string;
  clamp?:boolean;
  wide?:boolean;
  onClick?:()=>void;
  isEmpty?:boolean;
}){
  const maxWidthClass = wide ? "max-w-[22rem]" : "max-w-[14rem]";
  
  return (
    <button 
      onClick={onClick}
      className={`shrink-0 group rounded-2xl border border-border/20 bg-card/80 backdrop-blur-sm px-3 py-2 shadow-sm hover:shadow-md hover:bg-card/90 transition-all duration-200
                   flex items-center gap-2 ${maxWidthClass} cursor-pointer`} 
      title={title}
    >
      <span className="text-base">{icon}</span>
      <span className="text-xs text-muted-foreground/70">{label}</span>
      <span className={`text-sm font-medium ${isEmpty ? 'text-muted-foreground/60' : 'text-foreground'} ${clamp?'truncate':''}`}>
        {value}
      </span>
    </button>
  );
}