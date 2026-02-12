package com.styp.cenate.api.seguridad;
import lombok.extern.slf4j.Slf4j;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.styp.cenate.model.AuditLog;
import com.styp.cenate.service.auditlog.AuditLogService;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/audit")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = {
        "http://localhost",
        "http://localhost:3000",
        "http://localhost:5173",
        "http://10.0.89.241:3000",
        "http://10.0.89.241:5173"
})
@PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
public class AuditLogController {

    private final AuditLogService auditLogService;

    /**
     * Obtener todos los logs con paginación
     */
    @GetMapping("/logs")
    public ResponseEntity<Page<AuditLog>> obtenerLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "fechaHora") String sortBy,
            @RequestParam(defaultValue = "desc") String direction
    ) {
        try {
            Page<AuditLog> logs = auditLogService.obtenerLogs(page, size, sortBy, direction);
            return ResponseEntity.ok(logs);
        } catch (Exception e) {
            log.error("Error al obtener logs: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Buscar logs por usuario
     */
    @GetMapping("/logs/usuario/{username}")
    public ResponseEntity<Page<AuditLog>> buscarPorUsuario(
            @PathVariable String username,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        try {
            Page<AuditLog> logs = auditLogService.buscarPorUsuario(username, page, size);
            return ResponseEntity.ok(logs);
        } catch (Exception e) {
            log.error("Error al buscar logs por usuario: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Buscar logs por rango de fechas
     */
    @GetMapping("/logs/fechas")
    public ResponseEntity<Page<AuditLog>> buscarPorFechas(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime inicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fin,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        try {
            Page<AuditLog> logs = auditLogService.buscarPorFechas(inicio, fin, page, size);
            return ResponseEntity.ok(logs);
        } catch (Exception e) {
            log.error("Error al buscar logs por fechas: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Obtener últimos 10 logs
     */
    @GetMapping("/logs/recientes")
    public ResponseEntity<?> obtenerLogosRecientes() {
        try {
            return ResponseEntity.ok(auditLogService.obtenerUltimosLogs());
        } catch (Exception e) {
            log.error("Error al obtener logs recientes: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Obtener estadísticas del sistema
     */
    @GetMapping("/estadisticas")
    public ResponseEntity<Map<String, Object>> obtenerEstadisticas() {
        try {
            Map<String, Object> stats = auditLogService.obtenerEstadisticas();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            log.error("Error al obtener estadísticas: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Búsqueda avanzada
     */
    @GetMapping("/logs/buscar")
    public ResponseEntity<Page<AuditLog>> busquedaAvanzada(
            @RequestParam(required = false) String usuario,
            @RequestParam(required = false) String action,
            @RequestParam(required = false) String modulo,
            @RequestParam(required = false) String nivel,
            @RequestParam(required = false) String estado,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fechaInicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fechaFin,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        try {
            Page<AuditLog> logs = auditLogService.busquedaAvanzada(
                    usuario, action, modulo, nivel, estado, fechaInicio, fechaFin, page, size
            );
            return ResponseEntity.ok(logs);
        } catch (Exception e) {
            log.error("Error en búsqueda avanzada: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
}
