# Mobile Board Selector Design

**Date**: 2025-01-13
**Feature**: Board selection and creation for mobile Generate tab
**Status**: Design validated, ready for implementation

## Overview

Add the ability to select which board generated images are saved to in the mobile Generate tab, including support for creating new boards inline.

## User Requirements

- Select a board where new generated images will be saved
- Create new boards without leaving the Generate tab
- Support creating multiple boards in one session
- Visual board previews with thumbnails and image counts
- One-handed mobile-friendly UX

## Component Architecture

### 1. MobileBoardSelector (Trigger Button)

**Location**: Above the Generate button in the Generate tab

**Purpose**: Shows currently selected board and opens the board picker modal.

**Props**: None (reads from Redux state)

**Visual Design**:
```
┌─────────────────────────────────────┐
│  📁  Uncategorized              ▼   │
└─────────────────────────────────────┘
```

**Key Features**:
- Icon: Folder icon for "Uncategorized", thumbnail for selected boards
- Label: Board name via `useBoardName()` hook
- Chevron: Down arrow indicating dropdown
- Styling: Matches prompt field styling
- Full width for easy tapping

**State Hooks**:
```typescript
const autoAddBoardId = useAppSelector(selectAutoAddBoardId);
const boardName = useBoardName(autoAddBoardId);
const [isPickerOpen, setIsPickerOpen] = useState(false);
```

### 2. MobileBoardPicker (Full-screen Modal)

**Purpose**: Full-screen modal for creating and selecting boards.

**Props**:
```typescript
interface MobileBoardPickerProps {
  isOpen: boolean;
  onClose: () => void;
}
```

**Layout**:
```
┌─────────────────────────────────────┐
│         Select Board          Done  │  ← Header
├─────────────────────────────────────┤
│                                     │
│  ┌───────────────────────────────┐  │  ← Create input (first item)
│  │  New board name...        ➕  │  │
│  └───────────────────────────────┘  │
│  ─────────────────────────────────  │
│  📁  Uncategorized          ✓       │  ← Board items
│      Empty                          │
│  ─────────────────────────────────  │
│  🖼️  Portraits                      │
│  [thumb]  24 images                 │
│                                     │  ← Scrollable
│      ... more boards ...            │
│                                     │
└─────────────────────────────────────┘
```

**Key Features**:
- Fixed header with centered title and "Done" button
- Create board input as first item in scrollable list
- Board items with thumbnails, names, and counts
- Selection indicator (checkmark) on current board
- Modal stays open after creating/selecting boards
- User explicitly closes with "Done" button

**State Management**:
```typescript
const [newBoardName, setNewBoardName] = useState('');
const autoAddBoardId = useAppSelector(selectAutoAddBoardId);
const { data: boards } = useListAllBoardsQuery({});
const [createBoard, { isLoading }] = useCreateBoardMutation();
```

### 3. MobileBoardListItem (Board Item Component)

**Purpose**: Individual board entry in the list.

**Props**:
```typescript
interface MobileBoardListItemProps {
  board: BoardDTO | 'none';
  isSelected: boolean;
  onSelect: (boardId: BoardId) => void;
}
```

**Visual Design**:
```
┌─────────────────────────────────────┐
│  🖼️  My Portraits              ✓   │
│  [48x48   Board Name                │
│   thumb]  24 images                 │
└─────────────────────────────────────┘
```

**Key Features**:
- Thumbnail: 48x48px cover image or logo icon for "Uncategorized"
- Board name: Bold, truncated if too long
- Image count: Shows "Empty" if no images, otherwise "N images"
- Selection indicator: Checkmark when selected
- Full item tappable area
- Visual feedback on tap

## Data Flow & State Management

### Redux State

**Reading**:
```typescript
const autoAddBoardId = useAppSelector(selectAutoAddBoardId);
```

**Writing**:
```typescript
dispatch(autoAddBoardIdChanged(boardId));
```

### API Interactions

**Fetch Boards**:
```typescript
const { data: boards, isLoading } = useListAllBoardsQuery({
  include_archived: false
});
```

