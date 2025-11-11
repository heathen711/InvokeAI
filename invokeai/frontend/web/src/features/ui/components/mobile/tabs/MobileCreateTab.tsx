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
