// Componenta Navbar — navigație principală (simplificată)
// Pe mobile: bară de jos (bottom navigation)
// Pe desktop: sidebar lateral stâng
// Meniu: Dashboard, Clienți, Programări, Devize (fără Mașini — accesibile prin client)
// Include: Schimbă parola, Confirmare deconectare

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/lib/supabase';

// Iconuri SVG inline pentru navigație
const icons = {
  dashboard: (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
  ),
  clienti: (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  ),
  programari: (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
    </svg>
  ),
  deviz: (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  ),
  logout: (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
    </svg>
  ),
  schimbaParola: (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
    </svg>
  ),
};

// Lista de pagini din meniu — simplificată (fără Mașini)
const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: icons.dashboard },
  { href: '/clienti', label: 'Clienți', icon: icons.clienti },
  { href: '/programari', label: 'Programări', icon: icons.programari },
  { href: '/deviz', label: 'Devize', icon: icons.deviz },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useAuth();

  // State-uri pentru modale
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);

  // State-uri pentru schimbare parolă
  const [parolaCurenta, setParolaCurenta] = useState('');
  const [parolaNoua, setParolaNoua] = useState('');
  const [confirmaParolaNoua, setConfirmaParolaNoua] = useState('');
  const [changePasswordLoading, setChangePasswordLoading] = useState(false);
  const [changePasswordError, setChangePasswordError] = useState('');
  const [changePasswordSuccess, setChangePasswordSuccess] = useState('');

  // Deschide modalul de logout
  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  // Confirmare deconectare
  const handleLogoutConfirm = async () => {
    await signOut();
    setShowLogoutModal(false);
    router.push('/');
  };

  // Deschide modalul de schimbare parolă
  const openChangePasswordModal = () => {
    setParolaCurenta('');
    setParolaNoua('');
    setConfirmaParolaNoua('');
    setChangePasswordError('');
    setChangePasswordSuccess('');
    setShowChangePasswordModal(true);
  };

  // Schimbare parolă
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setChangePasswordError('');
    setChangePasswordSuccess('');

    if (parolaNoua !== confirmaParolaNoua) {
      setChangePasswordError('Parolele noi nu se potrivesc.');
      return;
    }

    if (parolaNoua.length < 6) {
      setChangePasswordError('Parola nouă trebuie să aibă minim 6 caractere.');
      return;
    }

    setChangePasswordLoading(true);

    try {
      // Verificăm parola curentă prin re-autentificare
      const { data: { user } } = await supabase.auth.getUser();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: parolaCurenta,
      });

      if (signInError) {
        setChangePasswordError('Parola curentă este incorectă.');
        setChangePasswordLoading(false);
        return;
      }

      // Actualizăm parola
      const { error } = await supabase.auth.updateUser({ password: parolaNoua });

      if (error) {
        setChangePasswordError(error.message);
      } else {
        setChangePasswordSuccess('Parola a fost schimbată');
        setTimeout(() => {
          setShowChangePasswordModal(false);
        }, 2000);
      }
    } catch {
      setChangePasswordError('Eroare la schimbarea parolei. Încearcă din nou.');
    } finally {
      setChangePasswordLoading(false);
    }
  };

  // Verifică dacă pathname-ul curent face parte dintr-un nav item
  // (ex: /clienti/abc-123 → clienti e activ)
  const isActive = (href) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  // Stiluri comune pentru input-uri din modals
  const inputClass = `w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-foreground placeholder:text-gray-400
    focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all`;

  return (
    <>
      {/* ===== SIDEBAR DESKTOP (ascuns pe mobile) ===== */}
      <aside className="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0 bg-secondary text-white z-40">
        {/* Logo / Brand */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085" />
            </svg>
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">Atelier Auto</h1>
            <p className="text-xs text-white/50">Manager</p>
          </div>
        </div>

        {/* Link-uri navigație */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200
                  ${active
                    ? 'bg-primary text-white shadow-lg shadow-primary/30'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Buton Schimbă parola + Logout + Footer sidebar */}
        <div className="px-3 py-4 border-t border-white/10 space-y-1">
          <button
            onClick={openChangePasswordModal}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold w-full
              text-white/60 hover:text-white hover:bg-white/5 transition-all duration-200"
          >
            {icons.schimbaParola}
            Schimbă parola
          </button>
          <p className="text-xs text-white/30 text-center pt-2">© 2026 Atelier Auto</p>
          <button
            onClick={handleLogoutClick}
            className="text-[11px] text-white/25 hover:text-white/50 transition-colors duration-200 mx-auto block mt-1"
          >
            Deconectare
          </button>
        </div>
      </aside>

      {/* ===== BOTTOM NAV MOBILE (ascuns pe desktop) ===== */}
      <nav className="fixed bottom-0 left-0 right-0 md:hidden bg-white/95 backdrop-blur-lg border-t border-gray-200 z-50 pb-[env(safe-area-inset-bottom)]">
        <div className="flex justify-around items-center h-20 px-2">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 min-w-[60px]
                  ${active
                    ? 'text-primary bg-primary/10 scale-105'
                    : 'text-gray-400 hover:text-primary active:scale-95'
                  }`}
              >
                <span className="[&>svg]:w-6 [&>svg]:h-6">{item.icon}</span>
                <span className={`text-[11px] font-bold leading-tight ${active ? 'text-primary' : ''}`}>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* ===== MODAL CONFIRMARE DECONECTARE ===== */}
      {showLogoutModal && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center px-4 animate-modal-overlay"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowLogoutModal(false); }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 relative animate-modal-content">
            {/* Buton X închidere */}
            <button
              type="button"
              onClick={() => setShowLogoutModal(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
              aria-label="Închide"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Icon avertisment */}
            <div className="w-14 h-14 bg-danger/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
              </svg>
            </div>

            <h2 className="text-lg font-bold text-secondary text-center mb-2">
              Ești sigur că vrei să te deconectezi?
            </h2>
            <p className="text-sm text-muted text-center mb-6">
              Vei fi redirecționat la pagina de conectare.
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl
                  transition-all duration-200 active:scale-[0.98]"
              >
                Anulează
              </button>
              <button
                type="button"
                onClick={handleLogoutConfirm}
                className="flex-1 py-3 px-4 bg-danger hover:bg-red-700 text-white font-semibold rounded-xl
                  transition-all duration-200 shadow-lg shadow-danger/30 active:scale-[0.98]"
              >
                Da, deconectează-mă
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== MODAL SCHIMBARE PAROLĂ ===== */}
      {showChangePasswordModal && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center px-4 animate-modal-overlay"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowChangePasswordModal(false); }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 relative animate-modal-content">
            {/* Buton X închidere */}
            <button
              type="button"
              onClick={() => setShowChangePasswordModal(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
              aria-label="Închide"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h2 className="text-lg font-bold text-secondary mb-1">Schimbă parola</h2>
            <p className="text-sm text-muted mb-5">Introdu parola curentă și parola nouă dorită.</p>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label htmlFor="parola-curenta" className="block text-sm font-medium text-foreground mb-1.5">
                  Parola curentă
                </label>
                <input
                  id="parola-curenta"
                  type="password"
                  value={parolaCurenta}
                  onChange={(e) => setParolaCurenta(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoFocus
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="parola-noua-nav" className="block text-sm font-medium text-foreground mb-1.5">
                  Parola nouă
                </label>
                <input
                  id="parola-noua-nav"
                  type="password"
                  value={parolaNoua}
                  onChange={(e) => setParolaNoua(e.target.value)}
                  placeholder="Minim 6 caractere"
                  required
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="confirma-parola-nav" className="block text-sm font-medium text-foreground mb-1.5">
                  Confirmă parola nouă
                </label>
                <input
                  id="confirma-parola-nav"
                  type="password"
                  value={confirmaParolaNoua}
                  onChange={(e) => setConfirmaParolaNoua(e.target.value)}
                  placeholder="••••••••"
                  required
                  className={inputClass}
                />
              </div>

              {changePasswordError && (
                <div className="bg-danger/10 text-danger text-sm px-4 py-3 rounded-xl">
                  {changePasswordError}
                </div>
              )}

              {changePasswordSuccess && (
                <div className="bg-success/10 text-success text-sm px-4 py-3 rounded-xl">
                  {changePasswordSuccess}
                </div>
              )}

              {!changePasswordSuccess && (
                <button
                  type="submit"
                  disabled={changePasswordLoading}
                  className="w-full py-3 px-4 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl
                    transition-all duration-200 shadow-lg shadow-primary/30 hover:shadow-primary/50
                    disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                >
                  {changePasswordLoading ? 'Se schimbă...' : 'Schimbă parola'}
                </button>
              )}
            </form>
          </div>
        </div>
      )}
    </>
  );
}
