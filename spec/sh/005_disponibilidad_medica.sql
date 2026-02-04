-- ================================================================
-- Script SQL: Módulo de Disponibilidad de Turnos Médicos
-- Sistema: CENATE - EsSalud Perú
-- Versión: 1.0.0
-- Fecha: 2025-12-27
-- Autor: Ing. Styp Canto Rondon
-- ================================================================
--
-- Propósito:
-- Crear las tablas necesarias para el módulo de gestión de
-- disponibilidad de turnos médicos, permitiendo a los médicos
-- declarar su disponibilidad mensual y a los coordinadores
-- revisar y ajustar dichas disponibilidades.
--
-- Tablas creadas:
-- 1. disponibilidad_medica - Disponibilidad mensual del médico
-- 2. detalle_disponibilidad - Turnos específicos por día
--
-- ================================================================

-- ================================================================
-- TABLA 1: disponibilidad_medica
-- ================================================================
-- Descripción:
-- Almacena la disponibilidad mensual de un médico para una
-- especialidad específica. Incluye validación de 150 horas mínimas
-- y gestión de estados (BORRADOR, ENVIADO, REVISADO).
-- ================================================================

CREATE TABLE IF NOT EXISTS disponibilidad_medica (
    -- ============================================================
    -- IDENTIFICADORES
    -- ============================================================
    id_disponibilidad BIGSERIAL PRIMARY KEY,

    -- ============================================================
    -- RELACIONES
    -- ============================================================
    id_pers BIGINT NOT NULL REFERENCES dim_personal_cnt(id_pers)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    id_servicio BIGINT NOT NULL REFERENCES dim_servicio_essi(id_servicio)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    -- ============================================================
    -- DATOS PRINCIPALES
    -- ============================================================
    periodo VARCHAR(6) NOT NULL, -- Formato: YYYYMM (ejemplo: 202601)
    estado VARCHAR(20) NOT NULL DEFAULT 'BORRADOR',

    -- ============================================================
    -- VALIDACIÓN DE HORAS
    -- ============================================================
    total_horas DECIMAL(5,2) DEFAULT 0.00,
    horas_requeridas DECIMAL(5,2) DEFAULT 150.00,

    -- ============================================================
    -- INFORMACIÓN ADICIONAL
    -- ============================================================
    observaciones TEXT,

    -- ============================================================
    -- CONTROL DE FECHAS
    -- ============================================================
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_envio TIMESTAMP WITH TIME ZONE,
    fecha_revision TIMESTAMP WITH TIME ZONE,

    -- ============================================================
    -- AUDITORÍA
    -- ============================================================
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- ============================================================
    -- CONSTRAINTS
    -- ============================================================
    CONSTRAINT uq_disponibilidad_periodo_pers_servicio
        UNIQUE(id_pers, periodo, id_servicio),

    CONSTRAINT ck_estado_disponibilidad
        CHECK (estado IN ('BORRADOR', 'ENVIADO', 'REVISADO')),

    CONSTRAINT ck_periodo_format
        CHECK (periodo ~ '^\d{6}$'),

    CONSTRAINT ck_total_horas_positivo
        CHECK (total_horas >= 0),

    CONSTRAINT ck_horas_requeridas_positivo
        CHECK (horas_requeridas > 0)
);

-- ============================================================
-- COMENTARIOS DE LA TABLA
-- ============================================================
COMMENT ON TABLE disponibilidad_medica IS 'Disponibilidad mensual de turnos médicos por especialidad';
COMMENT ON COLUMN disponibilidad_medica.id_disponibilidad IS 'Identificador único de la disponibilidad';
COMMENT ON COLUMN disponibilidad_medica.id_pers IS 'ID del médico (PersonalCnt)';
COMMENT ON COLUMN disponibilidad_medica.id_servicio IS 'ID de la especialidad médica';
COMMENT ON COLUMN disponibilidad_medica.periodo IS 'Periodo en formato YYYYMM (ej: 202601)';
COMMENT ON COLUMN disponibilidad_medica.estado IS 'Estado: BORRADOR, ENVIADO, REVISADO';
COMMENT ON COLUMN disponibilidad_medica.total_horas IS 'Total de horas calculadas según turnos';
COMMENT ON COLUMN disponibilidad_medica.horas_requeridas IS 'Horas mínimas requeridas (default: 150)';
COMMENT ON COLUMN disponibilidad_medica.observaciones IS 'Observaciones generales del médico';
COMMENT ON COLUMN disponibilidad_medica.fecha_creacion IS 'Fecha de creación del registro';
COMMENT ON COLUMN disponibilidad_medica.fecha_envio IS 'Fecha en que el médico envió la disponibilidad';
COMMENT ON COLUMN disponibilidad_medica.fecha_revision IS 'Fecha en que el coordinador marcó como revisado';

-- ============================================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- ============================================================
CREATE INDEX idx_disponibilidad_periodo ON disponibilidad_medica(periodo);
CREATE INDEX idx_disponibilidad_estado ON disponibilidad_medica(estado);
CREATE INDEX idx_disponibilidad_pers ON disponibilidad_medica(id_pers);
CREATE INDEX idx_disponibilidad_servicio ON disponibilidad_medica(id_servicio);
CREATE INDEX idx_disponibilidad_pers_periodo ON disponibilidad_medica(id_pers, periodo);
CREATE INDEX idx_disponibilidad_estado_periodo ON disponibilidad_medica(estado, periodo);


-- ================================================================
-- TABLA 2: detalle_disponibilidad
-- ================================================================
-- Descripción:
-- Almacena los turnos específicos por día de la disponibilidad.
-- Cada registro representa un turno en una fecha específica:
--   - M (Mañana): 4h (régimen 728/CAS) o 6h (régimen Locador)
--   - T (Tarde): 4h (régimen 728/CAS) o 6h (régimen Locador)
--   - MT (Turno Completo): 8h (régimen 728/CAS) o 12h (régimen Locador)
-- ================================================================

