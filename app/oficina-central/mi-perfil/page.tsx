'use client';

import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Briefcase, Calendar, MapPin, Edit2, Save, X, Building2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { getSession } from '@/lib/auth';
import { usuariosProyectosStorage, areasStorage, proyectosStorage, initializeProjectData } from '@/lib/projectStorage';
import { toast } from 'sonner';
import { Usuario } from '@/lib/projectTypes';

export default function MiPerfilPage() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    apellidos: '',
    email: '',
    telefono: ''
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = () => {
    initializeProjectData();
    const session = getSession();
    
    if (!session) {
      toast.error('No hay sesión activa');
      setLoading(false);
      return;
    }

    const user = usuariosProyectosStorage.getById(session.userId);
    if (user) {
      setUsuario(user);
      setFormData({
        nombre: user.nombre,
        apellidos: user.apellidos,
        email: user.email,
        telefono: user.telefono || ''
      });
    }
    setLoading(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    if (usuario) {
      setFormData({
        nombre: usuario.nombre,
        apellidos: usuario.apellidos,
        email: usuario.email,
        telefono: usuario.telefono || ''
      });
    }
    setIsEditing(false);
  };

  const handleSave = () => {
    if (!usuario) return;

    if (!formData.nombre.trim() || !formData.apellidos.trim() || !formData.email.trim()) {
      toast.error('Por favor, completa todos los campos obligatorios');
      return;
    }

    // Actualizar datos del usuario
    usuariosProyectosStorage.update(usuario.id, {
      nombre: formData.nombre.trim(),
      apellidos: formData.apellidos.trim(),
      email: formData.email.trim(),
      telefono: formData.telefono.trim()
    });

    toast.success('Perfil actualizado correctamente');
    loadUserData();
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!usuario) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">No se encontró información del usuario</p>
      </div>
    );
  }

  const areasUsuario = areasStorage.getAll().filter(area => 
    usuario.areasAsignadas.includes(area.id)
  );

  const proyectosUsuario = proyectosStorage.getAll().filter(proyecto =>
    proyecto.miembros.some(m => m.usuarioId === usuario.id)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Mi Perfil</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona tu información personal y configuración
          </p>
        </div>
        {!isEditing && (
          <Button onClick={handleEdit} className="gap-2">
            <Edit2 className="w-4 h-4" />
            Editar Perfil
          </Button>
        )}
        {isEditing && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancel} className="gap-2">
              <X className="w-4 h-4" />
              Cancelar
            </Button>
            <Button onClick={handleSave} className="gap-2">
              <Save className="w-4 h-4" />
              Guardar Cambios
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información Personal */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Información Personal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre *</Label>
                  {isEditing ? (
                    <Input
                      id="nombre"
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      placeholder="Ingresa tu nombre"
                    />
                  ) : (
                    <p className="text-sm text-foreground bg-muted p-2 rounded-md">{usuario.nombre}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apellidos">Apellidos *</Label>
                  {isEditing ? (
                    <Input
                      id="apellidos"
                      value={formData.apellidos}
                      onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })}
                      placeholder="Ingresa tus apellidos"
                    />
                  ) : (
                    <p className="text-sm text-foreground bg-muted p-2 rounded-md">{usuario.apellidos}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico *</Label>
                {isEditing ? (
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="correo@ejemplo.com"
                  />
                ) : (
                  <div className="flex items-center gap-2 text-sm text-foreground bg-muted p-2 rounded-md">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    {usuario.email}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono</Label>
                {isEditing ? (
                  <Input
                    id="telefono"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    placeholder="+51 999 999 999"
                  />
                ) : (
                  <div className="flex items-center gap-2 text-sm text-foreground bg-muted p-2 rounded-md">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    {usuario.telefono || 'No especificado'}
                  </div>
                )}
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Rol</Label>
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="gap-1">
                    <Briefcase className="w-3 h-3" />
                    Oficina Central
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Usuario</Label>
                <p className="text-sm text-muted-foreground bg-muted p-2 rounded-md">
                  {usuario.username}
                </p>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Fecha de Registro
                </Label>
                <p className="text-sm text-muted-foreground">
                  {new Date(usuario.fechaCreacion).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Áreas y Proyectos */}
        <div className="space-y-6">
          {/* Áreas Asignadas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <MapPin className="w-4 h-4" />
                Áreas Asignadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              {areasUsuario.length > 0 ? (
                <div className="space-y-2">
                  {areasUsuario.map((area) => (
                    <div
                      key={area.id}
                      className="flex items-start gap-2 p-2 rounded-md bg-accent/30 border border-accent/50"
                    >
                      <Building2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {area.nombre}
                        </p>
                        {area.descripcion && (
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">
                            {area.descripcion}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Sin áreas asignadas
                </p>
              )}
            </CardContent>
          </Card>

          {/* Proyectos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Briefcase className="w-4 h-4" />
                Mis Proyectos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-primary">
                    {proyectosUsuario.length}
                  </span>
                  <Badge variant="outline">
                    {proyectosUsuario.length === 1 ? 'Proyecto' : 'Proyectos'}
                  </Badge>
                </div>
                <Separator />
                {proyectosUsuario.length > 0 ? (
                  <div className="space-y-2">
                    {proyectosUsuario.slice(0, 5).map((proyecto) => (
                      <div
                        key={proyecto.id}
                        className="p-2 rounded-md bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <p className="text-sm font-medium text-foreground truncate">
                          {proyecto.nombre}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            variant={proyecto.estado === 'abierto' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {proyecto.estado === 'abierto' ? 'Abierto' : 'Cerrado'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Sin proyectos asignados
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

