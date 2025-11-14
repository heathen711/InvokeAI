import {
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  IconButton,
  Text,
} from '@invoke-ai/ui-library';
import { MobileCanvasEntityList } from 'features/ui/components/mobile/canvas/MobileCanvasEntityList';
import { memo, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PiPlusBold, PiXBold } from 'react-icons/pi';

import { MobileAddLayerModal } from './MobileAddLayerModal';

interface MobileLayersProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Mobile-optimized full-screen layers drawer
 * Large touch targets, one-handed UX
 */
export const MobileLayers = memo(({ isOpen, onClose }: MobileLayersProps) => {
  const { t } = useTranslation();
  const [isAddLayerModalOpen, setIsAddLayerModalOpen] = useState(false);

  const handleOpenAddLayerModal = useCallback(() => {
    setIsAddLayerModalOpen(true);
  }, []);

  const handleCloseAddLayerModal = useCallback(() => {
    setIsAddLayerModalOpen(false);
  }, []);

  return (
    <Drawer isOpen={isOpen} onClose={onClose} placement="bottom" size="full">
      <DrawerOverlay />
      <DrawerContent bg="base.900">
        <DrawerHeader
          borderBottomWidth={1}
          borderColor="base.800"
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          px={4}
          py={3}
        >
          <Text fontSize="xl" fontWeight="bold">
            {t('controlLayers.layer_other')}
          </Text>
          <IconButton aria-label={t('common.close')} icon={<PiXBold />} onClick={onClose} variant="ghost" size="lg" />
        </DrawerHeader>

        <DrawerBody p={0}>
          <Flex flexDirection="column" h="full">
            {/* Layers List - Scrollable */}
            <Flex flex={1} flexDirection="column" overflowY="auto" p={4} gap={3} minH={0}>
              <MobileCanvasEntityList />
            </Flex>

            {/* Bottom controls - Add Layer and Done buttons */}
            <Flex
              p={4}
              borderTopWidth={1}
              borderColor="base.800"
              bg="base.900"
              position="sticky"
              bottom={0}
              pb="calc(1rem + env(safe-area-inset-bottom))"
              gap={3}
              flexDirection="column"
            >
              <Button
                leftIcon={<PiPlusBold size={24} />}
                w="full"
                h="64px"
                size="xl"
                colorScheme="invokeBlue"
                fontSize="lg"
                onClick={handleOpenAddLayerModal}
              >
                {t('controlLayers.addLayer')}
              </Button>
              <Button w="full" h="56px" size="xl" variant="outline" fontSize="lg" onClick={onClose}>
                {t('common.done')}
              </Button>
            </Flex>
          </Flex>
        </DrawerBody>
      </DrawerContent>

      {/* Mobile Add Layer Modal */}
      <MobileAddLayerModal isOpen={isAddLayerModalOpen} onClose={handleCloseAddLayerModal} />
    </Drawer>
  );
});

MobileLayers.displayName = 'MobileLayers';
