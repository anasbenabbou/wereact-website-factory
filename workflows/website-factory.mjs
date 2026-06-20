export const meta = {
  name: 'website-factory',
  description: 'Turn a freeform brief into a deployed, SEO/GEO-optimized Next.js website (full agent crew)',
  whenToUse: 'When the operator gives a website brief and wants a finished, deployed *.vercel.app preview',
  phases: [
    { title: 'Strategy', detail: 'intake.md → structured spec' },
    { title: 'Research', detail: 'auto-find + distill 10 award sites in the niche' },
    { title: 'Design', detail: '3 award-grade art directions + judge' },
    { title: 'Interaction', detail: 'motion & interaction design spec' },
    { title: 'Content', detail: 'copy + assets (images/video) in parallel' },
    { title: 'Build', detail: 'assemble Next.js app w/ motion + WebGL + video' },
    { title: 'SEO/GEO', detail: 'schema, meta, claude-seo audit + fixes' },
    { title: 'Deploy', detail: 'GitHub repo + Vercel preview' },
    { title: 'QA', detail: '5 lenses incl. award-craft, in real browser' },
    { title: 'Fix', detail: 'apply QA fixes + redeploy' },
  ],
};

// args: { brief: string, slug: string, clientDir: string, factoryRoot: string }
// The Workflow runtime may deliver `args` as a JSON STRING — parse defensively.
let A = {};
try { A = typeof args === 'string' ? JSON.parse(args) : (args || {}); } catch { A = {}; }
const brief = A.brief || 'A modern marketing website.';
const slug = A.slug || 'client-site';
const FACTORY = A.factoryRoot || '/Users/apple/Desktop/wereact-website-factory';
const DIR = A.clientDir || `${FACTORY}/clients/${slug}`;
const TEMPLATE = `${FACTORY}/template`;
const GENIMG = `${FACTORY}/tools/gen-image.mjs`;
const GENVID = `${FACTORY}/tools/gen-video.mjs`;

// ---- schemas --------------------------------------------------------------
const SPEC_SCHEMA = {
  type: 'object',
  required: ['businessName', 'goal', 'audience', 'tone', 'pages', 'sections', 'keywords', 'brand'],
  properties: {
    businessName: { type: 'string' },
    tagline: { type: 'string' },
    goal: { type: 'string' },
    audience: { type: 'string' },
    tone: { type: 'string' },
    brandDirection: { type: 'string', description: 'colors, mood, personality' },
    pages: { type: 'array', items: { type: 'string' } },
    sections: { type: 'array', items: { type: 'string' }, description: 'home page sections in order' },
    offerings: {
      type: 'array',
      description: 'products/services/tours from intake (§3) — real content for cards/detail pages',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          duration: { type: 'string' },
          price: { type: 'string' },
          oneLiner: { type: 'string' },
          highlights: { type: 'array', items: { type: 'string' } },
          included: { type: 'string' },
        },
      },
    },
    trust: {
      type: 'object',
      description: 'credibility signals from intake (§4) — power "why us", stats, badges',
      properties: {
        founded: { type: 'string' },
        stats: { type: 'array', items: { type: 'string' }, description: 'e.g. "2,000+ trips", "4.9★ (600 reviews)"' },
        awards: { type: 'array', items: { type: 'string' } },
        guarantees: { type: 'array', items: { type: 'string' } },
      },
    },
    makePublic: { type: 'boolean', description: 'intake §11 "Make deployment public?" — if true, deployment protection should be off' },
    keywords: { type: 'array', items: { type: 'string' }, description: 'primary SEO keywords' },
    geoQuestions: { type: 'array', items: { type: 'string' }, description: 'questions users ask AI engines this site should answer' },
    referenceSites: { type: 'array', items: { type: 'string' }, description: 'inspiration URLs the client gave, if any' },
    pageStructure: { type: 'string', enum: ['multi-page', 'one-page'], description: 'from intake; default one-page if unclear and few services, else multi-page' },
    languages: { type: 'array', items: { type: 'string' }, description: 'e.g. ["en"] or ["en","fr"]; multilingual if >1' },
    contact: {
      type: 'object',
      description: 'Contact + booking + socials from intake — render WhatsApp float, social links, contact section.',
      properties: {
        whatsapp: { type: 'string', description: 'full intl number digits only, or ""' },
        phone: { type: 'string' },
        email: { type: 'string' },
        address: { type: 'string' },
        bookingMethod: { type: 'string' },
        instagram: { type: 'string' },
        facebook: { type: 'string' },
        tiktok: { type: 'string' },
        youtube: { type: 'string' },
      },
    },
    brand: {
      type: 'object',
      description: 'Resolved brand. Values from branding.md are LOCKED (obey them); blanks are for the designer to fill.',
      properties: {
        primaryColor: { type: 'string', description: 'hex or "" if not provided' },
        accentColor: { type: 'string' },
        neutral: { type: 'string' },
        displayFont: { type: 'string' },
        bodyFont: { type: 'string' },
        logoPath: { type: 'string', description: 'relative path to provided logo in assets/, or "" if none → generate' },
        locked: { type: 'array', items: { type: 'string' }, description: 'which brand fields the client provided (must be obeyed): e.g. ["primaryColor","displayFont","logo"]' },
        motionIntensity: { type: 'string', description: 'subtle|medium|bold from design.md, or "" ' },
        heroTreatment: { type: 'string', description: 'shader|video|image|split from design.md, or "" ' },
        mood: { type: 'string', description: 'aesthetic from design.md, or "" ' },
      },
    },
  },
};

