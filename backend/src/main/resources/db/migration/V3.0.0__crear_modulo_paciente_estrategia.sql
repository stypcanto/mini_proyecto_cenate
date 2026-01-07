-- ========================================================================
-- V3.0.0: Módulo Paciente-Estrategia (Asignación de Estrategias a Pacientes)
-- ------------------------------------------------------------------------
-- CENATE 2026 | Fecha: 2026-01-06
-- Descripción: Permite asociar pacientes con estrategias institucionales
--              (CENACRON, TELECAM, TELETARV, etc.) durante atenciones médicas
--              y realizar seguimiento y reportería por estrategia
-- ========================================================================

-- ========================================================================
-- 1. TABLA PRINCIPAL: paciente_estrategia
-- ========================================================================
-- Tabla que vincula pacientes con estrategias institucionales
-- Permite múltiples asignaciones simultáneas pero solo una ACTIVA por estrategia
-- ========================================================================

CREATE TABLE paciente_estrategia (
    id_asignacion BIGSERIAL PRIMARY KEY,

    -- Relaciones
    pk_asegurado VARCHAR(255) NOT NULL,
    id_estrategia BIGINT NOT NULL,
    id_atencion_asignacion BIGINT,
    id_usuario_asigno BIGINT,

    -- Fechas de control
    fecha_asignacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_desvinculacion TIMESTAMP,

    -- Estado de la asignación
    estado VARCHAR(20) NOT NULL DEFAULT 'ACTIVO'
        CONSTRAINT chk_estado_valido
            CHECK (estado IN ('ACTIVO', 'INACTIVO', 'COMPLETADO')),

    -- Observaciones
    observacion_desvinculacion TEXT,

    -- Auditoría
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Restricciones de integridad
    CONSTRAINT fk_paciente_estrategia_asegurado
        FOREIGN KEY (pk_asegurado)
        REFERENCES asegurados(pk_asegurado)
        ON DELETE CASCADE,

    CONSTRAINT fk_paciente_estrategia_estrategia
        FOREIGN KEY (id_estrategia)
        REFERENCES dim_estrategia_institucional(id_estrategia)
        ON DELETE RESTRICT,

    CONSTRAINT fk_paciente_estrategia_usuario
        FOREIGN KEY (id_usuario_asigno)
        REFERENCES dim_usuarios(id_user)
        ON DELETE SET NULL
);

COMMENT ON TABLE paciente_estrategia IS 'Vinculación de pacientes con estrategias institucionales para seguimiento y reportería';
COMMENT ON COLUMN paciente_estrategia.id_asignacion IS 'Identificador único de la asignación';
COMMENT ON COLUMN paciente_estrategia.pk_asegurado IS 'Referencia al asegurado (paciente)';
COMMENT ON COLUMN paciente_estrategia.id_estrategia IS 'Referencia a la estrategia institucional';
COMMENT ON COLUMN paciente_estrategia.id_atencion_asignacion IS 'Referencia opcional a la atención donde se asignó';
COMMENT ON COLUMN paciente_estrategia.id_usuario_asigno IS 'Usuario que realizó la asignación (médico/enfermero)';
COMMENT ON COLUMN paciente_estrategia.fecha_asignacion IS 'Fecha y hora de inicio de la asignación';
COMMENT ON COLUMN paciente_estrategia.fecha_desvinculacion IS 'Fecha y hora cuando se desvincló del paciente';
COMMENT ON COLUMN paciente_estrategia.estado IS 'Estado de la asignación: ACTIVO (en curso), INACTIVO (pausada), COMPLETADO (finalizada)';
COMMENT ON COLUMN paciente_estrategia.observacion_desvinculacion IS 'Nota sobre por qué se desvincló (opcional)';

-- ========================================================================
-- 2. ÍNDICES PARA PERFORMANCE
-- ========================================================================

-- Índice para búsquedas por paciente
CREATE INDEX idx_pac_est_paciente
    ON paciente_estrategia(pk_asegurado);

-- Índice para búsquedas por estrategia
CREATE INDEX idx_pac_est_estrategia
    ON paciente_estrategia(id_estrategia);

-- Índice para búsquedas de asignaciones activas (más frecuente)
CREATE INDEX idx_pac_est_activos
    ON paciente_estrategia(pk_asegurado, estado)
    WHERE estado = 'ACTIVO';

-- Índice compuesto para búsquedas por fecha y estado
CREATE INDEX idx_pac_est_fecha_estado
    ON paciente_estrategia(fecha_asignacion, estado);

