-- ============================================================================
-- V6_34_0: Tabla dim_motivo_anulacion + 11 motivos iniciales
-- Catálogo de motivos predefinidos para anular citas desde Mesa de Ayuda
-- Autor: Styp Canto Rondón / Claude Code
-- Fecha: 2026-03-06
-- ============================================================================

CREATE TABLE IF NOT EXISTS dim_motivo_anulacion (
    id             BIGSERIAL    PRIMARY KEY,
    codigo         VARCHAR(100) NOT NULL UNIQUE,
    descripcion    VARCHAR(500) NOT NULL,
    activo         BOOLEAN      NOT NULL DEFAULT TRUE,
    orden          INTEGER      NOT NULL DEFAULT 0,
    fecha_creacion TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_motivo_anulacion_activo ON dim_motivo_anulacion(activo);
CREATE INDEX IF NOT EXISTS idx_motivo_anulacion_orden  ON dim_motivo_anulacion(orden);

-- 11 motivos iniciales
INSERT INTO dim_motivo_anulacion (codigo, descripcion, orden) VALUES
('YA_ATENDIDO_OTRA_VIA',       'El paciente ya fue atendido por otra vía (emergencia, presencial) y la teleconsulta ya no es necesaria', 1),
('REQUIERE_MAYOR_COMPLEJIDAD', 'El estado del paciente requiere una atención de mayor complejidad o presencialidad', 2),
('CITA_DUPLICADA_ERROR',       'El profesional detecta que la cita fue duplicada o registrada por error', 3),
('EMERGENCIA_MEDICO',          'El profesional tiene una emergencia médica o incapacidad imprevista', 4),
('FALLA_TECNICA',              'Falla técnica que imposibilita la teleconsulta (conectividad, equipo)', 5),
('PACIENTE_NO_CONECTADO',      'El paciente no se conectó y no hubo comunicación previa', 6),
('CAMBIO_TURNO_NO_COORDINADO', 'Cambio de turno o reemplazo de médico no coordinado a tiempo', 7),
('IPRESS_INCORRECTA',          'La cita fue generada en un IPRESS incorrecto o fuera de la Red correspondiente', 8),
('NO_CUMPLE_CRITERIOS',        'El paciente no cumple los criterios de atención por telemedicina para ese servicio', 9),
('SOLICITUD_PACIENTE',         'Solicitud expresa del paciente canalizada a través del profesional', 10),
('VENCIMIENTO_HORARIO',        'Vencimiento del horario sin que el paciente se haya presentado', 11)
ON CONFLICT (codigo) DO NOTHING;

DO $$
BEGIN
    RAISE NOTICE 'V6_34_0: Tabla dim_motivo_anulacion creada con 11 motivos iniciales';
END $$;
