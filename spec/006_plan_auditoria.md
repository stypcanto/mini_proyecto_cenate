# Plan de Accion - Modulo de Auditoria CENATE

> **Version:** 1.1
> **Fecha:** 2025-12-23
> **Autor:** Sistema CENATE
> **Estado:** Parcialmente Implementado (Fase 1-2 completadas)

---

## 1. Resumen Ejecutivo

El modulo de auditoria existe pero esta **subutilizado**. Solo el servicio de autenticacion registra eventos. Operaciones criticas como CRUD de usuarios, roles y permisos **NO se auditan**.

### Diagnostico Actual

| Componente | Estado | Problema |
|------------|--------|----------|
| Tabla `audit_logs` | OK | Estructura correcta |
| Vista `vw_auditoria_modular_detallada` | PENDIENTE | Verificar si existe en BD |
| AuditLogService | OK | Funciona correctamente |
| Integracion en servicios | CRITICO | Solo AuthService usa auditoria |
| Frontend LogsDelSistema | OK | Funciona pero datos limitados |

### Servicios SIN Auditoria (Critico)

```
UsuarioServiceImpl      - CRUD usuarios NO auditado
RolServiceImpl          - Cambios de roles NO auditado
PermisosServiceImpl     - Cambios permisos NO auditado
PersonalCntServiceImpl  - Cambios personal NO auditado
AccountRequestService   - Aprobaciones/rechazos NO auditado
GestionPacienteService  - Gestiones NO auditadas
```

---

## 2. Plan de Accion

### Fase 1: Infraestructura de Base de Datos

#### 1.1 Verificar/Crear Vista SQL

```sql
-- Verificar si existe la vista
SELECT * FROM information_schema.views
WHERE table_name = 'vw_auditoria_modular_detallada';

-- Si no existe, crearla:
CREATE OR REPLACE VIEW vw_auditoria_modular_detallada AS
SELECT
    al.id,
    al.fecha_hora,
    TO_CHAR(al.fecha_hora, 'DD/MM/YYYY HH24:MI:SS') as fecha_formateada,
    al.usuario as usuario_sesion,
    u.id_user,
    u.name_user as username,
    p.num_doc_pers as dni,
    CONCAT(p.nom_pers, ' ', p.ape_pater_pers, ' ', p.ape_mater_pers) as nombre_completo,
    (
        SELECT STRING_AGG(r.desc_rol, ', ')
        FROM rel_user_roles rur
        JOIN dim_roles r ON rur.id_rol = r.id_rol
        WHERE rur.id_user = u.id_user
    ) as roles,
    p.email_corp_pers as correo_corporativo,
    p.email_pers as correo_personal,
    al.modulo,
    al.action as accion,
    al.estado,
    al.detalle,
    al.ip_address as ip,
    al.user_agent as dispositivo,
    NULL::bigint as id_afectado,
    al.action as tipo_evento
FROM audit_logs al
LEFT JOIN dim_usuarios u ON al.usuario = u.name_user
LEFT JOIN dim_personal_cnt p ON p.id_usuario = u.id_user
ORDER BY al.fecha_hora DESC;

-- Indices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_audit_logs_fecha ON audit_logs(fecha_hora DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_usuario ON audit_logs(usuario);
CREATE INDEX IF NOT EXISTS idx_audit_logs_modulo ON audit_logs(modulo);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
```

#### 1.2 Crear Trigger de Auditoria Automatica (Opcional)

