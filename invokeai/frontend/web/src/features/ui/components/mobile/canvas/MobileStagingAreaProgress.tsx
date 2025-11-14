import { Box, Flex, Image, Progress, Text } from '@invoke-ai/ui-library';
import { useStore } from '@nanostores/react';
import { memo } from 'react';
import { $lastProgressEvent } from 'services/events/stores';

export const MobileStagingAreaProgress = memo(() => {
  const progressEvent = useStore($lastProgressEvent);

  // Don't render if no progress
  if (!progressEvent) {
    return null;
  }

  const percentage = progressEvent.percentage ? Math.round(progressEvent.percentage * 100) : undefined;
  const progressImage = progressEvent.image;

  return (
    <Flex
      position="absolute"
      top={0}
      left={0}
      right={0}
      bottom={0}
      zIndex={5}
      bg="blackAlpha.600"
      backdropFilter="blur(4px)"
      alignItems="center"
      justifyContent="center"
      pointerEvents="none"
    >
      <Box pointerEvents="auto" bg="base.800" p={4} borderRadius="lg" shadow="dark-lg" maxW="90%">
        {/* Progress message */}
        <Text fontSize="sm" fontWeight="medium" mb={2} textAlign="center">
          {progressEvent.message}
          {percentage !== undefined && ` (${percentage}%)`}
        </Text>

        {/* Progress bar */}
        {percentage !== undefined && (
          <Progress value={percentage} colorScheme="invokeBlue" size="sm" mb={3} />
        )}

        {/* Preview image if available */}
        {progressImage && (
          <Image
            src={progressImage.dataURL}
            alt="Generation progress"
            borderRadius="md"
            maxH="120px"
            objectFit="contain"
          />
        )}
      </Box>
    </Flex>
  );
});

MobileStagingAreaProgress.displayName = 'MobileStagingAreaProgress';
