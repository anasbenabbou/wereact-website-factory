import { pageMetadata } from '@/lib/seo';
import { Header } from '@/components/site/Header';
import { Hero } from '@/components/site/Hero';
import { Features } from '@/components/site/Features';
import { FAQ } from '@/components/site/FAQ';
import { CTA } from '@/components/site/CTA';
import { Footer } from '@/components/site/Footer';

export const metadata = pageMetadata({ path: '/' });

/**
 * Home page. This is the factory's starting composition — the Lead Builder
 * rearranges, restyles, and adds sections per the design spec, then fills in
 * real copy and generated imagery.
 */
export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Features />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
