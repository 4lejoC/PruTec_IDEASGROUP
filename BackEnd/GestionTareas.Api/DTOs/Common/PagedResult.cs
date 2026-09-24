namespace GestionTareas.Api.DTOs.Common;

/// <summary>
/// Respuesta paginada genérica: los elementos de la página actual
/// más la información necesaria para construir el paginador en el frontend.
/// </summary>
public record PagedResult<T>(
    IReadOnlyList<T> Items,
    int Page,
    int PageSize,
    int TotalCount)
{
    public int TotalPages => PageSize == 0 ? 0 : (int)Math.Ceiling(TotalCount / (double)PageSize);
}
