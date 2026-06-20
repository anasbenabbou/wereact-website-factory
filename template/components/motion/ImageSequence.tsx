'use client';

import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';

/**
 * Canvas image-sequence driven by scroll — the "product rotates as you scroll"
 * effect (watch/car/bottle 360). Provide an array of frame URLs (e.g. /seq/0001.webp..).
 * Preloads frames, pins the section, draws the frame for the current scroll progress.
 * Reduced-motion → shows the first frame, static.
 */
export function ImageSequence({
  frames,
  className,
  scrollLength = '300%',
  children,
}: {
  frames: string[];
  className?: string;
  scrollLength?: string;
  children?: React.ReactNode;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = wrap.current;
    const cv = canvas.current;
    if (!el || !cv || frames.length === 0) return;
    const ctx2d = cv.getContext('2d');
    if (!ctx2d) return;

    const images: HTMLImageElement[] = [];
    let loaded = 0;
    const state = { frame: 0 };

    const draw = (i: number) => {
      const img = images[Math.max(0, Math.min(frames.length - 1, i))];
      if (!img || !img.complete) return;
      const ratio = Math.max(cv.width / img.width, cv.height / img.height);
      const w = img.width * ratio;
      const h = img.height * ratio;
      ctx2d.clearRect(0, 0, cv.width, cv.height);
      ctx2d.drawImage(img, (cv.width - w) / 2, (cv.height - h) / 2, w, h);
    };
    const resize = () => {
      cv.width = el.clientWidth;
      cv.height = el.clientHeight;
      draw(state.frame);
    };

    frames.forEach((src, idx) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        loaded++;
        if (idx === 0) resize();
      };
      images[idx] = img;
    });
    resize();
    window.addEventListener('resize', resize);

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let ctx: ReturnType<typeof gsap.context> | undefined;
    if (!reduce) {
      ctx = gsap.context(() => {
        gsap.to(state, {
          frame: frames.length - 1,
          ease: 'none',
          snap: 'frame',
          scrollTrigger: { trigger: el, start: 'top top', end: `+=${scrollLength}`, pin: true, scrub: 0.5 },
          onUpdate: () => draw(Math.round(state.frame)),
        });
      }, el);
    }
    return () => {
      window.removeEventListener('resize', resize);
      ctx?.revert();
    };
  }, [frames, scrollLength]);

  return (
    <section ref={wrap} className={`relative h-screen w-full overflow-hidden ${className ?? ''}`}>
      <canvas ref={canvas} className="absolute inset-0 h-full w-full" />
      {children && <div className="relative z-10 flex h-full items-center justify-center">{children}</div>}
    </section>
  );
}
