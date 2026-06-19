'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

// shadergradient.co animated gradient — client-only (WebGL), kept out of SSR/LCP.
const ShaderGradientBg = dynamic(() => import('./ShaderGradientBg'), { ssr: false });

export function ShaderGradientHero({
  colors,
  type,
}: {
  colors?: [string, string, string];
  type?: 'plane' | 'sphere' | 'waterPlane';
}) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) setOn(true);
  }, []);
  if (!on) {
    // Static gradient fallback (also the reduced-motion experience).
    return (
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(120%_120%_at_50%_0%,var(--color-brand-300),var(--color-paper)_60%)]"
      />
    );
  }
  return (
    <div aria-hidden className="absolute inset-0 -z-10">
      <ShaderGradientBg colors={colors} type={type} />
    </div>
  );
}
