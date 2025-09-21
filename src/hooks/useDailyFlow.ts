import { useState, useEffect, useCallback } from "react";
import { shouldShowIntention, shouldShowDebrief, readPrefs, writePrefs, readTodayDebrief } from "@/lib/dailyFlow";
import { isFeatureVisible } from "@/lib/theme";
import { log } from "@/lib/log";

export default function useDailyFlow(){
  const [showIntention, setShowIntentionState] = useState(false);
  const [showDebrief, setShowDebriefState] = useState(false);

  // Use useCallback to prevent function recreation and ensure stable references
  const setShowIntention = useCallback((value: boolean) => {
    log.info(`useDailyFlow: setShowIntention called with: ${value}`);
    setShowIntentionState(value);
  }, []);

  const setShowDebrief = useCallback((value: boolean) => {
    log.info(`useDailyFlow: setShowDebrief called with: ${value}`);
    setShowDebriefState(value);
  }, []);

  useEffect(()=>{
    // Check if we should auto-show intention modal
    const shouldShow = shouldShowIntention();
    log.info("Checking if should show intention modal:", shouldShow);
    
    // Disable auto-showing intention modal to prevent blocking UI
    // Users can manually open it via the "Set Daily Intention" button
    if (false && shouldShow) {
      log.info("Auto-showing intention modal on startup");
      setShowIntention(true);
    }
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

  // Log current state for debugging
  useEffect(() => {
    log.debug("useDailyFlow state updated:", { showIntention, showDebrief });
  }, [showIntention, showDebrief]);

  return { 
    showIntention, 
    setShowIntention, 
    showDebrief, 
    setShowDebrief, 
    prefs, 
    setSignoffTime, 
    setAutoPrompt 
  };
}