using GestionTareas.Api.DTOs.Tareas;
using GestionTareas.Api.Entities;

namespace GestionTareas.Api.Mappings;

/// <summary>Conversión manual entidad Tarea -> TareaDto.</summary>
public static class TareaMappings
{
    public static TareaDto ToDto(this Tarea tarea) => new(
        tarea.Id,
        tarea.ProyectoId,
        tarea.Titulo,
        tarea.Descripcion,
        tarea.Estado,
        tarea.Prioridad,
        tarea.FechaCreacion,
        tarea.FechaActualizacion);
}
