import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_URL } from '../app/shared/api.config';
import { ArchivoDescargado } from '../app/shared/archivo.util';
import { PagedResult } from '../app/shared/paged-result.model';
import { Proyecto } from '../app/proyectos/proyecto.model';
import { ProyectoService } from '../app/proyectos/proyecto.service';

/**
 * HttpTestingController reemplaza al servidor: permite comprobar qué petición
 * arma el servicio (método, URL, parámetros) y simular la respuesta.
 */
describe('ProyectoService', () => {
  let servicio: ProyectoService;
  let httpMock: HttpTestingController;
  const url = `${API_URL}/proyectos`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    servicio = TestBed.inject(ProyectoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  // Falla si quedó alguna petición sin atender o se hizo una inesperada.
  afterEach(() => httpMock.verify());

  it('listar envía el filtro y la paginación como parámetros GET', () => {
    const respuesta: PagedResult<Proyecto> = { items: [], page: 2, pageSize: 5, totalCount: 6, totalPages: 2 };
    let recibido: PagedResult<Proyecto> | undefined;

    servicio.listar({ nombre: ' web ', page: 2, pageSize: 5 }).subscribe(r => (recibido = r));

    const peticion = httpMock.expectOne(req => req.url === url);
    expect(peticion.request.method).toBe('GET');
    expect(peticion.request.params.get('nombre')).toBe('web');
    expect(peticion.request.params.get('page')).toBe('2');
    expect(peticion.request.params.get('pageSize')).toBe('5');

    peticion.flush(respuesta);
    expect(recibido).toEqual(respuesta);
  });

  it('listar no envía el nombre cuando la búsqueda está vacía', () => {
    servicio.listar({ nombre: '', page: 1, pageSize: 5 }).subscribe();

    const peticion = httpMock.expectOne(req => req.url === url);
    expect(peticion.request.params.has('nombre')).toBeFalse();
    peticion.flush({ items: [], page: 1, pageSize: 5, totalCount: 0, totalPages: 0 });
  });

  it('descargarReporte pide el PDF como archivo y toma el nombre que envía la API', () => {
    const pdf = new Blob(['%PDF'], { type: 'application/pdf' });
    let recibido: ArchivoDescargado | undefined;

    servicio.descargarReporte(3).subscribe(r => (recibido = r));

    const peticion = httpMock.expectOne(`${url}/3/reporte`);
    expect(peticion.request.method).toBe('GET');
    expect(peticion.request.responseType).toBe('blob');
    peticion.flush(pdf, {
      headers: { 'Content-Disposition': 'attachment; filename=reporte-proyecto-portal-web-2026-09-26.pdf' }
    });

    expect(recibido?.contenido).toBe(pdf);
    expect(recibido?.nombre).toBe('reporte-proyecto-portal-web-2026-09-26.pdf');
  });

  it('eliminar hace DELETE sobre el proyecto indicado', () => {
    servicio.eliminar(7).subscribe();

    const peticion = httpMock.expectOne(`${url}/7`);
    expect(peticion.request.method).toBe('DELETE');
    peticion.flush(null, { status: 204, statusText: 'No Content' });
  });
});
