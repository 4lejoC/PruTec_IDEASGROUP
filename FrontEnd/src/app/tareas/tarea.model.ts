export type EstadoTarea = 'Pendiente' | 'EnProgreso' | 'Bloqueada' | 'Completada';
export type PrioridadTarea = 'Baja' | 'Media' | 'Alta' | 'Critica';

export const ESTADO_TAREA_LABELS: Record<EstadoTarea, string> = {
  Pendiente: 'Pendiente',
  EnProgreso: 'En progreso',
  Bloqueada: 'Bloqueada',
  Completada: 'Completada'
};

export const PRIORIDAD_TAREA_LABELS: Record<PrioridadTarea, string> = {
  Baja: 'Baja',
  Media: 'Media',
  Alta: 'Alta',
  Critica: 'Crítica'
};

export const ESTADOS_TAREA = Object.keys(ESTADO_TAREA_LABELS) as EstadoTarea[];
export const PRIORIDADES_TAREA = Object.keys(PRIORIDAD_TAREA_LABELS) as PrioridadTarea[];

/** Tarea devuelta por la API (TareaDto). */
export interface Tarea {
  id: number;
  proyectoId: number;
  titulo: string;
  descripcion: string | null;
  estado: EstadoTarea;
  prioridad: PrioridadTarea;
  fechaCreacion: string;
  fechaActualizacion: string | null;
}

/** Datos para crear o actualizar una tarea (TareaCreateDto / TareaUpdateDto). */
export interface TareaGuardar {
  titulo: string;
  descripcion: string | null;
  estado: EstadoTarea;
  prioridad: PrioridadTarea;
}

/** Filtros del listado de tareas de un proyecto. */
export interface TareaFiltro {
  texto?: string | null;
  estado?: EstadoTarea | null;
  prioridad?: PrioridadTarea | null;
  page: number;
  pageSize: number;
}
