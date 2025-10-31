'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Briefcase, 
  FolderKanban,
  Plus, 
  Loader2,
  X,
  ArrowUpRight,
  Building2,
  User,
  Search,
  Users,
  Filter,
  Calendar,
  Eye
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
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

export default function ProyectosPage() {
  const router = useRouter();
  const [proyectos, setProyectos] = useState<any[]>([]);
  const [proyectosFiltrados, setProyectosFiltrados] = useState<any[]>([]);
  const [empresas, setEmpresas] = useState<any[]>([]);
  const [pms, setPms] = useState<any[]>([]);
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    empresaId: '',
    pmId: ''
  });

  const loadProyectos = () => {
    initializeProjectData();
    const dataProyectos = proyectosStorage.getAll();
    setProyectos(dataProyectos);
    setEmpresas(empresasStorage.getAll().filter(e => e.activo));
    setPms(usuariosProyectosStorage.getAll().filter(u => u.rol === 'pm' && u.activo));
    setUsuarios(usuariosProyectosStorage.getAll());
  };

  useEffect(() => {
    loadProyectos();
  }, []);

  // Filtrado y búsqueda
  useEffect(() => {
    let filtrados = [...proyectos];

    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtrados = filtrados.filter(p => 
        p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por estado
    if (filtroEstado !== 'todos') {
      filtrados = filtrados.filter(p => p.estado === filtroEstado);
    }

    setProyectosFiltrados(filtrados);
  }, [proyectos, searchTerm, filtroEstado]);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({
      nombre: '',
      descripcion: '',
      empresaId: '',
      pmId: ''
    });
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nombre || !formData.empresaId || !formData.pmId) {
      toast.error('Por favor completa todos los campos obligatorios');
      return;
    }

    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 400));

    try {
      const session = getSession();
      if (!session) {
        toast.error('No hay sesión activa');
        setLoading(false);
        return;
      }

      // Obtener áreas asociadas a la empresa
      const areas = areasStorage.find((area: any) => area.empresaId === formData.empresaId);
      const areasAsociadas = areas.map((area: any) => area.id);

      proyectosStorage.create({
        id: generateProjectId('proj'),
        nombre: formData.nombre,
        descripcion: formData.descripcion || undefined,
        empresaId: formData.empresaId,
        areasAsociadas: areasAsociadas,
        estado: 'abierto',
        pmId: formData.pmId,
        miembros: [],
        fechaInicio: getCurrentTimestamp(),
        fechaCreacion: getCurrentTimestamp(),
        creadoPor: session.username
      });

      toast.success('Proyecto creado exitosamente');
      handleCloseModal();
      loadProyectos();
    } catch (error) {
      toast.error('Error al crear el proyecto');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getEmpresaNombre = (empresaId: string) => {
    const empresa = empresas.find(e => e.id === empresaId);
    return empresa?.nombre || 'Desconocida';
  };

  const getPMNombre = (pmId: string) => {
    const pm = pms.find(p => p.id === pmId);
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

  const getMiembrosPreview = (miembros: any[]) => {
    if (!miembros || miembros.length === 0) return 'Sin miembros';
    
    const miembroPreview = miembros.slice(0, 2);
    return miembroPreview.map((m: any) => {
      const usuario = usuarios.find(u => u.id === m.usuarioId);
      return usuario ? `${usuario.nombre} ${usuario.apellidos}` : 'Desconocido';
    }).join(', ');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 py-6">
        {/* Header */}
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">Proyectos</h1>
              <p className="text-sm text-muted-foreground">Gestiona los proyectos activos del sistema</p>
            </div>
            <Button onClick={handleOpenModal} className="gap-2">
              <Plus className="w-4 h-4" />
              Nuevo Proyecto
            </Button>
          </div>

          {/* Barra de búsqueda y filtros */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar proyectos por nombre o descripción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="w-full sm:w-[180px]">
              <Select value={filtroEstado} onValueChange={setFiltroEstado}>
                <SelectTrigger>
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
          </div>

          {/* Contador de resultados */}
          <p className="text-sm text-muted-foreground">
            {proyectosFiltrados.length === 0 ? 'No se encontraron proyectos' : 
             `${proyectosFiltrados.length} proyecto${proyectosFiltrados.length !== 1 ? 's' : ''} encontrado${proyectosFiltrados.length !== 1 ? 's' : ''}`
            }
          </p>
        </div>

        {/* Listado de Proyectos */}
        {proyectosFiltrados.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {proyectosFiltrados.map((proyecto) => (
            <Card 
              key={proyecto.id} 
              className="border-primary/20 hover:border-primary/40 transition-all group cursor-pointer"
              onClick={() => router.push(`/administradores/proyectos/${proyecto.id}`)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                      <FolderKanban className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{proyecto.nombre}</CardTitle>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <Building2 className="w-3 h-3" />
                        {getEmpresaNombre(proyecto.empresaId)}
                      </p>
                    </div>
                  </div>
                  {getEstadoBadge(proyecto.estado)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {proyecto.descripcion && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {proyecto.descripcion}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t border-border">
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      <span className="font-medium">PM:</span>
                      <span>{getPMNombre(proyecto.pmId)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      <span className="font-medium">Miembros:</span>
                      <span>{proyecto.miembros?.length || 0}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      {formatDate(proyecto.fechaCreacion)}
                    </div>
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          </div>
        ) : (
          <div className="text-center py-16 text-muted-foreground">
            <div className="w-24 h-24 mx-auto mb-4 bg-primary/5 rounded-full flex items-center justify-center">
              <Briefcase className="w-12 h-12 text-primary/50" />
            </div>
            <p className="text-lg font-medium mb-2">No se encontraron proyectos</p>
            <p className="text-sm mb-6">
              {searchTerm || filtroEstado !== 'todos' 
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'Comienza creando tu primer proyecto'}
            </p>
            <Button size="sm" className="gap-2" onClick={handleOpenModal}>
              <Plus className="w-4 h-4" />
              Crear Primer Proyecto
            </Button>
          </div>
        )}

        {/* Modal de Creación */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={handleCloseModal}></div>
            <div className="relative z-50 w-full max-w-2xl mx-4">
              <Card className="border-primary/20 shadow-2xl">
                <CardHeader className="border-b border-border">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-primary">
                      <Plus className="w-5 h-5" />
                      Nuevo Proyecto
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="empresa">Empresa *</Label>
                        <Select
                          value={formData.empresaId}
                          onValueChange={(value) => setFormData({ ...formData, empresaId: value })}
                          required
                        >
                          <SelectTrigger id="empresa" disabled={loading}>
                            <SelectValue placeholder="Seleccionar empresa" />
                          </SelectTrigger>
                          <SelectContent>
                            {empresas.map((empresa) => (
                              <SelectItem key={empresa.id} value={empresa.id}>
                                {empresa.nombre}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
                    </div>
                  </CardContent>
                  <div className="border-t border-border p-6 flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={handleCloseModal} disabled={loading}>
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={loading} className="gap-2">
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Creando...
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          Crear Proyecto
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