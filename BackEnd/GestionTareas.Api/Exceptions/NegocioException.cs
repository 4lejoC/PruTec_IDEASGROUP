namespace GestionTareas.Api.Exceptions;

/// <summary>
/// Clase base de los errores de negocio. El middleware de errores traduce
/// cada tipo concreto al código HTTP correspondiente, así los Services no
/// dependen de HTTP y los Controllers no necesitan try/catch.
/// </summary>
public abstract class NegocioException(string message) : Exception(message);
