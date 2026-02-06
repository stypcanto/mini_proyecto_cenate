-- ============================================================================
-- Migration V3.4.1: Configurar Permisos MBAC para TeleEKGs - Usuarios Externos
-- ============================================================================
-- Descripción:
--   Configura permisos MBAC para que INSTITUCION_EX (usuarios externos)
--   puedan acceder al módulo de carga de ECGs (TeleEKGs)
--
-- Módulo: TeleEKGs v1.50.3
-- Fecha: 2026-02-06
-- Autor: Arquitectura CENATE
-- ============================================================================

-- ============================================================================
-- 1. Insertar páginas del módulo TeleEKGs (si no existen)
-- ============================================================================

INSERT INTO dim_paginas_modulo (nombre_pagina, ruta_pagina, desc_pagina, activo)
VALUES (
    'TeleEKGs - Listar Imágenes',
    '/teleekgs/listar',
    'Página para listar imágenes ECG cargadas',
    true
)
ON CONFLICT (ruta_pagina) DO NOTHING;

INSERT INTO dim_paginas_modulo (nombre_pagina, ruta_pagina, desc_pagina, activo)
VALUES (
    'TeleEKGs - Cargar Imágenes',
    '/teleekgs/upload',
    'Página para cargar nuevas imágenes ECG',
    true
)
ON CONFLICT (ruta_pagina) DO NOTHING;

INSERT INTO dim_paginas_modulo (nombre_pagina, ruta_pagina, desc_pagina, activo)
VALUES (
    'TeleEKGs - Dashboard',
    '/teleekgs/dashboard',
    'Panel de control de TeleEKGs con estadísticas',
    true
)
ON CONFLICT (ruta_pagina) DO NOTHING;

-- ============================================================================
-- 2. Insertar acciones para TeleEKGs (si no existen)
-- ============================================================================

INSERT INTO dim_acciones (codigo_accion, desc_accion, activo)
VALUES (
    'cargar_ecg',
    'Cargar imagen ECG',
    true
)
ON CONFLICT (codigo_accion) DO NOTHING;

INSERT INTO dim_acciones (codigo_accion, desc_accion, activo)
VALUES (
    'descargar_ecg',
    'Descargar imagen ECG',
    true
)
ON CONFLICT (codigo_accion) DO NOTHING;

-- ============================================================================
-- 3. Configurar permisos para INSTITUCION_EX en /teleekgs/listar
-- ============================================================================

INSERT INTO segu_permisos_rol_pagina (
    id_rol,
    id_pagina,
    puede_ver,
    puede_crear,
    puede_editar,
    puede_eliminar,
    puede_exportar,
    activo
)
SELECT
    r.id_rol,
    p.id_pagina,
    true,   -- puede_ver (VE sus ECGs)
    false,  -- puede_crear (NO puede crear desde lista)
    false,  -- puede_editar (NO puede editar lista)
    false,  -- puede_eliminar (NO puede borrar desde lista)
    true,   -- puede_exportar (para reportes)
    true    -- activo
FROM dim_roles r
CROSS JOIN dim_paginas_modulo p
WHERE r.desc_rol = 'INSTITUCION_EX'
  AND p.ruta_pagina = '/teleekgs/listar'
ON CONFLICT (id_rol, id_pagina) DO NOTHING;

-- ============================================================================
-- 4. Configurar permisos para INSTITUCION_EX en /teleekgs/upload
-- ============================================================================

INSERT INTO segu_permisos_rol_pagina (
    id_rol,
    id_pagina,
    puede_ver,
    puede_crear,
    puede_editar,
    puede_eliminar,
    puede_exportar,
    activo
)
SELECT
    r.id_rol,
    p.id_pagina,
    true,   -- puede_ver (VE el formulario)
    true,   -- puede_crear (CRÍTICO para cargar archivos = crear registros ECG)
    false,  -- puede_editar
    false,  -- puede_eliminar
    false,  -- puede_exportar
    true    -- activo
FROM dim_roles r
CROSS JOIN dim_paginas_modulo p
WHERE r.desc_rol = 'INSTITUCION_EX'
  AND p.ruta_pagina = '/teleekgs/upload'
ON CONFLICT (id_rol, id_pagina) DO NOTHING;

-- ============================================================================
-- 5. Configurar permisos para INSTITUCION_EX en /teleekgs/dashboard
-- ============================================================================

INSERT INTO segu_permisos_rol_pagina (
    id_rol,
    id_pagina,
    puede_ver,
    puede_crear,
    puede_editar,
    puede_eliminar,
    puede_exportar,
    activo
)
SELECT
    r.id_rol,
    p.id_pagina,
    true,   -- puede_ver (VE su dashboard)
    false,  -- puede_crear
    false,  -- puede_editar
    false,  -- puede_eliminar
    true,   -- puede_exportar
    true    -- activo
FROM dim_roles r
CROSS JOIN dim_paginas_modulo p
WHERE r.desc_rol = 'INSTITUCION_EX'
  AND p.ruta_pagina = '/teleekgs/dashboard'
ON CONFLICT (id_rol, id_pagina) DO NOTHING;

-- ============================================================================
-- 6. Registrar la migración en auditoría (si tabla existe)
-- ============================================================================

INSERT INTO dim_auditoria_migraciones (
    numero_migracion,
    descripcion,
    fecha_ejecucion,
    estado,
    detalles
)
VALUES (
    'V3_4_1',
    'Configurar permisos MBAC para TeleEKGs - Usuarios Externos (INSTITUCION_EX)',
    NOW(),
    'COMPLETADO',
    'Creadas páginas /teleekgs/listar, /teleekgs/upload, /teleekgs/dashboard. Permisos: INSTITUCION_EX (lectura+escritura en upload, lectura en listar+dashboard)'
)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- FIN DE LA MIGRACIÓN V3_4_1
-- ============================================================================
-- Configuración de MBAC:
--
-- ✅ Páginas:
--    • /teleekgs/listar      → lectura + exportar
--    • /teleekgs/upload      → lectura + escritura (para subir archivos)
--    • /teleekgs/dashboard   → lectura + exportar
--
-- ✅ Acciones:
--    • cargar_ecg    → Cargar imagen ECG
--    • descargar_ecg → Descargar imagen ECG
--
-- Permisos para INSTITUCION_EX:
--    • /teleekgs/listar:
--      - puede_ver = true
--      - puede_crear = false
--      - puede_editar = false
--      - puede_eliminar = false
--      - puede_exportar = true
--
--    • /teleekgs/upload:
--      - puede_ver = true
--      - puede_crear = true (CRÍTICO para upload = crear registros ECG)
--      - puede_editar = false
--      - puede_eliminar = false
--      - puede_exportar = false
--
--    • /teleekgs/dashboard:
--      - puede_ver = true
--      - puede_crear = false
--      - puede_editar = false
--      - puede_eliminar = false
--      - puede_exportar = true
--
-- Testing:
-- SELECT r.desc_rol, p.ruta_pagina, pp.permite_lectura, pp.permite_escritura
-- FROM segu_permisos_rol_pagina pp
-- JOIN dim_roles r ON pp.id_rol = r.id_rol
-- JOIN dim_paginas_modulo p ON pp.id_pagina = p.id_pagina
-- WHERE r.desc_rol = 'INSTITUCION_EX'
-- AND p.ruta_pagina LIKE '%teleekgs%'
-- ORDER BY p.ruta_pagina;
-- ============================================================================
