import { Box, Flex, Spinner, Text } from '@invoke-ai/ui-library';
import { memo } from 'react';
import { useGetCurrentQueueItemQuery } from 'services/api/endpoints/queue';

/**
 * Mobile current queue item display
 * Shows the currently processing item with progress
 */
export const MobileCurrentQueueItem = memo(() => {
  const { data: currentItem } = useGetCurrentQueueItemQuery();

  if (!currentItem) {
    return (
      <Box p={4} bg="base.850" borderRadius="md">
        <Text fontSize="sm" color="base.400">
          No item currently processing
        </Text>
      </Box>
    );
  }

  return (
    <Box p={4} bg="base.850" borderRadius="md">
      <Flex justifyContent="space-between" alignItems="center" mb={2}>
        <Text fontSize="sm" fontWeight="semibold" color="base.300">
          Currently Processing
        </Text>
        <Spinner size="sm" color="green.400" />
      </Flex>

      <Flex flexDirection="column" gap={1}>
        <Flex justifyContent="space-between" fontSize="xs" color="base.400">
          <Text>Item ID:</Text>
          <Text fontWeight="medium">{currentItem.item_id}</Text>
        </Flex>

        <Flex justifyContent="space-between" fontSize="xs" color="base.400">
          <Text>Batch:</Text>
          <Text fontWeight="medium">{currentItem.batch_id.slice(0, 8)}...</Text>
        </Flex>

        {currentItem.origin && (
          <Flex justifyContent="space-between" fontSize="xs" color="base.400">
            <Text>Origin:</Text>
            <Text fontWeight="medium">{currentItem.origin}</Text>
          </Flex>
        )}
      </Flex>
    </Box>
  );
});

MobileCurrentQueueItem.displayName = 'MobileCurrentQueueItem';
