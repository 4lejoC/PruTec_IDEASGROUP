using GestionTareas.Api.Exceptions;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

namespace GestionTareas.Api.Handlers;

/// <summary>
/// Manejo centralizado de errores. Traduce las excepciones de negocio a respuestas
/// HTTP con formato estándar ProblemDetails, de modo que:
///  - los Services lanzan excepciones sin conocer HTTP,
///  - los Controllers no necesitan try/catch,
///  - el frontend recibe siempre la misma estructura de error.
/// </summary>
public class GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext, Exception exception, CancellationToken cancellationToken)
    {
        var (status, titulo, detalle) = exception switch
        {
            RecursoNoEncontradoException e => (StatusCodes.Status404NotFound, "Recurso no encontrado", e.Message),
            ValidacionNegocioException e => (StatusCodes.Status400BadRequest, "Datos no válidos", e.Message),
            ConflictoException e => (StatusCodes.Status409Conflict, "Conflicto", e.Message),

            // Error inesperado: se registra en el log y no se exponen detalles internos al cliente.
            _ => (StatusCodes.Status500InternalServerError, "Error interno",
                  "Ocurrió un error inesperado. Intente nuevamente más tarde.")
        };

        if (status == StatusCodes.Status500InternalServerError)
        {
            logger.LogError(exception, "Error no controlado en {Method} {Path}",
                httpContext.Request.Method, httpContext.Request.Path);
        }

        httpContext.Response.StatusCode = status;
        await httpContext.Response.WriteAsJsonAsync(new ProblemDetails
        {
            Status = status,
            Title = titulo,
            Detail = detalle,
            Instance = httpContext.Request.Path
        }, cancellationToken);

        return true; // la excepción quedó manejada
    }
}
