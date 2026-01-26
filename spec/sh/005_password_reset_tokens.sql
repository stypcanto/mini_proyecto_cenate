-- ============================================================
-- Script: 005_password_reset_tokens.sql
-- Descripcion: Tabla para persistir tokens de recuperacion de contrasena
-- Version: 1.9.2
-- Fecha: 2025-12-23
-- ============================================================

-- Crear tabla para tokens de recuperacion de contrasena
CREATE TABLE IF NOT EXISTS public.segu_password_reset_tokens (
    id_token BIGSERIAL PRIMARY KEY,
    token VARCHAR(100) NOT NULL UNIQUE,
    id_usuario BIGINT NOT NULL,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(150) NOT NULL,
    fecha_expiracion TIMESTAMP NOT NULL,
    tipo_accion VARCHAR(50),
    usado BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indices para busqueda rapida
CREATE INDEX IF NOT EXISTS idx_password_reset_token ON public.segu_password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_usuario ON public.segu_password_reset_tokens(id_usuario);
CREATE INDEX IF NOT EXISTS idx_password_reset_expiracion ON public.segu_password_reset_tokens(fecha_expiracion);

-- Comentarios
COMMENT ON TABLE public.segu_password_reset_tokens IS 'Tokens de recuperacion de contrasena - persisten en BD para sobrevivir reinicios del servidor';
COMMENT ON COLUMN public.segu_password_reset_tokens.token IS 'Token unico generado (Base64 URL-safe)';
COMMENT ON COLUMN public.segu_password_reset_tokens.id_usuario IS 'ID del usuario que solicito el reset';
COMMENT ON COLUMN public.segu_password_reset_tokens.username IS 'Username del usuario (para logs/auditoria)';
COMMENT ON COLUMN public.segu_password_reset_tokens.email IS 'Email donde se envio el enlace';
COMMENT ON COLUMN public.segu_password_reset_tokens.fecha_expiracion IS 'Fecha/hora de expiracion del token (24 horas por defecto)';
COMMENT ON COLUMN public.segu_password_reset_tokens.tipo_accion IS 'Tipo: RESET (admin), RECOVERY (usuario), NUEVO_USUARIO';
COMMENT ON COLUMN public.segu_password_reset_tokens.usado IS 'TRUE si el token ya fue utilizado';
COMMENT ON COLUMN public.segu_password_reset_tokens.created_at IS 'Fecha de creacion del token';

-- Verificar creacion
SELECT 'Tabla segu_password_reset_tokens creada/verificada' AS resultado;
