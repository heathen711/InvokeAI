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
