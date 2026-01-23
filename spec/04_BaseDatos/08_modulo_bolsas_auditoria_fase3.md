# 🔐 Auditoría Completa - Módulo de Bolsas Fase 3

> Sistema integral de auditoría para rastrear todos los cambios en solicitudes de bolsa de pacientes

**Versión:** v1.33.0
**Fecha:** 2026-01-22
**Status:** ✅ IMPLEMENTADO
**Compliance:** CENATE + EsSalud Auditoría Normativa

---

## 📋 Índice

1. [Propósito](#propósito)
2. [Tablas de Auditoría](#tablas-de-auditoría)
3. [Triggers Implementados](#triggers-implementados)
4. [Vistas y Procedimientos](#vistas-y-procedimientos)
5. [Casos de Uso](#casos-de-uso)
6. [Consultas Ejemplos](#consultas-ejemplos)

---

## Propósito

El sistema de auditoría de Fase 3 registra **todos los cambios** realizados en las solicitudes de bolsa:

✅ **Quién** - Usuario que realizó el cambio
✅ **Qué** - Campo modificado y valores antes/después
✅ **Cuándo** - Fecha y hora exacta del cambio
✅ **Dónde** - Tabla, registro y contexto
✅ **Por qué** - Motivo del cambio (cuando aplica)

---

## Tablas de Auditoría

### 1. `dim_auditoria_cambios_solicitud`

Registra **cada cambio** realizado en cualquier campo de una solicitud.

```sql
CREATE TABLE dim_auditoria_cambios_solicitud (
    id_auditoria BIGSERIAL PRIMARY KEY,
    id_solicitud BIGINT NOT NULL,              -- FK solicitud
    usuario_id BIGINT,                         -- Quién hizo el cambio
    usuario_nombre VARCHAR(255),
    tipo_operacion VARCHAR(20),                -- INSERT, UPDATE, DELETE
    campo_modificado VARCHAR(255),             -- Campo que cambió
    valor_anterior TEXT,                       -- Valor antes
    valor_nuevo TEXT,                          -- Valor después
    fecha_cambio TIMESTAMP WITH TIME ZONE,     -- Cuándo
    ip_cliente VARCHAR(50),                    -- Para auditoría de seguridad
    user_agent TEXT,                           -- Browser/app
    created_at TIMESTAMP WITH TIME ZONE,
    activo BOOLEAN
);
```

**Índices:**
- `id_solicitud` - Búsqueda rápida por solicitud
- `usuario_id` - Auditoría por usuario
- `tipo_operacion` - Filtrar por tipo
- `fecha_cambio DESC` - Últimos cambios

**Casos de Uso:**
- "¿Quién cambió el estado de la solicitud 123?"
- "¿Qué campos fueron modificados?"
- "Listar todos los cambios del 2026-01-22"

---

### 2. `dim_auditoria_estado_solicitud`

Historial **especializado** de transiciones de estado.

```sql
CREATE TABLE dim_auditoria_estado_solicitud (
    id_historial BIGSERIAL PRIMARY KEY,
    id_solicitud BIGINT NOT NULL,
    estado_anterior VARCHAR(50),               -- Ej: PENDIENTE
    estado_nuevo VARCHAR(50) NOT NULL,         -- Ej: APROBADA
    usuario_id BIGINT,
    usuario_nombre VARCHAR(255),
    motivo_cambio VARCHAR(500),                -- Razón del cambio
    fecha_transicion TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE,
    activo BOOLEAN
);
```

**Propósito:** Seguimiento de flujo de solicitudes

**Estados Rastreados:**
- PENDIENTE → APROBADA
- APROBADA → RECHAZADA
- Cualquier → ATENDIDA
- etc.

---

### 3. `dim_auditoria_contacto_paciente`

Cambios de **información de contacto** (teléfono y email).

```sql
CREATE TABLE dim_auditoria_contacto_paciente (
    id_cambio BIGSERIAL PRIMARY KEY,
    id_solicitud BIGINT NOT NULL,
    tipo_contacto VARCHAR(20),                 -- TELEFONO, EMAIL
    valor_anterior VARCHAR(255),
    valor_nuevo VARCHAR(255) NOT NULL,
    usuario_id BIGINT,
    usuario_nombre VARCHAR(255),
    razon_cambio VARCHAR(255),                 -- "Paciente actualizó"
    fecha_cambio TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE,
    activo BOOLEAN
);
```

**Propósito:** Rastrear cambios de contacto (importante para entrega de recordatorios)

**Triggers Automáticos:**
- Cambio de `paciente_telefono` → insert en esta tabla
- Cambio de `paciente_email` → insert en esta tabla

---

### 4. `dim_auditoria_asignacion_gestora`

Historial de **asignaciones a gestoras de citas**.

```sql
CREATE TABLE dim_auditoria_asignacion_gestora (
    id_cambio BIGSERIAL PRIMARY KEY,
    id_solicitud BIGINT NOT NULL,
    gestora_anterior_id BIGINT,                -- Gestora previa
    gestora_anterior_nombre VARCHAR(255),
    gestora_nueva_id BIGINT,                   -- Gestora nueva
    gestora_nueva_nombre VARCHAR(255) NOT NULL,
    coordinador_id BIGINT,                     -- Quién asignó
    coordinador_nombre VARCHAR(255),
    razon_reasignacion VARCHAR(500),           -- "Sobrecarga"
    fecha_asignacion TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE,
    activo BOOLEAN
);
```

**Propósito:** Rastrear distribucion de solicitudes a gestoras

**Utilidad:**
- "¿Cuántas solicitudes tiene gestora X?"
- "¿A quién fue asignada la solicitud 123?"
- "Historial de reasignaciones"

---

### 5. `dim_auditoria_recordatorios`

Registro de **todos los recordatorios** enviados (WhatsApp/Email).

```sql
CREATE TABLE dim_auditoria_recordatorios (
    id_recordatorio BIGSERIAL PRIMARY KEY,
    id_solicitud BIGINT NOT NULL,
    tipo_recordatorio VARCHAR(20),             -- EMAIL, WHATSAPP
    contacto_destino VARCHAR(255),             -- Email o teléfono
    mensaje_enviado TEXT,
    estado_entrega VARCHAR(50),                -- PENDIENTE, ENVIADO, FALLIDO
    error_mensaje TEXT,                        -- Si falló
    usuario_solicitante_id BIGINT,
    usuario_solicitante_nombre VARCHAR(255),
    fecha_solicitud TIMESTAMP WITH TIME ZONE,
    fecha_entrega TIMESTAMP WITH TIME ZONE,    -- Cuándo se entregó
    created_at TIMESTAMP WITH TIME ZONE,
    activo BOOLEAN
);
```

**Propósito:** Cumplimiento normativo de recordatorios

**Beneficios:**
- "¿Se envió recordatorio al paciente X?"
- "¿Cuántos recordatorios fallaron?"
- "Prueba de envío para auditoría"

---

## Triggers Implementados

### 1️⃣ `trg_auditoria_creacion_solicitud`

**Evento:** INSERT en `dim_solicitud_bolsa`

```plpgsql
AFTER INSERT → fn_auditoria_creacion_solicitud()
```

**Acción:** Registra en `dim_auditoria_estado_solicitud` la creación inicial

```sql
INSERT INTO dim_auditoria_estado_solicitud (
    id_solicitud, estado_anterior=NULL, estado_nuevo='PENDIENTE', ...
)
```

---

### 2️⃣ `trg_auditoria_estado_solicitud`

**Evento:** UPDATE de `estado` en `dim_solicitud_bolsa`

```plpgsql
AFTER UPDATE → fn_auditoria_cambio_estado()
```

**Acción:** Registra cambios de estado

```sql
OLD.estado != NEW.estado
→ INSERT INTO dim_auditoria_estado_solicitud
```

**Ejemplo:**
```
PENDIENTE → APROBADA: Registrado en auditoria
APROBADA → RECHAZADA: Registrado en auditoria
```

---

### 3️⃣ `trg_auditoria_telefono_solicitud`

**Evento:** UPDATE de `paciente_telefono` en `dim_solicitud_bolsa`

```plpgsql
AFTER UPDATE → fn_auditoria_cambio_telefono()
```

**Acción:** Registra cambio de teléfono

```sql
OLD.paciente_telefono != NEW.paciente_telefono
→ INSERT INTO dim_auditoria_contacto_paciente (tipo_contacto='TELEFONO')
```

---

### 4️⃣ `trg_auditoria_email_solicitud`

**Evento:** UPDATE de `paciente_email` en `dim_solicitud_bolsa`

```plpgsql
AFTER UPDATE → fn_auditoria_cambio_email()
```

**Acción:** Registra cambio de email

```sql
OLD.paciente_email != NEW.paciente_email
→ INSERT INTO dim_auditoria_contacto_paciente (tipo_contacto='EMAIL')
```

---

### 5️⃣ `trg_auditoria_gestora_solicitud`

**Evento:** UPDATE de `responsable_gestora_id` en `dim_solicitud_bolsa`

```plpgsql
AFTER UPDATE → fn_auditoria_cambio_gestora()
```

**Acción:** Registra cambio de asignación a gestora

```sql
OLD.responsable_gestora_id != NEW.responsable_gestora_id
→ INSERT INTO dim_auditoria_asignacion_gestora
```

---

## Vistas y Procedimientos

### Vista: `vw_auditoria_completa_solicitud`

**Propósito:** Unificar toda la auditoría en una única vista

```sql
SELECT
    id_solicitud, numero_solicitud, paciente_nombre,
    tipo_evento, fecha_evento, descripcion_evento, usuario_nombre
FROM vw_auditoria_completa_solicitud
WHERE id_solicitud = 123
ORDER BY fecha_evento DESC;
```

**Tipos de Eventos Incluidos:**
- CREACIÓN
- CAMBIO ESTADO
- CAMBIO CONTACTO (Teléfono/Email)
- CAMBIO GESTORA
- RECORDATORIO EMAIL
- RECORDATORIO WHATSAPP

---

### Procedimiento: `sp_obtener_auditoria_solicitud(id_solicitud, limite)`

**Uso:** Obtener auditoría completa de una solicitud

```sql
SELECT * FROM sp_obtener_auditoria_solicitud(123, 100);
```

**Output:**
```
tipo_evento          | fecha_evento              | descripcion             | usuario_nombre
---------------------|---------------------------|-------------------------|------------------
CREACIÓN             | 2026-01-22 10:00:00       | Solicitud creada        | NULL
CAMBIO ESTADO        | 2026-01-22 10:15:00       | PENDIENTE → APROBADA    | admin@system
CAMBIO CONTACTO      | 2026-01-22 10:20:00       | TELEFONO +51987654321 → +51 | María García
CAMBIO GESTORA       | 2026-01-22 10:25:00       | Asignada a gestora María | Coordinador123
RECORDATORIO EMAIL   | 2026-01-22 11:00:00       | EMAIL enviado - ENVIADO | María García
```

---

### Procedimiento: `sp_reportar_cambios_solicitud(fecha_inicio, fecha_fin)`

**Uso:** Generar reporte de cambios en rango de fechas

```sql
SELECT * FROM sp_reportar_cambios_solicitud('2026-01-01', '2026-01-31');
```

**Output (Consolidado):**
```
id_solicitud | numero_solicitud | paciente_nombre  | tipo_evento      | cantidad_eventos | ultima_fecha_evento
----|------------|------------------|-----|------|
1            | BOLSA-20260122-01 | María Gonzales   | CAMBIO ESTADO    | 3                | 2026-01-22 15:30:00
2            | BOLSA-20260122-02 | Juan Pérez       | RECORDATORIO EMAIL| 2                | 2026-01-22 14:45:00
```

---

## Casos de Uso

### 1. Auditoría Normativa
**Pregunta:** "¿Puedo demostrar que enviamos recordatorio al paciente X?"

```sql
SELECT * FROM dim_auditoria_recordatorios
WHERE id_solicitud = 123
  AND tipo_recordatorio = 'EMAIL'
  AND estado_entrega = 'ENVIADO';
```

---

### 2. Seguimiento de Solicitud
**Pregunta:** "¿Cuál es el historial completo de solicitud 456?"

```sql
SELECT * FROM sp_obtener_auditoria_solicitud(456);
```

---

### 3. Análisis de Gestoras
**Pregunta:** "¿Cuántas solicitudes se reasignaron?"

```sql
SELECT gestora_anterior_nombre, gestora_nueva_nombre, COUNT(*) as cantidad
FROM dim_auditoria_asignacion_gestora
WHERE DATE(fecha_asignacion) = CURRENT_DATE
GROUP BY gestora_anterior_nombre, gestora_nueva_nombre;
```

---

### 4. Detección de Cambios Sospechosos
**Pregunta:** "¿Quién cambió estados múltiples veces en una solicitud?"

```sql
SELECT id_solicitud, usuario_nombre, COUNT(*) as cambios
FROM dim_auditoria_estado_solicitud
WHERE DATE(fecha_transicion) = CURRENT_DATE
GROUP BY id_solicitud, usuario_nombre
HAVING COUNT(*) > 5
ORDER BY cambios DESC;
```

---

### 5. Reporte Mensual
**Pregunta:** "¿Resumen de cambios enero 2026?"

```sql
SELECT * FROM sp_reportar_cambios_solicitud('2026-01-01', '2026-01-31');
```

---

## Consultas Ejemplos

### Auditoría de Usuario Específico

```sql
SELECT
    s.numero_solicitud,
    dac.tipo_operacion,
    dac.campo_modificado,
    dac.valor_anterior,
    dac.valor_nuevo,
    dac.fecha_cambio
FROM dim_auditoria_cambios_solicitud dac
JOIN dim_solicitud_bolsa s ON dac.id_solicitud = s.id_solicitud
WHERE dac.usuario_nombre = 'María García'
  AND DATE(dac.fecha_cambio) = CURRENT_DATE
ORDER BY dac.fecha_cambio DESC;
```

---

### Cambios de Contacto en el Día

```sql
SELECT
    s.numero_solicitud,
    s.paciente_nombre,
    dac.tipo_contacto,
    dac.valor_anterior,
    dac.valor_nuevo,
    dac.usuario_nombre,
    dac.fecha_cambio
FROM dim_auditoria_contacto_paciente dac
JOIN dim_solicitud_bolsa s ON dac.id_solicitud = s.id_solicitud
WHERE DATE(dac.fecha_cambio) = CURRENT_DATE
ORDER BY dac.fecha_cambio DESC;
```

---

### Recordatorios No Entregados

```sql
SELECT
    s.numero_solicitud,
    s.paciente_nombre,
    dar.tipo_recordatorio,
    dar.contacto_destino,
    dar.error_mensaje,
    dar.fecha_solicitud
FROM dim_auditoria_recordatorios dar
JOIN dim_solicitud_bolsa s ON dar.id_solicitud = s.id_solicitud
WHERE dar.estado_entrega = 'FALLIDO'
  AND DATE(dar.fecha_solicitud) >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY dar.fecha_solicitud DESC;
```

---

## Beneficios de Auditoría Fase 3

| Beneficio | Descripción |
|-----------|-------------|
| **Cumplimiento Normativo** | Cumple requisitos de auditoría CENATE + EsSalud |
| **Trazabilidad Total** | Quién, qué, cuándo, dónde para cada cambio |
| **Seguridad** | Detecta cambios sospechosos o no autorizados |
| **Análisis** | Reportes consolidados de actividad |
| **Debugging** | Investigar problemas históricos rápidamente |
| **Responsabilidad** | Demuestra quién hizo cada acción |
| **Cumplimiento de Entrega** | Prueba de envío de recordatorios |

---

## Estadísticas de Implementación

- **Tablas de Auditoría:** 5
- **Triggers:** 5
- **Vistas:** 1
- **Procedimientos:** 2
- **Índices:** 14
- **Líneas SQL:** ~550

---

*EsSalud Perú - CENATE | Auditoría Módulo Bolsas v1.33.0 | 2026-01-22*
