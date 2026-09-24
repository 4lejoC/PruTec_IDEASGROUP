using GestionTareas.Api.DTOs.Common;
using GestionTareas.Api.DTOs.Tareas;
using GestionTareas.Api.Entities;
using GestionTareas.Api.Enums;
using GestionTareas.Api.Exceptions;
using GestionTareas.Api.Mappings;
using GestionTareas.Api.Repositories;

namespace GestionTareas.Api.Services;

public class TareaService(
    ITareaRepository tareaRepository,
    IProyectoRepository proyectoRepository) : ITareaService
{
    public async Task<PagedResult<TareaDto>> ListarPorProyectoAsync(
        int proyectoId, TareaFiltroQuery filtro, CancellationToken ct = default)
    {
        // Se valida el proyecto para distinguir "proyecto inexistente" (404)
        // de "proyecto sin tareas" (200 con lista vacía).
        await ValidarProyectoExisteAsync(proyectoId, ct);

        var (items, totalCount) = await tareaRepository.ListarPorProyectoAsync(
            proyectoId, filtro.Texto, filtro.Estado, filtro.Prioridad,
            filtro.Page, filtro.PageSize, ct);

        return new PagedResult<TareaDto>(
            items.Select(t => t.ToDto()).ToList(),
            filtro.Page,
            filtro.PageSize,
            totalCount);
    }

    public async Task<TareaDto> ObtenerPorIdAsync(int id, CancellationToken ct = default)
    {
        var tarea = await ObtenerExistenteAsync(id, ct);
        return tarea.ToDto();
    }

    public async Task<TareaDto> CrearAsync(
        int proyectoId, TareaCreateDto dto, CancellationToken ct = default)
    {
        // Regla de negocio: toda tarea debe pertenecer a un proyecto existente.
        await ValidarProyectoExisteAsync(proyectoId, ct);

        var tarea = new Tarea
        {
            ProyectoId = proyectoId,
            Titulo = dto.Titulo.Trim(),
            Descripcion = NormalizarTexto(dto.Descripcion),
            // Valores por defecto si no se envían.
            Estado = dto.Estado ?? EstadoTarea.Pendiente,
            Prioridad = dto.Prioridad ?? PrioridadTarea.Media
            // FechaCreacion la asigna la base de datos (DEFAULT CURRENT_TIMESTAMP).
        };

        await tareaRepository.AgregarAsync(tarea, ct);
        return tarea.ToDto();
    }

    public async Task<TareaDto> ActualizarAsync(
        int id, TareaUpdateDto dto, CancellationToken ct = default)
    {
        var tarea = await ObtenerExistenteAsync(id, ct);

        tarea.Titulo = dto.Titulo.Trim();
        tarea.Descripcion = NormalizarTexto(dto.Descripcion);
        tarea.Estado = dto.Estado
            ?? throw new ValidacionNegocioException("El estado es obligatorio.");
        tarea.Prioridad = dto.Prioridad
            ?? throw new ValidacionNegocioException("La prioridad es obligatoria.");
        tarea.FechaActualizacion = DateTime.UtcNow;
        // El proyecto de la tarea no se modifica.

        await tareaRepository.ActualizarAsync(tarea, ct);
        return tarea.ToDto();
    }

    public async Task EliminarAsync(int id, CancellationToken ct = default)
    {
        var tarea = await ObtenerExistenteAsync(id, ct);
        await tareaRepository.EliminarAsync(tarea, ct);
    }

    // ----------------------------------------------------------------- helpers

    private async Task<Tarea> ObtenerExistenteAsync(int id, CancellationToken ct) =>
        await tareaRepository.ObtenerPorIdAsync(id, ct)
        ?? throw new RecursoNoEncontradoException($"No existe una tarea con código {id}.");

    private async Task ValidarProyectoExisteAsync(int proyectoId, CancellationToken ct)
    {
        if (!await proyectoRepository.ExisteAsync(proyectoId, ct))
        {
            throw new RecursoNoEncontradoException($"No existe un proyecto con código {proyectoId}.");
        }
    }

    /// <summary>Quita espacios y convierte textos vacíos en null (campo opcional).</summary>
    private static string? NormalizarTexto(string? texto) =>
        string.IsNullOrWhiteSpace(texto) ? null : texto.Trim();
}
