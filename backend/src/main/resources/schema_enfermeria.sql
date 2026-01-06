-- ============================================================
-- MÓDULO DE ENFERMERÍA (CENACRON)
-- ============================================================

-- 1. Tabla de Atenciones de Enfermería
CREATE TABLE IF NOT EXISTS atenciones_enfermeria (
    id_atencion_enf BIGSERIAL PRIMARY KEY,
    id_paciente BIGINT NOT NULL,
    
    -- Origen de la atención (Referencia)
    id_atencion_medica_ref BIGINT, -- FK a Medicina General
    id_cita_ref BIGINT,            -- FK a Gestión de Citas
    
    fecha_atencion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Datos Clínicos (Historial)
    motivo_consulta TEXT,
    observaciones TEXT,
    signos_vitales JSONB, -- Estructura: { "pa": "120/80", "fc": 72, "spo2": 98, "temp": 36.5, "peso": 70, "talla": 170 }
    
    -- Auditoría
    id_usuario_enfermera BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indices para búsqueda rápida
CREATE INDEX IF NOT EXISTS idx_atenciones_enf_paciente ON atenciones_enfermeria(id_paciente);
CREATE INDEX IF NOT EXISTS idx_atenciones_enf_med_ref ON atenciones_enfermeria(id_atencion_medica_ref);
CREATE INDEX IF NOT EXISTS idx_atenciones_enf_cita_ref ON atenciones_enfermeria(id_cita_ref);

-- 2. Tabla de Interconsultas (Bolsa de Especialidades)
CREATE TABLE IF NOT EXISTS pacientes_interconsulta (
    id_interconsulta BIGSERIAL PRIMARY KEY,
    id_paciente BIGINT NOT NULL,
    
    -- Origen
    id_atencion_origen BIGINT NOT NULL, -- FK a atenciones_enfermeria
    origen VARCHAR(20) DEFAULT 'ENFERMERIA',
    
    -- Destino
    especialidad_destino VARCHAR(100) NOT NULL,
    motivo_derivacion TEXT,
    
    -- Estado
    estado VARCHAR(20) DEFAULT 'PENDIENTE', -- PENDIENTE, ASIGNADO, ATENDIDO
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_interconsulta_estado ON pacientes_interconsulta(estado);
CREATE INDEX IF NOT EXISTS idx_interconsulta_especialidad ON pacientes_interconsulta(especialidad_destino);

-- FK Constraints (Si las tablas referenciadas existen, descomentar si es necesario o ejecutar por separado)
-- ALTER TABLE atenciones_enfermeria ADD CONSTRAINT fk_enf_paciente FOREIGN KEY (id_paciente) REFERENCES dim_asegurado(id_asegurado);
-- ALTER TABLE atenciones_enfermeria ADD CONSTRAINT fk_enf_med FOREIGN KEY (id_atencion_medica_ref) REFERENCES atenciones_medicina_general(id_atencion);
-- ALTER TABLE pacientes_interconsulta ADD CONSTRAINT fk_inter_paciente FOREIGN KEY (id_paciente) REFERENCES dim_asegurado(id_asegurado);
-- ALTER TABLE pacientes_interconsulta ADD CONSTRAINT fk_inter_origen FOREIGN KEY (id_atencion_origen) REFERENCES atenciones_enfermeria(id_atencion_enf);
