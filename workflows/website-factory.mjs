export const meta = {
  name: 'website-factory',
  description: 'Turn a freeform brief into a deployed, SEO/GEO-optimized Next.js website (full agent crew)',
  whenToUse: 'When the operator gives a website brief and wants a finished, deployed *.vercel.app preview',
  phases: [
    { title: 'Strategy', detail: 'brief → structured spec' },
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
    keywords: { type: 'array', items: { type: 'string' }, description: 'primary SEO keywords' },
    geoQuestions: { type: 'array', items: { type: 'string' }, description: 'questions users ask AI engines this site should answer' },
    referenceSites: { type: 'array', items: { type: 'string' }, description: 'inspiration URLs from design.md, if any' },
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
    heroTreatment: { type: 'string', enum: ['shader', 'video', 'image', 'split'], description: 'hero background approach' },
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

FIRST, read the client folder ${DIR} if it exists (use Bash/Read):
  - brief.md       → goal, audience, pages, CTA, must-haves/avoids
  - branding.md    → name, tagline, voice, colors, fonts, logo, guardrails
  - design.md      → reference sites, mood, layout, motion intensity, hero treatment, sections
  - assets/        → list it; if a logo (logo.svg/png) exists, set brand.logoPath to its relative path and add "logo" to brand.locked
Also consider this freeform brief (may be empty): """${brief}"""

RULES:
- Any value the client SUPPLIED (non-empty, not "you decide") is LOCKED — copy it verbatim into brand.* and add its
  key to brand.locked. The rest of the crew must obey locked values, not reinvent them.
- For every blank/"you decide" field, leave brand.* empty (the designer fills it) — do NOT guess locked values.
- Keep pages lean (usually just "/" unless the brief needs more). Always derive SEO keywords + GEO questions.

Output the structured spec, including the resolved brand object and any referenceSites from design.md.`,
  { label: 'strategist', phase: 'Strategy', schema: SPEC_SCHEMA }
);
const lockedList = spec?.brand?.locked || [];
log(`Strategy: ${spec.businessName} | locked brand: ${lockedList.length ? lockedList.join(', ') : 'none (factory designs all)'}${spec?.brand?.logoPath ? ' | logo provided' : ''}`);

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
Reference sites the client likes: ${(spec.referenceSites || []).join(', ') || 'none given'}.
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

const judgeResult = await agent(
  `You are the creative director. Here are ${designs.length} design directions for ${spec.businessName} (audience: ${spec.audience}, tone: ${spec.tone}).
${designs.map((d, i) => `\n[${i}] ${d.name}: ${d.rationale}\nPalette: ${JSON.stringify(d.palette)}\nFonts: ${JSON.stringify(d.fonts)}`).join('\n')}

Pick the single strongest, most distinctive, most on-brief direction. Return its index and why.`,
  { label: 'creative-director', phase: 'Design', schema: JUDGE_SCHEMA }
);
const design = designs[judgeResult.winnerIndex] || designs[0];
log(`Selected design: ${design?.name} — ${judgeResult.why}`);

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
  `Write the RESOLVED brand + design back into the client folder ${DIR} so the operator can approve/tweak it.
Update (or create) ${DIR}/branding.md and ${DIR}/design.md so every previously-blank field is now filled with the
chosen value, while keeping any client-provided (locked) values unchanged. Mark generated values with a trailing
"  <!-- generated -->" comment so the operator can see what to review.

Chosen design: ${JSON.stringify({ name: design?.name, palette: design?.palette, fonts: design?.fonts, hero: design?.heroPrompt })}
Motion/interaction: ${JSON.stringify(interaction)}
Locked (keep as-is): ${JSON.stringify(spec.brand?.locked || [])}
Keep the markdown structure of the existing files; just fill values. This is a quick file-write task.`,
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
2. Edit ${DIR}/site.config.ts with the real business name, url placeholder, description, org details, nav, keywords.
   LOGO: ${spec.brand?.logoPath
     ? `the client provided a logo at ${DIR}/${spec.brand.logoPath} — copy it to public/ (e.g. public/logo.svg), use it in Header/Footer, and create a favicon/icon from it (app/icon.png or app/favicon.ico). Seed/confirm the palette from the logo if it makes sense.`
     : `no logo provided — design a clean, distinctive SVG wordmark/mark for "${spec.businessName}" in the chosen brand colors, save to public/logo.svg, use it in Header/Footer, and add app/icon.svg as the favicon.`}
3. Replace the @theme block in ${DIR}/app/globals.css with this design's CSS:\n${design?.css || '(use template defaults)'}
4. Set fonts in ${DIR}/app/layout.tsx to: display=${design?.fonts?.display || 'Sora'}, body=${design?.fonts?.body || 'Inter'} (next/font/google).
5. Fill every section component and ${DIR}/app/page.tsx with the REAL copy below. Wire the FAQ items (question/answer) so FAQ schema emits. Add pages under app/ if the spec lists more than "/".
6. HERO: implement the chosen treatment "${interaction?.heroTreatment || 'shader'}" —
   shader → leave <Hero/> default (ShaderHeroClient); image → <Hero image="/hero.png"/>; video → use <BgVideo src="/hero.mp4" poster="/hero-poster.jpg"/> inside the hero; split → split-screen layout.
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
  5. Return previewUrl (the *.vercel.app URL) and repoUrl.

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
  { key: 'performance', prompt: 'performance: run Lighthouse, check LCP/CLS/INP, image/video sizing, font loading; target 85+ (balanced)' },
  { key: 'a11y', prompt: 'accessibility: semantic HTML, landmarks, contrast, alt text, focus order, keyboard nav, reduced-motion honored' },
  { key: 'award-craft', prompt: 'Awwwards-level craft: is the art direction distinctive (not generic-AI)? Do the motion/interactions feel intentional and smooth? Is there a memorable signature moment? Rate as if judging for Site of the Day and list what would hold it back' },
];
const qa = (await parallel(
  lenses.map((l) => () =>
    agent(
      `You are a QA engineer reviewing the live site ${deploy.previewUrl} through ONE lens: ${l.key}.
Use the gstack browse/qa skill (a real headless browser) to inspect ${l.prompt}.
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
