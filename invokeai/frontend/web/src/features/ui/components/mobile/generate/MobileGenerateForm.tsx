// src/features/ui/components/mobile/generate/MobileGenerateForm.tsx
import {
  Box,
  Button,
  CompositeNumberInput,
  CompositeSlider,
  Expander,
  Flex,
  FormControl,
  FormLabel,
  IconButton,
  Select,
  Switch,
  Text,
  useDisclosure,
  VStack,
} from '@invoke-ai/ui-library';
import { NUMPY_RAND_MAX, NUMPY_RAND_MIN } from 'app/constants';
import { useAppDispatch, useAppSelector } from 'app/store/storeHooks';
import randomInt from 'common/util/randomInt';
import { RefImageList } from 'features/controlLayers/components/RefImage/RefImageList';
import { selectLoRAsSlice } from 'features/controlLayers/store/lorasSlice';
import {
  aspectRatioIdChanged,
  heightChanged,
  negativePromptChanged,
  positivePromptChanged,
  refinerModelChanged,
  selectAspectRatioID,
  selectCFGScale,
  selectCLIPSkip,
  selectHeight,
  selectModel,
  selectNegativePrompt,
  selectPositivePrompt,
  selectRefinerCFGScale,
  selectRefinerModel,
  selectRefinerNegativeAestheticScore,
  selectRefinerPositiveAestheticScore,
  selectRefinerScheduler,
  selectRefinerStart,
  selectRefinerSteps,
  selectScheduler,
  selectSeamlessXAxis,
  selectSeamlessYAxis,
  selectSeed,
  selectShouldRandomizeSeed,
  selectSteps,
  selectVAE,
  selectWidth,
  setCfgScale,
  setClipSkip,
  setRefinerCFGScale,
  setRefinerNegativeAestheticScore,
  setRefinerPositiveAestheticScore,
  setRefinerScheduler,
  setRefinerStart,
  setRefinerSteps,
  setScheduler,
  setSeamlessXAxis,
  setSeamlessYAxis,
  setSeed,
  setShouldRandomizeSeed,
  setSteps,
  vaeSelected,
  widthChanged,
} from 'features/controlLayers/store/paramsSlice';
import { isAspectRatioID, zAspectRatioID } from 'features/controlLayers/store/types';
import { LoRAList } from 'features/lora/components/LoRAList';
import LoRASelect from 'features/lora/components/LoRASelect';
import type { ParameterScheduler } from 'features/parameters/types/parameterSchemas';
import { QueueIterationsNumberInput } from 'features/queue/components/QueueIterationsNumberInput';
import { useEnqueueGenerate } from 'features/queue/hooks/useEnqueueGenerate';
import { useIsQueueMutationInProgress } from 'features/queue/hooks/useIsQueueMutationInProgress';
import { MobileBoardSelector } from 'features/ui/components/mobile/boards';
import { MobileGenerationPreview } from 'features/ui/components/mobile/generate/MobileGenerationPreview';
import { MobileModelSelector } from 'features/ui/components/mobile/generate/MobileModelSelector';
import { MobileModelSelectorModal } from 'features/ui/components/mobile/generate/MobileModelSelectorModal';
import { MobilePromptEditor } from 'features/ui/components/mobile/generate/MobilePromptEditor';
import { MobileActionBar } from 'features/ui/components/mobile/MobileActionBar';
import type { ChangeEvent } from 'react';
import { memo, useCallback, useMemo, useState } from 'react';
import { PiCaretDownBold, PiShuffleBold, PiSparkleFill } from 'react-icons/pi';
import { useRefinerModels, useVAEModels } from 'services/api/hooks/modelsByType';
import { useIsRefinerAvailable } from 'services/api/hooks/useIsRefinerAvailable';

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

const WIDTH_CONSTRAINTS = {
  sliderMin: 64,
  sliderMax: 2048,
  numberInputMin: 64,
  numberInputMax: 4096,
  fineStep: 8,
  coarseStep: 64,
};

const HEIGHT_CONSTRAINTS = {
  sliderMin: 64,
  sliderMax: 2048,
  numberInputMin: 64,
  numberInputMax: 4096,
  fineStep: 8,
  coarseStep: 64,
};

const SEED_CONSTRAINTS = {
  min: 0,
  max: 4294967295, // 2^32 - 1
  step: 1,
};

