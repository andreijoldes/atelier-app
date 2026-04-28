// Pagina de actualizare parolă
// Utilizatorul ajunge aici din link-ul primit pe email
// Supabase detectează automat token-ul din URL

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function UpdateParolaPage() {
  const router = useRouter();
  const [parolaNoua, setParolaNoua] = useState('');
  const [confirmaParola, setConfirmaParola] = useState('');
  const [eroare, setEroare] = useState('');
  const [incarcare, setIncarcare] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  // Așteptăm ca Supabase să proceseze token-ul din URL
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || (event === 'SIGNED_IN' && session)) {
        setSessionReady(true);
        setCheckingSession(false);
      }
    });

    // Fallback — verifică sesiunea existentă după un scurt delay
    const timeout = setTimeout(async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setSessionReady(true);
      }
      setCheckingSession(false);
    }, 2000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setEroare('');

    if (parolaNoua !== confirmaParola) {
      setEroare('Parolele nu se potrivesc.');
      return;
    }

    if (parolaNoua.length < 6) {
      setEroare('Parola trebuie să aibă minim 6 caractere.');
      return;
    }

    setIncarcare(true);

    try {
      const { error } = await supabase.auth.updateUser({ password: parolaNoua });

      if (error) {
        setEroare(error.message);
      } else {
        // Deconectare după schimbarea parolei, apoi redirect la login cu mesaj
        await supabase.auth.signOut();
        router.push('/?mesaj=Parola a fost schimbată cu succes');
      }
    } catch {
      setEroare('Eroare la actualizarea parolei. Încearcă din nou.');
    } finally {
      setIncarcare(false);
    }
  };

  const inputClass = `w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-foreground placeholder:text-gray-400
    focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all`;

  // Loading — se procesează token-ul
  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-100 px-4">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted text-sm">Se procesează link-ul de resetare...</p>
        </div>
      </div>
    );
  }

  // Fără sesiune validă
  if (!sessionReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-100 px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center animate-fade-in">
          <div className="w-14 h-14 bg-danger/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-secondary mb-2">Link invalid sau expirat</h2>
          <p className="text-sm text-muted mb-6">
            Link-ul de resetare a parolei a expirat sau este invalid. Solicită un nou link de pe pagina de conectare.
          </p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl
              transition-all duration-200 shadow-lg shadow-primary/30 hover:shadow-primary/50 active:scale-[0.98]"
          >
            Înapoi la Conectare
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-100 px-4">
      <div className="w-full max-w-md animate-fade-in">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/30">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-secondary">Parolă nouă</h1>
          <p className="text-muted mt-1">Alege o parolă nouă pentru contul tău</p>
        </div>

        {/* Formular */}
        <form onSubmit={handleUpdatePassword} className="bg-surface rounded-2xl shadow-xl shadow-primary/5 p-8 space-y-5 animate-fade-in">
          <div>
            <label htmlFor="parola-noua" className="block text-sm font-medium text-foreground mb-1.5">
              Parolă nouă
            </label>
            <input
              id="parola-noua"
              type="password"
              value={parolaNoua}
              onChange={(e) => setParolaNoua(e.target.value)}
              placeholder="Minim 6 caractere"
              required
              autoFocus
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="confirma-parola" className="block text-sm font-medium text-foreground mb-1.5">
              Confirmă parola nouă
            </label>
            <input
              id="confirma-parola"
              type="password"
              value={confirmaParola}
              onChange={(e) => setConfirmaParola(e.target.value)}
              placeholder="••••••••"
              required
              className={inputClass}
            />
          </div>

          {eroare && (
            <div className="bg-danger/10 text-danger text-sm px-4 py-3 rounded-xl">
              {eroare}
            </div>
          )}

          <button
            type="submit"
            disabled={incarcare}
            className="w-full py-3 px-4 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl
              transition-all duration-200 shadow-lg shadow-primary/30 hover:shadow-primary/50
              disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
          >
            {incarcare ? 'Se salvează...' : 'Salvează parola nouă'}
          </button>
        </form>

        <p className="text-center text-xs text-muted mt-6">
          © 2026 Atelier Auto Manager
        </p>
      </div>
    </div>
  );
}