const DESIGN_SCHEMA = {
  type: 'object',
  required: ['name', 'rationale', 'palette', 'fonts', 'css'],
  properties: {
    name: { type: 'string' },
    rationale: { type: 'string' },
    palette: { type: 'object', description: 'brand-50..900 hex + ink/paper' },
    fonts: { type: 'object', description: '{display, body} Google Font names' },
    css: { type: 'string', description: 'full @theme block + any global tweaks for app/globals.css' },
    heroPrompt: { type: 'string', description: 'image prompt for the hero background' },
  },
};

const JUDGE_SCHEMA = {
  type: 'object',
  required: ['winnerIndex', 'why'],
  properties: { winnerIndex: { type: 'number' }, why: { type: 'string' } },
};

const INTERACTION_SCHEMA = {
  type: 'object',
  required: ['concept', 'heroTreatment', 'interactions'],
  properties: {
    concept: { type: 'string', description: 'the motion concept / signature moment' },
    heroTreatment: { type: 'string', enum: ['shader', 'gradient', 'video', 'image', 'split'], description: 'hero background: shader=template WebGL gradient · gradient=shadergradient.co animated gradient (premium) · video · image · split' },
    interactions: {
      type: 'array',
      description: 'specific motions to implement using the template kit',
      items: {
        type: 'object',
        required: ['where', 'effect', 'component'],
        properties: {
          where: { type: 'string', description: 'section/element' },
          effect: { type: 'string', description: 'what happens' },
          component: { type: 'string', description: 'SmoothScroll|Cursor|Magnetic|Parallax|SplitText|PageTransition|BgVideo|ShaderHeroClient|Lottie|framer-motion' },
        },
      },
    },
  },
};

const QA_SCHEMA = {
  type: 'object',
  required: ['lens', 'pass', 'findings'],
  properties: {
    lens: { type: 'string' },
    pass: { type: 'boolean' },
    findings: {
      type: 'array',
      items: {
        type: 'object',
        required: ['severity', 'issue', 'fix'],
        properties: { severity: { type: 'string' }, issue: { type: 'string' }, fix: { type: 'string' } },
      },
    },
  },
};

const DEPLOY_SCHEMA = {
  type: 'object',
  required: ['ok', 'previewUrl'],
  properties: { ok: { type: 'boolean' }, previewUrl: { type: 'string' }, repoUrl: { type: 'string' }, notes: { type: 'string' } },
};

