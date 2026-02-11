# Queries SQL para Verificación - Trazabilidad Clínica

**Versión:** v1.81.0
**Última actualización:** 2026-02-11

---

## 🎯 Propósito

Este documento proporciona queries SQL para verificar que el módulo de Trazabilidad esté funcionando correctamente. Úsalas para validar después de implementar o probar cambios.

---

## ✅ Test 1: Verificar Atención Registrada en MisPacientes

### Query: Ver atenciones recientes de un asegurado

```sql
-- Buscar todas las atenciones de un asegurado
SELECT
    a.id_atencion,
    a.pk_asegurado,
    aseg.doc_paciente,
    aseg.primer_nombre || ' ' || aseg.primer_apellido as nombre_paciente,
    a.fecha_atencion,
    a.motivo_consulta,
    a.diagnostico,
    a.observaciones_generales,
    a.id_personal_creador,
    a.created_at
FROM atencion_clinica a
JOIN asegurados aseg ON a.pk_asegurado = aseg.pk_asegurado
WHERE aseg.doc_paciente = '09950203'
ORDER BY a.created_at DESC
LIMIT 10;
```

**Expectativas:**
- ✅ Registro reciente con `fecha_atencion` ≈ ahora
- ✅ `motivo_consulta` contiene "Atención programada desde Mis Pacientes"
- ✅ `observaciones_generales` comienza con "Origen: MIS_PACIENTES"
- ✅ `created_at` es timestamp reciente

**Resultado esperado:**

| id_atencion | pk_asegurado | doc_paciente | nombre_paciente | fecha_atencion | motivo_consulta | diagnostico | observaciones_generales | id_personal_creador | created_at |
|---|---|---|---|---|---|---|---|---|---|
| 12345 | ASE-001 | 09950203 | VERASTEGUI JORGE VICTOR | 2026-02-11 16:45:30-05 | Atención programada desde Mis Pacientes - MODULO_107 | Atendido | Origen: MIS_PACIENTES ID Referencia: 43484 ... | 390 | 2026-02-11 16:45:30 |

---

## ✅ Test 2: Verificar Sincronización ECG

### Query 2a: Ver estado de ECGs después de sincronización

```sql
-- Ver ECGs para paciente (mostrar estado actual)
SELECT
    te.id_imagen,
    te.num_doc_paciente,
    te.estado,
    te.evaluacion,
    te.descripcion_evaluacion,
    te.fecha_evaluacion,
    te.nota_clinica_hallazgos,
    te.nota_clinica_observaciones,
    te.updated_at
FROM tele_ecg_imagenes te
WHERE te.num_doc_paciente = '09950203'
   OR te.num_doc_paciente = '9950203'  -- Buscar ambas variantes
ORDER BY te.fecha_envio DESC;
```

**Expectativas:**
- ✅ ECGs con estado ENVIADA deben estar como ATENDIDA después de marcar paciente
- ✅ `fecha_evaluacion` se actualiza a ahora
- ✅ `updated_at` es reciente

**Resultado esperado:**

| id_imagen | num_doc_paciente | estado | evaluacion | descripcion_evaluacion | fecha_evaluacion | updated_at |
|---|---|---|---|---|---|---|
| 16 | 09950203 | ATENDIDA | ANORMAL | Arritmia cardíaca | 2026-02-11 16:45:30 | 2026-02-11 16:45:30 |
| 15 | 09950203 | ATENDIDA | NORMAL | ECG normal | 2026-02-10 14:30:00 | 2026-02-10 14:30:00 |

### Query 2b: Verificar atenciones registradas desde TeleECG

```sql
-- Ver atenciones registradas desde TeleECG IPRESS
SELECT
    a.id_atencion,
    a.pk_asegurado,
    aseg.doc_paciente,
    a.motivo_consulta,
    a.diagnostico,
    a.observaciones_generales,
    a.created_at
FROM atencion_clinica a
JOIN asegurados aseg ON a.pk_asegurado = aseg.pk_asegurado
WHERE aseg.doc_paciente = '09950203'
  AND a.observaciones_generales ILIKE '%TELEECG_IPRESS%'
ORDER BY a.created_at DESC;
```

