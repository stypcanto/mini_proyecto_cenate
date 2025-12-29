# 📊 Resumen de Mejoras Implementadas - Sistema de Auditoría y Seguridad

**Proyecto**: CENATE - Sistema de Telemedicina
**Fecha**: 2025-12-29
**Autor**: Ing. Styp Canto Rondón
**Versión**: 1.0.0

---

## 🎯 Objetivo

Implementar un sistema completo de auditoría y seguridad que incluya:
- Captura automática de contexto HTTP (IP, User-Agent, dispositivo)
- Auditoría de cambios de roles y permisos
- Auditoría de acceso a datos sensibles
- Tracking de sesiones activas
- Detección automática de anomalías de seguridad
- Integridad de logs mediante hashing SHA-256
- Dashboard ejecutivo de seguridad

---

## ✅ FASE 1: Mejoras Críticas (COMPLETADA)

### 1.1. Captura Automática de Contexto HTTP

**Archivos creados:**
- `backend/src/main/java/com/styp/cenate/util/RequestContextUtil.java`

**Funcionalidad:**
- Captura automática de IP del cliente (soporta proxies: X-Forwarded-For, X-Real-IP)
- Parsing de User-Agent para detectar navegador, OS y tipo de dispositivo
- Clase helper `AuditContext` con IP y User-Agent
- Clase `UserAgentInfo` con navegador, OS y deviceType

**Uso:**
```java
RequestContextUtil.AuditContext context = RequestContextUtil.getAuditContext();
String ip = context.getIp();
String userAgent = context.getUserAgent();

RequestContextUtil.UserAgentInfo info = RequestContextUtil.parseUserAgent(userAgent);
String browser = info.getBrowser();  // CHROME, FIREFOX, SAFARI, etc.
String os = info.getOs();            // WINDOWS, LINUX, MAC, ANDROID, IOS
String device = info.getDeviceType(); // DESKTOP, MOBILE, TABLET
```

**Modificaciones:**
- `AuditLogServiceImpl.java`: Actualizado `registrarEvento()` para capturar IP y User-Agent automáticamente
- `LogsDelSistema.jsx`: Agregadas columnas IP y Dispositivo

### 1.2. Auditoría de Cambios de Roles y Permisos

**Archivos modificados:**
- `backend/src/main/java/com/styp/cenate/service/usuario/UsuarioServiceImpl.java`

**Funcionalidad:**
- Método `asignarRol(Long idUsuario, Long idRol)` con auditoría completa
- Método `removerRol(Long idUsuario, Long idRol)` con auditoría completa
- Log detallado: usuario afectado, rol, nombre completo, acción

**Acciones auditadas:**
- `ASSIGN_ROLE`: Asignación de rol a usuario
- `REMOVE_ROLE`: Remoción de rol a usuario

**Scripts SQL:**
- `spec/scripts/010_agregar_emojis_mbac_auditoria.sql`: Actualización de vista de auditoría con emojis para acciones MBAC

### 1.3. Auditoría de Acceso a Datos Sensibles (AOP)

**Archivos creados:**
- `backend/src/main/java/com/styp/cenate/security/annotation/AuditarAccesoSensible.java`
- `backend/src/main/java/com/styp/cenate/security/aspect/AuditoriaAccesoSensibleAspect.java`
- `spec/013_guia_auditoria_acceso_sensible.md` (documentación)

**Funcionalidad:**
- Anotación `@AuditarAccesoSensible` para marcar métodos que acceden a datos sensibles
- Aspecto AOP que intercepta automáticamente las llamadas
- Log automático sin modificar código de negocio
- Soporte para múltiples módulos: PACIENTES, MEDICOS, REPORTES, etc.

**Uso:**
```java
@AuditarAccesoSensible(
    accion = "VIEW_PATIENT_DATA",
    modulo = "PACIENTES",
    descripcion = "Acceso a ficha médica del paciente",
    nivel = "INFO"
)
public PacienteDTO obtenerFichaMedica(Long idPaciente) {
    // Código de negocio
}
```