-- Índice para joins con atenciones
CREATE INDEX idx_pac_est_atencion
    ON paciente_estrategia(id_atencion_asignacion)
    WHERE id_atencion_asignacion IS NOT NULL;

-- Índice único parcial: Solo una asignación ACTIVA por paciente-estrategia
-- Permite múltiples registros inactivos pero solo uno activo por par
CREATE UNIQUE INDEX idx_pac_est_activo_unico
    ON paciente_estrategia(pk_asegurado, id_estrategia)
    WHERE estado = 'ACTIVO';

COMMENT ON INDEX idx_pac_est_paciente IS 'Optimiza búsquedas de todas las estrategias de un paciente';
COMMENT ON INDEX idx_pac_est_estrategia IS 'Optimiza búsquedas de pacientes en una estrategia';
COMMENT ON INDEX idx_pac_est_activos IS 'Optimiza búsquedas de asignaciones activas (caso más frecuente)';
COMMENT ON INDEX idx_pac_est_activo_unico IS 'Garantiza que solo haya una asignación ACTIVA por paciente-estrategia';

-- ========================================================================
-- 3. VISTAS PARA CONSULTAS COMUNES
-- ========================================================================

-- Vista 1: Estrategias activas de un paciente (para UI)
CREATE VIEW vw_paciente_estrategias_activas AS
SELECT
    pe.id_asignacion,
    pe.pk_asegurado,
    pe.id_estrategia,
    dei.sigla AS estrategia_sigla,
    dei.desc_estrategia,
    pe.fecha_asignacion,
    pe.id_usuario_asigno,
    COALESCE(du.name_user) AS usuario_asigno,
    EXTRACT(DAY FROM CURRENT_TIMESTAMP - pe.fecha_asignacion)::INT AS dias_en_estrategia
FROM paciente_estrategia pe
INNER JOIN dim_estrategia_institucional dei ON pe.id_estrategia = dei.id_estrategia
LEFT JOIN dim_usuarios du ON pe.id_usuario_asigno = du.id_user
WHERE pe.estado = 'ACTIVO'
ORDER BY pe.fecha_asignacion DESC;

COMMENT ON VIEW vw_paciente_estrategias_activas IS 'Muestra estrategias activas de pacientes con cálculo dinámico de días en estrategia';

-- Vista 2: Historial completo de estrategias de un paciente
CREATE VIEW vw_historial_estrategias_paciente AS
SELECT
    pe.id_asignacion,
    pe.pk_asegurado,
    pe.id_estrategia,
    dei.sigla AS estrategia_sigla,
    dei.desc_estrategia,
    pe.estado,
    pe.fecha_asignacion,
    pe.fecha_desvinculacion,
    CASE
        WHEN pe.fecha_desvinculacion IS NULL THEN NULL
        ELSE EXTRACT(DAY FROM pe.fecha_desvinculacion - pe.fecha_asignacion)::INT
    END AS dias_total_en_estrategia,
    pe.observacion_desvinculacion,
    COALESCE(du.name_user) AS usuario_asigno
FROM paciente_estrategia pe
INNER JOIN dim_estrategia_institucional dei ON pe.id_estrategia = dei.id_estrategia
LEFT JOIN dim_usuarios du ON pe.id_usuario_asigno = du.id_user
ORDER BY pe.fecha_asignacion DESC;

COMMENT ON VIEW vw_historial_estrategias_paciente IS 'Historial completo de todas las asignaciones de estrategias por paciente con cálculo de duración';

-- Vista 3: Conteo de pacientes por estrategia (para reportería)
CREATE VIEW vw_pacientes_por_estrategia AS
SELECT
    dei.id_estrategia,
    dei.sigla AS estrategia_sigla,
    dei.desc_estrategia,
    COUNT(DISTINCT pe.pk_asegurado) FILTER (WHERE pe.estado = 'ACTIVO') AS pacientes_activos,
    COUNT(DISTINCT pe.pk_asegurado) FILTER (WHERE pe.estado = 'COMPLETADO') AS pacientes_completados,
    COUNT(DISTINCT pe.pk_asegurado) FILTER (WHERE pe.estado = 'INACTIVO') AS pacientes_pausados
FROM dim_estrategia_institucional dei
LEFT JOIN paciente_estrategia pe ON dei.id_estrategia = pe.id_estrategia
GROUP BY dei.id_estrategia, dei.sigla, dei.desc_estrategia
ORDER BY pacientes_activos DESC;

COMMENT ON VIEW vw_pacientes_por_estrategia IS 'Resumen de pacientes por estrategia, útil para dashboards y reportería';

