-- ============================================================
-- V3_3_3__restringir_acceso_coordinador_gestion_citas_modulo107.sql
-- Restricción de acceso para COORDINADOR_GESTION_CITAS a Módulo 107
-- Fecha: 2026-01-30
-- Descripción: El Coordinador de Gestión de Citas NO debe acceder a:
--   1. Bienvenida del Módulo 107
--   2. Carga de Pacientes 107 (Cargar Excel)
--
-- NOTA: Este script ELIMINA los permisos en lugar de solo desactivarlos
--       para asegurar que no haya acceso frontal ni en backend
-- ============================================================

-- ============================================================
-- PASO 1: Obtener el rol_id para COORDINADOR_GESTION_CITAS
-- ============================================================
DO $$
DECLARE
  v_role_id INT;
  v_role_name VARCHAR(100);
  v_page1_id INT;
  v_page2_id INT;
  v_deleted_count INT;
BEGIN
  -- Obtener ID del rol (soporta ambos formatos)
  SELECT id_rol, nombre_rol INTO v_role_id, v_role_name
  FROM dim_roles
  WHERE UPPER(nombre_rol) = 'COORDINADOR_GESTION_CITAS'
     OR UPPER(nombre_rol) = 'COORD. GESTION CITAS'
  LIMIT 1;

  IF v_role_id IS NULL THEN
    RAISE NOTICE '❌ No se encontró el rol COORDINADOR_GESTION_CITAS en la BD';
    RETURN;
  END IF;

  RAISE NOTICE '✅ Rol encontrado: % (ID: %)', v_role_name, v_role_id;

  -- ============================================================
  -- PASO 2: Obtener IDs de las páginas a restringir
  -- ============================================================

  -- Página 1: Bienvenida
  SELECT id_pagina INTO v_page1_id
  FROM dim_paginas_modulo
  WHERE ruta_pagina = '/bolsas/modulo107/bienvenida'
  LIMIT 1;

  -- Página 2: Carga de Pacientes 107
  SELECT id_pagina INTO v_page2_id
  FROM dim_paginas_modulo
  WHERE ruta_pagina = '/bolsas/modulo107/carga-de-pacientes-107'
  LIMIT 1;

  IF v_page1_id IS NULL THEN
    RAISE WARNING '⚠️ Página Bienvenida no encontrada';
  ELSE
    RAISE NOTICE '✅ Página encontrada: Bienvenida (ID: %)', v_page1_id;
  END IF;

  IF v_page2_id IS NULL THEN
    RAISE WARNING '⚠️ Página Carga de Pacientes 107 no encontrada';
  ELSE
    RAISE NOTICE '✅ Página encontrada: Carga de Pacientes 107 (ID: %)', v_page2_id;
  END IF;

  -- ============================================================
  -- PASO 3: ELIMINAR permisos para estas páginas
  -- ============================================================
  DELETE FROM dim_permisos_modulares
  WHERE id_rol = v_role_id
    AND id_pagina IN (v_page1_id, v_page2_id)
    AND id_pagina IS NOT NULL;

  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;

  RAISE NOTICE '';
  RAISE NOTICE '╔════════════════════════════════════════════════════════════╗';
  RAISE NOTICE '║ RESTRICCIÓN DE ACCESO - MÓDULO 107 v2                      ║';
  RAISE NOTICE '╠════════════════════════════════════════════════════════════╣';
  RAISE NOTICE '║ Rol: % ', LPAD(COALESCE(v_role_name, '?'), 50);
  RAISE NOTICE '║ Registros eliminados: %', LPAD(v_deleted_count::TEXT, 41);
  RAISE NOTICE '╚════════════════════════════════════════════════════════════╝';
  RAISE NOTICE '';

  IF v_deleted_count >= 2 THEN
    RAISE NOTICE '✅ Restricción exitosa: Acceso bloqueado para ambas páginas';
  ELSIF v_deleted_count = 1 THEN
    RAISE NOTICE '⚠️ Una página no tenía permisos registrados';
  ELSIF v_deleted_count = 0 THEN
    RAISE WARNING '⚠️ No se encontraron permisos para eliminar (revisar IDs)';
  END IF;

END $$;
