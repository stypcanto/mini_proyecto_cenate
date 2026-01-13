package com.styp.cenate.api;

import com.styp.cenate.dto.ApiResponse;
import com.styp.cenate.dto.teleekgs.*;
import com.styp.cenate.security.CheckMBACPermission;
import com.styp.cenate.service.teleekgs.TeleECGService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Controlador REST para el módulo TeleEKG
 *
 * Endpoints:
 * - POST   /api/teleekgs/upload           : Cargar ECG desde IPRESS
 * - GET    /api/teleekgs/listar           : Listar imágenes (paginado)
 * - GET    /api/teleekgs/{id}/detalles   : Detalles de una imagen
 * - GET    /api/teleekgs/{id}/descargar  : Descargar archivo JPEG/PNG
 * - GET    /api/teleekgs/{id}/preview    : Preview en navegador
 * - PUT    /api/teleekgs/{id}/procesar   : Aceptar/Rechazar/Vincular imagen
 * - GET    /api/teleekgs/{id}/auditoria  : Historial de accesos
 * - GET    /api/teleekgs/estadisticas    : Estadísticas del módulo
 * - GET    /api/teleekgs/proximas-vencer : Imágenes próximas a vencer
 *
 * Seguridad:
 * - JWT requerido en todos los endpoints
 * - MBAC control por rol (INSTITUCION_EX, MEDICO, COORDINADOR, ADMIN)
 * - Auditoría de todas las acciones
 *
 * @author Styp Canto Rondón
 * @version 1.0.0
 * @since 2026-01-13
 */
@Slf4j
@RestController
@RequestMapping("/api/teleekgs")
@Tag(name = "TeleEKG", description = "Gestión de Electrocardiogramas")
@SecurityRequirement(name = "Bearer Authentication")
public class TeleECGController {

    @Autowired
    private TeleECGService teleECGService;

