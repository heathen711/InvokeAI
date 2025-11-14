// src/features/ui/components/mobile/gallery/MobileActionSheetSubmenu.tsx
/* eslint-disable react/prop-types */
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
import type { FC } from 'react';
import { memo, useCallback, useState } from 'react';
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
  /** If true, options show checkmarks when selected and require Send button confirmation */
  selectionMode?: boolean;
}

interface OptionItemProps {
  option: SubmenuOption;
  index: number;
  isSelected: boolean;
  showCheckmark: boolean;
  isLoading?: boolean;
  onOptionClick: (index: number, option: SubmenuOption) => void;
}

const OptionItem: FC<OptionItemProps> = memo(
  ({ option, index, isSelected, showCheckmark, isLoading = false, onOptionClick }) => {
    const handleClick = useCallback(() => {
      onOptionClick(index, option);
    }, [index, option, onOptionClick]);

    const isDisabled = option.isDisabled || isLoading;

    return (
      <Flex
        as="button"
        onClick={handleClick}
        alignItems="center"
        gap={3}
        py={4}
        px={4}
        _hover={isDisabled ? {} : { bg: 'base.750' }}
        cursor={isDisabled ? 'not-allowed' : 'pointer'}
        opacity={isDisabled ? 0.5 : 1}
        w="full"
        textAlign="left"
        borderBottom="1px solid"
        borderColor="base.800"
        bg={isSelected ? 'base.750' : 'transparent'}
      >
        <Text flex={1} color="base.100" fontSize="md">
          {option.label}
        </Text>
        {showCheckmark && isSelected && (
          <Box fontSize="lg" color="invokeBlue.400">
            ✓
          </Box>
        )}
      </Flex>
    );
  }
);

OptionItem.displayName = 'OptionItem';

/**
 * Submenu for mobile action sheet
 * Shows a secondary drawer with sub-options and back/close buttons
 * Supports selection mode where users select an option with checkmark, then confirm with Send
 */
export const MobileActionSheetSubmenu = memo(
  ({ isOpen, onClose, onBack, title, options, selectionMode = false }: MobileActionSheetSubmenuProps) => {
    const { t } = useTranslation();
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleOptionClick = useCallback(
      (index: number, option: SubmenuOption) => {
        if (option.isDisabled) {
          return;
        }

        if (selectionMode) {
          // In selection mode, just set the checkmark
          setSelectedIndex(index);
        } else {
          // In normal mode, execute immediately
          option.onClick();
        }
      },
      [selectionMode]
    );

    const handleSend = useCallback(async () => {
      if (selectedIndex !== null && options[selectedIndex]) {
        setIsLoading(true);
        try {
          await options[selectedIndex].onClick();
        } finally {
          setIsLoading(false);
        }
      }
    }, [selectedIndex, options]);

    return (
      <Drawer isOpen={isOpen} onClose={onClose} placement="bottom">
        <DrawerOverlay bg="blackAlpha.800" />
        <DrawerContent bg="base.900" borderTopRadius="lg" maxH="70vh">
          <DrawerHeader textAlign="center" borderBottom="1px solid" borderColor="base.700" py={3}>
            <Text fontSize="md" fontWeight="semibold" color="base.100">
              {title}
            </Text>
          </DrawerHeader>

          <DrawerBody p={0} overflowY="auto">
            {options.map((option, index) => (
              <OptionItem
                key={index}
                option={option}
                index={index}
                isSelected={selectedIndex === index}
                showCheckmark={selectionMode}
                isLoading={selectionMode && isLoading}
                onOptionClick={handleOptionClick}
              />
            ))}
          </DrawerBody>

          <DrawerFooter p={0} borderTop="1px solid" borderColor="base.700">
            <Flex w="full">
              <Button
                onClick={onBack}
                flex={1}
                size="lg"
                colorScheme="base"
                variant="solid"
                borderRadius={0}
                isDisabled={selectionMode && isLoading}
              >
                ◄ {t('common.back')}
              </Button>
              <Box w="1px" bg="base.700" />
              {selectionMode ? (
                <Button
                  onClick={handleSend}
                  flex={1}
                  size="lg"
                  colorScheme="invokeBlue"
                  variant="solid"
                  borderRadius={0}
                  isDisabled={selectedIndex === null || isLoading}
                  isLoading={isLoading}
                  loadingText={t('common.send')}
                >
                  {t('common.send')}
                </Button>
              ) : (
                <Button onClick={onClose} flex={1} size="lg" colorScheme="base" variant="solid" borderRadius={0}>
                  {t('common.close')}
                </Button>
              )}
            </Flex>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }
);

MobileActionSheetSubmenu.displayName = 'MobileActionSheetSubmenu';
