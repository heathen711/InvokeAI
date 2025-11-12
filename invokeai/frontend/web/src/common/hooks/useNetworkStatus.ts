import { useEffect, useState } from 'react';

/**
 * Hook to detect online/offline status
 * Returns current network status and state
 */
export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    let timeoutId: number | null = null;

    const handleOnline = () => {
      setIsOnline(true);
      setWasOffline(true);

      // Clear any existing timeout
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }

      // Reset after showing reconnection message
      timeoutId = window.setTimeout(() => {
        setWasOffline(false);
        timeoutId = null;
      }, 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);

      // Clean up timeout on unmount
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }
    };
  }, []);

  return { isOnline, wasOffline };
};
