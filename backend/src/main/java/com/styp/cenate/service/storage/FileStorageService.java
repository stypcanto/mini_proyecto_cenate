package com.styp.cenate.service.storage;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.nio.file.attribute.PosixFilePermission;
import java.nio.file.attribute.PosixFilePermissions;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Random;
import java.util.Set;

/**
 * Servicio de almacenamiento de archivos en filesystem
 *
 * Características:
 * - Guarda archivos ECG (JPEG/PNG) en /opt/cenate/teleekgs/
 * - Organiza archivos por fecha y IPRESS: YYYY/MM/DD/IPRESS_XXX/
 * - Validación de integridad con SHA256
 * - Protección contra path traversal
 * - Validación de magic bytes
 * - Configuración de permisos POSIX (640)
 *
 * @author Styp Canto Rondón
 * @version 1.0.0
 * @since 2026-01-13
 */
@Service
@Slf4j
public class FileStorageService {

    @Value("${app.teleekgs.storage.base-path:/opt/cenate/teleekgs}")
    private String basePath;

    /**
     * Guarda archivo en filesystem con estructura organizada
     *
     * Estructura: /opt/cenate/teleekgs/YYYY/MM/DD/IPRESS_XXX/DNI_YYYYMMDD_HHMMSS_XXXX.ext
     *
     * @param file MultipartFile a guardar
     * @param dni DNI del paciente (8 dígitos)
     * @param codigoIpress Código de la IPRESS
     * @return Ruta completa del archivo guardado
     * @throws IOException si hay error al guardar
     * @throws SecurityException si hay intento de path traversal
     */
    public String guardarArchivo(MultipartFile file, String dni, String codigoIpress)
            throws IOException {

        log.info("📤 Guardando archivo: {} (DNI: {}, IPRESS: {})",
            file.getOriginalFilename(), dni, codigoIpress);

        // Validar archivo antes de guardar
        validarArchivo(file);

        // Generar estructura de directorios: YYYY/MM/DD/IPRESS_XXX/
        LocalDateTime ahora = LocalDateTime.now();
        String subPath = String.format("%d/%02d/%02d/IPRESS_%s",
            ahora.getYear(),
            ahora.getMonthValue(),
            ahora.getDayOfMonth(),
            codigoIpress
        );

        Path directorio = Paths.get(basePath, subPath);
        Files.createDirectories(directorio);

        // Generar nombre único: DNI_YYYYMMDD_HHMMSS_XXXX.ext
        String extension = obtenerExtension(file.getOriginalFilename());
        String timestamp = ahora.format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
        String unique = generarCodigoUnico(4);
        String nombreArchivo = String.format("%s_%s_%s.%s",
            dni, timestamp, unique, extension);

        // Validar path traversal
        Path archivoPath = directorio.resolve(nombreArchivo);
        if (!archivoPath.normalize().startsWith(Paths.get(basePath).normalize())) {
            throw new SecurityException("❌ Intento de path traversal detectado");
        }

        // Guardar archivo
        try {
            Files.copy(file.getInputStream(), archivoPath, StandardCopyOption.REPLACE_EXISTING);
            log.info("✅ Archivo guardado en: {}", archivoPath);
        } catch (IOException e) {
            log.error("❌ Error guardando archivo: {}", archivoPath, e);
            throw new IOException("Error al guardar archivo: " + e.getMessage(), e);
        }

        // Configurar permisos (chmod 640: rw-r-----)
        try {
            configurarPermisos(archivoPath);
        } catch (UnsupportedOperationException e) {
            log.warn("⚠️ No se pudieron configurar permisos POSIX (probablemente Windows)");
        }

        return archivoPath.toString();
    }

    /**
     * Lee archivo desde filesystem
     *
     * @param rutaCompleta Ruta completa al archivo
     * @return Contenido del archivo en bytes
     * @throws IOException si no existe el archivo o hay error al leer
     * @throws SecurityException si hay intento de path traversal
     */
    public byte[] leerArchivo(String rutaCompleta) throws IOException {

        log.info("⬇️ Leyendo archivo: {}", rutaCompleta);

        Path path = Paths.get(rutaCompleta);

        // Validar que existe
        if (!Files.exists(path)) {
            log.error("❌ Archivo no encontrado: {}", rutaCompleta);
            throw new IOException("Archivo no encontrado: " + rutaCompleta);
        }

        // Validar path traversal
        if (!path.normalize().startsWith(Paths.get(basePath).normalize())) {
            log.error("❌ Intento de acceso no autorizado a: {}", rutaCompleta);
            throw new SecurityException("Intento de acceso no autorizado");
        }

        try {
            byte[] contenido = Files.readAllBytes(path);
            log.info("✅ Archivo leído exitosamente ({} bytes)", contenido.length);
            return contenido;
        } catch (IOException e) {
            log.error("❌ Error leyendo archivo: {}", rutaCompleta, e);
            throw new IOException("Error al leer archivo: " + e.getMessage(), e);
        }
    }

