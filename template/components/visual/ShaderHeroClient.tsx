'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

// Load the WebGL canvas only on the client (ssr:false) and only when motion is
// allowed — keeps it out of SSR/LCP and respects reduced-motion + low-power.
const ShaderHero = dynamic(() => import('./ShaderHero'), { ssr: false });

export function ShaderHeroClient({ colors }: { colors?: [string, string, string] }) {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduce) setEnabled(true);
  }, []);
  if (!enabled) {
    // Static gradient fallback (also the reduced-motion experience).
    return (
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(120%_120%_at_50%_0%,var(--color-brand-200),var(--color-paper)_60%)]"
      />
    );
  }
  return <ShaderHero colors={colors} />;
}
