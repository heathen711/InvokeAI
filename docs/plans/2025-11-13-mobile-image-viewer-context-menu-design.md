# Mobile Image Viewer Context Menu - Design Document

**Date:** 2025-11-13
**Status:** Design Complete
**Goal:** Bring full desktop context menu functionality to the mobile image viewer via an action sheet menu

## Overview

Currently, the mobile image viewer has minimal actions (Share, Close) compared to the desktop version which offers 15+ context menu actions. This design brings feature parity to mobile by adding an auto-hiding control bar with a three-dot menu that opens a bottom sheet containing all desktop actions.

## Design Decisions

### User Experience Approach
- **Full feature parity**: All desktop context menu actions available on mobile
- **One-handed UX**: All controls positioned at the bottom for thumb reach
- **Auto-hide controls**: Tap to show, auto-hide after 4 seconds to maximize image viewing area
- **Bottom sheet menu**: Modern mobile pattern, easy to dismiss, scrollable

### Control Layout
- **Bottom bar**: 4 equal sections (Previous | Menu | Close | Next)
- **Auto-hide timer**: 4 seconds of inactivity
- **Always accessible**: Works at all zoom levels (1x-4x)

---

## Part 1: Bottom Control Bar

### Layout

Full-width bar at the bottom, divided into 4 equal sections (25% each):

```
┌────────────────────────────────┐
│                                │
│       [Image Content]          │
│                                │
│                                │
└────────────────────────────────┘
┌────┬────┬────┬────┐
│ ◄  │ ⋮  │ ✕  │ ►  │
└────┴────┴────┴────┘
 25%  25%  25%  25%
```

### Buttons

| Position | Icon | Function |
|----------|------|----------|
| Left (25%) | ◄ | Previous image |
| Center-Left (25%) | ⋮ | Open action menu |
| Center-Right (25%) | ✕ | Close fullscreen viewer |
| Right (25%) | ► | Next image |

### Auto-hide Behavior

**Show conditions:**
- User taps anywhere on the image
- Viewer first opens

**Hide conditions:**
- 4 seconds of inactivity (no taps, no gestures)
- User starts swipe navigation gesture (immediate hide)

**Keep visible:**
- While action menu is open
- When user taps image while bar is already visible (resets timer)

**Implementation:**
```typescript
onImageTap() {
  if (controlsVisible) {
    clearTimeout(hideTimeout)
    hideTimeout = setTimeout(() => hideControls(), 4000)
  } else {
    showControls()
    hideTimeout = setTimeout(() => hideControls(), 4000)
  }
}

onMenuOpen() {
  clearTimeout(hideTimeout)  // Keep controls visible
}

onMenuClose() {
  hideTimeout = setTimeout(() => hideControls(), 4000)  // Resume auto-hide
}

onSwipeStart() {
  hideControls()  // Immediate hide during navigation
}
```

### Visual Style

- **Background**: Semi-transparent dark overlay matching app theme
- **Touch targets**: Each section fills its 25% width, minimum 44px height
- **Icons**: Centered within each section
- **Animation**: 200ms fade in/out
- **Safe area**: Respects iOS notches/home indicators

---

## Part 2: Action Sheet Menu

### Opening

When user taps the three-dot menu button (⋮):
- Bottom sheet slides up from bottom (300ms animation)
- Semi-transparent dark overlay dims the image
- Sheet covers 60-80% of screen height
- Scrollable if content exceeds height

### Closing

- Tap the "Close Menu" button at bottom
- Tap overlay outside sheet
- Swipe down on sheet
- Execute any menu action (automatic close)

### Menu Structure

