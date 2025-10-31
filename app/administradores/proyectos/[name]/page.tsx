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
  Eye,
  X,
  Loader2,
  Edit2,
  UserPlus,
  ChevronRight,
  ChevronDown,
  UserMinus,
  MessageSquare,
  Activity,
  Sparkles
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
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

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.name as string;

  const [proyecto, setProyecto] = useState<any>(null);
  const [carpetas, setCarpetas] = useState<any[]>([]);
  const [archivos, setArchivos] = useState<any[]>([]);
  const [actividades, setActividades] = useState<any[]>([]);
  const [miembros, setMiembros] = useState<any[]>([]);
  const [empresa, setEmpresa] = useState<any>(null);
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
  const [allUsuarios, setAllUsuarios] = useState<any[]>([]);

  // Estados para vista en árbol
  const [openFolders, setOpenFolders] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadProjectData();
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
    setEmpresa(emp);

    // Cargar carpetas del proyecto
    const carpetas = carpetasStorage.find((carp: any) => carp.proyectoId === projectId);
    setCarpetas(carpetas);

    // Cargar archivos de las carpetas
    const carpetasIds = carpetas.map((c: any) => c.id);
    const archivosList = archivosStorage.find((arch: any) => carpetasIds.includes(arch.carpetaId));
    setArchivos(archivosList);

    // Cargar actividades del proyecto
    const actividadesList = actividadesStorage.find((act: any) => act.proyectoId === projectId);
    setActividades(actividadesList.sort((a: any, b: any) => 
      new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime()
    ));

    // Cargar miembros
    const miembrosList = proj.miembros || [];
    const usuariosCompletos = miembrosList.map((m: any) => {
      const usuario = usuariosProyectosStorage.getById(m.usuarioId);
      return { ...usuario, rolProyecto: m.rol };
    });
    setMiembros(usuariosCompletos.filter(Boolean));

    // Cargar todos los usuarios disponibles
    const usuarios = usuariosProyectosStorage.getAll().filter((u: any) => u.activo);
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
    } catch (error) {
      toast.error('Error al cerrar el proyecto');
    } finally {
      setLoading(false);
    }
  };

  const handleDescargarArchivo = (archivo: any) => {
    toast.success(`Descargando ${archivo.nombreOriginal}...`);
  };

  const handleOpenUploadModal = () => {
    if (proyecto.estado === 'cerrado') {
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

    // Verificar si el usuario ya está en el proyecto
    const miembrosIds = proyecto.miembros?.map((m: any) => m.usuarioId) || [];
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
        rol: memberFormData.rol,
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
      const miembrosActualizados = proyecto.miembros.map((m: any) => 
        m.usuarioId === usuarioId ? { ...m, rol: nuevoRol } : m
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
      const miembrosActualizados = proyecto.miembros.filter((m: any) => m.usuarioId !== usuarioId);
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

  // Función para toggle de carpeta abierta
  const toggleFolder = (carpetaId: string) => {
    setOpenFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(carpetaId)) {
        newSet.delete(carpetaId);
      } else {
        newSet.add(carpetaId);
      }
      return newSet;
    });
  };

  // Función para obtener carpetas raíz (sin padre)
  const getRootFolders = () => {
    return carpetas.filter((carpeta: any) => !carpeta.padreId);
  };

  // Función para renderizar carpeta simple con archivos
  const renderFolder = (carpeta: any) => {
    const isOpen = openFolders.has(carpeta.id);
    const archivosCarpeta = archivos.filter((arch: any) => arch.carpetaId === carpeta.id);

    return (
      <div key={carpeta.id} className="border border-border rounded-lg overflow-hidden">
        <Collapsible open={isOpen} onOpenChange={() => toggleFolder(carpeta.id)}>
          <CollapsibleTrigger className="w-full">
            <div className="flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors cursor-pointer">
              <div className="flex items-center gap-2">
                {isOpen ? (
                  <ChevronDown className="w-4 h-4 text-muted-foreground transition-transform" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-muted-foreground transition-transform" />
                )}
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Folder className="w-5 h-5 text-primary" />
                </div>
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-semibold text-foreground">{carpeta.nombre}</h3>
                {carpeta.descripcion && (
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                    {carpeta.descripcion}
                  </p>
                )}
              </div>
              <div className="text-right">
                <Badge variant="outline" className="text-xs">
                  {archivosCarpeta.length} {archivosCarpeta.length === 1 ? 'archivo' : 'archivos'}
                </Badge>
              </div>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="border-t border-border bg-muted/20">
              {archivosCarpeta.length > 0 ? (
                <div className="p-4 space-y-1">
                  {archivosCarpeta.map((archivo: any) => (
                    <div
                      key={archivo.id}
                      className="flex items-center gap-3 p-3 rounded-md hover:bg-background transition-colors cursor-pointer group border border-border/50"
                      onClick={() => handleDescargarArchivo(archivo)}
                    >
                      <FileText className="w-4 h-4 text-primary flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <span className="text-sm text-foreground truncate">{archivo.nombreOriginal}</span>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatSize(archivo.tamaño)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No hay archivos en esta carpeta</p>
                </div>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
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
              <div className="flex justify-end">
                <Button onClick={handleOpenUploadModal} className="gap-2">
                  <Upload className="w-4 h-4" />
                  Subir Archivo
                </Button>
              </div>
            )}

            {carpetas.length > 0 ? (
              <div className="space-y-2">
                {carpetas.map((carpeta: any) => renderFolder(carpeta))}
              </div>
            ) : (
              <div className="text-center py-16 text-muted-foreground">
                <div className="w-24 h-24 mx-auto mb-4 bg-primary/5 rounded-full flex items-center justify-center">
                  <Folder className="w-12 h-12 text-primary/50" />
                </div>
                <p className="text-lg font-medium mb-2">No hay carpetas en este proyecto</p>
                <p className="text-sm mb-6">Las carpetas aparecerán aquí cuando se creen</p>
              </div>
            )}
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
                {miembros.map((miembro: any) => (
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
                {actividades.map((actividad: any) => {
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
                            .filter((u: any) => !miembros.some((m: any) => m.id === u.id))
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

