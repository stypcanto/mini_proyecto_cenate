-- ============================================================
-- V3_3_3__restringir_acceso_coordinador_gestion_citas_modulo107.sql
-- Restricción de acceso para COORDINADOR_GESTION_CITAS a Módulo 107
-- Fecha: 2026-01-30
-- Descripción: El Coordinador de Gestión de Citas NO debe acceder a:
--   1. Bienvenida del Módulo 107
--   2. Cargar Pacientes 107 (Cargar Excel)
-- ============================================================

-- Obtener el rol_id para COORDINADOR_GESTION_CITAS
WITH coordinador_gestion_citas AS (
  SELECT id_rol
  FROM dim_roles
  WHERE nombre_rol = 'COORDINADOR_GESTION_CITAS'
    OR nombre_rol = 'COORD. GESTION CITAS'
  LIMIT 1
),

-- Obtener las página IDs a las que NO debería tener acceso
paginas_restringidas AS (
  SELECT id_pagina
  FROM dim_paginas_modulo
  WHERE nombre_pagina IN ('Bienvenida', 'Cargar Excel', 'Carga de Pacientes 107')
     OR ruta_pagina IN ('/bolsas/modulo107/bienvenida',
                        '/bolsas/modulo107/cargar-excel',
                        '/bolsas/modulo107/carga-de-pacientes-107')
)

-- ============================================================
-- Opción 1: DEACTIVAR permisos existentes (SEGURO - permite recuperación)
-- ============================================================
UPDATE dim_permisos_modulares
SET
  puede_ver = false,
  puede_crear = false,
  puede_editar = false,
  puede_eliminar = false,
  puede_exportar = false,
  puede_aprobar = false,
  activo = false,
  updated_at = NOW()
WHERE id_rol IN (SELECT id_rol FROM coordinador_gestion_citas)
  AND id_pagina IN (SELECT id_pagina FROM paginas_restringidas)
  AND activo = true;

-- Verificar cambios aplicados
DO $$
DECLARE
  v_role_id INT;
  v_pages_restricted INT;
  v_role_name VARCHAR(100);
BEGIN
  -- Obtener info del rol
  SELECT id_rol, nombre_rol INTO v_role_id, v_role_name
  FROM dim_roles
  WHERE nombre_rol = 'COORDINADOR_GESTION_CITAS'
    OR nombre_rol = 'COORD. GESTION CITAS'
  LIMIT 1;

  -- Contar permisos restringidos
  SELECT COUNT(*) INTO v_pages_restricted
  FROM dim_permisos_modulares dpm
  JOIN dim_paginas_modulo dpp ON dpm.id_pagina = dpp.id_pagina
  WHERE dpm.id_rol = v_role_id
    AND (dpp.nombre_pagina = 'Bienvenida' OR dpp.ruta_pagina = '/bolsas/modulo107/bienvenida'
         OR dpp.nombre_pagina = 'Cargar Excel' OR dpp.ruta_pagina = '/bolsas/modulo107/cargar-excel')
    AND dpm.activo = false;

  RAISE NOTICE '';
  RAISE NOTICE '╔════════════════════════════════════════════════════════════╗';
  RAISE NOTICE '║ RESTRICCIÓN DE ACCESO - MÓDULO 107                         ║';
  RAISE NOTICE '╠════════════════════════════════════════════════════════════╣';
  RAISE NOTICE '║ Rol: %', LPAD(COALESCE(v_role_name, 'NO ENCONTRADO'), 45);
  RAISE NOTICE '║ Páginas restringidas: %', LPAD(v_pages_restricted::TEXT, 35);
  RAISE NOTICE '╚════════════════════════════════════════════════════════════╝';
  RAISE NOTICE '';

  IF v_pages_restricted = 2 THEN
    RAISE NOTICE '✅ Restricción exitosa: 2 páginas desactivadas para el coordinador';
  ELSIF v_pages_restricted = 1 THEN
    RAISE WARNING '⚠️ Solo se restringió 1 página (verificar existencia de ambas)';
  ELSE
    RAISE WARNING '⚠️ No se encontraron permisos para restringir (verificar rol y páginas)';
  END IF;

END $$;

-- ============================================================
-- VERIFICACIÓN: Comprobar que el rol NO tiene acceso
-- ============================================================
-- Ejecutar esta consulta después de la migración:
--
-- SELECT
--   dpp.nombre_pagina,
--   dpp.ruta_pagina,
--   dr.nombre_rol,
--   dpm.puede_ver,
--   dpm.activo
-- FROM dim_permisos_modulares dpm
-- JOIN dim_paginas_modulo dpp ON dpm.id_pagina = dpp.id_pagina
-- JOIN dim_roles dr ON dpm.id_rol = dr.id_rol
-- WHERE dr.nombre_rol IN ('COORDINADOR_GESTION_CITAS', 'COORD. GESTION CITAS')
--   AND (dpp.ruta_pagina LIKE '/bolsas/modulo107/bienvenida%'
--        OR dpp.ruta_pagina = '/bolsas/modulo107/cargar-excel')
-- ORDER BY dpp.ruta_pagina;
