using GestionTareas.Api.Data;
using GestionTareas.Api.DTOs.Status;
using Microsoft.AspNetCore.Mvc;

namespace GestionTareas.Api.Controllers;

/// <summary>
/// Verificación del estado del servicio.
/// </summary>
/// <remarks>
/// Es una comprobación de infraestructura, no una operación de negocio: por eso usa el
/// DbContext directamente en lugar de pasar por las capas Service y Repository.
/// </remarks>
[ApiController]
[Route("api/status")]
[Produces("application/json")]
public class StatusController(AppDbContext context) : ControllerBase
{
    /// <summary>Tiempo máximo para intentar conectar con la base de datos.</summary>
    private static readonly TimeSpan TiempoMaximo = TimeSpan.FromSeconds(5);

    /// <summary>Indica si la API está disponible y si puede conectarse con la base de datos.</summary>
    /// <remarks>
    /// Abre una conexión con PostgreSQL (sin consultar tablas). Si no lo logra en 5 segundos,
    /// considera que no hay conexión.
    /// </remarks>
    /// <param name="ct">Token de cancelación de la petición.</param>
    /// <response code="200">API disponible y base de datos conectada.</response>
    /// <response code="503">API disponible pero sin conexión con la base de datos.</response>
    [HttpGet]
    [ProducesResponseType(typeof(StatusDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(StatusDto), StatusCodes.Status503ServiceUnavailable)]
    public async Task<ActionResult<StatusDto>> Obtener(CancellationToken ct)
    {
        var conectada = await PuedeConectarAsync(ct);

        var estado = new StatusDto(
            Api: "Disponible",
            BaseDatos: conectada ? "Conectada" : "Sin conexión",
            Fecha: DateTime.UtcNow);

        return conectada
            ? Ok(estado)
            : StatusCode(StatusCodes.Status503ServiceUnavailable, estado);
    }

    private async Task<bool> PuedeConectarAsync(CancellationToken ct)
    {
        // Se combina la cancelación de la petición con el tiempo máximo propio.
        using var limite = CancellationTokenSource.CreateLinkedTokenSource(ct);
        limite.CancelAfter(TiempoMaximo);

        try
        {
            // CanConnectAsync devuelve false si la conexión falla (servidor apagado, credenciales, etc.).
            return await context.Database.CanConnectAsync(limite.Token);
        }
        catch (OperationCanceledException) when (!ct.IsCancellationRequested)
        {
            // Se agotó el tiempo máximo (no fue el cliente quien canceló).
            return false;
        }
    }
}
