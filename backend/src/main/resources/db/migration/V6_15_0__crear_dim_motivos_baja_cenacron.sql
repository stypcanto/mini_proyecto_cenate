-- ============================================================================
-- V6_15_0: Tabla dim_motivos_baja_cenacron + 8 motivos iniciales
-- Catálogo de motivos para dar de baja a un paciente del programa CENACRON
-- Autor: Styp Canto Rondón / Claude Code
-- Fecha: 2026-03-02
-- ============================================================================

CREATE TABLE IF NOT EXISTS dim_motivos_baja_cenacron (
    id             BIGSERIAL PRIMARY KEY,
    codigo         VARCHAR(100) NOT NULL UNIQUE,
    descripcion    VARCHAR(500) NOT NULL,
    activo         BOOLEAN      NOT NULL DEFAULT TRUE,
    orden          INTEGER      NOT NULL DEFAULT 0,
    fecha_creacion TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_motivos_baja_cenacron_activo ON dim_motivos_baja_cenacron(activo);
CREATE INDEX IF NOT EXISTS idx_motivos_baja_cenacron_orden  ON dim_motivos_baja_cenacron(orden);

-- 8 motivos clínicos iniciales
INSERT INTO dim_motivos_baja_cenacron (codigo, descripcion, orden) VALUES
('SIN_DIAGNOSTICO_CIE10',    'Paciente no cuenta con diagnóstico registrado en la lista DX CIE 10 del programa: diabetes, hipertensión arterial o diagnóstico mixto.', 1),
('FUERA_RANGO_EDAD',         'Paciente no se encuentra en el rango de edad de 30 a 77 años.',                  2),
('INSCRITO_PADOMI_CEDIH',    'Paciente se encuentra inscrito en PADOMI o CEDIH.',                              3),
('REFERENCIA_ACTIVA',        'Paciente presenta referencia activa.',                                           4),
('PERIODO_CARENCIA',         'Paciente se encuentra dentro del periodo de carencia.',                          5),
('FUERA_AREA_ADSCRIPCION',   'Paciente se encuentra fuera del área de adscripción.',                          6),
('CUENTA_EPS',               'Paciente cuenta con EPS.',                                                       7),
('CONDICION_GESTANTE',       'Paciente se encuentra en condición de gestante.',                                8)
ON CONFLICT (codigo) DO NOTHING;

DO $$
BEGIN
    RAISE NOTICE 'V6_15_0: ✅ Tabla dim_motivos_baja_cenacron creada con 8 motivos iniciales';
END $$;
