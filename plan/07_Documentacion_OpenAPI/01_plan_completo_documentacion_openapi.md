# Plan: Documentación OpenAPI Completa - Sistema CENATE

## Problema
Solo 6.7% de los controllers (6 de 90) tienen documentación OpenAPI completa. Swagger UI muestra información mínima y los clientes no pueden generar SDKs automáticamente.

## Objetivo
Documentar 90 controllers REST con SpringDoc OpenAPI en 3 fases incrementales, priorizando APIs críticas.

---

## Estrategia de Implementación

### Enfoque: Incremental por Prioridad de Negocio
- **Fase 1 (CRÍTICO):** 6 controllers - Auth, Usuarios, Chatbot, Bolsas, IPRESS, Disponibilidad (100 endpoints)
- **Fase 2 (CORE):** 15 controllers - Formularios, Firma Digital, Reportes, Config (71 endpoints)
- **Fase 3 (RESTANTES):** 69 controllers - Catálogos, Dashboards, Integraciones (80 endpoints)

### Decisiones Técnicas
1. **DTOs primero:** Crear/actualizar DTOs con `@Schema` antes de documentar controllers
2. **PRs separados:** Un PR por fase para facilitar code review
3. **Automatización:** Scripts generadores de boilerplate para Fase 3
4. **Validación continua:** Verificar Swagger UI después de cada controller

---

## FASE 1: Controllers Críticos (6 controllers, ~100 endpoints)

### 1.1 AuthController (5 endpoints) - PRIMERO

**Archivo:** `backend/src/main/java/com/styp/cenate/api/seguridad/AuthController.java`

**Endpoints:**
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/validate`
- `POST /api/auth/logout`
- `POST /api/auth/reset-password`

**DTOs a crear:**
```java
// backend/src/main/java/com/styp/cenate/dto/auth/LoginRequestDTO.java
@Schema(description = "Credenciales de inicio de sesión")
public class LoginRequestDTO {
    @Schema(description = "Nombre de usuario (DNI)", example = "44914706", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank
    private String username;

    @Schema(description = "Contraseña", example = "@Cenate2025", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank
    private String password;
}

// backend/src/main/java/com/styp/cenate/dto/auth/LoginResponseDTO.java
@Schema(description = "Respuesta de autenticación exitosa")
public class LoginResponseDTO {
    @Schema(description = "Token JWT de acceso", example = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")
    private String token;

    @Schema(description = "Token de refresco", example = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")
    private String refreshToken;

    @Schema(description = "Datos del usuario autenticado")
    private UsuarioDTO user;

    @Schema(description = "Módulos y permisos MBAC")
    private List<ModuloPermisoDTO> modules;
}
```

**Anotaciones a agregar:**

```java
@Tag(name = "Autenticación", description = "Endpoints de autenticación y gestión de sesiones JWT")
public class AuthController {

    @Operation(
        summary = "Iniciar sesión en el sistema",
        description = "Autentica un usuario con credenciales y retorna token JWT + módulos MBAC"
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Autenticación exitosa",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = LoginResponseDTO.class)
            )
        ),
        @ApiResponse(
            responseCode = "401",
            description = "Credenciales inválidas",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(
                    value = "{\"error\": \"UNAUTHORIZED\", \"message\": \"Usuario o contraseña incorrectos\"}"
                )
            )
        ),
        @ApiResponse(
            responseCode = "423",
            description = "Usuario bloqueado o inactivo"
        )
    })
    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(
        @Parameter(description = "Credenciales de acceso", required = true)
        @Valid @RequestBody LoginRequestDTO request
    ) {
        // Implementación existente
    }
}
```

**Checklist AuthController:**
- [ ] Crear DTOs: LoginRequestDTO, LoginResponseDTO, RefreshTokenRequestDTO, ValidateTokenRequestDTO
- [ ] Agregar `@Tag` al controller
- [ ] Documentar 5 endpoints con `@Operation` y `@ApiResponses`
- [ ] Agregar `@Parameter` a todos los request params
- [ ] Validar en Swagger UI `http://localhost:8080/swagger-ui.html`
- [ ] Probar "Try it out" en cada endpoint
- [ ] Commit: `docs: Agregar documentación OpenAPI a AuthController`

