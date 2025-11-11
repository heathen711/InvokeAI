// src/common/hooks/useIsMobile.ts
import { useEffect, useState } from 'react';

const MOBILE_BREAKPOINT = '(max-width: 767px)';

/**
 * Hook to detect if viewport is in mobile mode (< 768px)
 * Updates on window resize
 */
export const useIsMobile = (): boolean => {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(MOBILE_BREAKPOINT).matches;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia(MOBILE_BREAKPOINT);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return isMobile;
};
