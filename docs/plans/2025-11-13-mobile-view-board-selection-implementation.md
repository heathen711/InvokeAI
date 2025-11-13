# Mobile View Tab Board Selection Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add board filtering and image/asset toggling to mobile View tab with one-handed operation

**Architecture:** Extend existing MobileBoardSelector with mode prop to support both "save-to" (Create tab) and "view" (View tab) modes. Create bottom bar component that contains board selector and view toggle. Wire Redux state to filter gallery by selectedBoardId and galleryView.

**Tech Stack:** React 18, TypeScript, Redux Toolkit, RTK Query, Chakra UI (@invoke-ai/ui-library)

---

## Task 1: Add Mode Prop to MobileBoardSelector

**Files:**
- Modify: `invokeai/frontend/web/src/features/ui/components/mobile/boards/MobileBoardSelector.tsx`

**Step 1: Add mode prop type and configuration**

Update the component to accept a mode prop and create configuration mapping:

```typescript
// At top of file, after imports
type BoardSelectorMode = 'save' | 'view';

interface MobileBoardSelectorProps {
  mode?: BoardSelectorMode;
}

// Configuration mapping for different modes
const MODE_CONFIG = {
  save: {
    labelKey: 'boards.saveTo',
    icon: PiFolderSimple,
    selector: selectAutoAddBoardId,
  },
  view: {
    labelKey: 'boards.viewing',
    icon: PiFunnel,
    selector: selectSelectedBoardId,
  },
} as const;
```

**Step 2: Update component to use mode prop**

Replace the component implementation:

```typescript
export const MobileBoardSelector = memo(({ mode = 'save' }: MobileBoardSelectorProps) => {
  const { t } = useTranslation();
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const config = MODE_CONFIG[mode];
  const boardId = useAppSelector(config.selector);
  const boardName = useBoardName(boardId);

  const handleOpenPicker = useCallback(() => {
    setIsPickerOpen(true);
  }, []);

  const handleClosePicker = useCallback(() => {
    setIsPickerOpen(false);
  }, []);

  return (
    <>
      <Button
        onClick={handleOpenPicker}
        variant="outline"
        size="lg"
        w="full"
        justifyContent="space-between"
        px={4}
        py={6}
        h="auto"
      >
        <Flex alignItems="center" gap={3}>
          <config.icon size={20} />
          <Flex flexDirection="column" alignItems="flex-start">
            <Text fontSize="xs" color="base.400" fontWeight="normal">
              {t(config.labelKey)}
            </Text>
            <Text fontSize="md" fontWeight="semibold">
              {boardName}
            </Text>
          </Flex>
        </Flex>
        <PiCaretDownBold size={16} />
      </Button>

      <MobileBoardPicker isOpen={isPickerOpen} onClose={handleClosePicker} mode={mode} />
    </>
  );
});
```

**Step 3: Add required imports**

Add to imports at top of file:

```typescript
import { selectSelectedBoardId } from 'features/gallery/store/gallerySelectors';
import { PiFunnel } from 'react-icons/pi';
```

**Step 4: Verify changes compile**

Run: `cd invokeai/frontend/web && pnpm lint:tsc`
Expected: No TypeScript errors

**Step 5: Commit**

```bash
git add invokeai/frontend/web/src/features/ui/components/mobile/boards/MobileBoardSelector.tsx
git commit -m "feat(mobile): add mode prop to MobileBoardSelector

Adds save/view mode support to board selector. View mode uses
selectedBoardId for filtering, save mode uses autoAddBoardId for
save destination."
```

---

## Task 2: Update MobileBoardPicker for Mode-Aware Actions

**Files:**
- Modify: `invokeai/frontend/web/src/features/ui/components/mobile/boards/MobileBoardPicker.tsx`

**Step 1: Add mode prop to interface**

Update the props interface:

```typescript
interface MobileBoardPickerProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: 'save' | 'view';
}
```

**Step 2: Import required Redux action and selector**

Add to imports:

```typescript
import { boardIdSelected } from 'features/gallery/store/gallerySlice';
import { selectSelectedBoardId } from 'features/gallery/store/gallerySelectors';
```

**Step 3: Update component to use mode-aware state**

Replace the component implementation to select state based on mode:

