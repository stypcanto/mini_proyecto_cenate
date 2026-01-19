package com.styp.cenate.api;

import com.styp.cenate.dto.ApiResponse;
import com.styp.cenate.dto.teleekgs.*;
import com.styp.cenate.exception.ResourceNotFoundException;
import com.styp.cenate.exception.ValidationException;
import com.styp.cenate.security.mbac.CheckMBACPermission;
import com.styp.cenate.service.teleekgs.TeleECGService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import jakarta.annotation.PostConstruct;

/**
 * REST Controller para gestión de TeleEKG
 *
 * Versión 1.0.0 - Endpoints simplificados para compilación
 * TODO: Completar implementación según especificaciones
 *
 * @author Styp Canto Rondón
 * @version 1.0.0
 * @since 2026-01-13
 */
@RestController
@RequestMapping("/api/teleekgs")
@Tag(name = "TeleEKG", description = "Gestión de Electrocardiogramas")
@Slf4j
public class TeleECGController {

    @Autowired
    private TeleECGService teleECGService;

    @PostConstruct
    public void init() {
        log.info("✅ TeleECGController inicializado exitosamente");
        if (teleECGService != null) {
            log.info("✅ TeleECGService inyectado correctamente");
        } else {
            log.error("❌ ERROR: TeleECGService no fue inyectado");
        }
    }

    /**
     * Subir nueva imagen ECG
     */
    @PostMapping("/upload")
    @CheckMBACPermission(pagina = "/teleekgs/upload", accion = "crear")
    @Operation(summary = "Subir imagen ECG")
    public ResponseEntity<ApiResponse<TeleECGImagenDTO>> subirImagenECG(
            @RequestParam("numDocPaciente") String numDocPaciente,
            @RequestParam("nombresPaciente") String nombresPaciente,
            @RequestParam("apellidosPaciente") String apellidosPaciente,
            @RequestParam("archivo") MultipartFile archivo,
            HttpServletRequest request) {

        log.info("📤 Upload ECG - DNI: {}", numDocPaciente);

        try {
            SubirImagenECGDTO dto = new SubirImagenECGDTO();
            dto.setNumDocPaciente(numDocPaciente);
            dto.setNombresPaciente(nombresPaciente);
            dto.setApellidosPaciente(apellidosPaciente);

            Long idUsuario = getUsuarioActual();
            String ipCliente = request.getRemoteAddr();
            String navegador = request.getHeader("User-Agent");

            TeleECGImagenDTO resultado = teleECGService.subirImagenECG(
                dto, 1L, idUsuario, ipCliente, navegador
            );

            return ResponseEntity.ok(new ApiResponse<>(
                true,
                "Imagen subida exitosamente",
                "200",
                resultado
            ));
        } catch (Exception e) {
            log.error("❌ Error en upload", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ApiResponse<>(false, e.getMessage(), "400", null));
        }
    }