---

### 1.2 UsuarioController (24 endpoints)

**Archivo:** `backend/src/main/java/com/styp/cenate/api/usuario/UsuarioController.java`

**Endpoints críticos:**
- `GET /api/usuarios` - Listar usuarios paginados
- `GET /api/usuarios/{id}` - Obtener usuario por ID
- `POST /api/usuarios` - Crear usuario
- `PUT /api/usuarios/{id}` - Actualizar usuario
- `DELETE /api/usuarios/{id}` - Eliminar usuario
- `GET /api/usuarios/search` - Búsqueda avanzada
- `POST /api/usuarios/{id}/activar` - Activar usuario
- `GET /api/usuarios/pendientes` - Listar pendientes de activación
- ... (16 endpoints más)

**DTOs a crear:**
- `UsuarioDTO.java` - Completo con todos los campos
- `CrearUsuarioRequestDTO.java` - Solo campos para creación
- `ActualizarUsuarioRequestDTO.java` - Solo campos editables
- `UsuarioPendienteDTO.java` - Datos de usuarios pendientes
- `BusquedaUsuarioRequestDTO.java` - Criterios de búsqueda

**Patrón de documentación:**

```java
@Tag(name = "Usuarios", description = "Gestión de usuarios del sistema CENATE")
public class UsuarioController {

    @Operation(
        summary = "Búsqueda avanzada de usuarios",
        description = "Permite buscar usuarios con múltiples criterios: nombre, email, rol, IPRESS, estado"
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Resultados de búsqueda",
            content = @Content(schema = @Schema(implementation = Page.class))
        ),
        @ApiResponse(responseCode = "400", description = "Parámetros de búsqueda inválidos")
    })
    @GetMapping("/search")
    public ResponseEntity<Page<UsuarioDTO>> buscarUsuarios(
        @Parameter(description = "Nombre o apellido", example = "Juan")
        @RequestParam(required = false) String nombre,

        @Parameter(description = "Email", example = "juan@essalud.gob.pe")
        @RequestParam(required = false) String email,

        @Parameter(
            description = "Rol del usuario",
            schema = @Schema(allowableValues = {"SUPERADMIN", "ADMIN", "MEDICO", "COORDINADOR", "ENFERMERIA"})
        )
        @RequestParam(required = false) String rol,

        @Parameter(description = "Número de página (0-indexed)", example = "0")
        @RequestParam(defaultValue = "0") int page
    ) {
        // Implementación
    }
}
```

---

### 1.3 ChatBotController (7 endpoints)

**Archivo:** `backend/src/main/java/com/styp/cenate/api/chatbot/ChatBotController.java`

**DTOs requeridos:** SlotDisponibleDTO, ReservarSlotRequestDTO, ConfirmarCitaRequestDTO, CitaPacienteDTO

---

### 1.4 BolsasController (30 endpoints)

**Archivo:** `backend/src/main/java/com/styp/cenate/api/bolsas/BolsasController.java`

**Endpoint complejo - Importación Excel:**

```java
@Operation(
    summary = "Importar pacientes desde archivo Excel",
    description = "Carga masiva de pacientes. Excel debe tener mínimo: DNI y Código Adscripción. Sistema auto-enriquece datos faltantes."
)
@ApiResponses({
    @ApiResponse(
        responseCode = "200",
        description = "Importación completada",
        content = @Content(
            examples = @ExampleObject(
                value = """
                {
                  "mensaje": "Importación completada",
                  "registrosImportados": 245,
                  "registrosOmitidos": 3,
                  "errores": [
                    {"fila": 10, "error": "DNI inválido: 12345"}
                  ]
                }
                """
            )
        )
    ),
    @ApiResponse(responseCode = "400", description = "Archivo inválido"),
    @ApiResponse(responseCode = "413", description = "Archivo excede 10MB")
})
@PostMapping(value = "/solicitudes/importar-excel", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
public ResponseEntity<?> importarExcel(
    @Parameter(description = "Archivo Excel (.xlsx)", required = true)
    @RequestParam("archivo") MultipartFile archivo,

    @Parameter(description = "ID del tipo de bolsa", required = true, example = "1")
    @RequestParam Long tipoBolsaId
) {
    // Implementación
}
```

