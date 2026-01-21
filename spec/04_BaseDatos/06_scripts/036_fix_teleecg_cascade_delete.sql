-- ============================================================
-- Script: Fix TeleECG FK Constraint para ON DELETE CASCADE
-- ============================================================
-- Versión: 1.0.0 | 2026-01-20
-- Autor: Claude Code
--
-- Propósito:
--   Corregir la FK constraint entre tele_ecg_auditoria e tele_ecg_imagenes
--   para permitir cascading deletes cuando se elimina una imagen ECG.
--
-- Problema solucionado:
--   Error Hibernate: "TransientObjectException: persistent instance references
--   an unsaved transient instance of 'TeleECGImagen'"
--   Causa: La FK no tenía ON DELETE CASCADE configurado
--
-- Cambios:
--   1. Eliminar FK constraint anterior (tele_ecg_auditoria_id_imagen_fkey)
--   2. Crear nueva FK con nombre estándar (fk_auditoria_imagen)
--   3. Configurar ON DELETE CASCADE
--   4. Verificar que la FK fue creada correctamente
--
-- Impacto:
--   - Cuando se elimina una TeleECGImagen, se eliminan automáticamente
--     todos los registros de auditoría asociados
--   - Mayor consistencia en la BD
--   - Permite que el servicio elimine imágenes sin errores
-- ============================================================

-- 1. Obtener información de la FK actual
SELECT constraint_name, table_name, column_name
FROM information_schema.key_column_usage
WHERE table_name = 'tele_ecg_auditoria' AND column_name = 'id_imagen';

-- 2. Eliminar la FK constraint anterior (generada automáticamente por Hibernate)
ALTER TABLE tele_ecg_auditoria
DROP CONSTRAINT IF EXISTS tele_ecg_auditoria_id_imagen_fkey CASCADE;

-- 3. Crear nueva FK constraint con ON DELETE CASCADE
ALTER TABLE tele_ecg_auditoria
ADD CONSTRAINT fk_auditoria_imagen
FOREIGN KEY (id_imagen)
REFERENCES tele_ecg_imagenes(id_imagen)
ON DELETE CASCADE
ON UPDATE RESTRICT;

-- 4. Verificar que la FK fue creada correctamente
SELECT constraint_name, delete_rule
FROM information_schema.referential_constraints
WHERE table_name = 'tele_ecg_auditoria' AND constraint_name = 'fk_auditoria_imagen';

-- 5. Validar que la tabla no tiene registros huérfanos
SELECT COUNT(*) as registros_sin_imagen_valida
FROM tele_ecg_auditoria t
LEFT JOIN tele_ecg_imagenes i ON t.id_imagen = i.id_imagen
WHERE i.id_imagen IS NULL;

-- Resultado esperado: 0 (no debe haber auditorías sin imagen)
