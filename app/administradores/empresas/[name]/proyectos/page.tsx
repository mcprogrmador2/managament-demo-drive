'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Briefcase, 
  FolderKanban,
  Plus, 
  Loader2,
  X,
  ArrowLeft,
  Building2,
  User,
  Search,
  Users,
  Filter,
  Calendar,
  Eye,
  ArrowUpRight,
  CheckCircle2,
  Lock,
  Edit2,
  Trash2,
  ChevronDown
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { 
  proyectosStorage,
  empresasStorage,
  areasStorage,
  usuariosProyectosStorage,
  initializeProjectData,
  generateProjectId,
  getCurrentTimestamp
} from '@/lib/projectStorage';
import { getSession } from '@/lib/auth';
import { toast } from 'sonner';
import { Proyecto, Empresa, Usuario, Area } from '@/lib/projectTypes';

export default function EmpresaProyectosPage() {
  const params = useParams();
  const router = useRouter();
  const empresaId = params.name as string;

  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [areas, setAreas] = useState<Area[]>([]);
  const [allProyectos, setAllProyectos] = useState<Proyecto[]>([]);
  const [filteredProyectos, setFilteredProyectos] = useState<Proyecto[]>([]);
  const [pms, setPms] = useState<Usuario[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    pmId: '',
    areasAsociadas: [] as string[]
  });

  const loadData = useCallback(() => {
    initializeProjectData();
    
    // Cargar empresa
    const empresaData = empresasStorage.getById(empresaId);
    if (empresaData) {
      setEmpresa(empresaData);

      // Cargar áreas de la empresa
      const areasData = areasStorage.find((area: Area) => area.empresaId === empresaId);
      setAreas(areasData);

      // Cargar proyectos de la empresa
      const allProjects = proyectosStorage.find((proyecto: Proyecto) => proyecto.empresaId === empresaId);
      setAllProyectos(allProjects);
      setFilteredProyectos(allProjects);

      // Cargar PMs y usuarios
      setPms(usuariosProyectosStorage.getAll().filter((u: Usuario) => u.rol === 'pm' && u.activo));
      setUsuarios(usuariosProyectosStorage.getAll());
      
      setLoading(false);
    } else {
      setLoading(false);
      router.push('/administradores/empresas');
    }
  }, [empresaId, router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filtrar proyectos cuando cambian los filtros
  useEffect(() => {
    let filtered = allProyectos;

    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por estado
    if (filtroEstado !== 'todos') {
      filtered = filtered.filter(p => p.estado === filtroEstado);
    }

    setFilteredProyectos(filtered);
  }, [searchTerm, filtroEstado, allProyectos]);

  const handleOpenModal = () => {
    setIsEditMode(false);
    setEditingProjectId(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setEditingProjectId(null);
    setFormData({
      nombre: '',
      descripcion: '',
      pmId: '',
      areasAsociadas: []
    });
    setLoading(false);
  };

  const handleEdit = (proyecto: Proyecto) => {
    setIsEditMode(true);
    setEditingProjectId(proyecto.id);
    setFormData({
      nombre: proyecto.nombre,
      descripcion: proyecto.descripcion || '',
      pmId: proyecto.pmId,
      areasAsociadas: proyecto.areasAsociadas
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (proyectoId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este proyecto?')) {
      return;
    }

    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300));

    try {
      proyectosStorage.delete(proyectoId);
      toast.success('Proyecto eliminado exitosamente');
      loadData();
    } catch (error) {
      toast.error('Error al eliminar el proyecto');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nombre || !formData.pmId || formData.areasAsociadas.length === 0) {
      toast.error('Por favor completa todos los campos obligatorios');
      return;
    }

    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, isEditMode ? 350 : 400));

    try {
      const session = getSession();
      if (!session) {
        toast.error('No hay sesión activa');
        setLoading(false);
        return;
      }

      if (isEditMode) {
        // Actualizar proyecto existente
        proyectosStorage.update(editingProjectId!, {
          nombre: formData.nombre,
          descripcion: formData.descripcion || undefined,
          pmId: formData.pmId,
          areasAsociadas: formData.areasAsociadas
        });
        toast.success('Proyecto actualizado exitosamente');
      } else {
        // Crear nuevo proyecto
        proyectosStorage.create({
          id: generateProjectId('proj'),
          nombre: formData.nombre,
          descripcion: formData.descripcion || undefined,
          empresaId: empresaId,
          areasAsociadas: formData.areasAsociadas,
          estado: 'abierto',
          pmId: formData.pmId,
          miembros: [],
          fechaInicio: getCurrentTimestamp(),
          fechaCreacion: getCurrentTimestamp(),
          creadoPor: session.username
        });
        toast.success('Proyecto creado exitosamente');
      }

      handleCloseModal();
      loadData();
    } catch (error) {
      toast.error(`Error al ${isEditMode ? 'actualizar' : 'crear'} el proyecto`);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const toggleArea = (areaId: string) => {
    setFormData(prev => ({
      ...prev,
      areasAsociadas: prev.areasAsociadas.includes(areaId)
        ? prev.areasAsociadas.filter(id => id !== areaId)
        : [...prev.areasAsociadas, areaId]
    }));
  };

  const handleEstadoChange = async (proyectoId: string, nuevoEstado: string) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300));

    try {
      const updateData: Partial<Proyecto> = {
        estado: nuevoEstado as 'abierto' | 'cerrado' | 'aprobado'
      };

      // Si se cierra o aprueba el proyecto, agregar fecha de cierre
      if (nuevoEstado === 'cerrado' || nuevoEstado === 'aprobado') {
        updateData.fechaCierre = getCurrentTimestamp();
      }

      proyectosStorage.update(proyectoId, updateData);
      toast.success('Estado actualizado exitosamente');
      loadData();
    } catch (error) {
      toast.error('Error al actualizar el estado');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getPMNombre = (pmId: string) => {
    const pm = pms.find((p: Usuario) => p.id === pmId);
    return pm ? `${pm.nombre} ${pm.apellidos}` : 'Sin PM';
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

  const getAreaNombre = (areaId: string) => {
    const area = areas.find((a: Area) => a.id === areaId);
    return area?.nombre || 'Sin área';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (loading && !empresa) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 py-6">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/administradores/empresas/${empresaId}`)}
            className="gap-2 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a Empresa
          </Button>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <FolderKanban className="w-8 h-8 text-primary" />
                Proyectos
              </h1>
              <p className="text-sm text-muted-foreground">
                {empresa && `Gestiona los proyectos de ${empresa.nombre}`}
              </p>
            </div>
            <Button onClick={handleOpenModal} className="gap-2">
              <Plus className="w-4 h-4" />
              Nuevo Proyecto
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <FolderKanban className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{filteredProyectos.length}</p>
                  <p className="text-xs text-muted-foreground">Total proyectos</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {filteredProyectos.filter(p => p.estado === 'abierto').length}
                  </p>
                  <p className="text-xs text-muted-foreground">Abiertos</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-500/10 rounded-xl flex items-center justify-center">
                  <Lock className="w-6 h-6 text-gray-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {filteredProyectos.filter(p => p.estado === 'cerrado').length}
                  </p>
                  <p className="text-xs text-muted-foreground">Cerrados</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {filteredProyectos.reduce((acc, p) => acc + (p.miembros?.length || 0), 0)}
                  </p>
                  <p className="text-xs text-muted-foreground">Miembros totales</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6 border-primary/20">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Buscar por nombre o descripción..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filtroEstado} onValueChange={setFiltroEstado}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los estados</SelectItem>
                  <SelectItem value="abierto">Abiertos</SelectItem>
                  <SelectItem value="cerrado">Cerrados</SelectItem>
                  <SelectItem value="aprobado">Aprobados</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Listado de Proyectos */}
        {filteredProyectos.length > 0 ? (
          <Card className="border-primary/20 shadow-sm">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-border/50">
                    <TableHead className="font-semibold text-foreground">Proyecto</TableHead>
                    <TableHead className="font-semibold text-foreground">Jefe de Proyecto</TableHead>
                    <TableHead className="font-semibold text-foreground">Áreas</TableHead>
                    <TableHead className="font-semibold text-foreground">Miembros</TableHead>
                    <TableHead className="font-semibold text-foreground">Estado</TableHead>
                    <TableHead className="font-semibold text-foreground">Fecha</TableHead>
                    <TableHead className="font-semibold text-foreground text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProyectos.map((proyecto) => (
                    <TableRow key={proyecto.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium text-foreground">
                            {proyecto.nombre}
                          </p>
                          {proyecto.descripcion && (
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {proyecto.descripcion}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{getPMNombre(proyecto.pmId)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {proyecto.areasAsociadas && proyecto.areasAsociadas.length > 0 ? (
                            proyecto.areasAsociadas.slice(0, 2).map((areaId) => (
                              <Badge key={areaId} variant="outline" className="text-xs">
                                {getAreaNombre(areaId)}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-xs text-muted-foreground">Sin áreas</span>
                          )}
                          {proyecto.areasAsociadas && proyecto.areasAsociadas.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{proyecto.areasAsociadas.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{proyecto.miembros?.length || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-[140px] justify-between"
                              disabled={loading}
                            >
                              <span className="flex-1 text-left">
                                {proyecto.estado === 'abierto' && 'Abierto'}
                                {proyecto.estado === 'cerrado' && 'Cerrado'}
                                {proyecto.estado === 'aprobado' && 'Aprobado'}
                              </span>
                              <ChevronDown className="h-4 w-4 opacity-50" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start" className="w-[140px]">
                            <DropdownMenuItem onClick={() => handleEstadoChange(proyecto.id, 'abierto')}>
                              Abierto
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEstadoChange(proyecto.id, 'cerrado')}>
                              Cerrado
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEstadoChange(proyecto.id, 'aprobado')}>
                              Aprobado
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {formatDate(proyecto.fechaCreacion)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => router.push(`/administradores/proyectos/${proyecto.id}`)}
                            className="h-8 w-8 p-0"
                          >
                            <Eye className="w-4 h-4 text-primary" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(proyecto)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit2 className="w-4 h-4 text-primary" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(proyecto.id)}
                            className="h-8 w-8 p-0"
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-dashed border-2 border-primary/20">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <FolderKanban className="w-8 h-8 text-primary/50" />
              </div>
              <p className="text-muted-foreground font-medium mb-2">
                {searchTerm || filtroEstado !== 'todos' ? 'No se encontraron proyectos' : 'No hay proyectos registrados'}
              </p>
              <p className="text-sm text-muted-foreground">
                {searchTerm || filtroEstado !== 'todos' 
                  ? 'Intenta ajustar los filtros de búsqueda' 
                  : 'Empieza agregando proyectos a esta empresa'}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Modal de Creación/Edición */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={handleCloseModal}></div>
            <div className="relative z-50 w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
              <Card className="border-primary/20 shadow-2xl">
                <CardHeader className="border-b border-border">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-primary">
                      {isEditMode ? (
                        <>
                          <Edit2 className="w-5 h-5" />
                          Editar Proyecto
                        </>
                      ) : (
                        <>
                          <Plus className="w-5 h-5" />
                          Nuevo Proyecto
                        </>
                      )}
                    </CardTitle>
                    <button
                      onClick={handleCloseModal}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                  <CardContent className="p-6 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="nombre">Nombre del Proyecto *</Label>
                      <Input
                        id="nombre"
                        placeholder="Ej: Implementación de Sistema ERP"
                        value={formData.nombre}
                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                        required
                        disabled={loading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="descripcion">Descripción</Label>
                      <Textarea
                        id="descripcion"
                        placeholder="Describe el objetivo y alcance del proyecto..."
                        value={formData.descripcion}
                        onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                        rows={3}
                        disabled={loading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="pm">Jefe de Proyecto *</Label>
                      <Select
                        value={formData.pmId}
                        onValueChange={(value) => setFormData({ ...formData, pmId: value })}
                        required
                      >
                        <SelectTrigger id="pm" disabled={loading}>
                          <SelectValue placeholder="Seleccionar PM" />
                        </SelectTrigger>
                        <SelectContent>
                          {pms.map((pm) => (
                            <SelectItem key={pm.id} value={pm.id}>
                              {pm.nombre} {pm.apellidos}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Selección de áreas */}
                    {areas.length > 0 && (
                      <div className="space-y-2">
                        <Label>Áreas Asociadas *</Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-3 border border-border rounded-lg bg-muted/30">
                          {areas.map((area) => (
                            <div key={area.id} className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                id={`area-${area.id}`}
                                checked={formData.areasAsociadas.includes(area.id)}
                                onChange={() => toggleArea(area.id)}
                                disabled={loading}
                                className="rounded border-border text-primary focus:ring-primary"
                              />
                              <label htmlFor={`area-${area.id}`} className="text-sm cursor-pointer">
                                {area.nombre}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                  <div className="border-t border-border p-6 flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={handleCloseModal} disabled={loading}>
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={loading} className="gap-2">
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          {isEditMode ? 'Actualizando...' : 'Creando...'}
                        </>
                      ) : (
                        <>
                          {isEditMode ? (
                            <>
                              <Edit2 className="w-4 h-4" />
                              Actualizar Proyecto
                            </>
                          ) : (
                            <>
                              <Plus className="w-4 h-4" />
                              Crear Proyecto
                            </>
                          )}
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
