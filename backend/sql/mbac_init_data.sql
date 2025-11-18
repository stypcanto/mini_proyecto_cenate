-- ============================================================================
-- SCRIPT DE INICIALIZACIÓN MBAC (Modular-Based Access Control)
-- Sistema: CENATE - Centro Nacional de Telemedicina del Perú
-- Autor: CENATE Development Team
-- Versión: 1.0
-- Fecha: Octubre 2025
-- ============================================================================

-- Este script inicializa los datos necesarios para el sistema MBAC

-- ============================================================================
-- 1. MÓDULOS DEL SISTEMA
-- ============================================================================

INSERT INTO dim_modulos_sistema (nombre_modulo, ruta_base, descripcion, icono, activo)
VALUES 
('Gestión de Citas', '/citas', 'Módulo para la gestión y seguimiento de citas médicas', 'calendar', true),
('Gestión de Personal', '/personal', 'Módulo para la administración de personal médico y administrativo', 'users', true),
('Gestión de Pacientes', '/pacientes', 'Módulo para la gestión de asegurados y pacientes', 'user-check', true),
('Gestión de IPRESS', '/ipress', 'Módulo para la administración de IPRESS', 'building', true),
('Reportes y Analítica', '/reportes', 'Módulo de reportes y dashboard analítico', 'bar-chart', true),
('Administración de Roles y Permisos', '/admin/permisos', 'Módulo de administración del sistema MBAC', 'shield', true),
('Auditoría del Sistema', '/admin/auditoria', 'Módulo de consulta de auditoría y trazabilidad', 'file-text', true)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 2. PÁGINAS DE LOS MÓDULOS
-- ============================================================================

-- Módulo: Gestión de Citas (id_modulo = 1)
INSERT INTO dim_paginas_modulo (id_modulo, nombre_pagina, ruta_pagina, descripcion, activo)
VALUES 
(1, 'Dashboard de Citas', '/roles/medico/citas/dashboard', 'Panel principal de visualización de citas', true),
(1, 'Listado de Citas', '/roles/medico/citas', 'Listado completo de citas médicas', true),
(1, 'Crear Cita', '/roles/medico/citas/crear', 'Formulario para crear nuevas citas', true),
(1, 'Calendario de Citas', '/roles/medico/citas/calendario', 'Vista de calendario con citas programadas', true)
ON CONFLICT DO NOTHING;

-- Módulo: Gestión de Personal (id_modulo = 2)
INSERT INTO dim_paginas_modulo (id_modulo, nombre_pagina, ruta_pagina, descripcion, activo)
VALUES 
(2, 'Listado de Personal', '/roles/admin/personal', 'Listado del personal del sistema', true),
(2, 'Crear Personal', '/roles/admin/personal/crear', 'Formulario de registro de personal', true),
(2, 'Editar Personal', '/roles/admin/personal/editar', 'Formulario de edición de personal', true),
(2, 'Personal Externo', '/roles/admin/personal/externo', 'Gestión de personal externo', true)
ON CONFLICT DO NOTHING;

-- Módulo: Gestión de Pacientes (id_modulo = 3)
INSERT INTO dim_paginas_modulo (id_modulo, nombre_pagina, ruta_pagina, descripcion, activo)
VALUES 
(3, 'Listado de Pacientes', '/roles/medico/pacientes', 'Listado de pacientes y asegurados', true),
(3, 'Perfil de Paciente', '/roles/medico/pacientes/perfil', 'Vista detallada del perfil del paciente', true),
(3, 'Historia Clínica', '/roles/medico/pacientes/historia', 'Acceso a historia clínica del paciente', true)
ON CONFLICT DO NOTHING;

-- Módulo: Gestión de IPRESS (id_modulo = 4)
INSERT INTO dim_paginas_modulo (id_modulo, nombre_pagina, ruta_pagina, descripcion, activo)
VALUES 
(4, 'Listado de IPRESS', '/roles/admin/ipress', 'Listado de IPRESS registradas', true),
(4, 'Crear IPRESS', '/roles/admin/ipress/crear', 'Formulario de registro de IPRESS', true),
(4, 'Editar IPRESS', '/roles/admin/ipress/editar', 'Formulario de edición de IPRESS', true)
ON CONFLICT DO NOTHING;

-- Módulo: Reportes y Analítica (id_modulo = 5)
INSERT INTO dim_paginas_modulo (id_modulo, nombre_pagina, ruta_pagina, descripcion, activo)
VALUES 
(5, 'Dashboard Principal', '/roles/admin/dashboard', 'Dashboard principal con métricas', true),
(5, 'Reportes de Citas', '/roles/admin/reportes/citas', 'Reportes estadísticos de citas', true),
(5, 'Exportar Datos', '/roles/admin/reportes/exportar', 'Exportación de datos del sistema', true)
ON CONFLICT DO NOTHING;

