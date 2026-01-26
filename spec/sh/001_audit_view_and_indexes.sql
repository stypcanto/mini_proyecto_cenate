-- ============================================================
-- Script de Auditoria CENATE
-- Fecha: 2025-12-23
-- Descripcion: Crea/actualiza vista de auditoria e indices
-- ============================================================

-- ============================================================
-- 1. VERIFICAR SI EXISTE LA VISTA
-- ============================================================
-- Ejecutar primero para verificar:
-- SELECT * FROM information_schema.views WHERE table_name = 'vw_auditoria_modular_detallada';

-- ============================================================
-- 2. CREAR O ACTUALIZAR VISTA DE AUDITORIA
-- ============================================================
CREATE OR REPLACE VIEW vw_auditoria_modular_detallada AS
SELECT
    al.id,
    al.fecha_hora,
    TO_CHAR(al.fecha_hora, 'DD/MM/YYYY HH24:MI:SS') as fecha_formateada,
    al.usuario as usuario_sesion,
    u.id_user,
    u.name_user as username,
    p.num_doc_pers as dni,
    CONCAT(p.nom_pers, ' ', p.ape_pater_pers, ' ', p.ape_mater_pers) as nombre_completo,
    (
        SELECT STRING_AGG(r.desc_rol, ', ')
        FROM rel_user_roles rur
        JOIN dim_roles r ON rur.id_rol = r.id_rol
        WHERE rur.id_user = u.id_user
    ) as roles,
    p.email_corp_pers as correo_corporativo,
    p.email_pers as correo_personal,
    al.modulo,
    al.action as accion,
    al.estado,
    al.detalle,
    al.ip_address as ip,
    al.user_agent as dispositivo,
    NULL::bigint as id_afectado,
    al.action as tipo_evento,
    al.nivel
FROM audit_logs al
LEFT JOIN dim_usuarios u ON al.usuario = u.name_user
LEFT JOIN dim_personal_cnt p ON p.id_usuario = u.id_user
ORDER BY al.fecha_hora DESC;

-- ============================================================
-- 3. INDICES PARA OPTIMIZAR CONSULTAS
-- ============================================================

-- Indice por fecha (consultas ordenadas por fecha)
CREATE INDEX IF NOT EXISTS idx_audit_logs_fecha
ON audit_logs(fecha_hora DESC);

-- Indice por usuario (busquedas por usuario)
CREATE INDEX IF NOT EXISTS idx_audit_logs_usuario
ON audit_logs(usuario);

-- Indice por modulo (filtrar por modulo)
CREATE INDEX IF NOT EXISTS idx_audit_logs_modulo
ON audit_logs(modulo);

-- Indice por accion (filtrar por tipo de accion)
CREATE INDEX IF NOT EXISTS idx_audit_logs_action
ON audit_logs(action);

-- Indice por nivel (filtrar por nivel: INFO, WARNING, ERROR, CRITICAL)
CREATE INDEX IF NOT EXISTS idx_audit_logs_nivel
ON audit_logs(nivel);

-- Indice por estado (filtrar por SUCCESS, FAILURE)
CREATE INDEX IF NOT EXISTS idx_audit_logs_estado
ON audit_logs(estado);

-- Indice compuesto para consultas comunes (fecha + modulo)
CREATE INDEX IF NOT EXISTS idx_audit_logs_fecha_modulo
ON audit_logs(fecha_hora DESC, modulo);

-- Indice compuesto para consultas de usuario + fecha
CREATE INDEX IF NOT EXISTS idx_audit_logs_usuario_fecha
ON audit_logs(usuario, fecha_hora DESC);

-- ============================================================
-- 4. CONSULTAS UTILES DE DIAGNOSTICO
-- ============================================================

-- Ver logs recientes
-- SELECT * FROM audit_logs ORDER BY fecha_hora DESC LIMIT 20;

-- Contar logs por modulo
-- SELECT modulo, COUNT(*) as total FROM audit_logs GROUP BY modulo ORDER BY total DESC;

-- Contar logs por accion
-- SELECT action, COUNT(*) as total FROM audit_logs GROUP BY action ORDER BY total DESC;

-- Usuarios mas activos (ultima semana)
-- SELECT usuario, COUNT(*) as acciones
-- FROM audit_logs
-- WHERE fecha_hora > NOW() - INTERVAL '7 days'
-- GROUP BY usuario
-- ORDER BY acciones DESC
-- LIMIT 10;

-- Eventos de error recientes
-- SELECT * FROM audit_logs
-- WHERE nivel IN ('ERROR', 'CRITICAL')
-- ORDER BY fecha_hora DESC
-- LIMIT 20;

-- Eventos por dia (ultimos 30 dias)
-- SELECT DATE(fecha_hora) as dia, COUNT(*) as eventos
-- FROM audit_logs
-- WHERE fecha_hora > NOW() - INTERVAL '30 days'
-- GROUP BY dia
-- ORDER BY dia DESC;

-- Ver vista detallada de auditoria
-- SELECT * FROM vw_auditoria_modular_detallada LIMIT 50;

-- ============================================================
-- 5. MANTENIMIENTO - LIMPIEZA DE LOGS ANTIGUOS
-- ============================================================

-- Limpiar logs mayores a 90 dias (ejecutar periodicamente)
-- DELETE FROM audit_logs WHERE fecha_hora < NOW() - INTERVAL '90 days';

-- Contar registros por mes (para planificar limpieza)
-- SELECT
--     TO_CHAR(fecha_hora, 'YYYY-MM') as mes,
--     COUNT(*) as registros
-- FROM audit_logs
-- GROUP BY mes
-- ORDER BY mes DESC;

-- ============================================================
-- FIN DEL SCRIPT
-- ============================================================
