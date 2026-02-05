-- ============================================================
-- Fix: Activar permisos desactivados del rol MEDICO
-- ============================================================
-- Fecha: 2026-02-05
-- Problema: Rol MEDICO tenía 3 páginas inactivas en Panel Médico
-- Impacto: Al editar usuarios con rol MEDICO, no aparecían las páginas
-- ============================================================

-- Estado inicial (problémático)
-- SELECT * FROM segu_permisos_rol_pagina WHERE id_rol = 3;
--
-- Resultados:
-- id_pagina | nombre_pagina      | activo
-- ---------+--------------------+--------
-- 23       | Pacientes          | true   ✅
-- 24       | Citas Médicas      | true   ✅
-- 77       | Bienvenida         | true   ✅
-- 22       | Dashboard Médico   | FALSE  ❌ INACTIVO
-- 25       | Indicadores        | FALSE  ❌ INACTIVO
-- 68       | Mi Disponibilidad  | FALSE  ❌ INACTIVO

-- ============================================================
-- SOLUCIÓN: Activar permisos inactivos
-- ============================================================

UPDATE segu_permisos_rol_pagina
SET
  activo = true,
  puede_ver = true,
  updated_at = NOW(),
  autorizado_por = 'SYSTEM-FIX'
WHERE id_rol = 3  -- Rol MEDICO
AND id_pagina IN (22, 25, 68)  -- Dashboard, Indicadores, Mi Disponibilidad
AND activo = false;

-- Verificación post-fix
-- SELECT
--   r.desc_rol,
--   COUNT(*) as total_paginas_activas
-- FROM segu_permisos_rol_pagina prp
-- JOIN dim_roles r ON prp.id_rol = r.id_rol
-- WHERE r.desc_rol = 'MEDICO' AND prp.activo = true
-- GROUP BY r.desc_rol;
--
-- Resultado esperado: MEDICO | 6

-- ============================================================
-- NOTAS TÉCNICAS
-- ============================================================
--
-- 1. CAUSA DEL PROBLEMA:
--    - Los registros existían pero estaban marcados como inactivo = FALSE
--    - El endpoint /api/permisos/roles/predeterminados filtra con .findByIdRolInAndActivoTrue()
--    - Por eso no aparecían en el panel de edición de usuarios
--
-- 2. IMPACTO:
--    - Panel MBAC (Control Roles) sí mostraba todas las páginas
--      (porque carga desde dim_paginas_modulo directamente)
--    - Panel de Editar Usuario no mostraba las páginas inactivas
--      (porque carga solo permisos activos vía API)
--
-- 3. RECOMENDACIÓN PARA FUTURO:
--    - Implementar un flag "visible" separado de "activo"
--    - O revisar la lógica del endpoint para mostrar TODAS las páginas del módulo
--      (marcando cuáles tienen permisos)
--
-- ============================================================
