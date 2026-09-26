using GestionTareas.Api.Entities;
using GestionTareas.Api.Enums;

namespace GestionTareas.Api.Repositories;

/// <summary>Acceso a datos de tareas. Solo persistencia, sin reglas de negocio.</summary>
public interface ITareaRepository
{
    /// <summary>
    /// Devuelve una página de tareas de un proyecto y el total que cumple los filtros.
    /// Filtros y paginación se resuelven en la base de datos.
    /// </summary>
    Task<(IReadOnlyList<Tarea> Items, int TotalCount)> ListarPorProyectoAsync(
        int proyectoId,
        string? texto,
        EstadoTarea? estado,
        PrioridadTarea? prioridad,
        int page,
        int pageSize,
        CancellationToken ct = default);

    /// <summary>Todas las tareas de un proyecto, sin paginar (para el reporte PDF).</summary>
    Task<IReadOnlyList<Tarea>> ListarTodasPorProyectoAsync(int proyectoId, CancellationToken ct = default);

    Task<Tarea?> ObtenerPorIdAsync(int id, CancellationToken ct = default);

    Task AgregarAsync(Tarea tarea, CancellationToken ct = default);

    Task ActualizarAsync(Tarea tarea, CancellationToken ct = default);

    Task EliminarAsync(Tarea tarea, CancellationToken ct = default);
}