**DTOs:** SolicitudBolsaDTO (26 campos), ImportarExcelRequestDTO, AsignarGestoraRequestDTO, EstadisticasBolsasDTO

---

### 1.5 IpressController (14 endpoints)

**Archivo:** `backend/src/main/java/com/styp/cenate/api/ipress/IpressController.java`

**DTOs:** IpressDTO, IpressResumenDTO, ConfiguracionModulosIpressDTO, EstadisticasIpressDTO

---

### 1.6 DisponibilidadController (20 endpoints)

**Archivo:** `backend/src/main/java/com/styp/cenate/api/disponibilidad/DisponibilidadController.java`

**DTOs:** DeclaracionDisponibilidadDTO, DisponibilidadMedicaDTO, ValidacionHorasDTO, SlotChatbotDTO

---

### Entregables Fase 1
- ✅ 6 controllers completamente documentados
- ✅ ~27 DTOs creados con `@Schema`
- ✅ PR: "docs: Agregar documentación OpenAPI a controllers críticos"
- ✅ Swagger UI funcional con ejemplos interactivos
- ✅ SDK cliente Java generado y validado

---

## FASE 2: Controllers Core (15 controllers, ~71 endpoints)

**Controllers a documentar:**
1. FormDiagController (8 endpoints) - Formularios de diagnóstico
2. SolicitudTurnoIpressController (12 endpoints) - Solicitudes IPRESS
3. GestionPacienteController (10 endpoints) - Gestión de pacientes
4. FirmaDigitalController (6 endpoints) - Firma digital
5. EstadosGestionCitasController (8 endpoints) - Estados de citas
6. TiposBolsasController (7 endpoints) - Catálogo de bolsas
7. PersonalExternoController (6 endpoints) - Personal externo
8. NotificacionesController (5 endpoints) - Notificaciones
9. ReportesController (10 endpoints) - Generación de reportes
10. ConfiguracionController (8 endpoints) - Configuración del sistema
11. DashboardController (6 endpoints) - Dashboard principal
12. AsignacionAdmisionistasController (4 endpoints)
13. PeriodoSolicitudTurnoController (5 endpoints)
14. IntegracionHorarioController (6 endpoints)
15. SolicitudTurnosController (11 endpoints)

**Patrón:** Reutilizar templates de Fase 1, enfoque en DTOs consistentes.

**Entregables:**
- ✅ PR: "docs: Agregar documentación OpenAPI a controllers core"
- ✅ 21 controllers documentados en total

---

## FASE 3: Controllers Restantes (69 controllers, ~80 endpoints)

**Categorías:**
- **Catálogos (25 controllers):** Servicios ESSI, Especialidades, Redes, etc.
- **Dashboards (15 controllers):** Dashboard Coordinador, IPRESS, Estadísticas
- **Administrativos (20 controllers):** Logs, Email, Permisos
- **Integraciones (9 controllers):** ESSI Sync, WhatsApp, Email

**Estrategia:** Automatización con scripts generadores de boilerplate.

**Entregables:**
- ✅ PR: "docs: Completar documentación OpenAPI (100% cobertura)"
- ✅ SDK cliente completo generado
- ✅ Documentación exportada (JSON/YAML)

---

## Scripts de Automatización

### Script 1: Generador de Template

**Crear:** `backend/scripts/generate-openapi-template.sh`

```bash
#!/bin/bash
# Genera boilerplate de OpenAPI para un controller
# Uso: ./generate-openapi-template.sh NombreController "Descripción"

CONTROLLER_NAME=$1
DESCRIPTION=$2

cat > "${CONTROLLER_NAME}_template.java" << 'EOF'
@Tag(name = "${CONTROLLER_NAME}", description = "${DESCRIPTION}")
public class ${CONTROLLER_NAME} {

    @Operation(summary = "Listar todos", description = "Lista paginada de registros")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Lista obtenida"),
        @ApiResponse(responseCode = "401", description = "No autenticado")
    })
    @GetMapping
    public ResponseEntity<Page<?>> listarTodos(
        @Parameter(description = "Página", example = "0") @RequestParam(defaultValue = "0") int page
    ) {}
}
EOF

echo "✅ Template generado: ${CONTROLLER_NAME}_template.java"
```

