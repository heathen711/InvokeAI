// src/features/ui/components/mobile/queue/MobileQueueMode.tsx
import { Flex } from '@invoke-ai/ui-library';
import { memo } from 'react';

import { MobileCurrentQueueItem } from './MobileCurrentQueueItem';
import { MobileQueueControls } from './MobileQueueControls';
import { MobileQueueStatus } from './MobileQueueStatus';

/**
 * Mobile Queue mode - combines all queue components
 */
export const MobileQueueMode = memo(() => {
  return (
    <Flex flexDirection="column" width="full" height="full" overflow="auto" gap={4} p={4}>
      <MobileQueueStatus />
      <MobileCurrentQueueItem />
      <MobileQueueControls />
    </Flex>
  );
});

MobileQueueMode.displayName = 'MobileQueueMode';
