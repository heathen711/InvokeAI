// src/common/hooks/useOrientation.ts
import { useEffect, useState } from 'react';

export type Orientation = 'portrait' | 'landscape';

const LANDSCAPE_QUERY = '(orientation: landscape)';

/**
 * Hook to detect device orientation
 * Updates on orientation change
 */
export const useOrientation = (): Orientation => {
  const [orientation, setOrientation] = useState<Orientation>(() => {
    if (typeof window === 'undefined') {
      return 'portrait';
    }
    return window.matchMedia(LANDSCAPE_QUERY).matches ? 'landscape' : 'portrait';
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia(LANDSCAPE_QUERY);
    const handler = (e: MediaQueryListEvent) => {
      setOrientation(e.matches ? 'landscape' : 'portrait');
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return orientation;
};
