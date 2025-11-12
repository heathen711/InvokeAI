// src/features/ui/components/mobile/gallery/MobileImageViewer.tsx
import { Box, Flex, IconButton, Text } from '@invoke-ai/ui-library';
import { useTouchGestures } from 'common/hooks/useTouchGestures';
import type { TouchEvent } from 'react';
import { memo, useCallback, useRef, useState } from 'react';
import { PiX } from 'react-icons/pi';
import type { ImageDTO } from 'services/api/types';

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
 */
export const MobileImageViewer = memo(({ images, currentIndex: initialIndex, onClose }: MobileImageViewerProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const touchStartX = useRef<number | null>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  const currentImage = images[currentIndex];

  // Navigate to previous image
  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setScale(1);
      setPosition({ x: 0, y: 0 });
    }
  }, [currentIndex]);

  // Navigate to next image
  const handleNext = useCallback(() => {
    if (currentIndex < images.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setScale(1);
      setPosition({ x: 0, y: 0 });
    }
  }, [currentIndex, images.length]);

  // Handle pan gesture (when zoomed)
  const handlePan = useCallback((deltaX: number, deltaY: number) => {
    if (scale > 1) {
      setPosition((prev) => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY,
      }));
    }
  }, [scale]);

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

  // Handle swipe gestures for navigation (only when not zoomed)
  const handleTouchStart = useCallback((e: TouchEvent<HTMLDivElement>) => {
    if (scale === 1) {
      touchStartX.current = e.touches[0]?.clientX ?? null;
    }
  }, [scale]);

  const handleTouchMove = useCallback((e: TouchEvent<HTMLDivElement>) => {
    // Only prevent default for swipe navigation when not zoomed
    if (scale === 1 && touchStartX.current !== null) {
      e.preventDefault();
    }
  }, [scale]);

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
        if (deltaX > 0) {
          handlePrevious();
        } else {
          handleNext();
        }
      }

      touchStartX.current = null;
    },
    [scale, handlePrevious, handleNext]
  );

  if (!currentImage) {
    return null;
  }

  return (
    <Flex
      role="dialog"
      aria-label="Image viewer"
      position="fixed"
      top={0}
      left={0}
      right={0}
      bottom={0}
      zIndex={9999}
      bg="black"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Header with close button and counter */}
      <Flex
        position="absolute"
        top={0}
        left={0}
        right={0}
        px={4}
        py={3}
        bg="blackAlpha.700"
        justifyContent="space-between"
        alignItems="center"
        zIndex={10}
      >
        <Text color="white" fontSize="md" fontWeight="medium">
          {currentIndex + 1} / {images.length}
        </Text>
        <IconButton
          aria-label="Close viewer"
          icon={<PiX />}
          onClick={onClose}
          variant="ghost"
          colorScheme="whiteAlpha"
          size="lg"
        />
      </Flex>

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

      {/* Image info footer */}
      <Flex
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        px={4}
        py={2}
        bg="blackAlpha.700"
        justifyContent="space-between"
        alignItems="center"
        fontSize="sm"
        color="base.300"
      >
        <Text>
          {currentImage.width} × {currentImage.height}
        </Text>
        <Text>Zoom: {Math.round(scale * 100)}%</Text>
      </Flex>
    </Flex>
  );
});

MobileImageViewer.displayName = 'MobileImageViewer';
