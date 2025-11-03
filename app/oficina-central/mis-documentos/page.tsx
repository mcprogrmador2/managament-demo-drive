'use client';

import React, { useState, useEffect } from 'react';
import { 
  FileSearch, 
  Download, 
  Eye, 
  Calendar, 
  FolderOpen,
  Search,
  Filter,
  Building2,
  Briefcase,
  FileText,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  proyectosStorage,
  carpetasStorage,
  archivosStorage,
  empresasStorage,
  initializeProjectData 
} from '@/lib/projectStorage';
import { toast } from 'sonner';
import { Proyecto, Carpeta, Archivo, Empresa } from '@/lib/projectTypes';

interface DocumentoFinal {
  proyecto: Proyecto;
  empresa: Empresa;
  carpeta: Carpeta;
  archivos: Archivo[];
}

export default function MisDocumentosPage() {
  const [loading, setLoading] = useState(true);
  const [documentos, setDocumentos] = useState<DocumentoFinal[]>([]);
  const [filteredDocumentos, setFilteredDocumentos] = useState<DocumentoFinal[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [estadoFilter, setEstadoFilter] = useState<string>('todos');
  const [empresaFilter, setEmpresaFilter] = useState<string>('todas');

  useEffect(() => {
    loadDocumentos();
  }, []);

  useEffect(() => {
    filterDocumentos();
  }, [documentos, searchTerm, estadoFilter, empresaFilter]);

  const loadDocumentos = () => {
    setLoading(true);
    initializeProjectData();

    const proyectos = proyectosStorage.getAll();
    const carpetas = carpetasStorage.getAll();
    const archivos = archivosStorage.getAll();
    const empresas = empresasStorage.getAll();

    // Filtrar solo carpetas marcadas como "final" o "Documento Final"
    const carpetasFinales = carpetas.filter(
      c => c.restricciones.tipo === 'final' || c.nombre.toLowerCase().includes('final')
    );

    const documentosFinales: DocumentoFinal[] = [];

    carpetasFinales.forEach((carpeta) => {
      const proyecto = proyectos.find(p => p.id === carpeta.proyectoId);
      if (proyecto && proyecto.estado === 'cerrado') {
        const empresa = empresas.find(e => e.id === proyecto.empresaId);
        const archivosEnCarpeta = archivos.filter(a => a.carpetaId === carpeta.id && a.estado === 'activo');

        if (empresa) {
          documentosFinales.push({
            proyecto,
            empresa,
            carpeta,
            archivos: archivosEnCarpeta
          });
        }
      }
    });

    setDocumentos(documentosFinales);
    setLoading(false);
  };

  const filterDocumentos = () => {
    let filtered = [...documentos];

    // Filtrar por búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        doc =>
          doc.proyecto.nombre.toLowerCase().includes(term) ||
          doc.empresa.nombre.toLowerCase().includes(term) ||
          doc.carpeta.nombre.toLowerCase().includes(term)
      );
    }

    // Filtrar por estado
    if (estadoFilter !== 'todos') {
      filtered = filtered.filter(doc => doc.proyecto.estado === estadoFilter);
    }

    // Filtrar por empresa
    if (empresaFilter !== 'todas') {
      filtered = filtered.filter(doc => doc.empresa.id === empresaFilter);
    }

    setFilteredDocumentos(filtered);
  };

  const handleDescargar = (documento: DocumentoFinal) => {
    toast.success(`Descargando documentos de "${documento.proyecto.nombre}"`);
    // Simulación de descarga
  };

  const handleVerDetalle = (documento: DocumentoFinal) => {
    toast.info(`Abriendo detalles de "${documento.proyecto.nombre}"`);
    // Aquí podrías navegar a una vista detallada
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const empresas = empresasStorage.getAll();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Mis Documentos</h1>
        <p className="text-muted-foreground mt-1">
          Accede a documentos finales de proyectos cerrados
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FolderOpen className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Documentos</p>
                <p className="text-2xl font-bold text-foreground">{documentos.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-success/10 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Proyectos Cerrados</p>
                <p className="text-2xl font-bold text-foreground">
                  {documentos.filter(d => d.proyecto.estado === 'cerrado').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-info/10 rounded-lg">
                <FileText className="w-5 h-5 text-info" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Archivos</p>
                <p className="text-2xl font-bold text-foreground">
                  {documentos.reduce((acc, doc) => acc + doc.archivos.length, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/10 rounded-lg">
                <Building2 className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Empresas</p>
                <p className="text-2xl font-bold text-foreground">
                  {new Set(documentos.map(d => d.empresa.id)).size}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por proyecto, empresa o carpeta..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={estadoFilter} onValueChange={setEstadoFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los estados</SelectItem>
                <SelectItem value="cerrado">Cerrado</SelectItem>
                <SelectItem value="aprobado">Aprobado</SelectItem>
              </SelectContent>
            </Select>
            <Select value={empresaFilter} onValueChange={setEmpresaFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Empresa" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas las empresas</SelectItem>
                {empresas.map((empresa) => (
                  <SelectItem key={empresa.id} value={empresa.id}>
                    {empresa.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Documentos */}
      {filteredDocumentos.length === 0 ? (
        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <FileSearch className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No se encontraron documentos
              </h3>
              <p className="text-sm text-muted-foreground">
                {searchTerm || estadoFilter !== 'todos' || empresaFilter !== 'todas'
                  ? 'Intenta ajustar los filtros de búsqueda'
                  : 'No hay documentos finales disponibles en este momento'}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredDocumentos.map((documento) => (
            <Card key={`${documento.proyecto.id}-${documento.carpeta.id}`} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                        <Briefcase className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-foreground mb-1 truncate">
                          {documento.proyecto.nombre}
                        </h3>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className="gap-1">
                            <Building2 className="w-3 h-3" />
                            {documento.empresa.nombre}
                          </Badge>
                          <Badge
                            variant={documento.proyecto.estado === 'aprobado' ? 'default' : 'secondary'}
                            className="gap-1"
                          >
                            {documento.proyecto.estado === 'cerrado' && <XCircle className="w-3 h-3" />}
                            {documento.proyecto.estado === 'aprobado' && <CheckCircle2 className="w-3 h-3" />}
                            {documento.proyecto.estado === 'cerrado' ? 'Cerrado' : 'Aprobado'}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="bg-accent/30 border border-accent/50 rounded-lg p-3 mb-3">
                      <div className="flex items-center gap-2 mb-2">
                        <FolderOpen className="w-4 h-4 text-primary" />
                        <p className="text-sm font-medium text-foreground">{documento.carpeta.nombre}</p>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          {documento.archivos.length} {documento.archivos.length === 1 ? 'archivo' : 'archivos'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(documento.proyecto.fechaCreacion).toLocaleDateString('es-ES')}
                        </span>
                      </div>
                    </div>

                    {documento.archivos.length > 0 && (
                      <div className="space-y-1">
                        {documento.archivos.slice(0, 3).map((archivo) => (
                          <div key={archivo.id} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <FileText className="w-3 h-3" />
                            <span className="truncate flex-1">{archivo.nombreOriginal}</span>
                            <span className="text-xs">{formatFileSize(archivo.tamaño)}</span>
                          </div>
                        ))}
                        {documento.archivos.length > 3 && (
                          <p className="text-xs text-muted-foreground">
                            + {documento.archivos.length - 3} archivo(s) más
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleVerDetalle(documento)}
                      className="gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      Ver
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleDescargar(documento)}
                      className="gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Descargar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

