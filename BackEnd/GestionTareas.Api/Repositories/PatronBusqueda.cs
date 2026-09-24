namespace GestionTareas.Api.Repositories;

/// <summary>
/// Construye el patrón para búsquedas por coincidencia parcial con ILIKE.
/// Escapa los comodines de SQL (% y _) para que el texto del usuario se busque
/// de forma literal: buscar "50%" no debe comportarse como "50 seguido de cualquier cosa".
/// </summary>
public static class PatronBusqueda
{
    /// <summary>Carácter de escape que se pasa a EF.Functions.ILike.</summary>
    public const string Escape = "\\";

    /// <summary>"web" -> "%web%"</summary>
    public static string Contiene(string texto) =>
        $"%{texto.Trim().Replace("\\", "\\\\").Replace("%", "\\%").Replace("_", "\\_")}%";
}
