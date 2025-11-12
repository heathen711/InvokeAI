// src/features/ui/components/mobile/gallery/MobileGalleryGrid.tsx
import { Box, Flex, Grid, Text } from '@invoke-ai/ui-library';
import { MobileGallerySkeleton } from 'features/ui/components/mobile/loading/MobileGallerySkeleton';
import { memo, useCallback } from 'react';
import { PiStarFill } from 'react-icons/pi';
import { useListImagesQuery } from 'services/api/endpoints/images';
import type { ImageDTO } from 'services/api/types';

interface MobileGalleryGridProps {
  onImageSelect: (image: ImageDTO) => void;
  boardId?: string | null;
}

/**
 * Individual gallery grid item
 */
const GalleryGridItem = memo(({ image, onClick }: { image: ImageDTO; onClick: (image: ImageDTO) => void }) => {
  const handleClick = useCallback(() => {
    onClick(image);
  }, [image, onClick]);

  return (
    <Box
      position="relative"
      onClick={handleClick}
      cursor="pointer"
      borderRadius="md"
      overflow="hidden"
      bg="base.800"
      style={{ touchAction: 'manipulation' }}
      _hover={{ opacity: 0.8 }}
      transition="opacity 0.2s"
    >
      {/* Thumbnail image */}
      <Box
        as="img"
        src={image.thumbnail_url}
        alt={image.image_name}
        width="full"
        height="full"
        objectFit="cover"
        loading="lazy"
      />

      {/* Starred indicator */}
      {image.starred && (
        <Box position="absolute" top={1} right={1} p={1} bg="blackAlpha.700" borderRadius="sm" color="yellow.400">
          <PiStarFill size={16} />
        </Box>
      )}

      {/* Image dimensions */}
      <Box
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        px={1}
        py={0.5}
        bg="blackAlpha.700"
        fontSize="xs"
        color="base.300"
        textAlign="center"
      >
        {image.width} × {image.height}
      </Box>
    </Box>
  );
});

GalleryGridItem.displayName = 'GalleryGridItem';

/**
 * Mobile gallery grid component
 * Displays images in a responsive grid layout optimized for touch
 */
export const MobileGalleryGrid = memo(({ onImageSelect, boardId }: MobileGalleryGridProps) => {
  // Fetch images using RTK Query
  const { data, isLoading, isFetching } = useListImagesQuery({
    board_id: boardId ?? undefined,
    limit: 50,
    offset: 0,
    is_intermediate: false,
  });

  // Loading state
  if (isLoading || isFetching) {
    return <MobileGallerySkeleton />;
  }

  // Empty state
  if (!data || data.items.length === 0) {
    return (
      <Flex width="full" height="full" alignItems="center" justifyContent="center">
        <Text color="base.400">No images found</Text>
      </Flex>
    );
  }

  return (
    <Box width="full" height="full" overflowY="auto" px={2} py={2}>
      <Grid templateColumns="repeat(auto-fill, minmax(150px, 1fr))" gap={2} width="full" autoRows="150px">
        {data.items.map((image) => (
          <GalleryGridItem key={image.image_name} image={image} onClick={onImageSelect} />
        ))}
      </Grid>
    </Box>
  );
});

MobileGalleryGrid.displayName = 'MobileGalleryGrid';
