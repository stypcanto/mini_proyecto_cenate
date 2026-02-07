-- ========================================================================
-- Fix TeleEKG Sidebar - Consolidar dos páginas en una (v1.52.2)
-- ========================================================================
-- Problema: Sidebar mostraba "Subir Electrocardiogramas" y "Registro de
-- Pacientes" como dos opciones separadas, causando confusión
--
-- Solución: Unificar en una sola entrada "IPRESS Workspace" que incluya
-- ambas funcionalidades (upload + lista)
--
-- Tablas:
--  - dim_paginas_modulo: Define las páginas que aparecen en el sidebar
-- ========================================================================

BEGIN;

-- 1. Encontrar el ID del módulo "TELE EKG"
SELECT 'Módulos TELE EKG encontrados:' as info;
SELECT id_modulo, nombre_modulo FROM dim_modulos_sistema
WHERE LOWER(nombre_modulo) LIKE '%tele%ekga%' OR LOWER(nombre_modulo) LIKE '%tele ecg%'
ORDER BY id_modulo;

-- 2. Encontrar las páginas actuales de TELE EKG
SELECT 'Páginas actuales en TELE EKG:' as info;
SELECT id_pagina, nombre_pagina, ruta FROM dim_paginas_modulo
WHERE id_modulo IN (
  SELECT id_modulo FROM dim_modulos_sistema
  WHERE LOWER(nombre_modulo) LIKE '%tele%ekga%' OR LOWER(nombre_modulo) LIKE '%tele ecg%'
)
ORDER BY id_pagina;

-- 3. Obtener ID del módulo TELE EKG (será usado en los UPDATE)
-- Reemplazar [MODULO_ID] con el resultado de la query anterior
-- Ejemplo: si el resultado es id_modulo = 25, usar 25

-- OPCIÓN A: Si las dos páginas están en el mismo módulo TELE EKG
-- Mantener "Subir Electrocardiogramas" y eliminar "Registro de Pacientes"

-- Actualizar la página "Subir Electrocardiogramas" para que sea "IPRESS Workspace"
UPDATE dim_paginas_modulo
SET
  nombre_pagina = 'IPRESS Workspace',
  descripcion = 'Carga y gestión de electrocardiogramas ECG - Interfaz unificada',
  ruta = '/teleekgs/ipress-workspace',
  activo = true,
  updated_at = NOW()
WHERE LOWER(nombre_pagina) LIKE '%subir%electrocard%'
  AND id_modulo IN (
    SELECT id_modulo FROM dim_modulos_sistema
    WHERE LOWER(nombre_modulo) LIKE '%tele%ekga%' OR LOWER(nombre_modulo) LIKE '%tele ecg%'
  );

-- Verificar el cambio
SELECT 'Página actualizada a:' as info;
SELECT id_pagina, nombre_pagina, ruta FROM dim_paginas_modulo
WHERE nombre_pagina = 'IPRESS Workspace';

-- Eliminar la página "Registro de Pacientes" (ahora está integrada en IPRESS Workspace)
DELETE FROM dim_paginas_modulo
WHERE LOWER(nombre_pagina) LIKE '%registro%de%pacientes%'
  AND id_modulo IN (
    SELECT id_modulo FROM dim_modulos_sistema
    WHERE LOWER(nombre_modulo) LIKE '%tele%ekga%' OR LOWER(nombre_modulo) LIKE '%tele ecg%'
  );

-- Verificar que fue eliminada
SELECT 'Páginas restantes en TELE EKG:' as info;
SELECT id_pagina, nombre_pagina, ruta FROM dim_paginas_modulo
WHERE id_modulo IN (
  SELECT id_modulo FROM dim_modulos_sistema
  WHERE LOWER(nombre_modulo) LIKE '%tele%ekga%' OR LOWER(nombre_modulo) LIKE '%tele ecg%'
)
ORDER BY id_pagina;

-- 4. ALTERNATIVA: Si necesitas mantener las rutas antiguas como aliases
-- (Para backward compatibility, las rutas antiguas seguirán funcionando vía componentRegistry.js)
-- No necesita cambios en BD

COMMIT;

-- ========================================================================
-- VERIFICACIÓN FINAL
-- ========================================================================
-- Después de ejecutar, el sidebar debe mostrar:
--
-- TELE EKG
--  ├─ IPRESS Workspace (unificado) ✅
--  └─ Estadísticas (si existe)
--
-- Las rutas antiguas seguirán funcionando (redirigen a IPRESS Workspace):
--  - /teleekgs/upload → IPRESSWorkspace
--  - /teleekgs/listar → IPRESSWorkspace
-- ========================================================================
