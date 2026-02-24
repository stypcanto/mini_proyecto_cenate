-- =====================================================================
-- V6.0.0 — Trazabilidad directa: RECITA/INTERCONSULTA → atencion_clinica
-- =====================================================================
-- Problema previo: dim_solicitud_bolsa (RECITA/INT) y atencion_clinica no
--   estaban vinculadas, obligando a correlacionar por timestamp (frágil).
-- Solución: FK directa desde el registro RECITA/INT hacia la atencion_clinica
--   que lo originó. El servicio la poblará en cada creación nueva.
-- Registros históricos se retroalimentan con el mismo algoritmo de timestamp.
-- =====================================================================

-- 1. Agregar columna FK (nullable: registros históricos y no-enfermería pueden tener NULL)
ALTER TABLE dim_solicitud_bolsa
    ADD COLUMN IF NOT EXISTS id_atencion_clinica BIGINT
        REFERENCES atencion_clinica(id_atencion)
        ON UPDATE CASCADE
        ON DELETE SET NULL;

COMMENT ON COLUMN dim_solicitud_bolsa.id_atencion_clinica
    IS 'FK → atencion_clinica.id_atencion: atención clínica que generó esta RECITA/INTERCONSULTA. '
       'NULL para registros históricos o solicitudes que no provienen de una atención de enfermería. '
       'Poblado automáticamente desde v6.0.0 en cada nueva creación.';

-- 2. Índice parcial (solo filas relevantes, no penaliza el resto de la tabla)
CREATE INDEX IF NOT EXISTS idx_solicitud_bolsa_atencion_clinica
    ON dim_solicitud_bolsa(id_atencion_clinica)
    WHERE id_atencion_clinica IS NOT NULL;

-- 3. Backfill de registros históricos usando correlación por timestamp
--    Lógica: para cada RECITA/INTERCONSULTA sin FK, buscar la atencion_clinica
--    del mismo paciente cuya fecha_atencion sea la más cercana dentro de la
--    ventana [-2 min, +30 min] respecto a fecha_solicitud.
UPDATE dim_solicitud_bolsa dsb
SET id_atencion_clinica = ac_match.id_atencion
FROM (
    SELECT DISTINCT ON (dsb2.id_solicitud)
        dsb2.id_solicitud,
        ac.id_atencion
    FROM dim_solicitud_bolsa dsb2
    JOIN atencion_clinica ac
        ON  ac.pk_asegurado = dsb2.paciente_id
        AND ac.fecha_atencion >= dsb2.fecha_solicitud - INTERVAL '2 minutes'
        AND ac.fecha_atencion <= dsb2.fecha_solicitud + INTERVAL '30 minutes'
    WHERE UPPER(dsb2.tipo_cita) IN ('RECITA', 'INTERCONSULTA')
      AND dsb2.activo        = true
      AND dsb2.id_bolsa      = 11
      AND dsb2.id_atencion_clinica IS NULL
    ORDER BY dsb2.id_solicitud,
             ABS(EXTRACT(EPOCH FROM (ac.fecha_atencion - dsb2.fecha_solicitud)))
) ac_match
WHERE dsb.id_solicitud = ac_match.id_solicitud;