```sql
-- Funcion para auditoria automatica de cambios
CREATE OR REPLACE FUNCTION fn_audit_trigger()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit_logs (usuario, action, modulo, detalle, nivel, estado, fecha_hora)
        VALUES (
            COALESCE(current_setting('app.current_user', true), 'SYSTEM'),
            'INSERT',
            TG_TABLE_NAME,
            'Registro creado: ID=' || NEW.id,
            'INFO',
            'SUCCESS',
            NOW()
        );
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_logs (usuario, action, modulo, detalle, nivel, estado, fecha_hora)
        VALUES (
            COALESCE(current_setting('app.current_user', true), 'SYSTEM'),
            'UPDATE',
            TG_TABLE_NAME,
            'Registro actualizado: ID=' || NEW.id,
            'INFO',
            'SUCCESS',
            NOW()
        );
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO audit_logs (usuario, action, modulo, detalle, nivel, estado, fecha_hora)
        VALUES (
            COALESCE(current_setting('app.current_user', true), 'SYSTEM'),
            'DELETE',
            TG_TABLE_NAME,
            'Registro eliminado: ID=' || OLD.id,
            'WARNING',
            'SUCCESS',
            NOW()
        );
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger a tablas criticas (ejemplo)
-- CREATE TRIGGER trg_audit_usuarios AFTER INSERT OR UPDATE OR DELETE ON dim_usuarios
-- FOR EACH ROW EXECUTE FUNCTION fn_audit_trigger();
```

---

### Fase 2: Integracion Backend

#### 2.1 Servicios a Modificar

| Servicio | Acciones a Auditar | Prioridad |
|----------|-------------------|-----------|
| **UsuarioServiceImpl** | CREATE, UPDATE, DELETE, ACTIVATE, DEACTIVATE, UNLOCK, ASSIGN_ROLE | ALTA |
| **RolServiceImpl** | CREATE, UPDATE, DELETE | ALTA |
| **PermisosServiceImpl** | GRANT, REVOKE, UPDATE | ALTA |
| **AccountRequestService** | APPROVE, REJECT, DELETE | ALTA |
| **PersonalCntServiceImpl** | CREATE, UPDATE, DELETE | MEDIA |
| **GestionPacienteService** | CREATE, UPDATE, DELETE | MEDIA |
| **SolicitudCitaService** | CREATE, UPDATE, CANCEL | BAJA |

#### 2.2 Patron de Implementacion

```java
// Inyectar en cada servicio
private final AuditLogService auditLogService;

// Metodo helper para registrar
private void auditar(String action, String detalle, String nivel, String estado) {
    try {
        String usuario = SecurityContextHolder.getContext()
            .getAuthentication().getName();
        auditLogService.registrarEvento(
            usuario, action, "MODULO_NAME", detalle, nivel, estado
        );
    } catch (Exception e) {
        log.warn("No se pudo registrar auditoria: {}", e.getMessage());
    }
}

// Uso en metodos
public void eliminarUsuario(Long id) {
    Usuario u = repo.findById(id).orElseThrow();
    repo.delete(u);
    auditar("DELETE_USER", "Usuario eliminado: " + u.getNameUser(), "WARNING", "SUCCESS");
}
```

#### 2.3 Acciones Estandarizadas

```java
// Autenticacion
LOGIN, LOGOUT, LOGIN_FAILED, PASSWORD_CHANGE, PASSWORD_RESET

// Usuarios
CREATE_USER, UPDATE_USER, DELETE_USER, ACTIVATE_USER, DEACTIVATE_USER, UNLOCK_USER

// Roles y Permisos
ASSIGN_ROLE, REMOVE_ROLE, GRANT_PERMISSION, REVOKE_PERMISSION

// Solicitudes
APPROVE_REQUEST, REJECT_REQUEST, CREATE_REQUEST

// Datos
CREATE_RECORD, UPDATE_RECORD, DELETE_RECORD, EXPORT_DATA

// Sistema
SYSTEM_ERROR, CONFIG_CHANGE, BACKUP, RESTORE
```

---

### Fase 3: Mejoras Frontend

#### 3.1 Mejoras en LogsDelSistema.jsx

- [ ] Agregar filtro por nivel (INFO, WARNING, ERROR, CRITICAL)
- [ ] Agregar filtro por estado (SUCCESS, FAILURE)
- [ ] Mostrar IP y dispositivo en vista detalle
- [ ] Agregar grafico de actividad por hora/dia
- [ ] Exportar a PDF ademas de CSV
- [ ] Vista de timeline para un usuario especifico

#### 3.2 Nuevo Componente: AuditDetailModal

```jsx
// Modal para ver detalle completo de un log
<AuditDetailModal
  log={selectedLog}
  onClose={() => setSelectedLog(null)}
  showUserHistory={() => navigateToUserHistory(log.usuario)}
/>
```

#### 3.3 Dashboard de Auditoria

