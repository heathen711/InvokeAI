import { Box, Flex, Progress, Text } from '@invoke-ai/ui-library';
import { useStore } from '@nanostores/react';
import { useStagingAreaContext } from 'features/controlLayers/components/StagingArea/context';
import { memo } from 'react';
import { $lastProgressEvent } from 'services/events/stores';

export const MobileStagingAreaProgress = memo(() => {
  const ctx = useStagingAreaContext();
  const itemCount = useStore(ctx.$itemCount);
  const progressEvent = useStore($lastProgressEvent);

  // eslint-disable-next-line no-console
  console.log('[MobileStagingAreaProgress]', { itemCount, hasProgressEvent: !!progressEvent, progressEvent });

  // Don't render if no progress or if we already have images to show
  if (!progressEvent || itemCount > 0) {
    return null;
  }

  const percentage = progressEvent.percentage ? Math.round(progressEvent.percentage * 100) : undefined;

  return (
    <Flex
      position="absolute"
      top={0}
      left={0}
      right={0}
      bottom={0}
      zIndex={5}
      bg="blackAlpha.600"
      backdropFilter="blur(4px)"
      alignItems="center"
      justifyContent="center"
      pointerEvents="none"
    >
      <Box pointerEvents="auto" bg="base.800" p={4} borderRadius="lg" shadow="dark-lg" maxW="90%">
        {/* Progress message */}
        <Text fontSize="sm" fontWeight="medium" mb={2} textAlign="center">
          {progressEvent.message}
          {percentage !== undefined && ` (${percentage}%)`}
        </Text>

        {/* Progress bar */}
        {percentage !== undefined && <Progress value={percentage} colorScheme="invokeBlue" size="sm" />}
      </Box>
    </Flex>
  );
});

MobileStagingAreaProgress.displayName = 'MobileStagingAreaProgress';
