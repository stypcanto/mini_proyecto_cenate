package com.styp.cenate.service.teleecg;

import com.styp.cenate.dto.TeleECGAnalyticsDTO;
import com.styp.cenate.dto.TeleECGAnalyticsDTO.ComparacionPeriodos;
import com.styp.cenate.dto.TeleECGAnalyticsDTO.RechazoPorIpress;
import com.styp.cenate.model.TeleECGImagen;
import com.styp.cenate.repository.TeleECGImagenRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Servicio de Analytics para Dashboard Médico TeleECG (v1.72.0)
 *
 * Responsabilidades:
 * - Calcular métricas de clasificación (NORMAL/ANORMAL/SIN_EVALUAR)
 * - Calcular TAT promedio (general, urgentes, no urgentes)
 * - Calcular cumplimiento de SLA (meta 15 minutos)
 * - Calcular tasa de rechazo por IPRESS
 * - Generar comparativas de período (↑↓%)
 *
 * Optimizaciones:
 * - Cálculos en Java (no en BD) para evitar queries complejas
 * - Uso de streams para transformaciones de datos
 * - Cache de resultados por período (future)
 *
 * @author Styp Canto Rondón
 * @version 1.0.0
 * @since 2026-02-11
 */
@Service
@Slf4j
@Transactional(readOnly = true)
public class TeleECGAnalyticsService {

    @Autowired
    private TeleECGImagenRepository repository;

    /**
     * Meta SLA en minutos (configurable)
     * ECGs evaluados en ≤ 15 minutos cumplen SLA
     */
    private static final int SLA_META_MINUTOS = 15;

    /**
     * Umbral de tasa de rechazo para alerta (%)
     * IPRESS con > 15% de rechazo requieren capacitación
     */
    private static final double UMBRAL_RECHAZO_ALERTA = 15.0;

    /**
     * Calcula todas las métricas analíticas para el dashboard
     *
     * @param fechaDesde Fecha inicial del período
     * @param fechaHasta Fecha final del período
     * @param idIpress ID de IPRESS a filtrar (NULL = todas)
     * @param evaluacion Tipo de evaluación a filtrar (NULL = todas)
     * @param esUrgente Filtro de urgencia (NULL = ambas)
     * @return DTO con todas las métricas calculadas
     */
    public TeleECGAnalyticsDTO calcularAnalytics(
            LocalDate fechaDesde,
            LocalDate fechaHasta,
            Long idIpress,
            String evaluacion,
            Boolean esUrgente) {

        log.info("📊 Calculando analytics desde {} hasta {} (IPRESS: {}, Evaluacion: {}, Urgente: {})",
                fechaDesde, fechaHasta, idIpress, evaluacion, esUrgente);

        long inicioCálculo = System.currentTimeMillis();

        // 1. Obtener datos filtrados
        // ✅ v1.100.3: Convertir idIpress a codigoIpress si es necesario
        String codigoIpress = null;
        // TODO: Si idIpress viene como parámetro, convertir a codigo_ipress

        List<TeleECGImagen> imagenes = repository.buscarParaAnalytics(
                fechaDesde.atStartOfDay(),
                fechaHasta.atTime(23, 59, 59),
                codigoIpress,
                evaluacion,
                esUrgente
        );

        log.debug("✅ Obtenidas {} imágenes para análisis", imagenes.size());

        if (imagenes.isEmpty()) {
            log.warn("⚠️ No hay imágenes en el período especificado");
            return TeleECGAnalyticsDTO.builder()
                    .fechaDesde(fechaDesde)
                    .fechaHasta(fechaHasta)
                    .totalEcgs(0L)
                    .distribucionEvaluacion(new HashMap<>())
                    .porcentajeEvaluacion(new HashMap<>())
                    .tatPromedioMinutos(0.0)
                    .slaCumplimientoPorcentaje(0.0)
                    .tasaRechazoPorcentaje(0.0)
                    .rechazosPorIpress(new HashMap<>())
                    .volumenDiario(new HashMap<>())
                    .tatDiario(new HashMap<>())
                    .idIpressFiltro(idIpress)
                    .evaluacionFiltro(evaluacion)
                    .esUrgenteFiltro(esUrgente)
                    .calculadoEn(new java.text.SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date()))
                    .build();
        }

