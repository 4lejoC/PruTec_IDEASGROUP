# Gestión de Tareas – Prueba Técnica IDEASGROUP

Aplicativo web para crear proyectos y administrar las tareas asociadas a cada uno.
Módulo inicial de una plataforma de gestión de trabajo.

> **Estado:** en desarrollo. Las secciones marcadas como *(pendiente)* se completarán en los próximos commits.

---

## Tabla de contenido

1. [Stack tecnológico](#stack-tecnológico)
2. [Estructura del repositorio](#estructura-del-repositorio)
3. [Requisitos previos](#requisitos-previos)
4. [Instalación y ejecución paso a paso](#instalación-y-ejecución-paso-a-paso)
5. [Variables de entorno](#variables-de-entorno)
6. [Modelo de base de datos](#modelo-de-base-de-datos)
7. [API REST](#api-rest)
8. [Decisiones arquitectónicas](#decisiones-arquitectónicas)
9. [Decisiones no especificadas en el enunciado](#decisiones-no-especificadas-en-el-enunciado)
10. [Pruebas automatizadas](#pruebas-automatizadas)
11. [Uso de asistentes de inteligencia artificial](#uso-de-asistentes-de-inteligencia-artificial)

---

## Stack tecnológico

| Componente | Tecnología |
|---|---|
| Frontend | Angular 17, TypeScript, SCSS *(pendiente)* |
| Librería de componentes | Por definir |
| Backend | .NET 8, C#, ASP.NET Core Web API (controllers) |
| Persistencia | Entity Framework Core 8 con migraciones incrementales |
| Base de datos | PostgreSQL 16 (Docker) |
| Proveedor EF | Npgsql.EntityFrameworkCore.PostgreSQL 8 |
| Configuración | Variables de entorno (archivo `.env` cargado con DotNetEnv) |
| Documentación API | Swagger / OpenAPI (Swashbuckle) |
| Pruebas backend | xUnit + Moq |
| Modelado de datos | SAP PowerDesigner (modelos conceptual, lógico y físico) |

---

## Estructura del repositorio

```
PruTec_IDEASGROUP/
├── .env.example                 ← plantilla de variables de entorno
├── docker-compose.yml           ← PostgreSQL 16 para desarrollo
├── BackEnd/
│   ├── global.json              ← fija el SDK de .NET 8
│   ├── GestionTareas.slnx       ← solución
│   ├── GestionTareas.Api/
│   │   ├── Controllers/         ← capa Controller (HTTP)
│   │   ├── Services/            ← capa Service (reglas de negocio)
│   │   ├── Repositories/        ← capa Repository (acceso a datos)
│   │   ├── Entities/            ← entidades del dominio
│   │   ├── Enums/               ← estados y prioridades
│   │   ├── DTOs/                ← contratos de entrada/salida de la API
│   │   ├── Mappings/            ← conversión entidad → DTO
│   │   ├── Exceptions/          ← excepciones de negocio
│   │   ├── Handlers/            ← manejo centralizado de errores
│   │   ├── Data/
│   │   │   ├── AppDbContext.cs
│   │   │   ├── Configurations/  ← mapeo Fluent API al modelo físico
│   │   │   ├── Converters/      ← conversión de enums a texto
│   │   │   └── Migrations/      ← migraciones incrementales generadas por EF
│   │   └── Program.cs
│   └── GestionTareas.Tests/     ← pruebas unitarias (xUnit + Moq)
├── FrontEnd/                    ← aplicación Angular (pendiente)
└── Database/
    ├── diagramas/               ← imágenes de los modelos
    └── powerdesigner/           ← archivos fuente .cdm / .ldm / .pdm
```

---

## Requisitos previos

| Herramienta | Versión | Uso |
|---|---|---|
| [Docker Desktop](https://www.docker.com/products/docker-desktop/) | reciente | Base de datos PostgreSQL |
| [.NET SDK](https://dotnet.microsoft.com/download/dotnet/8.0) | **8.0.x** | Backend |
| Visual Studio 2026 **o** herramienta `dotnet-ef` | — | Aplicar migraciones |
| [Node.js](https://nodejs.org/) | 18.13+ o 20.x LTS | Frontend *(pendiente)* |
| Angular CLI | 17 | Frontend *(pendiente)* |

---

## Instalación y ejecución paso a paso

### 1. Clonar el repositorio

```bash
git clone https://github.com/4lejoC/PruTec_IDEASGROUP.git
cd PruTec_IDEASGROUP
```

### 2. Configurar las variables de entorno

Copiar la plantilla y, si se desea, cambiar la contraseña:

```bash
# Windows (PowerShell)
Copy-Item .env.example .env

# Linux / macOS
cp .env.example .env
```

El mismo archivo `.env` lo usan Docker (base de datos) y el backend. Ver [Variables de entorno](#variables-de-entorno).

### 3. Levantar la base de datos

```bash
docker compose up -d
docker compose ps        # esperar el estado "healthy"
```

Esto crea un PostgreSQL 16 **vacío** (base `gestion_tareas`). Las tablas se crean en el paso siguiente.

### 4. Construir la base de datos con las migraciones

Las migraciones se aplican de forma **explícita** (no al iniciar la API). Elegir una opción:

**Opción A – Visual Studio 2026**

1. Abrir `BackEnd/GestionTareas.slnx`.
2. *Tools → NuGet Package Manager → Package Manager Console*.
3. En *Default project* seleccionar `GestionTareas.Api` y ejecutar:
   ```powershell
   Update-Database
   ```

**Opción B – Consola**

```bash
dotnet tool install --global dotnet-ef --version 8.*   # solo la primera vez
dotnet ef database update --project BackEnd/GestionTareas.Api
```

Ambas ejecutan todas las migraciones **en orden** sobre la base vacía:

| # | Migración | Crea |
|---|---|---|
| 1 | `CrearTablaProyecto` | tabla `proyecto`, PK, checks de estado y fechas |
| 2 | `CrearTablaTarea` | tabla `tarea`, FK con `ON DELETE RESTRICT`, índice, checks |

### 5. Ejecutar el backend

**Visual Studio:** seleccionar el perfil `http` y presionar F5.

**Consola:**

```bash
dotnet run --project BackEnd/GestionTareas.Api --launch-profile http
```

La API queda en `http://localhost:5257` y la documentación Swagger en
**http://localhost:5257/swagger**.

### 6. Ejecutar el frontend *(pendiente)*

_Se documentará al implementar el frontend._

### Reiniciar la base de datos desde cero

```bash
docker compose down -v   # elimina el contenedor y los datos
docker compose up -d
# volver a aplicar las migraciones (paso 4)
```

---

## Variables de entorno

Todas se definen en el archivo `.env` de la raíz (no versionado). La plantilla es `.env.example`.

### Base de datos (docker-compose)

| Variable | Descripción | Ejemplo |
|---|---|---|
| `POSTGRES_DB` | Nombre de la base de datos | `gestion_tareas` |
| `POSTGRES_USER` | Usuario de PostgreSQL | `gestion_user` |
| `POSTGRES_PASSWORD` | Contraseña del usuario | `cambiar_esta_clave` |
| `POSTGRES_PORT` | Puerto expuesto en el equipo | `5432` |

### Backend (.NET)

| Variable | Descripción | Ejemplo |
|---|---|---|
| `ConnectionStrings__DefaultConnection` | Cadena de conexión a PostgreSQL. Reutiliza las variables de la base con `${...}` | `Host=localhost;Port=${POSTGRES_PORT};Database=${POSTGRES_DB};Username=${POSTGRES_USER};Password=${POSTGRES_PASSWORD}` |
| `Cors__AllowedOrigins` | Orígenes permitidos (URL del frontend), separados por coma | `http://localhost:4200` |

- El doble guion bajo (`__`) equivale a una sección de configuración de .NET
  (`ConnectionStrings__DefaultConnection` → `ConnectionStrings:DefaultConnection`).
- Si una variable ya existe en el sistema, tiene prioridad sobre el valor del `.env`.
- Si falta la cadena de conexión, la API se detiene al iniciar con un mensaje indicando cómo configurarla.

### Frontend *(pendiente)*

_Se documentará al implementar el frontend (archivos `environment.ts`)._

---

## Modelo de base de datos

Diseñado en SAP PowerDesigner en tres niveles (conceptual → lógico → físico para PostgreSQL).
Los archivos fuente están en `Database/powerdesigner/`.

### Modelo físico

![Modelo físico de la base de datos](Database/diagramas/modelo-fisico.png)

<details>
<summary>Modelo conceptual y lógico</summary>

**Conceptual**

![Modelo conceptual](Database/diagramas/modelo-conceptual.png)

**Lógico**

![Modelo lógico](Database/diagramas/modelo-logico.png)

</details>

### Reglas implementadas en la base de datos

| Regla | Implementación |
|---|---|
| Un proyecto tiene 0..N tareas; cada tarea pertenece a 1 proyecto | FK `fk_tarea_proyecto__proyecto` (obligatoria) |
| No se puede eliminar un proyecto con tareas | FK con `ON DELETE RESTRICT` (además de la validación en el backend) |
| La fecha de fin prevista no puede ser anterior a la de inicio | `CHECK ck_proyecto_fechas` |
| Estados y prioridades con valores fijos | `CHECK` sobre columnas `varchar` |
| Fecha de creación automática | `DEFAULT CURRENT_TIMESTAMP` |
| Listado de tareas por proyecto eficiente | Índice `ix_proyecto_tiene_tareas` sobre la FK |

### Valores permitidos

| Campo | Valores |
|---|---|
| Estado del proyecto | `PLANIFICADO`, `EN_CURSO`, `PAUSADO`, `FINALIZADO`, `CANCELADO` |
| Estado de la tarea | `PENDIENTE`, `EN_PROGRESO`, `BLOQUEADA`, `COMPLETADA` |
| Prioridad de la tarea | `BAJA`, `MEDIA`, `ALTA`, `CRITICA` |

---

## API REST

Documentación interactiva completa en **Swagger**: `http://localhost:5257/swagger`.

### Proyectos

| Método | Ruta | Descripción | Respuestas |
|---|---|---|---|
| GET | `/api/proyectos?nombre=&page=1&pageSize=10` | Listado paginado con filtro parcial por nombre | 200, 400 |
| GET | `/api/proyectos/{id}` | Obtener un proyecto | 200, 404 |
| POST | `/api/proyectos` | Crear proyecto | 201, 400 |
| PUT | `/api/proyectos/{id}` | Actualizar proyecto | 200, 400, 404 |
| DELETE | `/api/proyectos/{id}` | Eliminar proyecto (no permitido si tiene tareas) | 204, 404, **409** |

### Tareas

| Método | Ruta | Descripción | Respuestas |
|---|---|---|---|
| GET | `/api/proyectos/{proyectoId}/tareas?texto=&estado=&prioridad=&page=1&pageSize=10` | Listado paginado de tareas del proyecto, con búsqueda por texto y filtros por estado y prioridad (opcionales) | 200, 400, 404 |
| POST | `/api/proyectos/{proyectoId}/tareas` | Crear tarea en el proyecto | 201, 400, 404 |
| GET | `/api/tareas/{id}` | Obtener una tarea | 200, 404 |
| PUT | `/api/tareas/{id}` | Actualizar tarea | 200, 400, 404 |
| DELETE | `/api/tareas/{id}` | Eliminar tarea | 204, 404 |

### Formato de errores

Todos los errores usan el estándar **ProblemDetails** (RFC 7807):

```json
{
  "status": 409,
  "title": "Conflicto",
  "detail": "No se puede eliminar el proyecto porque tiene tareas asociadas...",
  "instance": "/api/proyectos/1"
}
```

Los errores de validación (400) incluyen además un diccionario `errors` con los mensajes por campo.

---

## Decisiones arquitectónicas

### Base de datos

- **Modelado en tres niveles antes de programar.** El modelo físico sirvió como especificación
  para configurar EF Core; la base **no** se crea con el script de PowerDesigner sino con migraciones.
- **Estados y prioridades como `varchar` + `CHECK`** en lugar de tablas catálogo: son valores
  fijos del dominio; se evitan JOINs y CRUDs innecesarios y en C# se representan como `enum`.
- **Borrado físico** (no lógico): la regla "no eliminar proyectos con tareas" y la FK con `RESTRICT`
  están pensadas para eliminación definitiva. Para "archivar" un proyecto sin perder información
  existen los estados `CANCELADO` y `FINALIZADO`.
- **Extensión del modelo mínimo:** se agregaron `fecha_creacion` al proyecto y `fecha_actualizacion`
  a ambas entidades, con fines de auditoría.

### Backend

- **Arquitectura por capas Controller → Service → Repository** dentro de un solo proyecto,
  separadas por carpetas. Para el alcance del ejercicio, un proyecto por capa no aportaba valor
  adicional. Cada capa depende de la siguiente mediante **interfaces** (inyección de dependencias),
  lo que permite probar los services sin base de datos.
  - **Controller:** solo HTTP (rutas, códigos de respuesta). Sin lógica ni `try/catch`.
  - **Service:** reglas de negocio; lanza excepciones de negocio sin conocer HTTP.
  - **Repository:** acceso a datos con EF Core; sin reglas de negocio.
- **DTOs separados de las entidades:** no se expone el modelo de datos, se evitan ciclos en el JSON
  y el contrato de la API queda estable.
- **Mapeo manual** (métodos de extensión) en lugar de AutoMapper: más explícito y suficiente para dos entidades.
- **EF Core con Fluent API** (clases `IEntityTypeConfiguration`) en lugar de atributos: permite definir
  CHECK, nombres de restricciones, convertidores y comportamiento de la FK, y mantiene las entidades
  libres de detalles de persistencia.
- **Convertidor de enums** (`EnCurso` ⇄ `'EN_CURSO'`): nombres idiomáticos en C# y valores legibles en la base.
  Los `CHECK` se generan desde el propio enum, evitando mantener dos listas sincronizadas.
- **PK `serial`** (`UseSerialColumns()`) para coincidir con el modelo físico.
- **Migraciones incrementales**, una por tabla, revisadas contra el modelo físico antes de aplicarse.
- **Las migraciones no se aplican automáticamente al iniciar la API.** En un entorno real, varias
  instancias podrían intentar migrar a la vez y se ejecutarían cambios de esquema sin control;
  por eso se aplican de forma explícita (`Update-Database` / `dotnet ef database update`).
- **Paginación y filtros resueltos en el servidor** (`COUNT` + `LIMIT/OFFSET`, `ILIKE` para coincidencia
  parcial con escape de comodines), con orden estable y tamaño de página limitado a 100.
- **Validación en tres niveles:** formato en los DTOs (Data Annotations + `[ApiController]`),
  reglas de negocio en los services y restricciones en la base como última línea de defensa.
- **Manejo centralizado de errores** con `IExceptionHandler` (.NET 8) y respuestas `ProblemDetails`.
- **Configuración externa:** la cadena de conexión y CORS se leen de variables de entorno; ningún secreto
  se versiona. `DotNetEnv` carga el mismo `.env` que usa Docker, de modo que la contraseña se define una sola vez.
- **Fechas:** `DateOnly` → `date` para fechas de negocio; `DateTime` en UTC → `timestamp with time zone` para auditoría.

### Frontend *(pendiente)*

_Se documentará al implementar el frontend._

---

## Decisiones no especificadas en el enunciado

| Tema | Decisión |
|---|---|
| Estado inicial de un proyecto | `PLANIFICADO` si no se envía |
| Unicidad del nombre de proyecto | No se exige (dos proyectos pueden llamarse igual) |
| Orden del listado de proyectos | Por nombre y luego por código |
| Tamaño de página | Por defecto 10, máximo 100 |
| Tipo de actualización | `PUT` reemplaza todos los campos (incluido el estado) |
| Eliminación | Física; bloqueada si el proyecto tiene tareas (HTTP 409) |
| Formato de enums en JSON | Texto (`"EnCurso"`), no números |
| Fechas de negocio | Solo fecha (sin hora) |
| Estado y prioridad iniciales de una tarea | `PENDIENTE` y `MEDIA` si no se envían |
| Cambio de proyecto de una tarea | No permitido: una tarea siempre pertenece al proyecto donde se creó |
| Orden del listado de tareas | De la más reciente a la más antigua |
| Búsqueda de tareas por texto | Coincidencia parcial en título **o** descripción |
| Rutas de tareas | Listar y crear dentro del proyecto (`/api/proyectos/{id}/tareas`); obtener, editar y eliminar por código (`/api/tareas/{id}`) |

---

## Pruebas automatizadas

### Backend (xUnit + Moq)

Pruebas unitarias sobre las reglas de negocio de los services. Los repositorios se reemplazan
por *mocks* (Moq), por lo que **no requieren base de datos** ni Docker.

**Ejecutar**

- **Visual Studio:** *Test → Run All Tests* (Test Explorer).
- **Consola:**
  ```bash
  dotnet test BackEnd/GestionTareas.Tests
  ```

| Clase | Prueba | Verifica |
|---|---|---|
| `ProyectoServiceTests` | `EliminarAsync_ProyectoConTareas_LanzaConflictoYNoElimina` | Regla: no se elimina un proyecto con tareas |
| `ProyectoServiceTests` | `EliminarAsync_ProyectoSinTareas_EliminaUnaVez` | Un proyecto sin tareas sí se elimina |
| `ProyectoServiceTests` | `CrearAsync_FechaFinAnteriorAInicio_LanzaValidacionYNoGuarda` | La fecha de fin no puede ser anterior a la de inicio |
| `ProyectoServiceTests` | `CrearAsync_SinEstado_CreaComoPlanificado` | Estado por defecto y limpieza del nombre |
| `ProyectoServiceTests` | `ObtenerPorIdAsync_ProyectoInexistente_LanzaNoEncontrado` | Un código inexistente produce "no encontrado" |
| `TareaServiceTests` | `CrearAsync_ProyectoInexistente_LanzaNoEncontradoYNoGuarda` | Toda tarea debe pertenecer a un proyecto existente |
| `TareaServiceTests` | `CrearAsync_SinEstadoNiPrioridad_AsignaPendienteYMedia` | Valores por defecto de la tarea |

### Frontend *(pendiente)*

_Se documentará al implementar el frontend._

---

## Uso de asistentes de inteligencia artificial

Se utilizó **Claude (Anthropic)** como asistente durante el desarrollo, en las mismas condiciones
que en el trabajo diario:

| Área | Uso |
|---|---|
| Planificación | Lectura del requerimiento y armado de un checklist por etapas |
| Modelado de datos | Revisión de los modelos conceptual, lógico y físico en PowerDesigner (cardinalidades, tipos, restricciones) |
| Backend | Generación de código base de entidades, configuración de EF, repositorios, services, controllers y manejo de errores |
| Documentación | Redacción de este README y de los comentarios XML de Swagger |

Todas las decisiones fueron revisadas y validadas por el autor, y varias se tomaron en contra de la
sugerencia inicial del asistente (por ejemplo: un solo proyecto de API en lugar de uno por capa,
mantener el formato de solución `.slnx`, y **no** aplicar migraciones automáticamente al iniciar).
