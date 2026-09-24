namespace GestionTareas.Api.Exceptions;

/// <summary>
/// La operación entra en conflicto con el estado actual de los datos
/// (por ejemplo, eliminar un proyecto que tiene tareas). Se traduce a HTTP 409.
/// </summary>
public class ConflictoException(string message) : NegocioException(message);
