# CENATE AI Trainer — Memory

## Chatbot de Trazabilidad (v1.75.0)

### Arquitectura del chatbot
- Archivo frontend: `frontend/src/components/chatbot/ChatbotTrazabilidad.jsx`
- Archivo backend tools: `backend/src/main/java/com/styp/cenate/api/chatbot/TrazabilidadTools.java`
- Servicio frontend: `frontend/src/services/chatbotTrazabilidadService.js`

### Patron de acceso por lista blanca (v1.75.0)
Reemplazado `isRoleExterno` (lista negra) por `tieneChatbotAccess` (lista blanca):
```
ROLES_CON_CHATBOT = ['SUPERADMIN','ADMINISTRADOR','COORDINADOR',
  'COORDINADOR_GESTION_CITAS','GESTION_TERRITORIAL',
  'MEDICO','ENFERMERIA','CITAS','ESTADISTICA']
```
Roles EXTERNO e INSTITUCION quedan excluidos automaticamente.

### Personalizacion por rol
- `detectarRolPrincipal(roles)` — detecta rol dominante iterando en orden de prioridad
- `getSugerenciasPorRol(roles)` — devuelve 4 sugerencias especificas por rol
- `getMensajeBienvenida(roles)` — mensaje inicial personalizado por rol
- El `useState` inicial usa mensaje generico; `useEffect([user?.roles])` lo actualiza cuando user carga

### Herramientas Spring AI en TrazabilidadTools.java
Herramientas existentes (v1.70.0):
1. `buscarHistorialPaciente(dni)` — dim_solicitud_bolsa por DNI
2. `verificarPuedeCrearCita(dni)` — diagnostico de solicitudes activas
3. `detectarInconsistencias(dni)` — sin responsable, duplicados activos
4. `buscarProfesional(dniONombre)` — PersonalCnt por nombre/DNI
5. `consultarTrazabilidadCompleta(dni)` — SolicitudBolsa activos+archivados
6. `buscarUsuarioCENATE(criterio)` — Usuario por login

Herramientas nuevas (v1.75.0):
7. `buscarPacientePorNombre(nombre)` — DimBolsa.findAll() filtrado por pacienteNombre (limit 10)
8. `resumenSolicitudesPorEstado(especialidad)` — KPI agrupado por estado, con filtro opcional

### Campos verificados en DimBolsa.java
- `getPacienteDni()` — columna `paciente_dni`
- `getPacienteNombre()` — columna `paciente_nombre`
- `getEspecialidadNombre()` — columna `especialidad_nombre`
- `getEstado()` — columna `estado`
- `getCodigoIpress()` — columna `codigo_ipress`
- `getActivo()` — columna `activo` (Boolean)
Todos generados por Lombok @Data sobre la tabla `dim_solicitud_bolsa`.

### Imports ya presentes en TrazabilidadTools.java
`java.util.List`, `java.util.ArrayList`, `java.util.stream.Collectors`, `DimBolsa`,
`bolsaRepository` (BolsaRepository) — no requieren nuevas importaciones para las tools nuevas.

### Configuracion API Claude (recomendada para chatbot institucional)
- model: `claude-3-5-sonnet-20241022`
- temperature: 0.3 (determinista para consultas medicas/BD)
- max_tokens: 1024

### Regla de estilo (confirmada por usuario)
- NO usar emojis en textos de bienvenida del chatbot (mensajes de texto plano)
- Mantener `whitespace-pre-wrap` en burbujas de chat (no Markdown rendering)
- NO cambiar diseno visual del widget
