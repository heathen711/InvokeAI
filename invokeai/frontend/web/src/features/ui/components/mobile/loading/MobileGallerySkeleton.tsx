import { Box, Grid, Skeleton } from '@invoke-ai/ui-library';
import { memo } from 'react';

// Pre-generate array of skeleton indices to avoid recreation
const SKELETON_INDICES = Array.from({ length: 6 }, (_, i) => i);

/**
 * Loading skeleton for mobile gallery grid
 * Shows placeholder cards while images load
 */
export const MobileGallerySkeleton = memo(() => {
  return (
    <Box width="full" height="full" overflowY="auto" px={2} py={2}>
      <Grid templateColumns="repeat(auto-fill, minmax(150px, 1fr))" gap={2} width="full" autoRows="150px">
        {SKELETON_INDICES.map((index) => (
          <Skeleton
            key={index}
            width="full"
            height="full"
            borderRadius="md"
            startColor="base.800"
            endColor="base.700"
          />
        ))}
      </Grid>
    </Box>
  );
});

MobileGallerySkeleton.displayName = 'MobileGallerySkeleton';
