// Layout principal al aplicației
// Include metadata PWA, font Inter, și componenta Navbar

import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';

// Font principal
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

// Metadata pentru SEO și PWA
export const metadata = {
  title: 'Atelier Auto Manager',
  description: 'Aplicație pentru gestionarea atelierului auto — programări, clienți, devize',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Atelier Auto',
  },
  icons: {
    icon: '/icons/icon-192.png',
    apple: '/icons/icon-192.png',
  },
};

// Viewport și theme-color (conform Next.js 16)
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#2563EB',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ro" className={`${inter.variable} h-full antialiased`}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#2563EB" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        {/* Preîncărcare pagini pentru navigație instantanee */}
        <link rel="prefetch" href="/clienti" />
        <link rel="prefetch" href="/programari" />
        <link rel="prefetch" href="/masini" />
        <link rel="prefetch" href="/deviz" />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        {/* Navbar prezent pe toate paginile (se ascunde pe /login) */}
        <Navbar />

        {/* Conținut principal — cu offset pentru sidebar pe desktop și bottom nav pe mobile */}
        <main className="flex-1 md:ml-64 pb-20 md:pb-0">
          {children}
        </main>
      </body>
    </html>
  );
}
