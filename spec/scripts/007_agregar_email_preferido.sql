-- ================================================================
-- Script 007: Agregar campo email_preferido a account_requests
-- Fecha: 2025-12-29
-- Descripción: Permite al usuario elegir a qué correo desea recibir
--              las notificaciones del sistema (credenciales, recuperación, etc.)
-- ================================================================

-- Agregar columna email_preferido (PERSONAL o INSTITUCIONAL)
ALTER TABLE account_requests
ADD COLUMN IF NOT EXISTS email_preferido VARCHAR(20) DEFAULT 'PERSONAL';

-- Agregar comentario a la columna
COMMENT ON COLUMN account_requests.email_preferido IS 'Correo preferido del usuario para recibir notificaciones: PERSONAL o INSTITUCIONAL';

-- Actualizar registros existentes para usar correo personal si está disponible
UPDATE account_requests
SET email_preferido = 'PERSONAL'
WHERE email_preferido IS NULL
  AND correo_personal IS NOT NULL
  AND correo_personal != '';

-- Si no hay correo personal pero sí institucional, usar institucional
UPDATE account_requests
SET email_preferido = 'INSTITUCIONAL'
WHERE email_preferido IS NULL
  AND correo_institucional IS NOT NULL
  AND correo_institucional != ''
  AND (correo_personal IS NULL OR correo_personal = '');

-- Verificar el resultado
SELECT
    COUNT(*) as total_solicitudes,
    COUNT(CASE WHEN email_preferido = 'PERSONAL' THEN 1 END) as preferencia_personal,
    COUNT(CASE WHEN email_preferido = 'INSTITUCIONAL' THEN 1 END) as preferencia_institucional,
    COUNT(CASE WHEN email_preferido IS NULL THEN 1 END) as sin_preferencia
FROM account_requests;

-- ================================================================
-- FIN DEL SCRIPT
-- ================================================================
