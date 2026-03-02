package com.styp.cenate.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * v1.82.2 — Fix único de datos históricos.
 * Las solicitudes RECHAZADAS antes de v1.82.2 quedaron con
 * condicion_medica='Pendiente' y estado='PENDIENTE'.
 * Este initializer las corrige al arrancar la aplicación.
 */
@Component
@RequiredArgsConstructor
@Slf4j
@Order(100)
public class FixEstadosSolicitudesRechazadasInitializer implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) {
        try {
            int actualizados = jdbcTemplate.update(
                "UPDATE dim_solicitud_bolsa " +
                "SET condicion_medica = 'Anulado', estado = 'Observado' " +
                "WHERE activo = true " +
                "  AND estado_gestion_citas_id = (" +
                "      SELECT id_estado_cita FROM dim_estados_gestion_citas " +
                "      WHERE cod_estado_cita = 'RECHAZADO' LIMIT 1) " +
                "  AND (condicion_medica <> 'Anulado' OR condicion_medica IS NULL " +
                "       OR estado <> 'Observado' OR estado IS NULL)");

            if (actualizados > 0) {
                log.info("✅ [v1.82.2] Fix estados rechazados: {} solicitud(es) corregidas (condicion_medica=Anulado, estado=Observado)", actualizados);
            } else {
                log.debug("✔️ [v1.82.2] Fix estados rechazados: no hay registros que corregir");
            }
        } catch (Exception e) {
            log.warn("⚠️ [v1.82.2] No se pudo ejecutar fix de estados rechazados: {}", e.getMessage());
        }
    }
}