// ---- Stage 1: Strategy ----------------------------------------------------
phase('Strategy');
const spec = await agent(
  `You are the Strategist for a premium web studio. Produce a precise website spec.

FIRST, read the client folder ${DIR} (use Bash/Read):
  - intake.md      → the single intake form: business, goal/audience, pages & content, CONTACT & booking
                     (WhatsApp/phone/email/socials), brand, design taste, practical. (Older folders may
                     instead have brief.md/branding.md/design.md — read those if intake.md is absent.)
  - assets/        → list it; if a logo (logo.svg/png) exists, set brand.logoPath to its relative path and add "logo" to brand.locked
Also consider this freeform brief (may be empty): """${brief}"""

RULES:
- Any value the client SUPPLIED (non-empty, not "you decide") is LOCKED — copy it verbatim (into brand.*, contact.*,
  pageStructure, languages) and add brand keys to brand.locked. The crew must obey locked values, not reinvent them.
- For every blank/"you decide" brand field, leave brand.* empty (the designer fills it) — do NOT guess locked values.
- contact.*: copy exactly what's given (normalize whatsapp to digits only, with country code). Leave "" if absent.
- pageStructure: use the form's choice; if "you decide", pick multi-page when there are many tours/services, else one-page.
- languages: from the form (default ["en"] if unspecified).
- Extract §3 offerings (name/duration/price/oneLiner/highlights/included) into spec.offerings, and §4 credibility into
  spec.trust (founded/stats/awards/guarantees) — verbatim where given, sensibly generated where blank.
- Set spec.makePublic from §11 "Make deployment public?" (true if yes).
- Always derive SEO keywords + GEO questions.

Output the structured spec — resolved brand, contact, offerings, trust, pageStructure, languages, makePublic, referenceSites.`,
  { label: 'strategist', phase: 'Strategy', schema: SPEC_SCHEMA }
);
if (!spec) {
  log('Strategy stage failed — the strategist agent returned nothing (often an account session/usage limit or API error). Stopping cleanly; re-run when capacity is back.');
  return { stoppedAt: 'strategy', reason: 'strategist returned null (likely session/usage limit)' };
}
const lockedList = spec?.brand?.locked || [];
log(`Strategy: ${spec.businessName} | locked brand: ${lockedList.length ? lockedList.join(', ') : 'none (factory designs all)'}${spec?.brand?.logoPath ? ' | logo provided' : ''}`);

// ---- Stage 1b: Inspiration Research (auto) --------------------------------
// Web-search ~10 award-winning / premium sites in the niche, study them, distill
// WHY they look premium into a reusable design-context the designers must honor.
phase('Research');
const RESEARCH_SCHEMA = {
  type: 'object',
  required: ['references', 'principles'],
  properties: {
    references: {
      type: 'array',
      description: '8-12 premium/award sites found',
      items: {
        type: 'object',
        required: ['url', 'whyPremium'],
        properties: { url: { type: 'string' }, name: { type: 'string' }, whyPremium: { type: 'string' } },
      },
    },
    principles: {
      type: 'array', items: { type: 'string' },
      description: 'concrete, reusable design rules distilled from the references (layout, type, color, spacing, motion, imagery, sections)',
    },
    paletteIdeas: { type: 'array', items: { type: 'string' } },
    layoutPatterns: { type: 'array', items: { type: 'string' } },
    summary: { type: 'string', description: 'a tight art-direction brief grounded in the references' },
  },
};
const research = await agent(
  `You are a design researcher. Find what PREMIUM looks like for: ${spec.businessName} — ${spec.goal}. Niche/audience: ${spec.audience}.
Client reference sites (if any): ${(spec.referenceSites || []).join(', ') || 'none'}.

1. Use WebSearch (find it via ToolSearch: "web search") to find ~10 award-winning / premium websites in this niche and adjacent ones.
   Good queries: "best ${spec.businessName.split(' ')[0]} websites awwwards", "<niche> site of the day awwwards", "premium <niche> web design".
   Curated galleries to draw from: awwwards.com, godly.website, land-book.com, lapa.ninja,
   **supahero.io** (best-in-class HERO sections — always study this for the hero), and
   **dark.design** (premium dark-theme sites — prioritize when the brief wants a dark/cinematic look).
2. Pick the 8-12 strongest. For a few of the best, use WebFetch to study them. Capture at least one standout HERO pattern (from supahero or the references) to inform the hero design.
3. Distill WHY they read as premium into concrete, reusable PRINCIPLES (layout systems, type scale & pairing, color use,
   spacing/whitespace, motion, imagery treatment, section patterns) — rules the designer can apply.
4. Write the findings to ${DIR}/design-context.md (references + principles + a tight art-direction summary).

Return the structured research. Be specific and opinionated — this is the taste benchmark the build must hit.`,
  { label: 'design-researcher', phase: 'Research', schema: RESEARCH_SCHEMA }
);
log(`Research: ${research?.references?.length || 0} premium references, ${research?.principles?.length || 0} design principles distilled`);

