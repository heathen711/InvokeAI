// src/features/ui/components/mobile/MobileBottomTabBar.tsx
import { Button, Flex, Icon, Text } from '@invoke-ai/ui-library';
import { useAppDispatch, useAppSelector } from 'app/store/storeHooks';
import { selectMobileMainTab } from 'features/ui/store/uiSelectors';
import { uiSlice } from 'features/ui/store/uiSlice';
import type { MobileMainTab } from 'features/ui/store/uiTypes';
import { memo, useCallback } from 'react';
import type { IconType } from 'react-icons';
import { PiImage, PiPaintBrush, PiSliders } from 'react-icons/pi';

const TAB_CONFIG: Record<MobileMainTab, { label: string; icon: IconType }> = {
  create: { label: 'Create', icon: PiPaintBrush },
  view: { label: 'View', icon: PiImage },
  manage: { label: 'Manage', icon: PiSliders },
};

const TabButton = memo(
  ({
    config,
    isActive,
    onClick,
  }: {
    config: { label: string; icon: IconType };
    isActive: boolean;
    onClick: () => void;
  }) => (
    <Button
      onClick={onClick}
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
  )
);

TabButton.displayName = 'TabButton';

export const MobileBottomTabBar = memo(() => {
  const dispatch = useAppDispatch();
  const activeTab = useAppSelector(selectMobileMainTab);

  const handleCreateClick = useCallback(() => {
    dispatch(uiSlice.actions.setMobileMainTab('create'));
  }, [dispatch]);

  const handleViewClick = useCallback(() => {
    dispatch(uiSlice.actions.setMobileMainTab('view'));
  }, [dispatch]);

  const handleManageClick = useCallback(() => {
    dispatch(uiSlice.actions.setMobileMainTab('manage'));
  }, [dispatch]);

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
      pb="env(safe-area-inset-bottom, 0px)"
      zIndex={1000}
      justifyContent="space-around"
      alignItems="center"
    >
      <TabButton config={TAB_CONFIG.create} isActive={activeTab === 'create'} onClick={handleCreateClick} />
      <TabButton config={TAB_CONFIG.view} isActive={activeTab === 'view'} onClick={handleViewClick} />
      <TabButton config={TAB_CONFIG.manage} isActive={activeTab === 'manage'} onClick={handleManageClick} />
    </Flex>
  );
});

MobileBottomTabBar.displayName = 'MobileBottomTabBar';
