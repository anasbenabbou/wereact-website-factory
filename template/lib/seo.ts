import type { Metadata } from 'next';
import { site } from '@/site.config';

/**
 * Build per-page Next.js Metadata with sane SEO defaults: canonical URL,
 * OpenGraph + Twitter cards, robots directives. Call from each route's
 * `generateMetadata` / `metadata` export.
 */
export function pageMetadata(opts: {
  title?: string;
  description?: string;
  path?: string; // e.g. "/about"
  image?: string;
  noindex?: boolean;
} = {}): Metadata {
  const title = opts.title ? `${opts.title} — ${site.name}` : site.title;
  const description = opts.description || site.description;
  const path = opts.path || '/';
  const url = new URL(path, site.url).toString();
  const image = opts.image || site.ogImage;
  const imageUrl = image.startsWith('http') ? image : new URL(image, site.url).toString();

  return {
    metadataBase: new URL(site.url),
    title,
    description,
    alternates: { canonical: url },
    robots: opts.noindex
      ? { index: false, follow: false }
      : { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
    openGraph: {
      type: 'website',
      url,
      title,
      description,
      siteName: site.name,
      locale: site.locale,
      images: [{ url: imageUrl, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
      ...(site.twitter ? { creator: site.twitter } : {}),
    },
  };
}
