import { Reveal } from '@/components/ui/Reveal';
import { Schema, faqSchema } from '@/components/Schema';

export type QA = { question: string; answer: string };

const DEFAULTS: QA[] = [
  {
    question: 'How fast can a site be delivered?',
    answer:
      'A complete, deployed marketing site is typically ready for review within a day, then refined from your feedback.',
  },
  {
    question: 'Is the site optimized for Google and AI search?',
    answer:
      'Yes. Every site ships with schema.org structured data, complete metadata, and GEO-friendly content so it surfaces in both classic search results and AI Overviews.',
  },
];

/**
 * FAQ section. Renders human-readable Q&A AND FAQPage JSON-LD — one of the
 * strongest GEO signals, since AI answer engines lift these directly. Answers
 * should be self-contained, factual, and citable.
 */
export function FAQ({ heading = 'Frequently asked questions', items = DEFAULTS }: { heading?: string; items?: QA[] }) {
  return (
    <section id="faq" className="mx-auto max-w-3xl px-6 py-24">
      <Schema json={faqSchema(items)} />
      <Reveal>
        <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">{heading}</h2>
      </Reveal>
      <dl className="mt-10 divide-y divide-black/5">
        {items.map((it, i) => (
          <Reveal key={it.question} delay={i * 0.05}>
            <div className="py-6">
              <dt className="font-display text-lg font-semibold">{it.question}</dt>
              <dd className="mt-2 text-ink/70">{it.answer}</dd>
            </div>
          </Reveal>
        ))}
      </dl>
    </section>
  );
}
