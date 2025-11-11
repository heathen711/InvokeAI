# Mobile Responsive UI Design

**Date:** 2025-11-11
**Status:** Design Complete - Ready for Implementation
**Goal:** Make InvokeAI web UI fully responsive for mobile devices (320px-428px phones) with full feature parity to desktop

## Overview

This design implements a parallel mobile layout system for InvokeAI that activates on screens below 768px. The mobile experience provides full-featured editing capabilities with a phone-optimized interface using bottom tab navigation, gesture controls, and vertical layouts.

## Key Design Decisions

- **Full feature parity**: All desktop features accessible on mobile
- **Phone-first optimization**: Designed for 320px-428px width screens
- **Parallel implementation**: Separate mobile components, desktop unchanged
- **Bottom tab navigation**: Three main tabs (Create / View / Manage)
- **Custom zoom handling**: Disable browser zoom, implement gesture-based zoom for canvas
- **Standard UI patterns**: Follow iOS/Material Design conventions, maintain desktop parity where sensible

## Navigation Architecture

### Main Navigation (Bottom Tab Bar)

Fixed bottom tab bar with three primary contexts:

1. **Create Tab**
   - Sub-contexts (via dropdown): Generate, Canvas, Upscaling, Workflows
   - Contains all creation and editing tools

2. **View Tab**
   - Gallery and boards for viewing generated images
   - No sub-contexts needed

3. **Manage Tab**
   - Sub-contexts (via dropdown): Queue, Models
   - Queue monitoring and model management

**Bottom Tab Bar Specifications:**
- Height: 56-60px + safe-area-inset-bottom
- Icons + labels for each tab
- Active state: Accent color highlight
- Always visible, persists across all screens
- Semi-transparent background with backdrop blur

### Secondary Navigation

**Dropdown Menu (Top of Content Area):**
- Replaces horizontal sub-tabs to save vertical space
- Full-width, native-feeling sheet/menu style
- Only shown in tabs with sub-contexts (Create, Manage)
- Current selection always visible in dropdown trigger

## Layout Specifications

