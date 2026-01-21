-- ============================================================
-- Script: Refactor TeleECG Estados - Versión 3.0.0 (FIXED)
-- ============================================================
-- Versión: 1.0.0 | 2026-01-20
-- Autor: Claude Code
--
-- Propósito:
--   Refactorizar la máquina de estados de TeleECG:
--   PENDIENTE/PROCESADA/RECHAZADA/VINCULADA → ENVIADA/OBSERVADA/ATENDIDA
--
-- ============================================================

-- 1. Eliminar CHECK constraint existente de estados
ALTER TABLE tele_ecg_imagenes
DROP CONSTRAINT tele_ecg_imagenes_estado_check CASCADE;

-- 2. Agregar nuevos campos si no existen
ALTER TABLE tele_ecg_imagenes
ADD COLUMN IF NOT EXISTS id_imagen_anterior BIGINT,
ADD COLUMN IF NOT EXISTS fue_subsanado BOOLEAN DEFAULT FALSE;

-- 3. Agregar FK constraint para id_imagen_anterior (self-referencing)
-- Con IF NOT EXISTS no funciona en ALTER CONSTRAINT, pero podemos usar una subquery
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'tele_ecg_imagenes'
    AND constraint_name = 'fk_imagen_anterior'
  ) THEN
    ALTER TABLE tele_ecg_imagenes
    ADD CONSTRAINT fk_imagen_anterior
    FOREIGN KEY (id_imagen_anterior)
    REFERENCES tele_ecg_imagenes(id_imagen)
    ON DELETE SET NULL
    ON UPDATE CASCADE;
  END IF;
END
$$;

-- 4. Crear índice para búsqueda de imágenes subsanadas
CREATE INDEX IF NOT EXISTS idx_teleecg_subsanado
ON tele_ecg_imagenes(fue_subsanado, id_imagen_anterior);

-- 5. Migrar datos existentes
-- PENDIENTE → ENVIADA
UPDATE tele_ecg_imagenes
SET estado = 'ENVIADA'
WHERE estado = 'PENDIENTE';

-- PROCESADA → ATENDIDA
UPDATE tele_ecg_imagenes
SET estado = 'ATENDIDA'
WHERE estado = 'PROCESADA';

-- RECHAZADA → OBSERVADA
UPDATE tele_ecg_imagenes
SET estado = 'OBSERVADA'
WHERE estado = 'RECHAZADA';

-- VINCULADA → ATENDIDA
UPDATE tele_ecg_imagenes
SET estado = 'ATENDIDA'
WHERE estado = 'VINCULADA';

-- 6. Crear nuevo constraint con nuevos estados
ALTER TABLE tele_ecg_imagenes
ADD CONSTRAINT tele_ecg_imagenes_estado_check
CHECK (estado IN ('ENVIADA', 'OBSERVADA', 'ATENDIDA'));

-- 7. Verificar que no hay estados inválidos
SELECT COUNT(*) as registros_invalidos
FROM tele_ecg_imagenes
WHERE estado NOT IN ('ENVIADA', 'OBSERVADA', 'ATENDIDA');

-- 8. Mostrar distribución de estados después de migración
SELECT estado, COUNT(*) as total
FROM tele_ecg_imagenes
GROUP BY estado
ORDER BY estado;

-- 9. Verificar que todo está correcto
SELECT
  COUNT(*) as total_registros,
  COUNT(CASE WHEN estado IN ('ENVIADA', 'OBSERVADA', 'ATENDIDA') THEN 1 END) as estados_validos,
  COUNT(CASE WHEN id_imagen_anterior IS NOT NULL THEN 1 END) as con_imagen_anterior,
  COUNT(CASE WHEN fue_subsanado = TRUE THEN 1 END) as subsanadas
FROM tele_ecg_imagenes;

-- 10. Mostrar estructura de la tabla actualizada
\d tele_ecg_imagenes

-- ============================================================
-- Notas:
-- - motivo_rechazo se mantiene por compatibilidad (futuro: deprecar)
-- - observaciones es el campo principal para notas/observaciones
-- - estado en BD es único: ENVIADA/OBSERVADA/ATENDIDA
-- - Transformación a PENDIENTE/RECHAZADA en capa de API
-- ============================================================
