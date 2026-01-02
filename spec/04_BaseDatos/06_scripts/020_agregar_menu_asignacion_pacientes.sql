-- ========================================================================
-- Script 020: Agregar página "Asignación de Pacientes" con permisos
-- ========================================================================
-- Descripción:
-- 1. Inserta página en dim_paginas_modulo para bandeja de admisionistas
-- 2. Asigna permisos al rol ADMISION
--
-- Contexto:
-- Los admisionistas necesitan una bandeja personal donde puedan ver
-- los pacientes de la Bolsa 107 que les han sido asignados por los
-- coordinadores de gestión de citas.
--
-- Dependencias:
-- - Tabla bolsa_107_item debe tener columna id_admisionista_asignado
-- - Rol ADMISION (id_rol=13) debe existir
-- - Módulo "Coordinador de Gestión de Citas" (id_modulo=41) debe existir
--
-- Autor: Sistema CENATE
-- Fecha: 2026-01-02
-- Versión: v1.14.1
-- ========================================================================

BEGIN;

-- ========================================================================
-- PASO 1: Insertar página en dim_paginas_modulo
-- ========================================================================

INSERT INTO dim_paginas_modulo (
    id_pagina,
    id_modulo,
    nombre_pagina,
    ruta_pagina,
    descripcion,
    activo,
    created_at,
    orden
)
VALUES (
    73,                                                           -- ID único
    41,                                                           -- Módulo: Coordinador de Gestión de Citas
    'Asignación de Pacientes',                                   -- Nombre visible en menú
    '/roles/admision/asignacion-pacientes',                      -- Ruta del frontend
    'Bandeja personal de admisionistas para gestionar pacientes asignados de la Bolsa 107',
    true,                                                         -- Página activa
    CURRENT_TIMESTAMP,                                           -- Fecha creación
    100                                                          -- Orden en menú
)
ON CONFLICT (id_pagina) DO NOTHING;

-- Verificar inserción
SELECT
    '✅ Página creada' AS status,
    id_pagina,
    nombre_pagina,
    ruta_pagina,
    m.nombre_modulo AS modulo
FROM dim_paginas_modulo p
JOIN dim_modulos_sistema m ON p.id_modulo = m.id_modulo
WHERE p.id_pagina = 73;

-- ========================================================================
-- PASO 2: Asignar permisos al rol ADMISION
-- ========================================================================

DO $$
DECLARE
    next_permiso_id INTEGER;
    permiso_existe BOOLEAN;
BEGIN
    -- Verificar si ya existe el permiso
    SELECT EXISTS(
        SELECT 1 FROM segu_permisos_rol_pagina
        WHERE id_rol = 13 AND id_pagina = 73
    ) INTO permiso_existe;

    IF permiso_existe THEN
        RAISE NOTICE '⚠️  El permiso ya existe para rol ADMISION en página 73';
    ELSE
        -- Obtener siguiente ID
        SELECT COALESCE(MAX(id_permiso), 0) + 1
        INTO next_permiso_id
        FROM segu_permisos_rol_pagina;

        -- Insertar permiso
        INSERT INTO segu_permisos_rol_pagina (
            id_permiso,
            id_rol,
            id_pagina,
            puede_ver,
            puede_crear,
            puede_editar,
            puede_eliminar,
            puede_exportar,
            puede_importar,
            puede_aprobar,
            activo,
            autorizado_por,
            created_at
        )
        VALUES (
            next_permiso_id,
            13,                      -- Rol: ADMISION
            73,                      -- Página: Asignación de Pacientes
            true,                    -- puede_ver (lectura de bandeja)
            false,                   -- puede_crear (no crean registros)
            false,                   -- puede_editar (no editan asignaciones)
            false,                   -- puede_eliminar (no eliminan)
            true,                    -- puede_exportar (exportar lista a Excel)
            false,                   -- puede_importar
            false,                   -- puede_aprobar
            true,                    -- activo
            'SYSTEM',                -- autorizado_por
            CURRENT_TIMESTAMP        -- created_at
        );

        RAISE NOTICE '✅ Permiso creado con ID: %', next_permiso_id;
    END IF;
END $$;

-- Verificar permisos creados
SELECT
    '✅ Permisos configurados' AS status,
    p.id_permiso,
    r.desc_rol AS rol,
    pg.nombre_pagina AS pagina,
    CASE WHEN p.puede_ver THEN 'Ver' ELSE '' END ||
    CASE WHEN p.puede_exportar THEN ', Exportar' ELSE '' END AS permisos_otorgados
FROM segu_permisos_rol_pagina p
JOIN dim_roles r ON p.id_rol = r.id_rol
JOIN dim_paginas_modulo pg ON p.id_pagina = pg.id_pagina
WHERE p.id_rol = 13 AND p.id_pagina = 73;

COMMIT;

-- ========================================================================
-- Resumen de Cambios:
-- ========================================================================
-- ✅ Página "Asignación de Pacientes" creada (ID: 73)
-- ✅ Ruta: /roles/admision/asignacion-pacientes
-- ✅ Módulo: Coordinador de Gestión de Citas (ID: 41)
-- ✅ Permiso asignado al rol ADMISION (ID: 13)
-- ✅ Permisos: Ver, Exportar
--
-- Endpoints Backend (ya implementados):
-- - GET  /api/bolsa107/mis-asignaciones   → Lista pacientes asignados
-- - GET  /api/usuarios/admisionistas      → Lista usuarios ADMISION
-- - POST /api/bolsa107/asignar-admisionista → Asigna paciente
--
-- Componentes Frontend (ya implementados):
-- - AsignacionDePacientes.jsx             → Bandeja del admisionista
-- - AsignarAdmisionistaModal.jsx          → Modal de asignación
-- - Ruta registrada en componentRegistry.js
-- ========================================================================
