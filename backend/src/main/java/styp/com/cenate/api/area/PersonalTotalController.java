package styp.com.cenate.api.area;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/personal")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = {
        "http://localhost:3000",
        "http://localhost:5173",
        "http://10.0.89.239:5173"
})
public class PersonalTotalController {

    private final JdbcTemplate jdbcTemplate;

    // ===============================================================
    // 🧭 NIVEL 1 - LISTA BÁSICA UNIFICADA (CENATE + EXTERNO)
    // ===============================================================
    @GetMapping("/total")
    @PreAuthorize("hasAnyAuthority('VER_PERSONAL_CNT','SUPERADMIN')")
    public ResponseEntity<List<Map<String, Object>>> getPersonalTotal() {
        log.info("📋 Consultando lista total de personal (CNT + EXTERNO)");

        String sql = """
            SELECT
                u.id_user,
                u.name_user AS username,
                u.stat_user AS estado_usuario,
                COALESCE(p.id_pers, e.id_pers_ext) AS id_personal,
                COALESCE(p.num_doc_pers, e.num_doc_ext) AS numero_documento,
                COALESCE(p.nom_pers, e.nom_ext) AS nombres,
                COALESCE(p.ape_pater_pers, e.ape_pater_ext) AS apellido_paterno,
                COALESCE(p.ape_mater_pers, e.ape_mater_ext) AS apellido_materno,
                CONCAT(
                    COALESCE(p.nom_pers, e.nom_ext), ' ',
                    COALESCE(p.ape_pater_pers, e.ape_pater_ext), ' ',
                    COALESCE(p.ape_mater_pers, e.ape_mater_ext)
                ) AS nombre_completo,
                COALESCE(i.desc_ipress, i2.desc_ipress, 'CENTRO NACIONAL DE TELEMEDICINA') AS ipress_asignada,
                CASE WHEN p.id_pers IS NOT NULL THEN 'CENATE' ELSE 'EXTERNO' END AS tipo_personal,
                STRING_AGG(DISTINCT r.desc_rol, ', ') AS roles,
                u.created_at AS fecha_creacion_usuario,
                u.updated_at AS ultima_actualizacion_usuario
            FROM dim_usuarios u
            LEFT JOIN dim_personal_cnt p ON p.id_usuario = u.id_user
            LEFT JOIN dim_personal_externo e ON e.id_user = u.id_user
            LEFT JOIN dim_ipress i ON i.id_ipress = p.id_ipress
            LEFT JOIN dim_ipress i2 ON i2.id_ipress = e.id_ipress
            LEFT JOIN rel_user_roles ur ON ur.id_user = u.id_user
            LEFT JOIN dim_roles r ON r.id_rol = ur.id_rol
            GROUP BY u.id_user, p.id_pers, e.id_pers_ext, i.desc_ipress, i2.desc_ipress
            ORDER BY nombre_completo
        """;

        List<Map<String, Object>> resultado = jdbcTemplate.queryForList(sql);
        return ResponseEntity.ok(resultado);
    }

    // ===============================================================
    // 🧩 NIVEL 2 - DETALLE COMPLETO (CENATE o EXTERNO)
    // ===============================================================
    @GetMapping("/detalle/{id}")
    @PreAuthorize("hasAnyAuthority('VER_PERSONAL_CNT','SUPERADMIN')")
    public ResponseEntity<?> getDetallePersonal(@PathVariable Long id) {
        log.info("📊 Consultando detalle completo del personal con ID {}", id);

        try {
            // 1️⃣ Intentar obtener detalle de personal CNT
            String sqlCnt = """
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
                ) AS detalle
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
                WHERE u.id_user = ?
                GROUP BY u.id_user, p.id_pers, td.desc_tip_doc, a.desc_area, rl.desc_reg_lab,
                         i.desc_ipress, prof.desc_prof, d.desc_dist, pr.desc_prov, dep.desc_depart
            """;

            Map<String, Object> result = jdbcTemplate.queryForMap(sqlCnt, id);

            // Si el usuario no tiene personal CNT, probar con EXTERNO
            if (result == null || result.isEmpty()) {
                String sqlExt = """
                    SELECT jsonb_build_object(
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
                    ) AS detalle
                    FROM dim_personal_externo e
                    LEFT JOIN dim_tipo_documento td ON td.id_tip_doc = e.id_tip_doc
                    LEFT JOIN dim_ipress i ON i.id_ipress = e.id_ipress
                    LEFT JOIN dim_distrito d ON d.id_dist = i.id_dist
                    LEFT JOIN dim_provincia pr ON pr.id_prov = d.id_prov
                    LEFT JOIN dim_departamento dep ON dep.id_depart = pr.id_depart
                    LEFT JOIN dim_usuarios u ON u.id_user = e.id_user
                    LEFT JOIN rel_user_roles ur ON ur.id_user = u.id_user
                    LEFT JOIN dim_roles dr ON dr.id_rol = ur.id_rol
                    WHERE u.id_user = ?
                    GROUP BY u.id_user, e.id_pers_ext, td.desc_tip_doc, i.desc_ipress,
                             d.desc_dist, pr.desc_prov, dep.desc_depart
                """;
                result = jdbcTemplate.queryForMap(sqlExt, id);
            }

            return ResponseEntity.ok(result);

        } catch (Exception e) {
            log.error("❌ Error al obtener detalle: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }
}



====
CURL
====

scurl -X GET "http://localhost:8080/api/personal/total" \
        -H "Authorization: Bearer $JWT_TOKEN" \
        -H "Content-Type: application/json" | jq .



  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
Dload  Upload   Total   Spent    Left  Speed
100  1313    0  1313    0     0   2537      0 --:--:-- --:--:-- --:--:--  2534
        [
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
        "ipress_asignada": "CENTRO NACIONAL DE TELEMEDICINA",
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
        "ipress_asignada": "CENTRO NACIONAL DE TELEMEDICINA",
        "tipo_personal": "CENATE",
        "roles": "SUPERADMIN",
        "fecha_creacion_usuario": "2025-10-08T21:06:13.670-05:00",
        "ultima_actualizacion_usuario": "2025-10-15T12:00:27.016-05:00"
        }


curl -X GET "http://localhost:8080/api/personal/detalle/1" \
        -H "Authorization: Bearer $JWT_TOKEN" \
        -H "Content-Type: application/json" | jq .


        {
        "id_user": 1,
        "username": "scantor",
        "estado_usuario": "ACTIVO",
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
        "contacto": {
        "correo_corporativo": "nuevo.correo@essalud.gob.pe",
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
        "profesion": "MEDICO",
        "especialidades": ["CARDIOLOGIA"],
        "rne_especialista": "14257",
        "numero_colegiatura": "13178",
        "codigo_planilla": "s/n"
        },
        "foto": "personal_1_45a81d70-e20a-42cf-a8de-f13b4c65816d.png"
        },
        "fechas": {
        "fecha_registro": "2025-10-08T21:06:13.670604-05:00",
        "ultima_actualizacion": "2025-10-15T12:00:27.01667-05:00"
        }
        }


