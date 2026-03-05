-- V6_30_0: Corregir gestora incorrecta en Tele EKG (v1.83.6)
-- Bug: CargaMasivaRequest.java tenía responsableGestoraId = 688L como default
-- Efecto: Todos los pacientes cargados masivamente a Tele EKG (id_bolsa=10)
--         recibieron responsable_gestora_id=688 (JACKELINE MORI SALINAS, PADOMI)
--         aunque no pertenece a esa bolsa.
-- Fix: Limpiar la asignación incorrecta — solo para registros en id_bolsa=10
--      donde el responsable es 688 y fue importado masivamente (sin médico asignado / estado PENDIENTE).

UPDATE dim_solicitud_bolsa
SET responsable_gestora_id = NULL,
    fecha_asignacion = NULL
WHERE id_bolsa = 10
  AND responsable_gestora_id = 688
  AND activo = TRUE;
