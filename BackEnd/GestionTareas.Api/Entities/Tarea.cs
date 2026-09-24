using GestionTareas.Api.Enums;

namespace GestionTareas.Api.Entities;

/// <summary>
/// Actividad concreta que forma parte de un proyecto, con su propio estado y prioridad.
/// Tabla: tarea.
/// </summary>
public class Tarea
{
    public int Id { get; set; }

    /// <summary>Proyecto al que pertenece la tarea (FK obligatoria).</summary>
    public int ProyectoId { get; set; }

    public string Titulo { get; set; } = string.Empty;

    public string? Descripcion { get; set; }

    public EstadoTarea Estado { get; set; } = EstadoTarea.Pendiente;

    public PrioridadTarea Prioridad { get; set; } = PrioridadTarea.Media;

    /// <summary>Se asigna en la base de datos (DEFAULT CURRENT_TIMESTAMP).</summary>
    public DateTime FechaCreacion { get; set; }

    /// <summary>Nula mientras la tarea no haya sido editada.</summary>
    public DateTime? FechaActualizacion { get; set; }

    /// <summary>Navegación al proyecto dueño de la tarea.</summary>
    public Proyecto Proyecto { get; set; } = null!;
}
