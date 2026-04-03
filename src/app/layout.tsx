import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ikkepent.no - Norwegian Weather Alerts',
  description: 'Real-time weather alerts for Norway. See where the weather is bad, with alerts from met.no.',
  keywords: ['weather', 'Norway', 'alerts', 'storm', 'flood', 'varsel'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans overflow-hidden">{children}</body>
    </html>
  );
}
