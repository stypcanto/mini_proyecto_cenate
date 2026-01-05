-- ==============================================================================
-- Script: 025b_permisos_mbac_trazabilidad.sql
-- Proyecto: CENATE - Sistema de Telemedicina
-- Versión: 2.0.0
-- Fecha: 2026-01-03
--
-- Descripción: Configuración de permisos MBAC para módulo de trazabilidad clínica
--              (Script complementario a 025_crear_modulo_trazabilidad_clinica.sql)
--
-- Ejecución:
--   PGPASSWORD=Essalud2025 psql -h 10.0.89.13 -U postgres -d maestro_cenate \
--     -f spec/04_BaseDatos/06_scripts/025b_permisos_mbac_trazabilidad.sql
-- ==============================================================================

\echo '=================================='
\echo 'CONFIGURANDO PERMISOS MBAC - TRAZABILIDAD CLÍNICA'
\echo '=================================='

-- ==============================================================================
-- INSERTAR PÁGINAS EN dim_paginas_modulo
-- ==============================================================================

\echo ''
\echo '📋 Insertando páginas del módulo...'

-- Página 1: Atenciones Clínicas (Módulo: Gestión de Citas, id_modulo=18)
INSERT INTO public.dim_paginas_modulo (id_modulo, nombre_pagina, ruta_pagina, descripcion, activo, orden)
SELECT
    18,
    'Atenciones Clínicas',
    '/atenciones-clinicas',
    'Registro y consulta de atenciones médicas de telemedicina con trazabilidad clínica',
    TRUE,
    8
WHERE NOT EXISTS (
    SELECT 1 FROM public.dim_paginas_modulo
    WHERE ruta_pagina = '/atenciones-clinicas'
);

\echo '  ├─ Página "Atenciones Clínicas" creada en módulo 18 (Gestión de Citas)'

-- Página 2: Estrategias Institucionales (Módulo: Administración, id_modulo=27)
INSERT INTO public.dim_paginas_modulo (id_modulo, nombre_pagina, ruta_pagina, descripcion, activo, orden)
SELECT
    27,
    'Estrategias Institucionales',
    '/admin/estrategias-institucionales',
    'Catálogo CRUD de estrategias institucionales (CENATE, CENACRON, CENAPSI, etc.)',
    TRUE,
    11
WHERE NOT EXISTS (
    SELECT 1 FROM public.dim_paginas_modulo
    WHERE ruta_pagina = '/admin/estrategias-institucionales'
);

\echo '  ├─ Página "Estrategias Institucionales" creada en módulo 27 (Administración)'

-- Página 3: Tipos de Atención Telemedicina (Módulo: Administración, id_modulo=27)
INSERT INTO public.dim_paginas_modulo (id_modulo, nombre_pagina, ruta_pagina, descripcion, activo, orden)
SELECT
    27,
    'Tipos de Atención Telemedicina',
    '/admin/tipos-atencion-telemedicina',
    'Catálogo CRUD de tipos de atención (TELCONSULTA, TELMONIT, TELINTERC, etc.)',
    TRUE,
    12
WHERE NOT EXISTS (
    SELECT 1 FROM public.dim_paginas_modulo
    WHERE ruta_pagina = '/admin/tipos-atencion-telemedicina'
);

\echo '  └─ Página "Tipos de Atención Telemedicina" creada en módulo 27 (Administración)'

-- ==============================================================================
-- CONFIGURAR PERMISOS POR ROL
-- ==============================================================================

\echo ''
\echo '🔐 Configurando permisos por rol...'

DO $$
DECLARE
    v_id_pagina_atenciones INTEGER;
    v_id_pagina_estrategias INTEGER;
    v_id_pagina_tipos_atencion INTEGER;
    v_id_rol_medico INTEGER;
    v_id_rol_coord_gestion_citas INTEGER;
    v_id_rol_coord_especialidades INTEGER;
    v_id_rol_gestion_territorial INTEGER;
    v_id_rol_enfermeria INTEGER;
    v_id_rol_admin INTEGER;
    v_id_rol_superadmin INTEGER;
