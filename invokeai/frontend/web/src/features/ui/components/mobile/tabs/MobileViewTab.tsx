// src/features/ui/components/mobile/tabs/MobileViewTab.tsx
import { Flex } from '@invoke-ai/ui-library';
import { useAppSelector } from 'app/store/storeHooks';
import { selectGalleryView, selectSelectedBoardId } from 'features/gallery/store/gallerySelectors';
import { MobileBoardSelectorBar } from 'features/ui/components/mobile/boards';
import { MobileGalleryGrid } from 'features/ui/components/mobile/gallery/MobileGalleryGrid';
import { MobileImageViewer } from 'features/ui/components/mobile/gallery/MobileImageViewer';
import { memo, useCallback, useState } from 'react';
import { useListImagesQuery } from 'services/api/endpoints/images';
import type { ImageDTO } from 'services/api/types';

/**
 * Mobile View tab - Gallery with board filtering and image viewer
 * Displays a grid of images filtered by selected board
 * Allows switching between images and assets
 */
export const MobileViewTab = memo(() => {
  const [selectedImage, setSelectedImage] = useState<ImageDTO | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);

  // Get current board and view from Redux
  const selectedBoardId = useAppSelector(selectSelectedBoardId);
  const galleryView = useAppSelector(selectGalleryView);

  // Fetch images for the viewer (we need the full list for navigation)
  const { data } = useListImagesQuery({
    board_id: selectedBoardId === 'none' ? undefined : selectedBoardId,
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
      {/* Gallery Grid - fills remaining space */}
      <Flex flex={1} overflow="hidden">
        <MobileGalleryGrid onImageSelect={handleImageSelect} boardId={selectedBoardId} galleryView={galleryView} />
      </Flex>

      {/* Persistent bottom board selector bar */}
      <MobileBoardSelectorBar mode="view" />

      {/* Image Viewer (full-screen overlay) */}
      {viewerOpen && selectedImage && images.length > 0 && (
        <MobileImageViewer images={images} currentIndex={Math.max(0, currentIndex)} onClose={handleViewerClose} />
      )}
    </Flex>
  );
});

MobileViewTab.displayName = 'MobileViewTab';
