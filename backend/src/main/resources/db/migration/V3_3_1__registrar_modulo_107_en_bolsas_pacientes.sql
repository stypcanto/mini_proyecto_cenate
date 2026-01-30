-- ============================================================
-- V3_3_1__registrar_modulo_107_en_bolsas_pacientes.sql
-- Registrar Módulo 107 como subgrupo de Bolsas de Pacientes
-- Cambio Arquitectónico: Módulo 107 debe estar DENTRO de Bolsas
-- Fecha: 2026-01-29
-- ============================================================

-- ============================================================
-- FASE 1: Obtener ID del módulo "Bolsas de Pacientes"
-- ============================================================

WITH bolsas_module AS (
  SELECT id_modulo FROM dim_modulos_sistema
  WHERE nombre_modulo = 'Bolsas de Pacientes'
  LIMIT 1
)

-- ============================================================
-- FASE 2: Insertar las 5 páginas del Módulo 107
--         DENTRO de "Bolsas de Pacientes"
-- ============================================================

INSERT INTO dim_paginas_modulo (id_modulo, nombre_pagina, ruta_pagina, icono, orden, activo)
SELECT
  bm.id_modulo,
  pagina.nombre_pagina,
  pagina.ruta_pagina,
  pagina.icono,
  pagina.orden,
  true
FROM bolsas_module bm,
LATERAL (
  VALUES
    ('Módulo 107 Dashboard', '/bolsas/modulo107/dashboard', 'FileSpreadsheet', 7),
    ('Cargar Excel', '/bolsas/modulo107/cargar-excel', 'Upload', 8),
    ('Listado', '/bolsas/modulo107/listado', 'List', 9),
    ('Búsqueda', '/bolsas/modulo107/buscar', 'Search', 10),
    ('Estadísticas', '/bolsas/modulo107/estadisticas', 'BarChart3', 11)
) pagina(nombre_pagina, ruta_pagina, icono, orden)
WHERE NOT EXISTS (
  SELECT 1 FROM dim_paginas_modulo dp
  WHERE dp.id_modulo = bm.id_modulo
    AND dp.ruta_pagina = pagina.ruta_pagina
);

-- ============================================================
-- FASE 3: LIMPIAR - Eliminar Módulo 107 independiente (si existe)
-- ============================================================

-- Eliminación de páginas del módulo independiente "Módulo 107" (si existe)
DELETE FROM dim_paginas_modulo
WHERE id_modulo IN (
  SELECT id_modulo FROM dim_modulos_sistema
  WHERE nombre_modulo = 'Módulo 107'
);

-- Eliminación del módulo independiente "Módulo 107" (si existe)
DELETE FROM dim_modulos_sistema
WHERE nombre_modulo = 'Módulo 107';

-- ============================================================
-- FASE 4: VERIFICACIÓN
-- ============================================================

DO $$
DECLARE
  v_total_inserted INT;
BEGIN
  -- Contar páginas de Módulo 107 dentro de Bolsas de Pacientes
  SELECT COUNT(*) INTO v_total_inserted
  FROM dim_paginas_modulo dp
  WHERE dp.ruta_pagina LIKE '/bolsas/modulo107/%'
    AND dp.id_modulo IN (
      SELECT id_modulo FROM dim_modulos_sistema
      WHERE nombre_modulo = 'Bolsas de Pacientes'
    );

  RAISE NOTICE '';
  RAISE NOTICE '╔════════════════════════════════════════════════════════════╗';
  RAISE NOTICE '║     INTEGRACIÓN MÓDULO 107 EN BOLSAS DE PACIENTES         ║';
  RAISE NOTICE '╠════════════════════════════════════════════════════════════╣';
  RAISE NOTICE '║ Páginas registradas: %', LPAD(v_total_inserted::TEXT, 10);
  RAISE NOTICE '╚════════════════════════════════════════════════════════════╝';
  RAISE NOTICE '';

  IF v_total_inserted = 5 THEN
    RAISE NOTICE '✅ Integración exitosa: 5 páginas de Módulo 107 creadas';
  ELSE
    RAISE WARNING '⚠️ Verificar integridad: Se esperaban 5 páginas, se encontraron %', v_total_inserted;
  END IF;

END $$;

-- ============================================================
-- ROLLBACK INSTRUCTIONS
-- ============================================================
--
-- Para revertir esta migración:
--
-- BEGIN TRANSACTION;
--
-- -- Eliminar páginas de Módulo 107 dentro de Bolsas
-- DELETE FROM dim_paginas_modulo
-- WHERE ruta_pagina LIKE '/bolsas/modulo107/%'
--   AND id_modulo IN (
--     SELECT id_modulo FROM dim_modulos_sistema
--     WHERE nombre_modulo = 'Bolsas de Pacientes'
--   );
--
-- COMMIT;
--
-- ============================================================
