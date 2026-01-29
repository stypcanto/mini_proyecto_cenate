-- ============================================================
-- V3_2_3__crear_modulo_dengue.sql
-- Crear módulo Dengue con todas sus páginas
-- Fecha: 2026-01-29
-- ============================================================

-- 1. Crear el módulo Dengue si no existe
INSERT INTO dim_modulos_sistema (nombre_modulo, descripcion_modulo, orden)
SELECT 'Dengue', 'Módulo de gestión de casos de Dengue', 15
WHERE NOT EXISTS (
  SELECT 1 FROM dim_modulos_sistema WHERE nombre_modulo = 'Dengue'
);

-- 2. Obtener el ID del módulo Dengue
WITH dengue_module AS (
  SELECT id_modulo FROM dim_modulos_sistema
  WHERE nombre_modulo = 'Dengue'
  LIMIT 1
)

-- 3. Crear las páginas (subpáginas) del módulo Dengue
INSERT INTO dim_paginas_modulo (id_modulo, nombre_pagina, ruta_pagina, icono, orden, activo)
SELECT
  dm.id_modulo,
  pagina.nombre_pagina,
  pagina.ruta_pagina,
  pagina.icono,
  pagina.orden,
  true
FROM dengue_module dm,
LATERAL (
  VALUES
    ('Dengue', '/dengue/dashboard', 'Bug', 1),
    ('Cargar Excel', '/dengue/cargar-excel', 'Upload', 2),
    ('Listar Casos', '/dengue/listar-casos', 'List', 3),
    ('Buscar', '/dengue/buscar', 'Search', 4),
    ('Resultados', '/dengue/resultados', 'BarChart3', 5)
) pagina(nombre_pagina, ruta_pagina, icono, orden)
WHERE NOT EXISTS (
  SELECT 1 FROM dim_paginas_modulo dp
  WHERE dp.id_modulo = dm.id_modulo
    AND dp.ruta_pagina = pagina.ruta_pagina
);
