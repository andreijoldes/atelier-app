// Pagina Dashboard — ecranul principal (ruta /dashboard)
// Afișează: programări azi, total clienți, lucrări în curs — high contrast

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';
import { DashboardSkeleton } from '@/components/Skeleton';

export default function DashboardPage() {
  const router = useRouter();
  const { signOut } = useAuth();

  // State pentru statistici
  const [stats, setStats] = useState({
    programariAzi: 0,
    totalClienti: 0,
    lucrariInCurs: 0,
    lucrariFinalizate: 0,
  });
  const [programariRecente, setProgramariRecente] = useState([]);
  const [incarcare, setIncarcare] = useState(true);

  // Încarcă datele la montarea componentei
  useEffect(() => {
    incarcaDate();
  }, []);

  const incarcaDate = async () => {
    try {
      // Data de azi (început și sfârșit)
      const azi = new Date();
      const inceputZi = new Date(azi.getFullYear(), azi.getMonth(), azi.getDate()).toISOString();
      const sfarsitZi = new Date(azi.getFullYear(), azi.getMonth(), azi.getDate() + 1).toISOString();

      // Programări azi
      const { count: programariAzi } = await supabase
        .from('programari')
        .select('*', { count: 'exact', head: true })
        .gte('data_programare', inceputZi)
        .lt('data_programare', sfarsitZi);

      // Total clienți
      const { count: totalClienti } = await supabase
        .from('clienti')
        .select('*', { count: 'exact', head: true });

      // Lucrări în curs
      const { count: lucrariInCurs } = await supabase
        .from('programari')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'in_lucru');

      // Lucrări finalizate
      const { count: lucrariFinalizate } = await supabase
        .from('programari')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'finalizat');

      setStats({
        programariAzi: programariAzi || 0,
        totalClienti: totalClienti || 0,
        lucrariInCurs: lucrariInCurs || 0,
        lucrariFinalizate: lucrariFinalizate || 0,
      });

      // Programări recente (ultimele 5)
      const { data: recente } = await supabase
        .from('programari')
        .select('*, clienti(nume), masini(marca, model)')
        .order('data_programare', { ascending: false })
        .limit(5);

      setProgramariRecente(recente || []);
    } catch (err) {
      console.error('Eroare la încărcarea datelor:', err);
    } finally {
      setIncarcare(false);
    }
  };

  // Configurare carduri statistici
  const carduri = [
    {
      titlu: 'Programări Azi',
      valoare: stats.programariAzi,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
        </svg>
      ),
      culoare: 'bg-primary/10 text-primary',
    },
    {
      titlu: 'Total Clienți',
      valoare: stats.totalClienti,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
        </svg>
      ),
      culoare: 'bg-success/10 text-success',
    },
    {
      titlu: 'În Lucru',
      valoare: stats.lucrariInCurs,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085" />
        </svg>
      ),
      culoare: 'bg-warning/10 text-warning',
    },
    {
      titlu: 'Finalizate',
      valoare: stats.lucrariFinalizate,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      culoare: 'bg-primary-100 text-primary-dark',
    },
  ];

  // Funcție helper pentru formatarea statusului
  const getStatusBadge = (status) => {
    const config = {
      asteptare: { label: 'Așteptare', cls: 'bg-gray-100 text-gray-700' },
      in_lucru: { label: 'În lucru', cls: 'bg-warning/15 text-warning' },
      finalizat: { label: 'Finalizat', cls: 'bg-success/15 text-success' },
    };
    const s = config[status] || config.asteptare;
    return <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${s.cls}`}>{s.label}</span>;
  };

  if (incarcare) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header pagină */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-2xl md:text-3xl font-bold text-secondary">Dashboard</h1>
        <p className="text-muted mt-1 text-base">Bine ai venit! Iată o privire de ansamblu asupra atelierului.</p>
      </div>

      {/* Carduri statistici */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {carduri.map((card, index) => (
          <div
            key={card.titlu}
            className="bg-surface rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow animate-slide-up"
            style={{ animationDelay: `${index * 80}ms` }}
          >
            <div className={`w-12 h-12 ${card.culoare} rounded-xl flex items-center justify-center mb-3`}>
              {card.icon}
            </div>
            <p className="text-3xl font-bold text-secondary">{card.valoare}</p>
            <p className="text-sm text-muted mt-0.5 font-medium">{card.titlu}</p>
          </div>
        ))}
      </div>

      {/* Tabel programări recente */}
      <div className="bg-surface rounded-2xl shadow-sm p-6 animate-slide-up" style={{ animationDelay: '300ms' }}>
        <h2 className="text-lg font-bold text-secondary mb-4">Programări Recente</h2>

        {programariRecente.length === 0 ? (
          <p className="text-muted text-base py-8 text-center">Nu există programări încă.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-base">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-2 text-muted font-semibold text-sm">Client</th>
                  <th className="text-left py-3 px-2 text-muted font-semibold text-sm hidden sm:table-cell">Mașină</th>
                  <th className="text-left py-3 px-2 text-muted font-semibold text-sm">Data</th>
                  <th className="text-left py-3 px-2 text-muted font-semibold text-sm">Status</th>
                </tr>
              </thead>
              <tbody>
                {programariRecente.map((p) => (
                  <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-2 font-semibold text-secondary">{p.clienti?.nume || '—'}</td>
                    <td className="py-3 px-2 hidden sm:table-cell text-muted">
                      {p.masini ? `${p.masini.marca} ${p.masini.model}` : '—'}
                    </td>
                    <td className="py-3 px-2 text-muted">
                      {new Date(p.data_programare).toLocaleDateString('ro-RO', { day: '2-digit', month: 'short' })}
                    </td>
                    <td className="py-3 px-2">{getStatusBadge(p.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Buton Deconectare — vizibil pe mobile */}
      <div className="mt-8 mb-28 md:hidden animate-slide-up" style={{ animationDelay: '400ms' }}>
        <button
          onClick={async () => {
            await signOut();
            router.push('/');
          }}
          className="flex items-center justify-center gap-3 w-full py-4 px-6 rounded-2xl
            bg-red-50 text-red-600 font-bold text-base
            hover:bg-red-100 active:scale-[0.98] transition-all duration-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
          </svg>
          Deconectare
        </button>
      </div>
    </div>
  );
}
