'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Users, 
  Plus, 
  Loader2,
  X,
  Mail,
  Phone,
  Shield,
  Search,
  Edit2,
  Trash2,
  ArrowLeft,
  Filter,
  Building2,
  FolderOpen
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  usuariosProyectosStorage,
  areasStorage,
  empresasStorage,
  initializeProjectData,
  generateProjectId,
  getCurrentTimestamp
} from '@/lib/projectStorage';
import { getSession } from '@/lib/auth';
import { toast } from 'sonner';
import { Usuario, Area, Empresa } from '@/lib/projectTypes';

export default function EmpresaTrabajadoresPage() {
  const params = useParams();
  const router = useRouter();
  const empresaId = params.name as string;

  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [areas, setAreas] = useState<Area[]>([]);
  const [allUsuarios, setAllUsuarios] = useState<Usuario[]>([]);
  const [filteredUsuarios, setFilteredUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRol, setFilterRol] = useState<string>('all');
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    nombre: '',
    apellidos: '',
    email: '',
    telefono: '',
    rol: '',
    areasAsignadas: [] as string[]
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

      // Cargar usuarios que tengan áreas asignadas de esta empresa
      const allUsers = usuariosProyectosStorage.getAll();
      const usuariosEmpresa = allUsers.filter((usuario: Usuario) => 
        usuario.areasAsignadas.some(areaId => areasData.some((a: Area) => a.id === areaId))
      );
      
      setAllUsuarios(usuariosEmpresa);
      setFilteredUsuarios(usuariosEmpresa);
      setLoading(false);
    } else {
      setLoading(false);
      router.push('/administradores/empresas');
    }
  }, [empresaId, router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filtrar usuarios cuando cambian los filtros
  useEffect(() => {
    let filtered = allUsuarios;

    // Filtrar por búsqueda
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(usuario => 
        usuario.nombre.toLowerCase().includes(searchLower) ||
        usuario.apellidos.toLowerCase().includes(searchLower) ||
        usuario.email.toLowerCase().includes(searchLower) ||
        usuario.username.toLowerCase().includes(searchLower)
      );
    }

    // Filtrar por rol
    if (filterRol !== 'all') {
      filtered = filtered.filter(usuario => usuario.rol === filterRol);
    }

    setFilteredUsuarios(filtered);
  }, [searchTerm, filterRol, allUsuarios]);

  const handleOpenModal = () => {
    setIsEditMode(false);
    setEditingUserId(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setEditingUserId(null);
    setFormData({
      username: '',
      password: '',
      nombre: '',
      apellidos: '',
      email: '',
      telefono: '',
      rol: '',
      areasAsignadas: []
    });
    setLoading(false);
  };

  const handleEdit = (usuario: Usuario) => {
    setIsEditMode(true);
    setEditingUserId(usuario.id);
    setFormData({
      username: usuario.username,
      password: '', // No prellenar contraseña por seguridad
      nombre: usuario.nombre,
      apellidos: usuario.apellidos,
      email: usuario.email,
      telefono: usuario.telefono || '',
      rol: usuario.rol,
      areasAsignadas: usuario.areasAsignadas
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (usuarioId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este trabajador?')) {
      return;
    }

    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300));

    try {
      usuariosProyectosStorage.delete(usuarioId);
      toast.success('Trabajador eliminado exitosamente');
      loadData();
    } catch (error) {
      toast.error('Error al eliminar el trabajador');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const fieldsRequired = isEditMode 
      ? ['nombre', 'apellidos', 'email', 'rol']
      : ['username', 'password', 'nombre', 'apellidos', 'email', 'rol'];
    
    const hasAllFields = fieldsRequired.every(field => {
      const value = formData[field as keyof typeof formData];
      return Array.isArray(value) ? value.length > 0 : value && value.toString().trim() !== '';
    });

    if (!hasAllFields) {
      toast.error('Por favor completa todos los campos obligatorios');
      return;
    }

    // Si es edición y no hay nueva contraseña, validar que tenga una existente
    if (isEditMode && !formData.password) {
      const usuarioExistente = usuariosProyectosStorage.getById(editingUserId!);
      if (!usuarioExistente) {
        toast.error('Usuario no encontrado');
        return;
      }
    } else if (!isEditMode && formData.password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
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
        // Actualizar usuario existente
        const updateData: Partial<Usuario> = {
          nombre: formData.nombre,
          apellidos: formData.apellidos,
          email: formData.email,
          telefono: formData.telefono || undefined,
          rol: formData.rol as 'admin' | 'pm' | 'colaborador' | 'oficina_central',
          areasAsignadas: formData.areasAsignadas
        };

        // Solo actualizar password si se proporcionó una nueva
        if (formData.password) {
          updateData.password = formData.password;
        }

        usuariosProyectosStorage.update(editingUserId!, updateData);
        toast.success('Trabajador actualizado exitosamente');
      } else {
        // Crear nuevo usuario
        usuariosProyectosStorage.create({
          id: generateProjectId('usr'),
          username: formData.username,
          password: formData.password,
          nombre: formData.nombre,
          apellidos: formData.apellidos,
          email: formData.email,
          telefono: formData.telefono || undefined,
          rol: formData.rol as 'admin' | 'pm' | 'colaborador' | 'oficina_central',
          areasAsignadas: formData.areasAsignadas,
          activo: true,
          fechaCreacion: getCurrentTimestamp()
        });
        toast.success('Trabajador creado exitosamente');
      }

      handleCloseModal();
      loadData();
    } catch (error) {
      toast.error(`Error al ${isEditMode ? 'actualizar' : 'crear'} el trabajador`);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const toggleArea = (areaId: string) => {
    setFormData(prev => ({
      ...prev,
      areasAsignadas: prev.areasAsignadas.includes(areaId)
        ? prev.areasAsignadas.filter(id => id !== areaId)
        : [...prev.areasAsignadas, areaId]
    }));
  };

  const getRolBadge = (rol: string) => {
    switch (rol) {
      case 'admin':
        return <Badge className="bg-primary/20 text-primary border-primary/30">Administrador</Badge>;
      case 'pm':
        return <Badge className="bg-info/20 text-info border-info/30">Jefe de Proyecto</Badge>;
      case 'colaborador':
        return <Badge variant="secondary">Colaborador</Badge>;
      case 'oficina_central':
        return <Badge className="bg-warning/20 text-warning border-warning/30">Oficina Central</Badge>;
      default:
        return <Badge variant="secondary">{rol}</Badge>;
    }
  };

  const getAreaNombre = (areaId: string) => {
    const area = areas.find((a: Area) => a.id === areaId);
    return area?.nombre || 'Sin área';
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
                <Users className="w-8 h-8 text-primary" />
                Trabajadores
              </h1>
              <p className="text-sm text-muted-foreground">
                {empresa && `Gestiona los trabajadores de ${empresa.nombre}`}
              </p>
            </div>
            <Button onClick={handleOpenModal} className="gap-2">
              <Plus className="w-4 h-4" />
              Nuevo Trabajador
            </Button>
          </div>
        </div>

       
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{filteredUsuarios.length}</p>
                  <p className="text-xs text-muted-foreground">Total trabajadores</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-info/10 rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-info" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {filteredUsuarios.filter(u => u.rol === 'pm').length}
                  </p>
                  <p className="text-xs text-muted-foreground">Jefes de proyecto</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {filteredUsuarios.filter(u => u.rol === 'colaborador').length}
                  </p>
                  <p className="text-xs text-muted-foreground">Colaboradores</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center">
                  <FolderOpen className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{areas.length}</p>
                  <p className="text-xs text-muted-foreground">Áreas disponibles</p>
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
                  placeholder="Buscar por nombre, email o usuario..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterRol} onValueChange={setFilterRol}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filtrar por rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los roles</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="pm">Jefe de Proyecto</SelectItem>
                  <SelectItem value="colaborador">Colaborador</SelectItem>
                  <SelectItem value="oficina_central">Oficina Central</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Listado de Usuarios */}
        {filteredUsuarios.length > 0 ? (
          <Card className="border-primary/20 shadow-sm">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-border/50">
                    <TableHead className="font-semibold text-foreground">Trabajador</TableHead>
                    <TableHead className="font-semibold text-foreground">Contacto</TableHead>
                    <TableHead className="font-semibold text-foreground">Rol</TableHead>
                    <TableHead className="font-semibold text-foreground">Áreas Asignadas</TableHead>
                    <TableHead className="font-semibold text-foreground">Estado</TableHead>
                    <TableHead className="font-semibold text-foreground text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsuarios.map((usuario) => (
                    <TableRow key={usuario.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                            <Users className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">
                              {usuario.nombre} {usuario.apellidos}
                            </p>
                            <p className="text-xs text-muted-foreground">@{usuario.username}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                            <span className="text-muted-foreground">{usuario.email}</span>
                          </div>
                          {usuario.telefono && (
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                              <span className="text-muted-foreground">{usuario.telefono}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getRolBadge(usuario.rol)}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {usuario.areasAsignadas && usuario.areasAsignadas.length > 0 ? (
                            usuario.areasAsignadas.map((areaId) => (
                              <Badge key={areaId} variant="outline" className="text-xs">
                                {getAreaNombre(areaId)}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-xs text-muted-foreground">Sin áreas</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={usuario.activo ? 'default' : 'secondary'}>
                          {usuario.activo ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(usuario)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit2 className="w-4 h-4 text-primary" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(usuario.id)}
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
                <Users className="w-8 h-8 text-primary/50" />
              </div>
              <p className="text-muted-foreground font-medium mb-2">
                {searchTerm || filterRol !== 'all' ? 'No se encontraron trabajadores' : 'No hay trabajadores registrados'}
              </p>
              <p className="text-sm text-muted-foreground">
                {searchTerm || filterRol !== 'all' 
                  ? 'Intenta ajustar los filtros de búsqueda' 
                  : 'Empieza agregando trabajadores a esta empresa'}
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
                          Editar Trabajador
                        </>
                      ) : (
                        <>
                          <Plus className="w-5 h-5" />
                          Nuevo Trabajador
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="nombre">Nombre *</Label>
                        <Input
                          id="nombre"
                          placeholder="Ej: Juan"
                          value={formData.nombre}
                          onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                          required
                          disabled={loading}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="apellidos">Apellidos *</Label>
                        <Input
                          id="apellidos"
                          placeholder="Ej: Pérez"
                          value={formData.apellidos}
                          onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })}
                          required
                          disabled={loading}
                        />
                      </div>
                    </div>

                    {!isEditMode && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="username">Usuario *</Label>
                          <Input
                            id="username"
                            placeholder="Ej: juan.perez"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            required
                            disabled={loading}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="password">Contraseña *</Label>
                          <Input
                            id="password"
                            type="password"
                            placeholder="Mínimo 6 caracteres"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                            disabled={loading}
                          />
                        </div>
                      </div>
                    )}

                    {isEditMode && (
                      <div className="space-y-2">
                        <Label htmlFor="password">Nueva Contraseña</Label>
                        <Input
                          id="password"
                          type="password"
                          placeholder="Dejar vacío para mantener la actual"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          disabled={loading}
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="juan.perez@empresa.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        disabled={loading}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="telefono">Teléfono</Label>
                        <Input
                          id="telefono"
                          placeholder="+51 999 999 999"
                          value={formData.telefono}
                          onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                          disabled={loading}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="rol">Rol *</Label>
                        <Select
                          value={formData.rol}
                          onValueChange={(value) => setFormData({ ...formData, rol: value })}
                          required
                        >
                          <SelectTrigger id="rol" disabled={loading}>
                            <SelectValue placeholder="Seleccionar rol" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Administrador</SelectItem>
                            <SelectItem value="pm">Jefe de Proyecto</SelectItem>
                            <SelectItem value="colaborador">Colaborador</SelectItem>
                            <SelectItem value="oficina_central">Oficina Central</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Selección de áreas */}
                    {areas.length > 0 && (
                      <div className="space-y-2">
                        <Label>Áreas Asignadas</Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-3 border border-border rounded-lg bg-muted/30">
                          {areas.map((area) => (
                            <div key={area.id} className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                id={`area-${area.id}`}
                                checked={formData.areasAsignadas.includes(area.id)}
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
                              Actualizar Trabajador
                            </>
                          ) : (
                            <>
                              <Plus className="w-4 h-4" />
                              Crear Trabajador
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
