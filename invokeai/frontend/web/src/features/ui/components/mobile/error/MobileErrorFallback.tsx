// src/features/ui/components/mobile/error/MobileErrorFallback.tsx
import { Box, Button, Flex, Text } from '@invoke-ai/ui-library';
import { memo } from 'react';
import { PiWarningBold } from 'react-icons/pi';

interface MobileErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

/**
 * Mobile error fallback UI
 * Displays when component error occurs
 */
export const MobileErrorFallback = memo(({ error, resetErrorBoundary }: MobileErrorFallbackProps) => {
  return (
    <Flex
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      height="full"
      width="full"
      p={8}
      gap={4}
      bg="base.950"
    >
      <Box color="red.400">
        <PiWarningBold size={64} />
      </Box>

      <Flex flexDirection="column" gap={2} alignItems="center" textAlign="center">
        <Text fontSize="xl" fontWeight="bold" color="base.100">
          Something went wrong
        </Text>
        <Text fontSize="sm" color="base.400" maxWidth="300px">
          An unexpected error occurred. Please try again.
        </Text>
        {import.meta.env.MODE === 'development' && (
          <Box
            mt={4}
            p={3}
            bg="red.900"
            borderRadius="md"
            fontSize="xs"
            fontFamily="mono"
            color="red.200"
            maxWidth="90vw"
            overflowX="auto"
          >
            {error.message}
          </Box>
        )}
      </Flex>

      <Button onClick={resetErrorBoundary} colorScheme="blue" size="lg" width="full" maxWidth="200px">
        Try Again
      </Button>
    </Flex>
  );
});

MobileErrorFallback.displayName = 'MobileErrorFallback';
