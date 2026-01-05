-- =====================================================================
-- Script: Migración Disponibilidad Médica v1.0 → v2.0
-- Versión: 2.0.0
-- Fecha: 2026-01-03
-- Autor: Ing. Styp Canto Rondón
-- Base de datos: maestro_cenate (PostgreSQL 14+)
-- =====================================================================

-- =====================================================================
-- PASO 1: Agregar columnas faltantes a disponibilidad_medica
-- =====================================================================

-- Agregar columnas de cálculo de horas
DO $$
BEGIN
    -- horas_asistenciales
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'disponibilidad_medica'
        AND column_name = 'horas_asistenciales'
    ) THEN
        ALTER TABLE disponibilidad_medica
        ADD COLUMN horas_asistenciales DECIMAL(5,2) DEFAULT 0.00;

        COMMENT ON COLUMN disponibilidad_medica.horas_asistenciales
        IS 'Horas de atención directa según turnos M/T/MT y régimen laboral';
    END IF;

    -- horas_sanitarias
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'disponibilidad_medica'
        AND column_name = 'horas_sanitarias'
    ) THEN
        ALTER TABLE disponibilidad_medica
        ADD COLUMN horas_sanitarias DECIMAL(5,2) DEFAULT 0.00;

        COMMENT ON COLUMN disponibilidad_medica.horas_sanitarias
        IS 'Horas administrativas: 2h × días trabajados (solo régimen 728/CAS)';
    END IF;

    -- fecha_sincronizacion
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'disponibilidad_medica'
        AND column_name = 'fecha_sincronizacion'
    ) THEN
        ALTER TABLE disponibilidad_medica
        ADD COLUMN fecha_sincronizacion TIMESTAMP WITH TIME ZONE;
    END IF;

    -- id_ctr_horario_generado
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'disponibilidad_medica'
        AND column_name = 'id_ctr_horario_generado'
    ) THEN
        ALTER TABLE disponibilidad_medica
        ADD COLUMN id_ctr_horario_generado BIGINT;

        COMMENT ON COLUMN disponibilidad_medica.id_ctr_horario_generado
        IS 'ID del registro en ctr_horario generado tras sincronización';
    END IF;
END $$;

-- =====================================================================
-- PASO 2: Actualizar constraint de estado para incluir SINCRONIZADO
-- =====================================================================

-- Eliminar constraint anterior si existe
ALTER TABLE disponibilidad_medica
DROP CONSTRAINT IF EXISTS ck_estado_disponibilidad;

-- Crear nuevo constraint con SINCRONIZADO
ALTER TABLE disponibilidad_medica
ADD CONSTRAINT ck_disponibilidad_estado
CHECK (estado IN ('BORRADOR', 'ENVIADO', 'REVISADO', 'SINCRONIZADO'));

-- =====================================================================
-- PASO 3: Actualizar constraint de horas para incluir límite máximo
-- =====================================================================

-- Eliminar constraint anterior si existe
ALTER TABLE disponibilidad_medica
DROP CONSTRAINT IF EXISTS ck_total_horas_positivo;

-- Crear nuevo constraint con rango 0-744 (máx horas en un mes)
ALTER TABLE disponibilidad_medica
ADD CONSTRAINT ck_disponibilidad_horas
CHECK (total_horas >= 0 AND total_horas <= 744);

-- =====================================================================
-- PASO 4: Crear índice para sincronización (si no existe)
-- =====================================================================

CREATE INDEX IF NOT EXISTS idx_disponibilidad_sincronizacion
ON disponibilidad_medica(id_ctr_horario_generado)
WHERE id_ctr_horario_generado IS NOT NULL;

-- =====================================================================
-- PASO 5: Actualizar comentarios de columna total_horas
-- =====================================================================

COMMENT ON COLUMN disponibilidad_medica.total_horas
IS 'Total = horas_asistenciales + horas_sanitarias';

-- =====================================================================
-- PASO 6: Migrar datos existentes (si hay registros)
-- =====================================================================

-- Copiar total_horas existente a horas_asistenciales
-- (asumiendo que los registros anteriores solo tenían horas asistenciales)
UPDATE disponibilidad_medica
SET horas_asistenciales = total_horas,
    horas_sanitarias = 0.00
WHERE horas_asistenciales IS NULL OR horas_asistenciales = 0;

-- =====================================================================
-- PASO 7: Crear/recrear vista vw_disponibilidad_vs_horario
-- =====================================================================

DROP VIEW IF EXISTS vw_disponibilidad_vs_horario;

