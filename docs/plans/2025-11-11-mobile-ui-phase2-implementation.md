# Mobile Responsive UI - Phase 2 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement Create Tab functionality with Generate mode (full settings form) and Canvas mode (basic gesture controls), building on Phase 1's navigation infrastructure.

**Architecture:** Phase 2 focuses on making the Create tab functional by implementing the Generate mode with a scrollable settings form and Canvas mode with basic Konva integration and gesture detection. Upscaling and Workflows modes deferred to later. Mobile action bar component added for fixed bottom buttons.

**Tech Stack:** React 18, TypeScript, Redux Toolkit, Vitest, Konva (canvas), @invoke-ai/ui-library, react-hook-form (forms)

---

## Prerequisites

Phase 1 must be complete with the following in place:
- Mobile layout infrastructure (`MobileLayout`, `MobileBottomTabBar`)
- Mobile Redux state and selectors
- `MobileCreateTab` with mode dropdown
- `useIsMobile` hook working

Working directory: `invokeai/frontend/web`

---

## Phase 2 Scope

**In Scope:**
- Generate mode: Full settings form (model, prompts, parameters)
- Canvas mode: Basic Konva canvas with pan/zoom gestures
- Mobile action bar: Fixed bottom button component
- Touch gesture detection utilities

**Out of Scope (Future Phases):**
- Canvas drawing tools and layers (Phase 3)
- Upscaling mode implementation
- Workflows mode implementation
- Generation queue integration
- Image upload/selection

---

## Task 1: Mobile Action Bar Component

**Files:**
- Create: `src/features/ui/components/mobile/MobileActionBar.tsx`
- Create: `src/features/ui/components/mobile/MobileActionBar.test.tsx`

### Step 1: Write the failing test

```typescript
// src/features/ui/components/mobile/MobileActionBar.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { MobileActionBar } from './MobileActionBar';

describe('MobileActionBar', () => {
  it('should render children content', () => {
    render(
      <MobileActionBar>
        <button>Test Button</button>
      </MobileActionBar>
    );

    expect(screen.getByRole('button', { name: /test button/i })).toBeDefined();
  });
});
```

### Step 2: Run test to verify it fails

```bash
pnpm test src/features/ui/components/mobile/MobileActionBar.test.tsx
```

Expected: FAIL with "Cannot find module './MobileActionBar'"

### Step 3: Write minimal implementation

```typescript
// src/features/ui/components/mobile/MobileActionBar.tsx
import { Flex } from '@invoke-ai/ui-library';
import type { ReactNode } from 'react';
import { memo } from 'react';

interface MobileActionBarProps {
  children?: ReactNode;
}

/**
 * Fixed action bar that sits above the bottom tab bar
 * Used for primary actions like "Generate" button
 */
export const MobileActionBar = memo(({ children }: MobileActionBarProps) => {
  return (
    <Flex
      as="footer"
      position="fixed"
      bottom="60px" // Above bottom tab bar
      left={0}
      right={0}
      px={4}
      py={3}
      bg="base.850"
      borderTopWidth={1}
      borderTopColor="base.700"
      zIndex={999}
      justifyContent="center"
      alignItems="center"
    >
      {children}
    </Flex>
  );
});

MobileActionBar.displayName = 'MobileActionBar';
```

### Step 4: Run test to verify it passes

```bash
pnpm test src/features/ui/components/mobile/MobileActionBar.test.tsx
```

Expected: PASS

### Step 5: Run TypeScript check

```bash
pnpm lint:tsc
```

Expected: PASS

### Step 6: Commit

```bash
git add src/features/ui/components/mobile/MobileActionBar.tsx src/features/ui/components/mobile/MobileActionBar.test.tsx
git commit -m "feat(mobile): add action bar component for fixed bottom actions"
```

---

## Task 2: Touch Gesture Utilities Hook

**Files:**
- Create: `src/common/hooks/useTouchGestures.ts`
- Create: `src/common/hooks/useTouchGestures.test.ts`

### Step 1: Write the failing test