- Grafico de barras: Eventos por modulo
- Grafico de lineas: Actividad en el tiempo
- Lista: Usuarios mas activos
- Alertas: Eventos criticos recientes

---

### Fase 4: Alertas y Notificaciones

#### 4.1 Eventos que Requieren Alerta

| Evento | Accion |
|--------|--------|
| 3+ LOGIN_FAILED seguidos | Notificar admin, bloquear cuenta |
| DELETE_USER | Notificar superadmin |
| GRANT_PERMISSION (SUPERADMIN) | Notificar todos los superadmin |
| ERROR/CRITICAL | Log especial + notificacion |
| Acceso fuera de horario | Log + alerta |

#### 4.2 Implementacion de Alertas

```java
@Service
public class AuditAlertService {

    @Async
    public void verificarAlerta(AuditLog log) {
        if ("LOGIN_FAILED".equals(log.getAction())) {
            verificarIntentosFallidos(log.getUsuario());
        }
        if ("DELETE_USER".equals(log.getAction())) {
            notificarSuperadmins(log);
        }
        if ("ERROR".equals(log.getNivel()) || "CRITICAL".equals(log.getNivel())) {
            enviarAlertaCritica(log);
        }
    }
}
```

---

## 3. Cronograma de Implementacion

### Semana 1: Infraestructura

| Dia | Tarea | Responsable |
|-----|-------|-------------|
| 1 | Crear/verificar vista SQL | DBA/Backend |
| 2 | Agregar indices de optimizacion | DBA |
| 3 | Integrar auditoria en UsuarioServiceImpl | Backend |
| 4 | Integrar auditoria en RolServiceImpl | Backend |
| 5 | Integrar auditoria en PermisosServiceImpl | Backend |

### Semana 2: Backend Completo

| Dia | Tarea | Responsable |
|-----|-------|-------------|
| 1 | Integrar AccountRequestService | Backend |
| 2 | Integrar PersonalCntServiceImpl | Backend |
| 3 | Integrar GestionPacienteService | Backend |
| 4 | Pruebas unitarias de auditoria | QA |
| 5 | Pruebas de integracion | QA |

### Semana 3: Frontend y Alertas

| Dia | Tarea | Responsable |
|-----|-------|-------------|
| 1-2 | Mejoras en LogsDelSistema.jsx | Frontend |
| 3 | Crear AuditDetailModal | Frontend |
| 4 | Implementar sistema de alertas | Backend |
| 5 | Pruebas end-to-end | QA |

---

## 4. Archivos a Modificar

### Backend

```
backend/src/main/java/com/styp/cenate/
├── service/
│   ├── usuario/UsuarioServiceImpl.java          [MODIFICAR]
│   ├── rol/impl/RolServiceImpl.java             [MODIFICAR]
│   ├── mbac/impl/PermisosServiceImpl.java       [MODIFICAR]
│   ├── solicitud/AccountRequestService.java     [MODIFICAR]
│   ├── personal/impl/PersonalCntServiceImpl.java [MODIFICAR]
│   ├── gestionpaciente/GestionPacienteServiceImpl.java [MODIFICAR]
│   └── auditlog/
│       ├── AuditLogService.java                 [OK]
│       └── AuditLogServiceImpl.java             [MEJORAR]
├── api/
│   ├── seguridad/AuditLogController.java        [OK]
│   └── mbac/AuditoriaController.java            [MEJORAR]
└── config/
    └── AuditAlertConfig.java                    [CREAR]
```

### Frontend

```
frontend/src/
├── pages/admin/
│   └── LogsDelSistema.jsx                       [MEJORAR]
├── components/
│   ├── AuditDetailModal.jsx                     [CREAR]
│   └── AuditDashboard.jsx                       [CREAR]
└── services/
    └── auditoriaService.js                      [OK]
```

### Base de Datos

```sql
-- Scripts a ejecutar
scripts/
├── 001_create_audit_view.sql
├── 002_create_audit_indexes.sql
└── 003_create_audit_triggers.sql (opcional)
```

---

## 5. Metricas de Exito

