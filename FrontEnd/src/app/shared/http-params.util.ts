import { HttpParams } from '@angular/common/http';

/**
 * Construye HttpParams omitiendo valores vacíos (null, undefined, '').
 * Así los filtros opcionales no se envían si el usuario no los completó.
 */
export function construirParams(valores: Record<string, string | number | null | undefined>): HttpParams {
  let params = new HttpParams();
  for (const [clave, valor] of Object.entries(valores)) {
    if (valor !== null && valor !== undefined && `${valor}`.trim() !== '') {
      params = params.set(clave, `${valor}`.trim());
    }
  }
  return params;
}
