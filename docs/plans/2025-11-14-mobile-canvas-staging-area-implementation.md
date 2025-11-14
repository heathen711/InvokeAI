# Mobile Canvas Staging Area Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add mobile-optimized staging area to canvas generation workflow that replaces bottom panel after clicking Generate, showing progress and allowing result review.

**Architecture:** Implement view mode state machine in `MobileCanvasView` with conditional rendering between normal tabs and staging controls. Reuse existing `StagingAreaContext` and progress nanostores for data management. Create mobile-specific UI components that wrap desktop staging logic with touch-optimized styling.

**Tech Stack:** React, TypeScript, Chakra UI (@invoke-ai/ui-library), Nanostores, RTK Query, Socket.IO (existing infrastructure)

---

## Task 1: Add View Mode State to MobileCanvasView

**Files:**
- Modify: `invokeai/frontend/web/src/features/ui/components/mobile/canvas/MobileCanvasView.tsx:69-210`

**Step 1: Add view mode type and state**

Add after the existing state declarations (after line 73):

```typescript
// View mode for staging area
type ViewMode = 'normal' | 'staging';
const [viewMode, setViewMode] = useState<ViewMode>('normal');
```

Expected: TypeScript compiles without errors

**Step 2: Add handler to enter staging mode**

Add after `handleCloseLayersDrawer` (after line 109):

```typescript
// Enter staging mode when generation starts
const handleGenerationStarted = useCallback(() => {
  setIsGenerationDrawerOpen(false);
  setViewMode('staging');
}, []);
```

Expected: TypeScript compiles, handler available for generation form

**Step 3: Add handlers to exit staging mode**

Add after `handleGenerationStarted`:

```typescript
// Exit staging mode when user accepts current image
const handleStagingAccept = useCallback(() => {
  setViewMode('normal');
}, []);

// Exit staging mode when user discards all images
const handleStagingDiscardAll = useCallback(() => {
  setViewMode('normal');
}, []);
```

Expected: TypeScript compiles, handlers available for staging controls

**Step 4: Commit**

```bash
git add invokeai/frontend/web/src/features/ui/components/mobile/canvas/MobileCanvasView.tsx
git commit -m "feat: add view mode state for mobile canvas staging

Add view mode state machine with normal/staging modes
Add handlers for entering and exiting staging mode

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 2: Create MobileStagingAreaProgress Component

**Files:**
- Create: `invokeai/frontend/web/src/features/ui/components/mobile/canvas/MobileStagingAreaProgress.tsx`

**Step 1: Create component file with imports and structure**

```typescript
import { Box, Flex, Image, Progress, Text } from '@invoke-ai/ui-library';
import { useStore } from '@nanostores/react';
import { memo } from 'react';
import { $lastProgressEvent } from 'services/events/stores';

export const MobileStagingAreaProgress = memo(() => {
  const progressEvent = useStore($lastProgressEvent);

  // Don't render if no progress
  if (!progressEvent) {
    return null;
  }

  const percentage = progressEvent.percentage ? Math.round(progressEvent.percentage * 100) : undefined;
  const progressImage = progressEvent.progress_image;

  return (
    <Flex
      position="absolute"
      top={0}
      left={0}
      right={0}
      bottom={0}
      zIndex={5}
      bg="blackAlpha.600"
      backdropFilter="blur(4px)"
      alignItems="center"
      justifyContent="center"
      pointerEvents="none"
    >
      <Box pointerEvents="auto" bg="base.800" p={4} borderRadius="lg" shadow="dark-lg" maxW="90%">
        {/* Progress message */}
        <Text fontSize="sm" fontWeight="medium" mb={2} textAlign="center">
          {progressEvent.message}
          {percentage !== undefined && ` (${percentage}%)`}
        </Text>

        {/* Progress bar */}
        {percentage !== undefined && (
          <Progress value={percentage} colorScheme="invokeBlue" size="sm" mb={3} />
        )}

        {/* Preview image if available */}
        {progressImage && (
          <Image
            src={progressImage.dataURL}
            alt="Generation progress"
            borderRadius="md"
            maxH="120px"
            objectFit="contain"
          />
        )}
      </Box>
    </Flex>
  );
});

MobileStagingAreaProgress.displayName = 'MobileStagingAreaProgress';
```

Expected: TypeScript compiles, component exports successfully

**Step 2: Test import in another file**

Add temporary import at top of `MobileCanvasView.tsx`:

```typescript
import { MobileStagingAreaProgress } from './MobileStagingAreaProgress';
```

Run: `cd invokeai/frontend/web && pnpm lint:tsc`
Expected: No TypeScript errors

Remove the temporary import after verification.

**Step 3: Commit**

```bash
git add invokeai/frontend/web/src/features/ui/components/mobile/canvas/MobileStagingAreaProgress.tsx
git commit -m "feat: add mobile staging area progress overlay

