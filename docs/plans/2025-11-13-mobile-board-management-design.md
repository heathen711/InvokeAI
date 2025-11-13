# Mobile Board Management Actions Design

**Date:** 2025-11-13
**Status:** Draft
**Feature:** Board management actions (Download, Archive, Delete) in mobile board picker

## Overview

Add board management actions to the mobile board picker modal, allowing users to download, archive, and delete boards with a "..." menu on each board row. This feature adapts the existing desktop board management UI patterns to mobile, with appropriate confirmations and navigation handling.

## Problem Statement

The mobile board picker currently only allows selecting boards. Users cannot:
- Download all images from a board
- Archive boards to declutter their board list
- Delete boards they no longer need
- Manage the "Uncategorized" board images

These management features exist on desktop but are missing from mobile, limiting board organization capabilities.

## Goals

- Add board action menu ("...") to each board row in mobile picker
- Support Download, Archive, and Delete actions
- Add "Show Archived Boards" toggle to board selector bar
- Reuse existing desktop API calls and logic
- Provide appropriate confirmations for destructive actions
- Handle edge cases (deleting current board, uncategorized board)
- Maintain mobile-friendly UX with bottom sheets and large tap targets

## Non-Goals

- Board renaming (separate feature)
- Multi-board selection for batch operations
- Board search functionality
- Custom download options (different from desktop)
- Changes to desktop board management

## Design

### User Experience

**Board Row with Actions Menu:**
```
┌────────────────────────────────────────┐
│ 📁 Board Name                    [  ⋮ ]│
│    12 images, 3 assets                 │
└────────────────────────────────────────┘
```

**Action Sheet (Bottom Sheet Modal):**
```
┌────────────────────────────────────────┐
│                                        │
│  [Download Board]    ⬇️                │
│  [Archive Board]     📦                │
│  [Delete Board]      🗑️                 │
│                                        │
│  [Cancel]                              │
└────────────────────────────────────────┘
```

**Board Selector Bar with Archived Toggle:**
```
┌────────────────────────────────────────┐
│ 📁 Viewing: Board 1      [Switch to...] │
│ ☑️ Show Archived Boards                 │
└────────────────────────────────────────┘
```

**Delete Confirmation Dialog:**
```
┌────────────────────────────────────────┐
│ Delete Board Name                      │
│                                        │
│ This board contains:                   │
│ • 12 images                            │
│ • 3 assets                             │
│                                        │
│ Deleted boards cannot be restored.     │
│ Images will be permanently deleted.    │
│                                        │
│ [Cancel] [Delete Board Only] [Delete Board & Images] │
└────────────────────────────────────────┘
```

### Interactions

**Download Board:**
1. User taps "..." on board row
2. Action sheet opens
3. User taps "Download Board"
4. Action sheet closes
5. Browser download starts (user sees browser download UI)
6. Toast notification: "Downloading images from [Board Name]"

**Archive Board:**
1. User taps "..." on board row
2. Action sheet opens
3. User taps "Archive Board"
4. Board updates `archived: true` via API
5. Action sheet closes
6. Board picker refreshes, archived board disappears (if toggle off)
7. Toast notification: "[Board Name] archived"

**Show Archived Boards:**
1. User toggles "Show Archived Boards" in selector bar
2. Board picker refetches with `include_archived: true`
3. Archived boards appear with visual indicator (grayed out or badge)
4. Archived boards show "Unarchive" instead of "Archive" in menu

**Delete Board:**
1. User taps "..." on board row
2. Action sheet opens
3. User taps "Delete Board"
4. Action sheet closes
5. Confirmation dialog opens showing:
   - Board name
   - Image/asset count
   - Warning about permanence
   - Two delete options (or one for uncategorized)
6. User selects "Delete Board Only" or "Delete Board & Images"
7. API call executes
8. If deleting currently selected board:
   - Auto-switch to "Uncategorized" board
   - Gallery refetches with new board
9. Picker modal stays open
10. Toast notification: "[Board Name] deleted"

**Uncategorized Board Special Case:**
1. User taps "..." on Uncategorized row
2. Action sheet shows only "Download Board" and "Delete All Images"
3. Delete confirmation shows single option: "Delete All Uncategorized Images"

### Component Architecture

**Modified Components:**