**Expectativas:**
- ✅ Registro con origen TELEECG_IPRESS
- ✅ `motivo_consulta` = "Evaluación de electrocardiograma"
- ✅ `observaciones_generales` comienza con "Origen: TELEECG_IPRESS"

---

## ✅ Test 3: Verificar Historial Consolidado

### Query: Ver timeline completo de atenciones

```sql
-- Timeline de todas las atenciones de un paciente
SELECT
    a.id_atencion,
    a.fecha_atencion AT TIME ZONE 'America/Lima' as fecha_local,
    CASE
        WHEN a.observaciones_generales ILIKE '%MIS_PACIENTES%' THEN 'MisPacientes'
        WHEN a.observaciones_generales ILIKE '%TELEECG_IPRESS%' THEN 'TeleECG IPRESS'
        WHEN a.observaciones_generales ILIKE '%GESTION_CITAS%' THEN 'Gestión Citas'
        ELSE 'Otro'
    END as origen,
    a.motivo_consulta,
    a.diagnostico,
    SUBSTRING(a.observaciones_generales, 1, 100) as observaciones_preview
FROM atencion_clinica a
JOIN asegurados aseg ON a.pk_asegurado = aseg.pk_asegurado
WHERE aseg.doc_paciente = '09950203'
ORDER BY a.fecha_atencion DESC;
```

**Expectativas:**
- ✅ Múltiples atenciones (MisPacientes, TeleECG)
- ✅ Ordenadas por fecha descendente (más recientes primero)
- ✅ Cada una con origen claramente identificable

---

## ✅ Test 4: Verificar Integridad de Datos

### Query: Validar FK a asegurados

```sql
-- Verificar que todas las atenciones tienen asegurado válido
SELECT
    COUNT(*) as total_atenciones,
    COUNT(DISTINCT a.pk_asegurado) as asegurados_distintos,
    COUNT(CASE WHEN aseg.pk_asegurado IS NULL THEN 1 END) as sin_asegurado
FROM atencion_clinica a
LEFT JOIN asegurados aseg ON a.pk_asegurado = aseg.pk_asegurado
WHERE DATE(a.created_at) = CURRENT_DATE;
```

**Expectativas:**
- ✅ `sin_asegurado` = 0 (todas las atenciones tienen asegurado válido)
- ✅ `total_atenciones` ≥ 1 (al menos una atención registrada hoy)

---

## ✅ Test 5: Estadísticas de Origen

### Query: Contar atenciones por origen

```sql
-- Estadísticas de atenciones registradas hoy
SELECT
    CASE
        WHEN observaciones_generales ILIKE '%MIS_PACIENTES%' THEN 'MisPacientes'
        WHEN observaciones_generales ILIKE '%TELEECG_IPRESS%' THEN 'TeleECG IPRESS'
        WHEN observaciones_generales ILIKE '%GESTION_CITAS%' THEN 'Gestión Citas'
        ELSE 'Otro'
    END as origen,
    COUNT(*) as total,
    COUNT(DISTINCT pk_asegurado) as asegurados_distintos
FROM atencion_clinica
WHERE DATE(created_at) = CURRENT_DATE
GROUP BY origen
ORDER BY total DESC;
```

**Expectativas:**
- ✅ MisPacientes: ≥ 1
- ✅ TeleECG IPRESS: ≥ 0 (depende si hay ECGs)
- ✅ Total = suma de todos

---

## ✅ Test 6: Verificar Sincronización Bidireccional

### Query: Comparar registros en dim_solicitud_bolsa vs atencion_clinica

