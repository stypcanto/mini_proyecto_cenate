-- ============================================================================
-- V5_9_0: Crear tabla dim_motivo_interconsulta
-- Motivos predefinidos para rol ENFERMERÍA al derivar interconsultas
-- @version v1.0.0 - 2026-02-23
-- ============================================================================

CREATE TABLE IF NOT EXISTS dim_motivo_interconsulta (
    id_motivo       SERIAL PRIMARY KEY,
    codigo          VARCHAR(100) NOT NULL UNIQUE,
    descripcion     VARCHAR(255) NOT NULL,
    activo          BOOLEAN NOT NULL DEFAULT TRUE,
    orden           INTEGER NOT NULL DEFAULT 0,
    fecha_creacion  TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Seed: 6 motivos oficiales
INSERT INTO dim_motivo_interconsulta (codigo, descripcion, activo, orden) VALUES
    ('SIN_ATENCION',                         'SIN ATENCIÓN',                           TRUE, 1),
    ('LABORATORIOS_COMPLETOS_SIN_ALTERACION','LABORATORIOS COMPLETOS SIN ALTERACIÓN',  TRUE, 2),
    ('SIN_LABORATORIOS',                     'SIN LABORATORIOS',                        TRUE, 3),
    ('SIN_TRATAMIENTO',                      'SIN TRATAMIENTO',                         TRUE, 4),
    ('TRATAMIENTO_INCOMPLETO',               'TRATAMIENTO INCOMPLETO',                  TRUE, 5),
    ('LABORATORIOS_ALTERADOS',               'LABORATORIOS ALTERADOS',                  TRUE, 6)
ON CONFLICT (codigo) DO NOTHING;
