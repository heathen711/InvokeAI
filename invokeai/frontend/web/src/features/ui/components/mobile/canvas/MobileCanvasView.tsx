// src/features/ui/components/mobile/canvas/MobileCanvasView.tsx
import { Box, Button, Flex } from '@invoke-ai/ui-library';
import { useTouchGestures } from 'common/hooks/useTouchGestures';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { PiArrowsOut } from 'react-icons/pi';
import { Layer, Rect, Stage } from 'react-konva';

/**
 * Mobile canvas view with Konva
 * Supports pan and zoom via touch gestures
 */
export const MobileCanvasView = memo(() => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [containerSize, setContainerSize] = useState({ width: 800, height: 600 });

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
  const handleFullScreenToggle = useCallback(() => {
    // TODO: Implement fullscreen functionality in Phase 3
    // eslint-disable-next-line no-console
    console.log('Toggle fullscreen');
  }, []);

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
    <Flex flexDirection="column" width="full" height="full" position="relative" overflow="hidden">
      {/* Full-screen toggle */}
      <Button position="absolute" top={4} right={4} zIndex={10} size="sm" onClick={handleFullScreenToggle}>
        <PiArrowsOut />
      </Button>

      {/* Canvas container */}
      <Box ref={containerRef} flex={1} width="full" bg="base.900" style={{ touchAction: 'none' }}>
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
            {/* TODO: Add canvas layers, drawing tools in Phase 3 */}
          </Layer>
        </Stage>
      </Box>

      {/* Status bar */}
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
        <span>Zoom: {Math.round(scale * 100)}%</span>
        <span>Double-tap to fit</span>
      </Flex>
    </Flex>
  );
});

MobileCanvasView.displayName = 'MobileCanvasView';