### Viewport Configuration

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
```

Browser zoom disabled - all zoom handled by custom gesture controls.

### Create Tab Layouts

#### Generate Mode

**Structure:**
- **Top Bar** (fixed): Dropdown for mode selection
- **Content Area** (scrollable): Full settings form
- **Action Bar** (fixed, above bottom tabs): "Generate" button

**Content Organization:**
- Single scrollable form with all controls visible
- No accordions or collapsed sections
- Grouped sections with clear labels:
  - Model selector (with thumbnail preview)
  - Prompt textarea (auto-expanding)
  - Negative prompt textarea (auto-expanding)
  - Dimensions (width, height presets)
  - Generation parameters (steps, CFG scale, sampler)
  - Seed controls
  - Advanced settings
- All controls use mobile-optimized spacing (min 44x44px targets)

**Action Button:**
- Fixed position above bottom tab bar
- Full-width or prominent centered button
- Always accessible without scrolling
- Shows generation status when active

#### Canvas Mode

**Structure:**
- **Canvas Area**: Fills most of viewport (fit-to-screen default)
- **Tool Palette**: Floating toolbar, bottom-left
- **Layer Panel**: Slide-in overlay from right (dismissible)
- **Tool Settings**: Slide-in overlay from left (dismissible)
- **Full-Screen Toggle**: Top-right corner button

**Gesture Controls:**
- One-finger drag: Draw/paint with active tool
- Two-finger drag: Pan canvas
- Pinch: Zoom in/out
- Long-press: Context menu (tool options, layer actions)
- Double-tap: Toggle fit-to-screen / 100% zoom

**Tool Palette:**
- Floating button group (6-8 tools visible)
- Active tool highlighted with border/glow
- Compact layout, stacked vertically or wrapping horizontally
- Translucent background

**Overlays:**
- Slide in from edges with smooth animation
- Dismissible via tap outside, swipe, or close button
- Semi-transparent backdrop
- Max width ~80% of screen to allow tap-to-dismiss

#### Upscaling & Workflows Modes

Follow similar patterns to Generate mode:
- Dropdown navigation
- Single scrollable form
- Fixed action button
- Mode-specific controls optimized for mobile spacing

### View Tab Layout

**Structure:**
- **Top Bar** (fixed): Search/filter + board selector dropdown
- **Content Area** (scrollable): Responsive image grid
- **No bottom action bar**: Gallery uses full height

**Image Grid:**
- Portrait orientation: 2 columns
- Landscape orientation: 3-4 columns
- CSS Grid with auto-fill for responsive sizing
- Minimum thumbnail size: ~150px wide
- Gap between images: 8-12px
- Maintains aspect ratios

**Board Integration:**
- Board selector in top bar dropdown (not separate panel)
- Options: "All Images" / individual board names
- "Create New Board" option in dropdown
- Active board shown in dropdown trigger

**Image Viewer:**
- Tap thumbnail to open full-screen viewer
- Swipe left/right to navigate between images
- Pinch to zoom on image
- Top bar with close, share, actions buttons
- Bottom info panel (collapsible) showing metadata
- Share button prominent in top bar (P1 feature)

### Manage Tab Layouts

#### Queue Mode

**Structure:**
- Active/current generation at top with progress
- Queued items list below
- Each item shows: thumbnail, prompt snippet, status, progress bar

**Interactions:**
- Tap item to expand for full details
- Swipe left: Cancel/delete
- Swipe right: Prioritize/move up
- Long-press: Multi-select mode
- Pull-to-refresh: Update queue status

**Batch Controls:**
- Top bar actions: Pause All, Resume All, Clear Completed
- Compact button group or dropdown menu

#### Models Mode

**Structure:**
- List of installed models with thumbnails
- Search/filter bar at top
- "Add Model" button fixed at bottom (above tabs)

**Model Cards:**
- Model thumbnail
- Name, type, size
- Status indicator (downloaded, downloading, available)
- Tap to view details/settings
- Long-press for quick actions (delete, update)

**Actions:**
- Download new models
- Delete installed models
- View model details and configuration
- Filter by type, status

## Touch Interaction Patterns

### Canvas/Image Gesture System

| Gesture | Action |
|---------|--------|
| One-finger drag | Draw/paint with active tool |
| Two-finger drag | Pan canvas/image |
| Pinch | Zoom in/out |
| Long-press | Context menu |
| Double-tap | Toggle fit-to-screen / 100% zoom |

**Technical Implementation:**
- Touch event listeners on Konva Stage
- Track touch count to determine gesture type
- Calculate pinch distance for zoom
- Prevent default behaviors with `touch-action: none`
- Passive listeners where possible for performance

### Gallery Gestures

| Gesture | Action |
|---------|--------|
| Tap | Select image / open viewer |
| Long-press | Multi-select mode / quick actions |
| Swipe in viewer | Navigate between images |
| Pinch in viewer | Zoom image |

### List Gestures (Queue, Models)

| Gesture | Action |
|---------|--------|
| Swipe left/right | Quick actions (delete, cancel, etc.) |
| Long-press | Multi-select mode |
| Pull-to-refresh | Refresh data |

### Visual Feedback

- Touch ripples on tappable elements
- Active tool indicator (border/glow)
- Loading spinners for async operations
- Toast notifications at top for messages
- Haptic feedback on long-press (if supported)

## Responsive Breakpoints

### Breakpoint Values

- **Mobile**: `max-width: 767px`
- **Desktop**: `min-width: 768px`

### Orientation Detection

Within mobile breakpoint, detect orientation for layout adjustments:
- Portrait: Narrower grids (2 columns), vertical tool palettes
- Landscape: Wider grids (3-4 columns), horizontal tool layouts

### Detection Implementation

```typescript
// hooks/useIsMobile.ts
export const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(
    window.matchMedia('(max-width: 767px)').matches
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 767px)');
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return isMobile;
};