// ---- Stage 2: Design (3 variants + judge) ---------------------------------
phase('Design');
const designs = (await parallel(
  ['bold & premium', 'clean & editorial', 'vivid & experimental'].map((angle, i) => () =>
    agent(
      `You are an award-winning art director designing an Awwwards-caliber site. Direction #${i + 1}, angle: "${angle}".
Business: ${spec.businessName}. Tone: ${spec.tone}. Brand direction: ${spec.brandDirection || 'n/a'}. Audience: ${spec.audience}.

LOCKED BRAND (you MUST obey these — they came from the client; do not change them):
${(spec.brand?.locked || []).length
  ? (spec.brand.locked || []).map((k) => `  - ${k}: ${spec.brand[k] ?? (k === 'logo' ? spec.brand.logoPath : '')}`).join('\n')
  : '  (none — you have full creative freedom on color/type)'}
Client design cues (honor if present): mood=${spec.brand?.mood || 'open'}, motion=${spec.brand?.motionIntensity || 'your call'}, hero=${spec.brand?.heroTreatment || 'your call'}.

INSPIRATION RESEARCH — hit this premium benchmark (auto-found award sites in the niche):
Summary: ${research?.summary || 'n/a'}
Principles to apply:
${(research?.principles || []).map((p) => `  • ${p}`).join('\n') || '  • (use your best award-grade judgement)'}
Reference sites: ${(research?.references || []).slice(0, 8).map((r) => r.url).join(', ') || (spec.referenceSites || []).join(', ') || 'none'}
Compose using the template's premium component kit (BentoGrid, TiltCard, Marquee, Spotlight, InfiniteMovingCards, ShimmerButton, AnimatedGradientText).
For any LOCKED color/font, build the full ramp/system AROUND it (e.g. derive brand-50..900 from the locked primary). For
unlocked fields, design freely.

Aim for Site-of-the-Day craft: a strong, ORIGINAL art direction with a memorable concept — not a template. AVOID all
generic-AI tells (default purple gradients, Inter everywhere, centered hero + 3 cards). Think distinctive type pairing
(use characterful display fonts), confident color, generous negative space or bold maximalism, and a clear visual hook.
Invoke the frontend-design skill's principles.

Deliver: a 9-step brand color ramp (brand-50..900) + ink/paper hex; Google Font choices for display + body (pick fonts
with real personality); a ready-to-paste Tailwind v4 @theme CSS block matching the template token names
(--color-brand-50.., --color-ink, --color-paper, --font-sans, --font-display); a named concept + rationale; and a vivid
hero direction (describe whether the hero should be an animated WebGL gradient, a video loop, or photographic, with a prompt).`,
      { label: `designer-${i + 1}`, phase: 'Design', schema: DESIGN_SCHEMA }
    )
  )
)).filter(Boolean);

// Graceful stop if the whole design stage failed (e.g. session/usage limit, API errors).
if (designs.length === 0) {
  log('Design stage produced no results — all designer agents failed (often an account session/usage limit or API errors). Stopping cleanly; re-run when capacity is back.');
  return { stoppedAt: 'design', reason: 'no designs produced (likely session/usage limit)', spec };
}

const judgeResult = await agent(
  `You are the creative director. Here are ${designs.length} design directions for ${spec.businessName} (audience: ${spec.audience}, tone: ${spec.tone}).
${designs.map((d, i) => `\n[${i}] ${d.name}: ${d.rationale}\nPalette: ${JSON.stringify(d.palette)}\nFonts: ${JSON.stringify(d.fonts)}`).join('\n')}

Pick the single strongest, most distinctive, most on-brief direction. Return its index and why.`,
  { label: 'creative-director', phase: 'Design', schema: JUDGE_SCHEMA }
);
const winner = (judgeResult && typeof judgeResult.winnerIndex === 'number') ? judgeResult.winnerIndex : 0;
const design = designs[winner] || designs[0];
log(`Selected design: ${design?.name || '(unnamed)'} — ${judgeResult?.why || 'default (no judge result)'}`);

