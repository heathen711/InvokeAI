import { Badge, Box, Button, Flex, Spinner, Text, useDisclosure } from '@invoke-ai/ui-library';
import { MobileConfirmDialog } from 'features/ui/components/mobile/MobileConfirmDialog';
import { memo, useCallback } from 'react';
import { PiArrowLeftBold, PiTrashSimpleFill } from 'react-icons/pi';
import { useDeleteModelsMutation, useGetModelConfigQuery } from 'services/api/endpoints/models';

interface MobileModelDetailsProps {
  modelKey: string;
  onBack: () => void;
}

/**
 * Mobile model details view
 * Shows model info with delete action
 */
export const MobileModelDetails = memo(({ modelKey, onBack }: MobileModelDetailsProps) => {
  const { data: model, isLoading } = useGetModelConfigQuery(modelKey);
  const [deleteModel, { isLoading: isDeleting }] = useDeleteModelsMutation();
  const deleteDialog = useDisclosure();

  const handleDelete = useCallback(async () => {
    try {
      await deleteModel({ key: modelKey }).unwrap();
      deleteDialog.onClose();
      onBack();
    } catch {
      // Error toast handled by mutation
    }
  }, [deleteModel, modelKey, deleteDialog, onBack]);

  if (isLoading) {
    return (
      <Flex justifyContent="center" alignItems="center" p={8}>
        <Spinner size="xl" />
      </Flex>
    );
  }

  if (!model) {
    return (
      <Flex flexDirection="column" gap={4} p={4}>
        <Button leftIcon={<PiArrowLeftBold />} onClick={onBack} variant="ghost" alignSelf="flex-start">
          Back
        </Button>
        <Text color="base.400">Model not found</Text>
      </Flex>
    );
  }

  return (
    <>
      <Flex flexDirection="column" height="full" overflow="hidden">
        {/* Header with back button */}
        <Flex p={4} borderBottomWidth={1} borderColor="base.800" gap={2} alignItems="center">
          <Button leftIcon={<PiArrowLeftBold />} onClick={onBack} variant="ghost" size="sm">
            Back
          </Button>
        </Flex>

        {/* Model details */}
        <Flex flexDirection="column" gap={4} p={4} overflow="auto" flex={1}>
          <Box>
            <Text fontSize="xl" fontWeight="bold" mb={2}>
              {model.name}
            </Text>
            <Flex gap={2} flexWrap="wrap" mb={4}>
              <Badge colorScheme="blue">{model.base}</Badge>
              <Badge colorScheme="purple">{model.type}</Badge>
              <Badge colorScheme="green">{model.format}</Badge>
            </Flex>
            {model.description && (
              <Text fontSize="sm" color="base.300">
                {model.description}
              </Text>
            )}
          </Box>

          <Box>
            <Text fontSize="sm" fontWeight="semibold" color="base.300" mb={2}>
              Details
            </Text>
            <Flex flexDirection="column" gap={2} fontSize="sm">
              <Flex justifyContent="space-between">
                <Text color="base.400">Key:</Text>
                <Text color="base.200" fontFamily="mono" fontSize="xs">
                  {model.key}
                </Text>
              </Flex>
              <Flex justifyContent="space-between">
                <Text color="base.400">Path:</Text>
                <Text color="base.200" fontSize="xs" noOfLines={1}>
                  {model.path}
                </Text>
              </Flex>
            </Flex>
          </Box>
        </Flex>

        {/* Actions */}
        <Flex p={4} pb="calc(60px + 1rem)" borderTopWidth={1} borderColor="base.800" gap={2}>
          <Button
            leftIcon={<PiTrashSimpleFill />}
            onClick={deleteDialog.onOpen}
            isLoading={isDeleting}
            colorScheme="red"
            flex={1}
            size="lg"
          >
            Delete Model
          </Button>
        </Flex>
      </Flex>

      {/* Delete confirmation */}
      <MobileConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={deleteDialog.onClose}
        onConfirm={handleDelete}
        title="Delete Model"
        message={`Are you sure you want to delete "${model.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        confirmColorScheme="red"
      />
    </>
  );
});

MobileModelDetails.displayName = 'MobileModelDetails';