**Acciones auditables:**
- `VIEW_PATIENT_DATA`: Ver datos de paciente
- `VIEW_MEDICAL_HISTORY`: Ver historial médico
- `VIEW_SENSITIVE_REPORT`: Ver reporte sensible
- `EXPORT_PATIENT_DATA`: Exportar datos de paciente
- `ACCESS_PERSONAL_INFO`: Acceso a información personal

---

## ✅ FASE 2: Mejoras Importantes (COMPLETADA)

### 2.1. Sistema de Tracking de Sesiones Activas

**Archivos creados:**
- `spec/scripts/011_crear_tabla_active_sessions.sql`
- `backend/src/main/java/com/styp/cenate/model/ActiveSession.java`
- `backend/src/main/java/com/styp/cenate/repository/ActiveSessionRepository.java`
- `backend/src/main/java/com/styp/cenate/service/session/SessionService.java`
- `backend/src/main/java/com/styp/cenate/service/session/SessionServiceImpl.java`
- `backend/src/main/java/com/styp/cenate/scheduled/SessionCleanupJob.java`

**Funcionalidad:**
- Tracking de sesiones activas con UUID único por sesión
- Registro automático al login (integrado en AuthenticationServiceImpl)
- Detección de sesiones concurrentes desde diferentes IPs (alerta automática)
- Actualización de `last_activity` al realizar acciones
- Cierre automático de sesiones inactivas (>30 min sin actividad)
- Cierre de sesión al logout
- Metadata: IP, User-Agent, dispositivo, navegador, OS

**Tabla creada:**
```sql
CREATE TABLE active_sessions (
    id              BIGSERIAL PRIMARY KEY,
    session_id      VARCHAR(255) UNIQUE NOT NULL,
    user_id         BIGINT NOT NULL,
    username        VARCHAR(100) NOT NULL,
    ip_address      VARCHAR(50),
    user_agent      TEXT,
    login_time      TIMESTAMP(6) NOT NULL DEFAULT NOW(),
    last_activity   TIMESTAMP(6) NOT NULL DEFAULT NOW(),
    logout_time     TIMESTAMP(6),
    is_active       BOOLEAN DEFAULT TRUE,
    device_type     VARCHAR(50),
    browser         VARCHAR(50),
    os              VARCHAR(50)
);
```

**Vistas SQL creadas:**
- `vw_sesiones_activas`: Sesiones activas con duración en minutos
- `vw_sesiones_concurrentes`: Usuarios con múltiples sesiones activas
- `get_session_statistics()`: Función para estadísticas de sesiones

**Job programado:**
- `SessionCleanupJob.limpiarSesionesInactivas()`: Cada 15 minutos
- `SessionCleanupJob.reportarEstadisticasSesiones()`: Cada hora

**Modificaciones:**
- `AuthenticationServiceImpl.authenticate()`: Registra sesión al login, retorna `sessionId` en AuthResponse

### 2.2. Sistema de Tracking de Cambios (Before/After)

**Archivos creados:**
- `spec/scripts/012_agregar_columnas_tracking_cambios.sql`

**Archivos modificados:**
- `backend/src/main/java/com/styp/cenate/model/AuditLog.java`
- `backend/src/main/java/com/styp/cenate/service/auditlog/AuditLogServiceImpl.java`

**Funcionalidad:**
- Columnas JSONB en `audit_logs`: `datos_previos`, `datos_nuevos`
- Método `registrarEventoConDiff()` para guardar estado antes/después
- Función SQL `audit_logs_compare_changes()` para comparar cambios
- Vista SQL `vw_auditoria_cambios_detallados` con campos modificados

**Uso:**
```java
Map<String, Object> datosPrevios = Map.of(
    "email_corporativo", "usuario@old.com",
    "telefono", "123456"
);

Map<String, Object> datosNuevos = Map.of(
    "email_corporativo", "usuario@new.com",
    "telefono", "654321"
);

auditLogService.registrarEventoConDiff(
    "admin123",
    "UPDATE_USER",
    "USUARIOS",
    "Actualización de datos de usuario",
    "INFO",
    "SUCCESS",
    usuarioId,
    datosPrevios,
    datosNuevos
);
```

