-- ============================================================
-- SCRIPT 013 FINAL: MÓDULO TELEEKGS
-- ============================================================
-- Creado: 2026-01-13
-- Correcciones: Usar nombres correctos del schema maestro_cenate
-- Columnas: id_user (no id), id_ipress (no id)
-- Aplicar en: maestro_cenate (PostgreSQL 14+)

-- ============================================================
-- 1. CREAR TABLA: tele_ecg_imagenes
-- ============================================================

CREATE TABLE IF NOT EXISTS tele_ecg_imagenes (
    id_imagen SERIAL PRIMARY KEY,

    -- Información del Paciente
    num_doc_paciente VARCHAR(20) NOT NULL,
    nombres_paciente VARCHAR(100),
    apellidos_paciente VARCHAR(100),
    id_usuario_paciente BIGINT REFERENCES dim_usuarios(id_user) ON DELETE SET NULL,

    -- Contenido del Archivo (BYTEA)
    contenido_imagen BYTEA NOT NULL,
    nombre_archivo VARCHAR(255) NOT NULL,
    tipo_contenido VARCHAR(50) NOT NULL,
    tamanio_bytes BIGINT CHECK (tamanio_bytes <= 5242880),
    hash_archivo VARCHAR(64),

    -- Información de IPRESS Origen
    id_ipress_origen BIGINT NOT NULL REFERENCES dim_ipress(id_ipress),
    codigo_ipress VARCHAR(20),
    nombre_ipress VARCHAR(255),

    -- Receptor/Procesador
    id_usuario_receptor BIGINT REFERENCES dim_usuarios(id_user) ON DELETE SET NULL,

    -- Fechas de Control
    fecha_envio TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_recepcion TIMESTAMP,
    fecha_expiracion TIMESTAMP NOT NULL,

    -- Estado del ECG
    estado VARCHAR(20) NOT NULL
        CHECK (estado IN ('PENDIENTE', 'PROCESADA', 'RECHAZADA', 'VINCULADA'))
        DEFAULT 'PENDIENTE',

    motivo_rechazo TEXT,
    observaciones TEXT,

    -- Control
    stat_imagen CHAR(1) NOT NULL DEFAULT 'A'
        CHECK (stat_imagen IN ('A', 'I')),

    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT REFERENCES dim_usuarios(id_user),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by BIGINT REFERENCES dim_usuarios(id_user),

    -- Auditoría
    ip_origen VARCHAR(45),
    navegador VARCHAR(255),
    ruta_acceso VARCHAR(255)
);

COMMENT ON TABLE tele_ecg_imagenes IS 'Almacena electrocardiogramas enviados por IPRESS externas con retención de 30 días';
COMMENT ON COLUMN tele_ecg_imagenes.contenido_imagen IS 'Imagen JPEG o PNG almacenada como bytes (máximo 5MB)';
COMMENT ON COLUMN tele_ecg_imagenes.fecha_expiracion IS 'Fecha automática + 30 días desde fecha_envio; se marca como inactivo (I) si vence';

-- ============================================================
-- 2. CREAR TABLA: tele_ecg_auditoria
-- ============================================================

CREATE TABLE IF NOT EXISTS tele_ecg_auditoria (
    id_auditoria SERIAL PRIMARY KEY,

    id_imagen BIGINT NOT NULL REFERENCES tele_ecg_imagenes(id_imagen) ON DELETE CASCADE,

    -- Usuario
    id_usuario BIGINT NOT NULL REFERENCES dim_usuarios(id_user),
    nombre_usuario VARCHAR(100),
    rol_usuario VARCHAR(50),

    -- Acción
    accion VARCHAR(50) NOT NULL
        CHECK (accion IN ('CARGADA', 'DESCARGADA', 'PROCESADA', 'RECHAZADA',
                         'VINCULADA', 'VISUALIZADA', 'MODIFICADA', 'ELIMINADA')),

    descripcion TEXT,

    -- Contexto
    ip_usuario VARCHAR(45),
    navegador VARCHAR(255),
    ruta_solicitada VARCHAR(255),

    -- Tiempo
    fecha_accion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Estado
    resultado VARCHAR(20) CHECK (resultado IN ('EXITOSA', 'FALLIDA', 'SOSPECHOSA')),
    codigo_error VARCHAR(100)
);

