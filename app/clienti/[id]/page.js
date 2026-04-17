// Pagina Detaliu Client — afișează mașinile clientului
// Navigare: Clienți → [Client] → Mașinile lui
// Include: info client, editare, ștergere, adăugare mașini, click pe mașină → lucrări

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ListSkeleton } from '@/components/Skeleton';

export default function ClientDetaliiPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.id;

  const [client, setClient] = useState(null);
  const [masini, setMasini] = useState([]);
  const [incarcare, setIncarcare] = useState(true);
  const [formDeschis, setFormDeschis] = useState(false);
  const [editClient, setEditClient] = useState(false);

  // Formular mașină nouă
  const [formMasina, setFormMasina] = useState({
    marca: '',
    model: '',
    an: '',
    numar_inmatriculare: '',
    vin: '',
  });

  // Formular editare client
  const [formClient, setFormClient] = useState({
    nume: '',
    telefon: '',
    email: '',
  });

  // Încarcă datele clientului și mașinile
  useEffect(() => {
    if (clientId) incarcaDate();
  }, [clientId]);

  const incarcaDate = async () => {
    try {
      // Datele clientului
      const { data: clientData, error: clientErr } = await supabase
        .from('clienti')
        .select('*')
        .eq('id', clientId)
        .single();

      if (clientErr) throw clientErr;
      setClient(clientData);
      setFormClient({
        nume: clientData.nume,
        telefon: clientData.telefon || '',
        email: clientData.email || '',
      });

      // Mașinile clientului + număr de programări per mașină
      const { data: masiniData, error: masiniErr } = await supabase
        .from('masini')
        .select('*, programari(id)')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

      if (masiniErr) throw masiniErr;
      setMasini(masiniData || []);
    } catch (err) {
      console.error('Eroare la încărcarea datelor:', err);
    } finally {
      setIncarcare(false);
    }
  };

  // Salvează mașină nouă
  const salveazaMasina = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('masini').insert([{
        ...formMasina,
        client_id: clientId,
        an: formMasina.an ? parseInt(formMasina.an) : null,
      }]);
      if (error) throw error;
      setFormDeschis(false);
      setFormMasina({ marca: '', model: '', an: '', numar_inmatriculare: '', vin: '' });
      incarcaDate();
    } catch (err) {
      console.error('Eroare la salvare:', err);
    }
  };

  // Actualizează client
  const actualizeazaClient = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('clienti')
        .update(formClient)
        .eq('id', clientId);
      if (error) throw error;
      setEditClient(false);
      incarcaDate();
    } catch (err) {
      console.error('Eroare la actualizare:', err);
    }
  };

  // Șterge client (cu confirmare)
  const stergeClient = async () => {
    if (!confirm('Ești sigur? Se vor șterge și toate mașinile și programările asociate.')) return;
    try {
      const { error } = await supabase.from('clienti').delete().eq('id', clientId);
      if (error) throw error;
      router.push('/clienti');
    } catch (err) {
      console.error('Eroare la ștergere:', err);
    }
  };

  // Șterge mașină
  const stergeMasina = async (masinaId) => {
    if (!confirm('Ești sigur? Se vor șterge și programările asociate.')) return;
    try {
      const { error } = await supabase.from('masini').delete().eq('id', masinaId);
      if (error) throw error;
      incarcaDate();
    } catch (err) {
      console.error('Eroare la ștergere:', err);
    }
  };

  if (incarcare) return <ListSkeleton />;

  if (!client) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted text-lg">Clientul nu a fost găsit.</p>
        <button onClick={() => router.push('/clienti')} className="mt-4 text-primary font-semibold hover:underline">
          ← Înapoi la clienți
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      {/* Breadcrumb + Navigație */}
      <div className="flex items-center gap-2 text-sm text-muted mb-6 animate-fade-in">
        <button onClick={() => router.push('/clienti')} className="hover:text-primary transition-colors font-medium">
          Clienți
        </button>
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
        <span className="text-foreground font-semibold">{client.nume}</span>
      </div>

      {/* Card info client */}
      <div className="bg-surface rounded-2xl p-6 shadow-sm mb-6 animate-fade-in">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-xl flex items-center justify-center font-bold text-2xl">
              {client.nume.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-secondary">{client.nume}</h1>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-muted">
                {client.telefon && <span>{client.telefon}</span>}
                {client.email && <span>{client.email}</span>}
              </div>
            </div>
          </div>

          {/* Butoane acțiuni client */}
          <div className="flex gap-2">
            <button
              onClick={() => setEditClient(true)}
              className="p-2.5 rounded-xl bg-primary/5 text-primary hover:bg-primary/10 transition-colors"
              title="Editează client"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
              </svg>
            </button>
            <button
              onClick={stergeClient}
              className="p-2.5 rounded-xl bg-danger/5 text-danger hover:bg-danger/10 transition-colors"
              title="Șterge client"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Titlu secțiune mașini + buton adaugă */}
      <div className="flex items-center justify-between mb-4 animate-fade-in">
        <h2 className="text-xl font-bold text-secondary">
          Mașini ({masini.length})
        </h2>
        <button
          onClick={() => setFormDeschis(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-dark text-white font-semibold
            rounded-xl transition-all shadow-lg shadow-primary/20 active:scale-[0.98]"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Mașină Nouă
        </button>
      </div>

      {/* Lista mașini — click pe mașină → lucrări */}
      {masini.length === 0 ? (
        <div className="bg-surface rounded-2xl p-10 text-center shadow-sm">
          <p className="text-muted text-lg">Nicio mașină înregistrată. Adaugă una!</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {masini.map((masina, index) => (
            <div
              key={masina.id}
              className="bg-surface rounded-2xl p-5 shadow-sm hover:shadow-md border-2 border-transparent hover:border-primary/20
                transition-all animate-slide-up flex items-center gap-4"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Click zone — navigare la lucrări */}
              <button
                onClick={() => router.push(`/clienti/${clientId}/masini/${masina.id}`)}
                className="flex-1 flex items-center gap-4 text-left cursor-pointer"
              >
                {/* Icon mașină */}
                <div className="w-14 h-14 bg-primary/10 text-primary rounded-xl flex items-center justify-center shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.072-.504.958-1.113l-1.71-9.13a1.875 1.875 0 00-1.846-1.507H5.498a1.875 1.875 0 00-1.846 1.507l-1.71 9.13C1.826 17.746 2.277 18.25 2.898 18.25H3.75m16.5 0h.375a.375.375 0 00.375-.375v-3.249a.375.375 0 00-.375-.375H20.25M3.75 14.25h16.5" />
                  </svg>
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-secondary text-lg">
                    {masina.marca} {masina.model}
                    {masina.an && <span className="text-muted font-normal ml-1 text-base">({masina.an})</span>}
                  </h3>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-sm text-muted">
                    {masina.numar_inmatriculare && (
                      <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-xs font-semibold">
                        {masina.numar_inmatriculare}
                      </span>
                    )}
                    <span>{masina.programari?.length || 0} lucrări</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </div>
              </button>

              {/* Buton ștergere mașină */}
              <button
                onClick={(e) => { e.stopPropagation(); stergeMasina(masina.id); }}
                className="p-2 rounded-xl bg-danger/5 text-danger hover:bg-danger/10 transition-colors shrink-0"
                title="Șterge mașina"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal formular mașină nouă */}
      {formDeschis && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-2xl p-6 w-full max-w-md shadow-2xl animate-slide-up max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-secondary mb-5">Mașină Nouă</h2>

            <form onSubmit={salveazaMasina} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Marcă *</label>
                  <input
                    type="text"
                    value={formMasina.marca}
                    onChange={(e) => setFormMasina({ ...formMasina, marca: e.target.value })}
                    placeholder="ex: Dacia"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-base focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Model *</label>
                  <input
                    type="text"
                    value={formMasina.model}
                    onChange={(e) => setFormMasina({ ...formMasina, model: e.target.value })}
                    placeholder="ex: Logan"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-base focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">An fabricație</label>
                <input
                  type="number"
                  value={formMasina.an}
                  onChange={(e) => setFormMasina({ ...formMasina, an: e.target.value })}
                  placeholder="ex: 2020"
                  min="1900" max="2099"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-base focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Număr înmatriculare</label>
                <input
                  type="text"
                  value={formMasina.numar_inmatriculare}
                  onChange={(e) => setFormMasina({ ...formMasina, numar_inmatriculare: e.target.value.toUpperCase() })}
                  placeholder="ex: B 123 ABC"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-base font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Serie șasiu (VIN)</label>
                <input
                  type="text"
                  value={formMasina.vin}
                  onChange={(e) => setFormMasina({ ...formMasina, vin: e.target.value.toUpperCase() })}
                  placeholder="17 caractere"
                  maxLength={17}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-base font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
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

      {/* Modal editare client */}
      {editClient && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-2xl p-6 w-full max-w-md shadow-2xl animate-slide-up">
            <h2 className="text-xl font-bold text-secondary mb-5">Editează Client</h2>

            <form onSubmit={actualizeazaClient} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Nume complet *</label>
                <input
                  type="text"
                  value={formClient.nume}
                  onChange={(e) => setFormClient({ ...formClient, nume: e.target.value })}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-base focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Telefon</label>
                <input
                  type="tel"
                  value={formClient.telefon}
                  onChange={(e) => setFormClient({ ...formClient, telefon: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-base focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Email</label>
                <input
                  type="email"
                  value={formClient.email}
                  onChange={(e) => setFormClient({ ...formClient, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-base focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditClient(false)}
                  className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-foreground font-semibold rounded-xl transition-colors text-base"
                >
                  Anulează
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl transition-all
                    shadow-lg shadow-primary/20 active:scale-[0.98] text-base"
                >
                  Salvează
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