1. **MobileBoardListItem** - Add action menu button:
   ```typescript
   interface MobileBoardListItemProps {
     board: BoardDTO | 'none';
     isSelected: boolean;
     onSelect: (boardId: BoardId) => void;
   }

   export const MobileBoardListItem = ({ board, isSelected, onSelect }: MobileBoardListItemProps) => {
     const [actionSheetOpen, setActionSheetOpen] = useState(false);

     const handleMenuClick = (e: React.MouseEvent) => {
       e.stopPropagation(); // Prevent board selection
       setActionSheetOpen(true);
     };

     return (
       <Flex onClick={() => onSelect(boardId)} {...}>
         <Flex flex={1}>
           {/* Board name, image count */}
         </Flex>

         <IconButton
           icon={<PiDotsThreeVerticalBold />}
           onClick={handleMenuClick}
           aria-label="Board actions"
           size="sm"
         />

         <MobileBoardActionSheet
           board={board}
           isOpen={actionSheetOpen}
           onClose={() => setActionSheetOpen(false)}
         />
       </Flex>
     );
   };
   ```

2. **MobileBoardSelectorBar** - Add archived toggle:
   ```typescript
   export const MobileBoardSelectorBar = ({ mode }: { mode: 'save' | 'view' }) => {
     const shouldShowArchivedBoards = useAppSelector(selectShouldShowArchivedBoards);
     const dispatch = useAppDispatch();

     const handleToggleArchived = useCallback(() => {
       dispatch(shouldShowArchivedBoardsChanged(!shouldShowArchivedBoards));
     }, [shouldShowArchivedBoards, dispatch]);

     return (
       <Flex flexDirection="column" position="sticky" bottom={0} bg="base.900" borderTop="1px solid" borderColor="base.700">
         {/* Existing board selector and view toggle */}
         <Flex px={3} py={2} gap={2}>
           <MobileBoardSelector mode={mode} />
           {mode === 'view' && <Button {...}>Switch to...</Button>}
         </Flex>

         {/* New archived boards toggle */}
         <Flex px={3} py={2} alignItems="center" gap={2}>
           <Checkbox
             isChecked={shouldShowArchivedBoards}
             onChange={handleToggleArchived}
           />
           <Text fontSize="sm">{t('gallery.showArchivedBoards')}</Text>
         </Flex>
       </Flex>
     );
   };
   ```

3. **MobileBoardPicker** - Pass archived flag to API:
   ```typescript
   export const MobileBoardPicker = ({ isOpen, onClose, mode }: MobileBoardPickerProps) => {
     const shouldShowArchivedBoards = useAppSelector(selectShouldShowArchivedBoards);

     const { data: boards, isLoading } = useListAllBoardsQuery({
       include_archived: shouldShowArchivedBoards,
     });

     // ... rest of component
   };
   ```

**New Components:**

4. **MobileBoardActionSheet** - Bottom sheet with actions:
   ```typescript
   interface MobileBoardActionSheetProps {
     board: BoardDTO | 'none';
     isOpen: boolean;
     onClose: () => void;
   }

   export const MobileBoardActionSheet = ({ board, isOpen, onClose }: MobileBoardActionSheetProps) => {
     const { t } = useTranslation();
     const [bulkDownload] = useBulkDownloadImagesMutation();
     const [updateBoard] = useUpdateBoardMutation();

     const isUncategorized = board === 'none';
     const isArchived = board !== 'none' && board.archived;

     const handleDownload = useCallback(() => {
       const boardId = board === 'none' ? undefined : board.board_id;
       bulkDownload({ image_names: [], board_id: boardId });
       onClose();
       toast({
         title: t('boards.downloadingBoard'),
         status: 'info',
       });
     }, [board, bulkDownload, onClose, t]);

     const handleArchive = useCallback(async () => {
       if (board === 'none') return;

       try {
         await updateBoard({
           board_id: board.board_id,
           changes: { archived: !isArchived },
         }).unwrap();
         onClose();
         toast({
           title: isArchived ? t('boards.boardUnarchived') : t('boards.boardArchived'),
           status: 'success',
         });
       } catch {
         toast({
           title: t('boards.archiveFailed'),
           status: 'error',
         });
       }
     }, [board, isArchived, updateBoard, onClose, t]);

     const handleDelete = useCallback(() => {
       onClose();
       $boardToDelete.set(board);
     }, [board, onClose]);

     return (
       <Drawer isOpen={isOpen} onClose={onClose} placement="bottom">
         <DrawerOverlay />
         <DrawerContent>
           <DrawerBody py={4}>
             <VStack spacing={2} align="stretch">
               {/* Download */}
               <Button
                 onClick={handleDownload}
                 leftIcon={<PiDownloadBold />}
                 size="lg"
                 justifyContent="flex-start"
               >
                 {t('boards.downloadBoard')}
               </Button>

               {/* Archive/Unarchive (not for uncategorized) */}
               {!isUncategorized && (
                 <Button
                   onClick={handleArchive}
                   leftIcon={isArchived ? <PiArchiveBold /> : <PiArchiveFill />}
                   size="lg"
                   justifyContent="flex-start"
                 >
                   {isArchived ? t('boards.unarchiveBoard') : t('boards.archiveBoard')}
                 </Button>
               )}

               {/* Delete */}
               <Button
                 onClick={handleDelete}
                 leftIcon={<PiTrashBold />}
                 colorScheme="error"
                 size="lg"
                 justifyContent="flex-start"
               >
                 {isUncategorized
                   ? t('boards.deleteAllUncategorizedImages')
                   : t('boards.deleteBoard')
                 }
               </Button>

               {/* Cancel */}
               <Button onClick={onClose} variant="ghost" size="lg">
                 {t('common.cancel')}
               </Button>
             </VStack>
           </DrawerBody>
         </DrawerContent>
       </Drawer>
     );
   };
   ```

