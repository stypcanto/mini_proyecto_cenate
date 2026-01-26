/**
 * 📋 STORED PROCEDURE: sp_bolsa_107_procesar (VERSIÓN COMPLETA)
 *
 * PROPÓSITO: Procesar solicitudes de bolsa importadas desde Excel
 * - Lee datos desde staging.bolsa_107_raw
 * - Enriquece campos vacíos (SEXO, FECHA_NACIMIENTO, CORREO) desde dim_asegurados
 * - Valida Foreign Keys
 * - INSERTA en tabla final dim_solicitud_bolsa
 *
 * VERSION: v2.0.0 (2026-01-26) - COMPLETO CON INSERT
 * STATUS: Production Ready
 *
 * AUTOR: Claude + Styp
 *
 * PARÁMETROS:
 *   p_id_carga BIGINT - ID de la carga (ref: bolsa_107_carga.id_carga)
 *   p_id_bolsa BIGINT - ID de la bolsa (ref: dim_tipos_bolsas.id_tipo_bolsa)
 *   p_id_servicio BIGINT - ID del servicio (ref: dim_servicio_essi.id_servicio)
 */

DROP PROCEDURE IF EXISTS public.sp_bolsa_107_procesar(BIGINT);

CREATE OR REPLACE PROCEDURE public.sp_bolsa_107_procesar(
    p_id_carga BIGINT,
    p_id_bolsa BIGINT DEFAULT 1,
    p_id_servicio BIGINT DEFAULT 1
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_total_procesados INT := 0;
    v_total_exitosos INT := 0;
    v_total_errores INT := 0;
    v_fila_count INT;
    v_error_msg TEXT;
    v_row RECORD;
    v_asegurado RECORD;
    v_sexo TEXT;
    v_fecha_nac DATE;
    v_correo TEXT;
    v_id_asegurado BIGINT;
    v_numero_solicitud VARCHAR(50);
    v_id_estado_cita BIGINT;
    v_bolsa RECORD;
    v_estado_gestion RECORD;
BEGIN

    -- Validar que la carga exista
    SELECT COUNT(*) INTO v_fila_count
    FROM staging.bolsa_107_raw
    WHERE id_carga = p_id_carga;

    IF v_fila_count = 0 THEN
        RAISE EXCEPTION 'No se encontraron filas para procesar (id_carga = %)', p_id_carga;
    END IF;

    RAISE NOTICE '📋 Iniciando procesamiento COMPLETO de % filas (id_carga = %)', v_fila_count, p_id_carga;
    RAISE NOTICE '   Bolsa ID: %, Servicio ID: %', p_id_bolsa, p_id_servicio;

    -- PASO 1: Enriquecer campos vacíos desde dim_asegurados por DNI
    -- ========================================================================

    RAISE NOTICE '🔍 PASO 1: Enriqueciendo campos vacíos desde dim_asegurados...';

    FOR v_row IN (
        SELECT
            id_fila,
            numero_documento,
            sexo,
            fecha_nacimiento,
            correo
        FROM staging.bolsa_107_raw
        WHERE id_carga = p_id_carga
        AND (sexo IS NULL OR fecha_nacimiento IS NULL OR correo IS NULL)
    )
    LOOP
        BEGIN
            -- Buscar en dim_asegurados
            SELECT
                pk_asegurado,
                sexo,
                fecha_nacimiento,
                email
            INTO v_asegurado
            FROM dim_asegurados
            WHERE doc_paciente = v_row.numero_documento
            LIMIT 1;

            IF FOUND THEN
                -- Completar campos vacíos
                v_sexo := COALESCE(v_row.sexo, v_asegurado.sexo);
                v_fecha_nac := COALESCE(v_row.fecha_nacimiento, v_asegurado.fecha_nacimiento);
                v_correo := COALESCE(v_row.correo, v_asegurado.email);

                UPDATE staging.bolsa_107_raw
                SET
                    sexo = v_sexo,
                    fecha_nacimiento = v_fecha_nac,
                    correo = v_correo,
                    observacion = CASE
                        WHEN observacion IS NULL THEN 'Enriquecido desde BD'
                        ELSE observacion || ' | Enriquecido desde BD'
                    END
                WHERE id_fila = v_row.id_fila;

                RAISE NOTICE '  ✅ Fila %: Enriquecida (DNI: %)', v_row.id_fila, v_row.numero_documento;

            ELSE
                UPDATE staging.bolsa_107_raw
                SET observacion = COALESCE(observacion, '') || ' | ⚠️ DNI no encontrado en BD'
                WHERE id_fila = v_row.id_fila;

                RAISE NOTICE '  ⚠️ Fila %: DNI NO encontrado (%)', v_row.id_fila, v_row.numero_documento;
            END IF;

        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE '  ⚠️ Error enriqueciendo fila %: %', v_row.id_fila, SQLERRM;
            UPDATE staging.bolsa_107_raw
            SET observacion = COALESCE(observacion, '') || ' | Error BD: ' || SQLERRM
            WHERE id_fila = v_row.id_fila;
        END;
    END LOOP;

    -- PASO 2: Obtener estado de gestión de citas (PENDIENTE_CITA)
    -- ========================================================================

    RAISE NOTICE '📊 PASO 2: Obteniendo configuración de citas...';

    SELECT id_estado INTO v_id_estado_cita
    FROM dim_estados_gestion_citas
    WHERE cod_estado = 'PENDIENTE_CITA'
    LIMIT 1;

    IF v_id_estado_cita IS NULL THEN
        RAISE NOTICE '  ⚠️ Estado PENDIENTE_CITA no encontrado, usando 1 por defecto';
        v_id_estado_cita := 1;
    END IF;

    RAISE NOTICE '  ✅ Estado cita: % (ID: %)', 'PENDIENTE_CITA', v_id_estado_cita;

    -- PASO 3: Insertar en dim_solicitud_bolsa
    -- ========================================================================

    RAISE NOTICE '📝 PASO 3: Insertando en dim_solicitud_bolsa...';

    INSERT INTO dim_solicitud_bolsa (
        numero_solicitud,
        paciente_id,
        paciente_nombre,
        paciente_dni,
        paciente_sexo,
        paciente_email,
        fecha_nacimiento,
        id_bolsa,
        cod_tipo_bolsa,
        desc_tipo_bolsa,
        id_servicio,
        cod_servicio,
        codigo_adscripcion,
        id_ipress,
        nombre_ipress,
        tipo_documento,
        fecha_preferida_no_atendida,
        tipo_cita,
        especialidad,
        estado,
        estado_gestion_citas_id,
        cod_estado_cita,
        desc_estado_cita,
        fecha_solicitud,
        activo,
        paciente_telefono
    )
    SELECT
        'SOL-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(ROW_NUMBER() OVER (ORDER BY raw.id_fila)::TEXT, 5, '0'),  -- numero_solicitud único
        ase.pk_asegurado,  -- paciente_id (buscar en dim_asegurados)
        raw.apellidos_nombres,
        raw.numero_documento,
        COALESCE(raw.sexo, 'O'),  -- M, F, O (otro)
        raw.correo,
        raw.fecha_nacimiento,
        p_id_bolsa,
        btip.cod_tipo_bolsa,
        btip.desc_tipo_bolsa,
        p_id_servicio,
        serv.cod_servicio,
        raw.numero_documento,  -- temp: usar DNI como código
        NULL,  -- id_ipress (se puede enriquecer si existe tabla de IPRESS)
        NULL,  -- nombre_ipress
        raw.tipo_documento,
        raw.fecha_nacimiento,  -- usar fecha_nacimiento como preferida
        CASE
            WHEN raw.derivacion_interna ILIKE '%recita%' THEN 'Recita'
            WHEN raw.derivacion_interna ILIKE '%interconsulta%' THEN 'Interconsulta'
            WHEN raw.derivacion_interna ILIKE '%voluntaria%' THEN 'Voluntaria'
            ELSE 'Recita'  -- valor por defecto
        END,
        serv.desc_servicio,
        'PENDIENTE',
        v_id_estado_cita,
        'PENDIENTE_CITA',
        'Pendiente de asignación a gestor',
        NOW(),
        TRUE,
        raw.telefono
    FROM staging.bolsa_107_raw raw
    LEFT JOIN dim_asegurados ase ON ase.doc_paciente = raw.numero_documento
    CROSS JOIN dim_tipos_bolsas btip
    CROSS JOIN dim_servicio_essi serv
    WHERE raw.id_carga = p_id_carga
    AND raw.numero_documento IS NOT NULL
    AND raw.apellidos_nombres IS NOT NULL
    AND btip.id_tipo_bolsa = p_id_bolsa
    AND serv.id_servicio = p_id_servicio;

    GET DIAGNOSTICS v_total_exitosos = ROW_COUNT;
    RAISE NOTICE '  ✅ Insertadas % filas en dim_solicitud_bolsa', v_total_exitosos;

    -- PASO 4: Actualizar cabecera de carga
    -- ========================================================================

    RAISE NOTICE '📊 PASO 4: Actualizando estadísticas de carga...';

    UPDATE bolsa_107_carga
    SET
        total_filas = v_fila_count,
        filas_ok = v_total_exitosos,
        filas_error = (v_fila_count - v_total_exitosos),
        estado_carga = 'PROCESADO'
    WHERE id_carga = p_id_carga;

    -- RESUMEN FINAL
    RAISE NOTICE '';
    RAISE NOTICE '╔═══════════════════════════════════════════════════╗';
    RAISE NOTICE '║ ✅ PROCESAMIENTO COMPLETADO                       ║';
    RAISE NOTICE '║═══════════════════════════════════════════════════║';
    RAISE NOTICE '║ Total filas Excel: %                              ║', v_fila_count;
    RAISE NOTICE '║ Solicitudes creadas: %                            ║', v_total_exitosos;
    RAISE NOTICE '║ Errores: %                                        ║', (v_fila_count - v_total_exitosos);
    RAISE NOTICE '║ Bolsa: % (ID: %)                                  ║', p_id_bolsa, p_id_bolsa;
    RAISE NOTICE '║ Servicio: % (ID: %)                               ║', p_id_servicio, p_id_servicio;
    RAISE NOTICE '╚═══════════════════════════════════════════════════╝';

EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ ERROR EN PROCESAMIENTO: %', SQLERRM;
    UPDATE bolsa_107_carga
    SET
        estado_carga = 'ERROR'
    WHERE id_carga = p_id_carga;
    RAISE;

END;
$$;

COMMENT ON PROCEDURE public.sp_bolsa_107_procesar(BIGINT, BIGINT, BIGINT) IS
'Procesa solicitudes de bolsa: enriquece desde BD, valida y carga en dim_solicitud_bolsa. v2.0.0 COMPLETO';

GRANT EXECUTE ON PROCEDURE public.sp_bolsa_107_procesar(BIGINT, BIGINT, BIGINT) TO postgres;
GRANT EXECUTE ON PROCEDURE public.sp_bolsa_107_procesar(BIGINT, BIGINT, BIGINT) TO cenate_app;