-- Vista 4: Atenciones por estrategia (para análisis de efectividad)
CREATE VIEW vw_atenciones_por_estrategia AS
SELECT
    pe.id_estrategia,
    dei.sigla AS estrategia_sigla,
    dei.desc_estrategia,
    DATE_TRUNC('month', ac.fecha_atencion)::DATE AS mes_atencion,
    COUNT(ac.id_atencion) AS total_atenciones,
    COUNT(DISTINCT ac.pk_asegurado) AS pacientes_unicos
FROM paciente_estrategia pe
INNER JOIN dim_estrategia_institucional dei ON pe.id_estrategia = dei.id_estrategia
INNER JOIN atencion_clinica ac ON pe.pk_asegurado = ac.pk_asegurado
    AND ac.fecha_atencion >= pe.fecha_asignacion
    AND (pe.fecha_desvinculacion IS NULL OR ac.fecha_atencion <= pe.fecha_desvinculacion)
WHERE pe.estado IN ('ACTIVO', 'COMPLETADO')
GROUP BY pe.id_estrategia, dei.sigla, dei.desc_estrategia, DATE_TRUNC('month', ac.fecha_atencion)
ORDER BY mes_atencion DESC, total_atenciones DESC;

COMMENT ON VIEW vw_atenciones_por_estrategia IS 'Análisis de atenciones realizadas durante período de asignación a estrategia';

-- ========================================================================
-- 4. FUNCIÓN PARA CALCULAR DÍAS EN ESTRATEGIA
-- ========================================================================

CREATE OR REPLACE FUNCTION calcular_dias_estrategia(
    p_id_asignacion BIGINT
) RETURNS INTEGER AS $$
DECLARE
    v_dias INTEGER;
    v_fecha_inicio TIMESTAMP;
    v_fecha_fin TIMESTAMP;
BEGIN
    SELECT fecha_asignacion, fecha_desvinculacion
    INTO v_fecha_inicio, v_fecha_fin
    FROM paciente_estrategia
    WHERE id_asignacion = p_id_asignacion;

    IF v_fecha_fin IS NULL THEN
        v_dias := EXTRACT(DAY FROM CURRENT_TIMESTAMP - v_fecha_inicio)::INTEGER;
    ELSE
        v_dias := EXTRACT(DAY FROM v_fecha_fin - v_fecha_inicio)::INTEGER;
    END IF;

    RETURN COALESCE(v_dias, 0);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION calcular_dias_estrategia(BIGINT) IS 'Calcula los días que un paciente estuvo en una estrategia';

-- ========================================================================
-- 5. TRIGGER PARA AUDITORÍA (updated_at)
-- ========================================================================

CREATE OR REPLACE FUNCTION actualizar_updated_at_paciente_estrategia()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at := CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_paciente_estrategia_updated_at
BEFORE UPDATE ON paciente_estrategia
FOR EACH ROW
EXECUTE FUNCTION actualizar_updated_at_paciente_estrategia();

COMMENT ON TRIGGER trg_paciente_estrategia_updated_at ON paciente_estrategia IS 'Actualiza automáticamente la columna updated_at';

-- ========================================================================
-- 6. GRANT PERMISOS (Si es necesario)
-- ========================================================================
-- Descomentar si hay restricciones de permisos por usuario
-- GRANT SELECT, INSERT, UPDATE ON paciente_estrategia TO nombre_usuario;
-- GRANT SELECT ON vw_paciente_estrategias_activas TO nombre_usuario;
-- GRANT SELECT ON vw_historial_estrategias_paciente TO nombre_usuario;
-- GRANT SELECT ON vw_pacientes_por_estrategia TO nombre_usuario;
-- GRANT SELECT ON vw_atenciones_por_estrategia TO nombre_usuario;

-- ========================================================================
-- 7. DATOS INICIALES (Opcional - Ejemplos para Testing)
-- ========================================================================
-- Descomentar cuando haya pacientes reales en la BD
-- INSERT INTO paciente_estrategia (id_paciente, id_estrategia, id_usuario_asigno, estado)
-- VALUES
--     (1, 1, 1, 'ACTIVO'),
--     (2, 2, 1, 'ACTIVO');

-- ========================================================================
-- FIN DE SCRIPT V3.0.0
-- ========================================================================
-- Resumen de cambios:
--   ✅ Tabla paciente_estrategia creada
--   ✅ 5 índices para performance
--   ✅ 4 vistas para consultas comunes
--   ✅ 1 función para cálculo de días
--   ✅ 1 trigger para auditoría
--   ✅ UNIQUE constraint para evitar duplicados ACTIVOS
-- ========================================================================
