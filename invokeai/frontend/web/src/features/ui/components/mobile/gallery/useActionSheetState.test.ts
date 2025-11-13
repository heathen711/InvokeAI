// src/features/ui/components/mobile/gallery/useActionSheetState.test.ts
import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useActionSheetState } from './useActionSheetState';

describe('useActionSheetState', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should start with menu closed', () => {
    const { result } = renderHook(() => useActionSheetState());
    expect(result.current.menuOpen).toBe(false);
  });

  it('should start with no submenu open', () => {
    const { result } = renderHook(() => useActionSheetState());
    expect(result.current.currentSubmenu).toBeNull();
  });

  it('should open menu when openMenu is called', () => {
    const { result } = renderHook(() => useActionSheetState());

    act(() => {
      result.current.openMenu();
    });

    expect(result.current.menuOpen).toBe(true);
  });

  it('should close menu when closeMenu is called', () => {
    const { result } = renderHook(() => useActionSheetState());

    act(() => {
      result.current.openMenu();
    });

    expect(result.current.menuOpen).toBe(true);

    act(() => {
      result.current.closeMenu();
    });

    expect(result.current.menuOpen).toBe(false);
  });

  it('should open submenu when openSubmenu is called', () => {
    const { result } = renderHook(() => useActionSheetState());

    act(() => {
      result.current.openMenu();
      result.current.openSubmenu('recall-metadata');
    });

    expect(result.current.currentSubmenu).toBe('recall-metadata');
  });

  it('should close submenu when closeSubmenu is called', () => {
    const { result } = renderHook(() => useActionSheetState());

    act(() => {
      result.current.openMenu();
      result.current.openSubmenu('new-canvas');
    });

    expect(result.current.currentSubmenu).toBe('new-canvas');

    act(() => {
      result.current.closeSubmenu();
    });

    expect(result.current.currentSubmenu).toBeNull();
  });

  it('should switch submenu when opening different submenu', () => {
    const { result } = renderHook(() => useActionSheetState());

    act(() => {
      result.current.openMenu();
      result.current.openSubmenu('recall-metadata');
    });

    expect(result.current.currentSubmenu).toBe('recall-metadata');

    act(() => {
      result.current.openSubmenu('new-canvas');
    });

    expect(result.current.currentSubmenu).toBe('new-canvas');
  });

  it('should close submenu when menu is closed', () => {
    const { result } = renderHook(() => useActionSheetState());

    act(() => {
      result.current.openMenu();
      result.current.openSubmenu('new-layer');
    });

    expect(result.current.currentSubmenu).toBe('new-layer');

    act(() => {
      result.current.closeMenu();
    });

    expect(result.current.menuOpen).toBe(false);
    expect(result.current.currentSubmenu).toBeNull();
  });

  it('should call onMenuOpen callback when menu opens', () => {
    const onMenuOpen = vi.fn();
    const { result } = renderHook(() => useActionSheetState({ onMenuOpen }));

    act(() => {
      result.current.openMenu();
    });

    expect(onMenuOpen).toHaveBeenCalledTimes(1);
  });

  it('should call onMenuClose callback when menu closes', () => {
    const onMenuClose = vi.fn();
    const { result } = renderHook(() => useActionSheetState({ onMenuClose }));

    act(() => {
      result.current.openMenu();
      result.current.closeMenu();
    });

    expect(onMenuClose).toHaveBeenCalledTimes(1);
  });

  it('should call onSubmenuOpen callback when submenu opens', () => {
    const onSubmenuOpen = vi.fn();
    const { result } = renderHook(() => useActionSheetState({ onSubmenuOpen }));

    act(() => {
      result.current.openMenu();
      result.current.openSubmenu('recall-metadata');
    });

    expect(onSubmenuOpen).toHaveBeenCalledWith('recall-metadata');
  });

  it('should call onSubmenuClose callback when submenu closes', () => {
    const onSubmenuClose = vi.fn();
    const { result } = renderHook(() => useActionSheetState({ onSubmenuClose }));

    act(() => {
      result.current.openMenu();
      result.current.openSubmenu('new-canvas');
      result.current.closeSubmenu();
    });

    expect(onSubmenuClose).toHaveBeenCalledTimes(1);
  });
});
