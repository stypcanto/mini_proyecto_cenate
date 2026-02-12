package com.styp.cenate.api.area;
import lombok.extern.slf4j.Slf4j;

import jakarta.annotation.PostConstruct;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.styp.cenate.dto.PersonalRequest;
import com.styp.cenate.dto.PersonalResponse;
import com.styp.cenate.service.personal.PersonalCntService;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.*;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("/api/personal-cnt")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = {
        "http://localhost:3000",
        "http://localhost:5173",
        "http://10.0.89.241:3000",
        "http://10.0.89.241:5173"
})
public class PersonalCntController {

    private final PersonalCntService personalCntService;
    private final JdbcTemplate jdbcTemplate;

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
    // 📊 NUEVO ENDPOINT - LISTA DETALLADA DEL PERSONAL CNT
    // ===============================================================
    @GetMapping("/detalle")
    @PreAuthorize("hasAnyAuthority('VER_PERSONAL', 'ADMIN_TOTAL')")
    public ResponseEntity<List<Map<String, Object>>> getPersonalCntDetalle() {
        log.info("📊 Consultando detalle completo del personal CNT con JOIN");
        String sql = """
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
                p.id_area,
                a.desc_area AS area,
                p.id_reg_lab,
                r.desc_reg_lab AS regimen_laboral,
                p.coleg_pers AS colegiatura,
                p.cod_plan_rem AS codigo_planilla,
                p.foto_pers AS foto,
                u.created_at AS fecha_creacion_usuario,
                u.updated_at AS ultima_actualizacion_usuario
            FROM dim_usuarios u
            LEFT JOIN dim_personal_cnt p ON p.id_usuario = u.id_user
            LEFT JOIN dim_area a ON a.id_area = p.id_area
            LEFT JOIN dim_regimen_laboral r ON r.id_reg_lab = p.id_reg_lab
            ORDER BY p.ape_pater_pers, p.ape_mater_pers
        """;

        List<Map<String, Object>> resultado = jdbcTemplate.queryForList(sql);
        return ResponseEntity.ok(resultado);
    }

    // ===============================================================
    // 🔹 MÉTODOS CRUD (sin cambios)
    // ===============================================================
    @GetMapping
    @PreAuthorize("hasAnyAuthority('VER_PERSONAL', 'ADMIN_TOTAL')")
    public ResponseEntity<List<PersonalResponse>> getAllPersonalCnt() {
        log.info("📋 Obteniendo todo el personal CNT");
        return ResponseEntity.ok(personalCntService.getAllPersonalCnt());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('VER_PERSONAL', 'ADMIN_TOTAL')")
    public ResponseEntity<PersonalResponse> getPersonalCntById(@PathVariable Long id) {
        log.info("🔍 Obteniendo personal CNT con ID {}", id);
        return ResponseEntity.ok(personalCntService.getPersonalCntById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('CREAR_PERSONAL', 'ADMIN_TOTAL')")
    public ResponseEntity<PersonalResponse> createPersonalCnt(@Valid @RequestBody PersonalRequest request) {
        log.info("🆕 Creando nuevo personal CNT");
        setTipoCenate(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(personalCntService.createPersonalCnt(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('EDITAR_PERSONAL', 'ADMIN_TOTAL')")
    public ResponseEntity<PersonalResponse> updatePersonalCnt(@PathVariable Long id,
                                                              @Valid @RequestBody PersonalRequest request) {
        log.info("✏️ Actualizando personal CNT con ID {}", id);
        setTipoCenate(request);
        return ResponseEntity.ok(personalCntService.updatePersonalCnt(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ELIMINAR_PERSONAL', 'ADMIN_TOTAL')")
    public ResponseEntity<Void> deletePersonalCnt(@PathVariable Long id) {
        log.info("🗑️ Eliminando personal CNT con ID {}", id);
        personalCntService.deletePersonalCnt(id);
        return ResponseEntity.noContent().build();
    }

    // ===============================================================
    // 🖼️ FOTO DE PERFIL (sin cambios)
    // ===============================================================
    @GetMapping("/{id}/foto")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Resource> getFoto(@PathVariable Long id) {
        log.info("🖼️ Obteniendo foto de personal CNT con ID {}", id);
        try {
            PersonalResponse personal = personalCntService.getPersonalCntById(id);
            if (personal.getFoto() == null) return ResponseEntity.notFound().build();

            Path filePath = Paths.get(uploadDir, Paths.get(personal.getFoto()).getFileName().toString());
            if (!Files.exists(filePath)) return ResponseEntity.notFound().build();

            Resource resource = new UrlResource(filePath.toUri());
            String contentType = Files.probeContentType(filePath);
            if (contentType == null) contentType = "application/octet-stream";

            return ResponseEntity.ok()
                    .cacheControl(CacheControl.maxAge(7, TimeUnit.DAYS).cachePublic())
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + personal.getFoto() + "\"")
                    .body(resource);

        } catch (IOException e) {
            log.error("❌ Error al obtener la foto: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // ===============================================================
    // 🔒 AUXILIAR
    // ===============================================================
    private void setTipoCenate(PersonalRequest request) {
        request.setTipoPersonal("CENATE");
    }
}
