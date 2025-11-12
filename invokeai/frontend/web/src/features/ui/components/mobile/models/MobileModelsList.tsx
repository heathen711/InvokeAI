// src/features/ui/components/mobile/models/MobileModelsList.tsx
import { Badge, Box, Flex, Spinner, Text } from '@invoke-ai/ui-library';
import { EMPTY_ARRAY } from 'app/store/constants';
import { memo, useCallback } from 'react';
import { modelConfigsAdapterSelectors, useGetModelConfigsQuery } from 'services/api/endpoints/models';
import type { AnyModelConfig } from 'services/api/types';

interface MobileModelsListProps {
  onModelSelect: (modelKey: string) => void;
}

/**
 * Mobile models list
 * Displays installed models with base/type/format badges
 */
export const MobileModelsList = memo(({ onModelSelect }: MobileModelsListProps) => {
  const { models, isLoading } = useGetModelConfigsQuery(undefined, {
    selectFromResult: ({ data, isLoading }) => ({
      models: data ? modelConfigsAdapterSelectors.selectAll(data) : EMPTY_ARRAY,
      isLoading,
    }),
  });

  if (isLoading) {
    return (
      <Flex justifyContent="center" alignItems="center" p={8}>
        <Spinner role="status" aria-label="Loading models" size="xl" />
      </Flex>
    );
  }

  if (!models || models.length === 0) {
    return (
      <Flex justifyContent="center" alignItems="center" p={8}>
        <Text color="base.400">No models installed</Text>
      </Flex>
    );
  }

  return (
    <Flex flexDirection="column" gap={2} p={4} overflow="auto">
      {models.map((model) => (
        <ModelListItem key={model.key} model={model} onModelSelect={onModelSelect} />
      ))}
    </Flex>
  );
});

MobileModelsList.displayName = 'MobileModelsList';

interface ModelListItemProps {
  model: AnyModelConfig;
  onModelSelect: (modelKey: string) => void;
}

const ModelListItem = memo(({ model, onModelSelect }: ModelListItemProps) => {
  const handleClick = useCallback(() => {
    onModelSelect(model.key);
  }, [onModelSelect, model.key]);

  return (
    <Box
      onClick={handleClick}
      p={4}
      bg="base.850"
      borderRadius="md"
      cursor="pointer"
      _hover={{ bg: 'base.800' }}
      transition="background 0.2s"
    >
      <Flex justifyContent="space-between" alignItems="start" mb={2}>
        <Text fontSize="md" fontWeight="semibold" color="base.100">
          {model.name}
        </Text>
      </Flex>

      <Flex gap={2} flexWrap="wrap">
        <Badge colorScheme="blue" fontSize="xs">
          {model.base}
        </Badge>
        <Badge colorScheme="purple" fontSize="xs">
          {model.type}
        </Badge>
        <Badge colorScheme="green" fontSize="xs">
          {model.format}
        </Badge>
      </Flex>

      {model.description && (
        <Text fontSize="xs" color="base.400" mt={2} noOfLines={2}>
          {model.description}
        </Text>
      )}
    </Box>
  );
});

ModelListItem.displayName = 'ModelListItem';
