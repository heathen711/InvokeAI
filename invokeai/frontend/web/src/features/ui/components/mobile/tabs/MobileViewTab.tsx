// src/features/ui/components/mobile/tabs/MobileViewTab.tsx
import { Flex, Text } from '@invoke-ai/ui-library';
import { MobileGalleryGrid } from 'features/ui/components/mobile/gallery/MobileGalleryGrid';
import { MobileImageViewer } from 'features/ui/components/mobile/gallery/MobileImageViewer';
import { MobileTopBar } from 'features/ui/components/mobile/MobileTopBar';
import { memo, useCallback, useState } from 'react';
import { useListImagesQuery } from 'services/api/endpoints/images';
import type { ImageDTO } from 'services/api/types';

/**
 * Mobile View tab - Gallery with image viewer
 * Displays a grid of images and allows viewing them full-screen
 */
export const MobileViewTab = memo(() => {
  const [selectedImage, setSelectedImage] = useState<ImageDTO | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);

  // Fetch images for the viewer (we need the full list for navigation)
  const { data } = useListImagesQuery({
    limit: 50,
    offset: 0,
    is_intermediate: false,
  });

  const images = data?.items ?? [];
  const currentIndex = selectedImage ? images.findIndex((img) => img.image_name === selectedImage.image_name) : 0;

  // Handle image selection from grid
  const handleImageSelect = useCallback((image: ImageDTO) => {
    setSelectedImage(image);
    setViewerOpen(true);
  }, []);

  // Handle viewer close
  const handleViewerClose = useCallback(() => {
    setViewerOpen(false);
  }, []);

  return (
    <Flex flexDirection="column" width="full" height="full" overflow="hidden">
      <MobileTopBar>
        <Text fontSize="lg" fontWeight="semibold">
          Gallery
        </Text>
      </MobileTopBar>

      {/* Gallery Grid */}
      <Flex flex={1} overflow="hidden">
        <MobileGalleryGrid onImageSelect={handleImageSelect} />
      </Flex>

      {/* Image Viewer (full-screen overlay) */}
      {viewerOpen && selectedImage && images.length > 0 && (
        <MobileImageViewer images={images} currentIndex={Math.max(0, currentIndex)} onClose={handleViewerClose} />
      )}
    </Flex>
  );
});

MobileViewTab.displayName = 'MobileViewTab';
