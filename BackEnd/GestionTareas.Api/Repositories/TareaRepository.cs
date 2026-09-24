using GestionTareas.Api.Data;
using GestionTareas.Api.Entities;
using GestionTareas.Api.Enums;
using Microsoft.EntityFrameworkCore;

namespace GestionTareas.Api.Repositories;

public class TareaRepository(AppDbContext context) : ITareaRepository
{
    public async Task<(IReadOnlyList<Tarea> Items, int TotalCount)> ListarPorProyectoAsync(
        int proyectoId,
        string? texto,
        EstadoTarea? estado,
        PrioridadTarea? prioridad,
        int page,
        int pageSize,
        CancellationToken ct = default)
    {
        // Siempre filtrado por proyecto: usa el índice ix_proyecto_tiene_tareas.
        IQueryable<Tarea> query = context.Tareas
            .AsNoTracking()
            .Where(t => t.ProyectoId == proyectoId);

        // Filtros opcionales: solo se agregan al WHERE si vienen informados.
        if (!string.IsNullOrWhiteSpace(texto))
        {
            var patron = PatronBusqueda.Contiene(texto);
            query = query.Where(t =>
                EF.Functions.ILike(t.Titulo, patron, PatronBusqueda.Escape) ||
                (t.Descripcion != null && EF.Functions.ILike(t.Descripcion, patron, PatronBusqueda.Escape)));
        }

        if (estado.HasValue)
        {
            query = query.Where(t => t.Estado == estado.Value);
        }

        if (prioridad.HasValue)
        {
            query = query.Where(t => t.Prioridad == prioridad.Value);
        }

        var totalCount = await query.CountAsync(ct);

        // Más recientes primero; el Id desempata para un orden estable entre páginas.
        var items = await query
            .OrderByDescending(t => t.FechaCreacion)
            .ThenByDescending(t => t.Id)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        return (items, totalCount);
    }

    public Task<Tarea?> ObtenerPorIdAsync(int id, CancellationToken ct = default) =>
        context.Tareas.FirstOrDefaultAsync(t => t.Id == id, ct);

    public async Task AgregarAsync(Tarea tarea, CancellationToken ct = default)
    {
        context.Tareas.Add(tarea);
        await context.SaveChangesAsync(ct);
    }

    public async Task ActualizarAsync(Tarea tarea, CancellationToken ct = default)
    {
        context.Tareas.Update(tarea);
        await context.SaveChangesAsync(ct);
    }

    public async Task EliminarAsync(Tarea tarea, CancellationToken ct = default)
    {
        context.Tareas.Remove(tarea);
        await context.SaveChangesAsync(ct);
    }
}
