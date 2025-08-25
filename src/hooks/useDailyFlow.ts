import { useState, useEffect } from "react";
import { shouldShowIntention, shouldShowDebrief, readPrefs, writePrefs, readTodayDebrief } from "@/lib/dailyFlow";
import { isFeatureVisible } from "@/lib/theme";

export default function useDailyFlow(){
  const [showIntention,setShowIntention] = useState(false);
  const [showDebrief,setShowDebrief]     = useState(false);

  useEffect(()=>{
    if (shouldShowIntention()) setShowIntention(true);
  },[]);

  // Disable automatic debrief popup - user requested to stop it popping up while working
  useEffect(()=>{
    // Commented out the auto-debrief functionality
    // const id = setInterval(()=>{
    //   const debriefAutoEnabled = isFeatureVisible('debriefAuto');
    //   const shouldShow = shouldShowDebrief(new Date());
    //   
    //   if (debriefAutoEnabled && shouldShow) {
    //     setShowDebrief(true);
    //   }
    // }, 60_000);
    // return ()=> clearInterval(id);
  },[]);

  const prefs = readPrefs();
  function setSignoffTime(hhmm:string){ writePrefs({signoffTime:hhmm}); }
  function setAutoPrompt(v:boolean){ writePrefs({autoPrompt:v}); }

  return { showIntention, setShowIntention, showDebrief, setShowDebrief, prefs, setSignoffTime, setAutoPrompt };
}