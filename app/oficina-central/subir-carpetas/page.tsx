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
  FolderOpen,
  Folder,
  File,
  ChevronRight,
  Home,
  ArrowLeft,
  Trash2
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
import { Proyecto, Empresa, Carpeta, Archivo } from '@/lib/projectTypes';

interface ArchivoSimulado {
  id: string;
  nombre: string;
  tamaño: number;
  tipo: string;
}

interface CarpetaTemporal {
  id: string;
  nombre: string;
  descripcion?: string;
  archivos: ArchivoSimulado[];
  subcarpetas: CarpetaTemporal[];
  padreId: string | null;
}

export default function SubirCarpetasPage() {
  const [loading, setLoading] = useState(true);
  const [proyectosCerrados, setProyectosCerrados] = useState<Proyecto[]>([]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  
  // Estados del formulario
  const [selectedProyecto, setSelectedProyecto] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Estados para estructura de carpetas temporal
  const [carpetasTemporales, setCarpetasTemporales] = useState<CarpetaTemporal[]>([]);
  const [carpetaActual, setCarpetaActual] = useState<string | null>(null);
  const [historialCarpetas, setHistorialCarpetas] = useState<Array<{ id: string | null, nombre: string }>>([
    { id: null, nombre: 'Raíz' }
  ]);

  // Estados para drag and drop
  const [isDragging, setIsDragging] = useState(false);
  const [dragOverCarpeta, setDragOverCarpeta] = useState<string | null>(null);

  // Estados para modal de crear carpeta
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
  const [createFolderData, setCreateFolderData] = useState({
    nombre: '',
    descripcion: ''
  });

  // Estados para menú contextual
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  // Cerrar menú contextual al hacer click
  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
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

  // Función para obtener carpeta por ID
  const getCarpetaById = (id: string, carpetas: CarpetaTemporal[] = carpetasTemporales): CarpetaTemporal | null => {
    for (const carpeta of carpetas) {
      if (carpeta.id === id) return carpeta;
      const found = getCarpetaById(id, carpeta.subcarpetas);
      if (found) return found;
    }
    return null;
  };

  // Función para actualizar carpeta recursivamente
  const actualizarCarpeta = (
    carpetas: CarpetaTemporal[], 
    carpetaId: string, 
    actualizador: (carpeta: CarpetaTemporal) => CarpetaTemporal
  ): CarpetaTemporal[] => {
    return carpetas.map(carpeta => {
      if (carpeta.id === carpetaId) {
        return actualizador(carpeta);
      }
      return {
        ...carpeta,
        subcarpetas: actualizarCarpeta(carpeta.subcarpetas, carpetaId, actualizador)
      };
    });
  };

  // Función para eliminar carpeta recursivamente
  const eliminarCarpeta = (carpetas: CarpetaTemporal[], carpetaId: string): CarpetaTemporal[] => {
    return carpetas.filter(carpeta => carpeta.id !== carpetaId).map(carpeta => ({
      ...carpeta,
      subcarpetas: eliminarCarpeta(carpeta.subcarpetas, carpetaId)
    }));
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const target = e.currentTarget;
    const relatedTarget = e.relatedTarget as Node;
    if (!target.contains(relatedTarget)) {
      setIsDragging(false);
      setDragOverCarpeta(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragOverCarpeta = (e: React.DragEvent, carpetaId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverCarpeta(carpetaId);
  };

  const handleDragLeaveCarpeta = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverCarpeta(null);
  };

  const handleDrop = (e: React.DragEvent, carpetaDestinoId: string | null) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setDragOverCarpeta(null);

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) {
      toast.error('No se detectaron archivos');
      return;
    }

    if (files.length > 20) {
      toast.error('Máximo 20 archivos por vez');
      return;
    }

    const nuevosArchivos: ArchivoSimulado[] = files.map(file => ({
      id: generateProjectId('temp'),
      nombre: file.name,
      tamaño: file.size,
      tipo: file.type || 'application/octet-stream'
    }));

    if (carpetaDestinoId) {
      // Agregar archivos a carpeta específica
      setCarpetasTemporales(prev => 
        actualizarCarpeta(prev, carpetaDestinoId, carpeta => ({
          ...carpeta,
          archivos: [...carpeta.archivos, ...nuevosArchivos]
        }))
      );
    } else {
      toast.error('Arrastra los archivos a una carpeta específica');
      return;
    }

    toast.success(`${files.length} archivo(s) agregado(s)`);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleFilesAdded(files);
    }
  };

  const handleFilesAdded = (files: File[]) => {
    if (!carpetaActual) {
      toast.error('Primero crea una carpeta o selecciona una existente');
      return;
    }

    const nuevosArchivos: ArchivoSimulado[] = files.map(file => ({
      id: generateProjectId('temp'),
      nombre: file.name,
      tamaño: file.size,
      tipo: file.type || 'application/octet-stream'
    }));

    setCarpetasTemporales(prev => 
      actualizarCarpeta(prev, carpetaActual, carpeta => ({
        ...carpeta,
        archivos: [...carpeta.archivos, ...nuevosArchivos]
      }))
    );

    toast.success(`${files.length} archivo(s) agregado(s)`);
  };

  const handleRemoveFile = (carpetaId: string, archivoId: string) => {
    setCarpetasTemporales(prev => 
      actualizarCarpeta(prev, carpetaId, carpeta => ({
        ...carpeta,
        archivos: carpeta.archivos.filter(a => a.id !== archivoId)
      }))
    );
    toast.success('Archivo eliminado');
  };

  // Funciones de navegación de carpetas
  const handleAbrirCarpeta = (carpeta: CarpetaTemporal) => {
    setCarpetaActual(carpeta.id);
    setHistorialCarpetas(prev => [...prev, { id: carpeta.id, nombre: carpeta.nombre }]);
  };

  const handleVolverAtras = () => {
    if (historialCarpetas.length > 1) {
      const nuevoHistorial = [...historialCarpetas];
      nuevoHistorial.pop();
      setHistorialCarpetas(nuevoHistorial);
      const carpetaAnterior = nuevoHistorial[nuevoHistorial.length - 1];
      setCarpetaActual(carpetaAnterior.id);
    }
  };

  const handleIrACarpeta = (index: number) => {
    const nuevoHistorial = historialCarpetas.slice(0, index + 1);
    setHistorialCarpetas(nuevoHistorial);
    const carpetaDestino = nuevoHistorial[nuevoHistorial.length - 1];
    setCarpetaActual(carpetaDestino.id);
  };

  // Función para manejar click derecho
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  // Función para abrir modal de crear carpeta
  const handleOpenCreateFolderModal = () => {
    setContextMenu(null);
    setIsCreateFolderModalOpen(true);
  };

  // Función para cerrar modal de crear carpeta
  const handleCloseCreateFolderModal = () => {
    setIsCreateFolderModalOpen(false);
    setCreateFolderData({
      nombre: '',
      descripcion: ''
    });
  };

  // Función para crear carpeta temporal
  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();

    if (!createFolderData.nombre.trim()) {
      toast.error('El nombre de la carpeta es obligatorio');
      return;
    }

    const nuevaCarpeta: CarpetaTemporal = {
      id: generateProjectId('temp_carp'),
      nombre: createFolderData.nombre.trim(),
      descripcion: createFolderData.descripcion.trim() || undefined,
      archivos: [],
      subcarpetas: [],
      padreId: carpetaActual
    };

    if (carpetaActual) {
      // Agregar subcarpeta
      setCarpetasTemporales(prev => 
        actualizarCarpeta(prev, carpetaActual, carpeta => ({
          ...carpeta,
          subcarpetas: [...carpeta.subcarpetas, nuevaCarpeta]
        }))
      );
    } else {
      // Agregar carpeta raíz
      setCarpetasTemporales(prev => [...prev, nuevaCarpeta]);
    }

    toast.success('Carpeta creada exitosamente');
    handleCloseCreateFolderModal();
  };

  // Función para eliminar carpeta temporal
  const handleDeleteFolder = (carpetaId: string) => {
    if (!confirm('¿Estás seguro de eliminar esta carpeta y todo su contenido?')) {
      return;
    }

    setCarpetasTemporales(prev => eliminarCarpeta(prev, carpetaId));
    
    // Si estamos dentro de la carpeta eliminada, volver a raíz
    if (carpetaActual === carpetaId) {
      setCarpetaActual(null);
      setHistorialCarpetas([{ id: null, nombre: 'Raíz' }]);
    }

    toast.success('Carpeta eliminada');
  };

  // Función recursiva para subir carpetas y archivos
  const subirCarpetasRecursivamente = async (
    carpeta: CarpetaTemporal, 
    proyectoId: string, 
    padreIdReal: string | undefined,
    session: { userId: string; username: string }
  ): Promise<void> => {
    // Crear carpeta en storage
    const carpetaReal = carpetasStorage.create({
      id: generateProjectId('carp'),
      proyectoId: proyectoId,
      nombre: carpeta.nombre,
      descripcion: carpeta.descripcion || undefined,
      padreId: padreIdReal,
      orden: 0,
      restricciones: {
        tipo: 'final'
      },
      fechaCreacion: getCurrentTimestamp(),
      creadoPor: session.userId || session.username
    });

    // Crear archivos de la carpeta
    for (const archivo of carpeta.archivos) {
      const extension = archivo.nombre.split('.').pop() || 'file';
      const nombreBase = archivo.nombre.replace(/\.[^/.]+$/, '').replace(/ /g, '_');

      archivosStorage.create({
        id: generateProjectId('arch'),
        carpetaId: carpetaReal.id,
        nombre: nombreBase,
        nombreOriginal: archivo.nombre,
        tipo: archivo.tipo,
        tamaño: archivo.tamaño,
        extension: extension,
        url: `/files/${nombreBase.toLowerCase()}.${extension}`,
        version: 1,
        estado: 'activo',
        subidoPor: session.userId || session.username,
        fechaSubida: getCurrentTimestamp(),
        fechaModificacion: getCurrentTimestamp()
      });
    }

    // Subir subcarpetas recursivamente
    for (const subcarpeta of carpeta.subcarpetas) {
      await subirCarpetasRecursivamente(subcarpeta, proyectoId, carpetaReal.id, session);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProyecto) {
      toast.error('Selecciona un proyecto');
      return;
    }

    if (carpetasTemporales.length === 0) {
      toast.error('Crea al menos una carpeta con archivos');
      return;
    }

    // Verificar que haya archivos en alguna carpeta
    const tieneArchivos = (carpeta: CarpetaTemporal): boolean => {
      return carpeta.archivos.length > 0 || carpeta.subcarpetas.some(tieneArchivos);
    };

    if (!carpetasTemporales.some(tieneArchivos)) {
      toast.error('Debes agregar al menos un archivo a las carpetas');
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

      // Subir todas las carpetas raíz recursivamente
      for (const carpeta of carpetasTemporales) {
        await subirCarpetasRecursivamente(carpeta, proyecto.id, undefined, session);
      }

      // Contar total de carpetas y archivos
      const contarElementos = (carpetas: CarpetaTemporal[]): { carpetas: number; archivos: number } => {
        let totalCarpetas = 0;
        let totalArchivos = 0;
        
        for (const carpeta of carpetas) {
          totalCarpetas++;
          totalArchivos += carpeta.archivos.length;
          const subcuentas = contarElementos(carpeta.subcarpetas);
          totalCarpetas += subcuentas.carpetas;
          totalArchivos += subcuentas.archivos;
        }
        
        return { carpetas: totalCarpetas, archivos: totalArchivos };
      };

      const totales = contarElementos(carpetasTemporales);

      // Crear actividad
      actividadesStorage.create({
        id: generateProjectId('act'),
        proyectoId: proyecto.id,
        tipo: 'carpeta_creada',
        usuarioId: session.userId || session.username,
        descripcion: `Oficina Central subió ${totales.carpetas} carpeta(s) con ${totales.archivos} archivo(s)`,
        fechaCreacion: getCurrentTimestamp()
      });

      toast.success(`${totales.carpetas} carpeta(s) y ${totales.archivos} archivo(s) subidos exitosamente`);
      
      // Limpiar formulario
      setSelectedProyecto('');
      setCarpetasTemporales([]);
      setCarpetaActual(null);
      setHistorialCarpetas([{ id: null, nombre: 'Raíz' }]);
      
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

  // Función para obtener el icono según la extensión del archivo
  const getFileIcon = (nombreArchivo: string) => {
    const extension = nombreArchivo.split('.').pop()?.toLowerCase();
    
    // Documentos
    if (['doc', 'docx'].includes(extension || '')) {
      return <FileText className="w-11 h-11 sm:w-14 sm:h-14 text-[#2563eb]" />; // azul para Word
    }
    
    if (['pdf'].includes(extension || '')) {
      return <FileText className="w-11 h-11 sm:w-14 sm:h-14 text-[#dc2626]" />; // rojo para PDF
    }
    
    if (['xls', 'xlsx'].includes(extension || '')) {
      return <FileText className="w-11 h-11 sm:w-14 sm:h-14 text-[#059669]" />; // verde para Excel
    }
    
    if (['txt'].includes(extension || '')) {
      return <FileText className="w-11 h-11 sm:w-14 sm:h-14 text-[#6b7280]" />; // gris para texto
    }
    
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(extension || '')) {
      return <FileText className="w-11 h-11 sm:w-14 sm:h-14 text-[#8b5cf6]" />; // púrpura para imágenes
    }
    
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(extension || '')) {
      return <FileText className="w-11 h-11 sm:w-14 sm:h-14 text-[#f59e0b]" />; // naranja para comprimidos
    }
    
    if (['dwg', 'dxf'].includes(extension || '')) {
      return <FileText className="w-11 h-11 sm:w-14 sm:h-14 text-[#06b6d4]" />; // cyan para CAD
    }
    
    // Default
    return <FileText className="w-11 h-11 sm:w-14 sm:h-14 text-muted-foreground" />;
  };

  // Función para renderizar vista de cuadrícula estilo Windows Explorer
  const renderGridView = () => {
    // Filtrar carpetas y archivos según la carpeta actual
    let carpetasFiltradas: CarpetaTemporal[];
    let archivosFiltrados: ArchivoSimulado[];

    if (carpetaActual === null) {
      // Mostrar carpetas raíz
      carpetasFiltradas = carpetasTemporales;
      archivosFiltrados = [];
    } else {
      // Mostrar subcarpetas y archivos de la carpeta actual
      const carpetaActiva = getCarpetaById(carpetaActual);
      if (carpetaActiva) {
        carpetasFiltradas = carpetaActiva.subcarpetas;
        archivosFiltrados = carpetaActiva.archivos;
      } else {
        carpetasFiltradas = [];
        archivosFiltrados = [];
      }
    }

    // Combinar carpetas y archivos
    const items: Array<{ type: 'folder' | 'file', data: CarpetaTemporal | ArchivoSimulado }> = [
      ...carpetasFiltradas.map(c => ({ type: 'folder' as const, data: c })),
      ...archivosFiltrados.map(a => ({ type: 'file' as const, data: a }))
    ];

    if (items.length === 0) {
      return (
        <div 
          className={`text-center py-16 text-muted-foreground min-h-[300px] flex flex-col items-center justify-center transition-all ${
            isDragging && carpetaActual ? 'bg-primary/10 border-2 border-dashed border-primary rounded-lg' : ''
          }`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, carpetaActual)}
          onContextMenu={handleContextMenu}
        >
          <div className="w-24 h-24 mx-auto mb-4 bg-primary/5 rounded-full flex items-center justify-center">
            <Folder className="w-12 h-12 text-primary/50" />
          </div>
          <p className="text-lg font-medium mb-2">
            {carpetaActual ? 'Esta carpeta está vacía' : 'No hay carpetas creadas'}
          </p>
          <p className="text-sm mb-6">
            {carpetaActual 
              ? isDragging 
                ? 'Suelta los archivos aquí para subirlos' 
                : 'Arrastra archivos aquí o usa el botón de subir'
              : 'Crea una carpeta con clic derecho o usa el botón'}
          </p>
        </div>
      );
    }

    return (
      <div 
        className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-3 sm:gap-4 p-3 sm:p-6 min-h-[200px] sm:min-h-[300px] transition-all ${
          isDragging && carpetaActual && !dragOverCarpeta ? 'bg-primary/5' : ''
        }`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={(e) => {
          if (carpetaActual && !dragOverCarpeta) {
            handleDrop(e, carpetaActual);
          }
        }}
        onContextMenu={handleContextMenu}
      >
        {items.map((item) => {
          if (item.type === 'folder') {
            const carpeta = item.data as CarpetaTemporal;
            const totalArchivos = carpeta.archivos.length;
            const totalSubcarpetas = carpeta.subcarpetas.length;
            const totalElementos = totalArchivos + totalSubcarpetas;
            const isDropTarget = dragOverCarpeta === carpeta.id;
            
            return (
              <div
                key={`folder-${carpeta.id}`}
                className={`flex flex-col items-center gap-1.5 sm:gap-2 p-2 sm:p-3 rounded-lg transition-all group relative ${
                  isDropTarget 
                    ? 'bg-primary/20 ring-2 ring-primary scale-105' 
                    : 'hover:bg-accent/50'
                }`}
              >
                {isDropTarget && (
                  <div className="absolute inset-0 border-2 border-dashed border-primary rounded-lg pointer-events-none"></div>
                )}
                
                {/* Botón de eliminar (visible en hover) */}
                <div className="absolute top-1 sm:top-2 right-1 sm:right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteFolder(carpeta.id);
                    }}
                    className="bg-destructive text-destructive-foreground p-1 sm:p-1.5 rounded-full hover:bg-destructive/90 shadow-lg transition-colors"
                    title="Eliminar carpeta"
                  >
                    <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  </button>
                </div>

                <div 
                  className="w-full h-full flex flex-col items-center cursor-pointer"
                  onClick={(e) => {
                    if (!isDragging) {
                      handleAbrirCarpeta(carpeta);
                    }
                  }}
                  onDragOver={(e) => handleDragOverCarpeta(e, carpeta.id)}
                  onDragLeave={handleDragLeaveCarpeta}
                  onDrop={(e) => handleDrop(e, carpeta.id)}
                >
                  <div className="w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center">
                    <Folder className={`w-11 h-11 sm:w-14 sm:h-14 text-[#fbbf24] transition-transform ${
                      isDropTarget ? 'scale-110' : 'group-hover:scale-110'
                    }`} />
                  </div>
                  <div className="text-center w-full">
                    <p className="text-[10px] sm:text-xs text-foreground font-medium truncate px-1">
                      {carpeta.nombre}
                    </p>
                    <p className="text-[9px] sm:text-[10px] text-muted-foreground">
                      {totalElementos} {totalElementos === 1 ? 'elemento' : 'elementos'}
                    </p>
                  </div>
                </div>
                
                {isDropTarget && (
                  <div className="absolute -top-1 sm:-top-2 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full whitespace-nowrap">
                    Soltar aquí
                  </div>
                )}
              </div>
            );
          } else {
            const archivo = item.data as ArchivoSimulado;
            const carpetaPadre = carpetaActual;
            
            return (
              <div
                key={`file-${archivo.id}`}
                className="flex flex-col items-center gap-1.5 sm:gap-2 p-2 sm:p-3 rounded-lg hover:bg-accent/50 transition-all group relative"
              >
                {/* Botón de eliminar archivo */}
                <div className="absolute top-1 sm:top-2 right-1 sm:right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (carpetaPadre) {
                        handleRemoveFile(carpetaPadre, archivo.id);
                      }
                    }}
                    className="bg-destructive text-destructive-foreground p-1 sm:p-1.5 rounded-full hover:bg-destructive/90 shadow-lg transition-colors"
                    title="Eliminar archivo"
                  >
                    <X className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  </button>
                </div>

                <div className="w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center">
                  {getFileIcon(archivo.nombre)}
                </div>
                <div className="text-center w-full">
                  <p className="text-[10px] sm:text-xs text-foreground font-medium truncate px-1" title={archivo.nombre}>
                    {archivo.nombre}
                  </p>
                  <p className="text-[9px] sm:text-[10px] text-muted-foreground">
                    {formatFileSize(archivo.tamaño)}
                  </p>
                </div>
              </div>
            );
          }
        })}
      </div>
    );
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
            Solo puedes subir documentos a proyectos que ya han sido cerrados. Crea carpetas, organiza archivos, y súbelos de una vez.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Organizador de Carpetas */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="flex items-center gap-2">
                <Folder className="w-5 h-5" />
                Organizador de Documentos
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleOpenCreateFolderModal}
                  className="gap-2"
                >
                  <FolderPlus className="w-4 h-4" />
                  Nueva Carpeta
                </Button>
                {carpetaActual && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById('fileInput')?.click()}
                    className="gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    Subir Archivo
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {/* Indicador de drag activo */}
              {isDragging && (
                <div className="bg-primary/10 border-b border-primary/30 px-4 py-2 flex items-center gap-2">
                  <Upload className="w-4 h-4 text-primary animate-bounce" />
                  <span className="text-sm text-primary font-medium">
                    Arrastra los archivos a una carpeta para agregarlos
                  </span>
                </div>
              )}

              {/* Barra de navegación / Breadcrumb */}
              <div className="border-b border-border bg-muted/30 px-4 py-3 flex items-center gap-2">
                {historialCarpetas.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleVolverAtras}
                    className="gap-2 h-8"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Atrás
                  </Button>
                )}

                {/* Breadcrumb */}
                <div className="flex items-center gap-1 flex-1 overflow-x-auto">
                  {historialCarpetas.map((carpeta, index) => (
                    <React.Fragment key={index}>
                      {index > 0 && (
                        <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      )}
                      <button
                        onClick={() => handleIrACarpeta(index)}
                        className={`flex items-center gap-1.5 px-2 py-1 rounded text-sm transition-colors flex-shrink-0 ${
                          index === historialCarpetas.length - 1
                            ? 'text-foreground font-medium bg-accent/50'
                            : 'text-muted-foreground hover:text-foreground hover:bg-accent/30'
                        }`}
                      >
                        {index === 0 ? (
                          <Home className="w-4 h-4" />
                        ) : (
                          <Folder className="w-4 h-4" />
                        )}
                        <span className="truncate max-w-[150px]">{carpeta.nombre}</span>
                      </button>
                    </React.Fragment>
                  ))}
                </div>

                {/* Info de elementos */}
                <div className="text-xs text-muted-foreground whitespace-nowrap">
                  {carpetaActual === null ? (
                    <span>{carpetasTemporales.length} carpetas</span>
                  ) : (
                    (() => {
                      const carpetaActiva = getCarpetaById(carpetaActual);
                      const totalElementos = carpetaActiva 
                        ? carpetaActiva.subcarpetas.length + carpetaActiva.archivos.length
                        : 0;
                      return <span>{totalElementos} elementos</span>;
                    })()
                  )}
                </div>
              </div>

              {/* Vista de cuadrícula */}
              {renderGridView()}

              {/* Input de archivo oculto */}
              <input
                type="file"
                multiple
                onChange={handleFileInputChange}
                className="hidden"
                id="fileInput"
              />
            </CardContent>
          </Card>

          {/* Botón de subir todo */}
          {carpetasTemporales.length > 0 && selectedProyecto && (
            <Card>
              <CardContent className="p-4">
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isUploading}
                  className="w-full gap-2"
                  size="lg"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Subiendo todas las carpetas...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      Subir Todo al Proyecto
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar - Selector de Proyecto */}
        <div className="space-y-4">
          {/* Selector de Proyecto */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                Proyecto Destino
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Select value={selectedProyecto} onValueChange={setSelectedProyecto}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un proyecto" />
                  </SelectTrigger>
                  <SelectContent>
                    {proyectosCerrados.length === 0 ? (
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        No hay proyectos cerrados
                      </div>
                    ) : (
                      proyectosCerrados.map((proyecto) => (
                        <SelectItem key={proyecto.id} value={proyecto.id}>
                          {proyecto.nombre}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>

                {selectedProyecto && (
                  <div className="p-3 bg-accent/30 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <Building2 className="w-3 h-3" />
                      <span>{getEmpresaNombre(proyectosCerrados.find(p => p.id === selectedProyecto)?.empresaId || '')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      <span>
                        {new Date(
                          proyectosCerrados.find(p => p.id === selectedProyecto)?.fechaCreacion || new Date()
                        ).toLocaleDateString('es-ES')}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Resumen */}
          {carpetasTemporales.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <FolderOpen className="w-4 h-4" />
                  Resumen
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Carpetas:</span>
                    <span className="text-sm font-medium">
                      {(() => {
                        const contar = (carpetas: CarpetaTemporal[]): number => {
                          let total = 0;
                          for (const carpeta of carpetas) {
                            total++;
                            total += contar(carpeta.subcarpetas);
                          }
                          return total;
                        };
                        return contar(carpetasTemporales);
                      })()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Archivos:</span>
                    <span className="text-sm font-medium">
                      {(() => {
                        const contar = (carpetas: CarpetaTemporal[]): number => {
                          let total = 0;
                          for (const carpeta of carpetas) {
                            total += carpeta.archivos.length;
                            total += contar(carpeta.subcarpetas);
                          }
                          return total;
                        };
                        return contar(carpetasTemporales);
                      })()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Info */}
          <Card className="bg-accent/30">
            <CardContent className="p-4 text-xs text-muted-foreground space-y-2">
              <p className="font-medium text-foreground">Instrucciones:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Crea carpetas con clic derecho o con el botón</li>
                <li>Arrastra archivos a las carpetas</li>
                <li>Organiza tu estructura de carpetas</li>
                <li>Selecciona el proyecto y sube todo</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Menú Contextual */}
      {contextMenu && (
        <div
          className="fixed z-[100] bg-card border border-border rounded-lg shadow-lg py-1 min-w-[200px]"
          style={{
            left: `${contextMenu.x}px`,
            top: `${contextMenu.y}px`
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={handleOpenCreateFolderModal}
            className="w-full px-4 py-2 text-left text-sm hover:bg-accent transition-colors flex items-center gap-2 text-foreground"
          >
            <FolderPlus className="w-4 h-4 text-primary" />
            Nueva Carpeta
          </button>
        </div>
      )}

      {/* Modal de Crear Carpeta */}
      {isCreateFolderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={handleCloseCreateFolderModal}></div>
          <div className="relative z-50 w-full max-w-md mx-4">
            <Card className="border-primary/20 shadow-2xl">
              <CardHeader className="border-b border-border">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-primary">
                    <FolderPlus className="w-5 h-5" />
                    Crear Nueva Carpeta
                  </CardTitle>
                  <button
                    onClick={handleCloseCreateFolderModal}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </CardHeader>
              <form onSubmit={handleCreateFolder}>
                <CardContent className="p-6 space-y-4">
                  {/* Ubicación actual */}
                  <div className="bg-accent/30 border border-accent/50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1">Ubicación:</p>
                    <div className="flex items-center gap-1.5">
                      {carpetaActual ? (
                        <>
                          <Folder className="w-4 h-4 text-primary" />
                          <span className="text-sm font-medium text-foreground">
                            {getCarpetaById(carpetaActual)?.nombre || 'Carpeta'}
                          </span>
                        </>
                      ) : (
                        <>
                          <Home className="w-4 h-4 text-primary" />
                          <span className="text-sm font-medium text-foreground">Raíz</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nombreCarpeta">Nombre *</Label>
                    <Input
                      id="nombreCarpeta"
                      placeholder="Ej: Documentos Finales"
                      value={createFolderData.nombre}
                      onChange={(e) => setCreateFolderData({ ...createFolderData, nombre: e.target.value })}
                      required
                      autoFocus
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="descripcionCarpeta">Descripción (opcional)</Label>
                    <Input
                      id="descripcionCarpeta"
                      placeholder="Breve descripción de la carpeta"
                      value={createFolderData.descripcion}
                      onChange={(e) => setCreateFolderData({ ...createFolderData, descripcion: e.target.value })}
                    />
                  </div>
                </CardContent>
                <div className="border-t border-border p-6 flex justify-end gap-3">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleCloseCreateFolderModal}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" className="gap-2">
                    <FolderPlus className="w-4 h-4" />
                    Crear Carpeta
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

