// invokeai/frontend/web/src/features/ui/components/mobile/boards/MobileBoardSelectorBar.tsx
import { Button, Checkbox, Flex, Text } from '@invoke-ai/ui-library';
import { useAppDispatch, useAppSelector } from 'app/store/storeHooks';
import { selectGalleryView, selectShouldShowArchivedBoards } from 'features/gallery/store/gallerySelectors';
import { galleryViewChanged, shouldShowArchivedBoardsChanged } from 'features/gallery/store/gallerySlice';
import type { ChangeEvent } from 'react';
import { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { PiFile, PiImage } from 'react-icons/pi';

import { MobileBoardSelector } from './MobileBoardSelector';

interface MobileBoardSelectorBarProps {
  mode: 'save' | 'view';
}

/**
 * Persistent bottom board selector bar for mobile
 * Shows board selector and view toggle (images/assets) when in view mode
 */
export const MobileBoardSelectorBar = memo(({ mode }: MobileBoardSelectorBarProps) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const galleryView = useAppSelector(selectGalleryView);
  const shouldShowArchivedBoards = useAppSelector(selectShouldShowArchivedBoards);

  const handleToggleView = useCallback(() => {
    const newView = galleryView === 'images' ? 'assets' : 'images';
    dispatch(galleryViewChanged(newView));
  }, [galleryView, dispatch]);

  const handleToggleArchived = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      dispatch(shouldShowArchivedBoardsChanged(e.target.checked));
    },
    [dispatch]
  );

  const isViewingImages = galleryView === 'images';
  const ToggleIcon = isViewingImages ? PiFile : PiImage;
  const toggleText = isViewingImages ? t('gallery.switchToAssets') : t('gallery.switchToImages');

  return (
    <Flex
      flexDirection="column"
      position="sticky"
      bottom="60px"
      left={0}
      right={0}
      bg="base.900"
      borderTop="1px solid"
      borderColor="base.700"
      zIndex={999}
    >
      {/* Board selector and view toggle */}
      <Flex px={3} py={2} gap={2} alignItems="center">
        <MobileBoardSelector mode={mode} />

        {mode === 'view' && (
          <Button
            onClick={handleToggleView}
            variant="outline"
            size="lg"
            flexShrink={0}
            rightIcon={<ToggleIcon size={18} />}
            h="auto"
            py={6}
            px={4}
          >
            {toggleText}
          </Button>
        )}
      </Flex>

      {/* Archived boards toggle */}
      <Flex px={3} py={2} alignItems="center" gap={2} borderTop="1px solid" borderColor="base.700">
        <Checkbox isChecked={shouldShowArchivedBoards} onChange={handleToggleArchived} size="sm" />
        <Text fontSize="sm" color="base.300">
          {t('gallery.showArchivedBoards')}
        </Text>
      </Flex>
    </Flex>
  );
});

MobileBoardSelectorBar.displayName = 'MobileBoardSelectorBar';
