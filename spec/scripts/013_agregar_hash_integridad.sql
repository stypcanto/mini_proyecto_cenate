-- ========================================================================
-- Script: 013_agregar_hash_integridad.sql
-- Descripción: Agregar hash de integridad SHA-256 para detección de manipulación
-- Fecha: 2025-12-29
-- Autor: Ing. Styp Canto Rondón
-- ========================================================================

-- ============================================================
-- 1️⃣ AGREGAR COLUMNA HASH_INTEGRIDAD
-- ============================================================
ALTER TABLE audit_logs
ADD COLUMN IF NOT EXISTS hash_integridad VARCHAR(64);

COMMENT ON COLUMN audit_logs.hash_integridad IS 'Hash SHA-256 de integridad del registro para detectar manipulación';

-- Crear índice para búsquedas de verificación
CREATE INDEX IF NOT EXISTS idx_audit_logs_hash ON audit_logs(hash_integridad);

-- ============================================================
-- 2️⃣ FUNCIÓN PARA CALCULAR HASH SHA-256
-- ============================================================
-- Esta función calcula un hash SHA-256 basado en los campos críticos del log
CREATE OR REPLACE FUNCTION calcular_hash_auditoria(
    p_id BIGINT,
    p_usuario VARCHAR,
    p_action VARCHAR,
    p_modulo VARCHAR,
    p_detalle TEXT,
    p_ip_address VARCHAR,
    p_fecha_hora TIMESTAMP,
    p_nivel VARCHAR,
    p_estado VARCHAR,
    p_id_afectado BIGINT,
    p_datos_previos JSONB,
    p_datos_nuevos JSONB
) RETURNS VARCHAR AS $$
DECLARE
    v_concatenated TEXT;
BEGIN
    -- Concatenar todos los campos relevantes en orden predecible
    v_concatenated := CONCAT_WS('|',
        COALESCE(p_id::TEXT, ''),
        COALESCE(p_usuario, ''),
        COALESCE(p_action, ''),
        COALESCE(p_modulo, ''),
        COALESCE(p_detalle, ''),
        COALESCE(p_ip_address, ''),
        COALESCE(p_fecha_hora::TEXT, ''),
        COALESCE(p_nivel, ''),
        COALESCE(p_estado, ''),
        COALESCE(p_id_afectado::TEXT, ''),
        COALESCE(p_datos_previos::TEXT, ''),
        COALESCE(p_datos_nuevos::TEXT, '')
    );

    -- Calcular SHA-256
    RETURN encode(digest(v_concatenated, 'sha256'), 'hex');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================================