```
┌─────────────────────────────────┐
│           Actions               │  ← Centered header
├─────────────────────────────────┤
│                                 │
│  📂 Quick Actions               │ ← Section header
│  🌐  Open in New Tab            │ ← Icon | Text | Chevron
│  📋  Copy to Clipboard          │
│  ⬇️   Download                  │
│  ⭐  Star / Unstar              │
│  🗑️   Delete Image              │
│                                 │
│  🎨 Workflow                    │
│  📥  Load Workflow              │
│  🔄  Recall Metadata         ▶  │ ← Chevron = submenu
│  📤  Send to Upscale            │
│  🖼️   Use as Reference          │
│  📝  Use for Prompt Template    │
│  ➕  New Canvas from Image   ▶  │
│  ➕  New Layer from Image    ▶  │
│                                 │
│  📁 Organization                │
│  📊  Change Board               │
│  📍  Locate in Gallery          │
│  🔗  Select for Compare         │
│                                 │
│  🔄 Share                       │
│  📱  Share Image                │
│                                 │
├─────────────────────────────────┤
│         [Close Menu]            │  ← Full-width button
└─────────────────────────────────┘
```

### Menu Groups

**Quick Actions** - Essential operations:
- Open in New Tab
- Copy to Clipboard
- Download
- Star / Unstar
- Delete Image

**Workflow** - Creative workflow operations:
- Load Workflow
- Recall Metadata (submenu: Canvas / Generate / Upscale)
- Send to Upscale
- Use as Reference
- Use for Prompt Template
- New Canvas from Image (submenu: Raster / Control / Inpaint / Regional)
- New Layer from Image (submenu: Raster / Control / Inpaint / Regional)

**Organization** - Management actions:
- Change Board
- Locate in Gallery
- Select for Compare

**Share** - Sharing functionality:
- Share Image (Web Share API or fallback)

### Alignment Specifications

**Consistent vertical alignment for scannable UI:**

```
[16px] │ [Icon] │ [40px spacing] │ [Text Label..................] │ [Chevron] │ [16px]
```

- **Icons**: Left-aligned at 16px from left edge
- **Text labels**: Start at 56px from left edge (40px after icon start)
- **Chevrons (▶)**: Right-aligned at 16px from right edge
- **Section headers**: Left-aligned at 16px, bold font, gray color
- **Row spacing**: 8px padding above/below each item
- **Row height**: 56px for comfortable touch targets

### Visual Design

- **Header**: Centered text, bold font, 16px padding top/bottom
- **Section headers**: Gray text, smaller font, left-aligned
- **Menu items**: Icon + text + optional chevron
- **Dividers**: Between groups for visual separation
- **Close button**: Full-width, 60px height, distinct styling

---

## Part 3: Submenu Navigation

### Items with Submenus

Three menu items have nested options (indicated by ▶ chevron):

1. **Recall Metadata** → Canvas / Generate / Upscale tabs
2. **New Canvas from Image** → Raster Layer / Control Layer / Inpaint Mask / Regional Guidance
3. **New Layer from Image** → Raster Layer / Control Layer / Inpaint Mask / Regional Guidance

### Navigation Pattern

When user taps an item with chevron (▶):

```
Initial Menu                    Submenu (slides in from right)
┌─────────────────┐            ┌─────────────────┐
│   Actions       │            │ New Canvas from │ ← Centered title
├─────────────────┤            │     Image       │
│ 🎨 Workflow     │            ├─────────────────┤
│ ➕ New Canvas   │  ─────→    │                 │
│     from Image▶ │            │ 🎨 Raster Layer │
│                 │            │ 🎛️ Control Layer│
│                 │            │ 🎭 Inpaint Mask │
│                 │            │ 📍 Regional     │
│                 │            │    Guidance     │
│                 │            │                 │
├─────────────────┤            ├─────────────────┤
│  [Close Menu]   │            │ [◄ Back] [Close]│ ← Split 50/50
└─────────────────┘            └─────────────────┘
```

### Submenu Behavior

- **Navigation**: Sheet slides in from right (300ms)
- **Header**: Submenu title centered
- **Back button**: Returns to main menu (left 50% of bottom)
- **Close button**: Closes all menus (right 50% of bottom)
- **Action execution**: Tapping an option executes action and closes all menus
- **Visual consistency**: Same styling as main menu

