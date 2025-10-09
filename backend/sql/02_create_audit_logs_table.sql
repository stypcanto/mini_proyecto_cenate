-- ============================================
-- TABLA DE AUDITORÍA DEL SISTEMA
-- ============================================

-- Eliminar tabla si existe (solo para desarrollo)
DROP TABLE IF EXISTS audit_logs CASCADE;

-- Crear tabla de logs de auditoría
CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,
    usuario VARCHAR(100) NOT NULL,
    action VARCHAR(100) NOT NULL,
    modulo VARCHAR(50),
    detalle TEXT,
    ip_address VARCHAR(50),
    user_agent TEXT,
    nivel VARCHAR(20) DEFAULT 'INFO',
    estado VARCHAR(20) DEFAULT 'SUCCESS',
    fecha_hora TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    duracion_ms BIGINT
);

-- Índices para mejorar el rendimiento
CREATE INDEX idx_audit_usuario ON audit_logs(usuario);
CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_audit_fecha ON audit_logs(fecha_hora DESC);
CREATE INDEX idx_audit_nivel ON audit_logs(nivel);
CREATE INDEX idx_audit_estado ON audit_logs(estado);
CREATE INDEX idx_audit_modulo ON audit_logs(modulo);

-- Comentarios de la tabla
COMMENT ON TABLE audit_logs IS 'Registro de auditoría de todas las acciones del sistema';
COMMENT ON COLUMN audit_logs.id IS 'ID único del log';
COMMENT ON COLUMN audit_logs.usuario IS 'Usuario que realizó la acción';
COMMENT ON COLUMN audit_logs.action IS 'Tipo de acción realizada (LOGIN, LOGOUT, CREATE, UPDATE, DELETE, etc.)';
COMMENT ON COLUMN audit_logs.modulo IS 'Módulo del sistema donde se realizó la acción';
COMMENT ON COLUMN audit_logs.detalle IS 'Descripción detallada de la acción';
COMMENT ON COLUMN audit_logs.ip_address IS 'Dirección IP desde donde se realizó la acción';
COMMENT ON COLUMN audit_logs.user_agent IS 'Navegador/cliente utilizado';
COMMENT ON COLUMN audit_logs.nivel IS 'Nivel de log: INFO, WARNING, ERROR, CRITICAL';
COMMENT ON COLUMN audit_logs.estado IS 'Estado de la operación: SUCCESS, FAILURE';
COMMENT ON COLUMN audit_logs.fecha_hora IS 'Fecha y hora de la acción';
COMMENT ON COLUMN audit_logs.duracion_ms IS 'Duración de la operación en milisegundos';

-- Insertar algunos datos de ejemplo para pruebas
INSERT INTO audit_logs (usuario, action, modulo, detalle, ip_address, nivel, estado, fecha_hora)
VALUES 
    ('admin', 'LOGIN', 'AUTH', 'Inicio de sesión exitoso', '127.0.0.1', 'INFO', 'SUCCESS', CURRENT_TIMESTAMP - INTERVAL '5 hours'),
    ('admin', 'CREATE_USER', 'USUARIOS', 'Creación de nuevo usuario: testuser', '127.0.0.1', 'INFO', 'SUCCESS', CURRENT_TIMESTAMP - INTERVAL '4 hours'),
    ('admin', 'UPDATE_ROL', 'ROLES', 'Actualización de permisos del rol ADMIN', '127.0.0.1', 'INFO', 'SUCCESS', CURRENT_TIMESTAMP - INTERVAL '3 hours'),
    ('user1', 'LOGIN', 'AUTH', 'Inicio de sesión exitoso', '192.168.1.100', 'INFO', 'SUCCESS', CURRENT_TIMESTAMP - INTERVAL '2 hours'),
    ('admin', 'DELETE_USER', 'USUARIOS', 'Eliminación de usuario inactivo', '127.0.0.1', 'WARNING', 'SUCCESS', CURRENT_TIMESTAMP - INTERVAL '1 hour'),
    ('user2', 'LOGIN', 'AUTH', 'Intento de login fallido - contraseña incorrecta', '192.168.1.105', 'WARNING', 'FAILURE', CURRENT_TIMESTAMP - INTERVAL '30 minutes'),
    ('admin', 'LOGOUT', 'AUTH', 'Cierre de sesión', '127.0.0.1', 'INFO', 'SUCCESS', CURRENT_TIMESTAMP);

-- Verificar que se creó correctamente
SELECT COUNT(*) as total_logs FROM audit_logs;
SELECT * FROM audit_logs ORDER BY fecha_hora DESC LIMIT 10;

COMMIT;