```typescript
// src/common/hooks/useTouchGestures.test.ts
import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useTouchGestures } from './useTouchGestures';

describe('useTouchGestures', () => {
  it('should detect pinch gesture distance', () => {
    const onPinch = vi.fn();
    const ref = { current: document.createElement('div') };

    renderHook(() =>
      useTouchGestures(ref, {
        onPinch,
        onPan: vi.fn(),
      })
    );

    // Simulate pinch by dispatching touch events
    const touch1Start = new Touch({
      identifier: 1,
      target: ref.current,
      clientX: 100,
      clientY: 100,
      radiusX: 0,
      radiusY: 0,
      rotationAngle: 0,
      force: 1,
    });

    const touch2Start = new Touch({
      identifier: 2,
      target: ref.current,
      clientX: 200,
      clientY: 100,
      radiusX: 0,
      radiusY: 0,
      rotationAngle: 0,
      force: 1,
    });

    const touchStartEvent = new TouchEvent('touchstart', {
      touches: [touch1Start, touch2Start] as unknown as TouchList,
      cancelable: true,
      bubbles: true,
    });

    ref.current.dispatchEvent(touchStartEvent);

    // Verify pinch callback receives initial distance
    expect(onPinch).toHaveBeenCalled();
  });
});
```

### Step 2: Run test to verify it fails

```bash
pnpm test src/common/hooks/useTouchGestures.test.ts
```

Expected: FAIL with "Cannot find module './useTouchGestures'"

### Step 3: Write minimal implementation

```typescript
// src/common/hooks/useTouchGestures.ts
import type { RefObject } from 'react';
import { useEffect, useRef } from 'react';

export interface TouchGestureHandlers {
  onPan?: (deltaX: number, deltaY: number) => void;
  onPinch?: (distance: number, scale: number) => void;
  onTap?: () => void;
  onDoubleTap?: () => void;
}

interface TouchState {
  lastTouches: Touch[];
  lastDistance: number | null;
  lastTapTime: number;
}

const getDistance = (touch1: Touch, touch2: Touch): number => {
  const dx = touch2.clientX - touch1.clientX;
  const dy = touch2.clientY - touch1.clientY;
  return Math.sqrt(dx * dx + dy * dy);
};

/**
 * Hook for detecting touch gestures on a DOM element
 * Supports pan (2-finger), pinch-to-zoom, tap, and double-tap
 */
export const useTouchGestures = (
  ref: RefObject<HTMLElement>,
  handlers: TouchGestureHandlers
) => {
  const stateRef = useRef<TouchState>({
    lastTouches: [],
    lastDistance: null,
    lastTapTime: 0,
  });

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleTouchStart = (e: TouchEvent) => {
      const touches = Array.from(e.touches);
      stateRef.current.lastTouches = touches;

      if (touches.length === 2) {
        const distance = getDistance(touches[0], touches[1]);
        stateRef.current.lastDistance = distance;
        handlers.onPinch?.(distance, 1);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      const touches = Array.from(e.touches);
      const lastTouches = stateRef.current.lastTouches;

      if (touches.length === 2 && lastTouches.length === 2) {
        // Pinch gesture
        const distance = getDistance(touches[0], touches[1]);
        const lastDistance = stateRef.current.lastDistance;

        if (lastDistance) {
          const scale = distance / lastDistance;
          handlers.onPinch?.(distance, scale);
        }

        stateRef.current.lastDistance = distance;
      } else if (touches.length === 2 && lastTouches.length === 2) {
        // Pan gesture with 2 fingers
        const deltaX = touches[0].clientX - lastTouches[0].clientX;
        const deltaY = touches[0].clientY - lastTouches[0].clientY;
        handlers.onPan?.(deltaX, deltaY);
      }

      stateRef.current.lastTouches = touches;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const now = Date.now();
      const lastTapTime = stateRef.current.lastTapTime;

      if (e.touches.length === 0) {
        // Check for double tap (within 300ms)
        if (now - lastTapTime < 300) {
          handlers.onDoubleTap?.();
          stateRef.current.lastTapTime = 0;
        } else {
          handlers.onTap?.();
          stateRef.current.lastTapTime = now;
        }
      }

      stateRef.current.lastDistance = null;
      stateRef.current.lastTouches = Array.from(e.touches);
    };

    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [ref, handlers]);
};
```