### Script 2: Validación Automática

**Crear:** `backend/scripts/validate-openapi.sh`

```bash
#!/bin/bash
# Valida cobertura de documentación OpenAPI

CONTROLLERS_DIR="backend/src/main/java/com/styp/cenate/api"
TOTAL=0
DOCUMENTED=0

for file in $(find $CONTROLLERS_DIR -name "*Controller.java"); do
    TOTAL=$((TOTAL + 1))
    if grep -q "@Tag(" "$file" && grep -q "@Operation(" "$file"; then
        DOCUMENTED=$((DOCUMENTED + 1))
    else
        echo "❌ Sin documentar: $(basename $file)"
    fi
done

COVERAGE=$(awk "BEGIN {printf \"%.1f\", ($DOCUMENTED/$TOTAL)*100}")
echo "📊 Cobertura: $DOCUMENTED/$TOTAL ($COVERAGE%)"

[ $DOCUMENTED -eq $TOTAL ] && echo "✅ 100% documentado" || exit 1
```

**Uso:**
```bash
chmod +x backend/scripts/*.sh
./backend/scripts/validate-openapi.sh
```

### Gradle Task

**Agregar a `backend/build.gradle`:**

```gradle
task validateOpenAPI(type: Exec) {
    description = 'Valida documentación OpenAPI'
    group = 'verification'
    commandLine 'bash', 'scripts/validate-openapi.sh'
}

build.dependsOn validateOpenAPI
```

---

## Template Reutilizable

### Estructura Estándar de Controller

```java
package com.styp.cenate.api.[modulo];

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/[modulo]")
@Tag(name = "[Nombre]", description = "[Descripción]")
public class MiController {

    // GET ALL
    @Operation(summary = "Listar todos", description = "Lista paginada")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Éxito"),
        @ApiResponse(responseCode = "401", description = "No autenticado")
    })
    @GetMapping
    public ResponseEntity<Page<MiDTO>> listar(
        @Parameter(description = "Página", example = "0") @RequestParam(defaultValue = "0") int page
    ) {}

    // GET BY ID
    @Operation(summary = "Obtener por ID")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Encontrado"),
        @ApiResponse(responseCode = "404", description = "No encontrado")
    })
    @GetMapping("/{id}")
    public ResponseEntity<MiDTO> obtener(
        @Parameter(description = "ID", example = "1") @PathVariable Long id
    ) {}

    // CREATE
    @Operation(summary = "Crear nuevo")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Creado"),
        @ApiResponse(responseCode = "400", description = "Datos inválidos")
    })
    @PostMapping
    public ResponseEntity<MiDTO> crear(@Valid @RequestBody MiRequestDTO request) {}

    // UPDATE
    @Operation(summary = "Actualizar")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Actualizado"),
        @ApiResponse(responseCode = "404", description = "No encontrado")
    })
    @PutMapping("/{id}")
    public ResponseEntity<MiDTO> actualizar(
        @PathVariable Long id,
        @Valid @RequestBody MiRequestDTO request
    ) {}

    // DELETE
    @Operation(summary = "Eliminar")
    @ApiResponses({
        @ApiResponse(responseCode = "204", description = "Eliminado"),
        @ApiResponse(responseCode = "404", description = "No encontrado")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {}
}
```

### Template de DTO

```java
@Schema(description = "Descripción del DTO")
public class MiDTO {

    @Schema(description = "ID único", example = "1", accessMode = Schema.AccessMode.READ_ONLY)
    private Long id;

    @Schema(description = "Nombre", example = "Ejemplo", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank
    private String nombre;

    @Schema(description = "Estado activo", example = "true", defaultValue = "true")
    private Boolean activo;

    @Schema(description = "Fecha creación", example = "2026-01-26T10:30:00", accessMode = Schema.AccessMode.READ_ONLY)
    private LocalDateTime fechaCreacion;
}
```

