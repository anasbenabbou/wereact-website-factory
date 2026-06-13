import type { MetadataRoute } from 'next';
import { site } from '@/site.config';

/**
 * robots.txt — allows all crawlers (including AI answer-engine bots, which is
 * desirable for GEO) and points to the sitemap.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/' }],
    sitemap: new URL('/sitemap.xml', site.url).toString(),
    host: site.url,
  };
}
