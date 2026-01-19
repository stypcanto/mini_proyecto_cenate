-- ============================================================================
-- Script: 034_teleecg_exclusivo_padomi.sql
-- Fecha: 2026-01-19
-- Descripción: Configurar TELEECG SOLO para PADOMI
-- ============================================================================
--
-- CONTEXTO:
-- El módulo TELEECG se encontraba habilitado en 20 IPRESS diferentes.
-- Se requiere que esté disponible SOLO para usuarios que se registren en
-- PROGRAMA DE ATENCION DOMICILIARIA-PADOMI (id_ipress=413)
--
-- CAMBIOS:
-- 1. Deshabilitar TELEECG en 19 IPRESS
-- 2. Mantener habilitado en PADOMI
--
-- ============================================================================

-- Paso 1: Deshabilitar TELEECG en todas las IPRESS EXCEPTO PADOMI
UPDATE ipress_modulos_config
SET
    habilitado = false,
    updated_at = NOW()
WHERE
    modulo_codigo = 'TELEECG'
    AND id_ipress != 413;

-- Paso 2: Confirmar que TELEECG en PADOMI esté habilitado
UPDATE ipress_modulos_config
SET
    habilitado = true,
    updated_at = NOW()
WHERE
    modulo_codigo = 'TELEECG'
    AND id_ipress = 413;

-- ============================================================================
-- VERIFICACIÓN
-- ============================================================================

-- Verificar que solo PADOMI tiene TELEECG habilitado
SELECT
    di.id_ipress,
    di.desc_ipress,
    imc.modulo_codigo,
    imc.habilitado,
    CASE
        WHEN imc.habilitado = true THEN '✅ ACTIVO'
        ELSE '❌ INACTIVO'
    END as estado,
    imc.updated_at
FROM ipress_modulos_config imc
JOIN dim_ipress di ON imc.id_ipress = di.id_ipress
WHERE imc.modulo_codigo = 'TELEECG'
ORDER BY imc.habilitado DESC, di.desc_ipress;

-- Resumen: Contar IPRESS con TELEECG habilitado
SELECT
    COUNT(*) as total_ipress_con_teleecg_habilitado
FROM ipress_modulos_config
WHERE modulo_codigo = 'TELEECG' AND habilitado = true;

-- ============================================================================
-- RESULTADO ESPERADO:
-- ============================================================================
-- 1 IPRESS con TELEECG habilitado (PADOMI)
-- 19 IPRESS con TELEECG deshabilitado
--
-- IMPACTO EN FRONTED:
-- - Usuarios registrados en PADOMI verán TELEECG en su página de bienvenida
-- - Usuarios registrados en otras IPRESS NO verán TELEECG
-- - El cambio es efectivo inmediatamente sin necesidad de redeploy
-- ============================================================================
