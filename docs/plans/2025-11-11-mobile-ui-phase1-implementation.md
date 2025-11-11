# Mobile Responsive UI - Phase 1 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement core mobile navigation infrastructure with bottom tab bar (Create/View/Manage) and dropdown sub-context navigation.

**Architecture:** Parallel mobile layout system that activates below 768px using custom React hooks for responsive detection. Mobile components live in separate directory from desktop, switching at AppContent level. Redux state extended for mobile-specific UI state.

**Tech Stack:** React 18, TypeScript, Redux Toolkit, Vitest (testing), Chakra UI / @invoke-ai/ui-library

---

## Prerequisites

Before starting, ensure you're in the correct directory:
```bash
cd invokeai/frontend/web
```

All commands assume this working directory unless otherwise specified.

---

## Task 1: Mobile Detection Hook

**Files:**
- Create: `src/common/hooks/useIsMobile.ts`
- Create: `src/common/hooks/useIsMobile.test.ts`

### Step 1: Write the failing test

Create test file with basic media query detection test:

```typescript
// src/common/hooks/useIsMobile.test.ts
import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useIsMobile } from './useIsMobile';

describe('useIsMobile', () => {
  it('should return true when viewport is below 768px', () => {
    // Mock window.matchMedia to return mobile width
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: query === '(max-width: 767px)',
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);
  });

  it('should return false when viewport is 768px or above', () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });
});
```

### Step 2: Run test to verify it fails

```bash
pnpm test src/common/hooks/useIsMobile.test.ts
```

Expected: FAIL with "Cannot find module './useIsMobile'"

### Step 3: Write minimal implementation

```typescript
// src/common/hooks/useIsMobile.ts
import { useEffect, useState } from 'react';

const MOBILE_BREAKPOINT = '(max-width: 767px)';

/**
 * Hook to detect if viewport is in mobile mode (< 768px)
 * Updates on window resize
 */
export const useIsMobile = (): boolean => {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(MOBILE_BREAKPOINT).matches;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia(MOBILE_BREAKPOINT);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return isMobile;
};
```

### Step 4: Run test to verify it passes

```bash
pnpm test src/common/hooks/useIsMobile.test.ts
```

Expected: PASS (2 tests)

### Step 5: Commit

```bash
git add src/common/hooks/useIsMobile.ts src/common/hooks/useIsMobile.test.ts
git commit -m "feat(mobile): add useIsMobile hook for responsive detection"
```

---

## Task 2: Orientation Detection Hook

**Files:**
- Create: `src/common/hooks/useOrientation.ts`
- Create: `src/common/hooks/useOrientation.test.ts`

### Step 1: Write the failing test

```typescript
// src/common/hooks/useOrientation.test.ts
import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useOrientation } from './useOrientation';

describe('useOrientation', () => {
  it('should return landscape when orientation matches', () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: query === '(orientation: landscape)',
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    const { result } = renderHook(() => useOrientation());
    expect(result.current).toBe('landscape');
  });

  it('should return portrait when orientation does not match landscape', () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(() => ({
        matches: false,
        media: '(orientation: landscape)',
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    const { result } = renderHook(() => useOrientation());
    expect(result.current).toBe('portrait');
  });
});
```

### Step 2: Run test to verify it fails

```bash
pnpm test src/common/hooks/useOrientation.test.ts
```

Expected: FAIL with "Cannot find module './useOrientation'"

### Step 3: Write minimal implementation

```typescript
// src/common/hooks/useOrientation.ts
import { useEffect, useState } from 'react';

export type Orientation = 'portrait' | 'landscape';

const LANDSCAPE_QUERY = '(orientation: landscape)';

/**
 * Hook to detect device orientation
 * Updates on orientation change
 */
export const useOrientation = (): Orientation => {
  const [orientation, setOrientation] = useState<Orientation>(() => {
    if (typeof window === 'undefined') return 'portrait';
    return window.matchMedia(LANDSCAPE_QUERY).matches ? 'landscape' : 'portrait';
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia(LANDSCAPE_QUERY);
    const handler = (e: MediaQueryListEvent) => {
      setOrientation(e.matches ? 'landscape' : 'portrait');
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return orientation;
};
```

### Step 4: Run test to verify it passes

```bash
pnpm test src/common/hooks/useOrientation.test.ts
```

