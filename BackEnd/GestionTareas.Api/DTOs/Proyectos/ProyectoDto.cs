using GestionTareas.Api.Enums;

namespace GestionTareas.Api.DTOs.Proyectos;

/// <summary>Proyecto tal como lo devuelve la API.</summary>
public record ProyectoDto(
    int Id,
    string Nombre,
    string? Descripcion,
    DateOnly FechaInicio,
    DateOnly FechaFinPrevista,
    EstadoProyecto Estado,
    DateTime FechaCreacion,
    DateTime? FechaActualizacion);
