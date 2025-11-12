// src/common/hooks/useTouchGestures.ts
import type { RefObject } from 'react';
import { useCallback, useEffect, useRef } from 'react';

export interface TouchGestureHandlers {
  onPan?: (deltaX: number, deltaY: number) => void;
  onPinch?: (distance: number, scale: number) => void;
  onTap?: () => void;
  onDoubleTap?: () => void;
}

interface TouchState {
  lastTouches: Touch[];
  lastDistance: number | null;
  lastTapTime: number;
  touchStartPosition: { x: number; y: number } | null;
}

const getDistance = (touch1: Touch, touch2: Touch): number => {
  const dx = touch2.clientX - touch1.clientX;
  const dy = touch2.clientY - touch1.clientY;
  return Math.sqrt(dx * dx + dy * dy);
};

/**
 * Hook for detecting touch gestures on a DOM element
 * Supports pan (2-finger), pinch-to-zoom, tap, and double-tap
 *
 * @param ref - Reference to the DOM element to attach gesture listeners to
 * @param handlers - Object containing callback functions for each gesture type
 *
 * @example
 * ```tsx
 * const containerRef = useRef<HTMLDivElement>(null);
 * useTouchGestures(containerRef, {
 *   onPan: (deltaX, deltaY) => console.log('Pan:', deltaX, deltaY),
 *   onPinch: (distance, scale) => console.log('Pinch:', scale),
 *   onDoubleTap: () => console.log('Double-tap'),
 * });
 * ```
 */
export const useTouchGestures = (ref: RefObject<HTMLElement>, handlers: TouchGestureHandlers): void => {
  const stateRef = useRef<TouchState>({
    lastTouches: [],
    lastDistance: null,
    lastTapTime: 0,
    touchStartPosition: null,
  });

  // Memoize handlers to avoid recreating event listeners
  const handlersRef = useRef(handlers);
  useEffect(() => {
    handlersRef.current = handlers;
  }, [handlers]);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    const touches = Array.from(e.touches);
    stateRef.current.lastTouches = touches;

    // Track initial touch position for single-finger taps
    if (touches.length === 1 && touches[0]) {
      stateRef.current.touchStartPosition = {
        x: touches[0].clientX,
        y: touches[0].clientY,
      };
    }

    if (touches.length === 2 && touches[0] && touches[1]) {
      const distance = getDistance(touches[0], touches[1]);
      stateRef.current.lastDistance = distance;
      handlersRef.current.onPinch?.(distance, 1);
    }
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    const touches = Array.from(e.touches);
    const lastTouches = stateRef.current.lastTouches;

    // Prevent default browser zoom/scroll for 2-finger gestures
    if (touches.length === 2) {
      e.preventDefault();
    }

    if (
      touches.length === 2 &&
      lastTouches.length === 2 &&
      touches[0] &&
      touches[1] &&
      lastTouches[0] &&
      lastTouches[1]
    ) {
      // Check if this is a pinch or pan
      const distance = getDistance(touches[0], touches[1]);
      const lastDistance = stateRef.current.lastDistance;

      if (lastDistance !== null) {
        const scale = distance / lastDistance;
        const distanceChanged = Math.abs(distance - lastDistance) > 1;

        if (distanceChanged) {
          // Pinch gesture
          handlersRef.current.onPinch?.(distance, scale);
          stateRef.current.lastDistance = distance;
        } else {
          // Pan gesture with 2 fingers (distance unchanged)
          const deltaX = touches[0].clientX - lastTouches[0].clientX;
          const deltaY = touches[0].clientY - lastTouches[0].clientY;
          handlersRef.current.onPan?.(deltaX, deltaY);
        }
      }
    }

    stateRef.current.lastTouches = touches;
  }, []);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    const now = Date.now();
    const lastTapTime = stateRef.current.lastTapTime;

    if (e.touches.length === 0 && stateRef.current.touchStartPosition) {
      const startPos = stateRef.current.touchStartPosition;
      const lastTouch = stateRef.current.lastTouches[0];

      if (lastTouch) {
        const moveDistance = Math.sqrt(
          Math.pow(lastTouch.clientX - startPos.x, 2) + Math.pow(lastTouch.clientY - startPos.y, 2)
        );

        // Only register tap if movement was minimal (< 10px)
        if (moveDistance < 10) {
          // Check for double tap (within 300ms)
          if (now - lastTapTime < 300 && lastTapTime > 0) {
            handlersRef.current.onDoubleTap?.();
            stateRef.current.lastTapTime = 0;
          } else {
            handlersRef.current.onTap?.();
            stateRef.current.lastTapTime = now;
          }
        }
      }

      stateRef.current.touchStartPosition = null;
    }

    stateRef.current.lastDistance = null;
    stateRef.current.lastTouches = Array.from(e.touches);
  }, []);

  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }

    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [ref, handleTouchStart, handleTouchMove, handleTouchEnd]);
};