**Create Board**:
```typescript
const [createBoard, { isLoading: isCreating }] = useCreateBoardMutation();

const handleCreateBoard = async () => {
  if (!newBoardName.trim()) return;

  // Check for duplicates (case-insensitive)
  const boardNames = boards?.map(b => b.board_name.toLowerCase()) || [];
  if (boardNames.includes(newBoardName.toLowerCase())) {
    // Show toast: "A board with this name already exists"
    return;
  }

  try {
    const result = await createBoard({
      board_name: newBoardName.trim()
    }).unwrap();

    // Auto-select newly created board
    dispatch(autoAddBoardIdChanged(result.board_id));

    // Clear input for next board
    setNewBoardName('');

    // Modal stays open - user can create more or select different board
  } catch (error) {
    // Show toast: "Failed to create board"
  }
};
```

**Select Board**:
```typescript
const handleSelectBoard = (boardId: BoardId) => {
  dispatch(autoAddBoardIdChanged(boardId));
  // Modal stays open
};
```

### Board List Construction

```typescript
// Combine "Uncategorized" with fetched boards
const allBoards = [
  'none',  // Special Uncategorized entry
  ...(boards || [])
];
```

## User Flow

1. User taps board selector button in Generate tab
2. Full-screen board picker modal opens
3. User can:
   - **Create boards**: Type name, tap create button
     - Board is created and auto-selected
     - Input is cleared
     - Modal stays open for creating more boards
   - **Select boards**: Tap any board in the list
     - Board is selected (checkmark appears)
     - Modal stays open
   - **Close modal**: Tap "Done" button
     - Modal closes
     - Selected board is now active for generation

## Error Handling

### Loading States
- Show spinner while initial boards load
- Disable create button while board is being created
- Show spinner inside create button during creation

### Error Scenarios

**Empty Board List**:
- Still show "Uncategorized" option
- Show message: "Create your first board to organize images"

**Duplicate Board Name**:
- Check for duplicates before API call (case-insensitive)
- Show toast: "A board with this name already exists"
- Keep input value and focus for correction

**Empty Input**:
- Silently ignore or show toast: "Please enter a board name"
- Trim whitespace before validation

**Create Board Fails**:
- Show toast: "Failed to create board"
- Keep input value so user can retry
- Log error for debugging

**Network Errors**:
- Show toast: "Connection error. Please try again."
- Keep modal open for retry

### Edge Cases

**Board Thumbnail Missing**:
- Show placeholder folder/image icon

**Selected Board Deleted**:
- Falls back to "Uncategorized"
- `useBoardName()` hook handles this gracefully

**No Boards Yet**:
- Show "Uncategorized" and create input
- Encourage board creation

## Implementation Notes

### File Locations
- `src/features/ui/components/mobile/generate/MobileBoardSelector.tsx`
- `src/features/ui/components/mobile/generate/MobileBoardPicker.tsx`
- `src/features/ui/components/mobile/generate/MobileBoardListItem.tsx`

### Existing Hooks to Use
- `useBoardName(boardId)` - Get board display name
- `useListAllBoardsQuery()` - Fetch boards
- `useCreateBoardMutation()` - Create boards
- `selectAutoAddBoardId` - Current board selector
- `autoAddBoardIdChanged()` - Action to update board

### Styling Considerations
- Follow existing mobile UI patterns (MobilePromptEditor, MobileImageViewer)
- Use Chakra UI components from `@invoke-ai/ui-library`
- Match prompt field styling for consistency
- Full-width buttons for one-handed use
- Bottom action buttons for easy thumb reach

### Testing Considerations
- Test with no boards (only Uncategorized)
- Test with many boards (scrolling)
- Test duplicate name validation
- Test board creation and auto-selection
- Test board selection persistence across sessions
- Test error states (network failures, etc.)

## Design Decisions Summary

1. **Placement**: Above Generate button for one-handed reach
2. **Interaction**: Button opens full-screen modal (consistent with other mobile patterns)
3. **Board Creation**: Inline input at top of scrollable list
4. **Board Display**: Thumbnail + name + count for visual recognition
5. **Modal Behavior**: Stays open after create/select for batch operations
6. **Duplicate Names**: Frontend validation prevents duplicates (case-insensitive)
7. **Empty State**: Show "Empty" instead of "0 images"
8. **Close Action**: Explicit "Done" button in header

## Next Steps

1. Create implementation plan with detailed tasks
2. Implement components following TDD approach
3. Test thoroughly on mobile devices
4. Deploy and gather user feedback
