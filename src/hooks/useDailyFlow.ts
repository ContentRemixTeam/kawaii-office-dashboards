import { useState, useEffect } from "react";
import { shouldShowIntention, shouldShowDebrief, readPrefs, writePrefs, readTodayDebrief } from "@/lib/dailyFlow";
import { isFeatureVisible } from "@/lib/theme";
import { log } from "@/lib/log";

export default function useDailyFlow(){
  const [showIntention,setShowIntention] = useState(false);
  const [showDebrief,setShowDebrief]     = useState(false);

  // Enhanced setter functions with logging
  const setShowIntentionWithLogging = (value: boolean) => {
    log.info(`Setting showIntention to: ${value}`);
    setShowIntention(value);
  };

  const setShowDebriefWithLogging = (value: boolean) => {
    log.info(`Setting showDebrief to: ${value}`);
    setShowDebrief(value);
  };

  useEffect(()=>{
    // Check if we should auto-show intention modal
    const shouldShow = shouldShowIntention();
    log.info("Checking if should show intention modal:", shouldShow);
    
    if (shouldShow) {
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
    setShowIntention: setShowIntentionWithLogging, 
    showDebrief, 
    setShowDebrief: setShowDebriefWithLogging, 
    prefs, 
    setSignoffTime, 
    setAutoPrompt 
  };
}