Expected: PASS (2 tests)

### Step 5: Commit

```bash
git add src/common/hooks/useOrientation.ts src/common/hooks/useOrientation.test.ts
git commit -m "feat(mobile): add useOrientation hook"
```

---

## Task 3: Mobile Redux State

**Files:**
- Modify: `src/features/ui/store/uiTypes.ts`
- Modify: `src/features/ui/store/uiSlice.ts`

### Step 1: Extend UIState type

In `src/features/ui/store/uiTypes.ts`, add mobile state types after line 4:

```typescript
// Add after existing TabName type
const zMobileMainTab = z.enum(['create', 'view', 'manage']);
export type MobileMainTab = z.infer<typeof zMobileMainTab>;

const zMobileCreateMode = z.enum(['generate', 'canvas', 'upscaling', 'workflows']);
export type MobileCreateMode = z.infer<typeof zMobileCreateMode>;

const zMobileManageMode = z.enum(['queue', 'models']);
export type MobileManageMode = z.infer<typeof zMobileManageMode>;

const zMobilePanels = z.object({
  layers: z.boolean(),
  toolSettings: z.boolean(),
});
```

Then extend the zUIState schema (around line 15, add `mobile` field):

```typescript
export const zUIState = z.object({
  _version: z.literal(4),
  activeTab: zTabName,
  shouldShowItemDetails: z.boolean(),
  shouldShowProgressInViewer: z.boolean(),
  accordions: z.record(z.string(), z.boolean()),
  expanders: z.record(z.string(), z.boolean()),
  textAreaSizes: z.record(z.string(), zPartialDimensions),
  panels: z.record(z.string(), zSerializable),
  shouldShowNotificationV2: z.boolean(),
  pickerCompactViewStates: z.record(z.string(), z.boolean()),
  // Add mobile state
  mobile: z.object({
    activeMainTab: zMobileMainTab,
    activeCreateMode: zMobileCreateMode,
    activeManageMode: zMobileManageMode,
    panelsOpen: zMobilePanels,
  }),
});
```

Update `getInitialUIState` function (around line 28):

```typescript
export const getInitialUIState = (): UIState => ({
  _version: 4 as const,
  activeTab: 'generate' as const,
  shouldShowItemDetails: false,
  shouldShowProgressInViewer: true,
  accordions: {},
  expanders: {},
  textAreaSizes: {},
  panels: {},
  shouldShowNotificationV2: true,
  pickerCompactViewStates: {},
  // Add mobile initial state
  mobile: {
    activeMainTab: 'create' as const,
    activeCreateMode: 'generate' as const,
    activeManageMode: 'queue' as const,
    panelsOpen: {
      layers: false,
      toolSettings: false,
    },
  },
});
```

### Step 2: Add Redux actions

In `src/features/ui/store/uiSlice.ts`, add new reducers after existing ones:

```typescript
    // Add these reducers in the reducers object
    setMobileMainTab: (state, action: PayloadAction<UIState['mobile']['activeMainTab']>) => {
      state.mobile.activeMainTab = action.payload;
    },
    setMobileCreateMode: (state, action: PayloadAction<UIState['mobile']['activeCreateMode']>) => {
      state.mobile.activeCreateMode = action.payload;
    },
    setMobileManageMode: (state, action: PayloadAction<UIState['mobile']['activeManageMode']>) => {
      state.mobile.activeManageMode = action.payload;
    },
    toggleMobilePanel: (state, action: PayloadAction<keyof UIState['mobile']['panelsOpen']>) => {
      const panel = action.payload;
      state.mobile.panelsOpen[panel] = !state.mobile.panelsOpen[panel];
    },
    setMobilePanelOpen: (
      state,
      action: PayloadAction<{ panel: keyof UIState['mobile']['panelsOpen']; isOpen: boolean }>
    ) => {
      state.mobile.panelsOpen[action.payload.panel] = action.payload.isOpen;
    },
```

### Step 3: Run TypeScript check

```bash
pnpm lint:tsc
```

Expected: PASS (no type errors)

### Step 4: Commit

```bash
git add src/features/ui/store/uiTypes.ts src/features/ui/store/uiSlice.ts
git commit -m "feat(mobile): add mobile state to Redux store"
```

---

