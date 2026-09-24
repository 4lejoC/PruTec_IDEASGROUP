using GestionTareas.Api.Data.Converters;
using GestionTareas.Api.Entities;
using GestionTareas.Api.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GestionTareas.Api.Data.Configurations;

/// <summary>
/// Mapeo de la entidad Proyecto a la tabla "proyecto" según el modelo físico
/// (Database/diagramas/modelo-fisico.png).
/// </summary>
public class ProyectoConfiguration : IEntityTypeConfiguration<Proyecto>
{
    public void Configure(EntityTypeBuilder<Proyecto> builder)
    {
        builder.ToTable("proyecto", tabla =>
        {
            tabla.HasComment("Representa una iniciativa de trabajo con un periodo de ejecución definido y un estado, que agrupa un conjunto de tareas.");

            tabla.HasCheckConstraint(
                "ck_proyecto_fechas",
                "proy_fecha_fin_prevista >= proy_fecha_inicio");

            tabla.HasCheckConstraint(
                "ckc_proy_estado_proyecto",
                UpperSnakeCaseEnumConverter<EstadoProyecto>.CheckInClause("proy_estado"));
        });

        builder.HasKey(p => p.Id)
            .HasName("pk_proyecto");

        builder.Property(p => p.Id)
            .HasColumnName("proy_codigo")
            .HasComment("Código único del proyecto, generado automáticamente de forma secuencial por la base de datos.");

        builder.Property(p => p.Nombre)
            .HasColumnName("proy_nombre")
            .HasMaxLength(150)
            .IsRequired()
            .HasComment("Nombre del proyecto. Se utiliza para identificarlo en la interfaz y como criterio de búsqueda por coincidencia parcial.");

        builder.Property(p => p.Descripcion)
            .HasColumnName("proy_descripcion")
            .HasMaxLength(1000)
            .HasComment("Descripción detallada del alcance u objetivo del proyecto. Campo opcional.");

        builder.Property(p => p.FechaInicio)
            .HasColumnName("proy_fecha_inicio")
            .HasColumnType("date")
            .HasComment("Fecha en la que inicia la ejecución del proyecto.");

        builder.Property(p => p.FechaFinPrevista)
            .HasColumnName("proy_fecha_fin_prevista")
            .HasColumnType("date")
            .HasComment("Fecha estimada de finalización del proyecto. Debe ser mayor o igual a la fecha de inicio.");

        builder.Property(p => p.Estado)
            .HasColumnName("proy_estado")
            .HasMaxLength(20)
            .HasConversion(new UpperSnakeCaseEnumConverter<EstadoProyecto>())
            .IsRequired()
            .HasComment("Estado actual del proyecto. Valores permitidos: PLANIFICADO, EN_CURSO, PAUSADO, FINALIZADO, CANCELADO.");

        builder.Property(p => p.FechaCreacion)
            .HasColumnName("proy_fecha_creacion")
            .HasColumnType("timestamp with time zone")
            .HasDefaultValueSql("CURRENT_TIMESTAMP")
            .HasComment("Fecha y hora en que se registró el proyecto en el sistema. Se asigna automáticamente al crearlo.");

        builder.Property(p => p.FechaActualizacion)
            .HasColumnName("proy_fecha_actualizacion")
            .HasColumnType("timestamp with time zone")
            .HasComment("Fecha y hora de la última modificación del proyecto. Es nula mientras no haya sido editado.");
    }
}
