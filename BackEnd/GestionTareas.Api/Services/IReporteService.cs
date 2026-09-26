using GestionTareas.Api.Reports;

namespace GestionTareas.Api.Services;

/// <summary>Generación de reportes en PDF.</summary>
public interface IReporteService
{
    /// <summary>
    /// Genera el reporte de un proyecto y todas sus tareas.
    /// Lanza RecursoNoEncontradoException si el proyecto no existe.
    /// </summary>
    Task<ReportePdf> GenerarReporteProyectoAsync(int proyectoId, CancellationToken ct = default);
}
