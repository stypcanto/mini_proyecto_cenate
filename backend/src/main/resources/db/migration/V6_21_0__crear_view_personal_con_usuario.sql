-- =====================================================================
-- V6_21_0 — View: vw_personal_con_usuario
-- =====================================================================
-- Propósito: Centralizar el JOIN entre dim_personal_cnt y dim_usuarios
--   para evitar repetir el patrón en múltiples queries y eliminar bugs
--   donde se usaba id_pers = responsable_gestora_id (incorrecto) en
--   lugar de id_usuario = responsable_gestora_id (correcto).
--
-- Patrón correcto:
--   dim_solicitud_bolsa.responsable_gestora_id → dim_usuarios.id_user
--                                               → dim_personal_cnt.id_usuario
--
-- Uso en queries:
--   LEFT JOIN vw_personal_con_usuario gestora ON gestora.id_user = sb.responsable_gestora_id
--   LEFT JOIN vw_personal_con_usuario medico  ON medico.id_pers  = sb.id_personal
-- =====================================================================

CREATE OR REPLACE VIEW vw_personal_con_usuario AS
SELECT
    -- Identidad profesional
    p.id_pers,
    p.num_doc_pers,
    p.num_doc_norm,

    -- Nombre completo en tres formatos
    TRIM(CONCAT_WS(' ', p.nom_pers, p.ape_pater_pers, p.ape_mater_pers))   AS nombre_completo,
    TRIM(CONCAT_WS(' ', p.ape_pater_pers, p.ape_mater_pers, p.nom_pers))   AS nombre_apellido_primero,
    p.nom_pers                                                               AS nombres,
    p.ape_pater_pers                                                         AS apellido_paterno,
    p.ape_mater_pers                                                         AS apellido_materno,

    -- Vínculo con usuario del sistema (puede ser NULL si el profesional no tiene cuenta)
    p.id_usuario,
    u.id_user,
    u.name_user                                                              AS usuario_login,

    -- Ubicación organizacional
    p.id_area,
    p.id_servicio,
    p.id_ipress,

    -- Estado
    p.stat_pers,

    -- Contacto
    p.movil_pers,
    p.email_pers,
    p.email_corp_pers,
    p.email_preferido

FROM dim_personal_cnt p
LEFT JOIN dim_usuarios u ON u.id_user = p.id_usuario;

COMMENT ON VIEW vw_personal_con_usuario IS
    'Une dim_personal_cnt con dim_usuarios por id_usuario = id_user. '
    'Usar para resolver nombres de gestoras, médicos y coordinadores '
    'a partir de cualquier FK de usuario (responsable_gestora_id, '
    'usuario_cambio_estado_id, id_personal, etc.).';

-- Índice en dim_personal_cnt.id_usuario para acelerar el JOIN de la view
CREATE INDEX IF NOT EXISTS idx_personal_cnt_id_usuario
    ON dim_personal_cnt(id_usuario)
    WHERE id_usuario IS NOT NULL;
