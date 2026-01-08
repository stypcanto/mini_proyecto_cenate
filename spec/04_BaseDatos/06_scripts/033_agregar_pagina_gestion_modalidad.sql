-- ============================================================================
-- 🏥 Script 033: Agregar Página de Gestión de Modalidad de Atención
-- ============================================================================
-- Objetivo: Crear nueva página para que Personal Externo pueda actualizar
--           la Modalidad de Atención de su IPRESS asignada.
--
-- Cambios:
-- 1. Insertar página ID 90 en módulo 20 (Gestión de Personal Externo)
-- 2. Asignar permisos a rol INSTITUCION_EX (ID 18)
-- 3. Asignar permisos a roles ADMIN y SUPERADMIN
--
-- Fecha: 2026-01-07
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1️⃣ INSERTAR NUEVA PÁGINA EN MÓDULO 20
-- ============================================================================
INSERT INTO dim_paginas_modulo (
    id_pagina,
    id_modulo,
    nombre_pagina,
    ruta_pagina,
    descripcion,
    activo,
    orden,
    created_at,
    updated_at
) VALUES (
    90,
    20,
    'Gestión de Modalidad de Atención',
    '/roles/externo/gestion-modalidad',
    'Permite al Personal Externo actualizar la modalidad de atención de su IPRESS',
    true,
    4,
    NOW(),
    NOW()
) ON CONFLICT (id_pagina) DO NOTHING;

-- ============================================================================
-- 2️⃣ ASIGNAR PERMISOS A INSTITUCION_EX (ID 18)
-- ============================================================================
INSERT INTO segu_permisos_rol_pagina (
    id_rol,
    id_pagina,
    puede_ver,
    puede_editar,
    activo,
    autorizado_por,
    created_at,
    updated_at
) VALUES (
    18,
    90,
    true,
    true,
    true,
    'SYSTEM',
    NOW(),
    NOW()
) ON CONFLICT (id_rol, id_pagina) DO NOTHING;

-- ============================================================================
-- 3️⃣ ASIGNAR PERMISOS A ADMIN Y SUPERADMIN
-- ============================================================================
INSERT INTO segu_permisos_rol_pagina (
    id_rol,
    id_pagina,
    puede_ver,
    puede_editar,
    activo,
    autorizado_por,
    created_at,
    updated_at
)
SELECT
    r.id_rol,
    90,
    true,
    true,
    true,
    'SYSTEM',
    NOW(),
    NOW()
FROM dim_roles r
WHERE r.desc_rol IN ('ADMIN', 'SUPERADMIN')
AND NOT EXISTS (
    SELECT 1
    FROM segu_permisos_rol_pagina prp
    WHERE prp.id_rol = r.id_rol
    AND prp.id_pagina = 90
);

-- ============================================================================
-- 4️⃣ VERIFICACIÓN: Consultar página creada
-- ============================================================================
SELECT
    p.id_pagina,
    p.nombre_pagina,
    p.ruta_pagina,
    p.id_modulo,
    r.desc_rol,
    prp.puede_ver,
    prp.puede_editar,
    prp.activo
FROM dim_paginas_modulo p
LEFT JOIN segu_permisos_rol_pagina prp ON p.id_pagina = prp.id_pagina
LEFT JOIN dim_roles r ON prp.id_rol = r.id_rol
WHERE p.id_pagina = 90
ORDER BY r.desc_rol;

-- ============================================================================
-- 5️⃣ COMMIT
-- ============================================================================
COMMIT;

-- ============================================================================
-- ✅ SCRIPT COMPLETADO
-- ============================================================================
-- La página ha sido creada exitosamente y asignada a los roles correspondientes.
-- Verificar que los permisos aparezcan en el resultado de la consulta anterior.
