// invokeai/frontend/web/src/features/ui/components/mobile/boards/MobileBoardSelectorBar.tsx
import { Button, Flex } from '@invoke-ai/ui-library';
import { useAppDispatch, useAppSelector } from 'app/store/storeHooks';
import { selectGalleryView } from 'features/gallery/store/gallerySelectors';
import { galleryViewChanged } from 'features/gallery/store/gallerySlice';
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

  const handleToggleView = useCallback(() => {
    const newView = galleryView === 'images' ? 'assets' : 'images';
    dispatch(galleryViewChanged(newView));
  }, [galleryView, dispatch]);

  const isViewingImages = galleryView === 'images';
  const ToggleIcon = isViewingImages ? PiFile : PiImage;
  const toggleText = isViewingImages ? t('gallery.switchToAssets') : t('gallery.switchToImages');

  return (
    <Flex
      position="sticky"
      bottom={0}
      left={0}
      right={0}
      bg="base.900"
      borderTop="1px solid"
      borderColor="base.700"
      px={3}
      py={2}
      gap={2}
      alignItems="center"
      zIndex={1001}
    >
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
  );
});

MobileBoardSelectorBar.displayName = 'MobileBoardSelectorBar';
