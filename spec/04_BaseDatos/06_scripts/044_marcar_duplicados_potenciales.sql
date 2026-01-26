-- ============================================================================
-- MARCACIÓN DE DUPLICADOS POTENCIALES - tabla asegurados
-- ============================================================================
-- Propósito: Marcar registros de 7 caracteres que son duplicados potenciales
-- Impacto: 443,228 registros
-- Riesgo: BAJO (solo agrega columna y marca registros)
-- Reversibilidad: SI (UPDATE SET duplicado_potencial = false)
-- ============================================================================

-- PASO 1: AGREGAR COLUMNA duplicado_potencial
-- ============================================================================
SELECT 'PASO 1: AGREGAR COLUMNA' as paso;

ALTER TABLE asegurados
ADD COLUMN IF NOT EXISTS duplicado_potencial BOOLEAN DEFAULT false;

-- Verificar que la columna existe
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'asegurados' AND column_name = 'duplicado_potencial';

-- PASO 2: CREAR TABLA DE AUDITORÍA DE DUPLICADOS
-- ============================================================================
SELECT 'PASO 2: CREAR TABLA DE AUDITORÍA' as paso;

CREATE TABLE IF NOT EXISTS audit_duplicados_asegurados (
  audit_id SERIAL PRIMARY KEY,
  pk_asegurado_7 VARCHAR(255),
  doc_paciente VARCHAR(255) NOT NULL UNIQUE,
  paciente_7 VARCHAR(255),
  pk_asegurado_8 VARCHAR(255),
  paciente_8 VARCHAR(255),
  estado VARCHAR(50) DEFAULT 'PENDIENTE_REVISION',
  marcado_at TIMESTAMP DEFAULT NOW(),
  notas TEXT
);

CREATE INDEX IF NOT EXISTS idx_audit_dup_doc ON audit_duplicados_asegurados(doc_paciente);
CREATE INDEX IF NOT EXISTS idx_audit_dup_pk7 ON audit_duplicados_asegurados(pk_asegurado_7);
CREATE INDEX IF NOT EXISTS idx_audit_dup_estado ON audit_duplicados_asegurados(estado);

-- Verificar tabla
SELECT COUNT(*) as "Duplicados en tabla de auditoría" FROM audit_duplicados_asegurados;

-- PASO 3: REGISTRAR DUPLICADOS EN TABLA DE AUDITORÍA
-- ============================================================================
SELECT 'PASO 3: REGISTRAR DUPLICADOS' as paso;

INSERT INTO audit_duplicados_asegurados (pk_asegurado_7, doc_paciente, paciente_7, pk_asegurado_8, paciente_8)
SELECT
  a7.pk_asegurado as pk_asegurado_7,
  a7.doc_paciente,
  a7.paciente as paciente_7,
  a8.pk_asegurado as pk_asegurado_8,
  a8.paciente as paciente_8
FROM asegurados a7
INNER JOIN asegurados a8 ON LPAD(a7.doc_paciente, 8, '0') = a8.doc_paciente
WHERE LENGTH(a7.doc_paciente) = 7
  AND LENGTH(a8.doc_paciente) = 8
  AND NOT EXISTS (
    SELECT 1 FROM audit_duplicados_asegurados
    WHERE doc_paciente = a7.doc_paciente
  )
ON CONFLICT (doc_paciente) DO NOTHING;

SELECT COUNT(*) as "Registros insertados en auditoría" FROM audit_duplicados_asegurados;

-- PASO 4: MARCAR DUPLICADOS EN TABLA PRINCIPAL
-- ============================================================================
SELECT 'PASO 4: MARCAR DUPLICADOS POTENCIALES' as paso;

UPDATE asegurados
SET duplicado_potencial = true
WHERE pk_asegurado IN (
  SELECT pk_asegurado_7 FROM audit_duplicados_asegurados
);

SELECT COUNT(*) as "Registros marcados como duplicado_potencial"
FROM asegurados
WHERE duplicado_potencial = true;

