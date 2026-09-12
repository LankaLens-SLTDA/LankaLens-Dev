import type { Metadata } from 'next';
import './globals.css';
import QueryProvider from '@/components/providers/QueryProvider';

export const metadata: Metadata = {
  title: 'LankaLens — Cartographic Travel Discovery',
  description:
    'An editorial cartographic guide to Sri Lanka. Precision maps, bespoke itineraries, and AI-curated journeys.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,100..900;1,9..144,100..900&family=Inter:wght@100..900&display=swap"
        />
        <link href="https://api.mapbox.com/mapbox-gl-js/v3.1.0/mapbox-gl.css" rel="stylesheet" />
      </head>
      <body className="min-h-full flex flex-col bg-surface text-on-surface">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
