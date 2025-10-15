UFramework de Autorización Modular Contextual

🧭 En resumen técnico:

Tu objetivo es permitir que cada módulo y cada página del sistema:
	1.	Sea visible o no visible según el usuario o su perfil.
	2.	Tenga acciones CRUD (crear, ver, editar, eliminar) controladas individualmente.
	3.	Se administre dinámicamente desde base de datos (no hardcodeado en React).
	4.	Sea gobernado por un superadmin mediante una consola central de gestión.

🎯 Objetivo de extensión

Queremos pasar de un RBAC clásico (rol → permiso)
a un modelo MBAC (Modular-Based Access Control)
donde cada módulo, página y acción tenga permisos específicos configurables desde la BD.


Lo que estás construyendo es una arquitectura modular con gobernanza de datos, donde los módulos del sistema (citas, coordinador, externo, lineamientos, médico, etc.) están íntimamente relacionados con entidades centrales del dominio clínico — en tu caso:
	•	asegurados → eje paciente
	•	frm_transf_img → eje lineamiento clínico / flujo operativo


🧠 En términos técnicos, lo que estás planteando es:

Un modelo de permisos contextual, donde cada acción CRUD (crear, ver, actualizar, eliminar) se evalúa según:
	•	el rol del usuario,
	•	la página o submódulo donde opera,
	•	y el tipo de entidad clínica sobre la cual actúa (por ejemplo, un registro de asegurados o un formulario en frm_transf_img).


curl -X GET http://localhost:8080/api/auditoria/modulos \
  -H "Accept: application/json" \
  -H "Authorization: Bearer <TU_TOKEN_JWT>"


