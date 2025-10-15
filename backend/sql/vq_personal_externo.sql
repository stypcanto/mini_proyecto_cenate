SELECT
    jsonb_build_object(
        'id_user', u.id_user,
        'username', u.name_user,
        'estado_usuario', u.stat_user,
        'roles', COALESCE(jsonb_agg(DISTINCT dr.desc_rol) FILTER (WHERE dr.desc_rol IS NOT NULL), '[]'::jsonb),
        'personal', jsonb_build_object(
            'id_personal', e.id_pers_ext,
            'tipo_documento', td.desc_tip_doc,
            'numero_documento', e.num_doc_ext,
            'nombres', e.nom_ext,
            'apellido_paterno', e.ape_pater_ext,
            'apellido_materno', e.ape_mater_ext,
            'nombre_completo', CONCAT(e.nom_ext, ' ', e.ape_pater_ext, ' ', e.ape_mater_ext),
            'genero', e.gen_ext,
            'fecha_nacimiento', e.fech_naci_ext,
            'edad_actual', DATE_PART('year', AGE(CURRENT_DATE, e.fech_naci_ext)),
            'cumpleanos', jsonb_build_object(
                'mes', INITCAP(TO_CHAR(e.fech_naci_ext, 'TMMonth')),
                'dia', EXTRACT(DAY FROM e.fech_naci_ext)
            ),
            'contacto', jsonb_build_object(
                'correo_corporativo', e.email_corp_ext,
                'correo_personal', e.email_pers_ext,
                'telefono', e.movil_ext
            ),
            'direccion', jsonb_build_object(
                'domicilio', e.inst_ext,
                'distrito', d.desc_dist,
                'provincia', pr.desc_prov,
                'departamento', dep.desc_depart
            ),
            'ipress', i.desc_ipress
        ),
        'fechas', jsonb_build_object(
            'fecha_registro', u.created_at,
            'ultima_actualizacion', u.updated_at
        )
    ) AS detalle_personal_externo
FROM dim_personal_externo e
LEFT JOIN dim_tipo_documento td ON td.id_tip_doc = e.id_tip_doc
LEFT JOIN dim_ipress i ON i.id_ipress = e.id_ipress
LEFT JOIN dim_distrito d ON d.id_dist = i.id_dist
LEFT JOIN dim_provincia pr ON pr.id_prov = d.id_prov
LEFT JOIN dim_departamento dep ON dep.id_depart = pr.id_depart
LEFT JOIN dim_usuarios u ON u.id_user = e.id_user
LEFT JOIN rel_user_roles ur ON ur.id_user = u.id_user
LEFT JOIN dim_roles dr ON dr.id_rol = ur.id_rol
GROUP BY
    u.id_user, e.id_pers_ext, td.desc_tip_doc, i.desc_ipress,
    d.desc_dist, pr.desc_prov, dep.desc_depart
ORDER BY e.ape_pater_ext, e.ape_mater_ext;




{
  "id_user": 4,
  "username": "mgonzales_hsj",
  "estado_usuario": "ACTIVO",
  "roles": ["INSTITUCION_EX"],
  "personal": {
    "id_personal": 2,
    "tipo_documento": "DNI",
    "numero_documento": "75894621",
    "nombres": "MARIA ELENA",
    "apellido_paterno": "GONZALES",
    "apellido_materno": "TORRES",
    "nombre_completo": "MARIA ELENA GONZALES TORRES",
    "genero": "F",
    "fecha_nacimiento": "1985-03-15",
    "edad_actual": 40,
    "cumpleanos": {
      "mes": "March",
      "dia": 15
    },
    "contacto": {
      "correo_corporativo": null,
      "correo_personal": "mgonzales@sanjuanmiraflores.gob.pe",
      "telefono": "987654321"
    },
    "direccion": {
      "domicilio": null,
      "distrito": "MIRAFLORES",
      "provincia": "LIMA",
      "departamento": "LIMA"
    },
    "ipress": "CAP III SAN JUAN DE MIRAFLORES"
  },
  "fechas": {
    "fecha_registro": "2025-10-10T05:46:22.325732+00:00",
    "ultima_actualizacion": "2025-10-12T19:27:26.363646+00:00"
  }
}