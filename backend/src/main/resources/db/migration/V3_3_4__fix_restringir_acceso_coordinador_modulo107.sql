-- ============================================================
-- V3_3_4__fix_restringir_acceso_coordinador_modulo107.sql
-- CORRECCIÓN: Restricción de acceso para COORDINADOR_GESTION_CITAS
-- Fecha: 2026-01-30
-- Descripción: Elimina permiso del rol COORDINADOR_GESTION_CITAS
--              de las páginas Bienvenida y Carga de Pacientes 107
--
-- Nota: V3_3_3 falló por:
--   1. Columna incorrecta: nombre_rol (no existe)
--   2. Tabla incorrecta: dim_permisos_modulares → debe ser dim_permisos_pagina_rol
-- ============================================================

DO $$
DECLARE
  v_role_id INT;
  v_role_name VARCHAR(100);
  v_page1_id INT;
  v_page2_id INT;
  v_deleted_count INT;
BEGIN
  -- Obtener ID del rol (usando columna CORRECTA: desc_rol)
  SELECT id_rol, desc_rol INTO v_role_id, v_role_name
  FROM dim_roles
  WHERE UPPER(desc_rol) = 'COORDINADOR_GESTION_CITAS'
     OR UPPER(desc_rol) = 'COORD. GESTION CITAS'
  LIMIT 1;

  IF v_role_id IS NULL THEN
    RAISE NOTICE '❌ No se encontró el rol COORDINADOR_GESTION_CITAS en la BD';
    RETURN;
  END IF;

  RAISE NOTICE '✅ Rol encontrado: % (ID: %)', v_role_name, v_role_id;

  -- ============================================================
  -- Obtener IDs de las páginas a restringir
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
  -- ELIMINAR permisos de la tabla CORRECTA: dim_permisos_pagina_rol
  -- ============================================================
  DELETE FROM dim_permisos_pagina_rol
  WHERE id_rol = v_role_id
    AND id_pagina IN (v_page1_id, v_page2_id)
    AND id_pagina IS NOT NULL;

  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;

  RAISE NOTICE '';
  RAISE NOTICE '╔════════════════════════════════════════════════════════════╗';
  RAISE NOTICE '║ RESTRICCIÓN DE ACCESO - MÓDULO 107 v3 (CORRECCIÓN)         ║';
  RAISE NOTICE '╠════════════════════════════════════════════════════════════╣';
  RAISE NOTICE '║ Rol: % ', LPAD(COALESCE(v_role_name, '?'), 50);
  RAISE NOTICE '║ Registros eliminados: %', LPAD(v_deleted_count::TEXT, 41);
  RAISE NOTICE '╚════════════════════════════════════════════════════════════╝';
  RAISE NOTICE '';

  IF v_deleted_count >= 1 THEN
    RAISE NOTICE '✅ Restricción exitosa: Acceso bloqueado para página(s)';
  ELSE
    RAISE WARNING '⚠️ No se encontraron permisos para eliminar';
  END IF;

END $$;