### Bottom Button Layout

```
┌──────────────────┬──────────────────┐
│    ◄ Back        │   Close Menu     │
└──────────────────┴──────────────────┘
       50%                 50%
```

Both buttons 60px height for easy thumb reach.

---

## Part 4: Conditional Display & Actions

### Context-Aware Menu Items

Menu dynamically shows/hides items based on:
1. Current active tab (Canvas / Generate / Upscale / Workflows)
2. Image properties (workflow data, starred status)
3. Device capabilities (Web Share API support)

### Conditional Logic

| Action | Shown When |
|--------|------------|
| Load Workflow | Image has workflow metadata |
| Recall Metadata (submenu) | Active tab is Canvas/Generate/Upscale |
| Use as Reference | Active tab is Canvas or Generate |
| New Layer from Image | Active tab is Canvas |
| Send to Upscale | Active tab is not already Upscale |
| Locate in Gallery | Always (in fullscreen viewer) |
| Share Image | Web Share API available OR always show |
| Star / Unstar | Label changes based on current state |

### Action Execution Flow

1. **User taps action**
2. **Immediate feedback** - Button shows pressed state
3. **Execute action** - Calls existing desktop action handlers
4. **Close menu** - All sheets close automatically (300ms fade)
5. **Toast notification** - Brief confirmation (e.g., "Image downloaded")
6. **Error handling** - If action fails, show error toast and keep menu open

### Special Cases

**Delete Image:**
- Shows confirmation dialog before executing
- On confirm: deletes image, closes viewer, returns to gallery
- On cancel: returns to menu

**Change Board:**
- Opens board picker modal (separate from menu)
- Menu remains in background
- On board selection: moves image, closes modal and menu

**Share Image:**
- Uses native Web Share API if available
- Fallback: Copy link to clipboard with toast notification

**Copy to Clipboard:**
- Attempts to copy image data
- Fallback: "Link copied" if image copy not supported by browser

---

## Part 5: Component Architecture

### Design Principle: Maximum Code Reuse

Reuse existing desktop menu logic wherever possible to maintain consistency and reduce bugs.

### Reusable Components

**From desktop implementation (REUSE):**
- `SingleSelectionMenuItems.tsx` - All menu action logic
- Individual `MenuItem` components - All 17 action handlers
- `useImageActions` hooks - Action execution logic
- Conditional rendering logic - Tab-based show/hide rules

**New mobile-specific components (CREATE):**
- `MobileImageViewerControls.tsx` - Bottom control bar
- `MobileActionSheet.tsx` - Bottom sheet container
- `MobileActionSheetSubmenu.tsx` - Submenu navigation

### Component Hierarchy

```
MobileImageViewer (existing)
├─ Image display & gestures (existing)
├─ MobileImageViewerControls (NEW)
│  ├─ Previous button
│  ├─ Menu button → Opens MobileActionSheet
│  ├─ Close button
│  └─ Next button
└─ MobileActionSheet (NEW)
   ├─ Sheet header
   ├─ SingleSelectionMenuItems (REUSED)
   │  └─ All 17 MenuItems (REUSED)
   ├─ MobileActionSheetSubmenu (NEW, when needed)
   │  ├─ Submenu header
   │  ├─ Submenu options
   │  └─ [Back] [Close] buttons
   └─ Close button
```

### State Management

```typescript
// Mobile viewer state (nanostore or local)
$mobileViewerState = {
  controlsVisible: boolean,        // Auto-hide state
  menuOpen: boolean,               // Action sheet open
  submenuOpen: string | null,      // Which submenu (if any)
  currentImage: ImageDTO,          // Current image data
  hideTimeout: number | null       // Auto-hide timer ID
}
```

### Shared Logic Reuse