-- Módulo: Administración de Roles y Permisos (id_modulo = 6)
INSERT INTO dim_paginas_modulo (id_modulo, nombre_pagina, ruta_pagina, descripcion, activo)
VALUES 
(6, 'Gestión de Roles', '/roles/superadmin/roles', 'Administración de roles del sistema', true),
(6, 'Gestión de Permisos', '/roles/superadmin/permisos', 'Administración de permisos modulares', true),
(6, 'Asignación de Roles', '/roles/superadmin/usuarios/roles', 'Asignación de roles a usuarios', true)
ON CONFLICT DO NOTHING;

-- Módulo: Auditoría del Sistema (id_modulo = 7)
INSERT INTO dim_paginas_modulo (id_modulo, nombre_pagina, ruta_pagina, descripcion, activo)
VALUES 
(7, 'Logs de Auditoría', '/roles/superadmin/auditoria', 'Visualización de logs del sistema', true),
(7, 'Auditoría de Permisos', '/roles/superadmin/auditoria/permisos', 'Auditoría específica de cambios en permisos', true)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 3. CONTEXTOS DE MÓDULOS
-- ============================================================================

INSERT INTO dim_contexto_modulo (id_modulo, entidad_principal, descripcion, activo)
VALUES 
(1, 'Cita', 'Entidad principal: Citas médicas', true),
(2, 'PersonalCnt', 'Entidad principal: Personal del CENATE', true),
(3, 'Asegurado', 'Entidad principal: Pacientes asegurados', true),
(4, 'Ipress', 'Entidad principal: Instituciones prestadoras de servicios de salud', true),
(5, 'Reporte', 'Entidad principal: Reportes del sistema', true),
(6, 'PermisoModular', 'Entidad principal: Permisos del sistema MBAC', true),
(7, 'AuditLog', 'Entidad principal: Registros de auditoría', true)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 4. PERMISOS PARA ROL SUPERADMIN (id_rol = 1)
-- ============================================================================
-- El SUPERADMIN tiene acceso completo a todo el sistema

-- Permisos para Gestión de Citas
INSERT INTO dim_permisos_modulares (id_rol, id_pagina, puede_ver, puede_crear, puede_editar, puede_eliminar, puede_exportar, puede_aprobar, activo, autorizado_por)
SELECT 1, id_pagina, true, true, true, true, true, true, true, 1
FROM dim_paginas_modulo WHERE id_modulo = 1
ON CONFLICT DO NOTHING;

-- Permisos para Gestión de Personal
INSERT INTO dim_permisos_modulares (id_rol, id_pagina, puede_ver, puede_crear, puede_editar, puede_eliminar, puede_exportar, puede_aprobar, activo, autorizado_por)
SELECT 1, id_pagina, true, true, true, true, true, true, true, 1
FROM dim_paginas_modulo WHERE id_modulo = 2
ON CONFLICT DO NOTHING;

-- Permisos para Gestión de Pacientes
INSERT INTO dim_permisos_modulares (id_rol, id_pagina, puede_ver, puede_crear, puede_editar, puede_eliminar, puede_exportar, puede_aprobar, activo, autorizado_por)
SELECT 1, id_pagina, true, true, true, true, true, true, true, 1
FROM dim_paginas_modulo WHERE id_modulo = 3
ON CONFLICT DO NOTHING;

-- Permisos para Gestión de IPRESS
INSERT INTO dim_permisos_modulares (id_rol, id_pagina, puede_ver, puede_crear, puede_editar, puede_eliminar, puede_exportar, puede_aprobar, activo, autorizado_por)
SELECT 1, id_pagina, true, true, true, true, true, true, true, 1
FROM dim_paginas_modulo WHERE id_modulo = 4
ON CONFLICT DO NOTHING;

-- Permisos para Reportes
INSERT INTO dim_permisos_modulares (id_rol, id_pagina, puede_ver, puede_crear, puede_editar, puede_eliminar, puede_exportar, puede_aprobar, activo, autorizado_por)
SELECT 1, id_pagina, true, true, true, true, true, true, true, 1
FROM dim_paginas_modulo WHERE id_modulo = 5
ON CONFLICT DO NOTHING;

-- Permisos para Administración de Roles y Permisos
INSERT INTO dim_permisos_modulares (id_rol, id_pagina, puede_ver, puede_crear, puede_editar, puede_eliminar, puede_exportar, puede_aprobar, activo, autorizado_por)
SELECT 1, id_pagina, true, true, true, true, true, true, true, 1
FROM dim_paginas_modulo WHERE id_modulo = 6
ON CONFLICT DO NOTHING;

-- Permisos para Auditoría
INSERT INTO dim_permisos_modulares (id_rol, id_pagina, puede_ver, puede_crear, puede_editar, puede_eliminar, puede_exportar, puede_aprobar, activo, autorizado_por)
SELECT 1, id_pagina, true, true, true, true, true, true, true, 1
FROM dim_paginas_modulo WHERE id_modulo = 7
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 5. PERMISOS PARA ROL ADMIN (id_rol = 2)
-- ============================================================================
-- El ADMIN tiene permisos administrativos pero no puede gestionar roles/permisos

