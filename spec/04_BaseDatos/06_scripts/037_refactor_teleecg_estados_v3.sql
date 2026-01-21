-- ============================================================
-- Script: Refactor TeleECG Estados - Versión 3.0.0
-- ============================================================
-- Versión: 1.0.0 | 2026-01-20
-- Autor: Claude Code
--
-- Propósito:
--   Refactorizar la máquina de estados de TeleECG:
--   PENDIENTE/PROCESADA/RECHAZADA/VINCULADA → ENVIADA/OBSERVADA/ATENDIDA
--
-- Cambios:
--   1. Agregar campos: id_imagen_anterior, fue_subsanado
--   2. Actualizar CHECK constraint para nuevos estados
--   3. Migrar datos existentes:
--      - PENDIENTE → ENVIADA
--      - PROCESADA → ATENDIDA
--      - RECHAZADA → OBSERVADA
--      - VINCULADA → ATENDIDA
--   4. Verificar integridad de datos
--
-- ============================================================

-- 1. Agregar nuevos campos si no existen
ALTER TABLE tele_ecg_imagenes
ADD COLUMN IF NOT EXISTS id_imagen_anterior BIGINT,
ADD COLUMN IF NOT EXISTS fue_subsanado BOOLEAN DEFAULT FALSE;

-- 2. Agregar FK constraint para id_imagen_anterior (self-referencing)
ALTER TABLE tele_ecg_imagenes
ADD CONSTRAINT IF NOT EXISTS fk_imagen_anterior
FOREIGN KEY (id_imagen_anterior)
REFERENCES tele_ecg_imagenes(id_imagen)
ON DELETE SET NULL
ON UPDATE CASCADE;

-- 3. Crear índice para búsqueda de imágenes subsanadas
CREATE INDEX IF NOT EXISTS idx_teleecg_subsanado
ON tele_ecg_imagenes(fue_subsanado, id_imagen_anterior);

-- 4. Eliminar constraint anterior de estados (si existe)
ALTER TABLE tele_ecg_imagenes
DROP CONSTRAINT IF EXISTS check_estado CASCADE;

-- 5. Crear nuevo constraint con nuevos estados
ALTER TABLE tele_ecg_imagenes
ADD CONSTRAINT check_estado_v3
CHECK (estado IN ('ENVIADA', 'OBSERVADA', 'ATENDIDA'));

-- 6. Migrar datos existentes
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

-- 7. Verificar que no hay estados inválidos
SELECT COUNT(*) as registros_invalidos
FROM tele_ecg_imagenes
WHERE estado NOT IN ('ENVIADA', 'OBSERVADA', 'ATENDIDA');

-- Resultado esperado: 0

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

-- ============================================================
-- Notas importantes:
-- - motivo_rechazo se mantiene por compatibilidad (futuro: deprecar)
-- - observaciones ahora es el campo principal para notas
-- - estado siempre en BD es único (ENVIADA/OBSERVADA/ATENDIDA)
-- - La transformación a PENDIENTE/RECHAZADA ocurre en la capa de API
-- ============================================================
