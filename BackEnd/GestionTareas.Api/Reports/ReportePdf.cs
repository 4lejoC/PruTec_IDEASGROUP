namespace GestionTareas.Api.Reports;

/// <summary>Reporte generado: contenido del PDF y nombre sugerido para descargarlo.</summary>
public record ReportePdf(byte[] Contenido, string NombreArchivo);
