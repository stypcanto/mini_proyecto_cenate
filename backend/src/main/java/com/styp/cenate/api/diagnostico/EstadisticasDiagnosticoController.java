package com.styp.cenate.api.diagnostico;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 📊 EstadisticasDiagnosticoController - Estadísticas de Diagnóstico de IPRESS por Redes
 *
 * Endpoints para visualizar estadísticas agregadas de formularios diagnósticos
 * agrupados por Red Asistencial.
 */
@RestController
@RequestMapping("/api/diagnostico/estadisticas")
@RequiredArgsConstructor
@Slf4j
public class EstadisticasDiagnosticoController {

    private final JdbcTemplate jdbcTemplate;

    /**
     * Obtener estadísticas de IPRESS por Red Asistencial
     *
     * @param idMacroregion ID de la macroregión (opcional)
     * @param idRed ID de la red (opcional)
     * @return Lista de estadísticas por red + resumen general
     */
    @GetMapping("/por-red")
    public ResponseEntity<?> obtenerEstadisticasPorRed(
            @org.springframework.web.bind.annotation.RequestParam(required = false) Long idMacroregion,
            @org.springframework.web.bind.annotation.RequestParam(required = false) Long idRed) {

        log.info("📊 Obteniendo estadísticas - Macroregión: {}, Red: {}", idMacroregion, idRed);

        try {
            // Construir WHERE dinámico
            StringBuilder whereClause = new StringBuilder("WHERE r.id_red IS NOT NULL");
            List<Object> params = new ArrayList<>();

            if (idMacroregion != null) {
                whereClause.append(" AND r.id_macro = ?");
                params.add(idMacroregion);
            }

            if (idRed != null) {
                whereClause.append(" AND r.id_red = ?");
                params.add(idRed);
            }

            // Query para estadísticas por red
            String sqlPorRed = """
                SELECT
                    r.id_red,
                    r.desc_red,
                    m.id_macro,
                    m.desc_macro,
                    COUNT(DISTINCT i.id_ipress) as total_ipress,
                    COUNT(DISTINCT CASE
                        WHEN f.estado = 'FIRMADO' OR f.firma_digital IS NOT NULL
                        THEN i.id_ipress
                    END) as firmados,
                    COUNT(DISTINCT CASE WHEN f.estado = 'ENVIADO' THEN i.id_ipress END) as enviados,
                    COUNT(DISTINCT CASE WHEN f.estado = 'EN_PROCESO' THEN i.id_ipress END) as en_proceso
                FROM dim_red r
                LEFT JOIN dim_macroregion m ON m.id_macro = r.id_macro
                LEFT JOIN dim_ipress i ON i.id_red = r.id_red
                LEFT JOIN form_diag_formulario f ON f.id_ipress = i.id_ipress
                """ + whereClause.toString() + """
                GROUP BY r.id_red, r.desc_red, m.id_macro, m.desc_macro
                ORDER BY m.desc_macro, r.desc_red
            """;

            List<Map<String, Object>> estadisticasPorRed = jdbcTemplate.query(
                sqlPorRed,
                params.toArray(),
                (rs, rowNum) -> {
                    Map<String, Object> row = new HashMap<>();
                    row.put("id_red", rs.getLong("id_red"));
                    row.put("desc_red", rs.getString("desc_red"));
                    row.put("id_macro", rs.getLong("id_macro"));
                    row.put("desc_macro", rs.getString("desc_macro"));
                    row.put("total_ipress", rs.getLong("total_ipress"));
                    row.put("firmados", rs.getLong("firmados"));
                    row.put("enviados", rs.getLong("enviados"));
                    row.put("en_proceso", rs.getLong("en_proceso"));

                    return row;
                }
            );

            // Calcular resumen general
            long totalGeneral = 0;
            long firmadosGeneral = 0;
            long enviadosGeneral = 0;
            long enProcesoGeneral = 0;

            for (Map<String, Object> red : estadisticasPorRed) {
                totalGeneral += (Long) red.get("total_ipress");
                firmadosGeneral += (Long) red.get("firmados");
                enviadosGeneral += (Long) red.get("enviados");
                enProcesoGeneral += (Long) red.get("en_proceso");
            }

            Map<String, Object> resumenGeneral = new HashMap<>();
            resumenGeneral.put("total_ipress", totalGeneral);
            resumenGeneral.put("firmados", firmadosGeneral);
            resumenGeneral.put("enviados", enviadosGeneral);
            resumenGeneral.put("en_proceso", enProcesoGeneral);
            resumenGeneral.put("total_redes", estadisticasPorRed.size());

            // Calcular porcentajes
            if (totalGeneral > 0) {
                resumenGeneral.put("porcentaje_firmados", Math.round((firmadosGeneral * 100.0) / totalGeneral));
                resumenGeneral.put("porcentaje_enviados", Math.round((enviadosGeneral * 100.0) / totalGeneral));
                resumenGeneral.put("porcentaje_en_proceso", Math.round((enProcesoGeneral * 100.0) / totalGeneral));
            }

            Map<String, Object> response = new HashMap<>();
            response.put("estadisticas_por_red", estadisticasPorRed);
            response.put("resumen_general", resumenGeneral);

            log.info("✅ Estadísticas calculadas: {} redes, {} IPRESS totales",
                estadisticasPorRed.size(), totalGeneral);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("❌ Error al calcular estadísticas: ", e);
            return ResponseEntity.badRequest()
                .body(Map.of(
                    "error", "Error al calcular estadísticas",
                    "message", e.getMessage()
                ));
        }
    }