## Task 4: Mobile Selectors

**Files:**
- Modify: `src/features/ui/store/uiSelectors.ts`

### Step 1: Add mobile selectors

At the end of `src/features/ui/store/uiSelectors.ts`, add:

```typescript
// Mobile selectors
export const selectMobileMainTab = (state: RootState) => state.ui.mobile.activeMainTab;
export const selectMobileCreateMode = (state: RootState) => state.ui.mobile.activeCreateMode;
export const selectMobileManageMode = (state: RootState) => state.ui.mobile.activeManageMode;
export const selectMobilePanelsOpen = (state: RootState) => state.ui.mobile.panelsOpen;
export const selectMobilePanelOpen = (panel: keyof RootState['ui']['mobile']['panelsOpen']) => {
  return (state: RootState) => state.ui.mobile.panelsOpen[panel];
};
```

### Step 2: Run TypeScript check

```bash
pnpm lint:tsc
```

Expected: PASS

### Step 3: Commit

```bash
git add src/features/ui/store/uiSelectors.ts
git commit -m "feat(mobile): add mobile Redux selectors"
```

---

## Task 5: Bottom Tab Bar Component

**Files:**
- Create: `src/features/ui/components/mobile/MobileBottomTabBar.tsx`
- Create: `src/features/ui/components/mobile/MobileBottomTabBar.test.tsx`

### Step 1: Write the failing test

```typescript
// src/features/ui/components/mobile/MobileBottomTabBar.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { MobileBottomTabBar } from './MobileBottomTabBar';

describe('MobileBottomTabBar', () => {
  it('should render three tab buttons', () => {
    render(<MobileBottomTabBar />);

    expect(screen.getByRole('button', { name: /create/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /view/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /manage/i })).toBeInTheDocument();
  });
});
```

### Step 2: Run test to verify it fails

```bash
pnpm test src/features/ui/components/mobile/MobileBottomTabBar.test.tsx
```

Expected: FAIL with "Cannot find module"

### Step 3: Write minimal implementation

```typescript
// src/features/ui/components/mobile/MobileBottomTabBar.tsx
import { Button, Flex, Icon, Text } from '@invoke-ai/ui-library';
import { useAppDispatch, useAppSelector } from 'app/store/storeHooks';
import { selectMobileMainTab, uiSlice } from 'features/ui/store/uiSlice';
import type { MobileMainTab } from 'features/ui/store/uiTypes';
import { memo, useCallback } from 'react';
import { PiImage, PiPaintBrush, PiSliders } from 'react-icons/pi';
import type { IconType } from 'react-icons/pi';

const TAB_CONFIG: Record<MobileMainTab, { label: string; icon: IconType }> = {
  create: { label: 'Create', icon: PiPaintBrush },
  view: { label: 'View', icon: PiImage },
  manage: { label: 'Manage', icon: PiSliders },
};

export const MobileBottomTabBar = memo(() => {
  const dispatch = useAppDispatch();
  const activeTab = useAppSelector(selectMobileMainTab);

  const handleTabClick = useCallback(
    (tab: MobileMainTab) => {
      dispatch(uiSlice.actions.setMobileMainTab(tab));
    },
    [dispatch]
  );

  return (
    <Flex
      as="nav"
      position="fixed"
      bottom={0}
      left={0}
      right={0}
      height="60px"
      bg="base.900"
      borderTopWidth={1}
      borderTopColor="base.800"
      paddingBottom="env(safe-area-inset-bottom)"
      zIndex={1000}
      justifyContent="space-around"
      alignItems="center"
    >
      {(Object.keys(TAB_CONFIG) as MobileMainTab[]).map((tab) => {
        const config = TAB_CONFIG[tab];
        const isActive = activeTab === tab;

        return (
          <Button
            key={tab}
            onClick={() => handleTabClick(tab)}
            variant="ghost"
            flexDirection="column"
            height="100%"
            width="33.333%"
            borderRadius={0}
            color={isActive ? 'invokeBlue.400' : 'base.400'}
            _hover={{
              bg: 'base.800',
            }}
            aria-label={config.label}
            aria-current={isActive ? 'page' : undefined}
          >
            <Icon as={config.icon} boxSize={6} />
            <Text fontSize="xs" mt={1}>
              {config.label}
            </Text>
          </Button>
        );
      })}
    </Flex>
  );
});

MobileBottomTabBar.displayName = 'MobileBottomTabBar';
```

