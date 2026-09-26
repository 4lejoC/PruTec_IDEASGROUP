using GestionTareas.Api.Exceptions;
using GestionTareas.Api.Reports;
using GestionTareas.Api.Repositories;

namespace GestionTareas.Api.Services;

/// <summary>
/// Obtiene los datos del reporte desde los repositorios y delega el diseño del
/// documento a <see cref="ProyectoReporte"/>. Así el Service no conoce QuestPDF
/// y el diseño del PDF no conoce la base de datos.
/// </summary>
public class ReporteService(IProyectoRepository proyectoRepository, ITareaRepository tareaRepository)
    : IReporteService
{
    public async Task<ReportePdf> GenerarReporteProyectoAsync(int proyectoId, CancellationToken ct = default)
    {
        var proyecto = await proyectoRepository.ObtenerPorIdAsync(proyectoId, ct)
            ?? throw new RecursoNoEncontradoException($"No existe un proyecto con código {proyectoId}.");

        var tareas = await tareaRepository.ListarTodasPorProyectoAsync(proyectoId, ct);

        var ahora = DateTime.Now;
        return new ReportePdf(
            ProyectoReporte.Generar(proyecto, tareas, ahora),
            ProyectoReporte.NombreArchivo(proyecto, ahora));
    }
}
