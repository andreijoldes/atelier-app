// Pagina Programări — calendar săptămânal + adaugă/editează programare + status
// Include: vizualizare pe zile, editare, ștergere și schimbare status

'use client';

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { ProgramariSkeleton } from '@/components/Skeleton';

// Helper: obține lunea săptămânii curente
function getLuneaSaptamanii(data) {
  const d = new Date(data);
  const ziua = d.getDay();
  const diff = d.getDate() - ziua + (ziua === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

// Numele zilelor în română
const ZILE = ['Luni', 'Marți', 'Miercuri', 'Joi', 'Vineri', 'Sâmbătă', 'Duminică'];

// Configurare status-uri
const STATUS_CONFIG = {
  asteptare: { label: 'Așteptare', cls: 'bg-gray-100 text-gray-700 border-gray-200', dot: 'bg-gray-400' },
  in_lucru: { label: 'În lucru', cls: 'bg-amber-50 text-amber-800 border-amber-200', dot: 'bg-amber-500' },
  finalizat: { label: 'Finalizat', cls: 'bg-emerald-50 text-emerald-800 border-emerald-200', dot: 'bg-emerald-500' },
};

export default function ProgramariPage() {
  const [programari, setProgramari] = useState([]);
  const [clienti, setClienti] = useState([]);
  const [masini, setMasini] = useState([]);
  const [masiniClient, setMasiniClient] = useState([]);
  const [incarcare, setIncarcare] = useState(true);
  const [formDeschis, setFormDeschis] = useState(false);
  const [programareEditata, setProgramareEditata] = useState(null);
  const [saptamanaOffset, setSaptamanaOffset] = useState(0);

  // Stare formular (partajat între adăugare și editare)
  const [form, setForm] = useState({
    client_id: '',
    masina_id: '',
    data_programare: '',
    ora: '09:00',
    descriere: '',
    status: 'asteptare',
  });

  // Calculează zilele săptămânii afișate
  const zileSaptamana = useMemo(() => {
    const azi = new Date();
    const lunea = getLuneaSaptamanii(azi);
    lunea.setDate(lunea.getDate() + saptamanaOffset * 7);

    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(lunea);
      d.setDate(lunea.getDate() + i);
      return d;
    });
  }, [saptamanaOffset]);

  // Încarcă datele
  useEffect(() => {
    incarcaDate();
  }, []);

  const incarcaDate = async () => {
    try {
      const { data: prog } = await supabase
        .from('programari')
        .select('*, clienti(nume), masini(marca, model, numar_inmatriculare)')
        .order('data_programare', { ascending: true });

      const { data: cl } = await supabase.from('clienti').select('id, nume').order('nume');
      const { data: ms } = await supabase.from('masini').select('id, client_id, marca, model').order('marca');

      setProgramari(prog || []);
      setClienti(cl || []);
      setMasini(ms || []);
    } catch (err) {
      console.error('Eroare:', err);
    } finally {
      setIncarcare(false);
    }
  };

  // Când se schimbă clientul, actualizează mașinile disponibile
  const handleClientChange = (clientId) => {
    setForm({ ...form, client_id: clientId, masina_id: '' });
    setMasiniClient(masini.filter((m) => m.client_id === clientId));
  };

  // Grupare programări pe zile
  const programariPeZile = useMemo(() => {
    const map = {};
    zileSaptamana.forEach((zi) => {
      const key = zi.toISOString().split('T')[0];
      map[key] = programari.filter((p) => {
        const dataP = new Date(p.data_programare).toISOString().split('T')[0];
        return dataP === key;
      });
    });
    return map;
  }, [programari, zileSaptamana]);

  // Deschide formular NOU
  const deschideFormularNou = (data) => {
    const dataFormatata = data ? data.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
    setForm({
      client_id: '',
      masina_id: '',
      data_programare: dataFormatata,
      ora: '09:00',
      descriere: '',
      status: 'asteptare',
    });
    setMasiniClient([]);
    setProgramareEditata(null);
    setFormDeschis(true);
  };

  // Deschide formular EDITARE — pre-completează cu datele programării
  const deschideFormularEditare = (prog) => {
    const dataObj = new Date(prog.data_programare);
    const dataStr = dataObj.toISOString().split('T')[0];
    const oraStr = dataObj.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit', hour12: false });

    setForm({
      client_id: prog.client_id,
      masina_id: prog.masina_id,
      data_programare: dataStr,
      ora: oraStr,
      descriere: prog.descriere || '',
      status: prog.status || 'asteptare',
    });

    // Setează mașinile clientului
    setMasiniClient(masini.filter((m) => m.client_id === prog.client_id));
    setProgramareEditata(prog);
    setFormDeschis(true);
  };

  // Salvează programarea (adaugă sau actualizează)
  const salveazaProgramare = async (e) => {
    e.preventDefault();
    try {
      const dataCompleta = new Date(`${form.data_programare}T${form.ora}:00`).toISOString();

      const dateFormular = {
        client_id: form.client_id,
        masina_id: form.masina_id,
        data_programare: dataCompleta,
        descriere: form.descriere,
        status: form.status,
      };

      if (programareEditata) {
        // ACTUALIZARE programare existentă
        const { error } = await supabase
          .from('programari')
          .update(dateFormular)
          .eq('id', programareEditata.id);
        if (error) throw error;
      } else {
        // ADĂUGARE programare nouă
        const { error } = await supabase.from('programari').insert([dateFormular]);
        if (error) throw error;
      }

      setFormDeschis(false);
      setProgramareEditata(null);
      incarcaDate();
    } catch (err) {
      console.error('Eroare la salvare:', err);
    }
  };

  // Șterge programarea
  const stergeProgramare = async () => {
    if (!programareEditata) return;
    if (!confirm('Ești sigur că vrei să ștergi această programare?')) return;
    try {
      const { error } = await supabase.from('programari').delete().eq('id', programareEditata.id);
      if (error) throw error;
      setFormDeschis(false);
      setProgramareEditata(null);
      incarcaDate();
    } catch (err) {
      console.error('Eroare la ștergere:', err);
    }
  };

  // Schimbă statusul programării (rapid din calendar)
  const schimbaStatus = async (id, statusNou) => {
    try {
      const { error } = await supabase
        .from('programari')
        .update({ status: statusNou })
        .eq('id', id);
      if (error) throw error;
      incarcaDate();
    } catch (err) {
      console.error('Eroare la actualizare status:', err);
    }
  };

  // Verifică dacă o zi este azi
  const esteAzi = (data) => {
    const azi = new Date();
    return data.toDateString() === azi.toDateString();
  };

  if (incarcare) {
    return <ProgramariSkeleton />;
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 animate-fade-in">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-secondary">Programări</h1>
          <p className="text-muted mt-1 text-base">Calendar săptămânal</p>
        </div>
        <button
          onClick={() => deschideFormularNou(null)}
          className="inline-flex items-center gap-2 px-5 py-3 bg-primary hover:bg-primary-dark text-white font-semibold text-base
            rounded-xl transition-all shadow-lg shadow-primary/20 hover:shadow-primary/40 active:scale-[0.98]"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Programare Nouă
        </button>
      </div>

      {/* Navigație săptămână */}
      <div className="flex items-center justify-between mb-6 bg-surface rounded-2xl p-4 shadow-sm animate-fade-in">
        <button
          onClick={() => setSaptamanaOffset(saptamanaOffset - 1)}
          className="p-2.5 rounded-xl hover:bg-gray-100 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>

        <div className="text-center">
          <p className="font-bold text-secondary text-base">
            {zileSaptamana[0].toLocaleDateString('ro-RO', { day: 'numeric', month: 'long' })}
            {' — '}
            {zileSaptamana[6].toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
          {saptamanaOffset !== 0 && (
            <button
              onClick={() => setSaptamanaOffset(0)}
              className="text-sm text-primary font-semibold hover:underline mt-1"
            >
              Revino la săptămâna curentă
            </button>
          )}
        </div>

        <button
          onClick={() => setSaptamanaOffset(saptamanaOffset + 1)}
          className="p-2.5 rounded-xl hover:bg-gray-100 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>

      {/* Calendar săptămânal */}
      <div className="grid md:grid-cols-7 gap-3">
        {zileSaptamana.map((zi, index) => {
          const key = zi.toISOString().split('T')[0];
          const progZi = programariPeZile[key] || [];
          const azi = esteAzi(zi);

          return (
            <div
              key={key}
              className={`bg-surface rounded-2xl p-4 shadow-sm min-h-[140px] animate-slide-up transition-all
                ${azi ? 'ring-2 ring-primary/40 shadow-md' : ''}`}
              style={{ animationDelay: `${index * 60}ms` }}
            >
              {/* Header zi */}
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className={`text-xs font-semibold ${azi ? 'text-primary' : 'text-muted'}`}>
                    {ZILE[index]}
                  </p>
                  <p className={`text-xl font-bold ${azi ? 'text-primary' : 'text-secondary'}`}>
                    {zi.getDate()}
                  </p>
                </div>
                <button
                  onClick={() => deschideFormularNou(zi)}
                  className="w-8 h-8 rounded-lg bg-primary/5 text-primary hover:bg-primary/10 flex items-center justify-center transition-colors"
                  title="Adaugă programare"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                </button>
              </div>

              {/* Lista programărilor din zi */}
              <div className="space-y-2">
                {progZi.map((p) => {
                  const statusCfg = STATUS_CONFIG[p.status] || STATUS_CONFIG.asteptare;
                  return (
                    <button
                      key={p.id}
                      onClick={() => deschideFormularEditare(p)}
                      className={`w-full text-left p-2.5 rounded-xl border text-xs ${statusCfg.cls} transition-all hover:shadow-sm cursor-pointer`}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className={`w-2 h-2 rounded-full ${statusCfg.dot}`}></span>
                        <span className="font-bold truncate">{p.clienti?.nume || '—'}</span>
                      </div>
                      <p className="text-[11px] opacity-80 truncate">
                        {p.masini ? `${p.masini.marca} ${p.masini.model}` : ''}
                      </p>
                      <p className="text-[11px] opacity-80 mt-0.5 font-semibold">
                        {new Date(p.data_programare).toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </button>
                  );
                })}

                {progZi.length === 0 && (
                  <p className="text-xs text-muted/50 text-center py-3">Liber</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal formular programare (Nou / Editare) */}
      {formDeschis && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-2xl p-6 w-full max-w-md shadow-2xl animate-slide-up max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-secondary">
                {programareEditata ? 'Editează Programare' : 'Programare Nouă'}
              </h2>
              {/* Buton ștergere dacă edităm */}
              {programareEditata && (
                <button
                  onClick={stergeProgramare}
                  className="p-2 rounded-xl bg-danger/5 text-danger hover:bg-danger/10 transition-colors"
                  title="Șterge programarea"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                </button>
              )}
            </div>

            <form onSubmit={salveazaProgramare} className="space-y-4">
              {/* Client */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Client *</label>
                <select
                  value={form.client_id}
                  onChange={(e) => handleClientChange(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-base focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                >
                  <option value="">Selectează client...</option>
                  {clienti.map((c) => (
                    <option key={c.id} value={c.id}>{c.nume}</option>
                  ))}
                </select>
              </div>

              {/* Mașină */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Mașină *</label>
                <select
                  value={form.masina_id}
                  onChange={(e) => setForm({ ...form, masina_id: e.target.value })}
                  required
                  disabled={!form.client_id}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-base focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all disabled:opacity-50"
                >
                  <option value="">Selectează mașină...</option>
                  {masiniClient.map((m) => (
                    <option key={m.id} value={m.id}>{m.marca} {m.model}</option>
                  ))}
                </select>
              </div>

              {/* Data și Ora */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Data *</label>
                  <input
                    type="date"
                    value={form.data_programare}
                    onChange={(e) => setForm({ ...form, data_programare: e.target.value })}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-base focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Ora *</label>
                  <input
                    type="time"
                    value={form.ora}
                    onChange={(e) => setForm({ ...form, ora: e.target.value })}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-base focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  />
                </div>
              </div>

              {/* Status (vizibil la editare) */}
              {programareEditata && (
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Status</label>
                  <div className="grid grid-cols-3 gap-2">
                    {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setForm({ ...form, status: key })}
                        className={`py-2.5 px-3 rounded-xl border-2 font-semibold text-sm transition-all
                          ${form.status === key
                            ? 'border-primary bg-primary/5 text-primary'
                            : 'border-gray-200 text-muted hover:border-gray-300'
                          }`}
                      >
                        {cfg.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Descriere */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Descriere lucrare</label>
                <textarea
                  value={form.descriere}
                  onChange={(e) => setForm({ ...form, descriere: e.target.value })}
                  rows={3}
                  placeholder="Descrie lucrarea necesară..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-base focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none"
                />
              </div>

              {/* Butoane */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setFormDeschis(false); setProgramareEditata(null); }}
                  className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-foreground font-semibold rounded-xl transition-colors text-base"
                >
                  Anulează
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl transition-all
                    shadow-lg shadow-primary/20 active:scale-[0.98] text-base"
                >
                  {programareEditata ? 'Salvează' : 'Adaugă'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
