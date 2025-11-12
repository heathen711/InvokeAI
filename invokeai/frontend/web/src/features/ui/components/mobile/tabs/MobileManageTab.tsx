// src/features/ui/components/mobile/tabs/MobileManageTab.tsx
import { Flex, Text } from '@invoke-ai/ui-library';
import { useAppDispatch, useAppSelector } from 'app/store/storeHooks';
import { MobileDropdown, type MobileDropdownOption } from 'features/ui/components/mobile/MobileDropdown';
import { MobileTopBar } from 'features/ui/components/mobile/MobileTopBar';
import { MobileQueueMode } from 'features/ui/components/mobile/queue/MobileQueueMode';
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
      <Flex flex={1} overflow="hidden">
        {activeMode === 'queue' && <MobileQueueMode />}
        {activeMode !== 'queue' && (
          <Flex flex={1} justifyContent="center" alignItems="center">
            <Text color="base.400">Manage Tab - {activeMode} mode (content coming in next tasks)</Text>
          </Flex>
        )}
      </Flex>
    </Flex>
  );
});

MobileManageTab.displayName = 'MobileManageTab';
