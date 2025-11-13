// src/features/ui/components/mobile/gallery/MobileImageViewerControls.tsx
import { Button, Flex, IconButton } from '@invoke-ai/ui-library';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { PiCaretLeft, PiCaretRight, PiDotsThree } from 'react-icons/pi';

interface MobileImageViewerControlsProps {
  visible: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onClose: () => void;
  onMenu: () => void;
  canGoPrevious: boolean;
  canGoNext: boolean;
}

/**
 * Auto-hiding bottom control bar for mobile image viewer
 * Layout: [Previous] [Menu] [Close] [Next] - 4 equal sections
 */
export const MobileImageViewerControls = memo(
  ({ visible, onPrevious, onNext, onClose, onMenu, canGoPrevious, canGoNext }: MobileImageViewerControlsProps) => {
    const { t } = useTranslation();

    return (
      <Flex
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        bg="blackAlpha.800"
        opacity={visible ? 1 : 0}
        pointerEvents={visible ? 'auto' : 'none'}
        transition="opacity 0.2s ease-in-out"
        borderTop="1px solid"
        borderColor="whiteAlpha.200"
        pb="env(safe-area-inset-bottom)" // iOS safe area
      >
        <IconButton
          aria-label="Previous image"
          icon={<PiCaretLeft size={24} />}
          onClick={onPrevious}
          isDisabled={!canGoPrevious}
          variant="ghost"
          colorScheme="base"
          size="lg"
          flex={1}
          height="60px"
          borderRadius={0}
          opacity={canGoPrevious ? 1 : 0.4}
          _hover={{ bg: 'whiteAlpha.200' }}
        />
        <IconButton
          aria-label="Open menu"
          icon={<PiDotsThree size={24} />}
          onClick={onMenu}
          variant="ghost"
          colorScheme="base"
          size="lg"
          flex={1}
          height="60px"
          borderRadius={0}
          _hover={{ bg: 'whiteAlpha.200' }}
        />
        <Button
          aria-label="Close viewer"
          onClick={onClose}
          variant="ghost"
          colorScheme="base"
          size="lg"
          flex={1}
          height="60px"
          borderRadius={0}
          _hover={{ bg: 'whiteAlpha.200' }}
        >
          {t('common.close')}
        </Button>
        <IconButton
          aria-label="Next image"
          icon={<PiCaretRight size={24} />}
          onClick={onNext}
          isDisabled={!canGoNext}
          variant="ghost"
          colorScheme="base"
          size="lg"
          flex={1}
          height="60px"
          borderRadius={0}
          opacity={canGoNext ? 1 : 0.4}
          _hover={{ bg: 'whiteAlpha.200' }}
        />
      </Flex>
    );
  }
);

MobileImageViewerControls.displayName = 'MobileImageViewerControls';
