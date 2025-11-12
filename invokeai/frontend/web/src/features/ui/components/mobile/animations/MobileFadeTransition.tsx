// src/features/ui/components/mobile/animations/MobileFadeTransition.tsx
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { memo, useMemo } from 'react';

interface MobileFadeTransitionProps {
  children: ReactNode;
  duration?: number;
}

// Static animation values to prevent recreation
const FADE_INITIAL = { opacity: 0 };
const FADE_ANIMATE = { opacity: 1 };
const FADE_EXIT = { opacity: 0 };
const STYLE = { width: '100%', height: '100%' };

/**
 * Fade transition wrapper for mobile views
 * Provides smooth fade-in animation when content changes
 */
export const MobileFadeTransition = memo(({ children, duration = 0.2 }: MobileFadeTransitionProps) => {
  // Memoize transition object to prevent recreation
  const transition = useMemo(() => ({ duration }), [duration]);

  return (
    <motion.div
      initial={FADE_INITIAL}
      animate={FADE_ANIMATE}
      exit={FADE_EXIT}
      transition={transition}
      style={STYLE}
    >
      {children}
    </motion.div>
  );
});

MobileFadeTransition.displayName = 'MobileFadeTransition';
