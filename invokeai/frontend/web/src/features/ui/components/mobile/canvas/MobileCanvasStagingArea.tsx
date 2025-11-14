import { Box, Flex } from '@invoke-ai/ui-library';
import { useStore } from '@nanostores/react';
import { useStagingAreaContext } from 'features/controlLayers/components/StagingArea/context';
import { memo, useEffect } from 'react';

import {
  MobileStagingAreaAutoSwitchButtons,
  MobileStagingAreaNavigation,
  MobileStagingAreaPrimaryActions,
  MobileStagingAreaSecondaryLeft,
  MobileStagingAreaSecondaryRight,
} from './MobileStagingAreaButtons';

interface MobileCanvasStagingAreaProps {
  onAccept: () => void;
  onDiscardAll: () => void;
}

export const MobileCanvasStagingArea = memo(({ onAccept, onDiscardAll }: MobileCanvasStagingAreaProps) => {
  const ctx = useStagingAreaContext();
  const itemCount = useStore(ctx.$itemCount);

  // Auto-exit staging mode when item count reaches 0
  useEffect(() => {
    if (itemCount === 0) {
      onDiscardAll();
    }
  }, [itemCount, onDiscardAll]);

  return (
    <Box bg="base.900" borderTopWidth={1} borderColor="base.800" pb="calc(60px + 0.75rem)">
      {/* Row 1: Navigation + Primary Actions */}
      <Flex gap={2} px={2} py={2} justifyContent="space-between" alignItems="center">
        <MobileStagingAreaNavigation />
        <MobileStagingAreaPrimaryActions onAccept={onAccept} />
      </Flex>

      {/* Row 2: Secondary Controls */}
      <Flex gap={2} px={2} pb={2} justifyContent="space-between" alignItems="center">
        <MobileStagingAreaSecondaryLeft />
        <MobileStagingAreaAutoSwitchButtons />
        <MobileStagingAreaSecondaryRight onDiscardAll={onDiscardAll} />
      </Flex>
    </Box>
  );
});

MobileCanvasStagingArea.displayName = 'MobileCanvasStagingArea';
