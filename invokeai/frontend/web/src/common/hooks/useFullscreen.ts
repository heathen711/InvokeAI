import type { RefObject } from 'react';
import { useCallback, useEffect, useState } from 'react';

/**
 * Hook for fullscreen functionality
 * Provides fullscreen state and toggle function for a container element
 */
export const useFullscreen = (elementRef: RefObject<HTMLElement>) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Update fullscreen state when it changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = useCallback(async () => {
    const element = elementRef.current;
    if (!element) {
      return;
    }

    try {
      if (!document.fullscreenElement) {
        // Enter fullscreen
        await element.requestFullscreen();
      } else {
        // Exit fullscreen
        await document.exitFullscreen();
      }
    } catch (error) {
      // Fullscreen API might not be available or permission denied
      // eslint-disable-next-line no-console
      console.warn('Fullscreen toggle failed:', error);
    }
  }, [elementRef]);

  return {
    isFullscreen,
    toggleFullscreen,
  };
};
