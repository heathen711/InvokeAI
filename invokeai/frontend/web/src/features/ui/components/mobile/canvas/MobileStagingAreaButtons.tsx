import { Button, ButtonGroup, IconButton, Menu, MenuButton, MenuList } from '@invoke-ai/ui-library';
import { useStore } from '@nanostores/react';
import { useAppDispatch, useAppSelector } from 'app/store/storeHooks';
import { withResultAsync } from 'common/util/result';
import { useStagingAreaContext } from 'features/controlLayers/components/StagingArea/context';
import { StagingAreaToolbarNewLayerFromImageMenuItems } from 'features/controlLayers/components/StagingArea/StagingAreaToolbarMenuNewLayerFromImage';
import { useCanvasManager } from 'features/controlLayers/contexts/CanvasManagerProviderGate';
import {
  selectStagingAreaAutoSwitch,
  settingsStagingAreaAutoSwitchChanged,
} from 'features/controlLayers/store/canvasSettingsSlice';
import { selectAutoAddBoardId } from 'features/gallery/store/gallerySelectors';
import { useCancelQueueItem } from 'features/queue/hooks/useCancelQueueItem';
import { useCancelQueueItemsByDestination } from 'features/queue/hooks/useCancelQueueItemsByDestination';
import { toast } from 'features/toast/toast';
import { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  PiCaretLeftBold,
  PiCaretLineRightBold,
  PiCaretRightBold,
  PiCheckBold,
  PiDotsThreeVerticalBold,
  PiEyeBold,
  PiEyeSlashBold,
  PiFloppyDiskBold,
  PiMoonBold,
  PiTrashSimpleBold,
  PiXBold,
} from 'react-icons/pi';
import { copyImage } from 'services/api/endpoints/images';

/**
 * Previous button - navigate to previous staged image
 */
const MobileStagingAreaPrevButton = memo(() => {
  const ctx = useStagingAreaContext();
  const selectedItem = useStore(ctx.$selectedItem);
  const { t } = useTranslation();

  const isDisabled = selectedItem === null || selectedItem.index === 0;

  return (
    <IconButton
      aria-label={t('controlLayers.stagingArea.previous')}
      icon={<PiCaretLeftBold />}
      onClick={ctx.selectPrev}
      isDisabled={isDisabled}
      size="lg"
      colorScheme="invokeBlue"
    />
  );
});
MobileStagingAreaPrevButton.displayName = 'MobileStagingAreaPrevButton';

/**
 * Next button - navigate to next staged image
 */
const MobileStagingAreaNextButton = memo(() => {
  const ctx = useStagingAreaContext();
  const selectedItem = useStore(ctx.$selectedItem);
  const itemCount = useStore(ctx.$itemCount);
  const { t } = useTranslation();

  const isDisabled = selectedItem === null || selectedItem.index >= itemCount - 1;

  return (
    <IconButton
      aria-label={t('controlLayers.stagingArea.next')}
      icon={<PiCaretRightBold />}
      onClick={ctx.selectNext}
      isDisabled={isDisabled}
      size="lg"
      colorScheme="invokeBlue"
    />
  );
});
MobileStagingAreaNextButton.displayName = 'MobileStagingAreaNextButton';

/**
 * Image counter - shows current index and total count
 */
const MobileStagingAreaImageCountButton = memo(() => {
  const ctx = useStagingAreaContext();
  const selectedItem = useStore(ctx.$selectedItem);
  const itemCount = useStore(ctx.$itemCount);

  const counterText = useMemo(() => {
    if (itemCount > 0 && selectedItem !== null) {
      return `${selectedItem.index + 1} of ${itemCount}`;
    }
    return '0 of 0';
  }, [itemCount, selectedItem]);

  return (
    <Button colorScheme="base" pointerEvents="none" minW={28} size="lg">
      {counterText}
    </Button>
  );
});
MobileStagingAreaImageCountButton.displayName = 'MobileStagingAreaImageCountButton';

/**
 * Navigation button group (Prev + Counter + Next)
 */
export const MobileStagingAreaNavigation = memo(() => {
  return (
    <ButtonGroup isAttached>
      <MobileStagingAreaPrevButton />
      <MobileStagingAreaImageCountButton />
      <MobileStagingAreaNextButton />
    </ButtonGroup>
  );
});
MobileStagingAreaNavigation.displayName = 'MobileStagingAreaNavigation';

/**
 * Accept button - commits current image to canvas and exits staging
 */
