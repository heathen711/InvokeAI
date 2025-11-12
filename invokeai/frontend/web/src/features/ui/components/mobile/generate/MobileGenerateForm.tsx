// src/features/ui/components/mobile/generate/MobileGenerateForm.tsx
import { Button, Flex, FormControl, FormLabel, Textarea, VStack } from '@invoke-ai/ui-library';
import { MobileModelSelector } from 'features/ui/components/mobile/generate/MobileModelSelector';
import { MobileActionBar } from 'features/ui/components/mobile/MobileActionBar';
import type { ChangeEvent } from 'react';
import { memo, useCallback, useState } from 'react';

/**
 * Generate mode settings form for mobile
 * Single scrollable form with all generation parameters
 */
export const MobileGenerateForm = memo(() => {
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');

  const handleGenerate = useCallback(() => {
    // TODO: Implement generation logic in Phase 3
    // eslint-disable-next-line no-console
    console.log('Generate:', { prompt, negativePrompt });
  }, [prompt, negativePrompt]);

  const handleModelPress = useCallback(() => {
    // TODO: Open model selector in Phase 3
    // eslint-disable-next-line no-console
    console.log('Open model selector');
  }, []);

  const handlePromptChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
  }, []);

  const handleNegativePromptChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    setNegativePrompt(e.target.value);
  }, []);

  return (
    <>
      <Flex
        flexDirection="column"
        width="full"
        height="full"
        overflow="auto"
        pb="120px" // Space for action bar + tab bar
      >
        <VStack spacing={4} p={4} width="full">
          {/* Model Selector */}
          <FormControl>
            <FormLabel>Model</FormLabel>
            <MobileModelSelector modelName="Stable Diffusion XL Base" onPress={handleModelPress} />
          </FormControl>

          {/* Prompt */}
          <FormControl>
            <FormLabel>Prompt</FormLabel>
            <Textarea
              value={prompt}
              onChange={handlePromptChange}
              placeholder="Describe what you want to generate..."
              minHeight="120px"
              resize="vertical"
            />
          </FormControl>

          {/* Negative Prompt */}
          <FormControl>
            <FormLabel>Negative Prompt</FormLabel>
            <Textarea
              value={negativePrompt}
              onChange={handleNegativePromptChange}
              placeholder="Describe what you want to avoid..."
              minHeight="80px"
              resize="vertical"
            />
          </FormControl>

          {/* TODO: Add more parameters in future tasks:
           * - Dimensions (width, height presets)
           * - Steps slider
           * - CFG Scale slider
           * - Sampler dropdown
           * - Seed controls
           * - Advanced settings
           */}
        </VStack>
      </Flex>

      {/* Fixed Action Bar */}
      <MobileActionBar>
        <Button onClick={handleGenerate} colorScheme="invokeBlue" size="lg" width="full" maxWidth="400px">
          Generate
        </Button>
      </MobileActionBar>
    </>
  );
});

MobileGenerateForm.displayName = 'MobileGenerateForm';
