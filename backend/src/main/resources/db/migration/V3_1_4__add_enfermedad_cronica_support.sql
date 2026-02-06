-- v1.47.0: Soporte para enfermedades crónicas en atención médica
-- Tabla para registrar enfermedades crónicas del asegurado

CREATE TABLE asegurado_enfermedad_cronica (
    id_asegurado_enfermedad SERIAL PRIMARY KEY,
    pk_asegurado VARCHAR(20) NOT NULL,
    tipo_enfermedad VARCHAR(100) NOT NULL,
    descripcion_otra VARCHAR(500),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE,

    CONSTRAINT fk_asegurado_enfermedad
        FOREIGN KEY (pk_asegurado)
        REFERENCES asegurados(pk_asegurado)
        ON DELETE CASCADE,

    CONSTRAINT unique_asegurado_enfermedad
        UNIQUE(pk_asegurado, tipo_enfermedad)
);

-- Índices para búsquedas rápidas
CREATE INDEX idx_asegurado_enfermedad_pk ON asegurado_enfermedad_cronica(pk_asegurado);
CREATE INDEX idx_asegurado_enfermedad_tipo ON asegurado_enfermedad_cronica(tipo_enfermedad);
CREATE INDEX idx_asegurado_enfermedad_activo ON asegurado_enfermedad_cronica(activo);

-- Comentarios
COMMENT ON TABLE asegurado_enfermedad_cronica IS 'v1.47.0: Registro de enfermedades crónicas por paciente (Hipertensión, Diabetes, Otro)';
COMMENT ON COLUMN asegurado_enfermedad_cronica.tipo_enfermedad IS 'Tipo: Hipertensión, Diabetes, Otro';
COMMENT ON COLUMN asegurado_enfermedad_cronica.descripcion_otra IS 'Detalles si tipo_enfermedad = Otro';
