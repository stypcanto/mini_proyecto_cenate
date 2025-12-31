-- ========================================================================
-- Script: 014_crear_tabla_security_alerts.sql
-- Descripción: Tabla de alertas de seguridad automatizadas
-- Fecha: 2025-12-29
-- Autor: Ing. Styp Canto Rondón
-- ========================================================================

-- ============================================================
-- 1️⃣ CREAR TABLA DE ALERTAS DE SEGURIDAD
-- ============================================================
CREATE TABLE IF NOT EXISTS security_alerts (
    id                  BIGSERIAL PRIMARY KEY,
    alert_type          VARCHAR(50) NOT NULL,           -- Tipo de alerta
    severity            VARCHAR(20) NOT NULL,           -- CRITICAL, HIGH, MEDIUM, LOW
    usuario             VARCHAR(100),                   -- Usuario afectado
    ip_address          VARCHAR(50),                    -- IP origen
    descripcion         TEXT NOT NULL,                  -- Descripción de la alerta
    detalles            JSONB,                          -- Detalles adicionales en JSON
    fecha_deteccion     TIMESTAMP(6) NOT NULL DEFAULT NOW(),
    estado              VARCHAR(20) DEFAULT 'NUEVA',    -- NUEVA, EN_REVISION, RESUELTA, FALSO_POSITIVO
    resuelto_por        VARCHAR(100),                   -- Usuario que resolvió
    fecha_resolucion    TIMESTAMP(6),
    notas_resolucion    TEXT,                           -- Notas al resolver
    accion_tomada       TEXT,                           -- Acción correctiva
    CONSTRAINT chk_severity CHECK (severity IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW')),
    CONSTRAINT chk_estado CHECK (estado IN ('NUEVA', 'EN_REVISION', 'RESUELTA', 'FALSO_POSITIVO'))
);

-- Índices para búsquedas eficientes
CREATE INDEX IF NOT EXISTS idx_security_alerts_type ON security_alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_security_alerts_severity ON security_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_security_alerts_usuario ON security_alerts(usuario);
CREATE INDEX IF NOT EXISTS idx_security_alerts_fecha ON security_alerts(fecha_deteccion);
CREATE INDEX IF NOT EXISTS idx_security_alerts_estado ON security_alerts(estado);
CREATE INDEX IF NOT EXISTS idx_security_alerts_detalles ON security_alerts USING GIN(detalles);

-- Índice compuesto para consultas de dashboard
CREATE INDEX IF NOT EXISTS idx_security_alerts_estado_fecha
    ON security_alerts(estado, fecha_deteccion DESC);

COMMENT ON TABLE security_alerts IS 'Registro de alertas de seguridad automatizadas detectadas por el sistema';

-- Comentarios en columnas
COMMENT ON COLUMN security_alerts.alert_type IS 'Tipo: BRUTE_FORCE, CONCURRENT_SESSION, UNUSUAL_LOCATION, OFF_HOURS_ACCESS, MASS_EXPORT, PERMISSION_CHANGE, TAMPERED_LOG, UNUSUAL_ACTIVITY';
COMMENT ON COLUMN security_alerts.severity IS 'Severidad: CRITICAL (requiere acción inmediata), HIGH, MEDIUM, LOW';
COMMENT ON COLUMN security_alerts.detalles IS 'Detalles adicionales en JSON (IPs, intentos, patrones detectados, etc.)';
COMMENT ON COLUMN security_alerts.estado IS 'Estado: NUEVA (sin revisar), EN_REVISION (bajo análisis), RESUELTA (mitigada), FALSO_POSITIVO';

-- ============================================================
-- 2️⃣ VISTAS DE ALERTAS
-- ============================================================

-- Vista de alertas activas (no resueltas)
CREATE OR REPLACE VIEW vw_security_alerts_activas AS
SELECT
    a.id,
    a.alert_type,
    a.severity,
    a.usuario,
    u.name_user AS username,
    COALESCE(
        CONCAT(p.nom_pers, ' ', p.ape_pater_pers, ' ', p.ape_mater_pers),
        CONCAT(pe.nom_ext, ' ', pe.ape_pater_ext, ' ', pe.ape_mater_ext)
    ) AS nombre_completo,
    a.ip_address,
    a.descripcion,
    a.detalles,
    a.fecha_deteccion,
    a.estado,
    EXTRACT(EPOCH FROM (NOW() - a.fecha_deteccion))/60 AS minutos_desde_deteccion
FROM security_alerts a
    LEFT JOIN dim_usuarios u ON a.usuario = u.name_user
    LEFT JOIN dim_personal_cnt p ON p.id_usuario = u.id_user
    LEFT JOIN dim_personal_externo pe ON pe.id_user = u.id_user
WHERE a.estado IN ('NUEVA', 'EN_REVISION')
ORDER BY
    CASE a.severity
        WHEN 'CRITICAL' THEN 1
        WHEN 'HIGH' THEN 2
        WHEN 'MEDIUM' THEN 3
        WHEN 'LOW' THEN 4
    END,
    a.fecha_deteccion DESC;

COMMENT ON VIEW vw_security_alerts_activas IS 'Alertas de seguridad activas (NUEVA o EN_REVISION) ordenadas por severidad';

-- Vista de resumen ejecutivo de alertas
CREATE OR REPLACE VIEW vw_security_alerts_resumen AS
SELECT
    COUNT(*) AS total_alertas,
    COUNT(*) FILTER (WHERE estado = 'NUEVA') AS nuevas,
    COUNT(*) FILTER (WHERE estado = 'EN_REVISION') AS en_revision,
    COUNT(*) FILTER (WHERE estado = 'RESUELTA') AS resueltas,
    COUNT(*) FILTER (WHERE estado = 'FALSO_POSITIVO') AS falsos_positivos,
    COUNT(*) FILTER (WHERE severity = 'CRITICAL') AS criticas,
    COUNT(*) FILTER (WHERE severity = 'HIGH') AS altas,
    COUNT(*) FILTER (WHERE severity = 'MEDIUM') AS medias,
    COUNT(*) FILTER (WHERE severity = 'LOW') AS bajas,
    COUNT(*) FILTER (WHERE fecha_deteccion >= NOW() - INTERVAL '24 hours') AS ultimas_24h,
    COUNT(*) FILTER (WHERE fecha_deteccion >= NOW() - INTERVAL '7 days') AS ultima_semana,
    COUNT(*) FILTER (WHERE fecha_deteccion >= NOW() - INTERVAL '30 days') AS ultimo_mes
FROM security_alerts;

COMMENT ON VIEW vw_security_alerts_resumen IS 'Resumen ejecutivo de alertas de seguridad';

-- Vista de alertas por tipo
CREATE OR REPLACE VIEW vw_security_alerts_por_tipo AS
SELECT
    alert_type,
    COUNT(*) AS total,
    COUNT(*) FILTER (WHERE severity = 'CRITICAL') AS criticas,
    COUNT(*) FILTER (WHERE severity = 'HIGH') AS altas,
    COUNT(*) FILTER (WHERE estado IN ('NUEVA', 'EN_REVISION')) AS activas,
    COUNT(*) FILTER (WHERE estado = 'RESUELTA') AS resueltas,
    MAX(fecha_deteccion) AS ultima_deteccion
FROM security_alerts
GROUP BY alert_type
ORDER BY total DESC;

COMMENT ON VIEW vw_security_alerts_por_tipo IS 'Estadísticas de alertas agrupadas por tipo';

-- ============================================================
-- 3️⃣ FUNCIONES DE UTILIDAD
-- ============================================================

-- Función para crear una alerta de seguridad
CREATE OR REPLACE FUNCTION crear_alerta_seguridad(
    p_alert_type VARCHAR,
    p_severity VARCHAR,
    p_usuario VARCHAR,
    p_ip_address VARCHAR,
    p_descripcion TEXT,
    p_detalles JSONB DEFAULT NULL
) RETURNS BIGINT AS $$
DECLARE
    v_alert_id BIGINT;
BEGIN
    INSERT INTO security_alerts (
        alert_type,
        severity,
        usuario,
        ip_address,
        descripcion,
        detalles,
        estado
    ) VALUES (
        p_alert_type,
        p_severity,
        p_usuario,
        p_ip_address,
        p_descripcion,
        p_detalles,
        'NUEVA'
    ) RETURNING id INTO v_alert_id;

    -- Log en consola del servidor
    RAISE NOTICE '🚨 ALERTA DE SEGURIDAD [%] - % - Usuario: % - IP: %',
        p_severity, p_alert_type, p_usuario, p_ip_address;

    RETURN v_alert_id;
END;
$$ LANGUAGE plpgsql;

-- Función para resolver una alerta
CREATE OR REPLACE FUNCTION resolver_alerta_seguridad(
    p_alert_id BIGINT,
    p_resuelto_por VARCHAR,
    p_estado VARCHAR,
    p_notas TEXT,
    p_accion_tomada TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
BEGIN
    UPDATE security_alerts
    SET
        estado = p_estado,
        resuelto_por = p_resuelto_por,
        fecha_resolucion = NOW(),
        notas_resolucion = p_notas,
        accion_tomada = p_accion_tomada
    WHERE id = p_alert_id;

    IF FOUND THEN
        RETURN TRUE;
    ELSE
        RETURN FALSE;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener estadísticas de alertas
CREATE OR REPLACE FUNCTION obtener_estadisticas_alertas()
RETURNS TABLE(
    metrica VARCHAR,
    valor BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 'total_alertas'::VARCHAR, COUNT(*)::BIGINT FROM security_alerts
    UNION ALL
    SELECT 'alertas_nuevas'::VARCHAR, COUNT(*)::BIGINT FROM security_alerts WHERE estado = 'NUEVA'
    UNION ALL
    SELECT 'alertas_criticas'::VARCHAR, COUNT(*)::BIGINT FROM security_alerts WHERE severity = 'CRITICAL' AND estado IN ('NUEVA', 'EN_REVISION')
    UNION ALL
    SELECT 'alertas_hoy'::VARCHAR, COUNT(*)::BIGINT FROM security_alerts WHERE fecha_deteccion >= CURRENT_DATE
    UNION ALL
    SELECT 'alertas_semana'::VARCHAR, COUNT(*)::BIGINT FROM security_alerts WHERE fecha_deteccion >= CURRENT_DATE - INTERVAL '7 days'
    UNION ALL
    SELECT 'alertas_mes'::VARCHAR, COUNT(*)::BIGINT FROM security_alerts WHERE fecha_deteccion >= CURRENT_DATE - INTERVAL '30 days'
    UNION ALL
    SELECT 'tasa_resolucion_24h'::VARCHAR,
        ROUND((COUNT(*) FILTER (WHERE estado = 'RESUELTA' AND fecha_resolucion >= NOW() - INTERVAL '24 hours')::NUMERIC /
               NULLIF(COUNT(*) FILTER (WHERE fecha_deteccion >= NOW() - INTERVAL '24 hours'), 0) * 100))::BIGINT
    FROM security_alerts;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 4️⃣ TRIGGERS AUTOMÁTICOS DE DETECCIÓN
-- ============================================================

-- Trigger para detectar intentos de fuerza bruta (login fallidos)
CREATE OR REPLACE FUNCTION detectar_brute_force()
RETURNS TRIGGER AS $$
DECLARE
    v_intentos_fallidos INT;
BEGIN
    IF NEW.action = 'LOGIN_FAILED' THEN
        -- Contar intentos fallidos en los últimos 15 minutos
        SELECT COUNT(*) INTO v_intentos_fallidos
        FROM audit_logs
        WHERE
            usuario = NEW.usuario
            AND action = 'LOGIN_FAILED'
            AND fecha_hora >= NOW() - INTERVAL '15 minutes';

        -- Si hay 5 o más intentos, crear alerta
        IF v_intentos_fallidos >= 5 THEN
            PERFORM crear_alerta_seguridad(
                'BRUTE_FORCE',
                'HIGH',
                NEW.usuario,
                NEW.ip_address,
                format('Detectados %s intentos fallidos de login en 15 minutos', v_intentos_fallidos),
                jsonb_build_object(
                    'intentos', v_intentos_fallidos,
                    'periodo_minutos', 15,
                    'ip', NEW.ip_address
                )
            );
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_detectar_brute_force ON audit_logs;
CREATE TRIGGER trg_detectar_brute_force
    AFTER INSERT ON audit_logs
    FOR EACH ROW
    EXECUTE FUNCTION detectar_brute_force();

-- Trigger para detectar acceso fuera de horario laboral
CREATE OR REPLACE FUNCTION detectar_acceso_fuera_horario()
RETURNS TRIGGER AS $$
DECLARE
    v_hora INT;
    v_dia_semana INT;
BEGIN
    IF NEW.action = 'LOGIN' THEN
        v_hora := EXTRACT(HOUR FROM NEW.fecha_hora);
        v_dia_semana := EXTRACT(DOW FROM NEW.fecha_hora); -- 0=Domingo, 6=Sábado

        -- Fuera de horario: antes de 7am, después de 7pm, o fines de semana
        IF v_hora < 7 OR v_hora > 19 OR v_dia_semana IN (0, 6) THEN
            PERFORM crear_alerta_seguridad(
                'OFF_HOURS_ACCESS',
                'MEDIUM',
                NEW.usuario,
                NEW.ip_address,
                format('Acceso fuera de horario laboral: %s', TO_CHAR(NEW.fecha_hora, 'DD/MM/YYYY HH24:MI')),
                jsonb_build_object(
                    'hora', v_hora,
                    'dia_semana', v_dia_semana,
                    'timestamp', NEW.fecha_hora
                )
            );
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_detectar_acceso_fuera_horario ON audit_logs;
CREATE TRIGGER trg_detectar_acceso_fuera_horario
    AFTER INSERT ON audit_logs
    FOR EACH ROW
    EXECUTE FUNCTION detectar_acceso_fuera_horario();

-- ============================================================
-- 5️⃣ VERIFICACIONES Y REPORTES
-- ============================================================

SELECT
    '✅ TABLA security_alerts CREADA' AS mensaje,
    COUNT(*) AS registros_existentes
FROM security_alerts;

SELECT * FROM vw_security_alerts_resumen;

-- Ejemplos de uso
SELECT
    '📋 EJEMPLOS DE USO:' AS seccion,
    '' AS consulta;

SELECT
    '1️⃣ Ver alertas activas (críticas primero):' AS ejemplo,
    'SELECT * FROM vw_security_alerts_activas LIMIT 20;' AS consulta;

SELECT
    '2️⃣ Crear alerta manualmente:' AS ejemplo,
    'SELECT crear_alerta_seguridad(''UNUSUAL_ACTIVITY'', ''HIGH'', ''usuario123'', ''192.168.1.100'', ''Actividad sospechosa detectada'', ''{"detalles": "múltiples consultas en corto tiempo"}''::jsonb);' AS consulta;

SELECT
    '3️⃣ Resolver una alerta:' AS ejemplo,
    'SELECT resolver_alerta_seguridad(1, ''admin'', ''RESUELTA'', ''Usuario contactado y verificado'', ''Cambio de contraseña solicitado'');' AS consulta;

SELECT
    '4️⃣ Estadísticas generales:' AS ejemplo,
    'SELECT * FROM obtener_estadisticas_alertas();' AS consulta;

SELECT
    '5️⃣ Alertas por tipo:' AS ejemplo,
    'SELECT * FROM vw_security_alerts_por_tipo;' AS consulta;