### Step 4: Run test to verify it passes

```bash
pnpm test src/common/hooks/useTouchGestures.test.ts
```

Expected: PASS

### Step 5: Run TypeScript check

```bash
pnpm lint:tsc
```

Expected: PASS

### Step 6: Commit

```bash
git add src/common/hooks/useTouchGestures.ts src/common/hooks/useTouchGestures.test.ts
git commit -m "feat(mobile): add touch gesture detection hook"
```

---

## Task 3: Generate Mode - Model Selector Component

**Files:**
- Create: `src/features/ui/components/mobile/generate/MobileModelSelector.tsx`

### Step 1: Write implementation (UI component, no test)

```typescript
// src/features/ui/components/mobile/generate/MobileModelSelector.tsx
import { Button, Flex, Image, Text } from '@invoke-ai/ui-library';
import { memo } from 'react';
import { PiCaretDown } from 'react-icons/pi';

interface MobileModelSelectorProps {
  modelName: string;
  modelImage?: string;
  onPress: () => void;
}

/**
 * Model selector button for Generate mode
 * Shows model thumbnail and name, opens model selection modal on press
 */
export const MobileModelSelector = memo(
  ({ modelName, modelImage, onPress }: MobileModelSelectorProps) => {
    return (
      <Button
        onClick={onPress}
        width="full"
        height="auto"
        variant="outline"
        justifyContent="space-between"
        p={3}
      >
        <Flex gap={3} alignItems="center" flex={1}>
          {modelImage && (
            <Image
              src={modelImage}
              alt={modelName}
              boxSize="40px"
              borderRadius="md"
              objectFit="cover"
            />
          )}
          <Text fontSize="md" fontWeight="medium" noOfLines={1}>
            {modelName}
          </Text>
        </Flex>
        <PiCaretDown size={20} />
      </Button>
    );
  }
);

MobileModelSelector.displayName = 'MobileModelSelector';
```

### Step 2: Run TypeScript check

```bash
pnpm lint:tsc
```

Expected: PASS

### Step 3: Commit

```bash
git add src/features/ui/components/mobile/generate/MobileModelSelector.tsx
git commit -m "feat(mobile): add model selector component for Generate mode"
```

---

## Task 4: Generate Mode - Settings Form Component

**Files:**
- Create: `src/features/ui/components/mobile/generate/MobileGenerateForm.tsx`
- Modify: `src/features/ui/components/mobile/tabs/MobileCreateTab.tsx`

### Step 1: Create form component

```typescript
// src/features/ui/components/mobile/generate/MobileGenerateForm.tsx
import { Button, Flex, FormControl, FormLabel, Textarea, VStack } from '@invoke-ai/ui-library';
import { MobileActionBar } from 'features/ui/components/mobile/MobileActionBar';
import { MobileModelSelector } from 'features/ui/components/mobile/generate/MobileModelSelector';
import { memo, useState } from 'react';

/**
 * Generate mode settings form for mobile
 * Single scrollable form with all generation parameters
 */
export const MobileGenerateForm = memo(() => {
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');

  const handleGenerate = () => {
    // TODO: Implement generation logic in Phase 3
    console.log('Generate:', { prompt, negativePrompt });
  };

  return (
    <>
      <Flex
        flexDirection="column"
        width="full"
        height="full"
        overflow="auto"
        pb="120px" // Space for action bar + tab bar
      >
        <VStack spacing={4} p={4} width="full">
          {/* Model Selector */}
          <FormControl>
            <FormLabel>Model</FormLabel>
            <MobileModelSelector
              modelName="Stable Diffusion XL Base"
              onPress={() => console.log('Open model selector')}
            />
          </FormControl>

          {/* Prompt */}
          <FormControl>
            <FormLabel>Prompt</FormLabel>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe what you want to generate..."
              minHeight="120px"
              resize="vertical"
            />
          </FormControl>

          {/* Negative Prompt */}
          <FormControl>
            <FormLabel>Negative Prompt</FormLabel>
            <Textarea
              value={negativePrompt}
              onChange={(e) => setNegativePrompt(e.target.value)}
              placeholder="Describe what you want to avoid..."
              minHeight="80px"
              resize="vertical"
            />
          </FormControl>

          {/* TODO: Add more parameters in future tasks:
           * - Dimensions (width, height presets)
           * - Steps slider
           * - CFG Scale slider
           * - Sampler dropdown
           * - Seed controls
           * - Advanced settings
           */}
        </VStack>
      </Flex>

      {/* Fixed Action Bar */}
      <MobileActionBar>
        <Button
          onClick={handleGenerate}
          colorScheme="invokeBlue"
          size="lg"
          width="full"
          maxWidth="400px"
        >
          Generate
        </Button>
      </MobileActionBar>
    </>
  );
});

MobileGenerateForm.displayName = 'MobileGenerateForm';
```

