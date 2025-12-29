-- ================================================================
-- Script 008: Agregar campo email_preferido a dim_personal_cnt
-- Fecha: 2025-12-29
-- Descripción: Migra el campo email_preferido desde account_requests
--              hacia dim_personal_cnt para usuarios activos
-- ================================================================

-- 1. Agregar columna email_preferido a dim_personal_cnt
ALTER TABLE dim_personal_cnt
ADD COLUMN IF NOT EXISTS email_preferido VARCHAR(20) DEFAULT 'PERSONAL';

-- 2. Agregar comentario a la columna
COMMENT ON COLUMN dim_personal_cnt.email_preferido IS 'Correo preferido del usuario para notificaciones: PERSONAL o INSTITUCIONAL';

-- 3. Migrar datos existentes desde account_requests aprobadas
UPDATE dim_personal_cnt pc
SET email_preferido = ar.email_preferido
FROM account_requests ar
WHERE pc.num_doc_pers = ar.num_documento
  AND ar.estado = 'APROBADO'
  AND ar.email_preferido IS NOT NULL;

-- 4. Para usuarios sin preferencia definida, usar lógica inteligente
-- Si tienen correo personal → PERSONAL
UPDATE dim_personal_cnt
SET email_preferido = 'PERSONAL'
WHERE email_preferido IS NULL
  AND email_pers IS NOT NULL
  AND email_pers != '';

-- Si NO tienen correo personal pero SÍ institucional → INSTITUCIONAL
UPDATE dim_personal_cnt
SET email_preferido = 'INSTITUCIONAL'
WHERE email_preferido IS NULL
  AND email_corp_pers IS NOT NULL
  AND email_corp_pers != ''
  AND (email_pers IS NULL OR email_pers = '');

-- 5. Por defecto, si no hay ningún correo, usar PERSONAL
UPDATE dim_personal_cnt
SET email_preferido = 'PERSONAL'
WHERE email_preferido IS NULL;

-- ================================================================
-- VERIFICACIÓN DEL RESULTADO
-- ================================================================

SELECT
    COUNT(*) as total_personal,
    COUNT(CASE WHEN email_preferido = 'PERSONAL' THEN 1 END) as preferencia_personal,
    COUNT(CASE WHEN email_preferido = 'INSTITUCIONAL' THEN 1 END) as preferencia_institucional,
    COUNT(CASE WHEN email_preferido IS NULL THEN 1 END) as sin_preferencia
FROM dim_personal_cnt;

-- ================================================================
-- EJEMPLO: Ver usuarios con su preferencia
-- ================================================================

SELECT
    num_doc_pers,
    nom_pers || ' ' || ape_pater_pers || ' ' || ape_mater_pers as nombre_completo,
    email_pers as correo_personal,
    email_corp_pers as correo_institucional,
    email_preferido
FROM dim_personal_cnt
WHERE id_usuario IS NOT NULL
ORDER BY id_pers DESC
LIMIT 10;

-- ================================================================
-- FIN DEL SCRIPT
-- ================================================================
