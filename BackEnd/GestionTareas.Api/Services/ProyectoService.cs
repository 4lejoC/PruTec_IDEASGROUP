using GestionTareas.Api.DTOs.Common;
using GestionTareas.Api.DTOs.Proyectos;
using GestionTareas.Api.Entities;
using GestionTareas.Api.Enums;
using GestionTareas.Api.Exceptions;
using GestionTareas.Api.Mappings;
using GestionTareas.Api.Repositories;

namespace GestionTareas.Api.Services;

public class ProyectoService(IProyectoRepository repository) : IProyectoService
{
    public async Task<PagedResult<ProyectoDto>> ListarAsync(
        ProyectoFiltroQuery filtro, CancellationToken ct = default)
    {
        var (items, totalCount) = await repository.ListarAsync(
            filtro.Nombre, filtro.Page, filtro.PageSize, ct);

        return new PagedResult<ProyectoDto>(
            items.Select(p => p.ToDto()).ToList(),
            filtro.Page,
            filtro.PageSize,
            totalCount);
    }

    public async Task<ProyectoDto> ObtenerPorIdAsync(int id, CancellationToken ct = default)
    {
        var proyecto = await ObtenerExistenteAsync(id, ct);
        return proyecto.ToDto();
    }

    public async Task<ProyectoDto> CrearAsync(ProyectoCreateDto dto, CancellationToken ct = default)
    {
        var (fechaInicio, fechaFin) = ValidarFechas(dto.FechaInicio, dto.FechaFinPrevista);

        var proyecto = new Proyecto
        {
            Nombre = dto.Nombre.Trim(),
            Descripcion = NormalizarTexto(dto.Descripcion),
            FechaInicio = fechaInicio,
            FechaFinPrevista = fechaFin,
            // Si no se envía estado, todo proyecto nuevo inicia como Planificado.
            Estado = dto.Estado ?? EstadoProyecto.Planificado
            // FechaCreacion la asigna la base de datos (DEFAULT CURRENT_TIMESTAMP).
        };

        await repository.AgregarAsync(proyecto, ct);
        return proyecto.ToDto();
    }

    public async Task<ProyectoDto> ActualizarAsync(
        int id, ProyectoUpdateDto dto, CancellationToken ct = default)
    {
        var proyecto = await ObtenerExistenteAsync(id, ct);
        var (fechaInicio, fechaFin) = ValidarFechas(dto.FechaInicio, dto.FechaFinPrevista);

        proyecto.Nombre = dto.Nombre.Trim();
        proyecto.Descripcion = NormalizarTexto(dto.Descripcion);
        proyecto.FechaInicio = fechaInicio;
        proyecto.FechaFinPrevista = fechaFin;
        proyecto.Estado = dto.Estado
            ?? throw new ValidacionNegocioException("El estado es obligatorio.");
        proyecto.FechaActualizacion = DateTime.UtcNow;

        await repository.ActualizarAsync(proyecto, ct);
        return proyecto.ToDto();
    }

    public async Task EliminarAsync(int id, CancellationToken ct = default)
    {
        var proyecto = await ObtenerExistenteAsync(id, ct);

        // Regla de negocio: no se permite eliminar un proyecto que contenga tareas.
        // (La FK con ON DELETE RESTRICT en la base es una segunda línea de defensa.)
        if (await repository.TieneTareasAsync(id, ct))
        {
            throw new ConflictoException(
                "No se puede eliminar el proyecto porque tiene tareas asociadas. " +
                "Elimine primero sus tareas o cambie el estado del proyecto a Cancelado.");
        }

        await repository.EliminarAsync(proyecto, ct);
    }

    // ----------------------------------------------------------------- helpers

    private async Task<Proyecto> ObtenerExistenteAsync(int id, CancellationToken ct) =>
        await repository.ObtenerPorIdAsync(id, ct)
        ?? throw new RecursoNoEncontradoException($"No existe un proyecto con código {id}.");

    /// <summary>
    /// Regla de negocio: la fecha de fin prevista no puede ser anterior a la de inicio.
    /// Se valida aquí para dar un mensaje claro (la base también tiene el CHECK
    /// ck_proyecto_fechas como respaldo).
    /// </summary>
    private static (DateOnly Inicio, DateOnly Fin) ValidarFechas(DateOnly? inicio, DateOnly? fin)
    {
        if (inicio is null || fin is null)
        {
            throw new ValidacionNegocioException("La fecha de inicio y la fecha de fin prevista son obligatorias.");
        }

        if (fin < inicio)
        {
            throw new ValidacionNegocioException(
                "La fecha de fin prevista no puede ser anterior a la fecha de inicio.");
        }

        return (inicio.Value, fin.Value);
    }

    /// <summary>Quita espacios y convierte textos vacíos en null (campo opcional).</summary>
    private static string? NormalizarTexto(string? texto) =>
        string.IsNullOrWhiteSpace(texto) ? null : texto.Trim();
}
