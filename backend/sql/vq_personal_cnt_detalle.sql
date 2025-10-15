SELECT jsonb_build_object(
    'id_user', u.id_user,
    'username', u.name_user,
    'estado_usuario', u.stat_user,
    'roles', COALESCE(jsonb_agg(DISTINCT dr.desc_rol) FILTER (WHERE dr.desc_rol IS NOT NULL), '[]'::jsonb),
    'personal', jsonb_build_object(
        'id_personal', p.id_pers,
        'tipo_documento', td.desc_tip_doc,
        'numero_documento', p.num_doc_pers,
        'nombres', p.nom_pers,
        'apellido_paterno', p.ape_pater_pers,
        'apellido_materno', p.ape_mater_pers,
        'nombre_completo', CONCAT(p.nom_pers, ' ', p.ape_pater_pers, ' ', p.ape_mater_pers),
        'genero', p.gen_pers,
        'fecha_nacimiento', p.fech_naci_pers,
        'edad_actual', DATE_PART('year', AGE(CURRENT_DATE, p.fech_naci_pers)),
        'cumpleanos', jsonb_build_object(
            'mes', INITCAP(TO_CHAR(p.fech_naci_pers, 'TMMonth')),
            'dia', EXTRACT(DAY FROM p.fech_naci_pers)
        ),
        'contacto', jsonb_build_object(
            'correo_corporativo', p.email_corp_pers,
            'correo_personal', p.email_pers,
            'telefono', p.movil_pers
        ),
        'direccion', jsonb_build_object(
            'domicilio', p.direc_pers,
            'distrito', d.desc_dist,
            'provincia', pr.desc_prov,
            'departamento', dep.desc_depart
        ),
        'ipress', COALESCE(i.desc_ipress, 'CENTRO NACIONAL DE TELEMEDICINA'),
        'laboral', jsonb_build_object(
            'area', a.desc_area,
            'regimen_laboral', rl.desc_reg_lab,
            'profesion', prof.desc_prof,
            'especialidades',
                CASE
                    WHEN prof.desc_prof ILIKE '%MEDICO%'
                    THEN COALESCE(jsonb_agg(DISTINCT e.desc_esp) FILTER (WHERE e.desc_esp IS NOT NULL), '[]'::jsonb)
                    ELSE '[]'::jsonb
                END,
            'rne_especialista',
                CASE
                    WHEN prof.desc_prof ILIKE '%MEDICO%' THEN MAX(pp.rne_especialista)
                    ELSE NULL
                END,
            'numero_colegiatura', p.coleg_pers,
            'codigo_planilla', p.cod_plan_rem
        ),
        'foto', p.foto_pers
    ),
    'fechas', jsonb_build_object(
        'fecha_registro', u.created_at,
        'ultima_actualizacion', u.updated_at
    )
) AS detalle_personal
FROM dim_usuarios u
LEFT JOIN dim_personal_cnt p ON p.id_usuario = u.id_user
LEFT JOIN dim_tipo_documento td ON td.id_tip_doc = p.id_tip_doc
LEFT JOIN dim_area a ON a.id_area = p.id_area
LEFT JOIN dim_regimen_laboral rl ON rl.id_reg_lab = p.id_reg_lab
LEFT JOIN dim_ipress i ON i.id_ipress = p.id_ipress
LEFT JOIN dim_personal_prof pp ON pp.id_pers = p.id_pers
LEFT JOIN dim_profesiones prof ON prof.id_prof = pp.id_prof
LEFT JOIN dim_especialidad e ON e.id_pers = p.id_pers
LEFT JOIN dim_distrito d ON d.id_dist = p.id_dist
LEFT JOIN dim_provincia pr ON pr.id_prov = d.id_prov
LEFT JOIN dim_departamento dep ON dep.id_depart = pr.id_depart
LEFT JOIN rel_user_roles ur ON ur.id_user = u.id_user
LEFT JOIN dim_roles dr ON dr.id_rol = ur.id_rol
WHERE u.id_user = 1
GROUP BY
    u.id_user, p.id_pers, td.desc_tip_doc, a.desc_area, rl.desc_reg_lab,
    i.desc_ipress, prof.desc_prof, d.desc_dist, pr.desc_prov, dep.desc_depart
ORDER BY p.ape_pater_pers, p.ape_mater_pers;






{
  "id_user": 1,
  "username": "scantor",
  "estado_usuario": "A",
  "roles": ["SUPERADMIN"],
  "personal": {
    "id_personal": 1,
    "tipo_documento": "DNI",
    "numero_documento": "44914706",
    "nombres": "STYP",
    "apellido_paterno": "CANTO",
    "apellido_materno": "RONDON",
    "nombre_completo": "STYP CANTO RONDON",
    "genero": "M",
    "fecha_nacimiento": "1988-02-25",
    "edad_actual": 37,
    "cumpleanos": {
      "mes": "Febrero",
      "dia": 25
    },
    "contacto": {
      "correo_corporativo": "cenate.analista@essalud.gob.pe",
      "correo_personal": "styp611@outlook.com",
      "telefono": "956194180"
    },
    "direccion": {
      "domicilio": "Calle Simon Condori 286 Pueblo Libre",
      "distrito": "MIRAFLORES",
      "provincia": "LIMA",
      "departamento": "LIMA"
    },
    "ipress": "CENTRO NACIONAL DE TELEMEDICINA",
    "laboral": {
      "area": "GESTIÓN TI",
      "regimen_laboral": "LOCADOR",
      "profesion": "MÉDICO",
      "especialidades": ["CARDIOLOGÍA"],
      "rne_especialista": "14257",
      "numero_colegiatura": "13178",
      "codigo_planilla": "s/n"
    },
    "foto": "personal_1_45a81d70-e20a-42cf-a8de-f13b4c65816d.png"
  },
  "fechas": {
    "fecha_registro": "2025-10-09T02:06:13.670604Z",
    "ultima_actualizacion": "2025-10-13T10:05:38.910667Z"
  }
}