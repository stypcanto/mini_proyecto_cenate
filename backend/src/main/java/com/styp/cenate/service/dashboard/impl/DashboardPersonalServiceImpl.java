package com.styp.cenate.service.dashboard.impl;

import com.styp.cenate.dto.dashboard.EstadisticaRedDTO;
import com.styp.cenate.dto.dashboard.EstadisticasPersonalDTO;
import com.styp.cenate.service.dashboard.DashboardPersonalService;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.BigInteger;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

/**
 * Implementación del servicio para estadísticas de personal
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class DashboardPersonalServiceImpl implements DashboardPersonalService {

    @PersistenceContext
    private final EntityManager entityManager;

    @Override
    @Transactional(readOnly = true)
    public EstadisticasPersonalDTO obtenerEstadisticasPersonal() {
        log.info("Obteniendo estadísticas de personal interno vs externo");

        // 1. Obtener conteo por origen
        String sqlConteo = """
            SELECT
                dop.desc_origen as origen,
                COUNT(pc.id_pers) as total
            FROM dim_personal_cnt pc
            INNER JOIN dim_origen_personal dop ON dop.id_origen = pc.id_origen
            WHERE pc.stat_pers = 'A'
            GROUP BY dop.desc_origen
            ORDER BY total DESC
        """;

        Query queryConteo = entityManager.createNativeQuery(sqlConteo);
        @SuppressWarnings("unchecked")
        List<Object[]> resultadosConteo = queryConteo.getResultList();

        Long totalInterno = 0L;
        Long totalExterno = 0L;

        for (Object[] row : resultadosConteo) {
            String origen = (String) row[0];
            Long total = ((BigInteger) row[1]).longValue();

            if ("INTERNO".equals(origen)) {
                totalInterno = total;
            } else if ("EXTERNO".equals(origen)) {
                totalExterno = total;
            }
        }

        log.info("Total interno: {}, Total externo: {}", totalInterno, totalExterno);

        // 2. Calcular porcentajes
        Long totalGeneral = totalInterno + totalExterno;
        Double porcentajeInterno = totalGeneral > 0
            ? (totalInterno.doubleValue() / totalGeneral.doubleValue()) * 100
            : 0.0;
        Double porcentajeExterno = totalGeneral > 0
            ? (totalExterno.doubleValue() / totalGeneral.doubleValue()) * 100
            : 0.0;

        // 3. Obtener estadísticas por red (solo externos)
        String sqlPorRed = """
            SELECT
                r.id_red,
                r.desc_red as nombre_red,
                COUNT(DISTINCT pc.id_usuario) as total_usuarios
            FROM dim_personal_cnt pc
            INNER JOIN dim_origen_personal dop ON dop.id_origen = pc.id_origen
            LEFT JOIN dim_ipress i ON i.id_ipress = pc.id_ipress
            LEFT JOIN dim_red r ON r.id_red = i.id_red
            WHERE pc.stat_pers = 'A'
              AND dop.desc_origen = 'EXTERNO'
              AND r.id_red IS NOT NULL
            GROUP BY r.id_red, r.desc_red
            ORDER BY total_usuarios DESC
        """;

        Query queryPorRed = entityManager.createNativeQuery(sqlPorRed);
        @SuppressWarnings("unchecked")
        List<Object[]> resultadosPorRed = queryPorRed.getResultList();

        List<EstadisticaRedDTO> estadisticasRed = new ArrayList<>();
        Long totalRedesConExternos = 0L;

        for (Object[] row : resultadosPorRed) {
            Long idRed = ((BigInteger) row[0]).longValue();
            String nombreRed = (String) row[1];
            Long totalUsuarios = ((BigInteger) row[2]).longValue();

            // Calcular porcentaje respecto al total de externos
            Double porcentaje = totalExterno > 0
                ? BigDecimal.valueOf(totalUsuarios.doubleValue() / totalExterno.doubleValue() * 100)
                    .setScale(2, RoundingMode.HALF_UP)
                    .doubleValue()
                : 0.0;

            EstadisticaRedDTO estadisticaRed = EstadisticaRedDTO.builder()
                    .idRed(idRed)
                    .nombreRed(nombreRed)
                    .totalUsuarios(totalUsuarios)
                    .porcentaje(porcentaje)
                    .build();

            estadisticasRed.add(estadisticaRed);
            totalRedesConExternos++;
        }

        log.info("Total redes con usuarios externos: {}", totalRedesConExternos);

        // 4. Construir y retornar el DTO completo
        return EstadisticasPersonalDTO.builder()
                .totalInterno(totalInterno)
                .totalExterno(totalExterno)
                .porcentajeInterno(BigDecimal.valueOf(porcentajeInterno)
                        .setScale(2, RoundingMode.HALF_UP)
                        .doubleValue())
                .porcentajeExterno(BigDecimal.valueOf(porcentajeExterno)
                        .setScale(2, RoundingMode.HALF_UP)
                        .doubleValue())
                .estadisticasPorRed(estadisticasRed)
                .totalRedesConExternos(totalRedesConExternos)
                .build();
    }
}
