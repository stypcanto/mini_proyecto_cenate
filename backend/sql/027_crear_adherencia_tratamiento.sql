-- ========================================================================
-- Script SQL: Crear tabla de adherencia al tratamiento
-- ------------------------------------------------------------------------
-- CENATE 2026 | Módulo de Trazabilidad Clínica - Fase 4
-- Permite registrar la toma de medicamentos prescritos para calcular
-- el porcentaje de adherencia del paciente
-- ========================================================================

-- =====================================================================
-- TABLA: adherencia_tratamiento
-- =====================================================================
-- Registra cada toma (o falta) de medicamento del paciente
-- Se relaciona con la atención clínica que prescribió el tratamiento

CREATE TABLE IF NOT EXISTS adherencia_tratamiento (
    -- Clave primaria
    id_adherencia BIGSERIAL PRIMARY KEY,
    
    -- Relación con atención clínica
    id_atencion BIGINT NOT NULL,
    
    -- Datos del paciente (desnormalizado para consultas rápidas)
    pk_asegurado VARCHAR(50) NOT NULL,
    
    -- Información del medicamento
    nombre_medicamento VARCHAR(200) NOT NULL,
    dosis VARCHAR(100),
    frecuencia VARCHAR(100), -- Ejemplo: "cada 12 horas", "2 veces al día"
    
    -- Registro de toma
    fecha_programada TIMESTAMP WITH TIME ZONE NOT NULL,
    fecha_toma_real TIMESTAMP WITH TIME ZONE,
    tomo_medicamento BOOLEAN DEFAULT FALSE,
    
    -- Observaciones
    motivo_no_toma TEXT, -- Si no tomó, ¿por qué?
    observaciones TEXT,
    
    -- Auditoría
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key
    CONSTRAINT fk_adherencia_atencion 
        FOREIGN KEY (id_atencion) 
        REFERENCES atencion_clinica(id_atencion) 
        ON DELETE CASCADE,
    
    CONSTRAINT fk_adherencia_asegurado 
        FOREIGN KEY (pk_asegurado) 
        REFERENCES asegurado(pk_asegurado) 
        ON DELETE CASCADE
);

-- Índices para optimizar consultas
CREATE INDEX idx_adherencia_atencion ON adherencia_tratamiento(id_atencion);
CREATE INDEX idx_adherencia_asegurado ON adherencia_tratamiento(pk_asegurado);
CREATE INDEX idx_adherencia_fecha_programada ON adherencia_tratamiento(fecha_programada);
CREATE INDEX idx_adherencia_asegurado_fecha ON adherencia_tratamiento(pk_asegurado, fecha_programada DESC);

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_adherencia_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_adherencia_updated_at
BEFORE UPDATE ON adherencia_tratamiento
FOR EACH ROW
EXECUTE FUNCTION update_adherencia_updated_at();

-- =====================================================================
-- COMENTARIOS EN TABLA Y COLUMNAS
-- =====================================================================
COMMENT ON TABLE adherencia_tratamiento IS 'Registro de adherencia al tratamiento prescrito';
COMMENT ON COLUMN adherencia_tratamiento.id_adherencia IS 'ID único del registro de adherencia';
COMMENT ON COLUMN adherencia_tratamiento.id_atencion IS 'ID de la atención que prescribió el tratamiento';
COMMENT ON COLUMN adherencia_tratamiento.pk_asegurado IS 'ID del paciente';
COMMENT ON COLUMN adherencia_tratamiento.nombre_medicamento IS 'Nombre del medicamento prescrito';
COMMENT ON COLUMN adherencia_tratamiento.dosis IS 'Dosis del medicamento';
COMMENT ON COLUMN adherencia_tratamiento.frecuencia IS 'Frecuencia de toma (ej: cada 12h, 2 veces al día)';
COMMENT ON COLUMN adherencia_tratamiento.fecha_programada IS 'Fecha/hora en que debía tomar el medicamento';
COMMENT ON COLUMN adherencia_tratamiento.fecha_toma_real IS 'Fecha/hora real en que tomó el medicamento (null si no tomó)';
COMMENT ON COLUMN adherencia_tratamiento.tomo_medicamento IS 'Indica si tomó o no el medicamento';
COMMENT ON COLUMN adherencia_tratamiento.motivo_no_toma IS 'Razón por la que no tomó el medicamento';

-- =====================================================================
-- DATOS DE EJEMPLO (OPCIONAL - Para testing)
-- =====================================================================
-- Ejemplo: Paciente con adherencia alta (90%)
-- INSERT INTO adherencia_tratamiento (id_atencion, pk_asegurado, nombre_medicamento, dosis, frecuencia, fecha_programada, fecha_toma_real, tomo_medicamento)
-- VALUES 
--   (1, '12345678', 'Enalapril', '10mg', 'cada 12 horas', '2026-01-01 08:00:00-05', '2026-01-01 08:15:00-05', TRUE),
--   (1, '12345678', 'Enalapril', '10mg', 'cada 12 horas', '2026-01-01 20:00:00-05', '2026-01-01 20:10:00-05', TRUE),
--   (1, '12345678', 'Enalapril', '10mg', 'cada 12 horas', '2026-01-02 08:00:00-05', NULL, FALSE);

COMMIT;

-- =====================================================================
-- FIN DEL SCRIPT
-- =====================================================================