### Step 4: Fix imports in uiSlice

Add export for actions in `src/features/ui/store/uiSlice.ts`:

```typescript
// At the end of the file, ensure these are exported
export const { setMobileMainTab, setMobileCreateMode, setMobileManageMode, toggleMobilePanel, setMobilePanelOpen } = slice.actions;
```

Also update the selector import in `uiSelectors.ts` to export selectMobileMainTab.

### Step 5: Run test to verify it passes

```bash
pnpm test src/features/ui/components/mobile/MobileBottomTabBar.test.tsx
```

Expected: PASS

### Step 6: Commit

```bash
git add src/features/ui/components/mobile/MobileBottomTabBar.tsx src/features/ui/components/mobile/MobileBottomTabBar.test.tsx src/features/ui/store/uiSlice.ts
git commit -m "feat(mobile): add bottom tab bar component"
```

---

## Task 6: Mobile Dropdown Component

**Files:**
- Create: `src/features/ui/components/mobile/MobileDropdown.tsx`

### Step 1: Write implementation (no test for UI component)

```typescript
// src/features/ui/components/mobile/MobileDropdown.tsx
import { Button, Menu, MenuButton, MenuItem, MenuList } from '@invoke-ai/ui-library';
import { memo } from 'react';
import { PiCaretDown } from 'react-icons/pi';

export interface MobileDropdownOption<T extends string> {
  value: T;
  label: string;
}

interface MobileDropdownProps<T extends string> {
  value: T;
  options: MobileDropdownOption<T>[];
  onChange: (value: T) => void;
  label?: string;
}

export const MobileDropdown = memo(<T extends string>({ value, options, onChange, label }: MobileDropdownProps<T>) => {
  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <Menu>
      <MenuButton
        as={Button}
        rightIcon={<PiCaretDown />}
        width="full"
        justifyContent="space-between"
        aria-label={label}
      >
        {selectedOption?.label || 'Select...'}
      </MenuButton>
      <MenuList width="full">
        {options.map((option) => (
          <MenuItem
            key={option.value}
            onClick={() => onChange(option.value)}
            bg={option.value === value ? 'base.700' : undefined}
          >
            {option.label}
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
});

MobileDropdown.displayName = 'MobileDropdown';
```

### Step 2: Run TypeScript check

```bash
pnpm lint:tsc
```

Expected: PASS

### Step 3: Commit

```bash
git add src/features/ui/components/mobile/MobileDropdown.tsx
git commit -m "feat(mobile): add dropdown component"
```

---

## Task 7: Mobile Top Bar Component

**Files:**
- Create: `src/features/ui/components/mobile/MobileTopBar.tsx`

### Step 1: Write implementation

```typescript
// src/features/ui/components/mobile/MobileTopBar.tsx
import { Flex } from '@invoke-ai/ui-library';
import type { ReactNode } from 'react';
import { memo } from 'react';

interface MobileTopBarProps {
  children?: ReactNode;
}

export const MobileTopBar = memo(({ children }: MobileTopBarProps) => {
  return (
    <Flex
      as="header"
      width="full"
      height="56px"
      px={4}
      bg="base.850"
      borderBottomWidth={1}
      borderBottomColor="base.700"
      alignItems="center"
      flexShrink={0}
    >
      {children}
    </Flex>
  );
});

MobileTopBar.displayName = 'MobileTopBar';
```

### Step 2: Run TypeScript check

```bash
pnpm lint:tsc
```

Expected: PASS

### Step 3: Commit

```bash
git add src/features/ui/components/mobile/MobileTopBar.tsx
git commit -m "feat(mobile): add top bar component"
```

---

## Task 8: Mobile Create Tab

**Files:**
- Create: `src/features/ui/components/mobile/tabs/MobileCreateTab.tsx`

### Step 1: Write implementation

