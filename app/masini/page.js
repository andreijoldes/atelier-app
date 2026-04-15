// Pagina Mașini — listă mașini + adaugă mașină la client
// Include selectare client și detalii vehicul

'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { ListSkeleton } from '@/components/Skeleton';

export default function MasiniPage() {
  const [masini, setMasini] = useState([]);
  const [clienti, setClienti] = useState([]);
  const [incarcare, setIncarcare] = useState(true);
  const [formDeschis, setFormDeschis] = useState(false);
  const [masinaEditata, setMasinaEditata] = useState(null);
  const [cautare, setCautare] = useState('');

  // Stare formular
  const [form, setForm] = useState({
    client_id: '',
    marca: '',
    model: '',
    an: '',
    numar_inmatriculare: '',
    vin: '',
  });

  // Încarcă datele inițiale
  useEffect(() => {
    incarcaDate();
  }, []);

  const incarcaDate = async () => {
    try {
      // Încarcă mașinile cu datele clientului asociat
      const { data: masiniData } = await supabase
        .from('masini')
        .select('*, clienti(nume)')
        .order('created_at', { ascending: false });

      // Încarcă lista clienților pentru select
      const { data: clientiData } = await supabase
        .from('clienti')
        .select('id, nume')
        .order('nume');

      setMasini(masiniData || []);
      setClienti(clientiData || []);
    } catch (err) {
      console.error('Eroare la încărcarea datelor:', err);
    } finally {
      setIncarcare(false);
    }
  };

  // Filtrare mașini
  const masiniFiltrate = masini.filter((m) =>
    m.marca.toLowerCase().includes(cautare.toLowerCase()) ||
    m.model.toLowerCase().includes(cautare.toLowerCase()) ||
    m.numar_inmatriculare?.toLowerCase().includes(cautare.toLowerCase()) ||
    m.clienti?.nume?.toLowerCase().includes(cautare.toLowerCase())
  );

  // Deschide formular nou
  const deschideFormularNou = () => {
    setForm({ client_id: '', marca: '', model: '', an: '', numar_inmatriculare: '', vin: '' });
    setMasinaEditata(null);
    setFormDeschis(true);
  };

  // Deschide formular editare
  const deschideFormularEditare = (masina) => {
    setForm({
      client_id: masina.client_id,
      marca: masina.marca,
      model: masina.model,
      an: masina.an || '',
      numar_inmatriculare: masina.numar_inmatriculare || '',
      vin: masina.vin || '',
    });
    setMasinaEditata(masina);
    setFormDeschis(true);
  };

  // Salvează mașina
  const salveazaMasina = async (e) => {
    e.preventDefault();
    const dateFormular = {
      ...form,
      an: form.an ? parseInt(form.an) : null,
    };

    try {
      if (masinaEditata) {
        const { error } = await supabase
          .from('masini')
          .update(dateFormular)
          .eq('id', masinaEditata.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('masini')
          .insert([dateFormular]);
        if (error) throw error;
      }

      setFormDeschis(false);
      incarcaDate();
    } catch (err) {
      console.error('Eroare la salvarea mașinii:', err);
    }
  };

  // Șterge mașina
  const stergeMasina = async (id) => {
    if (!confirm('Ești sigur că vrei să ștergi această mașină?')) return;
    try {
      const { error } = await supabase.from('masini').delete().eq('id', id);
      if (error) throw error;
      incarcaDate();
    } catch (err) {
      console.error('Eroare la ștergerea mașinii:', err);
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
          <h1 className="text-2xl md:text-3xl font-bold text-secondary">Mașini</h1>
          <p className="text-muted mt-1">{masini.length} vehicule înregistrate</p>
        </div>
        <button
          onClick={deschideFormularNou}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-dark text-white font-medium
            rounded-xl transition-all shadow-lg shadow-primary/20 hover:shadow-primary/40 active:scale-[0.98]"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Mașină Nouă
        </button>
      </div>

      {/* Căutare */}
      <div className="mb-6 animate-fade-in">
        <div className="relative">
          <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            value={cautare}
            onChange={(e) => setCautare(e.target.value)}
            placeholder="Caută după marcă, model, număr sau client..."
            className="w-full pl-12 pr-4 py-3 bg-surface rounded-xl border border-gray-200 text-foreground placeholder:text-gray-400
              focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          />
        </div>
      </div>

      {/* Lista mașini */}
      {masiniFiltrate.length === 0 ? (
        <div className="bg-surface rounded-2xl p-12 text-center">
          <p className="text-muted">Nu s-au găsit mașini.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {masiniFiltrate.map((masina, index) => (
            <div
              key={masina.id}
              className="bg-surface rounded-2xl p-5 shadow-sm hover:shadow-md transition-all animate-slide-up flex flex-col sm:flex-row sm:items-center gap-4"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Icon mașină */}
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.072-.504.958-1.113l-1.71-9.13a1.875 1.875 0 00-1.846-1.507H5.498a1.875 1.875 0 00-1.846 1.507l-1.71 9.13C1.826 17.746 2.277 18.25 2.898 18.25H3.75m16.5 0h.375a.375.375 0 00.375-.375v-3.249a.375.375 0 00-.375-.375H20.25M3.75 14.25h16.5" />
                </svg>
              </div>

              {/* Info mașină */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-secondary">
                  {masina.marca} {masina.model}
                  {masina.an && <span className="text-muted font-normal ml-1">({masina.an})</span>}
                </h3>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-muted">
                  <span>Client: {masina.clienti?.nume || '—'}</span>
                  {masina.numar_inmatriculare && (
                    <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-xs">
                      {masina.numar_inmatriculare}
                    </span>
                  )}
                </div>
              </div>

              {/* Acțiuni */}
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => deschideFormularEditare(masina)}
                  className="p-2.5 rounded-xl bg-primary/5 text-primary hover:bg-primary/10 transition-colors"
                  title="Editează"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                  </svg>
                </button>
                <button
                  onClick={() => stergeMasina(masina.id)}
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

      {/* Modal formular mașină */}
      {formDeschis && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-2xl p-6 w-full max-w-md shadow-2xl animate-slide-up max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-secondary mb-5">
              {masinaEditata ? 'Editează Mașină' : 'Mașină Nouă'}
            </h2>

            <form onSubmit={salveazaMasina} className="space-y-4">
              {/* Client */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Client *</label>
                <select
                  value={form.client_id}
                  onChange={(e) => setForm({ ...form, client_id: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                >
                  <option value="">Selectează client...</option>
                  {clienti.map((c) => (
                    <option key={c.id} value={c.id}>{c.nume}</option>
                  ))}
                </select>
              </div>

              {/* Marcă și Model */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Marcă *</label>
                  <input
                    type="text"
                    value={form.marca}
                    onChange={(e) => setForm({ ...form, marca: e.target.value })}
                    placeholder="ex: Dacia"
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Model *</label>
                  <input
                    type="text"
                    value={form.model}
                    onChange={(e) => setForm({ ...form, model: e.target.value })}
                    placeholder="ex: Logan"
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  />
                </div>
              </div>

              {/* An fabricație */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">An fabricație</label>
                <input
                  type="number"
                  value={form.an}
                  onChange={(e) => setForm({ ...form, an: e.target.value })}
                  placeholder="ex: 2020"
                  min="1900"
                  max="2099"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
              </div>

              {/* Număr înmatriculare */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Număr înmatriculare</label>
                <input
                  type="text"
                  value={form.numar_inmatriculare}
                  onChange={(e) => setForm({ ...form, numar_inmatriculare: e.target.value.toUpperCase() })}
                  placeholder="ex: B 123 ABC"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all font-mono"
                />
              </div>

              {/* VIN */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Serie șasiu (VIN)</label>
                <input
                  type="text"
                  value={form.vin}
                  onChange={(e) => setForm({ ...form, vin: e.target.value.toUpperCase() })}
                  placeholder="17 caractere"
                  maxLength={17}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all font-mono"
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
                  {masinaEditata ? 'Salvează' : 'Adaugă'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
