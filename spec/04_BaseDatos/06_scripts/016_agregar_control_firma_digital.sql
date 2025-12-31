-- ========================================================================
-- 📄 016_agregar_control_firma_digital.sql
-- ------------------------------------------------------------------------
-- Agrega la página "Control de Firma Digital" al sistema MBAC
-- Versión: 1.14.0
-- Fecha: 2025-12-30
-- Autor: Ing. Styp Canto Rondon
-- ========================================================================

DO $$
DECLARE
    v_pagina_id INTEGER := 69; -- ID de la página ya creada
BEGIN
    -- Verificar que la página existe
    IF NOT EXISTS (SELECT 1 FROM dim_paginas_modulo WHERE id_pagina = v_pagina_id) THEN
        RAISE EXCEPTION 'La página con ID % no existe en dim_paginas_modulo', v_pagina_id;
    END IF;

    RAISE NOTICE '✅ Página encontrada (ID: %)', v_pagina_id;

    -- Insertar permisos en segu_permisos_rol_pagina para SUPERADMIN (id_rol = 1)
    INSERT INTO segu_permisos_rol_pagina (
        id_rol,
        id_pagina,
        puede_ver,
        puede_crear,
        puede_editar,
        puede_eliminar,
        puede_exportar,
        puede_importar,
        puede_aprobar,
        activo
    ) VALUES (
        1,              -- SUPERADMIN
        v_pagina_id,    -- Control de Firma Digital
        TRUE,           -- puede_ver
        TRUE,           -- puede_crear
        TRUE,           -- puede_editar
        TRUE,           -- puede_eliminar
        TRUE,           -- puede_exportar
        FALSE,          -- puede_importar
        FALSE,          -- puede_aprobar
        TRUE            -- activo
    )
    ON CONFLICT (id_rol, id_pagina) DO UPDATE
    SET
        puede_ver = TRUE,
        puede_crear = TRUE,
        puede_editar = TRUE,
        puede_eliminar = TRUE,
        puede_exportar = TRUE,
        activo = TRUE,
        updated_at = CURRENT_TIMESTAMP;

    RAISE NOTICE '🔐 Permisos asignados a SUPERADMIN (id_rol: 1)';

    -- Insertar permisos en segu_permisos_rol_pagina para ADMIN (id_rol = 2)
    INSERT INTO segu_permisos_rol_pagina (
        id_rol,
        id_pagina,
        puede_ver,
        puede_crear,
        puede_editar,
        puede_eliminar,
        puede_exportar,
        puede_importar,
        puede_aprobar,
        activo
    ) VALUES (
        2,              -- ADMIN
        v_pagina_id,    -- Control de Firma Digital
        TRUE,           -- puede_ver
        TRUE,           -- puede_crear
        TRUE,           -- puede_editar
        TRUE,           -- puede_eliminar
        TRUE,           -- puede_exportar
        FALSE,          -- puede_importar
        FALSE,          -- puede_aprobar
        TRUE            -- activo
    )
    ON CONFLICT (id_rol, id_pagina) DO UPDATE
    SET
        puede_ver = TRUE,
        puede_crear = TRUE,
        puede_editar = TRUE,
        puede_eliminar = TRUE,
        puede_exportar = TRUE,
        activo = TRUE,
        updated_at = CURRENT_TIMESTAMP;

    RAISE NOTICE '🔐 Permisos asignados a ADMIN (id_rol: 2)';
    RAISE NOTICE '';
    RAISE NOTICE '✅ Script ejecutado exitosamente';
    RAISE NOTICE '📋 Página: Control de Firma Digital';
    RAISE NOTICE '🔗 URL: /admin/control-firma-digital';
    RAISE NOTICE '📊 ID Página: %', v_pagina_id;
    RAISE NOTICE '📋 Tabla: segu_permisos_rol_pagina';

END $$;
