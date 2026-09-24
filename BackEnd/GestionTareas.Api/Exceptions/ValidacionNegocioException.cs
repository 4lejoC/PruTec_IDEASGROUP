namespace GestionTareas.Api.Exceptions;

/// <summary>
/// Los datos son sintácticamente válidos pero violan una regla de negocio
/// (por ejemplo, fecha de fin anterior a la de inicio). Se traduce a HTTP 400.
/// </summary>
public class ValidacionNegocioException(string message) : NegocioException(message);
