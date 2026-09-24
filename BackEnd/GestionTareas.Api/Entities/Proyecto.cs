using GestionTareas.Api.Enums;

namespace GestionTareas.Api.Entities;

/// <summary>
/// Iniciativa de trabajo con un periodo de ejecución y un estado, que agrupa tareas.
/// Tabla: proyecto.
/// </summary>
public class Proyecto
{
    public int Id { get; set; }

    public string Nombre { get; set; } = string.Empty;

    public string? Descripcion { get; set; }

    public DateOnly FechaInicio { get; set; }

    public DateOnly FechaFinPrevista { get; set; }

    public EstadoProyecto Estado { get; set; } = EstadoProyecto.Planificado;

    /// <summary>Se asigna en la base de datos (DEFAULT CURRENT_TIMESTAMP).</summary>
    public DateTime FechaCreacion { get; set; }

    /// <summary>Nula mientras el proyecto no haya sido editado.</summary>
    public DateTime? FechaActualizacion { get; set; }

    /// <summary>Tareas del proyecto (relación 1 a 0..N).</summary>
    public ICollection<Tarea> Tareas { get; set; } = new List<Tarea>();
}
