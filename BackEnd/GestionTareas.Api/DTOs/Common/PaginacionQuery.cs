using System.ComponentModel.DataAnnotations;

namespace GestionTareas.Api.DTOs.Common;

/// <summary>
/// Parámetros de paginación recibidos por query string (?page=1&amp;pageSize=10).
/// Los límites evitan consultas sin tope que carguen toda la tabla.
/// </summary>
public class PaginacionQuery
{
    public const int PageSizeMaximo = 100;

    [Range(1, int.MaxValue, ErrorMessage = "La página debe ser mayor o igual a 1.")]
    public int Page { get; set; } = 1;

    [Range(1, PageSizeMaximo, ErrorMessage = "El tamaño de página debe estar entre 1 y 100.")]
    public int PageSize { get; set; } = 10;
}