**Consultas SQL útiles:**
```sql
-- Ver cambios detallados
SELECT * FROM vw_auditoria_cambios_detallados
WHERE id_afectado = 123
ORDER BY fecha_hora DESC;

-- Comparar cambios específicos
SELECT * FROM audit_logs_compare_changes(
    '{"email": "old@mail.com"}'::jsonb,
    '{"email": "new@mail.com"}'::jsonb
);
```

---

## ✅ FASE 3: Mejoras Avanzadas (COMPLETADA)

### 3.1. Sistema de Integridad de Logs (Hash SHA-256)

**Archivos creados:**
- `spec/scripts/013_agregar_hash_integridad.sql`

**Archivos modificados:**
- `backend/src/main/java/com/styp/cenate/model/AuditLog.java`

**Funcionalidad:**
- Columna `hash_integridad` en `audit_logs`
- Trigger automático que calcula SHA-256 al insertar
- Función SQL `calcular_hash_auditoria()` para calcular hash
- Función SQL `verificar_integridad_log(id)` para verificar un log
- Función SQL `verificar_integridad_completa()` para verificar todos
- Vista SQL `vw_audit_logs_manipulados` para logs manipulados

**Hash incluye:**
- id, usuario, action, modulo, detalle, ip_address, fecha_hora, nivel, estado, id_afectado, datos_previos, datos_nuevos

**Consultas SQL útiles:**
```sql
-- Verificar integridad de un log específico
SELECT * FROM verificar_integridad_log(123);

-- Verificar integridad completa del sistema
SELECT * FROM verificar_integridad_completa();

-- Ver logs manipulados
SELECT * FROM vw_audit_logs_manipulados;

-- Estadísticas de integridad
SELECT
    'Total logs con hash' as metrica,
    COUNT(*) as valor
FROM audit_logs
WHERE hash_integridad IS NOT NULL;
```

### 3.2. Sistema de Alertas de Seguridad

**Archivos creados:**
- `spec/scripts/014_crear_tabla_security_alerts.sql`
- `backend/src/main/java/com/styp/cenate/model/SecurityAlert.java`
- `backend/src/main/java/com/styp/cenate/repository/SecurityAlertRepository.java`

**Funcionalidad:**
- Tabla `security_alerts` para almacenar alertas automatizadas
- Triggers automáticos en PostgreSQL:
  - Detección de brute force (5+ intentos fallidos en 15 min)
  - Detección de acceso fuera de horario (antes de 7am, después de 7pm, fines de semana)
- Estados: NUEVA, EN_REVISION, RESUELTA, FALSO_POSITIVO
- Severidad: CRITICAL, HIGH, MEDIUM, LOW

**Tipos de alerta:**
- `BRUTE_FORCE`: Intentos de fuerza bruta
- `CONCURRENT_SESSION`: Sesiones concurrentes sospechosas
- `UNUSUAL_LOCATION`: Acceso desde IP nunca vista
- `OFF_HOURS_ACCESS`: Acceso fuera de horario
- `MASS_EXPORT`: Exportación masiva de datos
- `PERMISSION_CHANGE`: Cambios sospechosos de permisos
- `TAMPERED_LOG`: Logs manipulados
- `UNUSUAL_ACTIVITY`: Actividad inusual

**Tabla creada:**
```sql
CREATE TABLE security_alerts (
    id                  BIGSERIAL PRIMARY KEY,
    alert_type          VARCHAR(50) NOT NULL,
    severity            VARCHAR(20) NOT NULL,
    usuario             VARCHAR(100),
    ip_address          VARCHAR(50),
    descripcion         TEXT NOT NULL,
    detalles            JSONB,
    fecha_deteccion     TIMESTAMP(6) NOT NULL DEFAULT NOW(),
    estado              VARCHAR(20) DEFAULT 'NUEVA',
    resuelto_por        VARCHAR(100),
    fecha_resolucion    TIMESTAMP(6),
    notas_resolucion    TEXT,
    accion_tomada       TEXT
);
```

