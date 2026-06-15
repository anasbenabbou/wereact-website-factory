# Design direction — Marrakech Travel Co

Reference sites I love:    https://your-morocco.com  (take inspiration, but go more distinctive / award-grade)
Mood / aesthetic:          warm, aspirational, desert-inspired, cinematic golden-hour; authentic Morocco,
                           editorial and premium (not stocky)
Layout feel:               spacious & rich — full-bleed hero, generous type, immersive imagery
Motion intensity:          medium  <!-- smooth scroll, tasteful reveals, parallax on imagery; not gimmicky -->
Hero treatment:            video  <!-- atmospheric Morocco loop (Sahara/Marrakech medina); fall back to image if needed -->
Signature moment:          "The Rake of Light" — warm low golden-hour sun rakes across surfaces sitewide. On  <!-- generated -->
                           load and on scroll, Fraunces headings reveal word-by-word left-to-right, each word
                           warming from espresso ink up to cream as the "sun" sweeps past it; this light-sweep
                           reveal is the leitmotif and recurs on every section heading down the page.
Must-have sections:        hero, intro/manifesto, featured tours (grid w/ duration+location badges),
                           experiences (camel trek, cooking class, desert camp), why us (local experts),
                           destinations across Morocco, testimonials, FAQ, contact/plan-your-trip CTA
Imagery style:             atmospheric travel photography — Sahara dunes, Marrakech medina, Atlas, Chefchaouen,
                           Berber villages; golden-hour, authentic
Notes:                     Morocco-ONLY destinations. Trust + warmth + local expertise are the throughline.

## Type & color  <!-- generated -->
Display font:              Fraunces  <!-- generated: editorial, characterful serif for headlines -->
Body font:                 Mulish  <!-- generated: clean humanist sans for body/UI -->
Color grade:               cream highlights #F7F1E6, terracotta midtones #C0532B, saffron-gold glow #E0A53B,  <!-- generated -->
                           deep fired-clay shadows #4A1D0F — no blue cast, no cold shadows, no neon.
Gold usage:                saffron-gold as punctuation only — hairline rules, a single tick-up number; never flood.  <!-- generated -->

## Hero  <!-- generated -->
Hero treatment:            video  <!-- locked: atmospheric Morocco loop; fall back to image if needed -->
Hero direction:            "The Hour of Gold" — slow drone-style push over the Marrakech medina rooftops at  <!-- generated -->
                           golden-hour; warm raking light on terracotta walls, the Koutoubia minaret distant,
                           drifting dust + woodsmoke, palm fronds at frame edge. 8–12s seamless loop, ~24fps feel.
Hero overlay:              bottom-up brand-900 (#4A1D0F) scrim at ~55% so cream Fraunces headline + saffron  <!-- generated -->
                           small-caps kicker stay legible at lower-left.
Still fallback (poster):   same rooftop golden-hour composition, photographic, 21:9, used as <video> poster for LCP.  <!-- generated -->

## Motion & interaction — "The Rake of Light"  <!-- generated -->
Concept:                   slow, weighted, unhurried (durations ~0.9–1.2s, soft custom ease, never bouncy);  <!-- generated -->
                           restraint is the premium signal. No parallax circus, no flying cards.
SmoothScroll:              Lenis, tuned long & heavy (~1.3s, gentle ease-out); native scroll under reduced-motion.  <!-- generated -->
BgVideo (hero):            muted/autoplay/loop/playsinline golden-hour loop; poster LCP fallback; holds on poster  <!-- generated -->
                           under prefers-reduced-motion.
SplitText (hero headline): signature rake-of-light reveal — words unmask left-to-right on load, warming espresso→cream,  <!-- generated -->
                           soft mask/clip + slight y-rise, ~90ms/word stagger.
SplitText (section heads): same left-to-right light-sweep reveal, triggered once on scroll-into-view (once:true).  <!-- generated -->
Kicker rule:               single saffron hairline draws in (scaleX 0→1, ~0.8s) before the kicker fades up.  <!-- generated -->
Parallax:                  restrained scroll-depth — hero video ~8–12% slower than content over it; off under reduced-motion.  <!-- generated -->
PageTransition:            warm-cream wipe that rakes across the viewport on route change (terracotta→cream sweep).  <!-- generated -->
Magnetic:                  gentle magnetic pull on the primary CTA ("Plan your hour of gold") and the logo only.  <!-- generated -->
Cursor:                    minimal saffron dot → thin ring over interactive elements; hidden on touch & reduced-motion.  <!-- generated -->
Stat count-up:             trust/stat numbers tick up once on scroll-into-view (~1s, ease-out) — the lone numeric flourish.  <!-- generated -->
