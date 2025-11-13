// src/features/ui/components/mobile/gallery/MobileActionSheet.tsx
import {
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  Text,
} from '@invoke-ai/ui-library';
import { useStore } from '@nanostores/react';
import { useAppDispatch, useAppSelector, useAppStore } from 'app/store/storeHooks';
import { useClipboard } from 'common/hooks/useClipboard';
import { useDownloadItem } from 'common/hooks/useDownloadImage';
import { imagesToChangeSelected, isModalOpenChanged } from 'features/changeBoardModal/store/slice';
import { getDefaultRefImageConfig } from 'features/controlLayers/hooks/addLayerHooks';
import { useCanvasIsBusySafe } from 'features/controlLayers/hooks/useCanvasIsBusy';
import { useCanvasIsStaging } from 'features/controlLayers/store/canvasStagingAreaSlice';
import { refImageAdded } from 'features/controlLayers/store/refImagesSlice';
import { imageDTOToCroppableImage, imageDTOToImageWithDims } from 'features/controlLayers/store/util';
import { useDeleteImageModalApi } from 'features/deleteImageModal/store/state';
import { useImageDTOContext } from 'features/gallery/contexts/ImageDTOContext';
import { useRecallAll } from 'features/gallery/hooks/useRecallAllImageMetadata';
import { useRecallCLIPSkip } from 'features/gallery/hooks/useRecallCLIPSkip';
import { useRecallDimensions } from 'features/gallery/hooks/useRecallDimensions';
import { useRecallPrompts } from 'features/gallery/hooks/useRecallPrompts';
import { useRecallRemix } from 'features/gallery/hooks/useRecallRemix';
import { useRecallSeed } from 'features/gallery/hooks/useRecallSeed';
import { createNewCanvasEntityFromImage, newCanvasFromImage } from 'features/imageActions/actions';
import { $hasTemplates } from 'features/nodes/store/nodesSlice';
import { upscaleInitialImageChanged } from 'features/parameters/store/upscaleSlice';
import { toast } from 'features/toast/toast';
import { navigationApi } from 'features/ui/layouts/navigation-api';
import { WORKSPACE_PANEL_ID } from 'features/ui/layouts/shared';
import { selectActiveTab } from 'features/ui/store/uiSelectors';
import { useLoadWorkflowWithDialog } from 'features/workflowLibrary/components/LoadWorkflowConfirmationAlertDialog';
import type React from 'react';
import { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  PiArrowSquareOut,
  PiCopy,
  PiDotsThree,
  PiDownloadSimple,
  PiFolders,
  PiImage,
  PiShareFat,
  PiStar,
  PiStarFill,
  PiTrash,
  PiUploadSimple,
} from 'react-icons/pi';
import { useStarImagesMutation, useUnstarImagesMutation } from 'services/api/endpoints/images';

import { MobileActionSheetSubmenu } from './MobileActionSheetSubmenu';

interface MobileActionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSubmenu: (submenuName: string) => void;
  currentSubmenu: string | null;
  onCloseSubmenu: () => void;
}

interface ActionItemProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  hasSubmenu?: boolean;
}

const ActionItem = memo(({ icon, label, onClick, hasSubmenu }: ActionItemProps) => {
  return (
    <Flex
      as="button"
      onClick={onClick}
      alignItems="center"
      gap={3}
      py={3}
      px={4}
      _hover={{ bg: 'base.750' }}
      cursor="pointer"
      w="full"
      textAlign="left"
    >
      <Box fontSize="xl" color="base.300" flexShrink={0}>
        {icon}
      </Box>
      <Text flex={1} color="base.100">
        {label}
      </Text>
      {hasSubmenu && (
        <Box fontSize="lg" color="base.500">
          ▶
        </Box>
      )}
    </Flex>
  );
});

ActionItem.displayName = 'ActionItem';

/**
 * Mobile action sheet (bottom sheet) for image actions
 * Slides up from the bottom with all available actions for the current image
 */
