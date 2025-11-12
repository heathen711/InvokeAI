// src/features/ui/components/mobile/gestures/usePullToRefresh.ts
import type { RefObject } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';

interface PullToRefreshOptions {
  onRefresh: () => Promise<void> | void;
  threshold?: number;
  resistance?: number;
}

/**
 * Hook for implementing pull-to-refresh gesture
 * Detects downward drag at top of scrollable container
 */
export const usePullToRefresh = (
  containerRef: RefObject<HTMLElement>,
  { onRefresh, threshold = 80, resistance = 2.5 }: PullToRefreshOptions
) => {
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const touchStartY = useRef<number | null>(null);

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      const container = containerRef.current;
      if (!container || isRefreshing) {
        return;
      }

      // Only trigger if at top of scroll
      if (container.scrollTop === 0) {
        touchStartY.current = e.touches[0]?.clientY ?? null;
      }
    },
    [containerRef, isRefreshing]
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      const container = containerRef.current;
      if (!container || touchStartY.current === null || isRefreshing) {
        return;
      }

      const currentY = e.touches[0]?.clientY ?? 0;
      const deltaY = currentY - touchStartY.current;

      // Only pull down when at top
      if (deltaY > 0 && container.scrollTop === 0) {
        e.preventDefault();
        setIsPulling(true);
        // Apply resistance curve
        setPullDistance(Math.min(deltaY / resistance, threshold * 1.5));
      }
    },
    [containerRef, isRefreshing, threshold, resistance]
  );

  const handleTouchEnd = useCallback(async () => {
    if (touchStartY.current === null || isRefreshing) {
      return;
    }

    touchStartY.current = null;

    if (pullDistance >= threshold) {
      setIsRefreshing(true);
      setPullDistance(threshold);

      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
        setIsPulling(false);
        setPullDistance(0);
      }
    } else {
      setIsPulling(false);
      setPullDistance(0);
    }
  }, [pullDistance, threshold, isRefreshing, onRefresh]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);
    container.addEventListener('touchcancel', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
      container.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [containerRef, handleTouchStart, handleTouchMove, handleTouchEnd]);

  return {
    isPulling,
    pullDistance,
    isRefreshing,
  };
};
