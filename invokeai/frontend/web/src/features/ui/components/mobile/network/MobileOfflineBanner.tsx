import { Alert, AlertDescription, AlertIcon, Box } from '@invoke-ai/ui-library';
import { useNetworkStatus } from 'common/hooks/useNetworkStatus';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { memo, useMemo } from 'react';

/**
 * Offline detection banner
 * Shows when network connection is lost
 * Respects prefers-reduced-motion user preference
 */
export const MobileOfflineBanner = memo(() => {
  const { isOnline, wasOffline } = useNetworkStatus();
  const shouldReduceMotion = useReducedMotion();

  // Animation constants that respect reduced motion preference
  const bannerAnimation = useMemo(
    () =>
      shouldReduceMotion
        ? {
            initial: { opacity: 0 },
            animate: { opacity: 1 },
            exit: { opacity: 0 },
          }
        : {
            initial: { y: -50, opacity: 0 },
            animate: { y: 0, opacity: 1 },
            exit: { y: -50, opacity: 0 },
          },
    [shouldReduceMotion]
  );

  return (
    <AnimatePresence>
      {!isOnline && (
        <Box
          as={motion.div}
          {...bannerAnimation}
          position="fixed"
          top={0}
          left={0}
          right={0}
          zIndex={9999}
          role="alert"
          aria-live="assertive"
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
          {...bannerAnimation}
          position="fixed"
          top={0}
          left={0}
          right={0}
          zIndex={9999}
          role="status"
          aria-live="polite"
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
