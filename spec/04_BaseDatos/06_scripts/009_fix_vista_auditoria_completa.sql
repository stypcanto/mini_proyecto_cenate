-- ============================================================
-- Fix Vista de Auditoría - Mostrar TODOS los módulos
-- Fecha: 2025-12-29
-- Problema: La vista filtraba solo 2 módulos específicos
-- Solución: Eliminar filtro WHERE para mostrar todo
-- ============================================================

-- Eliminar la vista anterior
DROP VIEW IF EXISTS vw_auditoria_modular_detallada CASCADE;

-- Recrear la vista SIN el filtro de módulos específicos
CREATE VIEW vw_auditoria_modular_detallada AS
SELECT
    a.id,
    a.fecha_hora,
    TO_CHAR(a.fecha_hora, 'YYYY-MM-DD HH24:MI:SS') as fecha_formateada,
    a.usuario as usuario_sesion,
    u.id_user,
    u.name_user as username,
    COALESCE(p.num_doc_pers, pe.num_doc_ext) as dni,
    COALESCE(
        CONCAT(p.nom_pers, ' ', p.ape_pater_pers, ' ', p.ape_mater_pers),
        CONCAT(pe.nom_ext, ' ', pe.ape_pater_ext, ' ', pe.ape_mater_ext)
    ) as nombre_completo,
    STRING_AGG(DISTINCT r.desc_rol, ', ') as roles,
    COALESCE(p.email_corp_pers, pe.email_corp_ext) as correo_corporativo,
    COALESCE(p.email_pers, pe.email_pers_ext) as correo_personal,
    a.modulo,
    a.action as accion,
    a.estado,
    a.detalle,
    a.ip_address as ip,
    a.user_agent as dispositivo,
    a.id_afectado,
    a.nivel,
    CASE
        WHEN a.action = 'INSERT' THEN '🟢 Creación de registro'
        WHEN a.action = 'UPDATE' THEN '🟡 Modificación de registro'
        WHEN a.action = 'DELETE' THEN '🔴 Eliminación de registro'
        WHEN a.action = 'LOGIN' THEN '🔑 Inicio de sesión'
        WHEN a.action = 'LOGOUT' THEN '🔓 Cierre de sesión'
        WHEN a.action = 'CREATE_USER' THEN '👤 Creación de usuario'
        WHEN a.action = 'DELETE_USER' THEN '🗑️ Eliminación de usuario'
        WHEN a.action = 'ACTIVATE_USER' THEN '✅ Activación de usuario'
        WHEN a.action = 'DEACTIVATE_USER' THEN '⛔ Desactivación de usuario'
        WHEN a.action = 'APPROVE_REQUEST' THEN '✔️ Aprobación de solicitud'
        WHEN a.action = 'REJECT_REQUEST' THEN '❌ Rechazo de solicitud'
        ELSE '⚪ Otro evento'
    END as tipo_evento
FROM audit_logs a
    -- Join por nombre de usuario (para registros de aplicación)
    LEFT JOIN dim_usuarios u ON a.usuario = u.name_user
    LEFT JOIN rel_user_roles ur ON ur.id_user = u.id_user
    LEFT JOIN dim_roles r ON r.id_rol = ur.id_rol
    LEFT JOIN dim_personal_cnt p ON p.id_usuario = u.id_user
    LEFT JOIN dim_personal_externo pe ON pe.id_user = u.id_user
-- ⚠️ SIN FILTRO WHERE - Mostrar TODOS los módulos
GROUP BY
    a.id,
    a.fecha_hora,
    u.id_user,
    u.name_user,
    p.num_doc_pers,
    pe.num_doc_ext,
    p.nom_pers,
    p.ape_pater_pers,
    p.ape_mater_pers,
    pe.nom_ext,
    pe.ape_pater_ext,
    pe.ape_mater_ext,
    p.email_corp_pers,
    pe.email_corp_ext,
    p.email_pers,
    pe.email_pers_ext,
    a.modulo,
    a.action,
    a.estado,
    a.detalle,
    a.ip_address,
    a.user_agent,
    a.id_afectado,
    a.nivel
ORDER BY a.fecha_hora DESC;

-- Verificar que la vista ahora muestra todos los registros
SELECT COUNT(*) as total_registros FROM vw_auditoria_modular_detallada;

-- Verificar que se ven los DELETE_USER
SELECT
    id,
    fecha_formateada,
    usuario_sesion,
    username,
    nombre_completo,
    modulo,
    accion,
    detalle
FROM vw_auditoria_modular_detallada
WHERE accion = 'DELETE_USER'
ORDER BY fecha_hora DESC
LIMIT 5;

-- ============================================================
-- FIN DEL SCRIPT
-- ============================================================