```sql
-- Verificar que atención en bolsa tiene registro en historial
SELECT
    sb.id_solicitud,
    sb.paciente_dni,
    sb.condicion_medica,
    sb.fecha_atencion_medica,
    COALESCE(COUNT(ac.id_atencion), 0) as registros_en_historial
FROM dim_solicitud_bolsa sb
LEFT JOIN atencion_clinica ac
    ON ac.pk_asegurado = (
        SELECT pk_asegurado FROM asegurados
        WHERE doc_paciente = sb.paciente_dni
        LIMIT 1
    )
    AND DATE(ac.created_at) = DATE(sb.fecha_atencion_medica)
WHERE sb.condicion_medica = 'Atendido'
  AND DATE(sb.fecha_atencion_medica) = CURRENT_DATE
GROUP BY sb.id_solicitud, sb.paciente_dni, sb.condicion_medica, sb.fecha_atencion_medica
HAVING COUNT(ac.id_atencion) = 0;  -- Mostrar faltantes
```

**Expectativas:**
- ✅ Resultado vacío (todas las atenciones tienen registro en historial)
- ⚠️ Si hay filas: significa que hay atenciones sin registro (error a investigar)

---

## ✅ Test 7: Verificar Normalización DNI

### Query: Ver DNIs diferentes para mismo paciente

```sql
-- Detectar si hay registros ECG con DNI variante
SELECT DISTINCT
    'tele_ecg_imagenes' as tabla,
    num_doc_paciente as dni,
    COUNT(*) as total
FROM tele_ecg_imagenes
WHERE num_doc_paciente IN ('09950203', '9950203')
GROUP BY num_doc_paciente

UNION ALL

SELECT DISTINCT
    'asegurados' as tabla,
    doc_paciente as dni,
    COUNT(*) as total
FROM asegurados
WHERE doc_paciente IN ('09950203', '9950203')
GROUP BY doc_paciente;
```

**Expectativas:**
- ✅ Ambas variantes de DNI funcionan para búsqueda
- ✅ Servicio encuentra ECGs sin importar formato

---

## ✅ Test 8: Auditoría de Cambios

### Query: Ver historial de cambios en ECG

```sql
-- Ver cuándo se actualizó estado de ECG (auditoría)
SELECT
    id_imagen,
    num_doc_paciente,
    estado,
    fecha_evaluacion,
    updated_at,
    EXTRACT(EPOCH FROM (updated_at - created_at)) / 60 as minutos_desde_creacion
FROM tele_ecg_imagenes
WHERE DATE(updated_at) = CURRENT_DATE
  AND estado = 'ATENDIDA'
ORDER BY updated_at DESC;
```

**Expectativas:**
- ✅ `updated_at` es reciente
- ✅ `fecha_evaluacion` coincide con timestamp de cambio
- ✅ Muestra auditoría clara de cuándo se actualizó

---

## 🔍 Queries de Diagnóstico

### Query de Diagnóstico 1: ¿Por qué no se registró la atención?

```sql
-- Buscar alertas en logs para paciente específico
SELECT
    DATE(created_at) as fecha,
    HOUR(created_at) as hora,
    COUNT(*) as intentos
FROM atencion_clinica
WHERE pk_asegurado = (
    SELECT pk_asegurado FROM asegurados
    WHERE doc_paciente = '09950203'
    LIMIT 1
)
GROUP BY DATE(created_at), HOUR(created_at)
ORDER BY created_at DESC;

-- Si no hay registros: verificar si existe asegurado
SELECT pk_asegurado, doc_paciente, primer_nombre
FROM asegurados
WHERE doc_paciente = '09950203';
```

### Query de Diagnóstico 2: Verificar integridad de FK

```sql
-- Atenciones sin asegurado (error de integridad)
SELECT a.id_atencion, a.pk_asegurado
FROM atencion_clinica a
WHERE NOT EXISTS (
    SELECT 1 FROM asegurados
    WHERE pk_asegurado = a.pk_asegurado
)
LIMIT 10;

-- Si hay resultados: ALERTA (violar FK)
```

### Query de Diagnóstico 3: Ver últimas 5 atenciones registradas