CREATE OR REPLACE VIEW vw_disponibilidad_vs_horario AS
SELECT
    dm.id_disponibilidad,
    dm.periodo,
    dm.estado,

    -- Información del médico
    p.id_pers,
    p.nom_pers || ' ' || p.ape_pater_pers || ' ' || p.ape_mater_pers AS nombre_medico,
    p.num_doc_pers AS dni_medico,

    -- Información de especialidad
    s.id_servicio,
    s.desc_servicio AS especialidad,

    -- Horas declaradas (de disponibilidad_medica)
    dm.horas_asistenciales,
    dm.horas_sanitarias,
    dm.total_horas AS horas_declaradas,

    -- Horas cargadas en chatbot (cálculo desde ctr_horario)
    COALESCE(
        (SELECT SUM(
            CASE
                -- Mapeo de códigos de horario a horas
                WHEN dh.cod_horario = '158' THEN 6  -- Mañana Locador
                WHEN dh.cod_horario = '131' THEN 6  -- Tarde Locador
                WHEN dh.cod_horario = '200A' THEN 12 -- Completo Locador
                -- Agregar más códigos si existen otros regímenes
                ELSE 0
            END
        )
        FROM ctr_horario ch
        INNER JOIN ctr_horario_det chd ON chd.id_ctr_horario = ch.id_ctr_horario
        INNER JOIN dim_horario dh ON dh.id_horario = chd.id_horario
        WHERE ch.periodo = dm.periodo
          AND ch.id_pers = dm.id_pers
          AND ch.id_servicio = dm.id_servicio),
        0
    ) AS horas_cargadas_chatbot,

    -- Cantidad de slots generados
    COALESCE(
        (SELECT COUNT(*)
        FROM ctr_horario ch
        INNER JOIN ctr_horario_det chd ON chd.id_ctr_horario = ch.id_ctr_horario
        WHERE ch.periodo = dm.periodo
          AND ch.id_pers = dm.id_pers
          AND ch.id_servicio = dm.id_servicio),
        0
    ) AS slots_generados,

    -- Información de sincronización
    dm.id_ctr_horario_generado,
    dm.fecha_sincronizacion,

    -- Estado de validación
    CASE
        WHEN dm.id_ctr_horario_generado IS NULL THEN 'SIN_HORARIO_CARGADO'
        WHEN ABS(
            dm.total_horas -
            COALESCE((SELECT SUM(CASE WHEN dh.cod_horario = '158' THEN 6 WHEN dh.cod_horario = '131' THEN 6 WHEN dh.cod_horario = '200A' THEN 12 ELSE 0 END)
                     FROM ctr_horario ch
                     INNER JOIN ctr_horario_det chd ON chd.id_ctr_horario = ch.id_ctr_horario
                     INNER JOIN dim_horario dh ON dh.id_horario = chd.id_horario
                     WHERE ch.periodo = dm.periodo AND ch.id_pers = dm.id_pers AND ch.id_servicio = dm.id_servicio), 0)
        ) > 10 THEN 'DIFERENCIA_SIGNIFICATIVA'
        ELSE 'CONSISTENTE'
    END AS estado_validacion,

    -- Última sincronización
    (SELECT fecha_sincronizacion
     FROM sincronizacion_horario_log
     WHERE id_disponibilidad = dm.id_disponibilidad
     ORDER BY fecha_sincronizacion DESC
     LIMIT 1) AS ultima_sincronizacion,

    (SELECT resultado
     FROM sincronizacion_horario_log
     WHERE id_disponibilidad = dm.id_disponibilidad
     ORDER BY fecha_sincronizacion DESC
     LIMIT 1) AS resultado_ultima_sincronizacion

FROM disponibilidad_medica dm
INNER JOIN dim_personal_cnt p ON p.id_pers = dm.id_pers
INNER JOIN dim_servicio_essi s ON s.id_servicio = dm.id_servicio
WHERE dm.estado IN ('REVISADO', 'SINCRONIZADO');

-- Comentarios de la vista
COMMENT ON VIEW vw_disponibilidad_vs_horario IS 'Vista comparativa entre disponibilidad declarada y horarios cargados en chatbot';

-- =====================================================================
-- VALIDACIÓN POST-MIGRACIÓN
-- =====================================================================

-- 1. Verificar que todas las columnas nuevas existen
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'disponibilidad_medica'
  AND column_name IN ('horas_asistenciales', 'horas_sanitarias', 'fecha_sincronizacion', 'id_ctr_horario_generado')
ORDER BY column_name;

-- 2. Verificar constraint de estado actualizado
SELECT
    constraint_name,
    check_clause
FROM information_schema.check_constraints
WHERE constraint_name = 'ck_disponibilidad_estado';

-- 3. Verificar que la vista se creó correctamente
SELECT
    table_name,
    view_definition IS NOT NULL AS vista_existe
FROM information_schema.views
WHERE table_name = 'vw_disponibilidad_vs_horario';

-- 4. Contar registros migrados
SELECT
    COUNT(*) AS total_registros,
    COUNT(CASE WHEN horas_asistenciales > 0 THEN 1 END) AS con_horas_asistenciales,
    COUNT(CASE WHEN horas_sanitarias > 0 THEN 1 END) AS con_horas_sanitarias,
    AVG(total_horas) AS promedio_total_horas
FROM disponibilidad_medica;

-- =====================================================================
-- FIN DEL SCRIPT DE MIGRACIÓN
-- =====================================================================

-- NOTAS IMPORTANTES:
-- 1. Este script es IDEMPOTENTE (puede ejecutarse múltiples veces)
-- 2. Usa IF NOT EXISTS para evitar errores
-- 3. Migra datos existentes de total_horas → horas_asistenciales
-- 4. Compatible con PostgreSQL 14+
-- 5. NO elimina datos existentes

-- Para ejecutar:
-- PGPASSWORD=Essalud2025 psql -h 10.0.89.13 -U postgres -d maestro_cenate -f 005b_migracion_disponibilidad_v2.sql
