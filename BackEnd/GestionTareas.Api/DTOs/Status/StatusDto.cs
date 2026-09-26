namespace GestionTareas.Api.DTOs.Status;

/// <summary>Estado de la API y de su conexión con la base de datos.</summary>
/// <param name="Api">Siempre "Disponible": si la API no respondiera, no habría respuesta.</param>
/// <param name="BaseDatos">"Conectada" o "Sin conexión".</param>
/// <param name="Fecha">Momento de la verificación (UTC).</param>
public record StatusDto(string Api, string BaseDatos, DateTime Fecha);
