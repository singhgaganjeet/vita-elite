import type { Metadata } from 'next';
import './globals.css';
import SessionProvider from '@/components/SessionProvider';

export const metadata: Metadata = {
  title: 'Vita Elite — Your Elite Health. At Your Door.',
  description:
    'Book certified fitness coaches, diet experts, and physiotherapists at home. Track nutrition, scan food labels, and monitor your health progress — all in one premium platform.',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    viewportFit: 'cover',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
      style={{ background: 'var(--ve-bg)' }}
    >
      <body
        className="min-h-full"
        style={{ background: 'var(--ve-bg)', color: 'var(--ve-text)' }}
      >
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
