// src/features/ui/components/mobile/MobileLayout.tsx
import { Flex } from '@invoke-ai/ui-library';
import { useAppSelector } from 'app/store/storeHooks';
import { useCanvasIsStaging } from 'features/controlLayers/store/canvasStagingAreaSlice';
import { MobileErrorBoundary } from 'features/ui/components/mobile/error/MobileErrorBoundary';
import { MobileBottomTabBar } from 'features/ui/components/mobile/MobileBottomTabBar';
import { MobileOfflineBanner } from 'features/ui/components/mobile/network/MobileOfflineBanner';
import { MobileCreateTab } from 'features/ui/components/mobile/tabs/MobileCreateTab';
import { MobileManageTab } from 'features/ui/components/mobile/tabs/MobileManageTab';
import { MobileViewTab } from 'features/ui/components/mobile/tabs/MobileViewTab';
import { selectMobileCreateMode, selectMobileMainTab } from 'features/ui/store/uiSelectors';
import { memo } from 'react';

export const MobileLayout = memo(() => {
  const activeTab = useAppSelector(selectMobileMainTab);
  const createMode = useAppSelector(selectMobileCreateMode);
  const isStaging = useCanvasIsStaging();

  // Hide bottom tab bar when in canvas mode and staging is active
  const shouldShowBottomBar = !(activeTab === 'create' && createMode === 'canvas' && isStaging);

  return (
    <MobileErrorBoundary>
      <MobileOfflineBanner />
      <Flex flexDirection="column" width="full" height="100vh" overflow="hidden" position="relative">
        {/* Content area - fills space above bottom tab bar */}
        <Flex
          flex={1}
          overflow="hidden"
          pb={shouldShowBottomBar ? '60px' : 0} // Space for bottom tab bar only when visible
        >
          {activeTab === 'create' && <MobileCreateTab />}
          {activeTab === 'view' && <MobileViewTab />}
          {activeTab === 'manage' && <MobileManageTab />}
        </Flex>

        {/* Bottom tab bar - hidden during staging */}
        {shouldShowBottomBar && <MobileBottomTabBar />}
      </Flex>
    </MobileErrorBoundary>
  );
});

MobileLayout.displayName = 'MobileLayout';
