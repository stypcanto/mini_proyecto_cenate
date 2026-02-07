-- Migration: Add 'es_urgente' column to tele_ecg_imagenes table
-- Version: v4.0.0 (2026-02-06)
-- Purpose: Support marking ECG images as urgent for prioritized review

-- Add 'es_urgente' column
ALTER TABLE tele_ecg_imagenes
ADD COLUMN IF NOT EXISTS es_urgente BOOLEAN NOT NULL DEFAULT FALSE;

-- Create index for faster filtering of urgent images
CREATE INDEX IF NOT EXISTS idx_tele_ecg_es_urgente
ON tele_ecg_imagenes(es_urgente)
WHERE es_urgente = TRUE;

-- Add composite index for status + urgency queries
CREATE INDEX IF NOT EXISTS idx_tele_ecg_estado_urgente
ON tele_ecg_imagenes(estado, es_urgente);

-- Comment for documentation
COMMENT ON COLUMN tele_ecg_imagenes.es_urgente
  IS 'Indica si la imagen ECG requiere atención prioritaria/urgente (v4.0.0 - Medical priority flag)';
