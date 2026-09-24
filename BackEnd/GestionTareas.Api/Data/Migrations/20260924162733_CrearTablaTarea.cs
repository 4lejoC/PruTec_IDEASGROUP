using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace GestionTareas.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class CrearTablaTarea : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "tarea",
                columns: table => new
                {
                    tar_codigo = table.Column<int>(type: "integer", nullable: false, comment: "Código único de la tarea, generado automáticamente de forma secuencial por la base de datos.")
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.SerialColumn),
                    proy_codigo = table.Column<int>(type: "integer", nullable: false, comment: "Código del proyecto al que pertenece la tarea. Referencia a PROYECTO.proy_codigo; toda tarea debe estar asociada a un proyecto."),
                    tar_titulo = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false, comment: "Título breve que identifica la tarea dentro del proyecto."),
                    tar_descripcion = table.Column<string>(type: "character varying(1024)", maxLength: 1024, nullable: true, comment: "Descripción detallada de la actividad a realizar. Campo opcional."),
                    tar_estado = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false, comment: "Estado actual de la tarea. Valores permitidos: PENDIENTE, EN_PROGRESO, BLOQUEADA, COMPLETADA."),
                    tar_prioridad = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false, comment: "Nivel de prioridad de la tarea. Valores permitidos: BAJA, MEDIA, ALTA, CRITICA."),
                    tar_fecha_creacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP", comment: "Fecha y hora en que se registró la tarea en el sistema. Se asigna automáticamente al crearla."),
                    tar_fecha_actualizacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: true, comment: "Fecha y hora de la última modificación de la tarea. Es nula mientras no haya sido editada.")
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_tarea", x => x.tar_codigo);
                    table.CheckConstraint("ckc_tar_estado_tarea", "tar_estado IN ('PENDIENTE', 'EN_PROGRESO', 'BLOQUEADA', 'COMPLETADA')");
                    table.CheckConstraint("ckc_tar_prioridad_tarea", "tar_prioridad IN ('BAJA', 'MEDIA', 'ALTA', 'CRITICA')");
                    table.ForeignKey(
                        name: "fk_tarea_proyecto__proyecto",
                        column: x => x.proy_codigo,
                        principalTable: "proyecto",
                        principalColumn: "proy_codigo",
                        onDelete: ReferentialAction.Restrict);
                },
                comment: "Representa una actividad concreta que forma parte de un proyecto, con su propio estado y prioridad.");

            migrationBuilder.CreateIndex(
                name: "ix_proyecto_tiene_tareas",
                table: "tarea",
                column: "proy_codigo");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "tarea");
        }
    }
}