BEGIN
    -- Obtener IDs de páginas
    SELECT id_pagina INTO v_id_pagina_atenciones
    FROM public.dim_paginas_modulo
    WHERE ruta_pagina = '/atenciones-clinicas';

    SELECT id_pagina INTO v_id_pagina_estrategias
    FROM public.dim_paginas_modulo
    WHERE ruta_pagina = '/admin/estrategias-institucionales';

    SELECT id_pagina INTO v_id_pagina_tipos_atencion
    FROM public.dim_paginas_modulo
    WHERE ruta_pagina = '/admin/tipos-atencion-telemedicina';

    -- Obtener IDs de roles
    SELECT id_rol INTO v_id_rol_medico FROM public.dim_roles WHERE desc_rol = 'MEDICO';
    SELECT id_rol INTO v_id_rol_coord_gestion_citas FROM public.dim_roles WHERE desc_rol = 'COORD. GESTION CITAS';
    SELECT id_rol INTO v_id_rol_coord_especialidades FROM public.dim_roles WHERE desc_rol = 'COORD. ESPECIALIDADES';
    SELECT id_rol INTO v_id_rol_gestion_territorial FROM public.dim_roles WHERE desc_rol = 'GESTIONTERRITORIAL';
    SELECT id_rol INTO v_id_rol_enfermeria FROM public.dim_roles WHERE desc_rol = 'ENFERMERIA';
    SELECT id_rol INTO v_id_rol_admin FROM public.dim_roles WHERE desc_rol = 'ADMIN';
    SELECT id_rol INTO v_id_rol_superadmin FROM public.dim_roles WHERE desc_rol = 'SUPERADMIN';

    -- ================================================================
    -- PERMISOS: Atenciones Clínicas
    -- ================================================================

    -- MEDICO: Ver, Crear, Editar, Exportar (solo sus atenciones)
    INSERT INTO public.dim_permisos_pagina_rol (id_rol, id_pagina, puede_ver, puede_crear, puede_editar, puede_eliminar, puede_exportar, activo)
    VALUES (v_id_rol_medico, v_id_pagina_atenciones, TRUE, TRUE, TRUE, FALSE, TRUE, TRUE)
    ON CONFLICT (id_rol, id_pagina) DO UPDATE SET
        puede_ver = TRUE,
        puede_crear = TRUE,
        puede_editar = TRUE,
        puede_eliminar = FALSE,
        puede_exportar = TRUE,
        activo = TRUE;

    RAISE NOTICE '  ├─ Permisos MEDICO configurados para Atenciones Clínicas';

    -- COORD. GESTION CITAS: Ver, Exportar (solo lectura + reportes)
    INSERT INTO public.dim_permisos_pagina_rol (id_rol, id_pagina, puede_ver, puede_crear, puede_editar, puede_eliminar, puede_exportar, activo)
    VALUES (v_id_rol_coord_gestion_citas, v_id_pagina_atenciones, TRUE, FALSE, FALSE, FALSE, TRUE, TRUE)
    ON CONFLICT (id_rol, id_pagina) DO UPDATE SET
        puede_ver = TRUE,
        puede_crear = FALSE,
        puede_editar = FALSE,
        puede_eliminar = FALSE,
        puede_exportar = TRUE,
        activo = TRUE;

    RAISE NOTICE '  ├─ Permisos COORD. GESTION CITAS configurados para Atenciones Clínicas';

    -- COORD. ESPECIALIDADES: Ver, Exportar (coordinador general de médicos)
    INSERT INTO public.dim_permisos_pagina_rol (id_rol, id_pagina, puede_ver, puede_crear, puede_editar, puede_eliminar, puede_exportar, activo)
    VALUES (v_id_rol_coord_especialidades, v_id_pagina_atenciones, TRUE, FALSE, FALSE, FALSE, TRUE, TRUE)
    ON CONFLICT (id_rol, id_pagina) DO UPDATE SET
        puede_ver = TRUE,
        puede_crear = FALSE,
        puede_editar = FALSE,
        puede_eliminar = FALSE,
        puede_exportar = TRUE,
        activo = TRUE;

    RAISE NOTICE '  ├─ Permisos COORD. ESPECIALIDADES configurados para Atenciones Clínicas';

    -- GESTIONTERRITORIAL: Ver, Exportar (solo lectura + reportes)
    INSERT INTO public.dim_permisos_pagina_rol (id_rol, id_pagina, puede_ver, puede_crear, puede_editar, puede_eliminar, puede_exportar, activo)
    VALUES (v_id_rol_gestion_territorial, v_id_pagina_atenciones, TRUE, FALSE, FALSE, FALSE, TRUE, TRUE)
    ON CONFLICT (id_rol, id_pagina) DO UPDATE SET
        puede_ver = TRUE,
        puede_crear = FALSE,
        puede_editar = FALSE,
        puede_eliminar = FALSE,
        puede_exportar = TRUE,
        activo = TRUE;

    RAISE NOTICE '  ├─ Permisos GESTIONTERRITORIAL configurados para Atenciones Clínicas';

    -- ENFERMERIA: Ver, Editar (agregar observaciones)
    INSERT INTO public.dim_permisos_pagina_rol (id_rol, id_pagina, puede_ver, puede_crear, puede_editar, puede_eliminar, puede_exportar, activo)
    VALUES (v_id_rol_enfermeria, v_id_pagina_atenciones, TRUE, FALSE, TRUE, FALSE, FALSE, TRUE)
    ON CONFLICT (id_rol, id_pagina) DO UPDATE SET
        puede_ver = TRUE,
        puede_crear = FALSE,
        puede_editar = TRUE,
        puede_eliminar = FALSE,
        puede_exportar = FALSE,
        activo = TRUE;

    RAISE NOTICE '  ├─ Permisos ENFERMERIA configurados para Atenciones Clínicas';

    -- ADMIN: Todos los permisos
    INSERT INTO public.dim_permisos_pagina_rol (id_rol, id_pagina, puede_ver, puede_crear, puede_editar, puede_eliminar, puede_exportar, activo)
    VALUES (v_id_rol_admin, v_id_pagina_atenciones, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE)
    ON CONFLICT (id_rol, id_pagina) DO UPDATE SET
        puede_ver = TRUE,
        puede_crear = TRUE,
        puede_editar = TRUE,
        puede_eliminar = TRUE,
        puede_exportar = TRUE,
        activo = TRUE;

    RAISE NOTICE '  ├─ Permisos ADMIN configurados para Atenciones Clínicas';

    -- SUPERADMIN: Todos los permisos
    INSERT INTO public.dim_permisos_pagina_rol (id_rol, id_pagina, puede_ver, puede_crear, puede_editar, puede_eliminar, puede_exportar, activo)
    VALUES (v_id_rol_superadmin, v_id_pagina_atenciones, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE)
    ON CONFLICT (id_rol, id_pagina) DO UPDATE SET
        puede_ver = TRUE,
        puede_crear = TRUE,
        puede_editar = TRUE,
        puede_eliminar = TRUE,
        puede_exportar = TRUE,
        activo = TRUE;

    RAISE NOTICE '  ├─ Permisos SUPERADMIN configurados para Atenciones Clínicas';

    -- ================================================================
    -- PERMISOS: Estrategias Institucionales (solo ADMIN y SUPERADMIN)
    -- ================================================================

    INSERT INTO public.dim_permisos_pagina_rol (id_rol, id_pagina, puede_ver, puede_crear, puede_editar, puede_eliminar, puede_exportar, activo)
    VALUES (v_id_rol_admin, v_id_pagina_estrategias, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE)
    ON CONFLICT (id_rol, id_pagina) DO UPDATE SET
        puede_ver = TRUE,
        puede_crear = TRUE,
        puede_editar = TRUE,
        puede_eliminar = TRUE,
        puede_exportar = TRUE,
        activo = TRUE;

    RAISE NOTICE '  ├─ Permisos ADMIN configurados para Estrategias Institucionales';

    INSERT INTO public.dim_permisos_pagina_rol (id_rol, id_pagina, puede_ver, puede_crear, puede_editar, puede_eliminar, puede_exportar, activo)
    VALUES (v_id_rol_superadmin, v_id_pagina_estrategias, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE)
    ON CONFLICT (id_rol, id_pagina) DO UPDATE SET
        puede_ver = TRUE,
        puede_crear = TRUE,
        puede_editar = TRUE,
        puede_eliminar = TRUE,
        puede_exportar = TRUE,
        activo = TRUE;

    RAISE NOTICE '  ├─ Permisos SUPERADMIN configurados para Estrategias Institucionales';

    -- ================================================================
    -- PERMISOS: Tipos de Atención Telemedicina (solo ADMIN y SUPERADMIN)
    -- ================================================================

    INSERT INTO public.dim_permisos_pagina_rol (id_rol, id_pagina, puede_ver, puede_crear, puede_editar, puede_eliminar, puede_exportar, activo)
    VALUES (v_id_rol_admin, v_id_pagina_tipos_atencion, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE)
    ON CONFLICT (id_rol, id_pagina) DO UPDATE SET
        puede_ver = TRUE,
        puede_crear = TRUE,
        puede_editar = TRUE,
        puede_eliminar = TRUE,
        puede_exportar = TRUE,
        activo = TRUE;

    RAISE NOTICE '  ├─ Permisos ADMIN configurados para Tipos de Atención Telemedicina';

    INSERT INTO public.dim_permisos_pagina_rol (id_rol, id_pagina, puede_ver, puede_crear, puede_editar, puede_eliminar, puede_exportar, activo)
    VALUES (v_id_rol_superadmin, v_id_pagina_tipos_atencion, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE)
    ON CONFLICT (id_rol, id_pagina) DO UPDATE SET
        puede_ver = TRUE,
        puede_crear = TRUE,
        puede_editar = TRUE,
        puede_eliminar = TRUE,
        puede_exportar = TRUE,
        activo = TRUE;

    RAISE NOTICE '  └─ Permisos SUPERADMIN configurados para Tipos de Atención Telemedicina';