curl -G http://localhost:8080/api/auditoria/modulos \
  -H "Accept: application/json" \
  --data-urlencode "usuario=scantor" \
  --data-urlencode "modulo=dim_permisos_pagina_rol"




  -- ===========================================================
  -- 🔹 1. TABLA: Permisos por página y rol (vincula roles ↔ páginas)
  -- ===========================================================

  DROP TABLE IF EXISTS dim_permisos_pagina_rol CASCADE;
  CREATE TABLE dim_permisos_pagina_rol (
    id_permiso_pagina SERIAL PRIMARY KEY,
    id_rol INT NOT NULL REFERENCES dim_roles(id_rol) ON DELETE CASCADE,
    id_pagina INT NOT NULL REFERENCES dim_paginas_modulo(id_pagina) ON DELETE CASCADE,
    puede_ver BOOLEAN DEFAULT FALSE,
    puede_crear BOOLEAN DEFAULT FALSE,
    puede_editar BOOLEAN DEFAULT FALSE,
    puede_eliminar BOOLEAN DEFAULT FALSE,
    puede_exportar BOOLEAN DEFAULT FALSE,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE (id_rol, id_pagina)
  );

  COMMENT ON TABLE dim_permisos_pagina_rol IS 'Permisos modulares por rol y página específica.';
  COMMENT ON COLUMN dim_permisos_pagina_rol.puede_ver IS 'Indica si el rol puede visualizar la página.';
  COMMENT ON COLUMN dim_permisos_pagina_rol.puede_crear IS 'Indica si el rol puede crear registros.';
  COMMENT ON COLUMN dim_permisos_pagina_rol.puede_editar IS 'Indica si el rol puede editar registros.';
  COMMENT ON COLUMN dim_permisos_pagina_rol.puede_eliminar IS 'Indica si el rol puede eliminar registros.';
  COMMENT ON COLUMN dim_permisos_pagina_rol.puede_exportar IS 'Indica si el rol puede exportar datos.';

  -- ===========================================================
  -- 🔹 2. TRIGGER DE AUDITORÍA MODULAR
  -- ===========================================================

  DROP FUNCTION IF EXISTS log_permisos_modulares() CASCADE;
  CREATE OR REPLACE FUNCTION log_permisos_modulares()
  RETURNS trigger AS $$
  DECLARE
    v_usuario TEXT := current_setting('app.current_username', true);
    v_ip TEXT := current_setting('app.current_ip', true);
    v_agent TEXT := current_setting('app.current_agent', true);
    v_detalle TEXT := '';
    v_id_rol INT;
    v_id_pagina INT;
  BEGIN
    -- Detectar operación (INSERT, UPDATE, DELETE)
    IF TG_OP = 'INSERT' THEN
      v_detalle := (
        SELECT string_agg(
          format('Nuevo valor → %s = "%s"; ', c.column_name, COALESCE(to_jsonb(NEW)->>c.column_name, 'NULL')),
          ''
        )
        FROM information_schema.columns c
        WHERE c.table_name = TG_TABLE_NAME
      );
      v_id_rol := NEW.id_rol;
      v_id_pagina := NEW.id_pagina;

    ELSIF TG_OP = 'UPDATE' THEN
      v_detalle := (
        SELECT string_agg(
          format('Columna "%s": "%s" → "%s"; ',
            c.column_name,
            COALESCE(to_jsonb(OLD)->>c.column_name, 'NULL'),
            COALESCE(to_jsonb(NEW)->>c.column_name, 'NULL')
          ),
          ''
        )
        FROM information_schema.columns c
        WHERE c.table_name = TG_TABLE_NAME
        AND to_jsonb(OLD)->>c.column_name IS DISTINCT FROM to_jsonb(NEW)->>c.column_name
      );
      v_id_rol := NEW.id_rol;
      v_id_pagina := NEW.id_pagina;

    ELSIF TG_OP = 'DELETE' THEN
      v_detalle := (
        SELECT string_agg(
          format('Eliminado valor → %s = "%s"; ', c.column_name, COALESCE(to_jsonb(OLD)->>c.column_name, 'NULL')),
          ''
        )
        FROM information_schema.columns c
        WHERE c.table_name = TG_TABLE_NAME
      );
      v_id_rol := OLD.id_rol;
      v_id_pagina := OLD.id_pagina;
    END IF;

    -- Insertar registro de auditoría
    INSERT INTO audit_logs(usuario, modulo, action, estado, detalle, fecha_hora, user_id, ip_address, user_agent, nivel, id_afectado, id_modulo, id_pagina)
    VALUES (
      COALESCE(v_usuario, current_user),
      TG_TABLE_NAME,
      TG_OP,
      'SUCCESS',
      COALESCE(v_detalle, 'Sin cambios detectados'),
      NOW(),
      (SELECT id_user FROM dim_usuarios WHERE name_user = v_usuario),
      v_ip,
      v_agent,
      'INFO',
      COALESCE(v_id_rol, v_id_pagina),
      NULL,
      v_id_pagina
    );

    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;

  -- ===========================================================
  -- 🔹 3. ASIGNAR TRIGGER A LAS TABLAS MODULARES
  -- ===========================================================

  DROP TRIGGER IF EXISTS trg_audit_permisos_modulares ON dim_permisos_modulares;
  CREATE TRIGGER trg_audit_permisos_modulares
  AFTER INSERT OR UPDATE OR DELETE ON dim_permisos_modulares
  FOR EACH ROW
  EXECUTE FUNCTION log_permisos_modulares();

  DROP TRIGGER IF EXISTS trg_audit_permisos_pagina_rol ON dim_permisos_pagina_rol;
  CREATE TRIGGER trg_audit_permisos_pagina_rol
  AFTER INSERT OR UPDATE OR DELETE ON dim_permisos_pagina_rol
  FOR EACH ROW
  EXECUTE FUNCTION log_permisos_modulares();

  -- ===========================================================
  -- 🔹 4. VISTA DE AUDITORÍA MODULAR DETALLADA
  -- ===========================================================

  CREATE OR REPLACE VIEW vw_auditoria_modular_detallada AS
  SELECT
    a.id,
    a.fecha_hora,
    to_char(a.fecha_hora, 'YYYY-MM-DD HH24:MI:SS') AS fecha_formateada,
    a.usuario AS usuario_sesion,
    u.id_user,
    u.name_user AS username,
    COALESCE(p.num_doc_pers, pe.num_doc_ext) AS dni,
    COALESCE(
      CONCAT(p.nom_pers, ' ', p.ape_pater_pers, ' ', p.ape_mater_pers),
      CONCAT(pe.nom_ext, ' ', pe.ape_pater_ext, ' ', pe.ape_mater_ext)
    ) AS nombre_completo,
    STRING_AGG(DISTINCT r.desc_rol, ', ') AS roles,
    COALESCE(p.email_corp_pers, pe.email_corp_ext) AS correo_corporativo,
    COALESCE(p.email_pers, pe.email_pers_ext) AS correo_personal,
    a.modulo,
    a.action AS accion,
    a.estado,
    a.detalle,
    a.ip_address AS ip,
    a.user_agent AS dispositivo,
    a.id_afectado,
    CASE
      WHEN a.action = 'INSERT' THEN '🟢 Creación de registro'
      WHEN a.action = 'UPDATE' THEN '🟡 Modificación de registro'
      WHEN a.action = 'DELETE' THEN '🔴 Eliminación de registro'
      ELSE '⚪ Otro evento'
    END AS tipo_evento
  FROM audit_logs a
  LEFT JOIN dim_usuarios u ON u.id_user = a.user_id
  LEFT JOIN rel_user_roles ur ON ur.id_user = u.id_user
  LEFT JOIN dim_roles r ON r.id_rol = ur.id_rol
  LEFT JOIN dim_personal_cnt p ON p.id_usuario = u.id_user
  LEFT JOIN dim_personal_externo pe ON pe.id_user = u.id_user
  WHERE a.modulo IN ('dim_permisos_modulares', 'dim_permisos_pagina_rol')
  GROUP BY a.id, a.fecha_hora, u.id_user, u.name_user, p.num_doc_pers, pe.num_doc_ext,
           p.nom_pers, p.ape_pater_pers, p.ape_mater_pers, pe.nom_ext, pe.ape_pater_ext, pe.ape_mater_ext,
           p.email_corp_pers, pe.email_corp_ext, p.email_pers, pe.email_pers_ext, a.modulo, a.action, a.estado,
           a.detalle, a.ip_address, a.user_agent, a.id_afectado;

  COMMENT ON VIEW vw_auditoria_modular_detallada IS 'Auditoría detallada de permisos modulares, roles y páginas.';


