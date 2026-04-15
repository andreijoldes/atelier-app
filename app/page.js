// Pagina de Autentificare (Landing Page — ruta /)
// Formular cu tabs: Conectare / Înregistrare
// Înregistrare necesită cod de acces valid

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

// Codul de acces valid pentru înregistrare
const COD_ACCES_VALID = 'BOS';

export default function AuthPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('login'); // 'login' sau 'register'

  // State-uri partajate
  const [email, setEmail] = useState('');
  const [parola, setParola] = useState('');
  const [eroare, setEroare] = useState('');
  const [succes, setSucces] = useState('');
  const [incarcare, setIncarcare] = useState(false);

  // State-uri suplimentare pentru register
  const [codAcces, setCodAcces] = useState('');
  const [confirmaParola, setConfirmaParola] = useState('');

  // Resetare câmpuri la schimbarea tab-ului
  const switchTab = (tab) => {
    setActiveTab(tab);
    setEroare('');
    setSucces('');
    setEmail('');
    setParola('');
    setCodAcces('');
    setConfirmaParola('');
  };

  // === CONECTARE ===
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
        router.push('/dashboard');
      }
    } catch {
      setEroare('Eroare la conectare. Verifică conexiunea la internet.');
    } finally {
      setIncarcare(false);
    }
  };

  // === ÎNREGISTRARE ===
  const handleRegister = async (e) => {
    e.preventDefault();
    setEroare('');
    setSucces('');
    setIncarcare(true);

    // Validare cod de acces
    if (codAcces.trim().toUpperCase() !== COD_ACCES_VALID) {
      setEroare('Cod de acces invalid');
      setIncarcare(false);
      return;
    }

    // Validare parole
    if (parola !== confirmaParola) {
      setEroare('Parolele nu se potrivesc.');
      setIncarcare(false);
      return;
    }

    if (parola.length < 6) {
      setEroare('Parola trebuie să aibă minim 6 caractere.');
      setIncarcare(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password: parola,
      });

      if (error) {
        setEroare(error.message);
      } else {
        setSucces('Cont creat cu succes! Verifică email-ul pentru confirmare sau conectează-te.');
        // Auto-switch la login după 2 secunde
        setTimeout(() => {
          switchTab('login');
          setEmail(email);
        }, 2000);
      }
    } catch {
      setEroare('Eroare la înregistrare. Încearcă din nou.');
    } finally {
      setIncarcare(false);
    }
  };

  // Stiluri comune pentru input-uri
  const inputClass = `w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-foreground placeholder:text-gray-400
    focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all`;

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
          <p className="text-muted mt-1">
            {activeTab === 'login' ? 'Conectează-te pentru a continua' : 'Creează un cont nou'}
          </p>
        </div>

        {/* Tabs Login / Register */}
        <div className="flex mb-6 bg-gray-100 rounded-xl p-1">
          <button
            type="button"
            onClick={() => switchTab('login')}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200
              ${activeTab === 'login'
                ? 'bg-white text-primary shadow-sm'
                : 'text-muted hover:text-foreground'
              }`}
          >
            Conectare
          </button>
          <button
            type="button"
            onClick={() => switchTab('register')}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200
              ${activeTab === 'register'
                ? 'bg-white text-primary shadow-sm'
                : 'text-muted hover:text-foreground'
              }`}
          >
            Înregistrare
          </button>
        </div>

        {/* ===== FORMULAR LOGIN ===== */}
        {activeTab === 'login' && (
          <form onSubmit={handleLogin} className="bg-surface rounded-2xl shadow-xl shadow-primary/5 p-8 space-y-5 animate-fade-in">
            <div>
              <label htmlFor="login-email" className="block text-sm font-medium text-foreground mb-1.5">
                Adresă email
              </label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="exemplu@email.com"
                required
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="login-parola" className="block text-sm font-medium text-foreground mb-1.5">
                Parolă
              </label>
              <input
                id="login-parola"
                type="password"
                value={parola}
                onChange={(e) => setParola(e.target.value)}
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
              {incarcare ? 'Se conectează...' : 'Conectare'}
            </button>
          </form>
        )}

        {/* ===== FORMULAR REGISTER ===== */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegister} className="bg-surface rounded-2xl shadow-xl shadow-primary/5 p-8 space-y-5 animate-fade-in">
            <div>
              <label htmlFor="register-email" className="block text-sm font-medium text-foreground mb-1.5">
                Adresă email
              </label>
              <input
                id="register-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="exemplu@email.com"
                required
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="register-parola" className="block text-sm font-medium text-foreground mb-1.5">
                Parolă
              </label>
              <input
                id="register-parola"
                type="password"
                value={parola}
                onChange={(e) => setParola(e.target.value)}
                placeholder="Minim 6 caractere"
                required
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="register-confirma" className="block text-sm font-medium text-foreground mb-1.5">
                Confirmă parola
              </label>
              <input
                id="register-confirma"
                type="password"
                value={confirmaParola}
                onChange={(e) => setConfirmaParola(e.target.value)}
                placeholder="••••••••"
                required
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="register-cod" className="block text-sm font-medium text-foreground mb-1.5">
                Cod Acces <span className="text-danger">*</span>
              </label>
              <input
                id="register-cod"
                type="text"
                value={codAcces}
                onChange={(e) => setCodAcces(e.target.value)}
                placeholder="Introdu codul de acces"
                required
                className={inputClass}
              />
              <p className="text-xs text-muted mt-1">Codul de acces este necesar pentru înregistrare.</p>
            </div>

            {eroare && (
              <div className="bg-danger/10 text-danger text-sm px-4 py-3 rounded-xl">
                {eroare}
              </div>
            )}

            {succes && (
              <div className="bg-success/10 text-success text-sm px-4 py-3 rounded-xl">
                {succes}
              </div>
            )}

            <button
              type="submit"
              disabled={incarcare}
              className="w-full py-3 px-4 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl
                transition-all duration-200 shadow-lg shadow-primary/30 hover:shadow-primary/50
                disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              {incarcare ? 'Se creează contul...' : 'Creează cont'}
            </button>
          </form>
        )}

        <p className="text-center text-xs text-muted mt-6">
          © 2026 Atelier Auto Manager
        </p>
      </div>
    </div>
  );
}
