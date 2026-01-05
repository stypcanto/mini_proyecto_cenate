-- ============================================================================
-- Script: 016_agregar_username_vw_personal_total.sql
-- Descripción: Actualiza la vista vw_personal_total para incluir el campo username
-- Problema: El frontend busca por username pero la vista NO lo incluía
-- Solución: Agregar JOIN con dim_usuarios y incluir name_user AS username
-- ============================================================================

-- Eliminar la vista existente
DROP VIEW IF EXISTS vw_personal_total CASCADE;

-- Crear la vista con el campo username
CREATE VIEW vw_personal_total AS
SELECT
    p.id_pers AS id_personal,
    p.nom_pers AS nombres,
    p.ape_pater_pers AS apellido_paterno,
    p.ape_mater_pers AS apellido_materno,
    p.num_doc_pers AS numero_documento,
    td.desc_tip_doc AS tipo_documento,
    p.fech_naci_pers AS fecha_nacimiento,
    EXTRACT(year FROM age(CURRENT_DATE, p.fech_naci_pers))::integer AS edad,
    to_char(p.fech_naci_pers, 'TMMonth') AS mes_cumpleanos,
    make_date(
        EXTRACT(year FROM CURRENT_DATE)::integer,
        EXTRACT(month FROM p.fech_naci_pers)::integer,
        EXTRACT(day FROM p.fech_naci_pers)::integer
    ) AS cumpleanos_este_anio,
    p.gen_pers AS genero,
    p.email_corp_pers AS correo_institucional,
    p.email_pers AS correo_personal,
    p.movil_pers AS telefono,
    p.direc_pers AS direccion,
    p.foto_pers AS foto_url,
    p.id_dist AS id_distrito,
    dist.desc_dist AS nombre_distrito,
    prov.desc_prov AS nombre_provincia,
    dep.desc_depart AS nombre_departamento,
    p.id_ipress,
    i.desc_ipress AS nombre_ipress,
    p.id_area,
    a.desc_area AS nombre_area,
    p.id_reg_lab AS id_regimen,
    r.desc_reg_lab AS nombre_regimen,
    p.cod_plan_rem AS codigo_planilla,
    CASE p.stat_pers
        WHEN 'A' THEN 'ACTIVO'
        WHEN 'I' THEN 'INACTIVO'
        WHEN 'B' THEN 'BLOQUEADO'
        ELSE p.stat_pers
    END AS estado,
    p.coleg_pers AS colegiatura,
    p.id_usuario,
    u.name_user AS username,  -- ⭐ NUEVO CAMPO AGREGADO
    rol.desc_rol AS rol_usuario,
    tp.desc_tip_pers AS tipo_personal_detalle,
    CASE
        WHEN prof.id_prof = 50 THEN COALESCE(pp.desc_prof_otro, '')
        ELSE COALESCE(prof.desc_prof, '')
    END AS profesion,
    COALESCE(s.desc_servicio, '') AS especialidad,
    pp.rne_prof AS rne_especialidad,
    COALESCE(op.desc_origen, 'INTERNO') AS tipo_personal,
    NULL AS institucion
FROM dim_personal_cnt p
    -- ⭐ JOIN CON dim_usuarios PARA OBTENER USERNAME
    LEFT JOIN dim_usuarios u ON u.id_user = p.id_usuario
    LEFT JOIN dim_tipo_documento td ON td.id_tip_doc = p.id_tip_doc
    LEFT JOIN dim_ipress i ON i.id_ipress = p.id_ipress
    LEFT JOIN dim_distrito dist ON dist.id_dist = p.id_dist
    LEFT JOIN dim_provincia prov ON prov.id_prov = dist.id_prov
    LEFT JOIN dim_departamento dep ON dep.id_depart = prov.id_depart
    LEFT JOIN dim_area a ON a.id_area = p.id_area
    LEFT JOIN dim_regimen_laboral r ON r.id_reg_lab = p.id_reg_lab
    LEFT JOIN dim_personal_tipo pt ON pt.id_pers = p.id_pers
    LEFT JOIN dim_tipo_personal tp ON tp.id_tip_pers = pt.id_tip_pers
    LEFT JOIN dim_personal_prof pp ON pp.id_pers = p.id_pers
    LEFT JOIN dim_profesiones prof ON prof.id_prof = pp.id_prof
    LEFT JOIN rel_user_roles ur ON ur.id_user = p.id_usuario
    LEFT JOIN dim_roles rol ON rol.id_rol = ur.id_rol
    LEFT JOIN dim_origen_personal op ON op.id_origen = p.id_origen
    LEFT JOIN dim_servicio_essi s ON s.id_servicio = p.id_servicio;

-- Otorgar permisos
GRANT SELECT ON vw_personal_total TO postgres;

-- Mensaje de confirmación
SELECT '✅ Vista vw_personal_total actualizada con campo username' AS resultado;
