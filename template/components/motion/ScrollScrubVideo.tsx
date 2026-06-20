'use client';

import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';

/**
 * Scroll-scrubbed video — the video's playhead is driven by scroll progress over
 * a pinned section (cinematic product/UGC reveal). Use an ffmpeg-optimized, short,
 * keyframe-dense mp4. Reduced-motion → shows the poster, plays normally muted.
 */
export function ScrollScrubVideo({
  src,
  poster,
  children,
  className,
  scrollLength = '200%',
}: {
  src: string;
  poster?: string;
  children?: React.ReactNode; // overlaid copy
  className?: string;
  scrollLength?: string;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = wrap.current;
    const v = video.current;
    if (!el || !v) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      v.muted = true;
      v.loop = true;
      v.play().catch(() => {});
      return;
    }

    const ctx = gsap.context(() => {
      const build = () => {
        const dur = v.duration || 1;
        ScrollTrigger.create({
          trigger: el,
          start: 'top top',
          end: `+=${scrollLength}`,
          pin: true,
          scrub: 0.5,
          onUpdate: (self) => {
            v.currentTime = dur * self.progress;
          },
        });
      };
      if (v.readyState >= 1) build();
      else v.addEventListener('loadedmetadata', build, { once: true });
    }, el);
    return () => ctx.revert();
  }, [scrollLength]);

  return (
    <section ref={wrap} className={`relative h-screen w-full overflow-hidden ${className ?? ''}`}>
      <video
        ref={video}
        src={src}
        poster={poster}
        muted
        playsInline
        preload="auto"
        className="absolute inset-0 h-full w-full object-cover"
      />
      {children && <div className="relative z-10 flex h-full items-center justify-center">{children}</div>}
    </section>
  );
}
