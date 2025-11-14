// src/features/ui/components/mobile/gallery/MobileBoardSelector.tsx
import {
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  Spinner,
  Text,
} from '@invoke-ai/ui-library';
import { createSelector } from '@reduxjs/toolkit';
import { useAppDispatch, useAppSelector } from 'app/store/storeHooks';
import {
  changeBoardReset,
  isModalOpenChanged,
  selectChangeBoardModalSlice,
} from 'features/changeBoardModal/store/slice';
import { selectSelectedBoardId } from 'features/gallery/store/gallerySelectors';
import { memo, useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PiFolders } from 'react-icons/pi';
import { useListAllBoardsQuery } from 'services/api/endpoints/boards';
import { useAddImagesToBoardMutation, useRemoveImagesFromBoardMutation } from 'services/api/endpoints/images';

const selectImagesToChange = createSelector(
  selectChangeBoardModalSlice,
  (changeBoardModal) => changeBoardModal.image_names
);

const selectIsModalOpen = createSelector(
  selectChangeBoardModalSlice,
  (changeBoardModal) => changeBoardModal.isModalOpen
);

interface BoardOption {
  board_id: string;
  board_name: string;
}

/**
 * Individual board option item
 */
const BoardItem = memo(
  ({
    board,
    isSelected,
    onSelect,
  }: {
    board: BoardOption;
    isSelected: boolean;
    onSelect: (boardId: string) => void;
  }) => {
    const handleClick = useCallback(() => {
      onSelect(board.board_id);
    }, [board.board_id, onSelect]);

    return (
      <Flex
        as="button"
        onClick={handleClick}
        alignItems="center"
        gap={3}
        py={4}
        px={4}
        _hover={{ bg: isSelected ? 'base.750' : 'base.750' }}
        _focus={{ outline: 'none', bg: isSelected ? 'base.750' : 'transparent' }}
        cursor="pointer"
        w="full"
        textAlign="left"
        bg={isSelected ? 'base.750' : 'transparent'}
        borderBottom="1px solid"
        borderColor="base.800"
      >
        <Box fontSize="xl" color="base.300" flexShrink={0}>
          <PiFolders />
        </Box>
        <Text flex={1} color="base.100" fontSize="md" fontWeight={isSelected ? 'semibold' : 'normal'}>
          {board.board_name}
        </Text>
        {isSelected && (
          <Box fontSize="lg" color="invokeBlue.400">
            ✓
          </Box>
        )}
      </Flex>
    );
  }
);

BoardItem.displayName = 'BoardItem';

/**
 * Mobile-friendly board selector using bottom drawer
 * Alternative to desktop Combobox for touch interfaces
 */
export const MobileBoardSelector = memo(() => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const currentBoardId = useAppSelector(selectSelectedBoardId);
  const isModalOpen = useAppSelector(selectIsModalOpen);
  const imagesToChange = useAppSelector(selectImagesToChange);
  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null);
  const { data: boards, isFetching } = useListAllBoardsQuery({ include_archived: true });
  const [addImagesToBoard] = useAddImagesToBoardMutation();
  const [removeImagesFromBoard] = useRemoveImagesFromBoardMutation();
  const headerRef = useRef<HTMLDivElement>(null);

  // Create board list with "Uncategorized" option
  const boardOptions = useMemo<BoardOption[]>(() => {
    const allBoards: BoardOption[] = [{ board_id: 'none', board_name: t('boards.uncategorized') }];

    if (boards) {
      const sorted = [...boards]
        .map((board) => ({
          board_id: board.board_id,
          board_name: board.board_name,
        }))
        .sort((a, b) => a.board_name.localeCompare(b.board_name));

      allBoards.push(...sorted);
    }

    // Filter out current board
    return allBoards.filter((board) => board.board_id !== currentBoardId);
  }, [boards, currentBoardId, t]);

  const handleClose = useCallback(() => {
    dispatch(changeBoardReset());
    dispatch(isModalOpenChanged(false));
    setSelectedBoardId(null);
  }, [dispatch]);

  const handleSelectBoard = useCallback((boardId: string) => {
    setSelectedBoardId(boardId);
  }, []);

  const handleMove = useCallback(() => {
    if (!selectedBoardId || imagesToChange.length === 0) {
      return;
    }

    if (selectedBoardId === 'none') {
      removeImagesFromBoard({ image_names: imagesToChange });
    } else {
      addImagesToBoard({
        image_names: imagesToChange,
        board_id: selectedBoardId,
      });
    }

    dispatch(changeBoardReset());
    dispatch(isModalOpenChanged(false));
    setSelectedBoardId(null);
  }, [selectedBoardId, imagesToChange, removeImagesFromBoard, addImagesToBoard, dispatch]);

  return (
    <Drawer isOpen={isModalOpen} onClose={handleClose} placement="bottom" initialFocusRef={headerRef}>
      <DrawerOverlay bg="blackAlpha.800" />
      <DrawerContent bg="base.900" borderTopRadius="lg" maxH="70vh">
        <DrawerHeader ref={headerRef} textAlign="center" borderBottom="1px solid" borderColor="base.700" py={3}>
          <Text fontSize="md" fontWeight="semibold" color="base.100">
            {t('boards.changeBoard')}
          </Text>
          <Text fontSize="sm" color="base.400" mt={1}>
            {t('boards.movingImagesToBoard', { count: imagesToChange.length })}
          </Text>
        </DrawerHeader>

        <DrawerBody p={0} overflowY="auto">
          {isFetching ? (
            <Flex justifyContent="center" alignItems="center" py={8}>
              <Spinner />
            </Flex>
          ) : (
            <>
              {boardOptions.map((board) => (
                <BoardItem
                  key={board.board_id}
                  board={board}
                  isSelected={selectedBoardId === board.board_id}
                  onSelect={handleSelectBoard}
                />
              ))}
            </>
          )}
        </DrawerBody>

        <DrawerFooter p={0} borderTop="1px solid" borderColor="base.700">
          <Flex w="full">
            <Button onClick={handleClose} flex={1} size="lg" colorScheme="base" variant="solid" borderRadius={0}>
              {t('common.cancel')}
            </Button>
            <Box w="1px" bg="base.700" />
            <Button
              onClick={handleMove}
              flex={1}
              size="lg"
              colorScheme="invokeBlue"
              variant="solid"
              borderRadius={0}
              isDisabled={!selectedBoardId || isFetching}
            >
              {t('boards.move')}
            </Button>
          </Flex>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
});

MobileBoardSelector.displayName = 'MobileBoardSelector';
