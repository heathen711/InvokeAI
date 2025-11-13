# Mobile View Tab Board Selection Design

**Date:** 2025-11-13
**Status:** Approved
**Feature:** Board selection and filtering for mobile View tab

## Overview

Add board selection and image/asset filtering to the mobile View tab, allowing users to browse images organized by boards with one-handed operation. This feature reuses existing desktop board infrastructure and mobile UI patterns from the Generate tab.

## Problem Statement

The mobile View tab currently displays all images without filtering by board. Users cannot:
- View images from a specific board
- Switch between boards to organize their gallery
- Filter between images and assets
- Navigate their organized content efficiently on mobile

The desktop UI has full board support, and the mobile Generate tab has board selection for the "save to" feature. The View tab needs equivalent functionality for browsing.

## Goals

- Enable board filtering in mobile View tab
- Support switching between images and assets view
- Maintain independent state from Create tab (view board ≠ save-to board)
- Optimize for one-handed mobile operation
- Reuse existing components and patterns
- Maximize screen space for image grid

## Non-Goals

- Board management features (rename, delete, merge) in mobile UI
- Board search functionality in mobile View tab
- Multi-board selection or advanced filtering
- Changes to desktop board functionality
- Board creation workflow changes

## Design

### User Experience

**Layout:**
- Remove top "Gallery" bar to maximize grid space
- Add persistent bottom board selector bar above tab navigation
- Board selector on left, view toggle on right
- Full-screen modal for board picker (matches Generate tab pattern)

**Bottom Bar Structure:**
```
┌───────────────────────────────────────────────┐
│ 📁 Viewing: [Board Name]  [Switch to Assets] │
└───────────────────────────────────────────────┘
```

**Interactions:**
- Tap board name → Opens full-screen board picker modal
- Tap "Switch to Assets/Images" → Toggles between images and assets
- Select board in picker → Gallery refetches and shows filtered content
- Board picker allows creating new boards (existing functionality)

**Label Conventions:**
- Board selector label: "Viewing: [Board Name]"
- Uncategorized board (ID 'none'): "Viewing: Uncategorized"
- Toggle button: "Switch to Assets" or "Switch to Images"

### Component Architecture

**Modified Components:**

1. **MobileBoardSelector** - Add mode prop:
   ```typescript
   interface MobileBoardSelectorProps {
     mode?: 'save' | 'view';  // Default: 'save'
   }

   const CONFIG = {
     save: {
       label: 'Save To',
       icon: PiFolder,
       selector: selectAutoAddBoardId,
       action: autoAddBoardIdChanged,
     },
     view: {
       label: 'Viewing',
       icon: PiFunnel,
       selector: selectSelectedBoardId,
       action: boardIdSelected,
     },
   };
   ```

2. **MobileBoardPicker** - Accept mode prop and dispatch appropriate action:
   ```typescript
   interface MobileBoardPickerProps {
     mode?: 'save' | 'view';
   }

   const handleSelectBoard = (boardId: BoardId) => {
     if (mode === 'view') {
       dispatch(boardIdSelected({ boardId }));
     } else {
       dispatch(autoAddBoardIdChanged(boardId));
     }
   };
   ```

**New Components:**

3. **MobileBoardSelectorBar** - Persistent bottom bar:
   ```typescript
   interface MobileBoardSelectorBarProps {
     mode: 'save' | 'view';
   }

   export const MobileBoardSelectorBar = ({ mode }: MobileBoardSelectorBarProps) => {
     const galleryView = useAppSelector(selectGalleryView);
     const dispatch = useAppDispatch();

     const handleToggleView = () => {
       const newView = galleryView === 'images' ? 'assets' : 'images';
       dispatch(galleryViewChanged(newView));
     };

     return (
       <Flex
         position="sticky"
         bottom={0}
         bg="base.900"
         p={2}
         gap={2}
         borderTop="1px solid"
         borderColor="base.700"
       >
         <MobileBoardSelector mode={mode} />

         {mode === 'view' && (
           <Button
             onClick={handleToggleView}
             flexShrink={0}
           >
             {galleryView === 'images' ? 'Switch to Assets' : 'Switch to Images'}
           </Button>
         )}
       </Flex>
     );
   };
   ```

**Updated Components:**

