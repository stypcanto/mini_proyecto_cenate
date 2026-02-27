# Chatbot de Trazabilidad CENATE — v1.70.0

> **Estado:** ✅ Implementado y funcional (pendiente créditos Anthropic)
> **Fecha:** 2026-02-26
> **Stack:** Spring AI 1.0.0 GA + Anthropic Claude + React 19

---

## ¿Qué es?

Widget flotante de IA para **personal interno CENATE** que permite consultar en lenguaje natural:
- Estado de pacientes y sus solicitudes de cita
- Información de usuarios y profesionales
- Inconsistencias o problemas en los datos
- Historial de bolsas y citas por DNI

Solo visible para roles internos (no EXTERNO / INSTITUCION).

---

## Arquitectura

```
Frontend (React)                        Backend (Spring Boot)
┌──────────────────────┐               ┌──────────────────────────────────┐
│ ChatbotTrazabilidad  │──POST /chat──▶│ ChatbotTrazabilidadController    │
│ .jsx (fixed z-9000)  │◀──respuesta───│ /api/v1/chatbot/trazabilidad     │
│ Solo si !isExterno   │               │         │                        │
└──────────────────────┘               │  ChatbotTrazabilidadService      │
                                       │  (Spring AI ChatClient)          │
                                       │         │                        │
                                       │  TrazabilidadTools (@Tool)       │
                                       │  ├─ buscarHistorialPaciente(dni) │
                                       │  ├─ verificarPuedeCrearCita()   │
                                       │  ├─ detectarInconsistencias(dni) │
                                       │  ├─ buscarProfesional(criterio)  │
                                       │  └─ buscarUsuarioCENATE(crit.)   │
                                       │         │                        │
                                       │    PostgreSQL (tiempo real)      │
                                       └──────────────────────────────────┘
```

---

## Archivos creados / modificados

### Backend

| Acción | Archivo |
|--------|---------|
| Crear | `src/.../api/chatbot/ChatbotTrazabilidadController.java` |
| Crear | `src/.../api/chatbot/TrazabilidadTools.java` |
| Crear | `src/.../service/chatbot/ChatbotTrazabilidadService.java` |
| Crear | `src/.../dto/chatbot/ChatbotTrazabilidadRequest.java` |
| Crear | `src/.../dto/chatbot/ChatbotTrazabilidadResponse.java` |
| Modificar | `build.gradle` — Spring AI BOM + dependency |
| Modificar | `src/main/resources/application.properties` — config Anthropic |
| Modificar | `src/.../config/SecurityConfig.java` — regla JWT chatbot |

### Frontend

| Acción | Archivo |
|--------|---------|
| Crear | `frontend/src/components/chatbot/ChatbotTrazabilidad.jsx` |
| Crear | `frontend/src/services/chatbotTrazabilidadService.js` |
| Modificar | `frontend/src/App.js` — inyectar widget |

---

## Configuración (application.properties)

```properties
# === CHATBOT TRAZABILIDAD v1.70.0 ===
spring.ai.anthropic.api-key=${ANTHROPIC_API_KEY:}
spring.ai.anthropic.chat.options.model=claude-sonnet-4-6
spring.ai.anthropic.chat.options.max-tokens=1024
spring.ai.anthropic.chat.options.temperature=0.3
cenate.chatbot.enabled=true
```

La API key se carga desde el archivo `.env` (gitignored). Para arrancar el backend en desarrollo:

```bash
# Desde /backend
set -a && source .env && set +a && ./gradlew bootRun
```

---

## Dependencias (build.gradle)

```gradle
dependencyManagement {
    imports {
        mavenBom "org.springframework.ai:spring-ai-bom:1.0.0"
    }
}

repositories {
    mavenCentral()
    maven { url 'https://repo.spring.io/milestone' }
    maven { url 'https://repo.spring.io/snapshot' }
}

dependencies {
    // Nombre correcto en Spring AI 1.0.0 GA (≠ M6 que usaba spring-ai-anthropic-spring-boot-starter)
    implementation 'org.springframework.ai:spring-ai-starter-model-anthropic:1.0.0'
}
```

> **Nota importante:** El artifact `spring-ai-anthropic-spring-boot-starter` corresponde a versiones milestone (hasta M6). En Spring AI 1.0.0 GA el nombre correcto es `spring-ai-starter-model-anthropic`.

