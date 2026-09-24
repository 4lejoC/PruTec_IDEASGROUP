using System.ComponentModel.DataAnnotations;
using GestionTareas.Api.Enums;

namespace GestionTareas.Api.DTOs.Tareas;

/// <summary>
/// Datos para crear una tarea. El proyecto se indica en la ruta
/// (POST /api/proyectos/{proyectoId}/tareas), no en el cuerpo.
/// </summary>
public class TareaCreateDto
{
    [Required(ErrorMessage = "El título es obligatorio.")]
    [StringLength(200, ErrorMessage = "El título no puede superar 200 caracteres.")]
    public string Titulo { get; set; } = string.Empty;

    [StringLength(1024, ErrorMessage = "La descripción no puede superar 1024 caracteres.")]
    public string? Descripcion { get; set; }

    /// <summary>Opcional: si no se envía, la tarea inicia como Pendiente.</summary>
    [EnumDataType(typeof(EstadoTarea), ErrorMessage = "El estado no es válido.")]
    public EstadoTarea? Estado { get; set; }

    /// <summary>Opcional: si no se envía, la prioridad es Media.</summary>
    [EnumDataType(typeof(PrioridadTarea), ErrorMessage = "La prioridad no es válida.")]
    public PrioridadTarea? Prioridad { get; set; }
}
