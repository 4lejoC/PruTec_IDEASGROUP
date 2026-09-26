import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { API_URL } from '../shared/api.config';
import { PagedResult } from '../shared/paged-result.model';
import { Proyecto, ProyectoFiltro, ProyectoGuardar } from './proyecto.model';
import { construirParams } from '../shared/http-params.util';
import { ArchivoDescargado, nombreDeArchivo } from '../shared/archivo.util';

/**
 * Comunicación HTTP con /api/proyectos.
 * La URL base viene del archivo .env (API_URL).
 */
@Injectable({ providedIn: 'root' })
export class ProyectoService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_URL}/proyectos`;

  listar(filtro: ProyectoFiltro): Observable<PagedResult<Proyecto>> {
    const params = construirParams({
      nombre: filtro.nombre,
      page: filtro.page,
      pageSize: filtro.pageSize
    });
    return this.http.get<PagedResult<Proyecto>>(this.baseUrl, { params });
  }

  obtenerPorId(id: number): Observable<Proyecto> {
    return this.http.get<Proyecto>(`${this.baseUrl}/${id}`);
  }

  crear(proyecto: ProyectoGuardar): Observable<Proyecto> {
    return this.http.post<Proyecto>(this.baseUrl, proyecto);
  }

  actualizar(id: number, proyecto: ProyectoGuardar): Observable<Proyecto> {
    return this.http.put<Proyecto>(`${this.baseUrl}/${id}`, proyecto);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  /**
   * Reporte PDF del proyecto y sus tareas. Se recibe como archivo (Blob), no como JSON.
   * observe: 'response' da acceso a los encabezados, donde la API envía el nombre del archivo.
   */
  descargarReporte(id: number): Observable<ArchivoDescargado> {
    return this.http
      .get(`${this.baseUrl}/${id}/reporte`, { responseType: 'blob', observe: 'response' })
      .pipe(
        map(respuesta => ({
          contenido: respuesta.body ?? new Blob(),
          nombre: nombreDeArchivo(respuesta.headers.get('Content-Disposition'), `reporte-proyecto-${id}.pdf`)
        }))
      );
  }
}