Create progress overlay component that shows:
- Progress message and percentage
- Progress bar
- Optional preview image
Displays over canvas during generation

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 3: Create MobileStagingAreaButtons Component

**Files:**
- Create: `invokeai/frontend/web/src/features/ui/components/mobile/canvas/MobileStagingAreaButtons.tsx`

**Step 1: Create button components file with navigation buttons**

```typescript
import { Button, ButtonGroup, IconButton } from '@invoke-ai/ui-library';
import { useStore } from '@nanostores/react';
import { useAppSelector } from 'app/store/storeHooks';
import { useStagingAreaContext } from 'features/controlLayers/components/StagingArea/context';
import { useCanvasManager } from 'features/controlLayers/contexts/CanvasManagerProviderGate';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { PiCaretLeftBold, PiCaretRightBold } from 'react-icons/pi';

/**
 * Previous button - navigate to previous staged image
 */
export const MobileStagingAreaPrevButton = memo(() => {
  const ctx = useStagingAreaContext();
  const selectedItem = useStore(ctx.$selectedItem);
  const { t } = useTranslation();

  const isDisabled = selectedItem === null || selectedItem.index === 0;

  return (
    <IconButton
      aria-label={t('controlLayers.stagingArea.previous')}
      icon={<PiCaretLeftBold />}
      onClick={ctx.prev}
      isDisabled={isDisabled}
      size="lg"
      colorScheme="invokeBlue"
    />
  );
});
MobileStagingAreaPrevButton.displayName = 'MobileStagingAreaPrevButton';

/**
 * Next button - navigate to next staged image
 */
export const MobileStagingAreaNextButton = memo(() => {
  const ctx = useStagingAreaContext();
  const selectedItem = useStore(ctx.$selectedItem);
  const itemCount = useStore(ctx.$itemCount);
  const { t } = useTranslation();

  const isDisabled = selectedItem === null || selectedItem.index >= itemCount - 1;

  return (
    <IconButton
      aria-label={t('controlLayers.stagingArea.next')}
      icon={<PiCaretRightBold />}
      onClick={ctx.next}
      isDisabled={isDisabled}
      size="lg"
      colorScheme="invokeBlue"
    />
  );
});
MobileStagingAreaNextButton.displayName = 'MobileStagingAreaNextButton';

/**
 * Image counter - shows current index and total count
 */
export const MobileStagingAreaImageCountButton = memo(() => {
  const ctx = useStagingAreaContext();
  const selectedItem = useStore(ctx.$selectedItem);
  const itemCount = useStore(ctx.$itemCount);

  const counterText = useMemo(() => {
    if (itemCount > 0 && selectedItem !== null) {
      return `${selectedItem.index + 1} of ${itemCount}`;
    }
    return '0 of 0';
  }, [itemCount, selectedItem]);

  return (
    <Button colorScheme="base" pointerEvents="none" minW={28} size="lg">
      {counterText}
    </Button>
  );
});
MobileStagingAreaImageCountButton.displayName = 'MobileStagingAreaImageCountButton';

/**
 * Navigation button group (Prev + Counter + Next)
 */
export const MobileStagingAreaNavigation = memo(() => {
  return (
    <ButtonGroup isAttached>
      <MobileStagingAreaPrevButton />
      <MobileStagingAreaImageCountButton />
      <MobileStagingAreaNextButton />
    </ButtonGroup>
  );
});
MobileStagingAreaNavigation.displayName = 'MobileStagingAreaNavigation';
```

Expected: TypeScript compiles without errors

**Step 2: Add primary action buttons**

Append to the same file:

