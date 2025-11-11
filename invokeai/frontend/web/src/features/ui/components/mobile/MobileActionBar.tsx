// src/features/ui/components/mobile/MobileActionBar.tsx
import { Flex } from '@invoke-ai/ui-library';
import type { ReactNode } from 'react';
import { memo } from 'react';

interface MobileActionBarProps {
  children?: ReactNode;
}

/**
 * Fixed action bar that sits above the bottom tab bar
 * Used for primary actions like "Generate" button
 */
export const MobileActionBar = memo(({ children }: MobileActionBarProps) => {
  return (
    <Flex
      as="footer"
      position="fixed"
      bottom="60px" // Above bottom tab bar
      left={0}
      right={0}
      px={4}
      py={3}
      bg="base.850"
      borderTopWidth={1}
      borderTopColor="base.700"
      zIndex={999}
      justifyContent="center"
      alignItems="center"
    >
      {children}
    </Flex>
  );
});

MobileActionBar.displayName = 'MobileActionBar';
