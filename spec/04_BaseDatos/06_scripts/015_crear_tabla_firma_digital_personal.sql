-- ============================================================
-- SCRIPT: Creación de tabla firma_digital_personal
-- Autor: Ing. Styp Canto Rondon
-- Fecha: 2025-12-30
-- Versión: v1.14.0
-- Descripción: Almacena información de firma digital del personal interno (CAS/728)
-- ============================================================

-- Tabla: firma_digital_personal
CREATE TABLE IF NOT EXISTS firma_digital_personal (
    id_firma_personal SERIAL PRIMARY KEY,
    id_personal BIGINT NOT NULL,
    entrego_token BOOLEAN DEFAULT FALSE NOT NULL,
    numero_serie_token VARCHAR(100),
    fecha_entrega_token DATE,
    fecha_inicio_certificado DATE,
    fecha_vencimiento_certificado DATE,
    motivo_sin_token VARCHAR(50),
    observaciones TEXT,
    stat_firma CHAR(1) DEFAULT 'A' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Foreign Key a dim_personal_cnt
    CONSTRAINT fk_firma_personal FOREIGN KEY (id_personal)
        REFERENCES dim_personal_cnt(id_pers) ON DELETE CASCADE,

    -- Check constraints
    CONSTRAINT chk_stat_firma CHECK (stat_firma IN ('A', 'I')),

    CONSTRAINT chk_motivo_sin_token CHECK (
        motivo_sin_token IS NULL OR
        motivo_sin_token IN ('YA_TIENE', 'NO_REQUIERE', 'PENDIENTE')
    ),

    CONSTRAINT chk_fechas_validas CHECK (
        fecha_vencimiento_certificado IS NULL OR
        fecha_inicio_certificado IS NULL OR
        fecha_vencimiento_certificado > fecha_inicio_certificado
    ),

    -- Lógica de negocio: si entregó token, debe tener fechas Y número de serie
    CONSTRAINT chk_entrego_token_fechas CHECK (
        (entrego_token = TRUE AND
         fecha_inicio_certificado IS NOT NULL AND
         fecha_vencimiento_certificado IS NOT NULL AND
         numero_serie_token IS NOT NULL) OR
        (entrego_token = FALSE)
    ),

    -- Lógica de negocio: si no entregó token, debe tener motivo
    CONSTRAINT chk_no_entrego_motivo CHECK (
        (entrego_token = FALSE AND motivo_sin_token IS NOT NULL) OR
        (entrego_token = TRUE AND motivo_sin_token IS NULL)
    ),

    -- Lógica de negocio: si motivo es YA_TIENE, debe tener fechas del certificado existente
    CONSTRAINT chk_ya_tiene_fechas CHECK (
        (motivo_sin_token = 'YA_TIENE' AND
         fecha_inicio_certificado IS NOT NULL AND
         fecha_vencimiento_certificado IS NOT NULL) OR
        (motivo_sin_token IS NULL OR motivo_sin_token IN ('NO_REQUIERE', 'PENDIENTE'))
    ),

    -- Lógica de negocio: si tiene número de serie, debe haber entregado token
    CONSTRAINT chk_numero_serie_token CHECK (
        (numero_serie_token IS NOT NULL AND entrego_token = TRUE) OR
        (numero_serie_token IS NULL)
    )
);

-- Índices para mejorar performance
CREATE INDEX idx_firma_personal_id_personal ON firma_digital_personal(id_personal);
CREATE INDEX idx_firma_personal_stat ON firma_digital_personal(stat_firma);
CREATE INDEX idx_firma_personal_entrego_token ON firma_digital_personal(entrego_token);
CREATE INDEX idx_firma_personal_fecha_vencimiento ON firma_digital_personal(fecha_vencimiento_certificado);
CREATE INDEX idx_firma_personal_motivo ON firma_digital_personal(motivo_sin_token);

-- Comentarios
COMMENT ON TABLE firma_digital_personal IS 'Información de firma digital del personal interno (CAS/728)';
COMMENT ON COLUMN firma_digital_personal.id_firma_personal IS 'Identificador único de registro de firma digital';
COMMENT ON COLUMN firma_digital_personal.id_personal IS 'Referencia a dim_personal_cnt';
COMMENT ON COLUMN firma_digital_personal.entrego_token IS 'Indica si el personal entregó el token de firma digital';
COMMENT ON COLUMN firma_digital_personal.numero_serie_token IS 'Número de serie del token de firma digital';
COMMENT ON COLUMN firma_digital_personal.fecha_entrega_token IS 'Fecha en que se entregó físicamente el token';
COMMENT ON COLUMN firma_digital_personal.fecha_inicio_certificado IS 'Fecha de inicio del certificado digital';
COMMENT ON COLUMN firma_digital_personal.fecha_vencimiento_certificado IS 'Fecha de vencimiento del certificado digital';
COMMENT ON COLUMN firma_digital_personal.motivo_sin_token IS 'Motivo por el cual no entregó token: YA_TIENE, NO_REQUIERE, PENDIENTE';
COMMENT ON COLUMN firma_digital_personal.observaciones IS 'Observaciones adicionales sobre la firma digital';
COMMENT ON COLUMN firma_digital_personal.stat_firma IS 'Estado del registro: A=Activo, I=Inactivo';

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_firma_digital_personal_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_firma_digital_personal_updated_at
BEFORE UPDATE ON firma_digital_personal
FOR EACH ROW
EXECUTE FUNCTION update_firma_digital_personal_updated_at();

-- Grant de permisos
GRANT SELECT, INSERT, UPDATE, DELETE ON firma_digital_personal TO postgres;
GRANT USAGE, SELECT ON SEQUENCE firma_digital_personal_id_firma_personal_seq TO postgres;

-- Mensaje de confirmación
DO $$
BEGIN
    RAISE NOTICE '✅ Tabla firma_digital_personal creada exitosamente';
    RAISE NOTICE '📊 Índices creados: 5';
    RAISE NOTICE '🔒 Constraints creados: 7';
    RAISE NOTICE '⚙️ Trigger de auditoría configurado';
    RAISE NOTICE '';
    RAISE NOTICE '📝 Para ejecutar este script:';
    RAISE NOTICE 'PGPASSWORD=Essalud2025 psql -h 10.0.89.13 -U postgres -d maestro_cenate -f spec/scripts/015_crear_tabla_firma_digital_personal.sql';
END $$;
