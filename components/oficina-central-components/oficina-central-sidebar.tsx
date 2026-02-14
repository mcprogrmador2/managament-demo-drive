'use client';

import * as React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { allsavfeUrl } from '@/lib/variables';
import { 
  LayoutDashboard, 
  LogOut, 
  Activity, 
  Shield,
  Upload,
  User,
  FileSearch
} from 'lucide-react';

interface OficinaCentralSidebarProps {
  usuarioNombre: string;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function OficinaCentralSidebar({ usuarioNombre, isCollapsed, onToggleCollapse }: OficinaCentralSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const data = {
    navMain: [
      {
        title: "Dashboard",
        onClick: () => router.push("/oficina-central"),
        icon: LayoutDashboard,
        path: "/oficina-central"
      },
      {
        title: "Mis Documentos",
        onClick: () => router.push("/oficina-central/mis-documentos"),
        icon: FileSearch,
        path: "/oficina-central/mis-documentos"
      },
      {
        title: "Subir Carpetas",
        onClick: () => router.push("/oficina-central/subir-carpetas"),
        icon: Upload,
        path: "/oficina-central/subir-carpetas"
      },
    ],
    navConfig: [
      {
        title: "Mi Perfil",
        onClick: () => router.push("/oficina-central/mi-perfil"),
        icon: User,
        path: "/oficina-central/mi-perfil"
      },
    ],
  };

  const handleLogout = () => {
    localStorage.removeItem('proyectos_session');
    router.push('/auth');
  };

  return (
    <aside className={`${isCollapsed ? 'w-16' : 'w-72'} h-screen bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300`}>
      <div className={`${isCollapsed ? 'p-2' : 'p-4'} border-b border-sidebar-border`}>
        <div 
          onClick={() => router.push("/oficina-central")}
          className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} cursor-pointer hover:bg-muted/50 transition-colors duration-200 rounded-lg ${isCollapsed ? 'p-2' : 'p-3'}`}
        >
         
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-lg text-foreground">Oficina Central</span>
              <span className="text-xs text-muted-foreground">Revisión y Control</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {/* Navegación Principal */}
        <div className={`${isCollapsed ? 'p-2' : 'p-4'}`}>
          {!isCollapsed && (
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Principal
            </h3>
          )}
          <div className="space-y-1">
            {data.navMain.map((item) => {
              const isActive = pathname === item.path || (item.path !== "/oficina-central" && pathname.startsWith(item.path));
              return (
                <button
                  key={item.title}
                  onClick={item.onClick}
                  title={isCollapsed ? item.title : undefined}
                  className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} ${isCollapsed ? 'px-2 py-3' : 'px-3 py-2.5'} rounded-lg text-sm transition-all duration-200 group w-full text-left ${
                    isActive
                      ? "bg-primary text-primary-foreground" 
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {!isCollapsed && <span className="font-medium">{item.title}</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Configuración */}
        <div className={`${isCollapsed ? 'p-2' : 'p-4'}`}>
          {!isCollapsed && (
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Sistema
            </h3>
          )}
          <div className="space-y-1">
            {data.navConfig.map((item) => {
              const isActive = pathname === item.path || pathname.startsWith(item.path);
              return (
                <button
                  key={item.title}
                  onClick={item.onClick}
                  title={isCollapsed ? item.title : undefined}
                  className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} ${isCollapsed ? 'px-2 py-3' : 'px-3 py-2.5'} rounded-lg text-sm transition-all duration-200 group w-full text-left ${
                    isActive
                      ? "bg-primary text-primary-foreground" 
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {!isCollapsed && <span className="font-medium">{item.title}</span>}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      
      <div className={`border-t border-sidebar-border ${isCollapsed ? 'p-2' : 'p-4'} space-y-3`}>
        {/* Estado del sistema */}
        {!isCollapsed && (
          <div className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground">
            <Activity className="size-3" />
            <span>Sistema Online</span>
            <div className="ml-auto size-2 rounded-full bg-green-500 animate-pulse" />
          </div>
        )}
        
        {/* Usuario actual */}
        {!isCollapsed && (
          <div className="flex items-center gap-2 px-3 py-2 text-xs bg-primary/10 text-primary rounded-lg">
            <User className="size-3" />
            <span className="truncate">{usuarioNombre}</span>
          </div>
        )}
        
        {/* Botón de logout */}
        <button
          onClick={handleLogout}
          title={isCollapsed ? "Cerrar Sesión" : undefined}
          className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} ${isCollapsed ? 'px-2 py-3' : 'px-3 py-2.5'} rounded-lg text-sm transition-all duration-200 group w-full text-left text-destructive hover:text-destructive hover:bg-destructive/10`}
        >
          <LogOut className="w-5 h-5" />
          {!isCollapsed && <span className="font-medium">Cerrar Sesión</span>}
        </button>
        
        {/* Footer */}
        {!isCollapsed && (
          <div className="text-center pt-2">

          </div>
        )}
      </div>
    </aside>
  );
}

