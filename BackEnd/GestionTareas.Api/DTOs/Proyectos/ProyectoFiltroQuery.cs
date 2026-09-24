using System.ComponentModel.DataAnnotations;
using GestionTareas.Api.DTOs.Common;

namespace GestionTareas.Api.DTOs.Proyectos;

/// <summary>
/// Filtros del listado de proyectos: paginación + nombre (coincidencia parcial).
/// Ejemplo: GET /api/proyectos?nombre=web&amp;page=1&amp;pageSize=10
/// </summary>
public class ProyectoFiltroQuery : PaginacionQuery
{
    [StringLength(150, ErrorMessage = "El filtro de nombre no puede superar 150 caracteres.")]
    public string? Nombre { get; set; }
}
