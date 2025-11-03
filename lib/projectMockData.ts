// Datos mock iniciales para gestión de proyectos empresariales
import { 
  Empresa, 
  Area, 
  Usuario, 
  PuestoDeTrabajo,
  Proyecto, 
  Carpeta, 
  Archivo, 
  Actividad 
} from './projectTypes';

// Empresas
export const empresasMock: Empresa[] = [
  {
    id: 'emp_001',
    nombre: 'Constructora San Juan',
    nit: '800123456-1',
    direccion: 'Calle 45 # 12-34, Bogotá',
    telefono: '+51 967890123',
    email: 'contacto@constructora-san-juan.com',
    activo: true,
    fechaCreacion: new Date('2024-01-01').toISOString(),
    fechaActualizacion: new Date().toISOString()
  },
  {
    id: 'emp_002',
    nombre: 'Consultoría Integral SA',
    nit: '900987654-2',
    direccion: 'Av. El Dorado # 68-12, Bogotá',
    telefono: '+51 961290123',
    email: 'info@consultoria-integral.com',
    activo: true,
    fechaCreacion: new Date('2024-01-15').toISOString(),
    fechaActualizacion: new Date().toISOString()
  }
];

// Áreas
export const areasMock: Area[] = [
  { id: 'area_001', empresaId: 'emp_001', nombre: 'RRHH', descripcion: 'Recursos Humanos', activo: true, fechaCreacion: new Date('2024-01-01').toISOString() },
  { id: 'area_002', empresaId: 'emp_001', nombre: 'Comercial', descripcion: 'Ventas y Marketing', activo: true, fechaCreacion: new Date('2024-01-01').toISOString() },
  { id: 'area_003', empresaId: 'emp_001', nombre: 'Finanzas', descripcion: 'Contabilidad y Finanzas', activo: true, fechaCreacion: new Date('2024-01-01').toISOString() },
  { id: 'area_004', empresaId: 'emp_001', nombre: 'Oficina Central', descripcion: 'Control y Revisión', activo: true, fechaCreacion: new Date('2024-01-01').toISOString() },
  { id: 'area_005', empresaId: 'emp_002', nombre: 'Operaciones', descripcion: 'Gestión de Operaciones', activo: true, fechaCreacion: new Date('2024-01-15').toISOString() }
];

// Puestos de Trabajo
export const puestosDeTrabajoMock: PuestoDeTrabajo[] = [
  { 
    id: 'puesto_001', 
    nombre: 'Vendedor', 
    descripcion: 'Responsable de ventas y atención directa al cliente', 
    departamento: 'Comercial',
    activo: true, 
    fechaCreacion: new Date('2024-01-01').toISOString(),
    fechaActualizacion: new Date().toISOString()
  },
  { 
    id: 'puesto_002', 
    nombre: 'Jefe de Ventas', 
    descripcion: 'Supervisión y coordinación del equipo comercial', 
    departamento: 'Comercial',
    activo: true, 
    fechaCreacion: new Date('2024-01-01').toISOString(),
    fechaActualizacion: new Date().toISOString()
  },
  { 
    id: 'puesto_003', 
    nombre: 'Atención al Cliente', 
    descripcion: 'Soporte y atención a clientes en punto de venta y servicio post-venta', 
    departamento: 'Comercial',
    activo: true, 
    fechaCreacion: new Date('2024-01-01').toISOString(),
    fechaActualizacion: new Date().toISOString()
  },
  { 
    id: 'puesto_004', 
    nombre: 'Asistente Administrativo', 
    descripcion: 'Apoyo en tareas administrativas y logísticas', 
    departamento: 'RRHH',
    activo: true, 
    fechaCreacion: new Date('2024-01-01').toISOString(),
    fechaActualizacion: new Date().toISOString()
  }
];

