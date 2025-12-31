-- ========================================================================
-- Script: 011_crear_tabla_active_sessions.sql
-- Descripción: Crear tabla para tracking de sesiones activas
-- Fecha: 2025-12-29
-- Autor: Ing. Styp Canto Rondón
-- ========================================================================

-- Crear tabla de sesiones activas
CREATE TABLE IF NOT EXISTS active_sessions (
    id              BIGSERIAL PRIMARY KEY,
    session_id      VARCHAR(255) UNIQUE NOT NULL,
    user_id         BIGINT NOT NULL,
    username        VARCHAR(100) NOT NULL,
    ip_address      VARCHAR(50),
    user_agent      TEXT,
    login_time      TIMESTAMP(6) NOT NULL DEFAULT NOW(),
    last_activity   TIMESTAMP(6) NOT NULL DEFAULT NOW(),
    logout_time     TIMESTAMP(6),
    is_active       BOOLEAN DEFAULT TRUE,

    -- Metadata adicional
    device_type     VARCHAR(50),  -- 'DESKTOP', 'MOBILE', 'TABLET'
    browser         VARCHAR(50),  -- 'CHROME', 'FIREFOX', etc.
    os              VARCHAR(50),  -- 'WINDOWS', 'LINUX', 'ANDROID', etc.

    -- Relación con usuarios
    CONSTRAINT fk_active_sessions_user
        FOREIGN KEY (user_id) REFERENCES dim_usuarios(id_user)
        ON DELETE CASCADE
);

-- Comentarios en la tabla
COMMENT ON TABLE active_sessions IS 'Registro de sesiones activas del sistema para auditoría y detección de anomalías';
COMMENT ON COLUMN active_sessions.session_id IS 'ID único de la sesión (UUID generado por el backend)';
COMMENT ON COLUMN active_sessions.user_id IS 'ID del usuario en dim_usuarios';
COMMENT ON COLUMN active_sessions.username IS 'Username del usuario (para queries rápidas)';
COMMENT ON COLUMN active_sessions.ip_address IS 'Dirección IP desde donde se conectó';
COMMENT ON COLUMN active_sessions.user_agent IS 'User-Agent del navegador/dispositivo';
COMMENT ON COLUMN active_sessions.login_time IS 'Timestamp de inicio de sesión';
COMMENT ON COLUMN active_sessions.last_activity IS 'Timestamp de última actividad (se actualiza periódicamente)';
COMMENT ON COLUMN active_sessions.logout_time IS 'Timestamp de cierre de sesión (NULL si aún activa)';
COMMENT ON COLUMN active_sessions.is_active IS 'Indica si la sesión está activa (TRUE) o cerrada (FALSE)';
COMMENT ON COLUMN active_sessions.device_type IS 'Tipo de dispositivo: DESKTOP, MOBILE, TABLET';
COMMENT ON COLUMN active_sessions.browser IS 'Navegador: CHROME, FIREFOX, SAFARI, EDGE, etc.';
COMMENT ON COLUMN active_sessions.os IS 'Sistema operativo: WINDOWS, LINUX, MACOS, ANDROID, IOS, etc.';

-- Índices para optimizar consultas
CREATE INDEX idx_active_sessions_username
    ON active_sessions(username);

CREATE INDEX idx_active_sessions_user_id
    ON active_sessions(user_id);

CREATE INDEX idx_active_sessions_active
    ON active_sessions(is_active)
    WHERE is_active = TRUE;

CREATE INDEX idx_active_sessions_login_time
    ON active_sessions(login_time DESC);

CREATE INDEX idx_active_sessions_last_activity
    ON active_sessions(last_activity DESC);

CREATE INDEX idx_active_sessions_session_id
    ON active_sessions(session_id);

-- Índice compuesto para detectar sesiones concurrentes
CREATE INDEX idx_active_sessions_user_active
    ON active_sessions(username, is_active)
    WHERE is_active = TRUE;

-- Índice para cleanup de sesiones inactivas
CREATE INDEX idx_active_sessions_inactive_cleanup
    ON active_sessions(last_activity)
    WHERE is_active = TRUE;