// ---- Stage 2b: Interaction design -----------------------------------------
phase('Interaction');
const interaction = await agent(
  `You are an interaction designer for an Awwwards-caliber build. Design the MOTION layer for ${spec.businessName}.
Selected art direction: "${design?.name}" — ${design?.rationale}. Hero idea: ${design?.heroPrompt || 'n/a'}.

The Next.js template already ships these reusable primitives — spec which to use and where:
  SmoothScroll (Lenis, global), Cursor (custom), Magnetic (buttons/logo), Parallax (scroll depth),
  SplitText (headline word reveal), PageTransition (route reveal), BgVideo (optimized video bg),
  ShaderHeroClient (animated WebGL gradient), Lottie (vector animation), framer-motion (general).

Define a signature moment and a tasteful set of interactions (don't overdo it — restraint reads as premium).
Pick ONE heroTreatment: shader | video | image | split. Performance budget: keep it balanced (Lighthouse ~85+),
everything must respect prefers-reduced-motion (the primitives already do).`,
  { label: 'interaction-designer', phase: 'Interaction', schema: INTERACTION_SCHEMA }
);
log(`Motion concept: ${interaction?.concept} | hero: ${interaction?.heroTreatment}`);

// ---- Stage 2c: Write resolved spec back to the client folder --------------
// Saves the factory's chosen colors/fonts/motion/hero into branding.md & design.md
// so the operator can review/tweak and re-run. Provided (locked) values are kept.
await agent(
  `Write the RESOLVED brand + design spec to ${DIR}/brand-spec.md so the operator can review/approve the factory's choices.
Include: final brand name/tagline, full color palette (brand-50..900, ink, paper), display + body fonts, the chosen
art-direction concept + rationale, hero treatment, the motion/interaction plan, page structure, languages, and the
contact/social set. Clearly mark which values were CLIENT-PROVIDED (locked) vs FACTORY-GENERATED.

Chosen design: ${JSON.stringify({ name: design?.name, palette: design?.palette, fonts: design?.fonts, hero: design?.heroPrompt })}
Motion/interaction: ${JSON.stringify(interaction)}
Locked: ${JSON.stringify(spec.brand?.locked || [])}  | pageStructure: ${spec.pageStructure} | languages: ${JSON.stringify(spec.languages || ['en'])}
Reference design-context.md already exists in the folder. This is a quick file-write task.`,
  { label: 'spec-writeback', phase: 'Interaction' }
);

// ---- Stage 3: Content (copy + assets in parallel) -------------------------
phase('Content');
const [copy, assets] = await parallel([
  () =>
    agent(
      `You are a conversion copywriter. Write ALL real copy for ${spec.businessName}'s website. No lorem, no placeholders.
Goal: ${spec.goal}. Audience: ${spec.audience}. Tone: ${spec.tone}. Keywords to weave in naturally: ${spec.keywords.join(', ')}.
Sections: ${spec.sections.join(', ')}.

For SEO/GEO: write a keyword-rich H1, a clear definitional opening sentence, section headings + body, 3 feature
cards, and 4-6 FAQ Q&A pairs that directly answer these GEO questions: ${(spec.geoQuestions || []).join(' | ')}.
Also write SEO meta title (<60 chars) and description (<155 chars). Return as a single markdown document with clear
labelled sections the builder can copy from.`,
      { label: 'copywriter', phase: 'Content' }
    ),
  () =>
    agent(
      `You are the asset producer for ${spec.businessName}. Produce the website imagery using the CHEAPEST capable source per asset type. Save everything into ${DIR}/public/ (create it if missing).

ASSET STRATEGY (in priority order):
1. BRAND / ABSTRACT / UI assets (logo, icons, gradient or geometric hero backgrounds, patterns, dividers):
   generate these YOURSELF as SVG/CSS directly — no API, no cost, fully on-brand. Prefer this for the hero when
   the design is abstract/gradient (design: "${design?.name}").
2. PHOTOGRAPHIC assets (real scenes/products/people): use the Asset Engine, which tries free stock first:
       node ${GENIMG} --prompt "<full description>" --query "<2-5 search keywords>" --out ${DIR}/public/hero.png --type hero
   It runs pexels → unsplash (free) → together → fal → gemini automatically. Always pass a short --query for good stock matches.
3. VIDEO (only if the interaction design picked heroTreatment="video"): use the Video Engine (free Pexels + ffmpeg):
       node ${GENVID} --query "<2-4 keywords>" --out ${DIR}/public/hero.mp4 --poster ${DIR}/public/hero-poster.jpg --maxsec 10 --width 1600
   It auto-optimizes to a small web loop and extracts a poster. For bespoke AI video use higgsfield generate_video (ToolSearch).
4. Cinematic/bespoke images only if needed: try the higgsfield MCP tools (ToolSearch: "higgsfield generate image").

The chosen hero treatment is: "${interaction?.heroTreatment || 'shader'}" — only generate a photo/video if that calls for it
(shader/split need no asset). Always produce an OpenGraph image at ${DIR}/public/og.png (1200x630, brand-aligned — an
SVG/CSS composition with the business name is ideal and free). Report each file created and the source used.`,
      { label: 'asset-producer', phase: 'Content' }
    ),
]);

