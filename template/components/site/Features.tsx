import { Reveal } from '@/components/ui/Reveal';

type Feature = { title: string; body: string; icon?: string };

const DEFAULTS: Feature[] = [
  { title: 'Distinctive design', body: 'No templates, no AI slop. A custom visual identity built to convert.' },
  { title: 'Fast by default', body: 'Lighthouse 95+ across the board. Speed is a feature your users feel.' },
  { title: 'SEO + GEO built in', body: 'Schema, structured content, and AI-answer-engine optimization from day one.' },
];

export function Features({
  heading = 'Built to perform',
  features = DEFAULTS,
}: {
  heading?: string;
  features?: Feature[];
}) {
  return (
    <section id="work" className="mx-auto max-w-6xl px-6 py-24">
      <Reveal>
        <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">{heading}</h2>
      </Reveal>
      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {features.map((f, i) => (
          <Reveal key={f.title} delay={i * 0.08}>
            <article className="h-full rounded-2xl border border-black/5 bg-white p-8 shadow-sm transition-shadow hover:shadow-md">
              {f.icon && (
                <span className="mb-4 inline-block text-3xl" aria-hidden>
                  {f.icon}
                </span>
              )}
              <h3 className="font-display text-xl font-semibold">{f.title}</h3>
              <p className="mt-3 text-ink/70">{f.body}</p>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
