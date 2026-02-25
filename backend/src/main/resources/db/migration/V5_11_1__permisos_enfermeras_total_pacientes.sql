-- ============================================================================
-- V5_11_1: Permisos individuales para enfermeras DNI 44012678 y 44433602
--           en la página /enfermeria/total-pacientes-enfermeria
-- Autor: Styp Canto Rondón / Claude Code
-- Fecha: 2026-02-24
-- Descripción: Las enfermeras con esos DNIs no pueden ver la nueva página porque
--              no tienen entrada en permisos_modulares. Se insertan aquí por DNI,
--              sin depender del id_user hardcodeado.
-- ============================================================================

-- Insertar permisos_modulares para los dos usuarios buscados por DNI
INSERT INTO permisos_modulares
    (id_user, id_rol, id_modulo, id_pagina, accion,
     puede_ver, puede_crear, puede_editar, puede_eliminar, puede_exportar, puede_aprobar, activo)
SELECT
    u.id_user,
    rol.id_rol,
    pag.id_modulo,
    pag.id_pagina,
    'all',
    true,  -- puede_ver
    true,  -- puede_crear
    true,  -- puede_editar
    false, -- puede_eliminar
    true,  -- puede_exportar
    false, -- puede_aprobar
    true
FROM dim_personal_cnt pc
JOIN dim_usuarios u ON pc.id_usuario = u.id_user
CROSS JOIN (
    SELECT id_pagina, id_modulo
    FROM dim_paginas_modulo
    WHERE ruta_pagina = '/enfermeria/total-pacientes-enfermeria'
    LIMIT 1
) pag
CROSS JOIN (
    SELECT id_rol FROM dim_roles
    WHERE UPPER(desc_rol) LIKE '%COORD%ENFERM%'
    LIMIT 1
) rol
WHERE pc.num_doc_pers IN ('44012678', '44433602')
ON CONFLICT DO NOTHING;

-- Verificar qué usuarios se afectaron
SELECT
    u.id_user,
    u.name_user,
    pc.num_doc_pers            AS dni,
    CONCAT(pc.ape_pater_pers, ' ', pc.ape_mater_pers, ' ', pc.nom_pers) AS nombre,
    pm.puede_ver,
    pm.activo,
    p.ruta_pagina
FROM permisos_modulares pm
JOIN dim_usuarios u            ON pm.id_user  = u.id_user
JOIN dim_personal_cnt pc       ON pc.id_usuario = u.id_user
JOIN dim_paginas_modulo p      ON pm.id_pagina  = p.id_pagina
WHERE pc.num_doc_pers IN ('44012678', '44433602')
  AND p.ruta_pagina = '/enfermeria/total-pacientes-enfermeria';
