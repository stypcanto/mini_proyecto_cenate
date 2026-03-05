-- ============================================================
-- V6_31_0: Sub-página "Pendientes Maratón" bajo Solicitudes Pendientes (id_pagina=99)
-- Ruta: /bolsas/solicitudespendientes/maraton
-- Filtra exclusivamente pacientes con id_bolsa = 17 (Bolsa de pacientes para la Maratón)
-- Otorga permisos a los mismos roles que tienen acceso a la página padre
-- ============================================================

-- 1. Insertar sub-página
INSERT INTO dim_paginas_modulo (id_modulo, nombre_pagina, ruta_pagina, descripcion, activo, orden, id_pagina_padre, icono)
VALUES
  (46, 'Pendientes Maratón', '/bolsas/solicitudespendientes/maraton',
   'Solicitudes pendientes de la Bolsa de pacientes para la Maratón (id_bolsa=17)', true, 6, 99, 'Trophy');

-- 2. Otorgar permisos a los mismos roles que tienen acceso a la página padre (id=99)
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
  'V6_31_0 - Migración automática'
FROM dim_paginas_modulo p
CROSS JOIN (
  SELECT id_rol FROM dim_roles WHERE id_rol IN (1, 14, 15, 20, 26, 27, 32, 34, 37)
) r
WHERE p.ruta_pagina = '/bolsas/solicitudespendientes/maraton'
ON CONFLICT (id_rol, id_pagina) DO NOTHING;
