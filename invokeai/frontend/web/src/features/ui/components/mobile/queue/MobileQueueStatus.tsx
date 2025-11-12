import { Box, Flex, Spinner, Text } from '@invoke-ai/ui-library';
import { memo } from 'react';
import { useGetQueueStatusQuery } from 'services/api/endpoints/queue';

/**
 * Mobile queue status display
 * Shows pending, in_progress, completed, failed counts
 */
export const MobileQueueStatus = memo(() => {
  const { data: queueStatus, isLoading } = useGetQueueStatusQuery();

  if (isLoading) {
    return (
      <Flex justifyContent="center" alignItems="center" p={4}>
        <Spinner role="status" aria-label="Loading queue status" />
      </Flex>
    );
  }

  if (!queueStatus) {
    return null;
  }

  const { pending, in_progress, completed, failed, canceled } = queueStatus.queue;

  return (
    <Box p={4} bg="base.850" borderRadius="md">
      <Text fontSize="sm" fontWeight="semibold" mb={2} color="base.300">
        Queue Status
      </Text>
      <Flex gap={4} flexWrap="wrap">
        <StatusBadge label="Pending" count={pending} color="blue.400" />
        <StatusBadge label="Running" count={in_progress} color="green.400" />
        <StatusBadge label="Completed" count={completed} color="base.400" />
        {failed > 0 && <StatusBadge label="Failed" count={failed} color="red.400" />}
        {canceled > 0 && <StatusBadge label="Canceled" count={canceled} color="orange.400" />}
      </Flex>
    </Box>
  );
});

MobileQueueStatus.displayName = 'MobileQueueStatus';

interface StatusBadgeProps {
  label: string;
  count: number;
  color: string;
}

const StatusBadge = memo(({ label, count, color }: StatusBadgeProps) => {
  return (
    <Flex flexDirection="column" alignItems="center" minWidth="60px">
      <Text fontSize="xl" fontWeight="bold" color={color}>
        {count}
      </Text>
      <Text fontSize="xs" color="base.400">
        {label}
      </Text>
    </Flex>
  );
});

StatusBadge.displayName = 'StatusBadge';
