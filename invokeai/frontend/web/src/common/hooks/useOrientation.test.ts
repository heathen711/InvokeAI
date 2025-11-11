// src/common/hooks/useOrientation.test.ts
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useOrientation } from './useOrientation';

describe('useOrientation', () => {
  it('should return landscape when orientation matches', () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: query === '(orientation: landscape)',
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    const { result } = renderHook(() => useOrientation());
    expect(result.current).toBe('landscape');
  });

  it('should return portrait when orientation does not match landscape', () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(() => ({
        matches: false,
        media: '(orientation: landscape)',
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    const { result } = renderHook(() => useOrientation());
    expect(result.current).toBe('portrait');
  });

  it('should update orientation when media query changes', () => {
    const listeners: ((e: MediaQueryListEvent) => void)[] = [];

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(() => ({
        matches: false,
        media: '(orientation: landscape)',
        addEventListener: vi.fn((_, handler) => listeners.push(handler)),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    const { result } = renderHook(() => useOrientation());
    expect(result.current).toBe('portrait');

    // Simulate orientation change
    act(() => {
      listeners[0]({ matches: true } as MediaQueryListEvent);
    });

    expect(result.current).toBe('landscape');
  });

  it('should remove event listener on unmount', () => {
    const removeEventListener = vi.fn();

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(() => ({
        matches: false,
        media: '(orientation: landscape)',
        addEventListener: vi.fn(),
        removeEventListener,
        dispatchEvent: vi.fn(),
      })),
    });

    const { unmount } = renderHook(() => useOrientation());
    unmount();

    expect(removeEventListener).toHaveBeenCalledTimes(1);
  });
});