---

## Archivos Críticos a Modificar

### Fase 1 (PRIORIDAD ALTA)
1. `backend/src/main/java/com/styp/cenate/api/seguridad/AuthController.java` ⭐ **PRIMERO**
2. `backend/src/main/java/com/styp/cenate/api/usuario/UsuarioController.java`
3. `backend/src/main/java/com/styp/cenate/api/chatbot/ChatBotController.java`
4. `backend/src/main/java/com/styp/cenate/api/bolsas/BolsasController.java`
5. `backend/src/main/java/com/styp/cenate/api/ipress/IpressController.java`
6. `backend/src/main/java/com/styp/cenate/api/disponibilidad/DisponibilidadController.java`

### DTOs a Crear (Fase 1)
- `backend/src/main/java/com/styp/cenate/dto/auth/` (4 DTOs)
- `backend/src/main/java/com/styp/cenate/dto/usuario/` (5 DTOs)
- `backend/src/main/java/com/styp/cenate/dto/chatbot/` (4 DTOs)
- `backend/src/main/java/com/styp/cenate/dto/bolsas/` (6 DTOs)
- `backend/src/main/java/com/styp/cenate/dto/ipress/` (4 DTOs)
- `backend/src/main/java/com/styp/cenate/dto/disponibilidad/` (4 DTOs)

### Controllers de Referencia (YA documentados)
- `backend/src/main/java/com/styp/cenate/api/TeleECGController.java` ⭐ **COPIAR PATRÓN**
- `backend/src/main/java/com/styp/cenate/api/mbac/AuditoriaController.java` ⭐ **COPIAR PATRÓN**
- `backend/src/main/java/com/styp/cenate/api/horario/RendimientoHorarioController.java`

### Scripts (CREAR AHORA)
- `backend/scripts/generate-openapi-template.sh`
- `backend/scripts/validate-openapi.sh`

### Configuración
- `backend/build.gradle` - Agregar task `validateOpenAPI`
- `backend/src/main/java/com/styp/cenate/config/SwaggerConfig.java` - Ya configurado ✅

---

## Verificación y Pruebas

### Checklist por Controller

**Para cada controller documentado:**
- [ ] Agregar `@Tag` a nivel de clase
- [ ] Documentar TODOS los endpoints con `@Operation`
- [ ] Agregar `@ApiResponses` a cada endpoint (mínimo: 200, 401, 404)
- [ ] Documentar parámetros con `@Parameter` (incluir examples)
- [ ] Crear DTOs necesarios con `@Schema`
- [ ] Incluir `@ExampleObject` en respuestas complejas
- [ ] Compilar sin errores: `./gradlew build`
- [ ] Validar en Swagger UI: `http://localhost:8080/swagger-ui.html`
- [ ] Probar "Try it out" en 2-3 endpoints aleatorios
- [ ] Verificar que ejemplos son JSON válido

### Validación Swagger UI

**Abrir:** `http://localhost:8080/swagger-ui.html`

**Verificar:**
1. ✅ Controller aparece en lista de tags
2. ✅ Cada endpoint muestra summary y description
3. ✅ Parámetros tienen descripción y ejemplo
4. ✅ Responses muestran códigos HTTP y schemas
5. ✅ "Try it out" ejecuta correctamente
6. ✅ Ejemplos de response son válidos

### Generar SDK Cliente (Validación Final)

```bash
# Iniciar backend
cd backend
./gradlew bootRun &
sleep 10

# Descargar spec OpenAPI
curl http://localhost:8080/v3/api-docs -o openapi.json

# Generar SDK Java
npx @openapitools/openapi-generator-cli generate \
  -i openapi.json \
  -g java \
  -o ./sdk-cliente-java \
  --additional-properties=artifactId=cenate-api-client,groupId=com.cenate

# Verificar compilación
cd sdk-cliente-java
mvn clean install

# Éxito: SDK compila sin errores
```