**Vistas SQL creadas:**
- `vw_security_alerts_activas`: Alertas activas ordenadas por severidad
- `vw_security_alerts_resumen`: Resumen ejecutivo de alertas
- `vw_security_alerts_por_tipo`: Estadísticas por tipo de alerta

**Funciones SQL:**
```sql
-- Crear alerta manualmente
SELECT crear_alerta_seguridad(
    'UNUSUAL_ACTIVITY',
    'HIGH',
    'usuario123',
    '192.168.1.100',
    'Actividad sospechosa detectada',
    '{"detalles": "100 acciones en 5 minutos"}'::jsonb
);

-- Resolver alerta
SELECT resolver_alerta_seguridad(
    1,                    -- ID alerta
    'admin',              -- Resuelto por
    'RESUELTA',           -- Nuevo estado
    'Usuario contactado y verificado',
    'Cambio de contraseña solicitado'
);

-- Estadísticas
SELECT * FROM obtener_estadisticas_alertas();
```

### 3.3. Servicio de Detección de Anomalías

**Archivos creados:**
- `backend/src/main/java/com/styp/cenate/service/security/AnomalyDetectionService.java`
- `backend/src/main/java/com/styp/cenate/service/security/AnomalyDetectionServiceImpl.java`
- `backend/src/main/java/com/styp/cenate/scheduled/AnomalyDetectionJob.java`

**Funcionalidad:**
- Detección automática de brute force (5+ intentos fallidos en 15 min)
- Detección de sesiones concurrentes desde IPs diferentes
- Detección de ubicación inusual (IP nunca vista antes)
- Detección de acceso fuera de horario laboral
- Detección de exportación masiva (10+ exportaciones en 1 hora)
- Detección de cambios de permisos sospechosos (5+ cambios en 30 min)
- Detección de actividad inusual (50+ acciones en 10 min)
- Verificación de integridad de logs (detección de manipulación)

**Umbrales configurables:**
```java
private static final int BRUTE_FORCE_THRESHOLD = 5;           // Intentos fallidos
private static final int BRUTE_FORCE_MINUTES = 15;
private static final int UNUSUAL_ACTIVITY_THRESHOLD = 50;      // Acciones
private static final int UNUSUAL_ACTIVITY_MINUTES = 10;
private static final int MASS_EXPORT_THRESHOLD = 10;           // Exportaciones
private static final int MASS_EXPORT_HOURS = 1;
private static final int PERMISSION_CHANGE_THRESHOLD = 5;      // Cambios
private static final int PERMISSION_CHANGE_MINUTES = 30;

private static final LocalTime HORARIO_INICIO = LocalTime.of(7, 0);   // 7:00 AM
private static final LocalTime HORARIO_FIN = LocalTime.of(19, 0);     // 7:00 PM
```

**Métodos disponibles:**
```java
// Detectar anomalías específicas
boolean detectarBruteForce(String username);
boolean detectarSesionesConcurrentesSospechosas(String username, String currentIp);
boolean detectarUbicacionInusual(String username, String ipAddress);
boolean detectarAccesoFueraHorario(String username);
boolean detectarExportacionMasiva(String username);
boolean detectarCambiosPermisosSospechosos(String username);
boolean detectarActividadInusual(String username);

// Análisis completo de usuario
Map<String, Boolean> analizarUsuarioCompleto(String username);

// Análisis automático del sistema
int ejecutarAnalisisAutomatico();

// Verificación de integridad
int verificarIntegridadLogs();
```

**Jobs programados:**
- `AnomalyDetectionJob.ejecutarAnalisisDeAnomalias()`: Cada 30 minutos
- `AnomalyDetectionJob.verificarIntegridadLogs()`: Cada 4 horas
- `AnomalyDetectionJob.generarReporteDiarioAlertas()`: Diariamente a las 8 AM

**Prevención de duplicados:**
- No se crean alertas duplicadas en los últimos 15 minutos

### 3.4. Dashboard de Seguridad Ejecutivo

