/*
 * SCRIPT: 039_teleecg_agregar_fk_asegurados.sql
 *
 * Agregar Foreign Key en tele_ecg_imagenes → asegurados
 *
 * PROPÓSITO:
 * - Garantizar integridad referencial: todas las imágenes ECG deben pertenecer a un asegurado válido
 * - Evitar registros huérfanos en la tabla tele_ecg_imagenes
 * - Consolidar la arquitectura de pacientes: asegurados es la ÚNICA fuente de verdad
 *
 * FECHAS:
 * - Creado: 2026-01-21
 * - Versión: 1.0.0 (CENATE TeleECG v1.21.4)
 *
 * IMPORTANTE: Ejecutar en este orden:
 * 1. Verificar no hay registros huérfanos
 * 2. Crear índice en asegurados.doc_paciente (si no existe)
 * 3. Agregar la FK con ON DELETE RESTRICT
 *
 * RIESGOS:
 * - Si hay registros huérfanos en tele_ecg_imagenes, el script fallará
 * - Solución: Ejecutar script de limpieza primero (paso 4 comentado)
 */

-- ============================================================================
-- PASO 1: Verificar que NO hay registros huérfanos
-- ============================================================================
-- ⚠️ EJECUTAR PRIMERO PARA DIAGNÓSTICO

SELECT COUNT(*) as total_orfanos
FROM tele_ecg_imagenes t
WHERE NOT EXISTS (
    SELECT 1 FROM asegurados a
    WHERE a.doc_paciente = t.num_doc_paciente
);

/*
Resultado esperado: 0

Si el resultado es > 0, hay registros huérfanos y necesitas ejecutar el PASO 4
antes de continuar con la FK.
*/

-- ============================================================================
-- PASO 2: Crear índice en asegurados.doc_paciente (optimización)
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_asegurados_doc_paciente
    ON asegurados(doc_paciente);

COMMENT ON INDEX idx_asegurados_doc_paciente IS
'Índice para optimizar búsquedas de asegurados por num_doc_paciente (usado por FK de TeleECG)';

-- ============================================================================
-- PASO 3: Agregar Foreign Key con ON DELETE RESTRICT
-- ============================================================================
-- ⚠️ ON DELETE RESTRICT: Previene eliminar asegurados que tengan imágenes ECG asociadas

ALTER TABLE tele_ecg_imagenes
ADD CONSTRAINT fk_tele_ecg_asegurado
FOREIGN KEY (num_doc_paciente)
REFERENCES asegurados(doc_paciente)
ON DELETE RESTRICT
ON UPDATE CASCADE;

-- Agregar comentario a la tabla para documentar el cambio
COMMENT ON CONSTRAINT fk_tele_ecg_asegurado ON tele_ecg_imagenes IS
'FK a asegurados.doc_paciente - Garantiza que todas las imágenes ECG tengan un asegurado válido registrado en la BD. ON DELETE RESTRICT previene eliminar asegurados con ECGs activos.';

-- ============================================================================
-- PASO 4: (OPCIONAL) Limpiar registros huérfanos si los hay
-- ============================================================================
-- ⚠️ SOLO DESCOMENTA Y EJECUTA SI EL PASO 1 MOSTRÓ REGISTROS ORFANOS

/*
-- Opción A: Eliminar registros huérfanos
DELETE FROM tele_ecg_imagenes
WHERE num_doc_paciente NOT IN (SELECT doc_paciente FROM asegurados);

-- Opción B: Registrar cuáles fueron eliminados
-- CREATE TEMP TABLE temp_orfanos AS
-- SELECT * FROM tele_ecg_imagenes
-- WHERE num_doc_paciente NOT IN (SELECT doc_paciente FROM asegurados);
--
-- -- Luego eliminar
-- DELETE FROM tele_ecg_imagenes
-- WHERE num_doc_paciente NOT IN (SELECT doc_paciente FROM asegurados);
*/

-- ============================================================================
-- PASO 5: Verificar que la FK se creó correctamente
-- ============================================================================

SELECT constraint_name, constraint_type, table_name
FROM information_schema.table_constraints
WHERE table_name = 'tele_ecg_imagenes'
  AND constraint_name = 'fk_tele_ecg_asegurado';

-- Resultado esperado: 1 fila mostrando FOREIGN KEY

-- ============================================================================
-- PASO 6: Verificar que NO hay violaciones de FK
-- ============================================================================

SELECT COUNT(*) as total_valido
FROM tele_ecg_imagenes t
WHERE EXISTS (
    SELECT 1 FROM asegurados a
    WHERE a.doc_paciente = t.num_doc_paciente
);

-- Este COUNT debería ser igual al total de registros en tele_ecg_imagenes

-- ============================================================================
-- DOCUMENTACIÓN PARA ROLLBACK (si es necesario)
-- ============================================================================
/*
-- Para deshacer los cambios, ejecutar:

ALTER TABLE tele_ecg_imagenes
DROP CONSTRAINT fk_tele_ecg_asegurado;

DROP INDEX IF EXISTS idx_asegurados_doc_paciente;
*/

-- ============================================================================
-- FIN DEL SCRIPT
-- ============================================================================
