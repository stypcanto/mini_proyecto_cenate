-- ════════════════════════════════════════════════════════════════════════════════════════
-- V4_3_0 - Agregar columna fecha_toma a tabla tele_ecg_imagenes
-- ════════════════════════════════════════════════════════════════════════════════════════
-- Descripción: Agregar campo para registrar la fecha en que se tomó el electrocardiograma
-- Autor: Styp Canto Rondón
-- Fecha: 2026-02-10
-- ════════════════════════════════════════════════════════════════════════════════════════

-- Agregar columna fecha_toma (nullable, puede no proporcionarse)
ALTER TABLE tele_ecg_imagenes
ADD COLUMN fecha_toma DATE NULL
COMMENT 'Fecha en que se tomó el electrocardiograma (proporcionada por IPRESS)';

-- Crear índice para búsquedas por fecha
CREATE INDEX idx_tele_ecg_fecha_toma ON tele_ecg_imagenes(fecha_toma);

-- Crear índice compuesto para búsquedas frecuentes
CREATE INDEX idx_tele_ecg_paciente_fecha_toma ON tele_ecg_imagenes(num_doc_paciente, fecha_toma);
