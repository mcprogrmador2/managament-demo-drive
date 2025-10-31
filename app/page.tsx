'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, getSession, getRutaPorRol } from '@/lib/auth';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Si está autenticado, redirigir a su panel
    if (isAuthenticated()) {
      const session = getSession();
      if (session?.rol) {
        const ruta = getRutaPorRol(session.rol as string);
        router.push(ruta);
        return;
      }
    }
    
    // Si no está autenticado, redirigir a login
    router.push('/auth');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary to-accent">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground text-lg">Cargando sistema...</p>
      </div>
    </div>
  );
}
