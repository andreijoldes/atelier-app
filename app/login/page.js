// Pagina de Autentificare (Login)
// Formular email + parolă cu Supabase Auth

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [parola, setParola] = useState('');
  const [eroare, setEroare] = useState('');
  const [incarcare, setIncarcare] = useState(false);

  // Funcția de autentificare
  const handleLogin = async (e) => {
    e.preventDefault();
    setEroare('');
    setIncarcare(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: parola,
      });

      if (error) {
        setEroare('Email sau parolă incorectă. Încearcă din nou.');
      } else {
        // Redirecționare la dashboard după autentificare reușită
        router.push('/');
      }
    } catch {
      setEroare('Eroare la conectare. Verifică configurarea Supabase.');
    } finally {
      setIncarcare(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-100 px-4">
      <div className="w-full max-w-md animate-fade-in">
        {/* Header cu logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/30">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-secondary">Atelier Auto</h1>
          <p className="text-muted mt-1">Conectează-te pentru a continua</p>
        </div>

        {/* Formular de login */}
        <form onSubmit={handleLogin} className="bg-surface rounded-2xl shadow-xl shadow-primary/5 p-8 space-y-5">
          {/* Câmp Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">
              Adresă email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="exemplu@email.com"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-foreground placeholder:text-gray-400
                focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
          </div>

          {/* Câmp Parolă */}
          <div>
            <label htmlFor="parola" className="block text-sm font-medium text-foreground mb-1.5">
              Parolă
            </label>
            <input
              id="parola"
              type="password"
              value={parola}
              onChange={(e) => setParola(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-foreground placeholder:text-gray-400
                focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
          </div>

          {/* Mesaj de eroare */}
          {eroare && (
            <div className="bg-danger/10 text-danger text-sm px-4 py-3 rounded-xl">
              {eroare}
            </div>
          )}

          {/* Buton de login */}
          <button
            type="submit"
            disabled={incarcare}
            className="w-full py-3 px-4 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl
              transition-all duration-200 shadow-lg shadow-primary/30 hover:shadow-primary/50
              disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
          >
            {incarcare ? 'Se conectează...' : 'Conectare'}
          </button>
        </form>

        <p className="text-center text-xs text-muted mt-6">
          © 2026 Atelier Auto Manager
        </p>
      </div>
    </div>
  );
}