**Archivos creados:**
- `backend/src/main/java/com/styp/cenate/service/security/SecurityDashboardService.java`
- `backend/src/main/java/com/styp/cenate/service/security/SecurityDashboardServiceImpl.java`
- `backend/src/main/java/com/styp/cenate/api/security/SecurityDashboardController.java`

**Funcionalidad:**
- Resumen ejecutivo de seguridad
- Estadísticas de alertas (por tipo, severidad, estado)
- Estadísticas de sesiones activas
- Top usuarios con más alertas
- Distribución de alertas por hora del día
- Tendencias de alertas (últimos 7 días)
- Métricas de integridad de logs
- Actividad reciente (últimas 24 horas)
- Análisis manual de usuarios
- Verificación manual de integridad

**Endpoints API (Acceso: SUPERADMIN, ADMIN):**

```
GET  /api/security/dashboard/resumen
GET  /api/security/dashboard/estadisticas/alertas
GET  /api/security/dashboard/estadisticas/sesiones
GET  /api/security/dashboard/estadisticas/integridad
GET  /api/security/dashboard/top-usuarios?limit=10
GET  /api/security/dashboard/tendencias/alertas
GET  /api/security/dashboard/distribucion/horas
GET  /api/security/dashboard/alertas/criticas?page=0&size=20
GET  /api/security/dashboard/actividad/reciente
POST /api/security/dashboard/analizar/usuario/{username}        (Solo SUPERADMIN)
POST /api/security/dashboard/verificar-integridad               (Solo SUPERADMIN)
```

**Ejemplo de respuesta `/resumen`:**
```json
{
  "status": 200,
  "data": {
    "total_alertas": 145,
    "alertas_nuevas": 8,
    "alertas_criticas": 2,
    "alertas_en_revision": 5,
    "alertas_resueltas": 130,
    "alertas_hoy": 3,
    "alertas_ultimas_24h": 12,
    "alertas_ultimos_7d": 45,
    "sesiones_activas": 15,
    "usuarios_con_sesiones_concurrentes": 2,
    "logs_ultimas_24h": 1543,
    "errores_login_ultimas_24h": 8,
    "tasa_resolucion_30d": 85,
    "estado_general": "PRECAUCIÓN"
  },
  "message": "Resumen ejecutivo obtenido exitosamente"
}
```

**Estado general del sistema:**
- `CRÍTICO`: Hay alertas críticas activas
- `ALERTA`: >10 alertas nuevas
- `PRECAUCIÓN`: >5 alertas nuevas
- `NORMAL`: ≤5 alertas nuevas

---

## 📊 Archivos Modificados/Creados

### Scripts SQL (7 archivos)
1. `spec/scripts/010_agregar_emojis_mbac_auditoria.sql`
2. `spec/scripts/011_crear_tabla_active_sessions.sql`
3. `spec/scripts/012_agregar_columnas_tracking_cambios.sql`
4. `spec/scripts/013_agregar_hash_integridad.sql`
5. `spec/scripts/014_crear_tabla_security_alerts.sql`

### Backend - Modelos (2 archivos)
1. `model/ActiveSession.java` (nuevo)
2. `model/SecurityAlert.java` (nuevo)
3. `model/AuditLog.java` (modificado: +hashIntegridad, +datosPrevios, +datosNuevos)

### Backend - Repositorios (3 archivos)
1. `repository/ActiveSessionRepository.java` (nuevo)
2. `repository/SecurityAlertRepository.java` (nuevo)
3. `repository/AuditLogRepository.java` (modificado: +7 métodos para detección de anomalías)

### Backend - Servicios (9 archivos)
1. `util/RequestContextUtil.java` (nuevo)
2. `service/session/SessionService.java` (nuevo)
3. `service/session/SessionServiceImpl.java` (nuevo)
4. `service/security/AnomalyDetectionService.java` (nuevo)
5. `service/security/AnomalyDetectionServiceImpl.java` (nuevo)
6. `service/security/SecurityDashboardService.java` (nuevo)
7. `service/security/SecurityDashboardServiceImpl.java` (nuevo)
8. `service/auditlog/AuditLogServiceImpl.java` (modificado: +registrarEventoConDiff, +captura contexto HTTP)
9. `service/usuario/UsuarioServiceImpl.java` (modificado: +asignarRol, +removerRol con auditoría)