```typescript
export const MobileBoardPicker = memo(({ isOpen, onClose, mode = 'save' }: MobileBoardPickerProps) => {
  const { t } = useTranslation();
  const toast = useToast();
  const dispatch = useAppDispatch();

  const [newBoardName, setNewBoardName] = useState('');

  // Select appropriate board ID based on mode
  const autoAddBoardId = useAppSelector(selectAutoAddBoardId);
  const selectedBoardId = useAppSelector(selectSelectedBoardId);
  const currentBoardId = mode === 'view' ? selectedBoardId : autoAddBoardId;

  const { data: boards, isLoading } = useListAllBoardsQuery({
    include_archived: false,
  });
  const [createBoard, { isLoading: isCreating }] = useCreateBoardMutation();
```

**Step 4: Update handleCreateBoard to dispatch mode-aware action**

Replace the handleCreateBoard function:

```typescript
  const handleCreateBoard = useCallback(async () => {
    const trimmedName = newBoardName.trim();

    // Validate input
    if (!trimmedName) {
      toast({
        title: t('boards.boardNameRequired'),
        status: 'warning',
        duration: 2500,
      });
      return;
    }

    // Check for duplicates (case-insensitive)
    const boardNames = boards?.map((b) => b.board_name.toLowerCase()) || [];
    if (boardNames.includes(trimmedName.toLowerCase())) {
      toast({
        title: t('boards.boardNameExists'),
        status: 'warning',
        duration: 2500,
      });
      return;
    }

    try {
      const result = await createBoard({ board_name: trimmedName }).unwrap();

      // Auto-select newly created board (dispatch based on mode)
      if (mode === 'view') {
        dispatch(boardIdSelected({ boardId: result.board_id }));
      } else {
        dispatch(autoAddBoardIdChanged(result.board_id));
      }

      // Clear input for next board
      setNewBoardName('');

      toast({
        title: t('boards.boardCreated'),
        status: 'success',
        duration: 1500,
      });

      // Modal stays open
    } catch {
      toast({
        title: t('boards.boardCreationFailed'),
        status: 'error',
        duration: 3000,
      });
    }
  }, [newBoardName, boards, createBoard, dispatch, toast, t, mode]);
```

**Step 5: Update handleSelectBoard to dispatch mode-aware action**

Replace the handleSelectBoard function:

```typescript
  const handleSelectBoard = useCallback(
    (boardId: BoardId) => {
      if (mode === 'view') {
        dispatch(boardIdSelected({ boardId }));
      } else {
        dispatch(autoAddBoardIdChanged(boardId));
      }
      // Modal stays open
    },
    [dispatch, mode]
  );
```

**Step 6: Update board list to use currentBoardId for selection**

Find the MobileBoardListItem components and update to use currentBoardId:

```typescript
        {!isLoading && (
          <>
            {/* Uncategorized board */}
            <MobileBoardListItem
              board="none"
              isSelected={currentBoardId === 'none'}
              onSelect={handleSelectBoard}
            />

            {/* User boards */}
            {boards?.map((board) => (
              <MobileBoardListItem
                key={board.board_id}
                board={board}
                isSelected={currentBoardId === board.board_id}
                onSelect={handleSelectBoard}
              />
            ))}
```

**Step 7: Verify changes compile**

Run: `cd invokeai/frontend/web && pnpm lint:tsc`
Expected: No TypeScript errors

**Step 8: Commit**

```bash
git add invokeai/frontend/web/src/features/ui/components/mobile/boards/MobileBoardPicker.tsx
git commit -m "feat(mobile): add mode-aware actions to MobileBoardPicker

Updates picker to dispatch boardIdSelected in view mode and
autoAddBoardIdChanged in save mode. Allows same component to
handle both gallery filtering and save destination."
```

---

## Task 3: Create MobileBoardSelectorBar Component

**Files:**
- Create: `invokeai/frontend/web/src/features/ui/components/mobile/boards/MobileBoardSelectorBar.tsx`
- Modify: `invokeai/frontend/web/src/features/ui/components/mobile/boards/index.ts`

**Step 1: Create MobileBoardSelectorBar component**

Create new file with full implementation:

