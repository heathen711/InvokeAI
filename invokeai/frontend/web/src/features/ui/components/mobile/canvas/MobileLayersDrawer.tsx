import { Flex, Modal, ModalBody, ModalContent, ModalHeader, ModalOverlay, Text } from '@invoke-ai/ui-library';
import { memo } from 'react';

interface MobileLayersDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Mobile layers drawer
 * Shows canvas layers in a modal drawer
 */
export const MobileLayersDrawer = memo(({ isOpen, onClose }: MobileLayersDrawerProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="full">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Canvas Layers</ModalHeader>
        <ModalBody>
          <Flex flexDirection="column" gap={2} pb={4}>
            <Text color="base.400" fontSize="sm">
              Layer controls will integrate with ControlLayers feature
            </Text>
            {/* Future: Integrate with controlLayers Redux state */}
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
});

MobileLayersDrawer.displayName = 'MobileLayersDrawer';