// hooks/useOrientation.ts
export const useOrientation = () => {
  const [isLandscape, setIsLandscape] = useState(
    window.matchMedia('(orientation: landscape)').matches
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia('(orientation: landscape)');
    const handler = (e: MediaQueryListEvent) => setIsLandscape(e.matches);

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return isLandscape;
};
```

## Technical Architecture

### Component Structure

```
src/features/ui/
├── layouts/
│   ├── desktop/
│   │   ├── generate-tab-auto-layout.tsx (existing)
│   │   ├── canvas-tab-auto-layout.tsx (existing)
│   │   └── ... (other existing layouts)
│   └── mobile/
│       ├── MobileLayout.tsx (new - main container)
│       ├── MobileBottomTabBar.tsx (new)
│       ├── MobileCreateTab.tsx (new)
│       │   ├── MobileGenerateMode.tsx
│       │   ├── MobileCanvasMode.tsx
│       │   ├── MobileUpscalingMode.tsx
│       │   └── MobileWorkflowsMode.tsx
│       ├── MobileViewTab.tsx (new)
│       │   ├── MobileGallery.tsx
│       │   └── MobileImageViewer.tsx
│       ├── MobileManageTab.tsx (new)
│       │   ├── MobileQueueMode.tsx
│       │   └── MobileModelsMode.tsx
│       └── shared/
│           ├── MobileTopBar.tsx
│           ├── MobileDropdown.tsx
│           └── MobileActionBar.tsx
├── hooks/
│   ├── useIsMobile.ts (new)
│   ├── useOrientation.ts (new)
│   └── useMobileGestures.ts (new)
```

### AppContent Modification

```typescript
// features/ui/components/AppContent.tsx
import { useIsMobile } from 'features/ui/hooks/useIsMobile';
import { MobileLayout } from 'features/ui/layouts/mobile/MobileLayout';

export const AppContent = memo(() => {
  const isMobile = useIsMobile();

  return (
    <Flex position="relative" w="full" h="full" overflow="hidden">
      {isMobile ? (
        <MobileLayout />
      ) : (
        <>
          <VerticalNavBar />
          <TabContent />
        </>
      )}
    </Flex>
  );
});
```

### State Management

**Mobile-specific state:**
- Active main tab (Create/View/Manage)
- Active sub-context within each tab (Generate/Canvas, Queue/Models)
- Panel visibility (layer panel, tool settings)
- Zoom/pan state for canvas
- Gallery selection state

**Redux slice additions:**
```typescript
// features/ui/store/uiSlice.ts
interface UIState {
  // existing desktop state...
  mobile: {
    activeMainTab: 'create' | 'view' | 'manage';
    activeCreateMode: 'generate' | 'canvas' | 'upscaling' | 'workflows';
    activeManageMode: 'queue' | 'models';
    panelsOpen: {
      layers: boolean;
      toolSettings: boolean;
    };
  };
}
```

### Canvas Zoom Implementation

**Gesture Handler:**
```typescript
// features/ui/hooks/useMobileGestures.ts
export const useMobileGestures = (stageRef: RefObject<Konva.Stage>) => {
  const handleTouch = useCallback((e: TouchEvent) => {
    e.preventDefault(); // Prevent browser zoom

    const touchCount = e.touches.length;

    if (touchCount === 1) {
      // Drawing mode
      handleDraw(e.touches[0]);
    } else if (touchCount === 2) {
      // Pan/zoom mode
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = getDistance(touch1, touch2);

      if (lastDistance) {
        const scale = distance / lastDistance;
        handleZoom(scale);
      }

      lastDistance = distance;
    }
  }, []);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const container = stage.container();
    container.addEventListener('touchstart', handleTouch, { passive: false });
    container.addEventListener('touchmove', handleTouch, { passive: false });

    return () => {
      container.removeEventListener('touchstart', handleTouch);
      container.removeEventListener('touchmove', handleTouch);
    };
  }, [handleTouch]);
};
```

**Zoom State:**
- Min zoom: 10%
- Max zoom: 400%
- Default: Fit to screen
- Smooth transitions using requestAnimationFrame
- Persist zoom level per canvas session

## Styling Guidelines

### Touch Targets

- Minimum size: 44x44px (WCAG AAA, Apple HIG)
- Recommended padding around clickable elements: 8-12px
- Increased spacing between adjacent interactive elements

### Typography

- Base font size: 16px (prevents iOS auto-zoom on input focus)
- Body text line height: 1.5-1.6
- Headings: Proportionally larger but compact scale
- Minimum contrast ratio: 4.5:1 (WCAG AA)

### Spacing Scale (Mobile Adjustments)

- Reduce padding/margins by ~25% from desktop
- Maximize content area while maintaining readability
- Group related controls with consistent spacing

### Bottom Tab Bar Styling

```css
.mobile-bottom-tabs {
  height: 60px;
  padding-bottom: env(safe-area-inset-bottom); /* Notch/home indicator */
  background: rgba(var(--invoke-colors-base-900), 0.95);
  backdrop-filter: blur(10px);
  border-top: 1px solid var(--invoke-colors-base-800);
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
}
```

### Safe Area Insets

Use CSS environment variables for devices with notches:
- `env(safe-area-inset-top)` - Status bar area
- `env(safe-area-inset-bottom)` - Home indicator area
- `env(safe-area-inset-left)` - Left edge (landscape)
- `env(safe-area-inset-right)` - Right edge (landscape)

## Accessibility

### Font Scaling

Since browser zoom is disabled:
- Provide in-app text size controls (Settings)
- Support system font size preferences where possible
- Base font size already at 16px minimum

### Screen Reader Support

- ARIA labels for all icon-only buttons
- Live regions for progress announcements
- Semantic HTML maintained (nav, main, section)
- Focus management for modals/overlays
- Descriptive alt text for all images

### Keyboard Support

- Tab navigation through interactive elements
- Enter/Space to activate buttons
- Escape to dismiss overlays/modals
- Arrow keys for carousel navigation (image viewer)

### High Contrast Mode

- Respect system prefers-contrast setting
- Ensure all UI remains usable in high contrast
- Minimum 4.5:1 contrast for text

## Performance Optimization

### Code Splitting

```typescript
// Lazy load mobile components
const MobileLayout = lazy(() => import('features/ui/layouts/mobile/MobileLayout'));

