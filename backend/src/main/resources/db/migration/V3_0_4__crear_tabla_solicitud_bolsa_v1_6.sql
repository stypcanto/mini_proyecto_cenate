-- ============================================================================
-- Script SQL: Crear tabla dim_solicitud_bolsa v1.6.0
-- ============================================================================
-- Descripción: Tabla central que almacena solicitudes de bolsas de pacientes
-- Versión: v1.6.0 (Estados Citas Integrados)
-- Fecha: 2026-01-23
-- Campos: 26
-- Foreign Keys: 8
-- Índices: 9
-- ============================================================================

-- ============================================================================
-- 1. DROP TABLE (si existe)
-- ============================================================================
DROP TABLE IF EXISTS public.dim_solicitud_bolsa CASCADE;

-- ============================================================================
-- 2. CREATE TABLE
-- ============================================================================
CREATE TABLE public.dim_solicitud_bolsa (
    -- ────────────────────────────────────────────────────────────────────
    -- 🔑 IDENTIFICACIÓN (Auto-generada)
    -- ────────────────────────────────────────────────────────────────────
    id_solicitud BIGSERIAL PRIMARY KEY,
    numero_solicitud VARCHAR(50) NOT NULL UNIQUE,

    -- ────────────────────────────────────────────────────────────────────
    -- 📦 TIPO DE BOLSA (De: Selector PASO 1)
    -- ────────────────────────────────────────────────────────────────────
    id_tipo_bolsa BIGINT NOT NULL,
    cod_tipo_bolsa TEXT,
    desc_tipo_bolsa TEXT,

    -- ────────────────────────────────────────────────────────────────────
    -- 🏥 ESPECIALIDAD (De: Selector PASO 2)
    -- ────────────────────────────────────────────────────────────────────
    id_servicio BIGINT NOT NULL,
    especialidad VARCHAR(255),
    cod_servicio VARCHAR(10),

    -- ────────────────────────────────────────────────────────────────────
    -- 👤 DATOS PACIENTE (De: Excel + Validación)
    -- ────────────────────────────────────────────────────────────────────
    paciente_dni VARCHAR(20) NOT NULL,
    paciente_id BIGINT NOT NULL,
    paciente_nombre VARCHAR(255) NOT NULL,

    -- ────────────────────────────────────────────────────────────────────
    -- 🏥 INFORMACIÓN IPRESS (De: Excel + Validación)
    -- ────────────────────────────────────────────────────────────────────
    codigo_adscripcion VARCHAR(20) NOT NULL,
    id_ipress BIGINT,
    nombre_ipress VARCHAR(255),
    red_asistencial VARCHAR(255),

    -- ────────────────────────────────────────────────────────────────────
    -- 📊 ESTADO Y SOLICITANTE (Auto-asignados)
    -- ────────────────────────────────────────────────────────────────────
    estado_gestion_citas_id BIGINT NOT NULL DEFAULT 5,
    cod_estado_cita TEXT,
    desc_estado_cita VARCHAR(255),
    solicitante_id BIGINT,
    solicitante_nombre VARCHAR(255),

    -- ────────────────────────────────────────────────────────────────────
    -- 👤 GESTOR DE CITAS (Se asigna posteriormente)
    -- ────────────────────────────────────────────────────────────────────
    responsable_gestora_id BIGINT,
    fecha_asignacion TIMESTAMP WITH TIME ZONE,

    -- ────────────────────────────────────────────────────────────────────
    -- ⏰ AUDITORÍA (Auto-generadas)
    -- ────────────────────────────────────────────────────────────────────
    fecha_solicitud TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN NOT NULL DEFAULT true,
    recordatorio_enviado BOOLEAN DEFAULT false,

    -- ────────────────────────────────────────────────────────────────────
    -- CONSTRAINT: Evitar duplicados
    -- ────────────────────────────────────────────────────────────────────
    CONSTRAINT uk_solicitud_bolsa_tipo_paciente_servicio
        UNIQUE (id_tipo_bolsa, paciente_id, id_servicio)
);

-- ============================================================================
-- 3. FOREIGN KEYS
-- ============================================================================

-- FK1: id_tipo_bolsa → dim_tipos_bolsas
ALTER TABLE public.dim_solicitud_bolsa
    ADD CONSTRAINT fk_solicitud_bolsa_tipo_bolsa
    FOREIGN KEY (id_tipo_bolsa)
    REFERENCES public.dim_tipos_bolsas(id_tipo_bolsa)
    ON UPDATE CASCADE ON DELETE RESTRICT;

-- FK2: id_servicio → dim_servicio_essi
ALTER TABLE public.dim_solicitud_bolsa
    ADD CONSTRAINT fk_solicitud_bolsa_servicio
    FOREIGN KEY (id_servicio)
    REFERENCES public.dim_servicio_essi(id_servicio)
    ON UPDATE CASCADE ON DELETE RESTRICT;

-- FK3: paciente_id → asegurados.pk_asegurado
ALTER TABLE public.dim_solicitud_bolsa
    ADD CONSTRAINT fk_solicitud_bolsa_paciente
    FOREIGN KEY (paciente_id)
    REFERENCES public.asegurados(pk_asegurado)
    ON UPDATE CASCADE ON DELETE RESTRICT;

-- FK4: id_ipress → dim_ipress
ALTER TABLE public.dim_solicitud_bolsa
    ADD CONSTRAINT fk_solicitud_bolsa_ipress
    FOREIGN KEY (id_ipress)
    REFERENCES public.dim_ipress(id_ipress)
    ON UPDATE CASCADE ON DELETE SET NULL;

