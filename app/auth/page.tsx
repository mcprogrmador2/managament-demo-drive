'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Loader2, Briefcase } from 'lucide-react';

// Funciones de autenticación simuladas
import { usuariosProyectosStorage, initializeProjectData } from '@/lib/projectStorage';

const login = (username: string, password: string) => {
  // Buscar usuario en storage
  const usuarios = usuariosProyectosStorage.getAll();
  const usuario = usuarios.find(u => u.username === username && u.password === password);
  
  if (usuario && usuario.activo) {
    const session = {
      usuarioId: usuario.id,
      username: usuario.username,
      rol: usuario.rol,
      timestamp: new Date().toISOString()
    };
    
    localStorage.setItem('proyectos_session', JSON.stringify(session));
    
    return {
      exito: true,
      usuario: session,
      mensaje: 'Inicio de sesión exitoso'
    };
  }
  
  return {
    exito: false,
    usuario: null,
    mensaje: 'Credenciales incorrectas'
  };
};

const recuperarPassword = (username: string, email: string) => {
  // Simulación de recuperación de contraseña
  return {
    exito: true,
    mensaje: `Se ha enviado un enlace de recuperación a ${email}`
  };
};

const isAuthenticated = () => {
  if (typeof window === 'undefined') return false;
  const session = localStorage.getItem('proyectos_session');
  return session !== null;
};

const getRutaPorRol = (rol: string) => {
  const rutas = {
    'admin': '/administradores',
    'pm': '/pm',
    'colaborador': '/colaborador',
    'oficina_central': '/oficina-central',
  };
  return rutas[rol as keyof typeof rutas] || '/auth';
};


export default function AuthPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [recupUsername, setRecupUsername] = useState('');
  const [recupEmail, setRecupEmail] = useState('');

  useEffect(() => {
    initializeProjectData();
    
    if (isAuthenticated()) {
      const session = JSON.parse(localStorage.getItem('proyectos_session') || '{}');
      if (session.rol) {
        router.push(getRutaPorRol(session.rol));
      }
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const resultado = login(username, password);
      
      if (resultado.exito && resultado.usuario) {
        router.push(getRutaPorRol(resultado.usuario.rol));
      } else {
        setError(resultado.mensaje || 'Error al iniciar sesión');
      }
    } catch (err) {
      setError('Error inesperado al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const handleRecuperacion = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMensaje('');
    setLoading(true);

    try {
      const resultado = recuperarPassword(recupUsername, recupEmail);
      
      if (resultado.exito) {
        setMensaje(resultado.mensaje);
        setRecupUsername('');
        setRecupEmail('');
      } else {
        setError(resultado.mensaje);
      }
    } catch (err) {
      setError('Error inesperado al recuperar contraseña');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary to-accent/20 p-4">
      <Card className="w-full max-w-md shadow-lg border-border/50 backdrop-blur-sm">
        <CardHeader className="text-center space-y-6">
          <div className="mx-auto w-20 h-20 mb-2 flex items-center justify-center">
            <div className="w-full h-full bg-primary/10 rounded-full flex items-center justify-center">
              <Briefcase className="w-12 h-12 text-primary" />
            </div>
          </div>
          <div className="space-y-2">
            <CardTitle className="text-3xl font-semibold tracking-tight text-foreground">
              Gestión de Proyectos
            </CardTitle>
            <CardDescription className="text-muted-foreground text-base">
              Plataforma Empresarial
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-muted/50 p-1 rounded-xl">
              <TabsTrigger 
                value="login" 
                className="rounded-lg font-medium transition-all duration-200 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
              >
                Iniciar Sesión
              </TabsTrigger>
              <TabsTrigger 
                value="recuperar"
                className="rounded-lg font-medium transition-all duration-200 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
              >
                Recuperar
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-6">
              <form onSubmit={handleLogin} className="space-y-5">
                {error && (
                  <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-xl flex items-center gap-3">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <span className="text-sm font-medium">{error}</span>
                  </div>
                )}

                <div className="space-y-3">
                  <Label htmlFor="username" className="text-sm font-medium text-foreground">
                    Usuario
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Ingresa tu usuario"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    disabled={loading}
                    className="h-12 rounded-xl border-input/50 bg-background/50 backdrop-blur-sm transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:bg-background"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="password" className="text-sm font-medium text-foreground">
                    Contraseña
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Ingresa tu contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    className="h-12 rounded-xl border-input/50 bg-background/50 backdrop-blur-sm transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:bg-background"
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 rounded-xl font-medium text-base transition-all duration-200 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed" 
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Iniciando sesión...
                    </>
                  ) : (
                    'Iniciar Sesión'
                  )}
                </Button>

                <div className="mt-8 p-5 bg-accent/30 border border-accent/50 rounded-xl">
                  <p className="font-semibold mb-3 text-foreground text-sm flex items-center gap-2">
                    <span className="w-5 h-5 bg-primary/20 rounded-full flex items-center justify-center text-xs">👤</span>
                    Usuarios de prueba:
                  </p>
                  <ul className="space-y-2 text-xs">
                    <li className="flex justify-between items-center py-1">
                      <span className="text-muted-foreground">Admin:</span>
                      <span className="font-mono text-foreground">admin / admin123</span>
                    </li>
                    <li className="flex justify-between items-center py-1">
                      <span className="text-muted-foreground">Jefe Proyecto:</span>
                      <span className="font-mono text-foreground">pm.gonzalez / pm123</span>
                    </li>
                    <li className="flex justify-between items-center py-1">
                      <span className="text-muted-foreground">Colaborador:</span>
                      <span className="font-mono text-foreground">c.rodriguez / col123</span>
                    </li>
                    <li className="flex justify-between items-center py-1">
                      <span className="text-muted-foreground">Oficina Central:</span>
                      <span className="font-mono text-foreground">control.central / control123</span>
                    </li>
                  </ul>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="recuperar" className="space-y-6">
              <form onSubmit={handleRecuperacion} className="space-y-5">
                {error && (
                  <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-xl flex items-center gap-3">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <span className="text-sm font-medium">{error}</span>
                  </div>
                )}

                {mensaje && (
                  <div className="bg-success/10 border border-success/20 text-success px-4 py-3 rounded-xl flex items-center gap-3">
                    <svg className="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm font-medium">{mensaje}</span>
                  </div>
                )}

                <div className="space-y-3">
                  <Label htmlFor="recup-username" className="text-sm font-medium text-foreground">
                    Usuario
                  </Label>
                  <Input
                    id="recup-username"
                    type="text"
                    placeholder="Tu nombre de usuario"
                    value={recupUsername}
                    onChange={(e) => setRecupUsername(e.target.value)}
                    required
                    disabled={loading}
                    className="h-12 rounded-xl border-input/50 bg-background/50 backdrop-blur-sm transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:bg-background"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="recup-email" className="text-sm font-medium text-foreground">
                    Email
                  </Label>
                  <Input
                    id="recup-email"
                    type="email"
                    placeholder="tu@email.com"
                    value={recupEmail}
                    onChange={(e) => setRecupEmail(e.target.value)}
                    required
                    disabled={loading}
                    className="h-12 rounded-xl border-input/50 bg-background/50 backdrop-blur-sm transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:bg-background"
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 rounded-xl font-medium text-base transition-all duration-200 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed" 
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    'Recuperar Contraseña'
                  )}
                </Button>

                <p className="text-xs text-muted-foreground text-center mt-6 leading-relaxed">
                  Recibirás un correo con instrucciones para restablecer tu contraseña.
                </p>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}