// ---- Stage 4: Build -------------------------------------------------------
phase('Build');
const buildResult = await agent(
  `You are the Lead Builder. Assemble the production Next.js site in ${DIR}.

STEPS:
1. The folder ${DIR} already holds the input files (brief.md, branding.md, design.md, assets/) and possibly generated images in public/. Merge the Next.js template INTO it WITHOUT deleting those:
     cp -R ${TEMPLATE}/. ${DIR}/
   (this adds app/, components/, package.json, etc. alongside the existing inputs). Then work inside ${DIR}.
2. Edit ${DIR}/site.config.ts: business name, url placeholder, description, org details, nav, keywords, AND the contact block
   from the spec: ${JSON.stringify(spec.contact || {})} → site.config.contact (whatsapp digits-only, phone, email, address,
   socials). This auto-enables the floating WhatsApp button + footer social links + contact details. If a WhatsApp number
   exists, also make the primary CTA "Book on WhatsApp" link to it.
   PAGE STRUCTURE = "${spec.pageStructure || 'one-page'}": one-page → single scroll with anchor nav; multi-page → create
   routes under app/ (e.g. /tours, /tours/[slug], /about, /contact) with shared Header/Footer. LANGUAGES = ${JSON.stringify(spec.languages || ['en'])}
   (if >1, set up a simple language structure; otherwise single language).
   LOGO: ${spec.brand?.logoPath
     ? `the client provided a logo at ${DIR}/${spec.brand.logoPath} — copy it to public/ (e.g. public/logo.svg), use it in Header/Footer, and create a favicon/icon from it (app/icon.png or app/favicon.ico). Seed/confirm the palette from the logo if it makes sense.`
     : `no logo provided — design a clean, distinctive SVG wordmark/mark for "${spec.businessName}" in the chosen brand colors, save to public/logo.svg, use it in Header/Footer, and add app/icon.svg as the favicon.`}
3. Replace the @theme block in ${DIR}/app/globals.css with this design's CSS:\n${design?.css || '(use template defaults)'}
4. Set fonts in ${DIR}/app/layout.tsx to: display=${design?.fonts?.display || 'Sora'}, body=${design?.fonts?.body || 'Inter'} (next/font/google).
5. Fill every section component and ${DIR}/app/page.tsx with the REAL copy below. Wire the FAQ items (question/answer) so FAQ schema emits. Add pages under app/ if the spec lists more than "/".
   PREMIUM CRAFT: read ${DIR}/DESIGN-RESOURCES.md and COMPOSE the sections from the premium kit in ${DIR}/components/premium/ instead of plain divs — e.g. BentoGrid/BentoCard for features, TiltCard for tour cards, InfiniteMovingCards for testimonials, Marquee for logos/tags, Spotlight on the hero/CTA, ShimmerButton or AnimatedGradientText for accents. Use lucide-react icons. This is what makes it look expensive — use it generously but tastefully. Prefer characterful premium fonts (Fontshare: Satoshi/Clash Display/General Sans, or a strong Google pairing) over default Inter.
   For a bespoke component the kit doesn't cover, you may use the 21st.dev Magic MCP (ToolSearch: "magic component") to generate one.
   USE THE REAL DATA: build the tour/service cards (and any tours/[slug] detail pages) from spec.offerings (${(spec.offerings || []).length} items: ${(spec.offerings || []).map((o) => o.name).filter(Boolean).join(', ') || 'none — generate sensible ones'}); build the "why us"/stats section from spec.trust (${JSON.stringify(spec.trust || {})}). Never leave lorem/placeholder text.
6. HERO: implement the chosen treatment "${interaction?.heroTreatment || 'shader'}" —
   shader → template default (ShaderHeroClient); gradient → <ShaderGradientHero colors={[brand600, brand400, brand900]} /> from components/visual (premium shadergradient.co animated gradient); image → <Hero image="/hero.png"/>; video → <BgVideo src="/hero.mp4" poster="/hero-poster.jpg"/>; split → split-screen layout. Take the hero's composition/energy from the standout hero pattern the research stage captured (supahero/references).
7. MOTION: implement the interaction spec using the template kit (already wired: SmoothScroll + Cursor global, PageTransition via template.tsx). Apply per the spec:
${(interaction?.interactions || []).map((x) => `   - ${x.where}: ${x.effect} [${x.component}]`).join('\n') || '   - tasteful scroll reveals + magnetic CTAs'}
   Use SplitText for big headlines, Magnetic on primary CTAs, Parallax on hero/media, Reveal on sections. Keep it tasteful — restraint reads premium. Everything must respect reduced-motion (primitives already do).
8. Run: cd ${DIR} && npm install --cache ./.npm-cache && npm run build  — fix ALL type/build errors until it builds clean. WebGL/Lottie must stay dynamically imported (ssr:false) so first load stays light.

COPY TO USE:\n${copy || '(write sensible real copy from the spec)'}

SPEC: ${JSON.stringify(spec)}

Do not finish until \`npm run build\` exits 0. Report what you built and the final build status.`,
  { label: 'lead-builder', phase: 'Build' }
);

