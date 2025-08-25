/**
 * Safe interval hook that auto-clears on unmount
 */
import { useEffect, useRef } from 'react';

export function useSafeInterval(
  callback: () => void,
  delay: number | null,
  immediate = false
) {
  const savedCallback = useRef(callback);
  const intervalId = useRef<NodeJS.Timeout>();

  // Remember the latest callback
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval
  useEffect(() => {
    function tick() {
      savedCallback.current();
    }

    if (delay !== null) {
      if (immediate) {
        tick();
      }
      
      intervalId.current = setInterval(tick, delay);
      
      return () => {
        if (intervalId.current) {
          clearInterval(intervalId.current);
        }
      };
    }
  }, [delay, immediate]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalId.current) {
        clearInterval(intervalId.current);
      }
    };
  }, []);

  // Return manual clear function
  return () => {
    if (intervalId.current) {
      clearInterval(intervalId.current);
      intervalId.current = undefined;
    }
  };
}

export function useSafeTimeout(
  callback: () => void,
  delay: number | null
) {
  const savedCallback = useRef(callback);
  const timeoutId = useRef<NodeJS.Timeout>();

  // Remember the latest callback
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the timeout
  useEffect(() => {
    function tick() {
      savedCallback.current();
    }

    if (delay !== null) {
      timeoutId.current = setTimeout(tick, delay);
      
      return () => {
        if (timeoutId.current) {
          clearTimeout(timeoutId.current);
        }
      };
    }
  }, [delay]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
      }
    };
  }, []);

  // Return manual clear function
  return () => {
    if (timeoutId.current) {
      clearTimeout(timeoutId.current);
      timeoutId.current = undefined;
    }
  };
}