import type { Metadata } from 'next';
import { Inter, Sora } from 'next/font/google';
import './globals.css';
import { pageMetadata } from '@/lib/seo';
import { Schema, organizationSchema, websiteSchema } from '@/components/Schema';

// The factory swaps these fonts per design direction.
const sans = Inter({ subsets: ['latin'], variable: '--font-sans-stack', display: 'swap' });
const display = Sora({ subsets: ['latin'], variable: '--font-display-stack', display: 'swap' });

export const metadata: Metadata = pageMetadata();

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${display.variable}`}>
      <body>
        {/* Site-wide structured data — entity + site signals for SEO/GEO. */}
        <Schema json={[organizationSchema(), websiteSchema()]} />
        {children}
      </body>
    </html>
  );
}
