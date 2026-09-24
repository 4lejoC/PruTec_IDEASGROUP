using GestionTareas.Api.DTOs.Proyectos;
using GestionTareas.Api.Entities;

namespace GestionTareas.Api.Mappings;

/// <summary>
/// Conversión manual entidad -> DTO. Se prefirió sobre AutoMapper por ser
/// explícita, fácil de depurar y suficiente para dos entidades.
/// </summary>
public static class ProyectoMappings
{
    public static ProyectoDto ToDto(this Proyecto proyecto) => new(
        proyecto.Id,
        proyecto.Nombre,
        proyecto.Descripcion,
        proyecto.FechaInicio,
        proyecto.FechaFinPrevista,
        proyecto.Estado,
        proyecto.FechaCreacion,
        proyecto.FechaActualizacion);
}
