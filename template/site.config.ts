/**
 * Central site configuration — the factory fills these in per client.
 * Everything SEO/GEO and brand-related is derived from here so a site can be
 * re-skinned by editing one file.
 */
export const site = {
  name: 'Wereact Site',
  // Used for canonical URLs, OG, sitemap. Set to the deployed URL.
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://example.vercel.app',
  title: 'Wereact Site — production-grade websites',
  description:
    'A distinctive, fast, SEO- and GEO-optimized website built by the Wereact Website Factory.',
  // Default social/OG image (generated into /public by the Asset Engine).
  ogImage: '/og.png',
  locale: 'en_US',
  twitter: '', // @handle, optional
  // Organization details power JSON-LD (E-E-A-T / entity signals for SEO + GEO).
  organization: {
    name: 'Wereact Site',
    logo: '/logo.svg',
    sameAs: [] as string[], // social profile URLs — strengthens entity graph
    contact: { email: '', telephone: '', areaServed: '' },
  },
  nav: [
    { label: 'Home', href: '/' },
  ],
} as const;

export type Site = typeof site;
