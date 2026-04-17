// Pagina Mașini — redirect la Clienți
// Mașinile se accesează acum prin navigarea ierarhică: Clienți → Client → Mașini

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MasiniRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/clienti');
  }, [router]);

  return (
    <div className="p-8 text-center">
      <p className="text-muted text-lg">Se redirecționează la Clienți...</p>
    </div>
  );
}
