# Configuración Spring AI para CENATE

**Versión:** 1.35.0
**Fecha:** 2026-01-26
**Autor:** Ing. Styp Canto Rondón
**Módulo:** Spring AI Integration

---

## Variables de Entorno Requeridas

Agregar al archivo `.env` o configurar en el servidor:

```bash
# ============================================
# SPRING AI - ANTHROPIC CLAUDE
# ============================================
ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Proveedor LLM activo (anthropic, openai, ollama)
CENATE_AI_PROVIDER=anthropic

# Modelo de Claude (opciones: claude-3-5-sonnet-20241022, claude-3-opus-20240229)
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022

# Tokens máximos por respuesta (rango: 1-8192)
ANTHROPIC_MAX_TOKENS=4096

# Temperatura por defecto (0.0 = determinista, 1.0 = creativo)
ANTHROPIC_TEMPERATURE=0.7

# ============================================
# SPRING AI - OPENAI (OPCIONAL - FALLBACK)
# ============================================
# OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
# OPENAI_MODEL=gpt-4-turbo-preview
# OPENAI_MAX_TOKENS=4096

# ============================================
# SPRING AI - OLLAMA (DESARROLLO LOCAL)
# ============================================
# OLLAMA_BASE_URL=http://localhost:11434
# OLLAMA_MODEL=llama3.2:3b
```

---

## Configuración en application.properties

```properties
# ============================================
# SPRING AI CONFIGURATION
# ============================================

# Proveedor activo (inyectado desde .env)
cenate.ai.provider=${CENATE_AI_PROVIDER:anthropic}

# --------------------------------------------
# ANTHROPIC CLAUDE
# --------------------------------------------
spring.ai.anthropic.api-key=${ANTHROPIC_API_KEY}
spring.ai.anthropic.chat.options.model=${ANTHROPIC_MODEL:claude-3-5-sonnet-20241022}
spring.ai.anthropic.chat.options.max-tokens=${ANTHROPIC_MAX_TOKENS:4096}
spring.ai.anthropic.chat.options.temperature=${ANTHROPIC_TEMPERATURE:0.7}

# Timeout de conexión (milisegundos)
spring.ai.anthropic.timeout=60000

# --------------------------------------------
# OPENAI (Fallback opcional)
# --------------------------------------------
# spring.ai.openai.api-key=${OPENAI_API_KEY}
# spring.ai.openai.chat.options.model=${OPENAI_MODEL:gpt-4-turbo-preview}
# spring.ai.openai.chat.options.max-tokens=${OPENAI_MAX_TOKENS:4096}

# --------------------------------------------
# OLLAMA (Desarrollo local)
# --------------------------------------------
# spring.ai.ollama.base-url=${OLLAMA_BASE_URL:http://localhost:11434}
# spring.ai.ollama.chat.options.model=${OLLAMA_MODEL:llama3.2:3b}

# --------------------------------------------
# MEMORIA DE CONVERSACIÓN (Redis/InMemory)
# --------------------------------------------
# Estrategia: redis | inmemory
cenate.ai.memory.strategy=inmemory

# TTL de sesiones (segundos) - 30 minutos
cenate.ai.memory.session-ttl=1800

# Máximo de mensajes en contexto (para reducir costos)
cenate.ai.memory.max-context-messages=10

# --------------------------------------------
# PROMPTS
# --------------------------------------------
# Estrategia: filesystem | database
cenate.ai.prompts.strategy=filesystem

# Directorio de templates (si strategy=filesystem)
cenate.ai.prompts.templates-path=classpath:/prompts/

# --------------------------------------------
# FUNCTION CALLING
# --------------------------------------------
# Habilitar Function Calling
cenate.ai.function-calling.enabled=true

# Timeout de ejecución de funciones (milisegundos)
cenate.ai.function-calling.timeout=5000

# --------------------------------------------
# AUDITORÍA DE IA
# --------------------------------------------
# Auditar todas las interacciones con IA
cenate.ai.audit.enabled=true

# Registrar prompts y respuestas completas (para debugging)
cenate.ai.audit.log-full-messages=false
```

---

## Dependencies en build.gradle

```gradle
dependencies {
    // Spring AI BOM (Bill of Materials)
    implementation platform('org.springframework.ai:spring-ai-bom:1.0.0-M5')

    // Spring AI Anthropic Claude
    implementation 'org.springframework.ai:spring-ai-anthropic'

    // Spring AI OpenAI (opcional, fallback)
    // implementation 'org.springframework.ai:spring-ai-openai'

    // Spring AI Ollama (desarrollo local)
    // implementation 'org.springframework.ai:spring-ai-ollama'

    // Spring AI Observability (métricas y tracing)
    implementation 'org.springframework.ai:spring-ai-spring-boot-actuator'

    // Redis para memoria de conversación (opcional)
    // implementation 'org.springframework.boot:spring-boot-starter-data-redis'

    // Caffeine Cache (alternativa a Redis para desarrollo)
    implementation 'com.github.ben-manes.caffeine:caffeine:3.1.8'
}
```