```typescript
// invokeai/frontend/web/src/features/ui/components/mobile/boards/MobileBoardSelectorBar.tsx
import { Button, Flex } from '@invoke-ai/ui-library';
import { useAppDispatch, useAppSelector } from 'app/store/storeHooks';
import { selectGalleryView } from 'features/gallery/store/gallerySelectors';
import { galleryViewChanged } from 'features/gallery/store/gallerySlice';
import { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { PiFile, PiImage } from 'react-icons/pi';

import { MobileBoardSelector } from './MobileBoardSelector';

interface MobileBoardSelectorBarProps {
  mode: 'save' | 'view';
}

/**
 * Persistent bottom board selector bar for mobile
 * Shows board selector and view toggle (images/assets) when in view mode
 */
export const MobileBoardSelectorBar = memo(({ mode }: MobileBoardSelectorBarProps) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const galleryView = useAppSelector(selectGalleryView);

  const handleToggleView = useCallback(() => {
    const newView = galleryView === 'images' ? 'assets' : 'images';
    dispatch(galleryViewChanged(newView));
  }, [galleryView, dispatch]);

  const isViewingImages = galleryView === 'images';
  const toggleIcon = isViewingImages ? PiFile : PiImage;
  const toggleText = isViewingImages
    ? t('gallery.switchToAssets')
    : t('gallery.switchToImages');

  return (
    <Flex
      position="sticky"
      bottom={0}
      left={0}
      right={0}
      bg="base.900"
      borderTop="1px solid"
      borderColor="base.700"
      px={3}
      py={2}
      gap={2}
      alignItems="center"
      zIndex={100}
    >
      <MobileBoardSelector mode={mode} />

      {mode === 'view' && (
        <Button
          onClick={handleToggleView}
          variant="outline"
          size="lg"
          flexShrink={0}
          rightIcon={<toggleIcon size={18} />}
          h="auto"
          py={6}
          px={4}
        >
          {toggleText}
        </Button>
      )}
    </Flex>
  );
});

MobileBoardSelectorBar.displayName = 'MobileBoardSelectorBar';
```

**Step 2: Add translation keys check**

The translation keys need to exist. Check if they're available:

Run: `grep -r "switchToAssets\|switchToImages" invokeai/frontend/web/public/locales/en/translation.json`

If not found, we'll need to add them or use alternative existing keys.

**Step 3: Update index.ts to export new component**

Add to `invokeai/frontend/web/src/features/ui/components/mobile/boards/index.ts`:

```typescript
export { MobileBoardSelectorBar } from './MobileBoardSelectorBar';
```

**Step 4: Verify changes compile**

Run: `cd invokeai/frontend/web && pnpm lint:tsc`
Expected: No TypeScript errors (translation keys warning is OK for now)

**Step 5: Commit**

```bash
git add invokeai/frontend/web/src/features/ui/components/mobile/boards/MobileBoardSelectorBar.tsx invokeai/frontend/web/src/features/ui/components/mobile/boards/index.ts
git commit -m "feat(mobile): create MobileBoardSelectorBar component

Adds persistent bottom bar with board selector and images/assets
toggle. Positioned above bottom nav for one-handed operation."
```

---

## Task 4: Update MobileViewTab to Use New Components

**Files:**
- Modify: `invokeai/frontend/web/src/features/ui/components/mobile/tabs/MobileViewTab.tsx`

**Step 1: Add required imports**

Update imports section:

```typescript
import { Flex } from '@invoke-ai/ui-library';
import { useAppSelector } from 'app/store/storeHooks';
import { selectGalleryView, selectSelectedBoardId } from 'features/gallery/store/gallerySelectors';
import { MobileBoardSelectorBar } from 'features/ui/components/mobile/boards';
import { MobileGalleryGrid } from 'features/ui/components/mobile/gallery/MobileGalleryGrid';
import { MobileImageViewer } from 'features/ui/components/mobile/gallery/MobileImageViewer';
import { memo, useCallback, useState } from 'react';
import { useListImagesQuery } from 'services/api/endpoints/images';
import type { ImageDTO } from 'services/api/types';
```

**Step 2: Replace component implementation**

Update the full component:

