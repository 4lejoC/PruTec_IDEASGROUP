using System.ComponentModel.DataAnnotations;
using GestionTareas.Api.Enums;

namespace GestionTareas.Api.DTOs.Proyectos;

/// <summary>Datos para editar un proyecto (PUT: se envían todos los campos).</summary>
public class ProyectoUpdateDto
{
    [Required(ErrorMessage = "El nombre es obligatorio.")]
    [StringLength(150, ErrorMessage = "El nombre no puede superar 150 caracteres.")]
    public string Nombre { get; set; } = string.Empty;

    [StringLength(1000, ErrorMessage = "La descripción no puede superar 1000 caracteres.")]
    public string? Descripcion { get; set; }

    [Required(ErrorMessage = "La fecha de inicio es obligatoria.")]
    public DateOnly? FechaInicio { get; set; }

    [Required(ErrorMessage = "La fecha de fin prevista es obligatoria.")]
    public DateOnly? FechaFinPrevista { get; set; }

    [Required(ErrorMessage = "El estado es obligatorio.")]
    [EnumDataType(typeof(EstadoProyecto), ErrorMessage = "El estado no es válido.")]
    public EstadoProyecto? Estado { get; set; }
}