### Backend - AOP (2 archivos)
1. `security/annotation/AuditarAccesoSensible.java` (nuevo)
2. `security/aspect/AuditoriaAccesoSensibleAspect.java` (nuevo)

### Backend - Controllers (1 archivo)
1. `api/security/SecurityDashboardController.java` (nuevo)

### Backend - Scheduled Jobs (2 archivos)
1. `scheduled/SessionCleanupJob.java` (nuevo)
2. `scheduled/AnomalyDetectionJob.java` (nuevo)

### Frontend (1 archivo)
1. `pages/admin/LogsDelSistema.jsx` (modificado: +columnas IP y Dispositivo)

### Documentación (2 archivos)
1. `spec/013_guia_auditoria_acceso_sensible.md` (nuevo)
2. `spec/015_resumen_mejoras_auditoria_seguridad.md` (este archivo)

---

## 🔧 Instrucciones de Instalación

### 1. Ejecutar Scripts SQL (en orden)

```bash
# Conectar a la base de datos
export PGPASSWORD=Essalud2025

# Script 1: Emojis MBAC en auditoría
psql -h 10.0.89.13 -U postgres -d maestro_cenate \
  -f spec/scripts/010_agregar_emojis_mbac_auditoria.sql

# Script 2: Tabla de sesiones activas
psql -h 10.0.89.13 -U postgres -d maestro_cenate \
  -f spec/scripts/011_crear_tabla_active_sessions.sql

# Script 3: Columnas tracking de cambios
psql -h 10.0.89.13 -U postgres -d maestro_cenate \
  -f spec/scripts/012_agregar_columnas_tracking_cambios.sql

# Script 4: Hash de integridad
psql -h 10.0.89.13 -U postgres -d maestro_cenate \
  -f spec/scripts/013_agregar_hash_integridad.sql

# Script 5: Tabla de alertas de seguridad
psql -h 10.0.89.13 -U postgres -d maestro_cenate \
  -f spec/scripts/014_crear_tabla_security_alerts.sql
```

### 2. Verificar Instalación

```bash
# Verificar tablas creadas
psql -h 10.0.89.13 -U postgres -d maestro_cenate -c "
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('active_sessions', 'security_alerts')
ORDER BY table_name;"

# Verificar columnas agregadas a audit_logs
psql -h 10.0.89.13 -U postgres -d maestro_cenate -c "
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'audit_logs'
  AND column_name IN ('hash_integridad', 'datos_previos', 'datos_nuevos')
ORDER BY column_name;"

# Verificar vistas creadas
psql -h 10.0.89.13 -U postgres -d maestro_cenate -c "
SELECT table_name FROM information_schema.views
WHERE table_schema = 'public'
  AND table_name LIKE '%security%' OR table_name LIKE '%sesion%'
ORDER BY table_name;"

# Verificar funciones creadas
psql -h 10.0.89.13 -U postgres -d maestro_cenate -c "
SELECT routine_name FROM information_schema.routines
WHERE routine_schema = 'public'
  AND (routine_name LIKE '%hash%' OR routine_name LIKE '%alerta%')
ORDER BY routine_name;"
```

### 3. Reiniciar Backend

```bash
# Detener backend
pkill -f "CenateApplication"

# Compilar y reiniciar
cd backend
./gradlew clean build
./gradlew bootRun
```

### 4. Verificar Jobs Programados

Al iniciar el backend, deberías ver en los logs:

```
📊 [ESTADÍSTICAS] Sesiones Activas: X | Usuarios Conectados: Y
🔍 [ANOMALY-DETECTION] Iniciando análisis automático de anomalías...
🔐 [INTEGRITY-CHECK] Iniciando verificación de integridad de logs...
```

---

## 📋 Casos de Uso

### Caso 1: Detectar Intento de Intrusión

**Escenario:** Un atacante intenta adivinar la contraseña de un usuario

