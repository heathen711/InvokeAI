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
      pb="env(safe-area-inset-bottom, 0px)"
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
