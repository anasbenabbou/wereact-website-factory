'use client';

import { Children, useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';

/**
 * Sticky stacking cards — each card pins and the next scrolls over it with a
 * subtle scale-down (premium "process"/"features" storytelling). Pass cards as
 * children. Reduced-motion → plain stacked sections.
 */
export function StickyStack({ children, className }: { children: React.ReactNode; className?: string }) {
  const wrap = useRef<HTMLDivElement>(null);
  const items = Children.toArray(children);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>('[data-stack-card]');
      cards.forEach((card, i) => {
        if (i === cards.length - 1) return;
        gsap.to(card, {
          scale: 0.92,
          opacity: 0.6,
          ease: 'none',
          scrollTrigger: {
            trigger: cards[i + 1],
            start: 'top bottom',
            end: 'top top',
            scrub: true,
          },
        });
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={wrap} className={className}>
      {items.map((child, i) => (
        <div
          key={i}
          data-stack-card
          className="sticky top-[12vh] mb-[8vh] [will-change:transform,opacity]"
          style={{ zIndex: i + 1 }}
        >
          {child}
        </div>
      ))}
    </div>
  );
}
