import React from "react";
import { shouldShowIntention, shouldShowDebrief, readPrefs, writePrefs } from "@/lib/dailyFlow";

export default function useDailyFlow(){
  const [showIntention,setShowIntention] = React.useState(false);
  const [showDebrief,setShowDebrief]     = React.useState(false);

  React.useEffect(()=>{
    if (shouldShowIntention()) setShowIntention(true);
  },[]);

  // soft scheduler: checks every minute while the app is open
  React.useEffect(()=>{
    const id = setInterval(()=>{
      if (shouldShowDebrief(new Date())) setShowDebrief(true);
    }, 60_000);
    return ()=> clearInterval(id);
  },[]);

  const prefs = readPrefs();
  function setSignoffTime(hhmm:string){ writePrefs({signoffTime:hhmm}); }
  function setAutoPrompt(v:boolean){ writePrefs({autoPrompt:v}); }

  return { showIntention, setShowIntention, showDebrief, setShowDebrief, prefs, setSignoffTime, setAutoPrompt };
}