import { Box, Flex, Skeleton } from '@invoke-ai/ui-library';
import { memo } from 'react';

// Pre-generate array of skeleton indices to avoid recreation
const SKELETON_INDICES = Array.from({ length: 4 }, (_, i) => i);

/**
 * Loading skeleton for mobile models list
 * Shows placeholder cards while models load
 */
export const MobileModelsSkeleton = memo(() => {
  return (
    <Flex flexDirection="column" gap={2} p={4} overflow="auto">
      {SKELETON_INDICES.map((index) => (
        <Box key={index} p={4} bg="base.850" borderRadius="md">
          <Skeleton height="20px" width="60%" mb={2} startColor="base.800" endColor="base.700" />
          <Flex gap={2} mb={2}>
            <Skeleton height="16px" width="50px" borderRadius="full" startColor="base.800" endColor="base.700" />
            <Skeleton height="16px" width="60px" borderRadius="full" startColor="base.800" endColor="base.700" />
            <Skeleton height="16px" width="70px" borderRadius="full" startColor="base.800" endColor="base.700" />
          </Flex>
          <Flex flexDirection="column" gap={2} mt={2}>
            <Skeleton height="12px" width="100%" startColor="base.800" endColor="base.700" />
            <Skeleton height="12px" width="85%" startColor="base.800" endColor="base.700" />
          </Flex>
        </Box>
      ))}
    </Flex>
  );
});

MobileModelsSkeleton.displayName = 'MobileModelsSkeleton';
