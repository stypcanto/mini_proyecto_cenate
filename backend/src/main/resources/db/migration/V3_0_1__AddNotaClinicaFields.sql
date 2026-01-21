-- ════════════════════════════════════════════════════════════════
-- v3.0.1 - Agregar campos de Nota Clínica a tabla tele_ecg_imagenes
-- Fecha: 2026-01-21
-- Descripción: Agregar soporte para hallazgos clínicos y plan de seguimiento
-- ════════════════════════════════════════════════════════════════

-- Agregar columnas JSONB para hallazgos y plan de seguimiento
ALTER TABLE tele_ecg_imagenes
ADD COLUMN IF NOT EXISTS nota_clinica_hallazgos jsonb;

ALTER TABLE tele_ecg_imagenes
ADD COLUMN IF NOT EXISTS nota_clinica_observaciones TEXT;

ALTER TABLE tele_ecg_imagenes
ADD COLUMN IF NOT EXISTS nota_clinica_plan_seguimiento jsonb;

-- Agregar FK a usuario que creó la nota clínica
ALTER TABLE tele_ecg_imagenes
ADD COLUMN IF NOT EXISTS id_usuario_nota_clinica BIGINT;

-- Agregar fecha de creación de nota clínica
ALTER TABLE tele_ecg_imagenes
ADD COLUMN IF NOT EXISTS fecha_nota_clinica TIMESTAMP;

-- Agregar FK constraint si la columna fue agregada
ALTER TABLE tele_ecg_imagenes
ADD CONSTRAINT IF NOT EXISTS fk_nota_clinica_usuario
FOREIGN KEY (id_usuario_nota_clinica)
REFERENCES dim_usuarios(id_usuario)
ON DELETE SET NULL;

-- Crear índice para búsquedas rápidas de notas clínicas
CREATE INDEX IF NOT EXISTS idx_tele_ecg_nota_clinica_fecha
ON tele_ecg_imagenes(fecha_nota_clinica DESC);

-- Agregar comentarios a las nuevas columnas
COMMENT ON COLUMN tele_ecg_imagenes.nota_clinica_hallazgos IS 'v3.0.0 - Hallazgos clínicos (JSON): {"ritmo": true, "frecuencia": false, ...}';
COMMENT ON COLUMN tele_ecg_imagenes.nota_clinica_observaciones IS 'v3.0.0 - Observaciones clínicas libres (máx 2000 caracteres)';
COMMENT ON COLUMN tele_ecg_imagenes.nota_clinica_plan_seguimiento IS 'v3.0.0 - Plan de seguimiento (JSON)';
COMMENT ON COLUMN tele_ecg_imagenes.id_usuario_nota_clinica IS 'v3.0.0 - Usuario médico que creó la nota clínica';
COMMENT ON COLUMN tele_ecg_imagenes.fecha_nota_clinica IS 'v3.0.0 - Fecha y hora de creación de nota clínica';
