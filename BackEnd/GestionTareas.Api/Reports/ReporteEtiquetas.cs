using GestionTareas.Api.Enums;

namespace GestionTareas.Api.Reports;

/// <summary>
/// Texto y color de estados y prioridades para el reporte.
/// Los colores son los mismos que usa el frontend en sus etiquetas.
/// </summary>
public static class ReporteEtiquetas
{
    public static string Texto(EstadoProyecto estado) => estado switch
    {
        EstadoProyecto.Planificado => "Planificado",
        EstadoProyecto.EnCurso => "En curso",
        EstadoProyecto.Pausado => "Pausado",
        EstadoProyecto.Finalizado => "Finalizado",
        EstadoProyecto.Cancelado => "Cancelado",
        _ => estado.ToString()
    };

    public static string Color(EstadoProyecto estado) => estado switch
    {
        EstadoProyecto.Planificado => "#7A5CC2",
        EstadoProyecto.EnCurso => "#2F6FBF",
        EstadoProyecto.Pausado => "#B7791F",
        EstadoProyecto.Finalizado => "#1F8A6A",
        EstadoProyecto.Cancelado => "#C2413B",
        _ => "#645B70"
    };

    public static string Texto(EstadoTarea estado) => estado switch
    {
        EstadoTarea.Pendiente => "Pendiente",
        EstadoTarea.EnProgreso => "En progreso",
        EstadoTarea.Bloqueada => "Bloqueada",
        EstadoTarea.Completada => "Completada",
        _ => estado.ToString()
    };

    public static string Color(EstadoTarea estado) => estado switch
    {
        EstadoTarea.Pendiente => "#7A5CC2",
        EstadoTarea.EnProgreso => "#2F6FBF",
        EstadoTarea.Bloqueada => "#C2413B",
        EstadoTarea.Completada => "#1F8A6A",
        _ => "#645B70"
    };

    public static string Texto(PrioridadTarea prioridad) => prioridad switch
    {
        PrioridadTarea.Baja => "Baja",
        PrioridadTarea.Media => "Media",
        PrioridadTarea.Alta => "Alta",
        PrioridadTarea.Critica => "Crítica",
        _ => prioridad.ToString()
    };

    public static string Color(PrioridadTarea prioridad) => prioridad switch
    {
        PrioridadTarea.Baja => "#6B7280",
        PrioridadTarea.Media => "#2F6FBF",
        PrioridadTarea.Alta => "#C56A1B",
        PrioridadTarea.Critica => "#C2413B",
        _ => "#645B70"
    };
}