export const MobileActionSheet = memo(
  ({ isOpen, onClose, onOpenSubmenu, currentSubmenu, onCloseSubmenu }: MobileActionSheetProps) => {
    const { t } = useTranslation();
    const imageDTO = useImageDTOContext();
    const tab = useAppSelector(selectActiveTab);
    const dispatch = useAppDispatch();
    const store = useAppStore();
    const { downloadItem } = useDownloadItem();
    const [starImages] = useStarImagesMutation();
    const [unstarImages] = useUnstarImagesMutation();
    const deleteImageModal = useDeleteImageModalApi();
    const loadWorkflowWithDialog = useLoadWorkflowWithDialog();
    const hasTemplates = useStore($hasTemplates);
    const isBusy = useCanvasIsBusySafe();
    const isStaging = useCanvasIsStaging();
    const clipboard = useClipboard();

    // Recall metadata hooks
    const recallAll = useRecallAll(imageDTO);
    const recallRemix = useRecallRemix(imageDTO);
    const recallPrompts = useRecallPrompts(imageDTO);
    const recallSeed = useRecallSeed(imageDTO);
    const recallDimensions = useRecallDimensions(imageDTO);
    const recallCLIPSkip = useRecallCLIPSkip(imageDTO);

    const handleDownload = useCallback(() => {
      downloadItem(imageDTO.image_url, imageDTO.image_name);
      onClose();
    }, [downloadItem, imageDTO, onClose]);

    const handleCopy = useCallback(async () => {
      // Copy image to clipboard
      try {
        const response = await fetch(imageDTO.image_url);
        const blob = await response.blob();
        clipboard.writeImage(blob);
        onClose();
      } catch {
        // Fallback: copy URL
        clipboard.writeText(imageDTO.image_url);
        onClose();
      }
    }, [imageDTO, onClose, clipboard]);

    const handleShare = useCallback(async () => {
      if (!('share' in navigator)) {
        return;
      }

      try {
        const response = await fetch(imageDTO.image_url);
        const blob = await response.blob();
        const file = new File([blob], `${imageDTO.image_name}.png`, { type: blob.type });

        await navigator.share({
          title: imageDTO.image_name,
          files: [file],
        });
        onClose();
      } catch {
        // User cancelled or share failed
        onClose();
      }
    }, [imageDTO, onClose]);

    const handleOpenInNewTab = useCallback(() => {
      window.open(imageDTO.image_url, '_blank');
      onClose();
    }, [imageDTO, onClose]);

    const handleStar = useCallback(() => {
      if (imageDTO.starred) {
        unstarImages({ image_names: [imageDTO.image_name] });
      } else {
        starImages({ image_names: [imageDTO.image_name] });
      }
      onClose();
    }, [imageDTO, starImages, unstarImages, onClose]);

    const handleDelete = useCallback(async () => {
      try {
        await deleteImageModal.delete([imageDTO.image_name]);
        onClose();
      } catch {
        // User cancelled or error occurred
        onClose();
      }
    }, [deleteImageModal, imageDTO, onClose]);

    const handleChangeBoard = useCallback(() => {
      dispatch(imagesToChangeSelected([imageDTO.image_name]));
      dispatch(isModalOpenChanged(true));
      onClose();
    }, [dispatch, imageDTO, onClose]);

    const handleSendToUpscale = useCallback(() => {
      dispatch(upscaleInitialImageChanged(imageDTOToImageWithDims(imageDTO)));
      navigationApi.switchToTab('upscaling');
      toast({
        id: 'SENT_TO_UPSCALE',
        title: t('toast.sentToUpscale'),
        status: 'success',
      });
      onClose();
    }, [dispatch, imageDTO, t, onClose]);

    const handleUseAsReference = useCallback(() => {
      const { dispatch: storeDispatch, getState } = store;
      const config = getDefaultRefImageConfig(getState);
      config.image = imageDTOToCroppableImage(imageDTO);
      storeDispatch(refImageAdded({ overrides: { config } }));
      toast({
        id: 'SENT_TO_CANVAS',
        title: t('toast.sentToCanvas'),
        status: 'success',
      });
      onClose();
    }, [imageDTO, store, t, onClose]);

    const handleLoadWorkflow = useCallback(() => {
      loadWorkflowWithDialog({ type: 'image', data: imageDTO.image_name });
      onClose();
    }, [loadWorkflowWithDialog, imageDTO, onClose]);

    // New Canvas from Image handlers
    const handleNewCanvasRasterLayer = useCallback(async () => {
      const { dispatch: storeDispatch, getState } = store;
      await navigationApi.focusPanel('canvas', WORKSPACE_PANEL_ID);
      await newCanvasFromImage({
        imageDTO,
        withResize: false,
        withInpaintMask: true,
        type: 'raster_layer',
        dispatch: storeDispatch,
        getState,
      });
      toast({
        id: 'SENT_TO_CANVAS',
        title: t('toast.sentToCanvas'),
        status: 'success',
      });
      onClose();
    }, [imageDTO, store, t, onClose]);

    const handleNewCanvasControlLayer = useCallback(async () => {
      const { dispatch: storeDispatch, getState } = store;
      await navigationApi.focusPanel('canvas', WORKSPACE_PANEL_ID);
      await newCanvasFromImage({
        imageDTO,
        withResize: false,
        withInpaintMask: true,
        type: 'control_layer',
        dispatch: storeDispatch,
        getState,
      });
      toast({
        id: 'SENT_TO_CANVAS',
        title: t('toast.sentToCanvas'),
        status: 'success',
      });
      onClose();
    }, [imageDTO, store, t, onClose]);

    const handleNewCanvasInpaintMask = useCallback(async () => {
      const { dispatch: storeDispatch, getState } = store;
      await navigationApi.focusPanel('canvas', WORKSPACE_PANEL_ID);
      await newCanvasFromImage({
        imageDTO,
        withResize: false,
        withInpaintMask: true,
        type: 'inpaint_mask',
        dispatch: storeDispatch,
        getState,
      });
      toast({
        id: 'SENT_TO_CANVAS',
        title: t('toast.sentToCanvas'),
        status: 'success',
      });
      onClose();
    }, [imageDTO, store, t, onClose]);

    const handleNewCanvasRegionalGuidance = useCallback(async () => {
      const { dispatch: storeDispatch, getState } = store;
      await navigationApi.focusPanel('canvas', WORKSPACE_PANEL_ID);
      await newCanvasFromImage({
        imageDTO,
        withResize: false,
        withInpaintMask: true,
        type: 'regional_guidance',
        dispatch: storeDispatch,
        getState,
      });
      toast({
        id: 'SENT_TO_CANVAS',
        title: t('toast.sentToCanvas'),
        status: 'success',
      });
      onClose();
    }, [imageDTO, store, t, onClose]);

    // New Layer from Image handlers
    const handleNewLayerRaster = useCallback(async () => {
      const { dispatch: storeDispatch, getState } = store;
      await navigationApi.focusPanel('canvas', WORKSPACE_PANEL_ID);
      createNewCanvasEntityFromImage({ imageDTO, type: 'raster_layer', dispatch: storeDispatch, getState });
      toast({
        id: 'SENT_TO_CANVAS',
        title: t('toast.sentToCanvas'),
        status: 'success',
      });
      onClose();
    }, [imageDTO, store, t, onClose]);

    const handleNewLayerControl = useCallback(async () => {
      const { dispatch: storeDispatch, getState } = store;
      await navigationApi.focusPanel('canvas', WORKSPACE_PANEL_ID);
      createNewCanvasEntityFromImage({ imageDTO, type: 'control_layer', dispatch: storeDispatch, getState });
      toast({
        id: 'SENT_TO_CANVAS',
        title: t('toast.sentToCanvas'),
        status: 'success',
      });
      onClose();
    }, [imageDTO, store, t, onClose]);

    const handleNewLayerInpaintMask = useCallback(async () => {
      const { dispatch: storeDispatch, getState } = store;
      await navigationApi.focusPanel('canvas', WORKSPACE_PANEL_ID);
      createNewCanvasEntityFromImage({ imageDTO, type: 'inpaint_mask', dispatch: storeDispatch, getState });
      toast({
        id: 'SENT_TO_CANVAS',
        title: t('toast.sentToCanvas'),
        status: 'success',
      });
      onClose();
    }, [imageDTO, store, t, onClose]);

    const handleNewLayerRegionalGuidance = useCallback(async () => {
      const { dispatch: storeDispatch, getState } = store;
      await navigationApi.focusPanel('canvas', WORKSPACE_PANEL_ID);
      createNewCanvasEntityFromImage({ imageDTO, type: 'regional_guidance', dispatch: storeDispatch, getState });
      toast({
        id: 'SENT_TO_CANVAS',
        title: t('toast.sentToCanvas'),
        status: 'success',
      });
      onClose();
    }, [imageDTO, store, t, onClose]);

    const handleOpenRecallMetadataSubmenu = useCallback(() => {
      onOpenSubmenu('recall-metadata');
    }, [onOpenSubmenu]);

    const handleOpenNewCanvasSubmenu = useCallback(() => {
      onOpenSubmenu('new-canvas');
    }, [onOpenSubmenu]);

    const handleOpenNewLayerSubmenu = useCallback(() => {
      onOpenSubmenu('new-layer');
    }, [onOpenSubmenu]);

    return (
      <>
        <Drawer isOpen={isOpen && !currentSubmenu} onClose={onClose} placement="bottom">
          <DrawerOverlay bg="blackAlpha.800" />
          <DrawerContent bg="base.900" borderTopRadius="lg" maxH="80vh">
            <DrawerHeader textAlign="center" borderBottom="1px solid" borderColor="base.700" py={3}>
              <Text fontSize="md" fontWeight="semibold" color="base.100">
                {t('common.actions')}
              </Text>
            </DrawerHeader>

            <DrawerBody p={0} overflowY="auto">
              {/* Quick Actions Group */}
              <Box>
                <Box px={4} py={2} bg="base.800">
                  <Text fontSize="xs" fontWeight="semibold" color="base.500" textTransform="uppercase">
                    Quick Actions
                  </Text>
                </Box>
                <ActionItem icon={<PiArrowSquareOut />} label={t('common.openInNewTab')} onClick={handleOpenInNewTab} />
                <ActionItem icon={<PiCopy />} label={t('common.copy')} onClick={handleCopy} />
                <ActionItem icon={<PiDownloadSimple />} label={t('common.download')} onClick={handleDownload} />
                <ActionItem
                  icon={imageDTO.starred ? <PiStarFill /> : <PiStar />}
                  label={imageDTO.starred ? t('common.unstar') : t('common.star')}
                  onClick={handleStar}
                />
                <ActionItem icon={<PiTrash />} label={t('common.delete')} onClick={handleDelete} />
              </Box>

              {/* Workflow Group */}
              {(tab === 'canvas' || tab === 'generate' || tab === 'upscaling') && (
                <Box>
                  <Box px={4} py={2} bg="base.800" mt={2}>
                    <Text fontSize="xs" fontWeight="semibold" color="base.500" textTransform="uppercase">
                      Workflow
                    </Text>
                  </Box>
                  {imageDTO.has_workflow && hasTemplates && (
                    <ActionItem icon={<PiDotsThree />} label="Load Workflow" onClick={handleLoadWorkflow} />
                  )}
                  <ActionItem
                    icon={<PiDotsThree />}
                    label="Recall Metadata"
                    onClick={handleOpenRecallMetadataSubmenu}
                    hasSubmenu
                  />
                  {tab !== 'upscaling' && (
                    <ActionItem icon={<PiUploadSimple />} label="Send to Upscale" onClick={handleSendToUpscale} />
                  )}
                  {(tab === 'canvas' || tab === 'generate') && (
                    <>
                      <ActionItem icon={<PiImage />} label="Use as Reference" onClick={handleUseAsReference} />
                      <ActionItem
                        icon={<PiDotsThree />}
                        label="New Canvas from Image"
                        onClick={handleOpenNewCanvasSubmenu}
                        hasSubmenu
                      />
                    </>
                  )}
                  {tab === 'canvas' && (
                    <ActionItem
                      icon={<PiDotsThree />}
                      label="New Layer from Image"
                      onClick={handleOpenNewLayerSubmenu}
                      hasSubmenu
                    />
                  )}
                </Box>
              )}

              {/* Organization Group */}
              <Box>
                <Box px={4} py={2} bg="base.800" mt={2}>
                  <Text fontSize="xs" fontWeight="semibold" color="base.500" textTransform="uppercase">
                    Organization
                  </Text>
                </Box>
                <ActionItem icon={<PiFolders />} label="Change Board" onClick={handleChangeBoard} />
              </Box>

              {/* Share Group */}
              {'share' in navigator && (
                <Box>
                  <Box px={4} py={2} bg="base.800" mt={2}>
                    <Text fontSize="xs" fontWeight="semibold" color="base.500" textTransform="uppercase">
                      Share
                    </Text>
                  </Box>
                  <ActionItem icon={<PiShareFat />} label="Share Image" onClick={handleShare} />
                </Box>
              )}
            </DrawerBody>

            <DrawerFooter p={3} borderTop="1px solid" borderColor="base.700">
              <Button onClick={onClose} w="full" size="lg" colorScheme="base" variant="solid">
                {t('common.close')}
              </Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>

        {/* Recall Metadata Submenu */}
        {currentSubmenu === 'recall-metadata' && (
          <MobileActionSheetSubmenu
            isOpen={isOpen}
            onClose={onClose}
            onBack={onCloseSubmenu}
            title={t('parameters.recallMetadata')}
            options={[
              { label: t('parameters.remixImage'), onClick: recallRemix.recall, isDisabled: !recallRemix.isEnabled },
              { label: t('parameters.usePrompt'), onClick: recallPrompts.recall, isDisabled: !recallPrompts.isEnabled },
              { label: t('parameters.useSeed'), onClick: recallSeed.recall, isDisabled: !recallSeed.isEnabled },
              { label: t('parameters.useAll'), onClick: recallAll.recall, isDisabled: !recallAll.isEnabled },
              {
                label: t('parameters.useSize'),
                onClick: recallDimensions.recall,
                isDisabled: !recallDimensions.isEnabled,
              },
              {
                label: t('parameters.useClipSkip'),
                onClick: recallCLIPSkip.recall,
                isDisabled: !recallCLIPSkip.isEnabled,
              },
            ]}
          />
        )}

        {/* New Canvas from Image Submenu */}
        {currentSubmenu === 'new-canvas' && (
          <MobileActionSheetSubmenu
            isOpen={isOpen}
            onClose={onClose}
            onBack={onCloseSubmenu}
            title={t('controlLayers.newCanvasFromImage')}
            options={[
              {
                label: t('controlLayers.asRasterLayer'),
                onClick: handleNewCanvasRasterLayer,
                isDisabled: isStaging || isBusy,
              },
              {
                label: t('controlLayers.asControlLayer'),
                onClick: handleNewCanvasControlLayer,
                isDisabled: isStaging || isBusy,
              },
              {
                label: t('controlLayers.inpaintMask'),
                onClick: handleNewCanvasInpaintMask,
                isDisabled: isStaging || isBusy,
              },
              {
                label: t('controlLayers.regionalGuidance'),
                onClick: handleNewCanvasRegionalGuidance,
                isDisabled: isStaging || isBusy,
              },
            ]}
          />
        )}

        {/* New Layer from Image Submenu */}
        {currentSubmenu === 'new-layer' && (
          <MobileActionSheetSubmenu
            isOpen={isOpen}
            onClose={onClose}
            onBack={onCloseSubmenu}
            title={t('controlLayers.newLayerFromImage')}
            options={[
              {
                label: t('controlLayers.inpaintMask'),
                onClick: handleNewLayerInpaintMask,
                isDisabled: isBusy,
              },
              {
                label: t('controlLayers.regionalGuidance'),
                onClick: handleNewLayerRegionalGuidance,
                isDisabled: isBusy,
              },
              {
                label: t('controlLayers.controlLayer'),
                onClick: handleNewLayerControl,
                isDisabled: isBusy,
              },
              {
                label: t('controlLayers.rasterLayer'),
                onClick: handleNewLayerRaster,
                isDisabled: isBusy,
              },
            ]}
          />
        )}
      </>
    );
  }
);

MobileActionSheet.displayName = 'MobileActionSheet';
