/**
 * Error normalizado de la API. El interceptor convierte cualquier HttpErrorResponse
 * (ProblemDetails del backend, error de red, etc.) en este formato único, así los
 * componentes muestran siempre `mensaje` sin conocer la estructura del error HTTP.
 */
export class ApiError {
  constructor(
    public readonly status: number,
    public readonly mensaje: string,
    /** Errores de validación por campo (respuesta 400 de [ApiController]). */
    public readonly errores: Record<string, string[]> = {}
  ) {}
}
