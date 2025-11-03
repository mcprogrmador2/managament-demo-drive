'use client';

import React, { useState, useEffect } from 'react';
import {
  Upload,
  FolderPlus,
  FileText,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  Building2,
  Calendar,
  FolderOpen
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  actividadesStorage,
  empresasStorage,
  initializeProjectData,
  generateProjectId,
  getCurrentTimestamp
} from '@/lib/projectStorage';
import { getSession } from '@/lib/auth';
import { toast } from 'sonner';
import { Proyecto, Empresa } from '@/lib/projectTypes';

interface ArchivoSimulado {
  id: string;
  nombre: string;
  tamaño: number;
  tipo: string;
}

export default function SubirCarpetasPage() {
  const [loading, setLoading] = useState(true);
  const [proyectosCerrados, setProyectosCerrados] = useState<Proyecto[]>([]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  
  // Estados del formulario
  const [selectedProyecto, setSelectedProyecto] = useState('');
  const [nombreCarpeta, setNombreCarpeta] = useState('');
  const [descripcionCarpeta, setDescripcionCarpeta] = useState('');
  const [archivosSimulados, setArchivosSimulados] = useState<ArchivoSimulado[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Estados para drag and drop
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setLoading(true);
    initializeProjectData();

    const proyectos = proyectosStorage.getAll();
    const proyectosCerrados = proyectos.filter(p => p.estado === 'cerrado' || p.estado === 'aprobado');
    
    setProyectosCerrados(proyectosCerrados);
    setEmpresas(empresasStorage.getAll());
    setLoading(false);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    handleFilesAdded(files);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleFilesAdded(files);
    }
  };

  const handleFilesAdded = (files: File[]) => {
    const nuevosArchivos: ArchivoSimulado[] = files.map(file => ({
      id: generateProjectId('temp'),
      nombre: file.name,
      tamaño: file.size,
      tipo: file.type || 'application/octet-stream'
    }));

    setArchivosSimulados(prev => [...prev, ...nuevosArchivos]);
    toast.success(`${files.length} archivo(s) agregado(s)`);
  };

  const handleRemoveFile = (id: string) => {
    setArchivosSimulados(prev => prev.filter(a => a.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProyecto) {
      toast.error('Selecciona un proyecto');
      return;
    }

    if (!nombreCarpeta.trim()) {
      toast.error('Ingresa un nombre para la carpeta');
      return;
    }

    if (archivosSimulados.length === 0) {
      toast.error('Agrega al menos un archivo');
      return;
    }

    setIsUploading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
      const session = getSession();
      if (!session) {
        toast.error('No hay sesión activa');
        setIsUploading(false);
        return;
      }

      const proyecto = proyectosStorage.getById(selectedProyecto);
      if (!proyecto) {
        toast.error('Proyecto no encontrado');
        setIsUploading(false);
        return;
      }

      // Crear carpeta
      const nuevaCarpeta = carpetasStorage.create({
        id: generateProjectId('carp'),
        proyectoId: proyecto.id,
        nombre: nombreCarpeta.trim(),
        descripcion: descripcionCarpeta.trim() || undefined,
        orden: 0,
        restricciones: {
          tipo: 'final'
        },
        fechaCreacion: getCurrentTimestamp(),
        creadoPor: session.userId || session.username
      });

      // Crear archivos simulados
      for (const archivoSim of archivosSimulados) {
        const extension = archivoSim.nombre.split('.').pop() || 'file';
        const nombreBase = archivoSim.nombre.replace(/\.[^/.]+$/, '').replace(/ /g, '_');

        archivosStorage.create({
          id: generateProjectId('arch'),
          carpetaId: nuevaCarpeta.id,
          nombre: nombreBase,
          nombreOriginal: archivoSim.nombre,
          tipo: archivoSim.tipo,
          tamaño: archivoSim.tamaño,
          extension: extension,
          url: `/files/${nombreBase.toLowerCase()}.${extension}`,
          version: 1,
          estado: 'activo',
          subidoPor: session.userId || session.username,
          fechaSubida: getCurrentTimestamp(),
          fechaModificacion: getCurrentTimestamp()
        });
      }

      // Crear actividad
      actividadesStorage.create({
        id: generateProjectId('act'),
        proyectoId: proyecto.id,
        tipo: 'carpeta_creada',
        usuarioId: session.userId || session.username,
        descripcion: `Oficina Central subió la carpeta "${nombreCarpeta}" con ${archivosSimulados.length} archivo(s)`,
        fechaCreacion: getCurrentTimestamp()
      });

      toast.success('Carpeta y archivos subidos exitosamente');
      
      // Limpiar formulario
      setSelectedProyecto('');
      setNombreCarpeta('');
      setDescripcionCarpeta('');
      setArchivosSimulados([]);
      
    } catch (error) {
      toast.error('Error al subir archivos');
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const getEmpresaNombre = (empresaId: string): string => {
    return empresas.find(e => e.id === empresaId)?.nombre || 'Sin empresa';
  };

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
        <h1 className="text-3xl font-bold text-foreground">Subir Carpetas</h1>
        <p className="text-muted-foreground mt-1">
          Sube documentos finales a proyectos cerrados
        </p>
      </div>

      {/* Información */}
      <div className="bg-info/10 border border-info/30 rounded-lg p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-info mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-medium text-info">Información importante</p>
          <p className="text-sm text-muted-foreground mt-1">
            Solo puedes subir documentos a proyectos que ya han sido cerrados. Los archivos que subas estarán disponibles en la sección de Documentos Finales.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulario */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderPlus className="w-5 h-5" />
                Nueva Carpeta de Documentos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Seleccionar Proyecto */}
                <div className="space-y-2">
                  <Label htmlFor="proyecto">Proyecto *</Label>
                  <Select value={selectedProyecto} onValueChange={setSelectedProyecto}>
                    <SelectTrigger id="proyecto">
                      <SelectValue placeholder="Selecciona un proyecto cerrado" />
                    </SelectTrigger>
                    <SelectContent>
                      {proyectosCerrados.length === 0 ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                          No hay proyectos cerrados disponibles
                        </div>
                      ) : (
                        proyectosCerrados.map((proyecto) => (
                          <SelectItem key={proyecto.id} value={proyecto.id}>
                            <div className="flex items-center gap-2">
                              <Briefcase className="w-3 h-3" />
                              {proyecto.nombre}
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  {selectedProyecto && (
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="gap-1">
                        <Building2 className="w-3 h-3" />
                        {getEmpresaNombre(proyectosCerrados.find(p => p.id === selectedProyecto)?.empresaId || '')}
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Nombre de Carpeta */}
                <div className="space-y-2">
                  <Label htmlFor="nombreCarpeta">Nombre de Carpeta *</Label>
                  <Input
                    id="nombreCarpeta"
                    value={nombreCarpeta}
                    onChange={(e) => setNombreCarpeta(e.target.value)}
                    placeholder="Ej: Documentos Finales Revisados"
                    disabled={isUploading}
                  />
                </div>

                {/* Descripción */}
                <div className="space-y-2">
                  <Label htmlFor="descripcion">Descripción (opcional)</Label>
                  <Textarea
                    id="descripcion"
                    value={descripcionCarpeta}
                    onChange={(e) => setDescripcionCarpeta(e.target.value)}
                    placeholder="Breve descripción de los documentos..."
                    rows={3}
                    disabled={isUploading}
                  />
                </div>

                {/* Área de Drop de Archivos */}
                <div className="space-y-2">
                  <Label>Archivos *</Label>
                  <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
                      isDragging
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                  >
                    <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-sm font-medium text-foreground mb-1">
                      Arrastra archivos aquí o haz clic para seleccionar
                    </p>
                    <p className="text-xs text-muted-foreground mb-4">
                      Soporta múltiples archivos
                    </p>
                    <input
                      type="file"
                      multiple
                      onChange={handleFileInputChange}
                      className="hidden"
                      id="fileInput"
                      disabled={isUploading}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('fileInput')?.click()}
                      disabled={isUploading}
                    >
                      Seleccionar Archivos
                    </Button>
                  </div>
                </div>

                {/* Lista de Archivos */}
                {archivosSimulados.length > 0 && (
                  <div className="space-y-2">
                    <Label>Archivos seleccionados ({archivosSimulados.length})</Label>
                    <div className="border border-border rounded-lg overflow-hidden">
                      {archivosSimulados.map((archivo) => (
                        <div
                          key={archivo.id}
                          className="flex items-center justify-between p-3 hover:bg-accent/50 transition-colors border-b border-border last:border-b-0"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <FileText className="w-4 h-4 text-primary shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">
                                {archivo.nombre}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatFileSize(archivo.tamaño)}
                              </p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveFile(archivo.id)}
                            disabled={isUploading}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Botón de Envío */}
                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    disabled={isUploading || !selectedProyecto || !nombreCarpeta.trim() || archivosSimulados.length === 0}
                    className="gap-2"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Subiendo...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        Subir Carpeta
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setSelectedProyecto('');
                      setNombreCarpeta('');
                      setDescripcionCarpeta('');
                      setArchivosSimulados([]);
                    }}
                    disabled={isUploading}
                  >
                    Limpiar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Proyectos Disponibles */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FolderOpen className="w-4 h-4" />
                Proyectos Disponibles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-primary">
                    {proyectosCerrados.length}
                  </span>
                  <Badge variant="outline">Cerrados</Badge>
                </div>

                {proyectosCerrados.length > 0 ? (
                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {proyectosCerrados.map((proyecto) => (
                      <div
                        key={proyecto.id}
                        className={`p-3 rounded-lg border transition-all cursor-pointer ${
                          selectedProyecto === proyecto.id
                            ? 'bg-primary/10 border-primary'
                            : 'bg-muted/30 border-border hover:border-primary/50'
                        }`}
                        onClick={() => setSelectedProyecto(proyecto.id)}
                      >
                        <p className="text-sm font-medium text-foreground truncate mb-1">
                          {proyecto.nombre}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Building2 className="w-3 h-3" />
                          <span className="truncate">{getEmpresaNombre(proyecto.empresaId)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(proyecto.fechaCreacion).toLocaleDateString('es-ES')}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No hay proyectos cerrados disponibles
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