```sql
-- Las 5 atenciones más recientes (cualquier paciente)
SELECT
    a.id_atencion,
    aseg.doc_paciente,
    a.fecha_atencion,
    a.motivo_consulta,
    SUBSTRING(a.observaciones_generales, 1, 60) as origen_preview,
    a.created_at
FROM atencion_clinica a
JOIN asegurados aseg ON a.pk_asegurado = aseg.pk_asegurado
ORDER BY a.created_at DESC
LIMIT 5;
```

---

## 📊 Queries de Reporte

### Reporte 1: Resumen de Trazabilidad Hoy

```sql
SELECT
    DATE(a.created_at) as fecha,
    COUNT(*) as total_atenciones,
    COUNT(DISTINCT a.pk_asegurado) as asegurados_atendidos,
    COUNT(DISTINCT a.id_personal_creador) as medicos_que_atendieron,
    COUNT(CASE WHEN a.observaciones_generales ILIKE '%MIS_PACIENTES%' THEN 1 END) as mispacientes,
    COUNT(CASE WHEN a.observaciones_generales ILIKE '%TELEECG_IPRESS%' THEN 1 END) as teleecg,
    COUNT(CASE WHEN a.observaciones_generales ILIKE '%GESTION_CITAS%' THEN 1 END) as gestion_citas
FROM atencion_clinica a
WHERE DATE(a.created_at) = CURRENT_DATE
GROUP BY DATE(a.created_at);
```

### Reporte 2: Médicos Más Activos

```sql
-- Médicos que registraron más atenciones
SELECT
    a.id_personal_creador,
    p.desc_persona,
    COUNT(*) as atenciones_registradas,
    COUNT(DISTINCT a.pk_asegurado) as pacientes_distintos,
    DATE_TRUNC('day', MAX(a.created_at)) as ultimo_registro
FROM atencion_clinica a
LEFT JOIN dim_personal_cnt p ON a.id_personal_creador = p.id_pers
WHERE DATE(a.created_at) = CURRENT_DATE
GROUP BY a.id_personal_creador, p.desc_persona
ORDER BY atenciones_registradas DESC;
```

---

## 🚀 Script de Testing Automático

### Script SQL Completo para Validación

```sql
-- =====================================================
-- SCRIPT DE VALIDACIÓN - TRAZABILIDAD v1.81.0
-- =====================================================

-- 1. Verificar que TrazabilidadClinicaService está activo
SELECT 'Atenciones registradas hoy:' as test_name,
       COUNT(*) as resultado
FROM atencion_clinica
WHERE DATE(created_at) = CURRENT_DATE;

-- 2. Verificar ECGs sincronizados
SELECT 'ECGs actualizados a ATENDIDA hoy:' as test_name,
       COUNT(*) as resultado
FROM tele_ecg_imagenes
WHERE DATE(updated_at) = CURRENT_DATE
  AND estado = 'ATENDIDA';

-- 3. Verificar integridad de FKs
SELECT 'Integridad: Atenciones sin asegurado:' as test_name,
       COUNT(*) as resultado
FROM atencion_clinica a
LEFT JOIN asegurados aseg ON a.pk_asegurado = aseg.pk_asegurado
WHERE aseg.pk_asegurado IS NULL;

-- 4. Verificar que no hay observaciones truncadas
SELECT 'Advertencia: Observaciones truncadas (>2000 chars):' as test_name,
       COUNT(*) as resultado
FROM atencion_clinica
WHERE CHAR_LENGTH(observaciones_generales) > 2000;

-- 5. Resumen final
SELECT
    'RESUMEN FINAL' as status,
    COUNT(*) as total_atenciones,
    COUNT(DISTINCT pk_asegurado) as pacientes,
    MAX(created_at) as ultima_atencion
FROM atencion_clinica
WHERE DATE(created_at) = CURRENT_DATE;
```

---

## 📚 Referencias

- Ejemplo completo: [`01_registro_mispacientes.md`](01_registro_mispacientes.md)
- API del servicio: [`../api/01_servicio_trazabilidad.md`](../api/01_servicio_trazabilidad.md)
- Tabla atencion_clinica: `spec/database/atencion_clinica.md`
