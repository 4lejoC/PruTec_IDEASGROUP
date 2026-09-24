using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace GestionTareas.Api.Data.Converters;

/// <summary>
/// Convierte un enum de C# (PascalCase) a texto en MAYÚSCULAS_CON_GUION_BAJO y viceversa.
/// Ejemplo: EstadoProyecto.EnCurso  &lt;-&gt;  "EN_CURSO".
/// Permite usar nombres idiomáticos en C# y valores legibles en la base de datos,
/// iguales a los definidos en el modelo físico.
/// </summary>
public class UpperSnakeCaseEnumConverter<TEnum> : ValueConverter<TEnum, string>
    where TEnum : struct, Enum
{
    public UpperSnakeCaseEnumConverter()
        : base(valor => ToDatabase(valor), texto => FromDatabase(texto))
    {
    }

    /// <summary>EnCurso -> EN_CURSO</summary>
    public static string ToDatabase(TEnum valor) =>
        Regex.Replace(valor.ToString(), "(?<!^)([A-Z])", "_$1").ToUpperInvariant();

    /// <summary>EN_CURSO -> EnCurso</summary>
    public static TEnum FromDatabase(string texto) =>
        Enum.Parse<TEnum>(texto.Replace("_", string.Empty), ignoreCase: true);

    /// <summary>
    /// Genera la condición de un CHECK con todos los valores del enum, por ejemplo:
    /// proy_estado IN ('PLANIFICADO','EN_CURSO',...).
    /// Así el CHECK de la base siempre coincide con el enum.
    /// </summary>
    public static string CheckInClause(string columna) =>
        $"{columna} IN ({string.Join(", ", Enum.GetValues<TEnum>().Select(v => $"'{ToDatabase(v)}'"))})";
}