-- 3️⃣ TRIGGER AUTOMÁTICO PARA CALCULAR HASH AL INSERTAR
-- ============================================================
-- Este trigger calcula automáticamente el hash al insertar un nuevo log
CREATE OR REPLACE FUNCTION trigger_calcular_hash_auditoria()
RETURNS TRIGGER AS $$
BEGIN
    NEW.hash_integridad := calcular_hash_auditoria(
        NEW.id,
        NEW.usuario,
        NEW.action,
        NEW.modulo,
        NEW.detalle,
        NEW.ip_address,
        NEW.fecha_hora,
        NEW.nivel,
        NEW.estado,
        NEW.id_afectado,
        NEW.datos_previos,
        NEW.datos_nuevos
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger que se ejecuta ANTES de insertar
DROP TRIGGER IF EXISTS trg_audit_logs_hash ON audit_logs;
CREATE TRIGGER trg_audit_logs_hash
    BEFORE INSERT ON audit_logs
    FOR EACH ROW
    EXECUTE FUNCTION trigger_calcular_hash_auditoria();

-- ============================================================
-- 4️⃣ FUNCIÓN PARA VERIFICAR INTEGRIDAD DE UN REGISTRO
-- ============================================================
-- Verifica si un registro específico ha sido manipulado
CREATE OR REPLACE FUNCTION verificar_integridad_log(p_log_id BIGINT)
RETURNS TABLE(
    log_id BIGINT,
    hash_almacenado VARCHAR,
    hash_calculado VARCHAR,
    integridad_ok BOOLEAN,
    mensaje TEXT
) AS $$
DECLARE
    v_log RECORD;
    v_hash_calculado VARCHAR(64);
BEGIN
    -- Obtener el registro
    SELECT * INTO v_log FROM audit_logs WHERE id = p_log_id;

    IF NOT FOUND THEN
        RETURN QUERY SELECT
            p_log_id,
            NULL::VARCHAR,
            NULL::VARCHAR,
            FALSE,
            'Registro no encontrado'::TEXT;
        RETURN;
    END IF;

    -- Calcular hash actual
    v_hash_calculado := calcular_hash_auditoria(
        v_log.id,
        v_log.usuario,
        v_log.action,
        v_log.modulo,
        v_log.detalle,
        v_log.ip_address,
        v_log.fecha_hora,
        v_log.nivel,
        v_log.estado,
        v_log.id_afectado,
        v_log.datos_previos,
        v_log.datos_nuevos
    );

    -- Comparar con hash almacenado
    RETURN QUERY SELECT
        v_log.id,
        v_log.hash_integridad,
        v_hash_calculado,
        (v_log.hash_integridad = v_hash_calculado)::BOOLEAN,
        CASE
            WHEN v_log.hash_integridad IS NULL THEN 'Registro sin hash (anterior al sistema de integridad)'
            WHEN v_log.hash_integridad = v_hash_calculado THEN 'Integridad verificada correctamente'
            ELSE '⚠️ ALERTA: Posible manipulación detectada'
        END::TEXT;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 5️⃣ FUNCIÓN PARA VERIFICAR INTEGRIDAD DE TODOS LOS LOGS
-- ============================================================
-- Verifica la integridad de todos los registros de auditoría
CREATE OR REPLACE FUNCTION verificar_integridad_completa()
RETURNS TABLE(
    total_logs BIGINT,
    logs_con_hash BIGINT,
    logs_sin_hash BIGINT,
    logs_integros BIGINT,
    logs_manipulados BIGINT,
    porcentaje_integridad NUMERIC
) AS $$
DECLARE
    v_total BIGINT;
    v_con_hash BIGINT;
    v_sin_hash BIGINT;
    v_integros BIGINT;
    v_manipulados BIGINT;
BEGIN
    -- Total de logs
    SELECT COUNT(*) INTO v_total FROM audit_logs;

    -- Logs con hash
    SELECT COUNT(*) INTO v_con_hash FROM audit_logs WHERE hash_integridad IS NOT NULL;

    -- Logs sin hash
    v_sin_hash := v_total - v_con_hash;

    -- Verificar logs con hash
    SELECT
        COUNT(*) FILTER (WHERE hash_ok = TRUE),
        COUNT(*) FILTER (WHERE hash_ok = FALSE)
    INTO v_integros, v_manipulados
    FROM (
        SELECT
            id,
            hash_integridad = calcular_hash_auditoria(
                id, usuario, action, modulo, detalle, ip_address,
                fecha_hora, nivel, estado, id_afectado,
                datos_previos, datos_nuevos
            ) AS hash_ok
        FROM audit_logs
        WHERE hash_integridad IS NOT NULL
    ) AS verificacion;

    RETURN QUERY SELECT
        v_total,
        v_con_hash,
        v_sin_hash,
        v_integros,
        v_manipulados,
        CASE
            WHEN v_con_hash > 0 THEN ROUND((v_integros::NUMERIC / v_con_hash::NUMERIC) * 100, 2)
            ELSE 0
        END;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 6️⃣ VISTA PARA DETECTAR REGISTROS MANIPULADOS
-- ============================================================
CREATE OR REPLACE VIEW vw_audit_logs_manipulados AS
SELECT
    a.id,
    a.fecha_hora,
    a.usuario,
    a.action,
    a.modulo,
    a.detalle,
    a.ip_address,
    a.hash_integridad AS hash_almacenado,
    calcular_hash_auditoria(
        a.id, a.usuario, a.action, a.modulo, a.detalle, a.ip_address,
        a.fecha_hora, a.nivel, a.estado, a.id_afectado,
        a.datos_previos, a.datos_nuevos
    ) AS hash_calculado,
    '⚠️ MANIPULACIÓN DETECTADA' AS alerta
FROM audit_logs a
WHERE
    a.hash_integridad IS NOT NULL
    AND a.hash_integridad != calcular_hash_auditoria(
        a.id, a.usuario, a.action, a.modulo, a.detalle, a.ip_address,
        a.fecha_hora, a.nivel, a.estado, a.id_afectado,
        a.datos_previos, a.datos_nuevos
    );

COMMENT ON VIEW vw_audit_logs_manipulados IS 'Logs de auditoría con evidencia de manipulación (hash no coincide)';

-- ============================================================
-- 7️⃣ CALCULAR HASH PARA REGISTROS EXISTENTES (MIGRACIÓN)
-- ============================================================
-- Actualizar registros existentes que no tienen hash
UPDATE audit_logs
SET hash_integridad = calcular_hash_auditoria(
    id, usuario, action, modulo, detalle, ip_address,
    fecha_hora, nivel, estado, id_afectado,
    datos_previos, datos_nuevos
)
WHERE hash_integridad IS NULL;

-- ============================================================
-- 8️⃣ VERIFICACIONES Y REPORTES
-- ============================================================

-- Verificar que el trigger funciona
COMMENT ON TRIGGER trg_audit_logs_hash ON audit_logs IS
'Calcula automáticamente el hash SHA-256 de integridad antes de insertar';

-- Reporte de integridad
SELECT
    '✅ SISTEMA DE INTEGRIDAD INSTALADO' AS mensaje,
    *
FROM verificar_integridad_completa();

-- Ejemplos de uso
SELECT
    '📋 EJEMPLOS DE USO:' AS seccion,
    '' AS consulta;

-- Ejemplo 1: Verificar un log específico
SELECT
    '1️⃣ Verificar integridad de un log específico:' AS ejemplo,
    'SELECT * FROM verificar_integridad_log(123);' AS consulta;

-- Ejemplo 2: Verificar todos los logs
SELECT
    '2️⃣ Verificar integridad completa del sistema:' AS ejemplo,
    'SELECT * FROM verificar_integridad_completa();' AS consulta;

-- Ejemplo 3: Ver logs manipulados
SELECT
    '3️⃣ Ver logs con evidencia de manipulación:' AS ejemplo,
    'SELECT * FROM vw_audit_logs_manipulados;' AS consulta;

-- Ejemplo 4: Estadísticas de integridad por módulo
SELECT
    '4️⃣ Estadísticas de integridad por módulo:' AS ejemplo,
    'SELECT modulo, COUNT(*), COUNT(*) FILTER (WHERE hash_integridad IS NOT NULL) AS con_hash FROM audit_logs GROUP BY modulo;' AS consulta;
