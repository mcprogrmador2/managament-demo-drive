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
  Clock
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  empresasStorage,
  areasStorage,
  initializeProjectData
} from '@/lib/projectStorage';
import { Empresa, Area } from '@/lib/projectTypes';

export default function EmpresaDetailPage() {
  const params = useParams();
  const router = useRouter();
  const empresaId = params.name as string;

  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEmpresaData();
  }, [empresaId]);

  const loadEmpresaData = () => {
    initializeProjectData();
    
    const empresaData = empresasStorage.getById(empresaId);
    if (empresaData) {
      setEmpresa(empresaData);
      
      // Cargar áreas de la empresa
      const areasData = areasStorage.find((area: Area) => area.empresaId === empresaId);
      setAreas(areasData);
    } else {
      // Si no encuentra la empresa, redirigir a la lista
      router.push('/administradores/empresas');
    }
    
    setLoading(false);
  };

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

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 py-6">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="gap-2 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a Empresas
          </Button>
          
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center">
              <Building2 className="w-8 h-8 text-primary" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                {empresa.nombre}
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={empresa.activo ? 'default' : 'secondary'}>
                  {empresa.activo ? 'Activa' : 'Inactiva'}
                </Badge>
                {empresa.nit && (
                  <Badge variant="outline">NIT: {empresa.nit}</Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Información General */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {empresa.direccion && (
            <Card className="border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground mb-1">Dirección</p>
                    <p className="text-sm text-foreground font-medium line-clamp-2">
                      {empresa.direccion}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {empresa.telefono && (
            <Card className="border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground mb-1">Teléfono</p>
                    <p className="text-sm text-foreground font-medium">
                      {empresa.telefono}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {empresa.email && (
            <Card className="border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground mb-1">Email</p>
                    <p className="text-sm text-foreground font-medium line-clamp-1">
                      {empresa.email}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Información de Fechas */}
        <Card className="mb-6 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="w-5 h-5 text-primary" />
              Información Temporal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                <Clock className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Fecha de Creación</p>
                  <p className="text-sm text-foreground font-medium">
                    {formatDate(empresa.fechaCreacion)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                <Clock className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Última Actualización</p>
                  <p className="text-sm text-foreground font-medium">
                    {formatDate(empresa.fechaActualizacion)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Áreas de la Empresa */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <FolderOpen className="w-6 h-6 text-primary" />
              Áreas
            </h2>
            <Badge variant="outline" className="text-sm">
              {areas.length} {areas.length === 1 ? 'área' : 'áreas'}
            </Badge>
          </div>

          {areas.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {areas.map((area) => (
                <Card key={area.id} className="border-primary/20 hover:border-primary/40 transition-all cursor-pointer group">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <FolderOpen className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{area.nombre}</CardTitle>
                        {area.descripcion && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {area.descripcion}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Estado:</span>
                      <Badge variant={area.activo ? 'default' : 'secondary'}>
                        {area.activo ? 'Activa' : 'Inactiva'}
                      </Badge>
                    </div>
                    {area.fechaCreacion && (
                      <div className="mt-2 pt-2 border-t border-border">
                        <p className="text-xs text-muted-foreground">
                          Creada: {formatDate(area.fechaCreacion)}
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
                  Esta empresa aún no tiene áreas asignadas. Puedes crear áreas desde el menú de Áreas.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
