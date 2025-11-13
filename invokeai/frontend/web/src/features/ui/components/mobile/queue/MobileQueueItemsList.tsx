// src/features/ui/components/mobile/queue/MobileQueueItemsList.tsx
import { Box, Text } from '@invoke-ai/ui-library';
import { memo } from 'react';
import { useGetQueueStatusQuery } from 'services/api/endpoints/queue';

/**
 * Mobile queue items list with thumbnails
 * Shows queue summary (simplified for now)
 * TODO: Add detailed queue items list when API endpoint is available
 */
export const MobileQueueItemsList = memo(() => {
  const { data: queueStatus } = useGetQueueStatusQuery();

  if (!queueStatus) {
    return null;
  }

  const totalItems =
    queueStatus.queue.pending +
    queueStatus.queue.in_progress +
    queueStatus.queue.completed +
    queueStatus.queue.failed +
    queueStatus.queue.canceled;

  if (totalItems === 0) {
    return (
      <Box p={4} bg="base.850" borderRadius="md">
        <Text fontSize="sm" color="base.400" textAlign="center">
          Queue is empty
        </Text>
        <Text fontSize="xs" color="base.500" textAlign="center" mt={1}>
          Generated images will appear in the View tab
        </Text>
      </Box>
    );
  }

  return (
    <Box p={4} bg="base.850" borderRadius="md">
      <Text fontSize="sm" fontWeight="semibold" mb={2} color="base.300">
        Queue Summary
      </Text>
      <Text fontSize="xs" color="base.400">
        Total processed: {queueStatus.queue.completed} items
      </Text>
      <Text fontSize="xs" color="base.400" mt={1}>
        Check the View tab to see your generated images
      </Text>
    </Box>
  );
});

MobileQueueItemsList.displayName = 'MobileQueueItemsList';