const REFINER_STEPS_CONSTRAINTS = {
  sliderMin: 1,
  sliderMax: 100,
  numberInputMin: 1,
  numberInputMax: 500,
  fineStep: 1,
  coarseStep: 1,
};

const REFINER_CFG_CONSTRAINTS = {
  sliderMin: 1,
  sliderMax: 20,
  numberInputMin: 1,
  numberInputMax: 200,
  fineStep: 0.1,
  coarseStep: 0.5,
};

const REFINER_START_CONSTRAINTS = {
  sliderMin: 0,
  sliderMax: 1,
  fineStep: 0.01,
  coarseStep: 0.05,
};

const AESTHETIC_SCORE_CONSTRAINTS = {
  sliderMin: 1,
  sliderMax: 10,
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
  const width = useAppSelector(selectWidth);
  const height = useAppSelector(selectHeight);
  const seed = useAppSelector(selectSeed);
  const scheduler = useAppSelector(selectScheduler);
  const model = useAppSelector(selectModel);
  const aspectRatioId = useAppSelector(selectAspectRatioID);
  const shouldRandomizeSeed = useAppSelector(selectShouldRandomizeSeed);
  const vaeModel = useAppSelector(selectVAE);
  const clipSkip = useAppSelector(selectCLIPSkip);
  const seamlessXAxis = useAppSelector(selectSeamlessXAxis);
  const seamlessYAxis = useAppSelector(selectSeamlessYAxis);
  const { loras } = useAppSelector(selectLoRAsSlice);

  // Refiner state
  const refinerModel = useAppSelector(selectRefinerModel);
  const refinerSteps = useAppSelector(selectRefinerSteps);
  const refinerCFGScale = useAppSelector(selectRefinerCFGScale);
  const refinerScheduler = useAppSelector(selectRefinerScheduler);
  const refinerStart = useAppSelector(selectRefinerStart);
  const refinerPositiveAestheticScore = useAppSelector(selectRefinerPositiveAestheticScore);
  const refinerNegativeAestheticScore = useAppSelector(selectRefinerNegativeAestheticScore);

  const [isModelOpen, setIsModelOpen] = useState(true);
  const [isPromptsOpen, setIsPromptsOpen] = useState(true);
  const [isGenerationOpen, setIsGenerationOpen] = useState(true);
  const [isSeedOpen, setIsSeedOpen] = useState(false);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [isRefinerOpen, setIsRefinerOpen] = useState(false);
  const [isReferenceImagesOpen, setIsReferenceImagesOpen] = useState(false);

  const [vaeModels] = useVAEModels();
  const [refinerModels] = useRefinerModels();
  const isRefinerAvailable = useIsRefinerAvailable();

  const enabledLoRAsCount = useMemo(() => loras.filter((l) => l.isEnabled).length, [loras]);

  const enqueueGenerate = useEnqueueGenerate();
  const isLoading = useIsQueueMutationInProgress();
  const canGenerate = model !== null && !isLoading;
  const modelSelectorModal = useDisclosure();
  const positivePromptEditor = useDisclosure();
  const negativePromptEditor = useDisclosure();

  const handleGenerate = useCallback(() => {
    enqueueGenerate(false);
  }, [enqueueGenerate]);

  const handleModelPress = useCallback(() => {
    modelSelectorModal.onOpen();
  }, [modelSelectorModal]);

  const handlePromptChange = useCallback(
    (value: string) => {
      dispatch(positivePromptChanged(value));
    },
    [dispatch]
  );

  const handleNegativePromptChange = useCallback(
    (value: string) => {
      dispatch(negativePromptChanged(value));
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

  const handleWidthChange = useCallback(
    (value: number) => {
      dispatch(widthChanged({ width: value }));
    },
    [dispatch]
  );

  const handleHeightChange = useCallback(
    (value: number) => {
      dispatch(heightChanged({ height: value }));
    },
    [dispatch]
  );

  const handleSeedChange = useCallback(
    (value: number) => {
      dispatch(setSeed(value));
    },
    [dispatch]
  );

  const handleSchedulerChange = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      dispatch(setScheduler(e.target.value as ParameterScheduler));
    },
    [dispatch]
  );

  const handleAspectRatioChange = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      if (!isAspectRatioID(e.target.value)) {
        return;
      }
      dispatch(aspectRatioIdChanged({ id: e.target.value }));
    },
    [dispatch]
  );

  const handleRandomizeSeedToggle = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      dispatch(setShouldRandomizeSeed(e.target.checked));
    },
    [dispatch]
  );

  const handleShuffleSeed = useCallback(() => {
    dispatch(setSeed(randomInt(NUMPY_RAND_MIN, NUMPY_RAND_MAX)));
  }, [dispatch]);

  const handleVAEChange = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value;
      if (value === 'auto') {
        dispatch(vaeSelected(null));
      } else {
        const vaeConfig = vaeModels.find((config) => config.key === value);
        if (vaeConfig) {
          dispatch(vaeSelected(vaeConfig));
        }
      }
    },
    [dispatch, vaeModels]
  );

  const handleClipSkipChange = useCallback(
    (value: number) => {
      dispatch(setClipSkip(value));
    },
    [dispatch]
  );

  const handleSeamlessXToggle = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      dispatch(setSeamlessXAxis(e.target.checked));
    },
    [dispatch]
  );

  const handleSeamlessYToggle = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      dispatch(setSeamlessYAxis(e.target.checked));
    },
    [dispatch]
  );

  const handleModelToggle = useCallback(() => {
    setIsModelOpen((prev) => !prev);
  }, []);

  const handlePromptsToggle = useCallback(() => {
    setIsPromptsOpen((prev) => !prev);
  }, []);

  const handleGenerationToggle = useCallback(() => {
    setIsGenerationOpen((prev) => !prev);
  }, []);

  const handleSeedToggle = useCallback(() => {
    setIsSeedOpen((prev) => !prev);
  }, []);

  const handleAdvancedToggle = useCallback(() => {
    setIsAdvancedOpen((prev) => !prev);
  }, []);

  const handleRefinerToggle = useCallback(() => {
    setIsRefinerOpen((prev) => !prev);
  }, []);

  const handleReferenceImagesToggle = useCallback(() => {
    setIsReferenceImagesOpen((prev) => !prev);
  }, []);

  const handleRefinerModelChange = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value;
      if (value === 'none') {
        dispatch(refinerModelChanged(null));
      } else {
        const refinerConfig = refinerModels.find((config) => config.key === value);
        if (refinerConfig) {
          dispatch(
            refinerModelChanged({
              key: refinerConfig.key,
              hash: refinerConfig.hash,
              name: refinerConfig.name,
              base: refinerConfig.base,
              type: refinerConfig.type,
            })
          );
        }
      }
    },
    [dispatch, refinerModels]
  );

  const handleRefinerStepsChange = useCallback(
    (value: number) => {
      dispatch(setRefinerSteps(value));
    },
    [dispatch]
  );

  const handleRefinerCFGScaleChange = useCallback(
    (value: number) => {
      dispatch(setRefinerCFGScale(value));
    },
    [dispatch]
  );

  const handleRefinerSchedulerChange = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      dispatch(setRefinerScheduler(e.target.value as ParameterScheduler));
    },
    [dispatch]
  );

  const handleRefinerStartChange = useCallback(
    (value: number) => {
      dispatch(setRefinerStart(value));
    },
    [dispatch]
  );

  const handleRefinerPositiveAestheticScoreChange = useCallback(
    (value: number) => {
      dispatch(setRefinerPositiveAestheticScore(value));
    },
    [dispatch]
  );

  const handleRefinerNegativeAestheticScoreChange = useCallback(
    (value: number) => {
      dispatch(setRefinerNegativeAestheticScore(value));
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
          {/* Generation Preview */}
          <MobileGenerationPreview />

          {/* Model & LoRAs Section */}
          <Expander
            label={`Model & LoRAs${enabledLoRAsCount > 0 ? ` (${enabledLoRAsCount} LoRAs)` : ''}`}
            isOpen={isModelOpen}
            onToggle={handleModelToggle}
          >
            <VStack spacing={4} pt={4}>
              <FormControl>
                <FormLabel>Model</FormLabel>
                <MobileModelSelector modelName={model?.name ?? 'No model selected'} onPress={handleModelPress} />
              </FormControl>

              <FormControl w="full">
                <FormLabel>LoRAs</FormLabel>
                <VStack spacing={3} w="full">
                  <LoRASelect />
                  <LoRAList />
                </VStack>
              </FormControl>
            </VStack>
          </Expander>

          {/* Prompts Section */}
          <Expander label="Prompts" isOpen={isPromptsOpen} onToggle={handlePromptsToggle}>
            <VStack spacing={4} pt={4}>
              <FormControl>
                <FormLabel>Positive Prompt</FormLabel>
                <Box
                  onClick={positivePromptEditor.onOpen}
                  cursor="pointer"
                  p={3}
                  borderRadius="md"
                  borderWidth={1}
                  borderColor="base.700"
                  bg="base.850"
                  minHeight="120px"
                  _hover={{
                    borderColor: 'base.600',
                  }}
                >
                  {positivePrompt ? (
                    <Text fontSize="sm" color="base.200" noOfLines={5}>
                      {positivePrompt}
                    </Text>
                  ) : (
                    <Text fontSize="sm" color="base.500">
                      Tap to describe what you want to generate...
                    </Text>
                  )}
                </Box>
              </FormControl>

              <FormControl>
                <FormLabel>Negative Prompt</FormLabel>
                <Box
                  onClick={negativePromptEditor.onOpen}
                  cursor="pointer"
                  p={3}
                  borderRadius="md"
                  borderWidth={1}
                  borderColor="base.700"
                  bg="base.850"
                  minHeight="80px"
                  _hover={{
                    borderColor: 'base.600',
                  }}
                >
                  {negativePrompt ? (
                    <Text fontSize="sm" color="base.200" noOfLines={3}>
                      {negativePrompt}
                    </Text>
                  ) : (
                    <Text fontSize="sm" color="base.500">
                      Tap to describe what you want to avoid...
                    </Text>
                  )}
                </Box>
              </FormControl>
            </VStack>
          </Expander>

          {/* Generation Settings Section */}
          <Expander label="Generation Settings" isOpen={isGenerationOpen} onToggle={handleGenerationToggle}>
            <VStack spacing={4} pt={4}>
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

              <FormControl>
                <FormLabel>Width: {width}</FormLabel>
                <CompositeSlider
                  value={width}
                  onChange={handleWidthChange}
                  min={WIDTH_CONSTRAINTS.sliderMin}
                  max={WIDTH_CONSTRAINTS.sliderMax}
                  step={WIDTH_CONSTRAINTS.coarseStep}
                  fineStep={WIDTH_CONSTRAINTS.fineStep}
                />
                <CompositeNumberInput
                  value={width}
                  onChange={handleWidthChange}
                  min={WIDTH_CONSTRAINTS.numberInputMin}
                  max={WIDTH_CONSTRAINTS.numberInputMax}
                  step={WIDTH_CONSTRAINTS.coarseStep}
                  fineStep={WIDTH_CONSTRAINTS.fineStep}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Height: {height}</FormLabel>
                <CompositeSlider
                  value={height}
                  onChange={handleHeightChange}
                  min={HEIGHT_CONSTRAINTS.sliderMin}
                  max={HEIGHT_CONSTRAINTS.sliderMax}
                  step={HEIGHT_CONSTRAINTS.coarseStep}
                  fineStep={HEIGHT_CONSTRAINTS.fineStep}
                />
                <CompositeNumberInput
                  value={height}
                  onChange={handleHeightChange}
                  min={HEIGHT_CONSTRAINTS.numberInputMin}
                  max={HEIGHT_CONSTRAINTS.numberInputMax}
                  step={HEIGHT_CONSTRAINTS.coarseStep}
                  fineStep={HEIGHT_CONSTRAINTS.fineStep}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Aspect Ratio</FormLabel>
                <Select value={aspectRatioId} onChange={handleAspectRatioChange} size="lg" icon={<PiCaretDownBold />}>
                  {zAspectRatioID.options.map((ratio) => (
                    <option key={ratio} value={ratio}>
                      {ratio}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Scheduler</FormLabel>
                <Select value={scheduler} onChange={handleSchedulerChange} size="lg">
                  <option value="euler">Euler</option>
                  <option value="euler_a">Euler A</option>
                  <option value="dpmpp_2m">DPM++ 2M</option>
                  <option value="dpmpp_2m_k">DPM++ 2M Karras</option>
                  <option value="dpmpp_sde">DPM++ SDE</option>
                  <option value="dpmpp_sde_k">DPM++ SDE Karras</option>
                  <option value="heun">Heun</option>
                  <option value="lms">LMS</option>
                  <option value="ddim">DDIM</option>
                  <option value="ddpm">DDPM</option>
                  <option value="pndm">PNDM</option>
                  <option value="unipc">UniPC</option>
                </Select>
              </FormControl>
            </VStack>
          </Expander>

          {/* Seed Section */}
          <Expander label="Seed" isOpen={isSeedOpen} onToggle={handleSeedToggle}>
            <VStack spacing={4} pt={4}>
              <FormControl>
                <Flex justifyContent="space-between" alignItems="center" mb={2}>
                  <FormLabel mb={0}>Seed</FormLabel>
                  <Flex gap={2} alignItems="center">
                    <FormControl display="flex" alignItems="center" width="auto">
                      <FormLabel htmlFor="random-seed" mb={0} fontSize="sm" mr={2}>
                        Random
                      </FormLabel>
                      <Switch
                        id="random-seed"
                        size="sm"
                        isChecked={shouldRandomizeSeed}
                        onChange={handleRandomizeSeedToggle}
                      />
                    </FormControl>
                    <IconButton
                      aria-label="Shuffle seed"
                      icon={<PiShuffleBold />}
                      onClick={handleShuffleSeed}
                      isDisabled={shouldRandomizeSeed}
                      size="sm"
                      variant="ghost"
                    />
                  </Flex>
                </Flex>
                <CompositeNumberInput
                  value={seed}
                  onChange={handleSeedChange}
                  min={SEED_CONSTRAINTS.min}
                  max={SEED_CONSTRAINTS.max}
                  step={SEED_CONSTRAINTS.step}
                  isDisabled={shouldRandomizeSeed}
                />
              </FormControl>
            </VStack>
          </Expander>

          {/* Advanced Settings Section */}
          <Expander label="Advanced" isOpen={isAdvancedOpen} onToggle={handleAdvancedToggle}>
            <VStack spacing={4} pt={4}>
              <FormControl>
                <FormLabel>VAE</FormLabel>
                <Select value={vaeModel?.key ?? 'auto'} onChange={handleVAEChange} size="lg" icon={<PiCaretDownBold />}>
                  <option value="auto">Auto</option>
                  {vaeModels.map((config) => (
                    <option key={config.key} value={config.key}>
                      {config.name}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Clip Skip: {clipSkip}</FormLabel>
                <CompositeSlider value={clipSkip} onChange={handleClipSkipChange} min={0} max={12} step={1} />
                <CompositeNumberInput value={clipSkip} onChange={handleClipSkipChange} min={0} max={12} step={1} />
              </FormControl>

              <FormControl display="flex" alignItems="center" justifyContent="space-between">
                <FormLabel mb={0}>Seamless X-Axis</FormLabel>
                <Switch isChecked={seamlessXAxis} onChange={handleSeamlessXToggle} />
              </FormControl>

              <FormControl display="flex" alignItems="center" justifyContent="space-between">
                <FormLabel mb={0}>Seamless Y-Axis</FormLabel>
                <Switch isChecked={seamlessYAxis} onChange={handleSeamlessYToggle} />
              </FormControl>
            </VStack>
          </Expander>

          {/* Refiner Settings Section (SDXL only) */}
          <Expander
            label={`Refiner${refinerModel ? ` (${refinerModel.name})` : ''}`}
            isOpen={isRefinerOpen}
            onToggle={handleRefinerToggle}
          >
            <VStack spacing={4} pt={4}>
              {!isRefinerAvailable && (
                <FormControl>
                  <FormLabel color="base.400" fontSize="sm" textAlign="center">
                    No refiner models installed
                  </FormLabel>
                </FormControl>
              )}

              {isRefinerAvailable && (
                <>
                  <FormControl>
                    <FormLabel>Refiner Model</FormLabel>
                    <Select
                      value={refinerModel?.key ?? 'none'}
                      onChange={handleRefinerModelChange}
                      size="lg"
                      icon={<PiCaretDownBold />}
                    >
                      <option value="none">None</option>
                      {refinerModels.map((config) => (
                        <option key={config.key} value={config.key}>
                          {config.name}
                        </option>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl isDisabled={!refinerModel}>
                    <FormLabel>Refiner Steps: {refinerSteps}</FormLabel>
                    <CompositeSlider
                      value={refinerSteps}
                      onChange={handleRefinerStepsChange}
                      min={REFINER_STEPS_CONSTRAINTS.sliderMin}
                      max={REFINER_STEPS_CONSTRAINTS.sliderMax}
                      step={REFINER_STEPS_CONSTRAINTS.coarseStep}
                      fineStep={REFINER_STEPS_CONSTRAINTS.fineStep}
                    />
                    <CompositeNumberInput
                      value={refinerSteps}
                      onChange={handleRefinerStepsChange}
                      min={REFINER_STEPS_CONSTRAINTS.numberInputMin}
                      max={REFINER_STEPS_CONSTRAINTS.numberInputMax}
                      step={REFINER_STEPS_CONSTRAINTS.coarseStep}
                      fineStep={REFINER_STEPS_CONSTRAINTS.fineStep}
                    />
                  </FormControl>

                  <FormControl isDisabled={!refinerModel}>
                    <FormLabel>Refiner CFG Scale: {refinerCFGScale.toFixed(1)}</FormLabel>
                    <CompositeSlider
                      value={refinerCFGScale}
                      onChange={handleRefinerCFGScaleChange}
                      min={REFINER_CFG_CONSTRAINTS.sliderMin}
                      max={REFINER_CFG_CONSTRAINTS.sliderMax}
                      step={REFINER_CFG_CONSTRAINTS.coarseStep}
                      fineStep={REFINER_CFG_CONSTRAINTS.fineStep}
                    />
                    <CompositeNumberInput
                      value={refinerCFGScale}
                      onChange={handleRefinerCFGScaleChange}
                      min={REFINER_CFG_CONSTRAINTS.numberInputMin}
                      max={REFINER_CFG_CONSTRAINTS.numberInputMax}
                      step={REFINER_CFG_CONSTRAINTS.coarseStep}
                      fineStep={REFINER_CFG_CONSTRAINTS.fineStep}
                    />
                  </FormControl>

                  <FormControl isDisabled={!refinerModel}>
                    <FormLabel>Refiner Scheduler</FormLabel>
                    <Select
                      value={refinerScheduler}
                      onChange={handleRefinerSchedulerChange}
                      size="lg"
                      icon={<PiCaretDownBold />}
                    >
                      <option value="euler">Euler</option>
                      <option value="euler_a">Euler A</option>
                      <option value="dpmpp_2m">DPM++ 2M</option>
                      <option value="dpmpp_2m_k">DPM++ 2M Karras</option>
                      <option value="dpmpp_sde">DPM++ SDE</option>
                      <option value="dpmpp_sde_k">DPM++ SDE Karras</option>
                      <option value="heun">Heun</option>
                      <option value="lms">LMS</option>
                      <option value="ddim">DDIM</option>
                      <option value="ddpm">DDPM</option>
                      <option value="pndm">PNDM</option>
                      <option value="unipc">UniPC</option>
                    </Select>
                  </FormControl>

                  <FormControl isDisabled={!refinerModel}>
                    <FormLabel>Refiner Start: {refinerStart.toFixed(2)}</FormLabel>
                    <CompositeSlider
                      value={refinerStart}
                      onChange={handleRefinerStartChange}
                      min={REFINER_START_CONSTRAINTS.sliderMin}
                      max={REFINER_START_CONSTRAINTS.sliderMax}
                      step={REFINER_START_CONSTRAINTS.coarseStep}
                      fineStep={REFINER_START_CONSTRAINTS.fineStep}
                    />
                    <CompositeNumberInput
                      value={refinerStart}
                      onChange={handleRefinerStartChange}
                      min={REFINER_START_CONSTRAINTS.sliderMin}
                      max={REFINER_START_CONSTRAINTS.sliderMax}
                      step={REFINER_START_CONSTRAINTS.coarseStep}
                      fineStep={REFINER_START_CONSTRAINTS.fineStep}
                    />
                  </FormControl>

                  <FormControl isDisabled={!refinerModel}>
                    <FormLabel>Positive Aesthetic Score: {refinerPositiveAestheticScore.toFixed(1)}</FormLabel>
                    <CompositeSlider
                      value={refinerPositiveAestheticScore}
                      onChange={handleRefinerPositiveAestheticScoreChange}
                      min={AESTHETIC_SCORE_CONSTRAINTS.sliderMin}
                      max={AESTHETIC_SCORE_CONSTRAINTS.sliderMax}
                      step={AESTHETIC_SCORE_CONSTRAINTS.coarseStep}
                      fineStep={AESTHETIC_SCORE_CONSTRAINTS.fineStep}
                    />
                    <CompositeNumberInput
                      value={refinerPositiveAestheticScore}
                      onChange={handleRefinerPositiveAestheticScoreChange}
                      min={AESTHETIC_SCORE_CONSTRAINTS.sliderMin}
                      max={AESTHETIC_SCORE_CONSTRAINTS.sliderMax}
                      step={AESTHETIC_SCORE_CONSTRAINTS.coarseStep}
                      fineStep={AESTHETIC_SCORE_CONSTRAINTS.fineStep}
                    />
                  </FormControl>

                  <FormControl isDisabled={!refinerModel}>
                    <FormLabel>Negative Aesthetic Score: {refinerNegativeAestheticScore.toFixed(1)}</FormLabel>
                    <CompositeSlider
                      value={refinerNegativeAestheticScore}
                      onChange={handleRefinerNegativeAestheticScoreChange}
                      min={AESTHETIC_SCORE_CONSTRAINTS.sliderMin}
                      max={AESTHETIC_SCORE_CONSTRAINTS.sliderMax}
                      step={AESTHETIC_SCORE_CONSTRAINTS.coarseStep}
                      fineStep={AESTHETIC_SCORE_CONSTRAINTS.fineStep}
                    />
                    <CompositeNumberInput
                      value={refinerNegativeAestheticScore}
                      onChange={handleRefinerNegativeAestheticScoreChange}
                      min={AESTHETIC_SCORE_CONSTRAINTS.sliderMin}
                      max={AESTHETIC_SCORE_CONSTRAINTS.sliderMax}
                      step={AESTHETIC_SCORE_CONSTRAINTS.coarseStep}
                      fineStep={AESTHETIC_SCORE_CONSTRAINTS.fineStep}
                    />
                  </FormControl>
                </>
              )}
            </VStack>
          </Expander>

          {/* Reference Images Section */}
          <Expander label="Reference Images" isOpen={isReferenceImagesOpen} onToggle={handleReferenceImagesToggle}>
            <VStack spacing={4} pt={4}>
              <RefImageList />
            </VStack>
          </Expander>
        </VStack>
      </Flex>

      {/* Fixed Action Bar */}
      <MobileActionBar>
        <Flex pos="relative" w="full" maxWidth="400px" mx="auto" flexDirection="column" gap={3}>
          {/* Board selector - above Generate button for one-handed reach */}
          <MobileBoardSelector />

          <Flex pos="relative" w="full" pr="72px">
            <QueueIterationsNumberInput />
            <Button
              onClick={handleGenerate}
              isLoading={isLoading}
              isDisabled={!canGenerate}
              colorScheme="invokeBlue"
              size="lg"
              w="full"
              flexShrink={0}
              leftIcon={<PiSparkleFill />}
            >
              {model ? 'Generate' : 'Select Model First'}
            </Button>
          </Flex>
        </Flex>
      </MobileActionBar>

      {/* Model Selector Modal */}
      <MobileModelSelectorModal isOpen={modelSelectorModal.isOpen} onClose={modelSelectorModal.onClose} />

      {/* Positive Prompt Editor */}
      <MobilePromptEditor
        isOpen={positivePromptEditor.isOpen}
        onClose={positivePromptEditor.onClose}
        label="Positive Prompt"
        value={positivePrompt}
        onChange={handlePromptChange}
        placeholder="Describe what you want to generate..."
      />

      {/* Negative Prompt Editor */}
      <MobilePromptEditor
        isOpen={negativePromptEditor.isOpen}
        onClose={negativePromptEditor.onClose}
        label="Negative Prompt"
        value={negativePrompt ?? ''}
        onChange={handleNegativePromptChange}
        placeholder="Describe what you want to avoid..."
      />
    </>
  );
});

MobileGenerateForm.displayName = 'MobileGenerateForm';
