# Arquitectura Spring AI - CENATE (Clean Architecture)

**Versión:** 1.35.0
**Fecha:** 2026-01-26
**Autor:** Ing. Styp Canto Rondón
**Módulo:** Spring AI Integration

---

## Índice

1. [Visión General](#visión-general)
2. [Principios Arquitectónicos](#principios-arquitectónicos)
3. [Capas de Clean Architecture](#capas-de-clean-architecture)
4. [Flujo de Datos](#flujo-de-datos)
5. [Casos de Uso Implementados](#casos-de-uso-implementados)
6. [Patrones de Diseño](#patrones-de-diseño)
7. [Integración con CENATE Existente](#integración-con-cenate-existente)
8. [Seguridad y Auditoría](#seguridad-y-auditoría)
9. [Performance y Escalabilidad](#performance-y-escalabilidad)
10. [Testing Strategy](#testing-strategy)

---

## Visión General

La integración de Spring AI en CENATE sigue **Clean Architecture** (arquitectura hexagonal) para garantizar:

- **Independencia de frameworks:** La lógica de negocio no depende de Spring AI
- **Testabilidad:** Cada capa es testeable en aislamiento
- **Mantenibilidad:** Cambios en una capa no afectan otras
- **Escalabilidad:** Fácil agregar nuevos casos de uso o proveedores LLM

### Diagrama de Alto Nivel

```
┌────────────────────────────────────────────────────────────┐
│                    EXTERNAL INTERFACES                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │  REST API    │  │  WebSocket   │  │  Scheduled   │    │
│  │  (HTTP)      │  │  (Real-time) │  │  Jobs        │    │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘    │
└─────────┼──────────────────┼──────────────────┼────────────┘
          │                  │                  │
          ▼                  ▼                  ▼
┌────────────────────────────────────────────────────────────┐
│              INFRASTRUCTURE LAYER (Adapters)               │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  IN Adapters          │  OUT Adapters                │ │
│  │  - Controllers        │  - AnthropicClaudeAdapter    │ │
│  │  - WebSocket          │  - RedisMemoryAdapter        │ │
│  │  - EventListeners     │  - FileSystemPromptAdapter   │ │
│  │                       │  - FunctionCallingAdapter    │ │
│  └──────────────────────────────────────────────────────┘ │
└────────────────────────┬──────────────────────────────────┘
                         │ DTOs
                         ▼
┌────────────────────────────────────────────────────────────┐
│              APPLICATION LAYER (Use Cases)                 │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  Use Case Services:                                  │ │
│  │  - DisponibilidadCitasUseCaseService                 │ │
│  │  - DiagnosticoAsistenteUseCaseService                │ │
│  │  - AnalisisTeleECGUseCaseService                     │ │
│  │  - GeneracionReporteMedicoUseCaseService             │ │
│  │                                                       │ │
│  │  Orchestration Services:                             │ │
│  │  - ChatOrchestrationService                          │ │
│  │  - PromptEngineeringService                          │ │
│  │  - LLMResponseValidationService                      │ │
│  └──────────────────────────────────────────────────────┘ │
└────────────────────────┬──────────────────────────────────┘
                         │ Ports (Interfaces)
                         ▼
┌────────────────────────────────────────────────────────────┐
│                    DOMAIN LAYER (Core)                     │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  Domain Models:                                      │ │
│  │  - ConversacionContext                               │ │
│  │  - MensajeLLM                                        │ │
│  │  - DisponibilidadSugerida                            │ │
│  │  - SugerenciaDiagnostico                             │ │
│  │  - ResultadoAnalisisECG                              │ │
│  │                                                       │ │
│  │  Port Interfaces (Contratos):                        │ │
│  │  IN:  DisponibilidadCitasUseCase                     │ │
│  │  OUT: LLMServicePort, PromptTemplatePort,            │ │
│  │       ConversacionMemoryPort, FunctionCallingPort    │ │
│  │                                                       │ │
│  │  Domain Exceptions:                                  │ │
│  │  - LLMServiceException, PromptValidationException    │ │
│  │  - ContextoInvalidoException, FunctionCallException  │ │
│  └──────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────┘
```

---

## Principios Arquitectónicos

### 1. Dependency Inversion Principle (DIP)

- **Regla de dependencias:** Las capas externas dependen de las internas, NUNCA al revés
- **Domain layer** no conoce Spring, Anthropic API, Redis, PostgreSQL
- **Application layer** solo conoce interfaces del dominio (ports)
- **Infrastructure layer** implementa los ports

### 2. Separation of Concerns

Cada capa tiene una responsabilidad clara:

| Capa | Responsabilidad | No Debe Contener |
|------|----------------|------------------|
| **Domain** | Reglas de negocio, modelos puros | Anotaciones Spring, HTTP, BD |
| **Application** | Orquestación de casos de uso | Detalles de implementación |
| **Infrastructure** | Comunicación con externos | Lógica de negocio |

### 3. Single Responsibility Principle (SRP)

- Un `UseCase` = Un flujo de negocio completo
- Un `Adapter` = Una integración externa específica
- Un `Port` = Un contrato claro y cohesivo

### 4. Open/Closed Principle (OCP)

- Fácil agregar nuevos proveedores LLM (OpenAI, Ollama) sin modificar el dominio
- Fácil agregar nuevos casos de uso sin cambiar infraestructura

---

## Capas de Clean Architecture

### DOMAIN LAYER (Núcleo)

**Ubicación:** `com.styp.cenate.ai.domain`

**Contenido:**
- **Models:** Entidades de negocio puras (sin anotaciones JPA/Jackson)
  - `ConversacionContext`: Estado completo de una conversación
  - `MensajeLLM`: Mensaje individual (usuario/asistente/sistema)
  - `DisponibilidadSugerida`: Resultado de búsqueda de citas
  - `SugerenciaDiagnostico`: Pre-diagnóstico generado por IA
  - `ResultadoAnalisisECG`: Análisis de imagen ECG

- **Ports (Interfaces):**
  - **IN Ports (Use Cases):** Contratos que la aplicación debe cumplir
    - `DisponibilidadCitasUseCase`
    - `DiagnosticoAsistenteUseCase`
    - `AnalisisTeleECGUseCase`
    - `GeneracionReporteMedicoUseCase`

  - **OUT Ports (Dependencies):** Contratos que la infraestructura debe cumplir
    - `LLMServicePort`: Comunicación con LLM (Anthropic, OpenAI, etc.)
    - `PromptTemplatePort`: Gestión de templates de prompts
    - `ConversacionMemoryPort`: Persistencia de conversaciones
    - `FunctionCallingPort`: Invocación de funciones del sistema

- **Exceptions:** Errores de dominio
  - `LLMServiceException`: Error comunicándose con LLM
  - `PromptValidationException`: Prompt inválido
  - `ContextoInvalidoException`: Sesión inválida o expirada
  - `FunctionCallException`: Error ejecutando función

**Reglas:**
- ✅ Solo Java puro (ninguna dependencia externa)
- ✅ Modelos inmutables (usar `@Builder`, `final` fields)
- ✅ Validación en constructores (fail-fast)
- ❌ NO anotaciones de Spring
- ❌ NO dependencias de HTTP, JSON, BD

---

### APPLICATION LAYER (Casos de Uso)

**Ubicación:** `com.styp.cenate.ai.application`

**Contenido:**
- **Use Case Services:** Implementaciones de los IN Ports
  - `DisponibilidadCitasUseCaseService`: Orquesta búsqueda de citas con IA
  - `DiagnosticoAsistenteUseCaseService`: Asistente de diagnóstico
  - `AnalisisTeleECGUseCaseService`: Análisis de imágenes ECG
  - `GeneracionReporteMedicoUseCaseService`: Generación de reportes

- **Orchestration Services:** Lógica compartida entre casos de uso
  - `ChatOrchestrationService`: Gestión de flujo conversacional
  - `PromptEngineeringService`: Construcción dinámica de prompts
  - `LLMResponseValidationService`: Validación de respuestas del LLM
  - `ConversacionContextService`: Gestión de contexto de conversaciones

- **DTOs:** Objetos de transferencia entre capas
  - `ChatRequestDTO`: Entrada de endpoints REST
  - `ChatResponseDTO`: Salida de endpoints REST
  - `DiagnosticoRequestDTO`, `AnalisisECGRequestDTO`, etc.

**Responsabilidades:**
- Implementar la lógica de negocio (qué hacer, no cómo hacerlo)
- Orquestar llamadas a múltiples OUT Ports
- Manejar transacciones (`@Transactional`)
- Transformar domain models ↔ DTOs
- Auditar acciones (`AuditLogService`)

**Reglas:**
- ✅ Anotaciones Spring permitidas (`@Service`, `@Transactional`)
- ✅ Inyección de dependencias (constructor injection)
- ❌ NO lógica de HTTP (códigos 200, 400, etc.)
- ❌ NO detalles de implementación de adapters

---

### INFRASTRUCTURE LAYER (Adaptadores)

**Ubicación:** `com.styp.cenate.ai.infrastructure`

**Contenido:**

#### IN Adapters (Entrada al sistema)
- **Controllers REST:**
  - `ChatbotDisponibilidadController`: Endpoints HTTP para chatbot
  - `AsistenteDiagnosticoController`: Endpoints diagnóstico
  - `AnalizadorTeleECGController`: Endpoints análisis ECG
  - `GeneradorReportesMedicosController`: Endpoints reportes

#### OUT Adapters (Salida hacia externos)
- **LLM Adapters:**
  - `AnthropicClaudeAdapter`: Implementa `LLMServicePort` para Claude
  - `OpenAIAdapter`: Implementa `LLMServicePort` para GPT (futuro)
  - `OllamaAdapter`: Implementa `LLMServicePort` para Ollama local (dev)

- **Memory Adapters:**
  - `InMemoryConversacionMemoryAdapter`: Memoria en RAM (dev)
  - `RedisConversacionMemoryAdapter`: Memoria en Redis (prod)

- **Prompt Adapters:**
  - `FileSystemPromptTemplateAdapter`: Prompts en archivos .txt
  - `DatabasePromptTemplateAdapter`: Prompts en BD (versionado)

- **Function Calling Adapter:**
  - `SpringAIFunctionCallingAdapter`: Ejecuta funciones del sistema

**Responsabilidades:**
- Comunicación HTTP, REST, WebSocket
- Serialización/deserialización JSON
- Manejo de errores HTTP (códigos de estado)
- Configuración de beans Spring
- Integración con APIs externas

**Reglas:**
- ✅ Depende de frameworks (Spring, Jackson, Redis, etc.)
- ✅ Implementa ports del dominio
- ✅ Maneja excepciones de infraestructura
- ❌ NO contiene lógica de negocio

---

## Flujo de Datos

### Ejemplo: Usuario busca disponibilidad de citas

```
1. Frontend envía POST /api/ai/chatbot-disponibilidad/iniciar
   Body: { "dniPaciente": "12345678", "mensaje": "Necesito cardiólogo" }

   ↓

2. ChatbotDisponibilidadController (Infrastructure IN)
   - Valida JWT token
   - Valida DTO con @Valid
   - Extrae usuarioId del authentication

   ↓

3. Llama a DisponibilidadCitasUseCaseService.iniciarConversacion()
   (Application Layer)
   - Crea ConversacionContext (Domain Model)
   - Obtiene prompt template desde PromptTemplatePort
   - Rellena variables {dniPaciente}, {fechaActual}

   ↓

4. Invoca LLMServicePort.chatWithFunctions()
   (Infrastructure OUT - AnthropicClaudeAdapter)
   - Convierte MensajeLLM → Spring AI Message
   - Llama a Anthropic Claude API
   - LLM decide invocar función "buscarDisponibilidadMedica"

   ↓

5. FunctionCallingPort.executeFunction("buscarDisponibilidadMedica", args)
   (Infrastructure OUT - SpringAIFunctionCallingAdapter)
   - Invoca DisponibilidadMedicaService del sistema CENATE
   - Ejecuta query SQL en dim_disponibilidad_medica
   - Retorna JSON con resultados

   ↓

6. LLM recibe resultados de función y genera respuesta natural
   "Encontré 2 opciones disponibles en Hospital Rebagliati..."

   ↓

7. Application Service guarda conversación en memoria
   ConversacionMemoryPort.saveContext(sessionId, context)
   (Infrastructure OUT - RedisConversacionMemoryAdapter)

   ↓

8. Application Service audita acción
   AuditLogService.registrarEvento("AI_CHATBOT_DISPONIBILIDAD_INICIO", ...)

   ↓

9. Controller devuelve ChatResponseDTO al frontend
   { "sessionId": "uuid", "respuesta": "...", "sugerencias": [...] }

   ↓

10. Frontend renderiza respuesta en UI de chat
```

---

## Casos de Uso Implementados

### 1. Chatbot de Disponibilidad de Citas

**Use Case:** `DisponibilidadCitasUseCase`
**Service:** `DisponibilidadCitasUseCaseService`
**Controller:** `ChatbotDisponibilidadController`

**Flujo:**
1. Paciente inicia conversación
2. LLM extrae intención (especialidad, fecha, IPRESS)
3. System invoca función `buscarDisponibilidadMedica`
4. LLM presenta resultados de manera conversacional
5. Paciente refina búsqueda o confirma cita
6. System invoca función `confirmarCita`
7. Conversación finalizada

**Function Calling:**
- `buscarDisponibilidadMedica(especialidad, ipressCodigo, fechaDesde, fechaHasta)`
- `confirmarCita(disponibilidadId, dniPaciente)`

**Endpoints:**
- `POST /api/ai/chatbot-disponibilidad/iniciar`
- `POST /api/ai/chatbot-disponibilidad/{sessionId}/continuar`
- `POST /api/ai/chatbot-disponibilidad/{sessionId}/confirmar-cita`
- `GET /api/ai/chatbot-disponibilidad/{sessionId}/historial`
- `DELETE /api/ai/chatbot-disponibilidad/{sessionId}`

---

### 2. Asistente de Diagnóstico (Personal Externo)

**Use Case:** `DiagnosticoAsistenteUseCase`
**Service:** `DiagnosticoAsistenteUseCaseService`
**Controller:** `AsistenteDiagnosticoController`

**Flujo:**
1. Personal de salud inicia formulario de diagnóstico
2. LLM hace preguntas sobre síntomas del paciente
3. LLM analiza síntomas y genera pre-diagnóstico
4. System valida con base de conocimiento (CIE-10)
5. LLM sugiere especialidad y nivel de urgencia
6. Personal revisa y ajusta diagnóstico final

**Function Calling:**
- `buscarCIE10(sintomas)`
- `obtenerEspecialidadPorDiagnostico(codigoCIE10)`

**Endpoints:**
- `POST /api/ai/asistente-diagnostico/iniciar`
- `POST /api/ai/asistente-diagnostico/{sessionId}/continuar`
- `POST /api/ai/asistente-diagnostico/{sessionId}/generar-diagnostico`

---

### 3. Análisis de Imágenes Tele-ECG

**Use Case:** `AnalisisTeleECGUseCase`
**Service:** `AnalisisTeleECGUseCaseService`
**Controller:** `AnalizadorTeleECGController`

**Flujo:**
1. Médico sube imagen ECG al sistema
2. System convierte imagen a base64
3. LLM (con visión) analiza la imagen ECG
4. LLM detecta hallazgos (ritmo, anomalías, severidad)
5. System guarda análisis preliminar en BD
6. Médico revisa y valida análisis IA

**Function Calling:**
- `obtenerHistorialMedicoECG(pacienteId)` (contexto adicional)

**Endpoints:**
- `POST /api/ai/analisis-ecg/analizar`
- `GET /api/ai/analisis-ecg/{teleecgId}/resultado`

---

### 4. Generador de Reportes Médicos

**Use Case:** `GeneracionReporteMedicoUseCase`
**Service:** `GeneracionReporteMedicoUseCaseService`
**Controller:** `GeneradorReportesMedicosController`

**Flujo:**
1. Médico selecciona paciente y tipo de reporte
2. System recopila datos del paciente (historial, citas, diagnósticos)
3. LLM genera narrativa médica estructurada
4. System valida formato y contenido
5. Médico revisa y edita si es necesario
6. Reporte exportado a PDF

**Function Calling:**
- `obtenerHistorialMedicoPaciente(dniPaciente)`
- `obtenerCitasRecientes(dniPaciente, cantidadMeses)`

**Endpoints:**
- `POST /api/ai/generador-reportes/generar`
- `GET /api/ai/generador-reportes/{reporteId}`
- `PUT /api/ai/generador-reportes/{reporteId}`

---

## Patrones de Diseño

### 1. Adapter Pattern (Hexagonal Architecture)

Cada integración externa es un adaptador que implementa un port:

```java
// Port (Dominio)
public interface LLMServicePort {
    String chat(List<MensajeLLM> mensajes, ...);
}

// Adapter (Infraestructura)
@Component
public class AnthropicClaudeAdapter implements LLMServicePort {
    private final AnthropicChatModel chatModel;

    @Override
    public String chat(List<MensajeLLM> mensajes, ...) {
        // Implementación específica de Anthropic
    }
}
```

### 2. Strategy Pattern (Proveedores LLM)

Cambiar entre proveedores sin modificar código:

```properties
# application.properties
cenate.ai.provider=anthropic  # o openai, ollama
```

```java
@Bean
@ConditionalOnProperty(name = "cenate.ai.provider", havingValue = "anthropic")
public LLMServicePort anthropicAdapter(...) { ... }

@Bean
@ConditionalOnProperty(name = "cenate.ai.provider", havingValue = "openai")
public LLMServicePort openAIAdapter(...) { ... }
```

### 3. Template Method Pattern (Orquestación de Chat)

```java
public abstract class ChatOrchestrationService {

    protected final LLMServicePort llmService;
    protected final ConversacionMemoryPort memory;

    public String processMessage(String sessionId, String mensaje) {
        // 1. Obtener contexto (template method)
        ConversacionContext context = obtenerContexto(sessionId);

        // 2. Preparar prompt (hook method - subclasses override)
        String prompt = prepararPrompt(context, mensaje);

        // 3. Invocar LLM (template method)
        String respuesta = invocarLLM(context, prompt);

        // 4. Post-procesar respuesta (hook method)
        respuesta = postProcesarRespuesta(respuesta);

        // 5. Guardar contexto (template method)
        guardarContexto(sessionId, context);

        return respuesta;
    }

    protected abstract String prepararPrompt(ConversacionContext ctx, String msg);
    protected abstract String postProcesarRespuesta(String respuesta);
}
```

### 4. Factory Pattern (Creación de Conversaciones)

```java
@Component
public class ConversacionContextFactory {

    public ConversacionContext crearContextoDisponibilidad(String dni, Long userId) {
        return ConversacionContext.builder()
            .sessionId(UUID.randomUUID().toString())
            .dniPaciente(dni)
            .usuarioId(userId)
            .tipo(TipoConversacion.DISPONIBILIDAD_CITAS)
            .build();
    }

    public ConversacionContext crearContextoDiagnostico(...) { ... }
}
```

### 5. Builder Pattern (Domain Models)

```java
ConversacionContext context = ConversacionContext.builder()
    .sessionId("uuid")
    .dniPaciente("12345678")
    .tipo(TipoConversacion.DISPONIBILIDAD_CITAS)
    .mensajes(new ArrayList<>())
    .build();
```

### 6. Repository Pattern (Persistencia)

```java
// Port (Dominio)
public interface ConversacionMemoryPort {
    void saveContext(String sessionId, ConversacionContext context);
    Optional<ConversacionContext> getContext(String sessionId);
}

// Adapter (Infraestructura)
@Component
public class RedisConversacionMemoryAdapter implements ConversacionMemoryPort {
    private final RedisTemplate<String, ConversacionContext> redisTemplate;

    @Override
    public void saveContext(String sessionId, ConversacionContext context) {
        redisTemplate.opsForValue().set(sessionId, context, 30, TimeUnit.MINUTES);
    }
}
```

---

## Integración con CENATE Existente

### 1. Auditoría

Todas las interacciones con IA se auditan:

```java
auditLogService.registrarEvento(
    "AI_CHATBOT_DISPONIBILIDAD_INICIO",
    usuarioId,
    "Conversación iniciada con IA. SessionId: " + sessionId,
    "SISTEMA",
    null,
    Map.of(
        "sessionId", sessionId,
        "dniPaciente", dniPaciente,
        "proveedor", "anthropic",
        "modelo", "claude-3-5-sonnet"
    )
);
```

### 2. MBAC (Permisos)

Endpoints protegidos con seguridad existente:

```java
@CheckMBACPermission(pagina = "/ai/chatbot", accion = "usar")
@PostMapping("/iniciar")
public ResponseEntity<ChatResponseDTO> iniciarConversacion(...) { ... }
```

### 3. Integración con Módulos

**Disponibilidad Médica:**
```java
@Component
public class DisponibilidadMedicaFunction implements FunctionCallback {

    private final DisponibilidadMedicaService disponibilidadService;

    @Override
    public String call(String functionArguments) {
        // Parsear argumentos
        Map<String, Object> args = parseJson(functionArguments);

        // Invocar servicio existente de CENATE
        List<DimDisponibilidadMedica> disponibilidades =
            disponibilidadService.buscarDisponibilidad(
                (String) args.get("especialidad"),
                (String) args.get("ipressCodigo"),
                LocalDate.parse((String) args.get("fechaDesde")),
                LocalDate.parse((String) args.get("fechaHasta"))
            );

        // Retornar JSON para el LLM
        return convertToJson(disponibilidades);
    }
}
```

**Tele-ECG:**
```java
public ResultadoAnalisisECG analizarECG(Long teleecgId) {
    // 1. Obtener imagen desde BD
    DimTeleekgs teleecg = teleekgRepository.findById(teleecgId)
        .orElseThrow(() -> new NotFoundException("TeleECG no encontrado"));

    // 2. Convertir imagen a base64
    String imagenBase64 = Base64.getEncoder().encodeToString(teleecg.getImagen());

    // 3. Invocar LLM con visión
    String prompt = promptTemplate.getTemplate("analisis-ecg-system-v1");
    String analisisTexto = llmService.analyzeImage(imagenBase64, prompt, 4096);

    // 4. Parsear resultado del LLM a domain model
    ResultadoAnalisisECG resultado = parseAnalisisECG(analisisTexto);

    // 5. Guardar en BD
    guardarAnalisisIA(teleecgId, resultado);

    return resultado;
}
```

### 4. Entidades JPA Nuevas

```sql
-- Tabla para historial de conversaciones (auditoría)
CREATE TABLE dim_conversacion_historial (
    id BIGSERIAL PRIMARY KEY,
    session_id VARCHAR(100) UNIQUE NOT NULL,
    usuario_id BIGINT REFERENCES dim_usuario(id_usuario),
    dni_paciente VARCHAR(8),
    tipo_conversacion VARCHAR(50), -- DISPONIBILIDAD_CITAS, DIAGNOSTICO, etc.
    estado VARCHAR(20), -- ACTIVA, COMPLETADA, TIMEOUT, ERROR
    proveedor_llm VARCHAR(50), -- anthropic, openai, ollama
    modelo_llm VARCHAR(100), -- claude-3-5-sonnet, gpt-4, etc.
    total_mensajes INT,
    tokens_consumidos INT,
    costo_estimado DECIMAL(10,4),
    iniciado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    finalizado_en TIMESTAMP,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_conversacion_session ON dim_conversacion_historial(session_id);
CREATE INDEX idx_conversacion_usuario ON dim_conversacion_historial(usuario_id);
CREATE INDEX idx_conversacion_fecha ON dim_conversacion_historial(iniciado_en);

-- Tabla para mensajes de conversación (detalle)
CREATE TABLE dim_conversacion_mensajes (
    id BIGSERIAL PRIMARY KEY,
    conversacion_id BIGINT REFERENCES dim_conversacion_historial(id),
    rol VARCHAR(20), -- USER, ASSISTANT, SYSTEM
    contenido TEXT NOT NULL,
    tokens_consumidos INT,
    latencia_ms INT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_mensaje_conversacion ON dim_conversacion_mensajes(conversacion_id);

-- Tabla para análisis IA de Tele-ECG
CREATE TABLE dim_teleecg_analisis_ia (
    id BIGSERIAL PRIMARY KEY,
    teleecg_id BIGINT REFERENCES dim_teleekgs(id),
    analisis_descriptivo TEXT,
    hallazgos JSONB, -- Array de hallazgos
    ritmo_cardiaco VARCHAR(100),
    frecuencia_cardiaca INT,
    anomalias JSONB, -- Array de anomalías
    severidad VARCHAR(20), -- NORMAL, LEVE, MODERADO, SEVERO, CRITICO
    confianza DECIMAL(3,2), -- 0.00 - 1.00
    requiere_revision_urgente BOOLEAN,
    proveedor_llm VARCHAR(50),
    modelo_llm VARCHAR(100),
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    revisado_por BIGINT REFERENCES dim_usuario(id_usuario),
    revisado_en TIMESTAMP,
    estado_revision VARCHAR(20) -- PENDIENTE, APROBADO, RECHAZADO
);

CREATE INDEX idx_teleecg_analisis ON dim_teleecg_analisis_ia(teleecg_id);
CREATE INDEX idx_teleecg_revision ON dim_teleecg_analisis_ia(estado_revision);
```

---

## Seguridad y Auditoría

### 1. Validación de Inputs

```java
public class ChatRequestDTO {
    @Pattern(regexp = "^\\d{8}$", message = "DNI debe tener 8 dígitos")
    private String dniPaciente;

    @NotBlank(message = "El mensaje no puede estar vacío")
    @Size(max = 2000, message = "El mensaje no puede exceder 2000 caracteres")
    private String mensaje;
}
```

### 2. Sanitización de Datos Sensibles

```java
public void registrarAuditoriaIA(String sessionId, String mensaje) {
    // Enmascarar DNI en logs
    String mensajeSanitizado = mensaje.replaceAll("\\d{8}", "********");

    log.info("Mensaje IA. SessionId: {}, Mensaje: {}", sessionId, mensajeSanitizado);
}
```

### 3. Rate Limiting

```java
@Component
public class AIRateLimitInterceptor {

    private final RateLimiter rateLimiter = RateLimiter.create(10.0); // 10 req/s

    public boolean checkRateLimit(Long usuarioId) {
        return rateLimiter.tryAcquire(1, TimeUnit.SECONDS);
    }
}
```

### 4. Encriptación de Conversaciones Sensibles

```java
@Component
public class ConversacionEncryptionService {

    private final AESEncryptor encryptor;

    public String encryptMessage(String mensaje) {
        return encryptor.encrypt(mensaje);
    }

    public String decryptMessage(String mensajeEncriptado) {
        return encryptor.decrypt(mensajeEncriptado);
    }
}
```

---

## Performance y Escalabilidad

### 1. Caché de Prompts

```java
@Cacheable(value = "prompts", key = "#templateId")
public String getTemplate(String templateId) {
    // Leer desde filesystem solo la primera vez
    return Files.readString(Path.of("prompts", templateId + ".txt"));
}
```

### 2. Compresión de Contexto

```java
public List<MensajeLLM> comprimirContexto(List<MensajeLLM> mensajes) {
    if (mensajes.size() <= MAX_MENSAJES_CONTEXTO) {
        return mensajes;
    }

    // Estrategia: Mantener primeros 2 + últimos 8 mensajes
    List<MensajeLLM> comprimido = new ArrayList<>();
    comprimido.addAll(mensajes.subList(0, 2)); // Mensajes iniciales (contexto)
    comprimido.addAll(mensajes.subList(
        mensajes.size() - 8,
        mensajes.size()
    )); // Últimos mensajes (conversación reciente)

    return comprimido;
}
```

### 3. Streaming de Respuestas (Future)

```java
@GetMapping(value = "/{sessionId}/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
public Flux<String> streamResponse(@PathVariable String sessionId) {
    return llmService.chatStreaming(sessionId);
}
```

### 4. Connection Pooling

```java
@Bean
public RestClient anthropicRestClient() {
    return RestClient.builder()
        .baseUrl("https://api.anthropic.com")
        .defaultHeader("x-api-key", anthropicApiKey)
        .requestFactory(new HttpComponentsClientHttpRequestFactory(
            HttpClients.custom()
                .setMaxConnTotal(100)
                .setMaxConnPerRoute(20)
                .build()
        ))
        .build();
}
```

---

## Testing Strategy

### 1. Unit Tests (Domain Layer)

```java
@Test
void testConversacionContext_agregarMensaje() {
    // Given
    ConversacionContext context = ConversacionContext.builder()
        .sessionId("test-session")
        .build();

    MensajeLLM mensaje = MensajeLLM.builder()
        .rol(RolMensaje.USER)
        .contenido("Hola")
        .build();

    // When
    context.agregarMensaje(mensaje);

    // Then
    assertEquals(1, context.getTotalMensajes());
    assertEquals("Hola", context.getMensajes().get(0).getContenido());
}
```

### 2. Unit Tests (Application Layer)

```java
@ExtendWith(MockitoExtension.class)
class DisponibilidadCitasUseCaseServiceTest {

    @Mock
    private LLMServicePort llmService;

    @Mock
    private ConversacionMemoryPort memory;

    @InjectMocks
    private DisponibilidadCitasUseCaseService service;

    @Test
    void testIniciarConversacion_exito() {
        // Given
        when(llmService.chatWithFunctions(...)).thenReturn("Respuesta IA");

        // When
        var resultado = service.iniciarConversacion("12345678", "Hola", 1L);

        // Then
        assertNotNull(resultado.sessionId());
        assertEquals("Respuesta IA", resultado.respuestaInicial());
        verify(memory, times(1)).saveContext(anyString(), any());
    }
}
```

### 3. Integration Tests (Controller)

```java
@WebMvcTest(ChatbotDisponibilidadController.class)
class ChatbotDisponibilidadControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private DisponibilidadCitasUseCase useCase;

    @Test
    @WithMockUser
    void testIniciarConversacion_retorna200() throws Exception {
        // Given
        var mockResponse = new ConversacionDisponibilidadDTO(
            "session-123",
            "Hola, ¿en qué puedo ayudarte?",
            List.of()
        );
        when(useCase.iniciarConversacion(...)).thenReturn(mockResponse);

        // When & Then
        mockMvc.perform(post("/api/ai/chatbot-disponibilidad/iniciar")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"dniPaciente\":\"12345678\",\"mensaje\":\"Hola\"}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.sessionId").value("session-123"));
    }
}
```

### 4. Contract Tests (Anthropic API)

```java
@Test
void testAnthropicAdapter_chatBasico() {
    // Given
    AnthropicClaudeAdapter adapter = new AnthropicClaudeAdapter(chatModel, "claude-3-5-sonnet");

    List<MensajeLLM> mensajes = List.of(
        MensajeLLM.builder()
            .rol(RolMensaje.USER)
            .contenido("¿Qué es CENATE?")
            .build()
    );

    // When
    String respuesta = adapter.chat(mensajes, null, 0.7, 100);

    // Then
    assertNotNull(respuesta);
    assertTrue(respuesta.contains("telemedicina") || respuesta.contains("EsSalud"));
}
```

### 5. E2E Tests (Selenium/Cypress)

```javascript
// Cypress test
describe('Chatbot Disponibilidad', () => {
  it('debe iniciar conversación y buscar disponibilidad', () => {
    cy.login('admin@cenate.gob.pe', 'password');
    cy.visit('/disponibilidad');

    cy.get('[data-testid="chat-input"]').type('Necesito cardiólogo');
    cy.get('[data-testid="chat-send"]').click();

    cy.get('[data-testid="chat-response"]', { timeout: 10000 })
      .should('contain', 'disponibilidad');
  });
});
```

---

## Conclusión

Esta arquitectura proporciona:

- ✅ **Separación clara de responsabilidades** (Clean Architecture)
- ✅ **Testabilidad completa** (cada capa testeable en aislamiento)
- ✅ **Flexibilidad** (fácil cambiar proveedores LLM)
- ✅ **Mantenibilidad** (cambios localizados)
- ✅ **Escalabilidad** (fácil agregar nuevos casos de uso)
- ✅ **Seguridad** (auditoría, validación, encriptación)
- ✅ **Performance** (caché, rate limiting, compresión)

**Próximos pasos:** Ver `plan/06_Integracion_Spring_AI/01_plan_implementacion_spring_ai.md`

---

**Autor:** Ing. Styp Canto Rondón
**EsSalud Perú - CENATE**
**Versión:** 1.35.0 | 2026-01-26
