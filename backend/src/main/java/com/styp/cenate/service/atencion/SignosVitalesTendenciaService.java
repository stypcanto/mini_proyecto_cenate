package com.styp.cenate.service.atencion;

import com.styp.cenate.dto.SignosVitalesComparativoDTO;
import com.styp.cenate.model.AtencionClinica;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Duration;

/**
 * Servicio auxiliar para calcular tendencias de signos vitales
 * comparando dos atenciones clínicas
 *
 * @author Claude Code + Styp Canto Rondón
 * @version 2.0.0
 * @since 2026-01-03
 */
@Slf4j
@Service
public class SignosVitalesTendenciaService {

    /**
     * Calcula las tendencias comparando la atención actual con la anterior
     *
     * @param atencionActual   Atención actual (más reciente)
     * @param atencionAnterior Atención anterior (puede ser null si es la primera)
     * @return DTO con comparación y tendencias
     */
    public SignosVitalesComparativoDTO calcularTendencias(
            AtencionClinica atencionActual,
            AtencionClinica atencionAnterior) {
        SignosVitalesComparativoDTO.SignosVitalesComparativoDTOBuilder builder = SignosVitalesComparativoDTO.builder();

        // Valores actuales
        builder.presionArterialActual(atencionActual.getPresionArterial());
        builder.temperaturaActual(atencionActual.getTemperatura());
        builder.saturacionO2Actual(atencionActual.getSaturacionO2());
        builder.frecuenciaCardiacaActual(atencionActual.getFrecuenciaCardiaca());

        // Si hay atención anterior, calcular tendencias
        if (atencionAnterior != null) {
            builder.hayAtencionAnterior(true);

            // Valores anteriores
            builder.presionArterialAnterior(atencionAnterior.getPresionArterial());
            builder.temperaturaAnterior(atencionAnterior.getTemperatura());
            builder.saturacionO2Anterior(atencionAnterior.getSaturacionO2());
            builder.frecuenciaCardiacaAnterior(atencionAnterior.getFrecuenciaCardiaca());

            // Calcular días desde última atención
            long dias = Duration.between(
                    atencionAnterior.getFechaAtencion(),
                    atencionActual.getFechaAtencion()).toDays();
            builder.diasDesdeUltimaAtencion(dias);

            // Calcular tendencias
            builder.tendenciaPresionArterial(
                    calcularTendenciaPresionArterial(
                            atencionActual.getPresionArterial(),
                            atencionAnterior.getPresionArterial()));

            builder.tendenciaSaturacionO2(
                    calcularTendenciaSaturacionO2(
                            atencionActual.getSaturacionO2(),
                            atencionAnterior.getSaturacionO2()));

            builder.tendenciaTemperatura(
                    calcularTendenciaTemperatura(
                            atencionActual.getTemperatura(),
                            atencionAnterior.getTemperatura()));

            builder.tendenciaFrecuenciaCardiaca(
                    calcularTendenciaFrecuenciaCardiaca(
                            atencionActual.getFrecuenciaCardiaca(),
                            atencionAnterior.getFrecuenciaCardiaca()));
        } else {
            builder.hayAtencionAnterior(false);
            builder.diasDesdeUltimaAtencion(null);

            // Sin datos anteriores
            builder.tendenciaPresionArterial(SignosVitalesComparativoDTO.TendenciaSignoVital.SIN_DATOS);
            builder.tendenciaSaturacionO2(SignosVitalesComparativoDTO.TendenciaSignoVital.SIN_DATOS);
            builder.tendenciaTemperatura(SignosVitalesComparativoDTO.TendenciaSignoVital.SIN_DATOS);
            builder.tendenciaFrecuenciaCardiaca(SignosVitalesComparativoDTO.TendenciaSignoVital.SIN_DATOS);
        }

        return builder.build();
    }