    /**
     * Extrae el ID del usuario actual del token JWT
     */
    private Long getIdUsuarioActual() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof org.springframework.security.core.userdetails.User) {
            // En un caso real, extraerías el ID del JWT
            return 1L; // Placeholder
        }
        return null;
    }

    /**
     * Obtiene la IP del cliente
     */
    private String obtenerIPCliente(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0];
        }
        return request.getRemoteAddr();
    }

    /**
     * Obtiene el User-Agent del navegador
     */
    private String obtenerUserAgent(HttpServletRequest request) {
        return request.getHeader("User-Agent");
    }

    // ============================================================
    // 1. CARGAR IMAGEN ECG
    // ============================================================

    /**
     * POST /api/teleekgs/upload
     * Carga un electrocardiograma desde IPRESS externa
     *
     * @param dto Contiene imagen, DNI, nombres, apellidos
     * @param request Para extraer IP y navegador
     * @return DTO con detalles de la imagen guardada
     */
    @PostMapping("/upload")
    @CheckMBACPermission(pagina = "/teleekgs/upload", accion = "crear")
    @Operation(
        summary = "Cargar electrocardiograma",
        description = "Carga un archivo JPEG/PNG de ECG. Máximo 5MB. Se crea asegurado automáticamente si DNI no existe.",
        tags = {"Upload"}
    )
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "ECG cargado exitosamente"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Archivo inválido o DNI incorrecto"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "No autenticado"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Permiso denegado")
    })
    public ResponseEntity<?> subirImagenECG(
            @Valid @ModelAttribute SubirImagenECGDTO dto,
            HttpServletRequest request) {

        log.info("📤 Solicitud de carga de ECG - DNI: {}", dto.getNumDocPaciente());

        try {
            Long idUsuario = getIdUsuarioActual();
            String ipCliente = obtenerIPCliente(request);
            String navegador = obtenerUserAgent(request);

            // Obtener ID de IPRESS del usuario autenticado
            // En caso real, obtendría del usuario/contexto de seguridad
            Long idIpressOrigen = 1L; // Placeholder

            TeleECGImagenDTO resultado = teleECGService.subirImagenECG(
                dto,
                idIpressOrigen,
                idUsuario,
                ipCliente,
                navegador
            );

            return ResponseEntity.ok(
                ApiResponse.builder()
                    .status(200)
                    .data(resultado)
                    .message("ECG cargado exitosamente")
                    .build()
            );

        } catch (Exception e) {
            log.error("❌ Error al cargar ECG: {}", e.getMessage());
            return ResponseEntity.badRequest().body(
                ApiResponse.builder()
                    .status(400)
                    .error(e.getMessage())
                    .message("Error al cargar ECG")
                    .build()
            );
        }
    }

    // ============================================================
    // 2. LISTAR IMÁGENES
    // ============================================================

    /**
     * GET /api/teleekgs/listar
     * Lista imágenes ECG con filtros y paginación
     */
    @GetMapping("/listar")
    @CheckMBACPermission(pagina = "/teleekgs/listar", accion = "ver")
    @Operation(
        summary = "Listar imágenes ECG",
        description = "Obtiene lista paginada de imágenes ECG con filtros opcionales",
        tags = {"Listado"}
    )
    public ResponseEntity<?> listarImagenes(
            @Parameter(description = "DNI del paciente (búsqueda parcial)")
            @RequestParam(required = false) String numDoc,

            @Parameter(description = "Estado: PENDIENTE, PROCESADA, RECHAZADA, VINCULADA")
            @RequestParam(required = false) String estado,

            @Parameter(description = "ID de IPRESS")
            @RequestParam(required = false) Long idIpress,

            @Parameter(description = "Fecha desde (YYYY-MM-DD)")
            @RequestParam(required = false) String fechaDesde,

            @Parameter(description = "Fecha hasta (YYYY-MM-DD)")
            @RequestParam(required = false) String fechaHasta,

            @Parameter(description = "Página (0-based)")
            @RequestParam(defaultValue = "0") int page,

            @Parameter(description = "Tamaño de página")
            @RequestParam(defaultValue = "20") int size) {

        try {
            Pageable pageable = PageRequest.of(page, size);

            LocalDateTime fechaDesdeObj = fechaDesde != null ?
                LocalDateTime.parse(fechaDesde + "T00:00:00") : null;
            LocalDateTime fechaHastaObj = fechaHasta != null ?
                LocalDateTime.parse(fechaHasta + "T23:59:59") : null;

            Page<TeleECGImagenDTO> resultado = teleECGService.listarImagenes(
                numDoc,
                estado,
                idIpress,
                fechaDesdeObj,
                fechaHastaObj,
                pageable
            );

            return ResponseEntity.ok(
                ApiResponse.builder()
                    .status(200)
                    .data(resultado)
                    .message("Imágenes listadas exitosamente")
                    .build()
            );

        } catch (Exception e) {
            log.error("❌ Error al listar imágenes: {}", e.getMessage());
            return ResponseEntity.badRequest().body(
                ApiResponse.builder()
                    .status(400)
                    .error(e.getMessage())
                    .build()
            );
        }
    }

    // ============================================================
    // 3. OBTENER DETALLES DE IMAGEN
    // ============================================================

    /**
     * GET /api/teleekgs/{id}/detalles
     * Obtiene detalles completos de una imagen (sin el archivo binario)
     */
    @GetMapping("/{id}/detalles")
    @CheckMBACPermission(pagina = "/teleekgs/listar", accion = "ver")
    @Operation(
        summary = "Obtener detalles de imagen",
        description = "Retorna información completa de una imagen ECG"
    )
    public ResponseEntity<?> obtenerDetalles(
            @Parameter(description = "ID de la imagen")
            @PathVariable Long id,
            HttpServletRequest request) {

        try {
            Long idUsuario = getIdUsuarioActual();
            String ipCliente = obtenerIPCliente(request);

            TeleECGImagenDTO resultado = teleECGService.obtenerDetallesImagen(id, idUsuario, ipCliente);

            return ResponseEntity.ok(
                ApiResponse.builder()
                    .status(200)
                    .data(resultado)
                    .build()
            );

        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    // ============================================================
    // 4. DESCARGAR IMAGEN
    // ============================================================

    /**
     * GET /api/teleekgs/{id}/descargar
     * Descarga el archivo JPEG/PNG de la imagen
     *
     * Retorna el contenido binario con headers apropiad os
     */
    @GetMapping("/{id}/descargar")
    @CheckMBACPermission(pagina = "/teleekgs/listar", accion = "ver")
    @Operation(
        summary = "Descargar archivo ECG",
        description = "Descarga la imagen JPEG/PNG"
    )
    public ResponseEntity<?> descargarImagen(
            @Parameter(description = "ID de la imagen")
            @PathVariable Long id,
            HttpServletRequest request) {

        try {
            Long idUsuario = getIdUsuarioActual();
            String ipCliente = obtenerIPCliente(request);

            byte[] contenido = teleECGService.descargarImagen(id, idUsuario, ipCliente);

            return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"ecg_" + id + ".jpg\"")
                .contentType(MediaType.IMAGE_JPEG)
                .body(contenido);

        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    // ============================================================
    // 5. PREVIEW DE IMAGEN
    // ============================================================

    /**
     * GET /api/teleekgs/{id}/preview
     * Muestra preview de la imagen en el navegador (sin descargar)
     */
    @GetMapping("/{id}/preview")
    @CheckMBACPermission(pagina = "/teleekgs/listar", accion = "ver")
    @Operation(
        summary = "Preview de imagen",
        description = "Muestra la imagen en el navegador"
    )
    public ResponseEntity<?> previewImagen(
            @Parameter(description = "ID de la imagen")
            @PathVariable Long id) {

        try {
            byte[] contenido = teleECGService.descargarImagen(id, getIdUsuarioActual(), "");

            return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_JPEG)
                .body(contenido);

        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    // ============================================================
    // 6. PROCESAR IMAGEN
    // ============================================================

    /**
     * PUT /api/teleekgs/{id}/procesar
     * Procesa una imagen (acepta, rechaza o vincula)
     */
    @PutMapping("/{id}/procesar")
    @CheckMBACPermission(pagina = "/teleekgs/listar", accion = "editar")
    @Operation(
        summary = "Procesar imagen",
        description = "Acepta, rechaza o vincula una imagen ECG"
    )
    public ResponseEntity<?> procesarImagen(
            @Parameter(description = "ID de la imagen")
            @PathVariable Long id,

            @Valid @RequestBody ProcesarImagenECGDTO dto,
            HttpServletRequest request) {

        try {
            Long idUsuario = getIdUsuarioActual();
            String ipCliente = obtenerIPCliente(request);

            TeleECGImagenDTO resultado = teleECGService.procesarImagen(
                id,
                dto,
                idUsuario,
                ipCliente
            );

            return ResponseEntity.ok(
                ApiResponse.builder()
                    .status(200)
                    .data(resultado)
                    .message("Imagen procesada exitosamente")
                    .build()
            );

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                ApiResponse.builder()
                    .status(400)
                    .error(e.getMessage())
                    .build()
            );
        }
    }

    // ============================================================
    // 7. HISTORIAL DE AUDITORÍA
    // ============================================================

    /**
     * GET /api/teleekgs/{id}/auditoria
     * Obtiene el historial de accesos a una imagen
     */
    @GetMapping("/{id}/auditoria")
    @CheckMBACPermission(pagina = "/teleekgs/auditoria", accion = "ver")
    @Operation(
        summary = "Historial de auditoría",
        description = "Obtiene lista de todas las acciones realizadas sobre una imagen"
    )
    public ResponseEntity<?> obtenerAuditoria(
            @Parameter(description = "ID de la imagen")
            @PathVariable Long id,

            @Parameter(description = "Página")
            @RequestParam(defaultValue = "0") int page,

            @Parameter(description = "Tamaño")
            @RequestParam(defaultValue = "20") int size) {

        try {
            // Aquí iría la lógica para obtener auditoría paginada
            return ResponseEntity.ok(
                ApiResponse.builder()
                    .status(200)
                    .message("Auditoría obtenida")
                    .build()
            );

        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // ============================================================
    // 8. ESTADÍSTICAS
    // ============================================================

    /**
     * GET /api/teleekgs/estadisticas
     * Obtiene estadísticas del módulo (dashboard)
     */
    @GetMapping("/estadisticas")
    @CheckMBACPermission(pagina = "/teleekgs/dashboard", accion = "ver")
    @Operation(
        summary = "Estadísticas del módulo",
        description = "Obtiene métricas y estadísticas para dashboard"
    )
    public ResponseEntity<?> obtenerEstadisticas() {

        try {
            TeleECGEstadisticasDTO estadisticas = teleECGService.obtenerEstadisticas();

            return ResponseEntity.ok(
                ApiResponse.builder()
                    .status(200)
                    .data(estadisticas)
                    .build()
            );

        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // ============================================================
    // 9. IMÁGENES PRÓXIMAS A VENCER
    // ============================================================

    /**
     * GET /api/teleekgs/proximas-vencer
     * Obtiene imágenes próximas a vencer (< 3 días)
     */
    @GetMapping("/proximas-vencer")
    @CheckMBACPermission(pagina = "/teleekgs/dashboard", accion = "ver")
    @Operation(
        summary = "Imágenes próximas a vencer",
        description = "Lista imágenes que vencerán en menos de 3 días"
    )
    public ResponseEntity<?> obtenerProximasVencer() {

        try {
            // Aquí iría la lógica para obtener imágenes próximas a vencer
            return ResponseEntity.ok(
                ApiResponse.builder()
                    .status(200)
                    .message("Imágenes próximas a vencer obtenidas")
                    .build()
            );

        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // ============================================================
    // ERROR HANDLERS
    // ============================================================

    @ExceptionHandler(ValidationException.class)
    public ResponseEntity<?> handleValidationException(ValidationException e) {
        return ResponseEntity.badRequest().body(
            ApiResponse.builder()
                .status(400)
                .error(e.getMessage())
                .build()
        );
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<?> handleResourceNotFoundException(ResourceNotFoundException e) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
            ApiResponse.builder()
                .status(404)
                .error(e.getMessage())
                .build()
        );
    }
}
