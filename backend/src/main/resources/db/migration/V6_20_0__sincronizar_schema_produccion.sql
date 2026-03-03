-- =====================================================================
-- V6_20_0 — Sincronización de schema: producción con entidad JPA
-- =====================================================================
-- Propósito: Garantizar que dim_solicitud_bolsa en PRODUCCIÓN tenga
--   TODAS las columnas mapeadas en SolicitudBolsa.java.
--   Usa ADD COLUMN IF NOT EXISTS → idempotente y seguro de re-ejecutar.
-- Contexto: La BD de producción puede estar desfasada respecto al
--   schema del ambiente de desarrollo. Este script unifica ambos.
-- =====================================================================

-- ── Columnas de Excel v1.8.0 ──────────────────────────────────────────
ALTER TABLE public.dim_solicitud_bolsa
    ADD COLUMN IF NOT EXISTS fecha_preferida_no_atendida DATE;

ALTER TABLE public.dim_solicitud_bolsa
    ADD COLUMN IF NOT EXISTS tipo_documento VARCHAR(50);

ALTER TABLE public.dim_solicitud_bolsa
    ADD COLUMN IF NOT EXISTS fecha_nacimiento DATE;

ALTER TABLE public.dim_solicitud_bolsa
    ADD COLUMN IF NOT EXISTS paciente_sexo VARCHAR(10);

ALTER TABLE public.dim_solicitud_bolsa
    ADD COLUMN IF NOT EXISTS paciente_telefono VARCHAR(20);

ALTER TABLE public.dim_solicitud_bolsa
    ADD COLUMN IF NOT EXISTS paciente_telefono_alterno VARCHAR(20);

ALTER TABLE public.dim_solicitud_bolsa
    ADD COLUMN IF NOT EXISTS paciente_email VARCHAR(255);

ALTER TABLE public.dim_solicitud_bolsa
    ADD COLUMN IF NOT EXISTS codigo_ipress VARCHAR(20);

ALTER TABLE public.dim_solicitud_bolsa
    ADD COLUMN IF NOT EXISTS tipo_cita VARCHAR(50);

ALTER TABLE public.dim_solicitud_bolsa
    ADD COLUMN IF NOT EXISTS tiempo_inicio_sintomas TEXT;

ALTER TABLE public.dim_solicitud_bolsa
    ADD COLUMN IF NOT EXISTS consentimiento_informado BOOLEAN;

-- ── Campos Dengue ─────────────────────────────────────────────────────
ALTER TABLE public.dim_solicitud_bolsa
    ADD COLUMN IF NOT EXISTS cenasicod INTEGER;

ALTER TABLE public.dim_solicitud_bolsa
    ADD COLUMN IF NOT EXISTS dx_main VARCHAR(10);

ALTER TABLE public.dim_solicitud_bolsa
    ADD COLUMN IF NOT EXISTS fecha_sintomas DATE;

ALTER TABLE public.dim_solicitud_bolsa
    ADD COLUMN IF NOT EXISTS semana_epidem VARCHAR(20);

-- ── Gestión de citas ──────────────────────────────────────────────────
ALTER TABLE public.dim_solicitud_bolsa
    ADD COLUMN IF NOT EXISTS responsable_gestora_id BIGINT;

ALTER TABLE public.dim_solicitud_bolsa
    ADD COLUMN IF NOT EXISTS fecha_asignacion TIMESTAMP WITH TIME ZONE;

-- ── Auditoría cambio de estado ────────────────────────────────────────
ALTER TABLE public.dim_solicitud_bolsa
    ADD COLUMN IF NOT EXISTS fecha_cambio_estado TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.dim_solicitud_bolsa
    ADD COLUMN IF NOT EXISTS usuario_cambio_estado_id BIGINT;

-- ── Cita agendada ─────────────────────────────────────────────────────
ALTER TABLE public.dim_solicitud_bolsa
    ADD COLUMN IF NOT EXISTS fecha_atencion DATE;

ALTER TABLE public.dim_solicitud_bolsa
    ADD COLUMN IF NOT EXISTS hora_atencion TIME;

ALTER TABLE public.dim_solicitud_bolsa
    ADD COLUMN IF NOT EXISTS id_personal BIGINT;

-- ── Datos médicos ─────────────────────────────────────────────────────
ALTER TABLE public.dim_solicitud_bolsa
    ADD COLUMN IF NOT EXISTS condicion_medica VARCHAR(100);

ALTER TABLE public.dim_solicitud_bolsa
    ADD COLUMN IF NOT EXISTS observaciones_medicas TEXT;

ALTER TABLE public.dim_solicitud_bolsa
    ADD COLUMN IF NOT EXISTS fecha_atencion_medica TIMESTAMP WITH TIME ZONE;

-- ── IPRESS Atención ───────────────────────────────────────────────────
ALTER TABLE public.dim_solicitud_bolsa
    ADD COLUMN IF NOT EXISTS id_ipress_atencion BIGINT;

-- ── Trazabilidad recitas ──────────────────────────────────────────────
ALTER TABLE public.dim_solicitud_bolsa
    ADD COLUMN IF NOT EXISTS idsolicitudgeneracion BIGINT;

ALTER TABLE public.dim_solicitud_bolsa
    ADD COLUMN IF NOT EXISTS id_atencion_clinica BIGINT;

-- ── Motivo de llamada ─────────────────────────────────────────────────
ALTER TABLE public.dim_solicitud_bolsa
    ADD COLUMN IF NOT EXISTS motivo_llamada_bolsa VARCHAR(500);

-- ── Motivo de anulación ───────────────────────────────────────────────
ALTER TABLE public.dim_solicitud_bolsa
    ADD COLUMN IF NOT EXISTS motivo_anulacion TEXT;

-- ── Historial de carga Excel ──────────────────────────────────────────
ALTER TABLE public.dim_solicitud_bolsa
    ADD COLUMN IF NOT EXISTS id_carga_excel BIGINT;

-- ── Índices útiles (IF NOT EXISTS es seguro) ──────────────────────────
CREATE INDEX IF NOT EXISTS idx_solicitud_bolsa_id_carga_excel
    ON public.dim_solicitud_bolsa(id_carga_excel)
    WHERE id_carga_excel IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_solicitud_bolsa_id_personal
    ON public.dim_solicitud_bolsa(id_personal)
    WHERE id_personal IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_solicitud_bolsa_id_atencion_clinica
    ON public.dim_solicitud_bolsa(id_atencion_clinica)
    WHERE id_atencion_clinica IS NOT NULL;
