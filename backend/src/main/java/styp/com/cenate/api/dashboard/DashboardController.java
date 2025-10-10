package styp.com.cenate.api;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import styp.com.cenate.repository.AuditLogRepository;
import styp.com.cenate.repository.RolRepository;
import styp.com.cenate.repository.UsuarioRepository;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = {
        "http://localhost",
        "http://localhost:3000",
        "http://localhost:5173",
        "http://10.0.89.13:3000",
        "http://10.0.89.13:5173"
})
@PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
public class DashboardController {

    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final AuditLogRepository auditLogRepository;

    /**
     * Obtener estadísticas generales del dashboard
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> obtenerEstadisticas() {
        try {
            Map<String, Object> stats = new HashMap<>();
            
            // Usuarios
            long totalUsuarios = usuarioRepository.count();
            long usuariosActivos = usuarioRepository.countByStatUser("ACTIVO");
            long usuariosInactivos = usuarioRepository.countByStatUser("INACTIVO");
            
            stats.put("totalUsuarios", totalUsuarios);
            stats.put("usuariosActivos", usuariosActivos);
            stats.put("usuariosInactivos", usuariosInactivos);
            
            // Roles
            long totalRoles = rolRepository.count();
            stats.put("totalRoles", totalRoles);
            
            // Logs del sistema (últimas 24 horas)
            LocalDateTime hace24h = LocalDateTime.now().minusHours(24);
            long logsRecientes = auditLogRepository.countByFechaHoraBetween(hace24h, LocalDateTime.now());
            stats.put("logsRecientes24h", logsRecientes);
            
            // Total de logs
            long totalLogs = auditLogRepository.count();
            stats.put("totalLogs", totalLogs);
            
            // Actividad reciente (últimos 7 días)
            LocalDateTime hace7dias = LocalDateTime.now().minusDays(7);
            long actividadSemanal = auditLogRepository.countByFechaHoraBetween(hace7dias, LocalDateTime.now());
            stats.put("actividadSemanal", actividadSemanal);
            
            // Logs por módulo
            var logsPorModulo = auditLogRepository.countByModulo();
            stats.put("logsPorModulo", logsPorModulo);
            
            // Actividad por usuario (top 5)
            var actividadUsuarios = auditLogRepository.getActividadUsuarios(hace7dias);
            if (actividadUsuarios.size() > 5) {
                actividadUsuarios = actividadUsuarios.subList(0, 5);
            }
            stats.put("topUsuarios", actividadUsuarios);
            
            return ResponseEntity.ok(stats);
            
        } catch (Exception e) {
            log.error("Error al obtener estadísticas del dashboard: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Obtener resumen rápido
     */
    @GetMapping("/resumen")
    public ResponseEntity<Map<String, Object>> obtenerResumen() {
        try {
            Map<String, Object> resumen = new HashMap<>();
            
            resumen.put("usuarios", usuarioRepository.count());
            resumen.put("roles", rolRepository.count());
            resumen.put("logs", auditLogRepository.count());
            
            // Últimos logins (últimas 24h)
            LocalDateTime hace24h = LocalDateTime.now().minusHours(24);
            long loginsRecientes = auditLogRepository.countByActionAndFechaHoraBetween("LOGIN", hace24h, LocalDateTime.now());
            resumen.put("loginsRecientes", loginsRecientes);
            
            return ResponseEntity.ok(resumen);
            
        } catch (Exception e) {
            log.error("Error al obtener resumen: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
}
