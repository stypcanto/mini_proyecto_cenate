-- ============================================================
-- 📘 Script: vista_personal_total.sql
-- 📅 Fecha: 2025-10-15
-- 👨‍💻 Autor: Styp Canto Rondon
-- 🏥 Descripción:
--   Consulta unificada del personal CENATE y externo,
--   vinculada con IPRESS, roles y estado de usuario.
--   Útil para paneles administrativos o APIs de control.
-- ============================================================





SELECT
    u.id_user,
    u.name_user AS username,
    u.stat_user AS estado_usuario,
    p.id_pers AS id_personal,
    p.num_doc_pers AS numero_documento,
    p.nom_pers AS nombres,
    p.ape_pater_pers AS apellido_paterno,
    p.ape_mater_pers AS apellido_materno,
    CONCAT(p.nom_pers, ' ', p.ape_pater_pers, ' ', p.ape_mater_pers) AS nombre_completo,
    p.gen_pers AS genero,
    p.email_corp_pers AS correo_corporativo,
    p.email_pers AS correo_personal,
    p.movil_pers AS telefono,
    i.desc_ipress AS ipress_asignada,
    'CENATE' AS tipo_personal,
    STRING_AGG(DISTINCT r.desc_rol, ', ') AS roles,
    u.created_at AS fecha_creacion_usuario,
    u.updated_at AS ultima_actualizacion_usuario
FROM dim_usuarios u
LEFT JOIN dim_personal_cnt p ON p.id_usuario = u.id_user
LEFT JOIN dim_ipress i ON i.id_ipress = p.id_ipress
LEFT JOIN rel_user_roles ur ON ur.id_user = u.id_user
LEFT JOIN dim_roles r ON r.id_rol = ur.id_rol
GROUP BY u.id_user, p.id_pers, i.desc_ipress
UNION ALL
SELECT
    u.id_user,
    u.name_user AS username,
    u.stat_user AS estado_usuario,
    e.id_pers_ext AS id_personal,
    e.num_doc_ext AS numero_documento,
    e.nom_ext AS nombres,
    e.ape_pater_ext AS apellido_paterno,
    e.ape_mater_ext AS apellido_materno,
    CONCAT(e.nom_ext, ' ', e.ape_pater_ext, ' ', e.ape_mater_ext) AS nombre_completo,
    e.gen_ext AS genero,
    e.email_corp_ext AS correo_corporativo,
    e.email_pers_ext AS correo_personal,
    e.movil_ext AS telefono,
    i2.desc_ipress AS ipress_asignada,
    'EXTERNO' AS tipo_personal,
    STRING_AGG(DISTINCT r2.desc_rol, ', ') AS roles,
    u.created_at AS fecha_creacion_usuario,
    u.updated_at AS ultima_actualizacion_usuario
FROM dim_usuarios u
LEFT JOIN dim_personal_externo e ON e.id_user = u.id_user
LEFT JOIN dim_ipress i2 ON i2.id_ipress = e.id_ipress
LEFT JOIN rel_user_roles ur2 ON ur2.id_user = u.id_user
LEFT JOIN dim_roles r2 ON r2.id_rol = ur2.id_rol
GROUP BY u.id_user, e.id_pers_ext, i2.desc_ipress
ORDER BY nombre_completo;