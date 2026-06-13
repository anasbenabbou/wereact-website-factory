import Link from 'next/link';
import { Reveal } from '@/components/ui/Reveal';

export function CTA({
  heading = 'Ready to build something that stands out?',
  subtitle = 'Tell us about your project and we’ll take it from there.',
  buttonLabel = 'Start your project',
  buttonHref = '#contact',
}: {
  heading?: string;
  subtitle?: string;
  buttonLabel?: string;
  buttonHref?: string;
}) {
  return (
    <section id="contact" className="mx-auto max-w-6xl px-6 py-24">
      <Reveal>
        <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 to-brand-800 px-8 py-16 text-center text-white md:px-16">
          <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">{heading}</h2>
          <p className="mx-auto mt-4 max-w-xl text-white/80">{subtitle}</p>
          <Link
            href={buttonHref}
            className="mt-8 inline-block rounded-full bg-white px-8 py-3 font-semibold text-brand-700 shadow-lg transition-transform hover:scale-[1.03]"
          >
            {buttonLabel}
          </Link>
        </div>
      </Reveal>
    </section>
  );
}
