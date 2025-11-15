import { Box, Flex } from '@invoke-ai/ui-library';
import { StagingAreaItemsList } from 'features/controlLayers/components/StagingArea/StagingAreaItemsList';
import { memo } from 'react';

import {
  MobileStagingAreaAutoSwitchButtons,
  MobileStagingAreaNavigation,
  MobileStagingAreaPrimaryActions,
  MobileStagingAreaSecondaryLeft,
  MobileStagingAreaSecondaryRight,
} from './MobileStagingAreaButtons';

/**
 * Mobile staging area - automatically shown when queue items exist
 * Exits automatically when all items are accepted/discarded
 */
export const MobileCanvasStagingArea = memo(() => {
  return (
    <Box bg="base.900" borderTopWidth={1} borderColor="base.800" pb="calc(60px + 0.75rem)">
      {/* Image list */}
      <Box px={2} pt={2}>
        <StagingAreaItemsList />
      </Box>

      {/* Row 1: Navigation + Primary Actions */}
      <Flex gap={2} px={2} py={2} justifyContent="space-between" alignItems="center">
        <MobileStagingAreaNavigation />
        <MobileStagingAreaPrimaryActions />
      </Flex>

      {/* Row 2: Secondary Controls */}
      <Flex gap={2} px={2} pb={2} justifyContent="space-between" alignItems="center">
        <MobileStagingAreaSecondaryLeft />
        <MobileStagingAreaAutoSwitchButtons />
        <MobileStagingAreaSecondaryRight />
      </Flex>
    </Box>
  );
});

MobileCanvasStagingArea.displayName = 'MobileCanvasStagingArea';
