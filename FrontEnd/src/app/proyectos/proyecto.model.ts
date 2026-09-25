import { BadgeInfo } from '../shared/components/badge/badge.component';

/** Estados de proyecto tal como los envía la API (enum como texto). */
export type EstadoProyecto = 'Planificado' | 'EnCurso' | 'Pausado' | 'Finalizado' | 'Cancelado';

/** Texto y color (token CSS) de cada estado para mostrarlo en pantalla. */
export const ESTADO_PROYECTO_UI: Record<EstadoProyecto, BadgeInfo> = {
  Planificado: { texto: 'Planificado', color: 'var(--estado-planificado)' },
  EnCurso: { texto: 'En curso', color: 'var(--estado-en-curso)' },
  Pausado: { texto: 'Pausado', color: 'var(--estado-pausado)' },
  Finalizado: { texto: 'Finalizado', color: 'var(--estado-finalizado)' },
  Cancelado: { texto: 'Cancelado', color: 'var(--estado-cancelado)' }
};

export const ESTADOS_PROYECTO = Object.keys(ESTADO_PROYECTO_UI) as EstadoProyecto[];

/** Proyecto devuelto por la API (ProyectoDto). Fechas en formato ISO. */
export interface Proyecto {
  id: number;
  nombre: string;
  descripcion: string | null;
  fechaInicio: string;        // 'YYYY-MM-DD'
  fechaFinPrevista: string;   // 'YYYY-MM-DD'
  estado: EstadoProyecto;
  fechaCreacion: string;
  fechaActualizacion: string | null;
}

/** Datos para crear o actualizar un proyecto (ProyectoCreateDto / ProyectoUpdateDto). */
export interface ProyectoGuardar {
  nombre: string;
  descripcion: string | null;
  fechaInicio: string;
  fechaFinPrevista: string;
  estado: EstadoProyecto;
}

/** Filtros del listado de proyectos. */
export interface ProyectoFiltro {
  nombre?: string | null;
  page: number;
  pageSize: number;
}
