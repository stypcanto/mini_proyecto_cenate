-- ============================================================
-- SEC-003: Tabla para tokens JWT invalidados
-- ============================================================
-- Fecha: 2025-12-27
-- Descripcion: Almacena tokens invalidados por logout,
--              cambio de contrasena o revocacion administrativa.
-- ============================================================

-- Crear tabla si no existe
CREATE TABLE IF NOT EXISTS segu_token_blacklist (
    id BIGSERIAL PRIMARY KEY,
    token_hash VARCHAR(64) NOT NULL UNIQUE,
    username VARCHAR(100) NOT NULL,
    fecha_expiracion TIMESTAMP NOT NULL,
    motivo VARCHAR(50) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Comentarios
COMMENT ON TABLE segu_token_blacklist IS 'Tokens JWT invalidados (logout, cambio password, revocacion)';
COMMENT ON COLUMN segu_token_blacklist.token_hash IS 'Hash SHA-256 del token JWT';
COMMENT ON COLUMN segu_token_blacklist.username IS 'Usuario propietario del token';
COMMENT ON COLUMN segu_token_blacklist.fecha_expiracion IS 'Fecha de expiracion original del token';
COMMENT ON COLUMN segu_token_blacklist.motivo IS 'LOGOUT, PASSWORD_CHANGE, ADMIN_REVOKE';

-- Indices para rendimiento
CREATE INDEX IF NOT EXISTS idx_token_blacklist_hash
    ON segu_token_blacklist(token_hash);

CREATE INDEX IF NOT EXISTS idx_token_blacklist_exp
    ON segu_token_blacklist(fecha_expiracion);

-- ============================================================
-- Para ejecutar:
-- PGPASSWORD=Essalud2025 psql -h 10.0.89.241 -U postgres -d maestro_cenate \
--   -f spec/scripts/004_token_blacklist.sql
-- ============================================================
