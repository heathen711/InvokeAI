import {
  Button,
  Flex,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  VStack,
} from '@invoke-ai/ui-library';
import { InformationalPopover } from 'common/components/InformationalPopover/InformationalPopover';
import {
  useAddControlLayer,
  useAddInpaintMask,
  useAddNewRegionalGuidanceWithARefImage,
  useAddRasterLayer,
  useAddRegionalGuidance,
} from 'features/controlLayers/hooks/addLayerHooks';
import { useIsEntityTypeEnabled } from 'features/controlLayers/hooks/useIsEntityTypeEnabled';
import { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { PiCircleDashedBold, PiFrameCornersBold, PiImageBold, PiMagicWandBold, PiPaintBrushBold } from 'react-icons/pi';

interface MobileAddLayerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Mobile-optimized add layer modal
 * Large buttons, one-handed UX, organized by category
 */
export const MobileAddLayerModal = memo(({ isOpen, onClose }: MobileAddLayerModalProps) => {
  const { t } = useTranslation();
  const addInpaintMask = useAddInpaintMask();
  const addRegionalGuidance = useAddRegionalGuidance();
  const addRasterLayer = useAddRasterLayer();
  const addControlLayer = useAddControlLayer();
  const addRegionalReferenceImage = useAddNewRegionalGuidanceWithARefImage();
  const isRegionalGuidanceEnabled = useIsEntityTypeEnabled('regional_guidance');
  const isControlLayerEnabled = useIsEntityTypeEnabled('control_layer');
  const isInpaintLayerEnabled = useIsEntityTypeEnabled('inpaint_mask');

  const handleAddInpaintMask = useCallback(() => {
    addInpaintMask();
    onClose();
  }, [addInpaintMask, onClose]);

  const handleAddRegionalGuidance = useCallback(() => {
    addRegionalGuidance();
    onClose();
  }, [addRegionalGuidance, onClose]);

  const handleAddRegionalReferenceImage = useCallback(() => {
    addRegionalReferenceImage();
    onClose();
  }, [addRegionalReferenceImage, onClose]);

  const handleAddControlLayer = useCallback(() => {
    addControlLayer();
    onClose();
  }, [addControlLayer, onClose]);

  const handleAddRasterLayer = useCallback(() => {
    addRasterLayer();
    onClose();
  }, [addRasterLayer, onClose]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="full" motionPreset="slideInBottom">
      <ModalOverlay />
      <ModalContent bg="base.900" m={0} borderRadius={0}>
        <ModalHeader fontSize="xl" borderBottomWidth={1} borderColor="base.800">
          {t('controlLayers.addLayer')}
        </ModalHeader>
        <ModalCloseButton size="lg" />
        <ModalBody p={6} pb="calc(4rem + env(safe-area-inset-bottom))">
          <VStack spacing={6} align="stretch">
            {/* Regional Section */}
            <Flex flexDirection="column" gap={3}>
              <Text fontSize="sm" fontWeight="bold" color="base.400" textTransform="uppercase" letterSpacing="wider">
                {t('controlLayers.regional')}
              </Text>
              <VStack spacing={2} align="stretch">
                <InformationalPopover feature="inpainting">
                  <Button
                    onClick={handleAddInpaintMask}
                    isDisabled={!isInpaintLayerEnabled}
                    size="xl"
                    h="64px"
                    justifyContent="flex-start"
                    leftIcon={<PiPaintBrushBold size={28} />}
                    variant="outline"
                    fontSize="lg"
                  >
                    <Flex flexDirection="column" alignItems="flex-start" flex={1} gap={1}>
                      <Text fontWeight="semibold">{t('controlLayers.inpaintMask')}</Text>
                      <Text fontSize="xs" color="base.400" fontWeight="normal">
                        Paint areas to inpaint or outpaint
                      </Text>
                    </Flex>
                  </Button>
                </InformationalPopover>

                <InformationalPopover feature="regionalGuidance">
                  <Button
                    onClick={handleAddRegionalGuidance}
                    isDisabled={!isRegionalGuidanceEnabled}
                    size="xl"
                    h="64px"
                    justifyContent="flex-start"
                    leftIcon={<PiMagicWandBold size={28} />}
                    variant="outline"
                    fontSize="lg"
                  >
                    <Flex flexDirection="column" alignItems="flex-start" flex={1} gap={1}>
                      <Text fontWeight="semibold">{t('controlLayers.regionalGuidance')}</Text>
                      <Text fontSize="xs" color="base.400" fontWeight="normal">
                        Apply prompts to specific regions
                      </Text>
                    </Flex>
                  </Button>
                </InformationalPopover>

                <InformationalPopover feature="regionalReferenceImage">
                  <Button
                    onClick={handleAddRegionalReferenceImage}
                    isDisabled={!isRegionalGuidanceEnabled}
                    size="xl"
                    h="64px"
                    justifyContent="flex-start"
                    leftIcon={<PiImageBold size={28} />}
                    variant="outline"
                    fontSize="lg"
                  >
                    <Flex flexDirection="column" alignItems="flex-start" flex={1} gap={1}>
                      <Text fontWeight="semibold">{t('controlLayers.regionalReferenceImage')}</Text>
                      <Text fontSize="xs" color="base.400" fontWeight="normal">
                        Use reference image for a region
                      </Text>
                    </Flex>
                  </Button>
                </InformationalPopover>
              </VStack>
            </Flex>

            {/* Other Layers Section */}
            <Flex flexDirection="column" gap={3}>
              <Text fontSize="sm" fontWeight="bold" color="base.400" textTransform="uppercase" letterSpacing="wider">
                {t('controlLayers.layer_other')}
              </Text>
              <VStack spacing={2} align="stretch">
                <InformationalPopover feature="controlNet">
                  <Button
                    onClick={handleAddControlLayer}
                    isDisabled={!isControlLayerEnabled}
                    size="xl"
                    h="64px"
                    justifyContent="flex-start"
                    leftIcon={<PiFrameCornersBold size={28} />}
                    variant="outline"
                    fontSize="lg"
                  >
                    <Flex flexDirection="column" alignItems="flex-start" flex={1} gap={1}>
                      <Text fontWeight="semibold">{t('controlLayers.controlLayer')}</Text>
                      <Text fontSize="xs" color="base.400" fontWeight="normal">
                        Control generation with ControlNet
                      </Text>
                    </Flex>
                  </Button>
                </InformationalPopover>

                <InformationalPopover feature="rasterLayer">
                  <Button
                    onClick={handleAddRasterLayer}
                    size="xl"
                    h="64px"
                    justifyContent="flex-start"
                    leftIcon={<PiCircleDashedBold size={28} />}
                    variant="outline"
                    fontSize="lg"
                  >
                    <Flex flexDirection="column" alignItems="flex-start" flex={1} gap={1}>
                      <Text fontWeight="semibold">{t('controlLayers.rasterLayer')}</Text>
                      <Text fontSize="xs" color="base.400" fontWeight="normal">
                        Add raster image layer
                      </Text>
                    </Flex>
                  </Button>
                </InformationalPopover>
              </VStack>
            </Flex>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
});

MobileAddLayerModal.displayName = 'MobileAddLayerModal';