```typescript
/**
 * Mobile View tab - Gallery with board filtering and image viewer
 * Displays a grid of images filtered by selected board
 * Allows switching between images and assets
 */
export const MobileViewTab = memo(() => {
  const [selectedImage, setSelectedImage] = useState<ImageDTO | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);

  // Get current board and view from Redux
  const selectedBoardId = useAppSelector(selectSelectedBoardId);
  const galleryView = useAppSelector(selectGalleryView);

  // Fetch images for the viewer (we need the full list for navigation)
  const { data } = useListImagesQuery({
    board_id: selectedBoardId === 'none' ? undefined : selectedBoardId,
    limit: 50,
    offset: 0,
    is_intermediate: false,
  });

  const images = data?.items ?? [];
  const currentIndex = selectedImage ? images.findIndex((img) => img.image_name === selectedImage.image_name) : 0;

  // Handle image selection from grid
  const handleImageSelect = useCallback((image: ImageDTO) => {
    setSelectedImage(image);
    setViewerOpen(true);
  }, []);

  // Handle viewer close
  const handleViewerClose = useCallback(() => {
    setViewerOpen(false);
  }, []);

  return (
    <Flex flexDirection="column" width="full" height="full" overflow="hidden">
      {/* Gallery Grid - fills remaining space */}
      <Flex flex={1} overflow="hidden">
        <MobileGalleryGrid
          onImageSelect={handleImageSelect}
          boardId={selectedBoardId}
          galleryView={galleryView}
        />
      </Flex>

      {/* Persistent bottom board selector bar */}
      <MobileBoardSelectorBar mode="view" />

      {/* Image Viewer (full-screen overlay) */}
      {viewerOpen && selectedImage && images.length > 0 && (
        <MobileImageViewer
          images={images}
          currentIndex={Math.max(0, currentIndex)}
          onClose={handleViewerClose}
        />
      )}
    </Flex>
  );
});
```

**Step 3: Verify changes compile**

Run: `cd invokeai/frontend/web && pnpm lint:tsc`
Expected: No TypeScript errors

**Step 4: Commit**

```bash
git add invokeai/frontend/web/src/features/ui/components/mobile/tabs/MobileViewTab.tsx
git commit -m "feat(mobile): add board filtering to View tab

Removes top Gallery bar and adds bottom board selector bar.
Wires selectedBoardId and galleryView from Redux to filter gallery.
Maximizes screen space for image grid."
```

---

## Task 5: Update MobileGalleryGrid to Support GalleryView

**Files:**
- Modify: `invokeai/frontend/web/src/features/ui/components/mobile/gallery/MobileGalleryGrid.tsx`

**Step 1: Add galleryView prop to interface**

Update the interface:

```typescript
interface MobileGalleryGridProps {
  onImageSelect: (image: ImageDTO) => void;
  boardId?: string | null;
  galleryView?: 'images' | 'assets';
}
```

**Step 2: Add import for ASSETS_CATEGORIES and IMAGE_CATEGORIES**

Add to imports:

```typescript
import { ASSETS_CATEGORIES, IMAGE_CATEGORIES } from 'features/gallery/store/types';
```

**Step 3: Update component to use galleryView**

Update the component to accept and use galleryView:

```typescript
export const MobileGalleryGrid = memo(({
  onImageSelect,
  boardId,
  galleryView = 'images'
}: MobileGalleryGridProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Determine categories based on gallery view
  const categories = galleryView === 'images' ? IMAGE_CATEGORIES : ASSETS_CATEGORIES;

  // Fetch images using RTK Query
  const { data, isLoading, refetch } = useListImagesQuery({
    board_id: boardId === 'none' ? undefined : boardId,
    categories,
    limit: 50,
    offset: 0,
    is_intermediate: false,
  });
```

**Step 4: Update empty state message**

Update the empty state to be more specific:

```typescript
  // Empty state
  if (!data || data.items.length === 0) {
    const emptyMessage = galleryView === 'images'
      ? 'No images found'
      : 'No assets found';

    return (
      <Flex width="full" height="full" alignItems="center" justifyContent="center">
        <Text color="base.400">{emptyMessage}</Text>
      </Flex>
    );
  }
```

**Step 5: Verify changes compile**

Run: `cd invokeai/frontend/web && pnpm lint:tsc`
Expected: No TypeScript errors

**Step 6: Commit**

