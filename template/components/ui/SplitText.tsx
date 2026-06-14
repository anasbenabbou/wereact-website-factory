'use client';

import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';

/**
 * Word-by-word reveal for headlines. Splits text into words (no paid plugin) and
 * staggers them up on scroll-in. Renders plain text when reduced-motion is set,
 * so it stays accessible and SEO-readable (real text, not images).
 */
export function SplitText({
  text,
  as: Tag = 'h2',
  className,
}: {
  text: string;
  as?: keyof JSX.IntrinsicElements;
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const words = el.querySelectorAll('[data-word]');
    const ctx = gsap.context(() => {
      gsap.from(words, {
        yPercent: 120,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
        stagger: 0.05,
        scrollTrigger: { trigger: el, start: 'top 85%' },
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    // @ts-expect-error dynamic tag
    <Tag ref={ref} className={className}>
      {text.split(' ').map((w, i) => (
        <span key={i} className="inline-block overflow-hidden align-bottom">
          <span data-word className="inline-block [will-change:transform]">
            {w}&nbsp;
          </span>
        </span>
      ))}
    </Tag>
  );
}
