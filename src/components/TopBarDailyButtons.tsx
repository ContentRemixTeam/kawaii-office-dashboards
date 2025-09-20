import React from "react";
import useDailyFlow from "@/hooks/useDailyFlow";

export default function TopBarDailyButtons() {
  const f = useDailyFlow();
  
  const handleIntentionClick = () => {
    console.log('=== INTENTION CLICK START ===');
    console.log('Current showIntention:', f.showIntention);
    console.log('setShowIntention function exists:', typeof f.setShowIntention);
    f.setShowIntention(true);
    console.log('After setShowIntention(true) call completed');
    console.log('=== INTENTION CLICK END ===');
  };

  const handleDebriefClick = () => {
    console.log('=== DEBRIEF CLICK START ===');
    console.log('Current showDebrief:', f.showDebrief);
    f.setShowDebrief(true);
    console.log('After setShowDebrief(true) call completed');
    console.log('=== DEBRIEF CLICK END ===');
  };

  return (
    <div className="flex items-center gap-2">
      <button 
        onClick={handleIntentionClick}
        onMouseDown={() => console.log('INTENTION MOUSE DOWN')}
        onMouseUp={() => console.log('INTENTION MOUSE UP')}
        style={{
          pointerEvents: 'auto',
          zIndex: 1000,
          position: 'relative',
          backgroundColor: '#ffffff',
          border: '1px solid #ccc',
          padding: '8px 16px',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '500'
        }}
      >
        ✨ Intention
      </button>
      
      <button 
        onClick={handleDebriefClick}
        onMouseDown={() => console.log('DEBRIEF MOUSE DOWN')}
        onMouseUp={() => console.log('DEBRIEF MOUSE UP')}
        style={{
          pointerEvents: 'auto',
          zIndex: 1000,
          position: 'relative',
          backgroundColor: '#ffffff',
          border: '1px solid #ccc',
          padding: '8px 16px',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '500'
        }}
      >
        🌙 Debrief
      </button>
    </div>
  );
}