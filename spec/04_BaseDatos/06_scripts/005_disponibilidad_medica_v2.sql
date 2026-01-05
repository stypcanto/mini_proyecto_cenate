-- =====================================================================
-- Script: Módulo de Disponibilidad de Turnos Médicos + Integración Chatbot
-- Versión: 2.0.0
-- Fecha: 2026-01-03
-- Autor: Ing. Styp Canto Rondón
-- Base de datos: maestro_cenate (PostgreSQL 14+)
-- =====================================================================

-- =====================================================================
-- TABLA 1: disponibilidad_medica
-- Descripción: Disponibilidad mensual declarada por médicos
-- =====================================================================

CREATE TABLE IF NOT EXISTS disponibilidad_medica (
    id_disponibilidad BIGSERIAL PRIMARY KEY,
    id_pers BIGINT NOT NULL REFERENCES dim_personal_cnt(id_pers),
    id_servicio BIGINT NOT NULL REFERENCES dim_servicio_essi(id_servicio),
    periodo VARCHAR(6) NOT NULL, -- Formato: YYYYMM (ej: 202601)
    estado VARCHAR(20) NOT NULL DEFAULT 'BORRADOR',

    -- Cálculo de horas (v2.0.0)
    horas_asistenciales DECIMAL(5,2) DEFAULT 0.00,   -- Horas de turnos M/T/MT según régimen
    horas_sanitarias DECIMAL(5,2) DEFAULT 0.00,      -- 2h × días trabajados (solo 728/CAS)
    total_horas DECIMAL(5,2) DEFAULT 0.00,           -- asistenciales + sanitarias
    horas_requeridas DECIMAL(5,2) DEFAULT 150.00,    -- Meta mensual

    observaciones TEXT,

    -- Fechas de workflow
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_envio TIMESTAMP WITH TIME ZONE,
    fecha_revision TIMESTAMP WITH TIME ZONE,

    -- Integración con horarios chatbot (v2.0.0)
    fecha_sincronizacion TIMESTAMP WITH TIME ZONE,
    id_ctr_horario_generado BIGINT,  -- FK a ctr_horario (no foreign key para evitar dependencia circular)

    -- Auditoría
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Constraints
    CONSTRAINT uq_disponibilidad_medica UNIQUE(id_pers, periodo, id_servicio),
    CONSTRAINT ck_disponibilidad_estado CHECK (estado IN ('BORRADOR', 'ENVIADO', 'REVISADO', 'SINCRONIZADO')),
    CONSTRAINT ck_disponibilidad_periodo CHECK (periodo ~ '^\d{6}$'),  -- Valida formato YYYYMM
    CONSTRAINT ck_disponibilidad_horas CHECK (total_horas >= 0 AND total_horas <= 744)  -- Max horas en un mes
);

-- Comentarios
COMMENT ON TABLE disponibilidad_medica IS 'Disponibilidad mensual declarada por médicos con integración a chatbot';
COMMENT ON COLUMN disponibilidad_medica.horas_asistenciales IS 'Horas de atención directa según turnos M/T/MT y régimen laboral';
COMMENT ON COLUMN disponibilidad_medica.horas_sanitarias IS 'Horas administrativas: 2h × días trabajados (solo régimen 728/CAS)';
COMMENT ON COLUMN disponibilidad_medica.total_horas IS 'Total = horas_asistenciales + horas_sanitarias';
COMMENT ON COLUMN disponibilidad_medica.id_ctr_horario_generado IS 'ID del registro en ctr_horario generado tras sincronización';

-- Índices
CREATE INDEX idx_disponibilidad_periodo ON disponibilidad_medica(periodo);
CREATE INDEX idx_disponibilidad_estado ON disponibilidad_medica(estado);
CREATE INDEX idx_disponibilidad_pers ON disponibilidad_medica(id_pers);
CREATE INDEX idx_disponibilidad_servicio ON disponibilidad_medica(id_servicio);
CREATE INDEX idx_disponibilidad_sincronizacion ON disponibilidad_medica(id_ctr_horario_generado) WHERE id_ctr_horario_generado IS NOT NULL;
CREATE INDEX idx_disponibilidad_fecha_creacion ON disponibilidad_medica(fecha_creacion DESC);