```bash
git add invokeai/frontend/web/src/features/ui/components/mobile/gallery/MobileGalleryGrid.tsx
git commit -m "feat(mobile): add galleryView support to MobileGalleryGrid

Adds support for filtering by images vs assets categories.
Updates API query to use appropriate categories based on view.
Improves empty state messaging."
```

---

## Task 6: Add Translation Keys (If Missing)

**Files:**
- Modify: `invokeai/frontend/web/public/locales/en/translation.json` (if needed)

**Step 1: Check if translation keys exist**

Run: `grep -A 5 -B 5 "gallery" invokeai/frontend/web/public/locales/en/translation.json | head -30`

Look for `switchToAssets` and `switchToImages` keys.

**Step 2: Add translation keys if missing**

If the keys don't exist, add them to the appropriate section in translation.json:

```json
"gallery": {
  "switchToImages": "Switch to Images",
  "switchToAssets": "Switch to Assets",
  // ... existing keys
}
```

Also check if we need to add the "boards.viewing" key:

```json
"boards": {
  "viewing": "Viewing",
  "saveTo": "Save To",
  // ... existing keys
}
```

**Step 3: Verify JSON is valid**

Run: `cd invokeai/frontend/web && pnpm lint:prettier`
Expected: No errors (or auto-fixed)

**Step 4: Commit if changes were needed**

```bash
git add invokeai/frontend/web/public/locales/en/translation.json
git commit -m "feat(mobile): add translation keys for View tab

Adds switchToImages, switchToAssets, and viewing translation keys
for mobile board selector bar."
```

---

## Task 7: Integration Testing

**Files:**
- None (manual testing)

**Step 1: Start development server**

Run: `cd invokeai/frontend/web && pnpm dev`
Expected: Server starts on localhost:5173

**Step 2: Navigate to mobile View tab**

1. Open browser at localhost:5173
2. Open browser DevTools and switch to mobile view (responsive mode)
3. Navigate to the View tab (bottom navigation)

Expected:
- No top "Gallery" bar
- Bottom board selector bar visible
- Board selector shows "Viewing: Uncategorized" (or current board)
- Toggle button shows "Switch to Assets"

**Step 3: Test board selection**

1. Tap board selector button
2. Verify full-screen modal opens
3. Select a different board
4. Verify modal stays open
5. Tap "Done" to close modal
6. Verify gallery refetches and shows filtered images
7. Verify board selector shows new board name

Expected: Gallery updates to show images from selected board

**Step 4: Test view toggle**

1. Tap "Switch to Assets" button
2. Verify gallery refetches
3. Verify button changes to "Switch to Images"
4. Verify grid shows assets (if any exist)
5. Tap "Switch to Images"
6. Verify gallery returns to images view

Expected: Toggle switches between images and assets smoothly

**Step 5: Test board creation in View tab**

1. Open board picker
2. Enter new board name
3. Tap Create
4. Verify new board is created and auto-selected
5. Verify gallery updates to show empty state for new board

Expected: Board creation works in view mode

**Step 6: Test cross-tab independence**

1. Switch to Create tab
2. Note the "Save To" board
3. Switch back to View tab
4. Select a different board
5. Switch back to Create tab
6. Verify "Save To" board didn't change

Expected: View tab board and Create tab board are independent

**Step 7: Test empty states**

1. Select a board with no images
2. Verify empty state message: "No images found"
3. Switch to assets view
4. Verify empty state message: "No assets found"

Expected: Appropriate empty messages shown

**Step 8: Document any issues**

Create notes file if issues found:

```bash
touch test-findings.md
# Document any bugs or unexpected behavior
```

---

## Task 8: Fix Translation Keys Implementation

**Files:**
- Modify: `invokeai/frontend/web/src/features/ui/components/mobile/boards/MobileBoardSelectorBar.tsx`

**Note:** This task may be needed if translation keys don't exist and we need to use alternative text.

**Step 1: Use inline text if translation keys unavailable**

If translation keys don't exist and adding them is problematic, update the component:

```typescript
  const toggleText = isViewingImages
    ? 'Switch to Assets'
    : 'Switch to Images';
```

Remove the `t()` wrapper and use plain strings temporarily.

**Step 2: Commit if changes needed**

