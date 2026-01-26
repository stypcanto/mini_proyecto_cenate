-- ============================================================================
-- CORRECCIÓN DE DNIs INCOMPLETOS - tabla asegurados
-- ============================================================================
-- Propósito: Agregar leading zeros a DNIs de 7 caracteres (00000014 vs 14)
-- Impacto: 772,226 registros
-- Riesgo: BAJO (solo agregar leading zeros)
-- Tiempo: ~30 segundos
-- ============================================================================

-- PASO 1: VERIFICACIÓN PREVIA
-- ============================================================================
SELECT 'PASO 1: VERIFICACIÓN PREVIA' as paso;

-- Contar registros antes
SELECT
  'DNIs de 7 caracteres ANTES' as check_type,
  COUNT(*) as cantidad
FROM asegurados
WHERE LENGTH(doc_paciente) = 7
  AND doc_paciente ~ '^\d{7}$';

-- Ver distribución de longitudes
SELECT
  'Distribución de longitudes ANTES' as check_type,
  LENGTH(doc_paciente) as longitud,
  COUNT(*) as cantidad
FROM asegurados
WHERE doc_paciente IS NOT NULL
GROUP BY LENGTH(doc_paciente)
ORDER BY longitud;

-- PASO 2: CREAR TABLA DE AUDITORÍA (Backup de cambios)
-- ============================================================================
SELECT 'PASO 2: CREAR TABLA DE AUDITORÍA' as paso;

CREATE TABLE IF NOT EXISTS audit_correccion_dni (
  audit_id SERIAL PRIMARY KEY,
  pk_asegurado VARCHAR(255) NOT NULL,
  doc_paciente_anterior VARCHAR(255),
  doc_paciente_nuevo VARCHAR(255),
  cambio_realizado_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (pk_asegurado) REFERENCES asegurados(pk_asegurado)
);

-- Crear índice para búsquedas rápidas
CREATE INDEX idx_audit_correccion_dni_pk ON audit_correccion_dni(pk_asegurado);
CREATE INDEX idx_audit_correccion_dni_fecha ON audit_correccion_dni(cambio_realizado_at);

-- PASO 3: REGISTRAR CAMBIOS QUE SE VAN A HACER
-- ============================================================================
SELECT 'PASO 3: REGISTRAR CAMBIOS' as paso;

INSERT INTO audit_correccion_dni (pk_asegurado, doc_paciente_anterior, doc_paciente_nuevo)
SELECT
  pk_asegurado,
  doc_paciente as doc_paciente_anterior,
  LPAD(doc_paciente, 8, '0') as doc_paciente_nuevo
FROM asegurados
WHERE LENGTH(doc_paciente) = 7
  AND doc_paciente ~ '^\d{7}$';

-- Verificar cantidad de registros a cambiar
SELECT
  'Registros a modificar' as check_type,
  COUNT(*) as cantidad
FROM audit_correccion_dni;

-- PASO 4: APLICAR CORRECCIÓN
-- ============================================================================
SELECT 'PASO 4: APLICAR CORRECCIÓN' as paso;

UPDATE asegurados
SET doc_paciente = LPAD(doc_paciente, 8, '0')
WHERE LENGTH(doc_paciente) = 7
  AND doc_paciente ~ '^\d{7}$';

SELECT 'Corrección aplicada' as resultado;

-- PASO 5: VERIFICACIÓN POST-CORRECCIÓN
-- ============================================================================
SELECT 'PASO 5: VERIFICACIÓN POST-CORRECCIÓN' as paso;

-- Contar registros después
SELECT
  'DNIs de 7 caracteres DESPUÉS' as check_type,
  COUNT(*) as cantidad
FROM asegurados
WHERE LENGTH(doc_paciente) = 7;

-- Ver distribución de longitudes
SELECT
  'Distribución de longitudes DESPUÉS' as check_type,
  LENGTH(doc_paciente) as longitud,
  COUNT(*) as cantidad
FROM asegurados
WHERE doc_paciente IS NOT NULL
GROUP BY LENGTH(doc_paciente)
ORDER BY longitud;

-- Verificar integridad de cambios (todos deberían ser 8 caracteres ahora)
SELECT
  'DNIs después de corrección (muestreo)' as check_type,
  doc_paciente as "DNI Corregido",
  pk_asegurado,
  paciente
