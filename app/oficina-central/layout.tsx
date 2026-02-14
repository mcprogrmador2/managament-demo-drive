'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { OficinaCentralSidebar } from '@/components/oficina-central-components/oficina-central-sidebar';
import { ModeToggle } from '@/components/mode-toggle';
import { isAuthenticated, getSession } from '@/lib/auth';
import { usuariosProyectosStorage } from '@/lib/projectStorage';
import { Menu } from 'lucide-react';

export default function OficinaCentralLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [usuarioNombre, setUsuarioNombre] = useState('');
  const [loading, setLoading] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      if (!isAuthenticated()) {
        router.push('/auth');
        return;
      }

      const session = getSession();
      if (session?.rol !== 'oficina_central') {
        router.push('/auth');
        return;
      }

      // Obtener nombre del usuario de Oficina Central
      const usuario = usuariosProyectosStorage.getById(session.userId);
      if (usuario) {
        setUsuarioNombre(`${usuario.nombre} ${usuario.apellidos}`);
      }

      setLoading(false);
    };

    initAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full">
      <OficinaCentralSidebar usuarioNombre={usuarioNombre} isCollapsed={isCollapsed} onToggleCollapse={() => setIsCollapsed(!isCollapsed)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4 bg-background">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg hover:bg-muted/50 transition-color  s duration-200"
            aria-label={isCollapsed ? "Expandir sidebar" : "Contraer sidebar"}
            title={isCollapsed ? "Expandir sidebar" : "Contraer sidebar"}
          >
            <Menu className="w-4 h-4 text-muted-foreground" />
          </button>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">Gestión de Proyectos</span>
            <span>/</span>
            <span>Oficina Central</span>
          </div>
          <div className="ml-auto">
            <ModeToggle />
          </div>
        </header>
        <main className="flex-1 overflow-auto">
          <div className="p-6 pb-12">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
