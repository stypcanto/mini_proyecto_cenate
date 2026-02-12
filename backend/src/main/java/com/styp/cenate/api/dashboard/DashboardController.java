package com.styp.cenate.api.dashboard;
import lombok.extern.slf4j.Slf4j;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.styp.cenate.repository.AuditLogRepository;
import com.styp.cenate.repository.segu.RolRepository;
import com.styp.cenate.repository.UsuarioRepository;
import com.styp.cenate.repository.IpressRepository;
import com.styp.cenate.repository.mbac.PermisoModularRepository;
import com.zaxxer.hikari.HikariDataSource;
import com.zaxxer.hikari.HikariPoolMXBean;

import javax.sql.DataSource;
import java.lang.management.ManagementFactory;
import java.lang.management.MemoryMXBean;
import java.lang.management.RuntimeMXBean;
import java.sql.Connection;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
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
        "http://10.0.89.241:3000",
        "http://10.0.89.241:5173",
        "http://10.0.89.239"
})
@PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
public class DashboardController {

    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final AuditLogRepository auditLogRepository;
    private final IpressRepository ipressRepository;
    private final PermisoModularRepository permisoModularRepository;
    private final DataSource dataSource;

    @Value("${spring.datasource.url:jdbc:postgresql://10.0.89.241:5432/maestro_cenate}")
    private String databaseUrl;

    @Value("${jwt.secret:}")
    private String jwtSecret;

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

            // 📊 Indicadores adicionales (datos dinámicos desde BD)
            try (Connection conn = dataSource.getConnection()) {
                // Áreas, Profesiones, Regímenes
                String queryIndicadores = """
                    SELECT
                        (SELECT COUNT(*) FROM dim_area) as total_areas,
                        (SELECT COUNT(*) FROM form_diag_cat_categoria_profesional) as total_profesiones,
                        (SELECT COUNT(*) FROM dim_regimen_laboral) as total_regimenes
                    """;

                try (var stmt = conn.createStatement();
                     var rs = stmt.executeQuery(queryIndicadores)) {
                    if (rs.next()) {
                        stats.put("totalAreas", rs.getLong("total_areas"));
                        stats.put("totalProfesiones", rs.getLong("total_profesiones"));
                        stats.put("totalRegimenes", rs.getLong("total_regimenes"));
                    }
                }
            } catch (Exception e) {
                log.warn("⚠️ Error al obtener indicadores adicionales: {}", e.getMessage());
                // Valores por defecto en caso de error
                stats.put("totalAreas", 0);
                stats.put("totalProfesiones", 0);
                stats.put("totalRegimenes", 0);
            }

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

