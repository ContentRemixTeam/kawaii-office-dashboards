import { useState, useEffect } from "react";
import { shouldShowIntention, shouldShowDebrief, readPrefs, writePrefs } from "@/lib/dailyFlow";

export default function useDailyFlow(){
  const [showIntention,setShowIntention] = useState(false);
  const [showDebrief,setShowDebrief]     = useState(false);

  useEffect(()=>{
    if (shouldShowIntention()) setShowIntention(true);
  },[]);

  // soft scheduler: checks every minute while the app is open
  useEffect(()=>{
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