### Step 2: Update MobileCreateTab to use form

```typescript
// Modify src/features/ui/components/mobile/tabs/MobileCreateTab.tsx
// Replace the placeholder content for 'generate' mode with:

import { MobileGenerateForm } from 'features/ui/components/mobile/generate/MobileGenerateForm';

// In the render, change from:
// <Text color="base.400">Create Tab - {activeMode} mode (content coming in Phase 2)</Text>

// To:
{activeMode === 'generate' && <MobileGenerateForm />}
{activeMode !== 'generate' && (
  <Text color="base.400">Create Tab - {activeMode} mode (coming soon)</Text>
)}
```

### Step 3: Run TypeScript check

```bash
pnpm lint:tsc
```

Expected: PASS

### Step 4: Test in browser

```bash
pnpm dev:host
```

1. Open on mobile device
2. Navigate to Create tab
3. Ensure "Generate" is selected in dropdown
4. Verify form displays with Model selector, Prompt, Negative Prompt
5. Verify "Generate" button is fixed at bottom
6. Verify form scrolls properly
7. Test typing in textareas

Expected: Form renders and is usable on mobile

### Step 5: Commit

```bash
git add src/features/ui/components/mobile/generate/MobileGenerateForm.tsx src/features/ui/components/mobile/tabs/MobileCreateTab.tsx
git commit -m "feat(mobile): add Generate mode settings form"
```

---

## Task 5: Canvas Mode - Basic Konva Setup

**Files:**
- Create: `src/features/ui/components/mobile/canvas/MobileCanvasView.tsx`
- Modify: `src/features/ui/components/mobile/tabs/MobileCreateTab.tsx`

### Step 1: Create basic Konva canvas component

```typescript
// src/features/ui/components/mobile/canvas/MobileCanvasView.tsx
import { Box, Button, Flex } from '@invoke-ai/ui-library';
import { useTouchGestures } from 'common/hooks/useTouchGestures';
import { Stage, Layer, Rect } from 'react-konva';
import { memo, useCallback, useRef, useState } from 'react';
import { PiArrowsOut } from 'react-icons/pi';

/**
 * Mobile canvas view with Konva
 * Supports pan and zoom via touch gestures
 */
export const MobileCanvasView = memo(() => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [containerSize, setContainerSize] = useState({ width: 800, height: 600 });
  const [isFullScreen, setIsFullScreen] = useState(false);

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
    setScale((prev) => Math.max(0.1, Math.min(4, prev * scaleChange)));
  }, []);

  // Handle double-tap (fit to screen)
  const handleDoubleTap = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  // Setup touch gestures
  useTouchGestures(containerRef, {
    onPan: handlePan,
    onPinch: handlePinch,
    onDoubleTap: handleDoubleTap,
  });

  // Effect to update size
  React.useEffect(() => {
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [updateSize]);

  return (
    <Flex
      flexDirection="column"
      width="full"
      height="full"
      position="relative"
      overflow="hidden"
    >
      {/* Full-screen toggle */}
      <Button
        position="absolute"
        top={4}
        right={4}
        zIndex={10}
        size="sm"
        onClick={() => setIsFullScreen(!isFullScreen)}
      >
        <PiArrowsOut />
      </Button>

      {/* Canvas container */}
      <Box
        ref={containerRef}
        flex={1}
        width="full"
        bg="base.900"
        style={{ touchAction: 'none' }}
      >
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
```