    /**
     * Obtener detalle de IPRESS por Red
     *
     * @param idRed ID de la red
     * @return Lista de IPRESS con su estado de formulario
     */
    @GetMapping("/detalle-red")
    public ResponseEntity<?> obtenerDetalleRed(@org.springframework.web.bind.annotation.RequestParam Long idRed) {
        log.info("📋 Obteniendo detalle de IPRESS para Red ID: {}", idRed);

        try {
            String sql = """
                SELECT
                    i.id_ipress,
                    i.desc_ipress,
                    i.cod_ipress,
                    CASE
                        WHEN f.estado = 'ENVIADO' THEN 'ENVIADO'
                        WHEN f.estado = 'EN_PROCESO' THEN 'EN_PROCESO'
                        WHEN f.id_formulario IS NOT NULL THEN 'REGISTRADO'
                        ELSE 'SIN_REGISTRO'
                    END as estado_formulario,
                    f.fecha_creacion,
                    f.fecha_envio,
                    f.nombre_firmante
                FROM dim_ipress i
                LEFT JOIN form_diag_formulario f ON f.id_ipress = i.id_ipress
                WHERE i.id_red = ?
                ORDER BY i.desc_ipress
            """;

            List<Map<String, Object>> detalle = jdbcTemplate.query(
                sql,
                new Object[]{idRed},
                (rs, rowNum) -> {
                    Map<String, Object> row = new HashMap<>();
                    row.put("id_ipress", rs.getLong("id_ipress"));
                    row.put("desc_ipress", rs.getString("desc_ipress"));
                    row.put("cod_ipress", rs.getString("cod_ipress"));
                    row.put("estado_formulario", rs.getString("estado_formulario"));
                    row.put("fecha_creacion", rs.getTimestamp("fecha_creacion"));
                    row.put("fecha_envio", rs.getTimestamp("fecha_envio"));
                    row.put("nombre_firmante", rs.getString("nombre_firmante"));
                    return row;
                }
            );

            log.info("✅ Retornando {} IPRESS para la red {}", detalle.size(), idRed);

            return ResponseEntity.ok(detalle);

        } catch (Exception e) {
            log.error("❌ Error al obtener detalle de red: ", e);
            return ResponseEntity.badRequest()
                .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Obtener lista de macroregiones activas
     *
     * @return Lista de macroregiones
     */
    @GetMapping("/macroregiones")
    public ResponseEntity<?> obtenerMacroregiones() {
        log.info("📍 Obteniendo lista de macroregiones");

        try {
            String sql = """
                SELECT id_macro, desc_macro
                FROM dim_macroregion
                WHERE stat_macro = 'A'
                ORDER BY desc_macro
            """;

            List<Map<String, Object>> macroregiones = jdbcTemplate.query(
                sql,
                (rs, rowNum) -> {
                    Map<String, Object> row = new HashMap<>();
                    row.put("id_macro", rs.getLong("id_macro"));
                    row.put("desc_macro", rs.getString("desc_macro"));
                    return row;
                }
            );

            log.info("✅ Retornando {} macroregiones", macroregiones.size());
            return ResponseEntity.ok(macroregiones);

        } catch (Exception e) {
            log.error("❌ Error al obtener macroregiones: ", e);
            return ResponseEntity.badRequest()
                .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Obtener lista de redes, opcionalmente filtradas por macroregión
     *
     * @param idMacroregion ID de la macroregión (opcional)
     * @return Lista de redes
     */
    @GetMapping("/redes")
    public ResponseEntity<?> obtenerRedes(
            @org.springframework.web.bind.annotation.RequestParam(required = false) Long idMacroregion) {

        log.info("🌐 Obteniendo redes - Macroregión: {}", idMacroregion);

        try {
            StringBuilder sql = new StringBuilder("""
                SELECT r.id_red, r.desc_red, r.id_macro, m.desc_macro
                FROM dim_red r
                LEFT JOIN dim_macroregion m ON m.id_macro = r.id_macro
                WHERE 1=1
            """);

            List<Object> params = new ArrayList<>();

            if (idMacroregion != null) {
                sql.append(" AND r.id_macro = ?");
                params.add(idMacroregion);
            }

            sql.append(" ORDER BY r.desc_red");

            List<Map<String, Object>> redes = jdbcTemplate.query(
                sql.toString(),
                params.toArray(),
                (rs, rowNum) -> {
                    Map<String, Object> row = new HashMap<>();
                    row.put("id_red", rs.getLong("id_red"));
                    row.put("desc_red", rs.getString("desc_red"));
                    row.put("id_macro", rs.getLong("id_macro"));
                    row.put("desc_macro", rs.getString("desc_macro"));
                    return row;
                }
            );

            log.info("✅ Retornando {} redes", redes.size());
            return ResponseEntity.ok(redes);

        } catch (Exception e) {
            log.error("❌ Error al obtener redes: ", e);
            return ResponseEntity.badRequest()
                .body(Map.of("error", e.getMessage()));
        }
    }
}
