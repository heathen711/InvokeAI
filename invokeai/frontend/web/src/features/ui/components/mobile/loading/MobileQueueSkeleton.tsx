import { Box, Flex, Skeleton } from '@invoke-ai/ui-library';
import { memo } from 'react';

/**
 * Loading skeleton for mobile queue status
 */
export const MobileQueueSkeleton = memo(() => {
  return (
    <Box p={4} bg="base.850" borderRadius="md">
      <Skeleton height="16px" width="100px" mb={3} startColor="base.800" endColor="base.700" />
      <Flex gap={4} flexWrap="wrap">
        {Array.from({ length: 4 }).map((_, index) => (
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