    /**
     * Calcular tendencia de presión arterial
     * Se considera mejorando si disminuyó, empeorando si aumentó
     */
    private SignosVitalesComparativoDTO.TendenciaSignoVital calcularTendenciaPresionArterial(
            String actual,
            String anterior) {
        if (actual == null || anterior == null) {
            return SignosVitalesComparativoDTO.TendenciaSignoVital.SIN_DATOS;
        }

        try {
            // Extraer sistólica de cada medición
            int sistolicaActual = Integer.parseInt(actual.split("/")[0].trim());
            int sistolicaAnterior = Integer.parseInt(anterior.split("/")[0].trim());

            int diferencia = sistolicaActual - sistolicaAnterior;

            // Cambio menor a 5 mmHg se considera estable
            if (Math.abs(diferencia) < 5) {
                return SignosVitalesComparativoDTO.TendenciaSignoVital.ESTABLE;
            }

            // Si bajó, está mejorando (para hipertensión)
            if (diferencia < 0) {
                return SignosVitalesComparativoDTO.TendenciaSignoVital.MEJORANDO;
            }

            // Si subió, está empeorando
            return SignosVitalesComparativoDTO.TendenciaSignoVital.EMPEORANDO;

        } catch (Exception e) {
            log.warn("Error al calcular tendencia de presión arterial", e);
            return SignosVitalesComparativoDTO.TendenciaSignoVital.SIN_DATOS;
        }
    }

    /**
     * Calcular tendencia de saturación de oxígeno
     * Se considera mejorando si aumentó, empeorando si disminuyó
     */
    private SignosVitalesComparativoDTO.TendenciaSignoVital calcularTendenciaSaturacionO2(
            Integer actual,
            Integer anterior) {
        if (actual == null || anterior == null) {
            return SignosVitalesComparativoDTO.TendenciaSignoVital.SIN_DATOS;
        }

        int diferencia = actual - anterior;

        // Cambio menor a 2% se considera estable
        if (Math.abs(diferencia) < 2) {
            return SignosVitalesComparativoDTO.TendenciaSignoVital.ESTABLE;
        }

        // Si aumentó, está mejorando
        if (diferencia > 0) {
            return SignosVitalesComparativoDTO.TendenciaSignoVital.MEJORANDO;
        }

        // Si disminuyó, está empeorando
        return SignosVitalesComparativoDTO.TendenciaSignoVital.EMPEORANDO;
    }

    /**
     * Calcular tendencia de temperatura
     * Se considera mejorando si se acerca a 37°C, empeorando si se aleja
     */
    private SignosVitalesComparativoDTO.TendenciaSignoVital calcularTendenciaTemperatura(
            BigDecimal actual,
            BigDecimal anterior) {
        if (actual == null || anterior == null) {
            return SignosVitalesComparativoDTO.TendenciaSignoVital.SIN_DATOS;
        }

        double tempActual = actual.doubleValue();
        double tempAnterior = anterior.doubleValue();
        double tempNormal = 37.0;

        // Distancia a la temperatura normal
        double distanciaActual = Math.abs(tempActual - tempNormal);
        double distanciaAnterior = Math.abs(tempAnterior - tempNormal);

        // Cambio menor a 0.3°C se considera estable
        if (Math.abs(distanciaActual - distanciaAnterior) < 0.3) {
            return SignosVitalesComparativoDTO.TendenciaSignoVital.ESTABLE;
        }

        // Si se acercó a la normalidad, está mejorando
        if (distanciaActual < distanciaAnterior) {
            return SignosVitalesComparativoDTO.TendenciaSignoVital.MEJORANDO;
        }

        // Si se alejó de la normalidad, está empeorando
        return SignosVitalesComparativoDTO.TendenciaSignoVital.EMPEORANDO;
    }

    /**
     * Calcular tendencia de frecuencia cardíaca
     * Se considera mejorando si se acerca a 80 lpm, empeorando si se aleja
     */
    private SignosVitalesComparativoDTO.TendenciaSignoVital calcularTendenciaFrecuenciaCardiaca(
            Integer actual,
            Integer anterior) {
        if (actual == null || anterior == null) {
            return SignosVitalesComparativoDTO.TendenciaSignoVital.SIN_DATOS;
        }

        int fcNormal = 80; // Centro del rango normal (60-100)

        // Distancia a la FC normal
        int distanciaActual = Math.abs(actual - fcNormal);
        int distanciaAnterior = Math.abs(anterior - fcNormal);

        // Cambio menor a 5 lpm se considera estable
        if (Math.abs(distanciaActual - distanciaAnterior) < 5) {
            return SignosVitalesComparativoDTO.TendenciaSignoVital.ESTABLE;
        }

        // Si se acercó a la normalidad, está mejorando
        if (distanciaActual < distanciaAnterior) {
            return SignosVitalesComparativoDTO.TendenciaSignoVital.MEJORANDO;
        }

        // Si se alejó de la normalidad, está empeorando
        return SignosVitalesComparativoDTO.TendenciaSignoVital.EMPEORANDO;
    }
}
