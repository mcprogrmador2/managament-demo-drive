'use client';

import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  Plus, 
  Loader2,
  X,
  Search,
  Edit2,
  Trash2,
  Building2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  puestosDeTrabajoStorage,
  usuariosProyectosStorage,
  initializeProjectData,
  generateProjectId,
  getCurrentTimestamp
} from '@/lib/projectStorage';
import { getSession } from '@/lib/auth';
import { toast } from 'sonner';
import { PuestoDeTrabajo, Usuario } from '@/lib/projectTypes';

export default function PuestosDeTrabajoPage() {
  const [puestos, setPuestos] = useState<PuestoDeTrabajo[]>([]);
  const [filteredPuestos, setFilteredPuestos] = useState<PuestoDeTrabajo[]>([]);
  const [allUsuarios, setAllUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingPuestoId, setEditingPuestoId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    departamento: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  // Filtrar puestos cuando cambia el término de búsqueda
  useEffect(() => {
    let filtered = puestos;

    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.departamento?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredPuestos(filtered);
  }, [searchTerm, puestos]);

  const loadData = () => {
    initializeProjectData();
    const allPuestos = puestosDeTrabajoStorage.getAll();
    setPuestos(allPuestos);
    setFilteredPuestos(allPuestos);
    setAllUsuarios(usuariosProyectosStorage.getAll());
  };

  const handleOpenModal = () => {
    setIsEditMode(false);
    setEditingPuestoId(null);
    setFormData({
      nombre: '',
      descripcion: '',
      departamento: ''
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setEditingPuestoId(null);
    setFormData({
      nombre: '',
      descripcion: '',
      departamento: ''
    });
    setLoading(false);
  };

  const handleEdit = (puesto: PuestoDeTrabajo) => {
    setIsEditMode(true);
    setEditingPuestoId(puesto.id);
    setFormData({
      nombre: puesto.nombre,
      descripcion: puesto.descripcion || '',
      departamento: puesto.departamento || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (puestoId: string) => {
    // Verificar si el puesto está asignado a algún usuario
    const usuariosConPuesto = allUsuarios.filter((u: Usuario) => u.puestoId === puestoId && u.activo);
    
    if (usuariosConPuesto.length > 0) {
      toast.error(`No se puede eliminar. ${usuariosConPuesto.length} trabajador(es) tienen este puesto asignado`);
      return;
    }

    if (!confirm('¿Estás seguro de que deseas eliminar este puesto de trabajo?')) {
      return;
    }

    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300));

    try {
      puestosDeTrabajoStorage.delete(puestoId);
      toast.success('Puesto eliminado exitosamente');
      loadData();
    } catch (error) {
      toast.error('Error al eliminar el puesto');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nombre.trim()) {
      toast.error('El nombre es obligatorio');
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
        // Actualizar puesto existente
        puestosDeTrabajoStorage.update(editingPuestoId!, {
          nombre: formData.nombre,
          descripcion: formData.descripcion || undefined,
          departamento: formData.departamento || undefined,
          fechaActualizacion: getCurrentTimestamp()
        });
        toast.success('Puesto actualizado exitosamente');
      } else {
        // Crear nuevo puesto
        puestosDeTrabajoStorage.create({
          id: generateProjectId('puesto'),
          nombre: formData.nombre,
          descripcion: formData.descripcion || undefined,
          departamento: formData.departamento || undefined,
          activo: true,
          fechaCreacion: getCurrentTimestamp(),
          fechaActualizacion: getCurrentTimestamp()
        });
        toast.success('Puesto creado exitosamente');
      }

      handleCloseModal();
      loadData();
    } catch (error) {
      toast.error(`Error al ${isEditMode ? 'actualizar' : 'crear'} el puesto`);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getCantidadUsuarios = (puestoId: string) => {
    return allUsuarios.filter((u: Usuario) => u.puestoId === puestoId && u.activo).length;
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
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <Briefcase className="w-8 h-8 text-primary" />
                Puestos de Trabajo
              </h1>
              <p className="text-sm text-muted-foreground">
                Gestiona los puestos o cargos disponibles para asignar a los trabajadores
              </p>
            </div>
            <Button onClick={handleOpenModal} className="gap-2">
              <Plus className="w-4 h-4" />
              Nuevo Puesto
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{filteredPuestos.length}</p>
                  <p className="text-xs text-muted-foreground">Total puestos</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {new Set(filteredPuestos.map(p => p.departamento).filter(Boolean)).size}
                  </p>
                  <p className="text-xs text-muted-foreground">Departamentos</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {puestos.reduce((acc, p) => acc + getCantidadUsuarios(p.id), 0)}
                  </p>
                  <p className="text-xs text-muted-foreground">Asignaciones</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter */}
        <Card className="mb-6 border-primary/20">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Buscar por nombre, departamento o descripción..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Listado de Puestos */}
        {filteredPuestos.length > 0 ? (
          <Card className="border-primary/20 shadow-sm">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-border/50">
                    <TableHead className="font-semibold text-foreground">Puesto</TableHead>
                    <TableHead className="font-semibold text-foreground">Departamento</TableHead>
                    <TableHead className="font-semibold text-foreground">Descripción</TableHead>
                    <TableHead className="font-semibold text-foreground">Asignaciones</TableHead>
                    <TableHead className="font-semibold text-foreground text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPuestos.map((puesto) => (
                    <TableRow key={puesto.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium text-foreground">
                            {puesto.nombre}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {puesto.departamento ? (
                          <Badge variant="outline" className="text-xs">
                            {puesto.departamento}
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">Sin departamento</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {puesto.descripcion || 'Sin descripción'}
                        </p>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">
                          {getCantidadUsuarios(puesto.id)} trabajador(es)
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(puesto)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit2 className="w-4 h-4 text-primary" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(puesto.id)}
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
                <Briefcase className="w-8 h-8 text-primary/50" />
              </div>
              <p className="text-muted-foreground font-medium mb-2">
                {searchTerm ? 'No se encontraron puestos' : 'No hay puestos registrados'}
              </p>
              <p className="text-sm text-muted-foreground">
                {searchTerm 
                  ? 'Intenta ajustar el término de búsqueda' 
                  : 'Empieza agregando puestos de trabajo'}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Modal de Creación/Edición */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={handleCloseModal}></div>
            <div className="relative z-50 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
              <Card className="border-primary/20 shadow-2xl">
                <CardHeader className="border-b border-border">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-primary">
                      {isEditMode ? (
                        <>
                          <Edit2 className="w-5 h-5" />
                          Editar Puesto de Trabajo
                        </>
                      ) : (
                        <>
                          <Plus className="w-5 h-5" />
                          Nuevo Puesto de Trabajo
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
                      <Label htmlFor="nombre">Nombre del Puesto *</Label>
                      <Input
                        id="nombre"
                        placeholder="Ej: Vendedor, Jefe de Ventas"
                        value={formData.nombre}
                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                        required
                        disabled={loading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="departamento">Departamento</Label>
                      <Input
                        id="departamento"
                        placeholder="Ej: Comercial, RRHH, Finanzas"
                        value={formData.departamento}
                        onChange={(e) => setFormData({ ...formData, departamento: e.target.value })}
                        disabled={loading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="descripcion">Descripción</Label>
                      <Textarea
                        id="descripcion"
                        placeholder="Describe las responsabilidades y requisitos del puesto..."
                        value={formData.descripcion}
                        onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                        rows={4}
                        disabled={loading}
                      />
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
                          {isEditMode ? 'Actualizando...' : 'Creando...'}
                        </>
                      ) : (
                        <>
                          {isEditMode ? (
                            <>
                              <Edit2 className="w-4 h-4" />
                              Actualizar Puesto
                            </>
                          ) : (
                            <>
                              <Plus className="w-4 h-4" />
                              Crear Puesto
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