// Usuarios
export const usuariosMock: Usuario[] = [
  {
    id: 'usr_001',
    username: 'admin',
    password: 'admin123',
    nombre: 'Juan',
    apellidos: 'Pérez',
    email: 'admin@empresa.com',
    telefono: '+51 923748523',
    rol: 'admin',
    areasAsignadas: ['area_001', 'area_002', 'area_003', 'area_004'],
    activo: true,
    fechaCreacion: new Date('2024-01-01').toISOString()
  },
  {
    id: 'usr_002',
    username: 'pm.gonzalez',
    password: 'pm123',
    nombre: 'María',
    apellidos: 'González',
    email: 'maria.gonzalez@empresa.com',
    telefono: '+51 922132523',
    rol: 'pm',
    areasAsignadas: ['area_002'],
    activo: true,
    fechaCreacion: new Date('2024-01-05').toISOString()
  },
  {
    id: 'usr_003',
    username: 'c.rodriguez',
    password: 'col123',
    nombre: 'Carlos',
    apellidos: 'Rodríguez',
    email: 'carlos.rodriguez@empresa.com',
    telefono: '+51 923748526',
    rol: 'colaborador',
    areasAsignadas: ['area_002'],
    activo: true,
    fechaCreacion: new Date('2024-01-10').toISOString()
  },
  {
    id: 'usr_004',
    username: 'pm.lopez',
    password: 'pm123',
    nombre: 'Ana',
    apellidos: 'López',
    email: 'ana.lopez@empresa.com',
    telefono: '+51 951764273',
    rol: 'pm',
    areasAsignadas: ['area_003'],
    activo: true,
    fechaCreacion: new Date('2024-01-08').toISOString()
  },
  {
    id: 'usr_005',
    username: 'control.central',
    password: 'control123',
    nombre: 'Patricia',
    apellidos: 'Martínez',
    email: 'patricia.martinez@empresa.com',
    telefono: '+51 923762123',
    rol: 'oficina_central',
    areasAsignadas: ['area_004'],
    activo: true,
    fechaCreacion: new Date('2024-01-12').toISOString()
  }
];

// Proyectos
export const proyectosMock: Proyecto[] = [
  {
    id: 'proj_001',
    nombre: 'Nueva Sede Corporativa',
    descripcion: 'Construcción y puesta en marcha de la nueva sede principal',
    empresaId: 'emp_001',
    areasAsociadas: ['area_002', 'area_003'],
    estado: 'abierto',
    pmId: 'usr_002',
    miembros: [
      { usuarioId: 'usr_002', rol: 'pm', areaId: 'area_002', fechaAsignacion: new Date('2024-02-01').toISOString() },
      { usuarioId: 'usr_003', rol: 'colaborador', areaId: 'area_002', fechaAsignacion: new Date('2024-02-02').toISOString() }
    ],
    fechaInicio: new Date('2024-02-01').toISOString(),
    fechaFinEstimada: new Date('2024-08-31').toISOString(),
    fechaCreacion: new Date('2024-02-01').toISOString(),
    creadoPor: 'usr_001'
  },
  {
    id: 'proj_002',
    nombre: 'Sistema de Gestión Financiera',
    descripcion: 'Implementación de software ERP para control financiero',
    empresaId: 'emp_002',
    areasAsociadas: ['area_003', 'area_005'],
    estado: 'cerrado',
    pmId: 'usr_004',
    miembros: [
      { usuarioId: 'usr_004', rol: 'pm', areaId: 'area_003', fechaAsignacion: new Date('2024-01-15').toISOString() }
    ],
    fechaInicio: new Date('2024-01-15').toISOString(),
    fechaCierre: new Date('2024-01-31').toISOString(),
    fechaCreacion: new Date('2024-01-15').toISOString(),
    creadoPor: 'usr_001'
  },
  {
    id: 'proj_003',
    nombre: 'Expansión de Planta Industrial',
    descripcion: 'Ampliación de las instalaciones de producción',
    empresaId: 'emp_001',
    areasAsociadas: ['area_002', 'area_003'],
    estado: 'cerrado',
    pmId: 'usr_002',
    miembros: [
      { usuarioId: 'usr_002', rol: 'pm', areaId: 'area_002', fechaAsignacion: new Date('2023-11-01').toISOString() }
    ],
    fechaInicio: new Date('2023-11-01').toISOString(),
    fechaCierre: new Date('2024-01-20').toISOString(),
    fechaCreacion: new Date('2023-11-01').toISOString(),
    creadoPor: 'usr_001'
  },
  {
    id: 'proj_004',
    nombre: 'Modernización de Infraestructura IT',
    descripcion: 'Actualización de servidores y sistemas informáticos',
    empresaId: 'emp_002',
    areasAsociadas: ['area_005'],
    estado: 'aprobado',
    pmId: 'usr_004',
    miembros: [
      { usuarioId: 'usr_004', rol: 'pm', areaId: 'area_005', fechaAsignacion: new Date('2023-12-10').toISOString() }
    ],
    fechaInicio: new Date('2023-12-10').toISOString(),
    fechaCierre: new Date('2024-02-15').toISOString(),
    fechaCreacion: new Date('2023-12-10').toISOString(),
    creadoPor: 'usr_001'
  },
  {
    id: 'proj_005',
    nombre: 'Programa de Capacitación Corporativa',
    descripcion: 'Implementación de programa integral de desarrollo de talento',
    empresaId: 'emp_001',
    areasAsociadas: ['area_001'],
    estado: 'cerrado',
    pmId: 'usr_002',
    miembros: [
      { usuarioId: 'usr_002', rol: 'pm', areaId: 'area_001', fechaAsignacion: new Date('2023-10-15').toISOString() }
    ],
    fechaInicio: new Date('2023-10-15').toISOString(),
    fechaCierre: new Date('2024-01-10').toISOString(),
    fechaCreacion: new Date('2023-10-15').toISOString(),
    creadoPor: 'usr_001'
  },
  {
    id: 'proj_006',
    nombre: 'Implementación de CRM',
    descripcion: 'Despliegue de sistema de gestión de relaciones con clientes',
    empresaId: 'emp_002',
    areasAsociadas: ['area_002', 'area_005'],
    estado: 'cerrado',
    pmId: 'usr_004',
    miembros: [
      { usuarioId: 'usr_004', rol: 'pm', areaId: 'area_005', fechaAsignacion: new Date('2023-09-01').toISOString() }
    ],
    fechaInicio: new Date('2023-09-01').toISOString(),
    fechaCierre: new Date('2023-12-31').toISOString(),
    fechaCreacion: new Date('2023-09-01').toISOString(),
    creadoPor: 'usr_001'
  }
];

