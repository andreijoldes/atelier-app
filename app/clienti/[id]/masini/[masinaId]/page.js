// Pagina Lucrări Mașină — afișează toate programările/intervențiile unei mașini
// Navigare: Clienți → [Client] → Mașini → [Mașină] → Lucrări

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ListSkeleton } from '@/components/Skeleton';

// Configurare vizuală status-uri
const STATUS_CONFIG = {
  asteptare: { label: 'Așteptare', cls: 'bg-gray-100 text-gray-700', dot: 'bg-gray-400' },
  in_lucru: { label: 'În lucru', cls: 'bg-amber-50 text-amber-800', dot: 'bg-amber-500' },
  finalizat: { label: 'Finalizat', cls: 'bg-emerald-50 text-emerald-800', dot: 'bg-emerald-500' },
};

export default function MasinaLucrariPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.id;
  const masinaId = params.masinaId;

  const [client, setClient] = useState(null);
  const [masina, setMasina] = useState(null);
  const [programari, setProgramari] = useState([]);
  const [incarcare, setIncarcare] = useState(true);

  // Încarcă datele
  useEffect(() => {
    if (clientId && masinaId) incarcaDate();
  }, [clientId, masinaId]);

  const incarcaDate = async () => {
    try {
      // Info client
      const { data: clientData } = await supabase
        .from('clienti')
        .select('id, nume')
        .eq('id', clientId)
        .single();

      // Info mașină
      const { data: masinaData } = await supabase
        .from('masini')
        .select('*')
        .eq('id', masinaId)
        .single();

      // Programări/lucrări pe mașina respectivă
      const { data: progData } = await supabase
        .from('programari')
        .select('*, devize(id, tip, descriere, cantitate, pret_unitar)')
        .eq('masina_id', masinaId)
        .order('data_programare', { ascending: false });

      setClient(clientData);
      setMasina(masinaData);
      setProgramari(progData || []);
    } catch (err) {
      console.error('Eroare la încărcare:', err);
    } finally {
      setIncarcare(false);
    }
  };

  // Schimbă statusul unei programări
  const schimbaStatus = async (progId, statusNou) => {
    try {
      const { error } = await supabase
        .from('programari')
        .update({ status: statusNou })
        .eq('id', progId);
      if (error) throw error;
      incarcaDate();
    } catch (err) {
      console.error('Eroare la schimbare status:', err);
    }
  };

  if (incarcare) return <ListSkeleton />;

  if (!masina) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted text-lg">Mașina nu a fost găsită.</p>
        <button onClick={() => router.push('/clienti')} className="mt-4 text-primary font-semibold hover:underline">
          ← Înapoi la clienți
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted mb-6 animate-fade-in flex-wrap">
        <button onClick={() => router.push('/clienti')} className="hover:text-primary transition-colors font-medium">
          Clienți
        </button>
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
        <button onClick={() => router.push(`/clienti/${clientId}`)} className="hover:text-primary transition-colors font-medium">
          {client?.nume || '—'}
        </button>
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
        <span className="text-foreground font-semibold">{masina.marca} {masina.model}</span>
      </div>

      {/* Card info mașină */}
      <div className="bg-surface rounded-2xl p-6 shadow-sm mb-6 animate-fade-in">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-xl flex items-center justify-center shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.072-.504.958-1.113l-1.71-9.13a1.875 1.875 0 00-1.846-1.507H5.498a1.875 1.875 0 00-1.846 1.507l-1.71 9.13C1.826 17.746 2.277 18.25 2.898 18.25H3.75m16.5 0h.375a.375.375 0 00.375-.375v-3.249a.375.375 0 00-.375-.375H20.25M3.75 14.25h16.5" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-secondary">
              {masina.marca} {masina.model}
              {masina.an && <span className="text-muted font-normal ml-2 text-lg">({masina.an})</span>}
            </h1>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-muted text-base">
              {masina.numar_inmatriculare && (
                <span className="font-mono bg-gray-100 px-3 py-1 rounded-lg text-sm font-bold">
                  {masina.numar_inmatriculare}
                </span>
              )}
              {masina.vin && <span className="text-sm">VIN: {masina.vin}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Titlu secțiune lucrări */}
      <h2 className="text-xl font-bold text-secondary mb-4 animate-fade-in">
        Lucrări ({programari.length})
      </h2>

      {/* Lista lucrări / programări */}
      {programari.length === 0 ? (
        <div className="bg-surface rounded-2xl p-10 text-center shadow-sm">
          <p className="text-muted text-lg">Nicio lucrare înregistrată pentru această mașină.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {programari.map((prog, index) => {
            const statusCfg = STATUS_CONFIG[prog.status] || STATUS_CONFIG.asteptare;
            const totalDeviz = (prog.devize || []).reduce(
              (sum, d) => sum + d.cantitate * d.pret_unitar, 0
            );

            return (
              <div
                key={prog.id}
                className="bg-surface rounded-2xl p-5 shadow-sm hover:shadow-md transition-all animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Header programare */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-bold text-secondary text-lg">
                      {new Date(prog.data_programare).toLocaleDateString('ro-RO', {
                        day: '2-digit', month: 'long', year: 'numeric'
                      })}
                    </p>
                    <p className="text-muted text-sm">
                      Ora: {new Date(prog.data_programare).toLocaleTimeString('ro-RO', {
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  </div>

                  {/* Badge status */}
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold ${statusCfg.cls}`}>
                    <span className={`w-2 h-2 rounded-full ${statusCfg.dot}`}></span>
                    {statusCfg.label}
                  </span>
                </div>

                {/* Descriere lucrare */}
                {prog.descriere && (
                  <p className="text-foreground mb-3">{prog.descriere}</p>
                )}

                {/* Rezumat deviz dacă există */}
                {prog.devize && prog.devize.length > 0 && (
                  <div className="bg-gray-50 rounded-xl p-3 mb-3">
                    <p className="text-sm text-muted">
                      {prog.devize.length} linii deviz • Total: {' '}
                      <span className="font-bold text-secondary">
                        {new Intl.NumberFormat('ro-RO', { style: 'currency', currency: 'RON' }).format(totalDeviz)}
                      </span>
                    </p>
                  </div>
                )}

                {/* Butoane status rapid */}
                <div className="flex gap-2">
                  {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                    <button
                      key={key}
                      onClick={() => schimbaStatus(prog.id, key)}
                      className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all border
                        ${prog.status === key
                          ? 'border-current opacity-100 ' + cfg.cls
                          : 'border-gray-200 text-muted opacity-60 hover:opacity-100'
                        }`}
                    >
                      {cfg.label}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
