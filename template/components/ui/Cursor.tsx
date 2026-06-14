'use client';

import { useEffect, useRef } from 'react';

/**
 * Custom trailing cursor — a hallmark of award-style sites. Grows over
 * interactive elements ([data-cursor] or a/button). Hidden on touch devices
 * and when reduced-motion is set. Pure DOM + rAF for performance.
 */
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = dot.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (window.matchMedia('(pointer: coarse)').matches) return;

    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let x = mx;
    let y = my;

    const move = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
    };
    const over = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      const active = t.closest('a, button, [data-cursor]');
      el.style.transform = `translate(-50%, -50%) scale(${active ? 2.6 : 1})`;
      el.style.opacity = active ? '0.35' : '1';
    };

    let raf = 0;
    const loop = () => {
      x += (mx - x) * 0.18;
      y += (my - y) * 0.18;
      el.style.left = `${x}px`;
      el.style.top = `${y}px`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    window.addEventListener('mousemove', move);
    window.addEventListener('mouseover', over);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseover', over);
    };
  }, []);

  return (
    <div
      ref={dot}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[100] hidden h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-500 mix-blend-difference transition-[transform,opacity] duration-200 md:block"
    />
  );
}
