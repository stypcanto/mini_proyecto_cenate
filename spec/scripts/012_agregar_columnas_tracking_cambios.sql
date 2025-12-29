-- ========================================================================
-- Script: 012_agregar_columnas_tracking_cambios.sql
-- Descripción: Agregar columnas JSONB para tracking de cambios (before/after)
-- Fecha: 2025-12-29
-- Autor: Ing. Styp Canto Rondón
-- ========================================================================

-- Agregar columnas JSONB para guardar datos previos y nuevos
ALTER TABLE audit_logs
ADD COLUMN IF NOT EXISTS datos_previos JSONB,
ADD COLUMN IF NOT EXISTS datos_nuevos JSONB;

-- Comentarios en las nuevas columnas
COMMENT ON COLUMN audit_logs.datos_previos IS 'Datos previos del registro antes de la modificación (formato JSON)';
COMMENT ON COLUMN audit_logs.datos_nuevos IS 'Datos nuevos del registro después de la modificación (formato JSON)';

-- Índices GIN para búsquedas eficientes en JSON
CREATE INDEX IF NOT EXISTS idx_audit_logs_datos_previos
    ON audit_logs USING GIN (datos_previos);

CREATE INDEX IF NOT EXISTS idx_audit_logs_datos_nuevos
    ON audit_logs USING GIN (datos_nuevos);

-- Verificar que las columnas se agregaron correctamente
SELECT
    'Columnas JSONB agregadas correctamente' as mensaje,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'audit_logs'
  AND column_name IN ('datos_previos', 'datos_nuevos');

-- Ejemplo de consulta para buscar cambios en un campo específico
-- (Descomentary cuando tengas datos)
/*
SELECT
    fecha_hora,
    usuario,
    accion,
    datos_previos->>'email_corporativo' as email_anterior,
    datos_nuevos->>'email_corporativo' as email_nuevo,
    detalle
FROM audit_logs
WHERE accion = 'UPDATE_USER'
  AND datos_previos->>'email_corporativo' IS DISTINCT FROM datos_nuevos->>'email_corporativo'
ORDER BY fecha_hora DESC;
*/

-- Función para comparar cambios entre dos versiones JSON
CREATE OR REPLACE FUNCTION audit_logs_compare_changes(
    p_antes JSONB,
    p_despues JSONB
)
RETURNS TABLE(
    campo TEXT,
    valor_anterior TEXT,
    valor_nuevo TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        key as campo,
        p_antes->>key as valor_anterior,
        p_despues->>key as valor_nuevo
    FROM jsonb_each_text(p_despues)
    WHERE p_antes->>key IS DISTINCT FROM p_despues->>key;
END;
$$ LANGUAGE plpgsql;

-- Ejemplo de uso de la función de comparación
-- (Descomentary cuando tengas datos)
/*
SELECT * FROM audit_logs_compare_changes(
    '{"nombre": "Juan", "email": "juan@old.com", "telefono": "123"}'::jsonb,
    '{"nombre": "Juan", "email": "juan@new.com", "telefono": "456"}'::jsonb
);
*/

-- Vista para auditoría de cambios detallados
CREATE OR REPLACE VIEW vw_auditoria_cambios_detallados AS
SELECT
    a.id,
    a.fecha_hora,
    a.usuario,
    u.name_user as username,
    COALESCE(
        CONCAT(p.nom_pers, ' ', p.ape_pater_pers, ' ', p.ape_mater_pers),
        CONCAT(pe.nom_ext, ' ', pe.ape_pater_ext, ' ', pe.ape_mater_ext)
    ) as nombre_completo,
    a.modulo,
    a.action as accion,
    a.detalle,
    a.id_afectado,
    a.datos_previos,
    a.datos_nuevos,
    -- Campos que cambiaron
    (
        SELECT json_agg(json_build_object(
            'campo', campo,
            'valor_anterior', valor_anterior,
            'valor_nuevo', valor_nuevo
        ))
        FROM audit_logs_compare_changes(a.datos_previos, a.datos_nuevos)
    ) as campos_modificados,
    -- Cantidad de campos modificados
    (
        SELECT COUNT(*)
        FROM audit_logs_compare_changes(a.datos_previos, a.datos_nuevos)
    ) as cantidad_cambios
FROM audit_logs a
    LEFT JOIN dim_usuarios u ON a.usuario = u.name_user
    LEFT JOIN dim_personal_cnt p ON p.id_usuario = u.id_user
    LEFT JOIN dim_personal_externo pe ON pe.id_user = u.id_user
WHERE a.datos_previos IS NOT NULL
  AND a.datos_nuevos IS NOT NULL
ORDER BY a.fecha_hora DESC;

-- Verificar creación de la vista
SELECT
    'Vista de cambios detallados creada correctamente' as mensaje,
    COUNT(*) as registros_con_tracking
FROM vw_auditoria_cambios_detallados;