```bash
git add invokeai/frontend/web/src/features/ui/components/mobile/boards/MobileBoardSelectorBar.tsx
git commit -m "fix(mobile): use inline text for view toggle temporarily

Uses plain English strings until translation keys are properly
added to the translation system."
```

---

## Task 9: Run Full Linting Suite

**Files:**
- None (verification)

**Step 1: Run TypeScript check**

Run: `cd invokeai/frontend/web && pnpm lint:tsc`
Expected: No errors

**Step 2: Run ESLint**

Run: `cd invokeai/frontend/web && pnpm lint:eslint`
Expected: No errors or only warnings

**Step 3: Run Prettier check**

Run: `cd invokeai/frontend/web && pnpm lint:prettier`
Expected: No formatting issues

**Step 4: Fix any auto-fixable issues**

Run: `cd invokeai/frontend/web && pnpm fix`
Expected: Auto-fixes applied

**Step 5: Commit formatting fixes if any**

```bash
git add -A
git commit -m "style(mobile): apply linting fixes

Auto-fixes from ESLint and Prettier."
```

---

## Task 10: Final Verification and Documentation

**Files:**
- Create: `docs/plans/2025-11-13-mobile-view-board-selection-verification.md`

**Step 1: Create verification document**

Document the completed feature:

```markdown
# Mobile View Tab Board Selection - Verification

## Completed Features

- ✅ Board selection in View tab
- ✅ Images/Assets toggle
- ✅ Independent state from Create tab
- ✅ Bottom bar for one-handed operation
- ✅ Removed top Gallery bar (space optimization)

## Testing Results

[Document test results from Task 7]

## Known Issues

[List any issues discovered]

## Browser Compatibility

- [ ] Chrome Mobile
- [ ] Safari iOS
- [ ] Firefox Mobile
- [ ] Chrome Desktop (responsive mode)

## Performance

- Gallery refetch speed: [Fast/Normal/Slow]
- Modal animation: [Smooth/Choppy]
- Toggle responsiveness: [Instant/Delayed]
```

**Step 2: Save verification document**

Save the file and commit:

```bash
git add docs/plans/2025-11-13-mobile-view-board-selection-verification.md
git commit -m "docs: add verification report for mobile View tab feature

Documents completed features, test results, and browser compatibility."
```

**Step 3: Create final summary commit**

If all tasks completed successfully:

```bash
git add -A
git commit -m "feat(mobile): complete View tab board selection feature

Adds board filtering and image/asset toggling to mobile View tab.
Reuses existing board components with mode prop for consistency.
Bottom bar optimized for one-handed operation.

Features:
- Board selection with full-screen picker modal
- Images/Assets view toggle
- Independent state from Create tab board
- Space-optimized layout (removed top bar)

Files modified:
- MobileBoardSelector.tsx - Added mode prop support
- MobileBoardPicker.tsx - Mode-aware Redux actions
- MobileViewTab.tsx - Integrated board filtering
- MobileGalleryGrid.tsx - Added galleryView support

Files created:
- MobileBoardSelectorBar.tsx - Bottom bar component"
```

---

## Rollback Plan

If issues are discovered and rollback is needed:

```bash
# Find the commit before this feature
git log --oneline | head -20

# Reset to commit before feature work
git reset --hard <commit-hash>

# Or revert specific commits
git revert <commit-hash-1> <commit-hash-2> ...
```

---

## Success Criteria

- [x] Board selector works in View tab
- [x] Gallery filters by selected board
- [x] Images/Assets toggle switches views
- [x] Create tab and View tab have independent board state
- [x] Bottom bar accessible with thumb
- [x] No TypeScript errors
- [x] No ESLint errors
- [x] Smooth performance on mobile devices

---

## Notes for Engineer

**State Management:**
- `selectedBoardId` = board being VIEWED (View tab)
- `autoAddBoardId` = board for SAVING new images (Create tab)
- `galleryView` = 'images' | 'assets'

**Key Patterns:**
- RTK Query auto-refetches when parameters change
- Mode prop pattern allows component reuse without duplication
- Sticky bottom positioning keeps controls accessible

**Debugging:**
- Check Redux DevTools to verify state updates
- Use React DevTools to inspect prop flow
- Check Network tab for API calls on board change

**Translation Keys:**
- If keys don't exist, use inline strings temporarily
- Coordinate with i18n maintainer to add proper translations later