5. **MobileDeleteBoardModal** - Confirmation dialog:
   ```typescript
   export const MobileDeleteBoardModal = () => {
     const { t } = useTranslation();
     const boardToDelete = useStore($boardToDelete);
     const selectedBoardId = useAppSelector(selectSelectedBoardId);
     const dispatch = useAppDispatch();

     const { data: imageNames } = useListAllBoardImageNamesQuery(
       boardToDelete === 'none'
         ? { board_id: 'none', categories: null, is_intermediate: null }
         : { board_id: boardToDelete.board_id, categories: null, is_intermediate: null },
       { skip: !boardToDelete }
     );

     const [deleteBoardOnly] = useDeleteBoardMutation();
     const [deleteBoardAndImages] = useDeleteBoardAndImagesMutation();
     const [deleteUncategorizedImages] = useDeleteUncategorizedImagesMutation();

     const handleDeleteBoardOnly = useCallback(async () => {
       if (!boardToDelete || boardToDelete === 'none') return;

       // If deleting currently selected board, switch to uncategorized
       if (selectedBoardId === boardToDelete.board_id) {
         dispatch(boardIdSelected({ boardId: 'none' }));
       }

       await deleteBoardOnly({ board_id: boardToDelete.board_id });
       $boardToDelete.set(null);

       toast({
         title: t('boards.boardDeleted'),
         status: 'success',
       });
     }, [boardToDelete, selectedBoardId, deleteBoardOnly, dispatch, t]);

     const handleDeleteBoardAndImages = useCallback(async () => {
       if (!boardToDelete || boardToDelete === 'none') return;

       if (selectedBoardId === boardToDelete.board_id) {
         dispatch(boardIdSelected({ boardId: 'none' }));
       }

       await deleteBoardAndImages({ board_id: boardToDelete.board_id });
       $boardToDelete.set(null);

       toast({
         title: t('boards.boardAndImagesDeleted'),
         status: 'success',
       });
     }, [boardToDelete, selectedBoardId, deleteBoardAndImages, dispatch, t]);

     const handleDeleteUncategorizedImages = useCallback(async () => {
       if (!boardToDelete || boardToDelete !== 'none') return;

       await deleteUncategorizedImages();
       $boardToDelete.set(null);

       toast({
         title: t('boards.uncategorizedImagesDeleted'),
         status: 'success',
       });
     }, [boardToDelete, deleteUncategorizedImages, t]);

     const handleClose = useCallback(() => {
       $boardToDelete.set(null);
     }, []);

     const isUncategorized = boardToDelete === 'none';
     const imageCount = imageNames?.length ?? 0;

     return (
       <AlertDialog
         isOpen={Boolean(boardToDelete)}
         onClose={handleClose}
         isCentered
       >
         <AlertDialogOverlay />
         <AlertDialogContent>
           <AlertDialogHeader>
             {t('common.delete')} {isUncategorized ? t('boards.uncategorizedImages') : boardToDelete?.board_name}
           </AlertDialogHeader>

           <AlertDialogBody>
             <VStack align="start" spacing={3}>
               <Text>
                 {isUncategorized
                   ? t('boards.deleteUncategorizedImagesWarning', { count: imageCount })
                   : t('boards.deleteBoardWarning', { name: boardToDelete?.board_name })
                 }
               </Text>

               {!isUncategorized && (
                 <Box>
                   <Text fontWeight="semibold">{t('boards.boardContains')}:</Text>
                   <Text>• {boardToDelete?.image_count ?? 0} {t('common.images')}</Text>
                   <Text>• {boardToDelete?.asset_count ?? 0} {t('common.assets')}</Text>
                 </Box>
               )}

               <Text color="error.400" fontWeight="semibold">
                 {t('boards.deletedBoardsCannotbeRestored')}
               </Text>
               <Text color="error.400">
                 {t('gallery.deleteImagePermanent')}
               </Text>
             </VStack>
           </AlertDialogBody>

           <AlertDialogFooter>
             <VStack w="full" spacing={2}>
               <Button onClick={handleClose} w="full" variant="ghost">
                 {t('common.cancel')}
               </Button>

               {!isUncategorized && (
                 <Button
                   onClick={handleDeleteBoardOnly}
                   colorScheme="warning"
                   w="full"
                 >
                   {t('boards.deleteBoardOnly')}
                 </Button>
               )}

               <Button
                 onClick={isUncategorized ? handleDeleteUncategorizedImages : handleDeleteBoardAndImages}
                 colorScheme="error"
                 w="full"
               >
                 {isUncategorized
                   ? t('boards.deleteAllUncategorizedImages')
                   : t('boards.deleteBoardAndImages')
                 }
               </Button>
             </VStack>
           </AlertDialogFooter>
         </AlertDialogContent>
       </AlertDialog>
     );
   };
   ```

