/**
 * Accessibility hooks for contrast and motion preferences
 */
import { useState, useEffect } from 'react';

export function useMotionOK(): boolean {
  const [motionOK, setMotionOK] = useState(true);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: no-preference)');
    setMotionOK(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setMotionOK(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return motionOK;
}

export function useAccessibleColor(backgroundColor: string): string {
  const [textColor, setTextColor] = useState('inherit');

  useEffect(() => {
    // Simple contrast calculation
    // In a real app, you'd use a proper contrast ratio calculation
    const getBrightness = (color: string): number => {
      // Convert hex to RGB if needed
      if (color.startsWith('#')) {
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        return (r * 299 + g * 587 + b * 114) / 1000;
      }
      
      // For CSS variables or named colors, use a default approach
      return 128; // Neutral
    };

    const brightness = getBrightness(backgroundColor);
    
    // Use white text on dark backgrounds, black on light
    setTextColor(brightness < 128 ? 'white' : 'black');
  }, [backgroundColor]);

  return textColor;
}

export function useKeyboardNavigation() {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Add focus visible class for keyboard navigation
      if (e.key === 'Tab') {
        document.body.classList.add('keyboard-navigation');
      }
    };

    const handleMouseDown = () => {
      // Remove focus visible class for mouse navigation
      document.body.classList.remove('keyboard-navigation');
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);
}

export function useScreenReader(): boolean {
  const [isScreenReader, setIsScreenReader] = useState(false);

  useEffect(() => {
    // Detect screen reader usage
    const checkScreenReader = () => {
      // Check for common screen reader indicators
      const hasScreenReader = 
        window.navigator.userAgent.includes('NVDA') ||
        window.navigator.userAgent.includes('JAWS') ||
        window.speechSynthesis?.getVoices().length > 0;
      
      setIsScreenReader(hasScreenReader);
    };

    checkScreenReader();
    
    // Check again after voices are loaded
    if (window.speechSynthesis) {
      window.speechSynthesis.addEventListener('voiceschanged', checkScreenReader);
      return () => window.speechSynthesis.removeEventListener('voiceschanged', checkScreenReader);
    }
  }, []);

  return isScreenReader;
}