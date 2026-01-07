-- ============================================================================
-- Script SQL: Módulo Lineamientos e Información IPRESS
-- ============================================================================
-- Fecha: 2026-01-06
-- Descripción: Creación de tablas para el módulo de Lineamientos y su
--              relación con Información IPRESS
-- Autor: Ing. Styp Canto Rondón
-- ============================================================================

-- ============================================================================
-- 1. Tabla: lineamiento
-- ============================================================================
-- Descripción: Almacena los lineamientos técnicos y operativos del CENATE
CREATE TABLE IF NOT EXISTS lineamiento (
    id_lineamiento SERIAL PRIMARY KEY,
    codigo VARCHAR(50) NOT NULL UNIQUE,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    categoria VARCHAR(100) NOT NULL,
    version VARCHAR(20),
    fecha_aprobacion TIMESTAMP,
    aprobado_por VARCHAR(255),
    estado VARCHAR(50) NOT NULL DEFAULT 'ACTIVO',
    url_documento VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Índices para búsquedas frecuentes
    CONSTRAINT check_estado_lineamiento CHECK (estado IN ('ACTIVO', 'INACTIVO', 'OBSOLETO'))
);

CREATE INDEX idx_lineamiento_codigo ON lineamiento(codigo);
CREATE INDEX idx_lineamiento_categoria ON lineamiento(categoria);
CREATE INDEX idx_lineamiento_estado ON lineamiento(estado);
CREATE INDEX idx_lineamiento_created_at ON lineamiento(created_at DESC);

-- ============================================================================
-- 2. Tabla: informacion_ipress
-- ============================================================================
-- Descripción: Almacena la información específica de cada IPRESS según lineamientos
CREATE TABLE IF NOT EXISTS informacion_ipress (
    id_informacion_ipress SERIAL PRIMARY KEY,
    id_lineamiento INTEGER NOT NULL,
    id_ipress BIGINT NOT NULL,
    contenido TEXT,
    requisitos TEXT,
    fecha_implementacion TIMESTAMP,
    estado_cumplimiento VARCHAR(50),
    observaciones TEXT,
    responsable VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Claves foráneas
    CONSTRAINT fk_informacion_lineamiento FOREIGN KEY (id_lineamiento)
        REFERENCES lineamiento(id_lineamiento) ON DELETE CASCADE,
    CONSTRAINT fk_informacion_ipress FOREIGN KEY (id_ipress)
        REFERENCES dim_ipress(id_ipress) ON DELETE CASCADE,

    -- Restricciones de integridad
    CONSTRAINT check_estado_cumplimiento CHECK (estado_cumplimiento IN ('CUMPLE', 'NO_CUMPLE', 'EN_PROGRESO', 'PENDIENTE')),

    -- Índices para búsquedas frecuentes
    UNIQUE (id_lineamiento, id_ipress)
);

CREATE INDEX idx_informacion_ipress_lineamiento ON informacion_ipress(id_lineamiento);
CREATE INDEX idx_informacion_ipress_ipress ON informacion_ipress(id_ipress);
CREATE INDEX idx_informacion_ipress_cumplimiento ON informacion_ipress(estado_cumplimiento);
CREATE INDEX idx_informacion_ipress_created_at ON informacion_ipress(created_at DESC);

-- ============================================================================
-- 3. Insertar datos iniciales en lineamiento (opcional)
-- ============================================================================
INSERT INTO lineamiento (codigo, titulo, descripcion, categoria, version, estado, aprobado_por)
VALUES
    ('LIN-001', 'Directrices de Medicamentos Essentials',
     'Estándares para disponibilidad de medicamentos en todas las IPRESS',
     'CLÍNICO', '1.0', 'ACTIVO', 'Administración CENATE'),
    ('LIN-002', 'Protocolo de Exámenes de Laboratorio',
     'Normas técnicas para realización de exámenes en CENATE',
     'TÉCNICO', '1.0', 'ACTIVO', 'Administración CENATE'),
    ('LIN-003', 'Disponibilidad de Procedimientos Especializados',
     'Directrices sobre procedimientos que deben estar disponibles por nivel',
     'OPERATIVO', '1.0', 'ACTIVO', 'Administración CENATE'),
    ('LIN-004', 'Interconsultas por Especialidad',
     'Regulaciones sobre interconsultas telemédicas por especialidad',
     'CLÍNICO', '1.0', 'ACTIVO', 'Administración CENATE'),
    ('LIN-005', 'Diagnóstico por Imagen - Ecografías',
     'Protocolos de disponibilidad y referencias para ecografías',
     'TÉCNICO', '1.0', 'ACTIVO', 'Administración CENATE')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 4. Agregar permisos MBAC para el módulo (si aplica)
-- ============================================================================
-- Nota: Los permisos se deben configurar mediante la aplicación a través
-- de la tabla dim_modulos_sistema y dim_paginas_modulo

-- ============================================================================
-- 5. Vistas útiles (opcional)
-- ============================================================================

-- Vista: Resumen de cumplimiento por IPRESS
CREATE OR REPLACE VIEW v_cumplimiento_ipress AS
SELECT
    ii.id_ipress,
    di.desc_ipress,
    COUNT(CASE WHEN ii.estado_cumplimiento = 'CUMPLE' THEN 1 END) as cumple_count,
    COUNT(CASE WHEN ii.estado_cumplimiento = 'NO_CUMPLE' THEN 1 END) as no_cumple_count,
    COUNT(CASE WHEN ii.estado_cumplimiento IN ('EN_PROGRESO', 'PENDIENTE') THEN 1 END) as pendiente_count,
    COUNT(*) as total_lineamientos,
    ROUND(100.0 * COUNT(CASE WHEN ii.estado_cumplimiento = 'CUMPLE' THEN 1 END) / COUNT(*), 2) as porcentaje_cumple
FROM informacion_ipress ii
JOIN dim_ipress di ON ii.id_ipress = di.id_ipress
GROUP BY ii.id_ipress, di.desc_ipress
ORDER BY porcentaje_cumple DESC;

-- Vista: Lineamientos por estado
CREATE OR REPLACE VIEW v_lineamientos_por_estado AS
SELECT
    estado,
    categoria,
    COUNT(*) as cantidad,
    MAX(updated_at) as ultima_actualizacion
FROM lineamiento
GROUP BY estado, categoria
ORDER BY cantidad DESC, estado;

-- ============================================================================
-- Fin del script
-- ============================================================================
