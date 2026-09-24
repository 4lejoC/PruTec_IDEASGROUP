namespace GestionTareas.Api.Exceptions;

/// <summary>El recurso solicitado no existe. Se traduce a HTTP 404.</summary>
public class RecursoNoEncontradoException(string message) : NegocioException(message);
