using DotNetEnv;

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

// CORS: orígenes permitidos desde la variable Cors__AllowedOrigins (separados por coma).
const string CorsPolicy = "Frontend";
var allowedOrigins = builder.Configuration["Cors:AllowedOrigins"]?
    .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries) ?? [];

builder.Services.AddCors(options =>
    options.AddPolicy(CorsPolicy, policy => policy
        .WithOrigins(allowedOrigins)
        .AllowAnyHeader()
        .AllowAnyMethod()));

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

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
