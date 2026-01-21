-- ============================================================
-- Script: 041_teleecg_bytea_storage.sql
-- Descripción: Agregar almacenamiento BYTEA para imágenes ECG
-- Versión: v1.22.0
-- Fecha: 2026-01-21
-- Autor: Ing. Styp Canto Rondón
-- ============================================================

-- ============================================================
-- 1. AGREGAR COLUMNA contenido_imagen (BYTEA)
-- ============================================================

DO $$
BEGIN
    -- Agregar columna contenido_imagen si no existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'tele_ecg_imagenes'
        AND column_name = 'contenido_imagen'
    ) THEN
        ALTER TABLE tele_ecg_imagenes
        ADD COLUMN contenido_imagen BYTEA;

        RAISE NOTICE '✅ Columna contenido_imagen agregada a tele_ecg_imagenes';
    ELSE
        RAISE NOTICE '⚠️ Columna contenido_imagen ya existe';
    END IF;
END $$;

-- ============================================================
-- 2. ACTUALIZAR VALOR DEFAULT DE storage_tipo
-- ============================================================

DO $$
BEGIN
    -- Cambiar default de storage_tipo a 'DATABASE'
    ALTER TABLE tele_ecg_imagenes
    ALTER COLUMN storage_tipo SET DEFAULT 'DATABASE';

    RAISE NOTICE '✅ Default de storage_tipo cambiado a DATABASE';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '⚠️ Error cambiando default: %', SQLERRM;
END $$;

-- ============================================================
-- 3. COMENTARIOS DE DOCUMENTACIÓN
-- ============================================================

COMMENT ON COLUMN tele_ecg_imagenes.contenido_imagen IS
'v1.22.0: Contenido binario de la imagen ECG almacenado como BYTEA. Máximo 5MB. Formatos: JPEG, PNG';

COMMENT ON COLUMN tele_ecg_imagenes.storage_tipo IS
'Tipo de almacenamiento: DATABASE (BYTEA en PostgreSQL, v1.22.0 default), FILESYSTEM (legacy /opt/cenate/teleekgs/), S3/MINIO (futuro)';

-- ============================================================
-- 4. VERIFICACIÓN
-- ============================================================

DO $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM information_schema.columns
    WHERE table_name = 'tele_ecg_imagenes'
    AND column_name = 'contenido_imagen';

    IF v_count > 0 THEN
        RAISE NOTICE '✅ VERIFICACIÓN: Columna contenido_imagen existe correctamente';
    ELSE
        RAISE EXCEPTION '❌ ERROR: Columna contenido_imagen NO fue creada';
    END IF;
END $$;

-- ============================================================
-- FIN DEL SCRIPT
-- ============================================================

/*
NOTAS DE MIGRACIÓN:
==================
1. Las imágenes NUEVAS se guardarán en BD (storage_tipo = 'DATABASE')
2. Las imágenes EXISTENTES siguen en filesystem (storage_tipo = 'FILESYSTEM')
3. El código Java detecta el tipo y lee de la ubicación correcta
4. No es necesario migrar imágenes existentes (compatibilidad hacia atrás)

ROLLBACK (si es necesario):
===========================
ALTER TABLE tele_ecg_imagenes DROP COLUMN IF EXISTS contenido_imagen;
ALTER TABLE tele_ecg_imagenes ALTER COLUMN storage_tipo SET DEFAULT 'FILESYSTEM';
*/
