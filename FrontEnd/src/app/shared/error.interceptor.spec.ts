import { HttpClient, HttpErrorResponse, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ApiError } from './api-error.model';
import { convertirError, errorInterceptor } from './error.interceptor';

describe('errorInterceptor', () => {
  describe('convertirError', () => {
    it('status 0 (API apagada o sin red): mensaje de conexión', () => {
      const error = convertirError(new HttpErrorResponse({ status: 0 }));

      expect(error.status).toBe(0);
      expect(error.mensaje).toContain('No se pudo conectar con el servidor');
    });

    it('400 de validación: une los mensajes de cada campo y conserva el detalle por campo', () => {
      const errores = {
        Nombre: ['El nombre es obligatorio.'],
        FechaFinPrevista: ['La fecha de fin no puede ser anterior a la de inicio.']
      };

      const error = convertirError(new HttpErrorResponse({ status: 400, error: { title: 'Validación', errors: errores } }));

      expect(error.mensaje).toBe('El nombre es obligatorio. La fecha de fin no puede ser anterior a la de inicio.');
      expect(error.errores).toEqual(errores);
    });

    it('409 con ProblemDetails: muestra el detail que envía el backend', () => {
      const detalle = 'No se puede eliminar el proyecto porque tiene tareas asociadas.';

      const error = convertirError(new HttpErrorResponse({ status: 409, error: { title: 'Conflicto', detail: detalle } }));

      expect(error.mensaje).toBe(detalle);
    });

    it('sin cuerpo: usa un mensaje por defecto según el código', () => {
      const error = convertirError(new HttpErrorResponse({ status: 404 }));

      expect(error.mensaje).toBe('El recurso solicitado no existe.');
    });
  });

  it('entrega un ApiError a quien hizo la petición', () => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptors([errorInterceptor])), provideHttpClientTesting()]
    });
    const http = TestBed.inject(HttpClient);
    const httpMock = TestBed.inject(HttpTestingController);

    let recibido: unknown;
    http.get('/api/proyectos/99').subscribe({ error: e => (recibido = e) });

    httpMock
      .expectOne('/api/proyectos/99')
      .flush({ title: 'Recurso no encontrado', detail: 'No existe un proyecto con el código 99.' },
        { status: 404, statusText: 'Not Found' });

    expect(recibido).toBeInstanceOf(ApiError);
    expect((recibido as ApiError).status).toBe(404);
    expect((recibido as ApiError).mensaje).toBe('No existe un proyecto con el código 99.');
    httpMock.verify();
  });
});
