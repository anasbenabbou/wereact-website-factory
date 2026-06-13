import { site } from '@/site.config';

/**
 * JSON-LD structured data. Schema.org markup is a primary SEO signal and is
 * heavily used by AI answer engines (GEO) to extract entities, facts, and FAQs.
 * Render <Schema json={...} /> in a layout or page; compose with the helpers.
 */
export function Schema({ json }: { json: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      // JSON-LD is static, trusted data we generate — safe to inline.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
    />
  );
}

export function organizationSchema() {
  const o = site.organization;
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: o.name,
    url: site.url,
    logo: new URL(o.logo, site.url).toString(),
    ...(o.sameAs.length ? { sameAs: o.sameAs } : {}),
    ...(o.contact.email || o.contact.telephone
      ? {
          contactPoint: {
            '@type': 'ContactPoint',
            ...(o.contact.email ? { email: o.contact.email } : {}),
            ...(o.contact.telephone ? { telephone: o.contact.telephone } : {}),
            ...(o.contact.areaServed ? { areaServed: o.contact.areaServed } : {}),
            contactType: 'customer service',
          },
        }
      : {}),
  };
}

export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: site.name,
    url: site.url,
  };
}

/** FAQ schema — strong GEO signal; surfaces directly in AI Overviews. */
export function faqSchema(qa: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: qa.map((x) => ({
      '@type': 'Question',
      name: x.question,
      acceptedAnswer: { '@type': 'Answer', text: x.answer },
    })),
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: new URL(it.path, site.url).toString(),
    })),
  };
}
