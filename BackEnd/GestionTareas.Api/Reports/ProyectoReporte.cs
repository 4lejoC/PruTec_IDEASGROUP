using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;
using GestionTareas.Api.Entities;
using GestionTareas.Api.Enums;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace GestionTareas.Api.Reports;

/// <summary>
/// Diseño del reporte PDF de un proyecto con QuestPDF.
/// El documento se describe por bloques (encabezado, datos, resumen, tabla y pie);
/// QuestPDF se encarga de la paginación: si la tabla no cabe, continúa en la
/// página siguiente repitiendo el encabezado de la tabla.
/// </summary>
public static class ProyectoReporte
{
    private static readonly CultureInfo Cultura = CultureInfo.GetCultureInfo("es-EC");

    // Paleta del frontend (tema claro)
    private const string ColorPrimario = "#4B2A6B";
    private const string ColorTexto = "#221A2E";
    private const string ColorTextoSuave = "#645B70";
    private const string ColorLinea = "#E4DEEC";
    private const string ColorFondoSuave = "#F5F2F9";
    private const string ColorBlanco = "#FFFFFF";

    /// <summary>Logo embebido en el ensamblado; se lee una sola vez.</summary>
    private static readonly Lazy<byte[]> Logo = new(CargarLogo);

    public static byte[] Generar(Proyecto proyecto, IReadOnlyList<Tarea> tareas, DateTime fechaGeneracion)
    {
        return Document.Create(documento =>
        {
            documento.Page(pagina =>
            {
                pagina.Size(PageSizes.A4);
                pagina.Margin(36);
                pagina.PageColor(ColorBlanco);
                pagina.DefaultTextStyle(estilo => estilo.FontSize(10).FontColor(ColorTexto));

                pagina.Header().Element(c => Encabezado(c, fechaGeneracion));

                pagina.Content().PaddingVertical(18).Column(columna =>
                {
                    columna.Spacing(20);
                    columna.Item().Element(c => DatosProyecto(c, proyecto));
                    columna.Item().Element(c => Resumen(c, tareas));
                    columna.Item().Element(c => TablaTareas(c, tareas));
                });

                pagina.Footer().Element(PiePagina);
            });
        }).GeneratePdf();
    }

    /// <summary>
    /// Nombre del archivo: reporte-proyecto-{nombre}-{fecha}.pdf
    /// El nombre del proyecto se normaliza (sin tildes ni eñes, minúsculas y guiones en lugar de
    /// espacios o símbolos) porque los espacios y caracteres especiales en nombres de archivo
    /// dan problemas en algunos sistemas y en el encabezado HTTP de la descarga.
    /// Ej.: "Migración ERP: año 2026" → reporte-proyecto-migracion-erp-ano-2026-2026-09-26.pdf
    /// </summary>
    public static string NombreArchivo(Proyecto proyecto, DateTime fecha)
    {
        var nombre = Regex.Replace(SinTildes(proyecto.Nombre).ToLowerInvariant(), "[^a-z0-9]+", "-").Trim('-');

        if (nombre.Length > 60)
        {
            nombre = nombre[..60].TrimEnd('-');
        }
        if (nombre.Length == 0)
        {
            nombre = proyecto.Id.ToString(CultureInfo.InvariantCulture); // nombre sin letras ni números
        }

        return $"reporte-proyecto-{nombre}-{fecha.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture)}.pdf";
    }

    /// <summary>"Migración" → "Migracion", "año" → "ano": separa cada letra de su tilde y descarta la tilde.</summary>
    private static string SinTildes(string texto)
    {
        var resultado = new StringBuilder();
        foreach (var caracter in texto.Normalize(NormalizationForm.FormD))
        {
            if (CharUnicodeInfo.GetUnicodeCategory(caracter) != UnicodeCategory.NonSpacingMark)
            {
                resultado.Append(caracter);
            }
        }
        return resultado.ToString().Normalize(NormalizationForm.FormC);
    }

    // ----- Encabezado (se repite en cada página)
    private static void Encabezado(IContainer contenedor, DateTime fechaGeneracion)
    {
        contenedor.BorderBottom(2).BorderColor(ColorPrimario).PaddingBottom(10).Row(fila =>
        {
            fila.ConstantItem(42).Image(Logo.Value);

            fila.RelativeItem().PaddingLeft(14).AlignMiddle().Column(columna =>
            {
                columna.Item().Text("Reporte de proyecto").FontSize(18).Bold().FontColor(ColorPrimario);
                columna.Item().Text("Gestión de Tareas").FontSize(9).FontColor(ColorTextoSuave);
            });

            fila.ConstantItem(170).AlignMiddle().Column(columna =>
            {
                columna.Item().AlignRight().Text("Generado el").FontSize(8).FontColor(ColorTextoSuave);
                columna.Item().AlignRight()
                    .Text(fechaGeneracion.ToString("d 'de' MMMM 'de' yyyy, HH:mm", Cultura)).FontSize(9);
            });
        });
    }

