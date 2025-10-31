// Tipos base para Gestión de Proyectos Empresariales

export interface Empresa {
  id: string;
  nombre: string;
  nit?: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  activo: boolean;
  fechaCreacion: string;
  fechaActualizacion: string;
}

export interface Area {
  id: string;
  empresaId: string;
  nombre: string;
  descripcion?: string;
  responsableId?: string;
  activo: boolean;
  fechaCreacion: string;
}

export interface Usuario {
  id: string;
  username: string;
  password: string;
  nombre: string;
  apellidos: string;
  email: string;
  telefono?: string;
  rol: 'admin' | 'pm' | 'colaborador' | 'oficina_central';
  areasAsignadas: string[]; // IDs de áreas
  activo: boolean;
  fechaCreacion: string;
}

export interface Proyecto {
  id: string;
  nombre: string;
  descripcion?: string;
  empresaId: string;
  areasAsociadas: string[]; // IDs de áreas
  estado: 'abierto' | 'cerrado' | 'aprobado';
  pmId: string; // Jefe de Proyecto asignado
  miembros: ProyectoMiembro[];
  fechaInicio: string;
  fechaFinEstimada?: string;
  fechaCierre?: string;
  fechaCreacion: string;
  creadoPor: string;
}

export interface ProyectoMiembro {
  usuarioId: string;
  rol: 'pm' | 'colaborador' | 'lector';
  areaId: string;
  fechaAsignacion: string;
}

export interface Carpeta {
  id: string;
  proyectoId: string;
  nombre: string;
  descripcion?: string;
  padreId?: string; // Para carpetas anidadas
  orden: number;
  // Restricciones de acceso
  restricciones: RestriccionAcceso;
  fechaCreacion: string;
  creadoPor: string;
}

export interface RestriccionAcceso {
  rolesPermitidos?: ('pm' | 'colaborador' | 'lector')[];
  areasPermitidas?: string[]; // IDs de áreas
  usuariosPermitidos?: string[]; // IDs específicos de usuarios
  tipo: 'publica' | 'por_rol' | 'por_area' | 'por_usuario' | 'final'; // 'final' es para Documento Final
}

export interface Archivo {
  id: string;
  carpetaId: string;
  nombre: string;
  nombreOriginal: string;
  tipo: string; // mime type
  tamaño: number; // en bytes
  extension: string;
  url: string; // URL simulada
  version: number;
  estado: 'activo' | 'eliminado' | 'obsoleto';
  subidoPor: string;
  fechaSubida: string;
  fechaModificacion: string;
  metadata?: Record<string, string | number | boolean | null>;
}

export interface Actividad {
  id: string;
  proyectoId: string;
  tipo: 'proyecto_creado' | 'archivo_subido' | 'carpeta_creada' | 'miembro_agregado' | 'proyecto_cerrado' | 'proyecto_aprobado' | 'comentario';
  usuarioId: string;
  descripcion: string;
  detalles?: Record<string, string | number | boolean | null>;
  fechaCreacion: string;
}

export interface Comentario {
  id: string;
  proyectoId: string;
  archivoId?: string;
  carpetaId?: string;
  autorId: string;
  contenido: string;
  fechaCreacion: string;
  fechaModificacion?: string;
}

export interface Permiso {
  id: string;
  proyectoId: string;
  usuarioId: string;
  accion: 'leer' | 'escribir' | 'eliminar' | 'administrar';
  recurso: 'carpeta' | 'archivo' | 'proyecto';
  recursoId: string;
  fechaAsignacion: string;
  asignadoPor: string;
}

