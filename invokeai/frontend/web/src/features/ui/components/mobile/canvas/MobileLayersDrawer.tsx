import { Drawer, DrawerBody, DrawerContent, DrawerHeader, DrawerOverlay, Flex, Text } from '@invoke-ai/ui-library';
import { memo } from 'react';

interface MobileLayersDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Mobile layers drawer
 * Shows canvas layers in a bottom drawer
 */
export const MobileLayersDrawer = memo(({ isOpen, onClose }: MobileLayersDrawerProps) => {
  return (
    <Drawer isOpen={isOpen} onClose={onClose} placement="bottom">
      <DrawerOverlay />
      <DrawerContent>
        <DrawerHeader>Canvas Layers</DrawerHeader>
        <DrawerBody>
          <Flex flexDirection="column" gap={2} pb={4}>
            <Text color="base.400" fontSize="sm">
              Layer controls will integrate with ControlLayers feature
            </Text>
            {/* Future: Integrate with controlLayers Redux state */}
          </Flex>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
});

MobileLayersDrawer.displayName = 'MobileLayersDrawer';
