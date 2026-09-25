import { Injectable, signal } from '@angular/core';
import { Params } from '@angular/router';

/**
 * Recuerda los filtros y la paginación del listado de proyectos mientras el usuario
 * navega por la aplicación. La pantalla de tareas los usa en "volver" y en las migas,
 * para regresar exactamente al mismo punto del listado.
 */
@Injectable({ providedIn: 'root' })
export class ProyectosListadoStore {
  readonly queryParams = signal<Params>({});
}