```typescript
import { withResultAsync } from 'common/util/result';
import { selectAutoAddBoardId } from 'features/gallery/store/gallerySelectors';
import { useCancelQueueItem } from 'features/queue/hooks/useCancelQueueItem';
import { useCancelQueueItemsByDestination } from 'features/queue/hooks/useCancelQueueItemsByDestination';
import { toast } from 'features/toast/toast';
import { useCallback } from 'react';
import {
  PiCheckBold,
  PiFloppyDiskBold,
  PiXBold,
} from 'react-icons/pi';
import { copyImage } from 'services/api/endpoints/images';

/**
 * Accept button - commits current image to canvas and exits staging
 */
export const MobileStagingAreaAcceptButton = memo(({ onAccept }: { onAccept: () => void }) => {
  const ctx = useStagingAreaContext();
  const canvasManager = useCanvasManager();
  const shouldShowStagedImage = useStore(canvasManager.stagingArea.$shouldShowStagedImage);
  const cancelQueueItemsByDestination = useCancelQueueItemsByDestination();
  const acceptSelectedIsEnabled = useStore(ctx.$acceptSelectedIsEnabled);
  const { t } = useTranslation();

  const handleAccept = useCallback(() => {
    ctx.acceptSelected();
    onAccept();
  }, [ctx, onAccept]);

  return (
    <IconButton
      aria-label={t('common.accept')}
      icon={<PiCheckBold />}
      onClick={handleAccept}
      colorScheme="invokeBlue"
      size="lg"
      isDisabled={!acceptSelectedIsEnabled || !shouldShowStagedImage || cancelQueueItemsByDestination.isDisabled}
      isLoading={cancelQueueItemsByDestination.isLoading}
    />
  );
});
MobileStagingAreaAcceptButton.displayName = 'MobileStagingAreaAcceptButton';

/**
 * Save to gallery button - copies current image to gallery
 */
export const MobileStagingAreaSaveToGalleryButton = memo(() => {
  const canvasManager = useCanvasManager();
  const autoAddBoardId = useAppSelector(selectAutoAddBoardId);
  const ctx = useStagingAreaContext();
  const selectedItemImageDTO = useStore(ctx.$selectedItemImageDTO);
  const shouldShowStagedImage = useStore(canvasManager.stagingArea.$shouldShowStagedImage);
  const { t } = useTranslation();

  const saveSelectedImageToGallery = useCallback(async () => {
    if (!selectedItemImageDTO) {
      return;
    }

    const result = await withResultAsync(async () => {
      await copyImage(selectedItemImageDTO.image_name, {
        image_category: 'general',
        is_intermediate: false,
        board_id: autoAddBoardId === 'none' ? undefined : autoAddBoardId,
        silent: true,
      });
    });

    if (result.isOk()) {
      toast({
        title: t('controlLayers.savedToGalleryOk'),
        status: 'success',
      });
    } else {
      toast({
        title: t('controlLayers.savedToGalleryError'),
        status: 'error',
      });
    }
  }, [autoAddBoardId, selectedItemImageDTO, t]);

  return (
    <IconButton
      aria-label={t('controlLayers.stagingArea.saveToGallery')}
      icon={<PiFloppyDiskBold />}
      onClick={saveSelectedImageToGallery}
      colorScheme="invokeBlue"
      size="lg"
      isDisabled={!selectedItemImageDTO || !shouldShowStagedImage}
    />
  );
});
MobileStagingAreaSaveToGalleryButton.displayName = 'MobileStagingAreaSaveToGalleryButton';

/**
 * Discard selected button - removes current image from staging
 */
export const MobileStagingAreaDiscardSelectedButton = memo(() => {
  const canvasManager = useCanvasManager();
  const shouldShowStagedImage = useStore(canvasManager.stagingArea.$shouldShowStagedImage);
  const ctx = useStagingAreaContext();
  const cancelQueueItem = useCancelQueueItem();
  const discardSelectedIsEnabled = useStore(ctx.$discardSelectedIsEnabled);
  const { t } = useTranslation();

  return (
    <IconButton
      aria-label={t('controlLayers.stagingArea.discard')}
      icon={<PiXBold />}
      onClick={ctx.discardSelected}
      colorScheme="invokeBlue"
      size="lg"
      isDisabled={!discardSelectedIsEnabled || cancelQueueItem.isDisabled || !shouldShowStagedImage}
      isLoading={cancelQueueItem.isLoading}
    />
  );
});
MobileStagingAreaDiscardSelectedButton.displayName = 'MobileStagingAreaDiscardSelectedButton';

/**
 * Primary action button group (Accept + Save + Discard Selected)
 */
export const MobileStagingAreaPrimaryActions = memo(({ onAccept }: { onAccept: () => void }) => {
  return (
    <ButtonGroup isAttached>
      <MobileStagingAreaAcceptButton onAccept={onAccept} />
      <MobileStagingAreaSaveToGalleryButton />
      <MobileStagingAreaDiscardSelectedButton />
    </ButtonGroup>
  );
});
MobileStagingAreaPrimaryActions.displayName = 'MobileStagingAreaPrimaryActions';
```

Expected: TypeScript compiles without errors

**Step 3: Add secondary control buttons**

Append to the same file:

