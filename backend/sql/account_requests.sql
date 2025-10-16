-- ========================================================================
-- 📝 TABLA DE SOLICITUDES DE CUENTA - account_requests
-- ========================================================================
-- Esta tabla almacena las solicitudes de creación de cuentas que deben
-- ser aprobadas por un administrador antes de crear el usuario.
-- ========================================================================

-- Eliminar tabla si existe (solo para desarrollo/testing)
-- DROP TABLE IF EXISTS account_requests;

-- Crear tabla de solicitudes de cuenta
CREATE TABLE IF NOT EXISTS account_requests (
    id_request BIGSERIAL PRIMARY KEY,
    nombre_completo VARCHAR(200) NOT NULL,
    tipo_usuario VARCHAR(20) NOT NULL CHECK (tipo_usuario IN ('INTERNO', 'EXTERNO')),
    num_documento VARCHAR(20) NOT NULL,
    motivo TEXT,
    estado VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE' CHECK (estado IN ('PENDIENTE', 'APROBADO', 'RECHAZADO')),
    observacion_admin TEXT,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_respuesta TIMESTAMP,
    id_admin BIGINT,
    
    -- Constraints
    CONSTRAINT uk_account_request_documento UNIQUE (num_documento, estado),
    CONSTRAINT fk_account_request_admin FOREIGN KEY (id_admin) 
        REFERENCES tb_usuarios(id_user) ON DELETE SET NULL
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_account_requests_estado 
    ON account_requests(estado);

CREATE INDEX IF NOT EXISTS idx_account_requests_tipo_usuario 
    ON account_requests(tipo_usuario);

CREATE INDEX IF NOT EXISTS idx_account_requests_fecha_creacion 
    ON account_requests(fecha_creacion DESC);

CREATE INDEX IF NOT EXISTS idx_account_requests_num_documento 
    ON account_requests(num_documento);

-- Comentarios en la tabla
COMMENT ON TABLE account_requests IS 
    'Solicitudes de creación de cuenta que requieren aprobación de administrador';

COMMENT ON COLUMN account_requests.id_request IS 
    'Identificador único de la solicitud';

COMMENT ON COLUMN account_requests.nombre_completo IS 
    'Nombre completo del solicitante';

COMMENT ON COLUMN account_requests.tipo_usuario IS 
    'Tipo de usuario: INTERNO (personal de CENATE) o EXTERNO (IPRESS, consultores)';

COMMENT ON COLUMN account_requests.num_documento IS 
    'Número de documento de identidad (DNI)';

COMMENT ON COLUMN account_requests.motivo IS 
    'Motivo o justificación de la solicitud';

COMMENT ON COLUMN account_requests.estado IS 
    'Estado de la solicitud: PENDIENTE, APROBADO, RECHAZADO';

COMMENT ON COLUMN account_requests.observacion_admin IS 
    'Observaciones del administrador al aprobar o rechazar';

COMMENT ON COLUMN account_requests.fecha_creacion IS 
    'Fecha y hora de creación de la solicitud';

COMMENT ON COLUMN account_requests.fecha_respuesta IS 
    'Fecha y hora en que el admin respondió (aprobó o rechazó)';

COMMENT ON COLUMN account_requests.id_admin IS 
    'ID del administrador que procesó la solicitud';

-- ========================================================================
-- 📊 DATOS DE PRUEBA (Opcional - Solo para testing)
-- ========================================================================

-- Insertar solicitudes de ejemplo
INSERT INTO account_requests 
    (nombre_completo, tipo_usuario, num_documento, motivo, estado) 
VALUES 
    (
        'María Elena Gutiérrez Flores',
        'INTERNO',
        '12345678',
        'Necesito acceso al sistema para gestionar el personal del área de cardiología. Recientemente he sido designada como coordinadora.',
        'PENDIENTE'
    ),
    (
        'Carlos Alberto Mendoza Silva',
        'EXTERNO',
        '87654321',
        'Requiero acceso como personal externo de la IPRESS San Juan de Lurigancho para coordinar las transferencias de pacientes.',
        'PENDIENTE'
    ),
    (
        'Ana Lucía Rodríguez Castro',
        'INTERNO',
        '45678912',
        'Como nueva integrante del equipo de telemedicina, necesito acceso para registrar consultas virtuales.',
        'PENDIENTE'
    )
ON CONFLICT (num_documento, estado) DO NOTHING;

-- ========================================================================
-- ✅ Verificación
-- ========================================================================

-- Mostrar estructura de la tabla
SELECT 
    column_name, 
    data_type, 
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'account_requests'
ORDER BY ordinal_position;

-- Contar solicitudes por estado
SELECT 
    estado,
    tipo_usuario,
    COUNT(*) as total
FROM account_requests
GROUP BY estado, tipo_usuario
ORDER BY estado, tipo_usuario;

-- ========================================================================
-- 🔍 CONSULTAS ÚTILES
-- ========================================================================

-- Ver todas las solicitudes pendientes
SELECT 
    id_request,
    nombre_completo,
    tipo_usuario,
    num_documento,
    motivo,
    fecha_creacion,
    AGE(CURRENT_TIMESTAMP, fecha_creacion) as tiempo_esperando
FROM account_requests
WHERE estado = 'PENDIENTE'
ORDER BY fecha_creacion ASC;

-- Ver solicitudes aprobadas con información del admin
SELECT 
    ar.id_request,
    ar.nombre_completo,
    ar.tipo_usuario,
    ar.fecha_creacion,
    ar.fecha_respuesta,
    u.username as admin_username,
    u.nombre_completo as admin_nombre,
    ar.observacion_admin
FROM account_requests ar
LEFT JOIN tb_usuarios u ON ar.id_admin = u.id_user
WHERE ar.estado = 'APROBADO'
ORDER BY ar.fecha_respuesta DESC;

-- Estadísticas generales
SELECT 
    COUNT(*) FILTER (WHERE estado = 'PENDIENTE') as pendientes,
    COUNT(*) FILTER (WHERE estado = 'APROBADO') as aprobadas,
    COUNT(*) FILTER (WHERE estado = 'RECHAZADO') as rechazadas,
    COUNT(*) as total,
    AVG(EXTRACT(EPOCH FROM (fecha_respuesta - fecha_creacion))/3600) 
        FILTER (WHERE fecha_respuesta IS NOT NULL) as horas_promedio_respuesta
FROM account_requests;

-- ========================================================================
-- 🔧 FUNCIONES DE MANTENIMIENTO
-- ========================================================================

-- Función para limpiar solicitudes antiguas rechazadas (más de 6 meses)
CREATE OR REPLACE FUNCTION cleanup_old_rejected_requests()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM account_requests
    WHERE estado = 'RECHAZADO'
    AND fecha_respuesta < CURRENT_TIMESTAMP - INTERVAL '6 months';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Para ejecutar la limpieza:
-- SELECT cleanup_old_rejected_requests();

COMMENT ON FUNCTION cleanup_old_rejected_requests() IS 
    'Elimina solicitudes rechazadas con más de 6 meses de antigüedad';

-- ========================================================================
-- ✅ Script completado exitosamente
-- ========================================================================

SELECT '✅ Tabla account_requests creada y configurada exitosamente' as status;
