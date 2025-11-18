package com.styp.cenate.api.usuario;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * 📸 Controlador para servir fotos de perfil de usuarios
 * Permite acceder a las imágenes almacenadas en el sistema de archivos
 */
@Slf4j
@RestController
@RequestMapping("/api/fotos-perfil")
@RequiredArgsConstructor
public class FotoPerfilController {

    // Ruta donde se almacenan las fotos (ajustar según tu configuración)
    private static final String UPLOAD_DIR = "/app/uploads/fotos/";

    /**
     * 🖼️ Servir foto de perfil por nombre de archivo
     * GET /api/personal/foto/{filename}
     */
    @GetMapping("/{filename:.+}")
    public ResponseEntity<Resource> servirFoto(@PathVariable String filename) {
        try {
            log.info("📸 Solicitando foto: {}", filename);
            
            Path filePath = Paths.get(UPLOAD_DIR).resolve(filename).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            
            if (!resource.exists()) {
                log.warn("⚠️ Foto no encontrada: {}", filename);
                // Devolver imagen por defecto
                return servirFotoPorDefecto();
            }
            
            // Determinar el tipo de contenido
            String contentType = Files.probeContentType(filePath);
            if (contentType == null) {
                contentType = "application/octet-stream";
            }
            
            log.info("✅ Foto encontrada: {} (tipo: {})", filename, contentType);
            
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                    .body(resource);
                    
        } catch (MalformedURLException e) {
            log.error("❌ URL malformada para foto: {}", filename, e);
            return ResponseEntity.badRequest().build();
        } catch (IOException e) {
            log.error("❌ Error al leer foto: {}", filename, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 🖼️ Servir imagen por defecto
     */
    private ResponseEntity<Resource> servirFotoPorDefecto() {
        try {
            // Puedes crear una imagen por defecto en resources/static/images/
            Path defaultPath = Paths.get("src/main/resources/static/images/default-profile.png").normalize();
            Resource resource = new UrlResource(defaultPath.toUri());
            
            if (resource.exists()) {
                return ResponseEntity.ok()
                        .contentType(MediaType.IMAGE_PNG)
                        .body(resource);
            }
            
            // Si no existe la imagen por defecto, devolver 404
            return ResponseEntity.notFound().build();
            
        } catch (MalformedURLException e) {
            log.error("❌ Error al cargar imagen por defecto", e);
            return ResponseEntity.notFound().build();
        }
    }
}
