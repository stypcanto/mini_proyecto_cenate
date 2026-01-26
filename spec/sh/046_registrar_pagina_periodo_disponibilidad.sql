-- ========================================================================
-- 📅 046_registrar_pagina_periodo_disponibilidad.sql
-- Registra la página "Periodo de Disponibilidad Médica" en MBAC
-- ========================================================================
-- Versión: 1.0.0
-- Fecha: 2026-01-26
-- Descripción:
--   Registra la nueva página de gestión de períodos de disponibilidad médica
--   en el módulo "Gestión de Coordinador Médico" y asigna permisos MBAC
--   para los roles correspondientes.
-- ========================================================================

-- ========================================================================
-- 1. REGISTRAR LA NUEVA PÁGINA EN dim_paginas_modulo
-- ========================================================================
INSERT INTO dim_paginas_modulo (
  id_modulo,
  nombre_pagina,
  ruta_pagina,
  descripcion,
  orden,
  activo,
  created_at,
  updated_at
)
SELECT
  19,  -- id_modulo de "Gestión de Coordinador Médico"
  'Período de Disponibilidad Médica',
  '/roles/coordinador/periodo-disponibilidad-medica',
  'Gestión de períodos de disponibilidad médica con estado de horas y turnos',
  6,  -- orden
  true,
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM dim_paginas_modulo
  WHERE ruta_pagina = '/roles/coordinador/periodo-disponibilidad-medica'
);

-- ========================================================================
-- 2. ASIGNAR PERMISOS PARA COORDINADOR
-- ========================================================================
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
  activo,
  created_at,
  updated_at
)
SELECT
  r.id_rol,
  p.id_pagina,
  true,   -- puede_ver
  true,   -- puede_crear
  true,   -- puede_editar
  true,   -- puede_eliminar
  true,   -- puede_exportar
  false,  -- puede_importar
  false,  -- puede_aprobar
  true,
  NOW(),
  NOW()
FROM dim_roles r
CROSS JOIN dim_paginas_modulo p
WHERE r.desc_rol = 'COORDINADOR'
AND p.ruta_pagina = '/roles/coordinador/periodo-disponibilidad-medica'
AND NOT EXISTS (
  SELECT 1 FROM segu_permisos_rol_pagina
  WHERE id_rol = r.id_rol
  AND id_pagina = p.id_pagina
);

-- ========================================================================
-- 3. ASIGNAR PERMISOS PARA MÉDICO
-- ========================================================================
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
  activo,
  created_at,
  updated_at
)
SELECT
  r.id_rol,
  p.id_pagina,
  true,   -- puede_ver
  true,   -- puede_crear
  true,   -- puede_editar (solo si está en BORRADOR - validado en API)
  false,  -- puede_eliminar
  false,  -- puede_exportar
  false,  -- puede_importar
  false,  -- puede_aprobar
  true,
  NOW(),
  NOW()
FROM dim_roles r
CROSS JOIN dim_paginas_modulo p
WHERE r.desc_rol = 'MEDICO'
AND p.ruta_pagina = '/roles/coordinador/periodo-disponibilidad-medica'
AND NOT EXISTS (
  SELECT 1 FROM segu_permisos_rol_pagina
  WHERE id_rol = r.id_rol
  AND id_pagina = p.id_pagina
);

-- ========================================================================
-- 4. ASIGNAR PERMISOS PARA ADMIN Y SUPERADMIN (Acceso Total)
-- ========================================================================
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
  activo,
  created_at,
  updated_at
)
SELECT
  r.id_rol,
  p.id_pagina,
  true,   -- puede_ver
  true,   -- puede_crear
  true,   -- puede_editar
  true,   -- puede_eliminar
  true,   -- puede_exportar
  true,   -- puede_importar
  true,   -- puede_aprobar
  true,
  NOW(),
  NOW()
FROM dim_roles r
CROSS JOIN dim_paginas_modulo p
WHERE r.desc_rol IN ('ADMIN', 'SUPERADMIN')
AND p.ruta_pagina = '/roles/coordinador/periodo-disponibilidad-medica'
AND NOT EXISTS (
  SELECT 1 FROM segu_permisos_rol_pagina
  WHERE id_rol = r.id_rol
  AND id_pagina = p.id_pagina
);

-- ========================================================================
-- 5. VERIFICACIÓN - Mostrar Página Registrada
-- ========================================================================
SELECT 'Página registrada:' as info;

SELECT
  dp.id_pagina,
  dm.nombre_modulo,
  dp.nombre_pagina,
  dp.ruta_pagina,
  dp.descripcion,
  dp.orden,
  dp.activo,
  dp.created_at
FROM dim_paginas_modulo dp
JOIN dim_modulos_sistema dm ON dp.id_modulo = dm.id_modulo
WHERE dp.ruta_pagina = '/roles/coordinador/periodo-disponibilidad-medica';

SELECT '' as separator;
SELECT 'Permisos MBAC asignados:' as info;

SELECT
  r.desc_rol,
  p.ruta_pagina,
  prp.puede_ver,
  prp.puede_crear,
  prp.puede_editar,
  prp.puede_eliminar,
  prp.puede_exportar,
  prp.puede_importar,
  prp.puede_aprobar,
  prp.activo
FROM segu_permisos_rol_pagina prp
JOIN dim_roles r ON prp.id_rol = r.id_rol
JOIN dim_paginas_modulo p ON prp.id_pagina = p.id_pagina
WHERE p.ruta_pagina = '/roles/coordinador/periodo-disponibilidad-medica'
ORDER BY r.desc_rol;
