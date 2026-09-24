using GestionTareas.Api.DTOs.Common;
using GestionTareas.Api.DTOs.Tareas;

namespace GestionTareas.Api.Services;

/// <summary>Casos de uso de tareas. Aplica las reglas de negocio y trabaja con DTOs.</summary>
public interface ITareaService
{
    Task<PagedResult<TareaDto>> ListarPorProyectoAsync(
        int proyectoId, TareaFiltroQuery filtro, CancellationToken ct = default);

    Task<TareaDto> ObtenerPorIdAsync(int id, CancellationToken ct = default);

    Task<TareaDto> CrearAsync(int proyectoId, TareaCreateDto dto, CancellationToken ct = default);

    Task<TareaDto> ActualizarAsync(int id, TareaUpdateDto dto, CancellationToken ct = default);

    Task EliminarAsync(int id, CancellationToken ct = default);
}
