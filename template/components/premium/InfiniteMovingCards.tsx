import { cn } from '@/lib/utils';

/**
 * Infinite moving cards (Aceternity pattern) — auto-scrolling testimonial/quote
 * row. Built on the Marquee keyframes; pauses on hover.
 */
export function InfiniteMovingCards({
  items,
  className,
  reverse,
}: {
  items: { quote: string; name: string; title?: string }[];
  className?: string;
  reverse?: boolean;
}) {
  return (
    <div className={cn('group flex overflow-hidden p-2 [--duration:50s] [--gap:1.5rem] [gap:var(--gap)]', className)}>
      {Array.from({ length: 2 }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'flex shrink-0 flex-row justify-around [gap:var(--gap)] animate-marquee group-hover:[animation-play-state:paused]',
            reverse && '[animation-direction:reverse]'
          )}
        >
          {items.map((it, j) => (
            <figure
              key={j}
              className="w-[22rem] shrink-0 rounded-2xl border border-black/5 bg-white p-7 shadow-sm"
            >
              <blockquote className="text-ink/80">“{it.quote}”</blockquote>
              <figcaption className="mt-4 text-sm font-semibold text-ink">
                {it.name}
                {it.title && <span className="font-normal text-ink/50"> — {it.title}</span>}
              </figcaption>
            </figure>
          ))}
        </div>
      ))}
    </div>
  );
}