-- =====================================================================
-- TABLA 2: detalle_disponibilidad
-- Descripción: Turnos marcados por cada día del mes
-- =====================================================================

CREATE TABLE IF NOT EXISTS detalle_disponibilidad (
    id_detalle BIGSERIAL PRIMARY KEY,
    id_disponibilidad BIGINT NOT NULL REFERENCES disponibilidad_medica(id_disponibilidad) ON DELETE CASCADE,
    fecha DATE NOT NULL,
    turno VARCHAR(2) NOT NULL,  -- M (Mañana), T (Tarde), MT (Completo)
    horas DECIMAL(4,2) NOT NULL,  -- Horas de ese turno según régimen

    -- Auditoría de ajustes por coordinador
    ajustado_por BIGINT REFERENCES dim_personal_cnt(id_pers),
    observacion_ajuste TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Constraints
    CONSTRAINT ck_detalle_turno CHECK (turno IN ('M', 'T', 'MT')),
    CONSTRAINT uq_detalle_fecha UNIQUE(id_disponibilidad, fecha),
    CONSTRAINT ck_detalle_horas CHECK (horas > 0 AND horas <= 24)
);

-- Comentarios
COMMENT ON TABLE detalle_disponibilidad IS 'Turnos diarios declarados por el médico';
COMMENT ON COLUMN detalle_disponibilidad.turno IS 'M=Mañana (4h/6h), T=Tarde (4h/6h), MT=Completo (8h/12h)';
COMMENT ON COLUMN detalle_disponibilidad.horas IS 'Horas asistenciales del turno según régimen laboral';
COMMENT ON COLUMN detalle_disponibilidad.ajustado_por IS 'ID del coordinador que ajustó el turno (si aplica)';

-- Índices
CREATE INDEX idx_detalle_disponibilidad ON detalle_disponibilidad(id_disponibilidad);
CREATE INDEX idx_detalle_fecha ON detalle_disponibilidad(fecha);

-- =====================================================================
-- TABLA 3: sincronizacion_horario_log (NUEVA v2.0.0)
-- Descripción: Log de sincronizaciones entre disponibilidad y ctr_horario
-- =====================================================================

CREATE TABLE IF NOT EXISTS sincronizacion_horario_log (
    id_sincronizacion BIGSERIAL PRIMARY KEY,
    id_disponibilidad BIGINT NOT NULL REFERENCES disponibilidad_medica(id_disponibilidad),
    id_ctr_horario BIGINT,  -- FK a ctr_horario (no enforced)
    tipo_operacion VARCHAR(20) NOT NULL,  -- CREACION, ACTUALIZACION
    resultado VARCHAR(20) NOT NULL,       -- EXITOSO, FALLIDO, PARCIAL

    -- Detalles de la operación en formato JSON
    detalles_operacion JSONB,  -- {dias_sincronizados, turnos_mapeados, slots_generados, etc}

    usuario_sincronizacion VARCHAR(50) NOT NULL,
    fecha_sincronizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    errores TEXT,  -- Mensajes de error si resultado = FALLIDO o PARCIAL

    -- Constraints
    CONSTRAINT ck_sincronizacion_tipo CHECK (tipo_operacion IN ('CREACION', 'ACTUALIZACION')),
    CONSTRAINT ck_sincronizacion_resultado CHECK (resultado IN ('EXITOSO', 'FALLIDO', 'PARCIAL'))
);

-- Comentarios
COMMENT ON TABLE sincronizacion_horario_log IS 'Auditoría completa de sincronizaciones con sistema de horarios chatbot';
COMMENT ON COLUMN sincronizacion_horario_log.detalles_operacion IS 'JSONB con detalles: {dias_sincronizados, turnos_mapeados, slots_generados, periodo, etc}';
COMMENT ON COLUMN sincronizacion_horario_log.resultado IS 'EXITOSO: todo OK, PARCIAL: algunos días fallaron, FALLIDO: no se sincronizó nada';

