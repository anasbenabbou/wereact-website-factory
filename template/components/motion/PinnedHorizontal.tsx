'use client';

import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';

/**
 * Pinned horizontal scroll — the section pins and its track scrolls sideways as
 * you scroll down (galleries, tours, fleet, portfolio, process steps). Children
 * are the horizontal items. Reduced-motion → normal horizontal overflow-scroll.
 */
export function PinnedHorizontal({
  children,
  className,
  itemClassName,
}: {
  children: React.ReactNode;
  className?: string;
  itemClassName?: string;
}) {
  const section = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sec = section.current;
    const trk = track.current;
    if (!sec || !trk) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = gsap.context(() => {
      const distance = trk.scrollWidth - window.innerWidth;
      if (distance <= 0) return;
      gsap.to(trk, {
        x: -distance,
        ease: 'none',
        scrollTrigger: {
          trigger: sec,
          start: 'top top',
          end: () => `+=${distance}`,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });
    }, sec);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={section} className={`relative overflow-hidden ${className ?? ''}`}>
      <div
        ref={track}
        className={`flex w-max gap-8 px-6 py-16 max-md:w-full max-md:overflow-x-auto ${itemClassName ?? ''}`}
      >
        {children}
      </div>
    </section>
  );
}
