import type { MetadataRoute } from 'next';
import { site } from '@/site.config';

/**
 * Sitemap. The factory adds one entry per generated route. Keep `lastModified`
 * fresh on rebuilds so crawlers re-index.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const routes = site.nav.map((n) => n.href);
  const now = new Date();
  return routes.map((path) => ({
    url: new URL(path, site.url).toString(),
    lastModified: now,
    changeFrequency: 'weekly',
    priority: path === '/' ? 1 : 0.7,
  }));
}
