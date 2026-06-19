import { cn } from '@/lib/utils';

/**
 * Bento grid (Aceternity/Magic UI pattern) — modern asymmetric feature grid.
 * Compose <BentoGrid> with <BentoCard className="md:col-span-2" .../> children.
 */
export function BentoGrid({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('grid grid-cols-1 gap-4 md:grid-cols-3 md:auto-rows-[18rem]', className)}>
      {children}
    </div>
  );
}

export function BentoCard({
  children,
  className,
  background,
}: {
  children?: React.ReactNode;
  className?: string;
  background?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        'group relative flex flex-col justify-end overflow-hidden rounded-3xl border border-black/5 bg-white p-7 shadow-sm transition-all hover:shadow-xl',
        className
      )}
    >
      {background && <div className="absolute inset-0 -z-0 opacity-90">{background}</div>}
      <div className="relative z-10 transition-transform duration-300 group-hover:-translate-y-1">{children}</div>
    </div>
  );
}
