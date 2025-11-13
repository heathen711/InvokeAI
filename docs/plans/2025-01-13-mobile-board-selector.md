# Mobile Board Selector Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add board selection and creation functionality to the mobile Generate tab, allowing users to choose where generated images are saved.

**Architecture:** Three React components following existing mobile UI patterns (MobilePromptEditor, MobileImageViewer). Uses Redux for state management via `autoAddBoardId` and RTK Query for API calls. Board picker is a full-screen modal with inline board creation.

**Tech Stack:** React 18, TypeScript, Redux Toolkit, RTK Query, Chakra UI (@invoke-ai/ui-library), Vitest

---

## Task 1: Create MobileBoardListItem Component

**Files:**
- Create: `invokeai/frontend/web/src/features/ui/components/mobile/boards/MobileBoardListItem.tsx`

**Step 1: Create the component file**

Create the component with proper TypeScript types and basic structure:

```typescript
// src/features/ui/components/mobile/boards/MobileBoardListItem.tsx
import { Box, Flex, IconButton, Image, Text } from '@invoke-ai/ui-library';
import { memo, useCallback } from 'react';
import { PiCheckBold, PiFolderSimple } from 'react-icons/pi';
import type { BoardDTO } from 'services/api/types';
import type { BoardId } from 'features/gallery/store/types';
import { useBoardName } from 'services/api/hooks/useBoardName';

interface MobileBoardListItemProps {
  board: BoardDTO | 'none';
  isSelected: boolean;
  onSelect: (boardId: BoardId) => void;
}

/**
 * Individual board item in the mobile board picker list
 * Shows thumbnail, name, image count, and selection indicator
 */
export const MobileBoardListItem = memo(
  ({ board, isSelected, onSelect }: MobileBoardListItemProps) => {
    const boardId: BoardId = board === 'none' ? 'none' : board.board_id;
    const boardName = useBoardName(boardId);

    const handleSelect = useCallback(() => {
      onSelect(boardId);
    }, [boardId, onSelect]);

    // Determine thumbnail and image count
    const thumbnail = board === 'none' ? null : board.cover_image_name;
    const imageCount = board === 'none' ? 0 : board.image_count;
    const displayCount = imageCount === 0 ? 'Empty' : `${imageCount} images`;

    return (
      <Flex
        as="button"
        onClick={handleSelect}
        w="full"
        px={4}
        py={3}
        gap={3}
        alignItems="center"
        bg={isSelected ? 'invokeBlue.500' : 'transparent'}
        _hover={{ bg: isSelected ? 'invokeBlue.600' : 'base.750' }}
        _active={{ bg: isSelected ? 'invokeBlue.700' : 'base.700' }}
        borderRadius="none"
        borderBottomWidth={1}
        borderColor="base.700"
        transition="background-color 0.1s"
      >
        {/* Thumbnail or icon */}
        <Box
          w="48px"
          h="48px"
          flexShrink={0}
          borderRadius="base"
          overflow="hidden"
          bg="base.800"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          {thumbnail ? (
            <Image src={thumbnail} alt={boardName} objectFit="cover" w="full" h="full" />
          ) : (
            <PiFolderSimple size={24} color={isSelected ? 'white' : 'var(--invoke-colors-base-400)'} />
          )}
        </Box>

        {/* Board name and count */}
        <Flex flex={1} flexDirection="column" alignItems="flex-start" gap={1}>
          <Text
            fontSize="md"
            fontWeight="semibold"
            color={isSelected ? 'white' : 'base.100'}
            noOfLines={1}
          >
            {boardName}
          </Text>
          <Text fontSize="sm" color={isSelected ? 'whiteAlpha.800' : 'base.400'}>
            {displayCount}
          </Text>
        </Flex>

        {/* Selection indicator */}
        {isSelected && (
          <PiCheckBold size={24} color="white" style={{ flexShrink: 0 }} />
        )}
      </Flex>
    );
  }
);

MobileBoardListItem.displayName = 'MobileBoardListItem';
```

**Step 2: Verify TypeScript compilation**

Run: `cd invokeai/frontend/web && pnpm lint:tsc`
Expected: No TypeScript errors

**Step 3: Commit**

