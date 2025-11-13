import { Button, Drawer, DrawerBody, DrawerContent, DrawerOverlay, useToast, VStack } from '@invoke-ai/ui-library';
import { $boardToDelete } from 'features/gallery/store/boardToDelete';
import { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { PiArchiveBold, PiArchiveFill, PiDownloadBold, PiTrashBold } from 'react-icons/pi';
import { useUpdateBoardMutation } from 'services/api/endpoints/boards';
import { useBulkDownloadImagesMutation } from 'services/api/endpoints/images';
import type { BoardDTO } from 'services/api/types';

interface MobileBoardActionSheetProps {
  board: BoardDTO | 'none';
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Mobile action sheet for board operations (Download, Archive, Delete)
 * Shown when user taps "..." on a board row in the picker
 */
export const MobileBoardActionSheet = memo(({ board, isOpen, onClose }: MobileBoardActionSheetProps) => {
  const { t } = useTranslation();
  const toast = useToast();
  const [bulkDownload] = useBulkDownloadImagesMutation();
  const [updateBoard] = useUpdateBoardMutation();

  const isUncategorized = board === 'none';
  const isArchived = board !== 'none' && board.archived;

  const handleDownload = useCallback(() => {
    const boardId = board === 'none' ? undefined : board.board_id;
    bulkDownload({ image_names: [], board_id: boardId });
    onClose();
    toast({
      title: t('boards.downloadingBoard'),
      status: 'info',
      duration: 2500,
    });
  }, [board, bulkDownload, onClose, toast, t]);

  const handleArchive = useCallback(async () => {
    if (board === 'none') {
      return;
    }

    try {
      await updateBoard({
        board_id: board.board_id,
        changes: { archived: !isArchived },
      }).unwrap();
      onClose();
      toast({
        title: isArchived ? t('boards.boardUnarchived') : t('boards.boardArchived'),
        status: 'success',
        duration: 2500,
      });
    } catch {
      toast({
        title: t('boards.archiveFailed'),
        status: 'error',
        duration: 3000,
      });
    }
  }, [board, isArchived, updateBoard, onClose, toast, t]);

  const handleDelete = useCallback(() => {
    onClose();
    $boardToDelete.set(board);
  }, [board, onClose]);

  return (
    <Drawer isOpen={isOpen} onClose={onClose} placement="bottom">
      <DrawerOverlay />
      <DrawerContent>
        <DrawerBody py={4}>
          <VStack spacing={2} align="stretch">
            {/* Download */}
            <Button
              onClick={handleDownload}
              leftIcon={<PiDownloadBold />}
              size="lg"
              justifyContent="flex-start"
              variant="ghost"
            >
              {t('boards.downloadBoard')}
            </Button>

            {/* Archive/Unarchive (not for uncategorized) */}
            {!isUncategorized && (
              <Button
                onClick={handleArchive}
                leftIcon={isArchived ? <PiArchiveBold /> : <PiArchiveFill />}
                size="lg"
                justifyContent="flex-start"
                variant="ghost"
              >
                {isArchived ? t('boards.unarchiveBoard') : t('boards.archiveBoard')}
              </Button>
            )}

            {/* Delete */}
            <Button
              onClick={handleDelete}
              leftIcon={<PiTrashBold />}
              colorScheme="error"
              size="lg"
              justifyContent="flex-start"
              variant="ghost"
            >
              {isUncategorized ? t('boards.deleteAllUncategorizedImages') : t('boards.deleteBoard')}
            </Button>

            {/* Cancel */}
            <Button onClick={onClose} variant="ghost" size="lg" mt={2}>
              {t('common.cancel')}
            </Button>
          </VStack>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
});

MobileBoardActionSheet.displayName = 'MobileBoardActionSheet';
