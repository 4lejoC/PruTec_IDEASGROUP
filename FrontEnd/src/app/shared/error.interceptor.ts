import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { ApiError } from './api-error.model';

/**
 * Intercepta todas las respuestas HTTP con error y las convierte en ApiError,
 * con un mensaje listo para mostrar al usuario.
 * Centraliza el manejo de errores: los componentes no interpretan códigos HTTP.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) =>
  next(req).pipe(
    catchError((error: HttpErrorResponse) => throwError(() => convertirError(error)))
  );

export function convertirError(error: HttpErrorResponse): ApiError {
  // status 0: el backend no respondió (apagado, sin red, CORS).
  if (error.status === 0) {
    return new ApiError(0, 'No se pudo conectar con el servidor. Verifique que la API esté en ejecución.');
  }

  // ProblemDetails del backend: { title, detail, errors? }
  const cuerpo = error.error ?? {};
  const errores: Record<string, string[]> = cuerpo.errors ?? {};

  // Errores de validación (400 de [ApiController]): se muestran los mensajes por campo.
  const mensajesValidacion = Object.values(errores).flat();
  if (mensajesValidacion.length > 0) {
    return new ApiError(error.status, mensajesValidacion.join(' '), errores);
  }

  if (typeof cuerpo.detail === 'string' && cuerpo.detail.length > 0) {
    return new ApiError(error.status, cuerpo.detail);
  }

  return new ApiError(error.status, mensajePorDefecto(error.status));
}

function mensajePorDefecto(status: number): string {
  switch (status) {
    case 400: return 'Los datos enviados no son válidos.';
    case 404: return 'El recurso solicitado no existe.';
    case 409: return 'La operación no se puede realizar por un conflicto con los datos actuales.';
    default: return 'Ocurrió un error inesperado. Intente nuevamente.';
  }
}
