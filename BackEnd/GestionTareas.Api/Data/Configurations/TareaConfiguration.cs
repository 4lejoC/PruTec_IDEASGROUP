using GestionTareas.Api.Data.Converters;
using GestionTareas.Api.Entities;
using GestionTareas.Api.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GestionTareas.Api.Data.Configurations;

/// <summary>
/// Mapeo de la entidad Tarea a la tabla "tarea" según el modelo físico
/// (Database/diagramas/modelo-fisico.png).
/// </summary>
public class TareaConfiguration : IEntityTypeConfiguration<Tarea>
{
    public void Configure(EntityTypeBuilder<Tarea> builder)
    {
        builder.ToTable("tarea", tabla =>
        {
            tabla.HasComment("Representa una actividad concreta que forma parte de un proyecto, con su propio estado y prioridad.");

            tabla.HasCheckConstraint(
                "ckc_tar_estado_tarea",
                UpperSnakeCaseEnumConverter<EstadoTarea>.CheckInClause("tar_estado"));

            tabla.HasCheckConstraint(
                "ckc_tar_prioridad_tarea",
                UpperSnakeCaseEnumConverter<PrioridadTarea>.CheckInClause("tar_prioridad"));
        });

        builder.HasKey(t => t.Id)
            .HasName("pk_tarea");

        builder.Property(t => t.Id)
            .HasColumnName("tar_codigo")
            .HasComment("Código único de la tarea, generado automáticamente de forma secuencial por la base de datos.");

        builder.Property(t => t.ProyectoId)
            .HasColumnName("proy_codigo")
            .HasComment("Código del proyecto al que pertenece la tarea. Referencia a PROYECTO.proy_codigo; toda tarea debe estar asociada a un proyecto.");

        builder.Property(t => t.Titulo)
            .HasColumnName("tar_titulo")
            .HasMaxLength(200)
            .IsRequired()
            .HasComment("Título breve que identifica la tarea dentro del proyecto.");

        builder.Property(t => t.Descripcion)
            .HasColumnName("tar_descripcion")
            .HasMaxLength(1024)
            .HasComment("Descripción detallada de la actividad a realizar. Campo opcional.");

        builder.Property(t => t.Estado)
            .HasColumnName("tar_estado")
            .HasMaxLength(20)
            .HasConversion(new UpperSnakeCaseEnumConverter<EstadoTarea>())
            .IsRequired()
            .HasComment("Estado actual de la tarea. Valores permitidos: PENDIENTE, EN_PROGRESO, BLOQUEADA, COMPLETADA.");

        builder.Property(t => t.Prioridad)
            .HasColumnName("tar_prioridad")
            .HasMaxLength(10)
            .HasConversion(new UpperSnakeCaseEnumConverter<PrioridadTarea>())
            .IsRequired()
            .HasComment("Nivel de prioridad de la tarea. Valores permitidos: BAJA, MEDIA, ALTA, CRITICA.");

        builder.Property(t => t.FechaCreacion)
            .HasColumnName("tar_fecha_creacion")
            .HasColumnType("timestamp with time zone")
            .HasDefaultValueSql("CURRENT_TIMESTAMP")
            .HasComment("Fecha y hora en que se registró la tarea en el sistema. Se asigna automáticamente al crearla.");

        builder.Property(t => t.FechaActualizacion)
            .HasColumnName("tar_fecha_actualizacion")
            .HasColumnType("timestamp with time zone")
            .HasComment("Fecha y hora de la última modificación de la tarea. Es nula mientras no haya sido editada.");

        // Relación: un proyecto tiene 0..N tareas; cada tarea pertenece a 1 proyecto.
        // RESTRICT: la base de datos impide eliminar un proyecto que tenga tareas
        // (refuerza la regla de negocio que también se valida en el Service).
        builder.HasOne(t => t.Proyecto)
            .WithMany(p => p.Tareas)
            .HasForeignKey(t => t.ProyectoId)
            .HasConstraintName("fk_tarea_proyecto__proyecto")
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(t => t.ProyectoId)
            .HasDatabaseName("ix_proyecto_tiene_tareas");
    }
}