END $$;

-- ==============================================================================
-- VERIFICACIÓN DE PERMISOS
-- ==============================================================================

\echo ''
\echo '🔍 Verificando permisos configurados...'

SELECT
    dp.nombre_pagina AS pagina,
    dr.desc_rol AS rol,
    CASE WHEN p.puede_ver THEN '✅' ELSE '❌' END AS ver,
    CASE WHEN p.puede_crear THEN '✅' ELSE '❌' END AS crear,
    CASE WHEN p.puede_editar THEN '✅' ELSE '❌' END AS editar,
    CASE WHEN p.puede_eliminar THEN '✅' ELSE '❌' END AS eliminar,
    CASE WHEN p.puede_exportar THEN '✅' ELSE '❌' END AS exportar
FROM dim_permisos_pagina_rol p
INNER JOIN dim_paginas_modulo dp ON p.id_pagina = dp.id_pagina
INNER JOIN dim_roles dr ON p.id_rol = dr.id_rol
WHERE dp.ruta_pagina IN ('/atenciones-clinicas', '/admin/estrategias-institucionales', '/admin/tipos-atencion-telemedicina')
ORDER BY dp.nombre_pagina, dr.desc_rol;

\echo ''
\echo '=================================='
\echo '✅ PERMISOS MBAC CONFIGURADOS EXITOSAMENTE'
\echo '=================================='
\echo ''
