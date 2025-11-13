// src/features/ui/components/mobile/generate/MobileGenerationPreview.tsx
import type { SystemStyleObject } from '@invoke-ai/ui-library';
import { Box, Flex, Image, Spinner, Text } from '@invoke-ai/ui-library';
import { useStore } from '@nanostores/react';
import { useAppSelector } from 'app/store/storeHooks';
import { selectLastSelectedItem } from 'features/gallery/store/gallerySelectors';
import type { ProgressImage as ProgressImageType } from 'features/nodes/types/common';
import { selectSystemSlice } from 'features/system/store/systemSlice';
import { MobileImageViewer } from 'features/ui/components/mobile/gallery/MobileImageViewer';
import { atom } from 'nanostores';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { useGetImageDTOQuery } from 'services/api/endpoints/images';
import type { S } from 'services/api/types';
import { $socket } from 'services/events/stores';

/**
 * Mobile generation preview
 * Shows in-flight generation progress or the most recently selected/generated image
 * Tap completed images to view full-screen
 */
export const MobileGenerationPreview = memo(() => {
  const lastSelectedImageName = useAppSelector(selectLastSelectedItem);
  const { data: imageDTO, isLoading } = useGetImageDTOQuery(lastSelectedImageName ?? '', {
    skip: !lastSelectedImageName,
  });

  const [isViewerOpen, setIsViewerOpen] = useState(false);

  // Listen to progress events
  const socket = useStore($socket);
  const [$progressImage] = useState(() => atom<ProgressImageType | null>(null));
  const progressImage = useStore($progressImage);

  useEffect(() => {
    if (!socket) {
      return;
    }

    const onInvocationProgress = (data: S['InvocationProgressEvent']) => {
      if (data.image) {
        $progressImage.set(data.image);
      }
    };

    const onQueueItemStatusChanged = (data: S['QueueItemStatusChangedEvent']) => {
      if (data.status === 'completed' || data.status === 'canceled' || data.status === 'failed') {
        // Clear progress image when generation completes/fails
        $progressImage.set(null);
      }
    };

    socket.on('invocation_progress', onInvocationProgress);
    socket.on('queue_item_status_changed', onQueueItemStatusChanged);

    return () => {
      socket.off('invocation_progress', onInvocationProgress);
      socket.off('queue_item_status_changed', onQueueItemStatusChanged);
    };
  }, [socket, $progressImage]);

  const handleOpenViewer = useCallback(() => {
    setIsViewerOpen(true);
  }, []);

  const handleCloseViewer = useCallback(() => {
    setIsViewerOpen(false);
  }, []);

  // Show progress image if available
  if (progressImage) {
    return <ProgressImageDisplay progressImage={progressImage} />;
  }

  if (isLoading) {
    return (
      <Flex
        aspectRatio="1/1"
        bg="base.850"
        borderRadius="base"
        borderWidth={1}
        borderColor="base.700"
        alignItems="center"
        justifyContent="center"
      >
        <Spinner size="xl" />
      </Flex>
    );
  }

  if (!imageDTO) {
    return (
      <Flex
        aspectRatio="1/1"
        bg="base.850"
        borderRadius="base"
        borderWidth={1}
        borderColor="base.700"
        alignItems="center"
        justifyContent="center"
        flexDirection="column"
        gap={2}
        p={4}
      >
        <Text color="base.400" fontSize="sm" textAlign="center">
          No generation yet
        </Text>
        <Text color="base.500" fontSize="xs" textAlign="center">
          Your generated image will appear here
        </Text>
      </Flex>
    );
  }

  return (
    <>
      <Box
        as="button"
        onClick={handleOpenViewer}
        position="relative"
        aspectRatio="1/1"
        bg="base.900"
        borderRadius="base"
        overflow="hidden"
        cursor="pointer"
        w="full"
        p={0}
        border="none"
        _hover={{ opacity: 0.9 }}
        _active={{ opacity: 0.8 }}
        transition="opacity 0.15s"
      >
        <Image
          src={imageDTO.thumbnail_url}
          alt={imageDTO.image_name}
          objectFit="contain"
          width="full"
          height="full"
          pointerEvents="none"
        />
        {/* Image info overlay */}
        <Flex
          position="absolute"
          bottom={0}
          left={0}
          right={0}
          px={2}
          py={1}
          bg="blackAlpha.700"
          justifyContent="space-between"
          fontSize="xs"
          color="base.300"
        >
          <Text>
            {imageDTO.width} × {imageDTO.height}
          </Text>
          <Text noOfLines={1} flex={1} textAlign="right" ml={2}>
            {imageDTO.image_name}
          </Text>
        </Flex>
      </Box>

      {/* Full-screen image viewer */}
      {isViewerOpen && imageDTO && (
        <MobileImageViewer images={[imageDTO]} currentIndex={0} onClose={handleCloseViewer} />
      )}
    </>
  );
});

MobileGenerationPreview.displayName = 'MobileGenerationPreview';

/**
 * Displays an in-flight progress image
 */
const ProgressImageDisplay = memo(({ progressImage }: { progressImage: ProgressImageType }) => {
  const shouldAntialiasProgressImage = useAppSelector((state) => selectSystemSlice(state).shouldAntialiasProgressImage);

  const sx = useMemo<SystemStyleObject>(
    () => ({
      imageRendering: shouldAntialiasProgressImage ? 'auto' : 'pixelated',
    }),
    [shouldAntialiasProgressImage]
  );

  return (
    <Box position="relative" aspectRatio="1/1" bg="base.900" borderRadius="base" overflow="hidden">
      <Flex width="full" height="full" alignItems="center" justifyContent="center">
        <Image
          src={progressImage.dataURL}
          width={progressImage.width}
          height={progressImage.height}
          draggable={false}
          objectFit="contain"
          maxWidth="full"
          maxHeight="full"
          borderRadius="base"
          sx={sx}
        />
      </Flex>
      {/* Progress indicator overlay */}
      <Flex
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        px={2}
        py={1}
        bg="blackAlpha.700"
        justifyContent="center"
        fontSize="xs"
        color="invokeBlue.400"
      >
        <Text>Generating...</Text>
      </Flex>
    </Box>
  );
});

ProgressImageDisplay.displayName = 'ProgressImageDisplay';
