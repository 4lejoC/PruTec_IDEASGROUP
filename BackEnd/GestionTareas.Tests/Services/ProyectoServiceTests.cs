using GestionTareas.Api.DTOs.Proyectos;
using GestionTareas.Api.Entities;
using GestionTareas.Api.Enums;
using GestionTareas.Api.Exceptions;
using GestionTareas.Api.Repositories;
using GestionTareas.Api.Services;
using Moq;

namespace GestionTareas.Tests.Services;

/// <summary>
/// Pruebas unitarias de las reglas de negocio de ProyectoService.
/// El repositorio se reemplaza por un mock (Moq), por lo que no se necesita base de datos.
/// Estructura de cada prueba: Arrange (preparar) / Act (ejecutar) / Assert (verificar).
/// </summary>
public class ProyectoServiceTests
{
    private readonly Mock<IProyectoRepository> _repositoryMock = new();
    private readonly ProyectoService _service;

    public ProyectoServiceTests()
    {
        _service = new ProyectoService(_repositoryMock.Object);
    }

    private static Proyecto CrearProyecto(int id = 1) => new()
    {
        Id = id,
        Nombre = "Proyecto de prueba",
        FechaInicio = new DateOnly(2026, 10, 1),
        FechaFinPrevista = new DateOnly(2026, 12, 31),
        Estado = EstadoProyecto.Planificado
    };

    [Fact]
    public async Task EliminarAsync_ProyectoConTareas_LanzaConflictoYNoElimina()
    {
        // Arrange: el proyecto existe y tiene tareas
        var proyecto = CrearProyecto();
        _repositoryMock.Setup(r => r.ObtenerPorIdAsync(proyecto.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(proyecto);
        _repositoryMock.Setup(r => r.TieneTareasAsync(proyecto.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        // Act + Assert: se rechaza la operación
        await Assert.ThrowsAsync<ConflictoException>(() => _service.EliminarAsync(proyecto.Id));

        // y el repositorio nunca recibió la orden de eliminar
        _repositoryMock.Verify(
            r => r.EliminarAsync(It.IsAny<Proyecto>(), It.IsAny<CancellationToken>()),
            Times.Never);
    }

    [Fact]
    public async Task EliminarAsync_ProyectoSinTareas_EliminaUnaVez()
    {
        // Arrange: el proyecto existe y no tiene tareas
        var proyecto = CrearProyecto();
        _repositoryMock.Setup(r => r.ObtenerPorIdAsync(proyecto.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(proyecto);
        _repositoryMock.Setup(r => r.TieneTareasAsync(proyecto.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        // Act
        await _service.EliminarAsync(proyecto.Id);

        // Assert: se eliminó exactamente ese proyecto, una sola vez
        _repositoryMock.Verify(
            r => r.EliminarAsync(proyecto, It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task CrearAsync_FechaFinAnteriorAInicio_LanzaValidacionYNoGuarda()
    {
        // Arrange
        var dto = new ProyectoCreateDto
        {
            Nombre = "Proyecto con fechas inválidas",
            FechaInicio = new DateOnly(2026, 12, 1),
            FechaFinPrevista = new DateOnly(2026, 10, 1)
        };

        // Act + Assert
        await Assert.ThrowsAsync<ValidacionNegocioException>(() => _service.CrearAsync(dto));

        _repositoryMock.Verify(
            r => r.AgregarAsync(It.IsAny<Proyecto>(), It.IsAny<CancellationToken>()),
            Times.Never);
    }

    [Fact]
    public async Task CrearAsync_SinEstado_CreaComoPlanificado()
    {
        // Arrange: no se envía estado
        var dto = new ProyectoCreateDto
        {
            Nombre = "  Proyecto nuevo  ",
            FechaInicio = new DateOnly(2026, 10, 1),
            FechaFinPrevista = new DateOnly(2026, 10, 1) // misma fecha: permitido
        };

        // Act
        var resultado = await _service.CrearAsync(dto);

        // Assert: estado por defecto y nombre sin espacios sobrantes
        Assert.Equal(EstadoProyecto.Planificado, resultado.Estado);
        Assert.Equal("Proyecto nuevo", resultado.Nombre);
        _repositoryMock.Verify(
            r => r.AgregarAsync(It.IsAny<Proyecto>(), It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]

    public async Task ObtenerPorIdAsync_ProyectoInexistente_LanzaNoEncontrado()
    {
        // Arrange: el repositorio no encuentra el proyecto
        const int idInexistente = 999;
        _repositoryMock.Setup(r => r.ObtenerPorIdAsync(idInexistente,It.IsAny<CancellationToken>())).
            ReturnsAsync((Proyecto?)null);

        // Act + Assert: el service debe lanzar RecursoNoEncontradoException
        await Assert.ThrowsAsync<RecursoNoEncontradoException>(
            () => _service.ObtenerPorIdAsync(idInexistente));
    }
}
