import { useState, useEffect } from "react";
import { shouldShowIntention, shouldShowDebrief, readPrefs, writePrefs, readTodayDebrief } from "@/lib/dailyFlow";
import { isFeatureVisible } from "@/lib/theme";

export default function useDailyFlow(){
  const [showIntention,setShowIntention] = useState(false);
  const [showDebrief,setShowDebrief]     = useState(false);

  useEffect(()=>{
    if (shouldShowIntention()) setShowIntention(true);
  },[]);

  // soft scheduler: checks every minute while the app is open
  useEffect(()=>{
    const id = setInterval(()=>{
      // Check if debrief auto-show is enabled in theme settings
      const debriefAutoEnabled = isFeatureVisible('debriefAuto');
      const shouldShow = shouldShowDebrief(new Date());
      
      console.log('[useDailyFlow] Debrief check:', {
        debriefAutoEnabled,
        shouldShow,
        prefs: readPrefs(),
        currentTime: new Date().toLocaleTimeString(),
        hasDebrief: !!readTodayDebrief()
      });
      
      if (debriefAutoEnabled && shouldShow) {
        console.log('[useDailyFlow] Triggering debrief modal');
        setShowDebrief(true);
      }
    }, 60_000);
    return ()=> clearInterval(id);
  },[]);

  const prefs = readPrefs();
  function setSignoffTime(hhmm:string){ writePrefs({signoffTime:hhmm}); }
  function setAutoPrompt(v:boolean){ writePrefs({autoPrompt:v}); }

  return { showIntention, setShowIntention, showDebrief, setShowDebrief, prefs, setSignoffTime, setAutoPrompt };
}