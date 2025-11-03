'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft,
  FolderKanban,
  Download,
  Upload,
  Plus,
  MoreVertical,
  Lock,
  Clock,
  User,
  Users,
  FileText,
  Folder,
  File,
  Trash2,
  X,
  Loader2,
  Edit2,
  UserPlus,
  UserMinus,
  MessageSquare,
  Activity,
  Sparkles,
  ChevronRight,
  Home
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  proyectosStorage,
  carpetasStorage,
  archivosStorage,
  actividadesStorage,
  usuariosProyectosStorage,
  empresasStorage,
  initializeProjectData,
  generateProjectId,
  getCurrentTimestamp
} from '@/lib/projectStorage';
import { toast } from 'sonner';
import { getSession } from '@/lib/auth';
import { Proyecto, Carpeta, Archivo, Actividad, Empresa, Usuario } from '@/lib/projectTypes';

// Tipo extendido para miembros del proyecto
type UsuarioConRol = Usuario & { rolProyecto?: 'pm' | 'colaborador' | 'lector' };

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.name as string;

  const [proyecto, setProyecto] = useState<Proyecto | null>(null);
  const [carpetas, setCarpetas] = useState<Carpeta[]>([]);
  const [archivos, setArchivos] = useState<Archivo[]>([]);
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [miembros, setMiembros] = useState<UsuarioConRol[]>([]);
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Estados para el modal de subida
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadFormData, setUploadFormData] = useState({
    carpetaId: '',
    nombreOriginal: '',
    tipo: 'documento'
  });

  // Estados para el modal de miembros
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [memberLoading, setMemberLoading] = useState(false);
  const [memberFormData, setMemberFormData] = useState({
    usuarioId: '',
    rol: ''
  });
  const [allUsuarios, setAllUsuarios] = useState<Usuario[]>([]);

  // Estados para navegación de carpetas
  const [carpetaActual, setCarpetaActual] = useState<string | null>(null);
  const [historialCarpetas, setHistorialCarpetas] = useState<Array<{ id: string | null, nombre: string }>>([
    { id: null, nombre: 'Raíz' }
  ]);


  useEffect(() => {
    loadProjectData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const loadProjectData = () => {
    initializeProjectData();
    
    // Cargar proyecto
    const proj = proyectosStorage.getById(projectId);
    if (!proj) {
      toast.error('Proyecto no encontrado');
      router.push('/administradores/proyectos');
      return;
    }

    setProyecto(proj);

    // Cargar empresa
    const emp = empresasStorage.getById(proj.empresaId);
    setEmpresa(emp || null);

    // Cargar carpetas del proyecto
    const carpetasList = carpetasStorage.find((carp: Carpeta) => carp.proyectoId === projectId);
    setCarpetas(carpetasList);

    // Cargar archivos de las carpetas
    const carpetasIds = carpetasList.map((c: Carpeta) => c.id);
    const archivosList = archivosStorage.find((arch: Archivo) => carpetasIds.includes(arch.carpetaId));
    setArchivos(archivosList);

    // Cargar actividades del proyecto
    const actividadesList = actividadesStorage.find((act: Actividad) => act.proyectoId === projectId);
    setActividades(actividadesList.sort((a: Actividad, b: Actividad) => 
      new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime()
    ));

    // Cargar miembros
    const miembrosList = proj.miembros || [];
    const usuariosCompletos: UsuarioConRol[] = [];
    for (const m of miembrosList) {
      const usuario = usuariosProyectosStorage.getById(m.usuarioId);
      if (usuario) {
        usuariosCompletos.push({ ...usuario, rolProyecto: m.rol });
      }
    }
    setMiembros(usuariosCompletos);

    // Cargar todos los usuarios disponibles
    const usuarios = usuariosProyectosStorage.getAll().filter((u: Usuario) => u.activo);
    setAllUsuarios(usuarios);

    setLoading(false);
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'abierto':
        return <Badge className="bg-success/20 text-success border-success/30">Abierto</Badge>;
      case 'cerrado':
        return <Badge variant="secondary">Cerrado</Badge>;
      case 'aprobado':
        return <Badge className="bg-primary/20 text-primary border-primary/30">Aprobado</Badge>;
      default:
        return <Badge variant="secondary">{estado}</Badge>;
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleCerrarProyecto = async () => {
    if (!confirm('¿Estás seguro de cerrar este proyecto? Esto bloqueará todas las subidas.')) {
      return;
    }

    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 400));

    try {
      proyectosStorage.update(projectId, { 
        estado: 'cerrado',
        fechaCierre: new Date().toISOString()
      });
      
      toast.success('Proyecto cerrado exitosamente');
      loadProjectData();
    } catch {
      toast.error('Error al cerrar el proyecto');
    } finally {
      setLoading(false);
    }
  };

  const handleDescargarArchivo = (archivo: Archivo) => {
    toast.success(`Descargando ${archivo.nombreOriginal}...`);
  };

  const handleOpenUploadModal = () => {
    if (!proyecto || proyecto.estado === 'cerrado') {
      toast.error('No se pueden subir archivos a proyectos cerrados');
      return;
    }
    setIsUploadModalOpen(true);
  };

  const handleCloseUploadModal = () => {
    setIsUploadModalOpen(false);
    setUploadFormData({
      carpetaId: '',
      nombreOriginal: '',
      tipo: 'documento'
    });
    setUploadLoading(false);
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!uploadFormData.carpetaId || !uploadFormData.nombreOriginal) {
      toast.error('Por favor completa todos los campos obligatorios');
      return;
    }

    setUploadLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      const session = getSession();
      if (!session) {
        toast.error('No hay sesión activa');
        setUploadLoading(false);
        return;
      }

      // Generar extensión del archivo
      const extension = uploadFormData.nombreOriginal.split('.').pop() || 'file';
      const nombre = uploadFormData.nombreOriginal.replace(/\.[^/.]+$/, '').replace(/ /g, '_');
      const tipoMime = getMimeType(extension);
      
      // Generar tamaño aleatorio entre 100KB y 10MB
      const tamaño = Math.floor(Math.random() * (10 * 1024 * 1024 - 100 * 1024) + 100 * 1024);

      // Crear el archivo
      archivosStorage.create({
        id: generateProjectId('arch'),
        carpetaId: uploadFormData.carpetaId,
        nombre: nombre,
        nombreOriginal: uploadFormData.nombreOriginal,
        tipo: tipoMime,
        tamaño: tamaño,
        extension: extension,
        url: `/files/${nombre.toLowerCase()}.${extension}`,
        version: 1,
        estado: 'activo',
        subidoPor: session.userId || session.username,
        fechaSubida: getCurrentTimestamp(),
        fechaModificacion: getCurrentTimestamp()
      });

      // Crear actividad
      const usuario = usuariosProyectosStorage.getById(session.userId);
      actividadesStorage.create({
        id: generateProjectId('act'),
        proyectoId: projectId,
        tipo: 'archivo_subido',
        usuarioId: session.userId || session.username,
        descripcion: `${usuario ? usuario.nombre : 'Usuario'} subió ${uploadFormData.nombreOriginal}`,
        fechaCreacion: getCurrentTimestamp()
      });

      toast.success('Archivo subido exitosamente');
      handleCloseUploadModal();
      loadProjectData();
    } catch (error) {
      toast.error('Error al subir el archivo');
      console.error(error);
    } finally {
      setUploadLoading(false);
    }
  };

  const getMimeType = (extension: string) => {
    const mimeTypes: Record<string, string> = {
      'pdf': 'application/pdf',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'xls': 'application/vnd.ms-excel',
      'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'dwg': 'application/acad',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'txt': 'text/plain',
      'zip': 'application/zip',
      'rar': 'application/x-rar-compressed'
    };
    return mimeTypes[extension.toLowerCase()] || 'application/octet-stream';
  };

  // Handlers para gestión de miembros
  const handleOpenMemberModal = () => {
    setIsMemberModalOpen(true);
  };

  const handleCloseMemberModal = () => {
    setIsMemberModalOpen(false);
    setMemberFormData({
      usuarioId: '',
      rol: ''
    });
    setMemberLoading(false);
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!memberFormData.usuarioId || !memberFormData.rol) {
      toast.error('Por favor completa todos los campos obligatorios');
      return;
    }

    if (!proyecto) {
      toast.error('Proyecto no disponible');
      return;
    }

    // Verificar si el usuario ya está en el proyecto
    const miembrosIds = proyecto.miembros?.map((m) => m.usuarioId) || [];
    if (miembrosIds.includes(memberFormData.usuarioId)) {
      toast.error('Este usuario ya está en el equipo del proyecto');
      return;
    }

    setMemberLoading(true);
    await new Promise(resolve => setTimeout(resolve, 400));

    try {
      const session = getSession();
      if (!session) {
        toast.error('No hay sesión activa');
        setMemberLoading(false);
        return;
      }

      // Obtener área del usuario (primera disponible)
      const usuario = usuariosProyectosStorage.getById(memberFormData.usuarioId);
      const areas = usuario?.areasAsignadas || [];
      const areaId = areas.length > 0 ? areas[0] : '';

      // Agregar miembro al proyecto
      const nuevosMiembros = [...(proyecto.miembros || []), {
        usuarioId: memberFormData.usuarioId,
        rol: memberFormData.rol as 'pm' | 'colaborador' | 'lector',
        areaId: areaId,
        fechaAsignacion: getCurrentTimestamp()
      }];

      proyectosStorage.update(projectId, { miembros: nuevosMiembros });

      // Crear actividad
      const usuarioActual = usuariosProyectosStorage.getById(session.userId);
      actividadesStorage.create({
        id: generateProjectId('act'),
        proyectoId: projectId,
        tipo: 'miembro_agregado',
        usuarioId: session.userId || session.username,
        descripcion: `${usuarioActual ? usuarioActual.nombre : 'Usuario'} agregó a ${usuario?.nombre} ${usuario?.apellidos} al equipo como ${memberFormData.rol === 'pm' ? 'Jefe de Proyecto' : memberFormData.rol === 'colaborador' ? 'Colaborador' : 'Lector'}`,
        fechaCreacion: getCurrentTimestamp()
      });

      toast.success('Miembro agregado exitosamente');
      handleCloseMemberModal();
      loadProjectData();
    } catch (error) {
      toast.error('Error al agregar miembro');
      console.error(error);
    } finally {
      setMemberLoading(false);
    }
  };

  const handleChangeRol = async (usuarioId: string, nuevoRol: string) => {
    if (!proyecto) {
      toast.error('Proyecto no disponible');
      return;
    }

    setMemberLoading(true);
    await new Promise(resolve => setTimeout(resolve, 400));

    try {
      const session = getSession();
      if (!session) {
        toast.error('No hay sesión activa');
        setMemberLoading(false);
        return;
      }

      // Actualizar rol del miembro
      const miembrosActualizados = proyecto.miembros.map((m) => 
        m.usuarioId === usuarioId ? { ...m, rol: nuevoRol as 'pm' | 'colaborador' | 'lector' } : m
      );

      proyectosStorage.update(projectId, { miembros: miembrosActualizados });

      // Crear actividad
      const usuario = usuariosProyectosStorage.getById(usuarioId);
      const usuarioActual = usuariosProyectosStorage.getById(session.userId);
      actividadesStorage.create({
        id: generateProjectId('act'),
        proyectoId: projectId,
        tipo: 'comentario',
        usuarioId: session.userId || session.username,
        descripcion: `${usuarioActual ? usuarioActual.nombre : 'Usuario'} cambió el rol de ${usuario?.nombre} ${usuario?.apellidos} a ${nuevoRol === 'pm' ? 'Jefe de Proyecto' : nuevoRol === 'colaborador' ? 'Colaborador' : 'Lector'}`,
        fechaCreacion: getCurrentTimestamp()
      });

      toast.success('Rol actualizado exitosamente');
      loadProjectData();
    } catch (error) {
      toast.error('Error al actualizar rol');
      console.error(error);
    } finally {
      setMemberLoading(false);
    }
  };

  const handleRemoveMember = async (usuarioId: string) => {
    if (!proyecto) {
      toast.error('Proyecto no disponible');
      return;
    }

    if (!confirm('¿Estás seguro de remover a este miembro del proyecto?')) {
      return;
    }

    setMemberLoading(true);
    await new Promise(resolve => setTimeout(resolve, 400));

    try {
      const session = getSession();
      if (!session) {
        toast.error('No hay sesión activa');
        setMemberLoading(false);
        return;
      }

      // Remover miembro del proyecto
      const miembrosActualizados = proyecto.miembros.filter((m) => m.usuarioId !== usuarioId);
      proyectosStorage.update(projectId, { miembros: miembrosActualizados });

      // Crear actividad
      const usuario = usuariosProyectosStorage.getById(usuarioId);
      const usuarioActual = usuariosProyectosStorage.getById(session.userId);
      actividadesStorage.create({
        id: generateProjectId('act'),
        proyectoId: projectId,
        tipo: 'comentario',
        usuarioId: session.userId || session.username,
        descripcion: `${usuarioActual ? usuarioActual.nombre : 'Usuario'} removió a ${usuario?.nombre} ${usuario?.apellidos} del equipo`,
        fechaCreacion: getCurrentTimestamp()
      });

      toast.success('Miembro removido exitosamente');
      loadProjectData();
    } catch (error) {
      toast.error('Error al remover miembro');
      console.error(error);
    } finally {
      setMemberLoading(false);
    }
  };

  // Funciones para mejorar UX/UI de actividad
  const getActivityIcon = (tipo: string) => {
    switch (tipo) {
      case 'miembro_agregado':
        return UserPlus;
      case 'miembro_removido':
        return UserMinus;
      case 'archivo_subido':
        return Upload;
      case 'comentario':
        return MessageSquare;
      default:
        return Activity;
    }
  };

  const getActivityColor = (tipo: string) => {
    switch (tipo) {
      case 'miembro_agregado':
        return 'bg-success/10 text-success border-success/20';
      case 'miembro_removido':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'archivo_subido':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'comentario':
        return 'bg-info/10 text-info border-info/20';
      default:
        return 'bg-accent/50 text-foreground border-border';
    }
  };

  const getActivityBadge = (tipo: string) => {
    switch (tipo) {
      case 'miembro_agregado':
        return { text: 'Equipo', color: 'bg-success/20 text-success border-success/30' };
      case 'miembro_removido':
        return { text: 'Equipo', color: 'bg-destructive/20 text-destructive border-destructive/30' };
      case 'archivo_subido':
        return { text: 'Archivo', color: 'bg-primary/20 text-primary border-primary/30' };
      case 'comentario':
        return { text: 'Comentario', color: 'bg-info/20 text-info border-info/30' };
      default:
        return { text: 'Actividad', color: 'bg-muted text-foreground border-border' };
    }
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - past.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Justo ahora';
    if (diffInMinutes < 60) return `Hace ${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `Hace ${Math.floor(diffInMinutes / 60)}h`;
    return formatDate(timestamp);
  };


  // Función para obtener el icono según la extensión del archivo
  const getFileIcon = (nombreArchivo: string) => {
    const extension = nombreArchivo.split('.').pop()?.toLowerCase();
    
    // Carpetas y archivos especiales
    if (!extension || extension === nombreArchivo.toLowerCase()) {
      return <Folder className="w-12 h-12 text-[#fbbf24]" />; // amarillo para carpetas
    }
    
    // Documentos
    if (['doc', 'docx'].includes(extension)) {
      return <FileText className="w-12 h-12 text-[#2563eb]" />; // azul para Word
    }
    
    if (['pdf'].includes(extension)) {
      return <FileText className="w-12 h-12 text-[#dc2626]" />; // rojo para PDF
    }
    
    if (['xls', 'xlsx'].includes(extension)) {
      return <FileText className="w-12 h-12 text-[#059669]" />; // verde para Excel
    }
    
    if (['txt'].includes(extension)) {
      return <FileText className="w-12 h-12 text-[#6b7280]" />; // gris para texto
    }
    
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(extension)) {
      return <FileText className="w-12 h-12 text-[#8b5cf6]" />; // púrpura para imágenes
    }
    
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(extension)) {
      return <FileText className="w-12 h-12 text-[#f59e0b]" />; // naranja para comprimidos
    }
    
    if (['dwg', 'dxf'].includes(extension)) {
      return <FileText className="w-12 h-12 text-[#06b6d4]" />; // cyan para CAD
    }
    
    // Default
    return <FileText className="w-12 h-12 text-muted-foreground" />;
  };

  // Función para navegar a una carpeta
  const handleAbrirCarpeta = (carpeta: Carpeta) => {
    setCarpetaActual(carpeta.id);
    setHistorialCarpetas(prev => [...prev, { id: carpeta.id, nombre: carpeta.nombre }]);
  };

  // Función para volver a la carpeta anterior
  const handleVolverAtras = () => {
    if (historialCarpetas.length > 1) {
      const nuevoHistorial = [...historialCarpetas];
      nuevoHistorial.pop();
      setHistorialCarpetas(nuevoHistorial);
      const carpetaAnterior = nuevoHistorial[nuevoHistorial.length - 1];
      setCarpetaActual(carpetaAnterior.id);
    }
  };

  // Función para ir a una carpeta específica del breadcrumb
  const handleIrACarpeta = (index: number) => {
    const nuevoHistorial = historialCarpetas.slice(0, index + 1);
    setHistorialCarpetas(nuevoHistorial);
    const carpetaDestino = nuevoHistorial[nuevoHistorial.length - 1];
    setCarpetaActual(carpetaDestino.id);
  };

  // Función para renderizar vista de cuadrícula estilo Windows Explorer
  const renderGridView = () => {
    // Filtrar carpetas y archivos según la carpeta actual
    let carpetasFiltradas: Carpeta[];
    let archivosFiltrados: Archivo[];

    if (carpetaActual === null) {
      // Mostrar carpetas raíz (sin padre) y archivos sin carpeta
      carpetasFiltradas = carpetas.filter(c => !c.padreId);
      archivosFiltrados = [];
    } else {
      // Mostrar subcarpetas y archivos de la carpeta actual
      carpetasFiltradas = carpetas.filter(c => c.padreId === carpetaActual);
      archivosFiltrados = archivos.filter(a => a.carpetaId === carpetaActual);
    }

    // Combinar carpetas y archivos
    const items: Array<{ type: 'folder' | 'file', data: Carpeta | Archivo }> = [
      ...carpetasFiltradas.map(c => ({ type: 'folder' as const, data: c })),
      ...archivosFiltrados.map(a => ({ type: 'file' as const, data: a }))
    ];

    if (items.length === 0) {
      return (
        <div className="text-center py-16 text-muted-foreground">
          <div className="w-24 h-24 mx-auto mb-4 bg-primary/5 rounded-full flex items-center justify-center">
            <Folder className="w-12 h-12 text-primary/50" />
          </div>
          <p className="text-lg font-medium mb-2">
            {carpetaActual ? 'Esta carpeta está vacía' : 'No hay carpetas ni archivos en este proyecto'}
          </p>
          <p className="text-sm mb-6">
            {carpetaActual ? 'No hay elementos en esta carpeta' : 'Los archivos aparecerán aquí cuando se suban'}
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-4 p-6">
        {items.map((item) => {
          if (item.type === 'folder') {
            const carpeta = item.data as Carpeta;
            const archivosCarpeta = archivos.filter(a => a.carpetaId === carpeta.id);
            const subcarpetas = carpetas.filter(c => c.padreId === carpeta.id);
            const totalElementos = archivosCarpeta.length + subcarpetas.length;
            
            return (
              <div
                key={`folder-${carpeta.id}`}
                className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-accent/50 transition-all cursor-pointer group"
                onClick={() => handleAbrirCarpeta(carpeta)}
              >
                <div className="w-16 h-16 flex items-center justify-center">
                  <Folder className="w-14 h-14 text-[#fbbf24] group-hover:scale-110 transition-transform" />
                </div>
                <div className="text-center w-full">
                  <p className="text-xs text-foreground font-medium truncate px-1">
                    {carpeta.nombre}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {totalElementos} {totalElementos === 1 ? 'elemento' : 'elementos'}
                  </p>
                </div>
              </div>
            );
          } else {
            const archivo = item.data as Archivo;
            
            return (
              <div
                key={`file-${archivo.id}`}
                className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-accent/50 transition-all cursor-pointer group"
                onClick={() => handleDescargarArchivo(archivo)}
              >
                <div className="w-16 h-16 flex items-center justify-center">
                  {getFileIcon(archivo.nombreOriginal)}
                </div>
                <div className="text-center w-full">
                  <p className="text-xs text-foreground font-medium truncate px-1" title={archivo.nombreOriginal}>
                    {archivo.nombreOriginal}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {formatSize(archivo.tamaño)}
                  </p>
                </div>
              </div>
            );
          }
        })}
      </div>
    );
  };

  if (loading || !proyecto) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 py-6">
        {/* Header con Botón Volver */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push('/administradores/proyectos')}
            className="mb-4 gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a Proyectos
          </Button>
        </div>

        {/* Cabecera del Proyecto */}
        <div className="bg-card border border-border rounded-xl p-6 mb-6 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center">
                <FolderKanban className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
                  {proyecto.nombre}
                </h1>
                <p className="text-sm text-muted-foreground mb-2">
                  {empresa?.nombre || 'Empresa desconocida'}
                </p>
                {proyecto.descripcion && (
                  <p className="text-base text-foreground">{proyecto.descripcion}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              {getEstadoBadge(proyecto.estado)}
              {proyecto.estado === 'abierto' && (
                <Button
                  variant="outline"
                  onClick={handleCerrarProyecto}
                  disabled={loading}
                  className="gap-2"
                >
                  <Lock className="w-4 h-4" />
                  Cerrar Proyecto
                </Button>
              )}
              <Button variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                Descargar Todo
              </Button>
            </div>
          </div>

          {/* Info adicional */}
          <div className="flex flex-wrap gap-6 text-sm text-muted-foreground pt-4 border-t border-border">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Creado: {formatDate(proyecto.fechaCreacion)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>{miembros.length} {miembros.length === 1 ? 'miembro' : 'miembros'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Folder className="w-4 h-4" />
              <span>{carpetas.length} {carpetas.length === 1 ? 'carpeta' : 'carpetas'}</span>
            </div>
            <div className="flex items-center gap-2">
              <File className="w-4 h-4" />
              <span>{archivos.length} {archivos.length === 1 ? 'archivo' : 'archivos'}</span>
            </div>
          </div>
        </div>

        {/* Pestañas */}
        <Tabs defaultValue="carpetas" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="carpetas" className="gap-2">
              <Folder className="w-4 h-4" />
              Carpetas / Archivos
            </TabsTrigger>
            <TabsTrigger value="equipo" className="gap-2">
              <Users className="w-4 h-4" />
              Equipo ({miembros.length})
            </TabsTrigger>
            <TabsTrigger value="actividad" className="gap-2">
              <Clock className="w-4 h-4" />
              Actividad
            </TabsTrigger>
          </TabsList>

          {/* Tab Carpetas / Archivos */}
          <TabsContent value="carpetas" className="space-y-4">
            {proyecto.estado === 'cerrado' && (
              <div className="bg-warning/10 border border-warning/20 text-warning px-4 py-3 rounded-xl flex items-center gap-3">
                <Lock className="h-4 w-4" />
                <span className="text-sm font-medium">
                  Este proyecto está cerrado. No se pueden subir nuevos archivos.
                </span>
              </div>
            )}

            {/* Botón de subir archivo */}
            {proyecto.estado !== 'cerrado' && carpetas.length > 0 && (
              <div className="flex justify-end px-6">
                <Button onClick={handleOpenUploadModal} className="gap-2">
                  <Upload className="w-4 h-4" />
                  Subir Archivo
                </Button>
              </div>
            )}

            {/* Vista de cuadrícula estilo Windows Explorer */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              {/* Barra de navegación / Breadcrumb */}
              <div className="border-b border-border bg-muted/30 px-4 py-3 flex items-center gap-2">
                {/* Botón volver atrás */}
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
                    <span>{carpetas.filter(c => !c.padreId).length} carpetas</span>
                  ) : (
                    <span>
                      {carpetas.filter(c => c.padreId === carpetaActual).length + 
                       archivos.filter(a => a.carpetaId === carpetaActual).length} elementos
                    </span>
                  )}
                </div>
              </div>

              {/* Contenido de archivos y carpetas */}
              {renderGridView()}
            </div>
          </TabsContent>

          {/* Tab Equipo */}
          <TabsContent value="equipo" className="space-y-4">
            {/* Botón de agregar miembro */}
            <div className="flex justify-end">
              <Button onClick={handleOpenMemberModal} className="gap-2">
                <UserPlus className="w-4 h-4" />
                Agregar Miembro
              </Button>
            </div>

            {miembros.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {miembros.map((miembro: UsuarioConRol) => (
                  <Card key={miembro.id} className="border-primary/20 hover:border-primary/40 transition-all">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground">
                            {miembro.nombre} {miembro.apellidos}
                          </h3>
                          <p className="text-xs text-muted-foreground">@{miembro.username}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              {miembro.rolProyecto === 'pm' ? 'Jefe de Proyecto' : 
                               miembro.rolProyecto === 'colaborador' ? 'Colaborador' : 'Lector'}
                            </Badge>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuSub>
                              <DropdownMenuSubTrigger>
                                <Edit2 className="mr-2 h-4 w-4" />
                                Cambiar Rol
                              </DropdownMenuSubTrigger>
                              <DropdownMenuSubContent>
                                <DropdownMenuItem onClick={() => handleChangeRol(miembro.id, 'pm')}>
                                  Jefe de Proyecto
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleChangeRol(miembro.id, 'colaborador')}>
                                  Colaborador
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleChangeRol(miembro.id, 'lector')}>
                                  Lector
                                </DropdownMenuItem>
                              </DropdownMenuSubContent>
                            </DropdownMenuSub>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-destructive focus:text-destructive"
                              onClick={() => handleRemoveMember(miembro.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Remover del Proyecto
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 text-muted-foreground">
                <div className="w-24 h-24 mx-auto mb-4 bg-primary/5 rounded-full flex items-center justify-center">
                  <Users className="w-12 h-12 text-primary/50" />
                </div>
                <p className="text-lg font-medium mb-2">No hay miembros en este proyecto</p>
                <p className="text-sm mb-6">Los miembros del equipo aparecerán aquí</p>
                <Button onClick={handleOpenMemberModal} className="gap-2">
                  <UserPlus className="w-4 h-4" />
                  Agregar Primer Miembro
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Tab Actividad */}
          <TabsContent value="actividad" className="space-y-4">
            {actividades.length > 0 ? (
              <div className="space-y-4">
                {actividades.map((actividad: Actividad) => {
                  const usuario = usuariosProyectosStorage.getById(actividad.usuarioId);
                  const ActivityIcon = getActivityIcon(actividad.tipo);
                  const activityColors = getActivityColor(actividad.tipo);
                  const activityBadge = getActivityBadge(actividad.tipo);

                  return (
                    <Card key={actividad.id} className={`border-l-4 ${activityColors} hover:shadow-md transition-all`}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          {/* Icono con fondo distintivo */}
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 border-2 ${activityColors.split(' ')[2]}`}>
                            <ActivityIcon className="w-6 h-6" />
                          </div>

                          {/* Contenido principal */}
                          <div className="flex-1 min-w-0 space-y-2">
                            {/* Descripción principal */}
                            <p className="text-base font-medium text-foreground leading-relaxed">
                              {actividad.descripcion}
                            </p>

                            {/* Footer con metadata */}
                            <div className="flex items-center gap-3 flex-wrap">
                              {/* Avatar del usuario */}
                              {usuario && (
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20">
                                    <User className="w-4 h-4 text-primary" />
                                  </div>
                                  <span className="text-sm font-medium text-foreground">
                                    {usuario.nombre} {usuario.apellidos}
                                  </span>
                                </div>
                              )}

                              {/* Separador */}
                              <div className="h-4 w-px bg-border" />

                              {/* Badge de tipo */}
                              <Badge variant="outline" className={activityBadge.color}>
                                {activityBadge.text}
                              </Badge>

                              {/* Tiempo */}
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground ml-auto">
                                <Clock className="w-3.5 h-3.5" />
                                {getTimeAgo(actividad.fechaCreacion)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-20 text-muted-foreground">
                <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full flex items-center justify-center relative">
                  <Activity className="w-16 h-16 text-primary/30 absolute" />
                  <Sparkles className="w-8 h-8 text-primary/50 absolute -top-2 -right-2 animate-pulse" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Sin actividad aún</h3>
                <p className="text-sm max-w-md mx-auto">
                  Las acciones del equipo aparecerán aquí cuando se agreguen miembros, 
                  suban archivos o realicen cambios en el proyecto
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Modal de Agregar Miembro */}
        {isMemberModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={handleCloseMemberModal}></div>
            <div className="relative z-50 w-full max-w-2xl mx-4">
              <Card className="border-primary/20 shadow-2xl">
                <CardHeader className="border-b border-border">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-primary">
                      <UserPlus className="w-5 h-5" />
                      Agregar Miembro al Proyecto
                    </CardTitle>
                    <button
                      onClick={handleCloseMemberModal}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </CardHeader>
                <form onSubmit={handleAddMember}>
                  <CardContent className="p-6 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="usuario">Usuario *</Label>
                      <Select
                        value={memberFormData.usuarioId}
                        onValueChange={(value) => setMemberFormData({ ...memberFormData, usuarioId: value })}
                        required
                      >
                        <SelectTrigger id="usuario" disabled={memberLoading}>
                          <SelectValue placeholder="Seleccionar usuario" />
                        </SelectTrigger>
                        <SelectContent>
                          {allUsuarios
                            .filter((u: Usuario) => !miembros.some((m: Usuario) => m.id === u.id))
                            .map((usuario) => (
                              <SelectItem key={usuario.id} value={usuario.id}>
                                {usuario.nombre} {usuario.apellidos} (@{usuario.username})
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="rol">Rol en el Proyecto *</Label>
                      <Select
                        value={memberFormData.rol}
                        onValueChange={(value) => setMemberFormData({ ...memberFormData, rol: value })}
                        required
                      >
                        <SelectTrigger id="rol" disabled={memberLoading}>
                          <SelectValue placeholder="Seleccionar rol" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pm">Jefe de Proyecto</SelectItem>
                          <SelectItem value="colaborador">Colaborador</SelectItem>
                          <SelectItem value="lector">Lector</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="bg-accent/30 border border-accent/50 rounded-xl p-4">
                      <p className="text-sm text-muted-foreground">
                        <strong className="text-foreground">Nota:</strong> El usuario será agregado al equipo con el rol seleccionado.
                      </p>
                    </div>
                  </CardContent>
                  <div className="border-t border-border p-6 flex justify-end gap-3">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={handleCloseMemberModal} 
                      disabled={memberLoading}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={memberLoading} className="gap-2">
                      {memberLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Agregando...
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4" />
                          Agregar Miembro
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Card>
            </div>
          </div>
        )}

        {/* Modal de Subida de Archivos */}
        {isUploadModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={handleCloseUploadModal}></div>
            <div className="relative z-50 w-full max-w-2xl mx-4">
              <Card className="border-primary/20 shadow-2xl">
                <CardHeader className="border-b border-border">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-primary">
                      <Upload className="w-5 h-5" />
                      Subir Archivo
                    </CardTitle>
                    <button
                      onClick={handleCloseUploadModal}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </CardHeader>
                <form onSubmit={handleUploadSubmit}>
                  <CardContent className="p-6 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="carpeta">Carpeta Destino *</Label>
                      <Select
                        value={uploadFormData.carpetaId}
                        onValueChange={(value) => setUploadFormData({ ...uploadFormData, carpetaId: value })}
                        required
                      >
                        <SelectTrigger id="carpeta" disabled={uploadLoading}>
                          <SelectValue placeholder="Seleccionar carpeta" />
                        </SelectTrigger>
                        <SelectContent>
                          {carpetas.map((carpeta) => (
                            <SelectItem key={carpeta.id} value={carpeta.id}>
                              {carpeta.nombre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="nombreArchivo">Nombre del Archivo *</Label>
                      <Input
                        id="nombreArchivo"
                        placeholder="Ej: Documento_Importante.pdf"
                        value={uploadFormData.nombreOriginal}
                        onChange={(e) => setUploadFormData({ ...uploadFormData, nombreOriginal: e.target.value })}
                        required
                        disabled={uploadLoading}
                      />
                      <p className="text-xs text-muted-foreground">
                        Incluye la extensión del archivo (ej: .pdf, .docx, .xlsx)
                      </p>
                    </div>

                    <div className="bg-accent/30 border border-accent/50 rounded-xl p-4">
                      <p className="text-sm text-muted-foreground">
                        <strong className="text-foreground">Nota:</strong> Esta es una simulación.
                        El archivo no se subirá físicamente, pero se agregará a la lista del proyecto.
                      </p>
                    </div>
                  </CardContent>
                  <div className="border-t border-border p-6 flex justify-end gap-3">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={handleCloseUploadModal} 
                      disabled={uploadLoading}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={uploadLoading} className="gap-2">
                      {uploadLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Subiendo...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          Subir Archivo
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

