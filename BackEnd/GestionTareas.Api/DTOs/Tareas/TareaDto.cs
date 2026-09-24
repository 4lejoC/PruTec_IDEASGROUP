using GestionTareas.Api.Enums;

namespace GestionTareas.Api.DTOs.Tareas;

/// <summary>Tarea tal como la devuelve la API.</summary>
public record TareaDto(
    int Id,
    int ProyectoId,
    string Titulo,
    string? Descripcion,
    EstadoTarea Estado,
    PrioridadTarea Prioridad,
    DateTime FechaCreacion,
    DateTime? FechaActualizacion);