```bash
git add invokeai/frontend/web/src/features/ui/components/mobile/boards/MobileBoardListItem.tsx
git commit -m "feat(mobile): add MobileBoardListItem component

- Displays board thumbnail or folder icon
- Shows board name and image count
- Indicates selection with checkmark
- Supports both regular boards and 'none' (Uncategorized)

🤖 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 2: Create MobileBoardPicker Component

**Files:**
- Create: `invokeai/frontend/web/src/features/ui/components/mobile/boards/MobileBoardPicker.tsx`

**Step 1: Create the component with board list and create input**

```typescript
// src/features/ui/components/mobile/boards/MobileBoardPicker.tsx
import { Button, Flex, Input, Spinner, Text, useToast } from '@invoke-ai/ui-library';
import { useAppDispatch, useAppSelector } from 'app/store/storeHooks';
import { autoAddBoardIdChanged } from 'features/gallery/store/gallerySlice';
import { selectAutoAddBoardId } from 'features/gallery/store/gallerySelectors';
import type { BoardId } from 'features/gallery/store/types';
import { memo, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PiPlusBold, PiX } from 'react-icons/pi';
import { useListAllBoardsQuery, useCreateBoardMutation } from 'services/api/endpoints/boards';
import { MobileBoardListItem } from './MobileBoardListItem';

interface MobileBoardPickerProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Full-screen mobile board picker modal
 * Allows creating new boards and selecting existing boards
 * Modal stays open after create/select for batch operations
 */
export const MobileBoardPicker = memo(({ isOpen, onClose }: MobileBoardPickerProps) => {
  const { t } = useTranslation();
  const toast = useToast();
  const dispatch = useAppDispatch();

  const [newBoardName, setNewBoardName] = useState('');
  const autoAddBoardId = useAppSelector(selectAutoAddBoardId);

  const { data: boards, isLoading } = useListAllBoardsQuery({
    include_archived: false,
  });
  const [createBoard, { isLoading: isCreating }] = useCreateBoardMutation();

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

      // Auto-select newly created board
      dispatch(autoAddBoardIdChanged(result.board_id));

      // Clear input for next board
      setNewBoardName('');

      toast({
        title: t('boards.boardCreated'),
        status: 'success',
        duration: 1500,
      });

      // Modal stays open
    } catch (error) {
      toast({
        title: t('boards.boardCreationFailed'),
        status: 'error',
        duration: 3000,
      });
    }
  }, [newBoardName, boards, createBoard, dispatch, toast, t]);

  const handleSelectBoard = useCallback(
    (boardId: BoardId) => {
      dispatch(autoAddBoardIdChanged(boardId));
      // Modal stays open
    },
    [dispatch]
  );

  const handleInputKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        handleCreateBoard();
      }
    },
    [handleCreateBoard]
  );

  if (!isOpen) {
    return null;
  }

  return (
    <Flex
      position="fixed"
      top={0}
      left={0}
      right={0}
      bottom={0}
      zIndex={9999}
      bg="base.900"
      flexDirection="column"
    >
      {/* Header */}
      <Flex
        px={4}
        py={3}
        bg="base.850"
        borderBottomWidth={1}
        borderColor="base.700"
        justifyContent="space-between"
        alignItems="center"
      >
        <Text fontSize="lg" fontWeight="semibold" color="base.100">
          {t('boards.selectBoard')}
        </Text>
        <Button onClick={onClose} variant="ghost" size="sm">
          {t('common.done')}
        </Button>
      </Flex>

      {/* Scrollable content */}
      <Flex flex={1} flexDirection="column" overflowY="auto">
        {/* Create board input (first in list) */}
        <Flex px={4} py={3} gap={2} borderBottomWidth={1} borderColor="base.700" bg="base.850">
          <Input
            placeholder={t('boards.newBoardName')}
            value={newBoardName}
            onChange={(e) => setNewBoardName(e.target.value)}
            onKeyDown={handleInputKeyDown}
            size="md"
            flex={1}
            isDisabled={isCreating}
          />
          <Button
            onClick={handleCreateBoard}
            isLoading={isCreating}
            leftIcon={<PiPlusBold />}
            colorScheme="invokeBlue"
            size="md"
            isDisabled={!newBoardName.trim() || isCreating}
          >
            {t('boards.create')}
          </Button>
        </Flex>

        {/* Loading state */}
        {isLoading && (
          <Flex justifyContent="center" py={8}>
            <Spinner size="xl" />
          </Flex>
        )}

        {/* Board list */}
        {!isLoading && (
          <>
            {/* Uncategorized board */}
            <MobileBoardListItem
              board="none"
              isSelected={autoAddBoardId === 'none'}
              onSelect={handleSelectBoard}
            />

            {/* User boards */}
            {boards?.map((board) => (
              <MobileBoardListItem
                key={board.board_id}
                board={board}
                isSelected={autoAddBoardId === board.board_id}
                onSelect={handleSelectBoard}
              />
            ))}

            {/* Empty state */}
            {boards?.length === 0 && (
              <Flex flexDirection="column" gap={2} p={8} alignItems="center">
                <Text color="base.400" fontSize="sm" textAlign="center">
                  {t('boards.noBoardsYet')}
                </Text>
                <Text color="base.500" fontSize="xs" textAlign="center">
                  {t('boards.createFirstBoard')}
                </Text>
              </Flex>
            )}
          </>
        )}
      </Flex>
    </Flex>
  );
});

