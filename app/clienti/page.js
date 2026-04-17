// Pagina Clienți — listă clickabilă cu navigare spre detaliu client
// Click pe client → /clienti/[id] (mașini + lucrări)

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ListSkeleton } from '@/components/Skeleton';

export default function ClientiPage() {
  const router = useRouter();
  const [clienti, setClienti] = useState([]);
  const [cautare, setCautare] = useState('');
  const [incarcare, setIncarcare] = useState(true);
  const [formDeschis, setFormDeschis] = useState(false);

  // Stare formular adăugare client
  const [form, setForm] = useState({
    nume: '',
    telefon: '',
    email: '',
  });

  // Încarcă clienții + numărul de mașini per client
  useEffect(() => {
    incarcaClienti();
  }, []);

  const incarcaClienti = async () => {
    try {
      const { data, error } = await supabase
        .from('clienti')
        .select('*, masini(id)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClienti(data || []);
    } catch (err) {
      console.error('Eroare la încărcarea clienților:', err);
    } finally {
      setIncarcare(false);
    }
  };

  // Filtrare clienți
  const clientiFiltrati = clienti.filter((c) =>
    c.nume.toLowerCase().includes(cautare.toLowerCase()) ||
    c.telefon?.includes(cautare) ||
    c.email?.toLowerCase().includes(cautare.toLowerCase())
  );

  // Salvează client nou
  const salveazaClient = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('clienti').insert([form]);
      if (error) throw error;
      setFormDeschis(false);
      setForm({ nume: '', telefon: '', email: '' });
      incarcaClienti();
    } catch (err) {
      console.error('Eroare la salvare:', err);
    }
  };

  if (incarcare) {
    return <ListSkeleton />;
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 animate-fade-in">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-secondary">Clienți</h1>
          <p className="text-muted mt-1 text-base">{clienti.length} clienți înregistrați</p>
        </div>
        <button
          onClick={() => setFormDeschis(true)}
          className="inline-flex items-center gap-2 px-5 py-3 bg-primary hover:bg-primary-dark text-white font-semibold text-base
            rounded-xl transition-all shadow-lg shadow-primary/20 hover:shadow-primary/40 active:scale-[0.98]"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Client Nou
        </button>
      </div>

      {/* Bară de căutare */}
      <div className="mb-6 animate-fade-in">
        <div className="relative">
          <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            value={cautare}
            onChange={(e) => setCautare(e.target.value)}
            placeholder="Caută după nume, telefon sau email..."
            className="w-full pl-12 pr-4 py-3.5 bg-surface rounded-xl border border-gray-200 text-foreground text-base placeholder:text-gray-400
              focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          />
        </div>
      </div>

      {/* Lista de clienți — fiecare card e clickabil */}
      {clientiFiltrati.length === 0 ? (
        <div className="bg-surface rounded-2xl p-12 text-center shadow-sm">
          <p className="text-muted text-lg">Nu s-au găsit clienți.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {clientiFiltrati.map((client, index) => (
            <button
              key={client.id}
              onClick={() => router.push(`/clienti/${client.id}`)}
              className="w-full text-left bg-surface rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-primary/20 border-2 border-transparent
                transition-all animate-slide-up flex items-center gap-4 active:scale-[0.99] cursor-pointer"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Avatar */}
              <div className="w-14 h-14 bg-primary/10 text-primary rounded-xl flex items-center justify-center font-bold text-xl shrink-0">
                {client.nume.charAt(0).toUpperCase()}
              </div>

              {/* Info client */}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-secondary text-lg">{client.nume}</h3>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-muted">
                  {client.telefon && (
                    <span className="flex items-center gap-1.5">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                      </svg>
                      {client.telefon}
                    </span>
                  )}
                  {client.email && (
                    <span className="flex items-center gap-1.5 truncate">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                      </svg>
                      {client.email}
                    </span>
                  )}
                </div>
              </div>

              {/* Badge mașini + săgeată */}
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-sm text-muted bg-gray-100 px-3 py-1.5 rounded-lg font-medium">
                  {client.masini?.length || 0} mașini
                </span>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Modal formular client nou — simplificat */}
      {formDeschis && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-2xl p-6 w-full max-w-md shadow-2xl animate-slide-up">
            <h2 className="text-xl font-bold text-secondary mb-5">Client Nou</h2>

            <form onSubmit={salveazaClient} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Nume complet *</label>
                <input
                  type="text"
                  value={form.nume}
                  onChange={(e) => setForm({ ...form, nume: e.target.value })}
                  required
                  placeholder="ex: Ion Popescu"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-base focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Telefon</label>
                <input
                  type="tel"
                  value={form.telefon}
                  onChange={(e) => setForm({ ...form, telefon: e.target.value })}
                  placeholder="07xx xxx xxx"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-base focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="exemplu@email.com"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-base focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setFormDeschis(false)}
                  className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-foreground font-semibold rounded-xl transition-colors text-base"
                >
                  Anulează
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl transition-all
                    shadow-lg shadow-primary/20 active:scale-[0.98] text-base"
                >
                  Adaugă
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
