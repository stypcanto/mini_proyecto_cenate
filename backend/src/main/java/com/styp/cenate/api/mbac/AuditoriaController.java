package com.styp.cenate.api.mbac;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.styp.cenate.dto.mbac.AuditoriaModularResponseDTO;
import com.styp.cenate.service.mbac.AuditoriaService;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Controlador REST para la gestión de auditoría modular.
 * 
 * Proporciona endpoints para:
 * - Consultar registros de auditoría de permisos
 * - Filtrar por usuario, módulo, acción y fechas
 * - Obtener resúmenes y estadísticas
 * 
 * @author CENATE Development Team
 * @version 1.0
 */
@RestController
@RequestMapping("/api/auditoria")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Auditoría MBAC", description = "Consulta de auditoría de permisos modulares")
@SecurityRequirement(name = "bearerAuth")
@Data
public class AuditoriaController {

    private final AuditoriaService auditoriaService;

    /**
     * Obtiene toda la auditoría modular paginada.
     * 
     * GET /api/auditoria/modulos
     */
    @Operation(
        summary = "Obtener auditoría modular",
        description = "Retorna todos los registros de auditoría de cambios en permisos modulares"
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Auditoría obtenida exitosamente",
            content = @Content(schema = @Schema(implementation = Page.class))
        ),
        @ApiResponse(responseCode = "401", description = "No autorizado"),
        @ApiResponse(responseCode = "403", description = "Acceso denegado")
    })
    @GetMapping("/modulos")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
    public ResponseEntity<Page<AuditoriaModularResponseDTO>> obtenerAuditoriaModular(
            @Parameter(description = "Número de página (0-indexed)", example = "0")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Tamaño de página", example = "20")
            @RequestParam(defaultValue = "20") int size,
            @Parameter(description = "Campo de ordenamiento", example = "fechaHora")
            @RequestParam(defaultValue = "fechaHora") String sortBy,
            @Parameter(description = "Dirección de ordenamiento", example = "desc")
            @RequestParam(defaultValue = "desc") String direction) {
        
        log.info("GET /api/auditoria/modulos - Página: {}, Tamaño: {}", page, size);
        
        Sort.Direction sortDirection = direction.equalsIgnoreCase("asc") 
            ? Sort.Direction.ASC 
            : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sortBy));
        
        Page<AuditoriaModularResponseDTO> auditoria = auditoriaService.obtenerAuditoriaModular(pageable);
        return ResponseEntity.ok(auditoria);
    }

    /**
     * Obtiene la auditoría de un usuario específico.
     * 
     * GET /api/auditoria/usuario/{userId}
     */
    @Operation(
        summary = "Obtener auditoría por usuario",
        description = "Retorna los registros de auditoría de un usuario específico"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Auditoría obtenida exitosamente"),
        @ApiResponse(responseCode = "401", description = "No autorizado"),
        @ApiResponse(responseCode = "403", description = "Acceso denegado")
    })
    @GetMapping("/usuario/{userId}")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
    public ResponseEntity<Page<AuditoriaModularResponseDTO>> obtenerAuditoriaPorUsuario(
            @Parameter(description = "ID del usuario", required = true)
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        log.info("GET /api/auditoria/usuario/{} - Consultando auditoría", userId);
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "fechaHora"));
        Page<AuditoriaModularResponseDTO> auditoria = auditoriaService.obtenerAuditoriaPorUsuario(userId, pageable);
        
        return ResponseEntity.ok(auditoria);
    }

    /**
     * Obtiene la auditoría por nombre de usuario.
     * 
     * GET /api/auditoria/username/{username}
     */
    @Operation(
        summary = "Obtener auditoría por username",
        description = "Retorna los registros de auditoría de un usuario por su nombre de usuario"
    )
    @GetMapping("/username/{username}")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
    public ResponseEntity<Page<AuditoriaModularResponseDTO>> obtenerAuditoriaPorUsername(
            @Parameter(description = "Nombre de usuario", required = true)
            @PathVariable String username,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        log.info("GET /api/auditoria/username/{} - Consultando auditoría", username);
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "fechaHora"));
        Page<AuditoriaModularResponseDTO> auditoria = auditoriaService.obtenerAuditoriaPorUsername(username, pageable);
        
        return ResponseEntity.ok(auditoria);
    }

    /**
     * Obtiene la auditoría de un módulo específico.
     * 
     * GET /api/auditoria/modulo/{modulo}
     */
    @Operation(
        summary = "Obtener auditoría por módulo",
        description = "Retorna los registros de auditoría de un módulo específico"
    )
    @GetMapping("/modulo/{modulo}")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
    public ResponseEntity<Page<AuditoriaModularResponseDTO>> obtenerAuditoriaPorModulo(
            @Parameter(description = "Nombre del módulo", required = true, example = "dim_permisos_modulares")
            @PathVariable String modulo,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        log.info("GET /api/auditoria/modulo/{} - Consultando auditoría", modulo);
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "fechaHora"));
        Page<AuditoriaModularResponseDTO> auditoria = auditoriaService.obtenerAuditoriaPorModulo(modulo, pageable);
        
        return ResponseEntity.ok(auditoria);
    }

    /**
     * Obtiene la auditoría por tipo de acción.
     * 
     * GET /api/auditoria/accion/{accion}
     */
    @Operation(
        summary = "Obtener auditoría por acción",
        description = "Retorna los registros de auditoría filtrados por tipo de acción (INSERT, UPDATE, DELETE)"
    )
    @GetMapping("/accion/{accion}")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
    public ResponseEntity<Page<AuditoriaModularResponseDTO>> obtenerAuditoriaPorAccion(
            @Parameter(description = "Tipo de acción", required = true, example = "INSERT")
            @PathVariable String accion,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        log.info("GET /api/auditoria/accion/{} - Consultando auditoría", accion);
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "fechaHora"));
        Page<AuditoriaModularResponseDTO> auditoria = auditoriaService.obtenerAuditoriaPorAccion(accion, pageable);
        
        return ResponseEntity.ok(auditoria);
    }

    /**
     * Obtiene la auditoría en un rango de fechas.
     * 
     * GET /api/auditoria/rango
     */
    @Operation(
        summary = "Obtener auditoría por rango de fechas",
        description = "Retorna los registros de auditoría en un rango de fechas específico"
    )
    @GetMapping("/rango")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
    public ResponseEntity<Page<AuditoriaModularResponseDTO>> obtenerAuditoriaPorRangoFechas(
            @Parameter(description = "Fecha de inicio", required = true, example = "2025-01-01T00:00:00")
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fechaInicio,
            @Parameter(description = "Fecha de fin", required = true, example = "2025-01-31T23:59:59")
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fechaFin,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        log.info("GET /api/auditoria/rango - Desde: {} hasta: {}", fechaInicio, fechaFin);
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "fechaHora"));
        Page<AuditoriaModularResponseDTO> auditoria = auditoriaService.obtenerAuditoriaPorRangoFechas(
            fechaInicio, fechaFin, pageable
        );
        
        return ResponseEntity.ok(auditoria);
    }

    /**
     * Obtiene la auditoría de un usuario en un rango de fechas.
     * 
     * GET /api/auditoria/usuario/{userId}/rango
     */
    @Operation(
        summary = "Obtener auditoría de usuario por rango de fechas",
        description = "Retorna los registros de auditoría de un usuario en un rango de fechas"
    )
    @GetMapping("/usuario/{userId}/rango")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
    public ResponseEntity<Page<AuditoriaModularResponseDTO>> obtenerAuditoriaPorUsuarioYFechas(
            @Parameter(description = "ID del usuario", required = true)
            @PathVariable Long userId,
            @Parameter(description = "Fecha de inicio", required = true)
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fechaInicio,
            @Parameter(description = "Fecha de fin", required = true)
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fechaFin,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        log.info("GET /api/auditoria/usuario/{}/rango - Desde: {} hasta: {}", userId, fechaInicio, fechaFin);
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "fechaHora"));
        Page<AuditoriaModularResponseDTO> auditoria = auditoriaService.obtenerAuditoriaPorUsuarioYFechas(
            userId, fechaInicio, fechaFin, pageable
        );
        
        return ResponseEntity.ok(auditoria);
    }

    /**
     * Obtiene resumen de eventos por tipo.
     * 
     * GET /api/auditoria/resumen
     */
    @Operation(
        summary = "Obtener resumen de auditoría",
        description = "Retorna un resumen estadístico de eventos por tipo"
    )
    @GetMapping("/resumen")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> obtenerResumen() {
        log.info("GET /api/auditoria/resumen - Generando resumen");
        
        Map<String, Long> resumenPorTipo = auditoriaService.obtenerResumenPorTipoEvento();
        
        Map<String, Object> response = new HashMap<>();
        response.put("resumenPorTipoEvento", resumenPorTipo);
        response.put("totalEventos", resumenPorTipo.values().stream().mapToLong(Long::longValue).sum());
        response.put("timestamp", LocalDateTime.now());
        
        return ResponseEntity.ok(response);
    }

    /**
     * Obtiene los últimos N eventos de auditoría.
     * 
     * GET /api/auditoria/ultimos
     */
    @Operation(
        summary = "Obtener últimos eventos",
        description = "Retorna los N eventos más recientes de auditoría"
    )
    @GetMapping("/ultimos")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
    public ResponseEntity<List<AuditoriaModularResponseDTO>> obtenerUltimosEventos(
            @Parameter(description = "Número de eventos a retornar", example = "10")
            @RequestParam(defaultValue = "10") int limit) {
        
        log.info("GET /api/auditoria/ultimos?limit={}", limit);
        
        List<AuditoriaModularResponseDTO> eventos = auditoriaService.obtenerUltimosEventos(limit);
        return ResponseEntity.ok(eventos);
    }

    /**
     * Busca en la auditoría por texto en el detalle.
     * 
     * GET /api/auditoria/buscar
     */
    @Operation(
        summary = "Buscar en auditoría",
        description = "Busca eventos de auditoría que contengan el texto especificado en el detalle"
    )
    @GetMapping("/buscar")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
    public ResponseEntity<Page<AuditoriaModularResponseDTO>> buscarEnDetalle(
            @Parameter(description = "Texto a buscar", required = true, example = "puede_ver")
            @RequestParam String texto,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        log.info("GET /api/auditoria/buscar?texto={}", texto);
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "fechaHora"));
        Page<AuditoriaModularResponseDTO> auditoria = auditoriaService.buscarEnDetalle(texto, pageable);
        
        return ResponseEntity.ok(auditoria);
    }

    /**
     * Health check del servicio de auditoría.
     * 
     * GET /api/auditoria/health
     */
    @Operation(
        summary = "Health check",
        description = "Verifica que el servicio de auditoría esté funcionando correctamente"
    )
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> healthCheck() {
        Map<String, String> health = new HashMap<>();
        health.put("status", "UP");
        health.put("service", "AuditoriaService");
        health.put("timestamp", LocalDateTime.now().toString());
        return ResponseEntity.ok(health);
    }
}
