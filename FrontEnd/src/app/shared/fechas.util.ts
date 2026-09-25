/**
 * Conversión entre Date (lo que usa el datepicker) y 'YYYY-MM-DD' (lo que usa la API).
 * No se usa toISOString() porque convierte a UTC y puede correr la fecha un día
 * según la zona horaria (ej. Ecuador, UTC-5).
 */
export function aFechaIso(fecha: Date): string {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
}

export function deFechaIso(iso: string): Date {
  const [anio, mes, dia] = iso.split('-').map(Number);
  return new Date(anio, mes - 1, dia);
}

/** Fecha sin la hora, para comparar solo días. */
export function soloDia(fecha: Date): number {
  return new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate()).getTime();
}
