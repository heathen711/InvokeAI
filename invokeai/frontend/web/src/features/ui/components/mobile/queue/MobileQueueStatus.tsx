import { Box, Flex, Text } from '@invoke-ai/ui-library';
import { MobileQueueSkeleton } from 'features/ui/components/mobile/loading/MobileQueueSkeleton';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useGetQueueStatusQuery } from 'services/api/endpoints/queue';

/**
 * Mobile queue status display
 * Shows pending, in_progress, completed, failed counts
 */
export const MobileQueueStatus = memo(() => {
  const { t } = useTranslation();
  const { data: queueStatus, isLoading } = useGetQueueStatusQuery();

  if (isLoading) {
    return <MobileQueueSkeleton />;
  }

  if (!queueStatus) {
    return null;
  }

  const { pending, in_progress, completed, failed, canceled } = queueStatus.queue;

  return (
    <Box p={4} bg="base.850" borderRadius="md">
      <Text fontSize="sm" fontWeight="semibold" mb={2} color="base.300">
        {t('queue.queueStatus')}
      </Text>
      <Flex gap={4} flexWrap="wrap">
        <StatusBadge label={t('queue.pending')} count={pending} color="blue.400" />
        <StatusBadge label={t('queue.in_progress')} count={in_progress} color="green.400" />
        <StatusBadge label={t('queue.completed')} count={completed} color="base.400" />
        {failed > 0 && <StatusBadge label={t('queue.failed')} count={failed} color="red.400" />}
        {canceled > 0 && <StatusBadge label={t('queue.canceled')} count={canceled} color="orange.400" />}
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
