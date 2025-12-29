# Guía Completa del Sistema de Auditoría - CENATE

> Documentación técnica del sistema de auditoría modular del proyecto CENATE

**Versión:** 1.10.4
**Última actualización:** 2025-12-29
**Responsable:** Ing. Styp Canto Rondón

---

## Índice

1. [Arquitectura General](#arquitectura-general)
2. [Tabla Principal: audit_logs](#tabla-principal-audit_logs)
3. [Vista: vw_auditoria_modular_detallada](#vista-vw_auditoria_modular_detallada)
4. [Backend: Servicios de Auditoría](#backend-servicios-de-auditoría)
5. [Frontend: Visualización](#frontend-visualización)
6. [Cómo Auditar Nuevas Acciones](#cómo-auditar-nuevas-acciones)
7. [Mantenimiento y Troubleshooting](#mantenimiento-y-troubleshooting)
8. [Estadísticas y Reportes](#estadísticas-y-reportes)

---

## Arquitectura General

### Flujo Completo de Auditoría

```
┌─────────────────────────────────────────────────────────────────┐
│                        ACCIÓN DEL USUARIO                        │
│              (Login, Crear Usuario, Eliminar, etc.)              │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SERVICE LAYER (Backend)                       │
│  UsuarioServiceImpl / AccountRequestService / AuthService /etc. │
│                                                                  │
│  1. Ejecuta la acción                                           │
│  2. Obtiene usuario del SecurityContext                         │
│  3. Llama a auditar() o AuditLogService                         │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│               AUDITLOGSERVICE.registrarEvento()                  │
│                                                                  │
│  Parámetros:                                                     │
│  - usuario: "44914706" (del SecurityContext)                    │
│  - action: "DELETE_USER"                                        │
│  - modulo: "USUARIOS"                                           │
│  - detalle: "Usuario eliminado: 44444444 (ID: 254)"             │
│  - nivel: "WARNING"                                             │
│  - estado: "SUCCESS"                                            │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                     TABLA: audit_logs                            │
│                     (PostgreSQL)                                 │
│                                                                  │
│  INSERT INTO audit_logs (                                        │
│    usuario, action, modulo, detalle, nivel, estado, fecha_hora  │
│  ) VALUES (                                                      │
│    '44914706', 'DELETE_USER', 'USUARIOS',                       │
│    'Usuario eliminado: 44444444 (ID: 254)',                     │
│    'WARNING', 'SUCCESS', NOW()                                  │
│  );                                                              │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│          VISTA: vw_auditoria_modular_detallada                   │
│                                                                  │
│  SELECT a.*, u.name_user, p.nombre_completo, ...                │
│  FROM audit_logs a                                              │
│  LEFT JOIN dim_usuarios u ON a.usuario = u.name_user           │
│  LEFT JOIN dim_personal_cnt p ON p.id_usuario = u.id_user      │
│  ORDER BY a.fecha_hora DESC;                                    │
│                                                                  │
│  → Enriquece datos con información del usuario                  │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│              API: /api/auditoria/busqueda-avanzada               │
│                  (AuditoriaController)                           │
│                                                                  │
│  GET /api/auditoria/busqueda-avanzada?                          │
│    usuario=44914706&                                            │
│    accion=DELETE_USER&                                          │
│    fechaInicio=2025-12-29                                       │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│               FRONTEND: LogsDelSistema.jsx                       │
│                    (/admin/logs)                                 │
│                                                                  │
│  ┌──────────────────────────────────────────────────┐           │
│  │  Filtros:                                        │           │
│  │  • Usuario: Todos                                │           │
│  │  • Acción: DELETE_USER                          │           │
│  │  • Fecha inicio: 29/12/2025                     │           │
│  │  └─────────────────────────────────────────────┘│           │
│  │                                                  │           │
│  │  Resultados:                                     │           │
│  │  ┌──────────────────────────────────────────┐  │           │
│  │  │ 29/12/2025 12:40:14                      │  │           │
│  │  │ Usuario: Styp Canto Rondón (44914706)    │  │           │
│  │  │ Acción: DELETE_USER                       │  │           │
│  │  │ Detalle: Usuario eliminado: 44444444     │  │           │
│  │  │ Estado: ✅ SUCCESS                        │  │           │
│  │  └──────────────────────────────────────────┘  │           │
│  └──────────────────────────────────────────────────┘           │
└─────────────────────────────────────────────────────────────────┘
```

---

## Tabla Principal: audit_logs

### Estructura de la Tabla

```sql
CREATE TABLE audit_logs (
    id              BIGSERIAL PRIMARY KEY,
    fecha_hora      TIMESTAMP(6) NOT NULL DEFAULT NOW(),
    usuario         VARCHAR(100),              -- Username del usuario autenticado
    modulo          VARCHAR(50),               -- Módulo del sistema
    action          VARCHAR(100),              -- Acción realizada
    estado          VARCHAR(20),               -- SUCCESS / FAILURE
    nivel           VARCHAR(20),               -- INFO / WARNING / ERROR / CRITICAL
    detalle         TEXT,                      -- Descripción detallada
    ip_address      VARCHAR(50),               -- IP del cliente
    user_agent      TEXT,                      -- Navegador/dispositivo
    id_afectado     BIGINT,                    -- ID del registro afectado
    user_id         BIGINT                     -- ID del usuario (para JOINs)
);
```

### Columnas Clave

| Columna | Tipo | Descripción | Ejemplo |
|---------|------|-------------|---------|
| **id** | BIGSERIAL | PK autoincremental | 2757 |
| **fecha_hora** | TIMESTAMP | Timestamp exacto del evento | 2025-12-29 12:40:14.629 |
| **usuario** | VARCHAR(100) | Username del usuario autenticado (del SecurityContext) | "44914706" |
| **modulo** | VARCHAR(50) | Módulo del sistema que genera el log | "USUARIOS", "AUTH", "SOLICITUDES" |
| **action** | VARCHAR(100) | Código de la acción | "DELETE_USER", "LOGIN", "APPROVE_REQUEST" |
| **estado** | VARCHAR(20) | Resultado de la operación | "SUCCESS", "FAILURE" |
| **nivel** | VARCHAR(20) | Nivel de severidad | "INFO", "WARNING", "ERROR", "CRITICAL" |
| **detalle** | TEXT | Descripción legible del evento | "Usuario eliminado: 44444444 (ID: 254)" |
| **ip_address** | VARCHAR(50) | IP del cliente (si está disponible) | "192.168.1.10" |
| **user_agent** | TEXT | Navegador/dispositivo (si está disponible) | "Mozilla/5.0..." |
| **id_afectado** | BIGINT | ID del registro que fue afectado | 254 (ID del usuario eliminado) |
| **user_id** | BIGINT | ID del usuario en dim_usuarios (para JOINs) | 1 |

### Índices Optimizados

```sql
-- Índice por fecha (consultas ordenadas por fecha)
CREATE INDEX idx_audit_logs_fecha ON audit_logs(fecha_hora DESC);

-- Índice por usuario (búsquedas por usuario)
CREATE INDEX idx_audit_logs_usuario ON audit_logs(usuario);

-- Índice por módulo (filtrar por módulo)
CREATE INDEX idx_audit_logs_modulo ON audit_logs(modulo);

-- Índice por acción (filtrar por tipo de acción)
CREATE INDEX idx_audit_logs_action ON audit_logs(action);

-- Índice por nivel (filtrar por nivel: INFO, WARNING, ERROR)
CREATE INDEX idx_audit_logs_nivel ON audit_logs(nivel);

-- Índice por estado (filtrar por SUCCESS, FAILURE)
CREATE INDEX idx_audit_logs_estado ON audit_logs(estado);

-- Índice compuesto para consultas comunes (fecha + módulo)
CREATE INDEX idx_audit_logs_fecha_modulo ON audit_logs(fecha_hora DESC, modulo);

-- Índice compuesto para consultas de usuario + fecha
CREATE INDEX idx_audit_logs_usuario_fecha ON audit_logs(usuario, fecha_hora DESC);
```

---

## Vista: vw_auditoria_modular_detallada

### Propósito

La vista enriquece los registros de `audit_logs` con:
- Datos completos del usuario (DNI, nombre completo, roles)
- Correos electrónicos (corporativo y personal)
- Emojis descriptivos según tipo de evento

### Definición Completa

```sql
CREATE VIEW vw_auditoria_modular_detallada AS
SELECT
    a.id,
    a.fecha_hora,
    TO_CHAR(a.fecha_hora, 'YYYY-MM-DD HH24:MI:SS') as fecha_formateada,
    a.usuario as usuario_sesion,
    u.id_user,
    u.name_user as username,
    COALESCE(p.num_doc_pers, pe.num_doc_ext) as dni,
    COALESCE(
        CONCAT(p.nom_pers, ' ', p.ape_pater_pers, ' ', p.ape_mater_pers),
        CONCAT(pe.nom_ext, ' ', pe.ape_pater_ext, ' ', pe.ape_mater_ext)
    ) as nombre_completo,
    STRING_AGG(DISTINCT r.desc_rol, ', ') as roles,
    COALESCE(p.email_corp_pers, pe.email_corp_ext) as correo_corporativo,
    COALESCE(p.email_pers, pe.email_pers_ext) as correo_personal,
    a.modulo,
    a.action as accion,
    a.estado,
    a.detalle,
    a.ip_address as ip,
    a.user_agent as dispositivo,
    a.id_afectado,
    a.nivel,
    CASE
        WHEN a.action = 'INSERT' THEN '🟢 Creación de registro'
        WHEN a.action = 'UPDATE' THEN '🟡 Modificación de registro'
        WHEN a.action = 'DELETE' THEN '🔴 Eliminación de registro'
        WHEN a.action = 'LOGIN' THEN '🔑 Inicio de sesión'
        WHEN a.action = 'LOGOUT' THEN '🔓 Cierre de sesión'
        WHEN a.action = 'CREATE_USER' THEN '👤 Creación de usuario'
        WHEN a.action = 'DELETE_USER' THEN '🗑️ Eliminación de usuario'
        WHEN a.action = 'ACTIVATE_USER' THEN '✅ Activación de usuario'
        WHEN a.action = 'DEACTIVATE_USER' THEN '⛔ Desactivación de usuario'
        WHEN a.action = 'APPROVE_REQUEST' THEN '✔️ Aprobación de solicitud'
        WHEN a.action = 'REJECT_REQUEST' THEN '❌ Rechazo de solicitud'
        ELSE '⚪ Otro evento'
    END as tipo_evento
FROM audit_logs a
    -- Join por nombre de usuario (para registros de aplicación)
    LEFT JOIN dim_usuarios u ON a.usuario = u.name_user
    LEFT JOIN rel_user_roles ur ON ur.id_user = u.id_user
    LEFT JOIN dim_roles r ON r.id_rol = ur.id_rol
    LEFT JOIN dim_personal_cnt p ON p.id_usuario = u.id_user
    LEFT JOIN dim_personal_externo pe ON pe.id_user = u.id_user
GROUP BY
    a.id, a.fecha_hora, u.id_user, u.name_user,
    p.num_doc_pers, pe.num_doc_ext,
    p.nom_pers, p.ape_pater_pers, p.ape_mater_pers,
    pe.nom_ext, pe.ape_pater_ext, pe.ape_mater_ext,
    p.email_corp_pers, pe.email_corp_ext,
    p.email_pers, pe.email_pers_ext,
    a.modulo, a.action, a.estado, a.detalle,
    a.ip_address, a.user_agent, a.id_afectado, a.nivel
ORDER BY a.fecha_hora DESC;
```

### Columnas Generadas

| Columna Vista | Origen | Descripción |
|---------------|--------|-------------|
| **fecha_formateada** | `TO_CHAR(fecha_hora)` | Fecha legible: "2025-12-29 12:40:14" |
| **usuario_sesion** | `audit_logs.usuario` | Username original del log |
| **nombre_completo** | `CONCAT(nombre, apellidos)` | Nombre completo del usuario |
| **roles** | `STRING_AGG(roles)` | Roles del usuario separados por comas |
| **tipo_evento** | `CASE WHEN action...` | Emoji + descripción del evento |

### ⚠️ IMPORTANTE: Sin Filtros de Módulo

**Problema anterior:** La vista tenía un `WHERE` que filtraba solo 2 módulos específicos.

**Solución (v1.10.4):** Se eliminó completamente el filtro para mostrar **TODOS los módulos**:
```sql
-- ⚠️ SIN FILTRO WHERE - Mostrar TODOS los módulos
```

**Verificación:**
```sql
-- Debe retornar TRUE (ambas tienen la misma cantidad de registros)
SELECT
  (SELECT COUNT(*) FROM audit_logs) = (SELECT COUNT(*) FROM vw_auditoria_modular_detallada)
  AS vista_completa;
```

---

## Backend: Servicios de Auditoría

### 1. AuditLogService (Servicio Principal)

**Ubicación:** `backend/src/main/java/com/styp/cenate/service/auditlog/AuditLogServiceImpl.java`

#### Método Principal: registrarEvento()

```java
@Override
@Transactional
public void registrarEvento(
    String usuario,     // Username del usuario autenticado
    String action,      // Código de acción (DELETE_USER, LOGIN, etc.)
    String modulo,      // Módulo del sistema
    String detalle,     // Descripción legible
    String nivel,       // INFO, WARNING, ERROR, CRITICAL
    String estado       // SUCCESS, FAILURE
) {
    AuditLog logEntity = new AuditLog();
    logEntity.setUsuario(usuario);
    logEntity.setAction(action);
    logEntity.setModulo(modulo);
    logEntity.setDetalle(detalle);
    logEntity.setNivel(nivel);
    logEntity.setEstado(estado);
    logEntity.setFechaHora(LocalDateTime.now());
    auditLogRepository.save(logEntity);

    log.info("📝 [{}] [{}] {}", modulo, action, usuario);
}
```

### 2. Patrón de Implementación en Services

**Ejemplo: UsuarioServiceImpl.java**

#### Paso 1: Inyectar Servicio

```java
@Service
@RequiredArgsConstructor
public class UsuarioServiceImpl implements UsuarioService {

    private final AuditLogService auditLogService;
    // ... otros servicios
}
```

#### Paso 2: Método Helper

```java
/**
 * Registra evento de auditoría capturando el usuario del SecurityContext
 */
private void auditar(String action, String detalle, String nivel, String estado) {
    try {
        String usuario = "SYSTEM";  // Default
        try {
            var auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.getName() != null) {
                usuario = auth.getName();  // 44914706, etc.
            }
        } catch (Exception ignored) {
            // Si no hay SecurityContext, usar "SYSTEM"
        }

        auditLogService.registrarEvento(
            usuario,
            action,
            "USUARIOS",  // Módulo fijo para este servicio
            detalle,
            nivel,
            estado
        );
    } catch (Exception e) {
        log.warn("⚠️ No se pudo registrar auditoría: {}", e.getMessage());
    }
}
```

#### Paso 3: Uso en Métodos de Negocio

```java
@Transactional
public void eliminarUsuario(Long id) {
    // 1. Obtener datos antes de eliminar (para auditoría)
    Usuario usuario = usuarioRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

    String numDocumento = usuario.getNameUser();

    // 2. Ejecutar eliminación (con toda la lógica necesaria)
    // ... eliminar tokens
    // ... eliminar relaciones
    // ... eliminar usuario

    // 3. 🔒 AUDITORÍA
    auditar(
        "DELETE_USER",
        "Usuario eliminado: " + numDocumento + " (ID: " + id + ")",
        "WARNING",     // Nivel de severidad
        "SUCCESS"      // Estado de la operación
    );
}
```

### 3. Servicios con Auditoría Implementada

| Servicio | Acciones Auditadas |
|----------|-------------------|
| **UsuarioServiceImpl** | CREATE_USER, DELETE_USER, ACTIVATE_USER, DEACTIVATE_USER, UNLOCK_USER, UPDATE_USER |
| **AccountRequestService** | APPROVE_REQUEST, REJECT_REQUEST, DELETE_PENDING_USER, CLEANUP_ORPHAN_DATA |
| **AuthenticationServiceImpl** | LOGIN, LOGIN_FAILED, LOGOUT, PASSWORD_CHANGE, PASSWORD_RESET |
| **DisponibilidadServiceImpl** | CREATE_DISPONIBILIDAD, UPDATE_DISPONIBILIDAD, SUBMIT_DISPONIBILIDAD, DELETE_DISPONIBILIDAD, REVIEW_DISPONIBILIDAD |

---

## Frontend: Visualización

### 1. LogsDelSistema.jsx - Panel de Auditoría

**Ubicación:** `frontend/src/pages/LogsDelSistema.jsx`
**Ruta:** `/admin/logs`
**Permiso MBAC:** `/admin/logs` - `ver`

#### Características Principales

**Filtros Avanzados:**
- ✅ Búsqueda general (texto libre)
- ✅ Filtro por usuario (dropdown)
- ✅ Filtro por módulo (dropdown)
- ✅ Filtro por acción (dropdown)
- ✅ Filtro por rango de fechas (inicio y fin)
- ✅ Botón "Limpiar filtros"

**Estadísticas en Tiempo Real:**
```jsx
<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
  <div className="bg-white p-4 rounded-lg shadow">
    <div className="text-2xl font-bold">{stats.total}</div>
    <div className="text-sm text-gray-600">Registros totales</div>
  </div>
  <div className="bg-white p-4 rounded-lg shadow">
    <div className="text-2xl font-bold">{stats.hoy}</div>
    <div className="text-sm text-gray-600">Actividad del día</div>
  </div>
  <div className="bg-white p-4 rounded-lg shadow">
    <div className="text-2xl font-bold">{stats.semana}</div>
    <div className="text-sm text-gray-600">Últimos 7 días</div>
  </div>
  <div className="bg-white p-4 rounded-lg shadow">
    <div className="text-2xl font-bold">{stats.usuariosActivos}</div>
    <div className="text-sm text-gray-600">Usuarios únicos</div>
  </div>
</div>
```

**Tabla de Resultados:**
- Paginación de 20 registros por página
- Ordenamiento por fecha (más reciente primero)
- Indicador de estado (verde=éxito, rojo=fallo)
- Tooltips con información completa del usuario

**Exportación a CSV:**
```javascript
const exportarCSV = () => {
  const headers = ['Fecha', 'Usuario', 'Módulo', 'Acción', 'Detalle', 'Estado'];
  const rows = logs.map(log => [
    log.fechaFormateada,
    log.nombreCompleto || log.usuario,
    log.modulo,
    log.accion,
    log.detalle,
    log.estado
  ]);

  // Generar CSV y descargar
  downloadCSV(headers, rows, 'auditoria_cenate.csv');
};
```

### 2. AdminDashboard.jsx - Actividad Reciente

**Ubicación:** `frontend/src/pages/AdminDashboard.js`
**Ruta:** `/admin/dashboard`

#### Widget de Actividad Reciente

Muestra **8 últimas actividades** en formato ejecutivo:

```jsx
<div className="bg-white rounded-lg shadow p-6">
  <h3 className="text-lg font-semibold mb-4">Actividad Reciente</h3>
  <div className="space-y-3">
    {actividadReciente.map(log => (
      <div key={log.id} className="flex items-start border-b pb-3">
        <div className="flex-shrink-0">
          <span className={log.estado === 'SUCCESS' ? 'text-green-500' : 'text-red-500'}>
            {log.estado === 'SUCCESS' ? '✓' : '✗'}
          </span>
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium">
            {formatAccionEjecutiva(log)}
          </p>
          <p className="text-xs text-gray-500">
            {log.nombreCompleto || log.usuario} • {log.fechaFormateada}
          </p>
        </div>
      </div>
    ))}
  </div>
</div>
```

**Formato Ejecutivo de Acciones:**
```javascript
const formatAccionEjecutiva = (log) => {
  const acciones = {
    'LOGIN': 'Inicio de sesión',
    'LOGIN_FAILED': 'Acceso denegado',
    'LOGOUT': 'Cierre de sesión',
    'CREATE_USER': 'Nuevo usuario creado',
    'DELETE_USER': 'Usuario eliminado',
    'ACTIVATE_USER': 'Usuario activado',
    'DEACTIVATE_USER': 'Usuario desactivado',
    'APPROVE_REQUEST': 'Solicitud aprobada',
    'REJECT_REQUEST': 'Solicitud rechazada',
    'CREATE_DISPONIBILIDAD': 'Disponibilidad creada',
    'SUBMIT_DISPONIBILIDAD': 'Disponibilidad enviada',
    'REVIEW_DISPONIBILIDAD': 'Disponibilidad revisada',
    'PASSWORD_CHANGE': 'Contraseña cambiada',
    'PASSWORD_RESET': 'Contraseña restablecida'
  };

  return acciones[log.accion] || log.accion;
};
```

---

## Cómo Auditar Nuevas Acciones

### Checklist para Agregar Auditoría

#### 1. Definir Código de Acción

```java
// Convención: VERBO_SUSTANTIVO en MAYÚSCULAS
"CREATE_APPOINTMENT"   // Crear cita
"CANCEL_APPOINTMENT"   // Cancelar cita
"ASSIGN_MEDIC"         // Asignar médico
```

#### 2. Implementar en Service

```java
@Service
@RequiredArgsConstructor
public class CitaMedicaService {

    private final AuditLogService auditLogService;

    // Método helper
    private void auditar(String action, String detalle, String nivel, String estado) {
        try {
            String usuario = "SYSTEM";
            var auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.getName() != null) {
                usuario = auth.getName();
            }
            auditLogService.registrarEvento(usuario, action, "CITAS", detalle, nivel, estado);
        } catch (Exception e) {
            log.warn("⚠️ Error en auditoría: {}", e.getMessage());
        }
    }

    // Usar en métodos de negocio
    @Transactional
    public void crearCita(CitaMedicaDTO dto) {
        // 1. Lógica de negocio
        CitaMedica cita = new CitaMedica();
        // ... configurar cita
        citaRepository.save(cita);

        // 2. 🔒 AUDITORÍA
        auditar(
            "CREATE_APPOINTMENT",
            "Cita creada para paciente " + dto.getPacienteNombre() + " con médico " + dto.getMedicoNombre(),
            "INFO",
            "SUCCESS"
        );
    }
}
```

#### 3. Agregar Emoji en Vista SQL (Opcional)

```sql
-- Editar vista vw_auditoria_modular_detallada
WHEN a.action = 'CREATE_APPOINTMENT' THEN '📅 Creación de cita'
WHEN a.action = 'CANCEL_APPOINTMENT' THEN '🚫 Cancelación de cita'
```

Aplicar cambio:
```bash
PGPASSWORD=Essalud2025 psql -h 10.0.89.13 -U postgres -d maestro_cenate \
  -c "ALTER VIEW vw_auditoria_modular_detallada ..."
```

#### 4. Actualizar Frontend (Opcional)

**LogsDelSistema.jsx - Formato ejecutivo:**
```javascript
const formatAccionEjecutiva = (log) => {
  const acciones = {
    // ... acciones existentes
    'CREATE_APPOINTMENT': 'Cita médica creada',
    'CANCEL_APPOINTMENT': 'Cita médica cancelada'
  };
  return acciones[log.accion] || log.accion;
};
```

---

## Mantenimiento y Troubleshooting

### Consultas SQL Útiles

#### Ver Logs Recientes
```sql
SELECT * FROM audit_logs
ORDER BY fecha_hora DESC
LIMIT 20;
```

#### Contar Logs por Módulo
```sql
SELECT modulo, COUNT(*) as total
FROM audit_logs
GROUP BY modulo
ORDER BY total DESC;
```

#### Contar Logs por Acción
```sql
SELECT action, COUNT(*) as total
FROM audit_logs
GROUP BY action
ORDER BY total DESC;
```

#### Usuarios Más Activos (Última Semana)
```sql
SELECT usuario, COUNT(*) as acciones
FROM audit_logs
WHERE fecha_hora > NOW() - INTERVAL '7 days'
  AND usuario NOT IN ('SYSTEM', 'backend_user')
GROUP BY usuario
ORDER BY acciones DESC
LIMIT 10;
```

#### Eventos de Error Recientes
```sql
SELECT * FROM audit_logs
WHERE nivel IN ('ERROR', 'CRITICAL')
  OR estado = 'FAILURE'
ORDER BY fecha_hora DESC
LIMIT 20;
```

#### Eventos por Día (Últimos 30 Días)
```sql
SELECT DATE(fecha_hora) as dia, COUNT(*) as eventos
FROM audit_logs
WHERE fecha_hora > NOW() - INTERVAL '30 days'
GROUP BY dia
ORDER BY dia DESC;
```

#### Verificar Completitud de la Vista
```sql
-- Debe retornar el mismo número
SELECT
  (SELECT COUNT(*) FROM audit_logs) as tabla,
  (SELECT COUNT(*) FROM vw_auditoria_modular_detallada) as vista;
```

### Troubleshooting Común

#### Problema: Usuario aparece como "SYSTEM"

**Causa:** SecurityContext no disponible al momento de registrar auditoría.

**Verificar:**
```java
// En el método donde se llama auditar()
Authentication auth = SecurityContextHolder.getContext().getAuthentication();
System.out.println("Auth: " + auth);
System.out.println("Username: " + (auth != null ? auth.getName() : "null"));
```

**Soluciones:**
1. Asegurar que el método esté dentro de un contexto de seguridad (@Transactional)
2. Verificar que el filtro JWT está procesando correctamente
3. Si es un proceso asíncrono, pasar el usuario como parámetro explícito

#### Problema: Vista no muestra todos los logs

**Causa:** Filtro WHERE en la vista (problema ya resuelto en v1.10.4).

**Verificar:**
```sql
-- Ver definición de la vista
SELECT pg_get_viewdef('vw_auditoria_modular_detallada', true);

-- Buscar si tiene WHERE
-- Debe decir: "... GROUP BY ... ORDER BY ..." SIN WHERE antes del GROUP BY
```

**Solución:** Aplicar script `009_fix_vista_auditoria_completa.sql`

#### Problema: Frontend no actualiza

**Causa:** Caché del navegador o datos antiguos en estado.

**Soluciones:**
1. Hard refresh: Ctrl+Shift+R (Windows) o Cmd+Shift+R (Mac)
2. Abrir en ventana privada/incógnito
3. Limpiar localStorage:
   ```javascript
   localStorage.clear();
   location.reload();
   ```

### Limpieza de Logs Antiguos

**⚠️ IMPORTANTE:** Ejecutar solo en mantenimiento programado.

```sql
-- Limpiar logs mayores a 90 días
DELETE FROM audit_logs
WHERE fecha_hora < NOW() - INTERVAL '90 days';

-- Contar registros por mes (para planificar limpieza)
SELECT
    TO_CHAR(fecha_hora, 'YYYY-MM') as mes,
    COUNT(*) as registros
FROM audit_logs
GROUP BY mes
ORDER BY mes DESC;
```

**Recomendación:** Crear un job programado (cron) para limpieza automática:
```bash
# Crontab: Primer día de cada mes a las 2:00 AM
0 2 1 * * PGPASSWORD=Essalud2025 psql -h 10.0.89.13 -U postgres -d maestro_cenate \
  -c "DELETE FROM audit_logs WHERE fecha_hora < NOW() - INTERVAL '90 days';"
```

---

## Estadísticas y Reportes

### Análisis de Seguridad

#### Intentos de Login Fallidos
```sql
SELECT
    usuario,
    COUNT(*) as intentos_fallidos,
    MAX(fecha_hora) as ultimo_intento,
    STRING_AGG(DISTINCT ip_address, ', ') as ips
FROM audit_logs
WHERE action = 'LOGIN_FAILED'
  AND fecha_hora > NOW() - INTERVAL '24 hours'
GROUP BY usuario
HAVING COUNT(*) >= 3
ORDER BY intentos_fallidos DESC;
```

#### Eliminaciones de Usuarios
```sql
SELECT
    fecha_formateada,
    usuario_sesion as quien_elimino,
    nombre_completo as quien_elimino_nombre,
    detalle as que_elimino
FROM vw_auditoria_modular_detallada
WHERE accion = 'DELETE_USER'
ORDER BY fecha_hora DESC
LIMIT 50;
```

### Análisis de Actividad

#### Top 10 Usuarios Más Activos
```sql
SELECT
    usuario_sesion,
    nombre_completo,
    COUNT(*) as total_acciones,
    COUNT(DISTINCT modulo) as modulos_usados,
    MAX(fecha_hora) as ultima_actividad
FROM vw_auditoria_modular_detallada
WHERE fecha_hora > NOW() - INTERVAL '30 days'
  AND usuario_sesion NOT IN ('SYSTEM', 'backend_user')
GROUP BY usuario_sesion, nombre_completo
ORDER BY total_acciones DESC
LIMIT 10;
```

#### Actividad por Hora del Día
```sql
SELECT
    EXTRACT(HOUR FROM fecha_hora) as hora,
    COUNT(*) as eventos
FROM audit_logs
WHERE fecha_hora > NOW() - INTERVAL '7 days'
GROUP BY hora
ORDER BY hora;
```

---

## Acciones Estandarizadas

### Módulo: AUTH
- `LOGIN` - Inicio de sesión exitoso (INFO/SUCCESS)
- `LOGIN_FAILED` - Intento de login fallido (WARNING/FAILURE)
- `LOGOUT` - Cierre de sesión (INFO/SUCCESS)
- `PASSWORD_CHANGE` - Cambio de contraseña (WARNING/SUCCESS)
- `PASSWORD_RESET` - Recuperación de contraseña (WARNING/SUCCESS)

### Módulo: USUARIOS
- `CREATE_USER` - Creación de usuario (INFO/SUCCESS)
- `UPDATE_USER` - Actualización de datos de usuario (INFO/SUCCESS)
- `DELETE_USER` - Eliminación de usuario (WARNING/SUCCESS)
- `ACTIVATE_USER` - Activación de cuenta (INFO/SUCCESS)
- `DEACTIVATE_USER` - Desactivación de cuenta (WARNING/SUCCESS)
- `UNLOCK_USER` - Desbloqueo de cuenta (WARNING/SUCCESS)

### Módulo: SOLICITUDES
- `APPROVE_REQUEST` - Aprobación de solicitud de registro (INFO/SUCCESS)
- `REJECT_REQUEST` - Rechazo de solicitud de registro (WARNING/SUCCESS)
- `DELETE_PENDING_USER` - Eliminación de solicitud pendiente (WARNING/SUCCESS)
- `CLEANUP_ORPHAN_DATA` - Limpieza de datos huérfanos (ERROR/SUCCESS)

### Módulo: DISPONIBILIDAD
- `CREATE_DISPONIBILIDAD` - Creación de disponibilidad médica (INFO/SUCCESS)
- `UPDATE_DISPONIBILIDAD` - Actualización de disponibilidad (INFO/SUCCESS)
- `SUBMIT_DISPONIBILIDAD` - Envío de disponibilidad para revisión (INFO/SUCCESS)
- `DELETE_DISPONIBILIDAD` - Eliminación de disponibilidad (WARNING/SUCCESS)
- `REVIEW_DISPONIBILIDAD` - Revisión de disponibilidad (INFO/SUCCESS)
- `ADJUST_DISPONIBILIDAD` - Ajuste de turno por coordinador (WARNING/SUCCESS)

### Niveles de Severidad

| Nivel | Cuándo Usar | Ejemplos |
|-------|-------------|----------|
| **INFO** | Operaciones normales del sistema | LOGIN, CREATE_USER, UPDATE_USER |
| **WARNING** | Acciones que requieren atención | DELETE_USER, PASSWORD_RESET, REJECT_REQUEST |
| **ERROR** | Errores controlados del sistema | LOGIN_FAILED, VALIDATION_ERROR |
| **CRITICAL** | Fallos graves que requieren intervención inmediata | SECURITY_BREACH, DATA_CORRUPTION |

---

## Scripts de Mantenimiento

### Script 001: Vista e Índices Iniciales
**Archivo:** `spec/scripts/001_audit_view_and_indexes.sql`
**Descripción:** Creación inicial de vista e índices
**Nota:** OBSOLETO - Contenía filtro WHERE erróneo

### Script 002: Renombrar Menú
**Archivo:** `spec/scripts/002_rename_logs_to_auditoria.sql`
**Descripción:** Cambiar título de menú de "Logs del Sistema" a "Auditoría"

### Script 009: Fix Vista Completa (ACTUAL)
**Archivo:** `spec/scripts/009_fix_vista_auditoria_completa.sql`
**Descripción:** Elimina filtro WHERE para mostrar TODOS los módulos
**Fecha:** 2025-12-29

**Aplicar:**
```bash
PGPASSWORD=Essalud2025 psql -h 10.0.89.13 -U postgres -d maestro_cenate \
  -f spec/scripts/009_fix_vista_auditoria_completa.sql
```

---

## Conclusión

El sistema de auditoría de CENATE proporciona:

✅ **Trazabilidad completa** - Quién, qué, cuándo y desde dónde
✅ **Cumplimiento normativo** - Registro de todas las acciones sensibles
✅ **Análisis de seguridad** - Detección de patrones anómalos
✅ **Reportes ejecutivos** - Estadísticas y tendencias
✅ **Performance optimizado** - Índices para consultas rápidas
✅ **Escalable** - Diseño modular fácil de extender

Para mantener el sistema actualizado y funcionando correctamente:
1. Verificar periódicamente la integridad de la vista
2. Limpiar logs antiguos (>90 días)
3. Revisar logs de error (nivel ERROR/CRITICAL)
4. Monitorear intentos de login fallidos
5. Analizar actividad de usuarios con privilegios elevados

---

**Responsable Técnico:** Ing. Styp Canto Rondón
**Email:** cenate.analista@essalud.gob.pe
**Sistema:** cenateinformatica@gmail.com

*EsSalud Perú - CENATE | Centro Nacional de Telemedicina*
