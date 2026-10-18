import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Alankarana Studio | Jewellery Collection',
    template: '%s | Alankarana Studio',
  },
  description:
    'Explore jewellery designs and manage a small-business collection with Alankarana Studio.',
  applicationName: 'Alankarana Studio',
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