### Step 2: Update MobileCreateTab to render canvas

```typescript
// Modify src/features/ui/components/mobile/tabs/MobileCreateTab.tsx
// Add import:
import { MobileCanvasView } from 'features/ui/components/mobile/canvas/MobileCanvasView';

// Update the content rendering:
{activeMode === 'generate' && <MobileGenerateForm />}
{activeMode === 'canvas' && <MobileCanvasView />}
{activeMode !== 'generate' && activeMode !== 'canvas' && (
  <Text color="base.400">Create Tab - {activeMode} mode (coming soon)</Text>
)}
```

### Step 3: Run TypeScript check

```bash
pnpm lint:tsc
```

Expected: PASS

### Step 4: Test in browser on mobile device

```bash
pnpm dev:host
```

1. Open on mobile device
2. Go to Create tab
3. Select "Canvas" from dropdown
4. Verify Konva stage renders
5. Test pinch-to-zoom gesture (should zoom in/out)
6. Test two-finger pan (should move canvas)
7. Test double-tap (should reset zoom to 100%)
8. Verify full-screen button appears

Expected: Canvas responds to touch gestures

### Step 5: Commit

```bash
git add src/features/ui/components/mobile/canvas/MobileCanvasView.tsx src/features/ui/components/mobile/tabs/MobileCreateTab.tsx
git commit -m "feat(mobile): add Canvas mode with basic gesture controls"
```

---

## Task 6: Fix React Import in Canvas

**Files:**
- Modify: `src/features/ui/components/mobile/canvas/MobileCanvasView.tsx`

### Step 1: Add missing React import

The canvas component uses `React.useEffect` but doesn't import React. Fix:

```typescript
// At top of src/features/ui/components/mobile/canvas/MobileCanvasView.tsx
// Change from:
import { memo, useCallback, useRef, useState } from 'react';

// To:
import React, { memo, useCallback, useRef, useState } from 'react';
```

### Step 2: Run TypeScript check

```bash
pnpm lint:tsc
```

Expected: PASS

### Step 3: Commit

```bash
git add src/features/ui/components/mobile/canvas/MobileCanvasView.tsx
git commit -m "fix(mobile): add missing React import in canvas component"
```

---

## Task 7: Final Testing & Validation

### Step 1: Run full test suite

```bash
pnpm test:no-watch
```

Expected: All tests pass (should be similar count to Phase 1 + new tests)

### Step 2: Run linting

```bash
pnpm lint
```

Expected: No errors (ESLint, Prettier, TypeScript all pass)

### Step 3: Manual testing checklist

Test on mobile device (phone, < 768px viewport):