MobileBoardPicker.displayName = 'MobileBoardPicker';
```

**Step 2: Verify TypeScript compilation**

Run: `cd invokeai/frontend/web && pnpm lint:tsc`
Expected: No TypeScript errors

**Step 3: Commit**

```bash
git add invokeai/frontend/web/src/features/ui/components/mobile/boards/MobileBoardPicker.tsx
git commit -m "feat(mobile): add MobileBoardPicker component

- Full-screen modal for board selection
- Inline board creation with validation
- Duplicate name prevention (case-insensitive)
- Auto-selects newly created boards
- Modal stays open for batch operations

🤖 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 3: Create MobileBoardSelector Component

**Files:**
- Create: `invokeai/frontend/web/src/features/ui/components/mobile/boards/MobileBoardSelector.tsx`

**Step 1: Create the selector button component**

```typescript
// src/features/ui/components/mobile/boards/MobileBoardSelector.tsx
import { Button, Flex, Text } from '@invoke-ai/ui-library';
import { useAppSelector } from 'app/store/storeHooks';
import { selectAutoAddBoardId } from 'features/gallery/store/gallerySelectors';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PiCaretDownBold, PiFolderSimple } from 'react-icons/pi';
import { useBoardName } from 'services/api/hooks/useBoardName';
import { MobileBoardPicker } from './MobileBoardPicker';

/**
 * Mobile board selector button that opens the board picker modal
 * Displays currently selected board and allows changing it
 */
export const MobileBoardSelector = memo(() => {
  const { t } = useTranslation();
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const autoAddBoardId = useAppSelector(selectAutoAddBoardId);
  const boardName = useBoardName(autoAddBoardId);

  return (
    <>
      <Button
        onClick={() => setIsPickerOpen(true)}
        variant="outline"
        size="lg"
        w="full"
        justifyContent="space-between"
        px={4}
        py={6}
        h="auto"
      >
        <Flex alignItems="center" gap={3}>
          <PiFolderSimple size={20} />
          <Flex flexDirection="column" alignItems="flex-start">
            <Text fontSize="xs" color="base.400" fontWeight="normal">
              {t('boards.saveTo')}
            </Text>
            <Text fontSize="md" fontWeight="semibold">
              {boardName}
            </Text>
          </Flex>
        </Flex>
        <PiCaretDownBold size={16} />
      </Button>

      <MobileBoardPicker isOpen={isPickerOpen} onClose={() => setIsPickerOpen(false)} />
    </>
  );
});

MobileBoardSelector.displayName = 'MobileBoardSelector';
```

**Step 2: Verify TypeScript compilation**

Run: `cd invokeai/frontend/web && pnpm lint:tsc`
Expected: No TypeScript errors

**Step 3: Commit**

