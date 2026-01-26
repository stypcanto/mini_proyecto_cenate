# Índice Completo - Spring AI Integration CENATE

**Versión:** 1.35.0
**Fecha:** 2026-01-26
**Autor:** Ing. Styp Canto Rondón

---

## Documentación Creada

### 1. Especificaciones Técnicas

| Documento | Ubicación | Descripción |
|-----------|-----------|-------------|
| **Arquitectura Clean Architecture** | `spec/01_Backend/10_arquitectura_spring_ai_clean_architecture.md` | ⭐ **DOCUMENTO PRINCIPAL** - Arquitectura completa, patrones, flujos, testing |
| **Configuración Spring AI** | `spec/01_Backend/09_configuracion_spring_ai.md` | Variables de entorno, properties, dependencies, troubleshooting |

### 2. Planificación

| Documento | Ubicación | Descripción |
|-----------|-----------|-------------|
| **Plan de Implementación** | `plan/06_Integracion_Spring_AI/01_plan_implementacion_spring_ai.md` | Plan completo por fases (7 fases, 12 semanas), cronograma, recursos, presupuesto |

### 3. Código Fuente

#### Domain Layer (Núcleo - Sin dependencias)

```
backend/src/main/java/com/styp/cenate/ai/domain/
├── model/
│   ├── MensajeLLM.java                        ✅ Mensaje de conversación
│   ├── ConversacionContext.java               ✅ Contexto completo de conversación
│   ├── DisponibilidadSugerida.java            ✅ Resultado búsqueda citas
│   ├── SugerenciaDiagnostico.java             ✅ Pre-diagnóstico IA
│   └── ResultadoAnalisisECG.java              ✅ Análisis imagen ECG
│
├── port/
│   ├── in/                                    # Use Cases (Contratos)
│   │   └── DisponibilidadCitasUseCase.java    ✅ Caso de uso: Chatbot disponibilidad
│   │
│   └── out/                                   # Dependencies (Abstracciones)
│       ├── LLMServicePort.java                ✅ Puerto para LLM (Anthropic/OpenAI/Ollama)
│       ├── PromptTemplatePort.java            ✅ Puerto para gestión de prompts
│       ├── ConversacionMemoryPort.java        ✅ Puerto para memoria de conversaciones
│       └── FunctionCallingPort.java           ✅ Puerto para invocación de funciones
│
└── exception/
    ├── LLMServiceException.java               ✅ Error comunicación con LLM
    ├── PromptValidationException.java         ✅ Error validación de prompts
    ├── ContextoInvalidoException.java         ✅ Error contexto de conversación
    └── FunctionCallException.java             ✅ Error ejecución de funciones
```

#### Application Layer (Casos de Uso)

```
backend/src/main/java/com/styp/cenate/ai/application/
├── service/
│   └── DisponibilidadCitasUseCaseService.java ✅ Implementación caso de uso chatbot
│       - iniciarConversacion()
│       - continuarConversacion()
│       - confirmarCita()
│       - obtenerHistorial()
│       - finalizarConversacion()
│
└── dto/
    ├── ChatRequestDTO.java                    ✅ DTO entrada de endpoints
    └── ChatResponseDTO.java                   ✅ DTO salida de endpoints
```

#### Infrastructure Layer (Adaptadores)

```
backend/src/main/java/com/styp/cenate/ai/infrastructure/
├── adapter/
│   ├── in/web/
│   │   └── ChatbotDisponibilidadController.java ✅ Controller REST
│   │       - POST /api/ai/chatbot-disponibilidad/iniciar
│   │       - POST /api/ai/chatbot-disponibilidad/{sessionId}/continuar
│   │       - POST /api/ai/chatbot-disponibilidad/{sessionId}/confirmar-cita
│   │       - GET  /api/ai/chatbot-disponibilidad/{sessionId}/historial
│   │       - DELETE /api/ai/chatbot-disponibilidad/{sessionId}
│   │
│   └── out/
│       └── llm/
│           └── AnthropicClaudeAdapter.java    ✅ Implementación para Claude
│               - chat()
│               - chatWithFunctions()
│               - analyzeImage()
│               - isAvailable()
│
└── config/
    ├── SpringAIConfig.java                    ✅ Configuración beans Spring AI
    └── PromptConfig.java                      ✅ Configuración prompts
```

#### Prompts (Templates)

```
backend/src/main/resources/prompts/
└── chatbot-disponibilidad-system-v1.txt       ✅ Prompt sistema chatbot
    - Instrucciones detalladas para Claude
    - Tono de comunicación
    - Funciones disponibles
    - Ejemplos de interacción
```

---

## Flujo de Implementación Recomendado

### Leer en este orden:

1. **⭐ INICIO RÁPIDO:**
   - `spec/01_Backend/10_arquitectura_spring_ai_clean_architecture.md` (Sección: Visión General)
   - `plan/06_Integracion_Spring_AI/01_plan_implementacion_spring_ai.md` (Sección: Fases)

2. **ARQUITECTURA:**
   - `spec/01_Backend/10_arquitectura_spring_ai_clean_architecture.md` (Completo)
   - Entender las 3 capas: Domain → Application → Infrastructure
   - Revisar patrones de diseño implementados

3. **CONFIGURACIÓN:**
   - `spec/01_Backend/09_configuracion_spring_ai.md`
   - Configurar variables de entorno
   - Agregar dependencies en build.gradle
   - Configurar application.properties