| Metrica | Objetivo | Medicion |
|---------|----------|----------|
| Cobertura de auditoria | 100% operaciones criticas | Revision de codigo |
| Tiempo de respuesta consultas | < 500ms | Monitoreo |
| Logs generados por dia | Baseline establecido | Dashboard |
| Alertas criticas atendidas | < 1 hora | SLA |
| Disponibilidad del modulo | 99.9% | Uptime |

---

## 6. Riesgos y Mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigacion |
|--------|--------------|---------|------------|
| Degradacion de performance por exceso de logs | Media | Alto | Indices, particionamiento, limpieza automatica |
| Disco lleno por logs | Baja | Alto | Rotacion automatica, alertas de espacio |
| Fallo en auditoria bloquea operacion | Media | Alto | Try-catch en todas las llamadas de auditoria |
| Datos sensibles en logs | Media | Alto | No loguear passwords, tokens, datos medicos |

---

## 7. Checklist de Implementacion

### Base de Datos
- [x] Vista `vw_auditoria_modular_detallada` creada (script: spec/scripts/001_audit_view_and_indexes.sql)
- [x] Indices de optimizacion agregados (8 indices creados)
- [ ] Triggers de auditoria (opcional - no implementado)
- [x] Script de limpieza de logs antiguos (incluido en script SQL)

### Backend - Servicios Criticos
- [x] UsuarioServiceImpl integrado (CREATE_USER, DELETE_USER, ACTIVATE_USER, DEACTIVATE_USER, UNLOCK_USER)
- [ ] RolServiceImpl integrado (pendiente)
- [ ] PermisosServiceImpl integrado (pendiente)
- [x] AccountRequestService integrado (APPROVE_REQUEST, REJECT_REQUEST, DELETE_PENDING_USER, CLEANUP_ORPHAN_DATA)
- [x] AuthenticationServiceImpl verificado (ya tenia LOGIN, LOGIN_FAILED, LOGOUT)

### Backend - Servicios Secundarios
- [ ] PersonalCntServiceImpl integrado (pendiente)
- [ ] GestionPacienteService integrado (pendiente)
- [ ] SolicitudCitaService integrado (pendiente)

### Frontend
- [x] LogsDelSistema.jsx funcionando (filtros, paginacion, exportacion CSV)
- [ ] AuditDetailModal creado (pendiente - mejora futura)
- [x] Filtros avanzados implementados (usuario, modulo, accion, fechas)
- [ ] Exportacion PDF (pendiente - mejora futura)

### Alertas
- [ ] Sistema de alertas implementado (pendiente - fase futura)
- [ ] Notificaciones por email configuradas (pendiente - fase futura)
- [ ] Dashboard de alertas (pendiente - fase futura)

### Pruebas
- [ ] Tests unitarios de auditoria (pendiente)
- [ ] Tests de integracion (pendiente)
- [ ] Tests de performance (pendiente)
- [ ] Pruebas de seguridad (pendiente)

---

## 8. Comandos Utiles

### Verificar logs recientes
```sql
SELECT * FROM audit_logs ORDER BY fecha_hora DESC LIMIT 20;
```

### Contar logs por modulo
```sql
SELECT modulo, COUNT(*) FROM audit_logs GROUP BY modulo ORDER BY COUNT(*) DESC;
```

### Usuarios mas activos
```sql
SELECT usuario, COUNT(*) as acciones
FROM audit_logs
WHERE fecha_hora > NOW() - INTERVAL '7 days'
GROUP BY usuario
ORDER BY acciones DESC
LIMIT 10;
```

### Eventos de error
```sql
SELECT * FROM audit_logs
WHERE nivel IN ('ERROR', 'CRITICAL')
ORDER BY fecha_hora DESC;
```

### Limpiar logs antiguos (>90 dias)
```sql
DELETE FROM audit_logs WHERE fecha_hora < NOW() - INTERVAL '90 days';
```

---

## 9. Contacto y Soporte

| Rol | Contacto |
|-----|----------|
| Desarrollo Backend | cenate.analista@essalud.gob.pe |
| DBA | cenate.analista@essalud.gob.pe |
| Soporte | cenate.analista@essalud.gob.pe |

---

*Documento generado automaticamente - CENATE 2025*
