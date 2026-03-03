-- V6.9.0 — Corregir estado de bolsa y condición médica en solicitudes RECHAZADAS
-- Las solicitudes anuladas antes del fix v1.82.2 quedaron con condicion_medica='Pendiente'
-- y estado='PENDIENTE'. Este script las actualiza al estado correcto.

UPDATE dim_solicitud_bolsa
SET
    condicion_medica = 'Anulado',
    estado           = 'Observado'
WHERE
    activo = true
    AND estado_gestion_citas_id = (
        SELECT id_estado_cita
        FROM dim_estados_gestion_citas
        WHERE cod_estado_cita = 'RECHAZADO'
        LIMIT 1
    )
    AND (
        condicion_medica IS DISTINCT FROM 'Anulado'
        OR estado IS DISTINCT FROM 'Observado'
    );