4. **CÓDIGO:**
   - Domain Layer: Revisar interfaces (ports) y models
   - Application Layer: Revisar `DisponibilidadCitasUseCaseService`
   - Infrastructure Layer: Revisar `AnthropicClaudeAdapter` y `ChatbotDisponibilidadController`

5. **TESTING:**
   - Leer sección "Testing Strategy" en arquitectura
   - Implementar unit tests primero
   - Luego integration tests
   - Finalmente E2E tests

6. **DESPLIEGUE:**
   - Seguir FASE 7 del plan de implementación
   - Configurar Redis para producción
   - Configurar monitoreo
   - Capacitar usuarios

---

## Casos de Uso por Implementar

### FASE 1: Infraestructura (✅ COMPLETADO)
- [x] Estructura de carpetas Clean Architecture
- [x] Port interfaces
- [x] Domain models
- [x] Exceptions
- [x] Configuración básica

### FASE 2: Chatbot Disponibilidad (✅ COMPLETADO)
- [x] DisponibilidadCitasUseCase
- [x] DisponibilidadCitasUseCaseService
- [x] AnthropicClaudeAdapter
- [x] ChatbotDisponibilidadController
- [x] DTOs
- [x] Prompt template

### FASE 3: Optimización (Pendiente)
- [ ] RedisConversacionMemoryAdapter
- [ ] Caché de prompts
- [ ] Rate limiting
- [ ] Métricas Actuator

### FASE 4: Asistente Diagnóstico (Pendiente)
- [ ] DiagnosticoAsistenteUseCase
- [ ] Controller y DTOs
- [ ] Prompt template
- [ ] Integración con formulario

### FASE 5: Análisis Tele-ECG (Pendiente)
- [ ] AnalisisTeleECGUseCase
- [ ] Integración con módulo Tele-ECG v1.24.0
- [ ] Validación médica

### FASE 6: Generador Reportes (Pendiente)
- [ ] GeneracionReporteMedicoUseCase
- [ ] Templates de reportes
- [ ] Exportación PDF

### FASE 7: Producción (Pendiente)
- [ ] Despliegue en servidor
- [ ] Monitoreo completo
- [ ] Documentación final

---

## Métricas de Éxito

### Technical Metrics
- ✅ **Cobertura de tests:** > 80%
- ✅ **Latencia p95:** < 5 segundos
- ✅ **Uptime:** > 99.5%
- ✅ **Costo mensual:** < $400 USD

### Business Metrics
- ✅ **Tasa de finalización de conversaciones:** > 80%
- ✅ **Satisfacción usuarios (NPS):** > 8/10
- ✅ **Reducción tiempo de agenda:** 30%
- ✅ **Precisión de sugerencias:** > 90%

---

## Contactos Clave

- **Arquitecto:** Ing. Styp Canto Rondón
- **Product Owner:** [Médico de CENATE - TBD]
- **QA Lead:** [TBD]
- **DevOps Lead:** [TBD]

---

## Recursos Adicionales

### Documentación Externa
- [Spring AI Documentation](https://docs.spring.io/spring-ai/reference/)
- [Anthropic Claude API](https://docs.anthropic.com/claude/reference)
- [Clean Architecture (Robert C. Martin)](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

### Repositorios de Referencia
- [Spring AI Samples](https://github.com/spring-projects/spring-ai-examples)
- [Anthropic Cookbook](https://github.com/anthropics/anthropic-cookbook)

---

## FAQ

### ¿Por qué Clean Architecture?
- Facilita testing (cada capa es testeable)
- Permite cambiar proveedores LLM sin modificar lógica de negocio
- Reduce acoplamiento entre capas
- Mejora mantenibilidad a largo plazo

### ¿Por qué Anthropic Claude sobre OpenAI?
- Claude 3.5 Sonnet tiene mejor comprensión de contexto médico
- Ventana de contexto de 200K tokens (vs 128K de GPT-4)
- Precio competitivo ($3/1M input tokens)
- Mejor en español que GPT-4 Turbo

### ¿Cuánto costará al mes?
- Estimado: $300-400 USD/mes
- Depende de:
  - Cantidad de conversaciones
  - Longitud de mensajes
  - Uso de Function Calling
  - Análisis de imágenes (Tele-ECG)

### ¿Cómo se garantiza la precisión?
- Prompt engineering riguroso
- Validación médica de resultados
- Benchmark continuo vs diagnósticos reales
- Disclaimer legal visible en UI

### ¿Qué pasa si Anthropic cae?
- Fallback automático a OpenAI (configurado)
- Modo degradado: funcionalidad manual sin IA
- Alertas automáticas al equipo DevOps

---

## Changelog

### v1.35.0 (2026-01-26)
- ✅ Arquitectura completa diseñada
- ✅ Domain layer implementado (models, ports, exceptions)
- ✅ Application layer implementado (DisponibilidadCitasUseCaseService)
- ✅ Infrastructure layer implementado (AnthropicClaudeAdapter, Controller)
- ✅ Configuración documentada
- ✅ Plan de implementación completo (7 fases, 12 semanas)
- ✅ Prompt template creado
- ✅ DTOs definidos

### Próxima versión (v1.36.0)
- [ ] Implementar RedisConversacionMemoryAdapter
- [ ] Implementar FileSystemPromptTemplateAdapter
- [ ] Implementar SpringAIFunctionCallingAdapter
- [ ] Tests unitarios completos
- [ ] Integration tests

---

**Autor:** Ing. Styp Canto Rondón
**EsSalud Perú - CENATE**
**Versión:** 1.35.0 | 2026-01-26
