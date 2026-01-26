-- ============================================================================
-- REGISTRO DE PÁGINAS DEL MÓDULO ASEGURADOS EN SISTEMA MBAC
-- ============================================================================
-- Propósito: Registrar las 3 páginas del módulo Asegurados en dim_paginas
--           y asignar permisos MBAC a todos los roles
-- Fecha: 2026-01-26
-- Impacto: 78 registros de permisos creados (3 páginas × 26 roles)
-- Riesgo: BAJO (solo agrega registros)
-- Reversibilidad: SÍ
-- ============================================================================

SELECT 'PASO 1: REGISTRAR PÁGINAS DEL MÓDULO ASEGURADOS' as paso;

-- 1. Registrar las 3 páginas del módulo Asegurados en dim_paginas
INSERT INTO dim_paginas (nombre_pagina, ruta_pagina, modulo, activo)
VALUES 
  ('Revisar Duplicados', '/asegurados/duplicados', 'Asegurados', true),
  ('Buscar Asegurado', '/asegurados/buscar', 'Asegurados', true),
  ('Dashboard Asegurados', '/asegurados/dashboard', 'Asegurados', true)
ON CONFLICT (ruta_pagina) DO NOTHING;

SELECT 'PASO 2: VERIFICAR PÁGINAS CREADAS' as paso;

-- 2. Verificar que se crearon correctamente
SELECT id_pagina, nombre_pagina, ruta_pagina, modulo, activo
FROM dim_paginas
WHERE modulo = 'Asegurados'
ORDER BY id_pagina;

SELECT 'PASO 3: CREAR PERMISOS MBAC PARA TODOS LOS ROLES' as paso;

-- 3. Asignar permisos a todos los roles para ver las 3 páginas
-- Página: Revisar Duplicados
INSERT INTO segu_permisos_rol_pagina 
  (id_rol, id_pagina, puede_ver, puede_crear, puede_editar, puede_eliminar, puede_exportar, puede_importar, puede_aprobar, activo)
SELECT DISTINCT r.id_rol, p.id_pagina, true, false, false, false, true, false, false, true
FROM dim_roles r
CROSS JOIN dim_paginas p
WHERE p.nombre_pagina = 'Revisar Duplicados'
  AND r.activo = true
  AND r.id_rol NOT IN (
    SELECT id_rol FROM segu_permisos_rol_pagina WHERE id_pagina = p.id_pagina
  )
ON CONFLICT DO NOTHING;

-- Página: Buscar Asegurado
INSERT INTO segu_permisos_rol_pagina 
  (id_rol, id_pagina, puede_ver, puede_crear, puede_editar, puede_eliminar, puede_exportar, puede_importar, puede_aprobar, activo)
SELECT DISTINCT r.id_rol, p.id_pagina, true, false, false, false, true, false, false, true
FROM dim_roles r
CROSS JOIN dim_paginas p
WHERE p.nombre_pagina = 'Buscar Asegurado'
  AND r.activo = true
  AND r.id_rol NOT IN (
    SELECT id_rol FROM segu_permisos_rol_pagina WHERE id_pagina = p.id_pagina
  )
ON CONFLICT DO NOTHING;

-- Página: Dashboard Asegurados
INSERT INTO segu_permisos_rol_pagina 
  (id_rol, id_pagina, puede_ver, puede_crear, puede_editar, puede_eliminar, puede_exportar, puede_importar, puede_aprobar, activo)
SELECT DISTINCT r.id_rol, p.id_pagina, true, false, false, false, true, false, false, true
FROM dim_roles r
CROSS JOIN dim_paginas p
WHERE p.nombre_pagina = 'Dashboard Asegurados'
  AND r.activo = true
  AND r.id_rol NOT IN (
    SELECT id_rol FROM segu_permisos_rol_pagina WHERE id_pagina = p.id_pagina
  )
ON CONFLICT DO NOTHING;

SELECT 'PASO 4: VERIFICAR PERMISOS CREADOS' as paso;

-- 4. Verificar los permisos
SELECT COUNT(*) as "Total permisos creados"
FROM segu_permisos_rol_pagina srp
WHERE srp.id_pagina IN (
  SELECT id_pagina FROM dim_paginas WHERE modulo = 'Asegurados'
);

-- 5. Resumen por página
SELECT 
  p.nombre_pagina,
  COUNT(DISTINCT srp.id_rol) as "Roles con acceso",
  COUNT(CASE WHEN srp.puede_ver THEN 1 END) as "Pueden ver",
  COUNT(CASE WHEN srp.puede_exportar THEN 1 END) as "Pueden exportar"
FROM dim_paginas p
LEFT JOIN segu_permisos_rol_pagina srp ON srp.id_pagina = p.id_pagina
WHERE p.modulo = 'Asegurados'
GROUP BY p.id_pagina, p.nombre_pagina
ORDER BY p.id_pagina;

SELECT 'PASO 5: REVERSIÓN (SOLO SI ES NECESARIO)' as paso;

/*
-- DESHACER SI ES NECESARIO:
DELETE FROM segu_permisos_rol_pagina
WHERE id_pagina IN (
  SELECT id_pagina FROM dim_paginas WHERE modulo = 'Asegurados'
);

DELETE FROM dim_paginas
WHERE modulo = 'Asegurados' 
  AND nombre_pagina IN ('Revisar Duplicados', 'Buscar Asegurado', 'Dashboard Asegurados');

-- Verificar reversión
SELECT COUNT(*) as "Páginas Asegurados" FROM dim_paginas WHERE modulo = 'Asegurados';
*/

SELECT 'PASO 6: CONCLUSIÓN' as paso;

/*
RESULTADO ESPERADO:
✅ Páginas registradas: 3
✅ Permisos MBAC creados: 78 (3 páginas × 26 roles)
✅ Módulo Asegurados: Visible con 3 páginas
✅ Acceso: Todos los roles pueden ver las 3 páginas
✅ Exportación: Habilitada para reportes
✅ Status: ✅ SEGURO EJECUTAR
*/
