import BandejaEntradaPageClient from '@/components/BandejaEntradaPageClient';
import { Suspense } from 'react';


export default function Page() {
  return (
    <Suspense fallback={<div>Cargando página...</div>}>
      <BandejaEntradaPageClient />
    </Suspense>
  );
}