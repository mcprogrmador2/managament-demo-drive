// Storage Manager para gestión de proyectos empresariales
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
import {
  empresasMock,
  areasMock,
  puestosDeTrabajoMock,
  usuariosMock,
  proyectosMock,
  carpetasMock,
  archivosMock,
  actividadesMock
} from './projectMockData';

class ProjectStorageManager<T> {
  private key: string;

  constructor(key: string) {
    this.key = key;
  }

  private getData(): T[] {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(this.key);
    return data ? JSON.parse(data) : [];
  }

  private setData(data: T[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.key, JSON.stringify(data));
  }

  getAll(): T[] {
    return this.getData();
  }

  getById(id: string): T | undefined {
    const data = this.getData();
    return data.find((item: T) => (item as { id: string }).id === id);
  }

  find(predicate: (item: T) => boolean): T[] {
    const data = this.getData();
    return data.filter(predicate);
  }

  findOne(predicate: (item: T) => boolean): T | undefined {
    const data = this.getData();
    return data.find(predicate);
  }

  create(item: T): T {
    const data = this.getData();
    data.push(item);
    this.setData(data);
    return item;
  }

  update(id: string, updates: Partial<T>): T | undefined {
    const data = this.getData();
    const index = data.findIndex((item: T) => (item as { id: string }).id === id);
    if (index !== -1) {
      data[index] = { ...data[index], ...updates };
      this.setData(data);
      return data[index];
    }
    return undefined;
  }

  delete(id: string): boolean {
    const data = this.getData();
    const filtered = data.filter((item: T) => (item as { id: string }).id !== id);
    this.setData(filtered);
    return filtered.length !== data.length;
  }
}

// Instancias de StorageManager para cada entidad
export const empresasStorage = new ProjectStorageManager<Empresa>('proyectos_empresas');
export const areasStorage = new ProjectStorageManager<Area>('proyectos_areas');
export const usuariosProyectosStorage = new ProjectStorageManager<Usuario>('proyectos_usuarios');
export const puestosDeTrabajoStorage = new ProjectStorageManager<PuestoDeTrabajo>('proyectos_puestos_de_trabajo');
export const proyectosStorage = new ProjectStorageManager<Proyecto>('proyectos_proyectos');
export const carpetasStorage = new ProjectStorageManager<Carpeta>('proyectos_carpetas');
export const archivosStorage = new ProjectStorageManager<Archivo>('proyectos_archivos');
export const actividadesStorage = new ProjectStorageManager<Actividad>('proyectos_actividades');

// Funciones de utilidad
export function generateProjectId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function getCurrentTimestamp(): string {
  return new Date().toISOString();
}

// Inicializar datos mock si no existen
export function initializeProjectData() {
  // Inicializar datos si no existen
  if (empresasStorage.getAll().length === 0) {
    empresasMock.forEach(emp => empresasStorage.create(emp));
  }
  if (areasStorage.getAll().length === 0) {
    areasMock.forEach(area => areasStorage.create(area));
  }
  if (puestosDeTrabajoStorage.getAll().length === 0) {
    puestosDeTrabajoMock.forEach(puesto => puestosDeTrabajoStorage.create(puesto));
  }
  if (usuariosProyectosStorage.getAll().length === 0) {
    usuariosMock.forEach(user => usuariosProyectosStorage.create(user));
  }
  if (proyectosStorage.getAll().length === 0) {
    proyectosMock.forEach(proy => proyectosStorage.create(proy));
  }
  if (carpetasStorage.getAll().length === 0) {
    carpetasMock.forEach(carp => carpetasStorage.create(carp));
  }
  if (archivosStorage.getAll().length === 0) {
    archivosMock.forEach(arch => archivosStorage.create(arch));
  }
  if (actividadesStorage.getAll().length === 0) {
    actividadesMock.forEach(act => actividadesStorage.create(act));
  }

  if (localStorage.getItem('proyectos_data_initialized') !== 'true') {
    localStorage.setItem('proyectos_data_initialized', 'true');
  }
}

// Función para resetear datos
export function resetProjectData() {
  localStorage.removeItem('proyectos_data_initialized');
  localStorage.removeItem('proyectos_empresas');
  localStorage.removeItem('proyectos_areas');
  localStorage.removeItem('proyectos_puestos_de_trabajo');
  localStorage.removeItem('proyectos_usuarios');
  localStorage.removeItem('proyectos_proyectos');
  localStorage.removeItem('proyectos_carpetas');
  localStorage.removeItem('proyectos_archivos');
  localStorage.removeItem('proyectos_actividades');
  initializeProjectData();
}