ALTER TABLE dim_contexto_modulo
ADD CONSTRAINT ux_contexto_modulo UNIQUE (id_modulo);


INSERT INTO dim_contexto_modulo (entidad_principal, descripcion, id_modulo)
SELECT
  'Contexto - ' || m.nombre_modulo,
  'Contexto de auditoría y control para ' || m.nombre_modulo,
  m.id_modulo
FROM dim_modulos_sistema m
ON CONFLICT (id_modulo) DO NOTHING;





SELECT * FROM dim_contexto_modulo ORDER BY id_contexto;



SELECT
  r.desc_rol AS rol,
  m.nombre_modulo AS modulo,
  p.nombre_pagina AS pagina,
  pm.puede_ver,
  pm.puede_crear,
  pm.puede_editar,
  pm.puede_eliminar,
  pm.puede_exportar,
  pm.puede_aprobar,
  u.name_user AS autorizado_por
FROM dim_permisos_modulares pm
JOIN dim_roles r ON pm.id_rol = r.id_rol
JOIN dim_paginas_modulo p ON pm.id_pagina = p.id_pagina
JOIN dim_modulos_sistema m ON p.id_modulo = m.id_modulo
LEFT JOIN dim_usuarios u ON pm.autorizado_por = u.id_user
ORDER BY r.desc_rol, m.nombre_modulo, p.nombre_pagina;


GET /api/permisos/usuario/{id}

[
  {
    "rol": "SUPERADMIN",
    "modulo": "Gestión de Citas",
    "pagina": "Dashboard de Citas",
    "permisos": {
      "ver": true,
      "crear": true,
      "editar": true,
      "eliminar": true,
      "exportar": false,
      "aprobar": false
    }
  }
]


maestro_cenate=# SELECT
  m.id_modulo,
  m.nombre_modulo,
  p.id_pagina,
  p.nombre_pagina,
  p.ruta_pagina,
  p.activo