All menu actions use the same handlers as desktop:
- `useStarImages()` - Star/unstar logic
- `useDownloadImage()` - Download handling
- `useDeleteImage()` - Delete with confirmation
- `useChangeBoard()` - Board management
- `useRecallMetadata()` - Metadata recall
- `useLoadWorkflow()` - Workflow loading
- `useSendToUpscale()` - Send to upscale
- And all other existing action hooks

---

## Part 6: Implementation Details

### Gesture Conflict Resolution

Existing gestures must coexist with new controls:

| Gesture | Behavior |
|---------|----------|
| Single tap | Toggle control bar visibility |
| Double tap | Reset zoom to 1x (existing) |
| Pinch | Zoom 1x-4x (existing) |
| Two-finger pan | Pan when zoomed (existing) |
| Swipe left/right | Navigate images (existing), hides controls |
| Swipe down on sheet | Close menu |

### Mobile-Specific Considerations

1. **Safe Area Insets**: Bottom bar respects iOS notches and home indicators
2. **Scroll Behavior**: Menu content scrolls smoothly on smaller screens
3. **Orientation**: Works in portrait and landscape modes
4. **Touch Target Size**: All buttons minimum 44x44px (Apple HIG / Material Design)
5. **Performance**: Bottom sheet uses CSS transforms for smooth 60fps animations
6. **Haptic Feedback**: Optional vibration on button taps (if supported)

### Edge Cases

**Navigation boundaries:**
- Disable Previous button when viewing first image
- Disable Next button when viewing last image

**Image deleted while viewing:**
- Close viewer immediately
- Return to gallery
- Show toast notification

**Network errors:**
- Show error toast with retry option
- Keep menu open to allow retry
- Disable actions that require network

**Very long action lists:**
- Menu content scrolls
- Close button remains fixed at bottom
- Scroll indicator shows more content available

**Rapid interactions:**
- Debounce menu button (prevent double-opening)
- Prevent multiple simultaneous actions
- Queue actions if needed

**Menu open during swipe:**
- Close menu automatically when user swipes to next/previous image
- Resume normal navigation flow

### Accessibility

- **Screen readers**: All buttons have accessible labels
- **Focus management**: Proper focus trap when menu opens
- **Keyboard navigation**: Support for desktop browsers with keyboard
- **Color contrast**: Meets WCAG AA standards
- **Reduced motion**: Respect prefers-reduced-motion setting
- **Touch targets**: Minimum 44x44px for all interactive elements

---

## File Locations

### Files to Modify

**Mobile viewer:**
- `/invokeai/frontend/web/src/features/ui/components/mobile/gallery/MobileImageViewer.tsx`

### Files to Create

**New mobile components:**
- `/invokeai/frontend/web/src/features/ui/components/mobile/gallery/MobileImageViewerControls.tsx`
- `/invokeai/frontend/web/src/features/ui/components/mobile/gallery/MobileActionSheet.tsx`
- `/invokeai/frontend/web/src/features/ui/components/mobile/gallery/MobileActionSheetSubmenu.tsx`

### Files to Reuse (No Changes)

**Desktop menu components:**
- `/invokeai/frontend/web/src/features/gallery/components/ContextMenu/SingleSelectionMenuItems.tsx`
- `/invokeai/frontend/web/src/features/gallery/components/ContextMenu/MenuItems/*.tsx` (all 17 items)

---

## Success Criteria

1. ✅ All desktop context menu actions available on mobile
2. ✅ One-handed operation (all controls at bottom)
3. ✅ Auto-hide controls don't interfere with image viewing
4. ✅ Smooth 60fps animations
5. ✅ Works at all zoom levels (1x-4x)
6. ✅ Coexists with existing gestures (pinch, pan, swipe)
7. ✅ Accessible (screen readers, keyboard, touch targets)
8. ✅ Reuses desktop logic (no duplicate code)
9. ✅ Handles all edge cases gracefully

---

## Future Enhancements (Out of Scope)

- Multi-select mode on mobile
- Customizable button order in control bar
- Gesture shortcuts for common actions
- Haptic feedback patterns
- Action history/undo
