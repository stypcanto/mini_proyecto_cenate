-- ========================================================================
-- 📊 Script SQL - Módulo Bolsas v1.12.0
-- ========================================================================
-- Descripción: Crea las tablas para el módulo Bolsas de Pacientes
-- Autor: Sistema CENATE
-- Fecha: 2026-01-22
-- Actualizado: 2026-01-27 (v1.12.0)
-- ========================================================================

-- ========================================================================
-- ⚠️ NOTA: dim_bolsa (v1.0.0) ELIMINADA - No usada en arquitectura actual
-- ========================================================================
-- dim_bolsa fue diseñada como tabla intermedia pero nunca se implementó.
-- La arquitectura actual usa directamente:
--   dim_tipos_bolsas (CATÁLOGO de tipos)
--        ↓ (referencia)
--   dim_solicitud_bolsa (SOLICITUDES de pacientes)
--
-- dim_bolsa es redundante y se elimina en: V_cleanup_remove_unused_dim_bolsa.sql
-- ========================================================================

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
-- NOTA: Datos de prueba para dim_bolsa ELIMINADOS (tabla no usada)
-- Los tipos de bolsa se crean en: V3_0_2__crear_tabla_tipos_bolsas.sql

-- ========================================================================
-- ✅ Triggers y funciones de auditoría
-- ========================================================================
-- NOTA: Triggers para dim_bolsa ELIMINADOS (tabla no usada)

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
SELECT 'Tablas del módulo Bolsas creadas exitosamente (v1.12.0)' AS resultado;
SELECT 'dim_bolsa: Tabla obsoleta, será eliminada por migration V_cleanup_remove_unused_dim_bolsa.sql' AS info;
SELECT COUNT(*) as total_solicitudes FROM public.dim_solicitud_bolsa;
SELECT COUNT(*) as total_importaciones FROM public.dim_historial_importacion_bolsa;
