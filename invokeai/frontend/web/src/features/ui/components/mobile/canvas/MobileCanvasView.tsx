// src/features/ui/components/mobile/canvas/MobileCanvasView.tsx
import { Box, Button, ButtonGroup, Flex, IconButton, Text, useDisclosure } from '@invoke-ai/ui-library';
import { useFullscreen } from 'common/hooks/useFullscreen';
import { useTouchGestures } from 'common/hooks/useTouchGestures';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import {
  PiArrowsInSimpleBold,
  PiArrowsOutSimpleBold,
  PiEraserBold,
  PiHandBold,
  PiPaintBrushBold,
  PiStackBold,
} from 'react-icons/pi';
import { Layer, Rect, Stage } from 'react-konva';

import { MobileLayersDrawer } from './MobileLayersDrawer';

/**
 * Mobile canvas view with Konva
 * Supports pan and zoom via touch gestures, fullscreen, and layers panel
 */
export const MobileCanvasView = memo(() => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [containerSize, setContainerSize] = useState({ width: 800, height: 600 });

  // Fullscreen and layers panel
  const { isFullscreen, toggleFullscreen } = useFullscreen(containerRef);
  const layersPanelDisclosure = useDisclosure();

  // Update container size on mount and resize
  const updateSize = useCallback(() => {
    if (containerRef.current) {
      setContainerSize({
        width: containerRef.current.clientWidth,
        height: containerRef.current.clientHeight,
      });
    }
  }, []);

  // Handle pan gesture (2-finger drag)
  const handlePan = useCallback((deltaX: number, deltaY: number) => {
    setPosition((prev) => ({
      x: prev.x + deltaX,
      y: prev.y + deltaY,
    }));
  }, []);

  // Handle pinch gesture (zoom)
  const handlePinch = useCallback((_distance: number, scaleChange: number) => {
    setScale((prev) => {
      return Math.max(0.1, Math.min(4, prev * scaleChange));
    });
  }, []);

  // Handle double-tap (fit to screen)
  const handleDoubleTap = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  // Handle fullscreen toggle
  const handleFullscreen = useCallback(() => {
    toggleFullscreen();
  }, [toggleFullscreen]);

  // Handle layers panel
  const handleOpenLayers = useCallback(() => {
    layersPanelDisclosure.onOpen();
  }, [layersPanelDisclosure]);

  // Setup touch gestures
  useTouchGestures(containerRef, {
    onPan: handlePan,
    onPinch: handlePinch,
    onDoubleTap: handleDoubleTap,
  });

  // Effect to update size
  useEffect(() => {
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => {
      return window.removeEventListener('resize', updateSize);
    };
  }, [updateSize]);

  return (
    <Flex
      ref={containerRef}
      flexDirection="column"
      width="full"
      height="full"
      overflow="hidden"
      position="relative"
    >
      {/* Canvas area */}
      <Flex flex={1} position="relative" overflow="hidden" bg="base.900">
        {/* Canvas layers will be rendered here by ControlLayersCanvas */}
        <Box width="full" height="full" style={{ touchAction: 'none' }}>
          {/* Placeholder - actual canvas integration requires controlLayers feature */}
          <Stage
            width={containerSize.width}
            height={containerSize.height}
            scaleX={scale}
            scaleY={scale}
            x={position.x}
            y={position.y}
          >
            <Layer>
              {/* Placeholder: checkerboard background */}
              <Rect
                x={0}
                y={0}
                width={containerSize.width / scale}
                height={containerSize.height / scale}
                fill="#1a1a1a"
              />
              {/* Canvas rendering placeholder */}
            </Layer>
          </Stage>
        </Box>

        {/* Floating toolbar (top-right) */}
        <Flex position="absolute" top={2} right={2} gap={2} zIndex={10}>
          <IconButton
            aria-label="Toggle layers panel"
            icon={<PiStackBold />}
            onClick={handleOpenLayers}
            variant="solid"
            colorScheme="base"
            size="md"
            bg="blackAlpha.700"
            _hover={{ bg: 'blackAlpha.800' }}
          />
          <IconButton
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            icon={isFullscreen ? <PiArrowsInSimpleBold /> : <PiArrowsOutSimpleBold />}
            onClick={handleFullscreen}
            variant="solid"
            colorScheme="base"
            size="md"
            bg="blackAlpha.700"
            _hover={{ bg: 'blackAlpha.800' }}
          />
        </Flex>

        {/* Status bar (bottom) */}
        <Flex
          position="absolute"
          bottom={0}
          left={0}
          right={0}
          px={4}
          py={2}
          bg="blackAlpha.700"
          justifyContent="space-between"
          fontSize="sm"
          color="base.300"
        >
          <Text role="status" aria-live="polite">
            Zoom: {Math.round(scale * 100)}%
          </Text>
          <Text role="note">Double-tap to fit</Text>
        </Flex>
      </Flex>

      {/* Bottom controls */}
      <Flex px={4} py={3} bg="base.900" borderTopWidth={1} borderColor="base.800">
        <ButtonGroup isAttached width="full" size="lg">
          <Button flex={1} leftIcon={<PiPaintBrushBold />} variant="outline">
            Brush
          </Button>
          <Button flex={1} leftIcon={<PiEraserBold />} variant="outline">
            Eraser
          </Button>
          <Button flex={1} leftIcon={<PiHandBold />} variant="outline">
            Move
          </Button>
        </ButtonGroup>
      </Flex>

      {/* Layers panel drawer */}
      <MobileLayersDrawer isOpen={layersPanelDisclosure.isOpen} onClose={layersPanelDisclosure.onClose} />
    </Flex>
  );
});

MobileCanvasView.displayName = 'MobileCanvasView';
