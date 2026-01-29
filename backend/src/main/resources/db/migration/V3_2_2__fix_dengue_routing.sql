-- ============================================================
-- V3_2_2__fix_dengue_routing.sql
-- Corrección de rutas en módulo Dengue
-- Fecha: 2026-01-29
-- ============================================================

-- Actualizar las rutas de las páginas del módulo Dengue
-- para que coincidan con las rutas del frontend

-- Obtener el ID del módulo Dengue
SET @dengue_module_id = (SELECT id_modulo FROM dim_modulos WHERE nombre_modulo = 'Dengue' LIMIT 1);

-- Si el módulo Dengue existe, actualizar sus páginas
IF @dengue_module_id IS NOT NULL THEN

  -- Actualizar "Cargar Excel"
  UPDATE dim_paginas_modulo
  SET ruta_pagina = '/dengue/cargar-excel'
  WHERE id_modulo = @dengue_module_id
    AND nombre_pagina LIKE '%Cargar%'
    AND nombre_pagina LIKE '%Excel%';

  -- Actualizar "Listar Casos"
  UPDATE dim_paginas_modulo
  SET ruta_pagina = '/dengue/listar-casos'
  WHERE id_modulo = @dengue_module_id
    AND nombre_pagina LIKE '%Listar%'
    AND nombre_pagina LIKE '%Caso%';

  -- Actualizar "Buscar"
  UPDATE dim_paginas_modulo
  SET ruta_pagina = '/dengue/buscar'
  WHERE id_modulo = @dengue_module_id
    AND nombre_pagina = 'Buscar';

  -- Actualizar "Resultados"
  UPDATE dim_paginas_modulo
  SET ruta_pagina = '/dengue/resultados'
  WHERE id_modulo = @dengue_module_id
    AND nombre_pagina = 'Resultados';

END IF;
