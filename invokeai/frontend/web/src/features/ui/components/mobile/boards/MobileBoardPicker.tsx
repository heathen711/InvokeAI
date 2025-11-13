// src/features/ui/components/mobile/boards/MobileBoardPicker.tsx
import { Button, Flex, Input, Spinner, Text, useToast } from '@invoke-ai/ui-library';
import { useAppDispatch, useAppSelector } from 'app/store/storeHooks';
import { selectAutoAddBoardId } from 'features/gallery/store/gallerySelectors';
import { autoAddBoardIdChanged } from 'features/gallery/store/gallerySlice';
import type { BoardId } from 'features/gallery/store/types';
import type { ChangeEvent, KeyboardEvent } from 'react';
import { memo, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PiPlusBold } from 'react-icons/pi';
import { useCreateBoardMutation, useListAllBoardsQuery } from 'services/api/endpoints/boards';

import { MobileBoardListItem } from './MobileBoardListItem';

interface MobileBoardPickerProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Full-screen mobile board picker modal
 * Allows creating new boards and selecting existing boards
 * Modal stays open after create/select for batch operations
 */
export const MobileBoardPicker = memo(({ isOpen, onClose }: MobileBoardPickerProps) => {
  const { t } = useTranslation();
  const toast = useToast();
  const dispatch = useAppDispatch();

  const [newBoardName, setNewBoardName] = useState('');
  const autoAddBoardId = useAppSelector(selectAutoAddBoardId);

  const { data: boards, isLoading } = useListAllBoardsQuery({
    include_archived: false,
  });
  const [createBoard, { isLoading: isCreating }] = useCreateBoardMutation();

  const handleCreateBoard = useCallback(async () => {
    const trimmedName = newBoardName.trim();

    // Validate input
    if (!trimmedName) {
      toast({
        title: t('boards.boardNameRequired'),
        status: 'warning',
        duration: 2500,
      });
      return;
    }

    // Check for duplicates (case-insensitive)
    const boardNames = boards?.map((b) => b.board_name.toLowerCase()) || [];
    if (boardNames.includes(trimmedName.toLowerCase())) {
      toast({
        title: t('boards.boardNameExists'),
        status: 'warning',
        duration: 2500,
      });
      return;
    }

    try {
      const result = await createBoard({ board_name: trimmedName }).unwrap();

      // Auto-select newly created board
      dispatch(autoAddBoardIdChanged(result.board_id));

      // Clear input for next board
      setNewBoardName('');

      toast({
        title: t('boards.boardCreated'),
        status: 'success',
        duration: 1500,
      });

      // Modal stays open
    } catch {
      toast({
        title: t('boards.boardCreationFailed'),
        status: 'error',
        duration: 3000,
      });
    }
  }, [newBoardName, boards, createBoard, dispatch, toast, t]);

  const handleSelectBoard = useCallback(
    (boardId: BoardId) => {
      dispatch(autoAddBoardIdChanged(boardId));
      // Modal stays open
    },
    [dispatch]
  );

  const handleInputKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        handleCreateBoard();
      }
    },
    [handleCreateBoard]
  );

  const handleNewBoardNameChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setNewBoardName(e.target.value);
  }, []);

  if (!isOpen) {
    return null;
  }

  return (
    <Flex position="fixed" top={0} left={0} right={0} bottom={0} zIndex={9999} bg="base.900" flexDirection="column">
      {/* Header */}
      <Flex
        px={4}
        py={3}
        bg="base.850"
        borderBottomWidth={1}
        borderColor="base.700"
        justifyContent="space-between"
        alignItems="center"
      >
        <Text fontSize="lg" fontWeight="semibold" color="base.100">
          {t('boards.selectBoard')}
        </Text>
        <Button onClick={onClose} variant="ghost" size="sm">
          {t('common.done')}
        </Button>
      </Flex>

      {/* Scrollable content */}
      <Flex flex={1} flexDirection="column" overflowY="auto">
        {/* Create board input (first in list) */}
        <Flex px={4} py={3} gap={2} borderBottomWidth={1} borderColor="base.700" bg="base.850">
          <Input
            placeholder={t('boards.newBoardName')}
            value={newBoardName}
            onChange={handleNewBoardNameChange}
            onKeyDown={handleInputKeyDown}
            size="md"
            flex={1}
            isDisabled={isCreating}
          />
          <Button
            onClick={handleCreateBoard}
            isLoading={isCreating}
            leftIcon={<PiPlusBold />}
            colorScheme="invokeBlue"
            size="md"
            isDisabled={!newBoardName.trim() || isCreating}
          >
            {t('boards.create')}
          </Button>
        </Flex>

        {/* Loading state */}
        {isLoading && (
          <Flex justifyContent="center" py={8}>
            <Spinner size="xl" />
          </Flex>
        )}

        {/* Board list */}
        {!isLoading && (
          <>
            {/* Uncategorized board */}
            <MobileBoardListItem board="none" isSelected={autoAddBoardId === 'none'} onSelect={handleSelectBoard} />

            {/* User boards */}
            {boards?.map((board) => (
              <MobileBoardListItem
                key={board.board_id}
                board={board}
                isSelected={autoAddBoardId === board.board_id}
                onSelect={handleSelectBoard}
              />
            ))}

            {/* Empty state */}
            {boards?.length === 0 && (
              <Flex flexDirection="column" gap={2} p={8} alignItems="center">
                <Text color="base.400" fontSize="sm" textAlign="center">
                  {t('boards.noBoardsYet')}
                </Text>
                <Text color="base.500" fontSize="xs" textAlign="center">
                  {t('boards.createFirstBoard')}
                </Text>
              </Flex>
            )}
          </>
        )}
      </Flex>
    </Flex>
  );
});

MobileBoardPicker.displayName = 'MobileBoardPicker';
