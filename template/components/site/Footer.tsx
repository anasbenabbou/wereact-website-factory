import Link from 'next/link';
import { site } from '@/site.config';

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-black/5">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-10 text-sm text-ink/60 md:flex-row">
        <p>
          © {year} {site.organization.name}. All rights reserved.
        </p>
        <ul className="flex gap-6">
          {site.nav.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className="transition-colors hover:text-ink">
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
