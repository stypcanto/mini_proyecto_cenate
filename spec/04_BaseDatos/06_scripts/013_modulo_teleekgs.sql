-- ============================================================
-- SCRIPT 013: MÓDULO TELEEKGS - Electrocardiogramas en BD
-- ============================================================
-- Creado: 2026-01-13
-- Descripción: Tablas, índices y permisos MBAC para TeleEKG
-- Tipo: DDL + DML (creación de estructura y datos)
-- Aplicar en: maestro_cenate (PostgreSQL 14+)

-- ============================================================
-- 1. CREAR TABLA: tele_ecg_imagenes
-- ============================================================
-- Almacena las imágenes ECG en formato BYTEA (bytes)
-- Retención: 30 días automáticamente (limpieza diaria 2am)

CREATE TABLE IF NOT EXISTS tele_ecg_imagenes (
    id_imagen SERIAL PRIMARY KEY,

    -- Información del Paciente
    num_doc_paciente VARCHAR(20) NOT NULL,
    nombres_paciente VARCHAR(100),
    apellidos_paciente VARCHAR(100),
    id_usuario_paciente BIGINT REFERENCES usuarios(id) ON DELETE SET NULL,

    -- Contenido del Archivo (BYTEA = Binary Large Object)
    contenido_imagen BYTEA NOT NULL,                -- Imagen JPEG/PNG como bytes
    nombre_archivo VARCHAR(255) NOT NULL,           -- Ej: paciente_12345678_20260113.jpg
    tipo_contenido VARCHAR(50) NOT NULL,            -- image/jpeg, image/png
    tamanio_bytes BIGINT CHECK (tamanio_bytes <= 5242880), -- Máximo 5MB
    hash_archivo VARCHAR(64),                       -- SHA256 para integridad

    -- Información de IPRESS Origen
    id_ipress_origen BIGINT NOT NULL REFERENCES ipress(id),
    codigo_ipress VARCHAR(20),
    nombre_ipress VARCHAR(255),

    -- Receptor/Procesador (Personal CENATE)
    id_usuario_receptor BIGINT REFERENCES usuarios(id) ON DELETE SET NULL,

    -- Fechas de Control
    fecha_envio TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_recepcion TIMESTAMP,
    fecha_expiracion TIMESTAMP NOT NULL,            -- Automáticamente 30 días desde envío

    -- Estado del ECG
    estado VARCHAR(20) NOT NULL
        CHECK (estado IN ('PENDIENTE', 'PROCESADA', 'RECHAZADA', 'VINCULADA'))
        DEFAULT 'PENDIENTE',

    motivo_rechazo TEXT,
    observaciones TEXT,

    -- Control de Auditoría
    stat_imagen CHAR(1) NOT NULL DEFAULT 'A'       -- A=Activo, I=Inactivo (limpieza)
        CHECK (stat_imagen IN ('A', 'I')),

    -- Timestamps de Sistema
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT REFERENCES usuarios(id),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by BIGINT REFERENCES usuarios(id),

    -- Columnas para Auditoría
    ip_origen VARCHAR(45),                          -- IPv4 o IPv6
    navegador VARCHAR(255),
    ruta_acceso VARCHAR(255)
);

-- Comentarios en tabla
COMMENT ON TABLE tele_ecg_imagenes IS 'Almacena electrocardiogramas enviados por IPRESS externas con retención de 30 días';
COMMENT ON COLUMN tele_ecg_imagenes.contenido_imagen IS 'Imagen JPEG o PNG almacenada como bytes (máximo 5MB)';
COMMENT ON COLUMN tele_ecg_imagenes.hash_archivo IS 'SHA256 del archivo para verificación de integridad';
COMMENT ON COLUMN tele_ecg_imagenes.fecha_expiracion IS 'Fecha automática + 30 días desde fecha_envio; se marca como inactivo (I) si vence';
COMMENT ON COLUMN tele_ecg_imagenes.stat_imagen IS 'Estado: A=Activo | I=Inactivo (para limpieza de datos vencidos)';