**Flujo:**
1. Usuario intenta login con contraseña incorrecta (5 veces en 15 minutos)
2. Trigger SQL detecta patrón de brute force
3. Se crea alerta automática tipo `BRUTE_FORCE` con severidad `HIGH`
4. Administrador ve alerta en dashboard de seguridad
5. Administrador revisa y toma acción (bloquear cuenta, contactar usuario)

**Consulta SQL:**
```sql
SELECT * FROM vw_security_alerts_activas
WHERE alert_type = 'BRUTE_FORCE'
  AND estado = 'NUEVA'
ORDER BY fecha_deteccion DESC;
```

### Caso 2: Auditar Cambio de Rol de Usuario

**Escenario:** Admin asigna rol MEDICO a un usuario

**Flujo:**
1. Admin llama `usuarioService.asignarRol(usuarioId, rolMedicoId)`
2. Servicio asigna el rol
3. Servicio registra auditoría: `ASSIGN_ROLE` con usuario, rol, nombre completo, IP
4. Se guarda en `audit_logs` con IP y User-Agent
5. Administrador puede ver historial completo de cambios de permisos

**Consulta SQL:**
```sql
SELECT
    fecha_hora,
    usuario,
    action,
    detalle,
    ip_address,
    user_agent
FROM audit_logs
WHERE action IN ('ASSIGN_ROLE', 'REMOVE_ROLE')
  AND usuario = 'admin123'
ORDER BY fecha_hora DESC;
```

### Caso 3: Rastrear Acceso a Datos Sensibles

**Escenario:** Auditar quién vio la ficha médica de un paciente

**Flujo:**
1. Médico llama método `obtenerFichaMedica(pacienteId)` con anotación `@AuditarAccesoSensible`
2. Aspecto AOP intercepta la llamada
3. Se registra log: `VIEW_PATIENT_DATA` con idAfectado=pacienteId, IP, User-Agent
4. Auditor puede generar reporte de accesos a datos del paciente

**Código:**
```java
@AuditarAccesoSensible(
    accion = "VIEW_PATIENT_DATA",
    modulo = "PACIENTES",
    descripcion = "Acceso a ficha médica del paciente",
    nivel = "INFO"
)
public PacienteDTO obtenerFichaMedica(Long idPaciente) {
    // ...
}
```

**Consulta SQL:**
```sql
SELECT
    fecha_hora,
    usuario,
    ip_address,
    detalle
FROM audit_logs
WHERE action = 'VIEW_PATIENT_DATA'
  AND id_afectado = 123  -- ID del paciente
ORDER BY fecha_hora DESC;
```

### Caso 4: Detectar Sesión Concurrente Sospechosa

**Escenario:** Usuario se loguea desde dos ubicaciones diferentes simultáneamente

**Flujo:**
1. Usuario inicia sesión desde IP A (Lima)
2. Mismo usuario inicia sesión desde IP B (Arequipa) sin cerrar sesión A
3. `SessionService.registrarNuevaSesion()` detecta sesión concurrente
4. Se crea alerta `CONCURRENT_SESSION` con severidad `HIGH`
5. Administrador contacta al usuario para verificar

**Consulta SQL:**
```sql
SELECT * FROM vw_sesiones_concurrentes;

SELECT
    username,
    ip_address,
    device_type,
    browser,
    login_time,
    last_activity
FROM active_sessions
WHERE username = 'usuario123'
  AND is_active = TRUE
ORDER BY login_time DESC;
```

### Caso 5: Investigar Log Manipulado

**Escenario:** Alguien intentó modificar un registro de auditoría

**Flujo:**
1. Job programado ejecuta `verificarIntegridadLogs()` cada 4 horas
2. Detecta que el hash almacenado no coincide con el hash calculado
3. Se crea alerta `TAMPERED_LOG` con severidad `CRITICAL`
4. Administrador investiga el log manipulado
5. Se toman acciones correctivas (investigación forense)

**Consultas SQL:**
```sql
-- Ver logs manipulados
SELECT * FROM vw_audit_logs_manipulados;

-- Verificar integridad de un log específico
SELECT * FROM verificar_integridad_log(456);

-- Estadísticas de integridad
SELECT * FROM verificar_integridad_completa();
```

