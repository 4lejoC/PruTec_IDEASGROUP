import { Tarea } from './tarea.model';

/**
 * Datos de ejemplo para construir la pantalla antes de conectar la API.
 * Se eliminarán al conectar TareaService (tarea 6).
 */
export const TAREAS_MOCK: Tarea[] = [
  // Proyecto 1 · Portal web corporativo
  { id: 1, proyectoId: 1, titulo: 'Diseñar pantalla de inicio', descripcion: 'Maquetas en alta fidelidad para escritorio y móvil.', estado: 'Completada', prioridad: 'Alta', fechaCreacion: '2026-10-02T09:00:00Z', fechaActualizacion: '2026-10-10T16:00:00Z' },
  { id: 2, proyectoId: 1, titulo: 'Migrar noticias del sitio anterior', descripcion: 'Exportar 300 publicaciones y revisar imágenes.', estado: 'EnProgreso', prioridad: 'Media', fechaCreacion: '2026-10-05T11:30:00Z', fechaActualizacion: null },
  { id: 3, proyectoId: 1, titulo: 'Configurar certificado SSL', descripcion: null, estado: 'Bloqueada', prioridad: 'Critica', fechaCreacion: '2026-10-08T15:45:00Z', fechaActualizacion: null },

  // Proyecto 4 · Intranet de recursos humanos
  { id: 4, proyectoId: 4, titulo: 'Módulo de vacaciones', descripcion: 'Solicitud y aprobación de vacaciones.', estado: 'Completada', prioridad: 'Alta', fechaCreacion: '2026-03-03T10:00:00Z', fechaActualizacion: '2026-04-20T12:00:00Z' },
  { id: 5, proyectoId: 4, titulo: 'Directorio de empleados', descripcion: null, estado: 'Completada', prioridad: 'Media', fechaCreacion: '2026-03-05T10:00:00Z', fechaActualizacion: '2026-05-02T09:00:00Z' },
  { id: 6, proyectoId: 4, titulo: 'Integración con nómina', descripcion: 'Consumir el servicio de nómina para mostrar roles de pago.', estado: 'Completada', prioridad: 'Critica', fechaCreacion: '2026-04-01T08:00:00Z', fechaActualizacion: '2026-07-15T17:30:00Z' },
  { id: 7, proyectoId: 4, titulo: 'Capacitación a usuarios', descripcion: null, estado: 'Completada', prioridad: 'Baja', fechaCreacion: '2026-08-01T14:00:00Z', fechaActualizacion: '2026-08-25T11:00:00Z' },
  { id: 8, proyectoId: 4, titulo: 'Manual de usuario', descripcion: 'Guía en PDF con capturas.', estado: 'Completada', prioridad: 'Baja', fechaCreacion: '2026-08-10T09:30:00Z', fechaActualizacion: '2026-08-30T10:00:00Z' },

  // Proyecto 5 · Tablero de indicadores comerciales
  { id: 9, proyectoId: 5, titulo: 'Definir indicadores con gerencia', descripcion: 'Ventas, margen y cumplimiento de metas por región.', estado: 'Completada', prioridad: 'Alta', fechaCreacion: '2026-09-15T09:00:00Z', fechaActualizacion: '2026-09-20T18:00:00Z' },
  { id: 10, proyectoId: 5, titulo: 'Conectar fuente de datos de ventas', descripcion: null, estado: 'EnProgreso', prioridad: 'Critica', fechaCreacion: '2026-09-21T10:15:00Z', fechaActualizacion: null },

  // Proyecto 6 · Facturación electrónica
  { id: 11, proyectoId: 6, titulo: 'Obtener firma electrónica', descripcion: 'Trámite pendiente con la entidad certificadora.', estado: 'Bloqueada', prioridad: 'Critica', fechaCreacion: '2026-07-02T08:00:00Z', fechaActualizacion: '2026-08-15T09:30:00Z' },

  // Proyecto 8 · Portal de clientes
  { id: 12, proyectoId: 8, titulo: 'Inicio de sesión de clientes', descripcion: null, estado: 'Completada', prioridad: 'Critica', fechaCreacion: '2026-08-02T09:00:00Z', fechaActualizacion: '2026-08-20T15:00:00Z' },
  { id: 13, proyectoId: 8, titulo: 'Historial de pedidos', descripcion: 'Listado con filtros por fecha y estado.', estado: 'EnProgreso', prioridad: 'Alta', fechaCreacion: '2026-08-15T11:00:00Z', fechaActualizacion: null },
  { id: 14, proyectoId: 8, titulo: 'Descarga de facturas', descripcion: null, estado: 'Pendiente', prioridad: 'Media', fechaCreacion: '2026-09-01T10:00:00Z', fechaActualizacion: null },
  { id: 15, proyectoId: 8, titulo: 'Notificaciones por correo', descripcion: 'Aviso de cambio de estado del pedido.', estado: 'Pendiente', prioridad: 'Baja', fechaCreacion: '2026-09-10T16:20:00Z', fechaActualizacion: null },

  // Proyecto 10 · Rediseño de marca
  { id: 16, proyectoId: 10, titulo: 'Investigación de marca', descripcion: null, estado: 'Completada', prioridad: 'Alta', fechaCreacion: '2026-04-02T09:00:00Z', fechaActualizacion: '2026-04-15T12:00:00Z' },
  { id: 17, proyectoId: 10, titulo: 'Propuestas de logotipo', descripcion: 'Tres propuestas para presentar al directorio.', estado: 'Completada', prioridad: 'Alta', fechaCreacion: '2026-04-16T10:00:00Z', fechaActualizacion: '2026-05-05T14:00:00Z' },
  { id: 18, proyectoId: 10, titulo: 'Paleta de colores', descripcion: null, estado: 'Completada', prioridad: 'Media', fechaCreacion: '2026-05-06T09:00:00Z', fechaActualizacion: '2026-05-12T11:00:00Z' },
  { id: 19, proyectoId: 10, titulo: 'Tipografías corporativas', descripcion: null, estado: 'Completada', prioridad: 'Baja', fechaCreacion: '2026-05-13T09:00:00Z', fechaActualizacion: '2026-05-20T11:00:00Z' },
  { id: 20, proyectoId: 10, titulo: 'Manual de identidad', descripcion: 'Documento final con usos correctos e incorrectos.', estado: 'Completada', prioridad: 'Alta', fechaCreacion: '2026-05-21T09:00:00Z', fechaActualizacion: '2026-06-10T17:00:00Z' },
  { id: 21, proyectoId: 10, titulo: 'Aplicación en papelería', descripcion: null, estado: 'Completada', prioridad: 'Baja', fechaCreacion: '2026-06-01T09:00:00Z', fechaActualizacion: '2026-06-15T10:00:00Z' },

  // Proyecto 12 · Web de eventos 2026
  { id: 22, proyectoId: 12, titulo: 'Formulario de inscripción', descripcion: 'Con cupos limitados por taller.', estado: 'EnProgreso', prioridad: 'Alta', fechaCreacion: '2026-05-03T10:00:00Z', fechaActualizacion: null },
  { id: 23, proyectoId: 12, titulo: 'Pasarela de pagos', descripcion: null, estado: 'Bloqueada', prioridad: 'Critica', fechaCreacion: '2026-05-20T15:00:00Z', fechaActualizacion: '2026-07-01T10:00:00Z' }
];
