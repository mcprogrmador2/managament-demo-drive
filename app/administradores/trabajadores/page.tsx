'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Loader2,
  X,
  Mail,
  Phone,
  Shield,
  ArrowUpRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  usuariosProyectosStorage,
  initializeProjectData,
  generateProjectId,
  getCurrentTimestamp
} from '@/lib/projectStorage';
import { getSession } from '@/lib/auth';
import { toast } from 'sonner';

export default function TrabajadoresPage() {
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    nombre: '',
    apellidos: '',
    email: '',
    telefono: '',
    rol: ''
  });

  const loadUsuarios = () => {
    initializeProjectData();
    const data = usuariosProyectosStorage.getAll();
    setUsuarios(data);
  };

  useEffect(() => {
    loadUsuarios();
  }, []);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({
      username: '',
      password: '',
      nombre: '',
      apellidos: '',
      email: '',
      telefono: '',
      rol: ''
    });
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.username || !formData.password || !formData.nombre || !formData.apellidos || !formData.email || !formData.rol) {
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

      usuariosProyectosStorage.create({
        id: generateProjectId('usr'),
        username: formData.username,
        password: formData.password,
        nombre: formData.nombre,
        apellidos: formData.apellidos,
        email: formData.email,
        telefono: formData.telefono || undefined,
        rol: formData.rol as 'admin' | 'pm' | 'colaborador' | 'oficina_central',
        areasAsignadas: [],
        activo: true,
        fechaCreacion: getCurrentTimestamp()
      });

      toast.success('Usuario creado exitosamente');
      handleCloseModal();
      loadUsuarios();
    } catch (error) {
      toast.error('Error al crear el usuario');
      console.error(error);
    } finally {
      setLoading(false);
    }
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

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Usuarios</h1>
            <p className="text-sm text-muted-foreground">Gestiona los usuarios y colaboradores del sistema</p>
          </div>
          <Button onClick={handleOpenModal} className="gap-2">
            <Plus className="w-4 h-4" />
            Nuevo Usuario
          </Button>
        </div>

        {/* Listado de Usuarios */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {usuarios.map((usuario) => (
            <Card key={usuario.id} className="border-primary/20 hover:border-primary/40 transition-all group">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                      <Users className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{usuario.nombre} {usuario.apellidos}</CardTitle>
                      <p className="text-xs text-muted-foreground mt-1">@{usuario.username}</p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{usuario.email}</span>
                    </div>
                    {usuario.telefono && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{usuario.telefono}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Shield className="w-3 h-3" />
                      Rol:
                    </span>
                    {getRolBadge(usuario.rol)}
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-muted-foreground">
                      Estado:
                    </span>
                    <Badge variant={usuario.activo ? 'default' : 'secondary'}>
                      {usuario.activo ? 'Activo' : 'Inactivo'}
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
                      Nuevo Usuario
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
                          Crear Usuario
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