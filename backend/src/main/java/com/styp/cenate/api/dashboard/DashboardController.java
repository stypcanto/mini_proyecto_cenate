package com.styp.cenate.api.dashboard;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.styp.cenate.repository.AuditLogRepository;
import com.styp.cenate.repository.segu.RolRepository;
import com.styp.cenate.repository.UsuarioRepository;
import com.styp.cenate.repository.IpressRepository;
import com.styp.cenate.repository.mbac.PermisoModularRepository;

import java.time.LocalDateTime;
import java.util.*;

/**
 * 🎯 Controlador del panel administrativo (Dashboard)
 * Proporciona estadísticas y métricas del sistema.
 */
@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = {
        "http://localhost",
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://10.0.89.13:3000",
        "http://10.0.89.13:5173",
        "http://10.0.89.239"
})
@PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
@Data
public class DashboardController {

    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final AuditLogRepository auditLogRepository;
    private final IpressRepository ipressRepository;
    private final PermisoModularRepository permisoModularRepository;

    // ===========================================================
    // 📊 1️⃣ Estadísticas completas
    // ===========================================================
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> obtenerEstadisticas() {
        try {
            Map<String, Object> stats = new HashMap<>();

            // 👤 Usuarios
            long totalUsuarios = usuarioRepository.count();
            long usuariosActivos = usuarioRepository.countByStatUser("A");
            long usuariosInactivos = usuarioRepository.countByStatUser("I");

            stats.put("totalUsuarios", totalUsuarios);
            stats.put("usuariosActivos", usuariosActivos);
            stats.put("usuariosInactivos", usuariosInactivos);

            // 🧩 Roles
            long totalRoles = rolRepository.count();
            stats.put("totalRoles", totalRoles);

            // 🏥 IPRESS
            long totalIpress = ipressRepository.count();
            stats.put("totalIpress", totalIpress);

            // 🔐 Permisos MBAC
            long totalPermisos = permisoModularRepository.count();
            stats.put("totalPermisos", totalPermisos);

            // 📜 Logs del sistema
            LocalDateTime hace24h = LocalDateTime.now().minusHours(24);
            long logsRecientes = auditLogRepository.countByFechaHoraBetween(hace24h, LocalDateTime.now());
            stats.put("logsRecientes24h", logsRecientes);

            long totalLogs = auditLogRepository.count();
            stats.put("totalLogs", totalLogs);

            // 📈 Actividad semanal
            LocalDateTime hace7dias = LocalDateTime.now().minusDays(7);
            long actividadSemanal = auditLogRepository.countByFechaHoraBetween(hace7dias, LocalDateTime.now());
            stats.put("actividadSemanal", actividadSemanal);

            // 📦 Logs por módulo (List<Object[]> → List<Map<String, Object>>)
            List<Object[]> rawLogsPorModulo = auditLogRepository.countByModulo();
            List<Map<String, Object>> logsPorModulo = new ArrayList<>();
            for (Object[] row : rawLogsPorModulo) {
                Map<String, Object> map = new HashMap<>();
                map.put("modulo", row[0]);
                map.put("total", row[1]);
                logsPorModulo.add(map);
            }
            stats.put("logsPorModulo", logsPorModulo);

            // 🧑‍💻 Top 5 usuarios activos (List<Object[]> → List<Map<String, Object>>)
            List<Object[]> rawActividadUsuarios = auditLogRepository.getActividadUsuarios(hace7dias);
            List<Map<String, Object>> actividadUsuarios = new ArrayList<>();
            for (Object[] row : rawActividadUsuarios) {
                Map<String, Object> map = new HashMap<>();
                map.put("usuario", row[0]);
                map.put("acciones", row[1]);
                actividadUsuarios.add(map);
            }

            if (actividadUsuarios.size() > 5) {
                actividadUsuarios = actividadUsuarios.subList(0, 5);
            }
            stats.put("topUsuarios", actividadUsuarios);

            return ResponseEntity.ok(stats);

        } catch (Exception e) {
            log.error("❌ Error al obtener estadísticas del dashboard: {}", e.getMessage(), e);
            Map<String, Object> error = new HashMap<>();
            error.put("error", "No se pudieron obtener las estadísticas");
            error.put("detalle", e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }

    // ===========================================================
    // ⚡ 2️⃣ Resumen rápido
    // ===========================================================
    @GetMapping("/resumen")
    public ResponseEntity<Map<String, Object>> obtenerResumen() {
        try {
            Map<String, Object> resumen = new HashMap<>();

            resumen.put("usuarios", usuarioRepository.count());
            resumen.put("roles", rolRepository.count());
            resumen.put("logs", auditLogRepository.count());

            LocalDateTime hace24h = LocalDateTime.now().minusHours(24);
            long loginsRecientes = auditLogRepository.countByActionAndFechaHoraBetween(
                    "LOGIN", hace24h, LocalDateTime.now());
            resumen.put("loginsRecientes", loginsRecientes);

            return ResponseEntity.ok(resumen);

        } catch (Exception e) {
            log.error("⚠️ Error al obtener resumen del dashboard: {}", e.getMessage(), e);
            Map<String, Object> error = new HashMap<>();
            error.put("error", "No se pudo obtener el resumen");
            error.put("detalle", e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }
}
