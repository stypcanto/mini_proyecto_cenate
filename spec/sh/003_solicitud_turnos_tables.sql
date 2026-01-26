-- ============================================================
-- Script: Tablas para Solicitud de Turnos por Telemedicina
-- Fecha: 2025-12-23
-- Descripcion: Crea las 3 tablas del modulo de solicitud de turnos
-- ============================================================

-- ============================================================
-- 1. TABLA: periodo_solicitud_turno
-- Administra los periodos de captura creados por el Coordinador
-- ============================================================
CREATE TABLE IF NOT EXISTS periodo_solicitud_turno (
    id_periodo SERIAL PRIMARY KEY,
    periodo VARCHAR(6) NOT NULL,              -- YYYYMM (ej: "202601")
    descripcion VARCHAR(100) NOT NULL,        -- "Enero 2026"
    fecha_inicio TIMESTAMP NOT NULL,
    fecha_fin TIMESTAMP NOT NULL,
    estado VARCHAR(20) DEFAULT 'BORRADOR',    -- BORRADOR, ACTIVO, CERRADO
    instrucciones TEXT,                       -- Nota importante para IPRESS
    created_by VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Comentarios de tabla y columnas
COMMENT ON TABLE periodo_solicitud_turno IS 'Periodos mensuales de solicitud de turnos creados por el Coordinador Medico';
COMMENT ON COLUMN periodo_solicitud_turno.periodo IS 'Periodo en formato YYYYMM (ej: 202601 para Enero 2026)';
COMMENT ON COLUMN periodo_solicitud_turno.estado IS 'Estado del periodo: BORRADOR, ACTIVO, CERRADO';

-- Indice para busquedas por periodo
CREATE INDEX IF NOT EXISTS idx_periodo_solicitud_periodo
ON periodo_solicitud_turno(periodo);

-- Indice para busquedas por estado
CREATE INDEX IF NOT EXISTS idx_periodo_solicitud_estado
ON periodo_solicitud_turno(estado);

-- ============================================================
-- 2. TABLA: solicitud_turno_ipress
-- Registra cada respuesta de una IPRESS a un periodo
-- ============================================================
CREATE TABLE IF NOT EXISTS solicitud_turno_ipress (
    id_solicitud SERIAL PRIMARY KEY,
    id_periodo INTEGER NOT NULL REFERENCES periodo_solicitud_turno(id_periodo) ON DELETE CASCADE,
    id_pers INTEGER NOT NULL REFERENCES dim_personal_cnt(id_pers),  -- Usuario que envia
    estado VARCHAR(20) DEFAULT 'BORRADOR',    -- BORRADOR, ENVIADO, REVISADO
    fecha_envio TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_periodo_personal UNIQUE(id_periodo, id_pers)  -- Un usuario solo puede responder una vez por periodo
);

-- Comentarios de tabla y columnas
COMMENT ON TABLE solicitud_turno_ipress IS 'Solicitudes de turnos enviadas por usuarios IPRESS';
COMMENT ON COLUMN solicitud_turno_ipress.id_pers IS 'Usuario que envia la solicitud - Red, IPRESS, email, nombre y telefono se obtienen via JOINs';
COMMENT ON COLUMN solicitud_turno_ipress.estado IS 'Estado de la solicitud: BORRADOR, ENVIADO, REVISADO';

-- Indice para busquedas por periodo
CREATE INDEX IF NOT EXISTS idx_solicitud_turno_periodo
ON solicitud_turno_ipress(id_periodo);

-- Indice para busquedas por usuario
CREATE INDEX IF NOT EXISTS idx_solicitud_turno_pers
ON solicitud_turno_ipress(id_pers);

-- Indice para busquedas por estado
CREATE INDEX IF NOT EXISTS idx_solicitud_turno_estado
ON solicitud_turno_ipress(estado);

-- ============================================================
-- 3. TABLA: detalle_solicitud_turno
-- Detalle de turnos solicitados por especialidad
-- ============================================================
CREATE TABLE IF NOT EXISTS detalle_solicitud_turno (
    id_detalle SERIAL PRIMARY KEY,
    id_solicitud INTEGER NOT NULL REFERENCES solicitud_turno_ipress(id_solicitud) ON DELETE CASCADE,
    id_servicio INTEGER NOT NULL REFERENCES dim_servicio_essi(id_servicio),
    turnos_solicitados INTEGER DEFAULT 0,
    turno_preferente VARCHAR(100),            -- "Manana", "Tarde", etc.
    dia_preferente VARCHAR(200),              -- "Lunes, Miercoles"
    observacion TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Comentarios de tabla y columnas
COMMENT ON TABLE detalle_solicitud_turno IS 'Detalle de turnos solicitados por cada especialidad';
COMMENT ON COLUMN detalle_solicitud_turno.id_servicio IS 'Especialidad medica (referencia a dim_servicio_essi)';
COMMENT ON COLUMN detalle_solicitud_turno.turnos_solicitados IS 'Cantidad de turnos solicitados para esta especialidad';
COMMENT ON COLUMN detalle_solicitud_turno.turno_preferente IS 'Turno preferido: Manana, Tarde, Noche';
COMMENT ON COLUMN detalle_solicitud_turno.dia_preferente IS 'Dias preferidos separados por coma';

-- Indice para busquedas por solicitud
CREATE INDEX IF NOT EXISTS idx_detalle_solicitud
ON detalle_solicitud_turno(id_solicitud);

-- Indice para busquedas por especialidad
CREATE INDEX IF NOT EXISTS idx_detalle_servicio
ON detalle_solicitud_turno(id_servicio);

-- ============================================================
-- 4. VISTA: vw_solicitud_turno_completa
-- Vista consolidada para consultas de programacion
-- ============================================================
CREATE OR REPLACE VIEW vw_solicitud_turno_completa AS
SELECT
    pst.id_periodo,
    pst.periodo,
    pst.descripcion AS periodo_descripcion,
    pst.estado AS periodo_estado,
    sti.id_solicitud,
    sti.estado AS solicitud_estado,
    sti.fecha_envio,
    sti.created_at AS solicitud_created_at,
    -- Datos del usuario (auto-detectados)
    pc.id_pers,
    pc.num_doc_pers AS dni_usuario,
    CONCAT(pc.nom_pers, ' ', pc.ape_pater_pers, ' ', pc.ape_mater_pers) AS nombre_completo,
    COALESCE(pc.email_corp_pers, pc.email_pers) AS email_contacto,
    pc.movil_pers AS telefono_contacto,
    -- Datos IPRESS (auto-detectados)
    i.id_ipress,
    i.cod_ipress,
    i.desc_ipress AS nombre_ipress,
    -- Datos Red (auto-detectados)
    r.id_red,
    r.desc_red AS nombre_red,
    -- Detalle de turnos
    dst.id_detalle,
    dst.id_servicio,
    se.desc_servicio AS especialidad,
    dst.turnos_solicitados,
    dst.turno_preferente,
    dst.dia_preferente,
    dst.observacion
FROM periodo_solicitud_turno pst
LEFT JOIN solicitud_turno_ipress sti ON pst.id_periodo = sti.id_periodo
LEFT JOIN dim_personal_cnt pc ON sti.id_pers = pc.id_pers
LEFT JOIN dim_ipress i ON pc.id_ipress = i.id_ipress
LEFT JOIN dim_red r ON i.id_red = r.id_red
LEFT JOIN detalle_solicitud_turno dst ON sti.id_solicitud = dst.id_solicitud
LEFT JOIN dim_servicio_essi se ON dst.id_servicio = se.id_servicio
ORDER BY pst.periodo DESC, r.desc_red, i.desc_ipress, se.desc_servicio;

-- Comentario de vista
COMMENT ON VIEW vw_solicitud_turno_completa IS 'Vista consolidada de solicitudes de turnos con datos de usuario, IPRESS y Red auto-detectados';

-- ============================================================
-- 5. CONSULTAS UTILES
-- ============================================================

-- Ver todos los periodos
-- SELECT * FROM periodo_solicitud_turno ORDER BY periodo DESC;

-- Ver solicitudes de un periodo especifico
-- SELECT * FROM vw_solicitud_turno_completa WHERE id_periodo = 1;

-- Resumen de turnos por especialidad y periodo
-- SELECT
--     periodo,
--     periodo_descripcion,
--     especialidad,
--     SUM(turnos_solicitados) AS total_turnos,
--     COUNT(DISTINCT id_ipress) AS total_ipress
-- FROM vw_solicitud_turno_completa
-- WHERE id_periodo = 1
-- GROUP BY periodo, periodo_descripcion, especialidad
-- ORDER BY total_turnos DESC;

-- Resumen por Red
-- SELECT
--     nombre_red,
--     COUNT(DISTINCT id_ipress) AS ipress_respondieron,
--     SUM(turnos_solicitados) AS total_turnos
-- FROM vw_solicitud_turno_completa
-- WHERE id_periodo = 1
-- GROUP BY nombre_red
-- ORDER BY total_turnos DESC;

-- ============================================================
-- FIN DEL SCRIPT
-- ============================================================
