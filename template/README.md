# Wereact site template

Next.js (App Router) + Tailwind CSS v4 starter the factory clones per client.

## What's baked in
- **SEO:** per-page metadata (`lib/seo.ts`), canonical URLs, OpenGraph/Twitter
  cards, `app/sitemap.ts`, `app/robots.ts`.
- **GEO:** JSON-LD via `components/Schema.tsx` (Organization, WebSite, FAQPage,
  Breadcrumb), FAQ section that emits FAQ schema, semantic HTML, entity-rich
  config in `site.config.ts`.
- **Design:** Tailwind v4 theme tokens (`app/globals.css`), display + body
  fonts, framer-motion scroll reveals that respect reduced-motion.
- **Sections:** Header, Hero, Features, FAQ, CTA, Footer (in `components/site/`).

## Per-project flow (the factory does this)
1. Edit `site.config.ts` (name, url, brand, org, nav).
2. Override theme tokens in `app/globals.css`.
3. Fill sections with real copy; add routes under `app/`.
4. Drop generated images into `public/` (Asset Engine).
5. `npm install && npm run build` → deploy to Vercel.

## Local dev
```bash
npm install
npm run dev
```