FROM dim_modulos_sistema m
LEFT JOIN dim_paginas_modulo p ON p.id_modulo = m.id_modulo
ORDER BY m.id_modulo, p.id_pagina;
 id_modulo |        nombre_modulo        | id_pagina |      nombre_pagina       |          ruta_pagina          | activo
-----------+-----------------------------+-----------+--------------------------+-------------------------------+--------
         1 | Gestión de Citas            |         1 | Dashboard de Citas       | /roles/citas/dashboard        | t
         1 | Gestión de Citas            |         2 | Agenda Médica            | /roles/citas/agenda           | t
         2 | Gestión de Coordinadores    |         3 | Dashboard Coordinador    | /roles/coordinador/dashboard  | t
         2 | Gestión de Coordinadores    |         4 | Módulo de Agenda         | /roles/coordinador/agenda     | t
         3 | Gestión de Personal Externo |         5 | Dashboard Externo        | /roles/externo/dashboard      | t
         3 | Gestión de Personal Externo |         6 | Reportes                 | /roles/externo/reportes       | t
         4 | Lineamientos IPRESS         |         7 | Dashboard Lineamientos   | /roles/lineamientos/dashboard | t
         4 | Lineamientos IPRESS         |         8 | Registro de Lineamientos | /roles/lineamientos/registro  | t
         5 | Panel Médico                |         9 | Dashboard Médico         | /roles/medico/dashboard       | t
         5 | Panel Médico                |        10 | Citas del Médico         | /roles/medico/citas           | t
         5 | Panel Médico                |        11 | Indicadores              | /roles/medico/indicadores     | t
         5 | Panel Médico                |        12 | Pacientes                | /roles/medico/pacientes       | t
(12 rows)

maestro_cenate=# SELECT
  r.desc_rol AS rol,
  m.nombre_modulo AS modulo,
  p.nombre_pagina AS pagina,
  pm.puede_ver, pm.puede_crear, pm.puede_editar, pm.puede_eliminar, pm.puede_exportar, pm.puede_aprobar
FROM dim_permisos_modulares pm
JOIN dim_roles r ON r.id_rol = pm.id_rol
JOIN dim_paginas_modulo p ON p.id_pagina = pm.id_pagina
JOIN dim_modulos_sistema m ON m.id_modulo = p.id_modulo
ORDER BY r.desc_rol, m.nombre_modulo, p.nombre_pagina;
    rol     |           modulo            |          pagina          | puede_ver | puede_crear | puede_editar | puede_eliminar | puede_exportar | puede_aprobar
------------+-----------------------------+--------------------------+-----------+-------------+--------------+----------------+----------------+---------------
 SUPERADMIN | Gestión de Citas            | Agenda Médica            | t         | t           | t            | t              | f              | f
 SUPERADMIN | Gestión de Citas            | Dashboard de Citas       | t         | t           | t            | t              | f              | f
 SUPERADMIN | Gestión de Coordinadores    | Dashboard Coordinador    | t         | t           | t            | t              | f              | f
 SUPERADMIN | Gestión de Coordinadores    | Módulo de Agenda         | t         | t           | t            | t              | f              | f
 SUPERADMIN | Gestión de Personal Externo | Dashboard Externo        | t         | t           | t            | t              | f              | f
 SUPERADMIN | Gestión de Personal Externo | Reportes                 | t         | t           | t            | t              | f              | f
 SUPERADMIN | Lineamientos IPRESS         | Dashboard Lineamientos   | t         | t           | t            | t              | f              | f
 SUPERADMIN | Lineamientos IPRESS         | Registro de Lineamientos | t         | t           | t            | t              | f              | f
 SUPERADMIN | Panel Médico                | Citas del Médico         | t         | t           | t            | t              | f              | f
 SUPERADMIN | Panel Médico                | Dashboard Médico         | t         | t           | t            | t              | f              | f
 SUPERADMIN | Panel Médico                | Indicadores              | t         | t           | t            | t              | f              | f
 SUPERADMIN | Panel Médico                | Pacientes                | t         | t           | t            | t              | f              | f
(12 rows)

