using System.Text.Json.Serialization;
using System.Reflection;
using DotNetEnv;
using GestionTareas.Api.Data;
using GestionTareas.Api.Handlers;
using GestionTareas.Api.Repositories;
using GestionTareas.Api.Services;
using Microsoft.EntityFrameworkCore;

// ---------------------------------------------------------------------------
// Configuración externa
// Carga el archivo .env de la raíz del repositorio (buscándolo hacia arriba
// desde la carpeta actual). NoClobber: si una variable ya existe en el sistema,
// se respeta la del sistema y no se sobrescribe con la del archivo.
// Debe ejecutarse ANTES de crear el builder para que la configuración la lea.
// ---------------------------------------------------------------------------
Env.NoClobber().TraversePath().Load();

var builder = WebApplication.CreateBuilder(args);

// Cadena de conexión: solo desde variable de entorno
// (ConnectionStrings__DefaultConnection). Nunca en appsettings ni en el repositorio.
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
if (string.IsNullOrWhiteSpace(connectionString))
{
    throw new InvalidOperationException(
        "Falta la variable de entorno 'ConnectionStrings__DefaultConnection'. " +
        "Copia .env.example como .env en la raíz del repositorio y completa los valores.");
}

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString));

// Capa Repository (Scoped: una instancia por petición HTTP, igual que el DbContext)
builder.Services.AddScoped<IProyectoRepository, ProyectoRepository>();
builder.Services.AddScoped<ITareaRepository, TareaRepository>();

// Capa Service
builder.Services.AddScoped<IProyectoService, ProyectoService>();
builder.Services.AddScoped<ITareaService, TareaService>();

// CORS: orígenes permitidos desde la variable Cors__AllowedOrigins (separados por coma).
const string CorsPolicy = "Frontend";
var allowedOrigins = builder.Configuration["Cors:AllowedOrigins"]?
    .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries) ?? [];

builder.Services.AddCors(options =>
    options.AddPolicy(CorsPolicy, policy => policy
        .WithOrigins(allowedOrigins)
        .AllowAnyHeader()
        .AllowAnyMethod()));

// Enums en JSON como texto ("EnCurso") en lugar de números: más legible para el frontend.
builder.Services.AddControllers()
    .AddJsonOptions(options =>
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()));

// Manejo centralizado de errores -> respuestas ProblemDetails (400/404/409/500).
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddProblemDetails();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new()
    {
        Title = "Gestión de Tareas API",
        Version = "v1",
        Description = "API REST para administrar proyectos y sus tareas."
    });

    // Muestra en Swagger los comentarios /// <summary> de controllers y DTOs.
    var xmlFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
    options.IncludeXmlComments(Path.Combine(AppContext.BaseDirectory, xmlFile));
});

var app = builder.Build();

// Primero en el pipeline para capturar las excepciones de todo lo que viene después.
app.UseExceptionHandler();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors(CorsPolicy);
app.UseAuthorization();
app.MapControllers();

app.Run();
