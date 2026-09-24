using GestionTareas.Api.Entities;

namespace GestionTareas.Api.Repositories;

/// <summary>
/// Acceso a datos de proyectos. Solo persistencia: sin reglas de negocio
/// (esas viven en la capa Service).
/// </summary>
public interface IProyectoRepository
{
    /// <summary>
    /// Devuelve una página de proyectos y el total de registros que cumplen el filtro.
    /// Filtro y paginación se resuelven en la base de datos.
    /// </summary>
    Task<(IReadOnlyList<Proyecto> Items, int TotalCount)> ListarAsync(
        string? nombre, int page, int pageSize, CancellationToken ct = default);

    Task<Proyecto?> ObtenerPorIdAsync(int id, CancellationToken ct = default);

    Task<bool> ExisteAsync(int id, CancellationToken ct = default);

    Task<bool> TieneTareasAsync(int id, CancellationToken ct = default);

    Task AgregarAsync(Proyecto proyecto, CancellationToken ct = default);

    Task ActualizarAsync(Proyecto proyecto, CancellationToken ct = default);

    Task EliminarAsync(Proyecto proyecto, CancellationToken ct = default);
}