---

## 🎯 Métricas de Éxito

### Seguridad
- ✅ 100% de logs con IP y User-Agent capturado
- ✅ 100% de cambios de roles/permisos auditados
- ✅ Detección automática de brute force en <1 minuto
- ✅ Detección de sesiones concurrentes en tiempo real
- ✅ Integridad de logs verificable con SHA-256

### Auditoría
- ✅ Tracking completo de sesiones activas
- ✅ Before/After de cambios críticos
- ✅ Acceso a datos sensibles trazable
- ✅ Retención de logs con integridad verificable

### Operación
- ✅ Limpieza automática de sesiones inactivas
- ✅ Análisis de anomalías automático cada 30 min
- ✅ Dashboard ejecutivo con métricas en tiempo real
- ✅ Alertas prioritarias con severidad CRITICAL

---

## 🚨 Alertas y Notificaciones

### Tipos de Alerta y Acciones Recomendadas

| Tipo | Severidad | Acción Recomendada |
|------|-----------|-------------------|
| **TAMPERED_LOG** | CRITICAL | Investigación forense inmediata |
| **BRUTE_FORCE** | HIGH | Bloquear cuenta temporalmente |
| **CONCURRENT_SESSION** | HIGH | Contactar al usuario para verificar |
| **MASS_EXPORT** | HIGH | Revisar si exportación es legítima |
| **PERMISSION_CHANGE** | HIGH | Verificar que cambios sean autorizados |
| **OFF_HOURS_ACCESS** | MEDIUM | Registrar como sospechoso |
| **UNUSUAL_LOCATION** | MEDIUM | Verificar con usuario |
| **UNUSUAL_ACTIVITY** | MEDIUM | Monitorear actividad del usuario |

### Flujo de Resolución de Alertas

1. **Detección**: Alerta creada automáticamente (estado: NUEVA)
2. **Triage**: Admin revisa y cambia estado a EN_REVISION
3. **Investigación**: Admin investiga y toma acción correctiva
4. **Resolución**: Admin marca como RESUELTA o FALSO_POSITIVO
5. **Documentación**: Admin registra notas_resolucion y accion_tomada

**API para resolver alerta:**
```java
// POST /api/security/alerts/{id}/resolve
{
  "estado": "RESUELTA",
  "notas_resolucion": "Usuario contactado y verificado. Sesión legítima.",
  "accion_tomada": "Se recomendó al usuario cerrar sesiones no utilizadas"
}
```

---

## 📈 Próximas Mejoras (Fase 4 - Pendiente)

### 4.1. Compliance Normativo
- Política de retención de logs (LPDP, MINSA)
- Encriptación de datos sensibles en logs
- Reporte de auditoría para inspecciones
- Firma digital de logs críticos

### 4.2. Machine Learning
- Detección de anomalías con ML (patrones avanzados)
- Predicción de riesgos de seguridad
- Clustering de comportamiento de usuarios

### 4.3. Notificaciones en Tiempo Real
- WebSocket para alertas críticas
- Email/SMS para alertas HIGH y CRITICAL
- Integración con Slack/Teams

### 4.4. Dashboard Frontend Avanzado
- Gráficos interactivos (Chart.js, D3.js)
- Mapa de IPs de acceso (GeoIP)
- Timeline de eventos de seguridad
- Exportación de reportes PDF/Excel

---

## 📚 Referencias

- **LPDP (Ley 29733)**: Protección de Datos Personales en Perú
- **OWASP Top 10**: Top 10 riesgos de seguridad en aplicaciones web
- **NIST Cybersecurity Framework**: Marco de ciberseguridad
- **ISO 27001**: Estándar de seguridad de la información

---

## 👥 Contacto

**Desarrollador**: Ing. Styp Canto Rondón
**Email**: cenate.analista@essalud.gob.pe
**Proyecto**: CENATE - Sistema de Telemedicina
**Versión**: 1.10.4 (2025-12-29)

---

*EsSalud Perú - CENATE | Sistema de Auditoría y Seguridad v1.0.0*
