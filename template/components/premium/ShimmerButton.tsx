import { cn } from '@/lib/utils';

/**
 * Shimmer button (Magic UI pattern) — premium CTA with a traveling light edge.
 * Uses the `shimmer-slide` / `spin-around` keyframes in globals.css.
 */
export function ShimmerButton({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { children: React.ReactNode }) {
  return (
    <button
      className={cn(
        'group relative z-0 inline-flex cursor-pointer items-center justify-center overflow-hidden whitespace-nowrap rounded-full border border-white/10 px-7 py-3 font-semibold text-white [background:var(--color-brand-700)] [box-shadow:0_0_24px_-6px_var(--color-brand-500)] transition-transform hover:scale-[1.03]',
        className
      )}
      {...props}
    >
      {/* shimmer */}
      <span className="absolute inset-0 -z-10 overflow-hidden rounded-full">
        <span className="absolute inset-[-100%] animate-spin-around [background:conic-gradient(from_90deg_at_50%_50%,transparent_0%,var(--color-brand-300)_15%,transparent_30%)]" />
      </span>
      <span className="absolute inset-[2px] -z-10 rounded-full [background:var(--color-brand-700)]" />
      {children}
    </button>
  );
}