```typescript
// src/features/ui/components/mobile/tabs/MobileCreateTab.tsx
import { Flex, Text } from '@invoke-ai/ui-library';
import { useAppDispatch, useAppSelector } from 'app/store/storeHooks';
import { MobileDropdown, type MobileDropdownOption } from 'features/ui/components/mobile/MobileDropdown';
import { MobileTopBar } from 'features/ui/components/mobile/MobileTopBar';
import { selectMobileCreateMode } from 'features/ui/store/uiSelectors';
import { uiSlice } from 'features/ui/store/uiSlice';
import type { MobileCreateMode } from 'features/ui/store/uiTypes';
import { memo, useCallback } from 'react';

const CREATE_MODE_OPTIONS: MobileDropdownOption<MobileCreateMode>[] = [
  { value: 'generate', label: 'Generate' },
  { value: 'canvas', label: 'Canvas' },
  { value: 'upscaling', label: 'Upscaling' },
  { value: 'workflows', label: 'Workflows' },
];

export const MobileCreateTab = memo(() => {
  const dispatch = useAppDispatch();
  const activeMode = useAppSelector(selectMobileCreateMode);

  const handleModeChange = useCallback(
    (mode: MobileCreateMode) => {
      dispatch(uiSlice.actions.setMobileCreateMode(mode));
    },
    [dispatch]
  );

  return (
    <Flex flexDirection="column" width="full" height="full" overflow="hidden">
      <MobileTopBar>
        <MobileDropdown value={activeMode} options={CREATE_MODE_OPTIONS} onChange={handleModeChange} label="Mode" />
      </MobileTopBar>
      <Flex flex={1} justifyContent="center" alignItems="center" overflow="auto">
        <Text color="base.400">Create Tab - {activeMode} mode (content coming in Phase 2)</Text>
      </Flex>
    </Flex>
  );
});

MobileCreateTab.displayName = 'MobileCreateTab';
```

### Step 2: Run TypeScript check

```bash
pnpm lint:tsc
```

Expected: PASS

### Step 3: Commit

```bash
git add src/features/ui/components/mobile/tabs/MobileCreateTab.tsx
git commit -m "feat(mobile): add create tab with mode dropdown"
```

---

## Task 9: Mobile View Tab

**Files:**
- Create: `src/features/ui/components/mobile/tabs/MobileViewTab.tsx`

### Step 1: Write implementation

```typescript
// src/features/ui/components/mobile/tabs/MobileViewTab.tsx
import { Flex, Text } from '@invoke-ai/ui-library';
import { MobileTopBar } from 'features/ui/components/mobile/MobileTopBar';
import { memo } from 'react';

export const MobileViewTab = memo(() => {
  return (
    <Flex flexDirection="column" width="full" height="full" overflow="hidden">
      <MobileTopBar>
        <Text fontSize="lg" fontWeight="semibold">
          Gallery
        </Text>
      </MobileTopBar>
      <Flex flex={1} justifyContent="center" alignItems="center" overflow="auto">
        <Text color="base.400">View Tab - Gallery (content coming in Phase 3)</Text>
      </Flex>
    </Flex>
  );
});

MobileViewTab.displayName = 'MobileViewTab';
```

### Step 2: Run TypeScript check

```bash
pnpm lint:tsc
```

Expected: PASS

### Step 3: Commit

```bash
git add src/features/ui/components/mobile/tabs/MobileViewTab.tsx
git commit -m "feat(mobile): add view tab placeholder"
```

---

## Task 10: Mobile Manage Tab

**Files:**
- Create: `src/features/ui/components/mobile/tabs/MobileManageTab.tsx`

### Step 1: Write implementation

```typescript
// src/features/ui/components/mobile/tabs/MobileManageTab.tsx
import { Flex, Text } from '@invoke-ai/ui-library';
import { useAppDispatch, useAppSelector } from 'app/store/storeHooks';
import { MobileDropdown, type MobileDropdownOption } from 'features/ui/components/mobile/MobileDropdown';
import { MobileTopBar } from 'features/ui/components/mobile/MobileTopBar';
import { selectMobileManageMode } from 'features/ui/store/uiSelectors';
import { uiSlice } from 'features/ui/store/uiSlice';
import type { MobileManageMode } from 'features/ui/store/uiTypes';
import { memo, useCallback } from 'react';

const MANAGE_MODE_OPTIONS: MobileDropdownOption<MobileManageMode>[] = [
  { value: 'queue', label: 'Queue' },
  { value: 'models', label: 'Models' },
];

export const MobileManageTab = memo(() => {
  const dispatch = useAppDispatch();
  const activeMode = useAppSelector(selectMobileManageMode);

  const handleModeChange = useCallback(
    (mode: MobileManageMode) => {
      dispatch(uiSlice.actions.setMobileManageMode(mode));
    },
    [dispatch]
  );

  return (
    <Flex flexDirection="column" width="full" height="full" overflow="hidden">
      <MobileTopBar>
        <MobileDropdown value={activeMode} options={MANAGE_MODE_OPTIONS} onChange={handleModeChange} label="Mode" />
      </MobileTopBar>
      <Flex flex={1} justifyContent="center" alignItems="center" overflow="auto">
        <Text color="base.400">Manage Tab - {activeMode} mode (content coming in Phase 3)</Text>
      </Flex>
    </Flex>
  );
});

MobileManageTab.displayName = 'MobileManageTab';
```

