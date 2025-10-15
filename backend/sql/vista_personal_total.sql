-- ============================================================
-- 📘 Script: vista_personal_total.sql
-- 📅 Fecha: 2025-10-15
-- 👨‍💻 Autor: Styp Canto Rondon
-- 🏥 Descripción:
--   Consulta unificada del personal CENATE y externo,
--   vinculada con IPRESS, roles y estado de usuario.
--   Útil para paneles administrativos o APIs de control.
-- ============================================================





SELECT
    u.id_user,
    u.name_user AS username,
    u.stat_user AS estado_usuario,
    p.id_pers AS id_personal,
    p.num_doc_pers AS numero_documento,
    p.nom_pers AS nombres,
    p.ape_pater_pers AS apellido_paterno,
    p.ape_mater_pers AS apellido_materno,
    CONCAT(p.nom_pers, ' ', p.ape_pater_pers, ' ', p.ape_mater_pers) AS nombre_completo,
    p.gen_pers AS genero,
    p.email_corp_pers AS correo_corporativo,
    p.email_pers AS correo_personal,
    p.movil_pers AS telefono,
    i.desc_ipress AS ipress_asignada,
    'CENATE' AS tipo_personal,
    STRING_AGG(DISTINCT r.desc_rol, ', ') AS roles,
    u.created_at AS fecha_creacion_usuario,
    u.updated_at AS ultima_actualizacion_usuario
FROM dim_usuarios u
LEFT JOIN dim_personal_cnt p ON p.id_usuario = u.id_user
LEFT JOIN dim_ipress i ON i.id_ipress = p.id_ipress
LEFT JOIN rel_user_roles ur ON ur.id_user = u.id_user
LEFT JOIN dim_roles r ON r.id_rol = ur.id_rol
GROUP BY u.id_user, p.id_pers, i.desc_ipress
UNION ALL
SELECT
    u.id_user,
    u.name_user AS username,
    u.stat_user AS estado_usuario,
    e.id_pers_ext AS id_personal,
    e.num_doc_ext AS numero_documento,
    e.nom_ext AS nombres,
    e.ape_pater_ext AS apellido_paterno,
    e.ape_mater_ext AS apellido_materno,
    CONCAT(e.nom_ext, ' ', e.ape_pater_ext, ' ', e.ape_mater_ext) AS nombre_completo,
    e.gen_ext AS genero,
    e.email_corp_ext AS correo_corporativo,
    e.email_pers_ext AS correo_personal,
    e.movil_ext AS telefono,
    i2.desc_ipress AS ipress_asignada,
    'EXTERNO' AS tipo_personal,
    STRING_AGG(DISTINCT r2.desc_rol, ', ') AS roles,
    u.created_at AS fecha_creacion_usuario,
    u.updated_at AS ultima_actualizacion_usuario
FROM dim_usuarios u
LEFT JOIN dim_personal_externo e ON e.id_user = u.id_user
LEFT JOIN dim_ipress i2 ON i2.id_ipress = e.id_ipress
LEFT JOIN rel_user_roles ur2 ON ur2.id_user = u.id_user
LEFT JOIN dim_roles r2 ON r2.id_rol = ur2.id_rol
GROUP BY u.id_user, e.id_pers_ext, i2.desc_ipress
ORDER BY nombre_completo;



