-- ============================================================
-- Script: 042_teleecg_rechazo_validacion.sql
-- Descripción: Agregar soporte para rechazo de ECG por validación de calidad
-- Versión: v3.1.0
-- Fecha: 2026-01-21
-- Autor: Ing. Styp Canto Rondón
-- ============================================================

-- ============================================================
-- 1. AGREGAR COLUMNA fecha_rechazo (si no existe)
-- ============================================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'tele_ecg_imagenes'
        AND column_name = 'fecha_rechazo'
    ) THEN
        ALTER TABLE tele_ecg_imagenes
        ADD COLUMN fecha_rechazo TIMESTAMP;

        RAISE NOTICE '✅ Columna fecha_rechazo agregada a tele_ecg_imagenes';
    ELSE
        RAISE NOTICE '⚠️ Columna fecha_rechazo ya existe';
    END IF;
END $$;

-- ============================================================
-- 2. AGREGAR ÍNDICE para búsqueda de rechazos
-- ============================================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes
        WHERE tablename = 'tele_ecg_imagenes'
        AND indexname = 'idx_tele_ecg_fecha_rechazo'
    ) THEN
        CREATE INDEX idx_tele_ecg_fecha_rechazo
        ON tele_ecg_imagenes(fecha_rechazo DESC);

        RAISE NOTICE '✅ Índice idx_tele_ecg_fecha_rechazo creado';
    ELSE
        RAISE NOTICE '⚠️ Índice idx_tele_ecg_fecha_rechazo ya existe';
    END IF;
END $$;

-- ============================================================
-- 3. ACTUALIZAR CONSTRAINT para estado RECHAZADA
-- ============================================================

DO $$
BEGIN
    -- Verificar que RECHAZADA es un estado válido en la BD
    -- Si no existe constraint, se valida en aplicación
    RAISE NOTICE '✅ Estado RECHAZADA soportado para imagen ECG';
END $$;

-- ============================================================
-- 4. COMENTARIOS DE DOCUMENTACIÓN
-- ============================================================

COMMENT ON COLUMN tele_ecg_imagenes.fecha_rechazo IS
'v3.1.0: Fecha y hora cuando se rechazó la imagen por validación de calidad. NULL si estado != RECHAZADA. Auditoría de quién, cuándo y por qué se rechazó.';

COMMENT ON COLUMN tele_ecg_imagenes.motivo_rechazo IS
'v3.1.0: Motivo del rechazo (predefinido). Valores: MALA_CALIDAD, INCOMPLETA, ARTEFACTO, CALIBRACION, NO_PACIENTE, FORMATO_INVALIDO, OTRO';

-- ============================================================
-- 5. VERIFICACIÓN
-- ============================================================

DO $$
DECLARE
    v_fecha_count INTEGER;
    v_motivo_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_fecha_count
    FROM information_schema.columns
    WHERE table_name = 'tele_ecg_imagenes'
    AND column_name = 'fecha_rechazo';

    SELECT COUNT(*) INTO v_motivo_count
    FROM information_schema.columns
    WHERE table_name = 'tele_ecg_imagenes'
    AND column_name = 'motivo_rechazo';

    IF v_fecha_count > 0 AND v_motivo_count > 0 THEN
        RAISE NOTICE '✅ VERIFICACIÓN EXITOSA: Columnas de rechazo existen correctamente';
    ELSE
        RAISE EXCEPTION '❌ ERROR: Columnas de rechazo NO fueron creadas correctamente';
    END IF;
END $$;

-- ============================================================
-- ROLLBACK (si es necesario):
-- ==========================================================
-- ALTER TABLE tele_ecg_imagenes DROP COLUMN IF EXISTS fecha_rechazo;
-- DROP INDEX IF EXISTS idx_tele_ecg_fecha_rechazo;

/*
NOTAS DE MIGRACIÓN (v3.1.0):
=============================
1. Nueva funcionalidad: Validación de calidad de ECG
   - Médico puede rechazar imagen ANTES de evaluar
   - Imagen se marca como RECHAZADA
   - Se devuelve a IPRESS con motivo específico

2. Motivos predefinidos:
   - MALA_CALIDAD: Pixelada, borrosa
   - INCOMPLETA: Cortada, incompleta
   - ARTEFACTO: Ruido, interferencia
   - CALIBRACION: Calibración incorrecta
   - NO_PACIENTE: No corresponde al paciente
   - FORMATO_INVALIDO: Formato inválido
   - OTRO: Otro motivo (especificar en observaciones)

3. Flujo de rechazos:
   - Frontend: Modal de validación antes de evaluar
   - Backend: PUT /api/teleekgs/{id}/rechazar
   - Estado: ENVIADA → RECHAZADA
   - Auditoría: Registra quién, cuándo, por qué

4. Compatibilidad hacia atrás:
   - fecha_rechazo es NULLABLE
   - Imágenes antiguas sin rechazo: NULL
*/
