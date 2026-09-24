namespace GestionTareas.Api.Enums;

/// <summary>
/// Estados posibles de una tarea.
/// En la base de datos se guardan como PENDIENTE, EN_PROGRESO, BLOQUEADA, COMPLETADA.
/// </summary>
public enum EstadoTarea
{
    Pendiente,
    EnProgreso,
    Bloqueada,
    Completada
}
