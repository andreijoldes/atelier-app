// Layout principal al aplicației
// Include metadata PWA, font Inter, AuthProvider și AuthLayout

import { Inter } from 'next/font/google';
import './globals.css';
import AuthProvider from '@/components/AuthProvider';
import AuthLayout from '@/components/AuthLayout';

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
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="theme-color" content="#2563EB" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Atelier Auto" />
        {/* Preîncărcare pagini pentru navigație instantanee */}
        <link rel="prefetch" href="/dashboard" />
        <link rel="prefetch" href="/clienti" />
        <link rel="prefetch" href="/programari" />
        <link rel="prefetch" href="/deviz" />
        {/* Inițializare paletă de culori ÎNAINTE de render (previne flash) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(){
                try {
                  var p = localStorage.getItem('atelier-paleta');
                  if (p && p !== 'albastru') {
                    var t = {
                      verde: ['#059669','#047857','#10B981','#ECFDF5','#D1FAE5','#A7F3D0'],
                      violet: ['#7C3AED','#6D28D9','#8B5CF6','#F5F3FF','#EDE9FE','#DDD6FE'],
                      portocaliu: ['#EA580C','#C2410C','#F97316','#FFF7ED','#FFEDD5','#FED7AA'],
                      rosu: ['#E11D48','#BE123C','#F43F5E','#FFF1F2','#FFE4E6','#FECDD3'],
                      cyan: ['#0891B2','#0E7490','#06B6D4','#ECFEFF','#CFFAFE','#A5F3FC']
                    };
                    var c = t[p];
                    if (c) {
                      var r = document.documentElement;
                      r.style.setProperty('--color-primary', c[0]);
                      r.style.setProperty('--color-primary-dark', c[1]);
                      r.style.setProperty('--color-primary-light', c[2]);
                      r.style.setProperty('--color-primary-50', c[3]);
                      r.style.setProperty('--color-primary-100', c[4]);
                      r.style.setProperty('--color-primary-200', c[5]);
                      var m = document.querySelector('meta[name="theme-color"]');
                      if (m) m.setAttribute('content', c[0]);
                    }
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
        {/* Înregistrare Service Worker pentru PWA */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js');
                });
              }
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        <AuthProvider>
          <AuthLayout>
            {children}
          </AuthLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
