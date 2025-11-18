package com.styp.cenate.api.mbac;
import jakarta.persistence.EntityNotFoundException;
import com.styp.cenate.dto.UsuarioResponse;
import com.styp.cenate.dto.mbac.AuditoriaModularResponseDTO;
import com.styp.cenate.service.mbac.AuditoriaService;
import com.styp.cenate.service.usuario.UsuarioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Controlador REST para la gestión de auditoría modular MBAC.
 */
@RestController
@RequestMapping("/api/auditoria")
@RequiredArgsConstructor
@Slf4j
@Data
@Tag(name = "Auditoría MBAC", description = "Consulta de auditoría de permisos modulares")
@SecurityRequirement(name = "bearerAuth")
public class AuditoriaController {

    private final AuditoriaService auditoriaService;
    private final UsuarioService usuarioService;

    // =============================================================
    // 📄 Auditoría general paginada
    // =============================================================
    @GetMapping("/modulos")
    @PreAuthorize("hasAnyRole('SUPERADMIN','ADMIN')")
    @Operation(summary = "Obtener auditoría modular",
            description = "Retorna todos los registros de auditoría de cambios en permisos modulares")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Auditoría obtenida correctamente",
                    content = @Content(schema = @Schema(implementation = Page.class))),
            @ApiResponse(responseCode = "401", description = "No autorizado"),
            @ApiResponse(responseCode = "403", description = "Acceso denegado")
    })
    public ResponseEntity<Page<AuditoriaModularResponseDTO>> obtenerAuditoriaModular(
            @Parameter(description = "Número de página (0-indexed)", example = "0") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Tamaño de página", example = "20") @RequestParam(defaultValue = "20") int size,
            @Parameter(description = "Campo de ordenamiento", example = "fechaHora") @RequestParam(defaultValue = "fechaHora") String sortBy,
            @Parameter(description = "Dirección de ordenamiento", example = "desc") @RequestParam(defaultValue = "desc") String direction) {

        Sort.Direction sortDirection = direction.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sortBy));
        Page<AuditoriaModularResponseDTO> auditoria = auditoriaService.obtenerAuditoriaModular(pageable);
        return ResponseEntity.ok(auditoria);
    }

    // =============================================================
    // 📄 Auditoría por usuario
    // =============================================================
    @GetMapping("/usuario/{userId}")
    @PreAuthorize("hasAnyRole('SUPERADMIN','ADMIN')")
    public ResponseEntity<Page<AuditoriaModularResponseDTO>> obtenerAuditoriaPorUsuario(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "fechaHora"));
        Page<AuditoriaModularResponseDTO> auditoria = auditoriaService.obtenerAuditoriaPorUsuario(userId, pageable);
        return ResponseEntity.ok(auditoria);
    }

    @GetMapping("/username/{username}")
    @PreAuthorize("hasAnyRole('SUPERADMIN','ADMIN')")
    public ResponseEntity<?> obtenerAuditoriaPorUsername(@PathVariable String username) {
        try {
            UsuarioResponse usuario = usuarioService.obtenerDetalleUsuarioExtendido(username);
            return ResponseEntity.ok(usuario);
        } catch (EntityNotFoundException e) {
            log.warn("Usuario no encontrado: {}", username);
            return ResponseEntity.status(404).body(Map.of("message", "Usuario no encontrado"));
        } catch (Exception e) {
            log.error("Error interno al obtener usuario {}: {}", username, e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of("message", "Ha ocurrido un error interno en el servidor"));
        }
    }

    // =============================================================
    // 📄 Auditoría por módulo
    // =============================================================
    @GetMapping("/modulo/{modulo}")
    @PreAuthorize("hasAnyRole('SUPERADMIN','ADMIN')")
    public ResponseEntity<Page<AuditoriaModularResponseDTO>> obtenerAuditoriaPorModulo(
            @PathVariable String modulo,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "fechaHora"));
        Page<AuditoriaModularResponseDTO> auditoria = auditoriaService.obtenerAuditoriaPorModulo(modulo, pageable);
        return ResponseEntity.ok(auditoria);
    }

    // =============================================================
    // 📄 Auditoría por acción
    // =============================================================
    @GetMapping("/accion/{accion}")
    @PreAuthorize("hasAnyRole('SUPERADMIN','ADMIN')")
    public ResponseEntity<Page<AuditoriaModularResponseDTO>> obtenerAuditoriaPorAccion(
            @PathVariable String accion,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "fechaHora"));
        Page<AuditoriaModularResponseDTO> auditoria = auditoriaService.obtenerAuditoriaPorAccion(accion, pageable);
        return ResponseEntity.ok(auditoria);
    }

    // =============================================================
    // 📄 Auditoría por rango de fechas
    // =============================================================
    @GetMapping("/rango")
    @PreAuthorize("hasAnyRole('SUPERADMIN','ADMIN')")
    public ResponseEntity<Page<AuditoriaModularResponseDTO>> obtenerAuditoriaPorRangoFechas(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fechaInicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fechaFin,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "fechaHora"));
        Page<AuditoriaModularResponseDTO> auditoria = auditoriaService.obtenerAuditoriaPorRangoFechas(fechaInicio, fechaFin, pageable);
        return ResponseEntity.ok(auditoria);
    }

    // =============================================================
    // 📄 Auditoría por usuario y rango
    // =============================================================
    @GetMapping("/usuario/{userId}/rango")
    @PreAuthorize("hasAnyRole('SUPERADMIN','ADMIN')")
    public ResponseEntity<Page<AuditoriaModularResponseDTO>> obtenerAuditoriaPorUsuarioYFechas(
            @PathVariable Long userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fechaInicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fechaFin,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "fechaHora"));
        Page<AuditoriaModularResponseDTO> auditoria = auditoriaService.obtenerAuditoriaPorUsuarioYFechas(userId, fechaInicio, fechaFin, pageable);
        return ResponseEntity.ok(auditoria);
    }

    // =============================================================
    // 📄 Resumen de auditoría
    // =============================================================
    @GetMapping("/resumen")
    @PreAuthorize("hasAnyRole('SUPERADMIN','ADMIN')")
    public ResponseEntity<Map<String, Object>> obtenerResumen() {
        Map<String, Long> resumenPorTipo = auditoriaService.obtenerResumenPorTipoEvento();
        Map<String, Object> response = new HashMap<>();
        response.put("resumenPorTipoEvento", resumenPorTipo);
        response.put("totalEventos", resumenPorTipo.values().stream().mapToLong(Long::longValue).sum());
        response.put("timestamp", LocalDateTime.now());
        return ResponseEntity.ok(response);
    }

    // =============================================================
    // 📄 Últimos eventos
    // =============================================================
    @GetMapping("/ultimos")
    @PreAuthorize("hasAnyRole('SUPERADMIN','ADMIN')")
    public ResponseEntity<List<AuditoriaModularResponseDTO>> obtenerUltimosEventos(
            @RequestParam(name="limit", defaultValue = "10") int limit) {

        List<AuditoriaModularResponseDTO> eventos = auditoriaService.obtenerUltimosEventos(limit);
        return ResponseEntity.ok(eventos);
    }

    // =============================================================
    // 📄 Buscar por detalle
    // =============================================================
    @GetMapping("/buscar")
    @PreAuthorize("hasAnyRole('SUPERADMIN','ADMIN')")
    public ResponseEntity<Page<AuditoriaModularResponseDTO>> buscarEnDetalle(
            @RequestParam String texto,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "fechaHora"));
        Page<AuditoriaModularResponseDTO> auditoria = auditoriaService.buscarEnDetalle(texto, pageable);
        return ResponseEntity.ok(auditoria);
    }

    // =============================================================
    // 📄 Health check
    // =============================================================
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> healthCheck() {
        Map<String, String> health = new HashMap<>();
        health.put("status", "UP");
        health.put("service", "AuditoriaService");
        health.put("timestamp", LocalDateTime.now().toString());
        return ResponseEntity.ok(health);
    }
}