// src/features/ui/components/mobile/gallery/useActionSheetState.ts
import { useCallback, useState } from 'react';

export interface UseActionSheetStateOptions {
  onMenuOpen?: () => void;
  onMenuClose?: () => void;
  onSubmenuOpen?: (submenuName: string) => void;
  onSubmenuClose?: () => void;
}

export interface UseActionSheetStateReturn {
  menuOpen: boolean;
  currentSubmenu: string | null;
  openMenu: () => void;
  closeMenu: () => void;
  openSubmenu: (submenuName: string) => void;
  closeSubmenu: () => void;
}

export function useActionSheetState(options: UseActionSheetStateOptions = {}): UseActionSheetStateReturn {
  const { onMenuOpen, onMenuClose, onSubmenuOpen, onSubmenuClose } = options;

  const [menuOpen, setMenuOpen] = useState(false);
  const [currentSubmenu, setCurrentSubmenu] = useState<string | null>(null);

  const openMenu = useCallback(() => {
    setMenuOpen(true);
    onMenuOpen?.();
  }, [onMenuOpen]);

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    setCurrentSubmenu(null);
    onMenuClose?.();
  }, [onMenuClose]);

  const openSubmenu = useCallback(
    (submenuName: string) => {
      setCurrentSubmenu(submenuName);
      onSubmenuOpen?.(submenuName);
    },
    [onSubmenuOpen]
  );

  const closeSubmenu = useCallback(() => {
    setCurrentSubmenu(null);
    onSubmenuClose?.();
  }, [onSubmenuClose]);

  return {
    menuOpen,
    currentSubmenu,
    openMenu,
    closeMenu,
    openSubmenu,
    closeSubmenu,
  };
}