### Validación Automática

```bash
# Ejecutar script de validación
./backend/scripts/validate-openapi.sh

# Esperado en Fase 1: "📊 Cobertura: 12/90 (13.3%)"
# Esperado en Fase 2: "📊 Cobertura: 27/90 (30%)"
# Esperado en Fase 3: "✅ 100% documentado"
```

### Validación de Ejemplos JSON

```bash
# Extraer todos los ejemplos del spec
curl -s http://localhost:8080/v3/api-docs | \
  jq -r '.. | .example? // empty' | \
  while read -r example; do
    echo "$example" | jq . > /dev/null 2>&1 || echo "❌ Ejemplo inválido: $example"
  done

# Esperado: Sin errores (todos los ejemplos válidos)
```

---

## Criterios de Éxito

### Fase 1
- ✅ 6 controllers críticos documentados
- ✅ Cobertura: 13.3% (12 de 90 controllers)
- ✅ Swagger UI muestra 6 tags nuevos con ejemplos
- ✅ PR aprobado y mergeado

### Fase 2
- ✅ 21 controllers documentados en total
- ✅ Cobertura: 30% (27 de 90 controllers)
- ✅ Swagger UI funcional con todos los endpoints core

### Fase 3 (Final)
- ✅ 90 controllers documentados (100%)
- ✅ SDK cliente Java generado sin errores
- ✅ Documentación exportada en JSON y YAML
- ✅ Script `validate-openapi.sh` pasa con 100%
- ✅ Swagger UI completo y navegable

---

## Próximos Pasos Inmediatos

### Paso 1: Preparación
```bash
# Crear carpeta de scripts
mkdir -p backend/scripts

# Crear scripts (copiar contenido de sección Automatización)
touch backend/scripts/generate-openapi-template.sh
touch backend/scripts/validate-openapi.sh
chmod +x backend/scripts/*.sh

# Crear branch
git checkout -b feature/openapi-phase1-critical-controllers
```

### Paso 2: Validar Environment
```bash
# Iniciar backend
cd backend
./gradlew bootRun &

# Verificar Swagger UI accesible
curl http://localhost:8080/swagger-ui.html | grep "Swagger UI"

# Descargar baseline actual
curl http://localhost:8080/v3/api-docs > openapi-baseline.json

# Contar controllers actuales
jq '.tags | length' openapi-baseline.json
# Esperado: 6
```

### Paso 3: Documentar AuthController (DÍA 1)
```bash
# Leer controller actual
cat backend/src/main/java/com/styp/cenate/api/seguridad/AuthController.java

# Crear DTOs (ver sección 1.1)
mkdir -p backend/src/main/java/com/styp/cenate/dto/auth
# Crear: LoginRequestDTO.java, LoginResponseDTO.java, etc.

# Agregar anotaciones OpenAPI al controller

# Compilar y validar
./gradlew build
curl http://localhost:8080/swagger-ui.html

# Commit
git add .
git commit -m "docs: Agregar documentación OpenAPI a AuthController (5 endpoints)"
```

### Paso 4: Continuar con UsuarioController → ChatBotController → ...

---

## Notas Importantes

1. **Reutilizar patrones:** TeleECGController y AuditoriaController son ejemplos perfectos a copiar
2. **DTOs primero:** Siempre crear DTOs antes de documentar el controller
3. **Validar continuamente:** No esperar al final de fase para probar Swagger UI
4. **Ejemplos realistas:** Usar datos de ejemplo del dominio CENATE (DNIs peruanos, emails @essalud.gob.pe)
5. **Códigos HTTP consistentes:**
   - 200: GET exitoso
   - 201: POST exitoso
   - 204: DELETE exitoso
   - 400: Validación fallida
   - 401: Token JWT inválido
   - 403: Sin permisos MBAC
   - 404: Recurso no encontrado
   - 409: Conflicto de negocio
   - 500: Error interno

---

**Tiempo estimado total:** 12-15 días (58-75 horas)
**Beneficio:** Swagger UI completo + SDKs auto-generables + Documentación siempre actualizada
