// AuthLayout — wrapper care controlează afișarea Navbar-ului
// Pe pagina de login (/) nu se afișează Navbar
// Pe paginile protejate, redirecționează la / dacă user-ul nu e logat

'use client';

import { useAuth } from '@/components/AuthProvider';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Navbar from '@/components/Navbar';

export default function AuthLayout({ children }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  // Rute publice (fără navbar, fără redirect forțat la login)
  const isPublicPage = pathname === '/' || pathname === '/update-parola';
  // Doar pagina de login — dacă user e logat, redirect la dashboard
  const isLoginPage = pathname === '/';

  useEffect(() => {
    if (loading) return;

    // Utilizator logat pe pagina de LOGIN → redirect la dashboard
    // (NU pe /update-parola — acolo trebuie să poată schimba parola)
    if (user && isLoginPage) {
      router.replace('/dashboard');
      return;
    }

    // Utilizator nelogat pe pagina protejată → redirect la login
    if (!user && !isPublicPage) {
      router.replace('/');
      return;
    }
  }, [user, loading, isPublicPage, isLoginPage, router]);

  // Loading state — spinner simplu
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  // Pagină publică — fără navbar
  if (isPublicPage) {
    return <>{children}</>;
  }

  // Utilizator nelogat pe pagină protejată — nu render nimic (se face redirect)
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  // Pagină protejată cu utilizator logat — navbar + conținut
  return (
    <>
      <Navbar />
      <main className="flex-1 md:ml-64 pb-20 md:pb-0">
        {children}
      </main>
    </>
  );
}
