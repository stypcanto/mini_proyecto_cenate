-- ========================================================================
-- Script: 010_agregar_emojis_mbac_auditoria.sql
-- Descripción: Actualizar vista de auditoría con emojis para acciones MBAC
-- Fecha: 2025-12-29
-- Autor: Ing. Styp Canto Rondón
-- ========================================================================

-- Recrear la vista con los nuevos emojis para acciones MBAC
CREATE OR REPLACE VIEW vw_auditoria_modular_detallada AS
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
        -- Acciones genéricas de base de datos
        WHEN a.action = 'INSERT' THEN '🟢 Creación de registro'
        WHEN a.action = 'UPDATE' THEN '🟡 Modificación de registro'
        WHEN a.action = 'DELETE' THEN '🔴 Eliminación de registro'

        -- Autenticación
        WHEN a.action = 'LOGIN' THEN '🔑 Inicio de sesión'
        WHEN a.action = 'LOGIN_FAILED' THEN '🚫 Intento de acceso fallido'
        WHEN a.action = 'LOGOUT' THEN '🔓 Cierre de sesión'
        WHEN a.action = 'PASSWORD_CHANGE' THEN '🔐 Cambio de contraseña'
        WHEN a.action = 'PASSWORD_RESET' THEN '🔄 Recuperación de contraseña'

        -- Gestión de usuarios
        WHEN a.action = 'CREATE_USER' THEN '👤 Creación de usuario'
        WHEN a.action = 'UPDATE_USER' THEN '✏️ Actualización de usuario'
        WHEN a.action = 'DELETE_USER' THEN '🗑️ Eliminación de usuario'
        WHEN a.action = 'ACTIVATE_USER' THEN '✅ Activación de usuario'
        WHEN a.action = 'DEACTIVATE_USER' THEN '⛔ Desactivación de usuario'
        WHEN a.action = 'UNLOCK_USER' THEN '🔓 Desbloqueo de usuario'

        -- 🆕 Gestión de roles y permisos (MBAC)
        WHEN a.action = 'ASSIGN_ROLE' THEN '🔑 Asignación de rol'
        WHEN a.action = 'REMOVE_ROLE' THEN '🔓 Remoción de rol'
        WHEN a.action = 'CREATE_ROLE' THEN '➕ Creación de rol'
        WHEN a.action = 'UPDATE_ROLE' THEN '✏️ Modificación de rol'
        WHEN a.action = 'DELETE_ROLE' THEN '➖ Eliminación de rol'
        WHEN a.action = 'GRANT_PERMISSION' THEN '✅ Permiso otorgado'
        WHEN a.action = 'REVOKE_PERMISSION' THEN '❌ Permiso revocado'
        WHEN a.action = 'UPDATE_PERMISSION' THEN '🔄 Modificación de permiso'

        -- Solicitudes de registro
        WHEN a.action = 'APPROVE_REQUEST' THEN '✔️ Aprobación de solicitud'
        WHEN a.action = 'REJECT_REQUEST' THEN '❌ Rechazo de solicitud'
        WHEN a.action = 'DELETE_PENDING_USER' THEN '🗑️ Eliminación de solicitud pendiente'
        WHEN a.action = 'CLEANUP_ORPHAN_DATA' THEN '🧹 Limpieza de datos huérfanos'

        -- Disponibilidad médica
        WHEN a.action = 'CREATE_DISPONIBILIDAD' THEN '📅 Creación de disponibilidad'
        WHEN a.action = 'UPDATE_DISPONIBILIDAD' THEN '✏️ Actualización de disponibilidad'
        WHEN a.action = 'SUBMIT_DISPONIBILIDAD' THEN '📤 Envío de disponibilidad'
        WHEN a.action = 'DELETE_DISPONIBILIDAD' THEN '🗑️ Eliminación de disponibilidad'
        WHEN a.action = 'REVIEW_DISPONIBILIDAD' THEN '👁️ Revisión de disponibilidad'
        WHEN a.action = 'ADJUST_DISPONIBILIDAD' THEN '⚙️ Ajuste de turno'

        -- 🆕 Acceso a datos sensibles
        WHEN a.action = 'VIEW_PATIENT_DETAILS' THEN '👁️ Visualización de datos de paciente'
        WHEN a.action = 'VIEW_CLINICAL_HISTORY' THEN '📋 Visualización de historia clínica'
        WHEN a.action = 'EXPORT_PATIENT_DATA' THEN '📤 Exportación de datos de paciente'
        WHEN a.action = 'SEARCH_PATIENTS' THEN '🔍 Búsqueda de pacientes'

        -- 🆕 Reportes y exportaciones
        WHEN a.action = 'EXPORT_CSV' THEN '📊 Exportación CSV'
        WHEN a.action = 'EXPORT_PDF' THEN '📄 Exportación PDF'
        WHEN a.action = 'EXPORT_EXCEL' THEN '📑 Exportación Excel'
        WHEN a.action = 'VIEW_REPORT' THEN '📈 Visualización de reporte'

        -- 🆕 Seguridad y sesiones
        WHEN a.action = 'SESSION_TIMEOUT' THEN '⏱️ Sesión cerrada por inactividad'
        WHEN a.action = 'CONCURRENT_SESSION_DETECTED' THEN '⚠️ Sesión concurrente detectada'
        WHEN a.action = 'SECURITY_ALERT_CREATED' THEN '🚨 Alerta de seguridad creada'

        -- Default
        ELSE '⚪ Otro evento'
    END as tipo_evento
FROM audit_logs a
    -- Join por nombre de usuario (para registros de aplicación)
    LEFT JOIN dim_usuarios u ON a.usuario = u.name_user
    LEFT JOIN rel_user_roles ur ON ur.id_user = u.id_user
    LEFT JOIN dim_roles r ON r.id_rol = ur.id_rol
    LEFT JOIN dim_personal_cnt p ON p.id_usuario = u.id_user
    LEFT JOIN dim_personal_externo pe ON pe.id_user = u.id_user
GROUP BY
    a.id, a.fecha_hora, u.id_user, u.name_user,
    p.num_doc_pers, pe.num_doc_ext,
    p.nom_pers, p.ape_pater_pers, p.ape_mater_pers,
    pe.nom_ext, pe.ape_pater_ext, pe.ape_mater_ext,
    p.email_corp_pers, pe.email_corp_ext,
    p.email_pers, pe.email_pers_ext,
    a.modulo, a.action, a.estado, a.detalle,
    a.ip_address, a.user_agent, a.id_afectado, a.nivel
ORDER BY a.fecha_hora DESC;

-- Verificar que la vista se creó correctamente
SELECT
    'Vista actualizada correctamente' as mensaje,
    COUNT(*) as total_registros
FROM vw_auditoria_modular_detallada;

-- Mostrar ejemplo de nuevas acciones MBAC (si existen)
SELECT
    tipo_evento,
    COUNT(*) as cantidad
FROM vw_auditoria_modular_detallada
WHERE accion IN ('ASSIGN_ROLE', 'REMOVE_ROLE', 'GRANT_PERMISSION', 'REVOKE_PERMISSION')
GROUP BY tipo_evento;
