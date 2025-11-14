# Mobile Canvas Staging Area Design

**Date:** 2025-11-14
**Status:** Approved
**Target:** Mobile Web UI - Canvas Generation Workflow

## Overview

This design adds a mobile-optimized staging area to the canvas generation workflow. When users generate images from the mobile canvas view, they will immediately enter a dedicated staging mode that replaces the normal bottom control panel. This staging mode allows users to preview, navigate, accept, or discard generated results before returning to normal canvas editing.

## User Flow

```
Canvas (Normal Mode)
  ↓
User loads image, adds mask
  ↓
Clicks Generation tab → Opens full-screen drawer
  ↓
Configures parameters, adds prompt
  ↓
Clicks Generate button
  ↓
[IMMEDIATE TRANSITION]
  ↓
Canvas (Staging Mode)
  ↓
Bottom panel switches to staging controls
Progress overlay appears on canvas
Generation runs, results stream in
  ↓
User navigates results, reviews options
  ↓
User chooses:
  - Accept → Commits to canvas, exits staging
  - Discard All → Clears staging, exits staging
  ↓
Canvas (Normal Mode)
```

## Design Decisions

### View Mode System

**States:**
- `normal` - Standard 3-tab panel (Generation/Tools/Layers)
- `staging` - Staging area with 2-row controls (modal mode)

**Transition Triggers:**
- **Enter Staging:** Immediately when Generate button is clicked (after successful queue submission)
- **Exit Staging:** Only via Accept or Discard All actions

**Modal Behavior:**
- In staging mode, ALL other navigation is hidden
- No tab switching, no drawer access
- User must make a decision (Accept or Discard All)
- Only fullscreen button remains accessible

### Architecture & State Management

**Component Structure:**
```
MobileCanvasView
├─ InvokeCanvasComponent (canvas always visible)
├─ [viewMode === 'normal'] Tabs (Generation/Tools/Layers)
└─ [viewMode === 'staging'] MobileCanvasStagingArea
   ├─ MobileStagingAreaProgress (overlay on canvas)
   ├─ Control Row 1: Navigation + Primary Actions
   └─ Control Row 2: Secondary Controls
```

**State Location:**
- View mode: Local state in `MobileCanvasView` (`useState<'normal' | 'staging'>`)
- Staging data: Existing `StagingAreaContext` (shared with desktop)
- Progress: Existing `$lastProgressEvent` nanostore (shared with desktop)

**Integration Points:**
- `useEnqueueCanvas` - Returns promise, triggers mode transition on success
- `useStagingAreaContext()` - Provides navigation, selection, actions
- Socket events - Already handled globally, no new listeners needed

### Mobile Staging Area Component

**File:** `MobileCanvasStagingArea.tsx`

**Props:**
```typescript
interface MobileCanvasStagingAreaProps {
  onAccept: () => void;      // Accept + exit staging
  onDiscardAll: () => void;  // Discard all + exit staging
}
```

**Layout:**

**Row 1: Navigation + Primary Actions**
```
[◄] [1 of 3] [►]     [✓ Accept] [💾 Save] [✕ Discard]
```

**Row 2: Secondary Controls**
```
[👁 Toggle] [⋮ Menu]     [🌙][▶][▶|]     [🗑 Discard All]
```

**Button Groups:**

**Navigation (Left, Row 1):**
- Previous button (`◄`)
- Image counter (`"1 of 3"` - non-interactive)
- Next button (`►`)

**Primary Actions (Right, Row 1):**
- Accept (`✓`) - Commits current image to canvas, exits staging
- Save to Gallery (`💾`) - Copies image to gallery
- Discard Selected (`✕`) - Removes current image from staging

**Secondary Controls (Row 2):**
- Left group:
  - Toggle Show Results (`👁`) - Shows/hides staged image overlay
  - Menu (`⋮`) - Additional actions (New Layer from Image, etc.)

- Center group:
  - Auto-switch buttons (`🌙▶▶|`) - Controls auto-navigation behavior