// ---- Stage 5: SEO/GEO -----------------------------------------------------
phase('SEO/GEO');
const seoResult = await agent(
  `You are the SEO/GEO specialist. Harden ${DIR} for search and AI answer engines.

1. Verify per-page metadata (lib/seo.ts usage), canonical URLs, OG/Twitter, sitemap.ts, robots.ts are correct and reference real routes.
2. Ensure JSON-LD is complete: Organization (with sameAs if known), WebSite, FAQPage (from the real FAQ), Breadcrumb where useful.
3. GEO: confirm content has clear definitional intros, self-contained citable FAQ answers, entity-rich copy, semantic headings.
4. Use the claude-seo plugin skills if helpful (e.g. /seo schema, /seo geo, /seo content) to audit the local build and apply concrete fixes.
5. Re-run npm run build to confirm still green.

Keywords: ${spec.keywords.join(', ')}. GEO questions: ${(spec.geoQuestions || []).join(' | ')}.
Report the SEO/GEO changes you made.`,
  { label: 'seo-geo', phase: 'SEO/GEO' }
);

// ---- Stage 6: Deploy (GitHub + Vercel preview) ----------------------------
phase('Deploy');
const deploy = await agent(
  `You are the Deployer. Ship ${DIR} to a live Vercel preview. Use these EXACT pre-configured tools:

GitHub (already authenticated as user 'anasbenabbou'):
  - GH=~/.local/bin/gh
  1. cd ${DIR} && git init -q (if needed) && git add -A && git commit -q -m "Initial site"
  2. $GH repo create ${slug} --private --source=${DIR} --remote=origin --push   (create + push in one step)

Vercel (token is in ${FACTORY}/.env as VERCEL_TOKEN):
  - VERCEL=${FACTORY}/node_modules/.bin/vercel ; export VERCEL_TELEMETRY_DISABLED=1
  - TOK=$(grep '^VERCEL_TOKEN=' ${FACTORY}/.env | cut -d= -f2)
  3. cd ${DIR} && $VERCEL deploy --prod --yes --token "$TOK"   (first run links the project automatically; capture the printed *.vercel.app URL)
  4. Set the deployed URL as NEXT_PUBLIC_SITE_URL:  $VERCEL env add NEXT_PUBLIC_SITE_URL production --token "$TOK" (value = the URL), then redeploy so canonical/OG URLs are correct. (Optional if it complicates — note it if skipped.)
  5. PUBLIC ACCESS: makePublic = ${spec.makePublic ? 'YES' : 'no'}. Vercel protects new deployments by default (visitors get HTTP 401).
     If makePublic is YES, make it publicly viewable: PATCH the project's ssoProtection to null via the Vercel API
     (teamId is in ${DIR}/.vercel/project.json: \`curl -X PATCH "https://api.vercel.com/v9/projects/${slug}?teamId=$TEAMID" -H "Authorization: Bearer $TOK" -H "Content-Type: application/json" -d '{"ssoProtection":null}'\`). If that call is blocked, clearly report the manual step: Vercel → Project → Settings → Deployment Protection → Vercel Authentication → Disabled.
     Verify the final URL returns HTTP 200 for an anonymous request.
  6. Return previewUrl (the *.vercel.app URL) and repoUrl.

If a step genuinely fails on auth, STOP and report exactly what's wrong. Never fabricate a URL — verify it loads.`,
  { label: 'deployer', phase: 'Deploy', schema: DEPLOY_SCHEMA }
);