```bash
git add invokeai/frontend/web/src/features/ui/components/mobile/boards/MobileBoardSelector.tsx
git commit -m "feat(mobile): add MobileBoardSelector component

- Compact button showing current board selection
- Opens MobileBoardPicker on tap
- Displays board name using useBoardName hook
- Follows mobile UI patterns

🤖 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 4: Add Missing Translation Keys

**Files:**
- Modify: `invokeai/frontend/web/public/locales/en.json` (or appropriate translation file)

**Step 1: Find the boards translation section**

Search for the boards section in the translation files:

Run: `cd invokeai/frontend/web && grep -n "\"boards\":" public/locales/en.json`

**Step 2: Add missing translation keys**

Add the following keys to the `boards` section if they don't exist:

```json
"boards": {
  "selectBoard": "Select Board",
  "newBoardName": "New board name...",
  "create": "Create",
  "boardNameRequired": "Please enter a board name",
  "boardNameExists": "A board with this name already exists",
  "boardCreated": "Board created",
  "boardCreationFailed": "Failed to create board",
  "noBoardsYet": "No boards yet",
  "createFirstBoard": "Create your first board to organize images",
  "saveTo": "Save to"
}
```

**Step 3: Verify JSON is valid**

Run: `cd invokeai/frontend/web && node -e "JSON.parse(require('fs').readFileSync('public/locales/en.json'))"`
Expected: No errors (valid JSON)

**Step 4: Commit**

```bash
git add invokeai/frontend/web/public/locales/en.json
git commit -m "feat(mobile): add board selector translation keys

Add translation keys for mobile board selector:
- Board selection UI labels
- Board creation messages
- Validation error messages
- Empty state messages

🤖 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 5: Integrate MobileBoardSelector into Generate Tab

**Files:**
- Modify: `invokeai/frontend/web/src/features/ui/components/mobile/MobileGenerateTab.tsx` (or similar file)

**Step 1: Find the Generate tab component**

Search for the mobile Generate tab component:

Run: `cd invokeai/frontend/web && find src/features/ui/components/mobile -name "*Generate*.tsx" -type f`

**Step 2: Add MobileBoardSelector import and usage**

Add the import at the top of the file:

```typescript
import { MobileBoardSelector } from './boards/MobileBoardSelector';
```

Add the component above the Generate button (exact placement depends on existing structure):

```typescript
{/* Board selector - above Generate button for one-handed reach */}
<MobileBoardSelector />

{/* Generate button */}
<Button ...>Generate</Button>
```

**Step 3: Verify TypeScript compilation**

Run: `cd invokeai/frontend/web && pnpm lint:tsc`
Expected: No TypeScript errors

**Step 4: Build frontend to check for runtime errors**

Run: `cd invokeai/frontend/web && pnpm build`
Expected: Build succeeds without errors

**Step 5: Commit**

```bash
git add invokeai/frontend/web/src/features/ui/components/mobile/
git commit -m "feat(mobile): integrate board selector into Generate tab

- Add MobileBoardSelector above Generate button
- Positioned for easy one-handed thumb reach
- Users can now select/create boards before generating

🤖 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 6: Create Index Export File

**Files:**
- Create: `invokeai/frontend/web/src/features/ui/components/mobile/boards/index.ts`

**Step 1: Create index file for clean imports**

```typescript
// src/features/ui/components/mobile/boards/index.ts
export { MobileBoardSelector } from './MobileBoardSelector';
export { MobileBoardPicker } from './MobileBoardPicker';
export { MobileBoardListItem } from './MobileBoardListItem';
```

**Step 2: Update Generate tab import to use index**

Modify the import in the Generate tab file:

```typescript
// Before
import { MobileBoardSelector } from './boards/MobileBoardSelector';

// After
import { MobileBoardSelector } from './boards';
```

**Step 3: Verify TypeScript compilation**

Run: `cd invokeai/frontend/web && pnpm lint:tsc`
Expected: No TypeScript errors

**Step 4: Commit**

```bash
git add invokeai/frontend/web/src/features/ui/components/mobile/boards/index.ts
git commit -m "feat(mobile): add boards components index export

Clean up imports with barrel export file

🤖 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 7: Run Linters and Fix Issues

**Files:**
- All created/modified files

**Step 1: Run ESLint**

Run: `cd invokeai/frontend/web && pnpm lint:eslint`
Expected: No errors (warnings acceptable)

**Step 2: Run Prettier**

Run: `cd invokeai/frontend/web && pnpm lint:prettier`
Expected: No formatting issues