maestro_cenate=# SELECT
  u.name_user AS usuario,
  r.desc_rol AS rol,
  p.nombre_pagina AS pagina,
  pm.puede_ver, pm.puede_crear, pm.puede_editar, pm.puede_eliminar
FROM dim_usuarios u
JOIN rel_user_roles ur ON ur.id_user = u.id_user
JOIN dim_roles r ON ur.id_rol = r.id_rol
JOIN dim_permisos_modulares pm ON pm.id_rol = r.id_rol
JOIN dim_paginas_modulo p ON p.id_pagina = pm.id_pagina
ORDER BY u.name_user, r.desc_rol, p.nombre_pagina;
  usuario   |    rol     |          pagina          | puede_ver | puede_crear | puede_editar | puede_eliminar
------------+------------+--------------------------+-----------+-------------+--------------+----------------
 admin_test | SUPERADMIN | Agenda Médica            | t         | t           | t            | t
 admin_test | SUPERADMIN | Citas del Médico         | t         | t           | t            | t
 admin_test | SUPERADMIN | Dashboard Coordinador    | t         | t           | t            | t
 admin_test | SUPERADMIN | Dashboard de Citas       | t         | t           | t            | t
 admin_test | SUPERADMIN | Dashboard Externo        | t         | t           | t            | t
 admin_test | SUPERADMIN | Dashboard Lineamientos   | t         | t           | t            | t
 admin_test | SUPERADMIN | Dashboard Médico         | t         | t           | t            | t
 admin_test | SUPERADMIN | Indicadores              | t         | t           | t            | t
 admin_test | SUPERADMIN | Módulo de Agenda         | t         | t           | t            | t
 admin_test | SUPERADMIN | Pacientes                | t         | t           | t            | t
 admin_test | SUPERADMIN | Registro de Lineamientos | t         | t           | t            | t
 admin_test | SUPERADMIN | Reportes                 | t         | t           | t            | t
 scantor    | SUPERADMIN | Agenda Médica            | t         | t           | t            | t
 scantor    | SUPERADMIN | Citas del Médico         | t         | t           | t            | t
 scantor    | SUPERADMIN | Dashboard Coordinador    | t         | t           | t            | t
 scantor    | SUPERADMIN | Dashboard de Citas       | t         | t           | t            | t
 scantor    | SUPERADMIN | Dashboard Externo        | t         | t           | t            | t
 scantor    | SUPERADMIN | Dashboard Lineamientos   | t         | t           | t            | t
 scantor    | SUPERADMIN | Dashboard Médico         | t         | t           | t            | t
 scantor    | SUPERADMIN | Indicadores              | t         | t           | t            | t
 scantor    | SUPERADMIN | Módulo de Agenda         | t         | t           | t            | t
 scantor    | SUPERADMIN | Pacientes                | t         | t           | t            | t
 scantor    | SUPERADMIN | Registro de Lineamientos | t         | t           | t            | t
 scantor    | SUPERADMIN | Reportes                 | t         | t           | t            | t
(24 rows)

maestro_cenate=#


CREATE OR REPLACE VIEW vw_permisos_activos AS
SELECT
  u.id_user,
  u.name_user AS usuario,
  r.id_rol,
  r.desc_rol AS rol,
  m.id_modulo,
  m.nombre_modulo AS modulo,
  p.id_pagina,
  p.nombre_pagina AS pagina,
  p.ruta_pagina,
  pm.puede_ver, pm.puede_crear, pm.puede_editar, pm.puede_eliminar, pm.puede_exportar, pm.puede_aprobar,
  pm.autorizado_por,
  pm.created_at,
  pm.updated_at
FROM dim_usuarios u
JOIN rel_user_roles ur ON ur.id_user = u.id_user
JOIN dim_roles r ON ur.id_rol = r.id_rol
JOIN dim_permisos_modulares pm ON pm.id_rol = r.id_rol
JOIN dim_paginas_modulo p ON p.id_pagina = pm.id_pagina
JOIN dim_modulos_sistema m ON m.id_modulo = p.id_modulo
WHERE pm.activo = TRUE;


SELECT * FROM vw_permisos_activos WHERE usuario = 'scantor';

