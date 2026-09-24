using GestionTareas.Api.DTOs.Tareas;
using GestionTareas.Api.Entities;
using GestionTareas.Api.Enums;
using GestionTareas.Api.Exceptions;
using GestionTareas.Api.Repositories;
using GestionTareas.Api.Services;
using Moq;

namespace GestionTareas.Tests.Services;

/// <summary>
/// Pruebas unitarias de las reglas de negocio de TareaService.
/// Ambos repositorios se reemplazan por mocks (Moq).
/// </summary>
public class TareaServiceTests
{
    private readonly Mock<ITareaRepository> _tareaRepositoryMock = new();
    private readonly Mock<IProyectoRepository> _proyectoRepositoryMock = new();
    private readonly TareaService _service;

    public TareaServiceTests()
    {
        _service = new TareaService(_tareaRepositoryMock.Object, _proyectoRepositoryMock.Object);
    }

    [Fact]
    public async Task CrearAsync_ProyectoInexistente_LanzaNoEncontradoYNoGuarda()
    {
        // Arrange: el proyecto no existe
        const int proyectoId = 999;
        _proyectoRepositoryMock.Setup(r => r.ExisteAsync(proyectoId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        var dto = new TareaCreateDto { Titulo = "Tarea sin proyecto" };

        // Act + Assert
        await Assert.ThrowsAsync<RecursoNoEncontradoException>(
            () => _service.CrearAsync(proyectoId, dto));

        _tareaRepositoryMock.Verify(
            r => r.AgregarAsync(It.IsAny<Tarea>(), It.IsAny<CancellationToken>()),
            Times.Never);
    }

    [Fact]
    public async Task CrearAsync_SinEstadoNiPrioridad_AsignaPendienteYMedia()
    {
        // Arrange: el proyecto existe; no se envían estado ni prioridad
        const int proyectoId = 1;
        _proyectoRepositoryMock.Setup(r => r.ExisteAsync(proyectoId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        var dto = new TareaCreateDto { Titulo = "Nueva tarea", Descripcion = "   " };

        // Act
        var resultado = await _service.CrearAsync(proyectoId, dto);

        // Assert: valores por defecto, proyecto asignado y descripción vacía convertida en null
        Assert.Equal(EstadoTarea.Pendiente, resultado.Estado);
        Assert.Equal(PrioridadTarea.Media, resultado.Prioridad);
        Assert.Equal(proyectoId, resultado.ProyectoId);
        Assert.Null(resultado.Descripcion);
        _tareaRepositoryMock.Verify(
            r => r.AgregarAsync(It.IsAny<Tarea>(), It.IsAny<CancellationToken>()),
            Times.Once);
    }
}