### Step 2: Run TypeScript check

```bash
pnpm lint:tsc
```

Expected: PASS

### Step 3: Commit

```bash
git add src/features/ui/components/mobile/tabs/MobileManageTab.tsx
git commit -m "feat(mobile): add manage tab with mode dropdown"
```

---

## Task 11: Mobile Layout Container

**Files:**
- Create: `src/features/ui/components/mobile/MobileLayout.tsx`

### Step 1: Write implementation

```typescript
// src/features/ui/components/mobile/MobileLayout.tsx
import { Flex } from '@invoke-ai/ui-library';
import { useAppSelector } from 'app/store/storeHooks';
import { MobileBottomTabBar } from 'features/ui/components/mobile/MobileBottomTabBar';
import { MobileCreateTab } from 'features/ui/components/mobile/tabs/MobileCreateTab';
import { MobileManageTab } from 'features/ui/components/mobile/tabs/MobileManageTab';
import { MobileViewTab } from 'features/ui/components/mobile/tabs/MobileViewTab';
import { selectMobileMainTab } from 'features/ui/store/uiSelectors';
import { memo } from 'react';

export const MobileLayout = memo(() => {
  const activeTab = useAppSelector(selectMobileMainTab);

  return (
    <Flex
      flexDirection="column"
      width="full"
      height="100vh"
      overflow="hidden"
      position="relative"
    >
      {/* Content area - fills space above bottom tab bar */}
      <Flex
        flex={1}
        overflow="hidden"
        pb="60px" // Space for bottom tab bar
      >
        {activeTab === 'create' && <MobileCreateTab />}
        {activeTab === 'view' && <MobileViewTab />}
        {activeTab === 'manage' && <MobileManageTab />}
      </Flex>

      {/* Bottom tab bar */}
      <MobileBottomTabBar />
    </Flex>
  );
});

MobileLayout.displayName = 'MobileLayout';
```

### Step 2: Run TypeScript check

```bash
pnpm lint:tsc
```

Expected: PASS

### Step 3: Commit

```bash
git add src/features/ui/components/mobile/MobileLayout.tsx
git commit -m "feat(mobile): add main layout container"
```

---

## Task 12: Integrate Mobile Layout into AppContent

**Files:**
- Modify: `src/features/ui/components/AppContent.tsx`

### Step 1: Add imports and conditional rendering

Modify `src/features/ui/components/AppContent.tsx`:

```typescript
// Add new imports at the top
import { useIsMobile } from 'common/hooks/useIsMobile';
import { MobileLayout } from 'features/ui/components/mobile/MobileLayout';

// Then modify the AppContent component:
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

### Step 2: Run TypeScript check

```bash
pnpm lint:tsc
```

Expected: PASS

### Step 3: Test in browser

```bash
pnpm dev
```

1. Open browser to http://localhost:5173
2. Open DevTools and toggle device toolbar (Cmd/Ctrl + Shift + M)
3. Select iPhone SE or similar mobile device
4. Verify:
   - Bottom tab bar appears with Create/View/Manage
   - Clicking tabs switches content
   - Dropdowns work in Create and Manage tabs
   - Desktop layout appears when resizing to > 768px

Expected: Mobile layout renders on mobile viewports, desktop layout on larger screens

### Step 4: Commit

```bash
git add src/features/ui/components/AppContent.tsx
git commit -m "feat(mobile): integrate mobile layout into app"
```

---

## Task 13: Update Viewport Meta Tag

**Files:**
- Modify: `index.html`

### Step 1: Update meta tag to disable zoom

In `index.html` (line 6), change viewport meta tag:

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
```

