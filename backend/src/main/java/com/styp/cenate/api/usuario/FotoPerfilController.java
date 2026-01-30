package com.styp.cenate.api.usuario;

import com.styp.cenate.exception.CustomException;
import com.styp.cenate.model.Usuario;
import com.styp.cenate.service.usuario.UsuarioService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

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
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    private static final String[] ALLOWED_TYPES = {"image/jpeg", "image/png"};

    private final UsuarioService usuarioService;

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
     * 📤 Subir foto de perfil del usuario
     * POST /api/fotos-perfil/upload/{idUser}
     */
    @PostMapping("/upload/{idUser}")
    public ResponseEntity<Map<String, Object>> uploadFotoPerfil(
            @PathVariable Long idUser,
            @RequestParam("foto") MultipartFile file) {
        try {
            log.info("📤 Iniciando upload de foto para usuario: {}", idUser);

            // 1. Validar archivo
            validarArchivo(file);

            // 2. Generar nombre único y seguro
            String extension = obtenerExtension(file.getOriginalFilename());
            String nombreBase = sanitizarNombreArchivo(file.getOriginalFilename());
            String nombreArchivo = "user_" + idUser + "_" + UUID.randomUUID().toString().substring(0, 8) + "." + extension;
            log.info("📝 Nombre original: {} -> Nombre sanitizado: {}", file.getOriginalFilename(), nombreArchivo);

            // 3. Crear directorio si no existe
            Path uploadPath = Paths.get(UPLOAD_DIR);
            Files.createDirectories(uploadPath);

            // 4. Guardar archivo
            Path filePath = uploadPath.resolve(nombreArchivo);
            Files.write(filePath, file.getBytes());
            log.info("✅ Foto guardada en: {}", filePath);

            // 5. Actualizar usuario con nueva foto
            usuarioService.actualizarFotoPerfil(idUser, nombreArchivo);

            // 6. Construir respuesta
            Map<String, Object> response = new HashMap<>();
            response.put("fotoUrl", "/api/fotos-perfil/" + nombreArchivo);
            response.put("nombreArchivo", nombreArchivo);
            response.put("mensaje", "Foto actualizada correctamente");

            log.info("✅ Upload completado para usuario: {}", idUser);
            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            log.warn("⚠️ Validación fallida: {}", e.getMessage());
            return ResponseEntity.badRequest().body(
                    Map.of("error", e.getMessage())
            );
        } catch (CustomException e) {
            log.warn("⚠️ Error de aplicación: {}", e.getMessage());
            return ResponseEntity.badRequest().body(
                    Map.of("error", e.getMessage())
            );
        } catch (IOException e) {
            log.error("❌ Error al guardar archivo: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    Map.of("error", "Error al guardar archivo")
            );
        }
    }

    /**
     * ✅ Validar archivo de foto
     */
    private void validarArchivo(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("El archivo es requerido");
        }

        // Validar tamaño
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("El archivo no debe superar 5MB");
        }

        // Validar tipo
        String contentType = file.getContentType();
        boolean tipoValido = false;
        for (String tipo : ALLOWED_TYPES) {
            if (tipo.equals(contentType)) {
                tipoValido = true;
                break;
            }
        }

        if (!tipoValido) {
            throw new IllegalArgumentException("Solo se permiten archivos JPEG o PNG");
        }
    }

    /**
     * 📝 Obtener extensión del archivo
     */
    private String obtenerExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return "jpg";
        }
        String ext = filename.substring(filename.lastIndexOf(".") + 1).toLowerCase();
        // Solo permitir jpg, jpeg, png
        if ("jpeg".equals(ext)) {
            return "jpg";
        }
        return ("jpg".equals(ext) || "png".equals(ext)) ? ext : "jpg";
    }

    /**
     * 🔤 Sanitizar nombre de archivo (eliminar espacios y caracteres especiales)
     */
    private String sanitizarNombreArchivo(String filename) {
        if (filename == null || filename.isEmpty()) {
            return "foto.jpg";
        }
        // Obtener solo el nombre base sin extensión
        String nameWithoutExt = filename.contains(".")
                ? filename.substring(0, filename.lastIndexOf("."))
                : filename;

        // Remover caracteres especiales, espacios, etc
        nameWithoutExt = nameWithoutExt
                .replaceAll("[^a-zA-Z0-9_-]", "_") // Reemplazar caracteres especiales
                .replaceAll("_+", "_") // Consolidar underscores múltiples
                .replaceAll("^_|_$", ""); // Remover underscores al inicio/fin

        // Si está vacío, usar valor por defecto
        if (nameWithoutExt.isEmpty()) {
            nameWithoutExt = "foto";
        }

        return nameWithoutExt;
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