if (!deploy?.ok || !deploy?.previewUrl) {
  log(`Deploy blocked: ${deploy?.notes || 'missing auth or build issue'}`);
  return { stoppedAt: 'deploy', spec, design: design?.name, build: buildResult, seo: seoResult, deploy };
}
log(`Deployed: ${deploy.previewUrl}`);

// ---- Stage 7: QA (4 lenses, parallel, against the live preview) -----------
phase('QA');
const lenses = [
  { key: 'layout', prompt: 'visual layout, spacing, hierarchy, alignment, and any AI-slop/generic patterns' },
  { key: 'responsive', prompt: 'responsive behavior at mobile (375), tablet (768), desktop (1440) — overflow, broken grids, tap targets' },
  { key: 'performance', prompt: `performance: run the real Lighthouse CLI — \`${FACTORY}/node_modules/.bin/lighthouse ${'${URL}'} --quiet --chrome-flags="--headless" --only-categories=performance,seo,best-practices,accessibility --output=json --output-path=/tmp/lh-${slug}.json\` then read the scores. Also use the Chrome DevTools MCP (ToolSearch: "chrome devtools performance trace") for LCP/CLS/INP detail. Check image/video sizing + font loading. Target 90+ on each category (95+ ideal)` },
  { key: 'a11y', prompt: 'accessibility: semantic HTML, landmarks, contrast, alt text, focus order, keyboard nav, reduced-motion honored (cross-check the Lighthouse a11y score)' },
  { key: 'award-craft', prompt: 'Awwwards-level craft: is the art direction distinctive (not generic-AI)? Are the premium components (bento, tilt, marquee, spotlight) used well? Do motion/interactions feel intentional and smooth? Is there a memorable signature moment? Rate as if judging for Site of the Day and list what would hold it back' },
];
const qa = (await parallel(
  lenses.map((l) => () =>
    agent(
      `You are a QA engineer reviewing the live site ${deploy.previewUrl} (URL) through ONE lens: ${l.key}.
Inspect: ${l.prompt.replace('${URL}', deploy.previewUrl)}
Use the Chrome DevTools MCP and/or the gstack browse skill (real headless browser) as needed.
Report concrete findings with severity (blocker/major/minor) and the precise fix. Set pass=true only if no blocker/major issues for this lens.`,
      { label: `qa:${l.key}`, phase: 'QA', schema: QA_SCHEMA }
    )
  )
)).filter(Boolean);

const allFindings = qa.flatMap((q) => (q.findings || []).map((f) => ({ lens: q.lens, ...f })));
const blockers = allFindings.filter((f) => /blocker|major/i.test(f.severity));
log(`QA: ${qa.filter((q) => q.pass).length}/${qa.length} lenses pass, ${blockers.length} blocking/major findings`);

// ---- Stage 8: Fix + redeploy ----------------------------------------------
let finalDeploy = deploy;
if (blockers.length) {
  phase('Fix');
  const fix = await agent(
    `You are the Fixer. Apply these QA fixes to ${DIR}, rebuild, and redeploy to the SAME Vercel project.

FINDINGS:\n${blockers.map((f) => `- [${f.severity}] (${f.lens}) ${f.issue} → ${f.fix}`).join('\n')}

After fixing: cd ${DIR} && npm run build must pass, then redeploy (Vercel MCP/CLI) and return the (possibly unchanged) preview URL.`,
    { label: 'fixer', phase: 'Fix', schema: DEPLOY_SCHEMA }
  );
  if (fix?.previewUrl) finalDeploy = fix;
}

return {
  ok: true,
  business: spec.businessName,
  design: design?.name,
  previewUrl: finalDeploy.previewUrl,
  repoUrl: finalDeploy.repoUrl,
  qaPassed: `${qa.filter((q) => q.pass).length}/${qa.length}`,
  remainingFindings: allFindings.filter((f) => /minor/i.test(f.severity)),
  spec,
};