    // ----- Datos del proyecto
    private static void DatosProyecto(IContainer contenedor, Proyecto proyecto)
    {
        var duracionDias = proyecto.FechaFinPrevista.DayNumber - proyecto.FechaInicio.DayNumber + 1;

        contenedor.Column(columna =>
        {
            columna.Spacing(6);

            columna.Item().Row(fila =>
            {
                fila.RelativeItem().Text(proyecto.Nombre).FontSize(16).Bold();
                fila.AutoItem().AlignMiddle().Element(c =>
                    Etiqueta(c, ReporteEtiquetas.Texto(proyecto.Estado), ReporteEtiquetas.Color(proyecto.Estado)));
            });

            if (!string.IsNullOrWhiteSpace(proyecto.Descripcion))
            {
                columna.Item().Text(proyecto.Descripcion).FontColor(ColorTextoSuave);
            }

            columna.Item().PaddingTop(6).Row(fila =>
            {
                fila.Spacing(28);
                fila.AutoItem().Element(c => Dato(c, "Código", proyecto.Id.ToString(Cultura)));
                fila.AutoItem().Element(c => Dato(c, "Fecha de inicio", FormatoFecha(proyecto.FechaInicio)));
                fila.AutoItem().Element(c => Dato(c, "Fin previsto", FormatoFecha(proyecto.FechaFinPrevista)));
                fila.AutoItem().Element(c => Dato(c, "Duración", duracionDias == 1 ? "1 día" : $"{duracionDias} días"));
            });
        });
    }

    // ----- Resumen: cantidad de tareas por estado y por prioridad
    private static void Resumen(IContainer contenedor, IReadOnlyList<Tarea> tareas)
    {
        var completadas = tareas.Count(t => t.Estado == EstadoTarea.Completada);
        var avance = tareas.Count == 0 ? 0 : (int)Math.Round(completadas * 100.0 / tareas.Count);

        contenedor.Column(columna =>
        {
            columna.Spacing(8);

            columna.Item().Text(texto =>
            {
                texto.Span("Resumen de tareas").FontSize(12).Bold();
                texto.Span($"    {tareas.Count} en total · {avance} % completadas").FontSize(9).FontColor(ColorTextoSuave);
            });

            columna.Item().Text("Por estado").FontSize(8).SemiBold().FontColor(ColorTextoSuave);
            columna.Item().Row(fila =>
            {
                fila.Spacing(8);
                foreach (var estado in Enum.GetValues<EstadoTarea>())
                {
                    var cantidad = tareas.Count(t => t.Estado == estado);
                    fila.RelativeItem().Element(c =>
                        Tarjeta(c, ReporteEtiquetas.Texto(estado), cantidad, ReporteEtiquetas.Color(estado)));
                }
            });

            columna.Item().PaddingTop(4).Text("Por prioridad").FontSize(8).SemiBold().FontColor(ColorTextoSuave);
            columna.Item().Row(fila =>
            {
                fila.Spacing(8);
                foreach (var prioridad in Enum.GetValues<PrioridadTarea>())
                {
                    var cantidad = tareas.Count(t => t.Prioridad == prioridad);
                    fila.RelativeItem().Element(c =>
                        Tarjeta(c, ReporteEtiquetas.Texto(prioridad), cantidad, ReporteEtiquetas.Color(prioridad)));
                }
            });
        });
    }

