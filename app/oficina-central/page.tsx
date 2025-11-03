'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  FolderCheck,
  FileSearch,
  FileText,
  Upload,
  Building2,
  Briefcase,
  User,
  Mail,
  Phone,
  Calendar,
  Shield,
  CheckCircle2,
  XCircle,
  TrendingUp,
  ArrowUpRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  proyectosStorage,
  carpetasStorage,
  archivosStorage,
  empresasStorage,
  usuariosProyectosStorage,
  areasStorage,
  initializeProjectData
} from '@/lib/projectStorage';
import { getSession } from '@/lib/auth';
import { Proyecto, Usuario, Empresa, Carpeta, Archivo, Area } from '@/lib/projectTypes';
import { KPICard } from '@/components/administradores-components/kpi-card';

interface DashboardStats {
  usuarioActual: Usuario | null;
  proyectosCerrados: number;
  totalDocumentos: number;
  totalArchivos: number;
  empresasRevisadas: number;
  ultimosDocumentos: Array<{
    proyecto: Proyecto;
    empresa: Empresa;
    carpeta: Carpeta;
    archivos: Archivo[];
  }>;
}

export default function OficinaCentralDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    usuarioActual: null,
    proyectosCerrados: 0,
    totalDocumentos: 0,
    totalArchivos: 0,
    empresasRevisadas: 0,
    ultimosDocumentos: []
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = () => {
    initializeProjectData();
    const session = getSession();
    
    if (!session) {
      router.push('/auth');
      return;
    }

    const usuario = usuariosProyectosStorage.getById(session.userId);
    
    if (!usuario) {
      router.push('/auth');
      return;
    }

    // Obtener proyectos cerrados
    const proyectos = proyectosStorage.getAll();
    const proyectosCerrados = proyectos.filter(p => p.estado === 'cerrado' || p.estado === 'aprobado');

    // Obtener carpetas marcadas como "final" o "Documento Final"
    const carpetas = carpetasStorage.getAll();
    const carpetasFinales = carpetas.filter(
      c => c.restricciones.tipo === 'final' || c.nombre.toLowerCase().includes('final')
    );

    // Calcular documentos finales (carpetas finales en proyectos cerrados)
    const documentosFinales: Array<{
      proyecto: Proyecto;
      empresa: Empresa;
      carpeta: Carpeta;
      archivos: Archivo[];
    }> = [];

    carpetasFinales.forEach((carpeta) => {
      const proyecto = proyectosCerrados.find(p => p.id === carpeta.proyectoId);
      if (proyecto) {
        const empresa = empresasStorage.getById(proyecto.empresaId);
        const archivos = archivosStorage.getAll().filter(a => a.carpetaId === carpeta.id && a.estado === 'activo');
        
        if (empresa) {
          documentosFinales.push({
            proyecto,
            empresa,
            carpeta,
            archivos
          });
        }
      }
    });

    // Calcular empresas únicas
    const empresasIds = new Set(documentosFinales.map(d => d.empresa.id));
    const empresasRevisadas = empresasIds.size;

    // Total de archivos en documentos finales
    const totalArchivos = documentosFinales.reduce((acc, doc) => acc + doc.archivos.length, 0);

    // Obtener últimos documentos (ordenados por fecha)
    const ultimosDocumentos = documentosFinales
      .sort((a, b) => new Date(b.proyecto.fechaCreacion).getTime() - new Date(a.proyecto.fechaCreacion).getTime())
      .slice(0, 5);

    setStats({
      usuarioActual: usuario,
      proyectosCerrados: proyectosCerrados.length,
      totalDocumentos: documentosFinales.length,
      totalArchivos,
      empresasRevisadas,
      ultimosDocumentos
    });

    setLoading(false);
  };

  const handleVerDocumento = (documento: { proyecto: Proyecto; empresa: Empresa; carpeta: Carpeta }) => {
    router.push(`/administradores/proyectos/${documento.proyecto.id}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const areasUsuario = stats.usuarioActual 
    ? areasStorage.getAll().filter(area => stats.usuarioActual?.areasAsignadas.includes(area.id))
    : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!stats.usuarioActual) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header con Bienvenida */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Bienvenido, {stats.usuarioActual.nombre}
          </h1>
          <p className="text-muted-foreground mt-1">
            Panel de control de Oficina Central
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <Shield className="w-3.5 h-3.5" />
            Oficina Central
          </Badge>
        </div>
      </div>

      {/* Información del Usuario */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-2xl font-bold text-primary-foreground">
                {stats.usuarioActual.nombre.charAt(0)}{stats.usuarioActual.apellidos.charAt(0)}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  {stats.usuarioActual.nombre} {stats.usuarioActual.apellidos}
                </h3>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Mail className="w-3.5 h-3.5" />
                    {stats.usuarioActual.email}
                  </div>
                  {stats.usuarioActual.telefono && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Phone className="w-3.5 h-3.5" />
                      {stats.usuarioActual.telefono}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => router.push('/oficina-central/mi-perfil')}
              className="gap-2"
            >
              <User className="w-4 h-4" />
              Ver Perfil Completo
            </Button>
          </div>

          {areasUsuario.length > 0 && (
            <>
              <Separator className="my-4" />
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-muted-foreground">Áreas asignadas:</span>
                {areasUsuario.map((area) => (
                  <Badge key={area.id} variant="secondary" className="gap-1">
                    <Building2 className="w-3 h-3" />
                    {area.nombre}
                  </Badge>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Proyectos Cerrados"
          value={stats.proyectosCerrados.toLocaleString()}
          icon={FolderCheck}
          borderColor="border-l-primary"
          textColor="text-primary"
        />
        <KPICard
          title="Documentos Finales"
          value={stats.totalDocumentos.toLocaleString()}
          icon={FileText}
          borderColor="border-l-success"
          textColor="text-success"
        />
        <KPICard
          title="Total Archivos"
          value={stats.totalArchivos.toLocaleString()}
          icon={FileSearch}
          borderColor="border-l-info"
          textColor="text-info"
        />
        <KPICard
          title="Empresas Revisadas"
          value={stats.empresasRevisadas.toLocaleString()}
          icon={Building2}
          borderColor="border-l-warning"
          textColor="text-warning"
        />
      </div>

      {/* Acciones Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover:shadow-lg transition-all cursor-pointer group" onClick={() => router.push('/oficina-central/mis-documentos')}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-info/10 rounded-lg group-hover:scale-110 transition-transform">
                <FileSearch className="w-6 h-6 text-info" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-1">Ver Documentos</h3>
                <p className="text-xs text-muted-foreground">
                  Accede a todos los documentos finales
                </p>
              </div>
              <ArrowUpRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all cursor-pointer group" onClick={() => router.push('/oficina-central/subir-carpetas')}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-success/10 rounded-lg group-hover:scale-110 transition-transform">
                <Upload className="w-6 h-6 text-success" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-1">Subir Carpeta</h3>
                <p className="text-xs text-muted-foreground">
                  Sube nuevos documentos finales
                </p>
              </div>
              <ArrowUpRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all cursor-pointer group" onClick={() => router.push('/oficina-central/mi-perfil')}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg group-hover:scale-110 transition-transform">
                <User className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-1">Mi Perfil</h3>
                <p className="text-xs text-muted-foreground">
                  Gestiona tu información
                </p>
              </div>
              <ArrowUpRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Últimos Documentos */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Últimos Documentos Finales
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/oficina-central/mis-documentos')}
              className="gap-2"
            >
              Ver todos
              <ArrowUpRight className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {stats.ultimosDocumentos.length === 0 ? (
            <div className="text-center py-12">
              <FolderCheck className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No hay documentos finales
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Los documentos finales de proyectos cerrados aparecerán aquí
              </p>
              <Button
                variant="outline"
                onClick={() => router.push('/oficina-central/subir-carpetas')}
                className="gap-2"
              >
                <Upload className="w-4 h-4" />
                Subir Primera Carpeta
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.ultimosDocumentos.map((doc, index) => (
                <div
                  key={`${doc.proyecto.id}-${doc.carpeta.id}-${index}`}
                  className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/30 transition-colors group cursor-pointer"
                  onClick={() => handleVerDocumento(doc)}
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="p-2 bg-primary/10 rounded-lg group-hover:scale-110 transition-transform">
                      <FolderCheck className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-foreground truncate">
                          {doc.proyecto.nombre}
                        </h4>
                        <Badge
                          variant={doc.proyecto.estado === 'aprobado' ? 'default' : 'secondary'}
                          className="shrink-0"
                        >
                          {doc.proyecto.estado === 'cerrado' ? (
                            <>
                              <XCircle className="w-3 h-3" />
                              Cerrado
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-3 h-3" />
                              Aprobado
                            </>
                          )}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5" />
                          {doc.empresa.nombre}
                        </span>
                        <span className="flex items-center gap-1">
                          <FileText className="w-3.5 h-3.5" />
                          {doc.carpeta.nombre}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDate(doc.proyecto.fechaCreacion)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <Badge variant="outline">
                        {doc.archivos.length} {doc.archivos.length === 1 ? 'archivo' : 'archivos'}
                      </Badge>
                      <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
