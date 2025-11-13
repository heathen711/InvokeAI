import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Box,
  Button,
  Flex,
  Text,
  useToast,
  VStack,
} from '@invoke-ai/ui-library';
import { useAppDispatch, useAppSelector } from 'app/store/storeHooks';
import { $boardToDelete } from 'features/gallery/store/boardToDelete';
import { selectSelectedBoardId } from 'features/gallery/store/gallerySelectors';
import { boardIdSelected } from 'features/gallery/store/gallerySlice';
import { useStore } from '@nanostores/react';
import { memo, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useDeleteBoardAndImagesMutation,
  useDeleteBoardMutation,
  useListAllImageNamesForBoardQuery,
} from 'services/api/endpoints/boards';

/**
 * Mobile delete board confirmation modal
 * Shows image count and offers two delete options:
 * - Delete Board Only (keeps images in uncategorized)
 * - Delete Board & Images (permanent)
 * For uncategorized board, only offers "Delete All Images"
 */
export const MobileDeleteBoardModal = memo(() => {
  const { t } = useTranslation();
  const toast = useToast();
  const cancelRef = useRef<HTMLButtonElement>(null);

  const boardToDelete = useStore($boardToDelete);
  const selectedBoardId = useAppSelector(selectSelectedBoardId);
  const dispatch = useAppDispatch();

  const { data: imageNames, isFetching } = useListAllImageNamesForBoardQuery(
    boardToDelete === 'none'
      ? { board_id: 'none' }
      : boardToDelete
        ? { board_id: boardToDelete.board_id }
        : { board_id: '' }, // Empty string when null
    { skip: !boardToDelete }
  );

  const [deleteBoardOnly, { isLoading: isDeleteBoardOnlyLoading }] = useDeleteBoardMutation();
  const [deleteBoardAndImages, { isLoading: isDeleteBoardAndImagesLoading }] =
    useDeleteBoardAndImagesMutation();

  const isLoading = isDeleteBoardOnlyLoading || isDeleteBoardAndImagesLoading;

  const handleDeleteBoardOnly = useCallback(async () => {
    if (!boardToDelete || boardToDelete === 'none') return;

    try {
      // If deleting currently selected board, switch to uncategorized
      if (selectedBoardId === boardToDelete.board_id) {
        dispatch(boardIdSelected({ boardId: 'none' }));
      }

      await deleteBoardOnly({ board_id: boardToDelete.board_id }).unwrap();
      $boardToDelete.set(null);

      toast({
        title: t('boards.boardDeleted'),
        status: 'success',
        duration: 2500,
      });
    } catch {
      toast({
        title: t('boards.deleteFailed'),
        status: 'error',
        duration: 3000,
      });
    }
  }, [boardToDelete, selectedBoardId, deleteBoardOnly, dispatch, toast, t]);

  const handleDeleteBoardAndImages = useCallback(async () => {
    if (!boardToDelete || boardToDelete === 'none') return;

    try {
      if (selectedBoardId === boardToDelete.board_id) {
        dispatch(boardIdSelected({ boardId: 'none' }));
      }

      await deleteBoardAndImages({ board_id: boardToDelete.board_id }).unwrap();
      $boardToDelete.set(null);

      toast({
        title: t('boards.boardAndImagesDeleted'),
        status: 'success',
        duration: 2500,
      });
    } catch {
      toast({
        title: t('boards.deleteFailed'),
        status: 'error',
        duration: 3000,
      });
    }
  }, [boardToDelete, selectedBoardId, deleteBoardAndImages, dispatch, toast, t]);

  const handleClose = useCallback(() => {
    $boardToDelete.set(null);
  }, []);

  const isUncategorized = boardToDelete === 'none';
  const imageCount = imageNames?.length ?? 0;
  const boardName = isUncategorized ? t('boards.uncategorizedImages') : boardToDelete?.board_name ?? '';

  return (
    <AlertDialog isOpen={Boolean(boardToDelete)} onClose={handleClose} leastDestructiveRef={cancelRef} isCentered>
      <AlertDialogOverlay />
      <AlertDialogContent>
        <AlertDialogHeader fontSize="lg" fontWeight="bold">
          {t('common.delete')} {boardName}
        </AlertDialogHeader>

        <AlertDialogBody>
          <VStack align="start" spacing={3}>
            {!isUncategorized && boardToDelete && (
              <Box>
                <Text fontWeight="semibold">{t('boards.boardContains')}:</Text>
                <Text>
                  • {boardToDelete.image_count} {t('common.images')}
                </Text>
                <Text>
                  • {boardToDelete.asset_count} {t('common.assets')}
                </Text>
              </Box>
            )}

            {isUncategorized && (
              <Text>
                {t('boards.deleteUncategorizedImagesWarning', { count: imageCount })}
              </Text>
            )}

            <Text color="error.400" fontWeight="semibold">
              {t('boards.deletedBoardsCannotbeRestored')}
            </Text>
            <Text color="error.400">{t('gallery.deleteImagePermanent')}</Text>
          </VStack>
        </AlertDialogBody>

        <AlertDialogFooter>
          <Flex w="full" direction="column" gap={2}>
            <Button ref={cancelRef} onClick={handleClose} w="full" variant="ghost">
              {t('common.cancel')}
            </Button>

            {!isUncategorized && (
              <Button onClick={handleDeleteBoardOnly} colorScheme="warning" w="full" isLoading={isLoading}>
                {t('boards.deleteBoardOnly')}
              </Button>
            )}

            <Button
              onClick={isUncategorized ? handleClose : handleDeleteBoardAndImages}
              colorScheme="error"
              w="full"
              isLoading={isLoading}
              isDisabled={isUncategorized}
            >
              {isUncategorized ? t('boards.deleteAllUncategorizedImages') : t('boards.deleteBoardAndImages')}
            </Button>
          </Flex>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
});

MobileDeleteBoardModal.displayName = 'MobileDeleteBoardModal';
