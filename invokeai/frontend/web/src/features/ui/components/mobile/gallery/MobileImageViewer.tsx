// src/features/ui/components/mobile/gallery/MobileImageViewer.tsx
import { Box, Flex } from '@invoke-ai/ui-library';
import { useTouchGestures } from 'common/hooks/useTouchGestures';
import { ImageDTOContextProvider } from 'features/gallery/contexts/ImageDTOContext';
import type { TouchEvent } from 'react';
import { memo, useCallback, useRef, useState } from 'react';
import type { ImageDTO } from 'services/api/types';

import { MobileActionSheet } from './MobileActionSheet';
import { MobileBoardSelector } from './MobileBoardSelector';
import { MobileImageViewerControls } from './MobileImageViewerControls';
import { useActionSheetState } from './useActionSheetState';
import { useAutoHideControls } from './useAutoHideControls';

interface MobileImageViewerProps {
  images: ImageDTO[];
  currentIndex: number;
  onClose: () => void;
}

/**
 * Full-screen mobile image viewer with swipe navigation and pinch-to-zoom
 * Supports:
 * - Left/right swipe to navigate between images
 * - Pinch-to-zoom (1x to 4x)
 * - Two-finger pan when zoomed
 * - Double-tap to reset zoom
 * - Auto-hiding control bar
 * - Full context menu via action sheet
 */
export const MobileImageViewer = memo(({ images, currentIndex: initialIndex, onClose }: MobileImageViewerProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const touchStartX = useRef<number | null>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  const currentImage = images[currentIndex];

  // Auto-hide controls
  const { controlsVisible, showControls, hideControls, resetTimer, pauseAutoHide, resumeAutoHide } =
    useAutoHideControls();

  // Action sheet state
  const { menuOpen, currentSubmenu, openMenu, closeMenu, openSubmenu, closeSubmenu } = useActionSheetState({
    onMenuOpen: pauseAutoHide,
    onMenuClose: resumeAutoHide,
  });

  // Navigate to previous image
  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setScale(1);
      setPosition({ x: 0, y: 0 });
      resetTimer();
    }
  }, [currentIndex, resetTimer]);

  // Navigate to next image
  const handleNext = useCallback(() => {
    if (currentIndex < images.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setScale(1);
      setPosition({ x: 0, y: 0 });
      resetTimer();
    }
  }, [currentIndex, images.length, resetTimer]);

  // Handle pan gesture (when zoomed)
  const handlePan = useCallback(
    (deltaX: number, deltaY: number) => {
      if (scale > 1) {
        setPosition((prev) => ({
          x: prev.x + deltaX,
          y: prev.y + deltaY,
        }));
      }
    },
    [scale]
  );

  // Handle pinch gesture (zoom)
  const handlePinch = useCallback((_distance: number, scaleChange: number) => {
    setScale((prev) => {
      return Math.max(1, Math.min(4, prev * scaleChange));
    });
  }, []);

  // Handle double-tap (reset zoom)
  const handleDoubleTap = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  // Setup touch gestures for zoom/pan
  useTouchGestures(imageContainerRef, {
    onPan: handlePan,
    onPinch: handlePinch,
    onDoubleTap: handleDoubleTap,
  });

  // Handle tap to toggle controls
  const handleImageTap = useCallback(() => {
    if (controlsVisible) {
      resetTimer();
    } else {
      showControls();
    }
  }, [controlsVisible, resetTimer, showControls]);

  // Handle swipe gestures for navigation (only when not zoomed)
  const handleTouchStart = useCallback(
    (e: TouchEvent<HTMLDivElement>) => {
      if (scale === 1) {
        touchStartX.current = e.touches[0]?.clientX ?? null;
      }
    },
    [scale]
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent<HTMLDivElement>) => {
      // Only prevent default for swipe navigation when not zoomed
      if (scale === 1 && touchStartX.current !== null) {
        e.preventDefault();
      }
    },
    [scale]
  );

  const handleTouchEnd = useCallback(
    (e: TouchEvent<HTMLDivElement>) => {
      if (scale !== 1 || touchStartX.current === null) {
        return;
      }

      const touchEndX = e.changedTouches[0]?.clientX;
      if (touchEndX === undefined) {
        return;
      }

      const deltaX = touchEndX - touchStartX.current;
      const threshold = 50; // Minimum swipe distance

      if (Math.abs(deltaX) > threshold) {
        hideControls(); // Hide controls during swipe
        if (deltaX > 0) {
          handlePrevious();
        } else {
          handleNext();
        }
      }

      touchStartX.current = null;
    },
    [scale, handlePrevious, handleNext, hideControls]
  );

  if (!currentImage) {
    return null;
  }

  return (
    <ImageDTOContextProvider value={currentImage}>
      <Flex
        role="dialog"
        aria-label="Image viewer"
        position="fixed"
        top={0}
        left={0}
        right={0}
        bottom={0}
        zIndex={1300}
        bg="black"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Image container with zoom/pan transform */}
        <Box
          ref={imageContainerRef}
          position="relative"
          width="100%"
          height="100%"
          display="flex"
          alignItems="center"
          justifyContent="center"
          style={{ touchAction: 'none' }}
          onClick={handleImageTap}
        >
          <Box
            as="img"
            src={currentImage.image_url}
            alt={currentImage.image_name}
            maxWidth="100%"
            maxHeight="100%"
            objectFit="contain"
            userSelect="none"
            pointerEvents="none"
            transform={`scale(${scale}) translate(${position.x}px, ${position.y}px)`}
            transition={scale === 1 ? 'transform 0.2s ease-out' : 'none'}
          />
        </Box>

        {/* Auto-hiding control bar */}
        <MobileImageViewerControls
          visible={controlsVisible}
          onPrevious={handlePrevious}
          onNext={handleNext}
          onClose={onClose}
          onMenu={openMenu}
          canGoPrevious={currentIndex > 0}
          canGoNext={currentIndex < images.length - 1}
        />

        {/* Action sheet menu with submenus */}
        <MobileActionSheet
          isOpen={menuOpen}
          onClose={closeMenu}
          onOpenSubmenu={openSubmenu}
          currentSubmenu={currentSubmenu}
          onCloseSubmenu={closeSubmenu}
        />

        {/* Mobile board selector */}
        <MobileBoardSelector />
      </Flex>
    </ImageDTOContextProvider>
  );
});

MobileImageViewer.displayName = 'MobileImageViewer';
