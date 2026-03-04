-- =============================================================================
-- V6_29_0 - Inscribir pacientes MARATON (H.I O. MONGRUT) en paciente_estrategia
-- =============================================================================
-- Estrategia : EST-008 | PACIENTES MARATON | id_estrategia = 8
-- IPRESS     : H.I O. MONGRUT | cod_centro = 412 | Red R.A. SABOGAL
-- Fuente     : stg_cronicos_cenate (carga 2026-03-03, 6,020 pacientes)
-- Ejecutado por: Jesús Morales Carlos (DBA) | id_user = 53
-- Fecha      : 2026-03-04
-- Nota       : Jesús Morales Carlos es el usuario autorizado para cargas
--              masivas vía base de datos. Se registra su id_user (53)
--              para trazabilidad completa en paciente_estrategia.
-- =============================================================================

INSERT INTO paciente_estrategia (
    pk_asegurado,
    id_estrategia,
    id_usuario_asigno,
    fecha_asignacion,
    estado,
    created_at,
    updated_at
)
SELECT
    a.pk_asegurado,
    8,                                          -- EST-008 PACIENTES MARATON
    53,                                         -- Jesús Morales Carlos (DBA)
    '2026-03-04 00:00:00'::timestamp,
    'ACTIVO',
    NOW(),
    NOW()
FROM stg_cronicos_cenate sc
JOIN asegurados a ON a.doc_paciente = sc.num_doc_px_norm
WHERE sc.cod_centro = '412'                     -- H.I O. MONGRUT
ON CONFLICT DO NOTHING;                         -- protege idx_pac_est_activo_unico