// Carpetas
export const carpetasMock: Carpeta[] = [
  {
    id: 'carp_001',
    proyectoId: 'proj_001',
    nombre: 'Planos',
    descripcion: 'Documentación arquitectónica y técnica',
    orden: 1,
    restricciones: {
      tipo: 'por_rol',
      rolesPermitidos: ['pm', 'colaborador']
    },
    fechaCreacion: new Date('2024-02-02').toISOString(),
    creadoPor: 'usr_002'
  },
  {
    id: 'carp_002',
    proyectoId: 'proj_001',
    nombre: 'Contratos',
    descripcion: 'Contratos con proveedores y clientes',
    orden: 2,
    restricciones: {
      tipo: 'por_area',
      areasPermitidas: ['area_003']
    },
    fechaCreacion: new Date('2024-02-02').toISOString(),
    creadoPor: 'usr_002'
  },
  {
    id: 'carp_003',
    proyectoId: 'proj_001',
    nombre: 'Documento Final',
    descripcion: 'Entrega final del proyecto',
    orden: 3,
    restricciones: {
      tipo: 'final'
    },
    fechaCreacion: new Date('2024-02-02').toISOString(),
    creadoPor: 'usr_002'
  },
  // Carpetas finales para proyectos cerrados
  {
    id: 'carp_004',
    proyectoId: 'proj_002',
    nombre: 'Documentos Finales Revisados',
    descripcion: 'Documentación final del proyecto Sistema de Gestión Financiera',
    orden: 1,
    restricciones: {
      tipo: 'final'
    },
    fechaCreacion: new Date('2024-01-31').toISOString(),
    creadoPor: 'usr_005'
  },
  {
    id: 'carp_005',
    proyectoId: 'proj_003',
    nombre: 'Entrega Final - Expansión Planta',
    descripcion: 'Documentos finales revisados de la expansión de planta',
    orden: 1,
    restricciones: {
      tipo: 'final'
    },
    fechaCreacion: new Date('2024-01-20').toISOString(),
    creadoPor: 'usr_005'
  },
  {
    id: 'carp_006',
    proyectoId: 'proj_004',
    nombre: 'Documentación Final Aprobada',
    descripcion: 'Documentos finales del proyecto de modernización IT',
    orden: 1,
    restricciones: {
      tipo: 'final'
    },
    fechaCreacion: new Date('2024-02-15').toISOString(),
    creadoPor: 'usr_005'
  },
  {
    id: 'carp_007',
    proyectoId: 'proj_005',
    nombre: 'Final - Capacitación Corporativa',
    descripcion: 'Documentos finales del programa de capacitación',
    orden: 1,
    restricciones: {
      tipo: 'final'
    },
    fechaCreacion: new Date('2024-01-10').toISOString(),
    creadoPor: 'usr_005'
  },
  {
    id: 'carp_008',
    proyectoId: 'proj_006',
    nombre: 'Documentos Finales CRM',
    descripcion: 'Entrega final del proyecto de implementación CRM',
    orden: 1,
    restricciones: {
      tipo: 'final'
    },
    fechaCreacion: new Date('2023-12-31').toISOString(),
    creadoPor: 'usr_005'
  }
];

