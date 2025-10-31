'use client';

import React, { useState, useEffect } from 'react';
import { 
  FolderOpen, 
  Plus, 
  Loader2,
  X,
  Building2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  areasStorage,
  empresasStorage,
  usuariosProyectosStorage,
  initializeProjectData,
  generateProjectId,
  getCurrentTimestamp
} from '@/lib/projectStorage';
import { getSession } from '@/lib/auth';
import { toast } from 'sonner';

export default function AreasPage() {
  const [areas, setAreas] = useState<any[]>([]);
  const [empresas, setEmpresas] = useState<any[]>([]);
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    empresaId: '',
    responsableId: ''
  });

  const loadData = () => {
    initializeProjectData();
    setAreas(areasStorage.getAll());
    setEmpresas(empresasStorage.getAll().filter(e => e.activo));
    setUsuarios(usuariosProyectosStorage.getAll().filter(u => u.activo));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({
      nombre: '',
      descripcion: '',
      empresaId: '',
      responsableId: ''
    });
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nombre || !formData.empresaId) {
      toast.error('Nombre y empresa son obligatorios');
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

      areasStorage.create({
        id: generateProjectId('area'),
        nombre: formData.nombre,
        descripcion: formData.descripcion || undefined,
        empresaId: formData.empresaId,
        responsableId: formData.responsableId || undefined,
        activo: true,
        fechaCreacion: getCurrentTimestamp()
      });

      toast.success('Área creada exitosamente');
      handleCloseModal();
      loadData();
    } catch (error) {
      toast.error('Error al crear el área');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getEmpresaNombre = (empresaId: string) => {
    const empresa = empresas.find(e => e.id === empresaId);
    return empresa?.nombre || 'Desconocida';
  };

  const getResponsableNombre = (responsableId: string) => {
    const usuario = usuarios.find(u => u.id === responsableId);
    return usuario ? `${usuario.nombre} ${usuario.apellidos}` : 'Sin responsable';
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Áreas</h1>
            <p className="text-sm text-muted-foreground">Gestiona las áreas internas de las empresas</p>
          </div>
          <Button onClick={handleOpenModal} className="gap-2">
            <Plus className="w-4 h-4" />
            Nueva Área
          </Button>
        </div>

        {/* Listado de Áreas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {areas.map((area) => (
            <Card key={area.id} className="border-primary/20 hover:border-primary/40 transition-all group">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <FolderOpen className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{area.nombre}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">
                      {getEmpresaNombre(area.empresaId)}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {area.descripcion && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {area.descripcion}
                    </p>
                  )}
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <span className="text-xs text-muted-foreground">
                      Responsable:
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {getResponsableNombre(area.responsableId)}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      Estado:
                    </span>
                    <Badge variant={area.activo ? 'default' : 'secondary'}>
                      {area.activo ? 'Activa' : 'Inactiva'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

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
                      Nueva Área
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
                      <Label htmlFor="nombre">Nombre del Área *</Label>
                      <Input
                        id="nombre"
                        placeholder="Ej: Recursos Humanos"
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
                        placeholder="Describe el propósito del área..."
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
                        <Label htmlFor="responsable">Responsable</Label>
                        <Select
                          value={formData.responsableId}
                          onValueChange={(value) => setFormData({ ...formData, responsableId: value })}
                        >
                          <SelectTrigger id="responsable" disabled={loading}>
                            <SelectValue placeholder="Seleccionar responsable" />
                          </SelectTrigger>
                          <SelectContent>
                            {usuarios.map((usuario) => (
                              <SelectItem key={usuario.id} value={usuario.id}>
                                {usuario.nombre} {usuario.apellidos}
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
                          Crear Área
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