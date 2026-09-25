import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from '../shared/api.config';
import { PagedResult } from '../shared/paged-result.model';
import { Tarea, TareaFiltro, TareaGuardar } from './tarea.model';
import { construirParams } from '../shared/http-params.util';

/**
 * Comunicación HTTP con la API de tareas.
 * Listar y crear se hacen dentro de un proyecto; obtener, editar y eliminar por código.
 */
@Injectable({ providedIn: 'root' })
export class TareaService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = API_URL;

  listarPorProyecto(proyectoId: number, filtro: TareaFiltro): Observable<PagedResult<Tarea>> {
    const params = construirParams({
      texto: filtro.texto,
      estado: filtro.estado,
      prioridad: filtro.prioridad,
      page: filtro.page,
      pageSize: filtro.pageSize
    });
    return this.http.get<PagedResult<Tarea>>(`${this.apiUrl}/proyectos/${proyectoId}/tareas`, { params });
  }

  obtenerPorId(id: number): Observable<Tarea> {
    return this.http.get<Tarea>(`${this.apiUrl}/tareas/${id}`);
  }

  crear(proyectoId: number, tarea: TareaGuardar): Observable<Tarea> {
    return this.http.post<Tarea>(`${this.apiUrl}/proyectos/${proyectoId}/tareas`, tarea);
  }

  actualizar(id: number, tarea: TareaGuardar): Observable<Tarea> {
    return this.http.put<Tarea>(`${this.apiUrl}/tareas/${id}`, tarea);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/tareas/${id}`);
  }
}
