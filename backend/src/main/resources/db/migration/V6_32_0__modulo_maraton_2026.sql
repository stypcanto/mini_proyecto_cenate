-- ============================================================
-- V6_32_0: Módulo "Maratón 2026" — Nuevo módulo de primer nivel en sidebar
--
-- Páginas:
--   1. Avances de Citación  → /maraton2026/avances-citacion
--   2. Resumen de Atención  → /maraton2026/resumen-atencion
--
-- Acceso: todos los roles COORDINADOR* + SUPERADMIN + SUBDIRECCION_DE_TELESALUD
-- ============================================================

-- 1. Crear módulo
INSERT INTO dim_modulos_sistema (nombre_modulo, descripcion, orden)
SELECT 'Maratón 2026', 'Módulo de seguimiento de citación y atenciones — Maratón de Salud 2026', 50
WHERE NOT EXISTS (
  SELECT 1 FROM dim_modulos_sistema WHERE nombre_modulo = 'Maratón 2026'
);

-- 2. Crear páginas del módulo
INSERT INTO dim_paginas_modulo (id_modulo, nombre_pagina, ruta_pagina, descripcion, activo, orden, icono)
SELECT m.id_modulo,
       'Avances de Citación',
       '/maraton2026/avances-citacion',
       'Seguimiento de avances en la citación de pacientes de la Maratón 2026',
       true, 1, 'CalendarCheck'
FROM dim_modulos_sistema m
WHERE m.nombre_modulo = 'Maratón 2026'
ON CONFLICT (id_modulo, ruta_pagina) DO NOTHING;

INSERT INTO dim_paginas_modulo (id_modulo, nombre_pagina, ruta_pagina, descripcion, activo, orden, icono)
SELECT m.id_modulo,
       'Resumen de Atención',
       '/maraton2026/resumen-atencion',
       'Resumen consolidado de atenciones realizadas en la Maratón 2026',
       true, 2, 'Activity'
FROM dim_modulos_sistema m
WHERE m.nombre_modulo = 'Maratón 2026'
ON CONFLICT (id_modulo, ruta_pagina) DO NOTHING;

-- 3. Permisos: COORDINADORES internos + SUPERADMIN + SUBDIRECCION_DE_TELESALUD
--    Se usa LIKE para capturar todas las variantes de coordinador sin hardcodear IDs
INSERT INTO segu_permisos_rol_pagina
  (id_rol, id_pagina, puede_ver, puede_crear, puede_editar, puede_eliminar, puede_exportar, puede_importar, puede_aprobar, activo, autorizado_por)
SELECT
  r.id_rol,
  p.id_pagina,
  true,  -- puede_ver
  false, -- puede_crear
  false, -- puede_editar
  false, -- puede_eliminar
  true,  -- puede_exportar
  false, -- puede_importar
  false, -- puede_aprobar
  true,
  'V6_32_0 - Módulo Maratón 2026'
FROM dim_paginas_modulo p
CROSS JOIN (
  SELECT id_rol FROM dim_roles
  WHERE UPPER(desc_rol) LIKE '%SUPERADMIN%'
     OR UPPER(desc_rol) LIKE '%SUBDIRECCION%'
     OR UPPER(desc_rol) LIKE '%COORD%'
     OR UPPER(desc_rol) LIKE '%GESTOR DE CITAS%'
) r
WHERE p.ruta_pagina IN (
  '/maraton2026/avances-citacion',
  '/maraton2026/resumen-atencion'
)
ON CONFLICT (id_rol, id_pagina) DO NOTHING;

-- 4. Permisos de MÓDULO en segu_permisos_rol_modulo (requerido por fn_seguridad_obtener_menu_usuario_vf)
--    Sin esta tabla el módulo no aparece en el sidebar aunque las páginas tengan permisos
INSERT INTO segu_permisos_rol_modulo
  (id_rol, id_modulo, puede_acceder, puede_ver, puede_crear, puede_editar, puede_eliminar, puede_exportar, puede_importar, puede_aprobar, activo, autorizado_por)
SELECT
  r.id_rol,
  m.id_modulo,
  true, true, false, false, false, true, false, false,
  true,
  'V6_32_0 - Módulo Maratón 2026'
FROM dim_modulos_sistema m
CROSS JOIN (
  SELECT id_rol FROM dim_roles
  WHERE UPPER(desc_rol) LIKE '%SUPERADMIN%'
     OR UPPER(desc_rol) LIKE '%SUBDIRECCION%'
     OR UPPER(desc_rol) LIKE '%COORD%'
     OR UPPER(desc_rol) LIKE '%GESTOR DE CITAS%'
) r
WHERE m.nombre_modulo = 'Maratón 2026'
ON CONFLICT (id_rol, id_modulo) DO NOTHING;
