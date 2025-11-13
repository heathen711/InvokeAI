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
import { useAppSelector } from 'app/store/storeHooks';
import { useDownloadItem } from 'common/hooks/useDownloadImage';
import { useImageDTOContext } from 'features/gallery/contexts/ImageDTOContext';
import { selectActiveTab } from 'features/ui/store/uiSelectors';
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

interface MobileActionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSubmenu: (submenuName: string) => void;
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
export const MobileActionSheet = memo(({ isOpen, onClose, onOpenSubmenu }: MobileActionSheetProps) => {
  const { t } = useTranslation();
  const imageDTO = useImageDTOContext();
  const tab = useAppSelector(selectActiveTab);
  const { downloadItem } = useDownloadItem();

  const handleDownload = useCallback(() => {
    downloadItem(imageDTO.image_url, imageDTO.image_name);
    onClose();
  }, [downloadItem, imageDTO, onClose]);

  const handleCopy = useCallback(async () => {
    // Copy image to clipboard
    try {
      const response = await fetch(imageDTO.image_url);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob,
        }),
      ]);
      onClose();
    } catch (error) {
      // Fallback: copy URL
      await navigator.clipboard.writeText(imageDTO.image_url);
      onClose();
    }
  }, [imageDTO, onClose]);

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
    } catch (error) {
      // User cancelled or share failed
      onClose();
    }
  }, [imageDTO, onClose]);

  const handleOpenInNewTab = useCallback(() => {
    window.open(imageDTO.image_url, '_blank');
    onClose();
  }, [imageDTO, onClose]);

  return (
    <Drawer isOpen={isOpen} onClose={onClose} placement="bottom">
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
              onClick={() => {
                // TODO: Implement star/unstar
                onClose();
              }}
            />
            <ActionItem
              icon={<PiTrash />}
              label={t('common.delete')}
              onClick={() => {
                // TODO: Implement delete with confirmation
                onClose();
              }}
            />
          </Box>

          {/* Workflow Group */}
          {(tab === 'canvas' || tab === 'generate' || tab === 'upscaling') && (
            <Box>
              <Box px={4} py={2} bg="base.800" mt={2}>
                <Text fontSize="xs" fontWeight="semibold" color="base.500" textTransform="uppercase">
                  Workflow
                </Text>
              </Box>
              <ActionItem
                icon={<PiDotsThree />}
                label="Recall Metadata"
                onClick={() => onOpenSubmenu('recall-metadata')}
                hasSubmenu
              />
              <ActionItem
                icon={<PiUploadSimple />}
                label="Send to Upscale"
                onClick={() => {
                  // TODO: Implement send to upscale
                  onClose();
                }}
              />
              {(tab === 'canvas' || tab === 'generate') && (
                <>
                  <ActionItem
                    icon={<PiImage />}
                    label="Use as Reference"
                    onClick={() => {
                      // TODO: Implement use as reference
                      onClose();
                    }}
                  />
                  <ActionItem
                    icon={<PiDotsThree />}
                    label="New Canvas from Image"
                    onClick={() => onOpenSubmenu('new-canvas')}
                    hasSubmenu
                  />
                </>
              )}
              {tab === 'canvas' && (
                <ActionItem
                  icon={<PiDotsThree />}
                  label="New Layer from Image"
                  onClick={() => onOpenSubmenu('new-layer')}
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
            <ActionItem
              icon={<PiFolders />}
              label="Change Board"
              onClick={() => {
                // TODO: Implement change board
                onClose();
              }}
            />
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
  );
});

MobileActionSheet.displayName = 'MobileActionSheet';
