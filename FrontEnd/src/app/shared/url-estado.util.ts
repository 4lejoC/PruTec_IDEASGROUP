import { ParamMap, Params } from '@angular/router';

/**
 * Utilidades para guardar el estado de un listado (filtros y paginación) en la URL.
 * Ej.: /proyectos?nombre=web&page=2&pageSize=20
 */

/** Lee un número de página (base 1 en la URL) y lo devuelve en base 0; si no es válido, 0. */
export function leerPagina(params: ParamMap): number {
  const valor = Number(params.get('page'));
  return Number.isInteger(valor) && valor > 1 ? valor - 1 : 0;
}

/** Lee el tamaño de página solo si es una de las opciones permitidas. */
export function leerTamanio(params: ParamMap, opciones: number[], porDefecto: number): number {
  const valor = Number(params.get('pageSize'));
  return opciones.includes(valor) ? valor : porDefecto;
}

/** Lee un valor que debe pertenecer a una lista cerrada (estado, prioridad); si no, null. */
export function leerOpcion<T extends string>(params: ParamMap, clave: string, opciones: readonly T[]): T | null {
  const valor = params.get(clave);
  return opciones.includes(valor as T) ? (valor as T) : null;
}

/**
 * Arma los query params omitiendo los valores por defecto,
 * para que la URL quede limpia (/proyectos en vez de /proyectos?page=1&pageSize=5).
 */
export function armarQueryParams(valores: Record<string, string | number | null | undefined>): Params {
  const params: Params = {};
  for (const [clave, valor] of Object.entries(valores)) {
    if (valor !== null && valor !== undefined && valor !== '') {
      params[clave] = valor;
    }
  }
  return params;
}
