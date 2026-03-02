-- ============================================================================
-- V6_16_0: Tabla dim_motivos_desercion + 11 motivos iniciales
-- Catálogo de motivos predefinidos para la acción "Deserción" de pacientes
-- Autor: Styp Canto Rondón / Claude Code
-- Fecha: 2026-03-02
-- ============================================================================

CREATE TABLE IF NOT EXISTS dim_motivos_desercion (
    id             BIGSERIAL    PRIMARY KEY,
    codigo         VARCHAR(100) NOT NULL UNIQUE,
    descripcion    VARCHAR(500) NOT NULL,
    categoria      VARCHAR(100) NOT NULL DEFAULT 'Otro',
    activo         BOOLEAN      NOT NULL DEFAULT TRUE,
    orden          INTEGER      NOT NULL DEFAULT 0,
    fecha_creacion TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_motivos_desercion_activo    ON dim_motivos_desercion(activo);
CREATE INDEX IF NOT EXISTS idx_motivos_desercion_categoria ON dim_motivos_desercion(categoria);
CREATE INDEX IF NOT EXISTS idx_motivos_desercion_orden     ON dim_motivos_desercion(orden);

-- 11 motivos iniciales
INSERT INTO dim_motivos_desercion (codigo, descripcion, categoria, orden) VALUES
('NO_CONTACTADO',     'No contactado',     'Contacto',         1),
('NO_CONTESTA',       'No contesta',       'Contacto',         2),
('NUMERO_APAGADO',    'Número apagado',    'Contacto',         3),
('NUMERO_NO_EXISTE',  'Número no existe',  'Contacto',         4),
('NUMERO_EQUIVOCADO', 'Número equivocado', 'Contacto',         5),
('PACIENTE_RECHAZO',  'Paciente rechazó',  'Rechazo',          6),
('NO_DESEA_ATENCION', 'No desea atención', 'Rechazo',          7),
('PACIENTE_INTERNADO','Paciente internado','Condición Médica',  8),
('PACIENTE_FALLECIDO','Paciente fallecido','Condición Médica',  9),
('EXAMEN_PENDIENTE',  'Examen pendiente',  'Condición Médica', 10),
('OTRO',              'Otro',              'Otro',             11)
ON CONFLICT (codigo) DO NOTHING;

DO $$
BEGIN
    RAISE NOTICE 'V6_16_0: ✅ Tabla dim_motivos_desercion creada con 11 motivos iniciales';
END $$;