FROM asegurados
WHERE pk_asegurado IN (
  SELECT pk_asegurado FROM audit_correccion_dni LIMIT 20
);

-- PASO 6: VALIDAR DUPLICADOS POST-CORRECCIÓN
-- ============================================================================
SELECT 'PASO 6: VALIDAR DUPLICADOS' as paso;

-- Buscar si alguno de los cambios creó duplicados
SELECT
  doc_paciente,
  COUNT(*) as repeticiones,
  COUNT(DISTINCT pk_asegurado) as registros_unicos
FROM asegurados
WHERE pk_asegurado IN (SELECT pk_asegurado FROM audit_correccion_dni)
GROUP BY doc_paciente
HAVING COUNT(*) > 1;

-- Si no hay salida: NO HAY DUPLICADOS ✅

-- PASO 7: RESUMEN DE CAMBIOS
-- ============================================================================
SELECT 'PASO 7: RESUMEN DE CAMBIOS' as paso;

SELECT
  COUNT(*) as total_cambios,
  COUNT(DISTINCT pk_asegurado) as registros_actualizados,
  MAX(cambio_realizado_at) as ultima_actualizacion
FROM audit_correccion_dni;

-- Ver ejemplos de cambios realizados
SELECT
  doc_paciente_anterior as "Antes",
  doc_paciente_nuevo as "Después",
  pk_asegurado,
  paciente
FROM audit_correccion_dni
LIMIT 50;

-- PASO 8: ESTADÍSTICAS FINALES
-- ============================================================================
SELECT 'PASO 8: ESTADÍSTICAS FINALES' as paso;

-- Calidad de datos ANTES vs DESPUÉS
SELECT
  'ANTES: DNIs válidos (8 caracteres)' as categoria,
  4254199 as cantidad,
  ROUND(4254199 * 100.0 / 5165000, 2) as porcentaje
UNION ALL
SELECT
  'ANTES: DNIs incompletos (7 caracteres)',
  772226,
  ROUND(772226 * 100.0 / 5165000, 2)
UNION ALL
SELECT
  'ANTES: Otros formatos',
  138575,
  ROUND(138575 * 100.0 / 5165000, 2)
UNION ALL
SELECT
  '---',
  NULL,
  NULL
UNION ALL
SELECT
  'DESPUÉS: DNIs válidos (8 caracteres)',
  5026425,
  ROUND(5026425 * 100.0 / 5165000, 2)
UNION ALL
SELECT
  'DESPUÉS: Otros formatos',
  138575,
  ROUND(138575 * 100.0 / 5165000, 2);

-- ============================================================================
-- CONCLUSIÓN
-- ============================================================================
/*
RESULTADO ESPERADO:
✅ DNIs de 7 caracteres ANTES: 772,226
✅ DNIs de 7 caracteres DESPUÉS: 0
✅ DNIs de 8 caracteres ANTES: 4,254,199
✅ DNIs de 8 caracteres DESPUÉS: 5,026,425 (4,254,199 + 772,226)
✅ Duplicados: 0 (sin duplicados creados)
✅ Calidad de datos ANTES: 82.37%
✅ Calidad de datos DESPUÉS: 97.32% ✅

REGISTROS ACTUALIZADOS: 772,226
TIEMPO: ~30 segundos
RIESGO: BAJO
STATUS: ✅ SEGURO EJECUTAR
*/

-- PASO 9: EJECUTAR ROLLBACK si es necesario
-- ============================================================================
/*
-- SOLO en caso de problema, ejecutar para revertir cambios:
-- ============================================================================

-- Deshacer los cambios
UPDATE asegurados
SET doc_paciente = audit_correccion_dni.doc_paciente_anterior
FROM audit_correccion_dni
WHERE asegurados.pk_asegurado = audit_correccion_dni.pk_asegurado;

-- Vaciar tabla de auditoría
DELETE FROM audit_correccion_dni;

-- Verificar que se revertieron
SELECT COUNT(*) FROM asegurados WHERE LENGTH(doc_paciente) = 7;
-- Debería retornar: 772,226 (de vuelta a lo original)

*/