CREATE TABLE IF NOT EXISTS detalle_disponibilidad (
    -- ============================================================
    -- IDENTIFICADORES
    -- ============================================================
    id_detalle BIGSERIAL PRIMARY KEY,

    -- ============================================================
    -- RELACIONES
    -- ============================================================
    id_disponibilidad BIGINT NOT NULL REFERENCES disponibilidad_medica(id_disponibilidad)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    -- ============================================================
    -- DATOS DEL TURNO
    -- ============================================================
    fecha DATE NOT NULL,
    turno VARCHAR(2) NOT NULL, -- M (Mañana), T (Tarde), MT (Completo)
    horas DECIMAL(4,2) NOT NULL,

    -- ============================================================
    -- AJUSTES DEL COORDINADOR
    -- ============================================================
    ajustado_por BIGINT REFERENCES dim_personal_cnt(id_pers)
        ON DELETE SET NULL
        ON UPDATE CASCADE,
    observacion_ajuste TEXT,

    -- ============================================================
    -- AUDITORÍA
    -- ============================================================
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- ============================================================
    -- CONSTRAINTS
    -- ============================================================
    CONSTRAINT ck_turno CHECK (turno IN ('M', 'T', 'MT')),
    CONSTRAINT ck_horas_positivas CHECK (horas > 0),
    CONSTRAINT uq_detalle_fecha UNIQUE(id_disponibilidad, fecha)
);

-- ============================================================
-- COMENTARIOS DE LA TABLA
-- ============================================================
COMMENT ON TABLE detalle_disponibilidad IS 'Detalle de turnos por día de la disponibilidad médica';
COMMENT ON COLUMN detalle_disponibilidad.id_detalle IS 'Identificador único del detalle';
COMMENT ON COLUMN detalle_disponibilidad.id_disponibilidad IS 'ID de la disponibilidad padre';
COMMENT ON COLUMN detalle_disponibilidad.fecha IS 'Fecha del turno';
COMMENT ON COLUMN detalle_disponibilidad.turno IS 'Tipo de turno: M (Mañana), T (Tarde), MT (Completo)';
COMMENT ON COLUMN detalle_disponibilidad.horas IS 'Horas del turno según régimen laboral';
COMMENT ON COLUMN detalle_disponibilidad.ajustado_por IS 'ID del coordinador que ajustó el turno (NULL si no fue ajustado)';
COMMENT ON COLUMN detalle_disponibilidad.observacion_ajuste IS 'Observación del ajuste realizado por el coordinador';

-- ============================================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- ============================================================
CREATE INDEX idx_detalle_disponibilidad ON detalle_disponibilidad(id_disponibilidad);
CREATE INDEX idx_detalle_fecha ON detalle_disponibilidad(fecha);
CREATE INDEX idx_detalle_ajustado_por ON detalle_disponibilidad(ajustado_por);


-- ================================================================
-- DATOS INICIALES (OPCIONAL - PARA TESTING)
-- ================================================================
-- Los siguientes INSERT son opcionales y pueden usarse para pruebas
-- ================================================================

-- Ejemplo comentado - Descomentar si se desea crear datos de prueba
/*
-- Ejemplo: Médico con régimen 728 crea disponibilidad para Enero 2026
-- INSERT INTO disponibilidad_medica (id_pers, id_servicio, periodo, estado, total_horas, horas_requeridas)
-- VALUES (1, 1, '202601', 'BORRADOR', 0, 150.00);

-- Ejemplo: Detalles de turnos para el médico (id_disponibilidad = 1)
-- INSERT INTO detalle_disponibilidad (id_disponibilidad, fecha, turno, horas)
-- VALUES
--     (1, '2026-01-02', 'M', 4.00),
--     (1, '2026-01-02', 'T', 4.00),
--     (1, '2026-01-03', 'MT', 8.00);
*/


-- ================================================================
-- VERIFICACIÓN DE CREACIÓN
-- ================================================================
-- Consulta para verificar que las tablas se crearon correctamente
-- ================================================================

DO $$
DECLARE
    tabla1_existe BOOLEAN;
    tabla2_existe BOOLEAN;
BEGIN
    -- Verificar disponibilidad_medica
    SELECT EXISTS (
        SELECT FROM pg_tables
        WHERE schemaname = 'public'
        AND tablename = 'disponibilidad_medica'
    ) INTO tabla1_existe;

    -- Verificar detalle_disponibilidad
    SELECT EXISTS (
        SELECT FROM pg_tables
        WHERE schemaname = 'public'
        AND tablename = 'detalle_disponibilidad'
    ) INTO tabla2_existe;

    -- Mostrar resultado
    IF tabla1_existe AND tabla2_existe THEN
        RAISE NOTICE '✓ Tablas creadas exitosamente:';
        RAISE NOTICE '  - disponibilidad_medica';
        RAISE NOTICE '  - detalle_disponibilidad';
    ELSE
        IF NOT tabla1_existe THEN
            RAISE WARNING '✗ Falta crear tabla: disponibilidad_medica';
        END IF;
        IF NOT tabla2_existe THEN
            RAISE WARNING '✗ Falta crear tabla: detalle_disponibilidad';
        END IF;
    END IF;
END $$;


-- ================================================================
-- FIN DEL SCRIPT
-- ================================================================
-- Para ejecutar este script:
--
-- PGPASSWORD=Essalud2025 psql -h 10.0.89.241 -U postgres -d maestro_cenate \
--   -f spec/scripts/005_disponibilidad_medica.sql
-- ================================================================
