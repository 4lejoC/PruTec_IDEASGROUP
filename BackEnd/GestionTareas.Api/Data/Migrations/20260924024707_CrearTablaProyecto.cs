using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace GestionTareas.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class CrearTablaProyecto : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "proyecto",
                columns: table => new
                {
                    proy_codigo = table.Column<int>(type: "integer", nullable: false, comment: "Código único del proyecto, generado automáticamente de forma secuencial por la base de datos.")
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.SerialColumn),
                    proy_nombre = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false, comment: "Nombre del proyecto. Se utiliza para identificarlo en la interfaz y como criterio de búsqueda por coincidencia parcial."),
                    proy_descripcion = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true, comment: "Descripción detallada del alcance u objetivo del proyecto. Campo opcional."),
                    proy_fecha_inicio = table.Column<DateOnly>(type: "date", nullable: false, comment: "Fecha en la que inicia la ejecución del proyecto."),
                    proy_fecha_fin_prevista = table.Column<DateOnly>(type: "date", nullable: false, comment: "Fecha estimada de finalización del proyecto. Debe ser mayor o igual a la fecha de inicio."),
                    proy_estado = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false, comment: "Estado actual del proyecto. Valores permitidos: PLANIFICADO, EN_CURSO, PAUSADO, FINALIZADO, CANCELADO."),
                    proy_fecha_creacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP", comment: "Fecha y hora en que se registró el proyecto en el sistema. Se asigna automáticamente al crearlo."),
                    proy_fecha_actualizacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: true, comment: "Fecha y hora de la última modificación del proyecto. Es nula mientras no haya sido editado.")
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_proyecto", x => x.proy_codigo);
                    table.CheckConstraint("ck_proyecto_fechas", "proy_fecha_fin_prevista >= proy_fecha_inicio");
                    table.CheckConstraint("ckc_proy_estado_proyecto", "proy_estado IN ('PLANIFICADO', 'EN_CURSO', 'PAUSADO', 'FINALIZADO', 'CANCELADO')");
                },
                comment: "Representa una iniciativa de trabajo con un periodo de ejecución definido y un estado, que agrupa un conjunto de tareas.");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "proyecto");
        }
    }
}
