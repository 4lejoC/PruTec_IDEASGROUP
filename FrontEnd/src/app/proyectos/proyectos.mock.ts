import { Proyecto } from './proyecto.model';

/**
 * Datos de ejemplo para construir la pantalla antes de conectar la API.
 * Se eliminarán al conectar ProyectoService (tarea 6).
 */
export const PROYECTOS_MOCK: Proyecto[] = [
  { id: 1, nombre: 'Portal web corporativo', descripcion: 'Rediseño del sitio institucional y migración de contenidos.', fechaInicio: '2026-10-01', fechaFinPrevista: '2026-12-15', estado: 'EnCurso', fechaCreacion: '2026-09-20T14:10:00Z', fechaActualizacion: null },
  { id: 2, nombre: 'App móvil de ventas', descripcion: 'Aplicación para la fuerza de ventas en campo.', fechaInicio: '2026-11-01', fechaFinPrevista: '2027-03-31', estado: 'Planificado', fechaCreacion: '2026-09-21T09:00:00Z', fechaActualizacion: null },
  { id: 3, nombre: 'Migración ERP', descripcion: 'Traslado del ERP local a la nube.', fechaInicio: '2026-01-15', fechaFinPrevista: '2026-06-30', estado: 'Cancelado', fechaCreacion: '2026-01-10T16:30:00Z', fechaActualizacion: '2026-05-02T11:00:00Z' },
  { id: 4, nombre: 'Intranet de recursos humanos', descripcion: null, fechaInicio: '2026-03-01', fechaFinPrevista: '2026-08-31', estado: 'Finalizado', fechaCreacion: '2026-02-20T10:00:00Z', fechaActualizacion: '2026-09-01T08:45:00Z' },
  { id: 5, nombre: 'Tablero de indicadores comerciales', descripcion: 'Dashboard con métricas de ventas por región.', fechaInicio: '2026-09-15', fechaFinPrevista: '2026-11-30', estado: 'EnCurso', fechaCreacion: '2026-09-10T12:00:00Z', fechaActualizacion: null },
  { id: 6, nombre: 'Facturación electrónica', descripcion: 'Integración con el SRI para comprobantes electrónicos.', fechaInicio: '2026-07-01', fechaFinPrevista: '2026-10-31', estado: 'Pausado', fechaCreacion: '2026-06-25T15:20:00Z', fechaActualizacion: '2026-08-15T09:30:00Z' },
  { id: 7, nombre: 'Automatización de inventario', descripcion: 'Lectura de códigos QR en bodega.', fechaInicio: '2027-01-10', fechaFinPrevista: '2027-04-30', estado: 'Planificado', fechaCreacion: '2026-09-22T17:40:00Z', fechaActualizacion: null },
  { id: 8, nombre: 'Portal de clientes', descripcion: 'Autogestión de pedidos y facturas.', fechaInicio: '2026-08-01', fechaFinPrevista: '2026-12-20', estado: 'EnCurso', fechaCreacion: '2026-07-28T13:00:00Z', fechaActualizacion: null },
  { id: 9, nombre: 'Capacitación en ciberseguridad', descripcion: null, fechaInicio: '2026-10-05', fechaFinPrevista: '2026-10-30', estado: 'Planificado', fechaCreacion: '2026-09-18T08:10:00Z', fechaActualizacion: null },
  { id: 10, nombre: 'Rediseño de marca', descripcion: 'Nuevo manual de identidad visual.', fechaInicio: '2026-04-01', fechaFinPrevista: '2026-06-15', estado: 'Finalizado', fechaCreacion: '2026-03-25T10:30:00Z', fechaActualizacion: '2026-06-16T18:00:00Z' },
  { id: 11, nombre: 'Chatbot de soporte', descripcion: 'Atención automática de preguntas frecuentes.', fechaInicio: '2026-12-01', fechaFinPrevista: '2027-02-28', estado: 'Planificado', fechaCreacion: '2026-09-23T11:15:00Z', fechaActualizacion: null },
  { id: 12, nombre: 'Web de eventos 2026', descripcion: 'Micrositio para el congreso anual.', fechaInicio: '2026-05-01', fechaFinPrevista: '2026-07-31', estado: 'Pausado', fechaCreacion: '2026-04-20T14:00:00Z', fechaActualizacion: '2026-07-01T10:00:00Z' }
];
