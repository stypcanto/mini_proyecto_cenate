-- Crear tabla segu_token_blacklist
CREATE TABLE IF NOT EXISTS segu_token_blacklist (
    id BIGSERIAL PRIMARY KEY,
    token_hash VARCHAR(64) NOT NULL UNIQUE,
    username VARCHAR(100) NOT NULL,
    fecha_expiracion TIMESTAMP NOT NULL,
    motivo VARCHAR(50) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indices
CREATE INDEX IF NOT EXISTS idx_token_blacklist_hash ON segu_token_blacklist(token_hash);
CREATE INDEX IF NOT EXISTS idx_token_blacklist_exp ON segu_token_blacklist(fecha_expiracion);

-- Comentarios
COMMENT ON TABLE segu_token_blacklist IS 'Tokens JWT invalidados (logout, cambio password, revocacion)';
COMMENT ON COLUMN segu_token_blacklist.token_hash IS 'Hash SHA-256 del token JWT';
COMMENT ON COLUMN segu_token_blacklist.username IS 'Usuario propietario del token';
COMMENT ON COLUMN segu_token_blacklist.fecha_expiracion IS 'Fecha de expiracion original del token';
COMMENT ON COLUMN segu_token_blacklist.motivo IS 'LOGOUT, PASSWORD_CHANGE, ADMIN_REVOKE';

SELECT 'Tabla segu_token_blacklist creada exitosamente' AS resultado;
