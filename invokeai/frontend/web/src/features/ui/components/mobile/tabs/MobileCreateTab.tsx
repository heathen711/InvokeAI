// src/features/ui/components/mobile/tabs/MobileCreateTab.tsx
import { Flex, Text } from '@invoke-ai/ui-library';
import { useAppDispatch, useAppSelector } from 'app/store/storeHooks';
import { useCanvasIsStaging } from 'features/controlLayers/store/canvasStagingAreaSlice';
import { MobileFadeTransition } from 'features/ui/components/mobile/animations/MobileFadeTransition';
import { MobileCanvasView } from 'features/ui/components/mobile/canvas/MobileCanvasView';
import { MobileGenerateForm } from 'features/ui/components/mobile/generate/MobileGenerateForm';
import { MobileDropdown, type MobileDropdownOption } from 'features/ui/components/mobile/MobileDropdown';
import { MobileTopBar } from 'features/ui/components/mobile/MobileTopBar';
import { selectMobileCreateMode } from 'features/ui/store/uiSelectors';
import { uiSlice } from 'features/ui/store/uiSlice';
import type { MobileCreateMode } from 'features/ui/store/uiTypes';
import { AnimatePresence } from 'framer-motion';
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
  const isStaging = useCanvasIsStaging();

  const handleModeChange = useCallback(
    (mode: MobileCreateMode) => {
      dispatch(uiSlice.actions.setMobileCreateMode(mode));
    },
    [dispatch]
  );

  // Hide top bar when in canvas mode and staging is active
  const shouldShowTopBar = !(activeMode === 'canvas' && isStaging);

  return (
    <Flex flexDirection="column" width="full" height="full" overflow="hidden">
      {shouldShowTopBar && (
        <MobileTopBar>
          <MobileDropdown value={activeMode} options={CREATE_MODE_OPTIONS} onChange={handleModeChange} label="Mode" />
        </MobileTopBar>
      )}
      <Flex flex={1} overflow="hidden">
        <AnimatePresence mode="wait">
          {activeMode === 'generate' && (
            <MobileFadeTransition key="generate">
              <MobileGenerateForm />
            </MobileFadeTransition>
          )}
          {activeMode === 'canvas' && (
            <MobileFadeTransition key="canvas">
              <MobileCanvasView />
            </MobileFadeTransition>
          )}
          {activeMode !== 'generate' && activeMode !== 'canvas' && (
            <MobileFadeTransition key={activeMode}>
              <Flex flex={1} justifyContent="center" alignItems="center">
                <Text color="base.400">Create Tab - {activeMode} mode (coming soon)</Text>
              </Flex>
            </MobileFadeTransition>
          )}
        </AnimatePresence>
      </Flex>
    </Flex>
  );
});

MobileCreateTab.displayName = 'MobileCreateTab';
