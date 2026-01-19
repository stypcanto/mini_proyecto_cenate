-- =============================================================================
-- SCRIPT: Restricción de acceso a páginas para rol EXTERNO (INSTITUCION_EX)
-- =============================================================================
-- Fecha: 2026-01-19
-- Objetivo: Remover acceso del rol EXTERNO a páginas no permitidas:
--   - Buscar Asegurado
--   - Dashboard Asegurados
--   - Auditoría (Logs del Sistema)
--
-- El rol EXTERNO solo debe tener acceso a:
--   - Bienvenida
--   - Formulario de Diagnóstico
--   - Solicitud de Turnos
--   - Gestión de Modalidad de Atención
--   - TeleECG (si está habilitado para su IPRESS)
-- =============================================================================

-- 1. Desactivar permisos para "Buscar Asegurado" (página 20)
UPDATE segu_permisos_rol_pagina
SET puede_ver = FALSE, puede_crear = FALSE, puede_editar = FALSE,
    puede_eliminar = FALSE, activo = FALSE,
    autorizado_por = 'SCRIPT_RESTRICCION_EXTERNO',
    updated_at = CURRENT_TIMESTAMP
WHERE id_rol = 18  -- INSTITUCION_EX
  AND id_pagina = 20  -- Buscar Asegurado
  AND activo = TRUE;

-- 2. Desactivar permisos para "Dashboard Asegurados" (página 21)
UPDATE segu_permisos_rol_pagina
SET puede_ver = FALSE, puede_crear = FALSE, puede_editar = FALSE,
    puede_eliminar = FALSE, activo = FALSE,
    autorizado_por = 'SCRIPT_RESTRICCION_EXTERNO',
    updated_at = CURRENT_TIMESTAMP
WHERE id_rol = 18  -- INSTITUCION_EX
  AND id_pagina = 21  -- Dashboard Asegurados
  AND activo = TRUE;

-- 3. Desactivar permisos para "Auditoría" (página 19)
UPDATE segu_permisos_rol_pagina
SET puede_ver = FALSE, puede_crear = FALSE, puede_editar = FALSE,
    puede_eliminar = FALSE, activo = FALSE,
    autorizado_por = 'SCRIPT_RESTRICCION_EXTERNO',
    updated_at = CURRENT_TIMESTAMP
WHERE id_rol = 18  -- INSTITUCION_EX
  AND id_pagina = 19  -- Auditoría
  AND activo = TRUE;

-- Verificación
SELECT
  srp.id_permiso,
  dr.desc_rol,
  dpm.nombre_pagina,
  srp.puede_ver,
  srp.activo,
  srp.autorizado_por,
  srp.updated_at
FROM segu_permisos_rol_pagina srp
JOIN dim_roles dr ON srp.id_rol = dr.id_rol
JOIN dim_paginas_modulo dpm ON srp.id_pagina = dpm.id_pagina
WHERE srp.id_rol = 18
  AND srp.id_pagina IN (19, 20, 21)
ORDER BY dpm.nombre_pagina;
