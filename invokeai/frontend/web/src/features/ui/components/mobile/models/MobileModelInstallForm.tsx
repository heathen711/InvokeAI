import { Box, Button, Flex, FormControl, FormLabel, Input, Text, useToast } from '@invoke-ai/ui-library';
import { type ChangeEvent, memo, useCallback, useState } from 'react';
import { PiArrowLeftBold, PiDownloadBold } from 'react-icons/pi';
import { useInstallModelMutation } from 'services/api/endpoints/models';

interface MobileModelInstallFormProps {
  onBack: () => void;
  onSuccess: () => void;
}

/**
 * Mobile model install form
 * Install models via URL or HuggingFace
 */
export const MobileModelInstallForm = memo(({ onBack, onSuccess }: MobileModelInstallFormProps) => {
  const [source, setSource] = useState('');
  const [installModel, { isLoading }] = useInstallModelMutation();
  const toast = useToast();

  const handleSourceChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setSource(e.target.value);
  }, []);

  const handleExampleSDXLTurbo = useCallback(() => {
    setSource('stabilityai/sdxl-turbo');
  }, []);

  const handleExampleSD15 = useCallback(() => {
    setSource('runwayml/stable-diffusion-v1-5');
  }, []);

  const handleInstall = useCallback(async () => {
    if (!source.trim()) {
      toast({
        title: 'Invalid Input',
        description: 'Please enter a model URL or HuggingFace repo',
        status: 'error',
      });
      return;
    }

    try {
      // The API backend handles parsing URL vs HuggingFace repo ID
      await installModel({
        source: source.trim(),
        config: {},
      }).unwrap();

      toast({
        title: 'Installation Started',
        description: 'Model installation has been queued',
        status: 'success',
      });

      setSource('');
      onSuccess();
    } catch (error) {
      toast({
        title: 'Installation Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        status: 'error',
      });
    }
  }, [source, installModel, toast, onSuccess]);

  return (
    <Flex flexDirection="column" height="full" overflow="hidden">
      {/* Header */}
      <Flex p={4} borderBottomWidth={1} borderColor="base.800" gap={2} alignItems="center">
        <Button leftIcon={<PiArrowLeftBold />} onClick={onBack} variant="ghost" size="sm">
          Back
        </Button>
        <Text fontSize="lg" fontWeight="semibold">
          Install Model
        </Text>
      </Flex>

      {/* Form */}
      <Flex flexDirection="column" gap={4} p={4} overflow="auto" flex={1}>
        <FormControl>
          <FormLabel>Model Source</FormLabel>
          <Input
            placeholder="URL or HuggingFace repo (e.g., stabilityai/sdxl-turbo)"
            value={source}
            onChange={handleSourceChange}
            size="lg"
          />
          <Text fontSize="xs" color="base.400" mt={1}>
            Paste a model URL or HuggingFace repository ID
          </Text>
        </FormControl>

        <Box>
          <Text fontSize="sm" fontWeight="semibold" color="base.300" mb={2}>
            Examples
          </Text>
          <Flex flexDirection="column" gap={2}>
            <ExampleSource label="SDXL Turbo" value="stabilityai/sdxl-turbo" onClick={handleExampleSDXLTurbo} />
            <ExampleSource label="SD 1.5" value="runwayml/stable-diffusion-v1-5" onClick={handleExampleSD15} />
          </Flex>
        </Box>
      </Flex>

      {/* Actions */}
      <Flex p={4} borderTopWidth={1} borderColor="base.800">
        <Button
          leftIcon={<PiDownloadBold />}
          onClick={handleInstall}
          isLoading={isLoading}
          colorScheme="blue"
          flex={1}
          size="lg"
        >
          Install Model
        </Button>
      </Flex>
    </Flex>
  );
});

MobileModelInstallForm.displayName = 'MobileModelInstallForm';

interface ExampleSourceProps {
  label: string;
  value: string;
  onClick: () => void;
}

const ExampleSource = memo(({ label, value, onClick }: ExampleSourceProps) => {
  return (
    <Button onClick={onClick} variant="outline" justifyContent="space-between" size="sm">
      <Text fontSize="xs" fontWeight="semibold">
        {label}
      </Text>
      <Text fontSize="xs" color="base.400" fontFamily="mono">
        {value}
      </Text>
    </Button>
  );
});

ExampleSource.displayName = 'ExampleSource';
