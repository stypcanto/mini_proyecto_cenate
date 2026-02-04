// ============================================================================
// 🧩 PersonalTotalController.java – Gestión CRUD de Personal Total (CENATE 2025)
// ----------------------------------------------------------------------------
// Controlador REST que permite:
//   • CRUD completo de personal (CENATE + EXTERNO)
//   • Subir y consultar fotos de personal
//   • Listar cumpleañeros por mes o día
// ============================================================================

package com.styp.cenate.api.area;

import com.fasterxml.jackson.databind.ObjectMapper;
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
        "http://localhost",
        "http://localhost:80",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1",
        "http://127.0.0.1:80",
        "http://10.0.89.241",
        "http://10.0.89.241:80",
        "http://10.0.89.241:3000",
        "http://10.0.89.241:5173",
        "http://10.0.89.239",
        "http://10.0.89.239:80",
        "http://10.0.89.239:3000",
        "http://10.0.89.239:5173"
})
public class PersonalTotalController {

    private final JdbcTemplate jdbcTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${cenate.storage.fotos-dir:uploads/personal}")
    private String fotosDir;

    private Path rootPath;

    @PostConstruct
    public void init() {
        try {
            // Si es una ruta relativa, convertirla a absoluta desde el directorio del proyecto
            Path basePath = Paths.get(fotosDir);
            if (!basePath.isAbsolute()) {
                // Obtener el directorio de trabajo actual (raíz del proyecto)
                String projectRoot = System.getProperty("user.dir");
                rootPath = Paths.get(projectRoot, fotosDir).normalize().toAbsolutePath();
            } else {
                rootPath = basePath.normalize().toAbsolutePath();
            }
            
            if (!Files.exists(rootPath)) {
                Files.createDirectories(rootPath);
                log.info("📁 Directorio de fotos creado: {}", rootPath.toAbsolutePath());
            } else {
                log.info("📁 Directorio de fotos existe: {}", rootPath.toAbsolutePath());
            }
        } catch (IOException e) {
            log.error("❌ Error al crear el directorio de fotos", e);
        }
    }