**Step 3: Fix any issues automatically**

If there are fixable issues:

Run: `cd invokeai/frontend/web && pnpm fix`

**Step 4: Verify TypeScript again**

Run: `cd invokeai/frontend/web && pnpm lint:tsc`
Expected: No TypeScript errors

**Step 5: Run all linters together**

Run: `cd invokeai/frontend/web && pnpm lint`
Expected: All checks pass

**Step 6: Commit any fixes**

If changes were made by linters:

```bash
git add invokeai/frontend/web/src/features/ui/components/mobile/boards/
git commit -m "style(mobile): fix linting issues in board components

Auto-fix ESLint and Prettier issues

🤖 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 8: Final Testing and Verification

**Files:**
- All created/modified files

**Step 1: Build the frontend**

Run: `cd invokeai/frontend/web && pnpm build`
Expected: Build succeeds

**Step 2: Test in development mode**

Run: `cd invokeai/frontend/web && pnpm dev`
Expected: Dev server starts without errors

**Step 3: Manual testing checklist**

Open the mobile Generate tab and verify:

- [ ] Board selector button displays current board name
- [ ] Tapping button opens full-screen board picker
- [ ] Create input is first item in scrollable list
- [ ] Can create new board with valid name
- [ ] Duplicate name validation works (case-insensitive)
- [ ] Newly created board is auto-selected
- [ ] Modal stays open after creating board
- [ ] Can select existing boards from list
- [ ] "Uncategorized" option appears first
- [ ] Board thumbnails display correctly (or folder icon)
- [ ] Image counts display correctly
- [ ] Selection indicator (checkmark) shows on current board
- [ ] "Done" button closes modal
- [ ] Generated images save to selected board

**Step 4: Test edge cases**

- [ ] Empty board list (only Uncategorized)
- [ ] Many boards (scrolling works)
- [ ] Long board names (truncation)
- [ ] Empty input validation
- [ ] Rapid board creation (no duplicate creates)
- [ ] Network error handling (create board fails)

**Step 5: Document any issues found**

Create GitHub issues or notes for any bugs discovered during testing.

---

## Task 9: Create Final Commit and Build

**Files:**
- All modified files

**Step 1: Review all changes**

Run: `git status`
Expected: All board selector changes are staged/committed

**Step 2: Build production frontend**

Run: `cd invokeai/frontend/web && pnpm build`
Expected: Build succeeds

**Step 3: Deploy to Docker (if applicable)**

Run: `cd /mnt/storage/invokeai-mobile-ui/InvokeAI && docker compose -f docker-compose.test.yml up -d --build`
Expected: Docker build and deployment succeeds

**Step 4: Create summary commit if needed**

If there are any final cleanup changes:

```bash
git add -A
git commit -m "feat(mobile): complete board selector feature

Summary of changes:
- Add MobileBoardListItem component
- Add MobileBoardPicker full-screen modal
- Add MobileBoardSelector trigger button
- Integrate into Generate tab
- Add translation keys
- Frontend validation for duplicate board names
- Support for batch board creation

Feature allows mobile users to select/create boards before generating
images, with one-handed friendly UX and inline board creation.

🤖 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Verification Steps

After completing all tasks:

1. **Linting**: Run `pnpm lint` - all checks pass
2. **Build**: Run `pnpm build` - succeeds
3. **Dev Server**: Run `pnpm dev` - starts without errors
4. **Manual Testing**: Complete the checklist in Task 8
5. **Edge Cases**: Verify all edge cases handled correctly

## Success Criteria

- [ ] Board selector button appears above Generate button
- [ ] Full-screen board picker opens on tap
- [ ] Can create new boards with validation
- [ ] Can select existing boards
- [ ] Selection persists across sessions (Redux state)
- [ ] Images generate to selected board
- [ ] No TypeScript errors
- [ ] No linting errors
- [ ] Build succeeds
- [ ] All components follow existing mobile UI patterns

## Notes

- This implementation follows TDD principles where applicable (logic > UI)
- UI component rendering tests are not included per CLAUDE.md guidance
- All components use existing hooks and patterns from the codebase
- Translation keys may need adjustment based on existing i18n structure
- The Generate tab integration path may vary depending on current mobile UI structure
