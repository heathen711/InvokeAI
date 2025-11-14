// src/features/ui/components/mobile/gallery/MobileDeleteImageConfirmation.tsx
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
  ListItem,
  Show,
  Text,
  UnorderedList,
} from '@invoke-ai/ui-library';
import { some } from 'es-toolkit/compat';
import { useDeleteImageModalApi, useDeleteImageModalState } from 'features/deleteImageModal/store/state';
import { memo, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { PiWarning } from 'react-icons/pi';

/**
 * Mobile-friendly delete confirmation dialog using bottom drawer
 * Alternative to desktop ConfirmationAlertDialog for touch interfaces
 * Always shows confirmation on mobile for safety, regardless of user's "don't ask again" preference
 */
export const MobileDeleteImageConfirmation = memo(() => {
  const { t } = useTranslation();
  const state = useDeleteImageModalState();
  const api = useDeleteImageModalApi();
  const headerRef = useRef<HTMLDivElement>(null);

  const handleDelete = useCallback(() => {
    api.confirm();
  }, [api]);

  const handleCancel = useCallback(() => {
    api.cancel();
  }, [api]);

  const imageUsage = state.usageSummary;
  const hasUsage = some(imageUsage);

  // Only render on mobile - DeleteImageModal handles desktop
  return (
    <Show below="md">
      <Drawer isOpen={state.isOpen} onClose={handleCancel} placement="bottom" initialFocusRef={headerRef}>
        <DrawerOverlay bg="blackAlpha.800" />
        <DrawerContent bg="base.900" borderTopRadius="lg" maxH="80vh">
          <DrawerHeader ref={headerRef} textAlign="center" borderBottom="1px solid" borderColor="base.700" py={3}>
            <Flex alignItems="center" justifyContent="center" gap={2}>
              <Box fontSize="xl" color="error.400">
                <PiWarning />
              </Box>
              <Text fontSize="md" fontWeight="semibold" color="base.100">
                {t('gallery.deleteImage', { count: state.image_names.length })}
              </Text>
            </Flex>
          </DrawerHeader>

          <DrawerBody p={4} overflowY="auto">
            <Flex flexDirection="column" gap={4}>
              {/* Image usage warning */}
              {hasUsage && (
                <Box bg="base.800" borderRadius="md" p={3} borderLeft="3px solid" borderColor="warning.400">
                  <Text fontWeight="semibold" mb={2} color="warning.400">
                    {t('gallery.currentlyInUse')}
                  </Text>
                  <UnorderedList paddingInlineStart={6} fontSize="sm" color="base.200" spacing={1}>
                    {imageUsage.isControlLayerImage && <ListItem>{t('controlLayers.controlLayer')}</ListItem>}
                    {imageUsage.isReferenceImage && <ListItem>{t('controlLayers.referenceImage')}</ListItem>}
                    {imageUsage.isInpaintMaskImage && <ListItem>{t('controlLayers.inpaintMask')}</ListItem>}
                    {imageUsage.isRasterLayerImage && <ListItem>{t('controlLayers.rasterLayer')}</ListItem>}
                    {imageUsage.isRegionalGuidanceImage && <ListItem>{t('controlLayers.regionalGuidance')}</ListItem>}
                    {imageUsage.isUpscaleImage && <ListItem>{t('ui.tabs.upscalingTab')}</ListItem>}
                    {imageUsage.isNodesImage && <ListItem>{t('ui.tabs.workflowsTab')}</ListItem>}
                  </UnorderedList>
                  <Text fontSize="sm" mt={2} color="base.300">
                    {t('gallery.featuresWillReset')}
                  </Text>
                </Box>
              )}

              {/* Confirmation text */}
              <Box>
                <Text fontSize="md" color="base.100" mb={2}>
                  {t('gallery.deleteImagePermanent')}
                </Text>
                <Text fontSize="md" color="base.100" fontWeight="semibold">
                  {t('common.areYouSure')}
                </Text>
              </Box>
            </Flex>
          </DrawerBody>

          <DrawerFooter p={0} borderTop="1px solid" borderColor="base.700">
            <Flex w="full">
              <Button onClick={handleCancel} flex={1} size="lg" colorScheme="base" variant="solid" borderRadius={0}>
                {t('common.cancel')}
              </Button>
              <Box w="1px" bg="base.700" />
              <Button onClick={handleDelete} flex={1} size="lg" colorScheme="error" variant="solid" borderRadius={0}>
                {t('common.delete')}
              </Button>
            </Flex>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </Show>
  );
});

MobileDeleteImageConfirmation.displayName = 'MobileDeleteImageConfirmation';
