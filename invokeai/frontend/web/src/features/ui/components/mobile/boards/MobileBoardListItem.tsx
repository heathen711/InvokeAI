// src/features/ui/components/mobile/boards/MobileBoardListItem.tsx
import { Box, Flex, Image, Text } from '@invoke-ai/ui-library';
import { skipToken } from '@reduxjs/toolkit/query';
import { memo, useCallback } from 'react';
import { PiCheckBold, PiFolderSimple } from 'react-icons/pi';
import type { BoardDTO } from 'services/api/types';
import type { BoardId } from 'features/gallery/store/types';
import { useBoardName } from 'services/api/hooks/useBoardName';
import { useGetImageDTOQuery } from 'services/api/endpoints/images';

interface MobileBoardListItemProps {
  board: BoardDTO | 'none';
  isSelected: boolean;
  onSelect: (boardId: BoardId) => void;
}

/**
 * Individual board item in the mobile board picker list
 * Shows thumbnail, name, image count, and selection indicator
 */
export const MobileBoardListItem = memo(
  ({ board, isSelected, onSelect }: MobileBoardListItemProps) => {
    const boardId: BoardId = board === 'none' ? 'none' : board.board_id;
    const boardName = useBoardName(boardId);
    const { currentData: coverImage } = useGetImageDTOQuery(
      board === 'none' ? skipToken : board.cover_image_name ?? skipToken
    );

    const handleSelect = useCallback(() => {
      onSelect(boardId);
    }, [boardId, onSelect]);

    // Determine image count
    const imageCount = board === 'none' ? 0 : board.image_count;
    const displayCount = imageCount === 0 ? 'Empty' : `${imageCount} images`;

    return (
      <Flex
        as="button"
        onClick={handleSelect}
        w="full"
        px={4}
        py={3}
        gap={3}
        alignItems="center"
        bg={isSelected ? 'invokeBlue.500' : 'transparent'}
        _hover={{ bg: isSelected ? 'invokeBlue.600' : 'base.750' }}
        _active={{ bg: isSelected ? 'invokeBlue.700' : 'base.700' }}
        borderRadius="none"
        borderBottomWidth={1}
        borderColor="base.700"
        transition="background-color 0.1s"
      >
        {/* Thumbnail or icon */}
        <Box
          w="48px"
          h="48px"
          flexShrink={0}
          borderRadius="base"
          overflow="hidden"
          bg="base.800"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          {coverImage?.thumbnail_url ? (
            <Image src={coverImage.thumbnail_url} alt={boardName} objectFit="cover" w="full" h="full" />
          ) : (
            <PiFolderSimple size={24} color={isSelected ? 'white' : 'var(--invoke-colors-base-400)'} />
          )}
        </Box>

        {/* Board name and count */}
        <Flex flex={1} flexDirection="column" alignItems="flex-start" gap={1}>
          <Text
            fontSize="md"
            fontWeight="semibold"
            color={isSelected ? 'white' : 'base.100'}
            noOfLines={1}
          >
            {boardName}
          </Text>
          <Text fontSize="sm" color={isSelected ? 'whiteAlpha.800' : 'base.400'}>
            {displayCount}
          </Text>
        </Flex>

        {/* Selection indicator */}
        {isSelected && (
          <PiCheckBold size={24} color="white" style={{ flexShrink: 0 }} />
        )}
      </Flex>
    );
  }
);

MobileBoardListItem.displayName = 'MobileBoardListItem';
