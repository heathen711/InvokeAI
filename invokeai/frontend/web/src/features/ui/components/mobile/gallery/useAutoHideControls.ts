// src/features/ui/components/mobile/gallery/useAutoHideControls.ts
import { useCallback, useEffect, useRef, useState } from 'react';

const AUTO_HIDE_DELAY = 4000; // 4 seconds

export interface UseAutoHideControlsReturn {
  controlsVisible: boolean;
  showControls: () => void;
  hideControls: () => void;
  resetTimer: () => void;
  pauseAutoHide: () => void;
  resumeAutoHide: () => void;
}

export function useAutoHideControls(): UseAutoHideControlsReturn {
  const [controlsVisible, setControlsVisible] = useState(true);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<number | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    if (paused) return;

    clearTimer();
    timerRef.current = window.setTimeout(() => {
      setControlsVisible(false);
    }, AUTO_HIDE_DELAY);
  }, [paused, clearTimer]);

  const showControls = useCallback(() => {
    setControlsVisible(true);
    startTimer();
  }, [startTimer]);

  const hideControls = useCallback(() => {
    clearTimer();
    setControlsVisible(false);
  }, [clearTimer]);

  const resetTimer = useCallback(() => {
    if (controlsVisible) {
      startTimer();
    }
  }, [controlsVisible, startTimer]);

  const pauseAutoHide = useCallback(() => {
    setPaused(true);
    clearTimer();
  }, [clearTimer]);

  const resumeAutoHide = useCallback(() => {
    setPaused(false);
  }, []);

  // Start initial timer
  useEffect(() => {
    startTimer();
    return () => clearTimer();
  }, [startTimer, clearTimer]);

  // Restart timer when resuming from pause
  useEffect(() => {
    if (!paused && controlsVisible) {
      startTimer();
    }
  }, [paused, controlsVisible, startTimer]);

  return {
    controlsVisible,
    showControls,
    hideControls,
    resetTimer,
    pauseAutoHide,
    resumeAutoHide,
  };
}
