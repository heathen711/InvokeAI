// src/features/ui/components/mobile/animations/MobileFadeTransition.tsx
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { memo } from 'react';

interface MobileFadeTransitionProps {
  children: ReactNode;
  duration?: number;
}

/**
 * Fade transition wrapper for mobile views
 * Provides smooth fade-in animation when content changes
 */
export const MobileFadeTransition = memo(({ children, duration = 0.2 }: MobileFadeTransitionProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration }}
      style={{ width: '100%', height: '100%' }}
    >
      {children}
    </motion.div>
  );
});

MobileFadeTransition.displayName = 'MobileFadeTransition';
