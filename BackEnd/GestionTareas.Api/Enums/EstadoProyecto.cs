namespace GestionTareas.Api.Enums;

/// <summary>
/// Estados posibles de un proyecto.
/// En la base de datos se guardan como texto en mayúsculas (PLANIFICADO, EN_CURSO, ...).
/// </summary>
public enum EstadoProyecto
{
    Planificado,
    EnCurso,
    Pausado,
    Finalizado,
    Cancelado
}
