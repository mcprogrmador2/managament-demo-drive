'use client';

import * as React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Building2, LayoutDashboard, Users, Briefcase, FileText, Settings, LogOut, Activity, FolderOpen } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { allsavfeUrl } from '@/lib/variables';

interface AdministradorSidebarProps {
  adminNombre: string;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function AdministradorSidebar({ adminNombre, isCollapsed, onToggleCollapse }: AdministradorSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const data = {
    navMain: [
      {
        title: "Dashboard",
        onClick: () => router.push("/administradores"),
        icon: LayoutDashboard,
        path: "/administradores"
      },
    ],
    navGestion: [
      {
        title: "Empresas",
        onClick: () => router.push("/administradores/empresas"),
        icon: Building2,
        path: "/administradores/empresas"
      },
      {
        title: "Áreas",
        onClick: () => router.push("/administradores/areas"),
        icon: FolderOpen,
        path: "/administradores/areas"
      },
      {
        title: "Proyectos",
        onClick: () => router.push("/administradores/proyectos"),
        icon: Briefcase,
        path: "/administradores/proyectos"
      },
      {
        title: "Trabajadores",
        onClick: () => router.push("/administradores/trabajadores"),
        icon: Users,
        path: "/administradores/usuarios"
      },
      {
        title: "Puestos de trabajo",
        onClick: () => router.push("/administradores/puestos-de-trabajo"),
        icon: FileText,
        path: "/administradores/puestos-de-trabajo"
      },
    ]
  };

  const handleLogout = () => {
    localStorage.removeItem('proyectos_session');
    router.push('/auth');
  };

  return (
    <aside className={`${isCollapsed ? 'w-16' : 'w-72'} h-screen bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300`}>
      <div className={`${isCollapsed ? 'p-2' : 'p-4'} border-b border-sidebar-border`}>
        <div 
          onClick={() => router.push("/administradores")}
          className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} cursor-pointer hover:bg-muted/50 transition-colors duration-200 rounded-lg ${isCollapsed ? 'p-2' : 'p-3'}`}
        >
          <Building2 className={`${isCollapsed ? 'w-8 h-8' : 'w-12 h-12'} text-primary`} />
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-lg text-foreground">Gestión</span>
              <span className="text-xs text-muted-foreground">Proyectos Empresariales</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {/* Dashboard */}
        <div className={`${isCollapsed ? 'p-2' : 'p-4'}`}>
          {!isCollapsed && (
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Principal
            </h3>
          )}
          <div className="space-y-1">
            {data.navMain.map((item) => (
              <button
                key={item.title}
                onClick={item.onClick}
                title={isCollapsed ? item.title : undefined}
                className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} ${isCollapsed ? 'px-2 py-3' : 'px-3 py-2.5'} rounded-lg text-sm transition-all duration-200 group w-full text-left ${
                  pathname === "/administradores" 
                    ? "bg-primary text-primary-foreground" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <item.icon className="w-5 h-5" />
                {!isCollapsed && <span className="font-medium">{item.title}</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Gestión */}
        <div className={`${isCollapsed ? 'p-2' : 'p-4'}`}>
          {!isCollapsed && (
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Gestión
            </h3>
          )}
          <div className="space-y-1">
            {data.navGestion.map((item) => {
              const isActive = pathname === item.path;
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
            <Users className="size-3" />
            <span className="truncate">{adminNombre}</span>
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
