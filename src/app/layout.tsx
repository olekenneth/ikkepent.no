import type { Metadata, Viewport } from 'next';
import './globals.css';

export const viewport: Viewport = {
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  title: 'ikkepent.no – Norske værvarsler',
  description: 'Sanntids værvarsler for Norge. Se hvor det er dårlig vær, med data fra met.no.',
  keywords: ['vær', 'Norge', 'varsler', 'storm', 'flom', 'varsel', 'farevarsel'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="no">
      <body className="font-sans overflow-hidden">{children}</body>
    </html>
  );
}
