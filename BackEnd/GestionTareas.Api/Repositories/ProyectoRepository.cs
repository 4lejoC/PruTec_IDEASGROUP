using GestionTareas.Api.Data;
using GestionTareas.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace GestionTareas.Api.Repositories;

public class ProyectoRepository(AppDbContext context) : IProyectoRepository
{
    public async Task<(IReadOnlyList<Proyecto> Items, int TotalCount)> ListarAsync(
        string? nombre, int page, int pageSize, CancellationToken ct = default)
    {
        // AsNoTracking: consulta de solo lectura, EF no necesita seguir los cambios.
        IQueryable<Proyecto> query = context.Proyectos.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(nombre))
        {
            // ILIKE = coincidencia parcial sin distinguir mayúsculas, resuelto en PostgreSQL.
            // Se escapan % y _ para que se busquen como texto literal y no como comodines.
            var patron = PatronBusqueda.Contiene(nombre);
            query = query.Where(p => EF.Functions.ILike(p.Nombre, patron, PatronBusqueda.Escape));
        }

        // Dos consultas: COUNT(*) para el total y SELECT ... LIMIT/OFFSET para la página.
        var totalCount = await query.CountAsync(ct);

        var items = await query
            .OrderBy(p => p.Nombre)
            .ThenBy(p => p.Id) // desempate: orden estable entre páginas
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        return (items, totalCount);
    }

    public Task<Proyecto?> ObtenerPorIdAsync(int id, CancellationToken ct = default) =>
        context.Proyectos.FirstOrDefaultAsync(p => p.Id == id, ct);

    public Task<bool> ExisteAsync(int id, CancellationToken ct = default) =>
        context.Proyectos.AnyAsync(p => p.Id == id, ct);

    // EXISTS en SQL: se detiene en la primera tarea encontrada, no las cuenta todas.
    public Task<bool> TieneTareasAsync(int id, CancellationToken ct = default) =>
        context.Tareas.AnyAsync(t => t.ProyectoId == id, ct);

    public async Task AgregarAsync(Proyecto proyecto, CancellationToken ct = default)
    {
        context.Proyectos.Add(proyecto);
        await context.SaveChangesAsync(ct);
    }

    public async Task ActualizarAsync(Proyecto proyecto, CancellationToken ct = default)
    {
        context.Proyectos.Update(proyecto);
        await context.SaveChangesAsync(ct);
    }

    public async Task EliminarAsync(Proyecto proyecto, CancellationToken ct = default)
    {
        context.Proyectos.Remove(proyecto);
        await context.SaveChangesAsync(ct);
    }
}
