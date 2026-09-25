/** Estados de proyecto tal como los envía la API (enum como texto). */
export type EstadoProyecto = 'Planificado' | 'EnCurso' | 'Pausado' | 'Finalizado' | 'Cancelado';

/** Textos para mostrar en pantalla. */
export const ESTADO_PROYECTO_LABELS: Record<EstadoProyecto, string> = {
  Planificado: 'Planificado',
  EnCurso: 'En curso',
  Pausado: 'Pausado',
  Finalizado: 'Finalizado',
  Cancelado: 'Cancelado'
};

export const ESTADOS_PROYECTO = Object.keys(ESTADO_PROYECTO_LABELS) as EstadoProyecto[];

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