```typescript
import { useAppDispatch } from 'app/store/storeHooks';
import {
  selectStagingAreaAutoSwitch,
  settingsStagingAreaAutoSwitchChanged,
} from 'features/controlLayers/store/canvasSettingsSlice';
import {
  PiCaretLineRightBold,
  PiCaretRightBold,
  PiDotsThreeVerticalBold,
  PiEyeBold,
  PiEyeSlashBold,
  PiMoonBold,
  PiTrashSimpleBold,
} from 'react-icons/pi';
import { Menu, MenuButton, MenuList } from '@invoke-ai/ui-library';
import { StagingAreaToolbarNewLayerFromImageMenuItems } from 'features/controlLayers/components/StagingArea/StagingAreaToolbarMenuNewLayerFromImage';

/**
 * Toggle show results button - shows/hides staged image overlay
 */
export const MobileStagingAreaToggleShowResultsButton = memo(() => {
  const canvasManager = useCanvasManager();
  const shouldShowStagedImage = useStore(canvasManager.stagingArea.$shouldShowStagedImage);
  const { t } = useTranslation();

  const toggleShowResults = useCallback(() => {
    canvasManager.stagingArea.$shouldShowStagedImage.set(!canvasManager.stagingArea.$shouldShowStagedImage.get());
  }, [canvasManager.stagingArea.$shouldShowStagedImage]);

  return (
    <IconButton
      aria-label={
        shouldShowStagedImage
          ? t('controlLayers.stagingArea.showResultsOn')
          : t('controlLayers.stagingArea.showResultsOff')
      }
      data-alert={!shouldShowStagedImage}
      icon={shouldShowStagedImage ? <PiEyeBold /> : <PiEyeSlashBold />}
      onClick={toggleShowResults}
      colorScheme="invokeBlue"
      size="lg"
    />
  );
});
MobileStagingAreaToggleShowResultsButton.displayName = 'MobileStagingAreaToggleShowResultsButton';

/**
 * Menu button - additional actions (new layer from image, etc.)
 */
export const MobileStagingAreaMenuButton = memo(() => {
  const canvasManager = useCanvasManager();
  const shouldShowStagedImage = useStore(canvasManager.stagingArea.$shouldShowStagedImage);

  return (
    <Menu>
      <MenuButton
        as={IconButton}
        aria-label="Image Actions"
        icon={<PiDotsThreeVerticalBold />}
        colorScheme="invokeBlue"
        size="lg"
        isDisabled={!shouldShowStagedImage}
      />
      <MenuList>
        <StagingAreaToolbarNewLayerFromImageMenuItems />
      </MenuList>
    </Menu>
  );
});
MobileStagingAreaMenuButton.displayName = 'MobileStagingAreaMenuButton';

/**
 * Auto-switch mode buttons (Off / Switch on Start / Switch on Finish)
 */
export const MobileStagingAreaAutoSwitchButtons = memo(() => {
  const canvasManager = useCanvasManager();
  const shouldShowStagedImage = useStore(canvasManager.stagingArea.$shouldShowStagedImage);
  const autoSwitch = useAppSelector(selectStagingAreaAutoSwitch);
  const dispatch = useAppDispatch();

  const onClickOff = useCallback(() => {
    dispatch(settingsStagingAreaAutoSwitchChanged('off'));
  }, [dispatch]);

  const onClickSwitchOnStart = useCallback(() => {
    dispatch(settingsStagingAreaAutoSwitchChanged('switch_on_start'));
  }, [dispatch]);

  const onClickSwitchOnFinished = useCallback(() => {
    dispatch(settingsStagingAreaAutoSwitchChanged('switch_on_finish'));
  }, [dispatch]);

  return (
    <ButtonGroup isAttached>
      <IconButton
        aria-label="Do not auto-switch"
        icon={<PiMoonBold />}
        colorScheme={autoSwitch === 'off' ? 'invokeBlue' : 'base'}
        onClick={onClickOff}
        isDisabled={!shouldShowStagedImage}
        size="lg"
      />
      <IconButton
        aria-label="Switch on start"
        icon={<PiCaretRightBold />}
        colorScheme={autoSwitch === 'switch_on_start' ? 'invokeBlue' : 'base'}
        onClick={onClickSwitchOnStart}
        isDisabled={!shouldShowStagedImage}
        size="lg"
      />
      <IconButton
        aria-label="Switch on finish"
        icon={<PiCaretLineRightBold />}
        colorScheme={autoSwitch === 'switch_on_finish' ? 'invokeBlue' : 'base'}
        onClick={onClickSwitchOnFinished}
        isDisabled={!shouldShowStagedImage}
        size="lg"
      />
    </ButtonGroup>
  );
});
MobileStagingAreaAutoSwitchButtons.displayName = 'MobileStagingAreaAutoSwitchButtons';

/**
 * Discard all button - removes all images and exits staging
 */
export const MobileStagingAreaDiscardAllButton = memo(({ onDiscardAll }: { onDiscardAll: () => void }) => {
  const canvasManager = useCanvasManager();
  const shouldShowStagedImage = useStore(canvasManager.stagingArea.$shouldShowStagedImage);
  const ctx = useStagingAreaContext();
  const cancelQueueItemsByDestination = useCancelQueueItemsByDestination();
  const { t } = useTranslation();

  const handleDiscardAll = useCallback(() => {
    ctx.discardAll();
    onDiscardAll();
  }, [ctx, onDiscardAll]);

  return (
    <IconButton
      aria-label={t('controlLayers.stagingArea.discardAll')}
      icon={<PiTrashSimpleBold />}
      onClick={handleDiscardAll}
      colorScheme="error"
      size="lg"
      isDisabled={cancelQueueItemsByDestination.isDisabled || !shouldShowStagedImage}
      isLoading={cancelQueueItemsByDestination.isLoading}
    />
  );
});
MobileStagingAreaDiscardAllButton.displayName = 'MobileStagingAreaDiscardAllButton';

/**
 * Secondary controls group (Toggle show + Menu)
 */
export const MobileStagingAreaSecondaryLeft = memo(() => {
  return (
    <ButtonGroup isAttached>
      <MobileStagingAreaToggleShowResultsButton />
      <MobileStagingAreaMenuButton />
    </ButtonGroup>
  );
});
MobileStagingAreaSecondaryLeft.displayName = 'MobileStagingAreaSecondaryLeft';

/**
 * Discard all group (standalone)
 */
export const MobileStagingAreaSecondaryRight = memo(({ onDiscardAll }: { onDiscardAll: () => void }) => {
  return (
    <ButtonGroup isAttached>
      <MobileStagingAreaDiscardAllButton onDiscardAll={onDiscardAll} />
    </ButtonGroup>
  );
});
MobileStagingAreaSecondaryRight.displayName = 'MobileStagingAreaSecondaryRight';
```

