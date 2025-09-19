import React from "react";
import { useNavigate } from "react-router-dom";
import { onChanged } from "@/lib/bus";
import { readPowerWord, readAffirmation } from "@/lib/topbar.readers";
import { getCurrencyData, formatCurrency, type CurrencyData } from "@/lib/unifiedCurrency";
import { Coins } from "lucide-react";

export default function TopBarStatus(){
  const navigate = useNavigate();
  const [word, setWord] = React.useState("");
  const [affirm, setAffirm] = React.useState("");
  const [currencyData, setCurrencyData] = React.useState<CurrencyData>(getCurrencyData());

  const refresh = React.useCallback(()=>{
    console.log('TopBarStatus refreshing data...');
    
    const word = readPowerWord();
    const affirmation = readAffirmation();
    const currency = getCurrencyData();
    
    console.log('TopBarStatus data:', { word, affirmation, currency });
    
    setWord(word);
    setAffirm(affirmation);
    setCurrencyData(currency);
  },[]);

  React.useEffect(()=>{
    refresh();
    return onChanged(keys=>{
      console.log('TopBarStatus received change events for keys:', keys);
      if (keys.includes('fm_energy_v1') || keys.includes('fm_affirmations_v1') || keys.includes('fm_unified_currency_v1')) {
        console.log('TopBarStatus triggering refresh for matching keys');
        refresh();
      }
    });
  },[refresh]);

  // Context-aware display values
  const wordDisplay = word || "Choose Word";
  const affirmDisplay = affirm || "Draw Card";

  return (
    <div className="flex items-center gap-2 overflow-x-auto max-w-full">
      <Pill 
        icon={<Coins className="w-4 h-4 text-yellow-500" />}
        label="Coins" 
        value={formatCurrency(currencyData.coins)} 
        title="Your earned coins" 
        onClick={() => navigate('/tools/tasks')}
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
        onClick={() => navigate('/tools/positivity-cabinet?tab=affirmations')}
        clamp 
        wide
        isEmpty={!affirm}
      />
    </div>
  );
}

function Pill({icon,label,value,title,clamp=false,wide=false,onClick,isEmpty=false}:{
  icon:string | React.ReactElement;
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
      <span className="text-base">{typeof icon === 'string' ? icon : icon}</span>
      <span className="text-xs text-muted-foreground/70">{label}</span>
      <span className={`text-sm font-medium ${isEmpty ? 'text-muted-foreground/60' : 'text-foreground'} ${clamp?'truncate':''}`}>
        {value}
      </span>
    </button>
  );
}