    // ----- Detalle de todas las tareas
    private static void TablaTareas(IContainer contenedor, IReadOnlyList<Tarea> tareas)
    {
        contenedor.Column(columna =>
        {
            columna.Spacing(8);
            columna.Item().Text("Detalle de tareas").FontSize(12).Bold();

            if (tareas.Count == 0)
            {
                columna.Item().Background(ColorFondoSuave).Padding(12)
                    .Text("El proyecto no tiene tareas registradas.").FontColor(ColorTextoSuave);
                return;
            }

            columna.Item().Table(tabla =>
            {
                tabla.ColumnsDefinition(columnas =>
                {
                    columnas.ConstantColumn(26);   // #
                    columnas.RelativeColumn(4);    // tarea
                    columnas.RelativeColumn(1.6f); // estado
                    columnas.RelativeColumn(1.3f); // prioridad
                    columnas.RelativeColumn(1.5f); // creada
                });

                // Encabezado de la tabla: se repite si la tabla continúa en otra página.
                tabla.Header(encabezado =>
                {
                    foreach (var titulo in new[] { "#", "Tarea", "Estado", "Prioridad", "Creada" })
                    {
                        encabezado.Cell().Background(ColorPrimario).PaddingVertical(6).PaddingHorizontal(5)
                            .Text(titulo).FontSize(9).SemiBold().FontColor(ColorBlanco);
                    }
                });

                var numero = 0;
                foreach (var tarea in tareas)
                {
                    numero++;
                    var fondo = numero % 2 == 0 ? ColorFondoSuave : ColorBlanco; // filas alternadas

                    tabla.Cell().Element(c => Celda(c, fondo)).Text(numero.ToString(Cultura)).FontColor(ColorTextoSuave);

                    tabla.Cell().Element(c => Celda(c, fondo)).Column(celda =>
                    {
                        celda.Item().Text(tarea.Titulo).SemiBold();
                        if (!string.IsNullOrWhiteSpace(tarea.Descripcion))
                        {
                            celda.Item().Text(tarea.Descripcion).FontSize(8).FontColor(ColorTextoSuave);
                        }
                    });

                    tabla.Cell().Element(c => Celda(c, fondo))
                        .Text(ReporteEtiquetas.Texto(tarea.Estado)).SemiBold().FontColor(ReporteEtiquetas.Color(tarea.Estado));

                    tabla.Cell().Element(c => Celda(c, fondo))
                        .Text(ReporteEtiquetas.Texto(tarea.Prioridad)).SemiBold().FontColor(ReporteEtiquetas.Color(tarea.Prioridad));

                    tabla.Cell().Element(c => Celda(c, fondo))
                        .Text(tarea.FechaCreacion.ToLocalTime().ToString("dd/MM/yyyy", Cultura)).FontColor(ColorTextoSuave);
                }
            });
        });
    }

    // ----- Pie de página
    private static void PiePagina(IContainer contenedor)
    {
        contenedor.BorderTop(1).BorderColor(ColorLinea).PaddingTop(6).Row(fila =>
        {
            fila.RelativeItem().Text("IDEASGROUP · Gestión de Tareas").FontSize(8).FontColor(ColorTextoSuave);

            fila.RelativeItem().AlignRight().Text(texto =>
            {
                texto.DefaultTextStyle(estilo => estilo.FontSize(8).FontColor(ColorTextoSuave));
                texto.Span("Página ");
                texto.CurrentPageNumber();
                texto.Span(" de ");
                texto.TotalPages();
            });
        });
    }

    // ----- Piezas reutilizables
    private static void Etiqueta(IContainer contenedor, string texto, string color)
    {
        contenedor.Border(1).BorderColor(color).PaddingVertical(3).PaddingHorizontal(9)
            .Text(texto).FontSize(9).SemiBold().FontColor(color);
    }

    private static void Dato(IContainer contenedor, string etiqueta, string valor)
    {
        contenedor.Column(columna =>
        {
            columna.Item().Text(etiqueta).FontSize(8).FontColor(ColorTextoSuave);
            columna.Item().Text(valor).SemiBold();
        });
    }

    private static void Tarjeta(IContainer contenedor, string etiqueta, int cantidad, string color)
    {
        contenedor.Background(ColorFondoSuave).BorderLeft(3).BorderColor(color).PaddingVertical(6).PaddingHorizontal(8)
            .Column(columna =>
            {
                columna.Item().Text(cantidad.ToString(Cultura)).FontSize(16).Bold().FontColor(color);
                columna.Item().Text(etiqueta).FontSize(8).FontColor(ColorTextoSuave);
            });
    }

    private static IContainer Celda(IContainer contenedor, string fondo) =>
        contenedor.Background(fondo).BorderBottom(1).BorderColor(ColorLinea).PaddingVertical(5).PaddingHorizontal(5);

    private static string FormatoFecha(DateOnly fecha) => fecha.ToString("d 'de' MMMM 'de' yyyy", Cultura);

    private static byte[] CargarLogo()
    {
        using var recurso = typeof(ProyectoReporte).Assembly.GetManifestResourceStream("logo-ideasgroup.png")
            ?? throw new InvalidOperationException("No se encontró el logo embebido del reporte (logo-ideasgroup.png).");
        using var memoria = new MemoryStream();
        recurso.CopyTo(memoria);
        return memoria.ToArray();
    }
}
