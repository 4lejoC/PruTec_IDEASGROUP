using System.ComponentModel.DataAnnotations;
using GestionTareas.Api.Enums;

namespace GestionTareas.Api.DTOs.Proyectos;

/// <summary>
/// Datos para crear un proyecto.
/// Las fechas son nullable para que [Required] detecte cuando no se envían
/// (un DateOnly no nulo tomaría 0001-01-01 por defecto).
/// </summary>
public class ProyectoCreateDto
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

    /// <summary>Opcional al crear: si no se envía, el proyecto inicia como Planificado.</summary>
    [EnumDataType(typeof(EstadoProyecto), ErrorMessage = "El estado no es válido.")]
    public EstadoProyecto? Estado { get; set; }
}
