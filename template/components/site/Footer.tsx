import Link from 'next/link';
import { site } from '@/site.config';
import { SocialLinks } from '@/components/site/SocialLinks';

export function Footer() {
  const year = new Date().getFullYear();
  const c = site.contact;
  return (
    <footer className="border-t border-black/5">
      <div className="mx-auto grid max-w-6xl gap-8 px-6 py-14 md:grid-cols-3">
        <div>
          <p className="font-display text-lg font-bold">{site.organization.name}</p>
          <p className="mt-2 max-w-xs text-sm text-ink/60">{site.description}</p>
          <SocialLinks className="mt-4 flex gap-3" />
        </div>
        <nav aria-label="Footer" className="text-sm">
          <p className="mb-3 font-semibold">Explore</p>
          <ul className="space-y-2">
            {site.nav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-ink/60 transition-colors hover:text-ink">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="text-sm">
          <p className="mb-3 font-semibold">Contact</p>
          <ul className="space-y-2 text-ink/60">
            {c.whatsapp && (
              <li>
                <a href={`https://wa.me/${c.whatsapp}`} className="hover:text-ink" target="_blank" rel="noopener noreferrer">
                  WhatsApp
                </a>
              </li>
            )}
            {c.phone && <li><a href={`tel:${c.phone}`} className="hover:text-ink">{c.phone}</a></li>}
            {c.email && <li><a href={`mailto:${c.email}`} className="hover:text-ink">{c.email}</a></li>}
            {c.address && <li>{c.address}</li>}
          </ul>
        </div>
      </div>
      <div className="border-t border-black/5 py-6 text-center text-xs text-ink/50">
        © {year} {site.organization.name}. All rights reserved.
      </div>
    </footer>
  );
}