-- PASO 5: VERIFICACIÓN
-- ============================================================================
SELECT 'PASO 5: VERIFICACIÓN' as paso;

-- Contar por estado de marcación
SELECT
  'Resumen de duplicados' as check_type,
  COUNT(*) as cantidad,
  SUM(CASE WHEN duplicado_potencial THEN 1 ELSE 0 END) as marcados,
  SUM(CASE WHEN duplicado_potencial THEN 0 ELSE 1 END) as no_marcados
FROM asegurados;

-- Ver ejemplos de duplicados marcados
SELECT
  'Ejemplo: Duplicados marcados (primeros 20)' as check_type;

SELECT
  pk_asegurado,
  doc_paciente,
  paciente,
  duplicado_potencial,
  vigencia,
  LENGTH(doc_paciente) as longitud_dni
FROM asegurados
WHERE duplicado_potencial = true
ORDER BY doc_paciente
LIMIT 20;

-- PASO 6: VALIDAR INTEGRIDAD
-- ============================================================================
SELECT 'PASO 6: VALIDAR INTEGRIDAD' as paso;

-- Verificar que no hay NULL en duplicado_potencial
SELECT
  COUNT(*) as "Registros con NULL en duplicado_potencial"
FROM asegurados
WHERE duplicado_potencial IS NULL;

-- Verificar que todas las FKs siguen intactas
SELECT
  COUNT(*) as "FKs rotas"
FROM asegurados a
LEFT JOIN dim_ipress di ON a.cas_adscripcion = di.cod_ipress
WHERE a.duplicado_potencial = true
  AND a.cas_adscripcion IS NOT NULL
  AND di.cod_ipress IS NULL;

-- Ver correlación: Los de 7 caracteres deberían estar todos marcados
SELECT
  'DNIs de 7 caracteres' as categoria,
  COUNT(*) as total,
  SUM(CASE WHEN duplicado_potencial THEN 1 ELSE 0 END) as marcados,
  SUM(CASE WHEN duplicado_potencial THEN 0 ELSE 1 END) as no_marcados
FROM asegurados
WHERE LENGTH(doc_paciente) = 7;

-- PASO 7: ESTADÍSTICAS FINALES
-- ============================================================================
SELECT 'PASO 7: ESTADÍSTICAS FINALES' as paso;

SELECT
  LENGTH(doc_paciente) as longitud_dni,
  COUNT(*) as total,
  SUM(CASE WHEN duplicado_potencial THEN 1 ELSE 0 END) as marcados_como_dup,
  ROUND(SUM(CASE WHEN duplicado_potencial THEN 1 ELSE 0 END)::NUMERIC / COUNT(*) * 100, 2) as porcentaje
FROM asegurados
WHERE doc_paciente IS NOT NULL
GROUP BY LENGTH(doc_paciente)
ORDER BY longitud_dni;

-- PASO 8: REVERSIÓN (SOLO SI ES NECESARIO)
-- ============================================================================
/*
-- DESHACER CAMBIOS si es necesario:

SELECT 'REVERTIR CAMBIOS' as paso;

-- Desmarcar duplicados
UPDATE asegurados
SET duplicado_potencial = false;

-- Limpiar tabla de auditoría
DELETE FROM audit_duplicados_asegurados;

-- Verificar
SELECT COUNT(*) FROM asegurados WHERE duplicado_potencial = true;
SELECT COUNT(*) FROM audit_duplicados_asegurados;

*/

-- ============================================================================
-- CONCLUSIÓN
-- ============================================================================
/*
RESULTADO ESPERADO:
✅ Columna duplicado_potencial: AGREGADA
✅ Tabla audit_duplicados_asegurados: CREADA con 443,228 registros
✅ Registros marcados: 443,228
✅ Integridad FK: MANTENIDA
✅ No hay nulls: CONFIRMADO
✅ Reversible: SI (UPDATE duplicado_potencial = false)

REGISTROS MARCADOS: 443,228
STATUS: ✅ SEGURO EJECUTAR
RIESGO: BAJO
REVERSIBILIDAD: ALTA
*/
