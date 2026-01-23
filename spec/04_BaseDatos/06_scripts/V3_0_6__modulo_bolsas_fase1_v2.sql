-- ============================================================================
-- 📋 Migración: Módulo de Bolsas Fase 1 v2.0
-- Tabla: dim_solicitud_bolsa (Actualización)
-- Descripción: Agregar campos para asegurado_id, gestora, estado_gestion, telefono, email
-- Autor: Sistema CENATE
-- Fecha: 2026-01-22
-- ============================================================================

-- 1. Alterar tabla dim_solicitud_bolsa para reemplazar paciente_id con asegurado_id
ALTER TABLE public.dim_solicitud_bolsa
ADD COLUMN IF NOT EXISTS asegurado_id BIGINT NOT NULL DEFAULT 0;

ALTER TABLE public.dim_solicitud_bolsa
ADD CONSTRAINT fk_solicitud_bolsa_asegurado
FOREIGN KEY (asegurado_id)
REFERENCES public.pacientes_asegurados(id_asegurado)
ON DELETE RESTRICT
ON UPDATE CASCADE;

-- 2. Agregar campos de contacto
ALTER TABLE public.dim_solicitud_bolsa
ADD COLUMN IF NOT EXISTS paciente_telefono VARCHAR(20),
ADD COLUMN IF NOT EXISTS paciente_email VARCHAR(255);

-- 3. Agregar campos de asignación a gestora
ALTER TABLE public.dim_solicitud_bolsa
ADD COLUMN IF NOT EXISTS responsable_gestora_id BIGINT,
ADD COLUMN IF NOT EXISTS responsable_gestora_nombre VARCHAR(255),
ADD COLUMN IF NOT EXISTS fecha_asignacion TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.dim_solicitud_bolsa
ADD CONSTRAINT fk_solicitud_bolsa_gestora
FOREIGN KEY (responsable_gestora_id)
REFERENCES public.usuarios(id_usuario)
ON DELETE SET NULL
ON UPDATE CASCADE;

-- 4. Agregar campo de estado de gestión de citas
ALTER TABLE public.dim_solicitud_bolsa
ADD COLUMN IF NOT EXISTS estado_gestion_citas_id BIGINT;

ALTER TABLE public.dim_solicitud_bolsa
ADD CONSTRAINT fk_solicitud_bolsa_estado_gestion
FOREIGN KEY (estado_gestion_citas_id)
REFERENCES public.dim_estados_gestion_citas(id_estado)
ON DELETE SET NULL
ON UPDATE CASCADE;

-- 5. Agregar campo de seguimiento de recordatorios
ALTER TABLE public.dim_solicitud_bolsa
ADD COLUMN IF NOT EXISTS recordatorio_enviado BOOLEAN DEFAULT FALSE;

-- 6. Crear índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_solicitud_bolsa_asegurado
ON public.dim_solicitud_bolsa(asegurado_id);

CREATE INDEX IF NOT EXISTS idx_solicitud_bolsa_gestora
ON public.dim_solicitud_bolsa(responsable_gestora_id);

CREATE INDEX IF NOT EXISTS idx_solicitud_bolsa_estado_gestion
ON public.dim_solicitud_bolsa(estado_gestion_citas_id);

CREATE INDEX IF NOT EXISTS idx_solicitud_bolsa_fecha_asignacion
ON public.dim_solicitud_bolsa(fecha_asignacion);

CREATE INDEX IF NOT EXISTS idx_solicitud_bolsa_recordatorio
ON public.dim_solicitud_bolsa(recordatorio_enviado);

-- 7. Crear tabla de auditoría para asignaciones a gestoras
CREATE TABLE IF NOT EXISTS public.dim_asignacion_bolsa_gestora (
    id_asignacion BIGSERIAL PRIMARY KEY,
    id_solicitud BIGINT NOT NULL,
    gestora_id BIGINT NOT NULL,
    coordinador_id BIGINT NOT NULL,
    fecha_asignacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    notas_auditoria TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE,

    CONSTRAINT fk_asignacion_solicitud FOREIGN KEY (id_solicitud)
        REFERENCES public.dim_solicitud_bolsa(id_solicitud)
        ON DELETE CASCADE ON UPDATE CASCADE,

    CONSTRAINT fk_asignacion_gestora FOREIGN KEY (gestora_id)
        REFERENCES public.usuarios(id_usuario)
        ON DELETE SET NULL ON UPDATE CASCADE,

    CONSTRAINT fk_asignacion_coordinador FOREIGN KEY (coordinador_id)
        REFERENCES public.usuarios(id_usuario)
        ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_asignacion_solicitud
ON public.dim_asignacion_bolsa_gestora(id_solicitud);

CREATE INDEX IF NOT EXISTS idx_asignacion_gestora
ON public.dim_asignacion_bolsa_gestora(gestora_id);

CREATE INDEX IF NOT EXISTS idx_asignacion_fecha
ON public.dim_asignacion_bolsa_gestora(fecha_asignacion);

-- 8. Crear tabla de auditoría para cambios de teléfono
CREATE TABLE IF NOT EXISTS public.dim_cambios_telefono_bolsa (
    id BIGSERIAL PRIMARY KEY,
    id_solicitud BIGINT NOT NULL,
    usuario_id BIGINT NOT NULL,
    telefono_anterior VARCHAR(20),
    telefono_nuevo VARCHAR(20) NOT NULL,
    razon_cambio VARCHAR(255),
    fecha_cambio TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE,

    CONSTRAINT fk_cambio_telefono_solicitud FOREIGN KEY (id_solicitud)
        REFERENCES public.dim_solicitud_bolsa(id_solicitud)
        ON DELETE CASCADE ON UPDATE CASCADE,

    CONSTRAINT fk_cambio_telefono_usuario FOREIGN KEY (usuario_id)
        REFERENCES public.usuarios(id_usuario)
        ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_cambio_telefono_solicitud
ON public.dim_cambios_telefono_bolsa(id_solicitud);

CREATE INDEX IF NOT EXISTS idx_cambio_telefono_fecha
ON public.dim_cambios_telefono_bolsa(fecha_cambio);

-- ============================================================================
-- NOTAS DE MIGRACIÓN
-- ============================================================================
--
-- 1. Se mantiene compatibilidad con paciente_id existente (si lo hay)
-- 2. El campo asegurado_id es obligatorio y debe poblarse antes de usar
-- 3. Los campos paciente_telefono y paciente_email son opcionales
-- 4. El campo responsable_gestora_id indica quién gestiona la solicitud
-- 5. El campo estado_gestion_citas_id vincula con los 10 estados de citas
-- 6. Se incluyen 2 tablas de auditoría para tracking completo
--
-- ============================================================================
