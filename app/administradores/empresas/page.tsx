'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Building2, 
  Plus, 
  Loader2,
  X,
  Edit2,
  Trash2,
  Search,
  Filter,
  MoreVertical,
  MapPin,
  Phone,
  Mail
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  empresasStorage,
  initializeProjectData,
  generateProjectId,
  getCurrentTimestamp
} from '@/lib/projectStorage';
import { getSession } from '@/lib/auth';
import { toast } from 'sonner';
import { Empresa } from '@/lib/projectTypes';

export default function EmpresasPage() {
  const router = useRouter();
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    nit: '',
    direccion: '',
    telefono: '',
    email: ''
  });

  const loadEmpresas = () => {
    initializeProjectData();
    const data = empresasStorage.getAll();
    setEmpresas(data);
  };

  useEffect(() => {
    loadEmpresas();
  }, []);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({
      nombre: '',
      nit: '',
      direccion: '',
      telefono: '',
      email: ''
    });
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nombre) {
      toast.error('El nombre es obligatorio');
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

      empresasStorage.create({
        id: generateProjectId('emp'),
        nombre: formData.nombre,
        nit: formData.nit || undefined,
        direccion: formData.direccion || undefined,
        telefono: formData.telefono || undefined,
        email: formData.email || undefined,
        activo: true,
        fechaCreacion: getCurrentTimestamp(),
        fechaActualizacion: getCurrentTimestamp()
      });

      toast.success('Empresa creada exitosamente');
      handleCloseModal();
      loadEmpresas();
    } catch (error) {
      toast.error('Error al crear la empresa');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

    return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Empresas</h1>
            <p className="text-sm text-muted-foreground">Gestiona las empresas y organizaciones del sistema</p>
          </div>
          <Button onClick={handleOpenModal} className="gap-2">
            <Plus className="w-4 h-4" />
            Nueva Empresa
          </Button>
        </div>

        {/* Listado de Empresas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {empresas.map((empresa) => (
            <Card 
              key={empresa.id} 
              className="border-primary/20 hover:border-primary/40 transition-all group cursor-pointer"
              onClick={() => router.push(`/administradores/empresas/${empresa.id}`)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-primary" />
                    </div>
        <div>
                      <CardTitle className="text-lg">{empresa.nombre}</CardTitle>
                      {empresa.nit && (
                        <p className="text-xs text-muted-foreground mt-1">NIT: {empresa.nit}</p>
                      )}
                    </div>
                  </div>
                  <Badge variant={empresa.activo ? 'default' : 'secondary'}>
                    {empresa.activo ? 'Activa' : 'Inactiva'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {empresa.direccion && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4 text-primary" />
                      <span className="line-clamp-1">{empresa.direccion}</span>
                    </div>
                  )}
                  {empresa.telefono && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="w-4 h-4 text-primary" />
                      <span>{empresa.telefono}</span>
                    </div>
                  )}
                  {empresa.email && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="w-4 h-4 text-primary" />
                      <span className="line-clamp-1">{empresa.email}</span>
                    </div>
                  )}
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
                      Nueva Empresa
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
                      <Label htmlFor="nombre">Nombre de la Empresa *</Label>
                      <Input
                        id="nombre"
                        placeholder="Ej: Mi Empresa SAC"
                        value={formData.nombre}
                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                        required
                        disabled={loading}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="nit">NIT</Label>
                        <Input
                          id="nit"
                          placeholder="Número de identificación"
                          value={formData.nit}
                          onChange={(e) => setFormData({ ...formData, nit: e.target.value })}
                          disabled={loading}
                        />
                      </div>

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
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="direccion">Dirección</Label>
                      <Input
                        id="direccion"
                        placeholder="Dirección completa"
                        value={formData.direccion}
                        onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                        disabled={loading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="contacto@empresa.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                          Creando...
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          Crear Empresa
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