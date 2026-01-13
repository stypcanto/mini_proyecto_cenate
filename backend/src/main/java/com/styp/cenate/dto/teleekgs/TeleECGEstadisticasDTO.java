package com.styp.cenate.dto.teleekgs;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * DTO para respuesta de estadísticas del módulo TeleEKG
 *
 * Contiene métricas agregadas para dashboards y reportes
 * Utilizado para:
 * - Dashboard principal (ADMIN)
 * - Reportes de performance
 * - Análisis de carga de trabajo
 *
 * @author Styp Canto Rondón
 * @version 1.0.0
 * @since 2026-01-13
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TeleECGEstadisticasDTO {

    /**
     * Fecha de los datos
     */
    @JsonProperty("fecha")
    private LocalDate fecha;

    // ============================================================
    // ESTADÍSTICAS GENERALES
    // ============================================================

    /**
     * Total de imágenes cargadas (acumulativo)
     */
    @JsonProperty("total_imagenes_cargadas")
    private Long totalImagenesCargadas;

    /**
     * Total de imágenes procesadas (aceptadas)
     */
    @JsonProperty("total_imagenes_procesadas")
    private Long totalImagenesProcesadas;

    /**
     * Total de imágenes rechazadas
     */
    @JsonProperty("total_imagenes_rechazadas")
    private Long totalImagenesRechazadas;

    /**
     * Total de imágenes vinculadas a usuarios
     */
    @JsonProperty("total_imagenes_vinculadas")
    private Long totalImagenesVinculadas;

    /**
     * Total de imágenes pendientes (sin procesar)
     */
    @JsonProperty("total_imagenes_pendientes")
    private Long totalImagenesPendientes;

    /**
     * Total de imágenes activas (no vencidas)
     */
    @JsonProperty("total_imagenes_activas")
    private Long totalImagenesActivas;

    // ============================================================
    // VOLUMEN DE DATOS
    // ============================================================

    /**
     * Tamaño total en GB
     */
    @JsonProperty("tamanio_total_gb")
    private Double tamanoTotalGb;

    /**
     * Tamaño promedio por imagen en MB
     */
    @JsonProperty("tamanio_promedio_mb")
    private Double tamanoPromedioMb;

    /**
     * Tamaño máximo registrado en MB
     */
    @JsonProperty("tamanio_maximo_mb")
    private Double tamanoMaximoMb;

    /**
     * Tamaño mínimo registrado en MB
     */
    @JsonProperty("tamanio_minimo_mb")
    private Double tamanoMinimoMb;

    // ============================================================
    // TASAS Y PROPORCIONES
    // ============================================================

    /**
     * Tasa de rechazo en porcentaje
     * Cálculo: (rechazadas / total) * 100
     */
    @JsonProperty("tasa_rechazo_porcentaje")
    private Double tasaRechazoPorcentaje;

    /**
     * Tasa de vinculación en porcentaje
     * Cálculo: (vinculadas / procesadas) * 100
     */
    @JsonProperty("tasa_vinculacion_porcentaje")
    private Double tasaVinculacionPorcentaje;

    /**
     * Tasa de procesamiento en porcentaje
     * Cálculo: (procesadas / cargadas) * 100
     */
    @JsonProperty("tasa_procesamiento_porcentaje")
    private Double tasaProcesamientoPorcentaje;

    /**
     * Porcentaje de pendientes
     */
    @JsonProperty("porcentaje_pendientes")
    private Double porcentajePendientes;

    // ============================================================
    // TIEMPOS DE PROCESAMIENTO
    // ============================================================

    /**
     * Tiempo promedio de procesamiento en minutos
     * Desde fecha_envio hasta fecha_recepcion
     */
    @JsonProperty("tiempo_promedio_procesamiento_minutos")
    private Double tiempoPromedioProcessamientoMinutos;

    /**
     * Tiempo máximo de procesamiento en minutos
     */
    @JsonProperty("tiempo_maximo_procesamiento_minutos")
    private Double tiempoMaximoProcessamientoMinutos;

    /**
     * Tiempo mínimo de procesamiento en minutos
     */
    @JsonProperty("tiempo_minimo_procesamiento_minutos")
    private Double tiempoMinimoProcessamientoMinutos;

    // ============================================================
    // INFORMACIÓN POR IPRESS
    // ============================================================

    /**
     * ID de la IPRESS
     */
    @JsonProperty("id_ipress")
    private Long idIpress;

    /**
     * Código de la IPRESS
     */
    @JsonProperty("codigo_ipress")
    private String codigoIpress;

    /**
     * Nombre de la IPRESS
     */
    @JsonProperty("nombre_ipress")
    private String nombreIpress;

    /**
     * Imágenes cargadas por esta IPRESS
     */
    @JsonProperty("imagenes_por_ipress")
    private Long imagenesPorIpress;

    /**
     * Tasa de rechazo específica de esta IPRESS
     */
    @JsonProperty("tasa_rechazo_ipress_porcentaje")
    private Double tasaRechazoIpressPorcentaje;

    /**
     * Volumen de datos de esta IPRESS en GB
     */
    @JsonProperty("tamanio_ipress_gb")
    private Double tamanoIpressGb;

    /**
     * Última carga de esta IPRESS
     */
    @JsonProperty("ultima_carga_ipress")
    private String ultimaCargaIpress;

    // ============================================================
    // ESTADÍSTICAS COMPLEMENTARIAS
    // ============================================================

    /**
     * Total de usuarios que han accedido a imágenes
     */
    @JsonProperty("total_usuarios_acceso")
    private Long totalUsuariosAcceso;

    /**
     * Total de acciones auditadas
     */
    @JsonProperty("total_acciones_auditadas")
    private Long totalAccionesAuditadas;

    /**
     * Total de imágenes próximas a vencer (< 3 días)
     */
    @JsonProperty("imagenes_proximas_vencer")
    private Long imagenesProximasVencer;

    /**
     * Espacio disponible en BD en GB (si se conoce)
     */
    @JsonProperty("espacio_disponible_gb")
    private Double espacioDisponibleGb;

    /**
     * Porcentaje de uso de almacenamiento
     */
    @JsonProperty("uso_almacenamiento_porcentaje")
    private Double usoAlmacenamientoPorcentaje;

    /**
     * Status de salud del módulo
     * Valores: SALUDABLE, ALERTA, CRITICA
     */
    @JsonProperty("status_salud")
    private String statusSalud;

    /**
     * Detalles del status
     */
    @JsonProperty("status_detalles")
    private String statusDetalles;

    /**
     * Determina el status de salud basado en métricas
     */
    public void determinarStatus() {
        // Reglas de salud
        if (usoAlmacenamientoPorcentaje != null && usoAlmacenamientoPorcentaje > 90) {
            statusSalud = "CRITICA";
            statusDetalles = "Almacenamiento casi lleno (> 90%)";
        } else if (tasaRechazoPorcentaje != null && tasaRechazoPorcentaje > 30) {
            statusSalud = "ALERTA";
            statusDetalles = "Tasa de rechazo muy alta (> 30%)";
        } else if (porcentajePendientes != null && porcentajePendientes > 50) {
            statusSalud = "ALERTA";
            statusDetalles = "Mucho trabajo pendiente (> 50%)";
        } else if (usoAlmacenamientoPorcentaje != null && usoAlmacenamientoPorcentaje > 75) {
            statusSalud = "ALERTA";
            statusDetalles = "Almacenamiento al 75%+";
        } else {
            statusSalud = "SALUDABLE";
            statusDetalles = "Sistema funcionando normalmente";
        }
    }

    /**
     * Obtiene color para el status (para UI)
     */
    public String getColorStatus() {
        return switch (statusSalud) {
            case "SALUDABLE" -> "green";
            case "ALERTA" -> "orange";
            case "CRITICA" -> "red";
            default -> "gray";
        };
    }
}
