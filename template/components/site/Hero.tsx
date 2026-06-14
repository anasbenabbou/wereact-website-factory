import Image from 'next/image';
import Link from 'next/link';
import { Reveal } from '@/components/ui/Reveal';
import { ShaderHeroClient } from '@/components/visual/ShaderHeroClient';
import { Magnetic } from '@/components/ui/Magnetic';

/**
 * Hero. The factory passes a generated background image (Asset Engine) and
 * real headline/subhead copy. Keep the H1 keyword-rich for SEO and lead with a
 * clear, definitional sentence for GEO.
 */
export function Hero({
  eyebrow = 'Production-grade websites',
  title = 'Websites that look like they cost $10,000 — because they do.',
  subtitle = 'Distinctive design, blazing performance, and SEO/GEO built in from the first pixel.',
  image,
}: {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  image?: string;
}) {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        {image ? (
          <Image src={image} alt="" fill priority sizes="100vw" className="object-cover" />
        ) : (
          // Animated WebGL gradient by default (falls back to a static gradient
          // on reduced-motion / no-WebGL). The factory swaps this for a video or
          // photographic hero per the design.
          <ShaderHeroClient />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-paper/40 via-paper/70 to-paper" />
      </div>
      <div className="mx-auto max-w-4xl px-6 py-28 text-center md:py-40">
        <Reveal>
          <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-brand-600">
            {eyebrow}
          </p>
        </Reveal>
        <Reveal delay={0.08}>
          <h1 className="font-display text-4xl font-extrabold leading-[1.05] tracking-tight md:text-6xl">
            {title}
          </h1>
        </Reveal>
        <Reveal delay={0.16}>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-ink/70 md:text-xl">{subtitle}</p>
        </Reveal>
        <Reveal delay={0.24}>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Magnetic>
              <Link
                href="#contact"
                data-cursor
                className="inline-block rounded-full bg-brand-600 px-7 py-3 font-semibold text-white shadow-lg shadow-brand-600/20 transition-transform hover:bg-brand-700"
              >
                Start your project
              </Link>
            </Magnetic>
            <Link
              href="#work"
              className="rounded-full border border-ink/15 px-7 py-3 font-semibold text-ink transition-colors hover:bg-ink/5"
            >
              See the work
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