Expected: TypeScript compiles without errors

**Step 4: Run type check**

Run: `cd invokeai/frontend/web && pnpm lint:tsc`
Expected: No TypeScript errors

**Step 5: Commit**

```bash
git add invokeai/frontend/web/src/features/ui/components/mobile/canvas/MobileStagingAreaButtons.tsx
git commit -m "feat: add mobile staging area button components

Create all button components for mobile staging area:
- Navigation (prev/next/counter)
- Primary actions (accept/save/discard selected)
- Secondary controls (toggle show/menu/auto-switch/discard all)

All buttons use existing staging context and hooks
Touch-optimized with size=lg for mobile

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 4: Create MobileCanvasStagingArea Main Component

**Files:**
- Create: `invokeai/frontend/web/src/features/ui/components/mobile/canvas/MobileCanvasStagingArea.tsx`

**Step 1: Create main staging area component with two-row layout**

```typescript
import { Box, Flex } from '@invoke-ai/ui-library';
import { useStore } from '@nanostores/react';
import { useStagingAreaContext } from 'features/controlLayers/components/StagingArea/context';
import { memo, useEffect } from 'react';
import {
  MobileStagingAreaAutoSwitchButtons,
  MobileStagingAreaNavigation,
  MobileStagingAreaPrimaryActions,
  MobileStagingAreaSecondaryLeft,
  MobileStagingAreaSecondaryRight,
} from './MobileStagingAreaButtons';

interface MobileCanvasStagingAreaProps {
  onAccept: () => void;
  onDiscardAll: () => void;
}

export const MobileCanvasStagingArea = memo(({ onAccept, onDiscardAll }: MobileCanvasStagingAreaProps) => {
  const ctx = useStagingAreaContext();
  const itemCount = useStore(ctx.$itemCount);

  // Auto-exit staging mode when item count reaches 0
  useEffect(() => {
    if (itemCount === 0) {
      onDiscardAll();
    }
  }, [itemCount, onDiscardAll]);

  return (
    <Box bg="base.900" borderTopWidth={1} borderColor="base.800" pb="calc(60px + 0.75rem)">
      {/* Row 1: Navigation + Primary Actions */}
      <Flex gap={2} px={2} py={2} justifyContent="space-between" alignItems="center">
        <MobileStagingAreaNavigation />
        <MobileStagingAreaPrimaryActions onAccept={onAccept} />
      </Flex>

      {/* Row 2: Secondary Controls */}
      <Flex gap={2} px={2} pb={2} justifyContent="space-between" alignItems="center">
        <MobileStagingAreaSecondaryLeft />
        <MobileStagingAreaAutoSwitchButtons />
        <MobileStagingAreaSecondaryRight onDiscardAll={onDiscardAll} />
      </Flex>
    </Box>
  );
});

