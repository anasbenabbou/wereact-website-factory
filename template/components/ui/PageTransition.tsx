'use client';

import { motion, useReducedMotion } from 'framer-motion';

/**
 * Page-load / route transition. Drop into Next App Router `template.tsx` so it
 * re-runs on navigation. A subtle reveal + curtain wipe — award-style polish
 * without hurting LCP (content is present immediately, just animated in).
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  if (reduce) return <>{children}</>;
  return (
    <>
      <motion.div
        className="pointer-events-none fixed inset-0 z-[90] origin-top bg-ink"
        initial={{ scaleY: 1 }}
        animate={{ scaleY: 0 }}
        transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
        aria-hidden
      />
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15, ease: 'easeOut' }}
      >
        {children}
      </motion.div>
    </>
  );
}