// Archivos
export const archivosMock: Archivo[] = [
  {
    id: 'arch_001',
    carpetaId: 'carp_001',
    nombre: 'Plano_Plantas_Baja',
    nombreOriginal: 'Plano Plantas Baja.dwg',
    tipo: 'application/acad',
    tamaño: 2456789,
    extension: 'dwg',
    url: '/files/plano-plantas-baja.dwg',
    version: 1,
    estado: 'activo',
    subidoPor: 'usr_003',
    fechaSubida: new Date('2024-02-05').toISOString(),
    fechaModificacion: new Date('2024-02-05').toISOString()
  },
  {
    id: 'arch_002',
    carpetaId: 'carp_002',
    nombre: 'Contrato_Constructora',
    nombreOriginal: 'Contrato Constructora Principal.pdf',
    tipo: 'application/pdf',
    tamaño: 567890,
    extension: 'pdf',
    url: '/files/contrato-constructora.pdf',
    version: 1,
    estado: 'activo',
    subidoPor: 'usr_004',
    fechaSubida: new Date('2024-02-10').toISOString(),
    fechaModificacion: new Date('2024-02-10').toISOString()
  },
  // Archivos finales para proyecto proj_002 (Sistema de Gestión Financiera)
  {
    id: 'arch_003',
    carpetaId: 'carp_004',
    nombre: 'Informe_Final_ERP',
    nombreOriginal: 'Informe Final Implementación ERP.pdf',
    tipo: 'application/pdf',
    tamaño: 1234567,
    extension: 'pdf',
    url: '/files/informe-final-erp.pdf',
    version: 1,
    estado: 'activo',
    subidoPor: 'usr_005',
    fechaSubida: new Date('2024-01-31').toISOString(),
    fechaModificacion: new Date('2024-01-31').toISOString()
  },
  {
    id: 'arch_004',
    carpetaId: 'carp_004',
    nombre: 'Manual_Usuario_ERP',
    nombreOriginal: 'Manual de Usuario ERP.docx',
    tipo: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    tamaño: 987654,
    extension: 'docx',
    url: '/files/manual-usuario-erp.docx',
    version: 1,
    estado: 'activo',
    subidoPor: 'usr_005',
    fechaSubida: new Date('2024-01-31').toISOString(),
    fechaModificacion: new Date('2024-01-31').toISOString()
  },
  {
    id: 'arch_005',
    carpetaId: 'carp_004',
    nombre: 'Resumen_Ejecutivo_ERP',
    nombreOriginal: 'Resumen Ejecutivo Proyecto ERP.xlsx',
    tipo: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    tamaño: 234567,
    extension: 'xlsx',
    url: '/files/resumen-ejecutivo-erp.xlsx',
    version: 1,
    estado: 'activo',
    subidoPor: 'usr_005',
    fechaSubida: new Date('2024-01-31').toISOString(),
    fechaModificacion: new Date('2024-01-31').toISOString()
  },
  // Archivos finales para proyecto proj_003 (Expansión de Planta)
  {
    id: 'arch_006',
    carpetaId: 'carp_005',
    nombre: 'Informe_Final_Expansion',
    nombreOriginal: 'Informe Final Expansión Planta Industrial.pdf',
    tipo: 'application/pdf',
    tamaño: 3456789,
    extension: 'pdf',
    url: '/files/informe-final-expansion.pdf',
    version: 1,
    estado: 'activo',
    subidoPor: 'usr_005',
    fechaSubida: new Date('2024-01-20').toISOString(),
    fechaModificacion: new Date('2024-01-20').toISOString()
  },
  {
    id: 'arch_007',
    carpetaId: 'carp_005',
    nombre: 'Planos_Finales_Expansion',
    nombreOriginal: 'Planos Finales Expansión.dwg',
    tipo: 'application/acad',
    tamaño: 5678901,
    extension: 'dwg',
    url: '/files/planos-finales-expansion.dwg',
    version: 1,
    estado: 'activo',
    subidoPor: 'usr_005',
    fechaSubida: new Date('2024-01-20').toISOString(),
    fechaModificacion: new Date('2024-01-20').toISOString()
  },
  {
    id: 'arch_008',
    carpetaId: 'carp_005',
    nombre: 'Certificaciones_Finales',
    nombreOriginal: 'Certificaciones Finales.pdf',
    tipo: 'application/pdf',
    tamaño: 890123,
    extension: 'pdf',
    url: '/files/certificaciones-finales.pdf',
    version: 1,
    estado: 'activo',
    subidoPor: 'usr_005',
    fechaSubida: new Date('2024-01-20').toISOString(),
    fechaModificacion: new Date('2024-01-20').toISOString()
  },
  // Archivos finales para proyecto proj_004 (Modernización IT)
  {
    id: 'arch_009',
    carpetaId: 'carp_006',
    nombre: 'Informe_Final_Modernizacion',
    nombreOriginal: 'Informe Final Modernización IT.pdf',
    tipo: 'application/pdf',
    tamaño: 2345678,
    extension: 'pdf',
    url: '/files/informe-final-modernizacion.pdf',
    version: 1,
    estado: 'activo',
    subidoPor: 'usr_005',
    fechaSubida: new Date('2024-02-15').toISOString(),
    fechaModificacion: new Date('2024-02-15').toISOString()
  },
  {
    id: 'arch_010',
    carpetaId: 'carp_006',
    nombre: 'Especificaciones_Tecnicas',
    nombreOriginal: 'Especificaciones Técnicas Servidores.docx',
    tipo: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    tamaño: 1234567,
    extension: 'docx',
    url: '/files/especificaciones-tecnicas.docx',
    version: 1,
    estado: 'activo',
    subidoPor: 'usr_005',
    fechaSubida: new Date('2024-02-15').toISOString(),
    fechaModificacion: new Date('2024-02-15').toISOString()
  },
  // Archivos finales para proyecto proj_005 (Capacitación)
  {
    id: 'arch_011',
    carpetaId: 'carp_007',
    nombre: 'Informe_Final_Capacitacion',
    nombreOriginal: 'Informe Final Programa Capacitación.pdf',
    tipo: 'application/pdf',
    tamaño: 1123456,
    extension: 'pdf',
    url: '/files/informe-final-capacitacion.pdf',
    version: 1,
    estado: 'activo',
    subidoPor: 'usr_005',
    fechaSubida: new Date('2024-01-10').toISOString(),
    fechaModificacion: new Date('2024-01-10').toISOString()
  },
  {
    id: 'arch_012',
    carpetaId: 'carp_007',
    nombre: 'Material_Capacitacion',
    nombreOriginal: 'Material de Capacitación.zip',
    tipo: 'application/zip',
    tamaño: 4567890,
    extension: 'zip',
    url: '/files/material-capacitacion.zip',
    version: 1,
    estado: 'activo',
    subidoPor: 'usr_005',
    fechaSubida: new Date('2024-01-10').toISOString(),
    fechaModificacion: new Date('2024-01-10').toISOString()
  },
  {
    id: 'arch_013',
    carpetaId: 'carp_007',
    nombre: 'Evaluacion_Resultados',
    nombreOriginal: 'Evaluación de Resultados.xlsx',
    tipo: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    tamaño: 345678,
    extension: 'xlsx',
    url: '/files/evaluacion-resultados.xlsx',
    version: 1,
    estado: 'activo',
    subidoPor: 'usr_005',
    fechaSubida: new Date('2024-01-10').toISOString(),
    fechaModificacion: new Date('2024-01-10').toISOString()
  },
  // Archivos finales para proyecto proj_006 (CRM)
  {
    id: 'arch_014',
    carpetaId: 'carp_008',
    nombre: 'Informe_Final_CRM',
    nombreOriginal: 'Informe Final Implementación CRM.pdf',
    tipo: 'application/pdf',
    tamaño: 1789012,
    extension: 'pdf',
    url: '/files/informe-final-crm.pdf',
    version: 1,
    estado: 'activo',
    subidoPor: 'usr_005',
    fechaSubida: new Date('2023-12-31').toISOString(),
    fechaModificacion: new Date('2023-12-31').toISOString()
  },
  {
    id: 'arch_015',
    carpetaId: 'carp_008',
    nombre: 'Configuracion_CRM',
    nombreOriginal: 'Configuración Sistema CRM.docx',
    tipo: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    tamaño: 987654,
    extension: 'docx',
    url: '/files/configuracion-crm.docx',
    version: 1,
    estado: 'activo',
    subidoPor: 'usr_005',
    fechaSubida: new Date('2023-12-31').toISOString(),
    fechaModificacion: new Date('2023-12-31').toISOString()
  },
  {
    id: 'arch_016',
    carpetaId: 'carp_008',
    nombre: 'Manual_CRM',
    nombreOriginal: 'Manual de Usuario CRM.pdf',
    tipo: 'application/pdf',
    tamaño: 2345678,
    extension: 'pdf',
    url: '/files/manual-crm.pdf',
    version: 1,
    estado: 'activo',
    subidoPor: 'usr_005',
    fechaSubida: new Date('2023-12-31').toISOString(),
    fechaModificacion: new Date('2023-12-31').toISOString()
  }
];

