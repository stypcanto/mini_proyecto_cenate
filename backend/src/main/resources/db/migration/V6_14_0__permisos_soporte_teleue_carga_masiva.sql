-- ============================================================================
-- V6_14_0: Permisos SOPORTE_TELEUE para /citas/carga-masiva-pacientes
-- Usuario afectado: Eduardo Angel Leon Rupay (DNI rol SOPORTE_TELEUE)
-- id_pagina: 153 | id_rol: 37 | id_modulo: 18
-- Autor: Styp Canto Rondón / Claude Code
-- Fecha: 2026-03-02
-- ============================================================================

-- PASO 1: segu_permisos_rol_pagina (acceso por rol)
INSERT INTO segu_permisos_rol_pagina (
    id_rol, id_pagina,
    puede_ver, puede_crear, puede_editar, puede_eliminar, puede_exportar,
    activo, autorizado_por, created_at, updated_at
)
VALUES (37, 153, true, true, true, false, true, true, 'SUPERADMIN', NOW(), NOW())
ON CONFLICT (id_rol, id_pagina) DO UPDATE
    SET puede_ver    = true,
        puede_crear  = true,
        puede_editar = true,
        puede_exportar = true,
        activo       = true,
        updated_at   = NOW();

-- PASO 2: permisos_modulares para el usuario específico
INSERT INTO permisos_modulares (
    id_user, id_rol, id_modulo, id_pagina, accion,
    puede_ver, puede_crear, puede_editar, puede_eliminar, puede_exportar, puede_aprobar,
    activo
)
SELECT
    u.id_user, 37, 18, 153, 'all',
    true, true, true, false, true, false, true
FROM dim_personal_cnt pc
JOIN dim_usuarios u ON pc.id_usuario = u.id_user
WHERE pc.num_doc_pers = '44433602'
ON CONFLICT DO NOTHING;

DO $$
BEGIN
    RAISE NOTICE 'V6_14_0: ✅ SOPORTE_TELEUE con acceso a /citas/carga-masiva-pacientes';
END $$;
