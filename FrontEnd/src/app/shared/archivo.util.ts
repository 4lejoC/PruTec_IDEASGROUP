/** Archivo recibido de la API junto con el nombre con el que debe guardarse. */
export interface ArchivoDescargado {
  contenido: Blob;
  nombre: string;
}

/**
 * Obtiene el nombre del archivo del encabezado Content-Disposition que envía la API.
 * Ej.: 'attachment; filename=reporte-proyecto-portal-web-2026-09-26.pdf; filename*=UTF-8''...'
 * Si el encabezado no llega, se usa el nombre alternativo.
 */
export function nombreDeArchivo(contentDisposition: string | null, alternativo: string): string {
  const coincidencia = contentDisposition?.match(/filename="?([^";]+)"?/i);
  return coincidencia ? coincidencia[1].trim() : alternativo;
}

/**
 * Hace que el navegador descargue un archivo recibido de la API (por ejemplo, un PDF).
 * Crea una URL temporal para el Blob, simula un clic en un enlace de descarga
 * y luego libera la URL para no dejar memoria ocupada.
 */
export function guardarArchivo(contenido: Blob, nombre: string): void {
  const url = URL.createObjectURL(contenido);
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = nombre;
  enlace.click();
  URL.revokeObjectURL(url);
}
