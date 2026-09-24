using System.ComponentModel.DataAnnotations;
using GestionTareas.Api.DTOs.Common;
using GestionTareas.Api.Enums;

namespace GestionTareas.Api.DTOs.Tareas;

/// <summary>
/// Filtros del listado de tareas de un proyecto: paginación + filtros opcionales.
/// Ejemplo: GET /api/proyectos/1/tareas?texto=login&amp;estado=Pendiente&amp;prioridad=Alta&amp;page=1&amp;pageSize=10
/// </summary>
public class TareaFiltroQuery : PaginacionQuery
{
    /// <summary>Búsqueda por texto (coincidencia parcial en título o descripción).</summary>
    [StringLength(200, ErrorMessage = "El texto de búsqueda no puede superar 200 caracteres.")]
    public string? Texto { get; set; }

    /// <summary>Filtra por estado (opcional).</summary>
    [EnumDataType(typeof(EstadoTarea), ErrorMessage = "El estado no es válido.")]
    public EstadoTarea? Estado { get; set; }

    /// <summary>Filtra por prioridad (opcional).</summary>
    [EnumDataType(typeof(PrioridadTarea), ErrorMessage = "La prioridad no es válida.")]
    public PrioridadTarea? Prioridad { get; set; }
}
