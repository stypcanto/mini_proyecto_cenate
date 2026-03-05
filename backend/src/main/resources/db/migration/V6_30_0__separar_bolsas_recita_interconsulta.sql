-- ============================================================================
-- V6_30_0: Separar bolsa de RECITA (id=15) e INTERCONSULTA (id=16)
-- Antes ambas usaban id_bolsa=11 (BOLSA_GENERADA_X_PROFESIONAL)
-- ============================================================================

-- 1. Migrar registros históricos: RECITA → id_bolsa=15
UPDATE dim_solicitud_bolsa
SET id_bolsa = 15
WHERE tipo_cita = 'RECITA'
  AND id_bolsa IN (8, 10, 11);

-- 2. Migrar registros históricos: INTERCONSULTA → id_bolsa=16
UPDATE dim_solicitud_bolsa
SET id_bolsa = 16
WHERE tipo_cita = 'INTERCONSULTA'
  AND id_bolsa IN (8, 10, 11);

-- 3. Registrar sub-páginas en MBAC (mismo módulo 46, mismo padre 99)
INSERT INTO dim_paginas_modulo (id_modulo, nombre_pagina, ruta_pagina, descripcion, activo, orden, id_pagina_padre, icono)
VALUES
  (46, 'Pendientes Recitas',        '/bolsas/solicitudespendientes/recitas',
   'Solicitudes pendientes de tipo Recita (generadas por médico)', true, 5, 99, 'RefreshCw'),
  (46, 'Pendientes Interconsultas', '/bolsas/solicitudespendientes/interconsultas',
   'Solicitudes pendientes de tipo Interconsulta (derivación entre especialidades)', true, 6, 99, 'ArrowRightLeft')
ON CONFLICT (ruta_pagina) DO NOTHING;

-- 4. Otorgar permisos a los mismos roles que tienen acceso a las sub-páginas existentes
INSERT INTO segu_permisos_rol_pagina
  (id_rol, id_pagina, puede_ver, puede_crear, puede_editar, puede_eliminar, puede_exportar, puede_aprobar, activo, autorizado_por)
SELECT
  r.id_rol,
  p.id_pagina,
  true, true, true, true, true, true,
  true,
  'V6_30_0 - Separación bolsas recita/interconsulta'
FROM dim_paginas_modulo p
CROSS JOIN (
  SELECT id_rol FROM dim_roles WHERE id_rol IN (1, 14, 15, 20, 26, 27, 32, 34, 37)
) r
WHERE p.ruta_pagina IN (
  '/bolsas/solicitudespendientes/recitas',
  '/bolsas/solicitudespendientes/interconsultas'
)
ON CONFLICT (id_rol, id_pagina) DO NOTHING;
