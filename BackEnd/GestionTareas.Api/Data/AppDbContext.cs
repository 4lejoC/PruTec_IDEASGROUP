using GestionTareas.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace GestionTareas.Api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Proyecto> Proyectos => Set<Proyecto>();

    public DbSet<Tarea> Tareas => Set<Tarea>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Las PK se generan como SERIAL, igual que en el modelo físico
        // (por defecto Npgsql usaría columnas IDENTITY).
        modelBuilder.UseSerialColumns();

        // Aplica todas las clases IEntityTypeConfiguration de este proyecto (Data/Configurations).
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }
}