-- ============================================================
-- 2. CREAR TABLA: tele_ecg_auditoria
-- ============================================================
-- Log detallado de todos los accesos y cambios en TeleEKG

CREATE TABLE IF NOT EXISTS tele_ecg_auditoria (
    id_auditoria SERIAL PRIMARY KEY,

    id_imagen BIGINT NOT NULL REFERENCES tele_ecg_imagenes(id_imagen) ON DELETE CASCADE,

    -- Usuario que realizó la acción
    id_usuario BIGINT NOT NULL REFERENCES usuarios(id),
    nombre_usuario VARCHAR(100),
    rol_usuario VARCHAR(50),

    -- Acción realizada
    accion VARCHAR(50) NOT NULL
        CHECK (accion IN ('CARGADA', 'DESCARGADA', 'PROCESADA', 'RECHAZADA',
                         'VINCULADA', 'VISUALIZADA', 'MODIFICADA', 'ELIMINADA')),

    -- Descripción detallada
    descripcion TEXT,

    -- Contexto de la Acción
    ip_usuario VARCHAR(45),
    navegador VARCHAR(255),
    ruta_solicitada VARCHAR(255),

    -- Control de Tiempo
    fecha_accion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Estado de Seguridad
    resultado VARCHAR(20) CHECK (resultado IN ('EXITOSA', 'FALLIDA', 'SOSPECHOSA')),
    codigo_error VARCHAR(100)
);

COMMENT ON TABLE tele_ecg_auditoria IS 'Registro de auditoría detallado de todos los accesos y cambios en ECGs';
COMMENT ON COLUMN tele_ecg_auditoria.accion IS 'Tipo de acción realizada sobre la imagen ECG';
COMMENT ON COLUMN tele_ecg_auditoria.resultado IS 'Resultado de la acción (exitosa/fallida/sospechosa)';

-- ============================================================
-- 3. CREAR TABLA: tele_ecg_estadisticas
-- ============================================================
-- Métricas y resúmenes para dashboards (actualizado cada hora)

