// Pagina Clienți — listă, căutare și adaugă client nou
// CRUD complet pentru gestionarea clienților

'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { ListSkeleton } from '@/components/Skeleton';

export default function ClientiPage() {
  const [clienti, setClienti] = useState([]);
  const [cautare, setCautare] = useState('');
  const [incarcare, setIncarcare] = useState(true);
  const [formDeschis, setFormDeschis] = useState(false);
  const [clientEditat, setClientEditat] = useState(null);

  // Stare formular
  const [form, setForm] = useState({
    nume: '',
    telefon: '',
    email: '',
    adresa: '',
  });

  // Încarcă clienții la montarea componentei
  useEffect(() => {
    incarcaClienti();
  }, []);

  const incarcaClienti = async () => {
    try {
      const { data, error } = await supabase
        .from('clienti')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClienti(data || []);
    } catch (err) {
      console.error('Eroare la încărcarea clienților:', err);
    } finally {
      setIncarcare(false);
    }
  };

  // Filtrare clienți după căutare
  const clientiFiltrati = clienti.filter((c) =>
    c.nume.toLowerCase().includes(cautare.toLowerCase()) ||
    c.telefon?.includes(cautare) ||
    c.email?.toLowerCase().includes(cautare.toLowerCase())
  );

  // Deschide formularul pentru adăugare
  const deschideFormularNou = () => {
    setForm({ nume: '', telefon: '', email: '', adresa: '' });
    setClientEditat(null);
    setFormDeschis(true);
  };

  // Deschide formularul pentru editare
  const deschideFormularEditare = (client) => {
    setForm({
      nume: client.nume,
      telefon: client.telefon || '',
      email: client.email || '',
      adresa: client.adresa || '',
    });
    setClientEditat(client);
    setFormDeschis(true);
  };

  // Salvează clientul (adaugă sau actualizează)
  const salveazaClient = async (e) => {
    e.preventDefault();

    try {
      if (clientEditat) {
        // Actualizare client existent
        const { error } = await supabase
          .from('clienti')
          .update(form)
          .eq('id', clientEditat.id);

        if (error) throw error;
      } else {
        // Adaugă client nou
        const { error } = await supabase
          .from('clienti')
          .insert([form]);

        if (error) throw error;
      }

      setFormDeschis(false);
      incarcaClienti();
    } catch (err) {
      console.error('Eroare la salvarea clientului:', err);
    }
  };

  // Șterge un client
  const stergeClient = async (id) => {
    if (!confirm('Ești sigur că vrei să ștergi acest client?')) return;

    try {
      const { error } = await supabase
        .from('clienti')
        .delete()
        .eq('id', id);

      if (error) throw error;
      incarcaClienti();
    } catch (err) {
      console.error('Eroare la ștergerea clientului:', err);
    }
  };

  if (incarcare) {
    return <ListSkeleton />;
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 animate-fade-in">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-secondary">Clienți</h1>
          <p className="text-muted mt-1">{clienti.length} clienți înregistrați</p>
        </div>
        <button
          onClick={deschideFormularNou}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-dark text-white font-medium
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
            className="w-full pl-12 pr-4 py-3 bg-surface rounded-xl border border-gray-200 text-foreground placeholder:text-gray-400
              focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          />
        </div>
      </div>

      {/* Lista de clienți */}
      {clientiFiltrati.length === 0 ? (
        <div className="bg-surface rounded-2xl p-12 text-center">
          <p className="text-muted">Nu s-au găsit clienți.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {clientiFiltrati.map((client, index) => (
            <div
              key={client.id}
              className="bg-surface rounded-2xl p-5 shadow-sm hover:shadow-md transition-all animate-slide-up flex flex-col sm:flex-row sm:items-center gap-4"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Avatar */}
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center font-bold text-lg shrink-0">
                {client.nume.charAt(0).toUpperCase()}
              </div>

              {/* Info client */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-secondary">{client.nume}</h3>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-muted">
                  {client.telefon && (
                    <span className="flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                      </svg>
                      {client.telefon}
                    </span>
                  )}
                  {client.email && (
                    <span className="flex items-center gap-1 truncate">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                      </svg>
                      {client.email}
                    </span>
                  )}
                </div>
              </div>

              {/* Acțiuni */}
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => deschideFormularEditare(client)}
                  className="p-2.5 rounded-xl bg-primary/5 text-primary hover:bg-primary/10 transition-colors"
                  title="Editează"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                  </svg>
                </button>
                <button
                  onClick={() => stergeClient(client.id)}
                  className="p-2.5 rounded-xl bg-danger/5 text-danger hover:bg-danger/10 transition-colors"
                  title="Șterge"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal formular client */}
      {formDeschis && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-2xl p-6 w-full max-w-md shadow-2xl animate-slide-up">
            <h2 className="text-xl font-bold text-secondary mb-5">
              {clientEditat ? 'Editează Client' : 'Client Nou'}
            </h2>

            <form onSubmit={salveazaClient} className="space-y-4">
              {/* Nume */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Nume complet *</label>
                <input
                  type="text"
                  value={form.nume}
                  onChange={(e) => setForm({ ...form, nume: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
              </div>

              {/* Telefon */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Telefon</label>
                <input
                  type="tel"
                  value={form.telefon}
                  onChange={(e) => setForm({ ...form, telefon: e.target.value })}
                  placeholder="07xx xxx xxx"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
              </div>

              {/* Adresă */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Adresă</label>
                <textarea
                  value={form.adresa}
                  onChange={(e) => setForm({ ...form, adresa: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none"
                />
              </div>

              {/* Butoane */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setFormDeschis(false)}
                  className="flex-1 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-foreground font-medium rounded-xl transition-colors"
                >
                  Anulează
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 bg-primary hover:bg-primary-dark text-white font-medium rounded-xl transition-all
                    shadow-lg shadow-primary/20 active:scale-[0.98]"
                >
                  {clientEditat ? 'Salvează' : 'Adaugă'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
