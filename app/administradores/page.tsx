'use client';

import React from 'react';
import { 
  Briefcase, 
  Users, 
  Building2, 
  FolderKanban, 
  FileText, 
  PlayCircle, 
  CheckCircle2, 
  TrendingUp, 
  Plus, 
  BarChart3,
  ArrowUpRight,
  Loader2,
  X
} from "lucide-react";
import { KPICard } from '@/components/administradores-components/kpi-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  empresasStorage, 
  areasStorage,
  usuariosProyectosStorage, 
  proyectosStorage, 
  archivosStorage,
  initializeProjectData,
  generateProjectId,
  getCurrentTimestamp
} from '@/lib/projectStorage';
import { useEffect, useState } from 'react';
import { getSession } from '@/lib/auth';
import { toast } from 'sonner';
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from 'recharts';
import { ChartConfig, ChartContainer } from '@/components/ui/chart';

interface DashboardStats {
  totalEmpresas: number;
  totalProyectos: number;
  totalUsuarios: number;
  proyectosAbiertos: number;
  proyectosCerrados: number;
  totalArchivos: number;
  ultimosProyectos: unknown[];
  distribucionEmpresas: unknown[];
}

export default function AdministradorDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalEmpresas: 0,
    totalProyectos: 0,
    totalUsuarios: 0,
    proyectosAbiertos: 0,
    proyectosCerrados: 0,
    totalArchivos: 0,
    ultimosProyectos: [],
    distribucionEmpresas: []
  });

  // Estados para el modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    empresaId: '',
    pmId: ''
  });

  const loadStats = () => {
    initializeProjectData();
    
    // Calcular estadísticas
    const empresas = empresasStorage.getAll();
    const proyectos = proyectosStorage.getAll();
    const usuarios = usuariosProyectosStorage.getAll();
    const archivos = archivosStorage.getAll();

    const proyectosAbiertos = proyectos.filter(p => p.estado === 'abierto').length;
    const proyectosCerrados = proyectos.filter(p => p.estado === 'cerrado' || p.estado === 'aprobado').length;
    const ultimosProyectos = proyectos
      .sort((a, b) => new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime())
      .slice(0, 5);

    // Calcular distribución por empresa
    const distribucionEmpresas = empresas.map(empresa => {
      const proyectosEmpresa = proyectos.filter(p => p.empresaId === empresa.id);
      return {
        empresa: empresa.nombre.length > 20 ? empresa.nombre.substring(0, 20) + '...' : empresa.nombre,
        proyectos: proyectosEmpresa.length
      };
    });

    setStats({
      totalEmpresas: empresas.length,
      totalProyectos: proyectos.length,
      totalUsuarios: usuarios.length,
      proyectosAbiertos,
      proyectosCerrados,
      totalArchivos: archivos.filter(a => a.estado === 'activo').length,
      ultimosProyectos,
      distribucionEmpresas
    });
  };

  useEffect(() => {
    loadStats();
  }, []);

  // Configuración del gráfico
  const chartConfig = {
    proyectos: {
      label: "Proyectos",
      color: "var(--chart-1)",
    },
  } satisfies ChartConfig;

  const handleCrearProyecto = () => {
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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nombre || !formData.empresaId || !formData.pmId) {
      toast.error('Por favor completa todos los campos obligatorios');
      return;
    }

    setLoading(true);

    // Simular latencia de red (300-800ms según las reglas)
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

      // Crear el proyecto
      const nuevoProyecto = proyectosStorage.create({
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
      loadStats(); // Recargar estadísticas
    } catch (error) {
      toast.error('Error al crear el proyecto');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Obtener datos para los selectores
  const empresas = empresasStorage.getAll().filter(e => e.activo);
  const pms = usuariosProyectosStorage.getAll().filter(u => u.rol === 'pm' && u.activo);

  return (
    <div className="min-h-screen bg-background">
   

      <div className="container mx-auto px-4 sm:px-6 py-6">
        {/* Estadísticas Generales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <KPICard
            title="Total Empresas"
            value={stats.totalEmpresas.toLocaleString()}
            icon={Building2}
            borderColor="border-l-primary"
            textColor="text-primary"
          />
          <KPICard
            title="Proyectos Activos"
            value={stats.proyectosAbiertos.toLocaleString()}
            icon={Briefcase}
            borderColor="border-l-success"
            textColor="text-success"
          />
          <KPICard
            title="Total Usuarios"
            value={stats.totalUsuarios.toLocaleString()}
            icon={Users}
            borderColor="border-l-info"
            textColor="text-info"
          />
          <KPICard
            title="Archivos Totales"
            value={stats.totalArchivos.toLocaleString()}
            icon={FileText}
            borderColor="border-l-warning"
            textColor="text-warning"
          />
        </div>

        {/* Gráficos y Estadísticas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Estado de Proyectos */}
          <Card className="border-primary/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <TrendingUp className="w-5 h-5" />
                Estado de Proyectos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-primary/5 border border-primary/10 rounded-xl hover:bg-primary/10 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                      <PlayCircle className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">En Progreso</p>
                      <p className="text-3xl font-bold text-primary">{stats.proyectosAbiertos}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-primary/20 border-primary/30 text-primary font-semibold">
                    {stats.totalProyectos > 0 ? ((stats.proyectosAbiertos / stats.totalProyectos) * 100).toFixed(0) : 0}%
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-muted/50 border border-muted-foreground/10 rounded-xl hover:bg-muted transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Completados</p>
                      <p className="text-3xl font-bold text-foreground">{stats.proyectosCerrados}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="font-semibold">
                    {stats.totalProyectos > 0 ? ((stats.proyectosCerrados / stats.totalProyectos) * 100).toFixed(0) : 0}%
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Distribución por Empresa */}
          <Card className="border-primary/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <BarChart3 className="w-5 h-5" />
                Distribución por Empresa
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Visualización de proyectos por empresa registrada
                </p>
                {stats.distribucionEmpresas.length > 0 ? (
                  <ChartContainer config={chartConfig}>
                    <BarChart
                      accessibilityLayer
                      data={stats.distribucionEmpresas}
                      layout="vertical"
                      margin={{
                        top: 0,
                        right: 16,
                        left: 16,
                        bottom: 0,
                      }}
                    >
                      <CartesianGrid horizontal={false} strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis
                        type="number"
                        hide
                      />
                      <YAxis
                        dataKey="empresa"
                        type="category"
                        tickLine={false}
                        tickMargin={10}
                        axisLine={false}
                        className="text-muted-foreground"
                        width={120}
                      />
                      <Bar
                        dataKey="proyectos"
                        fill="var(--color-proyectos)"
                        radius={[0, 4, 4, 0]}
                      >
                        <LabelList
                          dataKey="proyectos"
                          position="right"
                          offset={8}
                          className="fill-foreground font-medium"
                          fontSize={12}
                        />
                      </Bar>
                    </BarChart>
                  </ChartContainer>
                ) : (
                  <div className="flex items-center justify-center h-40 bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl border border-primary/20">
                    <div className="text-center">
                      <BarChart3 className="w-12 h-12 mx-auto mb-2 text-primary/50" />
                      <p className="text-sm font-medium text-muted-foreground">Sin datos</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Últimos Proyectos */}
        <div className="mb-6">
          <Card className="border-primary/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-primary">
                  <FolderKanban className="w-5 h-5" />
                  Últimos Proyectos
                </CardTitle>
                <Button size="sm" onClick={handleCrearProyecto} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Nuevo Proyecto
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.ultimosProyectos.length > 0 ? (
                  stats.ultimosProyectos.map((proyecto) => (
                    <div key={proyecto.id} className="group flex items-center justify-between p-4 bg-gradient-to-r from-card to-primary/5 border border-border rounded-xl hover:border-primary/30 transition-all cursor-pointer">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                          <FolderKanban className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-foreground group-hover:text-primary transition-colors">{proyecto.nombre}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1">{proyecto.descripcion}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={proyecto.estado === 'abierto' ? 'default' : 'secondary'}
                          className="font-medium"
                        >
                          {proyecto.estado}
                        </Badge>
                        <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <div className="w-20 h-20 mx-auto mb-4 bg-primary/5 rounded-full flex items-center justify-center">
                      <Briefcase className="w-10 h-10 text-primary/50" />
                    </div>
                    <p className="text-sm font-medium mb-1">No hay proyectos registrados</p>
                    <p className="text-xs mb-4">Comienza creando tu primer proyecto</p>
                    <Button size="sm" className="gap-2" onClick={handleCrearProyecto}>
                      <Plus className="w-4 h-4" />
                      Crear Primer Proyecto
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Accesos Rápidos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="group border-primary/20 hover:border-primary hover:shadow-lg transition-all cursor-pointer overflow-hidden">
            <CardContent className="p-6 relative">
              <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-14 h-14 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Building2 className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <p className="font-bold text-foreground">Gestionar Empresas</p>
                  <p className="text-xs text-muted-foreground mt-1">Ver y editar empresas</p>
                </div>
              </div>
              <ArrowUpRight className="absolute bottom-4 right-4 w-5 h-5 text-primary/0 group-hover:text-primary/50 transition-colors" />
            </CardContent>
          </Card>

          <Card className="group border-success/20 hover:border-success hover:shadow-lg transition-all cursor-pointer overflow-hidden">
            <CardContent className="p-6 relative">
              <div className="absolute top-0 right-0 w-20 h-20 bg-success/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-14 h-14 bg-gradient-to-br from-success/20 to-success/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Users className="w-7 h-7 text-success" />
                </div>
                <div>
                  <p className="font-bold text-foreground">Gestionar Usuarios</p>
                  <p className="text-xs text-muted-foreground mt-1">Añadir y modificar usuarios</p>
                </div>
              </div>
              <ArrowUpRight className="absolute bottom-4 right-4 w-5 h-5 text-success/0 group-hover:text-success/50 transition-colors" />
            </CardContent>
          </Card>

          <Card className="group border-info/20 hover:border-info hover:shadow-lg transition-all cursor-pointer overflow-hidden">
            <CardContent className="p-6 relative">
              <div className="absolute top-0 right-0 w-20 h-20 bg-info/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-14 h-14 bg-gradient-to-br from-info/20 to-info/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <BarChart3 className="w-7 h-7 text-info" />
                </div>
                <div>
                  <p className="font-bold text-foreground">Ver Reportes</p>
                  <p className="text-xs text-muted-foreground mt-1">Análisis y estadísticas</p>
                </div>
              </div>
              <ArrowUpRight className="absolute bottom-4 right-4 w-5 h-5 text-info/0 group-hover:text-info/50 transition-colors" />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal de Creación de Proyecto */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={handleCloseModal}></div>
          <div className="relative z-50 w-full max-w-2xl mx-4">
            <Card className="border-primary/20 shadow-2xl">
              <CardHeader className="border-b border-border">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-primary">
                    <Plus className="w-5 h-5" />
                    Crear Nuevo Proyecto
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
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCloseModal}
                    disabled={loading}
                  >
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
  );
}
