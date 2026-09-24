using GestionTareas.Api.DTOs.Common;
using GestionTareas.Api.DTOs.Proyectos;
using GestionTareas.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace GestionTareas.Api.Controllers;

/// <summary>
/// Administración de proyectos.
/// </summary>
/// <remarks>
/// Solo se ocupa de HTTP (rutas y códigos de respuesta); la lógica está en IProyectoService
/// y los errores los traduce GlobalExceptionHandler.
/// [ApiController] valida automáticamente los DTOs y responde 400 si no cumplen.
/// </remarks>
[ApiController]
[Route("api/proyectos")]
[Produces("application/json")]
public class ProyectosController(IProyectoService service) : ControllerBase
{
    /// <summary>Lista los proyectos de forma paginada.</summary>
    /// <remarks>
    /// El filtro por nombre es opcional y busca coincidencias parciales sin distinguir
    /// mayúsculas. La paginación y el filtro se resuelven en la base de datos.
    /// Los resultados se ordenan por nombre.
    /// </remarks>
    /// <param name="filtro">Nombre (opcional), página (desde 1) y tamaño de página (1 a 100).</param>
    /// <param name="ct">Token de cancelación de la petición.</param>
    /// <response code="200">Página de proyectos con el total de registros.</response>
    /// <response code="400">Parámetros de paginación o filtro no válidos.</response>
    [HttpGet]
    [ProducesResponseType(typeof(PagedResult<ProyectoDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<PagedResult<ProyectoDto>>> Listar(
        [FromQuery] ProyectoFiltroQuery filtro, CancellationToken ct)
    {
        return Ok(await service.ListarAsync(filtro, ct));
    }

    /// <summary>Obtiene un proyecto por su código.</summary>
    /// <param name="id">Código del proyecto.</param>
    /// <param name="ct">Token de cancelación de la petición.</param>
    /// <response code="200">Proyecto encontrado.</response>
    /// <response code="404">No existe un proyecto con ese código.</response>
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(ProyectoDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ProyectoDto>> ObtenerPorId(int id, CancellationToken ct)
    {
        return Ok(await service.ObtenerPorIdAsync(id, ct));
    }

    /// <summary>Crea un proyecto.</summary>
    /// <remarks>
    /// Si no se envía el estado, el proyecto se crea como Planificado.
    /// La fecha de fin prevista no puede ser anterior a la fecha de inicio.
    /// </remarks>
    /// <param name="dto">Datos del nuevo proyecto.</param>
    /// <param name="ct">Token de cancelación de la petición.</param>
    /// <response code="201">Proyecto creado; el header Location indica su URL.</response>
    /// <response code="400">Datos no válidos (campos obligatorios, longitudes o fechas).</response>
    [HttpPost]
    [ProducesResponseType(typeof(ProyectoDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ProyectoDto>> Crear(
        [FromBody] ProyectoCreateDto dto, CancellationToken ct)
    {
        var creado = await service.CrearAsync(dto, ct);
        return CreatedAtAction(nameof(ObtenerPorId), new { id = creado.Id }, creado);
    }

    /// <summary>Actualiza todos los datos de un proyecto.</summary>
    /// <remarks>Se deben enviar todos los campos, incluido el estado.</remarks>
    /// <param name="id">Código del proyecto a actualizar.</param>
    /// <param name="dto">Datos actualizados del proyecto.</param>
    /// <param name="ct">Token de cancelación de la petición.</param>
    /// <response code="200">Proyecto actualizado.</response>
    /// <response code="400">Datos no válidos.</response>
    /// <response code="404">No existe un proyecto con ese código.</response>
    [HttpPut("{id:int}")]
    [ProducesResponseType(typeof(ProyectoDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ProyectoDto>> Actualizar(
        int id, [FromBody] ProyectoUpdateDto dto, CancellationToken ct)
    {
        return Ok(await service.ActualizarAsync(id, dto, ct));
    }

    /// <summary>Elimina un proyecto.</summary>
    /// <remarks>Regla de negocio: no se permite eliminar un proyecto que tenga tareas.</remarks>
    /// <param name="id">Código del proyecto a eliminar.</param>
    /// <param name="ct">Token de cancelación de la petición.</param>
    /// <response code="204">Proyecto eliminado.</response>
    /// <response code="404">No existe un proyecto con ese código.</response>
    /// <response code="409">El proyecto tiene tareas asociadas y no puede eliminarse.</response>
    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Eliminar(int id, CancellationToken ct)
    {
        await service.EliminarAsync(id, ct);
        return NoContent();
    }
}
