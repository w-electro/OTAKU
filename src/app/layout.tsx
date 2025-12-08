import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

export const viewport: Viewport = {
  themeColor: '#FF6B6B',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'OTAKU - Premium 4K Anime Streaming',
  description: 'Premium 4K 240fps anime streaming platform. Experience anime like never before with the highest quality content.',
  keywords: ['anime', '4k', 'streaming', 'premium', 'subscription', 'watch anime', 'otaku'],
  authors: [{ name: 'OTAKU' }],
  openGraph: {
    title: 'OTAKU - Premium 4K Anime Streaming',
    description: 'Premium 4K 240fps anime streaming platform',
    type: 'website',
    locale: 'en_US',
    alternateLocale: 'ar_SA',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OTAKU',
    description: 'Premium 4K 240fps anime streaming platform',
  },
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} font-sans antialiased bg-gray-900 text-white min-h-screen`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