### Data Flow

**Download Board Flow:**
1. User taps "..." → Opens MobileBoardActionSheet
2. User taps "Download Board" → Calls `useBulkDownloadImagesMutation()`
3. Mutation sends `POST /api/v1/images/download` with `{ image_names: [], board_id }`
4. Backend creates download package (zip)
5. Browser download starts automatically
6. Toast shows "Downloading images from [Board Name]"

**Archive Board Flow:**
1. User taps "..." → Opens MobileBoardActionSheet
2. User taps "Archive Board" → Calls `useUpdateBoardMutation()`
3. Mutation sends `PATCH /api/v1/boards/{board_id}` with `{ archived: true }`
4. Redux state doesn't change (board disappears from list via API refetch)
5. If "Show Archived" is off, board picker refetches without archived boards
6. Toast shows "[Board Name] archived"

**Show Archived Toggle Flow:**
1. User toggles "Show Archived Boards" in selector bar
2. Dispatches `shouldShowArchivedBoardsChanged(!current)` Redux action
3. `MobileBoardPicker` receives new state via selector
4. `useListAllBoardsQuery` refetches with `include_archived: true/false`
5. Board list re-renders with/without archived boards
6. Archived boards show visual indicator (badge, opacity, icon)

**Delete Board Flow:**
1. User taps "..." → Opens MobileBoardActionSheet
2. User taps "Delete Board" → Sets `$boardToDelete` nanostore
3. Action sheet closes
4. MobileDeleteBoardModal opens (watches `$boardToDelete`)
5. Modal fetches image names to show count
6. User selects delete option
7. Mutation executes:
   - `useDeleteBoardMutation()` - DELETE /api/v1/boards/{board_id}
   - `useDeleteBoardAndImagesMutation()` - DELETE /api/v1/boards/{board_id}?include_images=true
   - `useDeleteUncategorizedImagesMutation()` - DELETE /api/v1/images/uncategorized
8. If deleting currently selected board:
   - Dispatch `boardIdSelected({ boardId: 'none' })`
   - Gallery refetches with uncategorized filter
9. Board picker stays open, list refetches
10. Toast shows success message

### Redux State

**Existing selectors used:**
- `selectShouldShowArchivedBoards` - Whether to show archived boards
- `selectSelectedBoardId` - Currently selected board for navigation handling

