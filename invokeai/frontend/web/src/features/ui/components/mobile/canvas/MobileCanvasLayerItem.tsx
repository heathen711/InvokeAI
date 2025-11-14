import { Flex, IconButton, Input, Spacer, Text } from '@invoke-ai/ui-library';
import { useAppDispatch } from 'app/store/storeHooks';
import { CanvasEntityPreviewImage } from 'features/controlLayers/components/common/CanvasEntityPreviewImage';
import { useEntityIdentifierContext } from 'features/controlLayers/contexts/EntityIdentifierContext';
import { useCanvasIsBusy } from 'features/controlLayers/hooks/useCanvasIsBusy';
import { useEntityIsEnabled } from 'features/controlLayers/hooks/useEntityIsEnabled';
import { useEntityIsLocked } from 'features/controlLayers/hooks/useEntityIsLocked';
import { useEntityTitle } from 'features/controlLayers/hooks/useEntityTitle';
import {
  entityDeleted,
  entityIsEnabledToggled,
  entityIsLockedToggled,
  entityNameChanged,
} from 'features/controlLayers/store/canvasSlice';
import type { ChangeEvent, KeyboardEvent } from 'react';
import { memo, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  PiCircleBold,
  PiCircleFill,
  PiLockBold,
  PiLockOpenBold,
  PiPencilSimpleBold,
  PiTrashBold,
} from 'react-icons/pi';

/**
 * Mobile-optimized canvas layer item header
 * Large touch targets, simplified controls
 */
export const MobileCanvasLayerHeader = memo(() => {
  const { t } = useTranslation();
  const entityIdentifier = useEntityIdentifierContext();
  const title = useEntityTitle(entityIdentifier);
  const isEnabled = useEntityIsEnabled(entityIdentifier);
  const isLocked = useEntityIsLocked(entityIdentifier);
  const isBusy = useCanvasIsBusy();
  const dispatch = useAppDispatch();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [localTitle, setLocalTitle] = useState(title);

  const toggleEnabled = useCallback(() => {
    dispatch(entityIsEnabledToggled({ entityIdentifier }));
  }, [dispatch, entityIdentifier]);

  const toggleLocked = useCallback(() => {
    dispatch(entityIsLockedToggled({ entityIdentifier }));
  }, [dispatch, entityIdentifier]);

  const handleDelete = useCallback(() => {
    dispatch(entityDeleted({ entityIdentifier }));
  }, [dispatch, entityIdentifier]);

  const handleStartEditTitle = useCallback(() => {
    setIsEditingTitle(true);
    setLocalTitle(title);
  }, [title]);

  const handleTitleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setLocalTitle(e.target.value);
  }, []);

  const handleTitleBlur = useCallback(() => {
    setIsEditingTitle(false);
    if (localTitle !== title) {
      dispatch(entityNameChanged({ entityIdentifier, name: localTitle }));
    }
  }, [dispatch, entityIdentifier, localTitle, title]);

  const handleTitleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.currentTarget.blur();
      }
      if (e.key === 'Escape') {
        setLocalTitle(title);
        setIsEditingTitle(false);
      }
    },
    [title]
  );

  return (
    <Flex
      gap={3}
      alignItems="center"
      p={4}
      bg={isEnabled ? 'base.800' : 'base.850'}
      borderRadius="md"
      opacity={isEnabled ? 1 : 0.5}
    >
      {/* Preview Image - Large for mobile */}
      <CanvasEntityPreviewImage />

      {/* Enable/Disable Toggle - Large */}
      <IconButton
        size="lg"
        aria-label={t(isEnabled ? 'common.enabled' : 'common.disabled')}
        variant="ghost"
        icon={isEnabled ? <PiCircleFill size={24} /> : <PiCircleBold size={24} />}
        onClick={toggleEnabled}
        isDisabled={isBusy}
        colorScheme={isEnabled ? 'invokeBlue' : 'base'}
        minW="48px"
      />

      {/* Title - Editable */}
      <Flex flex={1} alignItems="center" gap={2}>
        {isEditingTitle ? (
          <Input
            value={localTitle}
            onChange={handleTitleChange}
            onBlur={handleTitleBlur}
            onKeyDown={handleTitleKeyDown}
            size="md"
            autoFocus
            variant="filled"
          />
        ) : (
          <>
            <Text fontSize="md" fontWeight="semibold" noOfLines={1} flex={1}>
              {title}
            </Text>
            <IconButton
              size="md"
              aria-label={t('common.edit')}
              variant="ghost"
              icon={<PiPencilSimpleBold size={18} />}
              onClick={handleStartEditTitle}
              isDisabled={isBusy || isLocked}
            />
          </>
        )}
      </Flex>

      <Spacer />

      {/* Lock Toggle - Large */}
      <IconButton
        size="lg"
        aria-label={t(isLocked ? 'controlLayers.locked' : 'controlLayers.unlocked')}
        variant="ghost"
        icon={isLocked ? <PiLockBold size={24} /> : <PiLockOpenBold size={24} />}
        onClick={toggleLocked}
        isDisabled={isBusy}
        colorScheme={isLocked ? 'warning' : 'base'}
        minW="48px"
      />

      {/* Delete Button - Large */}
      <IconButton
        size="lg"
        aria-label={t('common.delete')}
        variant="ghost"
        colorScheme="error"
        icon={<PiTrashBold size={24} />}
        onClick={handleDelete}
        isDisabled={isBusy}
        minW="48px"
      />
    </Flex>
  );
});

MobileCanvasLayerHeader.displayName = 'MobileCanvasLayerHeader';