MobileCanvasStagingArea.displayName = 'MobileCanvasStagingArea';
```

Expected: TypeScript compiles without errors

**Step 2: Run type check**

Run: `cd invokeai/frontend/web && pnpm lint:tsc`
Expected: No TypeScript errors

**Step 3: Commit**

```bash
git add invokeai/frontend/web/src/features/ui/components/mobile/canvas/MobileCanvasStagingArea.tsx
git commit -m "feat: add mobile canvas staging area main component

Create main staging area component with:
- Two-row button layout
- Auto-exit when item count reaches 0
- Props for accept and discard all callbacks

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 5: Integrate Staging Area into MobileCanvasView

**Files:**
- Modify: `invokeai/frontend/web/src/features/ui/components/mobile/canvas/MobileCanvasView.tsx:1-210`

**Step 1: Add imports for staging components**

Add after existing imports (around line 41):

```typescript
import { MobileCanvasStagingArea } from './MobileCanvasStagingArea';
import { MobileStagingAreaProgress } from './MobileStagingAreaProgress';
```

Expected: TypeScript compiles without errors

**Step 2: Add conditional rendering for staging area vs tabs**

Replace the bottom panel section (lines 135-181) with:

```typescript
      {/* Bottom control panel - conditional based on view mode */}
      <CanvasManagerProviderGate>
        {viewMode === 'normal' ? (
          // Normal mode: Tabbed control panel
          <Box bg="base.900" borderTopWidth={1} borderColor="base.800" pb="calc(60px + 0.75rem)">
            <Tabs
              index={selectedPanelIndex}
              onChange={handleTabChange}
              variant="enclosed"
              colorScheme="invokeBlue"
              isFitted
            >
              <TabList px={2} pt={2} gap={1}>
                <Tab fontSize="sm" gap={1} _selected={{ bg: 'invokeBlue.500', color: 'white' }}>
                  <PiGearBold /> Generation
                </Tab>
                <Tab fontSize="sm" gap={1} _selected={{ bg: 'invokeBlue.500', color: 'white' }}>
                  <PiPaintBrushBold /> Tools
                </Tab>
                <Tab fontSize="sm" gap={1} _selected={{ bg: 'invokeBlue.500', color: 'white' }}>
                  <PiStackBold /> Layers
                </Tab>
              </TabList>

              <TabPanels>
                {/* Generation Panel - Placeholder (opens drawer) */}
                <TabPanel p={0} />

                {/* Tools Panel */}
                <TabPanel p={0}>
                  <Box maxH="200px" overflowY="auto">
                    <Flex gap={2} px={4} py={3} flexWrap="wrap">
                      <MobileToolButton tool="brush" icon={<PiPaintBrushBold />} label="Brush" />
                      <MobileToolButton tool="eraser" icon={<PiEraserBold />} label="Eraser" />
                      <MobileToolButton tool="rect" icon={<PiRectangleBold />} label="Rectangle" />
                      <MobileToolButton tool="move" icon={<RxMove />} label="Move Layer" />
                      <MobileToolButton tool="view" icon={<PiHandBold />} label="Pan & Zoom" />
                      <MobileToolButton tool="bbox" icon={<PiBoundingBoxBold />} label="Bounding Box" />
                      <MobileToolButton tool="colorPicker" icon={<PiEyedropperBold />} label="Color Picker" />
                    </Flex>
                  </Box>
                </TabPanel>

                {/* Layers Panel - Opens full-screen drawer */}
                <TabPanel p={0} />
              </TabPanels>
            </Tabs>
          </Box>
        ) : (
          // Staging mode: Staging area controls
          <MobileCanvasStagingArea onAccept={handleStagingAccept} onDiscardAll={handleStagingDiscardAll} />
        )}
      </CanvasManagerProviderGate>
```

Expected: TypeScript compiles, conditional rendering works

**Step 3: Add progress overlay to canvas area**

Add after the InvokeCanvasComponent (around line 118, inside the canvas Box):

```typescript
          {/* Progress overlay during generation (staging mode only) */}
          {viewMode === 'staging' && <MobileStagingAreaProgress />}
```

Expected: Progress overlay renders conditionally

**Step 4: Run type check**

Run: `cd invokeai/frontend/web && pnpm lint:tsc`
Expected: No TypeScript errors

**Step 5: Commit**

