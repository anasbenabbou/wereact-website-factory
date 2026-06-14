'use client';

import { useEffect, useRef, useState } from 'react';
import LottiePlayer from 'lottie-react';

/**
 * Lazy Lottie animation. Loads JSON from /public (or a URL) when scrolled into
 * view, plays once visible. Use free animations from lottiefiles.com. Renders
 * nothing extra on reduced-motion (shows the last frame static).
 */
export function Lottie({ src, className, loop = true }: { src: string; className?: string; loop?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<unknown>(null);
  const [reduce, setReduce] = useState(false);

  useEffect(() => {
    setReduce(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        fetch(src)
          .then((r) => r.json())
          .then(setData)
          .catch(() => {});
        io.disconnect();
      }
    });
    io.observe(el);
    return () => io.disconnect();
  }, [src]);

  return (
    <div ref={ref} className={className}>
      {data ? <LottiePlayer animationData={data} loop={loop && !reduce} autoplay={!reduce} /> : null}
    </div>
  );
}
