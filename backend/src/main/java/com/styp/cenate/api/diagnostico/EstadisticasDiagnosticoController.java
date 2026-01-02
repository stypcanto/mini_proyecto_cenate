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
     * @return Lista de estadísticas por red + resumen general
     */
    @GetMapping("/por-red")
    public ResponseEntity<?> obtenerEstadisticasPorRed() {
        log.info("📊 Obteniendo estadísticas de diagnóstico por Red Asistencial");

        try {
            // Query para estadísticas por red
            String sqlPorRed = """
                SELECT
                    r.id_red,
                    r.desc_red,
                    COUNT(DISTINCT i.id_ipress) as total_ipress,
                    COUNT(DISTINCT CASE WHEN f.estado = 'ENVIADO' THEN i.id_ipress END) as enviados,
                    COUNT(DISTINCT CASE WHEN f.estado = 'EN_PROCESO' THEN i.id_ipress END) as en_proceso,
                    COUNT(DISTINCT CASE WHEN f.id_formulario IS NULL THEN i.id_ipress END) as sin_formulario
                FROM dim_red r
                LEFT JOIN dim_ipress i ON i.id_red = r.id_red
                LEFT JOIN form_diag_formulario f ON f.id_ipress = i.id_ipress
                WHERE r.id_red IS NOT NULL
                GROUP BY r.id_red, r.desc_red
                ORDER BY r.desc_red
            """;

            List<Map<String, Object>> estadisticasPorRed = jdbcTemplate.query(
                sqlPorRed,
                (rs, rowNum) -> {
                    Map<String, Object> row = new HashMap<>();
                    row.put("id_red", rs.getLong("id_red"));
                    row.put("desc_red", rs.getString("desc_red"));
                    row.put("total_ipress", rs.getLong("total_ipress"));
                    row.put("enviados", rs.getLong("enviados"));
                    row.put("en_proceso", rs.getLong("en_proceso"));
                    row.put("sin_formulario", rs.getLong("sin_formulario"));

                    // Calcular registradas (tienen formulario pero no enviado)
                    long totalIpress = rs.getLong("total_ipress");
                    long enviados = rs.getLong("enviados");
                    long enProceso = rs.getLong("en_proceso");
                    long sinFormulario = rs.getLong("sin_formulario");
                    long registradas = totalIpress - enviados - enProceso - sinFormulario;

                    row.put("registradas", registradas);

                    return row;
                }
            );

            // Calcular resumen general
            long totalGeneral = 0;
            long enviadosGeneral = 0;
            long enProcesoGeneral = 0;
            long registradasGeneral = 0;
            long sinFormularioGeneral = 0;

            for (Map<String, Object> red : estadisticasPorRed) {
                totalGeneral += (Long) red.get("total_ipress");
                enviadosGeneral += (Long) red.get("enviados");
                enProcesoGeneral += (Long) red.get("en_proceso");
                registradasGeneral += (Long) red.get("registradas");
                sinFormularioGeneral += (Long) red.get("sin_formulario");
            }

            Map<String, Object> resumenGeneral = new HashMap<>();
            resumenGeneral.put("total_ipress", totalGeneral);
            resumenGeneral.put("enviados", enviadosGeneral);
            resumenGeneral.put("en_proceso", enProcesoGeneral);
            resumenGeneral.put("registradas", registradasGeneral);
            resumenGeneral.put("sin_formulario", sinFormularioGeneral);
            resumenGeneral.put("total_redes", estadisticasPorRed.size());

            // Calcular porcentajes
            if (totalGeneral > 0) {
                resumenGeneral.put("porcentaje_enviados", Math.round((enviadosGeneral * 100.0) / totalGeneral));
                resumenGeneral.put("porcentaje_en_proceso", Math.round((enProcesoGeneral * 100.0) / totalGeneral));
                resumenGeneral.put("porcentaje_registradas", Math.round((registradasGeneral * 100.0) / totalGeneral));
                resumenGeneral.put("porcentaje_sin_formulario", Math.round((sinFormularioGeneral * 100.0) / totalGeneral));
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
}
