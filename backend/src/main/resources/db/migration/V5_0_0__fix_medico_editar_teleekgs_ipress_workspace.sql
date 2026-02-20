-- ============================================================================
-- Migration V5.0.0: Fix MEDICO puede_editar para /teleekgs/ipress-workspace
-- ============================================================================
-- Problema detectado:
--   Los endpoints PUT /teleekgs/{id}/evaluar y PUT /teleekgs/{id}/procesar
--   usan @CheckMBACPermission(pagina="/teleekgs/ipress-workspace", accion="editar").
--   Sin embargo, el rol MEDICO no tenía ningún registro en segu_permisos_rol_pagina
--   para la página /teleekgs/ipress-workspace, lo que genera un 403 Forbidden
--   al intentar "Rechazar" (OBSERVAR) o "Evaluar" ECG desde el modal de
--   Triaje Clínico en /roles/medico/pacientes.
--
-- Solución:
--   Insertar permiso para MEDICO en /teleekgs/ipress-workspace con:
--     - puede_ver   = true  (para acceder a la página)
--     - puede_editar = true  (para ejecutar /evaluar y /procesar)
--   Esto permite al médico:
--     - Evaluar imágenes ECG (Normal/Anormal/No Diagnóstico) via /evaluar
--     - Rechazar imágenes por calidad (OBSERVAR) via /procesar
--
-- Nota: Este script usa INSERT ya que MEDICO no tenía entrada previa.
--       Si ya existe, usar ON CONFLICT DO UPDATE para idempotencia.
--
-- Fecha: 2026-02-20
-- Autor: Arquitectura CENATE
-- ============================================================================

INSERT INTO segu_permisos_rol_pagina (
    id_rol, id_pagina,
    puede_ver, puede_crear, puede_editar, puede_eliminar,
    puede_exportar, puede_importar, puede_aprobar,
    activo, autorizado_por, created_at, updated_at
)
VALUES (
    (SELECT id_rol FROM dim_roles WHERE desc_rol = 'MEDICO' LIMIT 1),
    (SELECT id_pagina FROM dim_paginas_modulo WHERE ruta_pagina = '/teleekgs/ipress-workspace' LIMIT 1),
    true,  -- puede_ver
    false, -- puede_crear
    true,  -- puede_editar (necesario para /evaluar y /procesar)
    false, -- puede_eliminar
    false, -- puede_exportar
    false, -- puede_importar
    false, -- puede_aprobar
    true,  -- activo
    'ARQUITECTURA_CENATE',
    NOW(), NOW()
)
ON CONFLICT (id_rol, id_pagina)
DO UPDATE SET
    puede_ver    = true,
    puede_editar = true,
    activo       = true,
    updated_at   = NOW();

-- Verificación
SELECT
    r.desc_rol                AS rol,
    p.ruta_pagina             AS pagina,
    pp.puede_ver              AS ver,
    pp.puede_crear            AS crear,
    pp.puede_editar           AS editar,
    pp.puede_eliminar         AS eliminar,
    pp.puede_exportar         AS exportar,
    pp.activo                 AS activo
FROM segu_permisos_rol_pagina pp
JOIN dim_roles r           ON pp.id_rol    = r.id_rol
JOIN dim_paginas_modulo p  ON pp.id_pagina = p.id_pagina
WHERE r.desc_rol = 'MEDICO'
  AND p.ruta_pagina = '/teleekgs/ipress-workspace'
  AND pp.activo = true;
