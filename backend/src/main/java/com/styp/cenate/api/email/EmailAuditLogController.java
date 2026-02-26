package com.styp.cenate.api.email;

import com.styp.cenate.model.EmailAuditLog;
import com.styp.cenate.service.email.EmailAuditLogService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 📧 Controlador para auditoría de correos
 *
 * Expone endpoints para consultar el historial de envíos de correos
 * Acceso: Solo ADMIN y SUPERADMIN
 */
@RestController
@RequestMapping("/api/email-audit")
@RequiredArgsConstructor
@Slf4j
public class EmailAuditLogController {

    private final EmailAuditLogService emailAuditLogService;

    /**
     * Obtener todos los registros de correos (más recientes primero)
     * GET /api/email-audit/todos?limite=100
     */
    @GetMapping("/todos")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'GESTOR_TERRITORIAL_TI')")
    public ResponseEntity<?> obtenerTodos(
        @RequestParam(defaultValue = "100") int limite) {
        try {
            log.info("📋 Consultando todos los correos (límite: {})", limite);
            List<EmailAuditLog> todos = emailAuditLogService.obtenerTodos(limite);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("total", todos.size());
            response.put("datos", todos);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("❌ Error obteniendo correos: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", e.getMessage()
            ));
        }
    }

    /**
     * Obtener registros de correos enviados exitosamente
     * GET /api/email-audit/enviados?limite=50
     */
    @GetMapping("/enviados")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'GESTOR_TERRITORIAL_TI')")
    public ResponseEntity<?> obtenerEnviados(
        @RequestParam(defaultValue = "50") int limite) {
        try {
            log.info("📋 Consultando correos enviados (límite: {})", limite);
            List<EmailAuditLog> enviados = emailAuditLogService.obtenerEnviados(limite);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("total", enviados.size());
            response.put("datos", enviados);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("❌ Error obteniendo correos enviados: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", e.getMessage()
            ));
        }
    }

    /**
     * Obtener registros fallidos de correos
     * GET /api/email-audit/fallidos?limite=50
     */
    @GetMapping("/fallidos")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'GESTOR_TERRITORIAL_TI')")
    public ResponseEntity<?> obtenerCorreosFallidos(
        @RequestParam(defaultValue = "50") int limite) {
        try {
            log.info("📋 Consultando correos fallidos (límite: {})", limite);
            List<EmailAuditLog> fallidos = emailAuditLogService.obtenerCorreosFallidos(limite);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("total", fallidos.size());
            response.put("datos", fallidos);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("❌ Error obteniendo correos fallidos: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", e.getMessage()
            ));
        }
    }

    /**
     * Obtener registros de correos por destinatario
     * GET /api/email-audit/destinatario?email=user@example.com
     */
    @GetMapping("/destinatario")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'GESTOR_TERRITORIAL_TI')")
    public ResponseEntity<?> obtenerPorDestinatario(
        @RequestParam String email) {
        try {
            log.info("📋 Consultando correos para: {}", email);
            List<EmailAuditLog> registros = emailAuditLogService.obtenerCorreosPorDestinatario(email);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("destinatario", email);
            response.put("total", registros.size());
            response.put("datos", registros);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("❌ Error obteniendo correos: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", e.getMessage()
            ));
        }
    }

    /**
     * Obtener estadísticas de correos en un período
     * GET /api/email-audit/estadisticas?inicio=2026-02-01&fin=2026-02-05
     */
    @GetMapping("/estadisticas")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'GESTOR_TERRITORIAL_TI')")
    public ResponseEntity<?> obtenerEstadisticas(
        @RequestParam(required = false) String inicio,
        @RequestParam(required = false) String fin) {
        try {
            LocalDateTime fechaInicio = inicio != null
                ? LocalDateTime.parse(inicio + "T00:00:00")
                : LocalDateTime.now().minusDays(7);

            LocalDateTime fechaFin = fin != null
                ? LocalDateTime.parse(fin + "T23:59:59")
                : LocalDateTime.now();

            log.info("📊 Calculando estadísticas de correos: {} a {}", fechaInicio, fechaFin);

            EmailAuditLogService.EmailAuditStats stats =
                emailAuditLogService.obtenerEstadisticas(fechaInicio, fechaFin);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("periodo", Map.of(
                "inicio", fechaInicio,
                "fin", fechaFin
            ));
            response.put("estadisticas", stats);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("❌ Error obteniendo estadísticas: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", e.getMessage()
            ));
        }
    }

    /**
     * Obtener correos con errores de conexión
     * GET /api/email-audit/errores-conexion?limite=50
     */
    @GetMapping("/errores-conexion")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'GESTOR_TERRITORIAL_TI')")
    public ResponseEntity<?> obtenerErroresConexion(
        @RequestParam(defaultValue = "50") int limite) {
        try {
            log.info("📋 Consultando correos con errores de conexión");
            List<EmailAuditLog> errores = emailAuditLogService.obtenerErroresConexion(limite);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("total", errores.size());
            response.put("datos", errores);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("❌ Error obteniendo errores de conexión: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", e.getMessage()
            ));
        }
    }

    /**
     * Obtener historial de correos de un usuario
     * GET /api/email-audit/usuario/:id?pagina=0&tamanio=20
     */
    @GetMapping("/usuario/{idUsuario}")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'GESTOR_TERRITORIAL_TI')")
    public ResponseEntity<?> obtenerHistoricoUsuario(
        @PathVariable Long idUsuario,
        @RequestParam(defaultValue = "0") int pagina,
        @RequestParam(defaultValue = "20") int tamanio) {
        try {
            log.info("📋 Consultando correos del usuario: {}", idUsuario);
            List<EmailAuditLog> historico = emailAuditLogService
                .obtenerHistoricoUsuario(idUsuario, pagina, tamanio);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("idUsuario", idUsuario);
            response.put("pagina", pagina);
            response.put("tamanio", tamanio);
            response.put("total", historico.size());
            response.put("datos", historico);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("❌ Error obteniendo historial de usuario: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", e.getMessage()
            ));
        }
    }

    /**
     * Obtener resumen de todas las auditorías de correo
     * GET /api/email-audit/resumen
     */
    @GetMapping("/resumen")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'GESTOR_TERRITORIAL_TI')")
    public ResponseEntity<?> obtenerResumen() {
        try {
            log.info("📊 Obteniendo resumen de auditoría de correos");

            LocalDateTime hace7Dias = LocalDateTime.now().minusDays(7);
            LocalDateTime ahora = LocalDateTime.now();

            EmailAuditLogService.EmailAuditStats stats =
                emailAuditLogService.obtenerEstadisticas(hace7Dias, ahora);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("periodo", "últimos 7 días");
            response.put("estadisticas", stats);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("❌ Error obteniendo resumen: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", e.getMessage()
            ));
        }
    }
}
