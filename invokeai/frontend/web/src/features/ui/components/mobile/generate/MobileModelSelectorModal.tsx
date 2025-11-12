// src/features/ui/components/mobile/generate/MobileModelSelectorModal.tsx
import {
  Badge,
  Box,
  Flex,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Text,
} from '@invoke-ai/ui-library';
import { EMPTY_ARRAY } from 'app/store/constants';
import { useAppDispatch, useAppSelector } from 'app/store/storeHooks';
import { modelChanged, selectModel } from 'features/controlLayers/store/paramsSlice';
import { memo, useCallback } from 'react';
import { modelConfigsAdapterSelectors, useGetModelConfigsQuery } from 'services/api/endpoints/models';
import type { AnyModelConfig } from 'services/api/types';
import { isNonRefinerMainModelConfig } from 'services/api/types';

interface MobileModelSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Mobile model selector modal
 * Full-screen selection of generation model
 * Filters to show only main models (not VAE, LoRA, etc.)
 */
export const MobileModelSelectorModal = memo(({ isOpen, onClose }: MobileModelSelectorModalProps) => {
  const dispatch = useAppDispatch();
  const currentModel = useAppSelector(selectModel);

  const { models, isLoading } = useGetModelConfigsQuery(undefined, {
    selectFromResult: ({ data, isLoading }) => ({
      models: data ? modelConfigsAdapterSelectors.selectAll(data).filter(isNonRefinerMainModelConfig) : EMPTY_ARRAY,
      isLoading,
    }),
  });

  const handleSelectModel = useCallback(
    (model: AnyModelConfig) => {
      dispatch(
        modelChanged({
          model: {
            key: model.key,
            hash: model.hash,
            name: model.name,
            base: model.base,
            type: model.type,
          },
          previousModel: currentModel,
        })
      );
      onClose();
    },
    [dispatch, currentModel, onClose]
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="full">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Select Model</ModalHeader>
        <ModalCloseButton />
        <ModalBody p={0}>
          {isLoading ? (
            <Flex justifyContent="center" alignItems="center" p={8}>
              <Spinner size="xl" />
            </Flex>
          ) : models.length === 0 ? (
            <Flex justifyContent="center" alignItems="center" p={8}>
              <Text color="base.400">No models available</Text>
            </Flex>
          ) : (
            <Flex flexDirection="column" gap={2} p={4} role="radiogroup" aria-label="Available models">
              {models.map((model) => (
                <ModelOption
                  key={model.key}
                  model={model}
                  isSelected={currentModel?.key === model.key}
                  onSelect={handleSelectModel}
                />
              ))}
            </Flex>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
});

MobileModelSelectorModal.displayName = 'MobileModelSelectorModal';

interface ModelOptionProps {
  model: AnyModelConfig;
  isSelected: boolean;
  onSelect: (model: AnyModelConfig) => void;
}

const ModelOption = memo(({ model, isSelected, onSelect }: ModelOptionProps) => {
  const handleClick = useCallback(() => {
    onSelect(model);
  }, [onSelect, model]);

  return (
    <Box
      as="button"
      onClick={handleClick}
      p={4}
      bg={isSelected ? 'invokeBlue.600' : 'base.850'}
      borderRadius="md"
      cursor="pointer"
      borderWidth={isSelected ? 2 : 1}
      borderColor={isSelected ? 'invokeBlue.400' : 'base.700'}
      _hover={{ bg: isSelected ? 'invokeBlue.600' : 'base.800' }}
      transition="all 0.2s"
      width="full"
      textAlign="left"
      role="radio"
      aria-checked={isSelected}
      aria-label={`Select model ${model.name}, ${model.base} ${model.format}`}
    >
      <Flex justifyContent="space-between" alignItems="start" mb={2}>
        <Text fontSize="md" fontWeight="semibold" color={isSelected ? 'white' : 'base.100'}>
          {model.name}
        </Text>
        {isSelected && (
          <Badge colorScheme="green" fontSize="xs">
            Selected
          </Badge>
        )}
      </Flex>

      <Flex gap={2} flexWrap="wrap">
        <Badge colorScheme="blue" fontSize="xs">
          {model.base}
        </Badge>
        <Badge colorScheme="green" fontSize="xs">
          {model.format}
        </Badge>
      </Flex>

      {model.description && (
        <Text fontSize="xs" color={isSelected ? 'whiteAlpha.800' : 'base.400'} mt={2} noOfLines={2}>
          {model.description}
        </Text>
      )}
    </Box>
  );
});

ModelOption.displayName = 'ModelOption';