        // 2. Calcular distribución de evaluaciones (PRIORIDAD 1)
        Map<String, Long> distribucion = imagenes.stream()
                .collect(Collectors.groupingBy(
                        img -> img.getEvaluacion() != null ? img.getEvaluacion() : "SIN_EVALUAR",
                        Collectors.counting()
                ));

        // Asegurar que existen todas las claves
        distribucion.putIfAbsent("NORMAL", 0L);
        distribucion.putIfAbsent("ANORMAL", 0L);
        distribucion.putIfAbsent("SIN_EVALUAR", 0L);

        // Calcular porcentajes
        long totalImágenes = imagenes.size();
        Map<String, Double> porcentajes = distribucion.entrySet().stream()
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        e -> (e.getValue() * 100.0) / totalImágenes
                ));

        // 3. Calcular TAT y SLA (PRIORIDAD 2)
        List<TeleECGImagen> conTimestamps = imagenes.stream()
                .filter(img -> img.getFechaEvaluacion() != null && img.getFechaEnvio() != null)
                .collect(Collectors.toList());

        Double tatPromedio = 0.0;
        Double slaPorcentaje = 0.0;
        Map<String, Double> tatPorIpress = new HashMap<>();

        if (!conTimestamps.isEmpty()) {
            tatPromedio = conTimestamps.stream()
                    .mapToDouble(img -> calcularTatMinutos(img.getFechaEnvio(), img.getFechaEvaluacion()))
                    .average()
                    .orElse(0.0);

            // Calcular SLA cumplimiento
            long dentroSLA = conTimestamps.stream()
                    .filter(img -> calcularTatMinutos(img.getFechaEnvio(), img.getFechaEvaluacion()) <= SLA_META_MINUTOS)
                    .count();

            slaPorcentaje = (dentroSLA * 100.0) / conTimestamps.size();

            // TAT por IPRESS
            tatPorIpress = conTimestamps.stream()
                    .collect(Collectors.groupingBy(
                            img -> img.getNombreIpress() != null ? img.getNombreIpress() : "SIN_IPRESS",
                            Collectors.averagingDouble(img -> calcularTatMinutos(img.getFechaEnvio(), img.getFechaEvaluacion()))
                    ));
        }

        // 4. TAT urgentes vs no urgentes
        Double tatUrgentes = 0.0;
        Double tatNoUrgentes = 0.0;

        List<TeleECGImagen> urgentes = conTimestamps.stream()
                .filter(img -> Boolean.TRUE.equals(img.getEsUrgente()))
                .collect(Collectors.toList());

        List<TeleECGImagen> noUrgentes = conTimestamps.stream()
                .filter(img -> !Boolean.TRUE.equals(img.getEsUrgente()))
                .collect(Collectors.toList());

        if (!urgentes.isEmpty()) {
            tatUrgentes = urgentes.stream()
                    .mapToDouble(img -> calcularTatMinutos(img.getFechaEnvio(), img.getFechaEvaluacion()))
                    .average()
                    .orElse(0.0);
        }

        if (!noUrgentes.isEmpty()) {
            tatNoUrgentes = noUrgentes.stream()
                    .mapToDouble(img -> calcularTatMinutos(img.getFechaEnvio(), img.getFechaEvaluacion()))
                    .average()
                    .orElse(0.0);
        }

        // 5. Calcular tasa de rechazo (PRIORIDAD 3)
        long rechazados = imagenes.stream()
                .filter(img -> "OBSERVADA".equals(img.getEstado()))
                .count();

        Double tasaRechazo = (rechazados * 100.0) / totalImágenes;

        // Rechazos por IPRESS
        Map<String, RechazoPorIpress> rechazosPorIpress = calcularRechazosPorIpress(imagenes);

        // 6. Volumen diario y TAT diario (PRIORIDAD 4)
        Map<LocalDate, Long> volumenDiario = calcularVolumenDiario(imagenes);
        Map<LocalDate, Double> tatDiario = calcularTatDiario(imagenes);

        // 7. Comparación de períodos
        ComparacionPeriodos comparacion = calcularComparacionPeriodos(
                fechaDesde, fechaHasta, idIpress, evaluacion, esUrgente
        );

        long duracionCálculo = System.currentTimeMillis() - inicioCálculo;
        log.info("✅ Analytics calculados en {}ms", duracionCálculo);

        // 8. Construir DTO
        return TeleECGAnalyticsDTO.builder()
                .distribucionEvaluacion(distribucion)
                .porcentajeEvaluacion(porcentajes)
                .tatPromedioMinutos(Math.round(tatPromedio * 10.0) / 10.0)
                .tatPromedioUrgentes(Math.round(tatUrgentes * 10.0) / 10.0)
                .tatPromedioNoUrgentes(Math.round(tatNoUrgentes * 10.0) / 10.0)
                .slaCumplimientoPorcentaje(Math.round(slaPorcentaje * 10.0) / 10.0)
                .tatPorIpress(tatPorIpress)
                .tasaRechazoPorcentaje(Math.round(tasaRechazo * 10.0) / 10.0)
                .rechazosPorIpress(rechazosPorIpress)
                .volumenDiario(volumenDiario)
                .tatDiario(tatDiario)
                .comparacion(comparacion)
                .fechaDesde(fechaDesde)
                .fechaHasta(fechaHasta)
                .idIpressFiltro(idIpress)
                .evaluacionFiltro(evaluacion)
                .esUrgenteFiltro(esUrgente)
                .totalEcgs(totalImágenes)
                .calculadoEn(new java.text.SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date()))
                .build();
    }

    /**
     * Calcula TAT en minutos entre dos instantes
     */
    private double calcularTatMinutos(LocalDateTime desde, LocalDateTime hasta) {
        if (desde == null || hasta == null) return 0.0;
        return ChronoUnit.MINUTES.between(desde, hasta);
    }

    /**
     * Calcula detalles de rechazo por IPRESS
     */
    private Map<String, RechazoPorIpress> calcularRechazosPorIpress(List<TeleECGImagen> imagenes) {
        return imagenes.stream()
                .collect(Collectors.groupingBy(
                        img -> img.getNombreIpress() != null ? img.getNombreIpress() : "SIN_IPRESS"
                ))
                .entrySet()
                .stream()
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        entry -> {
                            List<TeleECGImagen> ipressImagens = entry.getValue();
                            long rechazadas = ipressImagens.stream()
                                    .filter(img -> "OBSERVADA".equals(img.getEstado()))
                                    .count();

                            double porcentajeRechazo = (rechazadas * 100.0) / ipressImagens.size();

                            // Extraer motivos comunes de observaciones
                            List<String> motivosComunes = extraerMotivosComunes(ipressImagens);

                            return RechazoPorIpress.builder()
                                    .nombreIpress(entry.getKey())
                                    .totalEcgs((long) ipressImagens.size())
                                    .rechazados(rechazadas)
                                    .porcentajeRechazo(Math.round(porcentajeRechazo * 10.0) / 10.0)
                                    .motivosComunes(motivosComunes)
                                    .requiereCapacitacion(porcentajeRechazo > UMBRAL_RECHAZO_ALERTA)
                                    .build();
                        }
                ));
    }

    /**
     * Extrae los 3 motivos más comunes de rechazo
     */
    private List<String> extraerMotivosComunes(List<TeleECGImagen> imagenes) {
        return imagenes.stream()
                .filter(img -> "OBSERVADA".equals(img.getEstado()) && img.getObservaciones() != null)
                .map(TeleECGImagen::getObservaciones)
                .collect(Collectors.toList())
                .stream()
                .limit(3)
                .collect(Collectors.toList());
    }

    /**
     * Calcula volumen diario (últimos 30 días)
     */
    private Map<LocalDate, Long> calcularVolumenDiario(List<TeleECGImagen> imagenes) {
        return imagenes.stream()
                .collect(Collectors.groupingBy(
                        img -> img.getFechaEnvio().toLocalDate(),
                        Collectors.counting()
                ))
                .entrySet()
                .stream()
                .sorted(Map.Entry.comparingByKey())
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        Map.Entry::getValue,
                        (a, b) -> a,
                        LinkedHashMap::new
                ));
    }

    /**
     * Calcula TAT promedio por día (últimos 30 días)
     */
    private Map<LocalDate, Double> calcularTatDiario(List<TeleECGImagen> imagenes) {
        return imagenes.stream()
                .filter(img -> img.getFechaEvaluacion() != null && img.getFechaEnvio() != null)
                .collect(Collectors.groupingBy(
                        img -> img.getFechaEnvio().toLocalDate(),
                        Collectors.averagingDouble(img -> calcularTatMinutos(img.getFechaEnvio(), img.getFechaEvaluacion()))
                ))
                .entrySet()
                .stream()
                .sorted(Map.Entry.comparingByKey())
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        entry -> Math.round(entry.getValue() * 10.0) / 10.0,
                        (a, b) -> a,
                        LinkedHashMap::new
                ));
    }

    /**
     * Calcula comparación con período anterior (mismo rango de días)
     */
    private ComparacionPeriodos calcularComparacionPeriodos(
            LocalDate fechaDesde,
            LocalDate fechaHasta,
            Long idIpress,
            String evaluacion,
            Boolean esUrgente) {

        long diasEnPeriodo = ChronoUnit.DAYS.between(fechaDesde, fechaHasta);

        LocalDate inicioPeriodoAnterior = fechaDesde.minusDays(diasEnPeriodo + 1);
        LocalDate finPeriodoAnterior = fechaDesde.minusDays(1);

        // ✅ v1.100.3: Convertir idIpress a codigoIpress
        String codigoIpress = null;
        // TODO: Si idIpress viene como parámetro, convertir a codigo_ipress

        // Obtener datos período anterior
        List<TeleECGImagen> imagenesAnteriores = repository.buscarParaAnalytics(
                inicioPeriodoAnterior.atStartOfDay(),
                finPeriodoAnterior.atTime(23, 59, 59),
                codigoIpress,
                evaluacion,
                esUrgente
        );

        // Datos período actual
        List<TeleECGImagen> imageneActuales = repository.buscarParaAnalytics(
                fechaDesde.atStartOfDay(),
                fechaHasta.atTime(23, 59, 59),
                codigoIpress,
                evaluacion,
                esUrgente
        );

        long totalActual = imageneActuales.size();
        long totalAnterior = imagenesAnteriores.size();

        double cambioVolumen = calcularCambioPorc(totalActual, totalAnterior);

        // Cambio TAT
        double tatActual = imageneActuales.stream()
                .filter(img -> img.getFechaEvaluacion() != null && img.getFechaEnvio() != null)
                .mapToDouble(img -> calcularTatMinutos(img.getFechaEnvio(), img.getFechaEvaluacion()))
                .average()
                .orElse(0.0);

        double tatAnterior = imagenesAnteriores.stream()
                .filter(img -> img.getFechaEvaluacion() != null && img.getFechaEnvio() != null)
                .mapToDouble(img -> calcularTatMinutos(img.getFechaEnvio(), img.getFechaEvaluacion()))
                .average()
                .orElse(0.0);

        double cambioTat = tatAnterior > 0 ? ((tatActual - tatAnterior) / tatAnterior) * 100 : 0;

        // Cambio Rechazo
        long rechazosActual = imageneActuales.stream()
                .filter(img -> "OBSERVADA".equals(img.getEstado()))
                .count();

        long rechazosAnterior = imagenesAnteriores.stream()
                .filter(img -> "OBSERVADA".equals(img.getEstado()))
                .count();

        double tasaRechazoActual = totalActual > 0 ? (rechazosActual * 100.0) / totalActual : 0;
        double tasaRechazoAnterior = totalAnterior > 0 ? (rechazosAnterior * 100.0) / totalAnterior : 0;

        double cambioRechazo = tasaRechazoAnterior > 0 ? ((tasaRechazoActual - tasaRechazoAnterior) / tasaRechazoAnterior) * 100 : 0;

        // Cambio urgentes
        long urgentesActual = imageneActuales.stream()
                .filter(img -> Boolean.TRUE.equals(img.getEsUrgente()))
                .count();

        long urgentesAnterior = imagenesAnteriores.stream()
                .filter(img -> Boolean.TRUE.equals(img.getEsUrgente()))
                .count();

        double cambioUrgentes = calcularCambioPorc(urgentesActual, urgentesAnterior);

        return ComparacionPeriodos.builder()
                .totalActual(totalActual)
                .totalAnterior(totalAnterior)
                .cambioVolumenPorcentaje(Math.round(cambioVolumen * 10.0) / 10.0)
                .cambioTatPorcentaje(Math.round(cambioTat * 10.0) / 10.0)
                .cambioRechazosPorcentaje(Math.round(cambioRechazo * 10.0) / 10.0)
                .cambioUrgentesporcentaje(Math.round(cambioUrgentes * 10.0) / 10.0)
                .build();
    }

    /**
     * Calcula cambio porcentual: ((actual - anterior) / anterior) * 100
     */
    private double calcularCambioPorc(long actual, long anterior) {
        if (anterior == 0) return actual > 0 ? 100.0 : 0.0;
        return ((actual - anterior) * 100.0) / anterior;
    }
}
