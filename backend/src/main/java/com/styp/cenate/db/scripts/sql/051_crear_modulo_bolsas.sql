-- ========================================================================
-- 📊 Script SQL - Módulo Bolsas v1.0.0
-- ========================================================================
-- Descripción: Crea las tablas para el módulo Bolsas de Pacientes
-- Autor: Sistema CENATE
-- Fecha: 2026-01-22
-- ========================================================================

-- ========================================================================
-- 📊 Tabla: dim_bolsa - Bolsas de Pacientes
-- ========================================================================
CREATE TABLE IF NOT EXISTS public.dim_bolsa (
    id_bolsa BIGSERIAL PRIMARY KEY,
    nombre_bolsa VARCHAR(255) NOT NULL,
    descripcion TEXT,
    especialidad_id BIGINT,
    especialidad_nombre VARCHAR(255),
    responsable_id BIGINT,
    responsable_nombre VARCHAR(255),
    total_pacientes INTEGER NOT NULL DEFAULT 0,
    pacientes_asignados INTEGER NOT NULL DEFAULT 0,
    estado VARCHAR(20) NOT NULL DEFAULT 'ACTIVA' CHECK (estado IN ('ACTIVA', 'INACTIVA', 'CERRADA')),
    fecha_creacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT bolsa_nombre_unique UNIQUE(nombre_bolsa),
    CONSTRAINT bolsa_total_pacientes_positive CHECK(total_pacientes >= 0),
    CONSTRAINT bolsa_asignados_valid CHECK(pacientes_asignados >= 0 AND pacientes_asignados <= total_pacientes)
);

-- Índices
CREATE INDEX idx_bolsa_estado ON public.dim_bolsa(estado);
CREATE INDEX idx_bolsa_especialidad ON public.dim_bolsa(especialidad_id);
CREATE INDEX idx_bolsa_responsable ON public.dim_bolsa(responsable_id);
CREATE INDEX idx_bolsa_activo ON public.dim_bolsa(activo);
CREATE INDEX idx_bolsa_fecha_creacion ON public.dim_bolsa(fecha_creacion);

-- Comentarios
COMMENT ON TABLE public.dim_bolsa IS '📊 Bolsas de Pacientes - Gestión centralizada de bolsas por especialidad';
COMMENT ON COLUMN public.dim_bolsa.id_bolsa IS 'Identificador único de la bolsa';
COMMENT ON COLUMN public.dim_bolsa.nombre_bolsa IS 'Nombre descriptivo de la bolsa';
COMMENT ON COLUMN public.dim_bolsa.estado IS 'Estado de la bolsa: ACTIVA, INACTIVA, CERRADA';

-- ========================================================================
-- 📋 Tabla: dim_solicitud_bolsa - Solicitudes de Bolsas
-- ========================================================================
CREATE TABLE IF NOT EXISTS public.dim_solicitud_bolsa (
    id_solicitud BIGSERIAL PRIMARY KEY,
    numero_solicitud VARCHAR(50) NOT NULL UNIQUE,
    paciente_id BIGINT NOT NULL,
    paciente_nombre VARCHAR(255) NOT NULL,
    paciente_dni VARCHAR(20) NOT NULL,
    especialidad VARCHAR(255),
    id_bolsa BIGINT NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE' CHECK (estado IN ('PENDIENTE', 'APROBADA', 'RECHAZADA')),
    razon_rechazo TEXT,
    notas_aprobacion TEXT,
    solicitante_id BIGINT,
    solicitante_nombre VARCHAR(255),
    responsable_aprobacion_id BIGINT,
    responsable_aprobacion_nombre VARCHAR(255),
    fecha_solicitud TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_aprobacion TIMESTAMP WITH TIME ZONE,
    fecha_actualizacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT fk_solicitud_bolsa FOREIGN KEY(id_bolsa) REFERENCES public.dim_bolsa(id_bolsa),
    CONSTRAINT solicitud_paciente_unique UNIQUE(id_bolsa, paciente_id)
);

-- Índices
CREATE INDEX idx_solicitud_estado ON public.dim_solicitud_bolsa(estado);
CREATE INDEX idx_solicitud_bolsa ON public.dim_solicitud_bolsa(id_bolsa);
CREATE INDEX idx_solicitud_paciente_dni ON public.dim_solicitud_bolsa(paciente_dni);
CREATE INDEX idx_solicitud_solicitante ON public.dim_solicitud_bolsa(solicitante_id);
CREATE INDEX idx_solicitud_fecha ON public.dim_solicitud_bolsa(fecha_solicitud);
CREATE INDEX idx_solicitud_activo ON public.dim_solicitud_bolsa(activo);

-- Comentarios
COMMENT ON TABLE public.dim_solicitud_bolsa IS '📋 Solicitudes de Bolsas - Gestión de solicitudes para asignación';
COMMENT ON COLUMN public.dim_solicitud_bolsa.numero_solicitud IS 'Número único de referencia de la solicitud';
COMMENT ON COLUMN public.dim_solicitud_bolsa.estado IS 'Estado: PENDIENTE, APROBADA, RECHAZADA';

