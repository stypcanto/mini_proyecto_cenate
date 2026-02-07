-- ========================================================================
-- SCRIPT AUTO-EJECUTABLE: Consolidar TeleEKG Sidebar (v1.52.2)
-- ========================================================================
-- Este script:
-- 1. Encuentra automáticamente el módulo TELE EKG
-- 2. Actualiza "Subir Electrocardiogramas" → "IPRESS Workspace"
-- 3. Elimina "Registro de Pacientes" (ahora integrado en IPRESS Workspace)
-- 4. Verifica los resultados
-- ========================================================================

BEGIN;

-- ========================================================================
-- PASO 1: Consolidar las dos páginas en una sola
-- ========================================================================

-- Actualizar "Subir Electrocardiogramas" → "IPRESS Workspace"
WITH tele_ekg_modulo AS (
  SELECT id_modulo
  FROM dim_modulos_sistema
  WHERE LOWER(nombre_modulo) LIKE '%tele%ekga%'
     OR LOWER(nombre_modulo) LIKE '%tele ecg%'
  LIMIT 1
)
UPDATE dim_paginas_modulo
SET
  nombre_pagina = 'IPRESS Workspace',
  descripcion = 'Carga y gestión unificada de electrocardiogramas (ECG). Interfaz con funcionalidad de upload, listado y estadísticas integradas.',
  ruta = '/teleekgs/ipress-workspace',
  activo = true,
  updated_at = NOW()
WHERE id_modulo = (SELECT id_modulo FROM tele_ekg_modulo)
  AND LOWER(nombre_pagina) LIKE '%subir%electrocard%';

-- ========================================================================
-- PASO 2: Eliminar la página duplicada "Registro de Pacientes"
-- ========================================================================

WITH tele_ekg_modulo AS (
  SELECT id_modulo
  FROM dim_modulos_sistema
  WHERE LOWER(nombre_modulo) LIKE '%tele%ekga%'
     OR LOWER(nombre_modulo) LIKE '%tele ecg%'
  LIMIT 1
)
DELETE FROM dim_paginas_modulo
WHERE id_modulo = (SELECT id_modulo FROM tele_ekg_modulo)
  AND LOWER(nombre_pagina) LIKE '%registro%de%pacientes%';

-- ========================================================================
-- PASO 3: Verificación final
-- ========================================================================

SELECT 'Sidebar TELE EKG después de consolidación:' as "== VERIFICACIÓN ==";

WITH tele_ekg_modulo AS (
  SELECT id_modulo, nombre_modulo
  FROM dim_modulos_sistema
  WHERE LOWER(nombre_modulo) LIKE '%tele%ekga%'
     OR LOWER(nombre_modulo) LIKE '%tele ecg%'
  LIMIT 1
)
SELECT
  t.nombre_modulo as "Módulo",
  p.nombre_pagina as "Página",
  p.ruta as "Ruta",
  p.activo as "Activo"
FROM tele_ekg_modulo t
INNER JOIN dim_paginas_modulo p ON t.id_modulo = p.id_modulo
ORDER BY p.id_pagina;

-- ========================================================================
-- PASO 4: Validar cambios
-- ========================================================================

SELECT 'Status:' as "== VALIDACIÓN ==";
SELECT CASE
  WHEN COUNT(*) = 1 THEN '✅ CONSOLIDACIÓN EXITOSA - Una sola entrada en sidebar'
  WHEN COUNT(*) = 2 THEN '⚠️ CONSOLIDACIÓN PARCIAL - Aún hay dos entradas'
  ELSE '❌ ERROR - Número inesperado de páginas: ' || COUNT(*)
END as status
FROM dim_paginas_modulo p
INNER JOIN dim_modulos_sistema m ON p.id_modulo = m.id_modulo
WHERE LOWER(m.nombre_modulo) LIKE '%tele%ekga%'
   OR LOWER(m.nombre_modulo) LIKE '%tele ecg%';

-- ========================================================================
-- NOTAS:
-- ========================================================================
-- ✅ Las rutas antiguas seguirán funcionando (redirigen vía componentRegistry.js):
--    - /teleekgs/upload → IPRESSWorkspace ✓
--    - /teleekgs/listar → IPRESSWorkspace ✓
--
-- ✅ Ahora el sidebar mostrará:
--    TELE EKG
--      └── IPRESS Workspace (unificado)
--
-- ⚠️  Si necesitas revertir, guarda un backup anterior o restaura estas columnas:
--    nombre_pagina, ruta, descripcion, updated_at
-- ========================================================================

COMMIT;
