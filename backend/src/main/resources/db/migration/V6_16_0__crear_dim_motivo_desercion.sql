-- V6_16_0: Tabla dim_motivo_desercion
-- Motivos predefinidos para la acción "Deserción" en el módulo Profesional de Salud
-- Reemplaza los valores hardcodeados en MisPacientes.jsx

CREATE TABLE IF NOT EXISTS dim_motivo_desercion (
    id             BIGSERIAL    PRIMARY KEY,
    codigo         VARCHAR(100) NOT NULL UNIQUE,
    descripcion    VARCHAR(255) NOT NULL,
    categoria      VARCHAR(100) NOT NULL DEFAULT 'Otro',
    activo         BOOLEAN      NOT NULL DEFAULT TRUE,
    orden          INTEGER      NOT NULL DEFAULT 0,
    fecha_creacion TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_motivo_desercion_activo    ON dim_motivo_desercion (activo);
CREATE INDEX IF NOT EXISTS idx_motivo_desercion_categoria ON dim_motivo_desercion (categoria);
CREATE INDEX IF NOT EXISTS idx_motivo_desercion_orden     ON dim_motivo_desercion (orden);

-- Seed: datos iniciales (equivalen a los valores hardcodeados en el frontend)
INSERT INTO dim_motivo_desercion (codigo, descripcion, categoria, orden) VALUES
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
  ('OTRO',              'Otro',              'Otro',             11);