**Existing actions used:**
- `shouldShowArchivedBoardsChanged(boolean)` - Toggle archived visibility
- `boardIdSelected({ boardId })` - Switch to different board after delete

**New nanostore:**
- `$boardToDelete: BoardDTO | 'none' | null` - Board pending deletion confirmation

No new Redux state needed - reuse existing gallery slice.

### API Calls

All API calls reuse existing desktop hooks:

1. **Download:** `useBulkDownloadImagesMutation()`
   - Endpoint: `POST /api/v1/images/download`
   - Body: `{ image_names: [], board_id: string | undefined }`

2. **Archive:** `useUpdateBoardMutation()`
   - Endpoint: `PATCH /api/v1/boards/{board_id}`
   - Body: `{ archived: boolean }`

3. **Delete Board Only:** `useDeleteBoardMutation()`
   - Endpoint: `DELETE /api/v1/boards/{board_id}`

4. **Delete Board & Images:** `useDeleteBoardAndImagesMutation()`
   - Endpoint: `DELETE /api/v1/boards/{board_id}?include_images=true`

5. **Delete Uncategorized Images:** `useDeleteUncategorizedImagesMutation()`
   - Endpoint: `DELETE /api/v1/images/uncategorized`

6. **Get Image Names:** `useListAllBoardImageNamesQuery()`
   - Endpoint: `GET /api/v1/boards/{board_id}/image_names`
   - Used for delete confirmation count

### Visual Indicators

**Archived Board Styling:**
```typescript
<Flex
  opacity={board.archived ? 0.6 : 1}
  bg={isSelected ? 'base.750' : 'transparent'}
>
  <Icon as={board.archived ? PiArchiveFill : PiFolderSimple} />
  <Text>{board.board_name}</Text>
  {board.archived && (
    <Badge colorScheme="gray" size="sm">Archived</Badge>
  )}
</Flex>
```

**Action Sheet Button Colors:**
- Download: Default (base)
- Archive/Unarchive: Default (base)
- Delete: `colorScheme="error"` (red)

**Delete Confirmation Button Colors:**
- Cancel: `variant="ghost"`
- Delete Board Only: `colorScheme="warning"` (yellow/orange)
- Delete Board & Images: `colorScheme="error"` (red)

### Empty States

**No Boards When Archived Hidden:**
```
        📂

  No boards yet

  Create a board to organize your images

  [+ Create Board]
```

**No Boards When Showing Archived:**
```
        📂

  No boards yet

  All your boards are archived
  ☑️ Showing archived boards
```

**No Images in Uncategorized:**
```
        🖼️

  No uncategorized images

  Images will appear here when created
```

### Error Handling

**Download Failures:**
- Show error toast: "Failed to download board"
- Action sheet closes
- User can retry

**Archive Failures:**
- Show error toast with reason
- Action sheet closes
- Board state doesn't change

**Delete Failures:**
- Show error toast with reason
- Confirmation modal closes
- Board remains in list
- If was currently selected, selection doesn't change

**Network Errors:**
- RTK Query handles retry automatically
- Failed mutations show error toast
- No optimistic updates - wait for server confirmation

**Deleting Last Board:**
- Always have "Uncategorized" as fallback
- Can't delete "Uncategorized" board itself, only images
- User will always have at least one board (Uncategorized)

## Implementation Plan

### Files to Create

1. **MobileBoardActionSheet.tsx**
   - Bottom sheet drawer with Download, Archive, Delete actions
   - Conditional rendering for uncategorized board
   - Mutation hooks for each action
   - Toast notifications

2. **MobileDeleteBoardModal.tsx**
   - AlertDialog confirmation component
   - Image count display
   - Three delete options (board only, board+images, uncategorized images)
   - Navigation handling for current board deletion
   - Nanostore integration for `$boardToDelete`

3. **boardToDelete.ts** (nanostore)
   - `export const $boardToDelete = atom<BoardDTO | 'none' | null>(null);`

### Files to Modify

4. **MobileBoardListItem.tsx**
   - Add "..." IconButton to right side
   - Add MobileBoardActionSheet component
   - Prevent board selection when tapping action button

5. **MobileBoardSelectorBar.tsx**
   - Add "Show Archived Boards" checkbox below existing controls
   - Wire up to Redux state
   - Dispatch `shouldShowArchivedBoardsChanged` action

