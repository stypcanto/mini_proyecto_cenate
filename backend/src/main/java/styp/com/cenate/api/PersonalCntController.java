package styp.com.cenate.api;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import styp.com.cenate.dto.PersonalCntRequest;
import styp.com.cenate.dto.PersonalCntResponse;
import styp.com.cenate.service.PersonalCntService;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/personal")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173", "http://10.0.89.13:3000", "http://10.0.89.13:5173"})
public class PersonalCntController {
    
    private final PersonalCntService personalCntService;
    
    @Value("${app.upload.dir:${user.home}/cenate-uploads/personal}")
    private String uploadDir;
    
    /**
     * Obtener todo el personal CENATE
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'USER')")
    public ResponseEntity<List<PersonalCntResponse>> getAllPersonal() {
        log.info("Consultando todo el personal");
        List<PersonalCntResponse> personal = personalCntService.getAllPersonal();
        return ResponseEntity.ok(personal);
    }
    
    /**
     * Obtener personal por ID
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'USER')")
    public ResponseEntity<PersonalCntResponse> getPersonalById(@PathVariable Long id) {
        log.info("Consultando personal por ID: {}", id);
        PersonalCntResponse personal = personalCntService.getPersonalById(id);
        return ResponseEntity.ok(personal);
    }
    
    /**
     * Crear nuevo personal
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
    public ResponseEntity<PersonalCntResponse> createPersonal(@Valid @RequestBody PersonalCntRequest request) {
        log.info("Creando nuevo personal");
        PersonalCntResponse personal = personalCntService.createPersonal(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(personal);
    }
    
    /**
     * Actualizar personal
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
    public ResponseEntity<PersonalCntResponse> updatePersonal(
            @PathVariable Long id, 
            @Valid @RequestBody PersonalCntRequest request) {
        log.info("Actualizando personal con ID: {}", id);
        PersonalCntResponse personal = personalCntService.updatePersonal(id, request);
        return ResponseEntity.ok(personal);
    }
    
    /**
     * Eliminar personal
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SUPERADMIN')")
    public ResponseEntity<Map<String, String>> deletePersonal(@PathVariable Long id) {
        log.info("Eliminando personal con ID: {}", id);
        personalCntService.deletePersonal(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Personal eliminado exitosamente");
        return ResponseEntity.ok(response);
    }
    
    /**
     * Buscar personal
     */
    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'USER')")
    public ResponseEntity<List<PersonalCntResponse>> searchPersonal(@RequestParam String query) {
        log.info("Buscando personal: {}", query);
        List<PersonalCntResponse> personal = personalCntService.searchPersonal(query);
        return ResponseEntity.ok(personal);
    }
    
    /**
     * ✅ NUEVO: Subir foto del personal
     */
    @PostMapping("/{id}/foto")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
    public ResponseEntity<PersonalCntResponse> uploadFoto(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {
        log.info("Subiendo foto para personal ID: {}", id);
        
        try {
            PersonalCntResponse personal = personalCntService.uploadFoto(id, file);
            return ResponseEntity.ok(personal);
        } catch (IOException e) {
            log.error("Error al subir foto: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * ✅ NUEVO: Obtener foto del personal
     */
    @GetMapping("/{id}/foto")
    public ResponseEntity<Resource> getFoto(@PathVariable Long id) {
        try {
            PersonalCntResponse personal = personalCntService.getPersonalById(id);
            
            if (personal.getFotoPers() == null) {
                return ResponseEntity.notFound().build();
            }
            
            Path filePath = Paths.get(uploadDir).resolve(personal.getFotoPers());
            Resource resource = new UrlResource(filePath.toUri());
            
            if (resource.exists() && resource.isReadable()) {
                String contentType = Files.probeContentType(filePath);
                if (contentType == null) {
                    contentType = "application/octet-stream";
                }
                
                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            log.error("Error al obtener foto: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * ✅ NUEVO: Eliminar foto del personal
     */
    @DeleteMapping("/{id}/foto")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
    public ResponseEntity<Map<String, String>> deleteFoto(@PathVariable Long id) {
        log.info("Eliminando foto para personal ID: {}", id);
        
        try {
            personalCntService.deleteFoto(id);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Foto eliminada exitosamente");
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            log.error("Error al eliminar foto: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
