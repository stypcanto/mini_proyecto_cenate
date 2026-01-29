-- ============================================================================
-- MIGRACIÓN: Añadir columna foto_ext a vista dim_personal_externo
-- ============================================================================
-- Fecha: 2026-01-29
-- Versión: 1.0
-- Motivo: Corregir error de autenticación de usuarios externos
--         El código AuthenticationServiceImpl buscaba foto_ext en dim_personal_externo
--         pero la vista no tenía esa columna, causando excepción SQL y transacción rollback
-- ============================================================================

-- ANTES: La vista dim_personal_externo no tenía la columna foto_ext
-- DESPUÉS: Añadida columna foto_ext (alias de foto_pers de dim_personal_cnt)

DROP VIEW IF EXISTS dim_personal_externo CASCADE;

CREATE VIEW dim_personal_externo AS
SELECT
    id_pers AS id_pers_ext,
    id_tip_doc,
    num_doc_pers AS num_doc_ext,
    nom_pers AS nom_ext,
    ape_pater_pers AS ape_pater_ext,
    ape_mater_pers AS ape_mater_ext,
    fech_naci_pers AS fech_naci_ext,
    gen_pers AS gen_ext,
    id_ipress,
    id_usuario AS id_user,
    created_at,
    updated_at,
    email_pers AS email_pers_ext,
    email_corp_pers AS email_corp_ext,
    NULL::text AS email_ext,
    id_usuario,
    NULL::text AS inst_ext,
    movil_pers AS movil_ext,
    id_dist,
    nom_contacto_emerg,
    tel_contacto_emerg,
    observaciones,
    foto_pers AS foto_ext  -- ✅ NUEVA COLUMNA AÑADIDA
FROM dim_personal_cnt p
WHERE id_origen = 2;

-- Verificación
-- SELECT * FROM dim_personal_externo LIMIT 1;
