-- ============================================================================
-- SCRIPT: Restaurar datos de personal para usuario sin datos
-- Sistema: CENATE - Centro Nacional de Telemedicina del Perú
-- Propósito: Crear registro mínimo en dim_personal_cnt para usuarios que
--            existen en dim_usuarios pero no tienen datos de personal
-- ============================================================================

-- Usuario: 46205941 (id_user = 58)
-- Este script crea un registro mínimo en dim_personal_cnt para que el usuario
-- aparezca en la lista de gestión de usuarios

-- Verificar si el usuario existe
DO $$
DECLARE
    v_id_user BIGINT;
    v_id_pers BIGINT;
    v_id_tip_doc INTEGER := 1; -- DNI por defecto
    v_id_ipress INTEGER; -- IPRESS de CENATE
    v_id_origen INTEGER; -- Origen de personal (1=INTERNO, 2=EXTERNO)
BEGIN
    -- Obtener el ID del usuario
    SELECT id_user INTO v_id_user
    FROM dim_usuarios
    WHERE name_user = '46205941';
    
    IF v_id_user IS NULL THEN
        RAISE EXCEPTION 'Usuario 46205941 no encontrado en dim_usuarios';
    END IF;
    
    -- Verificar si ya tiene registro de personal
    SELECT id_pers INTO v_id_pers
    FROM dim_personal_cnt
    WHERE id_usuario = v_id_user;
    
    IF v_id_pers IS NOT NULL THEN
        RAISE NOTICE 'El usuario ya tiene un registro de personal con id_pers: %', v_id_pers;
        RETURN;
    END IF;
    
    -- Obtener ID de IPRESS de CENATE (si existe)
    SELECT id_ipress INTO v_id_ipress
    FROM dim_ipress
    WHERE desc_ipress ILIKE '%CENATE%' OR desc_ipress ILIKE '%CENTRO NACIONAL%'
    LIMIT 1;
    
    -- Si no hay IPRESS de CENATE, usar NULL
    IF v_id_ipress IS NULL THEN
        RAISE NOTICE 'No se encontró IPRESS de CENATE, se dejará NULL';
    END IF;
    
    -- Obtener ID de origen INTERNO (1) por defecto
    SELECT id_origen INTO v_id_origen
    FROM dim_origen_personal
    WHERE desc_origen ILIKE '%INTERNO%' OR desc_origen ILIKE '%CENATE%'
    LIMIT 1;
    
    -- Si no se encuentra, usar 1 por defecto (INTERNO)
    IF v_id_origen IS NULL THEN
        v_id_origen := 1;
        RAISE NOTICE 'No se encontró origen INTERNO, usando 1 por defecto';
    END IF;
    
    -- Insertar registro mínimo en dim_personal_cnt
    INSERT INTO dim_personal_cnt (
        id_tip_doc,
        num_doc_pers,
        nom_pers,
        ape_pater_pers,
        ape_mater_pers,
        stat_pers,
        per_pers,
        id_usuario,
        id_ipress,
        id_origen,
        created_at,
        updated_at
    ) VALUES (
        v_id_tip_doc,                    -- Tipo documento: DNI
        '46205941',                      -- Número de documento (usando username)
        'Usuario',                       -- Nombre temporal
        'Sin',                           -- Apellido paterno temporal
        'Datos',                         -- Apellido materno temporal
        'A',                             -- Estado: Activo
        TO_CHAR(CURRENT_DATE, 'YYYYMM'), -- Periodo actual
        v_id_user,                       -- ID del usuario
        v_id_ipress,                     -- IPRESS (puede ser NULL)
        v_id_origen,                     -- Origen: INTERNO (1)
        CURRENT_TIMESTAMP,               -- Fecha de creación
        CURRENT_TIMESTAMP                -- Fecha de actualización
    )
    RETURNING id_pers INTO v_id_pers;
    
    RAISE NOTICE '✅ Registro de personal creado exitosamente para usuario 46205941 (id_user: %, id_pers: %)', v_id_user, v_id_pers;
    RAISE NOTICE '⚠️ IMPORTANTE: Debes actualizar los datos del personal (nombres, apellidos, etc.) desde la interfaz de administración';
    
END $$;

-- Verificar que el registro se creó correctamente
SELECT 
    u.id_user,
    u.name_user as username,
    u.stat_user as estado_usuario,
    pc.id_pers,
    pc.nom_pers || ' ' || pc.ape_pater_pers || ' ' || pc.ape_mater_pers as nombre_completo,
    pc.num_doc_pers as numero_documento,
    pc.stat_pers as estado_personal
FROM dim_usuarios u
LEFT JOIN dim_personal_cnt pc ON u.id_user = pc.id_usuario
WHERE u.name_user = '46205941';