-- Índices
CREATE INDEX idx_sincronizacion_disponibilidad ON sincronizacion_horario_log(id_disponibilidad);
CREATE INDEX idx_sincronizacion_fecha ON sincronizacion_horario_log(fecha_sincronizacion DESC);
CREATE INDEX idx_sincronizacion_resultado ON sincronizacion_horario_log(resultado);
CREATE INDEX idx_sincronizacion_usuario ON sincronizacion_horario_log(usuario_sincronizacion);

-- Índice GIN para búsquedas en JSONB
CREATE INDEX idx_sincronizacion_detalles ON sincronizacion_horario_log USING GIN (detalles_operacion);

-- =====================================================================
-- VISTA: vw_disponibilidad_vs_horario (NUEVA v2.0.0)
-- Descripción: Vista comparativa para validar consistencia entre sistemas
-- =====================================================================

CREATE OR REPLACE VIEW vw_disponibilidad_vs_horario AS
SELECT
    dm.id_disponibilidad,
    dm.periodo,
    dm.estado,

    -- Información del médico
    p.id_pers,
    p.nom_pers || ' ' || p.ape_pater_pers || ' ' || p.ape_mater_pers AS nombre_medico,
    p.num_doc_ident AS dni_medico,

    -- Información de especialidad
    s.id_servicio,
    s.desc_servicio AS especialidad,

    -- Horas declaradas (de disponibilidad_medica)
    dm.horas_asistenciales,
    dm.horas_sanitarias,
    dm.total_horas AS horas_declaradas,

    -- Horas cargadas en chatbot (cálculo desde ctr_horario)
    COALESCE(
        (SELECT SUM(
            CASE
                -- Mapeo de códigos de horario a horas
                WHEN dh.cod_horario = '158' THEN 6  -- Mañana Locador
                WHEN dh.cod_horario = '131' THEN 6  -- Tarde Locador
                WHEN dh.cod_horario = '200A' THEN 12 -- Completo Locador
                -- Agregar más códigos si existen otros regímenes
                ELSE 0
            END
        )
        FROM ctr_horario ch
        INNER JOIN ctr_horario_det chd ON chd.id_ctr_horario = ch.id_ctr_horario
        INNER JOIN dim_horario dh ON dh.id_horario = chd.id_horario
        WHERE ch.periodo = dm.periodo
          AND ch.id_pers = dm.id_pers
          AND ch.id_servicio = dm.id_servicio),
        0
    ) AS horas_cargadas_chatbot,

    -- Cantidad de slots generados
    COALESCE(
        (SELECT COUNT(*)
        FROM ctr_horario ch
        INNER JOIN ctr_horario_det chd ON chd.id_ctr_horario = ch.id_ctr_horario
        WHERE ch.periodo = dm.periodo
          AND ch.id_pers = dm.id_pers
          AND ch.id_servicio = dm.id_servicio),
        0
    ) AS slots_generados,

    -- Información de sincronización
    dm.id_ctr_horario_generado,
    dm.fecha_sincronizacion,

    -- Estado de validación
    CASE
        WHEN dm.id_ctr_horario_generado IS NULL THEN 'SIN_HORARIO_CARGADO'
        WHEN ABS(
            dm.total_horas -
            COALESCE((SELECT SUM(CASE WHEN dh.cod_horario = '158' THEN 6 WHEN dh.cod_horario = '131' THEN 6 WHEN dh.cod_horario = '200A' THEN 12 ELSE 0 END)
                     FROM ctr_horario ch
                     INNER JOIN ctr_horario_det chd ON chd.id_ctr_horario = ch.id_ctr_horario
                     INNER JOIN dim_horario dh ON dh.id_horario = chd.id_horario
                     WHERE ch.periodo = dm.periodo AND ch.id_pers = dm.id_pers AND ch.id_servicio = dm.id_servicio), 0)
        ) > 10 THEN 'DIFERENCIA_SIGNIFICATIVA'
        ELSE 'CONSISTENTE'
    END AS estado_validacion,

    -- Última sincronización
    (SELECT fecha_sincronizacion
     FROM sincronizacion_horario_log
     WHERE id_disponibilidad = dm.id_disponibilidad
     ORDER BY fecha_sincronizacion DESC
     LIMIT 1) AS ultima_sincronizacion,

    (SELECT resultado
     FROM sincronizacion_horario_log
     WHERE id_disponibilidad = dm.id_disponibilidad
     ORDER BY fecha_sincronizacion DESC
     LIMIT 1) AS resultado_ultima_sincronizacion