- Right group:
  - Discard All (`🗑`) - Removes all images, exits staging

**Styling:**
- Larger touch targets (`size="lg"`)
- Compact spacing (optimized for mobile)
- Same styling as normal bottom panel (consistent look)
- Bottom padding: `pb="calc(60px + 0.75rem)"` (accounts for mobile nav bar)

### Progress Overlay Component

**File:** `MobileStagingAreaProgress.tsx`

**Visual Design:**
- Full canvas overlay with semi-transparent dark background (60% black, slight blur)
- Centered card containing:
  - Progress message text (e.g., "Generating: step 15/30")
  - Progress percentage bar
  - Optional: Small preview image thumbnail if backend sends progress images

**Positioning:**
- Rendered inside canvas container in `MobileCanvasView`
- Positioned absolutely over `InvokeCanvasComponent`
- `zIndex: 5` (above canvas, below fullscreen button at `zIndex: 10`)

**Behavior:**
- Non-blocking overlay (`pointerEvents: 'none'` on backdrop, `'auto'` on card)
- Automatically appears when `$lastProgressEvent` exists
- Automatically hides when progress completes
- Only visible when in staging mode

**Data Source:**
- Reads from existing `$lastProgressEvent` nanostore
- Uses `$lastProgressMessage` for formatted text
- No new socket listeners required

### Image Display Strategy

**No Thumbnail Strip:**
- Current image displays directly on canvas (full size)
- No separate thumbnail carousel or grid
- Navigation via Previous/Next buttons only
- Clean, focused mobile experience

**Canvas Integration:**
- Staged images rendered by existing canvas staging system
- Toggle Show Results button controls visibility
- Same rendering as desktop (reuses canvas manager)

### Component Reuse Strategy

**Shared Logic from Desktop:**
- `useStagingAreaContext()` - Navigation, selection, actions
- `useStore()` with staging nanostores - State tracking
- Action callbacks - `acceptSelected()`, `discardAll()`, `next()`, `prev()`
- `useCanvasManager()` - Canvas integration

**Mobile-Specific Components:**
- New mobile button components with mobile styling
- Same hooks/logic as desktop, different presentation
- Larger touch targets, responsive sizing

**Example:**
```typescript
// Desktop: StagingAreaToolbarAcceptButton
// Mobile: MobileStagingAreaAcceptButton
// Same logic (useStagingAreaContext), mobile-friendly UI
```

### State Management & Transitions

**Normal → Staging Transition:**

1. User clicks Generate in `MobileCanvasGenerateForm`
2. Form calls `enqueueCanvas(false)`
3. On successful submission, form calls `onGenerationStarted()` callback
4. `MobileCanvasView` sets `viewMode` to `'staging'`
5. Bottom panel switches from Tabs to `MobileCanvasStagingArea`
6. All other navigation hidden (modal mode active)

**Staging → Normal Transition:**

**Two exit paths only:**

1. **Accept:**
   - User clicks Accept button
   - Calls `ctx.acceptSelected()` from staging context
   - Commits current image to canvas
   - Parent calls `setViewMode('normal')`

2. **Discard All:**
   - User clicks Discard All button
   - Calls `ctx.discardAll()` from staging context
   - Clears all staged images
   - Parent calls `setViewMode('normal')`

**Auto-exit on Empty:**
- If user manually discards all items one-by-one via Discard Selected
- When `itemCount` from staging context reaches 0
- Automatically trigger `setViewMode('normal')`

### Error Handling & Edge Cases

**Generation Failures:**

**Before any results:**
- Progress overlay shows error state
- Staging area shows "0 of 0"
- Discard All button exits staging mode
- Accept button disabled

**Partial batch failure:**
- Completed images show in staging
- Failed items don't appear
- User can navigate/accept completed results

**Queue Cancellation:**

- Uses existing `useCancelQueueItemsByDestination` hook
- Completed images remain in staging
- In-progress items cancelled
- User can still accept what's generated