---

## Verificación de Configuración

### 1. Health Check Endpoint

Agregar actuator para verificar estado del servicio LLM:

```bash
# Verificar salud del servicio
curl http://localhost:8080/actuator/health/ai

# Respuesta esperada:
{
  "status": "UP",
  "components": {
    "ai": {
      "status": "UP",
      "details": {
        "provider": "anthropic",
        "model": "claude-3-5-sonnet-20241022",
        "available": true
      }
    }
  }
}
```

### 2. Test de Conexión

Endpoint de prueba (solo desarrollo):

```java
@RestController
@RequestMapping("/api/ai/test")
public class AITestController {

    @Autowired
    private LLMServicePort llmService;

    @GetMapping("/ping")
    public Map<String, Object> testConnection() {
        boolean available = llmService.isAvailable();
        return Map.of(
            "provider", llmService.getModelName(),
            "available", available,
            "timestamp", LocalDateTime.now()
        );
    }
}
```

---

## Costos y Límites

### Anthropic Claude Pricing (2026)

| Modelo | Input (por 1M tokens) | Output (por 1M tokens) | Contexto máx. |
|--------|----------------------|------------------------|---------------|
| Claude 3.5 Sonnet | $3.00 | $15.00 | 200K tokens |
| Claude 3 Opus | $15.00 | $75.00 | 200K tokens |
| Claude 3 Haiku | $0.25 | $1.25 | 200K tokens |

### Estimación de Uso CENATE

**Supuestos:**
- 100 conversaciones/día
- Promedio 5 mensajes por conversación
- 500 tokens promedio por mensaje

**Cálculo mensual (Claude 3.5 Sonnet):**
```
Input: 100 conv × 5 msg × 500 tokens × 30 días = 7,500,000 tokens
Output: 100 conv × 5 resp × 300 tokens × 30 días = 4,500,000 tokens

Costo Input: 7.5M × $3.00 / 1M = $22.50
Costo Output: 4.5M × $15.00 / 1M = $67.50

TOTAL MENSUAL: ~$90 USD
```

### Estrategias de Reducción de Costos

1. **Limitar contexto:** Solo enviar últimos 10 mensajes (ya implementado)
2. **Usar Haiku para tareas simples:** Confirmar citas, búsquedas directas
3. **Caché de respuestas comunes:** Preguntas frecuentes pre-respondidas
4. **Ollama para desarrollo:** No consumir API key en testing

---

## Seguridad

### 1. Protección de API Key

```bash
# NUNCA commitear .env
echo ".env" >> .gitignore

# Rotar API key cada 90 días
# Almacenar en secretos del servidor (Docker Secrets, Kubernetes Secrets)
```

### 2. Rate Limiting

```java
@Configuration
public class AIRateLimitConfig {

    @Bean
    public RateLimiter aiRateLimiter() {
        return RateLimiter.create(10.0); // 10 requests/segundo
    }
}
```

### 3. Validación de Inputs

- Sanitizar DNI antes de enviar al LLM
- Limitar longitud de mensajes (max 2000 caracteres)
- Filtrar contenido malicioso o inyecciones de prompt

---

## Monitoreo

### Métricas Spring Boot Actuator

```properties
management.endpoints.web.exposure.include=health,info,metrics,prometheus
management.metrics.tags.application=cenate-ai
```

### Métricas Clave

- `ai.chat.requests.total`: Total de requests al LLM
- `ai.chat.requests.duration`: Latencia de respuestas
- `ai.chat.tokens.consumed`: Tokens consumidos (input + output)
- `ai.chat.errors.total`: Errores del servicio LLM
- `ai.function.calls.total`: Invocaciones de Function Calling

---

## Troubleshooting

### Error: "API key inválida"

```
Causa: ANTHROPIC_API_KEY no configurada o incorrecta
Solución: Verificar .env y reiniciar aplicación
```

### Error: "Rate limit exceeded"

```
Causa: Demasiadas requests a la API de Anthropic
Solución: Implementar rate limiting en el lado de CENATE
```

### Error: "Context length exceeded"

```
Causa: Historial de conversación muy largo
Solución: Reducir MAX_MENSAJES_CONTEXTO en properties
```

### Respuestas lentas

```
Causa: Modelo Claude 3 Opus es más lento que Sonnet
Solución: Cambiar a claude-3-5-sonnet-20241022 o Haiku
```

---

**Autor:** Ing. Styp Canto Rondón
**EsSalud Perú - CENATE**
**Versión:** 1.35.0 | 2026-01-26