// Actividades
export const actividadesMock: Actividad[] = [
  {
    id: 'act_001',
    proyectoId: 'proj_001',
    tipo: 'proyecto_creado',
    usuarioId: 'usr_001',
    descripcion: 'Proyecto creado por Juan Pérez',
    fechaCreacion: new Date('2024-02-01').toISOString()
  },
  {
    id: 'act_002',
    proyectoId: 'proj_001',
    tipo: 'archivo_subido',
    usuarioId: 'usr_003',
    descripcion: 'Carlos Rodríguez subió un archivo en Planos',
    fechaCreacion: new Date('2024-02-05').toISOString()
  },
  {
    id: 'act_003',
    proyectoId: 'proj_001',
    tipo: 'miembro_agregado',
    usuarioId: 'usr_002',
    descripcion: 'María González agregó a Carlos Rodríguez al equipo',
    fechaCreacion: new Date('2024-02-02').toISOString()
  }
];

// Funciones utilitarias
export const getProyectosByEmpresa = (empresaId: string): Proyecto[] => {
  return proyectosMock.filter(p => p.empresaId === empresaId);
};

export const getProyectosByUsuario = (usuarioId: string): Proyecto[] => {
  return proyectosMock.filter(p => 
    p.miembros.some(m => m.usuarioId === usuarioId)
  );
};

export const getCarpetasByProyecto = (proyectoId: string): Carpeta[] => {
  return carpetasMock.filter(c => c.proyectoId === proyectoId).sort((a, b) => a.orden - b.orden);
};

export const getArchivosByCarpeta = (carpetaId: string): Archivo[] => {
  return archivosMock.filter(a => a.carpetaId === carpetaId && a.estado === 'activo');
};

export const getActividadesByProyecto = (proyectoId: string): Actividad[] => {
  return actividadesMock.filter(a => a.proyectoId === proyectoId)
    .sort((a, b) => new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime());
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

