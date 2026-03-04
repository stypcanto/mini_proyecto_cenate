-- ============================================================
-- V6_27_0: Sub-páginas de Solicitudes Pendientes en MBAC
-- Crea 3 sub-páginas bajo "Solicitudes Pendientes" (id_pagina=99)
--   1. Pendientes Medicina General  → /bolsas/solicitudespendientes/medicina-general
--   2. Pendientes Enfermería        → /bolsas/solicitudespendientes/enfermeria
--   3. Pendientes Especialidades    → /bolsas/solicitudespendientes/especialidades
-- Otorga permisos a los mismos roles que tienen acceso a la página padre
-- ============================================================

-- 1. Insertar sub-páginas
INSERT INTO dim_paginas_modulo (id_modulo, nombre_pagina, ruta_pagina, descripcion, activo, orden, id_pagina_padre, icono)
VALUES
  (46, 'Pendientes Medicina General', '/bolsas/solicitudespendientes/medicina-general',
   'Solicitudes pendientes de Medicina General', true, 1, 99, 'Stethoscope'),
  (46, 'Pendientes Enfermería',       '/bolsas/solicitudespendientes/enfermeria',
   'Solicitudes pendientes de Enfermería', true, 2, 99, 'HeartPulse'),
  (46, 'Pendientes Especialidades',   '/bolsas/solicitudespendientes/especialidades',
   'Solicitudes pendientes de Especialidades médicas', true, 3, 99, 'UserRound');

-- 2. Otorgar permisos a los mismos roles que tienen acceso (puede_ver=true) en la página padre (id=99)
-- Roles: SUPERADMIN(1), GESTOR_TERRITORIAL_TI(14), COORD. ESPECIALIDADES(15), SUBDIRECCION_DE_TELESALUD(20),
--        GESTIONTERRITORIAL(26), COORD. GESTION CITAS(27), SOPORTE_TI_107(32), MESA_DE_AYUDA(34),
--        SOPORTE_TELEUE(37)

INSERT INTO segu_permisos_rol_pagina
  (id_rol, id_pagina, puede_ver, puede_crear, puede_editar, puede_eliminar, puede_exportar, puede_aprobar, activo, autorizado_por)
SELECT
  r.id_rol,
  p.id_pagina,
  true, true, true, true, true, true,
  true,
  'V6_27_0 - Migración automática'
FROM dim_paginas_modulo p
CROSS JOIN (
  SELECT id_rol FROM dim_roles WHERE id_rol IN (1, 14, 15, 20, 26, 27, 32, 34, 37)
) r
WHERE p.ruta_pagina IN (
  '/bolsas/solicitudespendientes/medicina-general',
  '/bolsas/solicitudespendientes/enfermeria',
  '/bolsas/solicitudespendientes/especialidades'
)
ON CONFLICT (id_rol, id_pagina) DO NOTHING;