-- FK5: estado_gestion_citas_id → dim_estados_gestion_citas (NUEVO)
ALTER TABLE public.dim_solicitud_bolsa
    ADD CONSTRAINT fk_solicitud_bolsa_estado_gestion_citas
    FOREIGN KEY (estado_gestion_citas_id)
    REFERENCES public.dim_estados_gestion_citas(id_estado_cita)
    ON UPDATE CASCADE ON DELETE RESTRICT;

-- FK6: solicitante_id → dim_usuarios
ALTER TABLE public.dim_solicitud_bolsa
    ADD CONSTRAINT fk_solicitud_bolsa_solicitante
    FOREIGN KEY (solicitante_id)
    REFERENCES public.dim_usuarios(id_user)
    ON UPDATE CASCADE ON DELETE SET NULL;

-- FK7: responsable_gestora_id → dim_usuarios
ALTER TABLE public.dim_solicitud_bolsa
    ADD CONSTRAINT fk_solicitud_bolsa_gestora
    FOREIGN KEY (responsable_gestora_id)
    REFERENCES public.dim_usuarios(id_user)
    ON UPDATE CASCADE ON DELETE SET NULL;

-- ============================================================================
-- 4. ÍNDICES (9 Índices para Optimización)
-- ============================================================================

-- Índices de búsqueda de pacientes
CREATE INDEX idx_solicitud_bolsa_dni
    ON public.dim_solicitud_bolsa(paciente_dni);

CREATE INDEX idx_solicitud_bolsa_nombre
    ON public.dim_solicitud_bolsa(paciente_nombre);

CREATE INDEX idx_solicitud_bolsa_codigo_adscripcion
    ON public.dim_solicitud_bolsa(codigo_adscripcion);

-- Índices de filtrado por estado y tipo
CREATE INDEX idx_solicitud_bolsa_estado_gestion
    ON public.dim_solicitud_bolsa(estado_gestion_citas_id);

CREATE INDEX idx_solicitud_bolsa_tipo
    ON public.dim_solicitud_bolsa(id_tipo_bolsa);

CREATE INDEX idx_solicitud_bolsa_servicio
    ON public.dim_solicitud_bolsa(id_servicio);

-- Índice para asignación a gestoras
CREATE INDEX idx_solicitud_bolsa_gestora
    ON public.dim_solicitud_bolsa(responsable_gestora_id);

-- Índices de fecha para rangos
CREATE INDEX idx_solicitud_bolsa_fecha_solicitud
    ON public.dim_solicitud_bolsa(fecha_solicitud);

CREATE INDEX idx_solicitud_bolsa_fecha_asignacion
    ON public.dim_solicitud_bolsa(fecha_asignacion);

-- Índice compuesto para reportes
CREATE INDEX idx_solicitud_bolsa_tipo_estado
    ON public.dim_solicitud_bolsa(id_tipo_bolsa, estado_gestion_citas_id);

-- ============================================================================
-- 5. TRIGGER para Auto-actualizar fecha_actualizacion
-- ============================================================================
CREATE OR REPLACE FUNCTION public.fn_actualizar_fecha_modificacion_solicitud_bolsa()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion := CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_actualizar_fecha_solicitud_bolsa
BEFORE UPDATE ON public.dim_solicitud_bolsa
FOR EACH ROW
EXECUTE FUNCTION public.fn_actualizar_fecha_modificacion_solicitud_bolsa();

-- ============================================================================
-- 6. COMENTARIOS DESCRIPTIVOS
-- ============================================================================
COMMENT ON TABLE public.dim_solicitud_bolsa IS
    'Tabla central v1.6.0 que almacena solicitudes de bolsas de pacientes.
     Combina datos de múltiples fuentes: Excel (DNI + código), selectores
     (tipo de bolsa + especialidad), validaciones (asegurados + IPRESS) y
     auto-enriquecimiento (nombres, IPRESS, red, estado inicial)';

COMMENT ON COLUMN public.dim_solicitud_bolsa.estado_gestion_citas_id IS
    'Referencia a dim_estados_gestion_citas. Estado inicial: 5 (PENDIENTE_CITA).
     Puede cambiar a: CITADO, NO_CONTESTA, CANCELADO, ASISTIO, etc.';

COMMENT ON COLUMN public.dim_solicitud_bolsa.numero_solicitud IS
    'Auto-generado con formato: BOLSA-YYYYMMDD-XXXXX. Ej: BOLSA-20260123-00001';

-- ============================================================================
-- 7. VALIDACIÓN POST-CREACIÓN
-- ============================================================================
-- Verificar que dim_estados_gestion_citas tiene registro PENDIENTE_CITA con ID=5
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM public.dim_estados_gestion_citas
        WHERE id_estado_cita = 5 AND cod_estado_cita = 'PENDIENTE_CITA'
    ) THEN
        -- Si no existe, agregarlo manualmente
        RAISE NOTICE 'ADVERTENCIA: Estado PENDIENTE_CITA con id=5 no encontrado en dim_estados_gestion_citas';
        RAISE NOTICE 'Asegúrese de que existe el registro con id=5 y cod_estado_cita=PENDIENTE_CITA';
    END IF;
END $$;

-- ============================================================================
-- 8. VERIFICACIÓN FINAL
-- ============================================================================
-- Listar columnas de la tabla
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'dim_solicitud_bolsa'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Listar foreign keys
SELECT constraint_name, column_name, foreign_table_name, foreign_column_name
FROM information_schema.key_column_usage
WHERE table_name = 'dim_solicitud_bolsa'
AND table_schema = 'public'
AND foreign_table_name IS NOT NULL
ORDER BY constraint_name;

-- Listar índices
\di public.idx_solicitud_bolsa*

-- ============================================================================
-- FIN DEL SCRIPT
-- ============================================================================