6. **MobileBoardPicker.tsx**
   - Add `selectShouldShowArchivedBoards` selector
   - Pass `include_archived` to `useListAllBoardsQuery`
   - Add MobileDeleteBoardModal component

7. **MobileViewTab.tsx** or App-level component
   - Add MobileDeleteBoardModal (needs to be at app level to handle deletion from any tab)

8. **en.json** (translations)
   - Add missing board management translation keys

### Implementation Steps

1. Create nanostore for `$boardToDelete`
2. Create `MobileBoardActionSheet` component
3. Create `MobileDeleteBoardModal` component
4. Modify `MobileBoardListItem` to add "..." button and action sheet
5. Modify `MobileBoardSelectorBar` to add archived toggle
6. Modify `MobileBoardPicker` to pass archived flag and mount delete modal
7. Add translation keys for new UI text
8. Test all three actions (download, archive, delete)
9. Test edge cases (uncategorized board, current board deletion, archived toggle)
10. Verify post-delete navigation behavior
11. Test error scenarios

## Testing

### Component Tests

- **MobileBoardActionSheet**: Test action dispatching, conditional rendering for uncategorized
- **MobileDeleteBoardModal**: Test delete options, navigation logic, image count display
- **MobileBoardListItem**: Test menu button click doesn't select board
- **MobileBoardSelectorBar**: Test archived toggle dispatches action

### Integration Tests

- Download flow: Menu → Download → API call → Toast
- Archive flow: Menu → Archive → API update → Board disappears
- Delete flow: Menu → Delete → Confirmation → API call → Navigation → Board removed
- Uncategorized special case: Different menu options
- Post-delete navigation: Current board deleted → Switch to uncategorized

### Manual Testing Checklist

- [ ] "..." button accessible with thumb on small phones
- [ ] Action sheet animations smooth
- [ ] Download starts and shows browser download UI
- [ ] Archive removes board from list (when toggle off)
- [ ] Show archived toggle reveals archived boards
- [ ] Archived boards have visual indicator
- [ ] Delete confirmation shows correct image count
- [ ] Delete board only keeps images in uncategorized
- [ ] Delete board+images removes all content
- [ ] Deleting current board switches to uncategorized
- [ ] Deleting non-current board maintains current selection
- [ ] Board picker stays open after all actions
- [ ] Uncategorized board shows different menu options
- [ ] Delete uncategorized images works correctly
- [ ] Error toasts display for failed actions
- [ ] Network failures handle gracefully

## Alternatives Considered

### Action Menu Pattern

**Considered:** Swipe-left to reveal actions (iOS Mail style)
**Chosen:** "..." button with bottom sheet
**Reason:** More discoverable, doesn't conflict with board selection tap, consistent with mobile design patterns

### Archived Toggle Location

**Considered:** Inside board picker modal header
**Chosen:** In board selector bar (always visible)
**Reason:** More accessible, doesn't require opening picker to toggle, maintains context when picker closed

### Download Feedback

**Considered:** In-app download progress indicator
**Chosen:** Browser native download UI
**Reason:** Less complexity, reuses existing desktop behavior, browser already handles progress/cancellation

### Delete Confirmation Style

**Considered:** Inline expansion in action sheet
**Chosen:** Separate AlertDialog modal
**Reason:** More prominent for destructive action, matches desktop pattern, allows more explanation text

## Future Enhancements

- Batch board operations (multi-select mode)
- Board renaming in mobile UI
- Board statistics in action menu
- Custom download options (select which images)
- Undo delete (trash/recovery system)
- Move images between boards in mobile UI
- Board sorting options in mobile

## References

- Desktop board context menu: `invokeai/frontend/web/src/features/gallery/components/Boards/BoardContextMenu.tsx`
- Desktop delete modal: `invokeai/frontend/web/src/features/gallery/components/Boards/DeleteBoardModal.tsx`
- Desktop archived toggle: `invokeai/frontend/web/src/features/gallery/components/GallerySettingsPopover/ShowArchivedBoardsCheckbox.tsx`
- Mobile board picker: `invokeai/frontend/web/src/features/ui/components/mobile/boards/MobileBoardPicker.tsx`
- Gallery Redux state: `invokeai/frontend/web/src/features/gallery/store/gallerySlice.ts`
