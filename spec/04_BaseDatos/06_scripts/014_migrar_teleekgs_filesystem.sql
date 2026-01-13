-- ============================================================
-- MIGRATION: TeleEKG BYTEA → Filesystem Storage
-- Archivo: 014_migrar_teleekgs_filesystem.sql
-- Fecha: 2026-01-13
-- Versión: 1.1 (Simplificada para máxima compatibilidad)
-- ============================================================

BEGIN;

-- PASO 1: Agregar nuevas columnas para metadata FILESYSTEM
ALTER TABLE tele_ecg_imagenes
    ADD COLUMN IF NOT EXISTS storage_tipo VARCHAR(20) DEFAULT 'FILESYSTEM',
    ADD COLUMN IF NOT EXISTS storage_ruta VARCHAR(500),
    ADD COLUMN IF NOT EXISTS storage_bucket VARCHAR(100),
    ADD COLUMN IF NOT EXISTS extension VARCHAR(10),
    ADD COLUMN IF NOT EXISTS mime_type VARCHAR(50),
    ADD COLUMN IF NOT EXISTS nombre_original VARCHAR(255),
    ADD COLUMN IF NOT EXISTS size_bytes BIGINT,
    ADD COLUMN IF NOT EXISTS sha256 VARCHAR(64);

-- PASO 2: Agregar CONSTRAINTS para validación
ALTER TABLE tele_ecg_imagenes
    ADD CONSTRAINT chk_storage_tipo
    CHECK (storage_tipo IN ('FILESYSTEM', 'S3', 'MINIO'));

ALTER TABLE tele_ecg_imagenes
    ADD CONSTRAINT chk_size_bytes
    CHECK (size_bytes IS NULL OR size_bytes <= 5242880);

ALTER TABLE tele_ecg_imagenes
    ADD CONSTRAINT chk_sha256_format
    CHECK (sha256 IS NULL OR (length(sha256) = 64 AND sha256 ~ '^[a-f0-9]{64}$'));

-- PASO 3: Eliminar columnas BYTEA y campos redundantes
ALTER TABLE tele_ecg_imagenes
    DROP COLUMN IF EXISTS contenido_imagen CASCADE;

ALTER TABLE tele_ecg_imagenes
    DROP COLUMN IF EXISTS tipo_contenido CASCADE,
    DROP COLUMN IF EXISTS tamanio_bytes CASCADE,
    DROP COLUMN IF EXISTS hash_archivo CASCADE;

-- PASO 4: Hacer storage_tipo NOT NULL
ALTER TABLE tele_ecg_imagenes
    ALTER COLUMN storage_tipo SET NOT NULL;

-- PASO 5: Crear ÍNDICES para optimización
CREATE INDEX IF NOT EXISTS idx_tele_ecg_storage_ruta
    ON tele_ecg_imagenes(storage_ruta);

CREATE INDEX IF NOT EXISTS idx_tele_ecg_sha256_activos
    ON tele_ecg_imagenes(sha256)
    WHERE stat_imagen = 'A';

CREATE INDEX IF NOT EXISTS idx_tele_ecg_extension
    ON tele_ecg_imagenes(extension);

CREATE INDEX IF NOT EXISTS idx_tele_ecg_busqueda_flexible
    ON tele_ecg_imagenes(num_doc_paciente, estado, storage_tipo, stat_imagen)
    WHERE stat_imagen = 'A';

-- PASO 6: Actualizar tabla de auditoría
ALTER TABLE tele_ecg_auditoria
    ADD COLUMN IF NOT EXISTS datos_adicionales TEXT;

-- PASO 7: Agregar COMMENTS
COMMENT ON COLUMN tele_ecg_imagenes.storage_tipo IS
    'FILESYSTEM | S3 | MINIO';

COMMENT ON COLUMN tele_ecg_imagenes.storage_ruta IS
    '/opt/cenate/teleekgs/YYYY/MM/DD/IPRESS_XXX/DNI_YYYYMMDD_HHMMSS_XXXX.ext';

COMMENT ON COLUMN tele_ecg_imagenes.extension IS
    'jpg | png';

COMMENT ON COLUMN tele_ecg_imagenes.mime_type IS
    'image/jpeg | image/png';

COMMENT ON COLUMN tele_ecg_imagenes.size_bytes IS
    'Tamaño en bytes (máximo 5MB = 5242880)';

COMMENT ON COLUMN tele_ecg_imagenes.sha256 IS
    'Hash SHA256 (64 hex chars) para integridad y duplicados';

-- PASO 8: Crear vista de monitoreo
DROP VIEW IF EXISTS v_teleekgs_storage_status CASCADE;

CREATE VIEW v_teleekgs_storage_status AS
SELECT
    COUNT(*) as total_imagenes_activas,
    SUM(size_bytes) as tamanio_total_bytes,
    SUM(size_bytes) / 1024 / 1024 as tamanio_total_mb,
    SUM(size_bytes) / 1024 / 1024 / 1024 as tamanio_total_gb,
    AVG(size_bytes) as tamanio_promedio_bytes,
    MIN(fecha_envio) as imagen_mas_antigua,
    MAX(fecha_envio) as imagen_mas_reciente,
    COUNT(DISTINCT codigo_ipress) as cantidad_ipress,
    COUNT(DISTINCT num_doc_paciente) as cantidad_pacientes
FROM tele_ecg_imagenes
WHERE stat_imagen = 'A'
    AND storage_tipo = 'FILESYSTEM';

COMMIT;
