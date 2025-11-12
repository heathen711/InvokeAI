import { Alert, AlertDescription, AlertIcon, Box } from '@invoke-ai/ui-library';
import { useNetworkStatus } from 'common/hooks/useNetworkStatus';
import { AnimatePresence, motion } from 'framer-motion';
import { memo } from 'react';

// Animation constants to prevent recreation on each render
const BANNER_ANIMATION = {
  initial: { y: -50, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  exit: { y: -50, opacity: 0 },
};

/**
 * Offline detection banner
 * Shows when network connection is lost
 */
export const MobileOfflineBanner = memo(() => {
  const { isOnline, wasOffline } = useNetworkStatus();

  return (
    <AnimatePresence>
      {!isOnline && (
        <Box
          as={motion.div}
          {...BANNER_ANIMATION}
          position="fixed"
          top={0}
          left={0}
          right={0}
          zIndex={9999}
        >
          <Alert status="warning" variant="solid">
            <AlertIcon />
            <AlertDescription>No internet connection. Some features may not work.</AlertDescription>
          </Alert>
        </Box>
      )}
      {isOnline && wasOffline && (
        <Box
          as={motion.div}
          {...BANNER_ANIMATION}
          position="fixed"
          top={0}
          left={0}
          right={0}
          zIndex={9999}
        >
          <Alert status="success" variant="solid">
            <AlertIcon />
            <AlertDescription>Back online!</AlertDescription>
          </Alert>
        </Box>
      )}
    </AnimatePresence>
  );
});

MobileOfflineBanner.displayName = 'MobileOfflineBanner';
