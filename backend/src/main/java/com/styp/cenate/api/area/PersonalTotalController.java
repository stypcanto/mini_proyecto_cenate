package com.styp.cenate.api.area;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.nio.file.*;
import java.util.*;
import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("/api/personal")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = {
        "http://localhost:3000",
        "http://localhost:5173",
        "http://10.0.89.239:5173"
})
@Data
public class PersonalTotalController {

    private final JdbcTemplate jdbcTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${app.upload.dir:${user.home}/cenate-uploads/personal}")
    private String uploadDir;

    @PostConstruct
    private void initUploadDir() throws IOException {
        Path path = Paths.get(uploadDir);
        if (!Files.exists(path)) {
            Files.createDirectories(path);
            log.info("📂 Carpeta de uploads creada en: {}", uploadDir);
        }
    }

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

        return ResponseEntity.ok(jdbcTemplate.queryForList(sql));
    }

    // ===============================================================
    // 🧩 NIVEL 2 - DETALLE COMPLETO (CENATE o EXTERNO)
    // ===============================================================
    @GetMapping("/detalle/{id}")
    @PreAuthorize("hasAnyAuthority('VER_PERSONAL_CNT','SUPERADMIN')")
    public ResponseEntity<?> getDetallePersonal(@PathVariable Long id) {
        log.info("📊 Consultando detalle completo del personal con ID {}", id);

        try {
            // 1️⃣ Intentar con personal interno (CNT)
            String sqlCnt = """
                SELECT jsonb_build_object(
                    'id_user', u.id_user,
                    'username', u.name_user,
                    'estado_usuario', u.stat_user,
                    'roles', COALESCE(jsonb_agg(DISTINCT dr.desc_rol)
                        FILTER (WHERE dr.desc_rol IS NOT NULL), '[]'::jsonb),
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
                            'profesion', 
                                CASE 
                                    WHEN prof.id_prof = 50 THEN pp.desc_prof_otro
                                    ELSE prof.desc_prof 
                                END,
                            'especialidades',
                                CASE WHEN prof.desc_prof ILIKE '%MEDICO%'
                                    THEN COALESCE(jsonb_agg(DISTINCT e.desc_esp)
                                    FILTER (WHERE e.desc_esp IS NOT NULL), '[]'::jsonb)
                                    ELSE '[]'::jsonb
                                END,
                            'rne_especialista',
                                CASE WHEN prof.desc_prof ILIKE '%MEDICO%'
                                    THEN MAX(pp.rne_prof)
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
                         i.desc_ipress, prof.id_prof, prof.desc_prof, d.desc_dist, pr.desc_prov, dep.desc_depart, pp.desc_prof_otro
            """;

            Map<String, Object> cnt = jdbcTemplate.queryForMap(sqlCnt, id);
            if (cnt != null && cnt.containsKey("detalle") && cnt.get("detalle") != null) {
                Map<String, Object> detalleCnt = objectMapper.readValue(cnt.get("detalle").toString(), Map.class);
                Map<String, Object> personal = (Map<String, Object>) detalleCnt.get("personal");
                if (personal != null && personal.get("nombres") != null) {
                    return ResponseEntity.ok(detalleCnt);
                }
            }

            // 2️⃣ Si no hay datos en CNT → buscar en EXTERNO
            String sqlExt = """
                SELECT jsonb_build_object(
                    'id_user', u.id_user,
                    'username', u.name_user,
                    'estado_usuario', u.stat_user,
                    'roles', COALESCE(jsonb_agg(DISTINCT dr.desc_rol)
                        FILTER (WHERE dr.desc_rol IS NOT NULL), '[]'::jsonb),
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
                        'ipress', i.desc_ipress,
                        'foto', e.foto_ext
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

            Map<String, Object> ext = jdbcTemplate.queryForMap(sqlExt, id);
            if (ext != null && ext.get("detalle") != null) {
                return ResponseEntity.ok(objectMapper.readValue(ext.get("detalle").toString(), Map.class));
            }

            return ResponseEntity.notFound().build();

        } catch (Exception e) {
            log.error("❌ Error al obtener detalle: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    // ===============================================================
    // 📸 SUBIR FOTO DE PERFIL (SIN CAMBIOS)
    // ===============================================================
    @PostMapping("/{id}/foto")
    @PreAuthorize("hasAnyAuthority('EDITAR_PERSONAL','CREAR_PERSONAL','SUPERADMIN')")
    public ResponseEntity<Map<String, String>> uploadFoto(
            @PathVariable Long id,
            @RequestParam("foto") MultipartFile file) {
        log.info("📸 Subiendo foto para usuario ID: {}", id);
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "El archivo está vacío"));
            }

            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                return ResponseEntity.badRequest().body(Map.of("message", "El archivo debe ser una imagen"));
            }

            if (file.getSize() > 5 * 1024 * 1024) {
                return ResponseEntity.badRequest().body(Map.of("message", "La imagen no debe superar los 5MB"));
            }

            String extension = Optional.ofNullable(file.getOriginalFilename())
                    .filter(f -> f.contains("."))
                    .map(f -> f.substring(f.lastIndexOf(".")))
                    .orElse("");
            String fileName = "user_" + id + "_" + UUID.randomUUID() + extension;

            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) Files.createDirectories(uploadPath);
            Path filePath = uploadPath.resolve(fileName);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            String updateSql = """
                UPDATE dim_personal_cnt SET foto_pers = ? WHERE id_usuario = ?
            """;
            int rowsAffected = jdbcTemplate.update(updateSql, fileName, id);

            if (rowsAffected == 0) {
                updateSql = "UPDATE dim_personal_externo SET foto_ext = ? WHERE id_user = ?";
                rowsAffected = jdbcTemplate.update(updateSql, fileName, id);
            }

            if (rowsAffected > 0) {
                return ResponseEntity.ok(Map.of(
                        "message", "Foto subida correctamente",
                        "fileName", fileName,
                        "url", "/api/personal/foto/" + fileName
                ));
            } else {
                return ResponseEntity.notFound().build();
            }

        } catch (IOException e) {
            log.error("❌ Error al subir foto: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error al guardar la foto: " + e.getMessage()));
        }
    }

    // ===============================================================
    // 🖼️ OBTENER FOTO
    // ===============================================================
    @GetMapping("/foto/{fileName}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Resource> getFoto(@PathVariable String fileName) {
        log.info("🖼️ Obteniendo foto: {}", fileName);
        try {
            Path filePath = Paths.get(uploadDir).resolve(fileName);
            if (!Files.exists(filePath)) return ResponseEntity.notFound().build();

            Resource resource = new UrlResource(filePath.toUri());
            String contentType = Files.probeContentType(filePath);
            if (contentType == null) contentType = "application/octet-stream";

            return ResponseEntity.ok()
                    .cacheControl(CacheControl.maxAge(7, TimeUnit.DAYS).cachePublic())
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + fileName + "\"")
                    .body(resource);
        } catch (IOException e) {
            log.error("❌ Error al obtener la foto: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // ===============================================================
    // 🎂 ENDPOINTS DE CUMPLEAÑEROS
    // ===============================================================
    @GetMapping("/cumpleaneros/mes/{mes}")
    @PreAuthorize("hasAnyAuthority('VER_PERSONAL_CNT','SUPERADMIN')")
    public ResponseEntity<List<Map<String, Object>>> getCumpleanerosPorMes(@PathVariable int mes) {
        log.info("🎂 Buscando cumpleañeros del mes {}", mes);
        String sql = """
            SELECT nombre_completo, tipo_personal, TO_CHAR(fecha_nacimiento, 'TMMonth') AS mes,
                   EXTRACT(DAY FROM fecha_nacimiento) AS dia, ipress
            FROM vw_personal_total
            WHERE EXTRACT(MONTH FROM fecha_nacimiento) = ?
            ORDER BY dia, nombre_completo
        """;
        return ResponseEntity.ok(jdbcTemplate.queryForList(sql, mes));
    }

    @GetMapping("/cumpleaneros/hoy")
    @PreAuthorize("hasAnyAuthority('VER_PERSONAL_CNT','SUPERADMIN')")
    public ResponseEntity<List<Map<String, Object>>> getCumpleanerosHoy() {
        log.info("🎉 Buscando cumpleañeros del día de hoy");
        String sql = """
            SELECT nombre_completo, tipo_personal, TO_CHAR(fecha_nacimiento, 'TMMonth') AS mes,
                   EXTRACT(DAY FROM fecha_nacimiento) AS dia, ipress
            FROM vw_personal_total
            WHERE EXTRACT(MONTH FROM fecha_nacimiento) = EXTRACT(MONTH FROM CURRENT_DATE)
              AND EXTRACT(DAY FROM fecha_nacimiento) = EXTRACT(DAY FROM CURRENT_DATE)
            ORDER BY nombre_completo
        """;
        return ResponseEntity.ok(jdbcTemplate.queryForList(sql));
    }
}