```bash
git add invokeai/frontend/web/src/features/ui/components/mobile/canvas/MobileCanvasView.tsx
git commit -m "feat: integrate staging area into mobile canvas view

Add conditional rendering:
- Normal mode: Shows tabs (Generation/Tools/Layers)
- Staging mode: Shows staging area controls
Add progress overlay during staging mode

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 6: Connect Generation Form to Staging Mode

**Files:**
- Modify: `invokeai/frontend/web/src/features/ui/components/mobile/canvas/MobileCanvasGenerateForm.tsx:1-1200`

**Step 1: Add onGenerationStarted prop to interface**

Find the component props interface (around line 168) and modify:

```typescript
interface MobileCanvasGenerateFormProps {
  onClose: () => void;
  onGenerationStarted?: () => void;
}

export const MobileCanvasGenerateForm = memo(({ onClose, onGenerationStarted }: MobileCanvasGenerateFormProps) => {
```

Expected: TypeScript compiles with new optional prop

**Step 2: Modify generate handler to call onGenerationStarted**

Find the `handleGenerate` function (around line 217) and modify:

```typescript
  const handleGenerate = useCallback(
    async (prepend: boolean) => {
      try {
        await enqueueCanvas(prepend);
        // Call onGenerationStarted callback if provided (enters staging mode)
        if (onGenerationStarted) {
          onGenerationStarted();
        } else {
          // Fallback to just closing if no callback provided
          onClose();
        }
      } catch (error) {
        // Error handling already exists
        console.error('Generation failed:', error);
      }
    },
    [enqueueCanvas, onClose, onGenerationStarted]
  );
```

Expected: TypeScript compiles, callback called after successful generation

**Step 3: Run type check**

Run: `cd invokeai/frontend/web && pnpm lint:tsc`
Expected: No TypeScript errors

**Step 4: Commit**

```bash
git add invokeai/frontend/web/src/features/ui/components/mobile/canvas/MobileCanvasGenerateForm.tsx
git commit -m "feat: add onGenerationStarted callback to generate form

Add optional callback prop that fires after successful generation
Allows parent to trigger staging mode transition

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 7: Wire Generation Started Callback in MobileCanvasView

**Files:**
- Modify: `invokeai/frontend/web/src/features/ui/components/mobile/canvas/MobileCanvasView.tsx:183-202`

**Step 1: Pass onGenerationStarted to MobileCanvasGenerateForm**

Find the MobileCanvasGenerateForm component usage in the drawer (around line 199) and modify:

```typescript
          <DrawerBody p={0}>
            <MobileCanvasGenerateForm onClose={handleCloseGenerationDrawer} onGenerationStarted={handleGenerationStarted} />
          </DrawerBody>
```

Expected: TypeScript compiles, prop passed correctly

**Step 2: Test the flow manually**

Run: `cd invokeai/frontend/web && pnpm dev`

Manual test steps:
1. Open mobile canvas view
2. Click Generation tab (opens drawer)
3. Configure parameters and click Generate
4. Verify: Drawer closes, staging mode activates, bottom panel shows staging controls
5. Verify: Progress overlay appears during generation
6. Verify: When results arrive, can navigate with prev/next
7. Verify: Accept returns to normal mode
8. Verify: Discard All returns to normal mode

Expected: All transitions work smoothly

**Step 3: Run full lint checks**

Run: `cd invokeai/frontend/web && pnpm lint`
Expected: All linters pass (TypeScript, ESLint, Prettier)

**Step 4: Commit**

```bash
git add invokeai/frontend/web/src/features/ui/components/mobile/canvas/MobileCanvasView.tsx
git commit -m "feat: wire generation started callback to form

Connect generation form to staging mode activation
Complete flow: Generate → Staging Mode → Accept/Discard → Normal Mode

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 8: Add Auto-Exit on Empty Staging (Edge Case)

**Files:**
- Verify: `invokeai/frontend/web/src/features/ui/components/mobile/canvas/MobileCanvasStagingArea.tsx:18-25`

**Step 1: Verify auto-exit implementation**

Check that the useEffect hook exists (should already be there from Task 4):

```typescript
  // Auto-exit staging mode when item count reaches 0
  useEffect(() => {
    if (itemCount === 0) {
      onDiscardAll();
    }
  }, [itemCount, onDiscardAll]);
```

Expected: Hook exists and handles empty staging state

**Step 2: Test auto-exit manually**

Manual test steps:
1. Generate a single image
2. Enter staging mode
3. Click "Discard Selected" (not Discard All)
4. Verify: Automatically exits to normal mode when last item removed

Expected: Auto-exit works correctly

**Step 3: Document edge case handling**

No commit needed - verification only

---

## Task 9: Test Full Integration

**Files:**
- Test: All created and modified files

**Step 1: Run all linters**

Run: `cd invokeai/frontend/web && pnpm lint`
Expected: All checks pass (TypeScript, ESLint, Prettier, Knip, DPDM)

**Step 2: Run development server**

Run: `cd invokeai/frontend/web && pnpm dev`
Expected: Server starts without errors

**Step 3: Manual integration testing**

Test the complete workflow:

**Test Case 1: Single Image Generation**
1. Load canvas, add mask
2. Open generation drawer
3. Add prompt, click Generate
4. Verify: Enters staging mode immediately
5. Verify: Progress overlay shows
6. Verify: Result appears when complete
7. Verify: Counter shows "1 of 1"
8. Verify: Accept commits to canvas and exits staging

**Test Case 2: Batch Generation**
1. Set iterations to 3
2. Click Generate
3. Verify: Enters staging mode
4. Verify: Progress overlay shows
5. Verify: Results appear as they complete
6. Verify: Can navigate with prev/next
7. Verify: Counter updates correctly
8. Verify: Save to gallery works
9. Verify: Discard Selected works
10. Verify: Discard All exits staging

**Test Case 3: Generation Failure**
1. Configure invalid parameters (if possible)
2. Click Generate
3. Verify: Enters staging mode
4. Verify: Error handled gracefully
5. Verify: Can exit with Discard All

**Test Case 4: Auto-Switch Modes**
1. Generate batch
2. Test each auto-switch mode:
   - Off: Manual navigation only
   - Switch on Start: Auto-navigate when new item starts
   - Switch on Finish: Auto-navigate when item completes

**Test Case 5: Toggle Show Results**
1. Generate image
2. Click eye icon to hide results
3. Verify: Staged image overlay disappears from canvas
4. Click eye icon to show results
5. Verify: Staged image reappears

**Test Case 6: Menu Actions**
1. Generate image
2. Open menu (3-dot button)
3. Test "New Layer from Image" options

Expected: All test cases pass

**Step 4: Test on different screen sizes**

Test on:
- Small mobile (375px width)
- Medium mobile (414px width)
- Tablet (768px width)

Verify: Touch targets are adequate, layout doesn't break

**Step 5: Document any issues found**

If issues found, create GitHub issues or fix immediately

---

## Task 10: Final Cleanup and Documentation

**Files:**
- Verify: All files follow code standards
- Update: Any necessary documentation

**Step 1: Run final lint check**

Run: `cd invokeai/frontend/web && pnpm lint`
Expected: All checks pass

**Step 2: Verify no unused imports**

Run: `cd invokeai/frontend/web && pnpm lint:knip`
Expected: No unused dependencies or exports

**Step 3: Final commit**

```bash
git add -A
git commit -m "chore: final cleanup for mobile staging area feature

All linting passes, integration tests complete
Ready for review

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Testing Checklist

Use @superpowers:verification-before-completion before claiming implementation is done.

- [ ] All TypeScript files compile without errors
- [ ] All ESLint checks pass
- [ ] Prettier formatting is correct
- [ ] No unused dependencies (Knip check passes)
- [ ] No circular dependencies (DPDM check passes)
- [ ] View mode transitions work correctly
- [ ] Progress overlay displays during generation
- [ ] Navigation buttons work (prev/next)
- [ ] Accept commits to canvas and exits staging
- [ ] Discard All clears staging and exits
- [ ] Discard Selected removes individual items
- [ ] Auto-exit when staging becomes empty
- [ ] Save to Gallery works
- [ ] Toggle Show Results works
- [ ] Menu actions work
- [ ] Auto-switch modes work (Off/Start/Finish)
- [ ] Touch targets are adequate on mobile
- [ ] Layout works on various screen sizes
- [ ] No console errors during normal operation

---

## Related Documentation

- Design document: `docs/plans/2025-11-14-mobile-canvas-staging-area-design.md`
- Desktop staging area: `invokeai/frontend/web/src/features/controlLayers/components/StagingArea/`
- Canvas manager: `invokeai/frontend/web/src/features/controlLayers/konva/CanvasManager.ts`
- Socket events: `invokeai/frontend/web/src/services/events/`

---

## Notes

- This implementation reuses existing staging context and logic from desktop
- No new API calls or socket listeners needed - all infrastructure exists
- Mobile components are touch-optimized versions of desktop components
- View mode is local state (could be lifted to Redux later if needed)
- Progress overlay uses existing `$lastProgressEvent` nanostore
- Auto-exit on empty staging prevents stuck state