const MobileStagingAreaAcceptButton = memo(({ onAccept }: { onAccept: () => void }) => {
  const ctx = useStagingAreaContext();
  const canvasManager = useCanvasManager();
  const shouldShowStagedImage = useStore(canvasManager.stagingArea.$shouldShowStagedImage);
  const cancelQueueItemsByDestination = useCancelQueueItemsByDestination();
  const acceptSelectedIsEnabled = useStore(ctx.$acceptSelectedIsEnabled);
  const { t } = useTranslation();

  const handleAccept = useCallback(() => {
    ctx.acceptSelected();
    onAccept();
  }, [ctx, onAccept]);

  return (
    <IconButton
      aria-label={t('common.accept')}
      icon={<PiCheckBold />}
      onClick={handleAccept}
      colorScheme="invokeBlue"
      size="lg"
      isDisabled={!acceptSelectedIsEnabled || !shouldShowStagedImage || cancelQueueItemsByDestination.isDisabled}
      isLoading={cancelQueueItemsByDestination.isLoading}
    />
  );
});
MobileStagingAreaAcceptButton.displayName = 'MobileStagingAreaAcceptButton';

/**
 * Save to gallery button - copies current image to gallery
 */
const MobileStagingAreaSaveToGalleryButton = memo(() => {
  const canvasManager = useCanvasManager();
  const autoAddBoardId = useAppSelector(selectAutoAddBoardId);
  const ctx = useStagingAreaContext();
  const selectedItemImageDTO = useStore(ctx.$selectedItemImageDTO);
  const shouldShowStagedImage = useStore(canvasManager.stagingArea.$shouldShowStagedImage);
  const { t } = useTranslation();

  const saveSelectedImageToGallery = useCallback(async () => {
    if (!selectedItemImageDTO) {
      return;
    }

    const result = await withResultAsync(async () => {
      await copyImage(selectedItemImageDTO.image_name, {
        image_category: 'general',
        is_intermediate: false,
        board_id: autoAddBoardId === 'none' ? undefined : autoAddBoardId,
        silent: true,
      });
    });

    if (result.isOk()) {
      toast({
        title: t('controlLayers.savedToGalleryOk'),
        status: 'success',
      });
    } else {
      toast({
        title: t('controlLayers.savedToGalleryError'),
        status: 'error',
      });
    }
  }, [autoAddBoardId, selectedItemImageDTO, t]);

  return (
    <IconButton
      aria-label={t('controlLayers.stagingArea.saveToGallery')}
      icon={<PiFloppyDiskBold />}
      onClick={saveSelectedImageToGallery}
      colorScheme="invokeBlue"
      size="lg"
      isDisabled={!selectedItemImageDTO || !shouldShowStagedImage}
    />
  );
});
MobileStagingAreaSaveToGalleryButton.displayName = 'MobileStagingAreaSaveToGalleryButton';

/**
 * Discard selected button - removes current image from staging
 */
const MobileStagingAreaDiscardSelectedButton = memo(() => {
  const canvasManager = useCanvasManager();
  const shouldShowStagedImage = useStore(canvasManager.stagingArea.$shouldShowStagedImage);
  const ctx = useStagingAreaContext();
  const cancelQueueItem = useCancelQueueItem();
  const discardSelectedIsEnabled = useStore(ctx.$discardSelectedIsEnabled);
  const { t } = useTranslation();

  return (
    <IconButton
      aria-label={t('controlLayers.stagingArea.discard')}
      icon={<PiXBold />}
      onClick={ctx.discardSelected}
      colorScheme="invokeBlue"
      size="lg"
      isDisabled={!discardSelectedIsEnabled || cancelQueueItem.isDisabled || !shouldShowStagedImage}
      isLoading={cancelQueueItem.isLoading}
    />
  );
});
MobileStagingAreaDiscardSelectedButton.displayName = 'MobileStagingAreaDiscardSelectedButton';

/**
 * Primary action button group (Accept + Save + Discard Selected)
 */
export const MobileStagingAreaPrimaryActions = memo(({ onAccept }: { onAccept: () => void }) => {
  return (
    <ButtonGroup isAttached>
      <MobileStagingAreaAcceptButton onAccept={onAccept} />
      <MobileStagingAreaSaveToGalleryButton />
      <MobileStagingAreaDiscardSelectedButton />
    </ButtonGroup>
  );
});
MobileStagingAreaPrimaryActions.displayName = 'MobileStagingAreaPrimaryActions';

/**
 * Toggle show results button - shows/hides staged image overlay
 */
const MobileStagingAreaToggleShowResultsButton = memo(() => {
  const canvasManager = useCanvasManager();
  const shouldShowStagedImage = useStore(canvasManager.stagingArea.$shouldShowStagedImage);
  const { t } = useTranslation();

  const toggleShowResults = useCallback(() => {
    canvasManager.stagingArea.$shouldShowStagedImage.set(!canvasManager.stagingArea.$shouldShowStagedImage.get());
  }, [canvasManager.stagingArea.$shouldShowStagedImage]);

  return (
    <IconButton
      aria-label={
        shouldShowStagedImage
          ? t('controlLayers.stagingArea.showResultsOn')
          : t('controlLayers.stagingArea.showResultsOff')
      }
      data-alert={!shouldShowStagedImage}
      icon={shouldShowStagedImage ? <PiEyeBold /> : <PiEyeSlashBold />}
      onClick={toggleShowResults}
      colorScheme="invokeBlue"
      size="lg"
    />
  );
});
MobileStagingAreaToggleShowResultsButton.displayName = 'MobileStagingAreaToggleShowResultsButton';

