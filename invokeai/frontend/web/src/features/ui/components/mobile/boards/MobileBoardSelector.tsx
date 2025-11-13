// src/features/ui/components/mobile/boards/MobileBoardSelector.tsx
import { Button, Flex, Text } from '@invoke-ai/ui-library';
import { useAppSelector } from 'app/store/storeHooks';
import { selectAutoAddBoardId, selectSelectedBoardId } from 'features/gallery/store/gallerySelectors';
import { memo, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PiCaretDownBold, PiFolderSimple, PiFunnel } from 'react-icons/pi';
import { useBoardName } from 'services/api/hooks/useBoardName';

import { MobileBoardPicker } from './MobileBoardPicker';

type BoardSelectorMode = 'save' | 'view';

interface MobileBoardSelectorProps {
  mode?: BoardSelectorMode;
}

// Configuration mapping for different modes
const MODE_CONFIG = {
  save: {
    labelKey: 'boards.saveTo',
    icon: PiFolderSimple,
    selector: selectAutoAddBoardId,
  },
  view: {
    labelKey: 'boards.viewing',
    icon: PiFunnel,
    selector: selectSelectedBoardId,
  },
} as const;

/**
 * Mobile board selector button that opens the board picker modal
 * Displays currently selected board and allows changing it
 */
export const MobileBoardSelector = memo(({ mode = 'save' }: MobileBoardSelectorProps) => {
  const { t } = useTranslation();
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const config = MODE_CONFIG[mode];
  const boardId = useAppSelector(config.selector);
  const boardName = useBoardName(boardId);

  const handleOpenPicker = useCallback(() => {
    setIsPickerOpen(true);
  }, []);

  const handleClosePicker = useCallback(() => {
    setIsPickerOpen(false);
  }, []);

  return (
    <>
      <Button
        onClick={handleOpenPicker}
        variant="outline"
        size="lg"
        w="full"
        justifyContent="space-between"
        px={4}
        py={6}
        h="auto"
      >
        <Flex alignItems="center" gap={3}>
          <config.icon size={20} />
          <Flex flexDirection="column" alignItems="flex-start">
            <Text fontSize="xs" color="base.400" fontWeight="normal">
              {t(config.labelKey)}
            </Text>
            <Text fontSize="md" fontWeight="semibold">
              {boardName}
            </Text>
          </Flex>
        </Flex>
        <PiCaretDownBold size={16} />
      </Button>

      <MobileBoardPicker isOpen={isPickerOpen} onClose={handleClosePicker} mode={mode} />
    </>
  );
});

MobileBoardSelector.displayName = 'MobileBoardSelector';
