-- Migration V3_3_2: Crear jerarquía colapsable para Módulo 107
-- Fecha: 2026-01-29
-- Descripción: Agrupa las páginas de Módulo 107 bajo una página padre colapsable
--              Estructura final: Bolsas de Pacientes → Módulo 107 (colapsable) → Subpáginas

-- 1. Crear página padre "Módulo 107" dentro del módulo "Bolsas de Pacientes"
WITH bolsas_modulo AS (
  SELECT id_modulo FROM dim_modulos_sistema
  WHERE nombre_modulo = 'Bolsas de Pacientes'
)
INSERT INTO dim_paginas_modulo (id_modulo, nombre_pagina, ruta_pagina, icono, orden, activo, created_at, updated_at)
SELECT
  bm.id_modulo,
  'Módulo 107',
  '/bolsas/modulo107',
  'Package',
  6,
  true,
  NOW(),
  NOW()
FROM bolsas_modulo bm
WHERE NOT EXISTS (
  SELECT 1 FROM dim_paginas_modulo
  WHERE nombre_pagina = 'Módulo 107'
    AND ruta_pagina = '/bolsas/modulo107'
);

-- 2. Actualizar las páginas de Módulo 107 para que apunten a la página padre
WITH padre_id AS (
  SELECT id_pagina FROM dim_paginas_modulo
  WHERE nombre_pagina = 'Módulo 107'
    AND ruta_pagina = '/bolsas/modulo107'
    AND id_modulo = (SELECT id_modulo FROM dim_modulos_sistema WHERE nombre_modulo = 'Bolsas de Pacientes')
)
UPDATE dim_paginas_modulo
SET id_pagina_padre = (SELECT id_pagina FROM padre_id),
    updated_at = NOW()
WHERE ruta_pagina LIKE '/bolsas/modulo107/%'
  AND ruta_pagina != '/bolsas/modulo107'
  AND id_pagina_padre IS NULL;

-- Resultado: Se crea una página padre colapsable "Módulo 107" con todas sus subpáginas
-- El frontend renderizará automáticamente como:
--   Bolsas de Pacientes
--   └── Módulo 107 [▼]
--       ├── Carga de Pacientes 107
--       ├── Atenciones Clínicas
--       ├── Pacientes de 107
--       ├── Asignación de Pacientes
--       ├── Bienvenida
--       └── ... (y otras páginas de módulo107)
