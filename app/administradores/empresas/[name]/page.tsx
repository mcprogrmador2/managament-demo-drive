'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Building2, 
  ArrowLeft,
  FolderOpen,
  Users,
  MapPin,
  Phone,
  Mail,
  FileText,
  Calendar,
  Clock,
  TrendingUp,
  Activity,
  CheckCircle2,
  ExternalLink
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  empresasStorage,
  areasStorage,
  proyectosStorage,
  initializeProjectData
} from '@/lib/projectStorage';
import { Empresa, Area, Proyecto } from '@/lib/projectTypes';

export default function EmpresaDetailPage() {
  const params = useParams();
  const router = useRouter();
  const empresaId = params.name as string;

  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [areas, setAreas] = useState<Area[]>([]);
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [loading, setLoading] = useState(true);

  const loadEmpresaData = () => {
    initializeProjectData();
    
    const empresaData = empresasStorage.getById(empresaId);
    if (empresaData) {
      setEmpresa(empresaData);
      
      // Cargar áreas de la empresa
      const areasData = areasStorage.find((area: Area) => area.empresaId === empresaId);
      setAreas(areasData);

      // Cargar proyectos de la empresa
      const proyectosData = proyectosStorage.find((proyecto: Proyecto) => proyecto.empresaId === empresaId);
      setProyectos(proyectosData);
    } else {
      // Si no encuentra la empresa, redirigir a la lista
      router.push('/administradores/empresas');
    }
    
    setLoading(false);
  };

  useEffect(() => {
    loadEmpresaData();
  }, [empresaId]);

  const handleBack = () => {
    router.push('/administradores/empresas');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!empresa) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Empresa no encontrada</p>
          <Button onClick={handleBack}>Volver a Empresas</Button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const proyectosActivos = proyectos.filter(p => p.estado === 'abierto').length;
  const proyectosCerrados = proyectos.filter(p => p.estado === 'cerrado').length;
  const proyectosAprobados = proyectos.filter(p => p.estado === 'aprobado').length;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="border-b border-border bg-gradient-to-br from-primary/5 via-primary/3 to-transparent">
        <div className="container mx-auto px-4 sm:px-6 py-8">
          <div className="flex items-start gap-4 mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver
            </Button>
          </div>

          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
                <Building2 className="w-10 h-10 text-primary-foreground" />
              </div>
              <div className="flex-1 space-y-3">
                <div>
                  <h1 className="text-4xl font-bold tracking-tight text-foreground">
                    {empresa.nombre}
                  </h1>
                  {empresa.nit && (
                    <p className="text-muted-foreground mt-1">NIT: {empresa.nit}</p>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={empresa.activo ? 'default' : 'secondary'} className="text-sm px-3 py-1">
                    {empresa.activo ? 'Activa' : 'Inactiva'}
                  </Badge>
                  <Separator orientation="vertical" className="h-4" />
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FolderOpen className="w-4 h-4" />
                    <span>{areas.length} áreas</span>
                  </div>
                  <Separator orientation="vertical" className="h-4" />
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText className="w-4 h-4" />
                    <span>{proyectos.length} proyectos</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - 2 columns */}
          <div className="lg:col-span-2 space-y-8">
            {/* Contact Information */}
            {(empresa.direccion || empresa.telefono || empresa.email) && (
              <Card className="border-primary/20 shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    Información de Contacto
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {empresa.direccion && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          <MapPin className="w-4 h-4" />
                          Dirección
                        </div>
                        <p className="text-sm text-foreground leading-relaxed">
                          {empresa.direccion}
                        </p>
                      </div>
                    )}
                    {empresa.telefono && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          <Phone className="w-4 h-4" />
                          Teléfono
                        </div>
                        <p className="text-sm text-foreground leading-relaxed">
                          {empresa.telefono}
                        </p>
                      </div>
                    )}
                    {empresa.email && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          <Mail className="w-4 h-4" />
                          Email
                        </div>
                        <p className="text-sm text-foreground leading-relaxed">
                          {empresa.email}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Areas Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                    <FolderOpen className="w-7 h-7 text-primary" />
                    Áreas Organizacionales
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Divisiones y departamentos de la empresa
                  </p>
                </div>
                <Badge variant="outline" className="text-sm px-3 py-1">
                  {areas.length} {areas.length === 1 ? 'área' : 'áreas'}
                </Badge>
              </div>

              {areas.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {areas.map((area) => (
                    <Card key={area.id} className="border-primary/20 hover:border-primary/40 hover:shadow-md transition-all cursor-pointer group">
                      <CardHeader className="pb-3">
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                            <FolderOpen className="w-6 h-6 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-base mb-1">{area.nombre}</CardTitle>
                            {area.descripcion && (
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {area.descripcion}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Estado</span>
                          <Badge variant={area.activo ? 'default' : 'secondary'} className="text-xs">
                            {area.activo ? 'Activa' : 'Inactiva'}
                          </Badge>
                        </div>
                        {area.fechaCreacion && (
                          <div className="mt-3 pt-3 border-t border-border">
                            <p className="text-xs text-muted-foreground">
                              Creada {formatDate(area.fechaCreacion)}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="border-dashed border-2 border-primary/20">
                  <CardContent className="p-12 text-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FolderOpen className="w-8 h-8 text-primary/50" />
                    </div>
                    <p className="text-muted-foreground font-medium mb-2">
                      No hay áreas registradas
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Esta empresa aún no tiene áreas asignadas
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Sidebar - 1 column */}
          <div className="space-y-6">
            {/* Statistics */}
            
            {/* Timeline */}
            <Card className="border-primary/20 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  Información Temporal
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                      <Calendar className="w-3.5 h-3.5" />
                      Fecha de Creación
                    </div>
                    <p className="text-sm text-foreground font-medium">
                      {formatDate(empresa.fechaCreacion)}
                    </p>
                  </div>
                  <Separator />
                  <div>
                    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                      <Calendar className="w-3.5 h-3.5" />
                      Última Actualización
                    </div>
                    <p className="text-sm text-foreground font-medium">
                      {formatDate(empresa.fechaActualizacion)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-primary/20 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <ExternalLink className="w-5 h-5 text-primary" />
                  Acciones Rápidas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => router.push('/administradores/areas')}
                >
                  <FolderOpen className="w-4 h-4 mr-2" />
                  Gestionar Áreas
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => router.push('/administradores/proyectos')}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Ver Proyectos
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => router.push('/administradores/trabajadores')}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Ver Trabajadores
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={handleBack}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver a Empresas
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}