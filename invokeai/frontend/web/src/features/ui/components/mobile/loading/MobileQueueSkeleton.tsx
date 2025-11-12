import { Box, Flex, Skeleton } from '@invoke-ai/ui-library';
import { memo } from 'react';

// Pre-generate array of skeleton indices to avoid recreation
const SKELETON_INDICES = Array.from({ length: 4 }, (_, i) => i);

/**
 * Loading skeleton for mobile queue status
 */
export const MobileQueueSkeleton = memo(() => {
  return (
    <Box p={4} bg="base.850" borderRadius="md" aria-label="Loading queue status">
      <Skeleton height="16px" width="100px" mb={3} startColor="base.800" endColor="base.700" aria-hidden="true" />
      <Flex gap={4} flexWrap="wrap" aria-hidden="true">
        {SKELETON_INDICES.map((index) => (
          <Flex key={index} flexDirection="column" alignItems="center" minWidth="60px">
            <Skeleton height="28px" width="40px" mb={1} startColor="base.800" endColor="base.700" />
            <Skeleton height="12px" width="50px" startColor="base.800" endColor="base.700" />
          </Flex>
        ))}
      </Flex>
    </Box>
  );
});

MobileQueueSkeleton.displayName = 'MobileQueueSkeleton';
