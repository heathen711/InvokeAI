// src/features/ui/components/mobile/gallery/useAutoHideControls.test.ts
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useAutoHideControls } from './useAutoHideControls';

describe('useAutoHideControls', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should start with controls visible', () => {
    const { result } = renderHook(() => useAutoHideControls());
    expect(result.current.controlsVisible).toBe(true);
  });

  it('should hide controls after 4 seconds', () => {
    const { result } = renderHook(() => useAutoHideControls());

    expect(result.current.controlsVisible).toBe(true);

    act(() => {
      vi.advanceTimersByTime(4000);
    });

    expect(result.current.controlsVisible).toBe(false);
  });

  it('should show controls when showControls is called', () => {
    const { result } = renderHook(() => useAutoHideControls());

    // Wait for auto-hide
    act(() => {
      vi.advanceTimersByTime(4000);
    });

    expect(result.current.controlsVisible).toBe(false);

    // Show controls
    act(() => {
      result.current.showControls();
    });

    expect(result.current.controlsVisible).toBe(true);
  });

  it('should hide controls when hideControls is called', () => {
    const { result } = renderHook(() => useAutoHideControls());

    expect(result.current.controlsVisible).toBe(true);

    act(() => {
      result.current.hideControls();
    });

    expect(result.current.controlsVisible).toBe(false);
  });

  it('should restart timer when resetTimer is called', () => {
    const { result } = renderHook(() => useAutoHideControls());

    // Advance halfway
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(result.current.controlsVisible).toBe(true);

    // Reset timer
    act(() => {
      result.current.resetTimer();
    });

    // Advance another 2 seconds (should still be visible)
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(result.current.controlsVisible).toBe(true);

    // Advance final 2 seconds (total 4 from reset)
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(result.current.controlsVisible).toBe(false);
  });

  it('should auto-hide after showing controls', () => {
    const { result } = renderHook(() => useAutoHideControls());

    // Hide first
    act(() => {
      result.current.hideControls();
    });

    expect(result.current.controlsVisible).toBe(false);

    // Show again
    act(() => {
      result.current.showControls();
    });

    expect(result.current.controlsVisible).toBe(true);

    // Should auto-hide after 4 seconds
    act(() => {
      vi.advanceTimersByTime(4000);
    });

    expect(result.current.controlsVisible).toBe(false);
  });

  it('should clear timer on unmount', () => {
    const { result, unmount } = renderHook(() => useAutoHideControls());

    expect(result.current.controlsVisible).toBe(true);

    unmount();

    // Timer should be cleared, so advancing time should have no effect
    act(() => {
      vi.advanceTimersByTime(4000);
    });

    // No error should occur
  });

  it('should not auto-hide when paused', () => {
    const { result } = renderHook(() => useAutoHideControls());

    // Pause auto-hide
    act(() => {
      result.current.pauseAutoHide();
    });

    expect(result.current.controlsVisible).toBe(true);

    // Advance time
    act(() => {
      vi.advanceTimersByTime(4000);
    });

    // Should still be visible
    expect(result.current.controlsVisible).toBe(true);
  });

  it('should resume auto-hide when resumeAutoHide is called', () => {
    const { result } = renderHook(() => useAutoHideControls());

    // Pause
    act(() => {
      result.current.pauseAutoHide();
    });

    // Advance time (should not hide)
    act(() => {
      vi.advanceTimersByTime(4000);
    });

    expect(result.current.controlsVisible).toBe(true);

    // Resume
    act(() => {
      result.current.resumeAutoHide();
    });

    // Should now auto-hide after 4 seconds
    act(() => {
      vi.advanceTimersByTime(4000);
    });

    expect(result.current.controlsVisible).toBe(false);
  });
});