FROM disponibilidad_medica dm
INNER JOIN dim_personal_cnt p ON p.id_pers = dm.id_pers
INNER JOIN dim_servicio_essi s ON s.id_servicio = dm.id_servicio
WHERE dm.estado IN ('REVISADO', 'SINCRONIZADO');

-- Comentarios
COMMENT ON VIEW vw_disponibilidad_vs_horario IS 'Vista comparativa entre disponibilidad declarada y horarios cargados en chatbot';

-- =====================================================================
-- TRIGGER: Actualizar updated_at automáticamente
-- =====================================================================

CREATE OR REPLACE FUNCTION update_disponibilidad_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_disponibilidad_timestamp
    BEFORE UPDATE ON disponibilidad_medica
    FOR EACH ROW
    EXECUTE FUNCTION update_disponibilidad_updated_at();

-- =====================================================================
-- DATOS DE PRUEBA (Opcional - comentar en producción)
-- =====================================================================

-- Ejemplo: Médico régimen 728/CAS con 20 días turno completo
-- INSERT INTO disponibilidad_medica (id_pers, id_servicio, periodo, estado, horas_asistenciales, horas_sanitarias, total_horas)
-- VALUES (
--     (SELECT id_pers FROM dim_personal_cnt WHERE num_doc_ident = '44914706' LIMIT 1),
--     (SELECT id_servicio FROM dim_servicio_essi WHERE desc_servicio LIKE '%CARDIOLOG%' LIMIT 1),
--     '202601',
--     'BORRADOR',
--     160.00,  -- 20 días × 8h
--     40.00,   -- 20 días × 2h sanitarias
--     200.00   -- Total
-- );

-- =====================================================================
-- VALIDACIONES POST-INSTALACIÓN
-- =====================================================================

-- 1. Verificar que las tablas se crearon
SELECT
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) AS num_columnas
FROM information_schema.tables t
WHERE table_name IN ('disponibilidad_medica', 'detalle_disponibilidad', 'sincronizacion_horario_log')
  AND table_schema = 'public'
ORDER BY table_name;

-- 2. Verificar índices
SELECT
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename IN ('disponibilidad_medica', 'detalle_disponibilidad', 'sincronizacion_horario_log')
ORDER BY tablename, indexname;

-- 3. Verificar que la vista se creó
SELECT
    table_name,
    view_definition
FROM information_schema.views
WHERE table_name = 'vw_disponibilidad_vs_horario';

-- =====================================================================
-- FIN DEL SCRIPT
-- =====================================================================

-- NOTAS IMPORTANTES:
-- 1. Este script es IDEMPOTENTE (puede ejecutarse múltiples veces)
-- 2. Usa CREATE TABLE IF NOT EXISTS para evitar errores
-- 3. No elimina datos existentes
-- 4. Compatible con PostgreSQL 14+
-- 5. Requiere que existan previamente: dim_personal_cnt, dim_servicio_essi
-- 6. NO crea FK a ctr_horario para evitar dependencia circular

-- Para ejecutar:
-- PGPASSWORD=Essalud2025 psql -h 10.0.89.13 -U postgres -d maestro_cenate -f 005_disponibilidad_medica_v2.sql
