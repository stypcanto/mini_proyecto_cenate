package com.styp.cenate.service.adherencia;

import com.styp.cenate.dto.AdherenciaEstadoDTO;
import com.styp.cenate.repository.AdherenciaTratamientoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;

/**
 * Servicio para calcular adherencia al tratamiento
 *
 * @author Claude Code + Styp Canto Rondón
 * @version 1.0.0
 * @since 2026-01-03
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdherenciaService {

    private final AdherenciaTratamientoRepository adherenciaRepository;

    /**
     * Calcular adherencia de un paciente en un período específico
     * 
     * @param pkAsegurado ID del paciente
     * @param diasAtras   Días hacia atrás para calcular (por defecto 30)
     * @return Estado de adherencia con porcentaje y clasificación
     */
    public AdherenciaEstadoDTO calcularAdherenciaPaciente(String pkAsegurado, Integer diasAtras) {
        log.info("📊 Calculando adherencia para paciente: {} ({} días)", pkAsegurado, diasAtras);

        if (diasAtras == null || diasAtras <= 0) {
            diasAtras = 30; // Por defecto 30 días
        }

        OffsetDateTime fechaFin = OffsetDateTime.now();
        OffsetDateTime fechaInicio = fechaFin.minusDays(diasAtras);

        Object[] resultado = adherenciaRepository.calcularAdherencia(pkAsegurado, fechaInicio, fechaFin);

        return construirEstadoAdherencia(pkAsegurado, null, resultado, diasAtras);
    }

    /**
     * Calcular adherencia para una atención específica
     */
    public AdherenciaEstadoDTO calcularAdherenciaPorAtencion(Long idAtencion) {
        log.info("📊 Calculando adherencia para atención ID: {}", idAtencion);

        Object[] resultado = adherenciaRepository.calcularAdherenciaPorAtencion(idAtencion);

        return construirEstadoAdherencia(null, idAtencion, resultado, null);
    }

    /**
     * Construir DTO de estado de adherencia a partir del resultado de consulta
     */
    private AdherenciaEstadoDTO construirEstadoAdherencia(
            String pkAsegurado,
            Long idAtencion,
            Object[] resultado,
            Integer dias) {
        Long totalDosis = resultado[0] != null ? ((Number) resultado[0]).longValue() : 0L;
        Long dosisTomadas = resultado[1] != null ? ((Number) resultado[1]).longValue() : 0L;

        Double porcentaje = null;
        if (totalDosis > 0) {
            porcentaje = (dosisTomadas.doubleValue() / totalDosis.doubleValue()) * 100.0;
        }

        AdherenciaEstadoDTO.NivelAdherencia nivel = AdherenciaEstadoDTO.NivelAdherencia.fromPorcentaje(porcentaje);

        AdherenciaEstadoDTO estado = AdherenciaEstadoDTO.builder()
                .pkAsegurado(pkAsegurado)
                .idAtencion(idAtencion)
                .totalDosis(totalDosis)
                .dosisTomadas(dosisTomadas)
                .porcentajeAdherencia(porcentaje)
                .nivelAdherencia(nivel)
                .diasMonitoreados(dias)
                .build();

        log.info("✅ Adherencia calculada: {}% ({}/{}) - Nivel: {}",
                porcentaje != null ? String.format("%.1f", porcentaje) : "N/A",
                dosisTomadas,
                totalDosis,
                nivel);

        return estado;
    }
}
