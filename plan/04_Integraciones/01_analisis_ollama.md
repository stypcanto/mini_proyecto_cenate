# 016 - Análisis de Integración de Ollama en CENATE

> **Versión:** 1.0
> **Fecha:** 2025-12-30
> **Autor:** Ing. Styp Canto Rondon
> **Estado:** Análisis y Planificación

---

## Tabla de Contenidos

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [¿Qué es Ollama?](#qué-es-ollama)
3. [Beneficios para CENATE](#beneficios-para-cenate)
4. [Requisitos Técnicos](#requisitos-técnicos)
5. [Arquitectura Propuesta](#arquitectura-propuesta)
6. [Casos de Uso Médicos](#casos-de-uso-médicos)
7. [Consideraciones de Seguridad](#consideraciones-de-seguridad)
8. [Plan de Implementación](#plan-de-implementación)
9. [Análisis de Costos](#análisis-de-costos)
10. [Riesgos y Mitigaciones](#riesgos-y-mitigaciones)
11. [Decisión Recomendada](#decisión-recomendada)

---

## Resumen Ejecutivo

### Pregunta Inicial
**¿Instalar Ollama en el servidor de base de datos (10.0.89.13) contribuirá al proyecto CENATE?**

### Respuesta Corta
**SÍ, pero NO en el servidor actual de base de datos.**

### Recomendación Clave
- ✅ **Ollama PUEDE aportar valor significativo** al sistema de telemedicina
- ❌ **NO instalar en servidor de PostgreSQL** (riesgo de impacto en rendimiento)
- ✅ **Implementar en servidor dedicado** o entorno de desarrollo primero
- ⚠️ **Requiere aprobación institucional** de EsSalud

---

## ¿Qué es Ollama?

### Definición
Ollama es una herramienta open-source que permite ejecutar **Large Language Models (LLM)** localmente, similar a ChatGPT pero en tu propia infraestructura.

### Características Principales

| Característica | Descripción |
|----------------|-------------|
| **Open Source** | Gratuito y código abierto |
| **Privacidad** | Los datos NO salen del servidor |
| **Offline** | Funciona sin internet una vez instalado |
| **Multi-modelo** | Soporta Llama 3, Mistral, Gemma, etc. |
| **API REST** | Fácil integración con Spring Boot |

### Modelos Disponibles

```bash
# Modelos ligeros (4-8 GB RAM)
ollama pull llama3.2:3b
ollama pull phi3:mini

# Modelos medianos (16 GB RAM)
ollama pull llama3:8b
ollama pull mistral:7b

# Modelos pesados (32+ GB RAM)
ollama pull llama3:70b
ollama pull mixtral:8x7b
```

---

## Beneficios para CENATE

### 1. Asistente Virtual de Telemedicina

#### Chatbot de Información General
```
Paciente: "¿Qué documentos necesito para mi cita?"
Bot: "Para tu cita de telemedicina necesitas:
      1. DNI vigente
      2. Carnet de seguro EsSalud
      3. Orden médica (si es consulta especializada)
      ¿Necesitas ayuda con algo más?"
```

**Implementación:**
```java
@RestController
@RequestMapping("/api/chatbot")
public class ChatbotController {

    @Autowired
    private OllamaService ollamaService;

    @PostMapping("/consulta")
    public ResponseEntity<ChatbotResponse> consultarBot(
            @RequestBody ChatbotRequest request) {

        String respuesta = ollamaService.generarRespuesta(
            request.getMensaje(),
            "informacion-general"
        );

        return ResponseEntity.ok(new ChatbotResponse(respuesta));
    }
}
```

#### Triaje Automático Inicial
```
Sistema: Analiza síntomas iniciales del paciente
Ollama: Sugiere especialidad médica apropiada
Sistema: Dirige al paciente al médico correcto
```

**Ventaja:** Reduce carga administrativa y mejora flujo de pacientes.

---

### 2. Análisis de Datos Médicos

#### Resumen de Historias Clínicas
```java
public class HistoriaClinicaService {

    public String generarResumenEjecutivo(Long idPaciente) {
        List<ConsultaMedica> consultas =
            consultaRepository.findByPaciente(idPaciente);

        StringBuilder texto = new StringBuilder();
        for (ConsultaMedica c : consultas) {
            texto.append("Fecha: ").append(c.getFecha())
                 .append("\nDiagnóstico: ").append(c.getDiagnostico())
                 .append("\nTratamiento: ").append(c.getTratamiento())
                 .append("\n---\n");
        }

        return ollamaService.resumir(
            "Resume el historial médico del paciente:",
            texto.toString()
        );
    }
}
```

**Salida esperada:**
```
Paciente con historial de hipertensión arterial controlada desde 2020.
Tratamiento: Enalapril 10mg/día. Última consulta: mejora en presión arterial.
Recomendación: Continuar tratamiento y control en 3 meses.
```

#### Extracción de Información de Notas Médicas
```java
public Map<String, String> extraerDatos(String notaMedica) {
    String prompt = "Extrae de esta nota médica: " +
                    "1. Síntomas principales, " +
                    "2. Diagnóstico, " +
                    "3. Tratamiento prescrito\n\n" + notaMedica;

    String respuesta = ollamaService.extraer(prompt);
    return parsearRespuesta(respuesta);
}
```

---

### 3. Optimización de Disponibilidad Médica

#### Análisis de Patrones de Turnos
```java
public String analizarDisponibilidadMensual(String periodo) {
    List<DisponibilidadMedica> disponibilidades =
        disponibilidadRepository.findByPeriodo(periodo);

    String datos = convertirATextoAnalizable(disponibilidades);

    return ollamaService.analizar(
        "Identifica patrones y sugiere optimizaciones en la " +
        "distribución de turnos médicos para mejorar cobertura:",
        datos
    );
}
```

**Salida esperada:**
```
Análisis de disponibilidad enero 2025:
- 60% de médicos prefieren turno mañana
- Cardiología tiene baja cobertura en tardes
- Sugerencia: Incentivar turnos tarde en Cardiología
- Dentición brechas: Viernes tarde sin cobertura
```

#### Predicción de Demanda
```java
public String predecirDemandaEspecialidad(String especialidad) {
    List<CitaMedica> citas = citaRepository.findByEspecialidad(especialidad);
    String historial = generarEstadisticas(citas);

    return ollamaService.predecir(
        "Basado en estos datos históricos de citas, " +
        "predice la demanda para el próximo mes:",
        historial
    );
}
```

---

### 4. Generación de Reportes Automáticos

#### Reportes Gerenciales
```java
public String generarReporteEjecutivo(ReporteRequest request) {
    // Datos: citas, cancelaciones, satisfacción, tiempos espera
    DatosReporte datos = recopilarDatos(request);

    return ollamaService.generarReporte(
        "Genera un reporte ejecutivo de gestión con insights y recomendaciones:",
        datos.toJSON()
    );
}
```

#### Reportes de Calidad Asistencial
```java
public String analizarCalidadAtencion(String periodo) {
    List<EncuestaSatisfaccion> encuestas =
        encuestaRepository.findByPeriodo(periodo);

    String prompt = "Analiza estas encuestas de satisfacción y genera " +
                    "recomendaciones para mejorar la calidad de atención";

    return ollamaService.analizar(prompt, encuestas.toString());
}
```

---

## Requisitos Técnicos

### Hardware Mínimo

#### Para Modelos Ligeros (Desarrollo)
```
CPU: Intel i5/AMD Ryzen 5 o superior (con AVX2)
RAM: 8 GB mínimo
Almacenamiento: 10 GB libres
GPU: Opcional (acelera 3-5x)
```

#### Para Modelos Medianos (Producción Básica)
```
CPU: Intel i7/AMD Ryzen 7 o superior
RAM: 16 GB mínimo (32 GB recomendado)
Almacenamiento: 50 GB SSD
GPU: NVIDIA con 8+ GB VRAM (muy recomendado)
```

#### Para Modelos Avanzados (Producción Alta Demanda)
```
CPU: Xeon/EPYC multi-core
RAM: 64 GB mínimo
Almacenamiento: 200 GB NVMe SSD
GPU: NVIDIA A100/H100 o múltiples RTX 4090
```

### Software Requerido

```bash
# Sistema Operativo
- Ubuntu 22.04 LTS (recomendado)
- CentOS Stream 9
- macOS 12+ (desarrollo)
- Windows Server 2022 (no recomendado)

# Runtime
- Docker 24+ (para contenedores)
- NVIDIA Container Toolkit (si usa GPU)

# Dependencias
- CUDA 12+ (para GPU NVIDIA)
- cuDNN 8+ (para aceleración)
```

---

## Arquitectura Propuesta

### Opción 1: Servidor Dedicado (RECOMENDADO)

```
┌──────────────────────────────────────────────────────────┐
│                ARQUITECTURA RECOMENDADA                   │
└──────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  Servidor PostgreSQL (10.0.89.13)      │
│  - Base de datos maestro_cenate         │
│  - NO ejecuta Ollama                    │
└──────────────┬──────────────────────────┘
               │
               │ Query SQL
               ↓
┌─────────────────────────────────────────┐
│  Servidor Backend Spring Boot           │
│  - API REST principal                   │
│  - Lógica de negocio                    │
│  - Cliente HTTP para Ollama             │
└──────────────┬──────────────────────────┘
               │
               │ HTTP POST /api/generate
               ↓
┌─────────────────────────────────────────┐
│  NUEVO: Servidor Ollama (10.0.89.XX)   │ ← INSTALAR AQUÍ
│  - Ollama + Modelos LLM                 │
│  - API REST (puerto 11434)              │
│  - 32 GB RAM, GPU recomendada           │
└─────────────────────────────────────────┘
```

**Ventajas:**
- ✅ Aislamiento de recursos (no impacta BD)
- ✅ Escalabilidad independiente
- ✅ Fácil mantenimiento
- ✅ Mayor seguridad

**Desventajas:**
- ❌ Requiere servidor adicional
- ❌ Mayor costo inicial

---

### Opción 2: Contenedor Docker en Servidor Existente

```
┌─────────────────────────────────────────┐
│  Servidor Actual (10.0.89.13)          │
├─────────────────────────────────────────┤
│                                         │
│  ┌────────────────┐  ┌──────────────┐  │
│  │  PostgreSQL    │  │  Ollama      │  │
│  │  (Host)        │  │  (Docker)    │  │
│  │  Puerto: 5432  │  │  Puerto:11434│  │
│  └────────────────┘  └──────────────┘  │
│                                         │
│  Resource Limits:                       │
│  - Ollama: Max 8 GB RAM                 │
│  - Ollama: Max 50% CPU                  │
│                                         │
└─────────────────────────────────────────┘
```

**Configuración Docker:**
```yaml
# docker-compose-ollama.yml
version: '3.8'

services:
  ollama:
    image: ollama/ollama:latest
    container_name: cenate-ollama
    ports:
      - "11434:11434"
    volumes:
      - ollama-data:/root/.ollama
    deploy:
      resources:
        limits:
          memory: 8G
          cpus: '4'
        reservations:
          memory: 4G
          cpus: '2'
    restart: unless-stopped

volumes:
  ollama-data:
```

**Ventajas:**
- ✅ No requiere hardware nuevo
- ✅ Límites de recursos controlados
- ✅ Implementación rápida

**Desventajas:**
- ⚠️ Compite por recursos con PostgreSQL
- ⚠️ Riesgo de impacto en rendimiento de BD
- ❌ NO recomendado para producción crítica

---

### Opción 3: Entorno de Desarrollo Local (PROTOTIPO)

```
┌─────────────────────────────────────────┐
│  Mac de Desarrollo (localhost)          │
├─────────────────────────────────────────┤
│                                         │
│  ┌──────────────────────────────────┐  │
│  │  Backend Spring Boot (:8080)     │  │
│  │  - Conecta a BD remota           │  │
│  │  - Conecta a Ollama local        │  │
│  └─────────────┬────────────────────┘  │
│                │                        │
│                ↓                        │
│  ┌──────────────────────────────────┐  │
│  │  Ollama (localhost:11434)        │  │
│  │  - Modelo: llama3.2:3b           │  │
│  │  - Solo para pruebas             │  │
│  └──────────────────────────────────┘  │
│                                         │
└─────────────────────────────────────────┘
```

**Uso:**
```bash
# 1. Instalar Ollama en Mac
brew install ollama

# 2. Descargar modelo ligero
ollama pull llama3.2:3b

# 3. Iniciar servidor
ollama serve

# 4. Probar API
curl http://localhost:11434/api/generate -d '{
  "model": "llama3.2:3b",
  "prompt": "Resume este caso médico: Paciente con fiebre..."
}'
```

**Ventajas:**
- ✅ Cero riesgo para producción
- ✅ Prototipado rápido
- ✅ Sin aprobaciones institucionales

**Desventajas:**
- ❌ Solo para desarrollo
- ❌ No accesible para usuarios reales

---

## Casos de Uso Médicos

### Caso 1: Chatbot de Orientación Médica

#### Descripción
Asistente virtual que responde preguntas frecuentes de pacientes sobre:
- Requisitos para citas
- Horarios de atención
- Especialidades disponibles
- Procedimientos médicos comunes

#### Implementación Backend

```java
// OllamaService.java
@Service
public class OllamaService {

    private static final String OLLAMA_URL = "http://10.0.89.XX:11434/api/generate";
    private final RestTemplate restTemplate;

    public String generarRespuestaMedica(String preguntaPaciente) {
        String contexto = """
            Eres un asistente médico de CENATE - EsSalud Perú.
            Tu rol es orientar a pacientes con información general.
            NO des diagnósticos médicos.
            NO prescribas medicamentos.
            Si la pregunta es médica compleja, recomienda consultar con médico.
            """;

        OllamaRequest request = new OllamaRequest(
            "llama3:8b",
            contexto + "\n\nPaciente pregunta: " + preguntaPaciente,
            false
        );

        ResponseEntity<OllamaResponse> response =
            restTemplate.postForEntity(OLLAMA_URL, request, OllamaResponse.class);

        return response.getBody().getResponse();
    }
}
```

#### Frontend

```javascript
// ChatbotMedico.jsx
export default function ChatbotMedico() {
  const [mensajes, setMensajes] = useState([]);
  const [inputUsuario, setInputUsuario] = useState('');

  const enviarMensaje = async () => {
    // Agregar mensaje del usuario
    setMensajes([...mensajes, { tipo: 'usuario', texto: inputUsuario }]);

    // Llamar al backend
    const response = await fetch('/api/chatbot/consulta', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mensaje: inputUsuario })
    });

    const data = await response.json();

    // Agregar respuesta del bot
    setMensajes([...mensajes,
      { tipo: 'usuario', texto: inputUsuario },
      { tipo: 'bot', texto: data.respuesta }
    ]);

    setInputUsuario('');
  };

  return (
    <div className="chatbot-container">
      <div className="mensajes">
        {mensajes.map((msg, idx) => (
          <div key={idx} className={`mensaje ${msg.tipo}`}>
            {msg.texto}
          </div>
        ))}
      </div>
      <input
        value={inputUsuario}
        onChange={(e) => setInputUsuario(e.target.value)}
        placeholder="Escribe tu consulta..."
      />
      <button onClick={enviarMensaje}>Enviar</button>
    </div>
  );
}
```

---

### Caso 2: Análisis Inteligente de Disponibilidad Médica

#### Descripción
Sistema que analiza patrones de disponibilidad médica y sugiere optimizaciones para mejorar cobertura.

#### Implementación

```java
@Service
public class DisponibilidadInteligenciaService {

    @Autowired
    private DisponibilidadRepository disponibilidadRepository;

    @Autowired
    private OllamaService ollamaService;

    public ReporteOptimizacion analizarDisponibilidad(String periodo) {
        // 1. Obtener datos
        List<DisponibilidadMedica> disponibilidades =
            disponibilidadRepository.findByPeriodoWithDetails(periodo);

        // 2. Preparar datos para análisis
        String datosFormateados = formatearParaAnalisis(disponibilidades);

        // 3. Consultar a Ollama
        String prompt = """
            Analiza estos datos de disponibilidad médica en formato JSON.
            Identifica:
            1. Especialidades con baja cobertura
            2. Días/turnos con vacíos
            3. Médicos con sobrecarga
            4. Sugerencias de redistribución

            Datos:
            %s

            Responde en formato JSON con estructura:
            {
              "especialidades_criticas": [],
              "brechas_horarias": [],
              "medicos_sobrecargados": [],
              "recomendaciones": []
            }
            """.formatted(datosFormateados);

        String respuestaIA = ollamaService.analizar(prompt);

        // 4. Parsear y retornar
        return parsearReporte(respuestaIA);
    }

    private String formatearParaAnalisis(List<DisponibilidadMedica> disponibilidades) {
        return disponibilidades.stream()
            .map(d -> Map.of(
                "medico", d.getMedico().getNombreCompleto(),
                "especialidad", d.getEspecialidad().getNombre(),
                "periodo", d.getPeriodo(),
                "total_horas", d.getTotalHoras(),
                "turnos", d.getDetalles().stream()
                    .map(det -> Map.of(
                        "fecha", det.getFecha(),
                        "turno", det.getTurno(),
                        "horas", det.getHoras()
                    ))
                    .toList()
            ))
            .map(this::toJSON)
            .collect(Collectors.joining(",\n"));
    }
}
```

#### Salida Esperada

```json
{
  "especialidades_criticas": [
    {
      "nombre": "Cardiología",
      "cobertura_actual": "45%",
      "brecha": "55%",
      "medicos_asignados": 3,
      "medicos_necesarios": 5
    }
  ],
  "brechas_horarias": [
    {
      "dia": "Viernes",
      "turno": "Tarde",
      "especialidades_afectadas": ["Cardiología", "Neumología"]
    }
  ],
  "medicos_sobrecargados": [
    {
      "nombre": "Dr. García López",
      "horas_asignadas": 200,
      "horas_recomendadas": 150,
      "exceso": 50
    }
  ],
  "recomendaciones": [
    "Contratar 2 cardiólogos adicionales para turnos tarde",
    "Redistribuir carga del Dr. García a otros médicos",
    "Implementar incentivos para turnos viernes tarde"
  ]
}
```

---

### Caso 3: Resumen Automático de Historia Clínica

#### Descripción
Genera resúmenes ejecutivos de historias clínicas para médicos, facilitando la revisión rápida antes de consultas.

#### Implementación

```java
@Service
public class HistoriaClinicaIAService {

    public ResumenHistoriaClinica generarResumen(Long idPaciente) {
        // 1. Obtener datos del paciente
        Paciente paciente = pacienteRepository.findById(idPaciente)
            .orElseThrow(() -> new NotFoundException("Paciente no encontrado"));

        // 2. Recopilar consultas médicas
        List<ConsultaMedica> consultas =
            consultaRepository.findByPacienteOrderByFechaDesc(idPaciente);

        // 3. Recopilar exámenes
        List<Examen> examenes =
            examenRepository.findByPacienteOrderByFechaDesc(idPaciente);

        // 4. Formatear información
        String historiaCompleta = formatearHistoria(paciente, consultas, examenes);

        // 5. Generar resumen con IA
        String prompt = """
            Eres médico revisor. Genera un resumen ejecutivo de esta historia clínica.

            Incluye:
            1. Antecedentes relevantes
            2. Diagnósticos principales
            3. Tratamientos actuales
            4. Evolución del paciente
            5. Alertas importantes (alergias, contraindicaciones)

            Historia completa:
            %s

            Formato de respuesta: Párrafos concisos, máximo 300 palabras.
            """.formatted(historiaCompleta);

        String resumen = ollamaService.generar(prompt);

        // 6. Extraer información estructurada
        return new ResumenHistoriaClinica(
            idPaciente,
            resumen,
            extraerDiagnosticosPrincipales(resumen),
            extraerMedicamentosActuales(resumen),
            extraerAlertas(resumen),
            LocalDateTime.now()
        );
    }

    private String formatearHistoria(Paciente p,
                                      List<ConsultaMedica> consultas,
                                      List<Examen> examenes) {
        StringBuilder sb = new StringBuilder();

        sb.append("=== DATOS DEL PACIENTE ===\n");
        sb.append("Nombre: ").append(p.getNombreCompleto()).append("\n");
        sb.append("Edad: ").append(p.getEdad()).append(" años\n");
        sb.append("Género: ").append(p.getGenero()).append("\n\n");

        sb.append("=== CONSULTAS MÉDICAS ===\n");
        for (ConsultaMedica c : consultas.stream().limit(10).toList()) {
            sb.append("Fecha: ").append(c.getFecha()).append("\n");
            sb.append("Especialidad: ").append(c.getEspecialidad()).append("\n");
            sb.append("Diagnóstico: ").append(c.getDiagnostico()).append("\n");
            sb.append("Tratamiento: ").append(c.getTratamiento()).append("\n");
            sb.append("Notas: ").append(c.getNotas()).append("\n\n");
        }

        sb.append("=== EXÁMENES ===\n");
        for (Examen e : examenes.stream().limit(5).toList()) {
            sb.append("Fecha: ").append(e.getFecha()).append("\n");
            sb.append("Tipo: ").append(e.getTipo()).append("\n");
            sb.append("Resultado: ").append(e.getResultado()).append("\n\n");
        }

        return sb.toString();
    }
}
```

#### Ejemplo de Salida

```
=== RESUMEN EJECUTIVO ===

Paciente: María González Pérez, 58 años, femenino

ANTECEDENTES:
Hipertensión arterial diagnosticada en 2020, actualmente controlada.
Diabetes Mellitus tipo 2 desde 2018, en tratamiento con Metformina.

DIAGNÓSTICOS PRINCIPALES:
1. Hipertensión arterial esencial (CIE-10: I10)
2. Diabetes Mellitus tipo 2 (CIE-10: E11)
3. Dislipidemia (CIE-10: E78.5)

TRATAMIENTO ACTUAL:
- Enalapril 10mg/día (antihipertensivo)
- Metformina 850mg 2 veces/día (antidiabético)
- Atorvastatina 20mg/noche (dislipidemia)

EVOLUCIÓN:
Paciente con adecuado control metabólico. Última HbA1c: 6.8% (objetivo <7%).
Presión arterial promedio: 130/80 mmHg. Cumple tratamiento farmacológico.

ALERTAS:
⚠️ Alergia a Penicilina (registrada 2019)
⚠️ Antecedente familiar de enfermedad cardiovascular
ℹ️ Próximo control: Enero 2025
```

---

## Consideraciones de Seguridad

### 1. Privacidad de Datos Médicos

#### Ley N° 29733 - Ley de Protección de Datos Personales (Perú)
**Datos Sensibles:** Información de salud es categoría especial.

**Requisitos:**
- ✅ Consentimiento explícito del paciente
- ✅ Medidas de seguridad técnicas y organizativas
- ✅ Registro ante Autoridad Nacional de Protección de Datos

#### Ollama y Privacidad

| Aspecto | Evaluación | Notas |
|---------|------------|-------|
| **Datos locales** | ✅ Excelente | Datos NO salen del servidor |
| **Sin telemetría** | ✅ Excelente | No envía información a terceros |
| **Logs locales** | ⚠️ Cuidado | Configurar rotación de logs |
| **Acceso a modelos** | ✅ OK | Modelos descargados una vez |

**Recomendación:** Ollama es IDEAL para datos médicos sensibles vs. APIs cloud (OpenAI, Azure).

---

### 2. Anonimización de Datos

#### Antes de Enviar a Ollama
```java
public class AnonimizadorService {

    public String anonimizarTextoMedico(String textoOriginal) {
        String anonimizado = textoOriginal;

        // Reemplazar nombres
        anonimizado = anonimizado.replaceAll(
            "\\b[A-Z][a-z]+ [A-Z][a-z]+\\b",
            "[PACIENTE]"
        );

        // Reemplazar DNI
        anonimizado = anonimizado.replaceAll(
            "\\b\\d{8}\\b",
            "[DNI]"
        );

        // Reemplazar fechas de nacimiento
        anonimizado = anonimizado.replaceAll(
            "\\b\\d{2}/\\d{2}/\\d{4}\\b",
            "[FECHA]"
        );

        // Reemplazar direcciones
        anonimizado = anonimizado.replaceAll(
            "(?i)\\b(jr|av|calle|psje)\\.?\\s+[a-z\\s]+\\d+",
            "[DIRECCIÓN]"
        );

        return anonimizado;
    }
}
```

#### Ejemplo
```
Original:
"María González, DNI 45678912, nacida el 15/03/1965,
 reside en Av. Brasil 123, presenta hipertensión."

Anonimizado:
"[PACIENTE], DNI [DNI], nacida el [FECHA],
 reside en [DIRECCIÓN], presenta hipertensión."
```

---

### 3. Control de Acceso

#### Auditoría de Uso de IA
```java
@Aspect
@Component
public class OllamaAuditAspect {

    @Autowired
    private AuditLogService auditLogService;

    @Around("execution(* com.styp.cenate.service.OllamaService.*(..))")
    public Object auditarUsoIA(ProceedingJoinPoint joinPoint) throws Throwable {
        String usuario = SecurityContextHolder.getContext()
            .getAuthentication().getName();
        String metodo = joinPoint.getSignature().getName();
        Object[] args = joinPoint.getArgs();

        // Log de inicio
        auditLogService.registrarEvento(
            usuario,
            "AI_REQUEST",
            "OLLAMA",
            String.format("Método: %s, Args: %s", metodo, Arrays.toString(args)),
            "INFO",
            "INITIATED"
        );

        long inicio = System.currentTimeMillis();
        Object resultado = null;

        try {
            resultado = joinPoint.proceed();

            // Log de éxito
            auditLogService.registrarEvento(
                usuario,
                "AI_RESPONSE",
                "OLLAMA",
                String.format("Método: %s, Tiempo: %dms",
                    metodo, System.currentTimeMillis() - inicio),
                "INFO",
                "SUCCESS"
            );

            return resultado;
        } catch (Exception e) {
            // Log de error
            auditLogService.registrarEvento(
                usuario,
                "AI_ERROR",
                "OLLAMA",
                String.format("Método: %s, Error: %s", metodo, e.getMessage()),
                "ERROR",
                "FAILURE"
            );
            throw e;
        }
    }
}
```

---

### 4. Validación de Respuestas de IA

#### Filtro de Contenido Inapropiado
```java
@Service
public class ValidadorRespuestasIA {

    private static final List<String> PALABRAS_PROHIBIDAS = List.of(
        "diagnóstico definitivo",
        "prescribir",
        "receta médica",
        "dosis exacta"
    );

    public RespuestaValidada validarRespuesta(String respuestaIA) {
        // 1. Verificar longitud
        if (respuestaIA.length() > 2000) {
            return new RespuestaValidada(
                false,
                "Respuesta demasiado extensa"
            );
        }

        // 2. Detectar contenido prohibido
        for (String palabra : PALABRAS_PROHIBIDAS) {
            if (respuestaIA.toLowerCase().contains(palabra.toLowerCase())) {
                return new RespuestaValidada(
                    false,
                    "Respuesta contiene información médica inapropiada"
                );
            }
        }

        // 3. Verificar formato
        if (!respuestaIA.matches(".*[a-zA-Z]+.*")) {
            return new RespuestaValidada(
                false,
                "Respuesta no contiene texto válido"
            );
        }

        return new RespuestaValidada(true, respuestaIA);
    }
}
```

---

## Plan de Implementación

### Fase 1: Prototipo Local (2-3 semanas)

#### Objetivos
- ✅ Validar factibilidad técnica
- ✅ Probar casos de uso reales
- ✅ Evaluar calidad de respuestas

#### Tareas

| Tarea | Responsable | Duración | Entregable |
|-------|-------------|----------|------------|
| Instalar Ollama en Mac | Dev | 1 día | Ollama funcionando |
| Descargar modelo llama3.2:3b | Dev | 2 horas | Modelo disponible |
| Crear servicio OllamaService.java | Dev | 3 días | Clase funcional |
| Implementar chatbot básico | Dev | 5 días | Frontend + Backend |
| Pruebas internas | Equipo | 3 días | Reporte de pruebas |
| Demo a stakeholders | Lead | 1 día | Presentación |

#### Código Mínimo Viable (MVP)

**Backend:**
```bash
backend/src/main/java/com/styp/cenate/
├── service/ia/
│   ├── OllamaService.java
│   └── ValidadorRespuestasIA.java
├── api/ia/
│   └── ChatbotController.java
└── dto/ia/
    ├── ChatbotRequest.java
    └── ChatbotResponse.java
```

**Frontend:**
```bash
frontend/src/
├── pages/chatbot/
│   └── ChatbotMedico.jsx
└── services/
    └── ollamaService.js
```

---

### Fase 2: Servidor de Desarrollo (3-4 semanas)

#### Objetivos
- ✅ Ambiente de pruebas compartido
- ✅ Integración con BD producción (modo lectura)
- ✅ Evaluación de rendimiento

#### Infraestructura

```yaml
# docker-compose-ollama-dev.yml
version: '3.8'

services:
  ollama-dev:
    image: ollama/ollama:latest
    container_name: cenate-ollama-dev
    ports:
      - "11434:11434"
    volumes:
      - /mnt/ollama-models:/root/.ollama
    environment:
      - OLLAMA_HOST=0.0.0.0
      - OLLAMA_MODELS=/root/.ollama/models
    deploy:
      resources:
        limits:
          memory: 16G
          cpus: '8'
    restart: unless-stopped
    networks:
      - cenate-dev-network

networks:
  cenate-dev-network:
    external: true
```

#### Tareas

| Tarea | Duración | Responsable |
|-------|----------|-------------|
| Provisionar servidor (VM/Cloud) | 2 días | DevOps |
| Instalar Docker + Ollama | 1 día | DevOps |
| Descargar modelo llama3:8b | 3 horas | DevOps |
| Configurar firewall y acceso | 1 día | Seguridad |
| Actualizar backend para usar servidor remoto | 2 días | Dev |
| Pruebas de carga básicas | 3 días | QA |
| Documentar configuración | 1 día | Tech Writer |

---

### Fase 3: Evaluación con Usuarios Reales (4 semanas)

#### Objetivos
- ✅ Validar utilidad con médicos y coordinadores
- ✅ Recopilar feedback de experiencia de usuario
- ✅ Medir métricas de adopción

#### Métricas

| Métrica | Objetivo | Herramienta |
|---------|----------|-------------|
| **Uso diario** | 50+ consultas/día | Analytics |
| **Satisfacción** | 4/5 estrellas | Encuesta |
| **Tiempo ahorrado** | 30% reducción en tareas repetitivas | Time tracking |
| **Tasa de error** | <5% respuestas incorrectas | Manual review |

#### Casos de Prueba

1. **Chatbot de Orientación**
   - 100 consultas reales de pacientes
   - Médico revisa calidad de respuestas
   - Medir tiempo vs. atención telefónica

2. **Resumen de Historia Clínica**
   - 50 historias clínicas reales (anonimizadas)
   - Comparar resumen IA vs. resumen manual
   - Medir tiempo de lectura

3. **Análisis de Disponibilidad**
   - Analizar disponibilidad de 3 meses
   - Validar sugerencias con coordinadores
   - Implementar 2-3 recomendaciones

---

### Fase 4: Producción (6-8 semanas)

#### Objetivos
- ✅ Servidor dedicado en producción
- ✅ Alta disponibilidad y monitoreo
- ✅ Integración completa con sistema CENATE

#### Infraestructura Producción

```
┌─────────────────────────────────────────┐
│  Servidor Ollama Producción             │
│  - IP: 10.0.89.XX (nueva)               │
│  - RAM: 64 GB                           │
│  - CPU: 16 cores                        │
│  - GPU: NVIDIA RTX 4090 (24 GB VRAM)    │
│  - Almacenamiento: 500 GB NVMe          │
├─────────────────────────────────────────┤
│  Software:                              │
│  - Ubuntu 22.04 LTS                     │
│  - Docker 24                            │
│  - Ollama (última versión)              │
│  - Modelos: llama3:8b, mistral:7b       │
│  - Nginx (load balancer)                │
│  - Prometheus + Grafana (monitoreo)     │
└─────────────────────────────────────────┘
```

#### Tareas

| Tarea | Duración | Responsable |
|-------|----------|-------------|
| Adquisición de servidor | 2 semanas | Compras |
| Instalación y configuración | 1 semana | DevOps |
| Migración de modelos y datos | 3 días | DevOps |
| Configurar alta disponibilidad | 1 semana | DevOps |
| Implementar monitoreo | 1 semana | DevOps |
| Pruebas de estrés | 1 semana | QA |
| Capacitación a usuarios | 2 semanas | Capacitación |
| Go-live gradual (20% → 100%) | 2 semanas | Product Owner |

#### Monitoreo

```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'ollama'
    static_configs:
      - targets: ['10.0.89.XX:11434']
    metrics_path: '/metrics'

# Alertas
alerts:
  - name: OllamaDown
    expr: up{job="ollama"} == 0
    for: 5m
    annotations:
      summary: "Ollama está caído"

  - name: OllamaHighMemory
    expr: ollama_memory_usage > 55000000000  # 55 GB
    for: 10m
    annotations:
      summary: "Memoria de Ollama alta"

  - name: OllamaSlowResponse
    expr: ollama_response_time_seconds > 30
    for: 5m
    annotations:
      summary: "Ollama responde lentamente"
```

---

## Análisis de Costos

### Opción 1: Servidor On-Premise (Recomendado)

#### Hardware

| Componente | Especificación | Costo Aprox. |
|------------|----------------|--------------|
| **Servidor** | Dell PowerEdge R750 | $8,000 USD |
| **CPU** | Intel Xeon Silver 4314 (16 cores) | Incluido |
| **RAM** | 64 GB DDR4 ECC | $800 USD |
| **GPU** | NVIDIA RTX 4090 24GB | $2,000 USD |
| **Almacenamiento** | 1 TB NVMe SSD | $150 USD |
| **Redundancia** | Fuente poder redundante | $300 USD |

**Total Hardware: ~$11,250 USD**

#### Software

| Componente | Costo |
|------------|-------|
| Ubuntu Server | $0 (Open Source) |
| Docker | $0 (Open Source) |
| Ollama | $0 (Open Source) |
| Modelos LLM | $0 (Open Source) |

**Total Software: $0 USD**

#### Operación Anual

| Concepto | Costo Mensual | Costo Anual |
|----------|---------------|-------------|
| Energía (500W 24/7) | $50 | $600 |
| Refrigeración | $30 | $360 |
| Internet dedicado | $100 | $1,200 |
| Mantenimiento | $50 | $600 |

**Total Operación: $2,760 USD/año**

#### Costo Total 3 Años
```
Inversión inicial: $11,250
Operación (3 años): $8,280
────────────────────────────
Total: $19,530 USD
Costo mensual promedio: $542 USD
```

---

### Opción 2: Cloud (AWS/Azure)

#### Instancia Recomendada: AWS p3.2xlarge

| Especificación | Valor |
|----------------|-------|
| CPU | 8 vCPU |
| RAM | 61 GB |
| GPU | NVIDIA V100 (16 GB) |
| Almacenamiento | 1 TB EBS |
| Costo por hora | $3.06 USD |

#### Costos Mensuales

| Concepto | Cálculo | Costo |
|----------|---------|-------|
| Instancia 24/7 | $3.06 × 24 × 30 | $2,203 USD |
| Almacenamiento (1 TB) | $0.10/GB × 1000 | $100 USD |
| Transferencia datos (1 TB/mes) | $0.09/GB × 1000 | $90 USD |
| Snapshots (500 GB) | $0.05/GB × 500 | $25 USD |

**Total Mensual: $2,418 USD**

#### Costo Total 3 Años
```
Mensual: $2,418
Anual: $29,016
3 años: $87,048 USD
```

---

### Comparación

| Aspecto | On-Premise | Cloud (AWS) |
|---------|------------|-------------|
| **Costo 3 años** | $19,530 | $87,048 |
| **Ahorro** | ✅ Referencia | ❌ 4.5x más caro |
| **Inversión inicial** | ❌ $11,250 | ✅ $0 |
| **Control** | ✅ Total | ⚠️ Limitado |
| **Privacidad** | ✅ Máxima | ⚠️ Depende de config |
| **Escalabilidad** | ⚠️ Requiere nueva HW | ✅ Instantánea |
| **Mantenimiento** | ⚠️ Propio | ✅ AWS gestiona |

**Recomendación:** **On-Premise** es mejor para CENATE por:
- ✅ Costo 4.5x menor a 3 años
- ✅ Datos médicos NO salen de EsSalud
- ✅ EsSalud tiene infraestructura existente
- ✅ Sin dependencia de proveedores externos

---

## Riesgos y Mitigaciones

### 1. Rendimiento de Base de Datos

#### Riesgo
**Impacto:** CRÍTICO
**Probabilidad:** ALTA (si se instala en servidor de BD)

**Descripción:** Ollama consume recursos significativos (CPU, RAM) que podrían degradar el rendimiento de PostgreSQL, afectando tiempos de respuesta de consultas críticas.

#### Mitigación
```
✅ SOLUCIÓN: Servidor dedicado para Ollama
✅ PLAN B: Contenedor con límites estrictos de recursos
✅ PLAN C: Implementar en horarios de baja demanda (piloto nocturno)
```

---

### 2. Calidad de Respuestas de IA

#### Riesgo
**Impacto:** MEDIO
**Probabilidad:** MEDIA

**Descripción:** Modelos LLM pueden generar respuestas incorrectas, desactualizadas o inapropiadas para contexto médico.

#### Mitigación
```java
// 1. Disclaimer obligatorio en todas las respuestas
public String generarRespuestaConDisclaimer(String pregunta) {
    String respuesta = ollamaService.generar(pregunta);

    return """
        🤖 Asistente Virtual CENATE

        %s

        ⚠️ IMPORTANTE: Esta es información general orientativa.
        Para diagnósticos o tratamientos, consulte con un médico.
        Esta herramienta NO reemplaza la atención médica profesional.
        """.formatted(respuesta);
}

// 2. Revisión humana obligatoria para casos críticos
public class RevisionHumanaService {

    public RespuestaRevisada procesarConsultaCritica(String pregunta) {
        String respuestaIA = ollamaService.generar(pregunta);

        // Detectar keywords críticos
        if (esCritico(pregunta)) {
            notificarMedicoParaRevision(pregunta, respuestaIA);
            return new RespuestaRevisada(
                "Su consulta está siendo revisada por un médico. " +
                "Recibirá respuesta en 24 horas.",
                true  // requiere revisión
            );
        }

        return new RespuestaRevisada(respuestaIA, false);
    }

    private boolean esCritico(String pregunta) {
        String[] keywords = {
            "dolor intenso", "sangrado", "emergencia",
            "accidente", "desmayo", "convulsión"
        };
        return Arrays.stream(keywords)
            .anyMatch(k -> pregunta.toLowerCase().contains(k));
    }
}
```

---

### 3. Aprobación Institucional

#### Riesgo
**Impacto:** CRÍTICO
**Probabilidad:** MEDIA

**Descripción:** EsSalud puede rechazar el uso de IA en sistemas médicos por:
- Preocupaciones éticas
- Falta de regulación clara
- Responsabilidad legal

#### Mitigación

**Plan de Aprobación:**

1. **Documentación Formal (Semana 1-2)**
   ```
   - Propuesta técnica detallada
   - Análisis de privacidad y seguridad
   - Casos de uso no críticos (empezar con chatbot informativo)
   - Comparación con hospitales que usan IA (benchmarking)
   ```

2. **Comité de Ética (Semana 3-4)**
   ```
   - Presentación ante comité de ética médica
   - Demostración de protecciones implementadas
   - Consentimiento informado de pacientes
   ```

3. **Piloto Controlado (Mes 2-3)**
   ```
   - Implementar solo en área no crítica (orientación general)
   - 100% de respuestas revisadas por humanos
   - Métricas de calidad y satisfacción
   ```

4. **Evaluación y Escalamiento (Mes 4)**
   ```
   - Presentar resultados del piloto
   - Solicitar aprobación para casos de uso adicionales
   ```

---

### 4. Mantenimiento y Actualizaciones

#### Riesgo
**Impacto:** MEDIO
**Probabilidad:** BAJA

**Descripción:** Modelos LLM requieren actualizaciones periódicas. Falta de recursos técnicos para mantener el sistema.

#### Mitigación

**Plan de Mantenimiento:**

```bash
# Script automatizado de actualización
#!/bin/bash
# update-ollama-models.sh

LOG_FILE="/var/log/ollama-updates.log"
FECHA=$(date '+%Y-%m-%d %H:%M:%S')

echo "[$FECHA] Iniciando actualización de modelos Ollama..." >> $LOG_FILE

# 1. Backup de modelos actuales
echo "[$FECHA] Creando backup..." >> $LOG_FILE
tar -czf /backup/ollama-models-$(date +%Y%m%d).tar.gz /root/.ollama/models/

# 2. Actualizar Ollama
echo "[$FECHA] Actualizando Ollama..." >> $LOG_FILE
docker pull ollama/ollama:latest

# 3. Actualizar modelos
MODELOS=("llama3:8b" "mistral:7b")
for modelo in "${MODELOS[@]}"; do
    echo "[$FECHA] Actualizando $modelo..." >> $LOG_FILE
    docker exec cenate-ollama ollama pull $modelo
done

# 4. Verificar funcionamiento
echo "[$FECHA] Verificando funcionamiento..." >> $LOG_FILE
RESPUESTA=$(curl -s http://localhost:11434/api/generate -d '{
    "model": "llama3:8b",
    "prompt": "Hola",
    "stream": false
}')

if [ $? -eq 0 ]; then
    echo "[$FECHA] Actualización completada exitosamente" >> $LOG_FILE
else
    echo "[$FECHA] ERROR: Falló la verificación" >> $LOG_FILE
    # Restaurar backup
    echo "[$FECHA] Restaurando backup..." >> $LOG_FILE
    tar -xzf /backup/ollama-models-$(date +%Y%m%d).tar.gz -C /
fi

# 5. Limpiar backups antiguos (>30 días)
find /backup -name "ollama-models-*.tar.gz" -mtime +30 -delete
```

**Frecuencia:**
- Actualización de Ollama: Mensual
- Actualización de modelos: Trimestral
- Backup: Diario (automático)

---

### 5. Alucinaciones del Modelo

#### Riesgo
**Impacto:** ALTO
**Probabilidad:** MEDIA

**Descripción:** Los LLMs pueden generar información falsa pero convincente ("alucinaciones"), especialmente con datos médicos específicos.

#### Mitigación

**Sistema de Verificación Multi-Capa:**

```java
@Service
public class VerificadorRespuestasService {

    @Autowired
    private OllamaService ollamaService;

    @Autowired
    private BaseConocimientoService baseConocimiento;

    public RespuestaVerificada generarRespuestaSegura(String pregunta) {
        // 1. Generar respuesta con Ollama
        String respuesta = ollamaService.generar(pregunta);

        // 2. Extraer afirmaciones médicas
        List<String> afirmaciones = extraerAfirmacionesMedicas(respuesta);

        // 3. Verificar contra base de conocimiento
        List<Verificacion> verificaciones = new ArrayList<>();
        for (String afirmacion : afirmaciones) {
            boolean esCorrecta = baseConocimiento.verificar(afirmacion);
            verificaciones.add(new Verificacion(afirmacion, esCorrecta));
        }

        // 4. Calcular confianza
        double confianza = calcularConfianza(verificaciones);

        // 5. Decidir acción
        if (confianza < 0.7) {
            // Baja confianza: No mostrar, derivar a humano
            return RespuestaVerificada.requiereRevisionHumana(pregunta);
        } else if (confianza < 0.9) {
            // Confianza media: Mostrar con disclaimer fuerte
            return RespuestaVerificada.conDisclaimer(respuesta, confianza);
        } else {
            // Alta confianza: Mostrar normalmente
            return RespuestaVerificada.aprobada(respuesta, confianza);
        }
    }

    private List<String> extraerAfirmacionesMedicas(String texto) {
        // Regex para detectar afirmaciones médicas
        Pattern pattern = Pattern.compile(
            "(El tratamiento|La dosis|El diagnóstico|El síntoma).+?\\."
        );
        Matcher matcher = pattern.matcher(texto);

        List<String> afirmaciones = new ArrayList<>();
        while (matcher.find()) {
            afirmaciones.add(matcher.group());
        }
        return afirmaciones;
    }
}
```

---

## Decisión Recomendada

### ✅ SÍ, implementar Ollama en CENATE

**PERO con las siguientes condiciones:**

### 1. Infraestructura
```
❌ NO instalar en servidor de BD actual (10.0.89.13)
✅ SÍ implementar en servidor dedicado (nuevo 10.0.89.XX)
✅ SÍ empezar con prototipo en Mac de desarrollo
```

### 2. Fases de Implementación
```
Fase 1: Prototipo local (3 semanas)           ← EMPEZAR AQUÍ
Fase 2: Servidor de desarrollo (4 semanas)
Fase 3: Piloto con usuarios (4 semanas)
Fase 4: Producción (8 semanas)
────────────────────────────────────────────────
Total: ~5 meses
```

### 3. Casos de Uso Iniciales
```
✅ Chatbot de orientación general (NO diagnóstico)
✅ Resumen de reportes administrativos
⚠️ Análisis de disponibilidad médica (con revisión humana)
❌ NO diagnóstico automático
❌ NO prescripción de medicamentos
```

### 4. Presupuesto Requerido
```
Hardware (servidor dedicado): $11,250 USD
Operación anual: $2,760 USD
Desarrollo e implementación: $15,000 USD (4 meses × 1 dev)
Capacitación: $2,000 USD
────────────────────────────────────────────────
Total primer año: $31,010 USD
Años siguientes: $2,760 USD/año
```

### 5. Métricas de Éxito

El proyecto se considerará exitoso si:

| Métrica | Objetivo Año 1 |
|---------|----------------|
| **Adopción** | 60% de médicos usan chatbot |
| **Satisfacción** | >4/5 estrellas |
| **Tiempo ahorrado** | 20% en tareas administrativas |
| **Precisión** | >95% respuestas correctas (validadas) |
| **Disponibilidad** | >99% uptime |

---

## Próximos Pasos

### Inmediato (Esta Semana)

1. **Aprobar o rechazar este documento**
   - Presentar a Jefe de Proyecto / Director CENATE
   - Obtener feedback inicial

2. **Si se aprueba: Fase de Prototipo**
   ```bash
   # Instalar Ollama en tu Mac
   brew install ollama

   # Descargar modelo ligero
   ollama pull llama3.2:3b

   # Crear rama en Git
   git checkout -b feature/ollama-integration
   ```

3. **Crear backlog de tareas**
   ```
   - [x] Análisis técnico (este documento)
   - [ ] Prototipo OllamaService.java
   - [ ] Prototipo ChatbotController.java
   - [ ] Frontend básico ChatbotMedico.jsx
   - [ ] Demo interna
   ```

### Corto Plazo (Próximo Mes)

1. Completar Fase 1 (prototipo)
2. Presentar demo a stakeholders
3. Decidir si continuar con Fase 2

### Mediano Plazo (3-6 Meses)

1. Servidor de desarrollo
2. Piloto con usuarios reales
3. Evaluación de resultados

### Largo Plazo (6-12 Meses)

1. Servidor de producción
2. Escalamiento a todos los usuarios
3. Casos de uso avanzados

---

## Conclusión

### Pregunta Original
**"Si llego a instalar Ollama en mi servidor donde está alojado mi base de datos, ¿me ayudará en algo a contribuir a mi proyecto?"**

### Respuesta Final

**SÍ, Ollama puede aportar valor significativo a CENATE mediante:**
- Chatbot de orientación médica
- Análisis inteligente de datos
- Automatización de tareas repetitivas
- Mejora en experiencia de usuarios

**PERO es CRÍTICO que:**
- ❌ NO se instale en el servidor de base de datos actual
- ✅ Se implemente en servidor dedicado
- ✅ Se empiece con prototipo en desarrollo
- ✅ Se obtenga aprobación institucional
- ✅ Se implementen controles de seguridad y privacidad

**Recomendación Final:**
**APROBAR** el proyecto con implementación gradual, empezando con prototipo local en tu Mac, evaluando resultados, y escalando a producción solo si se valida el valor y se cuenta con recursos adecuados.

---

**Documento elaborado por:** Ing. Styp Canto Rondon
**Fecha:** 2025-12-30
**Versión:** 1.0
**Contacto:** cenate.analista@essalud.gob.pe

---

## Referencias

- [Ollama Official Documentation](https://ollama.ai/docs)
- [Llama 3 Model Card](https://huggingface.co/meta-llama/Meta-Llama-3-8B)
- [Mistral AI Documentation](https://docs.mistral.ai/)
- [HIPAA Compliance for AI Systems](https://www.hhs.gov/hipaa)
- [Ley N° 29733 - Protección de Datos Personales](https://www.gob.pe/institucion/congreso-de-la-republica/normas-legales/243470-29733)
- [WHO Guidelines on Digital Health](https://www.who.int/publications/i/item/9789241550505)