4. **MobileViewTab** - Wire up state and remove top bar:
   ```typescript
   export const MobileViewTab = memo(() => {
     const selectedBoardId = useAppSelector(selectSelectedBoardId);
     const galleryView = useAppSelector(selectGalleryView);
     const [selectedImage, setSelectedImage] = useState<ImageDTO | null>(null);
     const [viewerOpen, setViewerOpen] = useState(false);

     return (
       <Flex flexDirection="column" width="full" height="full">
         {/* Removed: MobileTopBar with "Gallery" text */}

         <Flex flex={1} overflow="hidden">
           <MobileGalleryGrid
             onImageSelect={handleImageSelect}
             boardId={selectedBoardId}
             galleryView={galleryView}
           />
         </Flex>

         <MobileBoardSelectorBar mode="view" />

         {viewerOpen && selectedImage && (
           <MobileImageViewer
             images={images}
             currentIndex={currentIndex}
             onClose={handleViewerClose}
           />
         )}
       </Flex>
     );
   });
   ```

5. **MobileGalleryGrid** - Add galleryView prop:
   ```typescript
   interface MobileGalleryGridProps {
     onImageSelect: (image: ImageDTO) => void;
     boardId?: BoardId;
     galleryView?: 'images' | 'assets';
   }

   export const MobileGalleryGrid = memo(({
     onImageSelect,
     boardId,
     galleryView = 'images'
   }: MobileGalleryGridProps) => {
     const { data, isLoading, refetch } = useListImagesQuery({
       board_id: boardId === 'none' ? undefined : boardId,
       is_intermediate: false,
       image_category: galleryView,
       limit: 50,
       offset: 0,
     });

     // ... render grid with empty states
   });
   ```

### Data Flow

**Board Selection Flow:**
1. User taps board selector in bottom bar
2. `MobileBoardPicker` modal opens (full-screen)
3. User selects a board
4. `boardIdSelected({ boardId })` dispatched
5. `gallerySlice.selectedBoardId` updated in Redux
6. `MobileViewTab` receives new `selectedBoardId` from selector
7. `MobileGalleryGrid` receives new `boardId` prop
8. RTK Query `useListImagesQuery` refetches with new `board_id` parameter
9. Gallery re-renders with filtered images

**View Toggle Flow:**
1. User taps "Switch to Assets" button
2. `galleryViewChanged('assets')` dispatched
3. `gallerySlice.galleryView` updated in Redux
4. `MobileViewTab` receives new `galleryView` from selector
5. `MobileGalleryGrid` receives new `galleryView` prop
6. RTK Query refetches with `image_category: 'assets'`
7. Gallery re-renders with assets

**State Independence:**
- `selectedBoardId` (View tab filtering) and `autoAddBoardId` (Create tab save-to) are separate Redux state
- User can view "Vacation" board while saving new images to "Portfolio" board
- Each tab maintains its own context

### Redux State

**Existing selectors used:**
- `selectSelectedBoardId` - Current board being viewed
- `selectAutoAddBoardId` - Current board for saving (Create tab)
- `selectGalleryView` - Current view mode ('images' | 'assets')

**Existing actions used:**
- `boardIdSelected({ boardId })` - Update viewed board
- `autoAddBoardIdChanged(boardId)` - Update save-to board
- `galleryViewChanged('images' | 'assets')` - Toggle view mode

No new Redux state needed - all infrastructure exists.

### Empty States

**No boards exist:**
- Board selector shows "Viewing: Uncategorized"
- `selectedBoardId` defaults to 'none'
- Picker modal only shows "Create New Board" option

**Selected board has no images:**
```
        🖼️

  No images in [Board Name]

  [Switch to Assets] [Create]
```

**Selected board has no assets:**
```
        📄

  No assets in [Board Name]

  [Switch to Images]
```

### Error Handling

**Board deleted while viewing:**
- Listen for board deletion via Socket.IO events
- If currently viewing deleted board, auto-switch to 'none'
- Show toast notification: "[Board Name] was deleted"

**Network errors:**
- RTK Query handles caching and retry automatically
- Failed refetch: Show error toast, keep displaying cached data
- Offline: Show cached images with "Offline" indicator

**Loading states:**
- Board list loading: Skeleton in board selector button
- Switching boards: Loading spinner overlay on grid
- Creating board: Spinner in picker modal, disable button

## Implementation Plan

### Files to Modify

1. **invokeai/frontend/web/src/features/ui/components/mobile/boards/MobileBoardSelector.tsx**
   - Add `mode` prop with default 'save'
   - Add CONFIG object mapping mode to label/icon/selector/action
   - Update to use mode-specific configuration