    /**
     * Listar imágenes con filtros
     */
    @GetMapping("/listar")
    @CheckMBACPermission(pagina = "/teleekgs/listar", accion = "ver")
    @Operation(summary = "Listar imágenes ECG")
    public ResponseEntity<ApiResponse<Page<TeleECGImagenDTO>>> listarImagenes(
            @Parameter(description = "Número de documento") @RequestParam(required = false) String numDoc,
            @Parameter(description = "Estado") @RequestParam(required = false) String estado,
            @Parameter(description = "Página") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Tamaño") @RequestParam(defaultValue = "20") int size) {

        log.info("📋 Listando imágenes - DNI: {}, Estado: {}", numDoc, estado);

        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<TeleECGImagenDTO> resultado = teleECGService.listarImagenes(
                numDoc, estado, null, null, null, pageable
            );

            return ResponseEntity.ok(new ApiResponse<>(
                true,
                "Imágenes listadas",
                "200",
                resultado
            ));
        } catch (Exception e) {
            log.error("❌ Error en listado", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ApiResponse<>(false, e.getMessage(), "400", null));
        }
    }

    /**
     * Obtener detalles de imagen
     */
    @GetMapping("/{id}/detalles")
    @CheckMBACPermission(pagina = "/teleekgs/listar", accion = "ver")
    @Operation(summary = "Obtener detalles de imagen")
    public ResponseEntity<ApiResponse<TeleECGImagenDTO>> obtenerDetalles(
            @PathVariable Long id,
            HttpServletRequest request) {

        log.info("🔍 Obteniendo detalles - ID: {}", id);

        try {
            Long idUsuario = getUsuarioActual();
            TeleECGImagenDTO resultado = teleECGService.obtenerDetallesImagen(
                id, idUsuario, request.getRemoteAddr()
            );

            return ResponseEntity.ok(new ApiResponse<>(
                true,
                "Detalles obtenidos",
                "200",
                resultado
            ));
        } catch (Exception e) {
            log.error("❌ Error obteniendo detalles", e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ApiResponse<>(false, "No encontrada", "404", null));
        }
    }

    /**
     * Descargar imagen
     */
    @GetMapping("/{id}/descargar")
    @CheckMBACPermission(pagina = "/teleekgs/listar", accion = "ver")
    @Operation(summary = "Descargar imagen ECG")
    public ResponseEntity<byte[]> descargarImagen(
            @PathVariable Long id,
            HttpServletRequest request) {

        log.info("⬇️ Descargando - ID: {}", id);

        try {
            Long idUsuario = getUsuarioActual();
            byte[] contenido = teleECGService.descargarImagen(
                id, idUsuario, request.getRemoteAddr()
            );

            // Obtener metadata para headers correctos
            TeleECGImagenDTO imagen = teleECGService.obtenerDetallesImagen(
                id, idUsuario, request.getRemoteAddr()
            );

            return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(imagen.getMimeType() != null ? imagen.getMimeType() : "image/jpeg"))
                .header("Content-Disposition",
                    "attachment; filename=\"" + imagen.getNombreArchivo() + "\"")
                .header("Content-Length", String.valueOf(imagen.getSizeBytes()))
                .body(contenido);
        } catch (Exception e) {
            log.error("❌ Error descargando", e);
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Procesar imagen
     */
    @PutMapping("/{id}/procesar")
    @CheckMBACPermission(pagina = "/teleekgs/listar", accion = "editar")
    @Operation(summary = "Procesar imagen ECG")
    public ResponseEntity<ApiResponse<TeleECGImagenDTO>> procesarImagen(
            @PathVariable Long id,
            @Valid @RequestBody ProcesarImagenECGDTO dto,
            HttpServletRequest request) {

        log.info("⚙️ Procesando - ID: {} Acción: {}", id, dto.getAccion());

        try {
            Long idUsuario = getUsuarioActual();
            TeleECGImagenDTO resultado = teleECGService.procesarImagen(
                id, dto, idUsuario, request.getRemoteAddr()
            );

            return ResponseEntity.ok(new ApiResponse<>(
                true,
                "Imagen procesada",
                "200",
                resultado
            ));
        } catch (Exception e) {
            log.error("❌ Error procesando", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ApiResponse<>(false, e.getMessage(), "400", null));
        }
    }

    /**
     * Obtener auditoría
     */
    @GetMapping("/{id}/auditoria")
    @CheckMBACPermission(pagina = "/teleekgs/auditoria", accion = "ver")
    @Operation(summary = "Obtener auditoría de imagen")
    public ResponseEntity<ApiResponse<Page<TeleECGAuditoriaDTO>>> obtenerAuditoria(
            @PathVariable Long id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        log.info("📜 Auditoría - ID: {}", id);

        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<TeleECGAuditoriaDTO> resultado = teleECGService.obtenerAuditoria(id, pageable);

            return ResponseEntity.ok(new ApiResponse<>(
                true,
                "Auditoría obtenida",
                "200",
                resultado
            ));
        } catch (Exception e) {
            log.error("❌ Error obteniendo auditoría", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ApiResponse<>(false, e.getMessage(), "400", null));
        }
    }

    /**
     * Obtener estadísticas
     */
    @GetMapping("/estadisticas")
    @CheckMBACPermission(pagina = "/teleekgs/dashboard", accion = "ver")
    @Operation(summary = "Obtener estadísticas")
    public ResponseEntity<ApiResponse<TeleECGEstadisticasDTO>> obtenerEstadisticas() {

        log.info("📊 Generando estadísticas");

        try {
            TeleECGEstadisticasDTO resultado = teleECGService.obtenerEstadisticas();

            return ResponseEntity.ok(new ApiResponse<>(
                true,
                "Estadísticas generadas",
                "200",
                resultado
            ));
        } catch (Exception e) {
            log.error("❌ Error generando estadísticas", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ApiResponse<>(false, e.getMessage(), "400", null));
        }
    }

    /**
     * Obtener imágenes próximas a vencer
     */
    @GetMapping("/proximas-vencer")
    @CheckMBACPermission(pagina = "/teleekgs/dashboard", accion = "ver")
    @Operation(summary = "Imágenes próximas a vencer")
    public ResponseEntity<ApiResponse<?>> obtenerProximasVencer() {

        log.info("⚠️ Próximas a vencer");

        try {
            var resultado = teleECGService.obtenerProximasVencer();

            return ResponseEntity.ok(new ApiResponse<>(
                true,
                "Próximas a vencer",
                "200",
                resultado
            ));
        } catch (Exception e) {
            log.error("❌ Error", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ApiResponse<>(false, e.getMessage(), "400", null));
        }
    }

    /**
     * Obtener ID de usuario actual
     */
    private Long getUsuarioActual() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return 1L; // TODO: Extraer del token JWT
    }
}
