// src/features/ui/components/mobile/generate/MobileModelSelector.tsx
import { Button, Flex, Image, Text } from '@invoke-ai/ui-library';
import type { MouseEventHandler } from 'react';
import { memo } from 'react';
import { PiCaretDown } from 'react-icons/pi';

interface MobileModelSelectorProps {
  modelName: string;
  modelImage?: string;
  onPress: MouseEventHandler<HTMLButtonElement>;
}

/**
 * Model selector button for Generate mode
 * Shows model thumbnail and name, opens model selection modal on press
 */
export const MobileModelSelector = memo(({ modelName, modelImage, onPress }: MobileModelSelectorProps) => {
  return (
    <Button onClick={onPress} width="full" height="auto" variant="outline" justifyContent="space-between" p={3}>
      <Flex gap={3} alignItems="center" flex={1}>
        {modelImage && <Image src={modelImage} alt={modelName} boxSize="40px" borderRadius="md" objectFit="cover" />}
        <Text fontSize="md" fontWeight="medium" noOfLines={1}>
          {modelName}
        </Text>
      </Flex>
      <PiCaretDown size={20} />
    </Button>
  );
});

MobileModelSelector.displayName = 'MobileModelSelector';
