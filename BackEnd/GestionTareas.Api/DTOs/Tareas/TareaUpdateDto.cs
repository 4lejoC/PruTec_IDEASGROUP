using System.ComponentModel.DataAnnotations;
using GestionTareas.Api.Enums;

namespace GestionTareas.Api.DTOs.Tareas;

/// <summary>
/// Datos para editar una tarea (PUT: se envían todos los campos).
/// El proyecto de una tarea no se puede cambiar.
/// </summary>
public class TareaUpdateDto
{
    [Required(ErrorMessage = "El título es obligatorio.")]
    [StringLength(200, ErrorMessage = "El título no puede superar 200 caracteres.")]
    public string Titulo { get; set; } = string.Empty;

    [StringLength(1024, ErrorMessage = "La descripción no puede superar 1024 caracteres.")]
    public string? Descripcion { get; set; }

    [Required(ErrorMessage = "El estado es obligatorio.")]
    [EnumDataType(typeof(EstadoTarea), ErrorMessage = "El estado no es válido.")]
    public EstadoTarea? Estado { get; set; }

    [Required(ErrorMessage = "La prioridad es obligatoria.")]
    [EnumDataType(typeof(PrioridadTarea), ErrorMessage = "La prioridad no es válida.")]
    public PrioridadTarea? Prioridad { get; set; }
}