2. **invokeai/frontend/web/src/features/ui/components/mobile/boards/MobileBoardPicker.tsx**
   - Add `mode` prop
   - Update board selection handler to dispatch mode-specific action
   - Pass mode through from MobileBoardSelector

3. **invokeai/frontend/web/src/features/ui/components/mobile/tabs/MobileViewTab.tsx**
   - Remove `MobileTopBar` component
   - Add `selectedBoardId` and `galleryView` selectors
   - Pass `boardId` and `galleryView` to `MobileGalleryGrid`
   - Add `MobileBoardSelectorBar` at bottom

4. **invokeai/frontend/web/src/features/gallery/components/MobileGalleryGrid.tsx**
   - Add `galleryView` prop to interface
   - Pass `image_category: galleryView` to `useListImagesQuery`
   - Update empty states to show board-specific messages

### Files to Create

5. **invokeai/frontend/web/src/features/ui/components/mobile/boards/MobileBoardSelectorBar.tsx**
   - New bottom bar component
   - Contains `MobileBoardSelector` with mode prop
   - Contains view toggle button (only shown in 'view' mode)
   - Sticky positioning, styled to match bottom nav

6. **invokeai/frontend/web/src/features/ui/components/mobile/boards/index.ts**
   - Export `MobileBoardSelectorBar`
   - Keep existing exports

### Implementation Steps

1. Add mode prop support to `MobileBoardSelector` and `MobileBoardPicker`
2. Create `MobileBoardSelectorBar` component
3. Update `MobileViewTab` to use new bottom bar and wire state
4. Update `MobileGalleryGrid` to accept and use `galleryView` prop
5. Test board switching, view toggling, and empty states
6. Verify state independence between Create and View tabs
7. Test error scenarios (deleted board, network failures)

## Testing

### Component Tests

- **MobileBoardSelector**: Test mode prop changes label, selector, and action
- **MobileBoardPicker**: Test mode-specific action dispatch
- **MobileBoardSelectorBar**: Test layout, toggle button visibility, and interactions
- **MobileViewTab**: Test state wiring and prop passing
- **MobileGalleryGrid**: Test filtering by boardId and galleryView

### Integration Tests

- User flow: Open View tab → Select board → See filtered images
- User flow: Switch to assets → See filtered assets → Switch back
- User flow: Delete board while viewing → Auto-switch to Uncategorized
- Cross-tab independence: View different board than Create tab's save-to board

### Manual Testing Checklist

- [ ] Bottom bar stays sticky while scrolling grid
- [ ] One-handed operation comfortable (thumb-reachable)
- [ ] Board picker animations smooth
- [ ] Toggle button easily tappable (min 44x44pt)
- [ ] Empty states display correctly for all scenarios
- [ ] Loading states don't flicker
- [ ] Works on various screen sizes (small phones to tablets)
- [ ] Create tab board selector still works (no regression)
- [ ] Switching tabs maintains separate board state

## Alternatives Considered

### Board Selector Placement

**Considered:** Top bar, horizontal scrollable tabs, dropdown, sidebar drawer
**Chosen:** Bottom bar
**Reason:** Optimizes for one-handed mobile operation, matches Generate tab pattern

### State Strategy

**Considered:** Shared state (sync selectedBoardId with autoAddBoardId)
**Chosen:** Independent state
**Reason:** Matches desktop UX where viewing board ≠ save-to board, avoids side effects

### View Toggle UI

**Considered:** Separate tab bar, icons only, integrated into board picker
**Chosen:** Text button in bottom bar
**Reason:** Clear, accessible, keeps all controls in one reachable area

### Component Reuse

**Considered:** Create separate components for View tab
**Chosen:** Add mode prop to existing components
**Reason:** DRY principle, maintains consistency, reduces maintenance burden

## Future Enhancements

- Board search in mobile View tab
- Board management (rename, delete) in mobile UI
- Multi-board selection for batch operations
- Board sorting options
- Recent boards quick access
- Board statistics in picker

## References

- Desktop boards implementation: `invokeai/frontend/web/src/features/gallery/components/Boards/`
- Mobile Generate tab: `invokeai/frontend/web/src/features/ui/components/mobile/tabs/MobileCreateTab.tsx`
- Existing mobile board components: `invokeai/frontend/web/src/features/ui/components/mobile/boards/`
- Gallery state: `invokeai/frontend/web/src/features/gallery/store/gallerySlice.ts`