COMMENT ON TABLE tele_ecg_auditoria IS 'Registro de auditoría detallado de todos los accesos y cambios en ECGs';

-- ============================================================
-- 3. CREAR TABLA: tele_ecg_estadisticas
-- ============================================================

CREATE TABLE IF NOT EXISTS tele_ecg_estadisticas (
    id_estadistica SERIAL PRIMARY KEY,

    fecha_dia DATE NOT NULL,
    fecha_hora TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Estadísticas Generales
    total_imagenes_cargadas INTEGER DEFAULT 0,
    total_imagenes_procesadas INTEGER DEFAULT 0,
    total_imagenes_rechazadas INTEGER DEFAULT 0,
    total_imagenes_vinculadas INTEGER DEFAULT 0,

    -- Por IPRESS
    id_ipress BIGINT REFERENCES dim_ipress(id_ipress),
    codigo_ipress VARCHAR(20),
    nombre_ipress VARCHAR(255),
    imagenes_por_ipress INTEGER DEFAULT 0,

    -- Volumen de Datos
    tamanio_total_gb DECIMAL(10,2) DEFAULT 0,
    tamanio_promedio_mb DECIMAL(10,2) DEFAULT 0,
    tamanio_maximo_mb DECIMAL(10,2) DEFAULT 0,
    tamanio_minimo_mb DECIMAL(10,2) DEFAULT 0,

    -- Tiempos
    tiempo_promedio_procesamiento_minutos DECIMAL(10,2),
    tiempo_maximo_procesamiento_minutos DECIMAL(10,2),

    -- Calidad
    tasa_rechazo_porcentaje DECIMAL(5,2) DEFAULT 0,
    tasa_vinculacion_porcentaje DECIMAL(5,2) DEFAULT 0,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE tele_ecg_estadisticas IS 'Estadísticas y métricas diarias de TeleEKG para dashboards';

-- ============================================================
-- 4. CREAR ÍNDICES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_tele_ecg_num_doc
    ON tele_ecg_imagenes(num_doc_paciente);

CREATE INDEX IF NOT EXISTS idx_tele_ecg_estado
    ON tele_ecg_imagenes(estado);

CREATE INDEX IF NOT EXISTS idx_tele_ecg_fecha_expiracion
    ON tele_ecg_imagenes(fecha_expiracion);

CREATE INDEX IF NOT EXISTS idx_tele_ecg_ipress
    ON tele_ecg_imagenes(id_ipress_origen);

CREATE INDEX IF NOT EXISTS idx_tele_ecg_compuesto_busqueda
    ON tele_ecg_imagenes(num_doc_paciente, estado, fecha_envio DESC);

CREATE INDEX IF NOT EXISTS idx_tele_ecg_limpieza
    ON tele_ecg_imagenes(stat_imagen, fecha_expiracion)
    WHERE stat_imagen = 'A';

CREATE INDEX IF NOT EXISTS idx_tele_ecg_auditoria_imagen
    ON tele_ecg_auditoria(id_imagen);

CREATE INDEX IF NOT EXISTS idx_tele_ecg_auditoria_usuario
    ON tele_ecg_auditoria(id_usuario);

CREATE INDEX IF NOT EXISTS idx_tele_ecg_auditoria_fecha
    ON tele_ecg_auditoria(fecha_accion DESC);

-- ============================================================
-- 5. CREAR VISTAS ÚTILES
-- ============================================================

CREATE OR REPLACE VIEW v_teleekgs_recientes AS
SELECT
    te.id_imagen,
    te.num_doc_paciente,
    te.nombres_paciente,
    te.apellidos_paciente,
    te.nombre_ipress,
    te.estado,
    te.fecha_envio,
    te.fecha_expiracion,
    CASE
        WHEN te.fecha_expiracion < CURRENT_TIMESTAMP THEN 'VENCIDA'
        WHEN te.fecha_expiracion < CURRENT_TIMESTAMP + INTERVAL '3 days' THEN 'PRÓX_A_VENCER'
        ELSE 'VIGENTE'
    END as vigencia,
    te.tamanio_bytes,
    (SELECT COUNT(*) FROM tele_ecg_auditoria WHERE id_imagen = te.id_imagen) as total_accesos
FROM tele_ecg_imagenes te
WHERE te.stat_imagen = 'A'
ORDER BY te.fecha_envio DESC;

CREATE OR REPLACE VIEW v_teleekgs_por_ipress AS
SELECT
    te.id_ipress_origen,
    te.codigo_ipress,
    te.nombre_ipress,
    COUNT(*) as total_imagenes,
    COUNT(CASE WHEN te.estado = 'PENDIENTE' THEN 1 END) as pendientes,
    COUNT(CASE WHEN te.estado = 'PROCESADA' THEN 1 END) as procesadas,
    COUNT(CASE WHEN te.estado = 'RECHAZADA' THEN 1 END) as rechazadas,
    COUNT(CASE WHEN te.estado = 'VINCULADA' THEN 1 END) as vinculadas,
    ROUND(100.0 * COUNT(CASE WHEN te.estado = 'RECHAZADA' THEN 1 END) / COUNT(*), 2) as tasa_rechazo_pct,
    SUM(te.tamanio_bytes) / 1024 / 1024 as tamanio_total_mb,
    MAX(te.fecha_envio) as ultima_carga
FROM tele_ecg_imagenes te
WHERE te.stat_imagen = 'A'
GROUP BY te.id_ipress_origen, te.codigo_ipress, te.nombre_ipress
ORDER BY total_imagenes DESC;

CREATE OR REPLACE VIEW v_teleekgs_proximas_vencer AS
SELECT
    id_imagen,
    num_doc_paciente,
    nombres_paciente,
    apellidos_paciente,
    nombre_ipress,
    estado,
    fecha_envio,
    fecha_expiracion,
    EXTRACT(DAY FROM fecha_expiracion - CURRENT_TIMESTAMP) as dias_restantes,
    tamanio_bytes
FROM tele_ecg_imagenes
WHERE stat_imagen = 'A'
  AND fecha_expiracion BETWEEN CURRENT_TIMESTAMP AND CURRENT_TIMESTAMP + INTERVAL '3 days'
ORDER BY fecha_expiracion ASC;

-- ============================================================
-- 6. CREAR TRIGGERS Y FUNCIONES
-- ============================================================

CREATE OR REPLACE FUNCTION fn_update_timestamp_teleekgs()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_timestamp_teleekgs
BEFORE UPDATE ON tele_ecg_imagenes
FOR EACH ROW
EXECUTE FUNCTION fn_update_timestamp_teleekgs();

CREATE OR REPLACE FUNCTION fn_validate_fecha_expiracion()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.fecha_expiracion IS NULL THEN
        NEW.fecha_expiracion = NEW.fecha_envio + INTERVAL '30 days';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_fecha_expiracion
BEFORE INSERT ON tele_ecg_imagenes
FOR EACH ROW
EXECUTE FUNCTION fn_validate_fecha_expiracion();

-- ============================================================
-- 7. SENTENCIAS DE VALIDACIÓN
-- ============================================================

SELECT
    'tele_ecg_imagenes' as tabla,
    COUNT(*) as columnas
FROM information_schema.columns
WHERE table_name = 'tele_ecg_imagenes'
UNION ALL
SELECT
    'tele_ecg_auditoria' as tabla,
    COUNT(*) as columnas
FROM information_schema.columns
WHERE table_name = 'tele_ecg_auditoria'
UNION ALL
SELECT
    'tele_ecg_estadisticas' as tabla,
    COUNT(*) as columnas
FROM information_schema.columns
WHERE table_name = 'tele_ecg_estadisticas';

SELECT
    indexname,
    tablename
FROM pg_indexes
WHERE tablename LIKE 'tele_ecg%'
ORDER BY tablename, indexname;

-- ============================================================
-- FIN DEL SCRIPT
-- ============================================================
