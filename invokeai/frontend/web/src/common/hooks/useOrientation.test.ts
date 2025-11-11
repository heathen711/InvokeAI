// src/common/hooks/useOrientation.test.ts
import { renderHook } from '@testing-library/react';
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
});
