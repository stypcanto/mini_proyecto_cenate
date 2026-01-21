-- ========================================================================
-- Script: 038_teleecg_campos_evaluacion_v3.sql
-- Propósito: Agregar campos de evaluación médica para ML training
-- Versión: v3.0.0
-- Fecha: 2026-01-20
-- Autor: Styp Canto Rondón
-- ========================================================================
-- Descripción:
-- Agrega campos para que médicos de CENATE evalúen ECGs como NORMAL o ANORMAL
-- Incluye: evaluacion, descripcion_evaluacion, usuario_evaluador, fecha_evaluacion
-- Estos datos se usarán como dataset de entrenamiento para modelos de ML
-- ========================================================================

-- 1. Agregar columna: evaluacion (ENUM: NORMAL, ANORMAL, SIN_EVALUAR)
ALTER TABLE tele_ecg_imagenes
ADD COLUMN IF NOT EXISTS evaluacion VARCHAR(20) DEFAULT 'SIN_EVALUAR';

-- Agregar comentario
COMMENT ON COLUMN tele_ecg_imagenes.evaluacion IS
'Evaluación médica del ECG: NORMAL, ANORMAL, SIN_EVALUAR. Dataset para ML training.';

-- 2. Agregar columna: descripcion_evaluacion (Texto con explicación)
ALTER TABLE tele_ecg_imagenes
ADD COLUMN IF NOT EXISTS descripcion_evaluacion TEXT;

COMMENT ON COLUMN tele_ecg_imagenes.descripcion_evaluacion IS
'Descripción de POR QUÉ se marcó como NORMAL o ANORMAL. Ej: "Ritmo sinusal regular, sin arritmias". Máx 1000 caracteres.';

-- 3. Agregar columna: id_usuario_evaluador (FK a dim_usuarios)
ALTER TABLE tele_ecg_imagenes
ADD COLUMN IF NOT EXISTS id_usuario_evaluador BIGINT;

-- FK constraint (safe addition)
DO $$
BEGIN
  BEGIN
    ALTER TABLE tele_ecg_imagenes
    ADD CONSTRAINT fk_tele_ecg_usuario_evaluador
    FOREIGN KEY (id_usuario_evaluador)
    REFERENCES dim_usuarios(id_user)
    ON DELETE SET NULL
    ON UPDATE RESTRICT;
  EXCEPTION WHEN duplicate_object THEN
    RAISE NOTICE 'Constraint fk_tele_ecg_usuario_evaluador already exists';
  END;
END $$;

COMMENT ON COLUMN tele_ecg_imagenes.id_usuario_evaluador IS
'Usuario (médico) que realizó la evaluación. FK a dim_usuarios.id_user.';

-- 4. Agregar columna: fecha_evaluacion (Timestamp)
ALTER TABLE tele_ecg_imagenes
ADD COLUMN IF NOT EXISTS fecha_evaluacion TIMESTAMP;

COMMENT ON COLUMN tele_ecg_imagenes.fecha_evaluacion IS
'Fecha y hora cuando el médico completó la evaluación.';

-- 5. Crear índice para búsquedas rápidas por evaluación
CREATE INDEX IF NOT EXISTS idx_tele_ecg_evaluacion
ON tele_ecg_imagenes(evaluacion, fecha_evaluacion DESC);

CREATE INDEX IF NOT EXISTS idx_tele_ecg_usuario_evaluador
ON tele_ecg_imagenes(id_usuario_evaluador);

-- 6. Crear vista para análisis de evaluaciones
CREATE OR REPLACE VIEW vw_tele_ecg_evaluaciones_estadisticas AS
SELECT
    evaluacion,
    COUNT(*) as cantidad,
    COUNT(CASE WHEN evaluacion = 'SIN_EVALUAR' THEN 1 END) as sin_evaluar,
    COUNT(CASE WHEN evaluacion = 'NORMAL' THEN 1 END) as normales,
    COUNT(CASE WHEN evaluacion = 'ANORMAL' THEN 1 END) as anormales,
    AVG(LENGTH(descripcion_evaluacion)) as promedio_descripcion_chars
FROM tele_ecg_imagenes
WHERE stat_imagen = 'A' AND fecha_expiracion >= CURRENT_TIMESTAMP
GROUP BY evaluacion;

COMMENT ON VIEW vw_tele_ecg_evaluaciones_estadisticas IS
'Estadísticas de evaluaciones: cantidad por tipo y promedio de descripción. Usada para ML analytics.';

-- 7. Crear vista para dataset de ML (imagen + evaluación + descripción)
CREATE OR REPLACE VIEW vw_tele_ecg_dataset_ml AS
SELECT
    t.id_imagen,
    t.num_doc_paciente,
    t.nombres_paciente || ' ' || t.apellidos_paciente as nombre_completo,
    t.codigo_ipress,
    t.nombre_ipress,
    t.evaluacion,
    t.descripcion_evaluacion,
    u.name_user as evaluado_por,
    t.fecha_evaluacion,
    t.storage_ruta,
    t.sha256,
    EXTRACT(DAY FROM (t.fecha_evaluacion - t.fecha_envio)) as dias_hasta_evaluacion
FROM tele_ecg_imagenes t
LEFT JOIN dim_usuarios u ON t.id_usuario_evaluador = u.id_user
WHERE t.evaluacion IN ('NORMAL', 'ANORMAL')
AND t.stat_imagen = 'A'
AND t.descripcion_evaluacion IS NOT NULL
ORDER BY t.fecha_evaluacion DESC;

COMMENT ON VIEW vw_tele_ecg_dataset_ml IS
'Dataset completo para ML: imagen, etiqueta (NORMAL/ANORMAL), descripción y metadatos. +100 registros = listo para entrenar modelo.';

-- 8. Crear tabla de log para auditoría de cambios de evaluación
CREATE TABLE IF NOT EXISTS tele_ecg_evaluacion_log (
    id_log BIGSERIAL PRIMARY KEY,
    id_imagen BIGINT NOT NULL REFERENCES tele_ecg_imagenes(id_imagen) ON DELETE CASCADE,
    evaluacion_anterior VARCHAR(20),
    evaluacion_nueva VARCHAR(20) NOT NULL,
    descripcion_anterior TEXT,
    descripcion_nueva TEXT,
    id_usuario_cambio BIGINT REFERENCES dim_usuarios(id_user) ON DELETE SET NULL,
    fecha_cambio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_origen VARCHAR(45)
);

CREATE INDEX idx_tele_ecg_evaluacion_log_imagen ON tele_ecg_evaluacion_log(id_imagen);
CREATE INDEX idx_tele_ecg_evaluacion_log_fecha ON tele_ecg_evaluacion_log(fecha_cambio DESC);

-- 9. Agregar permisos MBAC para la nueva acción "evaluar"
-- NOTA: Ejecutar manualmente según configuración de tu sistema

-- ========================================================================
-- Verificación
-- ========================================================================
-- SELECT column_name, data_type FROM information_schema.columns
-- WHERE table_name = 'tele_ecg_imagenes' AND column_name IN ('evaluacion', 'descripcion_evaluacion', 'id_usuario_evaluador', 'fecha_evaluacion');
--
-- SELECT * FROM vw_tele_ecg_dataset_ml LIMIT 5;
-- ========================================================================