// Load only when needed
{isMobile ? (
  <Suspense fallback={<Loading />}>
    <MobileLayout />
  </Suspense>
) : (
  <DesktopLayout />
)}
```

### Canvas Optimization

- Reduce canvas resolution on low-end devices (detect via performance API)
- Throttle gesture events to 60fps max
- Use passive event listeners where possible
- Offload heavy operations to web workers
- Implement virtual scrolling for long lists (gallery, queue)

### Touch Event Optimization

```css
/* Prevent default touch behaviors on canvas */
canvas {
  touch-action: none;
}

/* Allow native scrolling on lists */
.scrollable-list {
  touch-action: pan-y;
  -webkit-overflow-scrolling: touch; /* iOS momentum scrolling */
}
```

### Image Loading

- Lazy load gallery thumbnails (Intersection Observer)
- Progressive image loading (blur-up technique)
- Serve appropriately sized thumbnails for mobile
- Cache aggressively with service worker

## Share Functionality (P1)

### Native Share API Integration

```typescript
// utils/share.ts
export const shareImage = async (imageUrl: string, title: string) => {
  if (navigator.share && navigator.canShare) {
    try {
      const blob = await fetch(imageUrl).then(r => r.blob());
      const file = new File([blob], 'invoke-image.png', { type: 'image/png' });

      await navigator.share({
        title: title,
        text: 'Created with InvokeAI',
        files: [file],
      });
    } catch (error) {
      // Fallback to download
      downloadImage(imageUrl);
    }
  } else {
    // Fallback for browsers without Share API
    downloadImage(imageUrl);
  }
};
```

### Share Button Locations

- **Image Viewer**: Top bar, next to other actions (prominent)
- **Gallery**: Long-press menu on thumbnails
- **Generated Images**: Quick action after generation completes

### Shared Content

- Image file (PNG/JPEG)
- Optional: Prompt text + generation parameters
- Optional: Link back to InvokeAI (if hosted publicly)

## Implementation Phases

### Phase 1: Core Navigation (MVP) - Week 1-2

**Deliverables:**
- Mobile detection hook and routing logic
- Bottom tab bar component (Create/View/Manage)
- Basic MobileLayout container
- Dropdown navigation for sub-contexts
- Top bar and action bar components
- Route to correct content for each tab

**Acceptance Criteria:**
- Navigation works on mobile devices (< 768px)
- Desktop experience unchanged
- Can switch between main tabs
- Dropdowns show sub-context options
- No content rendered yet, just navigation shell

### Phase 2: Create Tab - Week 3-4

**Deliverables:**
- Generate mode with full settings form
- Canvas mode with Konva integration
- Gesture controls (pan, zoom, draw)
- Tool palette and layer panel overlays
- Full-screen mode toggle
- Action button (Generate) fixed at bottom

**Acceptance Criteria:**
- Can configure and trigger generation on mobile
- Canvas drawing works with gesture controls
- Pinch to zoom, two-finger pan functional
- Tool selection and layer management work
- Upscaling and Workflows modes defer to Phase 4

### Phase 3: View & Manage Tabs - Week 5-6

**Deliverables:**
- Responsive gallery grid (2-col portrait, 3-4 col landscape)
- Full-screen image viewer with swipe navigation
- Share functionality via native Share API
- Queue management interface (list, swipe actions)
- Models list and management
- Board selector integration

**Acceptance Criteria:**
- Gallery displays images in responsive grid
- Image viewer opens full-screen with gestures
- Share button works (native or fallback)
- Queue shows active/queued items with actions
- Models can be viewed and managed
- Boards accessible via dropdown

### Phase 4: Polish & Optimization - Week 7-8

**Deliverables:**
- Upscaling mode implementation
- Workflows mode implementation
- Animations and transitions
- Haptic feedback
- Performance optimization (code splitting, lazy loading)
- Edge case handling (orientation changes, keyboard appearance)
- Accessibility audit and fixes
- Cross-device testing

**Acceptance Criteria:**
- All creation modes functional
- Smooth animations throughout
- Performance metrics meet targets (60fps gestures, < 3s initial load)
- Passes accessibility audit
- Tested on iOS Safari, Android Chrome, various screen sizes

### Phase 5: Stylus Support (P2) - Future Enhancement

**Deliverables:**
- Detect stylus input (Apple Pencil, S-Pen)
- Pressure sensitivity for drawing
- Palm rejection
- Stylus-specific UI affordances

## Testing Strategy

### Device Testing Matrix

**Minimum Test Devices:**
- iPhone SE (320px width - smallest)
- iPhone 14 Pro (393px width)
- Android phone (360-400px width)
- iPad Mini (768px width - breakpoint edge)

**Browsers:**
- iOS Safari (primary)
- Chrome on Android (primary)
- Chrome on iOS (secondary)
- Firefox on Android (secondary)

### Test Scenarios

1. **Navigation**: Switch between all tabs and sub-contexts
2. **Generation**: Configure settings, generate image, view result
3. **Canvas**: Draw, use tools, zoom/pan, layer management
4. **Gallery**: Browse images, view full-screen, share
5. **Queue**: Monitor progress, cancel items, manage queue
6. **Orientation**: Rotate device, verify layouts adapt
7. **Accessibility**: Navigate with screen reader, keyboard
8. **Performance**: Measure frame rates, load times, memory usage

### Automated Testing

- Unit tests for gesture detection logic
- Integration tests for navigation flows
- Visual regression tests for layouts at different breakpoints
- Performance benchmarks for canvas operations

## Success Metrics

### Performance Targets

- Initial load time: < 3 seconds on 4G
- Time to interactive: < 5 seconds on 4G
- Canvas gesture response: 60fps
- Gallery scroll performance: 60fps
- Bundle size increase: < 100KB (mobile-specific code)

### User Experience Metrics

- Task completion rate (generate image on mobile): > 90%
- User satisfaction score: > 4/5
- Crash-free rate: > 99%
- Feature parity with desktop: 100%

### Accessibility Metrics

- WCAG AA compliance: 100%
- Screen reader task completion: > 85%
- Keyboard navigation coverage: 100% of features

## Open Questions & Future Enhancements

### Potential Future Features

1. **PWA Support**: Service worker, offline capability, install prompt
2. **Device Orientation Lock**: Force portrait for certain workflows
3. **Advanced Stylus Support**: Pressure sensitivity, palm rejection (Phase 5)
4. **Bluetooth Device Support**: External keyboards, styluses, game controllers
5. **Multi-window Support**: iPad split-screen, picture-in-picture for queue monitoring
6. **Camera Integration**: Use device camera for img2img workflows
7. **Voice Input**: Dictate prompts via speech recognition

### Considerations

- **Server-side rendering**: Would mobile benefit from SSR for faster initial load?
- **Native app wrapper**: Consider Capacitor/React Native wrapper for better performance?
- **WebGL fallback**: What happens on devices without WebGL for Konva?

## Conclusion

This design provides a comprehensive mobile experience for InvokeAI that maintains full feature parity with desktop while adapting to the constraints and affordances of mobile devices. The parallel implementation approach minimizes risk to the existing desktop experience while allowing rapid iteration on mobile-specific features.

The phased implementation plan allows for incremental delivery of value, with core navigation and creation features landing first, followed by viewing and management capabilities, and finally polish and optimization.

## References

- [Apple Human Interface Guidelines - iOS](https://developer.apple.com/design/human-interface-guidelines/ios)
- [Material Design - Mobile](https://m3.material.io/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Web Share API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Web_Share_API)
- [Touch Events Specification](https://www.w3.org/TR/touch-events/)
