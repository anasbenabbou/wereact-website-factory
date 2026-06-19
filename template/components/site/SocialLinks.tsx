import { site } from '@/site.config';

// Inline brand glyphs (lucide removed brand/logo icons for trademark reasons).
const ICONS: Record<string, React.ReactNode> = {
  instagram: (
    <path d="M12 2.2c3.2 0 3.6 0 4.9.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.86s0 3.6-.07 4.86c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.86.07s-3.6 0-4.86-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 01-1.38-.9 3.7 3.7 0 01-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.21 15.6 2.2 15.2 2.2 12s0-3.6.07-4.86c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.4 2.21 8.8 2.2 12 2.2zm0 3.05A6.75 6.75 0 1018.75 12 6.75 6.75 0 0012 5.25zm0 11.13A4.38 4.38 0 1116.38 12 4.38 4.38 0 0112 16.38zm6.96-11.4a1.58 1.58 0 11-1.58-1.57 1.58 1.58 0 011.58 1.57z" />
  ),
  facebook: <path d="M22 12a10 10 0 10-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.78-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0022 12z" />,
  tiktok: <path d="M16.6 5.82a4.28 4.28 0 01-1.01-2.82h-3.1v12.4a2.59 2.59 0 11-2.59-2.59c.27 0 .53.04.78.12V9.77a5.7 5.7 0 00-.78-.05A5.69 5.69 0 1015.6 15.4V9.01a7.35 7.35 0 004.29 1.37V7.28a4.28 4.28 0 01-3.29-1.46z" />,
  youtube: <path d="M23.5 6.2a3 3 0 00-2.11-2.12C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.39.53A3 3 0 00.5 6.2 31.3 31.3 0 000 12a31.3 31.3 0 00.5 5.8 3 3 0 002.11 2.12c1.89.53 9.39.53 9.39.53s7.5 0 9.39-.53a3 3 0 002.11-2.12A31.3 31.3 0 0024 12a31.3 31.3 0 00-.5-5.8zM9.55 15.57V8.43L15.82 12z" />,
};

/** Social links row — renders only the platforms set in site.config.contact.socials. */
export function SocialLinks({ className }: { className?: string }) {
  const s = site.contact.socials;
  const items = (['instagram', 'facebook', 'tiktok', 'youtube'] as const)
    .map((k) => ({ key: k, href: s[k] }))
    .filter((i) => i.href);
  if (!items.length) return null;
  return (
    <div className={className}>
      {items.map(({ key, href }) => (
        <a
          key={key}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={key}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 text-ink/70 transition-colors hover:bg-ink/5 hover:text-ink"
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden>
            {ICONS[key]}
          </svg>
        </a>
      ))}
    </div>
  );
}