styp@MacBook-Pro-de-Styp backend % curl -X POST "http://localhost:8080/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"scantor","password":"admin123"}' | jq .
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100  1446    0  1402  100    44   1470     46 --:--:-- --:--:-- --:--:--  1515
{
  "type": null,
  "token": "eyJhbGciOiJIUzI1NiJ9.eyJyb2xlcyI6WyJTVVBFUkFETUlOIl0sInBlcm1pc29zIjpbIkNSRUFSX1VTVUFSSU8iLCJFRElUQVJfVVNVQVJJTyIsIkVMSU1JTkFSX1VTVUFSSU8iLCJHRVNUSU9OQVJfUk9MRVMiLCJHRVNUSU9OQVJfUEVSTUlTT1MiLCJWRVJfQVVESVRPUklBIiwiREVTQ0FSR0FSX0FVRElUT1JJQSIsIkdFU1RJT05BUl9QRVJTT05BTF9DTlQiLCJWRVJfUEVSU09OQUxfQ05UIiwiR0VTVElPTkFSX0lQUkVTUyIsIlZFUl9JUFJFU1MiLCJHRVNUSU9OQVJfQVJFQVMiLCJHRVNUSU9OQVJfUkVHSU1FTkVTIiwiR0VTVElPTkFSX1BST0ZFU0lPTkVTIiwiQ09ORklHVVJBUl9TSVNURU1BIiwiR0VTVElPTkFSX1BBUkFNRVRST1MiLCJHRVNUSU9OQVJfQ0hBVCIsIkdFU1RJT05BUl9USUNLRVRTIiwiVkVSX1JFUE9SVEVTIiwiRVhQT1JUQVJfUkVQT1JURVMiLCJHRVNUSU9OQVJfU0VHVVJJREFEIiwiR0VTVElPTkFSX0JBQ0tVUFMiLCJHRVNUSU9OQVJfVVNVQVJJT1MiXSwic3ViIjoic2NhbnRvciIsImlhdCI6MTc2MDU0OTY2MSwiZXhwIjoxNzYwNjM2MDYxfQ.vHJGjw6-ogBgHlmxoAWhghpm3A_fj7ron_Y3FAnlMUM",
  "userId": null,
  "username": "scantor",
  "nombreCompleto": "STYP CANTO RONDON",
  "rolPrincipal": "SUPERADMIN",
  "roles": [
    "SUPERADMIN"
  ],
  "permisos": [
    "CREAR_USUARIO",
    "EDITAR_USUARIO",
    "ELIMINAR_USUARIO",
    "GESTIONAR_ROLES",
    "GESTIONAR_PERMISOS",
    "VER_AUDITORIA",
    "DESCARGAR_AUDITORIA",
    "GESTIONAR_PERSONAL_CNT",
    "VER_PERSONAL_CNT",
    "GESTIONAR_IPRESS",
    "VER_IPRESS",
    "GESTIONAR_AREAS",
    "GESTIONAR_REGIMENES",
    "GESTIONAR_PROFESIONES",
    "CONFIGURAR_SISTEMA",
    "GESTIONAR_PARAMETROS",
    "GESTIONAR_CHAT",
    "GESTIONAR_TICKETS",
    "VER_REPORTES",
    "EXPORTAR_REPORTES",
    "GESTIONAR_SEGURIDAD",
    "GESTIONAR_BACKUPS",
    "GESTIONAR_USUARIOS"
  ],
  "message": null
}
styp@MacBook-Pro-de-Styp backend %
styp@MacBook-Pro-de-Styp backend %
styp@MacBook-Pro-de-Styp backend % export JWT_TOKEN="eyJhbGciOiJIUzI1NiJ9.eyJyb2xlcyI6WyJTVVBFUkFETUlOIl0sInBlcm1pc29zIjpbIkNSRUFSX1VTVUFSSU8iLCJFRElUQVJfVVNVQVJJTyIsIkVMSU1JTkFSX1VTVUFSSU8iLCJHRVNUSU9OQVJfUk9MRVMiLCJHRVNUSU9OQVJfUEVSTUlTT1MiLCJWRVJfQVVESVRPUklBIiwiREVTQ0FSR0FSX0FVRElUT1JJQSIsIkdFU1RJT05BUl9QRVJTT05BTF9DTlQiLCJWRVJfUEVSU09OQUxfQ05UIiwiR0VTVElPTkFSX0lQUkVTUyIsIlZFUl9JUFJFU1MiLCJHRVNUSU9OQVJfQVJFQVMiLCJHRVNUSU9OQVJfUkVHSU1FTkVTIiwiR0VTVElPTkFSX1BST0ZFU0lPTkVTIiwiQ09ORklHVVJBUl9TSVNURU1BIiwiR0VTVElPTkFSX1BBUkFNRVRST1MiLCJHRVNUSU9OQVJfQ0hBVCIsIkdFU1RJT05BUl9USUNLRVRTIiwiVkVSX1JFUE9SVEVTIiwiRVhQT1JUQVJfUkVQT1JURVMiLCJHRVNUSU9OQVJfU0VHVVJJREFEIiwiR0VTVElPTkFSX0JBQ0tVUFMiLCJHRVNUSU9OQVJfVVNVQVJJT1MiXSwic3ViIjoic2NhbnRvciIsImlhdCI6MTc2MDU0OTY2MSwiZXhwIjoxNzYwNjM2MDYxfQ.vHJGjw6-ogBgHlmxoAWhghpm3A_fj7ron_Y3FAnlMUM"
styp@MacBook-Pro-de-Styp backend %
styp@MacBook-Pro-de-Styp backend % curl -X GET "http://localhost:8080/api/personal/total" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" | jq .
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100  2992    0  2992    0     0  13641      0 --:--:-- --:--:-- --:--:-- 13600
[
  {
    "id_user": 4,
    "username": "mgonzales_hsj",
    "estado_usuario": "ACTIVO",
    "id_personal": null,
    "numero_documento": null,
    "nombres": null,
    "apellido_paterno": null,
    "apellido_materno": null,
    "nombre_completo": "  ",
    "genero": null,
    "correo_corporativo": null,
    "correo_personal": null,
    "telefono": null,
    "ipress_asignada": null,
    "tipo_personal": "CENATE",
    "roles": "INSTITUCION_EX",
    "fecha_creacion_usuario": "2025-10-10T00:46:22.325-05:00",
    "ultima_actualizacion_usuario": "2025-10-12T14:27:26.363-05:00"
  },
  {
    "id_user": 5,
    "username": "admin_test",
    "estado_usuario": "ACTIVO",
    "id_personal": null,
    "numero_documento": null,
    "nombres": null,
    "apellido_paterno": null,
    "apellido_materno": null,
    "nombre_completo": "  ",
    "genero": null,
    "correo_corporativo": null,
    "correo_personal": null,
    "telefono": null,
    "ipress_asignada": null,
    "tipo_personal": "CENATE",
    "roles": "SUPERADMIN",
    "fecha_creacion_usuario": "2025-10-12T14:23:37.857-05:00",
    "ultima_actualizacion_usuario": "2025-10-12T18:24:26.386-05:00"
  },
  {
    "id_user": 1,
    "username": "scantor",
    "estado_usuario": "ACTIVO",
    "id_personal": null,
    "numero_documento": null,
    "nombres": null,
    "apellido_paterno": null,
    "apellido_materno": null,
    "nombre_completo": "  ",
    "genero": null,
    "correo_corporativo": null,
    "correo_personal": null,
    "telefono": null,
    "ipress_asignada": null,
    "tipo_personal": "EXTERNO",
    "roles": "SUPERADMIN",
    "fecha_creacion_usuario": "2025-10-08T21:06:13.670-05:00",
    "ultima_actualizacion_usuario": "2025-10-15T12:00:27.016-05:00"
  },
  {
    "id_user": 5,
    "username": "admin_test",
    "estado_usuario": "ACTIVO",
    "id_personal": null,
    "numero_documento": null,
    "nombres": null,
    "apellido_paterno": null,
    "apellido_materno": null,
    "nombre_completo": "  ",
    "genero": null,
    "correo_corporativo": null,
    "correo_personal": null,
    "telefono": null,
    "ipress_asignada": null,
    "tipo_personal": "EXTERNO",
    "roles": "SUPERADMIN",
    "fecha_creacion_usuario": "2025-10-12T14:23:37.857-05:00",
    "ultima_actualizacion_usuario": "2025-10-12T18:24:26.386-05:00"
  },
  {
    "id_user": 4,
    "username": "mgonzales_hsj",
    "estado_usuario": "ACTIVO",
    "id_personal": 2,
    "numero_documento": "75894621",
    "nombres": "MARIA ELENA",
    "apellido_paterno": "GONZALES",
    "apellido_materno": "TORRES",
    "nombre_completo": "MARIA ELENA GONZALES TORRES",
    "genero": "F",
    "correo_corporativo": null,
    "correo_personal": "maria.elena.gonzales@hsj.gob.pe",
    "telefono": "999777666",
    "ipress_asignada": "CAP III SAN JUAN DE MIRAFLORES",
    "tipo_personal": "EXTERNO",
    "roles": "INSTITUCION_EX",
    "fecha_creacion_usuario": "2025-10-10T00:46:22.325-05:00",
    "ultima_actualizacion_usuario": "2025-10-12T14:27:26.363-05:00"
  },
  {
    "id_user": 1,
    "username": "scantor",
    "estado_usuario": "ACTIVO",
    "id_personal": 1,
    "numero_documento": "44914706",
    "nombres": "STYP",
    "apellido_paterno": "CANTO",
    "apellido_materno": "RONDON",
    "nombre_completo": "STYP CANTO RONDON",
    "genero": "M",
    "correo_corporativo": "nuevo.correo@essalud.gob.pe",
    "correo_personal": "styp611@outlook.com",
    "telefono": "956194180",
    "ipress_asignada": "CENTRO NACIONAL DE TELEMEDICINA",
    "tipo_personal": "CENATE",
    "roles": "SUPERADMIN",
    "fecha_creacion_usuario": "2025-10-08T21:06:13.670-05:00",
    "ultima_actualizacion_usuario": "2025-10-15T12:00:27.016-05:00"
  }
]
styp@MacBook-Pro-de-Styp backend %