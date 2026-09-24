using GestionTareas.Api.DTOs.Common;
using GestionTareas.Api.DTOs.Proyectos;

namespace GestionTareas.Api.Services;

/// <summary>
/// Casos de uso de proyectos. Aplica las reglas de negocio y trabaja con DTOs;
/// no conoce HTTP (eso es del Controller) ni SQL (eso es del Repository).
/// </summary>
public interface IProyectoService
{
    Task<PagedResult<ProyectoDto>> ListarAsync(ProyectoFiltroQuery filtro, CancellationToken ct = default);

    Task<ProyectoDto> ObtenerPorIdAsync(int id, CancellationToken ct = default);

    Task<ProyectoDto> CrearAsync(ProyectoCreateDto dto, CancellationToken ct = default);

    Task<ProyectoDto> ActualizarAsync(int id, ProyectoUpdateDto dto, CancellationToken ct = default);

    Task EliminarAsync(int id, CancellationToken ct = default);
}
