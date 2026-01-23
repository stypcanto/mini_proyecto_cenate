-- ============================================================================
-- 📋 Migración: Mejora Estructura dim_bolsa - Relaciones Correctas (FIXED)
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
-- PostgreSQL no soporta "IF NOT EXISTS" en constraints, así que lo hacemos de otra forma
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_name = 'dim_bolsa' AND constraint_name = 'fk_bolsa_tipo_bolsa'
    ) THEN
        ALTER TABLE public.dim_bolsa
        ADD CONSTRAINT fk_bolsa_tipo_bolsa
        FOREIGN KEY (id_tipo_bolsa)
        REFERENCES public.dim_tipos_bolsas(id_tipo_bolsa)
        ON DELETE RESTRICT
        ON UPDATE CASCADE;
    END IF;
END $$;

-- Crear índice para mejorar búsquedas
CREATE INDEX IF NOT EXISTS idx_bolsa_tipo_bolsa
ON public.dim_bolsa(id_tipo_bolsa);

-- ============================================================================
-- PASO 2: AGREGAR RELACIÓN ENTRE dim_solicitud_bolsa Y asegurados
-- ============================================================================

-- Agregar constraint de foreign key hacia asegurados usando doc_paciente
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_name = 'dim_solicitud_bolsa' AND constraint_name = 'fk_solicitud_bolsa_asegurado_doc'
    ) THEN
        ALTER TABLE public.dim_solicitud_bolsa
        ADD CONSTRAINT fk_solicitud_bolsa_asegurado_doc
        FOREIGN KEY (doc_paciente)
        REFERENCES public.asegurados(doc_paciente)
        ON DELETE RESTRICT
        ON UPDATE CASCADE;
    END IF;
END $$;

-- El índice ya existe de migraciones anteriores, pero lo aseguramos
CREATE INDEX IF NOT EXISTS idx_solicitud_bolsa_doc_paciente
ON public.dim_solicitud_bolsa(doc_paciente);

-- ============================================================================
-- PASO 3: CREAR VISTA MATERIALIZADA PARA INTEGRACIÓN TOTAL
-- ============================================================================

DROP VIEW IF EXISTS vw_solicitud_bolsa_detalle CASCADE;

CREATE VIEW public.vw_solicitud_bolsa_detalle AS
SELECT
    sb.id_solicitud,
    sb.numero_solicitud,
    sb.id_bolsa,
    db.nombre_bolsa,
    db.id_tipo_bolsa,
    dtb.cod_tipo_bolsa,
    dtb.desc_tipo_bolsa,
    sb.doc_paciente,
    COALESCE(a.paciente, sb.paciente_nombre) AS paciente_nombre,
    COALESCE(a.tel_celular, sb.paciente_dni) AS tel_celular,
    COALESCE(a.correo_electronico, '') AS correo_electronico,
    sb.paciente_dni,
    sb.especialidad,
    sb.estado,
    sb.solicitante_id,
    sb.solicitante_nombre,
    sb.responsable_aprobacion_id,
    sb.responsable_aprobacion_nombre,
    sb.fecha_solicitud,
    sb.fecha_aprobacion,
    sb.fecha_actualizacion,
    sb.razon_rechazo,
    sb.notas_aprobacion,
    sb.activo
FROM public.dim_solicitud_bolsa sb
LEFT JOIN public.dim_bolsa db ON sb.id_bolsa = db.id_bolsa
LEFT JOIN public.dim_tipos_bolsas dtb ON db.id_tipo_bolsa = dtb.id_tipo_bolsa
LEFT JOIN public.asegurados a ON sb.doc_paciente = a.doc_paciente
WHERE sb.activo = TRUE;

GRANT SELECT ON public.vw_solicitud_bolsa_detalle TO PUBLIC;

-- ============================================================================
-- PASO 4: CREAR FUNCIÓN PARA VERIFICAR INTEGRIDAD DE RELACIONES
-- ============================================================================

DROP FUNCTION IF EXISTS public.verify_bolsa_relaciones();

CREATE FUNCTION public.verify_bolsa_relaciones()
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

    -- Verificar solicitudes sin documento de asegurado
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

GRANT EXECUTE ON FUNCTION public.verify_bolsa_relaciones() TO PUBLIC;

-- ============================================================================
-- PASO 5: FUNCIÓN HELPER PARA OBTENER O CREAR BOLSA CON TIPO
-- ============================================================================

DROP FUNCTION IF EXISTS public.get_or_create_bolsa(p_nombre VARCHAR, p_id_tipo_bolsa BIGINT);

CREATE FUNCTION public.get_or_create_bolsa(
    p_nombre VARCHAR,
    p_id_tipo_bolsa BIGINT
)
RETURNS BIGINT AS $$
DECLARE
    v_id_bolsa BIGINT;
BEGIN
    -- Intentar obtener bolsa existente
    SELECT id_bolsa INTO v_id_bolsa
    FROM public.dim_bolsa
    WHERE nombre_bolsa = p_nombre
    AND id_tipo_bolsa = p_id_tipo_bolsa
    AND activo = TRUE
    LIMIT 1;

    -- Si no existe, crearla
    IF v_id_bolsa IS NULL THEN
        INSERT INTO public.dim_bolsa (
            nombre_bolsa,
            id_tipo_bolsa,
            estado,
            activo,
            total_pacientes,
            pacientes_asignados
        ) VALUES (
            p_nombre,
            p_id_tipo_bolsa,
            'ACTIVA',
            TRUE,
            0,
            0
        )
        RETURNING id_bolsa INTO v_id_bolsa;
    END IF;

    RETURN v_id_bolsa;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION public.get_or_create_bolsa(VARCHAR, BIGINT) TO PUBLIC;

-- ============================================================================
-- VALIDACIÓN Y TESTING
-- ============================================================================

-- Para validar integridad, ejecutar:
-- SELECT * FROM verify_bolsa_relaciones();

-- Para ver solicitudes con todos los detalles:
-- SELECT * FROM vw_solicitud_bolsa_detalle LIMIT 10;

-- Para crear/obtener bolsa:
-- SELECT get_or_create_bolsa('BOLSA AREQUIPA DIC25', 4);

-- ============================================================================
-- NOTAS DE MIGRACIÓN
-- ============================================================================
--
-- 1. ✅ dim_bolsa ahora tiene relación directa con dim_tipos_bolsas
-- 2. ✅ dim_solicitud_bolsa tiene relación con asegurados via doc_paciente
-- 3. ✅ Vista vw_solicitud_bolsa_detalle integra toda la información
-- 4. ✅ Función verify_bolsa_relaciones() valida integridad referencial
-- 5. ✅ Función get_or_create_bolsa() crea bolsas con tipo automáticamente
-- 6. ✅ Triggers existentes mantienen sincronización de datos
--
-- FLUJO DE IMPORTACIÓN CORRECTO AHORA:
-- 1. Usuario selecciona tipo de bolsa (id_tipo_bolsa = 4 para BOLSAS_EXPLOTADATOS)
-- 2. Sistema llama: SELECT get_or_create_bolsa('BOLSA DE LA RED AREQUIPA DIC25', 4);
-- 3. Se obtiene/crea bolsa con id_bolsa = X
-- 4. Para cada fila Excel: INSERT INTO dim_solicitud_bolsa (id_bolsa=X, doc_paciente=DNI, ...)
-- 5. Automáticamente se sincroniza con tabla asegurados
--
-- ============================================================================
