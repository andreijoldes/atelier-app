// Pagina de actualizare parolă
// Utilizatorul ajunge aici din link-ul primit pe email
// Supabase trimite tokenul ca hash în URL — ascultăm evenimentul PASSWORD_RECOVERY

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function UpdateParola() {
  const [parola, setParola] = useState('')
  const [confirmare, setConfirmare] = useState('')
  const [mesaj, setMesaj] = useState('')
  const [eroare, setEroare] = useState('')
  const [incarcare, setIncarcare] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Supabase trimite tokenul ca hash în URL
    // Trebuie să ascultăm evenimentul de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event) => {
        if (event === 'PASSWORD_RECOVERY') {
          // Suntem pe pagina corectă, utilizatorul poate schimba parola
          setMesaj('Introdu parola nouă mai jos')
        }
      }
    )
    return () => subscription.unsubscribe()
  }, [])

  const schimbaParola = async () => {
    setEroare('')
    if (parola !== confirmare) {
      setEroare('Parolele nu coincid')
      return
    }
    if (parola.length < 6) {
      setEroare('Parola trebuie să aibă minim 6 caractere')
      return
    }

    setIncarcare(true)
    const { error } = await supabase.auth.updateUser({
      password: parola
    })
    setIncarcare(false)

    if (error) {
      setEroare('Eroare: ' + error.message)
    } else {
      setMesaj('Parola a fost schimbată cu succes!')
      // Deconectare și redirect la pagina de login
      await supabase.auth.signOut()
      setTimeout(() => router.push('/'), 2000)
    }
  }

  // Stiluri comune — consistente cu restul aplicației
  const inputClass = `w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-foreground placeholder:text-gray-400
    focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all`

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
          <h1 className="text-2xl font-bold text-secondary">Setează parola nouă</h1>
          <p className="text-muted mt-1">Alege o parolă nouă pentru contul tău</p>
        </div>

        {/* Formular */}
        <div className="bg-surface rounded-2xl shadow-xl shadow-primary/5 p-8 space-y-5 animate-fade-in">
          {mesaj && (
            <div className="bg-success/10 text-success text-sm px-4 py-3 rounded-xl">
              {mesaj}
            </div>
          )}

          {eroare && (
            <div className="bg-danger/10 text-danger text-sm px-4 py-3 rounded-xl">
              {eroare}
            </div>
          )}

          <div>
            <label htmlFor="parola-noua" className="block text-sm font-medium text-foreground mb-1.5">
              Parolă nouă
            </label>
            <input
              id="parola-noua"
              type="password"
              placeholder="Minim 6 caractere"
              value={parola}
              onChange={e => setParola(e.target.value)}
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
              placeholder="••••••••"
              value={confirmare}
              onChange={e => setConfirmare(e.target.value)}
              className={inputClass}
            />
          </div>

          <button
            onClick={schimbaParola}
            disabled={incarcare}
            className="w-full py-3 px-4 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl
              transition-all duration-200 shadow-lg shadow-primary/30 hover:shadow-primary/50
              disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
          >
            {incarcare ? 'Se salvează...' : 'Salvează parola nouă'}
          </button>
        </div>

        <p className="text-center text-xs text-muted mt-6">
          © 2026 Atelier Auto Manager
        </p>
      </div>
    </div>
  )
}
