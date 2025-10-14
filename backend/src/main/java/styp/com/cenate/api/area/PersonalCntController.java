package styp.com.cenate.api.personal;

import jakarta.annotation.PostConstruct;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import styp.com.cenate.dto.PersonalRequest;
import styp.com.cenate.dto.PersonalResponse;
import styp.com.cenate.service.personal.PersonalCntService;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.*;
import java.util.List;
import java.util.concurrent.TimeUnit;

/**
 * 🧩 Controlador REST para la gestión de Personal CNT (CENATE)
 */
@RestController
@RequestMapping("/api/personal-cnt")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = {
        "http://localhost:3000",
        "http://localhost:5173",
        "http://10.0.89.13:3000",
        "http://10.0.89.13:5173"
})
public class PersonalCntController {

    private final PersonalCntService personalCntService;

    @Value("${app.upload.dir:${user.home}/cenate-uploads/personal}")
    private String uploadDir;

    // ===============================================================
    // 📁 Inicializa la carpeta de uploads si no existe
    // ===============================================================
    @PostConstruct
    private void initUploadDir() throws IOException {
        Path path = Paths.get(uploadDir);
        if (!Files.exists(path)) {
            Files.createDirectories(path);
            log.info("📂 Carpeta de uploads creada en: {}", uploadDir);
        }
    }

    // ===============================================================
    // 🔹 MÉTODOS CRUD
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
    // 🔍 BÚSQUEDAS Y FILTROS
    // ===============================================================

    @GetMapping("/search")
    @PreAuthorize("hasAnyAuthority('VER_PERSONAL', 'ADMIN_TOTAL')")
    public ResponseEntity<List<PersonalResponse>> searchPersonalCnt(@RequestParam String query) {
        log.info("🔎 Buscando personal CNT con query '{}'", query);
        return ResponseEntity.ok(personalCntService.searchPersonalCnt(query));
    }

    @GetMapping("/area/{idArea}")
    @PreAuthorize("hasAnyAuthority('VER_PERSONAL', 'ADMIN_TOTAL')")
    public ResponseEntity<List<PersonalResponse>> getPersonalCntByArea(@PathVariable Long idArea) {
        log.info("🏢 Obteniendo personal CNT por área {}", idArea);
        return ResponseEntity.ok(personalCntService.getPersonalCntByArea(idArea));
    }

    @GetMapping("/regimen-laboral/{idRegimenLaboral}")
    @PreAuthorize("hasAnyAuthority('VER_PERSONAL', 'ADMIN_TOTAL')")
    public ResponseEntity<List<PersonalResponse>> getPersonalCntByRegimenLaboral(@PathVariable Long idRegimenLaboral) {
        log.info("📋 Obteniendo personal CNT por régimen laboral {}", idRegimenLaboral);
        return ResponseEntity.ok(personalCntService.getPersonalCntByRegimenLaboral(idRegimenLaboral));
    }

    @GetMapping("/usuario/{idUsuario}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PersonalResponse> getPersonalCntByUsuario(@PathVariable Long idUsuario) {
        log.info("👤 Obteniendo personal CNT por usuario {}", idUsuario);
        return ResponseEntity.ok(personalCntService.getPersonalCntByUsuario(idUsuario));
    }

    @GetMapping("/activo")
    @PreAuthorize("hasAnyAuthority('VER_PERSONAL', 'ADMIN_TOTAL')")
    public ResponseEntity<List<PersonalResponse>> getPersonalCntActivo() {
        log.info("🟢 Obteniendo personal CNT activo");
        return ResponseEntity.ok(personalCntService.getPersonalCntActivo());
    }

    @GetMapping("/inactivo")
    @PreAuthorize("hasAnyAuthority('VER_PERSONAL', 'ADMIN_TOTAL')")
    public ResponseEntity<List<PersonalResponse>> getPersonalCntInactivo() {
        log.info("🔴 Obteniendo personal CNT inactivo");
        return ResponseEntity.ok(personalCntService.getPersonalCntInactivo());
    }

    // ===============================================================
    // 🖼️ MANEJO DE FOTOS
    // ===============================================================

    @PostMapping("/{id}/foto")
    @PreAuthorize("hasAnyAuthority('EDITAR_PERSONAL', 'ADMIN_TOTAL')")
    public ResponseEntity<PersonalResponse> uploadFoto(@PathVariable Long id,
                                                       @RequestParam("file") MultipartFile file) {
        log.info("🖼️ Subiendo foto para personal CNT con ID {}", id);
        return ResponseEntity.ok(personalCntService.uploadFoto(id, file));
    }

    @DeleteMapping("/{id}/foto")
    @PreAuthorize("hasAnyAuthority('EDITAR_PERSONAL', 'ADMIN_TOTAL')")
    public ResponseEntity<Void> deleteFoto(@PathVariable Long id) {
        log.info("🗑️ Eliminando foto de personal CNT con ID {}", id);
        personalCntService.deleteFoto(id);
        return ResponseEntity.noContent().build();
    }

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

        } catch (MalformedURLException e) {
            log.error("❌ Error en URL de foto: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        } catch (IOException e) {
            log.error("⚠️ Error al leer la foto: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // ===============================================================
    // 🔒 MÉTODOS PRIVADOS AUXILIARES
    // ===============================================================
    private void setTipoCenate(PersonalRequest request) {
        request.setTipoPersonal("CENATE");
    }
}