/**
 * Menu button - additional actions (new layer from image, etc.)
 */
const MobileStagingAreaMenuButton = memo(() => {
  const canvasManager = useCanvasManager();
  const shouldShowStagedImage = useStore(canvasManager.stagingArea.$shouldShowStagedImage);

  return (
    <Menu>
      <MenuButton
        as={IconButton}
        aria-label="Image Actions"
        icon={<PiDotsThreeVerticalBold />}
        colorScheme="invokeBlue"
        size="lg"
        isDisabled={!shouldShowStagedImage}
      />
      <MenuList>
        <StagingAreaToolbarNewLayerFromImageMenuItems />
      </MenuList>
    </Menu>
  );
});
MobileStagingAreaMenuButton.displayName = 'MobileStagingAreaMenuButton';

/**
 * Auto-switch mode buttons (Off / Switch on Start / Switch on Finish)
 */
export const MobileStagingAreaAutoSwitchButtons = memo(() => {
  const canvasManager = useCanvasManager();
  const shouldShowStagedImage = useStore(canvasManager.stagingArea.$shouldShowStagedImage);
  const autoSwitch = useAppSelector(selectStagingAreaAutoSwitch);
  const dispatch = useAppDispatch();

  const onClickOff = useCallback(() => {
    dispatch(settingsStagingAreaAutoSwitchChanged('off'));
  }, [dispatch]);

  const onClickSwitchOnStart = useCallback(() => {
    dispatch(settingsStagingAreaAutoSwitchChanged('switch_on_start'));
  }, [dispatch]);

  const onClickSwitchOnFinished = useCallback(() => {
    dispatch(settingsStagingAreaAutoSwitchChanged('switch_on_finish'));
  }, [dispatch]);

  return (
    <ButtonGroup isAttached>
      <IconButton
        aria-label="Do not auto-switch"
        icon={<PiMoonBold />}
        colorScheme={autoSwitch === 'off' ? 'invokeBlue' : 'base'}
        onClick={onClickOff}
        isDisabled={!shouldShowStagedImage}
        size="lg"
      />
      <IconButton
        aria-label="Switch on start"
        icon={<PiCaretRightBold />}
        colorScheme={autoSwitch === 'switch_on_start' ? 'invokeBlue' : 'base'}
        onClick={onClickSwitchOnStart}
        isDisabled={!shouldShowStagedImage}
        size="lg"
      />
      <IconButton
        aria-label="Switch on finish"
        icon={<PiCaretLineRightBold />}
        colorScheme={autoSwitch === 'switch_on_finish' ? 'invokeBlue' : 'base'}
        onClick={onClickSwitchOnFinished}
        isDisabled={!shouldShowStagedImage}
        size="lg"
      />
    </ButtonGroup>
  );
});
MobileStagingAreaAutoSwitchButtons.displayName = 'MobileStagingAreaAutoSwitchButtons';

/**
 * Discard all button - removes all images and exits staging
 */
const MobileStagingAreaDiscardAllButton = memo(({ onDiscardAll }: { onDiscardAll: () => void }) => {
  const canvasManager = useCanvasManager();
  const shouldShowStagedImage = useStore(canvasManager.stagingArea.$shouldShowStagedImage);
  const ctx = useStagingAreaContext();
  const cancelQueueItemsByDestination = useCancelQueueItemsByDestination();
  const { t } = useTranslation();

  const handleDiscardAll = useCallback(() => {
    ctx.discardAll();
    onDiscardAll();
  }, [ctx, onDiscardAll]);

  return (
    <IconButton
      aria-label={t('controlLayers.stagingArea.discardAll')}
      icon={<PiTrashSimpleBold />}
      onClick={handleDiscardAll}
      colorScheme="error"
      size="lg"
      isDisabled={cancelQueueItemsByDestination.isDisabled || !shouldShowStagedImage}
      isLoading={cancelQueueItemsByDestination.isLoading}
    />
  );
});
MobileStagingAreaDiscardAllButton.displayName = 'MobileStagingAreaDiscardAllButton';

/**
 * Secondary controls group (Toggle show + Menu)
 */
export const MobileStagingAreaSecondaryLeft = memo(() => {
  return (
    <ButtonGroup isAttached>
      <MobileStagingAreaToggleShowResultsButton />
      <MobileStagingAreaMenuButton />
    </ButtonGroup>
  );
});
MobileStagingAreaSecondaryLeft.displayName = 'MobileStagingAreaSecondaryLeft';

/**
 * Discard all group (standalone)
 */
export const MobileStagingAreaSecondaryRight = memo(({ onDiscardAll }: { onDiscardAll: () => void }) => {
  return (
    <ButtonGroup isAttached>
      <MobileStagingAreaDiscardAllButton onDiscardAll={onDiscardAll} />
    </ButtonGroup>
  );
});
MobileStagingAreaSecondaryRight.displayName = 'MobileStagingAreaSecondaryRight';
