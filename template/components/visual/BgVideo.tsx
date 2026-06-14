'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Performance-conscious background video. Shows the poster immediately (good
 * LCP), then lazy-loads + plays the muted loop once in view. On reduced-motion
 * or save-data it stays on the poster image. Use an ffmpeg-optimized mp4/webm
 * (a few MB max) produced by tools/gen-video.mjs.
 */
export function BgVideo({
  src,
  webm,
  poster,
  className,
  overlay = true,
}: {
  src: string;
  webm?: string;
  poster: string;
  className?: string;
  overlay?: boolean;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const saveData = (navigator as any).connection?.saveData;
    if (reduce || saveData) return;

    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setShow(true);
          el.play().catch(() => {});
          io.disconnect();
        }
      },
      { rootMargin: '200px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div className={`absolute inset-0 -z-10 overflow-hidden ${className ?? ''}`}>
      <video
        ref={ref}
        poster={poster}
        muted
        loop
        playsInline
        preload="none"
        className={`h-full w-full object-cover transition-opacity duration-700 ${show ? 'opacity-100' : 'opacity-0'}`}
      >
        {show && webm && <source src={webm} type="video/webm" />}
        {show && <source src={src} type="video/mp4" />}
      </video>
      {/* Poster fallback layer (visible until video fades in / when video is off) */}
      <img
        src={poster}
        alt=""
        aria-hidden
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${show ? 'opacity-0' : 'opacity-100'}`}
      />
      {overlay && <div className="absolute inset-0 bg-gradient-to-b from-ink/30 via-ink/10 to-paper" />}
    </div>
  );
}
