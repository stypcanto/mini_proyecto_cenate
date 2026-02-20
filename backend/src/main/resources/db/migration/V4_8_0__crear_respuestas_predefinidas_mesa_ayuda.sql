-- V4_8_0: Crear tabla de respuestas predefinidas para Mesa de Ayuda
-- Estas respuestas aparecen como opciones al responder un ticket
-- Solo "Otros" permite texto libre

CREATE TABLE IF NOT EXISTS dim_respuestas_predefinidas_mesa_ayuda (
    id           BIGSERIAL PRIMARY KEY,
    codigo       VARCHAR(100) NOT NULL UNIQUE,
    descripcion  VARCHAR(500) NOT NULL,
    es_otros     BOOLEAN NOT NULL DEFAULT FALSE,
    activo       BOOLEAN NOT NULL DEFAULT TRUE,
    orden        INTEGER NOT NULL DEFAULT 0,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE dim_respuestas_predefinidas_mesa_ayuda IS 'Respuestas predefinidas para que el personal de Mesa de Ayuda responda tickets';
COMMENT ON COLUMN dim_respuestas_predefinidas_mesa_ayuda.es_otros IS 'Si TRUE, habilita campo de texto libre adicional';

CREATE INDEX IF NOT EXISTS idx_resp_pred_activo ON dim_respuestas_predefinidas_mesa_ayuda(activo);
CREATE INDEX IF NOT EXISTS idx_resp_pred_orden  ON dim_respuestas_predefinidas_mesa_ayuda(orden);

-- Insertar las respuestas predefinidas
INSERT INTO dim_respuestas_predefinidas_mesa_ayuda (codigo, descripcion, es_otros, activo, orden) VALUES
('PACIENTE_ESPERANDO_LLAMADA',          'PACIENTE ESPERANDO LLAMADA',                                                                  FALSE, TRUE, 1),
('PACIENTE_ESPERANDO_TELECONSULTORIO',  'PACIENTE ESPERANDO ATENCIÓN EN TELECONSULTORIO',                                              FALSE, TRUE, 2),
('PACIENTE_REPROGRAMACION',             'PACIENTE SOLICITA REPROGRAMACIÓN DE LA CITA',                                                 FALSE, TRUE, 3),
('PACIENTE_ANULACION',                  'PACIENTE SOLICITA ANULACIÓN DE LA CITA',                                                      FALSE, TRUE, 4),
('CONTACTO_SIN_EXITO',                  'SE INTENTÓ CONTACTAR CON PACIENTE SIN ÉXITO',                                                 FALSE, TRUE, 5),
('ENVIA_ACTO_MEDICO',                   'SE ENVÍA NRO DE ACTO MÉDICO / RECETA / REFERENCIA / LABORATORIO / EXÁMENES',                  FALSE, TRUE, 6),
('INFORMA_GESTOR_CITAS',                'SE INFORMÓ A GESTOR DE CITAS PARA ACTUALIZACIÓN DE LISTADO DE PACIENTES',                     FALSE, TRUE, 7),
('OTROS',                               'Otros',                                                                                        TRUE,  TRUE, 8)
ON CONFLICT (codigo) DO NOTHING;
