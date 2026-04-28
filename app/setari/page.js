// Pagina de Setări
// Conține: Paletă de culori, Schimbare parolă, Deconectare
// Optimizată pentru mobil

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/lib/supabase';
import { palete, aplicaPaleta, getPaletaSalvata } from '@/lib/palete';

export default function SetariPage() {
  const router = useRouter();
  const { signOut } = useAuth();

  // === PALETĂ CULORI ===
  const [paletaActiva, setPaletaActiva] = useState('albastru');
  const [paletaSelectata, setPaletaSelectata] = useState('albastru');

  useEffect(() => {
    const salvata = getPaletaSalvata();
    setPaletaActiva(salvata);
    setPaletaSelectata(salvata);
  }, []);

  const confirmaPaleta = () => {
    aplicaPaleta(paletaSelectata);
    setPaletaActiva(paletaSelectata);
  };

  // === SCHIMBARE PAROLĂ ===
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [parolaCurenta, setParolaCurenta] = useState('');
  const [parolaNoua, setParolaNoua] = useState('');
  const [confirmaParola, setConfirmaParola] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (parolaNoua !== confirmaParola) {
      setPasswordError('Parolele noi nu se potrivesc.');
      return;
    }
    if (parolaNoua.length < 6) {
      setPasswordError('Parola nouă trebuie să aibă minim 6 caractere.');
      return;
    }

    setPasswordLoading(true);

    try {
      // Verificăm parola curentă
      const { data: { user } } = await supabase.auth.getUser();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: parolaCurenta,
      });

      if (signInError) {
        setPasswordError('Parola curentă este incorectă.');
        setPasswordLoading(false);
        return;
      }

      const { error } = await supabase.auth.updateUser({ password: parolaNoua });

      if (error) {
        setPasswordError(error.message);
      } else {
        setPasswordSuccess('Parola a fost schimbată cu succes!');
        setParolaCurenta('');
        setParolaNoua('');
        setConfirmaParola('');
        setTimeout(() => {
          setShowPasswordSection(false);
          setPasswordSuccess('');
        }, 2500);
      }
    } catch {
      setPasswordError('Eroare la schimbarea parolei.');
    } finally {
      setPasswordLoading(false);
    }
  };

  // === DECONECTARE ===
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = async () => {
    await signOut();
    setShowLogoutModal(false);
    router.push('/');
  };

  // Stiluri
  const inputClass = `w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-white text-foreground placeholder:text-gray-400
    focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-base`;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-surface border-b border-gray-100 px-4 pt-6 pb-4 md:px-8">
        <h1 className="text-2xl font-bold text-foreground">Setări</h1>
        <p className="text-sm text-muted mt-1">Personalizează aplicația</p>
      </div>

      <div className="px-4 py-6 md:px-8 md:max-w-2xl space-y-6 pb-28">

        {/* ===== SECȚIUNE: CULOARE INTERFAȚĂ ===== */}
        <section className="bg-surface rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-5 pt-5 pb-3">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.098 19.902a3.75 3.75 0 005.304 0l6.401-6.402M6.75 21A3.75 3.75 0 013 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 003.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008z" />
              </svg>
              Culoare interfață
            </h2>
            <p className="text-xs text-muted mt-1">Alege paleta de culori preferată</p>
          </div>

          <div className="px-5 pb-5">
            <div className="grid grid-cols-3 gap-3">
              {palete.map((paleta) => {
                const selected = paletaSelectata === paleta.id;
                const isActive = paletaActiva === paleta.id;
                return (
                  <button
                    key={paleta.id}
                    onClick={() => setPaletaSelectata(paleta.id)}
                    className={`relative flex flex-col items-center gap-2 py-4 px-3 rounded-xl border-2 transition-all duration-200 active:scale-95
                      ${selected
                        ? 'bg-gray-50 shadow-sm'
                        : 'border-gray-100 hover:border-gray-200 bg-white'
                      }`}
                    style={selected ? { borderColor: paleta.color } : {}}
                  >
                    {/* Cerc culoare */}
                    <div
                      className="w-10 h-10 rounded-full shadow-md transition-transform duration-200"
                      style={{
                        backgroundColor: paleta.color,
                        boxShadow: selected ? `0 4px 14px ${paleta.color}40` : undefined,
                        transform: selected ? 'scale(1.1)' : undefined,
                      }}
                    />
                    <span className={`text-xs font-semibold ${selected ? 'text-foreground' : 'text-muted'}`}>
                      {paleta.name}
                    </span>
                    {/* Indicator: bifă dacă e paleta activă curentă */}
                    {isActive && (
                      <div
                        className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: paleta.color }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Buton Confirmă — apare doar când selecția e diferită de cea activă */}
            {paletaSelectata !== paletaActiva && (
              <button
                onClick={confirmaPaleta}
                className="w-full mt-4 py-3.5 px-4 font-semibold rounded-xl text-white text-base
                  transition-all duration-200 active:scale-[0.98] shadow-lg animate-fade-in"
                style={{
                  backgroundColor: palete.find(p => p.id === paletaSelectata)?.color,
                  boxShadow: `0 8px 25px ${palete.find(p => p.id === paletaSelectata)?.color}40`,
                }}
              >
                Aplică paleta {palete.find(p => p.id === paletaSelectata)?.name}
              </button>
            )}
          </div>
        </section>

        {/* ===== SECȚIUNE: SCHIMBARE PAROLĂ ===== */}
        <section className="bg-surface rounded-2xl border border-gray-100 overflow-hidden">
          <button
            onClick={() => {
              setShowPasswordSection(!showPasswordSection);
              setPasswordError('');
              setPasswordSuccess('');
              if (!showPasswordSection) {
                setParolaCurenta('');
                setParolaNoua('');
                setConfirmaParola('');
              }
            }}
            className="w-full flex items-center justify-between px-5 py-4 active:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
                </svg>
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-foreground">Schimbă parola</p>
                <p className="text-xs text-muted">Actualizează parola contului</p>
              </div>
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`w-5 h-5 text-muted transition-transform duration-200 ${showPasswordSection ? 'rotate-180' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </button>

          {/* Formular schimbare parolă — expandabil */}
          {showPasswordSection && (
            <div className="px-5 pb-5 animate-fade-in">
              <div className="border-t border-gray-100 pt-4">
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div>
                    <label htmlFor="set-parola-curenta" className="block text-sm font-medium text-foreground mb-1.5">
                      Parola curentă
                    </label>
                    <input
                      id="set-parola-curenta"
                      type="password"
                      value={parolaCurenta}
                      onChange={(e) => setParolaCurenta(e.target.value)}
                      placeholder="••••••••"
                      required
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label htmlFor="set-parola-noua" className="block text-sm font-medium text-foreground mb-1.5">
                      Parola nouă
                    </label>
                    <input
                      id="set-parola-noua"
                      type="password"
                      value={parolaNoua}
                      onChange={(e) => setParolaNoua(e.target.value)}
                      placeholder="Minim 6 caractere"
                      required
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label htmlFor="set-confirma-parola" className="block text-sm font-medium text-foreground mb-1.5">
                      Confirmă parola nouă
                    </label>
                    <input
                      id="set-confirma-parola"
                      type="password"
                      value={confirmaParola}
                      onChange={(e) => setConfirmaParola(e.target.value)}
                      placeholder="••••••••"
                      required
                      className={inputClass}
                    />
                  </div>

                  {passwordError && (
                    <div className="bg-danger/10 text-danger text-sm px-4 py-3 rounded-xl">
                      {passwordError}
                    </div>
                  )}

                  {passwordSuccess && (
                    <div className="bg-success/10 text-success text-sm px-4 py-3 rounded-xl">
                      {passwordSuccess}
                    </div>
                  )}

                  {!passwordSuccess && (
                    <button
                      type="submit"
                      disabled={passwordLoading}
                      className="w-full py-3.5 px-4 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl
                        transition-all duration-200 shadow-lg shadow-primary/30 hover:shadow-primary/50
                        disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] text-base"
                    >
                      {passwordLoading ? 'Se schimbă...' : 'Salvează parola nouă'}
                    </button>
                  )}
                </form>
              </div>
            </div>
          )}
        </section>

        {/* ===== SECȚIUNE: DECONECTARE ===== */}
        <section className="bg-surface rounded-2xl border border-gray-100 overflow-hidden">
          <button
            onClick={() => setShowLogoutModal(true)}
            className="w-full flex items-center gap-3 px-5 py-4 active:bg-red-50 transition-colors"
          >
            <div className="w-9 h-9 rounded-xl bg-danger/10 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
              </svg>
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-danger">Deconectare</p>
              <p className="text-xs text-muted">Ieși din contul tău</p>
            </div>
          </button>
        </section>

        {/* Info versiune */}
        <p className="text-center text-xs text-muted pt-2">
          Atelier Auto Manager v1.0 — © 2026
        </p>
      </div>

      {/* ===== MODAL CONFIRMARE DECONECTARE ===== */}
      {showLogoutModal && (
        <div
          className="fixed inset-0 z-[60] flex items-end md:items-center justify-center animate-modal-overlay"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowLogoutModal(false); }}
        >
          <div className="bg-white w-full md:max-w-sm md:rounded-2xl rounded-t-2xl shadow-2xl p-6 relative animate-modal-content pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
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

            {/* Linie drag indicator pe mobil */}
            <div className="w-10 h-1 rounded-full bg-gray-200 mx-auto mb-5 md:hidden" />

            {/* Icon */}
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

            <div className="flex flex-col-reverse md:flex-row gap-3">
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-3.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl
                  transition-all duration-200 active:scale-[0.98] text-base"
              >
                Anulează
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="flex-1 py-3.5 px-4 bg-danger hover:bg-red-700 text-white font-semibold rounded-xl
                  transition-all duration-200 shadow-lg shadow-danger/30 active:scale-[0.98] text-base"
              >
                Da, deconectează-mă
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