### Step 2: Test in browser

Refresh browser and verify:
- Pinch-to-zoom disabled on mobile devices
- Layout scales correctly
- Text remains readable (minimum 16px)

### Step 3: Commit

```bash
git add index.html
git commit -m "feat(mobile): disable browser zoom for mobile"
```

---

## Task 14: Add Safe Area Insets CSS

**Files:**
- Modify: `src/features/ui/styles/dockview-theme-invoke.css`

### Step 1: Add safe area support

At the end of `src/features/ui/styles/dockview-theme-invoke.css`, add:

```css
/* Mobile safe area support for devices with notches */
@supports (padding: env(safe-area-inset-bottom)) {
  .mobile-safe-bottom {
    padding-bottom: calc(60px + env(safe-area-inset-bottom));
  }
}
```

### Step 2: Update MobileBottomTabBar to use safe area

In `src/features/ui/components/mobile/MobileBottomTabBar.tsx`, update the Flex component:

```typescript
<Flex
  as="nav"
  position="fixed"
  bottom={0}
  left={0}
  right={0}
  height="60px"
  bg="base.900"
  borderTopWidth={1}
  borderTopColor="base.800"
  pb="env(safe-area-inset-bottom, 0px)" // Add this line
  zIndex={1000}
  justifyContent="space-around"
  alignItems="center"
>
```

### Step 3: Run TypeScript check

```bash
pnpm lint:tsc
```

Expected: PASS

### Step 4: Commit

```bash
git add src/features/ui/styles/dockview-theme-invoke.css src/features/ui/components/mobile/MobileBottomTabBar.tsx
git commit -m "feat(mobile): add safe area inset support"
```

---

## Task 15: Final Testing & Cleanup

### Step 1: Run full test suite

```bash
pnpm test:no-watch
```

Expected: All tests pass

### Step 2: Run linting

```bash
pnpm lint
```

Expected: No errors

### Step 3: Manual browser testing

Test on multiple viewport sizes:
- iPhone SE (375px)
- iPhone 14 Pro (393px)
- iPad Mini (768px - breakpoint edge)
- Desktop (1920px)

Verify:
- Mobile layout appears < 768px
- Desktop layout appears ≥ 768px
- Smooth transition when resizing
- All three tabs accessible
- Dropdowns work correctly
- No visual glitches or layout issues

### Step 4: Create summary commit

```bash
git add .
git commit -m "feat(mobile): complete Phase 1 - core navigation

Implements mobile-responsive navigation infrastructure:
- Mobile detection hooks (useIsMobile, useOrientation)
- Redux state for mobile UI
- Bottom tab bar (Create/View/Manage)
- Dropdown sub-context navigation
- Mobile layout container
- Integration with desktop layout

Phase 1 complete. Ready for Phase 2 (Create Tab implementation).
"
```

---

## Phase 1 Complete!

### What We Built

✅ Mobile detection system (hooks + responsive breakpoints)
✅ Redux state management for mobile UI
✅ Bottom tab bar with three main tabs
✅ Dropdown navigation for sub-contexts
✅ Mobile layout container with tab routing
✅ Integration with existing desktop layout
✅ Safe area inset support for notched devices
✅ Browser zoom disabled (preparation for custom gestures)

### What's Next

**Phase 2: Create Tab** - Implement Generate mode with full settings form and Canvas mode with gesture controls

**Phase 3: View & Manage Tabs** - Build gallery, image viewer, queue, and models interfaces

**Phase 4: Polish** - Animations, performance optimization, accessibility audit

---

## Troubleshooting

### Tests failing with "Cannot find module"
- Ensure file paths are exact
- Check import statements match file locations
- Run `pnpm install` if dependencies missing

### TypeScript errors
- Run `pnpm lint:tsc` to see all errors
- Check Redux types match between slice and selectors
- Verify Zod schemas are correct

### Mobile layout not appearing
- Check browser DevTools responsive mode is active
- Verify viewport width < 768px
- Check console for React errors
- Ensure `useIsMobile` hook is working (add console.log to debug)

### Dropdown not working
- Check Redux DevTools to verify state changes
- Ensure event handlers are properly connected
- Verify Menu components from UI library are imported correctly
