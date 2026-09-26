using System.Text;
using GestionTareas.Api.Entities;
using GestionTareas.Api.Enums;
using GestionTareas.Api.Exceptions;
using GestionTareas.Api.Reports;
using GestionTareas.Api.Repositories;
using GestionTareas.Api.Services;
using Moq;
using QuestPDF.Infrastructure;

namespace GestionTareas.Tests.Services;

/// <summary>
/// Pruebas de ReporteService. Los repositorios se reemplazan por mocks;
/// el PDF sí se genera de verdad con QuestPDF.
/// </summary>
public class ReporteServiceTests
{
    private readonly Mock<IProyectoRepository> _proyectoRepositoryMock = new();
    private readonly Mock<ITareaRepository> _tareaRepositoryMock = new();
    private readonly ReporteService _service;

    public ReporteServiceTests()
    {
        // En la API se configura en Program.cs; las pruebas no pasan por Program.
        QuestPDF.Settings.License = LicenseType.Community;
        _service = new ReporteService(_proyectoRepositoryMock.Object, _tareaRepositoryMock.Object);
    }

    [Fact]
    public async Task GenerarReporteProyectoAsync_ProyectoInexistente_LanzaNoEncontrado()
    {
        // Arrange: el proyecto no existe
        _proyectoRepositoryMock.Setup(r => r.ObtenerPorIdAsync(999, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Proyecto?)null);

        // Act + Assert: no llega a consultar las tareas
        await Assert.ThrowsAsync<RecursoNoEncontradoException>(
            () => _service.GenerarReporteProyectoAsync(999));

        _tareaRepositoryMock.Verify(
            r => r.ListarTodasPorProyectoAsync(It.IsAny<int>(), It.IsAny<CancellationToken>()),
            Times.Never);
    }

    [Fact]
    public async Task GenerarReporteProyectoAsync_ProyectoConTareas_DevuelveUnPdf()
    {
        // Arrange: proyecto con dos tareas
        var proyecto = new Proyecto
        {
            Id = 1,
            Nombre = "Portal web corporativo",
            Descripcion = "Rediseño del sitio institucional.",
            FechaInicio = new DateOnly(2026, 10, 1),
            FechaFinPrevista = new DateOnly(2026, 12, 15),
            Estado = EstadoProyecto.EnCurso
        };
        var tareas = new List<Tarea>
        {
            new() { Id = 1, ProyectoId = 1, Titulo = "Diseñar maqueta", Estado = EstadoTarea.Completada, Prioridad = PrioridadTarea.Alta, FechaCreacion = DateTime.UtcNow },
            new() { Id = 2, ProyectoId = 1, Titulo = "Configurar hosting", Estado = EstadoTarea.Pendiente, Prioridad = PrioridadTarea.Media, FechaCreacion = DateTime.UtcNow }
        };
        _proyectoRepositoryMock.Setup(r => r.ObtenerPorIdAsync(1, It.IsAny<CancellationToken>()))
            .ReturnsAsync(proyecto);
        _tareaRepositoryMock.Setup(r => r.ListarTodasPorProyectoAsync(1, It.IsAny<CancellationToken>()))
            .ReturnsAsync(tareas);

        // Act
        var reporte = await _service.GenerarReporteProyectoAsync(1);

        // Assert: todo archivo PDF empieza con la firma "%PDF"
        Assert.NotEmpty(reporte.Contenido);
        Assert.Equal("%PDF", Encoding.ASCII.GetString(reporte.Contenido, 0, 4));
        Assert.StartsWith("reporte-proyecto-portal-web-corporativo-", reporte.NombreArchivo);
    }

    [Fact]
    public void NombreArchivo_NombreConTildesYSimbolos_GeneraNombreNormalizadoConFecha()
    {
        // Arrange
        var proyecto = new Proyecto { Id = 7, Nombre = "  Migración ERP: año 2026  " };

        // Act
        var nombre = ProyectoReporte.NombreArchivo(proyecto, new DateTime(2026, 9, 26));

        // Assert: sin tildes ni eñes, en minúsculas, con guiones y la fecha al final
        Assert.Equal("reporte-proyecto-migracion-erp-ano-2026-2026-09-26.pdf", nombre);
    }
}
