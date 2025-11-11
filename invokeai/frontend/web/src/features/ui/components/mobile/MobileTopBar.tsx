// src/features/ui/components/mobile/MobileTopBar.tsx
import { Flex } from '@invoke-ai/ui-library';
import type { ReactNode } from 'react';
import { memo } from 'react';

interface MobileTopBarProps {
  children?: ReactNode;
}

export const MobileTopBar = memo(({ children }: MobileTopBarProps) => {
  return (
    <Flex
      as="header"
      width="full"
      height="56px"
      px={4}
      bg="base.850"
      borderBottomWidth={1}
      borderBottomColor="base.700"
      alignItems="center"
      flexShrink={0}
    >
      {children}
    </Flex>
  );
});

MobileTopBar.displayName = 'MobileTopBar';