**Empty Staging State:**

- When last item discarded via Discard Selected
- Watch `itemCount` from context
- Auto-exit when reaches 0: `setViewMode('normal')`

**Navigation Edge Cases:**

- Prev/Next buttons disabled at boundaries (first/last item)
- Hotkeys disabled (mobile doesn't need keyboard nav)
- Auto-switch modes work same as desktop (from Redux state)

### Data Flow & Integration

**Socket Events (Existing Infrastructure):**
- `invocation_progress` → Updates `$lastProgressEvent` → Progress overlay reacts
- `queue_item_status_changed` → Updates staging items → Counter/navigation updates
- `invocation_complete` → Adds images to staging → Item count increases

**Staging Context (Existing):**

From `features/controlLayers/components/StagingArea/context.tsx`:

**State:**
- `$selectedItem` - Current image and index
- `$itemCount` - Total staged images
- `$selectedItemImageDTO` - Full image metadata
- `$acceptSelectedIsEnabled` / `$discardSelectedIsEnabled` - Button states

**Methods:**
- `next()` / `prev()` - Navigation
- `acceptSelected()` - Accept to canvas
- `discardSelected()` - Remove current
- `discardAll()` - Remove all

**Provider:**
- Already wrapped via `CanvasManagerProviderGate` in `MobileCanvasView`
- No additional providers needed

**No New API Calls:**
- Staging operations use existing canvas manager
- Image saving uses existing `copyImage` endpoint
- Queue operations use existing RTK Query mutations

## Implementation Plan

### Files to Create

1. `features/ui/components/mobile/canvas/MobileCanvasStagingArea.tsx`
   - Main staging container with two-row button layout

2. `features/ui/components/mobile/canvas/MobileStagingAreaProgress.tsx`
   - Progress overlay component

3. `features/ui/components/mobile/canvas/MobileStagingAreaButtons.tsx`
   - All mobile-specific button components

### Files to Modify

1. `features/ui/components/mobile/canvas/MobileCanvasView.tsx`
   - Add `viewMode` state
   - Conditional rendering (Tabs vs Staging)
   - Wire mode transitions

2. `features/ui/components/mobile/canvas/MobileCanvasGenerateForm.tsx`
   - Add `onGenerationStarted` callback prop
   - Call callback after successful `enqueueCanvas`

### Implementation Phases

**Phase 1: Core Infrastructure**
- Add view mode state to `MobileCanvasView`
- Implement conditional rendering
- Wire up mode transitions
- Modify `MobileCanvasGenerateForm` callback

**Phase 2: Staging UI**
- Create `MobileCanvasStagingArea` component
- Build two-row button layout
- Connect to staging context
- Implement all button handlers

**Phase 3: Progress Overlay**
- Create `MobileStagingAreaProgress` component
- Connect to progress nanostores
- Position over canvas with proper z-index

**Phase 4: Polish & Testing**
- Test all transitions (normal → staging → normal)
- Handle edge cases (empty staging, failures, cancellation)
- Mobile responsive testing (various screen sizes)
- Touch target optimization (ensure 44px minimum)
- Test with real generation workflows

## Success Criteria

- ✓ Generate button immediately transitions to staging mode
- ✓ Progress overlay displays during active generation
- ✓ Results appear in staging as they complete
- ✓ Navigation works correctly (prev/next, auto-switch)
- ✓ Accept commits to canvas and exits staging
- ✓ Discard All clears staging and exits
- ✓ No access to other navigation while in staging mode
- ✓ All buttons have appropriate disabled/loading states
- ✓ Works correctly with batches of multiple images
- ✓ Handles errors and cancellations gracefully
- ✓ Touch targets meet mobile accessibility standards

## Future Enhancements (Out of Scope)

- Swipe gestures on canvas for navigation
- Thumbnail strip option (user preference)
- Comparison view (side-by-side results)
- Quick re-generate with same parameters
- Staging history (view past generation sessions)