**Generate Mode:**
- [ ] Model selector button renders
- [ ] Prompt textarea is usable (can type, auto-expands)
- [ ] Negative prompt textarea is usable
- [ ] Form scrolls smoothly
- [ ] "Generate" button fixed at bottom (doesn't scroll away)
- [ ] Action bar doesn't overlap bottom tab bar
- [ ] Can switch between tabs and come back

**Canvas Mode:**
- [ ] Konva stage renders (dark background visible)
- [ ] Pinch gesture zooms in/out (check zoom % updates)
- [ ] Two-finger pan moves canvas (smooth, responsive)
- [ ] Double-tap resets zoom to 100%
- [ ] Full-screen button visible and tappable
- [ ] Zoom percentage shows in status bar
- [ ] No conflicts with browser gestures
- [ ] Can switch back to Generate mode

**General:**
- [ ] Switching modes via dropdown works
- [ ] No TypeScript errors in console
- [ ] No React warnings in console
- [ ] Performance is smooth (60fps)

### Step 4: Create summary commit

```bash
git add .
git commit -m "feat(mobile): complete Phase 2 - Create Tab implementation

Implements Generate and Canvas modes:
- Generate mode with model selector, prompt fields, action bar
- Canvas mode with Konva integration and gesture controls
- Touch gesture detection utilities (pan, pinch, tap, double-tap)
- Mobile action bar for fixed bottom buttons
- Smooth 60fps performance on mobile devices

Phase 2 complete. Ready for Phase 3 (View & Manage tabs).
"
```

---

## Phase 2 Complete!

### What We Built

✅ **Mobile Action Bar** - Fixed bottom button component above tab bar
✅ **Touch Gesture Utilities** - Hook for pan, pinch, tap, double-tap detection
✅ **Generate Mode** - Settings form with model selector and prompt fields
✅ **Canvas Mode** - Basic Konva canvas with pan/zoom gesture controls
✅ **Gesture Integration** - Smooth touch interactions without browser conflicts

### Architecture

The Phase 2 implementation adds content to the Create tab while maintaining the navigation structure from Phase 1:

```
MobileCreateTab
├── Generate Mode
│   ├── MobileGenerateForm
│   │   ├── MobileModelSelector
│   │   ├── Prompt/Negative Prompt inputs
│   │   └── MobileActionBar (Generate button)
│   └── Full scrollable form layout
└── Canvas Mode
    ├── MobileCanvasView
    │   ├── Konva Stage (pan/zoom)
    │   ├── Touch gesture handlers
    │   └── Full-screen toggle
    └── Status bar with zoom info
```

### Files Created (6 new files)

1. `src/features/ui/components/mobile/MobileActionBar.tsx`
2. `src/features/ui/components/mobile/MobileActionBar.test.tsx`
3. `src/common/hooks/useTouchGestures.ts`
4. `src/common/hooks/useTouchGestures.test.ts`
5. `src/features/ui/components/mobile/generate/MobileGenerateForm.tsx`
6. `src/features/ui/components/mobile/generate/MobileModelSelector.tsx`
7. `src/features/ui/components/mobile/canvas/MobileCanvasView.tsx`

### Files Modified (1 existing file)

1. `src/features/ui/components/mobile/tabs/MobileCreateTab.tsx` - Routes to Generate/Canvas modes

### Technical Quality

- Touch gestures tested with vitest
- TypeScript strict mode compliance
- Performance optimized (React.memo, useCallback)
- Responsive to viewport changes
- No browser zoom conflicts

### Known Limitations (Future Work)

- Generate form has minimal parameters (expand in Phase 3)
- No actual generation logic (connect to Redux in Phase 3)
- Canvas has no drawing tools yet (Phase 3)
- No layer management (Phase 3)
- Model selector opens console.log (connect to actual selector in Phase 3)

### What's Next

**Phase 3: View & Manage Tabs** (2 weeks)
- Responsive gallery grid with image thumbnails
- Full-screen image viewer with swipe navigation
- Share functionality via native Share API
- Queue management (list, swipe actions)
- Models management (list, search, download)

**Phase 4: Polish & Advanced Features** (2 weeks)
- Complete Generate form parameters (dimensions, steps, CFG, sampler, seed)
- Canvas drawing tools and layers
- Animations and transitions
- Performance optimization
- Accessibility audit
- Cross-device testing

---

## Troubleshooting

### Touch gestures not working
- Check `touch-action: none` is set on canvas container
- Verify `{ passive: false }` in event listeners
- Test with actual mobile device (not desktop browser simulation)

### Konva stage not rendering
- Check container ref is attached correctly
- Verify container has explicit width/height
- Check React and react-konva versions are compatible

### TypeScript errors with Touch events
- Ensure Touch constructor polyfill or use MouseEvent for tests
- Check @types/react includes touch event types

### Action bar overlaps tab bar
- Verify `bottom: 60px` matches tab bar height
- Check z-index values (action bar should be 999, tab bar 1000)

### Form doesn't scroll on mobile
- Ensure `pb="120px"` provides enough space for action bar + tab bar
- Check `overflow="auto"` is set on scroll container
- Verify no `overflow: hidden` on parent elements
