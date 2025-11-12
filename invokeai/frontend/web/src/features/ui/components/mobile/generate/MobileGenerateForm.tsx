// src/features/ui/components/mobile/generate/MobileGenerateForm.tsx
import {
  Button,
  CompositeNumberInput,
  CompositeSlider,
  Flex,
  FormControl,
  FormLabel,
  Textarea,
  VStack,
} from '@invoke-ai/ui-library';
import { useAppDispatch, useAppSelector } from 'app/store/storeHooks';
import {
  negativePromptChanged,
  positivePromptChanged,
  selectCFGScale,
  selectModel,
  selectNegativePrompt,
  selectPositivePrompt,
  selectSteps,
  setCfgScale,
  setSteps,
} from 'features/controlLayers/store/paramsSlice';
import { useEnqueueGenerate } from 'features/queue/hooks/useEnqueueGenerate';
import { useIsQueueMutationInProgress } from 'features/queue/hooks/useIsQueueMutationInProgress';
import { MobileModelSelector } from 'features/ui/components/mobile/generate/MobileModelSelector';
import { MobileActionBar } from 'features/ui/components/mobile/MobileActionBar';
import type { ChangeEvent } from 'react';
import { memo, useCallback } from 'react';
import { PiSparkleFill } from 'react-icons/pi';

const STEPS_CONSTRAINTS = {
  initial: 30,
  sliderMin: 1,
  sliderMax: 100,
  numberInputMin: 1,
  numberInputMax: 500,
  fineStep: 1,
  coarseStep: 1,
};

const CFG_CONSTRAINTS = {
  initial: 7,
  sliderMin: 1,
  sliderMax: 20,
  numberInputMin: 1,
  numberInputMax: 200,
  fineStep: 0.1,
  coarseStep: 0.5,
};

/**
 * Generate mode settings form for mobile
 * Single scrollable form with all generation parameters
 */
export const MobileGenerateForm = memo(() => {
  const dispatch = useAppDispatch();
  const positivePrompt = useAppSelector(selectPositivePrompt);
  const negativePrompt = useAppSelector(selectNegativePrompt);
  const steps = useAppSelector(selectSteps);
  const cfgScale = useAppSelector(selectCFGScale);
  const model = useAppSelector(selectModel);

  const enqueueGenerate = useEnqueueGenerate();
  const isLoading = useIsQueueMutationInProgress();
  const canGenerate = model !== null && !isLoading;

  const handleGenerate = useCallback(() => {
    enqueueGenerate(false);
  }, [enqueueGenerate]);

  const handleModelPress = useCallback(() => {
    // TODO: Open model selector modal in Phase 5 Task 2
    // eslint-disable-next-line no-console
    console.log('Open model selector');
  }, []);

  const handlePromptChange = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      dispatch(positivePromptChanged(e.target.value));
    },
    [dispatch]
  );

  const handleNegativePromptChange = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      dispatch(negativePromptChanged(e.target.value));
    },
    [dispatch]
  );

  const handleStepsChange = useCallback(
    (value: number) => {
      dispatch(setSteps(value));
    },
    [dispatch]
  );

  const handleCfgScaleChange = useCallback(
    (value: number) => {
      dispatch(setCfgScale(value));
    },
    [dispatch]
  );

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
              value={positivePrompt}
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
              value={negativePrompt ?? ''}
              onChange={handleNegativePromptChange}
              placeholder="Describe what you want to avoid..."
              minHeight="80px"
              resize="vertical"
            />
          </FormControl>

          {/* Steps slider */}
          <FormControl>
            <FormLabel>Steps: {steps}</FormLabel>
            <CompositeSlider
              value={steps}
              defaultValue={STEPS_CONSTRAINTS.initial}
              onChange={handleStepsChange}
              min={STEPS_CONSTRAINTS.sliderMin}
              max={STEPS_CONSTRAINTS.sliderMax}
              step={STEPS_CONSTRAINTS.coarseStep}
              fineStep={STEPS_CONSTRAINTS.fineStep}
            />
            <CompositeNumberInput
              value={steps}
              defaultValue={STEPS_CONSTRAINTS.initial}
              onChange={handleStepsChange}
              min={STEPS_CONSTRAINTS.numberInputMin}
              max={STEPS_CONSTRAINTS.numberInputMax}
              step={STEPS_CONSTRAINTS.coarseStep}
              fineStep={STEPS_CONSTRAINTS.fineStep}
            />
          </FormControl>

          {/* CFG Scale slider */}
          <FormControl>
            <FormLabel>CFG Scale: {cfgScale.toFixed(1)}</FormLabel>
            <CompositeSlider
              value={cfgScale}
              defaultValue={CFG_CONSTRAINTS.initial}
              onChange={handleCfgScaleChange}
              min={CFG_CONSTRAINTS.sliderMin}
              max={CFG_CONSTRAINTS.sliderMax}
              step={CFG_CONSTRAINTS.coarseStep}
              fineStep={CFG_CONSTRAINTS.fineStep}
            />
            <CompositeNumberInput
              value={cfgScale}
              defaultValue={CFG_CONSTRAINTS.initial}
              onChange={handleCfgScaleChange}
              min={CFG_CONSTRAINTS.numberInputMin}
              max={CFG_CONSTRAINTS.numberInputMax}
              step={CFG_CONSTRAINTS.coarseStep}
              fineStep={CFG_CONSTRAINTS.fineStep}
            />
          </FormControl>

          {/* TODO: Add more parameters in future tasks:
           * - Dimensions (width, height presets)
           * - Sampler dropdown
           * - Seed controls
           * - Advanced settings
           */}
        </VStack>
      </Flex>

      {/* Fixed Action Bar */}
      <MobileActionBar>
        <Button
          onClick={handleGenerate}
          isLoading={isLoading}
          isDisabled={!canGenerate}
          colorScheme="invokeBlue"
          size="lg"
          width="full"
          maxWidth="400px"
          leftIcon={<PiSparkleFill />}
        >
          {model ? 'Generate' : 'Select Model First'}
        </Button>
      </MobileActionBar>
    </>
  );
});

MobileGenerateForm.displayName = 'MobileGenerateForm';