-- ========================================================================
-- 📥 Tabla: dim_historial_importacion_bolsa - Historial de Importaciones
-- ========================================================================
CREATE TABLE IF NOT EXISTS public.dim_historial_importacion_bolsa (
    id_importacion BIGSERIAL PRIMARY KEY,
    nombre_archivo VARCHAR(255) NOT NULL,
    ruta_archivo TEXT,
    tipo_archivo VARCHAR(50),
    tamaño_archivo BIGINT,
    usuario_id BIGINT NOT NULL,
    usuario_nombre VARCHAR(255),
    total_registros INTEGER NOT NULL DEFAULT 0,
    registros_exitosos INTEGER NOT NULL DEFAULT 0,
    registros_fallidos INTEGER NOT NULL DEFAULT 0,
    estado_importacion VARCHAR(20) NOT NULL DEFAULT 'EN_PROGRESO'
        CHECK (estado_importacion IN ('EN_PROGRESO', 'COMPLETADA', 'CON_ERRORES', 'FALLIDA')),
    detalles_error TEXT,
    bolsas_importadas INTEGER NOT NULL DEFAULT 0,
    solicitudes_importadas INTEGER NOT NULL DEFAULT 0,
    fecha_importacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_finalizacion TIMESTAMP WITH TIME ZONE,
    activo BOOLEAN NOT NULL DEFAULT TRUE
);

-- Índices
CREATE INDEX idx_importacion_usuario ON public.dim_historial_importacion_bolsa(usuario_id);
CREATE INDEX idx_importacion_fecha ON public.dim_historial_importacion_bolsa(fecha_importacion);
CREATE INDEX idx_importacion_estado ON public.dim_historial_importacion_bolsa(estado_importacion);
CREATE INDEX idx_importacion_activo ON public.dim_historial_importacion_bolsa(activo);

-- Comentarios
COMMENT ON TABLE public.dim_historial_importacion_bolsa IS '📥 Historial de Importaciones - Auditoría de importaciones desde Excel';
COMMENT ON COLUMN public.dim_historial_importacion_bolsa.id_importacion IS 'Identificador único del proceso de importación';
COMMENT ON COLUMN public.dim_historial_importacion_bolsa.estado_importacion IS 'Estado: EN_PROGRESO, COMPLETADA, CON_ERRORES, FALLIDA';

-- ========================================================================
-- 🧪 Datos de prueba (Opcional)
-- ========================================================================
-- Insertar bolsas de prueba
INSERT INTO public.dim_bolsa (nombre_bolsa, descripcion, especialidad_id, especialidad_nombre, responsable_id, responsable_nombre, total_pacientes, estado, activo)
VALUES
    ('Bolsa Cardiología 2026-01', 'Bolsa de pacientes para evaluación cardiológica', 1, 'Cardiología', 1, 'Dr. Juan Pérez', 45, 'ACTIVA', true),
    ('Bolsa Neurología Q1', 'Pacientes neurología primer trimestre', 2, 'Neurología', 2, 'Dra. María López', 32, 'ACTIVA', true),
    ('Bolsa Oncología 2025-Q4', 'Seguimiento cuarto trimestre 2025', 3, 'Oncología', 3, 'Dr. Carlos Ruiz', 20, 'INACTIVA', true)
ON CONFLICT (nombre_bolsa) DO NOTHING;

-- ========================================================================
-- ✅ Triggers y funciones de auditoría
-- ========================================================================

-- Trigger para actualizar fecha_actualizacion en dim_bolsa
CREATE OR REPLACE FUNCTION update_bolsa_actualizacion()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_bolsa_actualizacion ON public.dim_bolsa;
CREATE TRIGGER trigger_bolsa_actualizacion
BEFORE UPDATE ON public.dim_bolsa
FOR EACH ROW
EXECUTE FUNCTION update_bolsa_actualizacion();

-- Trigger para actualizar fecha_actualizacion en dim_solicitud_bolsa
CREATE OR REPLACE FUNCTION update_solicitud_actualizacion()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_solicitud_actualizacion ON public.dim_solicitud_bolsa;
CREATE TRIGGER trigger_solicitud_actualizacion
BEFORE UPDATE ON public.dim_solicitud_bolsa
FOR EACH ROW
EXECUTE FUNCTION update_solicitud_actualizacion();

-- ========================================================================
-- ✅ Script finalizado
-- ========================================================================
-- Líneas de confirmación
SELECT 'Tablas del módulo Bolsas creadas exitosamente' AS resultado;
SELECT COUNT(*) as total_bolsas FROM public.dim_bolsa;
SELECT COUNT(*) as total_solicitudes FROM public.dim_solicitud_bolsa;
SELECT COUNT(*) as total_importaciones FROM public.dim_historial_importacion_bolsa;