maestro_cenate=# SELECT * FROM vw_permisos_activos WHERE usuario = 'scantor';
 id_user | usuario | id_rol |    rol     | id_modulo |           modulo            | id_pagina |          pagina          |          ruta_pagina          | puede_ver | puede_crear | puede_editar | puede_eliminar | puede_exportar | puede_aprobar | autorizado_por |         created_at         |         updated_at
---------+---------+--------+------------+-----------+-----------------------------+-----------+--------------------------+-------------------------------+-----------+-------------+--------------+----------------+----------------+---------------+----------------+----------------------------+----------------------------
       1 | scantor |      1 | SUPERADMIN |         1 | Gestión de Citas            |         1 | Dashboard de Citas       | /roles/citas/dashboard        | t         | t           | t            | t              | f              | f             |                | 2025-10-15 03:12:17.690182 | 2025-10-15 03:12:17.690182
       1 | scantor |      1 | SUPERADMIN |         1 | Gestión de Citas            |         2 | Agenda Médica            | /roles/citas/agenda           | t         | t           | t            | t              | f              | f             |                | 2025-10-15 03:12:17.690182 | 2025-10-15 03:12:17.690182
       1 | scantor |      1 | SUPERADMIN |         2 | Gestión de Coordinadores    |         3 | Dashboard Coordinador    | /roles/coordinador/dashboard  | t         | t           | t            | t              | f              | f             |                | 2025-10-15 03:12:17.690182 | 2025-10-15 03:12:17.690182
       1 | scantor |      1 | SUPERADMIN |         2 | Gestión de Coordinadores    |         4 | Módulo de Agenda         | /roles/coordinador/agenda     | t         | t           | t            | t              | f              | f             |                | 2025-10-15 03:12:17.690182 | 2025-10-15 03:12:17.690182
       1 | scantor |      1 | SUPERADMIN |         3 | Gestión de Personal Externo |         5 | Dashboard Externo        | /roles/externo/dashboard      | t         | t           | t            | t              | f              | f             |                | 2025-10-15 03:12:17.690182 | 2025-10-15 03:12:17.690182
       1 | scantor |      1 | SUPERADMIN |         3 | Gestión de Personal Externo |         6 | Reportes                 | /roles/externo/reportes       | t         | t           | t            | t              | f              | f             |                | 2025-10-15 03:12:17.690182 | 2025-10-15 03:12:17.690182
       1 | scantor |      1 | SUPERADMIN |         4 | Lineamientos IPRESS         |         7 | Dashboard Lineamientos   | /roles/lineamientos/dashboard | t         | t           | t            | t              | f              | f             |                | 2025-10-15 03:12:17.690182 | 2025-10-15 03:12:17.690182
       1 | scantor |      1 | SUPERADMIN |         4 | Lineamientos IPRESS         |         8 | Registro de Lineamientos | /roles/lineamientos/registro  | t         | t           | t            | t              | f              | f             |                | 2025-10-15 03:12:17.690182 | 2025-10-15 03:12:17.690182
       1 | scantor |      1 | SUPERADMIN |         5 | Panel Médico                |         9 | Dashboard Médico         | /roles/medico/dashboard       | t         | t           | t            | t              | f              | f             |                | 2025-10-15 03:12:17.690182 | 2025-10-15 03:12:17.690182
       1 | scantor |      1 | SUPERADMIN |         5 | Panel Médico                |        10 | Citas del Médico         | /roles/medico/citas           | t         | t           | t            | t              | f              | f             |                | 2025-10-15 03:12:17.690182 | 2025-10-15 03:12:17.690182
       1 | scantor |      1 | SUPERADMIN |         5 | Panel Médico                |        11 | Indicadores              | /roles/medico/indicadores     | t         | t           | t            | t              | f              | f             |                | 2025-10-15 03:12:17.690182 | 2025-10-15 03:12:17.690182
       1 | scantor |      1 | SUPERADMIN |         5 | Panel Médico                |        12 | Pacientes                | /roles/medico/pacientes       | t         | t           | t            | t              | f              | f             |                | 2025-10-15 03:12:17.690182 | 2025-10-15 03:12:17.690182
(12 rows)