    /**
     * Elimina archivo físicamente del filesystem
     *
     * @param rutaCompleta Ruta completa al archivo
     * @return true si fue eliminado, false si no existía
     */
    public boolean eliminarArchivo(String rutaCompleta) {

        try {
            Path path = Paths.get(rutaCompleta);

            // Validaciones de seguridad
            if (!path.normalize().startsWith(Paths.get(basePath).normalize())) {
                log.error("❌ Intento de eliminar archivo fuera de base path: {}", rutaCompleta);
                return false;
            }

            boolean eliminado = Files.deleteIfExists(path);

            if (eliminado) {
                log.info("🗑️ Archivo eliminado: {}", rutaCompleta);
            } else {
                log.warn("⚠️ Archivo no existía: {}", rutaCompleta);
            }

            return eliminado;

        } catch (IOException e) {
            log.error("❌ Error eliminando archivo: {}", rutaCompleta, e);
            return false;
        }
    }

    /**
     * Mueve archivo a carpeta de archivo (antes de eliminar)
     * Útil para mantener los últimos 3 meses de archivos antes de purgarlos
     *
     * @param rutaCompleta Ruta completa al archivo
     * @return Nueva ruta en el directorio archive/
     * @throws IOException si hay error al mover
     */
    public String archivarArchivo(String rutaCompleta) throws IOException {

        try {
            Path origen = Paths.get(rutaCompleta);

            // Validar path traversal
            if (!origen.normalize().startsWith(Paths.get(basePath).normalize())) {
                throw new SecurityException("Intento de path traversal detectado");
            }

            // Crear carpeta archive si no existe
            Path directorioArchive = Paths.get(basePath, "archive",
                LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy/MM")));
            Files.createDirectories(directorioArchive);

            // Mover archivo
            Path destino = directorioArchive.resolve(origen.getFileName());
            Files.move(origen, destino, StandardCopyOption.REPLACE_EXISTING);

            log.info("📦 Archivo archivado: {} → {}", origen, destino);

            return destino.toString();

        } catch (IOException e) {
            log.error("❌ Error archivando archivo: {}", rutaCompleta, e);
            throw new IOException("Error al archivar archivo: " + e.getMessage(), e);
        }
    }

    /**
     * Calcula SHA256 de un archivo
     *
     * @param file MultipartFile
     * @return Hash SHA256 en formato hexadecimal (64 caracteres)
     * @throws IOException si hay error al leer el archivo
     */
    public String calcularSHA256(MultipartFile file) throws IOException {

        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(file.getBytes());

            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }

            String sha256 = hexString.toString();
            log.debug("✅ SHA256 calculado: {}", sha256);

            return sha256;

        } catch (Exception e) {
            log.error("❌ Error calculando SHA256", e);
            throw new IOException("Error calculando SHA256: " + e.getMessage(), e);
        }
    }

    /**
     * Verifica integridad de archivo guardado
     *
     * @param rutaCompleta Ruta completa al archivo
     * @param sha256Esperado Hash SHA256 esperado (64 hex chars)
     * @return true si la integridad es correcta, false si está comprometida
     */
    public boolean verificarIntegridad(String rutaCompleta, String sha256Esperado) {

        try {
            byte[] contenido = Files.readAllBytes(Paths.get(rutaCompleta));
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(contenido);

            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }

            String sha256Actual = hexString.toString();
            boolean valido = sha256Actual.equals(sha256Esperado);

            if (!valido) {
                log.warn("⚠️ Integridad comprometida: {}", rutaCompleta);
                log.warn("   Esperado: {}", sha256Esperado);
                log.warn("   Actual:   {}", sha256Actual);
            } else {
                log.debug("✅ Integridad verificada: {}", rutaCompleta);
            }

            return valido;

        } catch (Exception e) {
            log.error("❌ Error verificando integridad: {}", rutaCompleta, e);
            return false;
        }
    }

    // ============================================================
    // MÉTODOS PRIVADOS
    // ============================================================

    /**
     * Valida el archivo antes de guardar
     *
     * Validaciones:
     * - Extensión: solo .jpg, .jpeg, .png
     * - MIME type: image/jpeg, image/png
     * - Tamaño: máximo 5MB
     * - Magic bytes: JPEG (FF D8 FF) o PNG (89 50 4E 47)
     *
     * @param file Archivo a validar
     * @throws IOException si alguna validación falla
     */
    private void validarArchivo(MultipartFile file) throws IOException {

        if (file == null || file.isEmpty()) {
            throw new IOException("El archivo está vacío");
        }

        // 1. Verificar extensión
        String nombreArchivo = file.getOriginalFilename();
        if (nombreArchivo == null || !nombreArchivo.matches("(?i).*\\.(jpg|jpeg|png)$")) {
            throw new IOException("Solo se permiten archivos JPG y PNG");
        }

        // 2. Verificar MIME type
        String mimeType = file.getContentType();
        if (!"image/jpeg".equals(mimeType) && !"image/png".equals(mimeType)) {
            log.warn("⚠️ MIME type sospechoso: {} (archivo: {})", mimeType, nombreArchivo);
            throw new IOException("Tipo de archivo inválido: " + mimeType);
        }

        // 3. Verificar tamaño (5MB)
        if (file.getSize() > 5242880) {
            throw new IOException("El archivo excede el tamaño máximo (5MB)");
        }

        // 4. Verificar magic bytes (primeros bytes del archivo)
        try {
            byte[] bytes = file.getBytes();
            if (bytes.length < 4) {
                throw new IOException("Archivo corrupto (muy pequeño)");
            }

            // JPEG: FF D8 FF
            // PNG: 89 50 4E 47
            boolean esJPEG = (bytes[0] == (byte) 0xFF && bytes[1] == (byte) 0xD8);
            boolean esPNG = (bytes[0] == (byte) 0x89 && bytes[1] == 0x50);

            if (!esJPEG && !esPNG) {
                log.warn("⚠️ Magic bytes inválidos para archivo: {}", nombreArchivo);
                throw new IOException("El archivo no es una imagen válida (magic bytes inválidos)");
            }

            log.debug("✅ Archivo validado: {} (tamaño: {} bytes)", nombreArchivo, bytes.length);

        } catch (IOException e) {
            throw new IOException("Error validando archivo: " + e.getMessage(), e);
        }
    }

    /**
     * Obtiene extensión del archivo
     *
     * @param nombreArchivo Nombre del archivo
     * @return Extensión en minúsculas, sin punto
     */
    private String obtenerExtension(String nombreArchivo) {

        if (nombreArchivo == null || !nombreArchivo.contains(".")) {
            return "jpg"; // Default
        }

        String ext = nombreArchivo.substring(nombreArchivo.lastIndexOf(".") + 1).toLowerCase();
        log.debug("Extensión detectada: {}", ext);

        return ext;
    }

    /**
     * Genera código único aleatorio (hex)
     *
     * @param longitud Cantidad de caracteres
     * @return Código aleatorio en hexadecimal
     */
    private String generarCodigoUnico(int longitud) {

        String caracteres = "0123456789abcdef";
        Random random = new Random();
        StringBuilder codigo = new StringBuilder(longitud);

        for (int i = 0; i < longitud; i++) {
            codigo.append(caracteres.charAt(random.nextInt(caracteres.length())));
        }

        return codigo.toString();
    }

    /**
     * Configura permisos POSIX en archivo
     *
     * chmod 640: rw-r----- (owner=rw, group=r, others=none)
     *
     * @param archivo Path al archivo
     * @throws UnsupportedOperationException si el sistema no soporta POSIX
     */
    private void configurarPermisos(Path archivo) throws UnsupportedOperationException {

        try {
            // chmod 640 (rw-r-----)
            Set<PosixFilePermission> permisos = PosixFilePermissions.fromString("rw-r-----");
            Files.setPosixFilePermissions(archivo, permisos);

            log.debug("✅ Permisos configurados (640): {}", archivo.getFileName());

        } catch (UnsupportedOperationException e) {
            log.warn("⚠️ POSIX permissions no soportados en este sistema");
            throw e;
        } catch (IOException e) {
            log.error("❌ Error configurando permisos: {}", archivo, e);
        }
    }
}