-- Vista para sesiones activas actuales
CREATE OR REPLACE VIEW vw_sesiones_activas AS
SELECT
    s.id,
    s.session_id,
    s.username,
    u.name_user,
    COALESCE(
        CONCAT(p.nom_pers, ' ', p.ape_pater_pers, ' ', p.ape_mater_pers),
        CONCAT(pe.nom_ext, ' ', pe.ape_pater_ext, ' ', pe.ape_mater_ext)
    ) as nombre_completo,
    STRING_AGG(DISTINCT r.desc_rol, ', ') as roles,
    s.ip_address,
    s.device_type,
    s.browser,
    s.os,
    s.login_time,
    s.last_activity,
    EXTRACT(EPOCH FROM (NOW() - s.last_activity))/60 as minutos_inactividad,
    EXTRACT(EPOCH FROM (NOW() - s.login_time))/60 as duracion_sesion_minutos,
    CASE
        WHEN EXTRACT(EPOCH FROM (NOW() - s.last_activity)) > 1800 THEN 'INACTIVA'
        WHEN EXTRACT(EPOCH FROM (NOW() - s.last_activity)) > 600 THEN 'ADVERTENCIA'
        ELSE 'ACTIVA'
    END as estado_sesion
FROM active_sessions s
    LEFT JOIN dim_usuarios u ON s.user_id = u.id_user
    LEFT JOIN rel_user_roles ur ON ur.id_user = u.id_user
    LEFT JOIN dim_roles r ON r.id_rol = ur.id_rol
    LEFT JOIN dim_personal_cnt p ON p.id_usuario = u.id_user
    LEFT JOIN dim_personal_externo pe ON pe.id_user = u.id_user
WHERE s.is_active = TRUE
GROUP BY
    s.id, s.session_id, s.username, u.name_user,
    p.nom_pers, p.ape_pater_pers, p.ape_mater_pers,
    pe.nom_ext, pe.ape_pater_ext, pe.ape_mater_ext,
    s.ip_address, s.device_type, s.browser, s.os,
    s.login_time, s.last_activity
ORDER BY s.last_activity DESC;

-- Vista para detectar sesiones concurrentes
CREATE OR REPLACE VIEW vw_sesiones_concurrentes AS
SELECT
    username,
    nombre_completo,
    COUNT(*) as sesiones_activas,
    STRING_AGG(DISTINCT ip_address, ', ') as ips,
    STRING_AGG(DISTINCT device_type, ', ') as dispositivos,
    MIN(login_time) as primera_sesion,
    MAX(login_time) as ultima_sesion
FROM vw_sesiones_activas
GROUP BY username, nombre_completo
HAVING COUNT(*) > 1
ORDER BY sesiones_activas DESC;

-- Función para obtener estadísticas de sesiones
CREATE OR REPLACE FUNCTION get_session_statistics()
RETURNS TABLE(
    total_sesiones_activas BIGINT,
    usuarios_conectados BIGINT,
    sesiones_concurrentes BIGINT,
    promedio_duracion_minutos NUMERIC,
    sesiones_inactivas BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*)::BIGINT as total_sesiones_activas,
        COUNT(DISTINCT username)::BIGINT as usuarios_conectados,
        (SELECT COUNT(*) FROM vw_sesiones_concurrentes)::BIGINT as sesiones_concurrentes,
        ROUND(AVG(EXTRACT(EPOCH FROM (NOW() - login_time))/60), 2) as promedio_duracion_minutos,
        COUNT(*) FILTER (WHERE last_activity < NOW() - INTERVAL '30 minutes')::BIGINT as sesiones_inactivas
    FROM active_sessions
    WHERE is_active = TRUE;
END;
$$ LANGUAGE plpgsql;

-- Verificar creación exitosa
SELECT
    'Tabla active_sessions creada correctamente' as mensaje,
    COUNT(*) as sesiones_actuales
FROM active_sessions;

-- Mostrar estadísticas iniciales
SELECT * FROM get_session_statistics();
