-- ============================================================================
-- Migration V3.2.1: Configurar Permisos MBAC para Asignación de Gestora
-- ============================================================================
-- Descripción:
--   Configura permisos MBAC para que COORDINADOR_DE_CITAS pueda asignar
--   solicitudes de bolsa a GESTORES_DE_CITAS
--
-- Módulo: Bolsas de Pacientes v2.4.0
-- Fecha: 2026-01-29
-- Autor: Arquitectura CENATE
-- ============================================================================

-- ============================================================================
-- 1. Verificar si la página ya existe
-- ============================================================================

-- Insertar página del módulo de bolsas (si no existe)
INSERT INTO dim_paginas_modulo (nombre_pagina, ruta_pagina, desc_pagina, activo)
VALUES (
    'Solicitudes de Bolsa - Asignación',
    '/modulos/bolsas/solicitudes',
    'Página para asignación de solicitudes de bolsa a gestoras de citas',
    true
)
ON CONFLICT (ruta_pagina) DO NOTHING;

-- ============================================================================
-- 2. Obtener IDs necesarios (para el resto de queries)
-- ============================================================================

-- Nota: Usaremos subqueries para obtener IDs dinámicamente
-- Esto evita problemas si los IDs cambian entre ambientes

-- ============================================================================
-- 3. Insertar acción "asignar" si no existe
-- ============================================================================

INSERT INTO dim_acciones (codigo_accion, desc_accion, activo)
VALUES (
    'asignar',
    'Asignar solicitud a gestor',
    true
)
ON CONFLICT (codigo_accion) DO NOTHING;

-- ============================================================================
-- 4. Configurar permisos para COORDINADOR_DE_CITAS
-- ============================================================================

-- Asignar permiso de lectura y escritura para COORDINADOR_DE_CITAS
-- en la página de solicitudes de bolsa (acción: asignar)

INSERT INTO segu_permisos_rol_pagina (
    id_rol,
    id_pagina,
    permite_lectura,
    permite_escritura,
    permite_eliminar,
    permite_exportar,
    activo
)
SELECT
    r.id_rol,
    p.id_pagina,
    true,  -- permite_lectura
    true,  -- permite_escritura (CRÍTICO para asignar)
    false, -- permite_eliminar
    false, -- permite_exportar
    true   -- activo
FROM dim_roles r
CROSS JOIN dim_paginas_modulo p
WHERE r.desc_rol = 'COORDINADOR_DE_CITAS'
  AND p.ruta_pagina = '/modulos/bolsas/solicitudes'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 5. Configurar permisos para GESTOR_DE_CITAS (lectura de sus asignaciones)
-- ============================================================================

INSERT INTO segu_permisos_rol_pagina (
    id_rol,
    id_pagina,
    permite_lectura,
    permite_escritura,  -- NO puede asignar a otros
    permite_eliminar,
    permite_exportar,
    activo
)
SELECT
    r.id_rol,
    p.id_pagina,
    true,   -- permite_lectura (VE sus propias asignaciones)
    false,  -- permite_escritura (NO puede asignar)
    false,  -- permite_eliminar
    true,   -- permite_exportar (para reportes)
    true    -- activo
FROM dim_roles r
CROSS JOIN dim_paginas_modulo p
WHERE r.desc_rol = 'GESTOR_DE_CITAS'
  AND p.ruta_pagina = '/modulos/bolsas/solicitudes'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 6. Logs de Auditoría (información de la migración)
-- ============================================================================

-- Registrar la configuración de MBAC
INSERT INTO dim_auditoria_migraciones (
    numero_migracion,
    descripcion,
    fecha_ejecucion,
    estado,
    detalles
)
VALUES (
    'V3_2_1',
    'Configurar permisos MBAC para asignación de gestora en bolsas',
    NOW(),
    'COMPLETADO',
    'Creada página /modulos/bolsas/solicitudes. Permisos: COORDINADOR_DE_CITAS (lectura+escritura), GESTOR_DE_CITAS (lectura)'
)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- FIN DE LA MIGRACIÓN
-- ============================================================================
-- Configuración de MBAC:
--
-- ✅ Página: /modulos/bolsas/solicitudes
-- ✅ Acción: asignar
--
-- Permisos:
-- - COORDINADOR_DE_CITAS:
--   • permite_lectura = true
--   • permite_escritura = true (puede asignar)
--   • permite_eliminar = false
--   • permite_exportar = false
--
-- - GESTOR_DE_CITAS:
--   • permite_lectura = true (ve sus asignaciones)
--   • permite_escritura = false (NO puede asignar)
--   • permite_eliminar = false
--   • permite_exportar = true (reportes)
--
-- Otros roles: Sin permiso por defecto
--
-- Testing:
-- SELECT * FROM segu_permisos_rol_pagina WHERE id_pagina = (
--   SELECT id_pagina FROM dim_paginas_modulo
--   WHERE ruta_pagina = '/modulos/bolsas/solicitudes'
-- );
-- ============================================================================
