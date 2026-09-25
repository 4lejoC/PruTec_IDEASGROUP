import { BadgeInfo } from '../shared/components/badge/badge.component';

/** Estados y prioridades tal como los envía la API (enum como texto). */
export type EstadoTarea = 'Pendiente' | 'EnProgreso' | 'Bloqueada' | 'Completada';
export type PrioridadTarea = 'Baja' | 'Media' | 'Alta' | 'Critica';

/** Texto y color (token CSS) de cada valor para mostrarlo en pantalla. */
export const ESTADO_TAREA_UI: Record<EstadoTarea, BadgeInfo> = {
  Pendiente: { texto: 'Pendiente', color: 'var(--estado-pendiente)' },
  EnProgreso: { texto: 'En progreso', color: 'var(--estado-en-progreso)' },
  Bloqueada: { texto: 'Bloqueada', color: 'var(--estado-bloqueada)' },
  Completada: { texto: 'Completada', color: 'var(--estado-completada)' }
};

export const PRIORIDAD_TAREA_UI: Record<PrioridadTarea, BadgeInfo> = {
  Baja: { texto: 'Baja', color: 'var(--prioridad-baja)' },
  Media: { texto: 'Media', color: 'var(--prioridad-media)' },
  Alta: { texto: 'Alta', color: 'var(--prioridad-alta)' },
  Critica: { texto: 'Crítica', color: 'var(--prioridad-critica)' }
};

export const ESTADOS_TAREA = Object.keys(ESTADO_TAREA_UI) as EstadoTarea[];
export const PRIORIDADES_TAREA = Object.keys(PRIORIDAD_TAREA_UI) as PrioridadTarea[];

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
