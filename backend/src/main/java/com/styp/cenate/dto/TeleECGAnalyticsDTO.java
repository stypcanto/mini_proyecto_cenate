package com.styp.cenate.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.Map;
import java.util.List;

/**
 * DTO para Analytics Médicos del Dashboard TeleECG (v1.72.0)
 *
 * Proporciona métricas analíticas para gestión clínica:
 * - Clasificación por hallazgos (NORMAL/ANORMAL/SIN_EVALUAR)
 * - Tiempos de respuesta (TAT, SLA)
 * - Métricas de calidad (tasa de rechazo)
 * - Tendencias comparativas
 *
 * Usado por: Dashboard médico analítico en rol EXTERNO/MEDICO/COORDINADOR
 *
 * @author Styp Canto Rondón
 * @version 1.0.0
 * @since 2026-02-11
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TeleECGAnalyticsDTO {

    // ════════════════════════════════════════════════════════════════
    // CLASIFICACIÓN POR HALLAZGOS CLÍNICOS (PRIORIDAD 1)
    // ════════════════════════════════════════════════════════════════

    /**
     * Distribución de ECGs por tipo de evaluación
     * Clave: NORMAL, ANORMAL, SIN_EVALUAR
     * Valor: Cantidad de ECGs en esa categoría
     *
     * Ejemplo: {NORMAL: 120, ANORMAL: 45, SIN_EVALUAR: 8}
     */
    private Map<String, Long> distribucionEvaluacion;

    /**
     * Porcentaje de cada tipo de evaluación
     * Clave: NORMAL, ANORMAL, SIN_EVALUAR
     * Valor: Porcentaje (0-100)
     *
     * Ejemplo: {NORMAL: 69.4, ANORMAL: 26.0, SIN_EVALUAR: 4.6}
     */
    private Map<String, Double> porcentajeEvaluacion;

    // ════════════════════════════════════════════════════════════════
    // INDICADORES DE TIEMPO (TAT, SLA) (PRIORIDAD 2)
    // ════════════════════════════════════════════════════════════════

    /**
     * Tiempo promedio de respuesta (TAT) en minutos
     * Cálculo: AVG(fechaEvaluacion - fechaEnvio)
     *
     * Ejemplo: 18.5 minutos
     */
    private Double tatPromedioMinutos;

    /**
     * TAT promedio para casos urgentes (minutos)
     * Solo se incluyen ECGs donde esUrgente = true
     *
     * Ejemplo: 12.3 minutos
     */
    private Double tatPromedioUrgentes;

    /**
     * TAT promedio para casos no urgentes (minutos)
     * Solo se incluyen ECGs donde esUrgente = false
     *
     * Ejemplo: 22.1 minutos
     */
    private Double tatPromedioNoUrgentes;

    /**
     * Porcentaje de ECGs procesados dentro de la meta SLA
     * Meta: 15 minutos (configurable en servicio)
     *
     * Rango: 0-100
     * Ejemplo: 92.0% significa 92% de ECGs evaluados en ≤15 minutos
     */
    private Double slaCumplimientoPorcentaje;

    /**
     * TAT promedio por IPRESS
     * Clave: Nombre de IPRESS
     * Valor: TAT en minutos
     *
     * Ejemplo: {IPRESS CENTRAL: 15.2, IPRESS SUR: 22.3}
     */
    private Map<String, Double> tatPorIpress;

    // ════════════════════════════════════════════════════════════════
    // MÉTRICAS DE CALIDAD (PRIORIDAD 3)
    // ════════════════════════════════════════════════════════════════

    /**
     * Tasa de rechazo global (%)
     * Cálculo: (ECGs OBSERVADA / Total ECGs) * 100
     *
     * Ejemplo: 8.5% de los ECGs fueron rechazados
     */
    private Double tasaRechazoPorcentaje;

    /**
     * Detalles de rechazos por IPRESS
     * Incluye: nombre IPRESS, total ECGs, rechazados, porcentaje, motivos comunes
     *
     * Usado para: Identificar IPRESS con problemas de calidad
     */
    private Map<String, RechazoPorIpress> rechazosPorIpress;

    // ════════════════════════════════════════════════════════════════
    // TENDENCIAS Y COMPARACIONES (PRIORIDAD 4)
    // ════════════════════════════════════════════════════════════════

    /**
     * Volumen diario de ECGs (últimos 30 días)
     * Clave: Fecha (LocalDate)
     * Valor: Cantidad de ECGs en esa fecha
     *
     * Usado para: Gráfica de tendencia de carga
     */
    private Map<LocalDate, Long> volumenDiario;

    /**
     * TAT promedio diario (últimos 30 días)
     * Clave: Fecha (LocalDate)
     * Valor: TAT promedio en minutos para esa fecha
     *
     * Usado para: Gráfica de tendencia de tiempo de respuesta
     */
    private Map<LocalDate, Double> tatDiario;

    /**
     * Comparación de período actual vs período anterior
     * Incluye: volumen, TAT, rechazo
     *
     * Usado para: Indicadores ↑↓ de tendencia
     */
    private ComparacionPeriodos comparacion;

    // ════════════════════════════════════════════════════════════════
    // FILTROS APLICADOS (Para referencia frontend)
    // ════════════════════════════════════════════════════════════════

    /**
     * Fecha inicial del período analizado
     */
    private LocalDate fechaDesde;

    /**
     * Fecha final del período analizado
     */
    private LocalDate fechaHasta;

    /**
     * ID de IPRESS filtrada (si aplica)
     * NULL si no hay filtro de IPRESS
     */
    private Long idIpressFiltro;

    /**
     * Tipo de evaluación filtrada (si aplica)
     * Valores: NORMAL, ANORMAL, SIN_EVALUAR
     * NULL si no hay filtro
     */
    private String evaluacionFiltro;

    /**
     * Filtro de urgencia (si aplica)
     * TRUE: Solo urgentes
     * FALSE: Solo no urgentes
     * NULL: Ambos
     */
    private Boolean esUrgenteFiltro;

    // ════════════════════════════════════════════════════════════════
    // METADATA
    // ════════════════════════════════════════════════════════════════

    /**
     * Total de ECGs en el período (con filtros aplicados)
     */
    private Long totalEcgs;

    /**
     * Timestamp de cuando se calculó este analytics
     */
    private String calculadoEn;

    // ════════════════════════════════════════════════════════════════
    // NESTED DTO: Detalles de Rechazo por IPRESS
    // ════════════════════════════════════════════════════════════════

    /**
     * DTO anidado: Información de rechazos por IPRESS
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RechazoPorIpress {
        /**
         * Nombre de la IPRESS
         */
        private String nombreIpress;

        /**
         * Total de ECGs de esta IPRESS
         */
        private Long totalEcgs;

        /**
         * ECGs rechazados (estado = OBSERVADA)
         */
        private Long rechazados;

        /**
         * Porcentaje de rechazo
         */
        private Double porcentajeRechazo;

        /**
         * Top 3 motivos más comunes de rechazo/observaciones
         * Extraídos de campo "observaciones" de manera heurística
         */
        private List<String> motivosComunes;

        /**
         * Alerta de capacitación si tasa > 15%
         */
        private Boolean requiereCapacitacion;
    }

    // ════════════════════════════════════════════════════════════════
    // NESTED DTO: Comparación de Períodos
    // ════════════════════════════════════════════════════════════════

    /**
     * DTO anidado: Comparación entre período actual y anterior
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ComparacionPeriodos {
        /**
         * Total de ECGs en período actual
         */
        private Long totalActual;

        /**
         * Total de ECGs en período anterior (misma duración)
         */
        private Long totalAnterior;

        /**
         * Cambio en volumen (%)
         * Positivo = aumento, Negativo = disminución
         *
         * Ejemplo: +5.2% significa 5.2% más ECGs que período anterior
         */
        private Double cambioVolumenPorcentaje;

        /**
         * Cambio en TAT promedio (%)
         * Positivo = empeoramiento, Negativo = mejora
         *
         * Ejemplo: -3.1% significa TAT 3.1% más rápido
         */
        private Double cambioTatPorcentaje;

        /**
         * Cambio en tasa de rechazo (%)
         * Positivo = empeoramiento, Negativo = mejora
         *
         * Ejemplo: -1.2% significa 1.2% menos rechazos
         */
        private Double cambioRechazosPorcentaje;

        /**
         * Cambio en % de casos urgentes
         */
        private Double cambioUrgentesporcentaje;
    }
}
