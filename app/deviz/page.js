// Pagina Deviz — adaugă piese + manoperă + total automat
// Calculează automat totalul pe baza cantității și prețului unitar

'use client';

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { DevizSkeleton } from '@/components/Skeleton';

export default function DevizPage() {
  const [programari, setProgramari] = useState([]);
  const [devize, setDevize] = useState([]);
  const [programareSelectata, setProgramareSelectata] = useState('');
  const [incarcare, setIncarcare] = useState(true);
  const [formDeschis, setFormDeschis] = useState(false);
  const [devizEditat, setDevizEditat] = useState(null);

  // Stare formular
  const [form, setForm] = useState({
    tip: 'piesa',
    descriere: '',
    cantitate: '1',
    pret_unitar: '',
  });

  // Încarcă datele
  useEffect(() => {
    incarcaDate();
  }, []);

  // Încarcă devizele când se schimbă programarea selectată
  useEffect(() => {
    if (programareSelectata) {
      incarcaDevize();
    }
  }, [programareSelectata]);

  const incarcaDate = async () => {
    try {
      const { data } = await supabase
        .from('programari')
        .select('*, clienti(nume), masini(marca, model, numar_inmatriculare)')
        .order('data_programare', { ascending: false });

      setProgramari(data || []);

      // Selectează prima programare dacă există
      if (data && data.length > 0) {
        setProgramareSelectata(data[0].id);
      }
    } catch (err) {
      console.error('Eroare:', err);
    } finally {
      setIncarcare(false);
    }
  };

  const incarcaDevize = async () => {
    try {
      const { data } = await supabase
        .from('devize')
        .select('*')
        .eq('programare_id', programareSelectata)
        .order('created_at', { ascending: true });

      setDevize(data || []);
    } catch (err) {
      console.error('Eroare la încărcarea devizelor:', err);
    }
  };

  // Calculează totalurile automat
  const totaluri = useMemo(() => {
    const piese = devize
      .filter((d) => d.tip === 'piesa')
      .reduce((sum, d) => sum + d.cantitate * d.pret_unitar, 0);

    const manopera = devize
      .filter((d) => d.tip === 'manopera')
      .reduce((sum, d) => sum + d.cantitate * d.pret_unitar, 0);

    return { piese, manopera, total: piese + manopera };
  }, [devize]);

  // Deschide formular nou
  const deschideFormularNou = () => {
    setForm({ tip: 'piesa', descriere: '', cantitate: '1', pret_unitar: '' });
    setDevizEditat(null);
    setFormDeschis(true);
  };

  // Deschide formular editare
  const deschideFormularEditare = (deviz) => {
    setForm({
      tip: deviz.tip,
      descriere: deviz.descriere,
      cantitate: String(deviz.cantitate),
      pret_unitar: String(deviz.pret_unitar),
    });
    setDevizEditat(deviz);
    setFormDeschis(true);
  };

  // Salvează devizul
  const salveazaDeviz = async (e) => {
    e.preventDefault();
    try {
      const dateFormular = {
        programare_id: programareSelectata,
        tip: form.tip,
        descriere: form.descriere,
        cantitate: parseFloat(form.cantitate),
        pret_unitar: parseFloat(form.pret_unitar),
      };

      if (devizEditat) {
        const { error } = await supabase.from('devize').update(dateFormular).eq('id', devizEditat.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('devize').insert([dateFormular]);
        if (error) throw error;
      }

      setFormDeschis(false);
      incarcaDevize();
    } catch (err) {
      console.error('Eroare la salvare:', err);
    }
  };

  // Șterge deviz
  const stergeDeviz = async (id) => {
    if (!confirm('Ești sigur că vrei să ștergi această linie?')) return;
    try {
      const { error } = await supabase.from('devize').delete().eq('id', id);
      if (error) throw error;
      incarcaDevize();
    } catch (err) {
      console.error('Eroare la ștergere:', err);
    }
  };

  // Formatare preț în RON
  const formatPreț = (valoare) => {
    return new Intl.NumberFormat('ro-RO', {
      style: 'currency',
      currency: 'RON',
      minimumFractionDigits: 2,
    }).format(valoare);
  };

  // Informația programării selectate
  const progInfo = programari.find((p) => p.id === programareSelectata);

  if (incarcare) {
    return <DevizSkeleton />;
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 animate-fade-in">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-secondary">Devize</h1>
          <p className="text-muted mt-1">Piese, manoperă și costuri</p>
        </div>
        {programareSelectata && (
          <button
            onClick={deschideFormularNou}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-dark text-white font-medium
              rounded-xl transition-all shadow-lg shadow-primary/20 hover:shadow-primary/40 active:scale-[0.98]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Adaugă Linie
          </button>
        )}
      </div>

      {/* Selector programare */}
      <div className="bg-surface rounded-2xl p-5 shadow-sm mb-6 animate-fade-in">
        <label className="block text-sm font-medium text-foreground mb-2">Selectează programarea</label>
        <select
          value={programareSelectata}
          onChange={(e) => setProgramareSelectata(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
        >
          <option value="">Alege o programare...</option>
          {programari.map((p) => (
            <option key={p.id} value={p.id}>
              {p.clienti?.nume || '—'} — {p.masini ? `${p.masini.marca} ${p.masini.model}` : '—'} ({new Date(p.data_programare).toLocaleDateString('ro-RO')})
            </option>
          ))}
        </select>

        {/* Info programare selectată */}
        {progInfo && (
          <div className="mt-3 p-3 bg-primary-50 rounded-xl text-sm">
            <p className="font-medium text-secondary">{progInfo.clienti?.nume}</p>
            <p className="text-muted">
              {progInfo.masini?.marca} {progInfo.masini?.model}
              {progInfo.masini?.numar_inmatriculare && ` • ${progInfo.masini.numar_inmatriculare}`}
            </p>
            {progInfo.descriere && (
              <p className="text-muted mt-1 text-xs">{progInfo.descriere}</p>
            )}
          </div>
        )}
      </div>

      {/* Tabel devize */}
      {programareSelectata && (
        <div className="bg-surface rounded-2xl shadow-sm overflow-hidden animate-slide-up">
          {/* Header secțiuni */}
          <div className="p-5 border-b border-gray-100">
            <h2 className="font-semibold text-secondary">Linii deviz</h2>
          </div>

          {devize.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-muted">Nu există linii în deviz. Adaugă piese sau manoperă.</p>
            </div>
          ) : (
            <>
              {/* Lista de linii */}
              <div className="divide-y divide-gray-50">
                {devize.map((d, index) => (
                  <div
                    key={d.id}
                    className="flex flex-col sm:flex-row sm:items-center gap-3 p-5 hover:bg-gray-50/50 transition-colors animate-fade-in"
                    style={{ animationDelay: `${index * 40}ms` }}
                  >
                    {/* Badge tip */}
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium shrink-0
                      ${d.tip === 'piesa'
                        ? 'bg-primary-100 text-primary-dark'
                        : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {d.tip === 'piesa' ? '🔧 Piesă' : '👷 Manoperă'}
                    </span>

                    {/* Descriere */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-secondary">{d.descriere}</p>
                      <p className="text-xs text-muted mt-0.5">
                        {d.cantitate} × {formatPreț(d.pret_unitar)}
                      </p>
                    </div>

                    {/* Total linie */}
                    <p className="text-lg font-bold text-secondary shrink-0">
                      {formatPreț(d.cantitate * d.pret_unitar)}
                    </p>

                    {/* Acțiuni */}
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => deschideFormularEditare(d)}
                        className="p-2 rounded-xl bg-primary/5 text-primary hover:bg-primary/10 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                        </svg>
                      </button>
                      <button
                        onClick={() => stergeDeviz(d.id)}
                        className="p-2 rounded-xl bg-danger/5 text-danger hover:bg-danger/10 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totaluri */}
              <div className="border-t-2 border-gray-200 p-5 bg-gray-50/50">
                <div className="max-w-xs ml-auto space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">Piese:</span>
                    <span className="font-medium">{formatPreț(totaluri.piese)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">Manoperă:</span>
                    <span className="font-medium">{formatPreț(totaluri.manopera)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
                    <span className="text-secondary">TOTAL:</span>
                    <span className="text-primary">{formatPreț(totaluri.total)}</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Modal formular deviz */}
      {formDeschis && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-2xl p-6 w-full max-w-md shadow-2xl animate-slide-up">
            <h2 className="text-xl font-bold text-secondary mb-5">
              {devizEditat ? 'Editează Linie' : 'Linie Nouă'}
            </h2>

            <form onSubmit={salveazaDeviz} className="space-y-4">
              {/* Tip */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Tip *</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, tip: 'piesa' })}
                    className={`py-3 px-4 rounded-xl border-2 font-medium text-sm transition-all
                      ${form.tip === 'piesa'
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-gray-200 text-muted hover:border-gray-300'
                      }`}
                  >
                    🔧 Piesă
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, tip: 'manopera' })}
                    className={`py-3 px-4 rounded-xl border-2 font-medium text-sm transition-all
                      ${form.tip === 'manopera'
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-gray-200 text-muted hover:border-gray-300'
                      }`}
                  >
                    👷 Manoperă
                  </button>
                </div>
              </div>

              {/* Descriere */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Descriere *</label>
                <input
                  type="text"
                  value={form.descriere}
                  onChange={(e) => setForm({ ...form, descriere: e.target.value })}
                  placeholder={form.tip === 'piesa' ? 'ex: Filtru ulei' : 'ex: Schimb ulei'}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
              </div>

              {/* Cantitate și Preț */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Cantitate *</label>
                  <input
                    type="number"
                    value={form.cantitate}
                    onChange={(e) => setForm({ ...form, cantitate: e.target.value })}
                    min="0.01"
                    step="0.01"
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Preț unitar (RON) *</label>
                  <input
                    type="number"
                    value={form.pret_unitar}
                    onChange={(e) => setForm({ ...form, pret_unitar: e.target.value })}
                    min="0.01"
                    step="0.01"
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  />
                </div>
              </div>

              {/* Preview total linie */}
              {form.cantitate && form.pret_unitar && (
                <div className="bg-primary-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-muted">Total linie</p>
                  <p className="text-xl font-bold text-primary">
                    {formatPreț(parseFloat(form.cantitate) * parseFloat(form.pret_unitar))}
                  </p>
                </div>
              )}

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
                  {devizEditat ? 'Salvează' : 'Adaugă'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