    // ===========================================================
    // 👥 3️⃣ Estadísticas de Personal Interno vs Externo
    // ===========================================================
    @GetMapping("/estadisticas-personal")
    public ResponseEntity<Map<String, Object>> obtenerEstadisticasPersonal() {
        try {
            Map<String, Object> estadisticas = new LinkedHashMap<>();

            // Obtener distribución CORRECTA de usuarios (evitando duplicados)
            // Prioridad: Si un usuario tiene personal externo, se cuenta como externo
            long totalInterno = 0;
            long totalExterno = 0;
            long totalGeneral = 0;
            long totalConAmbos = 0;

            try (Connection conn = dataSource.getConnection()) {
                String queryDistribucion = """
                    SELECT
                        COUNT(*) as total_usuarios,
                        COUNT(DISTINCT CASE WHEN pc.id_usuario IS NOT NULL AND pe.id_user IS NULL THEN u.id_user END) as solo_interno,
                        COUNT(DISTINCT CASE WHEN pe.id_user IS NOT NULL THEN u.id_user END) as externo_o_ambos,
                        COUNT(DISTINCT CASE WHEN pc.id_usuario IS NOT NULL AND pe.id_user IS NOT NULL THEN u.id_user END) as con_ambos
                    FROM dim_usuarios u
                    LEFT JOIN dim_personal_cnt pc ON u.id_user = pc.id_usuario
                    LEFT JOIN dim_personal_externo pe ON u.id_user = pe.id_user
                    WHERE u.stat_user IN ('A', 'ACTIVO')
                    """;

                try (var stmt = conn.createStatement();
                     var rs = stmt.executeQuery(queryDistribucion)) {
                    if (rs.next()) {
                        totalGeneral = rs.getLong("total_usuarios");
                        totalInterno = rs.getLong("solo_interno");
                        totalExterno = rs.getLong("externo_o_ambos");
                        totalConAmbos = rs.getLong("con_ambos");
                    }
                }
            }

            estadisticas.put("totalInterno", totalInterno);
            estadisticas.put("totalExterno", totalExterno);
            estadisticas.put("totalGeneral", totalGeneral);
            estadisticas.put("totalConAmbos", totalConAmbos); // Usuarios con ambos tipos de personal

            // Calcular porcentajes
            double porcentajeInterno = totalGeneral > 0 ? (totalInterno * 100.0 / totalGeneral) : 0.0;
            double porcentajeExterno = totalGeneral > 0 ? (totalExterno * 100.0 / totalGeneral) : 0.0;

            estadisticas.put("porcentajeInterno", Math.round(porcentajeInterno * 100.0) / 100.0);
            estadisticas.put("porcentajeExterno", Math.round(porcentajeExterno * 100.0) / 100.0);

            // Obtener desglose de personal externo por red (reusar la conexión)
            try (Connection conn2 = dataSource.getConnection()) {
                String queryRedesExternos = """
                    SELECT
                        r.id_red,
                        r.desc_red as nombre_red,
                        COUNT(DISTINCT pe.id_user) as total_usuarios
                    FROM dim_personal_externo pe
                    INNER JOIN dim_ipress i ON pe.id_ipress = i.id_ipress
                    INNER JOIN dim_red r ON i.id_red = r.id_red
                    INNER JOIN dim_usuarios u ON u.id_user = pe.id_user
                    WHERE u.stat_user IN ('A', 'ACTIVO')
                    GROUP BY r.id_red, r.desc_red
                    HAVING COUNT(DISTINCT pe.id_user) > 0
                    ORDER BY total_usuarios DESC
                    """;

                List<Map<String, Object>> estadisticasPorRed = new ArrayList<>();
                long totalRedesConExternos = 0;

                try (var stmt = conn2.createStatement();
                     var rs = stmt.executeQuery(queryRedesExternos)) {
                    while (rs.next()) {
                        Map<String, Object> red = new LinkedHashMap<>();
                        red.put("idRed", rs.getLong("id_red"));
                        red.put("nombreRed", rs.getString("nombre_red"));
                        long totalUsuarios = rs.getLong("total_usuarios");
                        red.put("totalUsuarios", totalUsuarios);
                        double porcentaje = totalExterno > 0 ? (totalUsuarios * 100.0 / totalExterno) : 0.0;
                        red.put("porcentaje", Math.round(porcentaje * 100.0) / 100.0);
                        estadisticasPorRed.add(red);
                        totalRedesConExternos++;
                    }
                }

                estadisticas.put("estadisticasPorRed", estadisticasPorRed);
                estadisticas.put("totalRedesConExternos", totalRedesConExternos);
            }

            log.info("📊 Estadísticas de personal: {} internos, {} externos, {} total",
                    totalInterno, totalExterno, totalGeneral);

            return ResponseEntity.ok(estadisticas);

        } catch (Exception e) {
            log.error("❌ Error al obtener estadísticas de personal: {}", e.getMessage(), e);
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Error al obtener estadísticas de personal");
            error.put("detalle", e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }

    // ===========================================================
    // 🖥️ 4️⃣ Estado del Sistema (Health Check)
    // ===========================================================
    @GetMapping("/system-health")
    public ResponseEntity<Map<String, Object>> obtenerEstadoSistema() {
        Map<String, Object> healthData = new LinkedHashMap<>();

        try {
            // ═══════════════════════════════════════════════════════════
            // 🖥️ SERVIDOR DE APLICACIÓN
            // ═══════════════════════════════════════════════════════════
            Map<String, Object> servidor = new LinkedHashMap<>();

            // Memoria JVM
            MemoryMXBean memoryBean = ManagementFactory.getMemoryMXBean();
            long heapUsed = memoryBean.getHeapMemoryUsage().getUsed();
            long heapMax = memoryBean.getHeapMemoryUsage().getMax();
            long heapCommitted = memoryBean.getHeapMemoryUsage().getCommitted();

            double memoryUsagePercent = (heapUsed * 100.0) / heapMax;

            servidor.put("memoriaUsada", formatBytes(heapUsed));
            servidor.put("memoriaTotal", formatBytes(heapMax));
            servidor.put("memoriaAsignada", formatBytes(heapCommitted));
            servidor.put("memoriaUsadaPorcentaje", Math.round(memoryUsagePercent * 100.0) / 100.0);
            servidor.put("memoriaLibre", formatBytes(heapMax - heapUsed));

            // Uptime
            RuntimeMXBean runtimeBean = ManagementFactory.getRuntimeMXBean();
            long uptimeMs = runtimeBean.getUptime();
            Duration uptime = Duration.ofMillis(uptimeMs);
            servidor.put("uptime", formatUptime(uptime));
            servidor.put("uptimeMs", uptimeMs);
            servidor.put("inicioAplicacion", LocalDateTime.now().minusNanos(uptimeMs * 1_000_000)
                    .format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss")));

            // Info del sistema
            servidor.put("javaVersion", System.getProperty("java.version"));
            servidor.put("javaVendor", System.getProperty("java.vendor"));
            servidor.put("osName", System.getProperty("os.name"));
            servidor.put("osArch", System.getProperty("os.arch"));
            servidor.put("cpuCores", Runtime.getRuntime().availableProcessors());
            servidor.put("ip", "10.0.89.239");
            servidor.put("puerto", 8080);
            servidor.put("estado", memoryUsagePercent < 90 ? "OPERATIVO" : "ALERTA_MEMORIA");
            servidor.put("estadoColor", memoryUsagePercent < 90 ? "green" : "yellow");

            healthData.put("servidor", servidor);

            // ═══════════════════════════════════════════════════════════
            // 🗄️ BASE DE DATOS
            // ═══════════════════════════════════════════════════════════
            Map<String, Object> database = new LinkedHashMap<>();

            // Extraer host de la URL
            String dbHost = extractHostFromUrl(databaseUrl);
            database.put("host", dbHost);
            database.put("url", databaseUrl.replaceAll("password=[^&]*", "password=***"));

            // Test de conexión y tiempo de respuesta
            long startTime = System.currentTimeMillis();
            boolean dbConnected = false;
            String dbVersion = "Desconocida";
            String dbError = null;

            try (Connection conn = dataSource.getConnection()) {
                // Ejecutar query simple para medir tiempo de respuesta
                try (var stmt = conn.createStatement();
                     var rs = stmt.executeQuery("SELECT version(), now()")) {
                    if (rs.next()) {
                        dbVersion = rs.getString(1);
                        dbConnected = true;
                    }
                }

                // ═══════════════════════════════════════════════════════════
                // 📊 Métricas de memoria y estadísticas de PostgreSQL
                // ═══════════════════════════════════════════════════════════
                Map<String, Object> pgStats = new LinkedHashMap<>();

                // Configuración de memoria de PostgreSQL
                try (var stmtMem = conn.createStatement();
                     var rsMem = stmtMem.executeQuery("""
                         SELECT
                             current_setting('shared_buffers') as shared_buffers,
                             current_setting('effective_cache_size') as effective_cache_size,
                             current_setting('work_mem') as work_mem,
                             current_setting('maintenance_work_mem') as maintenance_work_mem
                         """)) {
                    if (rsMem.next()) {
                        pgStats.put("sharedBuffers", rsMem.getString("shared_buffers"));
                        pgStats.put("effectiveCacheSize", rsMem.getString("effective_cache_size"));
                        pgStats.put("workMem", rsMem.getString("work_mem"));
                        pgStats.put("maintenanceWorkMem", rsMem.getString("maintenance_work_mem"));
                    }
                }

                // Tamaño de la base de datos
                try (var stmtSize = conn.createStatement();
                     var rsSize = stmtSize.executeQuery("""
                         SELECT
                             pg_database.datname as nombre,
                             pg_size_pretty(pg_database_size(pg_database.datname)) as tamano,
                             pg_database_size(pg_database.datname) as tamano_bytes
                         FROM pg_database
                         WHERE datname = current_database()
                         """)) {
                    if (rsSize.next()) {
                        pgStats.put("nombreBD", rsSize.getString("nombre"));
                        pgStats.put("tamanoBD", rsSize.getString("tamano"));
                        pgStats.put("tamanoBDBytes", rsSize.getLong("tamano_bytes"));
                    }
                }

                // Conexiones activas totales en el servidor
                try (var stmtConn = conn.createStatement();
                     var rsConn = stmtConn.executeQuery("""
                         SELECT
                             count(*) as total_conexiones,
                             count(*) FILTER (WHERE state = 'active') as activas,
                             count(*) FILTER (WHERE state = 'idle') as inactivas,
                             count(*) FILTER (WHERE state = 'idle in transaction') as idle_transaccion,
                             (SELECT setting::int FROM pg_settings WHERE name = 'max_connections') as max_conexiones
                         FROM pg_stat_activity
                         WHERE datname = current_database()
                         """)) {
                    if (rsConn.next()) {
                        pgStats.put("conexionesTotalesServidor", rsConn.getInt("total_conexiones"));
                        pgStats.put("conexionesActivasServidor", rsConn.getInt("activas"));
                        pgStats.put("conexionesInactivasServidor", rsConn.getInt("inactivas"));
                        pgStats.put("conexionesIdleTransaccion", rsConn.getInt("idle_transaccion"));
                        pgStats.put("maxConexionesPermitidas", rsConn.getInt("max_conexiones"));
                    }
                }

                // Cache hit ratio (eficiencia del cache)
                try (var stmtCache = conn.createStatement();
                     var rsCache = stmtCache.executeQuery("""
                         SELECT
                             ROUND(
                                 CASE
                                     WHEN (blks_hit + blks_read) = 0 THEN 0
                                     ELSE (blks_hit::numeric / (blks_hit + blks_read) * 100)
                                 END, 2
                             ) as cache_hit_ratio
                         FROM pg_stat_database
                         WHERE datname = current_database()
                         """)) {
                    if (rsCache.next()) {
                        double cacheHitRatio = rsCache.getDouble("cache_hit_ratio");
                        pgStats.put("cacheHitRatio", cacheHitRatio);
                        pgStats.put("cacheHitRatioTexto", cacheHitRatio + "%");
                        pgStats.put("cacheEstado", cacheHitRatio > 95 ? "EXCELENTE" :
                                                   cacheHitRatio > 85 ? "BUENO" : "MEJORABLE");
                    }
                }

                // Uptime del servidor PostgreSQL
                try (var stmtUptime = conn.createStatement();
                     var rsUptime = stmtUptime.executeQuery("""
                         SELECT
                             pg_postmaster_start_time() as inicio,
                             now() - pg_postmaster_start_time() as uptime
                         """)) {
                    if (rsUptime.next()) {
                        pgStats.put("inicioServidor", rsUptime.getTimestamp("inicio").toString());
                        pgStats.put("uptimeServidor", rsUptime.getString("uptime"));
                    }
                }

                database.put("estadisticas", pgStats);

            } catch (Exception e) {
                dbError = e.getMessage();
                log.warn("⚠️ Error al conectar con la base de datos: {}", e.getMessage());
            }

            long responseTime = System.currentTimeMillis() - startTime;

            database.put("conectado", dbConnected);
            database.put("tiempoRespuesta", responseTime + " ms");
            database.put("tiempoRespuestaMs", responseTime);
            database.put("version", dbVersion.length() > 50 ? dbVersion.substring(0, 50) + "..." : dbVersion);
            database.put("estado", dbConnected ? "OPERATIVO" : "ERROR");
            database.put("estadoColor", dbConnected ? "green" : "red");

            if (dbError != null) {
                database.put("error", dbError);
            }

            // Pool de conexiones (HikariCP)
            if (dataSource instanceof HikariDataSource hikariDS) {
                HikariPoolMXBean poolMXBean = hikariDS.getHikariPoolMXBean();
                if (poolMXBean != null) {
                    Map<String, Object> pool = new LinkedHashMap<>();
                    pool.put("nombre", hikariDS.getPoolName());
                    pool.put("conexionesActivas", poolMXBean.getActiveConnections());
                    pool.put("conexionesInactivas", poolMXBean.getIdleConnections());
                    pool.put("conexionesTotales", poolMXBean.getTotalConnections());
                    pool.put("conexionesEnEspera", poolMXBean.getThreadsAwaitingConnection());
                    pool.put("maxPoolSize", hikariDS.getMaximumPoolSize());
                    pool.put("minIdle", hikariDS.getMinimumIdle());

                    int usedPercent = (poolMXBean.getActiveConnections() * 100) / hikariDS.getMaximumPoolSize();
                    pool.put("usoPorcentaje", usedPercent);
                    pool.put("estadoPool", usedPercent < 80 ? "SALUDABLE" : "ALTA_DEMANDA");

                    database.put("pool", pool);
                }
            }

            healthData.put("baseDatos", database);

            // ═══════════════════════════════════════════════════════════
            // ⚙️ SERVICIOS DEL SISTEMA
            // ═══════════════════════════════════════════════════════════
            Map<String, Object> servicios = new LinkedHashMap<>();

            // JWT
            Map<String, Object> jwt = new LinkedHashMap<>();
            boolean jwtConfigured = jwtSecret != null && jwtSecret.length() >= 32;
            jwt.put("configurado", jwtConfigured);
            jwt.put("estado", jwtConfigured ? "OPERATIVO" : "NO_CONFIGURADO");
            jwt.put("estadoColor", jwtConfigured ? "green" : "red");
            servicios.put("jwt", jwt);

            // MBAC
            Map<String, Object> mbac = new LinkedHashMap<>();
            long totalPermisos = permisoModularRepository.count();
            mbac.put("permisosConfigurados", totalPermisos);
            mbac.put("estado", totalPermisos > 0 ? "ACTIVO" : "SIN_CONFIGURAR");
            mbac.put("estadoColor", totalPermisos > 0 ? "green" : "yellow");
            servicios.put("mbac", mbac);

            // Auditoría
            Map<String, Object> auditoria = new LinkedHashMap<>();
            LocalDateTime hace1h = LocalDateTime.now().minusHours(1);
            long logsUltimaHora = auditLogRepository.countByFechaHoraBetween(hace1h, LocalDateTime.now());
            long totalLogs = auditLogRepository.count();
            auditoria.put("totalRegistros", totalLogs);
            auditoria.put("ultimaHora", logsUltimaHora);
            auditoria.put("estado", "ACTIVO");
            auditoria.put("estadoColor", "green");
            servicios.put("auditoria", auditoria);

            healthData.put("servicios", servicios);

            // ═══════════════════════════════════════════════════════════
            // 📊 RESUMEN GENERAL
            // ═══════════════════════════════════════════════════════════
            Map<String, Object> resumen = new LinkedHashMap<>();
            boolean todoOperativo = dbConnected && jwtConfigured && memoryUsagePercent < 90;
            resumen.put("estadoGeneral", todoOperativo ? "TODOS LOS SISTEMAS OPERATIVOS" : "REVISAR ALERTAS");
            resumen.put("estadoGeneralColor", todoOperativo ? "green" : "yellow");
            resumen.put("timestamp", LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss")));
            resumen.put("timestampISO", LocalDateTime.now().toString());

            healthData.put("resumen", resumen);

            return ResponseEntity.ok(healthData);

        } catch (Exception e) {
            log.error("❌ Error al obtener estado del sistema: {}", e.getMessage(), e);
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Error al obtener estado del sistema");
            error.put("detalle", e.getMessage());
            error.put("timestamp", LocalDateTime.now().toString());
            return ResponseEntity.internalServerError().body(error);
        }
    }

    // ===========================================================
    // 🛠️ Métodos auxiliares para System Health
    // ===========================================================

    private String formatBytes(long bytes) {
        if (bytes < 1024) return bytes + " B";
        int exp = (int) (Math.log(bytes) / Math.log(1024));
        String pre = "KMGTPE".charAt(exp - 1) + "";
        return String.format("%.1f %sB", bytes / Math.pow(1024, exp), pre);
    }

    private String formatUptime(Duration duration) {
        long days = duration.toDays();
        long hours = duration.toHoursPart();
        long minutes = duration.toMinutesPart();
        long seconds = duration.toSecondsPart();

        if (days > 0) {
            return String.format("%d días, %d horas, %d min", days, hours, minutes);
        } else if (hours > 0) {
            return String.format("%d horas, %d min, %d seg", hours, minutes, seconds);
        } else if (minutes > 0) {
            return String.format("%d min, %d seg", minutes, seconds);
        } else {
            return String.format("%d segundos", seconds);
        }
    }

    private String extractHostFromUrl(String url) {
        try {
            // jdbc:postgresql://10.0.89.241:5432/maestro_cenate
            String withoutPrefix = url.replace("jdbc:postgresql://", "");
            int slashIndex = withoutPrefix.indexOf('/');
            return slashIndex > 0 ? withoutPrefix.substring(0, slashIndex) : withoutPrefix;
        } catch (Exception e) {
            return "Desconocido";
        }
    }
}
