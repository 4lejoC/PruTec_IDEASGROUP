using GestionTareas.Api.DTOs.Common;
using GestionTareas.Api.DTOs.Tareas;
using GestionTareas.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace GestionTareas.Api.Controllers;

/// <summary>
/// Administración de tareas.
/// </summary>
/// <remarks>
/// El listado y la creación se hacen en el contexto de un proyecto
/// (/api/proyectos/{proyectoId}/tareas); obtener, editar y eliminar usan
/// el código de la tarea (/api/tareas/{id}).
/// </remarks>
[ApiController]
[Route("api")]
[Produces("application/json")]
public class TareasController(ITareaService service) : ControllerBase
{
    /// <summary>Lista las tareas de un proyecto de forma paginada.</summary>
    /// <remarks>
    /// Filtros opcionales: texto (coincidencia parcial en título o descripción),
    /// estado y prioridad. Filtros y paginación se resuelven en la base de datos.
    /// Las tareas se ordenan de la más reciente a la más antigua.
    /// </remarks>
    /// <param name="proyectoId">Código del proyecto.</param>
    /// <param name="filtro">Texto, estado, prioridad, página y tamaño de página.</param>
    /// <param name="ct">Token de cancelación de la petición.</param>
    /// <response code="200">Página de tareas con el total de registros.</response>
    /// <response code="400">Parámetros no válidos.</response>
    /// <response code="404">No existe el proyecto.</response>
    [HttpGet("proyectos/{proyectoId:int}/tareas")]
    [ProducesResponseType(typeof(PagedResult<TareaDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<PagedResult<TareaDto>>> ListarPorProyecto(
        int proyectoId, [FromQuery] TareaFiltroQuery filtro, CancellationToken ct)
    {
        return Ok(await service.ListarPorProyectoAsync(proyectoId, filtro, ct));
    }

    /// <summary>Crea una tarea dentro de un proyecto.</summary>
    /// <remarks>Si no se envían, el estado es Pendiente y la prioridad Media.</remarks>
    /// <param name="proyectoId">Código del proyecto al que pertenecerá la tarea.</param>
    /// <param name="dto">Datos de la nueva tarea.</param>
    /// <param name="ct">Token de cancelación de la petición.</param>
    /// <response code="201">Tarea creada; el header Location indica su URL.</response>
    /// <response code="400">Datos no válidos.</response>
    /// <response code="404">No existe el proyecto.</response>
    [HttpPost("proyectos/{proyectoId:int}/tareas")]
    [ProducesResponseType(typeof(TareaDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<TareaDto>> Crear(
        int proyectoId, [FromBody] TareaCreateDto dto, CancellationToken ct)
    {
        var creada = await service.CrearAsync(proyectoId, dto, ct);
        return CreatedAtAction(nameof(ObtenerPorId), new { id = creada.Id }, creada);
    }

    /// <summary>Obtiene una tarea por su código.</summary>
    /// <param name="id">Código de la tarea.</param>
    /// <param name="ct">Token de cancelación de la petición.</param>
    /// <response code="200">Tarea encontrada.</response>
    /// <response code="404">No existe una tarea con ese código.</response>
    [HttpGet("tareas/{id:int}")]
    [ProducesResponseType(typeof(TareaDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<TareaDto>> ObtenerPorId(int id, CancellationToken ct)
    {
        return Ok(await service.ObtenerPorIdAsync(id, ct));
    }

    /// <summary>Actualiza todos los datos de una tarea.</summary>
    /// <remarks>Se deben enviar todos los campos. El proyecto de la tarea no se puede cambiar.</remarks>
    /// <param name="id">Código de la tarea a actualizar.</param>
    /// <param name="dto">Datos actualizados de la tarea.</param>
    /// <param name="ct">Token de cancelación de la petición.</param>
    /// <response code="200">Tarea actualizada.</response>
    /// <response code="400">Datos no válidos.</response>
    /// <response code="404">No existe una tarea con ese código.</response>
    [HttpPut("tareas/{id:int}")]
    [ProducesResponseType(typeof(TareaDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<TareaDto>> Actualizar(
        int id, [FromBody] TareaUpdateDto dto, CancellationToken ct)
    {
        return Ok(await service.ActualizarAsync(id, dto, ct));
    }

    /// <summary>Elimina una tarea.</summary>
    /// <param name="id">Código de la tarea a eliminar.</param>
    /// <param name="ct">Token de cancelación de la petición.</param>
    /// <response code="204">Tarea eliminada.</response>
    /// <response code="404">No existe una tarea con ese código.</response>
    [HttpDelete("tareas/{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Eliminar(int id, CancellationToken ct)
    {
        await service.EliminarAsync(id, ct);
        return NoContent();
    }
}
