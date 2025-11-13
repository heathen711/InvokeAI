// src/features/ui/components/mobile/gallery/MobileActionSheetSubmenu.tsx
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
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

interface SubmenuOption {
  label: string;
  onClick: () => void;
  isDisabled?: boolean;
}

interface MobileActionSheetSubmenuProps {
  isOpen: boolean;
  onClose: () => void;
  onBack: () => void;
  title: string;
  options: SubmenuOption[];
}

/**
 * Submenu for mobile action sheet
 * Shows a secondary drawer with sub-options and back/close buttons
 */
export const MobileActionSheetSubmenu = memo(
  ({ isOpen, onClose, onBack, title, options }: MobileActionSheetSubmenuProps) => {
    const { t } = useTranslation();

    return (
      <Drawer isOpen={isOpen} onClose={onClose} placement="bottom" portalProps={{ containerRef: undefined }}>
        <DrawerOverlay bg="blackAlpha.800" style={{ zIndex: 10000 }} />
        <DrawerContent bg="base.900" borderTopRadius="lg" maxH="70vh" style={{ zIndex: 10000 }}>
          <DrawerHeader textAlign="center" borderBottom="1px solid" borderColor="base.700" py={3}>
            <Text fontSize="md" fontWeight="semibold" color="base.100">
              {title}
            </Text>
          </DrawerHeader>

          <DrawerBody p={0} overflowY="auto">
            {options.map((option, index) => (
              <Flex
                key={index}
                as="button"
                onClick={option.isDisabled ? undefined : option.onClick}
                alignItems="center"
                gap={3}
                py={4}
                px={4}
                _hover={option.isDisabled ? {} : { bg: 'base.750' }}
                cursor={option.isDisabled ? 'not-allowed' : 'pointer'}
                opacity={option.isDisabled ? 0.5 : 1}
                w="full"
                textAlign="left"
                borderBottom={index < options.length - 1 ? '1px solid' : 'none'}
                borderColor="base.800"
              >
                <Text flex={1} color="base.100" fontSize="md">
                  {option.label}
                </Text>
              </Flex>
            ))}
          </DrawerBody>

          <DrawerFooter p={0} borderTop="1px solid" borderColor="base.700">
            <Flex w="full">
              <Button onClick={onBack} flex={1} size="lg" colorScheme="base" variant="solid" borderRadius={0}>
                ◄ {t('common.back')}
              </Button>
              <Box w="1px" bg="base.700" />
              <Button onClick={onClose} flex={1} size="lg" colorScheme="base" variant="solid" borderRadius={0}>
                {t('common.close')}
              </Button>
            </Flex>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }
);

MobileActionSheetSubmenu.displayName = 'MobileActionSheetSubmenu';
