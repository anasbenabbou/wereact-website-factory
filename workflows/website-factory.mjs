export const meta = {
  name: 'website-factory',
  description: 'Turn a freeform brief into a deployed, SEO/GEO-optimized Next.js website (full agent crew)',
  whenToUse: 'When the operator gives a website brief and wants a finished, deployed *.vercel.app preview',
  phases: [
    { title: 'Strategy', detail: 'brief → structured spec' },
    { title: 'Design', detail: '3 design directions + judge' },
    { title: 'Content', detail: 'copy + assets in parallel' },
    { title: 'Build', detail: 'assemble Next.js app from template' },
    { title: 'SEO/GEO', detail: 'schema, meta, claude-seo audit + fixes' },
    { title: 'Deploy', detail: 'GitHub repo + Vercel preview' },
    { title: 'QA', detail: '4 lenses in real browser' },
    { title: 'Fix', detail: 'apply QA fixes + redeploy' },
  ],
};

// args: { brief: string, slug: string, clientDir: string, factoryRoot: string }
const brief = args?.brief || 'A modern marketing website.';
const slug = args?.slug || 'client-site';
const FACTORY = args?.factoryRoot || '/Users/apple/Desktop/wereact-website-factory';
const DIR = args?.clientDir || `${FACTORY}/clients/${slug}`;
const TEMPLATE = `${FACTORY}/template`;
const GENIMG = `${FACTORY}/tools/gen-image.mjs`;

// ---- schemas --------------------------------------------------------------
const SPEC_SCHEMA = {
  type: 'object',
  required: ['businessName', 'goal', 'audience', 'tone', 'pages', 'sections', 'keywords'],
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
  `You are the Strategist for a premium web studio. Turn this client brief into a precise website spec.

BRIEF: """${brief}"""

Decide the business name (infer if not given), the primary goal, target audience, tone, brand direction,
the list of pages (keep lean — usually just "/" for a one-pager unless the brief needs more), the ordered
home-page sections, primary SEO keywords, and the top questions real users would ask an AI engine that this
site should answer (for GEO). Be concrete and opinionated. Output the structured spec.`,
  { label: 'strategist', phase: 'Strategy', schema: SPEC_SCHEMA }
);

// ---- Stage 2: Design (3 variants + judge) ---------------------------------
phase('Design');
const designs = (await parallel(
  ['bold & premium', 'clean & editorial', 'vivid & modern'].map((angle, i) => () =>
    agent(
      `You are a senior brand/web designer. Design direction #${i + 1}, angle: "${angle}".
Business: ${spec.businessName}. Tone: ${spec.tone}. Brand direction: ${spec.brandDirection || 'n/a'}.
Audience: ${spec.audience}.

Produce a complete, distinctive design system that AVOIDS generic AI aesthetics (no default purple gradients,
no Inter-everywhere unless justified). Give a 9-step brand color ramp (brand-50..900) plus ink/paper hex,
Google Font choices for display + body, and a ready-to-paste Tailwind v4 @theme CSS block matching the
template's token names (--color-brand-50.., --color-ink, --color-paper, --font-sans, --font-display).
Also give a vivid hero image prompt. Use the frontend-design skill's principles.`,
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
      `You are the asset producer for ${spec.businessName}. Generate the website imagery.

FIRST try the higgsfield MCP tools (search for them with ToolSearch: "higgsfield generate image") for a cinematic hero.
If higgsfield is unavailable or fails, use the fallback Asset Engine CLI:
    node ${GENIMG} --prompt "<prompt>" --out ${DIR}/public/hero.png --type hero
    node ${GENIMG} --prompt "<prompt>" --out ${DIR}/public/og.png --type og

Generate at minimum: a hero background (prompt: "${design?.heroPrompt || 'abstract premium brand background'}") and an
OpenGraph share image (1200x630, brand-aligned, with the business name). Save them into ${DIR}/public/.
The ${DIR} directory may not exist yet — create public/ if needed. Report exactly which files you created and via which provider.`,
      { label: 'asset-producer', phase: 'Content' }
    ),
]);

// ---- Stage 4: Build -------------------------------------------------------
phase('Build');
const buildResult = await agent(
  `You are the Lead Builder. Assemble the production Next.js site in ${DIR}.

STEPS:
1. If ${DIR} doesn't exist, copy the template: cp -R ${TEMPLATE} ${DIR} (preserve any public/ images already generated there).
2. Edit ${DIR}/site.config.ts with the real business name, url placeholder, description, org details, nav, keywords.
3. Replace the @theme block in ${DIR}/app/globals.css with this design's CSS:\n${design?.css || '(use template defaults)'}
4. Set fonts in ${DIR}/app/layout.tsx to: display=${design?.fonts?.display || 'Sora'}, body=${design?.fonts?.body || 'Inter'} (next/font/google).
5. Fill every section component and ${DIR}/app/page.tsx with the REAL copy below. Wire the FAQ items (question/answer) so FAQ schema emits. Add pages under app/ if the spec lists more than "/".
6. Reference the generated hero image (public/hero.png) in <Hero image="/hero.png" /> if it exists.
7. Run: cd ${DIR} && npm install && npm run build  — fix ALL type/build errors until it builds clean.

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
  `You are the Deployer. Ship ${DIR} to a live Vercel preview.

1. Initialize git in ${DIR} if needed, commit all.
2. Create a GitHub repo "${slug}" (private) with the gh CLI (gh is at ~/.local/bin/gh) and push.
3. Deploy to Vercel — use the Vercel MCP tools (find them via ToolSearch: "vercel deploy project") to create/link the project and deploy, OR the vercel CLI if available. Use the *.vercel.app preview domain (no custom domain).
4. Set the NEXT_PUBLIC_SITE_URL env var on Vercel to the assigned preview URL and redeploy if needed so canonical/OG URLs are correct.
5. Return the live preview URL and the repo URL.

If Vercel or GitHub auth is missing, STOP and clearly report exactly what the operator must authenticate. Do not fake a URL.`,
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
  { key: 'performance', prompt: 'performance: run Lighthouse, check LCP/CLS/INP, image sizing, font loading; target 95+' },
  { key: 'a11y', prompt: 'accessibility: semantic HTML, landmarks, contrast, alt text, focus order, keyboard nav' },
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