---

## Endpoint

```
POST /api/v1/chatbot/trazabilidad/chat
Authorization: Bearer <JWT>
Content-Type: application/json

Body:
{
  "mensaje": "¿Por qué el DNI 08643806 no puede ser citado?"
}

Response 200:
{
  "respuesta": "🔍 He encontrado 3 registros activos para ese DNI...",
  "timestamp": "2026-02-26T19:00:00"
}

Response 500 (error LLM):
{
  "error": "No se pudo procesar la consulta. Intenta de nuevo.",
  "detalle": "...",
  "timestamp": "..."
}
```

---

## TrazabilidadTools — @Tool methods

```java
@Component
public class TrazabilidadTools {

    // Repos inyectados:
    // DimBolsaRepository, PersonalCntRepository,
    // UsuarioRepository, RolRepository

    @Tool("Busca historial de citas de un paciente por DNI en dim_solicitud_bolsa")
    public String buscarHistorialPaciente(String dni) { ... }

    @Tool("Verifica si un paciente puede crear una nueva cita (detecta bloqueos)")
    public String verificarPuedeCrearCita(String dni, String especialidad) { ... }

    @Tool("Detecta inconsistencias en los datos del paciente")
    public String detectarInconsistencias(String dni) { ... }

    @Tool("Busca profesional de salud por DNI o nombre")
    public String buscarProfesional(String criterio) { ... }

    @Tool("Busca usuario CENATE por DNI, nombre o rol")
    public String buscarUsuarioCENATE(String criterio) { ... }
}
```

### Campos del modelo usados (verificados)

| Entidad | Campos correctos |
|---------|-----------------|
| `DimBolsa` | `pacienteDni`, `especialidadNombre`, `responsableNombre`, `estado`, `activo`, `codigoIpress`, `tipoCita` |
| `PersonalCnt` | `nomPers`, `apePaterPers`, `apeMaterPers`, `numDocPers`, `statPers`, `area.descArea` |
| `Rol` | `descRol` |

---

## Frontend — ChatbotTrazabilidad.jsx

- Posición: `fixed bottom-4 right-4 z-[9000]`
- Tamaño panel: `360px × 500px`
- Solo renderiza si `isAuthenticated && !isRoleExterno(roles)`
- Mensajes estilo WhatsApp (usuario = derecha azul, bot = izquierda blanco)
- Spinner animado mientras el LLM procesa
- `Enter` para enviar, `Shift+Enter` nueva línea
- Sugerencias rápidas al inicio (4 botones)
- Historial en `useState` (no persiste entre sesiones)
- Color header: `bg-[#0A5BA9]`

---

## Seguridad (SecurityConfig.java)

```java
// 🔒 v1.70.0 — regla ANTES del bloque general de chatbot
.requestMatchers("/api/v1/chatbot/trazabilidad/**").authenticated()
.requestMatchers("/api/v1/chatbot/**").permitAll()
```

> La regla `authenticated()` debe ir ANTES de `permitAll()` para el mismo prefijo.

---

## Estado actual y pendientes

| Item | Estado |
|------|--------|
| Backend compilado y arrancando | ✅ |
| Endpoint registrado en Spring MVC | ✅ |
| JWT auth funcionando | ✅ |
| Conexión a Anthropic API (autenticación) | ✅ |
| Créditos en cuenta Anthropic | ❌ Insuficientes — recargar en console.anthropic.com |
| Frontend widget visible | ✅ |
| Pruebas en producción | ⏳ Pendiente (requiere créditos) |

### Para activar en producción

1. Recargar créditos en [console.anthropic.com/settings/billing](https://console.anthropic.com/settings/billing)
2. Asegurarse que `ANTHROPIC_API_KEY` esté seteada en el servidor de producción
3. El Dockerfile ya copia el `.env` via variables de entorno — verificar que esté en docker-compose

---

## Variables de entorno requeridas

```env
ANTHROPIC_API_KEY=sk-ant-api03-...
```

Se agrega al archivo `.env` del backend (gitignored por regla `*.env` en `.gitignore` línea 31).

> **Seguridad:** Si la API key fue expuesta en texto plano en algún canal, rotarla inmediatamente en Anthropic Console.
