/**
 * React Pattern Utilities
 * Utilities to replace direct DOM manipulation with React patterns
 */

import { useRef, useEffect, useCallback, useState, MutableRefObject } from 'react';

// ===== DOM REF UTILITIES =====

/**
 * Enhanced useRef with utility methods
 */
export function useElementRef<T extends HTMLElement = HTMLElement>() {
  const ref = useRef<T>(null);

  const focus = useCallback(() => {
    ref.current?.focus();
  }, []);

  const blur = useCallback(() => {
    ref.current?.blur();
  }, []);

  const scrollIntoView = useCallback((options?: ScrollIntoViewOptions) => {
    ref.current?.scrollIntoView(options);
  }, []);

  const getBoundingRect = useCallback(() => {
    return ref.current?.getBoundingClientRect();
  }, []);

  const contains = useCallback((element: Element) => {
    return ref.current?.contains(element) ?? false;
  }, []);

  return {
    ref,
    focus,
    blur,
    scrollIntoView,
    getBoundingRect,
    contains,
    element: ref.current,
  };
}

// ===== INTERSECTION OBSERVER =====

interface UseIntersectionObserverOptions extends IntersectionObserverInit {
  triggerOnce?: boolean;
}

export function useIntersectionObserver(
  options: UseIntersectionObserverOptions = {}
) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isVisible = entry.isIntersecting;
        setIsIntersecting(isVisible);

        if (isVisible && options.triggerOnce && !hasTriggered) {
          setHasTriggered(true);
        }
      },
      {
        threshold: options.threshold ?? 0.1,
        root: options.root,
        rootMargin: options.rootMargin,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [options.triggerOnce, options.threshold, options.root, options.rootMargin, hasTriggered]);

  return {
    ref,
    isIntersecting: options.triggerOnce ? hasTriggered : isIntersecting,
  };
}

// ===== RESIZE OBSERVER =====

interface UseResizeObserverResult {
  width: number;
  height: number;
}

export function useResizeObserver(): [MutableRefObject<HTMLElement | null>, UseResizeObserverResult] {
  const ref = useRef<HTMLElement>(null);
  const [size, setSize] = useState<UseResizeObserverResult>({ width: 0, height: 0 });

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setSize({ width, height });
      }
    });

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);

  return [ref, size];
}

// ===== CLICK OUTSIDE =====

export function useClickOutside<T extends HTMLElement = HTMLElement>(
  handler: () => void,
  enabled = true
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (!enabled) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        handler();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handler, enabled]);

  return ref;
}

// ===== ESCAPE KEY =====

export function useEscapeKey(handler: () => void, enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handler();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [handler, enabled]);
}

// ===== FOCUS TRAP =====

export function useFocusTrap<T extends HTMLElement = HTMLElement>(enabled = true) {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (!enabled) return;

    const element = ref.current;
    if (!element) return;

    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'textarea:not([disabled])',
      'input[type="text"]:not([disabled])',
      'input[type="radio"]:not([disabled])',
      'input[type="checkbox"]:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ];

    const focusableElements = element.querySelectorAll(
      focusableSelectors.join(', ')
    ) as NodeListOf<HTMLElement>;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement?.focus();
          event.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement?.focus();
          event.preventDefault();
        }
      }
    };

    // Focus first element when trap is enabled
    firstElement?.focus();

    element.addEventListener('keydown', handleTabKey);

    return () => {
      element.removeEventListener('keydown', handleTabKey);
    };
  }, [enabled]);

  return ref;
}

// ===== SCROLL LOCK =====

export function useScrollLock(enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, [enabled]);
}

// ===== MEDIA QUERY =====

export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [query]);

  return matches;
}

// ===== PREFERRED MOTION =====

export function usePrefersReducedMotion() {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}

// ===== COPY TO CLIPBOARD =====

export function useCopyToClipboard() {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      return true;
    } catch (error) {
      console.error('Failed to copy text: ', error);
      return false;
    }
  }, []);

  return { copy, copied };
}

// ===== MUTATION OBSERVER =====

export function useMutationObserver<T extends HTMLElement = HTMLElement>(
  callback: MutationCallback,
  options: MutationObserverInit = {}
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new MutationObserver(callback);
    observer.observe(element, {
      childList: true,
      subtree: true,
      attributes: true,
      ...options,
    });

    return () => {
      observer.disconnect();
    };
  }, [callback, options]);

  return ref;
}

// ===== ELEMENT SIZE =====

export function useElementSize<T extends HTMLElement = HTMLElement>() {
  const [ref, { width, height }] = useResizeObserver();
  
  return {
    ref: ref as MutableRefObject<T | null>,
    width,
    height,
    size: { width, height },
  };
}

// ===== VISIBILITY =====

export function useElementVisibility<T extends HTMLElement = HTMLElement>(
  options?: UseIntersectionObserverOptions
) {
  const { ref, isIntersecting } = useIntersectionObserver(options);
  
  return {
    ref: ref as MutableRefObject<T | null>,
    isVisible: isIntersecting,
  };
}