-- ============================================================================
-- 📋 Migración: Mejora Estructura dim_bolsa - Relaciones Correctas
-- Tabla: dim_bolsa (Mejora Arquitectónica)
-- Descripción: Agregar relaciones con dim_tipos_bolsas y mejorar integridad
-- Autor: Sistema CENATE
-- Fecha: 2026-01-22
-- Versión: v1.0
-- ============================================================================

-- ============================================================================
-- PASO 1: AGREGAR COLUMNA DE TIPO DE BOLSA (FOREIGN KEY)
-- ============================================================================

-- Agregar columna id_tipo_bolsa si no existe
ALTER TABLE public.dim_bolsa
ADD COLUMN IF NOT EXISTS id_tipo_bolsa BIGINT;

-- Crear constraint de foreign key hacia dim_tipos_bolsas
ALTER TABLE public.dim_bolsa
ADD CONSTRAINT IF NOT EXISTS fk_bolsa_tipo_bolsa
FOREIGN KEY (id_tipo_bolsa)
REFERENCES public.dim_tipos_bolsas(id_tipo_bolsa)
ON DELETE RESTRICT
ON UPDATE CASCADE;

-- Crear índice para mejorar búsquedas
CREATE INDEX IF NOT EXISTS idx_bolsa_tipo_bolsa
ON public.dim_bolsa(id_tipo_bolsa);

-- ============================================================================
-- PASO 2: MEJORAR TABLA dim_solicitud_bolsa (RELACIÓN CON ASEGURADOS)
-- ============================================================================

-- Asegurar que existe la relación con asegurados (usar doc_paciente como FK)
-- Si existe paciente_id, agregamos doc_paciente para relacionar con asegurados
ALTER TABLE public.dim_solicitud_bolsa
ADD COLUMN IF NOT EXISTS doc_paciente VARCHAR(255);

-- Crear constraint de foreign key hacia asegurados usando doc_paciente
ALTER TABLE public.dim_solicitud_bolsa
ADD CONSTRAINT IF NOT EXISTS fk_solicitud_bolsa_asegurado_doc
FOREIGN KEY (doc_paciente)
REFERENCES public.asegurados(doc_paciente)
ON DELETE RESTRICT
ON UPDATE CASCADE;

-- Crear índice para búsquedas por documento
CREATE INDEX IF NOT EXISTS idx_solicitud_bolsa_doc_paciente
ON public.dim_solicitud_bolsa(doc_paciente);

-- ============================================================================
-- PASO 3: ASEGURAR RELACIÓN dim_solicitud_bolsa -> dim_bolsa -> dim_tipos_bolsas
-- ============================================================================

-- Verificar que existe fk_solicitud_bolsa hacia dim_bolsa
-- (Already exists but let's ensure it's correct)

-- Crear vista para validar la relación completa
CREATE OR REPLACE VIEW vw_solicitud_bolsa_detalle AS
SELECT
    sb.id_solicitud,
    sb.id_bolsa,
    db.nombre_bolsa,
    db.id_tipo_bolsa,
    dtb.cod_tipo_bolsa,
    dtb.desc_tipo_bolsa,
    sb.doc_paciente,
    a.paciente,
    a.tel_celular,
    a.correo_electronico,
    sb.paciente_telefono,
    sb.paciente_email,
    sb.estado,
    sb.responsable_gestora_id,
    sb.responsable_gestora_nombre,
    sb.estado_gestion_citas_id,
    sb.fecha_creacion,
    sb.fecha_asignacion,
    sb.recordatorio_enviado,
    sb.activo
FROM public.dim_solicitud_bolsa sb
LEFT JOIN public.dim_bolsa db ON sb.id_bolsa = db.id_bolsa
LEFT JOIN public.dim_tipos_bolsas dtb ON db.id_tipo_bolsa = dtb.id_tipo_bolsa
LEFT JOIN public.asegurados a ON sb.doc_paciente = a.doc_paciente
WHERE sb.activo = TRUE;

-- ============================================================================
-- PASO 4: CREAR CONSTRAINT CHECK PARA VALIDAR DATOS
-- ============================================================================

-- Agregar constraint para asegurar que si hay doc_paciente, coincida con nombre
ALTER TABLE public.dim_solicitud_bolsa
ADD CONSTRAINT IF NOT EXISTS check_solicitud_paciente_datos
CHECK (
    doc_paciente IS NOT NULL AND doc_paciente != ''
);