CREATE TABLE IF NOT EXISTS tele_ecg_estadisticas (
    id_estadistica SERIAL PRIMARY KEY,

    -- Período de Datos
    fecha_dia DATE NOT NULL,
    fecha_hora TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Estadísticas Generales
    total_imagenes_cargadas INTEGER DEFAULT 0,
    total_imagenes_procesadas INTEGER DEFAULT 0,
    total_imagenes_rechazadas INTEGER DEFAULT 0,
    total_imagenes_vinculadas INTEGER DEFAULT 0,

    -- Por IPRESS
    id_ipress BIGINT REFERENCES ipress(id),
    codigo_ipress VARCHAR(20),
    nombre_ipress VARCHAR(255),
    imagenes_por_ipress INTEGER DEFAULT 0,

    -- Volumen de Datos
    tamanio_total_gb DECIMAL(10,2) DEFAULT 0,
    tamanio_promedio_mb DECIMAL(10,2) DEFAULT 0,
    tamanio_maximo_mb DECIMAL(10,2) DEFAULT 0,
    tamanio_minimo_mb DECIMAL(10,2) DEFAULT 0,

    -- Tiempos de Procesamiento
    tiempo_promedio_procesamiento_minutos DECIMAL(10,2),
    tiempo_maximo_procesamiento_minutos DECIMAL(10,2),

    -- Calidad
    tasa_rechazo_porcentaje DECIMAL(5,2) DEFAULT 0,
    tasa_vinculacion_porcentaje DECIMAL(5,2) DEFAULT 0,

    -- Timestamp
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE tele_ecg_estadisticas IS 'Estadísticas y métricas diarias de TeleEKG para dashboards';

-- ============================================================
-- 4. CREAR ÍNDICES - Optimización de Búsquedas
-- ============================================================

-- Índice en número de documento (búsqueda frecuente)
CREATE INDEX IF NOT EXISTS idx_tele_ecg_num_doc
    ON tele_ecg_imagenes(num_doc_paciente);

-- Índice en estado (filtrado por estado)
CREATE INDEX IF NOT EXISTS idx_tele_ecg_estado
    ON tele_ecg_imagenes(estado);

-- Índice en fecha de expiración (limpieza automática)
CREATE INDEX IF NOT EXISTS idx_tele_ecg_fecha_expiracion
    ON tele_ecg_imagenes(fecha_expiracion);

-- Índice en IPRESS (reportes por institución)
CREATE INDEX IF NOT EXISTS idx_tele_ecg_ipress
    ON tele_ecg_imagenes(id_ipress_origen);

-- Índice compuesto para búsquedas comunes
CREATE INDEX IF NOT EXISTS idx_tele_ecg_compuesto_busqueda
    ON tele_ecg_imagenes(num_doc_paciente, estado, fecha_envio DESC);

-- Índice para limpieza automática (stat_imagen + fecha_expiracion)
CREATE INDEX IF NOT EXISTS idx_tele_ecg_limpieza
    ON tele_ecg_imagenes(stat_imagen, fecha_expiracion)
    WHERE stat_imagen = 'A';

-- Índices en auditoría
CREATE INDEX IF NOT EXISTS idx_tele_ecg_auditoria_imagen
    ON tele_ecg_auditoria(id_imagen);

CREATE INDEX IF NOT EXISTS idx_tele_ecg_auditoria_usuario
    ON tele_ecg_auditoria(id_usuario);

CREATE INDEX IF NOT EXISTS idx_tele_ecg_auditoria_fecha
    ON tele_ecg_auditoria(fecha_accion DESC);

-- ============================================================
-- 5. CONFIGURAR PERMISOS MBAC
-- ============================================================

-- 5.1 Crear Módulo "TeleEKG"
INSERT INTO modulos(descripcion, nombre_modulo, estado_modulo, created_at, created_by)
VALUES ('Centro Nacional de Telemedicina - Módulo TeleEKG', 'TELEEKGS', 'A', CURRENT_TIMESTAMP, 1)
ON CONFLICT DO NOTHING;

-- Obtener ID del módulo
DO $$
DECLARE
    v_id_modulo BIGINT;
BEGIN
    SELECT id INTO v_id_modulo FROM modulos WHERE nombre_modulo = 'TELEEKGS' LIMIT 1;

    IF v_id_modulo IS NOT NULL THEN
        -- 5.2 Crear Páginas para TeleEKG
        INSERT INTO paginas(id_modulo, url_pagina, descripcion, estado_pagina, created_at, created_by)
        VALUES
            (v_id_modulo, '/teleekgs/upload', 'Envío de ECG desde IPRESS Externa', 'A', CURRENT_TIMESTAMP, 1),
            (v_id_modulo, '/teleekgs/listar', 'Administración y procesamiento de ECGs', 'A', CURRENT_TIMESTAMP, 1),
            (v_id_modulo, '/teleekgs/dashboard', 'Dashboard y estadísticas TeleEKG', 'A', CURRENT_TIMESTAMP, 1),
            (v_id_modulo, '/teleekgs/auditoria', 'Historial de auditoría de ECGs', 'A', CURRENT_TIMESTAMP, 1)
        ON CONFLICT DO NOTHING;

        -- 5.3 Crear Permisos
        INSERT INTO permisos(id_pagina, codigo_permiso, descripcion, estado_permiso, created_at, created_by)
        SELECT
            p.id,
            CASE p.url_pagina
                WHEN '/teleekgs/upload' THEN 'TELEEKGS_UPLOAD'
                WHEN '/teleekgs/listar' THEN 'TELEEKGS_LISTAR'
                WHEN '/teleekgs/dashboard' THEN 'TELEEKGS_DASHBOARD'
                WHEN '/teleekgs/auditoria' THEN 'TELEEKGS_AUDITORIA'
            END,
            CASE p.url_pagina
                WHEN '/teleekgs/upload' THEN 'Puede enviar ECGs desde IPRESS'
                WHEN '/teleekgs/listar' THEN 'Puede ver, procesar y vincular ECGs'
                WHEN '/teleekgs/dashboard' THEN 'Puede ver estadísticas y métricas'
                WHEN '/teleekgs/auditoria' THEN 'Puede ver historial de auditoría'
            END,
            'A',
            CURRENT_TIMESTAMP,
            1
        FROM paginas p
        WHERE p.id_modulo = v_id_modulo
        ON CONFLICT DO NOTHING;

        -- 5.4 Asignar Permisos a Roles
        -- INSTITUCION_EX: Solo upload
        INSERT INTO roles_permisos(id_rol, id_permiso, created_at, created_by)
        SELECT
            r.id,
            p.id,
            CURRENT_TIMESTAMP,
            1
        FROM roles r, permisos p, paginas pg, modulos m
        WHERE r.nombre_rol = 'INSTITUCION_EX'
          AND m.nombre_modulo = 'TELEEKGS'
          AND pg.id_modulo = m.id
          AND p.id_pagina = pg.id
          AND pg.url_pagina = '/teleekgs/upload'
        ON CONFLICT DO NOTHING;

        -- MEDICO: Listar, procesar, auditoria
        INSERT INTO roles_permisos(id_rol, id_permiso, created_at, created_by)
        SELECT
            r.id,
            p.id,
            CURRENT_TIMESTAMP,
            1
        FROM roles r, permisos p, paginas pg, modulos m
        WHERE r.nombre_rol IN ('MEDICO', 'COORDINADOR')
          AND m.nombre_modulo = 'TELEEKGS'
          AND pg.id_modulo = m.id
          AND p.id_pagina = pg.id
          AND pg.url_pagina IN ('/teleekgs/listar', '/teleekgs/auditoria')
        ON CONFLICT DO NOTHING;

        -- ADMIN: Acceso completo (upload, listar, dashboard, auditoria)
        INSERT INTO roles_permisos(id_rol, id_permiso, created_at, created_by)
        SELECT
            r.id,
            p.id,
            CURRENT_TIMESTAMP,
            1
        FROM roles r, permisos p, paginas pg, modulos m
        WHERE r.nombre_rol IN ('ADMIN', 'SUPERADMIN')
          AND m.nombre_modulo = 'TELEEKGS'
          AND pg.id_modulo = m.id
          AND p.id_pagina = pg.id
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- ============================================================
-- 6. CREAR VISTAS ÚTILES
-- ============================================================

-- Vista: Últimas imágenes cargadas
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

-- Vista: Estadísticas por IPRESS
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

-- Vista: Imágenes próximas a vencer (< 3 días)
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
-- 7. TRIGGERS Y FUNCIONES (OPCIONAL - En versión 2.0)
-- ============================================================

-- Función para actualizar fecha de actualización
CREATE OR REPLACE FUNCTION fn_update_timestamp_teleekgs()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar timestamp
CREATE TRIGGER trg_update_timestamp_teleekgs
BEFORE UPDATE ON tele_ecg_imagenes
FOR EACH ROW
EXECUTE FUNCTION fn_update_timestamp_teleekgs();

-- Función para validar fecha de expiración
CREATE OR REPLACE FUNCTION fn_validate_fecha_expiracion()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.fecha_expiracion IS NULL THEN
        NEW.fecha_expiracion = NEW.fecha_envio + INTERVAL '30 days';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para validar expiración
CREATE TRIGGER trg_validate_fecha_expiracion
BEFORE INSERT ON tele_ecg_imagenes
FOR EACH ROW
EXECUTE FUNCTION fn_validate_fecha_expiracion();

-- ============================================================
-- 8. SENTENCIAS DE VALIDACIÓN
-- ============================================================

-- Validar que las tablas se crearon correctamente
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

-- Validar índices creados
SELECT
    indexname,
    tablename
FROM pg_indexes
WHERE tablename LIKE 'tele_ecg%'
ORDER BY tablename, indexname;

-- ============================================================
-- FIN DEL SCRIPT
-- ============================================================
-- Fecha Ejecución: 2026-01-13
-- Ejecutado por: Claude Code (Implementación Fase 1)
-- Ambiente: maestro_cenate (PostgreSQL 14+)
-- Rollback: DROP TABLE tele_ecg_auditoria, tele_ecg_imagenes, tele_ecg_estadisticas CASCADE;
