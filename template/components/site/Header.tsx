import Link from 'next/link';
import { site } from '@/site.config';

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-paper/80 backdrop-blur-md">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4" aria-label="Primary">
        <Link href="/" className="font-display text-lg font-bold tracking-tight">
          {site.name}
        </Link>
        <ul className="hidden items-center gap-8 md:flex">
          {site.nav.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="text-sm font-medium text-ink/70 transition-colors hover:text-ink"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
        <Link
          href="#contact"
          className="rounded-full bg-brand-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition-transform hover:scale-[1.03] hover:bg-brand-700"
        >
          Get started
        </Link>
      </nav>
    </header>
  );
}