-- ============================================================================
-- PASO 5: CREAR TRIGGER PARA SINCRONIZAR DATOS DEL ASEGURADO
-- ============================================================================

-- Crear función que actualiza teléfono y email desde tabla asegurados
CREATE OR REPLACE FUNCTION sync_asegurado_datos()
RETURNS TRIGGER AS $$
BEGIN
    -- Si se inserta/actualiza con doc_paciente, traer datos de asegurados
    IF NEW.doc_paciente IS NOT NULL THEN
        UPDATE public.dim_solicitud_bolsa
        SET
            paciente_telefono = COALESCE(NEW.paciente_telefono, a.tel_celular),
            paciente_email = COALESCE(NEW.paciente_email, a.correo_electronico)
        FROM public.asegurados a
        WHERE a.doc_paciente = NEW.doc_paciente
        AND dim_solicitud_bolsa.id_solicitud = NEW.id_solicitud;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger
CREATE TRIGGER trg_sync_asegurado_datos
AFTER INSERT OR UPDATE ON public.dim_solicitud_bolsa
FOR EACH ROW
EXECUTE FUNCTION sync_asegurado_datos();

-- ============================================================================
-- PASO 6: CREAR FUNCIÓN PARA VERIFICAR INTEGRIDAD DE RELACIONES
-- ============================================================================

CREATE OR REPLACE FUNCTION verify_bolsa_relaciones()
RETURNS TABLE(
    issue_type VARCHAR,
    issue_description TEXT,
    affected_rows BIGINT
) AS $$
BEGIN
    -- Verificar bolsas sin tipo de bolsa
    RETURN QUERY
    SELECT
        'WARNING'::VARCHAR,
        'Bolsas sin tipo definido'::TEXT,
        COUNT(*)::BIGINT
    FROM public.dim_bolsa
    WHERE id_tipo_bolsa IS NULL AND activo = TRUE;

    -- Verificar solicitudes sin bolsa
    RETURN QUERY
    SELECT
        'ERROR'::VARCHAR,
        'Solicitudes sin bolsa asignada'::TEXT,
        COUNT(*)::BIGINT
    FROM public.dim_solicitud_bolsa
    WHERE id_bolsa IS NULL AND activo = TRUE;

    -- Verificar solicitudes sin asegurado
    RETURN QUERY
    SELECT
        'WARNING'::VARCHAR,
        'Solicitudes sin documento de asegurado'::TEXT,
        COUNT(*)::BIGINT
    FROM public.dim_solicitud_bolsa
    WHERE doc_paciente IS NULL AND activo = TRUE;

    -- Verificar solicitudes con asegurado que no existe
    RETURN QUERY
    SELECT
        'ERROR'::VARCHAR,
        'Solicitudes con asegurado inexistente'::TEXT,
        COUNT(*)::BIGINT
    FROM public.dim_solicitud_bolsa sb
    LEFT JOIN public.asegurados a ON sb.doc_paciente = a.doc_paciente
    WHERE sb.activo = TRUE
    AND sb.doc_paciente IS NOT NULL
    AND a.doc_paciente IS NULL;

END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- PASO 7: DATOS DE VALIDACIÓN Y TESTING
-- ============================================================================

-- Mostrar estado actual de relaciones
-- Ejecutar:
-- SELECT * FROM verify_bolsa_relaciones();
-- SELECT * FROM vw_solicitud_bolsa_detalle LIMIT 10;

-- ============================================================================
-- NOTAS DE MIGRACIÓN
-- ============================================================================
--
-- 1. Ahora dim_bolsa tiene relación directa con dim_tipos_bolsas
-- 2. dim_solicitud_bolsa tiene relación con:
--    - dim_bolsa (id_bolsa) - qué bolsa específica
--    - asegurados (doc_paciente) - qué paciente asegurado
--    - dim_bolsa -> dim_tipos_bolsas - qué tipo de bolsa es
-- 3. Vista vw_solicitud_bolsa_detalle muestra toda la información integrada
-- 4. Trigger sync_asegurado_datos sincroniza teléfono/email desde tabla asegurados
-- 5. Función verify_bolsa_relaciones valida integridad referencial
-- 6. Ejecutar: SELECT * FROM verify_bolsa_relaciones(); para validar
--
-- ============================================================================
