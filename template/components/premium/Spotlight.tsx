'use client';

import { useRef, useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * Cursor-following spotlight (Aceternity pattern) — wrap a hero/card; a soft
 * radial glow follows the pointer. Disabled gracefully on touch.
 */
export function Spotlight({
  children,
  className,
  color = 'rgba(224,165,59,0.18)',
}: {
  children: React.ReactNode;
  className?: string;
  color?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: -200, y: -200 });
  const [show, setShow] = useState(false);

  return (
    <div
      ref={ref}
      onMouseMove={(e) => {
        const r = ref.current?.getBoundingClientRect();
        if (r) setPos({ x: e.clientX - r.left, y: e.clientY - r.top });
      }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      className={cn('relative overflow-hidden', className)}
    >
      <div
        className="pointer-events-none absolute -inset-px z-0 transition-opacity duration-300"
        style={{
          opacity: show ? 1 : 0,
          background: `radial-gradient(600px circle at ${pos.x}px ${pos.y}px, ${color}, transparent 40%)`,
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