    // =========================================================================
    // 📋 1. LISTAR TODOS LOS USUARIOS/PERSONAL (READ ALL)
    // =========================================================================
    @GetMapping("/total")
    @PreAuthorize("hasAnyAuthority('/roles/admin/usuarios', '/roles/admin/personal/ver', 'ROLE_SUPERADMIN', 'ROLE_ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> listarPersonalTotal() {
        try {
            String sql = """
                SELECT 
                    u.id_user,
                    u.id_user as id_usuario,
                    u.name_user as username,
                    CASE 
                        WHEN u.stat_user = 'ACTIVO' OR u.stat_user = 'A' THEN 'ACTIVO'
                        WHEN u.stat_user = 'INACTIVO' OR u.stat_user = 'I' THEN 'INACTIVO'
                        ELSE u.stat_user
                    END as estado_usuario,
                    CASE 
                        WHEN u.stat_user = 'ACTIVO' OR u.stat_user = 'A' THEN 'ACTIVO'
                        WHEN u.stat_user = 'INACTIVO' OR u.stat_user = 'I' THEN 'INACTIVO'
                        ELSE u.stat_user
                    END as estado,
                    
                    COALESCE(pc.num_doc_pers, pe.num_doc_ext, '') as numero_documento,
                    COALESCE(pc.nom_pers, pe.nom_ext, '') as nombres,
                    COALESCE(pc.ape_pater_pers, pe.ape_pater_ext, '') as apellido_paterno,
                    COALESCE(pc.ape_mater_pers, pe.ape_mater_ext, '') as apellido_materno,
                    
                    CASE
                        WHEN pc.nom_pers IS NOT NULL THEN
                            CONCAT(pc.nom_pers, ' ', pc.ape_pater_pers, ' ', pc.ape_mater_pers)
                        WHEN pe.nom_ext IS NOT NULL THEN
                            CONCAT(pe.nom_ext, ' ', pe.ape_pater_ext, ' ', pe.ape_mater_ext)
                        ELSE u.name_user
                    END as nombre_completo,
                    
                    COALESCE(td_cnt.desc_tip_doc, td_ext.desc_tip_doc, 'DNI') as tipo_documento,
                    COALESCE(pc.gen_pers, pe.gen_ext, '') as genero,
                    
                    COALESCE(pc.fech_naci_pers, pe.fech_naci_ext) as fecha_nacimiento,
                    EXTRACT(YEAR FROM AGE(COALESCE(pc.fech_naci_pers, pe.fech_naci_ext)))::INTEGER as edad,
                    
                    CASE EXTRACT(MONTH FROM COALESCE(pc.fech_naci_pers, pe.fech_naci_ext))
                        WHEN 1 THEN 'Enero' WHEN 2 THEN 'Febrero' WHEN 3 THEN 'Marzo'
                        WHEN 4 THEN 'Abril' WHEN 5 THEN 'Mayo' WHEN 6 THEN 'Junio'
                        WHEN 7 THEN 'Julio' WHEN 8 THEN 'Agosto' WHEN 9 THEN 'Septiembre'
                        WHEN 10 THEN 'Octubre' WHEN 11 THEN 'Noviembre' WHEN 12 THEN 'Diciembre'
                        ELSE ''
                    END as mes_cumpleanos,
                    
                    TO_CHAR(COALESCE(pc.fech_naci_pers, pe.fech_naci_ext), 'DD') as dia_cumpleanos,
                    
                    COALESCE(pc.email_pers, pe.email_pers_ext, '') as correo_personal,
                    COALESCE(pc.email_corp_pers, pe.email_corp_ext, '') as correo_institucional,
                    COALESCE(pc.movil_pers, pe.movil_ext, '') as telefono,
                    
                    COALESCE(pc.direc_pers, '') as direccion,
                    COALESCE(dist_cnt.desc_dist, dist_ext.desc_dist, '') as distrito,
                    COALESCE(prov_cnt.desc_prov, prov_ext.desc_prov, '') as provincia,
                    COALESCE(dep_cnt.desc_depart, dep_ext.desc_depart, '') as departamento,
                    
                    COALESCE(pc.nom_contacto_emerg, pe.nom_contacto_emerg, '') as nombre_contacto_emergencia,
                    COALESCE(pc.tel_contacto_emerg, pe.tel_contacto_emerg, '') as telefono_contacto_emergencia,
                    COALESCE(pc.observaciones, pe.observaciones, '') as observaciones,
                    
                    COALESCE(pc.foto_pers, '') as foto_url,
                    
                    CASE 
                        WHEN pc.id_pers IS NOT NULL THEN COALESCE(rl.desc_reg_lab, '')
                        ELSE 'NO APLICA'
                    END as regimen_laboral,
                    CASE 
                        WHEN pc.id_pers IS NOT NULL THEN COALESCE(a.desc_area, '')
                        ELSE 'NO APLICA'
                    END as nombre_area,
                    COALESCE(i_cnt.desc_ipress, i_ext.desc_ipress, '') as nombre_ipress,
                    CASE 
                        WHEN pc.id_pers IS NOT NULL THEN COALESCE(pc.cod_plan_rem, '')
                        ELSE 'NO APLICA'
                    END as codigo_planilla,
                    CASE 
                        WHEN pc.id_pers IS NOT NULL THEN COALESCE(pc.coleg_pers, '')
                        ELSE 'NO APLICA'
                    END as colegiatura,
                    
                    CASE 
                        WHEN pc.per_pers IS NOT NULL THEN
                            TO_CHAR(TO_DATE(pc.per_pers, 'YYYYMM'), 'TMMonth YYYY')
                        WHEN pc.id_pers IS NOT NULL THEN ''
                        ELSE 'NO APLICA'
                    END as periodo_ingreso,
                    
                    (
                        SELECT STRING_AGG(DISTINCT r2.desc_rol, ', ')
                        FROM rel_user_roles rur2
                        LEFT JOIN dim_roles r2 ON rur2.id_rol = r2.id_rol
                        WHERE rur2.id_user = u.id_user
                    ) as roles,
                    
                    u.created_at as fecha_creacion_usuario,
                    u.updated_at as ultima_actualizacion_usuario,
                    
                    CASE 
                        WHEN pc.id_pers IS NOT NULL THEN 'CENATE'
                        WHEN pe.id_pers_ext IS NOT NULL THEN 'EXTERNO'
                        ELSE 'SIN_DATOS_PERSONAL'
                    END as tipo_personal

                FROM dim_usuarios u
                LEFT JOIN dim_personal_cnt pc ON u.id_user = pc.id_usuario
                LEFT JOIN dim_personal_externo pe ON u.id_user = pe.id_user
                LEFT JOIN dim_tipo_documento td_cnt ON pc.id_tip_doc = td_cnt.id_tip_doc
                LEFT JOIN dim_tipo_documento td_ext ON pe.id_tip_doc = td_ext.id_tip_doc
                LEFT JOIN dim_distrito dist_cnt ON pc.id_dist = dist_cnt.id_dist
                LEFT JOIN dim_provincia prov_cnt ON dist_cnt.id_prov = prov_cnt.id_prov
                LEFT JOIN dim_departamento dep_cnt ON prov_cnt.id_depart = dep_cnt.id_depart
                LEFT JOIN dim_distrito dist_ext ON pe.id_dist = dist_ext.id_dist
                LEFT JOIN dim_provincia prov_ext ON dist_ext.id_prov = prov_ext.id_prov
                LEFT JOIN dim_departamento dep_ext ON prov_ext.id_depart = dep_ext.id_depart
                LEFT JOIN dim_regimen_laboral rl ON pc.id_reg_lab = rl.id_reg_lab
                LEFT JOIN dim_area a ON pc.id_area = a.id_area
                LEFT JOIN dim_ipress i_cnt ON pc.id_ipress = i_cnt.id_ipress
                LEFT JOIN dim_ipress i_ext ON pe.id_ipress = i_ext.id_ipress

                WHERE u.stat_user IN ('ACTIVO', 'A')

                GROUP BY 
                    u.id_user, u.name_user, u.stat_user, u.created_at, u.updated_at,
                    pc.id_pers, pc.num_doc_pers, pc.nom_pers, pc.ape_pater_pers, pc.ape_mater_pers,
                    pc.fech_naci_pers, pc.email_pers, pc.email_corp_pers, pc.movil_pers, pc.foto_pers,
                    pc.direc_pers, pc.cod_plan_rem, pc.coleg_pers, pc.per_pers, pc.gen_pers,
                    pc.nom_contacto_emerg, pc.tel_contacto_emerg, pc.observaciones,
                    pe.id_pers_ext, pe.num_doc_ext, pe.nom_ext, pe.ape_pater_ext, pe.ape_mater_ext,
                    pe.fech_naci_ext, pe.email_pers_ext, pe.email_corp_ext, pe.movil_ext, pe.gen_ext,
                    pe.nom_contacto_emerg, pe.tel_contacto_emerg, pe.observaciones,
                    td_cnt.desc_tip_doc, td_ext.desc_tip_doc, rl.desc_reg_lab, a.desc_area,
                    i_cnt.desc_ipress, i_ext.desc_ipress,
                    dist_cnt.desc_dist, prov_cnt.desc_prov, dep_cnt.desc_depart,
                    dist_ext.desc_dist, prov_ext.desc_prov, dep_ext.desc_depart

                ORDER BY 
                    COALESCE(pc.ape_pater_pers, pe.ape_pater_ext, u.name_user),
                    COALESCE(pc.ape_mater_pers, pe.ape_mater_ext, ''),
                    COALESCE(pc.nom_pers, pe.nom_ext, '')
            """;
            
            List<Map<String, Object>> personal = jdbcTemplate.queryForList(sql);
            log.info("📋 Listando {} registros de personal total", personal.size());
            
            // 🔍 DEBUG: Verificar si el usuario específico está en los resultados
            personal.stream()
                .filter(p -> "46205941".equals(p.get("username")))
                .findFirst()
                .ifPresentOrElse(
                    p -> log.info("✅ Usuario 46205941 encontrado en resultados: {}", p),
                    () -> log.warn("⚠️ Usuario 46205941 NO encontrado en resultados")
                );
            
            return ResponseEntity.ok(personal);
        } catch (Exception e) {
            log.error("❌ Error al listar personal total", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // =========================================================================
    // 📋 2. OBTENER DETALLE POR ID (READ ONE)
    // =========================================================================
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('/roles/admin/usuarios', '/roles/admin/personal/ver', 'ROLE_SUPERADMIN', 'ROLE_ADMIN')")
    public ResponseEntity<Map<String, Object>> obtenerDetalle(@PathVariable("id") Long id) {
        try {
            String sql = """
                SELECT 
                    u.id_user,
                    u.name_user as username,
                    u.stat_user as estado_usuario,
                    
                    pc.id_pers,
                    pc.num_doc_pers as numero_documento,
                    pc.nom_pers as nombres,
                    pc.ape_pater_pers as apellido_paterno,
                    pc.ape_mater_pers as apellido_materno,
                    pc.gen_pers as genero,
                    pc.fech_naci_pers as fecha_nacimiento,
                    pc.email_pers as correo_personal,
                    pc.email_corp_pers as correo_institucional,
                    pc.movil_pers as telefono,
                    pc.direc_pers as direccion,
                    pc.id_dist,
                    pc.foto_pers as foto_url,
                    pc.coleg_pers as colegiatura,
                    pc.cod_plan_rem as codigo_planilla,
                    pc.per_pers as periodo_ingreso,
                    pc.nom_contacto_emerg as nombre_contacto_emergencia,
                    pc.tel_contacto_emerg as telefono_contacto_emergencia,
                    pc.observaciones,
                    
                    pc.id_tip_doc,
                    pc.id_reg_lab,
                    pc.id_area,
                    pc.id_ipress,
                    
                    td.desc_tip_doc as tipo_documento,
                    rl.desc_reg_lab as regimen_laboral,
                    a.desc_area as area,
                    i.desc_ipress as ipress,
                    
                    dist.desc_dist as distrito,
                    prov.desc_prov as provincia,
                    dep.desc_depart as departamento
                    
                FROM dim_usuarios u
                LEFT JOIN dim_personal_cnt pc ON u.id_user = pc.id_usuario
                LEFT JOIN dim_tipo_documento td ON pc.id_tip_doc = td.id_tip_doc
                LEFT JOIN dim_regimen_laboral rl ON pc.id_reg_lab = rl.id_reg_lab
                LEFT JOIN dim_area a ON pc.id_area = a.id_area
                LEFT JOIN dim_ipress i ON pc.id_ipress = i.id_ipress
                LEFT JOIN dim_distrito dist ON pc.id_dist = dist.id_dist
                LEFT JOIN dim_provincia prov ON dist.id_prov = prov.id_prov
                LEFT JOIN dim_departamento dep ON prov.id_depart = dep.id_depart
                
                WHERE u.id_user = ?
            """;
            
            List<Map<String, Object>> result = jdbcTemplate.queryForList(sql, id);

            if (result.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", "No se encontró el usuario con ID: " + id));
            }

            log.info("📋 Detalle obtenido para usuario {}", id);
            return ResponseEntity.ok(result.get(0));
        } catch (Exception e) {
            log.error("❌ Error al obtener detalle de personal", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error interno al obtener detalle."));
        }
    }

    // =========================================================================
    // 📋 2B. OBTENER DETALLE FORMATEADO PARA FRONTEND (READ ONE)
    // =========================================================================
    @GetMapping("/detalle/{id}")
    public ResponseEntity<Map<String, Object>> obtenerDetalleFormateado(@PathVariable("id") Long id) {
        try {
            String sql = """
                SELECT 
                    u.id_user,
                    u.name_user as username,
                    u.stat_user as estado_usuario,
                    
                    pc.id_pers,
                    pc.num_doc_pers as numero_documento,
                    pc.nom_pers as nombres,
                    pc.ape_pater_pers as apellido_paterno,
                    pc.ape_mater_pers as apellido_materno,
                    pc.gen_pers as genero,
                    pc.fech_naci_pers as fecha_nacimiento,
                    pc.email_pers as correo_personal,
                    pc.email_corp_pers as correo_institucional,
                    pc.movil_pers as telefono,
                    pc.direc_pers as direccion,
                    pc.id_dist,
                    pc.foto_pers as foto_url,
                    pc.coleg_pers as colegiatura,
                    pc.cod_plan_rem as codigo_planilla,
                    pc.per_pers as periodo_ingreso,
                    pc.nom_contacto_emerg as nombre_contacto_emergencia,
                    pc.tel_contacto_emerg as telefono_contacto_emergencia,
                    pc.observaciones,
                    
                    pc.id_tip_doc,
                    pc.id_reg_lab,
                    pc.id_area,
                    pc.id_ipress,
                    
                    td.desc_tip_doc as tipo_documento,
                    rl.desc_reg_lab as regimen_laboral,
                    a.desc_area as area,
                    i.desc_ipress as ipress,
                    
                    dist.desc_dist as distrito,
                    prov.desc_prov as provincia,
                    dep.desc_depart as departamento
                    
                FROM dim_usuarios u
                LEFT JOIN dim_personal_cnt pc ON u.id_user = pc.id_usuario
                LEFT JOIN dim_tipo_documento td ON pc.id_tip_doc = td.id_tip_doc
                LEFT JOIN dim_regimen_laboral rl ON pc.id_reg_lab = rl.id_reg_lab
                LEFT JOIN dim_area a ON pc.id_area = a.id_area
                LEFT JOIN dim_ipress i ON pc.id_ipress = i.id_ipress
                LEFT JOIN dim_distrito dist ON pc.id_dist = dist.id_dist
                LEFT JOIN dim_provincia prov ON dist.id_prov = prov.id_prov
                LEFT JOIN dim_departamento dep ON prov.id_depart = dep.id_depart
                
                WHERE u.id_user = ?
            """;
            
            List<Map<String, Object>> result = jdbcTemplate.queryForList(sql, id);

            if (result.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", "No se encontró el usuario con ID: " + id));
            }

            Map<String, Object> data = result.get(0);
            
            // Formatear respuesta para el frontend
            Map<String, Object> response = new HashMap<>();
            response.put("id", data.get("id_user"));
            
            // Información personal estructurada
            Map<String, Object> personal = new HashMap<>();
            personal.put("id_pers", data.get("id_pers"));
            personal.put("numero_documento", data.get("numero_documento"));
            personal.put("tipo_documento", data.get("tipo_documento"));
            personal.put("nombres", data.get("nombres"));
            personal.put("apellido_paterno", data.get("apellido_paterno"));
            personal.put("apellido_materno", data.get("apellido_materno"));
            personal.put("genero", data.get("genero"));
            personal.put("fecha_nacimiento", data.get("fecha_nacimiento"));
            personal.put("direccion", data.get("direccion"));
            personal.put("distrito", data.get("distrito"));
            personal.put("provincia", data.get("provincia"));
            personal.put("departamento", data.get("departamento"));
            personal.put("foto_url", data.get("foto_url"));
            
            // Información de contacto
            Map<String, Object> contacto = new HashMap<>();
            contacto.put("telefono", data.get("telefono"));
            contacto.put("correo_personal", data.get("correo_personal"));
            contacto.put("correo_corporativo", data.get("correo_institucional"));
            personal.put("contacto", contacto);
            
            // Información laboral
            Map<String, Object> laboral = new HashMap<>();
            laboral.put("profesion", "Médico"); // TODO: Obtener de la tabla de profesiones
            laboral.put("especialidad", "Medicina General"); // TODO: Obtener de la tabla de especialidades
            laboral.put("rne_especialista", data.get("colegiatura"));
            laboral.put("colegiatura", data.get("colegiatura"));
            laboral.put("area", data.get("area"));
            laboral.put("regimen_laboral", data.get("regimen_laboral"));
            laboral.put("codigo_planilla", data.get("codigo_planilla"));
            laboral.put("periodo_ingreso", data.get("periodo_ingreso"));
            personal.put("laboral", laboral);
            
            // Contacto de emergencia
            Map<String, Object> emergencia = new HashMap<>();
            emergencia.put("nombre", data.get("nombre_contacto_emergencia"));
            emergencia.put("telefono", data.get("telefono_contacto_emergencia"));
            personal.put("contacto_emergencia", emergencia);
            
            // Usuario asociado
            Map<String, Object> usuario = new HashMap<>();
            usuario.put("id", data.get("id_user"));
            usuario.put("username", data.get("username"));
            usuario.put("estado", data.get("estado_usuario"));
            personal.put("usuario", usuario);
            
            response.put("personal", personal);

            log.info("📋 Detalle formateado obtenido para usuario {}", id);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("❌ Error al obtener detalle formateado de personal", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error interno al obtener detalle."));
        }
    }

    // =========================================================================
    // ✏️ 3. CREAR NUEVO PERSONAL (CREATE)
    // =========================================================================
    @PostMapping
    @PreAuthorize("hasAnyAuthority('/roles/admin/personal/crear', 'ROLE_SUPERADMIN', 'ROLE_ADMIN')")
    public ResponseEntity<Map<String, Object>> crearPersonal(@RequestBody Map<String, Object> datos) {
        try {
            log.info("📝 Creando nuevo personal: {}", datos);
            
            // Validar campos obligatorios
            if (!datos.containsKey("id_user")) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "El campo id_user es obligatorio"));
            }
            
            Long idUser = Long.valueOf(datos.get("id_user").toString());
            
            // Verificar si el usuario ya tiene registro de personal
            String checkSql = "SELECT COUNT(*) FROM dim_personal_cnt WHERE id_usuario = ?";
            Integer count = jdbcTemplate.queryForObject(checkSql, Integer.class, idUser);
            
            if (count != null && count > 0) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(Map.of("message", "Este usuario ya tiene un registro de personal"));
            }
            
            // Insertar en dim_personal_cnt
            String insertSql = """
                INSERT INTO dim_personal_cnt (
                    id_tip_doc, num_doc_pers, per_pers, stat_pers,
                    fech_naci_pers, gen_pers, movil_pers, email_pers, email_corp_pers,
                    coleg_pers, cod_plan_rem, direc_pers,
                    id_reg_lab, id_area, id_usuario, id_ipress, id_dist,
                    nom_pers, ape_mater_pers, ape_pater_pers,
                    nom_contacto_emerg, tel_contacto_emerg, observaciones
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                RETURNING id_pers
            """;
            
            Long idPers = jdbcTemplate.queryForObject(insertSql, Long.class,
                datos.getOrDefault("id_tip_doc", 1),
                datos.getOrDefault("numero_documento", ""),
                datos.getOrDefault("periodo_ingreso", ""),
                datos.getOrDefault("estado", "A"),
                datos.get("fecha_nacimiento"),
                datos.getOrDefault("genero", ""),
                datos.getOrDefault("telefono", ""),
                datos.getOrDefault("correo_personal", ""),
                datos.getOrDefault("correo_institucional", ""),
                datos.getOrDefault("colegiatura", ""),
                datos.getOrDefault("codigo_planilla", ""),
                datos.getOrDefault("direccion", ""),
                datos.get("id_reg_lab"),
                datos.get("id_area"),
                idUser,
                datos.get("id_ipress"),
                datos.get("id_dist"),
                datos.getOrDefault("nombres", ""),
                datos.getOrDefault("apellido_materno", ""),
                datos.getOrDefault("apellido_paterno", ""),
                datos.getOrDefault("nombre_contacto_emergencia", ""),
                datos.getOrDefault("telefono_contacto_emergencia", ""),
                datos.getOrDefault("observaciones", "")
            );
            
            log.info("✅ Personal creado exitosamente con ID: {}", idPers);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(Map.of("message", "Personal creado exitosamente", "id_pers", idPers));
                    
        } catch (Exception e) {
            log.error("❌ Error al crear personal", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error al crear personal: " + e.getMessage()));
        }
    }

    // =========================================================================
    // 🔄 4. ACTUALIZAR PERSONAL (UPDATE)
    // =========================================================================
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('/roles/admin/personal/editar', 'ROLE_SUPERADMIN', 'ROLE_ADMIN')")
    public ResponseEntity<Map<String, Object>> actualizarPersonal(
            @PathVariable("id") Long id,
            @RequestBody Map<String, Object> datos) {
        try {
            log.info("🔄 Actualizando personal ID: {} con datos: {}", id, datos);
            
            // Verificar si existe el registro
            String checkSql = "SELECT COUNT(*) FROM dim_personal_cnt WHERE id_usuario = ?";
            Integer count = jdbcTemplate.queryForObject(checkSql, Integer.class, id);
            
            if (count == null || count == 0) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", "No se encontró el registro de personal para este usuario"));
            }
            
            // Actualizar dim_personal_cnt
            String updateSql = """
                UPDATE dim_personal_cnt SET
                    id_tip_doc = COALESCE(?, id_tip_doc),
                    num_doc_pers = COALESCE(?, num_doc_pers),
                    per_pers = COALESCE(?, per_pers),
                    stat_pers = COALESCE(?, stat_pers),
                    fech_naci_pers = COALESCE(?, fech_naci_pers),
                    gen_pers = COALESCE(?, gen_pers),
                    movil_pers = COALESCE(?, movil_pers),
                    email_pers = COALESCE(?, email_pers),
                    email_corp_pers = COALESCE(?, email_corp_pers),
                    coleg_pers = COALESCE(?, coleg_pers),
                    cod_plan_rem = COALESCE(?, cod_plan_rem),
                    direc_pers = COALESCE(?, direc_pers),
                    id_reg_lab = COALESCE(?, id_reg_lab),
                    id_area = COALESCE(?, id_area),
                    id_ipress = COALESCE(?, id_ipress),
                    id_dist = COALESCE(?, id_dist),
                    nom_pers = COALESCE(?, nom_pers),
                    ape_mater_pers = COALESCE(?, ape_mater_pers),
                    ape_pater_pers = COALESCE(?, ape_pater_pers),
                    nom_contacto_emerg = COALESCE(?, nom_contacto_emerg),
                    tel_contacto_emerg = COALESCE(?, tel_contacto_emerg),
                    observaciones = COALESCE(?, observaciones),
                    updated_at = NOW()
                WHERE id_usuario = ?
            """;
            
            int updated = jdbcTemplate.update(updateSql,
                datos.get("id_tip_doc"),
                datos.get("numero_documento"),
                datos.get("periodo_ingreso"),
                datos.get("estado"),
                datos.get("fecha_nacimiento"),
                datos.get("genero"),
                datos.get("telefono"),
                datos.get("correo_personal"),
                datos.get("correo_institucional"),
                datos.get("colegiatura"),
                datos.get("codigo_planilla"),
                datos.get("direccion"),
                datos.get("id_reg_lab"),
                datos.get("id_area"),
                datos.get("id_ipress"),
                datos.get("id_dist"),
                datos.get("nombres"),
                datos.get("apellido_materno"),
                datos.get("apellido_paterno"),
                datos.get("nombre_contacto_emergencia"),
                datos.get("telefono_contacto_emergencia"),
                datos.get("observaciones"),
                id
            );
            
            if (updated > 0) {
                log.info("✅ Personal actualizado exitosamente: {}", id);
                return ResponseEntity.ok(Map.of("message", "Personal actualizado exitosamente"));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", "No se pudo actualizar el personal"));
            }
            
        } catch (Exception e) {
            log.error("❌ Error al actualizar personal", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error al actualizar personal: " + e.getMessage()));
        }
    }

    // =========================================================================
    // 🗑️ 5. ELIMINAR PERSONAL (DELETE - Soft Delete)
    // =========================================================================
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('/roles/admin/personal/eliminar', 'ROLE_SUPERADMIN')")
    public ResponseEntity<Map<String, Object>> eliminarPersonal(@PathVariable("id") Long id) {
        try {
            log.info("🗑️ Eliminando personal ID: {}", id);
            
            // Soft delete - cambiar estado a INACTIVO
            String updateSql = """
                UPDATE dim_personal_cnt 
                SET stat_pers = 'I', updated_at = NOW()
                WHERE id_usuario = ?
            """;
            
            int updated = jdbcTemplate.update(updateSql, id);
            
            if (updated > 0) {
                // También desactivar el usuario
                String updateUserSql = "UPDATE dim_usuarios SET stat_user = 'INACTIVO' WHERE id_user = ?";
                jdbcTemplate.update(updateUserSql, id);
                
                log.info("✅ Personal eliminado (soft delete) exitosamente: {}", id);
                return ResponseEntity.ok(Map.of("message", "Personal eliminado exitosamente"));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", "No se encontró el personal a eliminar"));
            }
            
        } catch (Exception e) {
            log.error("❌ Error al eliminar personal", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error al eliminar personal: " + e.getMessage()));
        }
    }

    // =========================================================================
    // 🎂 6. CUMPLEAÑEROS DEL MES
    // =========================================================================
    @GetMapping("/cumpleanios/{mes}")
    public ResponseEntity<List<Map<String, Object>>> cumpleanierosPorMes(@PathVariable("mes") int mes) {
        try {
            String sql = """
                SELECT 
                    u.id_user,
                    CONCAT(pc.nom_pers, ' ', pc.ape_pater_pers, ' ', pc.ape_mater_pers) as nombre_completo,
                    pc.fech_naci_pers as fecha_nacimiento,
                    EXTRACT(DAY FROM pc.fech_naci_pers) as dia,
                    pc.email_pers as correo_personal,
                    pc.movil_pers as telefono,
                    a.desc_area as area
                FROM dim_usuarios u
                JOIN dim_personal_cnt pc ON u.id_user = pc.id_usuario
                LEFT JOIN dim_area a ON pc.id_area = a.id_area
                WHERE EXTRACT(MONTH FROM pc.fech_naci_pers) = ?
                  AND u.stat_user = 'ACTIVO'
                ORDER BY EXTRACT(DAY FROM pc.fech_naci_pers)
            """;
            
            List<Map<String, Object>> cumpleanieros = jdbcTemplate.queryForList(sql, mes);
            log.info("🎂 Encontrados {} cumpleañeros para el mes {}", cumpleanieros.size(), mes);
            return ResponseEntity.ok(cumpleanieros);
        } catch (Exception e) {
            log.error("❌ Error al obtener cumpleañeros del mes {}", mes, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // =========================================================================
    // 🖼️ 7. SUBIDA DE FOTOS
    // =========================================================================
    @PostMapping("/foto/{id}")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN') or hasAuthority('/roles/admin/personal/editar')")
    public ResponseEntity<Map<String, Object>> subirFoto(
            @PathVariable("id") Long id,
            @RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Archivo vacío"));
            }

            String filename = "personal_" + id + "_" + UUID.randomUUID() + "_" + file.getOriginalFilename();
            Path destino = rootPath.resolve(filename);
            Files.copy(file.getInputStream(), destino, StandardCopyOption.REPLACE_EXISTING);

            // Actualizar la ruta de la foto en la BD
            String updateSql = "UPDATE dim_personal_cnt SET foto_pers = ? WHERE id_usuario = ?";
            jdbcTemplate.update(updateSql, filename, id);

            log.info("📸 Foto subida correctamente: {}", filename);
            return ResponseEntity.ok(Map.of(
                "message", "Foto subida correctamente", 
                "filename", filename,
                "url", "/api/personal/foto/" + filename
            ));

        } catch (Exception e) {
            log.error("❌ Error al subir foto de personal {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error al subir la foto"));
        }
    }

    // =========================================================================
    // 🖼️ 8. DESCARGA / VISUALIZACIÓN DE FOTOS
    // =========================================================================
    @GetMapping("/foto/{filename:.+}")
    public ResponseEntity<Resource> obtenerFoto(@PathVariable String filename) {
        try {
            log.info("🖼️ Solicitando foto: {}", filename);
            log.info("📁 Directorio base de fotos: {}", rootPath != null ? rootPath.toAbsolutePath() : "NO INICIALIZADO");
            Path file = rootPath.resolve(filename);
            log.info("📁 Ruta completa del archivo: {}", file.toAbsolutePath());
            log.info("📁 ¿El archivo existe?: {}", Files.exists(file));
            
            Resource resource = new UrlResource(file.toUri());

            if (!resource.exists()) {
                log.warn("⚠️ Archivo no existe: {}", file.toAbsolutePath());
                return ResponseEntity.notFound().build();
            }
            
            if (!resource.isReadable()) {
                log.warn("⚠️ Archivo no es legible: {}", file.toAbsolutePath());
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            // Detectar el tipo de contenido automáticamente
            String contentType = null;
            try {
                contentType = Files.probeContentType(file);
                log.info("📄 Tipo de contenido detectado: {}", contentType);
            } catch (IOException e) {
                log.warn("⚠️ No se pudo detectar el tipo de contenido: {}", e.getMessage());
            }
            
            // Si no se puede detectar, usar el tipo por defecto según la extensión
            if (contentType == null || contentType.isEmpty()) {
                String filenameLower = filename.toLowerCase();
                if (filenameLower.endsWith(".jpg") || filenameLower.endsWith(".jpeg")) {
                    contentType = "image/jpeg";
                } else if (filenameLower.endsWith(".png")) {
                    contentType = "image/png";
                } else if (filenameLower.endsWith(".gif")) {
                    contentType = "image/gif";
                } else if (filenameLower.endsWith(".webp")) {
                    contentType = "image/webp";
                } else {
                    contentType = "image/jpeg"; // Por defecto
                }
                log.info("📄 Tipo de contenido inferido de extensión: {}", contentType);
            }

            HttpHeaders headers = new HttpHeaders();
            headers.setCacheControl(CacheControl.maxAge(1, TimeUnit.DAYS).cachePublic());
            headers.setContentDisposition(ContentDisposition.inline().filename(filename).build());

            log.info("✅ Enviando foto: {} (tipo: {})", filename, contentType);
            return ResponseEntity.ok()
                    .headers(headers)
                    .contentType(MediaType.parseMediaType(contentType))
                    .body(resource);

        } catch (Exception e) {
            log.error("❌ Error al obtener foto {}", filename, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // =========================================================================
    // 🗑️ 9. ELIMINAR FOTO
    // =========================================================================
    @DeleteMapping("/foto/{id}")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN') or hasAuthority('/roles/admin/personal/editar')")
    public ResponseEntity<Map<String, Object>> eliminarFoto(@PathVariable("id") Long id) {
        try {
            log.info("🗑️ Eliminando foto para usuario ID: {}", id);

            // Obtener el nombre del archivo actual
            String selectSql = "SELECT foto_pers FROM dim_personal_cnt WHERE id_usuario = ?";
            String fotoActual = jdbcTemplate.queryForObject(selectSql, String.class, id);

            if (fotoActual == null || fotoActual.isBlank()) {
                return ResponseEntity.ok(Map.of(
                    "message", "No hay foto asociada a este usuario",
                    "deleted", false
                ));
            }

            // Eliminar el archivo físico
            try {
                Path filePath = rootPath.resolve(fotoActual);
                if (Files.exists(filePath)) {
                    Files.delete(filePath);
                    log.info("✅ Archivo físico eliminado: {}", fotoActual);
                }
            } catch (IOException e) {
                log.warn("⚠️ No se pudo eliminar el archivo físico: {}", e.getMessage());
            }

            // Actualizar la BD (poner null en foto_pers)
            String updateSql = "UPDATE dim_personal_cnt SET foto_pers = NULL WHERE id_usuario = ?";
            int rowsAffected = jdbcTemplate.update(updateSql, id);

            if (rowsAffected > 0) {
                log.info("✅ Foto eliminada correctamente para usuario ID: {}", id);
                return ResponseEntity.ok(Map.of(
                    "message", "Foto eliminada correctamente",
                    "deleted", true,
                    "filename", fotoActual
                ));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "message", "Usuario no encontrado",
                    "deleted", false
                ));
            }

        } catch (Exception e) {
            log.error("❌ Error al eliminar foto de usuario {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error al eliminar la foto: " + e.getMessage()));
        }
    }
}