-- Permisos para Gestión de Citas (completo)
INSERT INTO dim_permisos_modulares (id_rol, id_pagina, puede_ver, puede_crear, puede_editar, puede_eliminar, puede_exportar, puede_aprobar, activo, autorizado_por)
SELECT 2, id_pagina, true, true, true, true, true, true, true, 1
FROM dim_paginas_modulo WHERE id_modulo = 1
ON CONFLICT DO NOTHING;

-- Permisos para Gestión de Personal (completo)
INSERT INTO dim_permisos_modulares (id_rol, id_pagina, puede_ver, puede_crear, puede_editar, puede_eliminar, puede_exportar, puede_aprobar, activo, autorizado_por)
SELECT 2, id_pagina, true, true, true, true, true, false, true, 1
FROM dim_paginas_modulo WHERE id_modulo = 2
ON CONFLICT DO NOTHING;

-- Permisos para Gestión de Pacientes (completo)
INSERT INTO dim_permisos_modulares (id_rol, id_pagina, puede_ver, puede_crear, puede_editar, puede_eliminar, puede_exportar, puede_aprobar, activo, autorizado_por)
SELECT 2, id_pagina, true, true, true, false, true, false, true, 1
FROM dim_paginas_modulo WHERE id_modulo = 3
ON CONFLICT DO NOTHING;

-- Permisos para Gestión de IPRESS (completo)
INSERT INTO dim_permisos_modulares (id_rol, id_pagina, puede_ver, puede_crear, puede_editar, puede_eliminar, puede_exportar, puede_aprobar, activo, autorizado_por)
SELECT 2, id_pagina, true, true, true, true, true, false, true, 1
FROM dim_paginas_modulo WHERE id_modulo = 4
ON CONFLICT DO NOTHING;

-- Permisos para Reportes (solo ver y exportar)
INSERT INTO dim_permisos_modulares (id_rol, id_pagina, puede_ver, puede_crear, puede_editar, puede_eliminar, puede_exportar, puede_aprobar, activo, autorizado_por)
SELECT 2, id_pagina, true, false, false, false, true, false, true, 1
FROM dim_paginas_modulo WHERE id_modulo = 5
ON CONFLICT DO NOTHING;

-- SIN permisos para Administración de Roles y Permisos
-- SIN permisos para Auditoría completa (solo pueden ver su propia auditoría)

-- ============================================================================
-- 6. PERMISOS PARA ROL MEDICO (id_rol = 3 o según tu configuración)
-- ============================================================================
-- Asumiendo que MEDICO tiene id_rol = 3

-- Permisos para Gestión de Citas (ver, crear, editar)
INSERT INTO dim_permisos_modulares (id_rol, id_pagina, puede_ver, puede_crear, puede_editar, puede_eliminar, puede_exportar, puede_aprobar, activo, autorizado_por)
SELECT 3, id_pagina, true, true, true, false, false, false, true, 1
FROM dim_paginas_modulo WHERE id_modulo = 1
ON CONFLICT DO NOTHING;

-- Permisos para Gestión de Pacientes (ver y editar historia clínica)
INSERT INTO dim_permisos_modulares (id_rol, id_pagina, puede_ver, puede_crear, puede_editar, puede_eliminar, puede_exportar, puede_aprobar, activo, autorizado_por)
SELECT 3, id_pagina, true, false, true, false, false, false, true, 1
FROM dim_paginas_modulo WHERE id_modulo = 3
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 7. VERIFICACIÓN DE DATOS
-- ============================================================================

-- Verificar módulos creados
SELECT COUNT(*) as total_modulos FROM dim_modulos_sistema WHERE activo = true;

-- Verificar páginas creadas
SELECT COUNT(*) as total_paginas FROM dim_paginas_modulo WHERE activo = true;

-- Verificar permisos asignados
SELECT 
    r.desc_rol,
    COUNT(*) as total_permisos,
    SUM(CASE WHEN pm.puede_ver THEN 1 ELSE 0 END) as puede_ver,
    SUM(CASE WHEN pm.puede_crear THEN 1 ELSE 0 END) as puede_crear,
    SUM(CASE WHEN pm.puede_editar THEN 1 ELSE 0 END) as puede_editar,
    SUM(CASE WHEN pm.puede_eliminar THEN 1 ELSE 0 END) as puede_eliminar,
    SUM(CASE WHEN pm.puede_exportar THEN 1 ELSE 0 END) as puede_exportar,
    SUM(CASE WHEN pm.puede_aprobar THEN 1 ELSE 0 END) as puede_aprobar
FROM dim_permisos_modulares pm
JOIN dim_roles r ON r.id_rol = pm.id_rol
WHERE pm.activo = true
GROUP BY r.desc_rol
ORDER BY r.desc_rol;

-- Verificar vista de permisos activos
SELECT COUNT(*) as permisos_activos FROM vw_permisos_activos;

-- ============================================================================
-- FIN DEL SCRIPT
-- ============================================================================
