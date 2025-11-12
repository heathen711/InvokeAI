// src/features/ui/components/mobile/MobileLayout.tsx
import { Flex } from '@invoke-ai/ui-library';
import { useAppSelector } from 'app/store/storeHooks';
import { MobileErrorBoundary } from 'features/ui/components/mobile/error/MobileErrorBoundary';
import { MobileBottomTabBar } from 'features/ui/components/mobile/MobileBottomTabBar';
import { MobileOfflineBanner } from 'features/ui/components/mobile/network/MobileOfflineBanner';
import { MobileCreateTab } from 'features/ui/components/mobile/tabs/MobileCreateTab';
import { MobileManageTab } from 'features/ui/components/mobile/tabs/MobileManageTab';
import { MobileViewTab } from 'features/ui/components/mobile/tabs/MobileViewTab';
import { selectMobileMainTab } from 'features/ui/store/uiSelectors';
import { memo } from 'react';

export const MobileLayout = memo(() => {
  const activeTab = useAppSelector(selectMobileMainTab);

  return (
    <MobileErrorBoundary>
      <MobileOfflineBanner />
      <Flex flexDirection="column" width="full" height="100vh" overflow="hidden" position="relative">
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
    </MobileErrorBoundary>
  );
});

MobileLayout.displayName = 'MobileLayout';
