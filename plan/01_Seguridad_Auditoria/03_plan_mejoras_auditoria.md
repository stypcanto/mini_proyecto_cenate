# Plan de Mejoras - Auditoría y Seguridad CENATE

> Roadmap de mejoras para el sistema de auditoría y controles de acceso

**Versión:** 1.0.0
**Fecha:** 2025-12-29
**Responsable:** Ing. Styp Canto Rondón

---

## Índice

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Fase 1: Mejoras Críticas (Inmediato)](#fase-1-mejoras-críticas-inmediato)
3. [Fase 2: Mejoras Importantes (Corto Plazo)](#fase-2-mejoras-importantes-corto-plazo)
4. [Fase 3: Mejoras Avanzadas (Mediano Plazo)](#fase-3-mejoras-avanzadas-mediano-plazo)
5. [Fase 4: Compliance y Cumplimiento Normativo](#fase-4-compliance-y-cumplimiento-normativo)

---

## Resumen Ejecutivo

### Brechas Identificadas

| Prioridad | Brecha | Impacto | Esfuerzo |
|-----------|--------|---------|----------|
| 🔴 **CRÍTICA** | Falta auditoría de cambios en permisos MBAC | Alto | Medio |
| 🔴 **CRÍTICA** | Datos de contexto incompletos (IP, user-agent) | Alto | Bajo |
| 🔴 **CRÍTICA** | Sin protección de integridad de logs | Muy Alto | Alto |
| 🔴 **CRÍTICA** | Sin auditoría de acceso a datos sensibles | Alto | Medio |
| 🟡 **ALTA** | Sin detección de anomalías | Medio | Alto |
| 🟡 **ALTA** | Estrategia de retención insuficiente | Medio | Medio |
| 🟡 **ALTA** | Falta auditoría de sesiones | Medio | Bajo |
| 🟢 **MEDIA** | Sin alertas automáticas | Bajo | Alto |

---

## Fase 1: Mejoras Críticas (Inmediato)

### 1.1 Auditoría de Cambios en Permisos MBAC

#### Problema
No se registra cuando se modifican permisos de roles o se asignan/remueven roles a usuarios.

#### Solución

**A. Nuevas acciones a auditar:**

```java
// Módulo: PERMISOS
"ASSIGN_ROLE"       // Asignar rol a usuario
"REMOVE_ROLE"       // Remover rol de usuario
"CREATE_ROLE"       // Crear nuevo rol
"DELETE_ROLE"       // Eliminar rol
"UPDATE_ROLE"       // Modificar rol

// Módulo: MBAC
"GRANT_PERMISSION"  // Otorgar permiso a rol
"REVOKE_PERMISSION" // Revocar permiso de rol
"UPDATE_PERMISSION" // Modificar permiso
```

**B. Implementación en UsuarioServiceImpl:**

```java
@Transactional
public void asignarRol(Long idUsuario, Long idRol) {
    Usuario usuario = usuarioRepository.findById(idUsuario)
        .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

    Rol rol = rolRepository.findById(idRol)
        .orElseThrow(() -> new ResourceNotFoundException("Rol no encontrado"));

    // Verificar si ya tiene el rol
    if (usuario.getRoles().contains(rol)) {
        throw new IllegalStateException("Usuario ya tiene este rol");
    }

    // Asignar rol
    usuario.getRoles().add(rol);
    usuarioRepository.save(usuario);

    // 🔒 AUDITORÍA
    auditar(
        "ASSIGN_ROLE",
        String.format("Rol '%s' asignado a usuario %s (%s)",
            rol.getDescRol(),
            usuario.getNameUser(),
            usuario.getPersonalCnt() != null
                ? usuario.getPersonalCnt().getNombreCompleto()
                : "N/A"
        ),
        "WARNING",  // Cambio de permisos es crítico
        "SUCCESS"
    );
}

@Transactional
public void removerRol(Long idUsuario, Long idRol) {
    Usuario usuario = usuarioRepository.findById(idUsuario)
        .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

    Rol rol = rolRepository.findById(idRol)
        .orElseThrow(() -> new ResourceNotFoundException("Rol no encontrado"));

    // Remover rol
    usuario.getRoles().remove(rol);
    usuarioRepository.save(usuario);

    // 🔒 AUDITORÍA
    auditar(
        "REMOVE_ROLE",
        String.format("Rol '%s' removido de usuario %s (%s)",
            rol.getDescRol(),
            usuario.getNameUser(),
            usuario.getPersonalCnt() != null
                ? usuario.getPersonalCnt().getNombreCompleto()
                : "N/A"
        ),
        "WARNING",
        "SUCCESS"
    );
}
```

**C. Script SQL para agregar al CASE de la vista:**

```sql
-- Agregar a vw_auditoria_modular_detallada
WHEN a.action = 'ASSIGN_ROLE' THEN '🔑 Asignación de rol'
WHEN a.action = 'REMOVE_ROLE' THEN '🔓 Remoción de rol'
WHEN a.action = 'CREATE_ROLE' THEN '➕ Creación de rol'
WHEN a.action = 'DELETE_ROLE' THEN '➖ Eliminación de rol'
WHEN a.action = 'GRANT_PERMISSION' THEN '✅ Permiso otorgado'
WHEN a.action = 'REVOKE_PERMISSION' THEN '❌ Permiso revocado'
```

**Esfuerzo:** 2-3 horas
**Beneficio:** Alto - Cumplimiento normativo y trazabilidad de privilegios

---

### 1.2 Captura de Datos de Contexto (IP + User-Agent)

#### Problema
Las columnas `ip_address` y `user_agent` existen pero no se llenan.

#### Solución

**A. Crear clase de utilidad para capturar contexto HTTP:**

```java
package com.styp.cenate.util;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Component
public class RequestContextUtil {

    /**
     * Obtiene la IP real del cliente (considerando proxies)
     */
    public static String getClientIp() {
        try {
            ServletRequestAttributes attributes =
                (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();

            if (attributes == null) {
                return "INTERNAL";
            }

            HttpServletRequest request = attributes.getRequest();

            // Intentar obtener IP real desde headers (si hay proxy/load balancer)
            String ip = request.getHeader("X-Forwarded-For");
            if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
                ip = request.getHeader("X-Real-IP");
            }
            if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
                ip = request.getRemoteAddr();
            }

            // Si hay múltiples IPs (proxy chain), tomar la primera
            if (ip != null && ip.contains(",")) {
                ip = ip.split(",")[0].trim();
            }

            return ip != null ? ip : "UNKNOWN";
        } catch (Exception e) {
            return "ERROR";
        }
    }

    /**
     * Obtiene el User-Agent del navegador/dispositivo
     */
    public static String getUserAgent() {
        try {
            ServletRequestAttributes attributes =
                (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();

            if (attributes == null) {
                return "INTERNAL";
            }

            HttpServletRequest request = attributes.getRequest();
            String userAgent = request.getHeader("User-Agent");

            return userAgent != null ? userAgent : "UNKNOWN";
        } catch (Exception e) {
            return "ERROR";
        }
    }

    /**
     * Obtiene contexto completo para auditoría
     */
    public static AuditContext getAuditContext() {
        return new AuditContext(getClientIp(), getUserAgent());
    }

    public static class AuditContext {
        private final String ip;
        private final String userAgent;

        public AuditContext(String ip, String userAgent) {
            this.ip = ip;
            this.userAgent = userAgent;
        }

        public String getIp() { return ip; }
        public String getUserAgent() { return userAgent; }
    }
}
```

**B. Actualizar AuditLogServiceImpl:**

```java
@Override
@Transactional
public void registrarEvento(
    String usuario,
    String action,
    String modulo,
    String detalle,
    String nivel,
    String estado
) {
    AuditLog logEntity = new AuditLog();
    logEntity.setUsuario(usuario);
    logEntity.setAction(action);
    logEntity.setModulo(modulo);
    logEntity.setDetalle(detalle);
    logEntity.setNivel(nivel);
    logEntity.setEstado(estado);
    logEntity.setFechaHora(LocalDateTime.now());

    // 🆕 CAPTURAR CONTEXTO HTTP
    try {
        RequestContextUtil.AuditContext context = RequestContextUtil.getAuditContext();
        logEntity.setIpAddress(context.getIp());
        logEntity.setUserAgent(context.getUserAgent());
    } catch (Exception e) {
        log.debug("No se pudo capturar contexto HTTP: {}", e.getMessage());
        logEntity.setIpAddress("INTERNAL");
        logEntity.setUserAgent("SYSTEM");
    }

    auditLogRepository.save(logEntity);
    log.info("📝 [{}] [{}] {} desde {}", modulo, action, usuario, logEntity.getIpAddress());
}
```

**C. Actualizar vista para mostrar IP y dispositivo:**

La vista ya tiene estas columnas, solo necesitas verificar que se muestren en el frontend.

**Frontend - LogsDelSistema.jsx - Agregar columnas:**

```jsx
// Agregar a la tabla de resultados
<td className="px-6 py-4 text-sm text-gray-500">
  {log.ip || 'N/A'}
</td>
<td className="px-6 py-4 text-sm text-gray-500" title={log.dispositivo}>
  {log.dispositivo
    ? log.dispositivo.substring(0, 50) + '...'
    : 'N/A'}
</td>
```

**Esfuerzo:** 1-2 horas
**Beneficio:** Alto - Detección de accesos remotos sospechosos

---

### 1.3 Protección de Integridad de Logs (Tabla Inmutable)

#### Problema
Los registros de auditoría pueden ser modificados o eliminados por usuarios con acceso a la base de datos.

#### Solución

**A. Agregar hash de integridad a cada registro:**

```sql
-- Agregar columna para hash de integridad
ALTER TABLE audit_logs
ADD COLUMN hash_integridad VARCHAR(64);

-- Agregar índice
CREATE INDEX idx_audit_logs_hash ON audit_logs(hash_integridad);
```

**B. Crear función PostgreSQL para generar hash:**

```sql
-- Función para calcular hash SHA-256 de un registro
CREATE OR REPLACE FUNCTION audit_logs_calculate_hash(p_id BIGINT)
RETURNS VARCHAR(64)
LANGUAGE plpgsql
AS $$
DECLARE
    v_hash VARCHAR(64);
BEGIN
    SELECT encode(
        digest(
            CONCAT(
                id::TEXT,
                fecha_hora::TEXT,
                usuario,
                modulo,
                action,
                estado,
                detalle,
                'SECRET_SALT_CENATE_2025'  -- Salt secreto
            ),
            'sha256'
        ),
        'hex'
    ) INTO v_hash
    FROM audit_logs
    WHERE id = p_id;

    RETURN v_hash;
END;
$$;
```

**C. Trigger para calcular hash automáticamente:**

```sql
-- Trigger para calcular hash al insertar
CREATE OR REPLACE FUNCTION audit_logs_set_hash()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Esperar a que el ID esté asignado
    IF NEW.id IS NOT NULL THEN
        NEW.hash_integridad := encode(
            digest(
                CONCAT(
                    NEW.id::TEXT,
                    NEW.fecha_hora::TEXT,
                    COALESCE(NEW.usuario, ''),
                    COALESCE(NEW.modulo, ''),
                    COALESCE(NEW.action, ''),
                    COALESCE(NEW.estado, ''),
                    COALESCE(NEW.detalle, ''),
                    'SECRET_SALT_CENATE_2025'
                ),
                'sha256'
            ),
            'hex'
        );
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_audit_logs_hash
BEFORE INSERT ON audit_logs
FOR EACH ROW
EXECUTE FUNCTION audit_logs_set_hash();
```

**D. Función para verificar integridad:**

```sql
-- Función para verificar si un registro fue alterado
CREATE OR REPLACE FUNCTION audit_logs_verify_integrity(p_id BIGINT)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
    v_hash_stored VARCHAR(64);
    v_hash_calculated VARCHAR(64);
BEGIN
    -- Obtener hash guardado
    SELECT hash_integridad INTO v_hash_stored
    FROM audit_logs
    WHERE id = p_id;

    -- Calcular hash actual
    v_hash_calculated := audit_logs_calculate_hash(p_id);

    -- Comparar
    RETURN (v_hash_stored = v_hash_calculated);
END;
$$;

-- Consulta para detectar registros alterados
SELECT id, fecha_hora, usuario, action, modulo
FROM audit_logs
WHERE NOT audit_logs_verify_integrity(id)
ORDER BY fecha_hora DESC;
```

**E. Permisos restrictivos:**

```sql
-- Solo permitir INSERT en audit_logs, NO UPDATE ni DELETE
REVOKE UPDATE, DELETE ON audit_logs FROM cenate_app_user;
GRANT SELECT, INSERT ON audit_logs TO cenate_app_user;

-- Crear rol de solo lectura para consultas
CREATE ROLE audit_reader;
GRANT SELECT ON audit_logs TO audit_reader;
GRANT SELECT ON vw_auditoria_modular_detallada TO audit_reader;
```

**Esfuerzo:** 3-4 horas
**Beneficio:** Muy Alto - Cumplimiento normativo (no repudio)

---

### 1.4 Auditoría de Acceso a Datos Sensibles

#### Problema
No se registra cuando se visualizan datos de pacientes, historia clínica, o se exportan datos.

#### Solución

**A. Nuevas acciones a auditar:**

```java
// Módulo: PACIENTES
"VIEW_PATIENT_DETAILS"     // Ver detalles de paciente
"VIEW_CLINICAL_HISTORY"    // Ver historia clínica
"EXPORT_PATIENT_DATA"      // Exportar datos de paciente
"SEARCH_PATIENTS"          // Búsqueda de pacientes (registrar query)

// Módulo: REPORTES
"EXPORT_CSV"               // Exportar reporte CSV
"EXPORT_PDF"               // Exportar reporte PDF
"EXPORT_EXCEL"             // Exportar reporte Excel
"VIEW_REPORT"              // Visualizar reporte

// Módulo: DATOS_SENSIBLES
"VIEW_PERSONAL_DATA"       // Ver datos personales completos
"VIEW_MEDICAL_DATA"        // Ver datos médicos
```

**B. Implementación en Controllers:**

```java
@RestController
@RequestMapping("/api/pacientes")
@RequiredArgsConstructor
public class PacienteController {

    private final PacienteService pacienteService;
    private final AuditLogService auditLogService;

    @GetMapping("/{id}")
    @CheckMBACPermission(pagina = "/pacientes", accion = "ver")
    public ResponseEntity<PacienteDTO> obtenerPaciente(@PathVariable Long id) {
        PacienteDTO paciente = pacienteService.obtenerPorId(id);

        // 🔒 AUDITORÍA DE ACCESO A DATOS SENSIBLES
        auditarAccesoSensible(
            "VIEW_PATIENT_DETAILS",
            String.format("Acceso a datos de paciente ID: %d, DNI: %s, Nombre: %s",
                id,
                paciente.getNumeroDocumento(),
                paciente.getNombreCompleto()
            ),
            "INFO",
            id
        );

        return ResponseEntity.ok(paciente);
    }

    @PostMapping("/buscar")
    @CheckMBACPermission(pagina = "/pacientes", accion = "ver")
    public ResponseEntity<List<PacienteDTO>> buscarPacientes(
        @RequestBody BusquedaPacienteDTO busqueda
    ) {
        List<PacienteDTO> resultados = pacienteService.buscar(busqueda);

        // 🔒 AUDITORÍA DE BÚSQUEDA
        auditarAccesoSensible(
            "SEARCH_PATIENTS",
            String.format("Búsqueda de pacientes: query='%s', criterio='%s', resultados=%d",
                busqueda.getQuery(),
                busqueda.getCriterio(),
                resultados.size()
            ),
            "INFO",
            null
        );

        return ResponseEntity.ok(resultados);
    }

    private void auditarAccesoSensible(String action, String detalle, String nivel, Long idAfectado) {
        try {
            String usuario = SecurityContextHolder.getContext()
                .getAuthentication().getName();

            AuditLog log = new AuditLog();
            log.setUsuario(usuario);
            log.setAction(action);
            log.setModulo("PACIENTES");
            log.setDetalle(detalle);
            log.setNivel(nivel);
            log.setEstado("SUCCESS");
            log.setIdAfectado(idAfectado);
            log.setFechaHora(LocalDateTime.now());

            // Capturar contexto
            RequestContextUtil.AuditContext context = RequestContextUtil.getAuditContext();
            log.setIpAddress(context.getIp());
            log.setUserAgent(context.getUserAgent());

            auditLogService.save(log);
        } catch (Exception e) {
            log.warn("⚠️ Error en auditoría: {}", e.getMessage());
        }
    }
}
```

**C. Auditoría de exportaciones:**

```java
@GetMapping("/export/csv")
@CheckMBACPermission(pagina = "/admin/logs", accion = "exportar")
public ResponseEntity<byte[]> exportarCSV(@RequestParam Map<String, String> filtros) {
    byte[] csvData = auditoriaService.exportarCSV(filtros);

    // 🔒 AUDITORÍA DE EXPORTACIÓN
    auditar(
        "EXPORT_CSV",
        String.format("Exportación de auditoría a CSV. Filtros: %s, Registros: %d",
            filtros.toString(),
            csvData.length
        ),
        "WARNING",  // Exportación es acción sensible
        "SUCCESS"
    );

    return ResponseEntity.ok()
        .header("Content-Disposition", "attachment; filename=auditoria.csv")
        .body(csvData);
}
```

**Esfuerzo:** 4-6 horas (depende de cuántos módulos tienen datos sensibles)
**Beneficio:** Muy Alto - Cumplimiento LOPD, GDPR, normativas de salud

---

## Fase 2: Mejoras Importantes (Corto Plazo)

### 2.1 Auditoría de Sesiones

#### Problema
No se registra inicio/fin de sesión con suficiente detalle, ni se detectan sesiones concurrentes.

#### Solución

**A. Crear tabla de sesiones activas:**

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

    -- Metadata
    device_type     VARCHAR(50),  -- 'DESKTOP', 'MOBILE', 'TABLET'
    browser         VARCHAR(50),  -- 'CHROME', 'FIREFOX', etc.
    os              VARCHAR(50),  -- 'WINDOWS', 'LINUX', 'ANDROID', etc.

    CONSTRAINT fk_active_sessions_user
        FOREIGN KEY (user_id) REFERENCES dim_usuarios(id_user)
);

-- Índices
CREATE INDEX idx_active_sessions_username ON active_sessions(username);
CREATE INDEX idx_active_sessions_active ON active_sessions(is_active);
CREATE INDEX idx_active_sessions_login_time ON active_sessions(login_time DESC);
```

**B. Actualizar AuthenticationServiceImpl:**

```java
@Override
public AuthenticationResponseDTO login(AuthenticationRequestDTO request) {
    try {
        // Autenticación existente...
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getNumeroDocumento(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        Usuario usuario = (Usuario) authentication.getPrincipal();
        String token = jwtUtil.generateToken(usuario);

        // 🆕 REGISTRAR SESIÓN ACTIVA
        String sessionId = UUID.randomUUID().toString();
        ActiveSession session = new ActiveSession();
        session.setSessionId(sessionId);
        session.setUserId(usuario.getIdUser());
        session.setUsername(usuario.getNameUser());

        RequestContextUtil.AuditContext context = RequestContextUtil.getAuditContext();
        session.setIpAddress(context.getIp());
        session.setUserAgent(context.getUserAgent());

        // Parsear User-Agent para extraer device, browser, OS
        UserAgentInfo uaInfo = parseUserAgent(context.getUserAgent());
        session.setDeviceType(uaInfo.getDeviceType());
        session.setBrowser(uaInfo.getBrowser());
        session.setOs(uaInfo.getOs());

        activeSessionRepository.save(session);

        // 🔒 AUDITORÍA MEJORADA DE LOGIN
        auditLogService.registrarEvento(
            usuario.getNameUser(),
            "LOGIN",
            "AUTH",
            String.format("Login exitoso desde %s (%s, %s, %s). Session ID: %s",
                session.getIpAddress(),
                uaInfo.getBrowser(),
                uaInfo.getOs(),
                uaInfo.getDeviceType(),
                sessionId
            ),
            "INFO",
            "SUCCESS"
        );

        // Verificar sesiones concurrentes
        detectarSesionesConcurrentes(usuario.getNameUser(), sessionId);

        return AuthenticationResponseDTO.builder()
            .token(token)
            .sessionId(sessionId)  // Incluir en respuesta
            .build();

    } catch (BadCredentialsException e) {
        // Auditoría de fallo...
    }
}

private void detectarSesionesConcurrentes(String username, String currentSessionId) {
    List<ActiveSession> activeSessions = activeSessionRepository
        .findByUsernameAndIsActiveTrue(username);

    if (activeSessions.size() > 1) {
        // 🔒 ALERTA DE SESIÓN CONCURRENTE
        auditLogService.registrarEvento(
            username,
            "CONCURRENT_SESSION_DETECTED",
            "SECURITY",
            String.format("Sesión concurrente detectada. Usuario tiene %d sesiones activas. IPs: %s",
                activeSessions.size(),
                activeSessions.stream()
                    .map(ActiveSession::getIpAddress)
                    .collect(Collectors.joining(", "))
            ),
            "WARNING",
            "SUCCESS"
        );
    }
}

@Override
public void logout(String sessionId) {
    activeSessionRepository.findBySessionId(sessionId).ifPresent(session -> {
        session.setIsActive(false);
        session.setLogoutTime(LocalDateTime.now());
        activeSessionRepository.save(session);

        // 🔒 AUDITORÍA DE LOGOUT
        Duration sessionDuration = Duration.between(
            session.getLoginTime(),
            session.getLogoutTime()
        );

        auditLogService.registrarEvento(
            session.getUsername(),
            "LOGOUT",
            "AUTH",
            String.format("Logout. Duración de sesión: %d minutos",
                sessionDuration.toMinutes()
            ),
            "INFO",
            "SUCCESS"
        );
    });
}
```

**C. Job para detectar sesiones inactivas:**

```java
@Component
@Slf4j
public class SessionCleanupJob {

    @Autowired
    private ActiveSessionRepository activeSessionRepository;

    @Autowired
    private AuditLogService auditLogService;

    // Ejecutar cada 15 minutos
    @Scheduled(fixedRate = 900000)
    public void limpiarSesionesInactivas() {
        LocalDateTime timeoutThreshold = LocalDateTime.now().minusMinutes(30);

        List<ActiveSession> inactiveSessions = activeSessionRepository
            .findByIsActiveTrueAndLastActivityBefore(timeoutThreshold);

        for (ActiveSession session : inactiveSessions) {
            session.setIsActive(false);
            session.setLogoutTime(LocalDateTime.now());
            activeSessionRepository.save(session);

            // 🔒 AUDITORÍA DE TIMEOUT
            auditLogService.registrarEvento(
                session.getUsername(),
                "SESSION_TIMEOUT",
                "AUTH",
                String.format("Sesión cerrada por inactividad (>30 min). Session ID: %s",
                    session.getSessionId()
                ),
                "INFO",
                "SUCCESS"
            );
        }

        if (!inactiveSessions.isEmpty()) {
            log.info("🧹 Limpiadas {} sesiones inactivas", inactiveSessions.size());
        }
    }
}
```

**Esfuerzo:** 6-8 horas
**Beneficio:** Alto - Detección de sesiones sospechosas y hijacking

---

### 2.2 Tracking de Cambios (Before/After)

#### Problema
Al modificar registros, no se guarda el estado previo, solo "Usuario actualizado".

#### Solución

**A. Agregar columna para datos previos:**

```sql
ALTER TABLE audit_logs
ADD COLUMN datos_previos JSONB,
ADD COLUMN datos_nuevos JSONB;

-- Índice GIN para búsquedas en JSONB
CREATE INDEX idx_audit_logs_datos_previos ON audit_logs USING GIN (datos_previos);
CREATE INDEX idx_audit_logs_datos_nuevos ON audit_logs USING GIN (datos_nuevos);
```

**B. Implementar en UsuarioServiceImpl:**

```java
@Transactional
public UsuarioResponseDTO actualizarUsuario(Long id, UsuarioUpdateDTO dto) {
    Usuario usuario = usuarioRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

    // 🆕 CAPTURAR ESTADO PREVIO
    Map<String, Object> datosPrevios = new HashMap<>();
    datosPrevios.put("email_corporativo", usuario.getPersonalCnt().getEmailCorpPers());
    datosPrevios.put("email_personal", usuario.getPersonalCnt().getEmailPers());
    datosPrevios.put("telefono", usuario.getPersonalCnt().getTelefonoPers());
    datosPrevios.put("activo", usuario.getIsActive());

    // Aplicar cambios
    if (dto.getEmailCorporativo() != null) {
        usuario.getPersonalCnt().setEmailCorpPers(dto.getEmailCorporativo());
    }
    // ... otros campos

    Usuario updated = usuarioRepository.save(usuario);

    // 🆕 CAPTURAR ESTADO NUEVO
    Map<String, Object> datosNuevos = new HashMap<>();
    datosNuevos.put("email_corporativo", updated.getPersonalCnt().getEmailCorpPers());
    datosNuevos.put("email_personal", updated.getPersonalCnt().getEmailPers());
    datosNuevos.put("telefono", updated.getPersonalCnt().getTelefonoPers());
    datosNuevos.put("activo", updated.getIsActive());

    // 🔒 AUDITORÍA CON DIFF
    auditarConDiff(
        "UPDATE_USER",
        "Actualización de usuario: " + usuario.getNameUser(),
        datosPrevios,
        datosNuevos,
        id
    );

    return mapToDTO(updated);
}

private void auditarConDiff(
    String action,
    String detalle,
    Map<String, Object> before,
    Map<String, Object> after,
    Long idAfectado
) {
    try {
        String usuario = SecurityContextHolder.getContext()
            .getAuthentication().getName();

        // Construir detalle con cambios
        StringBuilder cambiosDetalle = new StringBuilder(detalle);
        cambiosDetalle.append(". Cambios: ");

        before.forEach((key, oldValue) -> {
            Object newValue = after.get(key);
            if (!Objects.equals(oldValue, newValue)) {
                cambiosDetalle.append(String.format("[%s: '%s' → '%s'] ",
                    key, oldValue, newValue));
            }
        });

        AuditLog log = new AuditLog();
        log.setUsuario(usuario);
        log.setAction(action);
        log.setModulo("USUARIOS");
        log.setDetalle(cambiosDetalle.toString());
        log.setNivel("INFO");
        log.setEstado("SUCCESS");
        log.setIdAfectado(idAfectado);

        // 🆕 GUARDAR DATOS COMPLETOS EN JSONB
        log.setDatosPrevios(new ObjectMapper().writeValueAsString(before));
        log.setDatosNuevos(new ObjectMapper().writeValueAsString(after));

        auditLogRepository.save(log);

    } catch (Exception e) {
        log.warn("⚠️ Error en auditoría: {}", e.getMessage());
    }
}
```

**C. Consultas para auditoría forense:**

```sql
-- Ver cambios de un campo específico
SELECT
    fecha_hora,
    usuario_sesion,
    datos_previos->>'email_corporativo' as email_anterior,
    datos_nuevos->>'email_corporativo' as email_nuevo,
    detalle
FROM vw_auditoria_modular_detallada
WHERE accion = 'UPDATE_USER'
  AND datos_previos->>'email_corporativo' IS DISTINCT FROM datos_nuevos->>'email_corporativo'
ORDER BY fecha_hora DESC;

-- Rastrear historial completo de un registro
SELECT
    fecha_hora,
    usuario_sesion,
    nombre_completo,
    accion,
    datos_previos,
    datos_nuevos
FROM vw_auditoria_modular_detallada
WHERE id_afectado = 123  -- ID del usuario
  AND accion LIKE '%_USER'
ORDER BY fecha_hora ASC;
```

**Esfuerzo:** 8-10 horas
**Beneficio:** Muy Alto - Auditoría forense completa

---

### 2.3 Detección de Anomalías

#### Problema
No hay alertas automáticas para comportamientos sospechosos.

#### Solución

**A. Crear tabla de alertas de seguridad:**

```sql
CREATE TABLE security_alerts (
    id              BIGSERIAL PRIMARY KEY,
    fecha_hora      TIMESTAMP(6) NOT NULL DEFAULT NOW(),
    tipo_alerta     VARCHAR(50) NOT NULL,
    severidad       VARCHAR(20) NOT NULL,  -- LOW, MEDIUM, HIGH, CRITICAL
    usuario         VARCHAR(100),
    descripcion     TEXT,
    datos_adicionales JSONB,
    estado          VARCHAR(20) DEFAULT 'PENDING',  -- PENDING, REVIEWED, RESOLVED, FALSE_POSITIVE
    revisado_por    VARCHAR(100),
    fecha_revision  TIMESTAMP(6)
);

CREATE INDEX idx_security_alerts_fecha ON security_alerts(fecha_hora DESC);
CREATE INDEX idx_security_alerts_tipo ON security_alerts(tipo_alerta);
CREATE INDEX idx_security_alerts_severidad ON security_alerts(severidad);
CREATE INDEX idx_security_alerts_estado ON security_alerts(estado);
```

**B. Service de detección de anomalías:**

```java
@Service
@Slf4j
@RequiredArgsConstructor
public class AnomalyDetectionService {

    private final AuditLogRepository auditLogRepository;
    private final SecurityAlertRepository securityAlertRepository;
    private final EmailService emailService;

    /**
     * Detectar múltiples intentos de login fallidos
     */
    @Scheduled(fixedRate = 300000) // Cada 5 minutos
    public void detectarIntentosLoginFallidos() {
        LocalDateTime threshold = LocalDateTime.now().minusMinutes(15);

        // Buscar usuarios con 3+ intentos fallidos
        List<Object[]> results = auditLogRepository.findFailedLoginAttempts(threshold, 3);

        for (Object[] row : results) {
            String username = (String) row[0];
            Long intentos = (Long) row[1];
            String ips = (String) row[2];

            // Crear alerta
            SecurityAlert alert = new SecurityAlert();
            alert.setTipoAlerta("BRUTE_FORCE_ATTEMPT");
            alert.setSeveridad("HIGH");
            alert.setUsuario(username);
            alert.setDescripcion(String.format(
                "Múltiples intentos de login fallidos detectados: %d intentos desde IPs: %s",
                intentos, ips
            ));

            Map<String, Object> metadata = new HashMap<>();
            metadata.put("intentos", intentos);
            metadata.put("ips", ips);
            metadata.put("ventana_tiempo_minutos", 15);
            alert.setDatosAdicionales(new ObjectMapper().writeValueAsString(metadata));

            securityAlertRepository.save(alert);

            // 🔒 AUDITORÍA
            auditLogRepository.save(createAuditLog(
                "SYSTEM",
                "SECURITY_ALERT_CREATED",
                "SECURITY",
                alert.getDescripcion(),
                "WARNING",
                "SUCCESS"
            ));

            // Enviar email a admin
            emailService.enviarAlertaSeguridad(alert);

            log.warn("🚨 Alerta de seguridad: Posible ataque de fuerza bruta al usuario {}", username);
        }
    }

    /**
     * Detectar acceso desde ubicaciones inusuales
     */
    public void detectarAccesoUbicacionInusual(String username, String ipActual) {
        // Obtener últimas 10 IPs del usuario
        List<String> ipsHistoricas = auditLogRepository.findRecentIpsByUsername(username, 10);

        // Si la IP actual no está en el historial
        if (!ipsHistoricas.contains(ipActual)) {
            SecurityAlert alert = new SecurityAlert();
            alert.setTipoAlerta("UNUSUAL_LOCATION_ACCESS");
            alert.setSeveridad("MEDIUM");
            alert.setUsuario(username);
            alert.setDescripcion(String.format(
                "Acceso desde IP no reconocida: %s. IPs habituales: %s",
                ipActual,
                String.join(", ", ipsHistoricas)
            ));

            securityAlertRepository.save(alert);

            log.warn("🌍 Acceso desde ubicación inusual: {} desde {}", username, ipActual);
        }
    }

    /**
     * Detectar acceso fuera de horario laboral
     */
    public void detectarAccesoFueraHorario(String username) {
        LocalTime now = LocalTime.now();
        LocalDate today = LocalDate.now();
        DayOfWeek dayOfWeek = today.getDayOfWeek();

        // Horario laboral: Lunes-Viernes 7:00-19:00
        boolean esFueradeHorario =
            (dayOfWeek == DayOfWeek.SATURDAY || dayOfWeek == DayOfWeek.SUNDAY) ||
            (now.isBefore(LocalTime.of(7, 0)) || now.isAfter(LocalTime.of(19, 0)));

        if (esFueradeHorario) {
            SecurityAlert alert = new SecurityAlert();
            alert.setTipoAlerta("OFF_HOURS_ACCESS");
            alert.setSeveridad("LOW");
            alert.setUsuario(username);
            alert.setDescripcion(String.format(
                "Acceso fuera de horario laboral: %s %s",
                dayOfWeek,
                now.format(DateTimeFormatter.ofPattern("HH:mm"))
            ));

            securityAlertRepository.save(alert);

            log.info("🌙 Acceso fuera de horario: {} a las {}", username, now);
        }
    }

    /**
     * Detectar exportaciones masivas de datos
     */
    public void detectarExportacionMasiva(String username, Long cantidadRegistros) {
        if (cantidadRegistros > 1000) {
            SecurityAlert alert = new SecurityAlert();
            alert.setTipoAlerta("MASS_DATA_EXPORT");
            alert.setSeveridad("HIGH");
            alert.setUsuario(username);
            alert.setDescripcion(String.format(
                "Exportación masiva de datos: %d registros",
                cantidadRegistros
            ));

            securityAlertRepository.save(alert);

            log.warn("📤 Exportación masiva detectada: {} exportó {} registros",
                username, cantidadRegistros);
        }
    }

    /**
     * Detectar acciones de alto privilegio por usuarios no autorizados
     */
    public void detectarAccionNoAutorizada(String username, String action) {
        List<String> accionesAltoRiesgo = List.of(
            "DELETE_USER",
            "GRANT_PERMISSION",
            "REVOKE_PERMISSION",
            "DELETE_ROLE"
        );

        if (accionesAltoRiesgo.contains(action)) {
            // Verificar si el usuario tiene rol SUPERADMIN o ADMIN
            // (esto requeriría inyectar UsuarioRepository)

            SecurityAlert alert = new SecurityAlert();
            alert.setTipoAlerta("HIGH_PRIVILEGE_ACTION");
            alert.setSeveridad("MEDIUM");
            alert.setUsuario(username);
            alert.setDescripcion(String.format(
                "Acción de alto privilegio ejecutada: %s",
                action
            ));

            securityAlertRepository.save(alert);
        }
    }
}
```

**C. Repository queries:**

```java
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    @Query("""
        SELECT a.usuario, COUNT(*) as intentos, STRING_AGG(DISTINCT a.ipAddress, ', ') as ips
        FROM AuditLog a
        WHERE a.action = 'LOGIN_FAILED'
          AND a.fechaHora > :threshold
        GROUP BY a.usuario
        HAVING COUNT(*) >= :minIntentos
        """)
    List<Object[]> findFailedLoginAttempts(LocalDateTime threshold, int minIntentos);

    @Query("""
        SELECT DISTINCT a.ipAddress
        FROM AuditLog a
        WHERE a.usuario = :username
          AND a.action = 'LOGIN'
          AND a.estado = 'SUCCESS'
        ORDER BY a.fechaHora DESC
        LIMIT :limit
        """)
    List<String> findRecentIpsByUsername(String username, int limit);
}
```

**D. Dashboard de alertas en frontend:**

```jsx
// SecurityAlertsPanel.jsx
const SecurityAlertsPanel = () => {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    const response = await api.get('/api/security/alerts?estado=PENDING');
    setAlerts(response.data.data);
  };

  const marcarRevisada = async (id, estado) => {
    await api.put(`/api/security/alerts/${id}/review`, { estado });
    fetchAlerts();
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <span className="text-red-600">🚨</span>
        Alertas de Seguridad
        {alerts.length > 0 && (
          <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm">
            {alerts.length}
          </span>
        )}
      </h3>

      <div className="space-y-3">
        {alerts.map(alert => (
          <div
            key={alert.id}
            className={`border-l-4 p-4 ${getSeverityClass(alert.severidad)}`}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium">{alert.tipoAlerta}</p>
                <p className="text-sm text-gray-600">{alert.descripcion}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {alert.usuario} • {alert.fechaFormateada}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => marcarRevisada(alert.id, 'RESOLVED')}
                  className="text-green-600 hover:text-green-800"
                >
                  ✓ Resolver
                </button>
                <button
                  onClick={() => marcarRevisada(alert.id, 'FALSE_POSITIVE')}
                  className="text-gray-600 hover:text-gray-800"
                >
                  ✗ Falso positivo
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const getSeverityClass = (severidad) => {
  switch(severidad) {
    case 'CRITICAL': return 'border-red-600 bg-red-50';
    case 'HIGH': return 'border-orange-500 bg-orange-50';
    case 'MEDIUM': return 'border-yellow-500 bg-yellow-50';
    case 'LOW': return 'border-blue-500 bg-blue-50';
    default: return 'border-gray-500 bg-gray-50';
  }
};
```

**Esfuerzo:** 12-16 horas
**Beneficio:** Muy Alto - Detección proactiva de amenazas

---

## Fase 3: Mejoras Avanzadas (Mediano Plazo)

### 3.1 Particionamiento de Tabla audit_logs

#### Problema
La tabla crecerá indefinidamente, afectando performance de consultas.

#### Solución

**A. Convertir a tabla particionada por mes:**

```sql
-- 1. Crear nueva tabla particionada
CREATE TABLE audit_logs_partitioned (
    LIKE audit_logs INCLUDING ALL
) PARTITION BY RANGE (fecha_hora);

-- 2. Crear particiones para 2025
CREATE TABLE audit_logs_2025_01 PARTITION OF audit_logs_partitioned
    FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

CREATE TABLE audit_logs_2025_02 PARTITION OF audit_logs_partitioned
    FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');

-- ... crear particiones para cada mes

-- 3. Migrar datos existentes
INSERT INTO audit_logs_partitioned SELECT * FROM audit_logs;

-- 4. Renombrar tablas
ALTER TABLE audit_logs RENAME TO audit_logs_old;
ALTER TABLE audit_logs_partitioned RENAME TO audit_logs;

-- 5. Recrear índices (se crean automáticamente en cada partición)
```

**B. Job para crear particiones automáticamente:**

```java
@Component
@Slf4j
public class PartitionManagementJob {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    // Ejecutar el primer día de cada mes
    @Scheduled(cron = "0 0 0 1 * *")
    public void crearParticionSiguienteMes() {
        LocalDate nextMonth = LocalDate.now().plusMonths(2);
        String partitionName = "audit_logs_" +
            nextMonth.format(DateTimeFormatter.ofPattern("yyyy_MM"));

        String startDate = nextMonth.withDayOfMonth(1).toString();
        String endDate = nextMonth.plusMonths(1).withDayOfMonth(1).toString();

        String sql = String.format("""
            CREATE TABLE IF NOT EXISTS %s PARTITION OF audit_logs
            FOR VALUES FROM ('%s') TO ('%s')
            """, partitionName, startDate, endDate);

        try {
            jdbcTemplate.execute(sql);
            log.info("✅ Partición creada: {}", partitionName);
        } catch (Exception e) {
            log.error("❌ Error creando partición: {}", e.getMessage());
        }
    }

    // Ejecutar mensualmente para archivar particiones antiguas
    @Scheduled(cron = "0 0 2 1 * *")
    public void archivarParticionesAntiguas() {
        LocalDate thresholdDate = LocalDate.now().minusMonths(12);
        String partitionName = "audit_logs_" +
            thresholdDate.format(DateTimeFormatter.ofPattern("yyyy_MM"));

        // Mover a tabla de archivo
        String sql = String.format("""
            CREATE TABLE IF NOT EXISTS audit_logs_archive_%s AS
            SELECT * FROM %s;

            ALTER TABLE audit_logs DETACH PARTITION %s;
            DROP TABLE %s;
            """,
            partitionName.replace("audit_logs_", ""),
            partitionName,
            partitionName,
            partitionName
        );

        try {
            jdbcTemplate.execute(sql);
            log.info("📦 Partición archivada: {}", partitionName);
        } catch (Exception e) {
            log.error("❌ Error archivando partición: {}", e.getMessage());
        }
    }
}
```

**Beneficio:** Performance constante independiente del tamaño de datos

---

### 3.2 Dashboard de Seguridad Ejecutivo

#### Solución

Crear dashboard centralizado con métricas clave:

**A. Backend - SecurityDashboardService:**

```java
@Service
@RequiredArgsConstructor
public class SecurityDashboardService {

    private final AuditLogRepository auditLogRepository;
    private final SecurityAlertRepository securityAlertRepository;
    private final ActiveSessionRepository activeSessionRepository;

    public SecurityDashboardDTO getSecurityDashboard() {
        SecurityDashboardDTO dashboard = new SecurityDashboardDTO();

        // Métricas de sesiones
        dashboard.setSesionesActivas(activeSessionRepository.countByIsActiveTrue());
        dashboard.setSesionesConcurrentes(detectarSesionesConcurrentes());

        // Métricas de alertas
        LocalDateTime last24h = LocalDateTime.now().minusHours(24);
        dashboard.setAlertasPendientes(
            securityAlertRepository.countByEstadoAndFechaHoraAfter("PENDING", last24h)
        );
        dashboard.setAlertasCriticas(
            securityAlertRepository.countBySeveridadAndFechaHoraAfter("CRITICAL", last24h)
        );

        // Intentos de login fallidos
        dashboard.setLoginsFallidosHoy(
            auditLogRepository.countByActionAndEstadoAndFechaHoraAfter(
                "LOGIN_FAILED",
                "FAILURE",
                LocalDate.now().atStartOfDay()
            )
        );

        // Top usuarios más activos
        dashboard.setUsuariosMasActivos(getTop10UsuariosActivos());

        // Acciones de alto riesgo recientes
        dashboard.setAccionesAltoRiesgo(getAccionesAltoRiesgoRecientes());

        // Tendencias
        dashboard.setTendenciaActividad(getTendenciaActividad30Dias());

        return dashboard;
    }

    private List<UsuarioActivoDTO> getTop10UsuariosActivos() {
        LocalDateTime lastWeek = LocalDateTime.now().minusDays(7);
        return auditLogRepository.findTopActiveUsers(lastWeek, 10);
    }

    private List<AuditLogDTO> getAccionesAltoRiesgoRecientes() {
        List<String> accionesAltoRiesgo = List.of(
            "DELETE_USER", "GRANT_PERMISSION", "REVOKE_PERMISSION",
            "DELETE_ROLE", "EXPORT_CSV"
        );
        LocalDateTime last7Days = LocalDateTime.now().minusDays(7);
        return auditLogRepository.findByActionInAndFechaHoraAfter(
            accionesAltoRiesgo, last7Days
        );
    }

    private Map<String, Long> getTendenciaActividad30Dias() {
        LocalDateTime last30Days = LocalDateTime.now().minusDays(30);
        List<Object[]> results = auditLogRepository.countEventsByDay(last30Days);

        Map<String, Long> tendencia = new LinkedHashMap<>();
        for (Object[] row : results) {
            LocalDate fecha = (LocalDate) row[0];
            Long count = (Long) row[1];
            tendencia.put(fecha.toString(), count);
        }
        return tendencia;
    }

    private int detectarSesionesConcurrentes() {
        return activeSessionRepository.countConcurrentSessions();
    }
}
```

**B. Frontend - SecurityDashboard.jsx:**

```jsx
const SecurityDashboard = () => {
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 60000); // Actualizar cada minuto
    return () => clearInterval(interval);
  }, []);

  const fetchMetrics = async () => {
    const response = await api.get('/api/security/dashboard');
    setMetrics(response.data.data);
  };

  if (!metrics) return <div>Cargando...</div>;

  return (
    <div className="space-y-6">
      {/* KPIs principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          title="Sesiones Activas"
          value={metrics.sesionesActivas}
          icon="👥"
          trend={metrics.sesionesActivas > 10 ? 'up' : 'stable'}
        />
        <MetricCard
          title="Alertas Pendientes"
          value={metrics.alertasPendientes}
          icon="🚨"
          trend={metrics.alertasPendientes > 5 ? 'warning' : 'stable'}
        />
        <MetricCard
          title="Logins Fallidos Hoy"
          value={metrics.loginsFallidosHoy}
          icon="🔒"
          trend={metrics.loginsFallidosHoy > 10 ? 'danger' : 'stable'}
        />
        <MetricCard
          title="Sesiones Concurrentes"
          value={metrics.sesionesConcurrentes}
          icon="⚠️"
          trend={metrics.sesionesConcurrentes > 0 ? 'warning' : 'stable'}
        />
      </div>

      {/* Gráfico de tendencia de actividad */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Actividad de los últimos 30 días</h3>
        <LineChart data={metrics.tendenciaActividad} />
      </div>

      {/* Top usuarios más activos */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Usuarios Más Activos</h3>
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2">Usuario</th>
              <th className="text-left py-2">Nombre</th>
              <th className="text-right py-2">Acciones</th>
              <th className="text-right py-2">Módulos</th>
            </tr>
          </thead>
          <tbody>
            {metrics.usuariosMasActivos.map(user => (
              <tr key={user.username} className="border-b">
                <td className="py-2">{user.username}</td>
                <td className="py-2">{user.nombreCompleto}</td>
                <td className="text-right py-2">{user.totalAcciones}</td>
                <td className="text-right py-2">{user.modulosUsados}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Acciones de alto riesgo recientes */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 text-orange-600">
          ⚠️ Acciones de Alto Riesgo (Últimos 7 días)
        </h3>
        <div className="space-y-2">
          {metrics.accionesAltoRiesgo.map(log => (
            <div key={log.id} className="border-l-4 border-orange-500 bg-orange-50 p-3">
              <p className="font-medium">{log.accion}</p>
              <p className="text-sm text-gray-600">{log.detalle}</p>
              <p className="text-xs text-gray-500">
                {log.nombreCompleto} ({log.usuario}) • {log.fechaFormateada}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
```

**Esfuerzo:** 10-12 horas
**Beneficio:** Muy Alto - Visibilidad ejecutiva de seguridad

---

## Fase 4: Compliance y Cumplimiento Normativo

### 4.1 Cumplimiento de Normativas de Salud Peruanas

#### Marco Normativo Aplicable

1. **Ley N° 29733 - Ley de Protección de Datos Personales (LPDP)**
   - Requerimiento: Registro de acceso a datos personales
   - Retención: Mínimo 5 años

2. **Ley N° 26842 - Ley General de Salud**
   - Requerimiento: Confidencialidad de historias clínicas
   - Auditoría de accesos médicos

3. **Directiva Administrativa N° 335-MINSA/2023**
   - Requerimiento: Trazabilidad de atenciones de telemedicina
   - Auditoría de prescripciones electrónicas

#### Implementación

**A. Política de retención:**

```sql
-- Crear tabla de política de retención
CREATE TABLE audit_retention_policy (
    id              SERIAL PRIMARY KEY,
    modulo          VARCHAR(50) NOT NULL,
    accion          VARCHAR(100),
    dias_retencion  INTEGER NOT NULL,
    justificacion   TEXT,
    base_legal      VARCHAR(255)
);

-- Configurar políticas según normativa
INSERT INTO audit_retention_policy (modulo, accion, dias_retencion, justificacion, base_legal) VALUES
('PACIENTES', NULL, 1825, 'Datos personales de salud', 'LPDP Art. 19 - 5 años'),
('AUTH', 'LOGIN', 365, 'Accesos al sistema', 'Directiva 335-MINSA'),
('AUTH', 'LOGIN_FAILED', 1825, 'Intentos de acceso no autorizado', 'LPDP - Seguridad'),
('USUARIOS', 'DELETE_USER', 3650, 'Eliminación de cuentas', 'LPDP - 10 años'),
('REPORTES', 'EXPORT_CSV', 1825, 'Exportación de datos', 'LPDP - 5 años');

-- Job de limpieza que respeta política
CREATE OR REPLACE FUNCTION cleanup_audit_logs_with_policy()
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    v_policy RECORD;
    v_deleted_count INT;
BEGIN
    FOR v_policy IN
        SELECT modulo, accion, dias_retencion
        FROM audit_retention_policy
    LOOP
        IF v_policy.accion IS NOT NULL THEN
            -- Política específica por acción
            DELETE FROM audit_logs
            WHERE modulo = v_policy.modulo
              AND action = v_policy.accion
              AND fecha_hora < NOW() - (v_policy.dias_retencion || ' days')::INTERVAL;
        ELSE
            -- Política general por módulo
            DELETE FROM audit_logs
            WHERE modulo = v_policy.modulo
              AND fecha_hora < NOW() - (v_policy.dias_retencion || ' days')::INTERVAL;
        END IF;

        GET DIAGNOSTICS v_deleted_count = ROW_COUNT;

        IF v_deleted_count > 0 THEN
            RAISE NOTICE 'Limpiados % registros de %/%',
                v_deleted_count, v_policy.modulo, COALESCE(v_policy.accion, 'TODOS');
        END IF;
    END LOOP;
END;
$$;
```

**B. Reporte de cumplimiento:**

```sql
-- Reporte mensual de cumplimiento
CREATE VIEW vw_reporte_cumplimiento_auditoria AS
SELECT
    modulo,
    COUNT(*) as total_eventos,
    MIN(fecha_hora) as registro_mas_antiguo,
    MAX(fecha_hora) as registro_mas_reciente,
    EXTRACT(DAY FROM (NOW() - MIN(fecha_hora))) as dias_retenidos,
    p.dias_retencion as dias_requeridos,
    CASE
        WHEN EXTRACT(DAY FROM (NOW() - MIN(fecha_hora))) >= p.dias_retencion THEN '✅ CUMPLE'
        ELSE '⚠️ NO CUMPLE'
    END as estado_cumplimiento,
    p.base_legal
FROM audit_logs a
LEFT JOIN audit_retention_policy p ON a.modulo = p.modulo
GROUP BY modulo, p.dias_retencion, p.base_legal
ORDER BY modulo;
```

---

## Resumen de Priorización

### Implementar PRIMERO (Esta Semana)

1. ✅ **Auditoría de permisos MBAC** (2-3h)
2. ✅ **Captura de IP + User-Agent** (1-2h)
3. ✅ **Auditoría de acceso a datos sensibles** (4-6h)

**Total Fase 1:** 8-12 horas

### Implementar SEGUNDO (Próximas 2 Semanas)

4. ✅ **Auditoría de sesiones** (6-8h)
5. ✅ **Tracking de cambios Before/After** (8-10h)

**Total Fase 2:** 14-18 horas

### Implementar TERCERO (Próximo Mes)

6. ✅ **Protección de integridad (hashing)** (3-4h)
7. ✅ **Detección de anomalías** (12-16h)
8. ✅ **Dashboard de seguridad** (10-12h)

**Total Fase 3:** 25-32 horas

### Planificar LARGO PLAZO (2-3 Meses)

9. ✅ **Particionamiento de tablas** (8-12h)
10. ✅ **Compliance normativo** (6-8h)

**Total Fase 4:** 14-20 horas

---

## Checklist de Implementación

```
FASE 1 - CRÍTICO (Esta semana)
☐ Crear acciones para MBAC (ASSIGN_ROLE, REVOKE_PERMISSION, etc.)
☐ Implementar auditoría en gestión de roles y permisos
☐ Crear RequestContextUtil para capturar IP + User-Agent
☐ Actualizar AuditLogServiceImpl para capturar contexto HTTP
☐ Agregar auditoría a accesos de datos sensibles (pacientes, reportes)
☐ Auditar exportaciones de datos (CSV, PDF, Excel)

FASE 2 - ALTO (Próximas 2 semanas)
☐ Crear tabla active_sessions
☐ Implementar tracking de sesiones en AuthService
☐ Crear job de limpieza de sesiones inactivas
☐ Detectar sesiones concurrentes
☐ Agregar columnas datos_previos y datos_nuevos (JSONB)
☐ Implementar método auditarConDiff()
☐ Actualizar servicios para usar tracking de cambios

FASE 3 - IMPORTANTE (Próximo mes)
☐ Agregar columna hash_integridad
☐ Crear funciones PostgreSQL para hashing
☐ Implementar trigger de integridad
☐ Configurar permisos restrictivos (solo INSERT)
☐ Crear tabla security_alerts
☐ Implementar AnomalyDetectionService
☐ Crear jobs de detección automática
☐ Crear SecurityDashboard frontend
☐ Implementar panel de alertas de seguridad

FASE 4 - LARGO PLAZO (2-3 meses)
☐ Convertir audit_logs a tabla particionada
☐ Crear particiones mensuales
☐ Implementar job de gestión de particiones
☐ Crear política de retención según normativa
☐ Implementar limpieza con respeto a políticas
☐ Crear reportes de cumplimiento
☐ Documentar cumplimiento normativo
```

---

**Responsable:** Ing. Styp Canto Rondón
**Email:** cenate.analista@essalud.gob.pe

*EsSalud Perú - CENATE | Centro Nacional de Telemedicina*
