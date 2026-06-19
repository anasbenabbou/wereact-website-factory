import { cn } from '@/lib/utils';

/**
 * Animated gradient text (Magic UI pattern) — a flowing brand-colored gradient
 * across text. Great for an eyebrow/kicker or a single hero word.
 * Uses the `gradient-x` keyframe in globals.css.
 */
export function AnimatedGradientText({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-block animate-gradient-x bg-[linear-gradient(to_right,var(--color-brand-600),var(--color-brand-400),var(--color-brand-700),var(--color-brand-600))] bg-[length:200%_auto] bg-clip-text text-transparent',
        className
      )}
    >
      {children}
    </span>
  );
}
